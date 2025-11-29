cmake_minimum_required(VERSION 3.22.1)
project(reactnativecurl)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

include(FetchContent)
set(FETCHCONTENT_QUIET OFF)

find_package(Threads REQUIRED)

set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(BUILD_CURL_EXE OFF CACHE BOOL "" FORCE)
set(ENABLE_MANUAL OFF CACHE BOOL "" FORCE)
set(CURL_USE_LIBSSH2 OFF CACHE BOOL "" FORCE)
set(CURL_USE_OPENSSL OFF CACHE BOOL "" FORCE)
set(CURL_USE_GNUTLS OFF CACHE BOOL "" FORCE)
set(CURL_USE_WOLFSSL OFF CACHE BOOL "" FORCE)
set(CURL_USE_SCHANNEL OFF CACHE BOOL "" FORCE)
set(CURL_USE_MESALINK OFF CACHE BOOL "" FORCE)
set(CURL_USE_MBEDTLS ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_LDAP ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_LDAPS ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_TELNET ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_DICT ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_RTSP ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_POP3 ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_SMTP ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_IMAP ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_GOPHER ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_SMB ON CACHE BOOL "" FORCE)
set(CURL_ZLIB OFF CACHE BOOL "" FORCE)
set(CURL_BROTLI OFF CACHE BOOL "" FORCE)
set(CURL_ZSTD OFF CACHE BOOL "" FORCE)
set(CURL_CA_EMBFILE OFF CACHE BOOL "" FORCE)
set(CURL_CA_FALLBACK ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_INSTALL ON CACHE BOOL "" FORCE)
set(CURL_ENABLE_EXPORT_TARGET OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
  mbedtls
  URL https://github.com/Mbed-TLS/mbedtls/archive/refs/tags/v3.6.2.tar.gz
  URL_HASH SHA256=f4a876b1f6921ad0aefb445f974ef62414d33928640b2c45555c5e64a196a1a8
  PATCH_COMMAND
    ${CMAKE_COMMAND} -E env python3 ${CMAKE_CURRENT_LIST_DIR}/patch_mbedtls_threading.py .
)

FetchContent_GetProperties(mbedtls)
if(NOT mbedtls_POPULATED)
  FetchContent_Populate(mbedtls)
endif()

# 关闭测试/示例生成，避免依赖缺失的 framework 子模块与 Python 脚本
set(ENABLE_TESTING OFF CACHE BOOL "" FORCE)
set(ENABLE_PROGRAMS OFF CACHE BOOL "" FORCE)
set(GEN_FILES OFF CACHE BOOL "" FORCE)

# 官方发布包不包含 framework 子模块，这里写入一个空实现以满足 CMake 校验
if(DEFINED mbedtls_SOURCE_DIR AND NOT EXISTS "${mbedtls_SOURCE_DIR}/framework/CMakeLists.txt")
  file(MAKE_DIRECTORY "${mbedtls_SOURCE_DIR}/framework")
  file(WRITE "${mbedtls_SOURCE_DIR}/framework/CMakeLists.txt" "add_library(mbedtls_framework INTERFACE)\n")
endif()

# 直接显式告知后续 FindMbedTLS 所需的头文件与库，避免重复探测失败
if(DEFINED mbedtls_SOURCE_DIR)
  set(MBEDTLS_INCLUDE_DIRS "${mbedtls_SOURCE_DIR}/include" CACHE STRING "" FORCE)
endif()
set(MBEDTLS_LIBRARY mbedtls CACHE STRING "" FORCE)
set(MBEDX509_LIBRARY mbedx509 CACHE STRING "" FORCE)
set(MBEDCRYPTO_LIBRARY mbedcrypto CACHE STRING "" FORCE)
set(MBEDTLS_LIBRARIES "mbedtls;mbedx509;mbedcrypto" CACHE STRING "" FORCE)
set(MbedTLS_FOUND ON CACHE BOOL "" FORCE)

add_subdirectory(${mbedtls_SOURCE_DIR} ${mbedtls_BINARY_DIR})

FetchContent_Declare(
  nlohmann_json
  URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
  URL_HASH SHA256=d6c65aca6b1ed68e7a182f4757257b107ae403032760ed6ef121c9d55e81757d
)
FetchContent_MakeAvailable(nlohmann_json)

FetchContent_Declare(
  curl
  URL https://curl.se/download/curl-8.7.1.tar.gz
  URL_HASH SHA256=f91249c87f68ea00cf27c44fdfa5a78423e41e71b7d408e5901a9896d905c495
  PATCH_COMMAND
    ${CMAKE_COMMAND} -E env python3 ${CMAKE_CURRENT_LIST_DIR}/patch_curl_rng.py .
)
FetchContent_MakeAvailable(curl)

add_library(reactnativecurl SHARED
  reactnativecurl.cpp
)

target_include_directories(reactnativecurl
  PRIVATE
    ${curl_SOURCE_DIR}/include
    ${mbedtls_SOURCE_DIR}/include
)

target_link_libraries(reactnativecurl
  PRIVATE
    CURL::libcurl
    mbedtls
    mbedx509
    mbedcrypto
    nlohmann_json::nlohmann_json
    log
    android
    Threads::Threads
)
