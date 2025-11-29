#include <jni.h>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

#include <algorithm>
#include <atomic>
#include <cctype>
#include <cmath>
#include <cstdlib>
#include <memory>
#include <mutex>
#include <sstream>
#include <string>
#include <sys/stat.h>
#include <unordered_map>
#include <utility>
#include <vector>

namespace {

struct CurlTask {
  std::string requestId;
  std::atomic_bool cancelled{false};
};

struct ResponseCollector {
  std::string statusLine;
  std::vector<std::pair<std::string, std::string>> headers;
  std::vector<unsigned char> body;
};

std::mutex gTaskMutex;
std::unordered_map<std::string, std::shared_ptr<CurlTask>> gTasks;

const std::string kBase64Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

std::string trim(const std::string& input) {
  size_t start = 0;
  while (start < input.size() && std::isspace(static_cast<unsigned char>(input[start]))) {
    start += 1;
  }
  if (start == input.size()) {
    return "";
  }
  size_t end = input.size() - 1;
  while (end > start && std::isspace(static_cast<unsigned char>(input[end]))) {
    end -= 1;
  }
  return input.substr(start, end - start + 1);
}

int base64CharIndex(char c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= 'a' && c <= 'z') return c - 'a' + 26;
  if (c >= '0' && c <= '9') return c - '0' + 52;
  if (c == '+') return 62;
  if (c == '/') return 63;
  if (c == '=') return 64;
  return -1;
}

std::vector<unsigned char> decodeBase64(const std::string& input) {
  std::string sanitized;
  sanitized.reserve(input.size());
  for (char c : input) {
    if (std::isalnum(static_cast<unsigned char>(c)) || c == '+' || c == '/' || c == '=') {
      sanitized.push_back(c);
    }
  }
  if (sanitized.empty()) return {};
  if (sanitized.size() % 4 != 0) return {};

  size_t padding = 0;
  if (!sanitized.empty() && sanitized[sanitized.size() - 1] == '=') padding += 1;
  if (sanitized.size() > 1 && sanitized[sanitized.size() - 2] == '=') padding += 1;

  size_t outputLength = (sanitized.size() / 4) * 3 - padding;
  std::vector<unsigned char> output;
  output.reserve(outputLength);

  for (size_t i = 0; i < sanitized.size(); i += 4) {
    int sextetA = base64CharIndex(sanitized[i]);
    int sextetB = base64CharIndex(sanitized[i + 1]);
    int sextetC = base64CharIndex(sanitized[i + 2]);
    int sextetD = base64CharIndex(sanitized[i + 3]);
    if (sextetA < 0 || sextetB < 0 || sextetC < 0 || sextetD < 0) {
      return {};
    }
    uint32_t triple = (sextetA << 18) | (sextetB << 12) | ((sextetC & 63) << 6) | (sextetD & 63);
    output.push_back(static_cast<unsigned char>((triple >> 16) & 0xFF));
    if (sanitized[i + 2] != '=') {
      output.push_back(static_cast<unsigned char>((triple >> 8) & 0xFF));
    }
    if (sanitized[i + 3] != '=') {
      output.push_back(static_cast<unsigned char>(triple & 0xFF));
    }
  }
  if (output.size() > outputLength) {
    output.resize(outputLength);
  }
  return output;
}

std::string encodeBase64(const std::vector<unsigned char>& data) {
  if (data.empty()) return "";
  std::string output;
  output.reserve(((data.size() + 2) / 3) * 4);
  for (size_t i = 0; i < data.size(); i += 3) {
    uint32_t octetA = data[i];
    uint32_t octetB = (i + 1) < data.size() ? data[i + 1] : 0;
    uint32_t octetC = (i + 2) < data.size() ? data[i + 2] : 0;
    uint32_t triple = (octetA << 16) | (octetB << 8) | octetC;

    output.push_back(kBase64Table[(triple >> 18) & 0x3F]);
    output.push_back(kBase64Table[(triple >> 12) & 0x3F]);
    output.push_back((i + 1) < data.size() ? kBase64Table[(triple >> 6) & 0x3F] : '=');
    output.push_back((i + 2) < data.size() ? kBase64Table[triple & 0x3F] : '=');
  }
  return output;
}

std::string parseStatusText(const std::string& statusLine) {
  auto firstSpace = statusLine.find(' ');
  if (firstSpace == std::string::npos) return "";
  auto secondSpace = statusLine.find(' ', firstSpace + 1);
  if (secondSpace == std::string::npos) return "";
  return trim(statusLine.substr(secondSpace + 1));
}

