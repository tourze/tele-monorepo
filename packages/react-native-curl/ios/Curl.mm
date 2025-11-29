#import "Curl.h"

#import <React/RCTConvert.h>
#import <React/RCTLog.h>

#include <curl/curl.h>

#include <algorithm>
#include <atomic>
#include <cstdlib>
#include <mutex>
#include <optional>
#include <sstream>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

using namespace std;

namespace curlbridge {

struct Header {
  std::string name;
  std::string value;
};

struct Timing {
  std::optional<double> nameLookupMs;
  std::optional<double> connectMs;
  std::optional<double> appConnectMs;
  std::optional<double> preTransferMs;
  std::optional<double> startTransferMs;
  std::optional<double> redirectMs;
  std::optional<double> totalMs;
};

struct Request {
  std::string requestId;
  std::string url;
  std::string method;
  std::vector<Header> headers;
  std::vector<unsigned char> body;
  bool hasBody{false};
  bool followRedirects{true};
  bool allowInsecure{false};
  std::vector<std::string> pinnedPublicKeys;
  std::string caCertPem;
  std::string ipOverride;
  std::vector<std::string> dnsServers;
  std::string httpVersion;
  std::string acceptEncoding;
  long timeoutMs{0};
  long connectTimeoutMs{0};
  long maxRedirects{0};
};

struct Response {
  std::string requestId;
  bool ok{false};
  bool cancelled{false};
  std::optional<long> status;
  std::string statusText;
  std::string responseUrl;
  std::vector<Header> headers;
  std::vector<unsigned char> body;
  std::string errorCode;
  std::string errorMessage;
  Timing timing;
};

struct Task {
  std::atomic_bool cancelled{false};
};

static const std::string kBase64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
std::mutex gTaskMutex;
std::unordered_map<std::string, std::shared_ptr<Task>> gTasks;

class CurlGlobalGuard {
 public:
  CurlGlobalGuard() { curl_global_init(CURL_GLOBAL_DEFAULT); }
  ~CurlGlobalGuard() { curl_global_cleanup(); }
};

CurlGlobalGuard gGuard;

static inline int base64Index(char c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= 'a' && c <= 'z') return c - 'a' + 26;
  if (c >= '0' && c <= '9') return c - '0' + 52;
  if (c == '+') return 62;
  if (c == '/') return 63;
  if (c == '=') return 64;
  return -1;
}