size_t writeBodyCallback(char* ptr, size_t size, size_t nmemb, void* userdata) {
  size_t total = size * nmemb;
  if (userdata == nullptr || total == 0) {
    return total;
  }
  auto* collector = static_cast<ResponseCollector*>(userdata);
  collector->body.insert(collector->body.end(), ptr, ptr + total);
  return total;
}

size_t headerCallback(char* buffer, size_t size, size_t nitems, void* userdata) {
  size_t total = size * nitems;
  if (userdata == nullptr || total == 0) {
    return total;
  }
  auto* collector = static_cast<ResponseCollector*>(userdata);
  std::string line(buffer, buffer + total);
  if (line.size() >= 2 && line[line.size() - 1] == '\n') {
    line.erase(line.size() - 1);
    if (!line.empty() && line[line.size() - 1] == '\r') {
      line.erase(line.size() - 1);
    }
  }
  if (line.rfind("HTTP/", 0) == 0) {
    collector->statusLine = line;
    return total;
  }
  auto delimiter = line.find(':');
  if (delimiter == std::string::npos) {
    return total;
  }
  std::string name = trim(line.substr(0, delimiter));
  std::string value = trim(line.substr(delimiter + 1));
  if (!name.empty()) {
    collector->headers.emplace_back(name, value);
  }
  return total;
}

int progressCallback(void* clientp, curl_off_t, curl_off_t, curl_off_t, curl_off_t) {
  auto* task = static_cast<CurlTask*>(clientp);
  if (task == nullptr) return 0;
  if (task->cancelled.load()) {
    return 1;
  }
  return 0;
}

std::string makeErrorJson(const std::string& requestId, const std::string& code, const std::string& message) {
  nlohmann::json response = nlohmann::json::object();
  if (!requestId.empty()) {
    response["requestId"] = requestId;
  }
  response["ok"] = false;
  response["errorCode"] = code;
  response["errorMessage"] = message;
  response["headers"] = nlohmann::json::array();
  return response.dump();
}

std::string joinStrings(const std::vector<std::string>& items, const std::string& delimiter) {
  if (items.empty()) return "";
  std::ostringstream oss;
  for (size_t i = 0; i < items.size(); ++i) {
    oss << items[i];
    if (i + 1 < items.size()) {
      oss << delimiter;
    }
  }
  return oss.str();
}

class CurlGlobalGuard {
 public:
  CurlGlobalGuard() { curl_global_init(CURL_GLOBAL_DEFAULT); }
  ~CurlGlobalGuard() { curl_global_cleanup(); }
};

CurlGlobalGuard gCurlGlobalGuard;

std::string jstringToStdString(JNIEnv* env, jstring value) {
  if (value == nullptr) return "";
  const char* utfChars = env->GetStringUTFChars(value, nullptr);
  if (utfChars == nullptr) return "";
  std::string result(utfChars);
  env->ReleaseStringUTFChars(value, utfChars);
  return result;
}

template <typename T>
void setOpt(CURL* handle, CURLoption option, T value) {
  if (handle != nullptr) {
    curl_easy_setopt(handle, option, value);
  }
}

struct CurlUrlParts {
  std::string host;
  std::string scheme;
  unsigned int port{0};
};

CurlUrlParts extractUrlParts(const std::string& url) {
  CurlUrlParts parts;
  CURLU* handle = curl_url();
  if (!handle) return parts;
  if (curl_url_set(handle, CURLUPART_URL, url.c_str(), 0) != CURLUE_OK) {
    curl_url_cleanup(handle);
    return parts;
  }
  char* host = nullptr;
  if (curl_url_get(handle, CURLUPART_HOST, &host, 0) == CURLUE_OK && host != nullptr) {
    parts.host = host;
    curl_free(host);
  }
  char* scheme = nullptr;
  if (curl_url_get(handle, CURLUPART_SCHEME, &scheme, 0) == CURLUE_OK && scheme != nullptr) {
    parts.scheme = scheme;
    std::transform(parts.scheme.begin(), parts.scheme.end(), parts.scheme.begin(), [](unsigned char c) {
      return static_cast<char>(std::tolower(c));
    });
    curl_free(scheme);
  }
  char* portStr = nullptr;
  if (curl_url_get(handle, CURLUPART_PORT, &portStr, 0) == CURLUE_OK && portStr != nullptr) {
    parts.port = static_cast<unsigned int>(std::strtoul(portStr, nullptr, 10));
    curl_free(portStr);
  } else {
    if (parts.scheme == "https") {
      parts.port = 443;
    } else if (parts.scheme == "http") {
      parts.port = 80;
    }
  }
  curl_url_cleanup(handle);
  return parts;
}

}  // namespace

extern "C"
JNIEXPORT jstring JNICALL
Java_com_reactnativecurl_CurlNativeBridge_performRequest(JNIEnv* env, jobject /*thiz*/, jstring optionsJson) {
  std::string jsonInput = jstringToStdString(env, optionsJson);
  if (jsonInput.empty()) {
    std::string result = makeErrorJson("", "invalid_options", "Empty request payload");
    return env->NewStringUTF(result.c_str());
  }

  nlohmann::json request;
  try {
    request = nlohmann::json::parse(jsonInput);
  } catch (const std::exception& error) {
    std::string result = makeErrorJson("", "invalid_options", error.what());
    return env->NewStringUTF(result.c_str());
  }

  const std::string requestId = request.value("requestId", "");
  const std::string url = request.value("url", "");
  if (requestId.empty() || url.empty()) {
    std::string result = makeErrorJson(requestId, "invalid_options", "requestId/url required");
    return env->NewStringUTF(result.c_str());
  }

  auto task = std::make_shared<CurlTask>();
  task->requestId = requestId;
  {
    std::lock_guard<std::mutex> lock(gTaskMutex);
    gTasks[requestId] = task;
  }

  ResponseCollector collector;
  CURL* curlHandle = curl_easy_init();
  if (!curlHandle) {
    {
      std::lock_guard<std::mutex> lock(gTaskMutex);
      gTasks.erase(requestId);
    }
    std::string result = makeErrorJson(requestId, "init_failed", "curl_easy_init failed");
    return env->NewStringUTF(result.c_str());
  }

  std::vector<unsigned char> requestBody = decodeBase64(request.value("bodyBase64", ""));

  struct curl_slist* headerList = nullptr;
  if (request.contains("headers") && request["headers"].is_array()) {
    for (const auto& header : request["headers"]) {
      std::string name = header.value("name", "");
      std::string value = header.value("value", "");
      if (name.empty()) continue;
      std::string composed = name + ": " + value;
      headerList = curl_slist_append(headerList, composed.c_str());
    }
  }

  std::vector<std::string> dnsServers;
  if (request.contains("dnsServers") && request["dnsServers"].is_array()) {
    for (const auto& item : request["dnsServers"]) {
      if (item.is_string()) {
        dnsServers.emplace_back(item.get<std::string>());
      }
    }
  }

  std::vector<std::string> pinnedKeys;
  if (request.contains("pinnedPublicKeys") && request["pinnedPublicKeys"].is_array()) {
    for (const auto& item : request["pinnedPublicKeys"]) {
      if (item.is_string()) {
        pinnedKeys.emplace_back(item.get<std::string>());
      }
    }
  }

  const bool followRedirects = request.value("followRedirects", true);
  const bool allowInsecure = request.value("allowInsecure", false);
  const int timeoutMs = request.value("timeoutMs", 0);
  const int connectTimeoutMs = request.value("connectTimeoutMs", 0);
  const int maxRedirects = request.value("maxRedirects", 0);
  const std::string methodRaw = request.value("method", "");
  std::string method = methodRaw;
  std::transform(method.begin(), method.end(), method.begin(), [](unsigned char c) {
    return static_cast<char>(std::toupper(c));
  });
  if (method.empty() && !requestBody.empty()) {
    method = "POST";
  }
  const std::string acceptEncoding = request.value("acceptEncoding", "");
  const std::string httpVersion = request.value("httpVersion", "");
  const std::string caCertPem = request.value("caCertPem", "");
  const std::string ipOverride = request.value("ipOverride", "");

  CurlUrlParts parts = extractUrlParts(url);

  CURLcode setUrlRes = curl_easy_setopt(curlHandle, CURLOPT_URL, url.c_str());
  if (setUrlRes != CURLE_OK) {
    curl_easy_cleanup(curlHandle);
    curl_slist_free_all(headerList);
    {
      std::lock_guard<std::mutex> lock(gTaskMutex);
      gTasks.erase(requestId);
    }
    std::string result = makeErrorJson(requestId, "invalid_url", "Failed to set URL");
    return env->NewStringUTF(result.c_str());
  }

  setOpt(curlHandle, CURLOPT_HTTPHEADER, headerList);
  setOpt(curlHandle, CURLOPT_NOPROGRESS, 0L);
  setOpt(curlHandle, CURLOPT_XFERINFOFUNCTION, progressCallback);
  setOpt(curlHandle, CURLOPT_XFERINFODATA, task.get());
  setOpt(curlHandle, CURLOPT_WRITEFUNCTION, writeBodyCallback);
  setOpt(curlHandle, CURLOPT_WRITEDATA, &collector);
  setOpt(curlHandle, CURLOPT_HEADERFUNCTION, headerCallback);
  setOpt(curlHandle, CURLOPT_HEADERDATA, &collector);

  if (!acceptEncoding.empty()) {
    setOpt(curlHandle, CURLOPT_ACCEPT_ENCODING, acceptEncoding.c_str());
  }

  if (!allowInsecure && caCertPem.empty() && parts.scheme == "https") {
#ifdef __ANDROID__
    static const char* kAndroidSystemCaPath = "/system/etc/security/cacerts";
    struct stat caStat {};
    if (stat(kAndroidSystemCaPath, &caStat) == 0 && S_ISDIR(caStat.st_mode)) {
      setOpt(curlHandle, CURLOPT_CAPATH, kAndroidSystemCaPath);
    }
#endif
  }

  if (timeoutMs > 0) {
    setOpt(curlHandle, CURLOPT_TIMEOUT_MS, static_cast<long>(timeoutMs));
  }
  if (connectTimeoutMs > 0) {
    setOpt(curlHandle, CURLOPT_CONNECTTIMEOUT_MS, static_cast<long>(connectTimeoutMs));
  }
  if (maxRedirects > 0) {
    setOpt(curlHandle, CURLOPT_MAXREDIRS, static_cast<long>(maxRedirects));
  }
  setOpt(curlHandle, CURLOPT_FOLLOWLOCATION, followRedirects ? 1L : 0L);

  if (allowInsecure) {
    setOpt(curlHandle, CURLOPT_SSL_VERIFYPEER, 0L);
    setOpt(curlHandle, CURLOPT_SSL_VERIFYHOST, 0L);
  }

  if (!pinnedKeys.empty()) {
    const std::string joined = joinStrings(pinnedKeys, ";");
    setOpt(curlHandle, CURLOPT_PINNEDPUBLICKEY, joined.c_str());
  }

  if (!caCertPem.empty()) {
#if LIBCURL_VERSION_NUM >= 0x074200
    curl_blob blob{};
    blob.data = const_cast<char*>(caCertPem.c_str());
    blob.len = caCertPem.size();
    blob.flags = CURL_BLOB_NOCOPY;
    setOpt(curlHandle, CURLOPT_CAINFO_BLOB, &blob);
#endif
  }

  if (!dnsServers.empty()) {
    const std::string joined = joinStrings(dnsServers, ",");
    setOpt(curlHandle, CURLOPT_DNS_SERVERS, joined.c_str());
  }

  if (!httpVersion.empty()) {
    if (httpVersion == "http2" || httpVersion == "http2.0" || httpVersion == "http2_tls") {
      setOpt(curlHandle, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_2TLS);
    } else if (httpVersion == "http1.1" || httpVersion == "http1") {
      setOpt(curlHandle, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    }
  }

  if (!method.empty()) {
    if (method == "POST") {
      setOpt(curlHandle, CURLOPT_POST, 1L);
    } else if (method == "GET") {
      setOpt(curlHandle, CURLOPT_HTTPGET, 1L);
    } else {
      setOpt(curlHandle, CURLOPT_CUSTOMREQUEST, method.c_str());
    }
  }

  if (!requestBody.empty()) {
    setOpt(curlHandle, CURLOPT_POSTFIELDSIZE, static_cast<long>(requestBody.size()));
    setOpt(curlHandle, CURLOPT_POSTFIELDS, requestBody.data());
  } else if (method == "POST") {
    setOpt(curlHandle, CURLOPT_POSTFIELDSIZE, 0L);
  }

  struct curl_slist* resolveList = nullptr;
  if (!ipOverride.empty()) {
    if (!parts.host.empty() && parts.port > 0) {
      std::string entry = parts.host + ":" + std::to_string(parts.port) + ":" + ipOverride;
      resolveList = curl_slist_append(resolveList, entry.c_str());
      if (resolveList) {
        setOpt(curlHandle, CURLOPT_RESOLVE, resolveList);
      }
    }
  }

  char errorBuffer[CURL_ERROR_SIZE];
  errorBuffer[0] = '\0';
  setOpt(curlHandle, CURLOPT_ERRORBUFFER, errorBuffer);

  CURLcode resultCode = curl_easy_perform(curlHandle);

  nlohmann::json response = nlohmann::json::object();
  response["requestId"] = requestId;

  if (resultCode == CURLE_OK && !task->cancelled.load()) {
    response["ok"] = true;
    long statusCode = 0;
    curl_easy_getinfo(curlHandle, CURLINFO_RESPONSE_CODE, &statusCode);
    response["status"] = static_cast<int>(statusCode);
    response["statusText"] = parseStatusText(collector.statusLine);
    char* effectiveUrl = nullptr;
    if (curl_easy_getinfo(curlHandle, CURLINFO_EFFECTIVE_URL, &effectiveUrl) == CURLE_OK && effectiveUrl != nullptr) {
      response["responseUrl"] = std::string(effectiveUrl);
    }
    nlohmann::json headerArray = nlohmann::json::array();
    for (const auto& pair : collector.headers) {
      nlohmann::json item = nlohmann::json::object();
      item["name"] = pair.first;
      item["value"] = pair.second;
      headerArray.push_back(item);
    }
    response["headers"] = headerArray;
    if (!collector.body.empty()) {
      response["bodyBase64"] = encodeBase64(collector.body);
    } else {
      response["bodyBase64"] = "";
    }

    nlohmann::json timing = nlohmann::json::object();
    double value = 0.0;
    if (curl_easy_getinfo(curlHandle, CURLINFO_NAMELOOKUP_TIME, &value) == CURLE_OK) {
      timing["nameLookupMs"] = value * 1000.0;
    }
    if (curl_easy_getinfo(curlHandle, CURLINFO_CONNECT_TIME, &value) == CURLE_OK) {
      timing["connectMs"] = value * 1000.0;
    }
    if (curl_easy_getinfo(curlHandle, CURLINFO_APPCONNECT_TIME, &value) == CURLE_OK) {
      timing["appConnectMs"] = value * 1000.0;
    }
    if (curl_easy_getinfo(curlHandle, CURLINFO_PRETRANSFER_TIME, &value) == CURLE_OK) {
      timing["preTransferMs"] = value * 1000.0;
    }
    if (curl_easy_getinfo(curlHandle, CURLINFO_STARTTRANSFER_TIME, &value) == CURLE_OK) {
      timing["startTransferMs"] = value * 1000.0;
    }
    if (curl_easy_getinfo(curlHandle, CURLINFO_REDIRECT_TIME, &value) == CURLE_OK) {
      timing["redirectMs"] = value * 1000.0;
    }
    if (curl_easy_getinfo(curlHandle, CURLINFO_TOTAL_TIME, &value) == CURLE_OK) {
      timing["totalMs"] = value * 1000.0;
    }
    response["timing"] = timing;

  } else {
    response["ok"] = false;
    if (task->cancelled.load()) {
      response["errorCode"] = "cancelled";
      response["errorMessage"] = "Request cancelled";
    } else {
      response["errorCode"] = "curl_error";
      if (errorBuffer[0] != '\0') {
        response["errorMessage"] = std::string(errorBuffer);
      } else {
        response["errorMessage"] = std::string(curl_easy_strerror(resultCode));
      }
    }
    response["headers"] = nlohmann::json::array();
  }

  curl_easy_cleanup(curlHandle);
  curl_slist_free_all(headerList);
  curl_slist_free_all(resolveList);

  {
    std::lock_guard<std::mutex> lock(gTaskMutex);
    gTasks.erase(requestId);
  }

  std::string output = response.dump();
  return env->NewStringUTF(output.c_str());
}

extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativecurl_CurlNativeBridge_cancelRequest(JNIEnv* env, jobject /*thiz*/, jstring requestId) {
  std::string id = jstringToStdString(env, requestId);
  if (id.empty()) return;
  std::lock_guard<std::mutex> lock(gTaskMutex);
  auto it = gTasks.find(id);
  if (it != gTasks.end() && it->second) {
    it->second->cancelled.store(true);
  }
}