static std::vector<unsigned char> decodeBase64(const std::string& input) {
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
    int sextetA = base64Index(sanitized[i]);
    int sextetB = base64Index(sanitized[i + 1]);
    int sextetC = base64Index(sanitized[i + 2]);
    int sextetD = base64Index(sanitized[i + 3]);
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

static std::string encodeBase64(const std::vector<unsigned char>& data) {
  if (data.empty()) return "";
  std::string output;
  output.reserve(((data.size() + 2) / 3) * 4);
  for (size_t i = 0; i < data.size(); i += 3) {
    uint32_t octetA = data[i];
    uint32_t octetB = (i + 1) < data.size() ? data[i + 1] : 0;
    uint32_t octetC = (i + 2) < data.size() ? data[i + 2] : 0;
    uint32_t triple = (octetA << 16) | (octetB << 8) | octetC;

    output.push_back(kBase64Chars[(triple >> 18) & 0x3F]);
    output.push_back(kBase64Chars[(triple >> 12) & 0x3F]);
    output.push_back((i + 1) < data.size() ? kBase64Chars[(triple >> 6) & 0x3F] : '=');
    output.push_back((i + 2) < data.size() ? kBase64Chars[triple & 0x3F] : '=');
  }
  return output;
}

static inline std::string trim(const std::string& text) {
  size_t start = 0;
  while (start < text.size() && std::isspace(static_cast<unsigned char>(text[start]))) start += 1;
  if (start >= text.size()) return "";
  size_t end = text.size() - 1;
  while (end > start && std::isspace(static_cast<unsigned char>(text[end]))) end -= 1;
  return text.substr(start, end - start + 1);
}

static inline std::string parseStatusText(const std::string& statusLine) {
  auto firstSpace = statusLine.find(' ');
  if (firstSpace == std::string::npos) return "";
  auto secondSpace = statusLine.find(' ', firstSpace + 1);
  if (secondSpace == std::string::npos) return "";
  return trim(statusLine.substr(secondSpace + 1));
}

struct ResponseCollector {
  std::string statusLine;
  std::vector<Header> headers;
  std::vector<unsigned char> body;
};

static size_t writeBodyCallback(char* ptr, size_t size, size_t nmemb, void* userdata) {
  size_t total = size * nmemb;
  if (userdata == nullptr || total == 0) return total;
  auto* collector = static_cast<ResponseCollector*>(userdata);
  collector->body.insert(collector->body.end(), ptr, ptr + total);
  return total;
}

static size_t headerCallback(char* buffer, size_t size, size_t nitems, void* userdata) {
  size_t total = size * nitems;
  if (userdata == nullptr || total == 0) return total;
  auto* collector = static_cast<ResponseCollector*>(userdata);
  std::string line(buffer, buffer + total);
  if (line.size() >= 2 && line[line.size() - 1] == '\n') {
    line.pop_back();
    if (!line.empty() && line.back() == '\r') {
      line.pop_back();
    }
  }
  if (line.rfind("HTTP/", 0) == 0) {
    collector->statusLine = line;
    return total;
  }
  auto pos = line.find(':');
  if (pos == std::string::npos) return total;
  std::string name = trim(line.substr(0, pos));
  std::string value = trim(line.substr(pos + 1));
  if (!name.empty()) {
    collector->headers.push_back({name, value});
  }
  return total;
}

static int progressCallback(void* clientp, curl_off_t, curl_off_t, curl_off_t, curl_off_t) {
  auto* task = static_cast<Task*>(clientp);
  if (task == nullptr) return 0;
  if (task->cancelled.load()) {
    return 1;
  }
  return 0;
}

struct UrlParts {
  std::string host;
  std::string scheme;
  unsigned int port{0};
};

static UrlParts extractUrlParts(const std::string& url) {
  UrlParts parts;
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

static std::string joinStrings(const std::vector<std::string>& items, const std::string& delimiter) {
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

static Response performRequest(const Request& request) {
  Response response;
  response.requestId = request.requestId;

  auto task = std::make_shared<Task>();
  {
    std::lock_guard<std::mutex> lock(gTaskMutex);
    gTasks[request.requestId] = task;
  }

  CURL* handle = curl_easy_init();
  if (!handle) {
    response.ok = false;
    response.errorCode = "init_failed";
    response.errorMessage = "curl_easy_init failed";
    std::lock_guard<std::mutex> lock(gTaskMutex);
    gTasks.erase(request.requestId);
    return response;
  }

  ResponseCollector collector;
  struct curl_slist* headerList = nullptr;
  for (const auto& header : request.headers) {
    if (header.name.empty()) continue;
    std::string combined = header.name + ": " + header.value;
    headerList = curl_slist_append(headerList, combined.c_str());
  }

  std::vector<std::string> dnsServers = request.dnsServers;
  std::vector<std::string> pinnedKeys = request.pinnedPublicKeys;

  curl_easy_setopt(handle, CURLOPT_URL, request.url.c_str());
  curl_easy_setopt(handle, CURLOPT_HTTPHEADER, headerList);
  curl_easy_setopt(handle, CURLOPT_NOPROGRESS, 0L);
  curl_easy_setopt(handle, CURLOPT_XFERINFOFUNCTION, progressCallback);
  curl_easy_setopt(handle, CURLOPT_XFERINFODATA, task.get());
  curl_easy_setopt(handle, CURLOPT_WRITEFUNCTION, writeBodyCallback);
  curl_easy_setopt(handle, CURLOPT_WRITEDATA, &collector);
  curl_easy_setopt(handle, CURLOPT_HEADERFUNCTION, headerCallback);
  curl_easy_setopt(handle, CURLOPT_HEADERDATA, &collector);

  if (!request.acceptEncoding.empty()) {
    curl_easy_setopt(handle, CURLOPT_ACCEPT_ENCODING, request.acceptEncoding.c_str());
  }

  if (request.timeoutMs > 0) {
    curl_easy_setopt(handle, CURLOPT_TIMEOUT_MS, request.timeoutMs);
  }
  if (request.connectTimeoutMs > 0) {
    curl_easy_setopt(handle, CURLOPT_CONNECTTIMEOUT_MS, request.connectTimeoutMs);
  }
  if (request.maxRedirects > 0) {
    curl_easy_setopt(handle, CURLOPT_MAXREDIRS, request.maxRedirects);
  }
  curl_easy_setopt(handle, CURLOPT_FOLLOWLOCATION, request.followRedirects ? 1L : 0L);

  if (request.allowInsecure) {
    curl_easy_setopt(handle, CURLOPT_SSL_VERIFYPEER, 0L);
    curl_easy_setopt(handle, CURLOPT_SSL_VERIFYHOST, 0L);
  }

  if (!pinnedKeys.empty()) {
    const std::string joined = joinStrings(pinnedKeys, ";");
    curl_easy_setopt(handle, CURLOPT_PINNEDPUBLICKEY, joined.c_str());
  }

  if (!request.caCertPem.empty()) {
#if LIBCURL_VERSION_NUM >= 0x074200
    curl_blob blob{};
    blob.data = const_cast<char*>(request.caCertPem.c_str());
    blob.len = request.caCertPem.size();
    blob.flags = CURL_BLOB_NOCOPY;
    curl_easy_setopt(handle, CURLOPT_CAINFO_BLOB, &blob);
#endif
  }

  if (!dnsServers.empty()) {
    const std::string joined = joinStrings(dnsServers, ",");
    curl_easy_setopt(handle, CURLOPT_DNS_SERVERS, joined.c_str());
  }

  if (!request.httpVersion.empty()) {
    if (request.httpVersion == "http2" || request.httpVersion == "http2.0" || request.httpVersion == "http2_tls") {
      curl_easy_setopt(handle, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_2TLS);
    } else if (request.httpVersion == "http1.1" || request.httpVersion == "http1") {
      curl_easy_setopt(handle, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    }
  }

  if (request.method == "POST") {
    curl_easy_setopt(handle, CURLOPT_POST, 1L);
  } else if (request.method == "GET" || request.method.empty()) {
    curl_easy_setopt(handle, CURLOPT_HTTPGET, 1L);
  } else {
    curl_easy_setopt(handle, CURLOPT_CUSTOMREQUEST, request.method.c_str());
  }

  if (request.hasBody && !request.body.empty()) {
    curl_easy_setopt(handle, CURLOPT_POSTFIELDSIZE, static_cast<long>(request.body.size()));
    curl_easy_setopt(handle, CURLOPT_POSTFIELDS, request.body.data());
  } else if (request.method == "POST") {
    curl_easy_setopt(handle, CURLOPT_POSTFIELDSIZE, 0L);
  }

  struct curl_slist* resolveList = nullptr;
  if (!request.ipOverride.empty()) {
    UrlParts parts = extractUrlParts(request.url);
    if (!parts.host.empty() && parts.port > 0) {
      std::string entry = parts.host + ":" + std::to_string(parts.port) + ":" + request.ipOverride;
      resolveList = curl_slist_append(resolveList, entry.c_str());
      if (resolveList) {
        curl_easy_setopt(handle, CURLOPT_RESOLVE, resolveList);
      }
    }
  }

  char errorBuffer[CURL_ERROR_SIZE];
  errorBuffer[0] = '\0';
  curl_easy_setopt(handle, CURLOPT_ERRORBUFFER, errorBuffer);

  CURLcode result = curl_easy_perform(handle);

  if (result == CURLE_OK && !task->cancelled.load()) {
    response.ok = true;
    long statusCode = 0;
    curl_easy_getinfo(handle, CURLINFO_RESPONSE_CODE, &statusCode);
    response.status = statusCode;
    response.statusText = parseStatusText(collector.statusLine);
    char* effectiveUrl = nullptr;
    if (curl_easy_getinfo(handle, CURLINFO_EFFECTIVE_URL, &effectiveUrl) == CURLE_OK && effectiveUrl != nullptr) {
      response.responseUrl = effectiveUrl;
    }
    response.headers = collector.headers;
    response.body = collector.body;

    double value = 0.0;
    if (curl_easy_getinfo(handle, CURLINFO_NAMELOOKUP_TIME, &value) == CURLE_OK) {
      response.timing.nameLookupMs = value * 1000.0;
    }
    if (curl_easy_getinfo(handle, CURLINFO_CONNECT_TIME, &value) == CURLE_OK) {
      response.timing.connectMs = value * 1000.0;
    }
    if (curl_easy_getinfo(handle, CURLINFO_APPCONNECT_TIME, &value) == CURLE_OK) {
      response.timing.appConnectMs = value * 1000.0;
    }
    if (curl_easy_getinfo(handle, CURLINFO_PRETRANSFER_TIME, &value) == CURLE_OK) {
      response.timing.preTransferMs = value * 1000.0;
    }
    if (curl_easy_getinfo(handle, CURLINFO_STARTTRANSFER_TIME, &value) == CURLE_OK) {
      response.timing.startTransferMs = value * 1000.0;
    }
    if (curl_easy_getinfo(handle, CURLINFO_REDIRECT_TIME, &value) == CURLE_OK) {
      response.timing.redirectMs = value * 1000.0;
    }
    if (curl_easy_getinfo(handle, CURLINFO_TOTAL_TIME, &value) == CURLE_OK) {
      response.timing.totalMs = value * 1000.0;
    }

  } else {
    response.ok = false;
    response.cancelled = task->cancelled.load();
    if (response.cancelled) {
      response.errorCode = "cancelled";
      response.errorMessage = "Request cancelled";
    } else {
      response.errorCode = "curl_error";
      if (errorBuffer[0] != '\0') {
        response.errorMessage = errorBuffer;
      } else {
        response.errorMessage = curl_easy_strerror(result);
      }
    }
  }

  curl_easy_cleanup(handle);
  curl_slist_free_all(headerList);
  curl_slist_free_all(resolveList);

  {
    std::lock_guard<std::mutex> lock(gTaskMutex);
    gTasks.erase(request.requestId);
  }

  return response;
}

static void cancelRequest(const std::string& requestId) {
  std::lock_guard<std::mutex> lock(gTaskMutex);
  auto it = gTasks.find(requestId);
  if (it != gTasks.end() && it->second) {
    it->second->cancelled.store(true);
  }
}

}  // namespace curlbridge

static inline NSString* NSStringFromStdString(const std::string& value) {
  if (value.empty()) return nil;
  return [[NSString alloc] initWithUTF8String:value.c_str()];
}

static inline NSNumber* NSNumberFromOptionalLong(const std::optional<long>& value) {
  if (!value.has_value()) return nil;
  return @(value.value());
}

static inline NSNumber* NSNumberFromOptionalDouble(const std::optional<double>& value) {
  if (!value.has_value()) return nil;
  return @(value.value());
}

static curlbridge::Request RequestFromDictionary(NSDictionary* options) {
  curlbridge::Request request;
  NSString* requestId = [RCTConvert NSString:options[@"requestId"]];
  NSString* url = [RCTConvert NSString:options[@"url"]];
  NSString* method = [RCTConvert NSString:options[@"method"]];
  NSString* bodyBase64 = [RCTConvert NSString:options[@"bodyBase64"]];
  NSArray* headers = [RCTConvert NSArray:options[@"headers"]];
  NSArray* pinned = [RCTConvert NSArray:options[@"pinnedPublicKeys"]];
  NSArray* dns = [RCTConvert NSArray:options[@"dnsServers"]];

  request.requestId = requestId ? requestId.UTF8String : "";
  request.url = url ? url.UTF8String : "";
  if (method) {
    std::string methodStr = method.UTF8String;
    std::transform(methodStr.begin(), methodStr.end(), methodStr.begin(), [](unsigned char c) {
      return static_cast<char>(std::toupper(c));
    });
    request.method = methodStr;
  }

  if (request.method.empty() && bodyBase64 != nil && bodyBase64.length > 0) {
    request.method = "POST";
  }

  if ([headers isKindOfClass:[NSArray class]]) {
    for (NSDictionary* item in headers) {
      if (![item isKindOfClass:[NSDictionary class]]) continue;
      NSString* name = [RCTConvert NSString:item[@"name"]];
      NSString* value = [RCTConvert NSString:item[@"value"]];
      if (name.length == 0) continue;
      request.headers.push_back({name.UTF8String, value ? value.UTF8String : ""});
    }
  }

  if (bodyBase64 != nil && bodyBase64.length > 0) {
    request.body = curlbridge::decodeBase64(bodyBase64.UTF8String);
    request.hasBody = !request.body.empty();
  }

  NSNumber* timeout = [RCTConvert NSNumber:options[@"timeoutMs"]];
  NSNumber* connectTimeout = [RCTConvert NSNumber:options[@"connectTimeoutMs"]];
  NSNumber* maxRedirects = [RCTConvert NSNumber:options[@"maxRedirects"]];
  NSNumber* followRedirects = [RCTConvert NSNumber:options[@"followRedirects"]];
  NSNumber* allowInsecure = [RCTConvert NSNumber:options[@"allowInsecure"]];

  request.timeoutMs = timeout != nil ? timeout.longValue : 0;
  request.connectTimeoutMs = connectTimeout != nil ? connectTimeout.longValue : 0;
  request.maxRedirects = maxRedirects != nil ? maxRedirects.longValue : 0;
  request.followRedirects = followRedirects != nil ? followRedirects.boolValue : true;
  request.allowInsecure = allowInsecure != nil ? allowInsecure.boolValue : false;

  NSString* ca = [RCTConvert NSString:options[@"caCertPem"]];
  NSString* ip = [RCTConvert NSString:options[@"ipOverride"]];
  NSString* httpVersion = [RCTConvert NSString:options[@"httpVersion"]];
  NSString* acceptEncoding = [RCTConvert NSString:options[@"acceptEncoding"]];

  request.caCertPem = ca ? ca.UTF8String : "";
  request.ipOverride = ip ? ip.UTF8String : "";
  request.httpVersion = httpVersion ? httpVersion.UTF8String : "";
  request.acceptEncoding = acceptEncoding ? acceptEncoding.UTF8String : "";

  if ([pinned isKindOfClass:[NSArray class]]) {
    for (id entry in pinned) {
      NSString* str = [RCTConvert NSString:entry];
      if (str.length > 0) {
        request.pinnedPublicKeys.emplace_back(str.UTF8String);
      }
    }
  }

  if ([dns isKindOfClass:[NSArray class]]) {
    for (id entry in dns) {
      NSString* str = [RCTConvert NSString:entry];
      if (str.length > 0) {
        request.dnsServers.emplace_back(str.UTF8String);
      }
    }
  }

  return request;
}

static NSDictionary* DictionaryFromResponse(const curlbridge::Response& response) {
  NSMutableDictionary* map = [NSMutableDictionary dictionary];
  NSString* requestId = NSStringFromStdString(response.requestId);
  if (requestId) {
    map[@"requestId"] = requestId;
  }
  map[@"ok"] = @(response.ok);

  NSNumber* statusNumber = NSNumberFromOptionalLong(response.status);
  map[@"status"] = statusNumber ?: (id)kCFNull;

  NSString* statusText = NSStringFromStdString(response.statusText);
  map[@"statusText"] = statusText ?: (id)kCFNull;

  NSString* responseUrl = NSStringFromStdString(response.responseUrl);
  map[@"responseUrl"] = responseUrl ?: (id)kCFNull;

  NSMutableArray* headerArray = [NSMutableArray arrayWithCapacity:response.headers.size()];
  for (const auto& header : response.headers) {
    NSMutableDictionary* headerMap = [NSMutableDictionary dictionaryWithCapacity:2];
    NSString* name = NSStringFromStdString(header.name);
    NSString* value = NSStringFromStdString(header.value);
    headerMap[@"name"] = name ?: @"";
    headerMap[@"value"] = value ?: @"";
    [headerArray addObject:headerMap];
  }
  map[@"headers"] = headerArray;

  if (!response.body.empty()) {
    map[@"bodyBase64"] = NSStringFromStdString(curlbridge::encodeBase64(response.body));
  } else {
    map[@"bodyBase64"] = @"";
  }

  if (!response.ok) {
    map[@"errorCode"] = response.errorCode.empty() ? (id)kCFNull : NSStringFromStdString(response.errorCode);
    map[@"errorMessage"] = response.errorMessage.empty() ? (id)kCFNull : NSStringFromStdString(response.errorMessage);
  } else {
    map[@"errorCode"] = (id)kCFNull;
    map[@"errorMessage"] = (id)kCFNull;
  }

  NSMutableDictionary* timingMap = [NSMutableDictionary dictionary];
  NSNumber* nameLookup = NSNumberFromOptionalDouble(response.timing.nameLookupMs);
  if (nameLookup) timingMap[@"nameLookupMs"] = nameLookup;
  NSNumber* connect = NSNumberFromOptionalDouble(response.timing.connectMs);
  if (connect) timingMap[@"connectMs"] = connect;
  NSNumber* appConnect = NSNumberFromOptionalDouble(response.timing.appConnectMs);
  if (appConnect) timingMap[@"appConnectMs"] = appConnect;
  NSNumber* preTransfer = NSNumberFromOptionalDouble(response.timing.preTransferMs);
  if (preTransfer) timingMap[@"preTransferMs"] = preTransfer;
  NSNumber* startTransfer = NSNumberFromOptionalDouble(response.timing.startTransferMs);
  if (startTransfer) timingMap[@"startTransferMs"] = startTransfer;
  NSNumber* redirect = NSNumberFromOptionalDouble(response.timing.redirectMs);
  if (redirect) timingMap[@"redirectMs"] = redirect;
  NSNumber* total = NSNumberFromOptionalDouble(response.timing.totalMs);
  if (total) timingMap[@"totalMs"] = total;

  if (timingMap.count > 0) {
    map[@"timing"] = timingMap;
  } else {
    map[@"timing"] = (id)kCFNull;
  }

  return map;
}

@interface Curl () {
  dispatch_queue_t _workerQueue;
}
@end

@implementation Curl

RCT_EXPORT_MODULE(Curl);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  if (self = [super init]) {
    _workerQueue = dispatch_queue_create("com.vibeshell.curl.worker", DISPATCH_QUEUE_CONCURRENT);
  }
  return self;
}

RCT_REMAP_METHOD(performRequest,
                 performRequestWithOptions:(NSDictionary *)options
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (![options isKindOfClass:[NSDictionary class]]) {
    resolve(@{
      @"ok": @NO,
      @"errorCode": @"invalid_argument",
      @"errorMessage": @"Options must be a dictionary",
      @"headers": @[]
    });
    return;
  }

  NSString* requestId = [RCTConvert NSString:options[@"requestId"]];
  NSString* url = [RCTConvert NSString:options[@"url"]];
  if (requestId.length == 0 || url.length == 0) {
    resolve(@{
      @"requestId": requestId ?: @"",
      @"ok": @NO,
      @"errorCode": @"invalid_argument",
      @"errorMessage": @"requestId/url required",
      @"headers": @[]
    });
    return;
  }

  curlbridge::Request request = RequestFromDictionary(options);
  dispatch_async(_workerQueue, ^{
    curlbridge::Response response = curlbridge::performRequest(request);
    NSDictionary* payload = DictionaryFromResponse(response);
    resolve(payload);
  });
}

RCT_REMAP_METHOD(cancelRequest,
                 cancelRequestWithId:(NSString *)requestId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (requestId.length > 0) {
    curlbridge::cancelRequest(requestId.UTF8String);
  }
  resolve(nil);
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
  // Required for compatibility with RN event emitter, no-op
}

RCT_EXPORT_METHOD(removeListeners:(double)count) {
  // Required for compatibility with RN event emitter, no-op
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
  (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeCurlSpecJSI>(params);
}
#endif

@end
