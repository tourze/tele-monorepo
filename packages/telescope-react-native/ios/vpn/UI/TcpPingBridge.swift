// 原生 TCP Ping（供纯原生页面复用），不依赖 RN 桥
import Foundation
import Darwin

@objc class TcpPingBridge: NSObject {
  // 进行 TCP Ping，返回平均时延（毫秒）；失败返回 nil
  @objc static func start(_ host: String, port: UInt, count: Int = 3, completion: @escaping (Int?) -> Void) {
    let times = max(1, count)
    DispatchQueue.global(qos: .utility).async {
      var success = 0
      var sum: Int = 0
      var minVal = Int.max
      var maxVal = 0
      for _ in 0..<times {
        let t = tcpOnce(host: host, port: UInt16(port), timeoutMs: 3000)
        if t >= 0 {
          success += 1
          sum += t
          if t < minVal { minVal = t }
          if t > maxVal { maxVal = t }
        }
        if t > 0 && t < 100 { usleep(useconds_t((100 - t) * 1000)) }
      }
      if success == 0 {
        DispatchQueue.main.async { completion(nil) }
        return
      }
      let avg = sum / success
      DispatchQueue.main.async { completion(avg) }
    }
  }

  // 单次 TCP 连接，返回耗时（毫秒）；失败返回 -1
  private static func tcpOnce(host: String, port: UInt16, timeoutMs: Int) -> Int {
    let startMs = Int(Date().timeIntervalSince1970 * 1000)
    var hints = addrinfo(
      ai_flags: 0,
      ai_family: AF_UNSPEC,
      ai_socktype: SOCK_STREAM,
      ai_protocol: 0,
      ai_addrlen: 0,
      ai_canonname: nil,
      ai_addr: nil,
      ai_next: nil
    )
    var resPtr: UnsafeMutablePointer<addrinfo>? = nil
    let err = getaddrinfo(host, String(port), &hints, &resPtr)
    if err != 0 || resPtr == nil { return -1 }
    defer { freeaddrinfo(resPtr) }

    var current = resPtr
    while current != nil {
      let ai = current!.pointee
      let sock = socket(ai.ai_family, ai.ai_socktype, ai.ai_protocol)
      if sock < 0 { current = ai.ai_next; continue }
      defer { close(sock) }

      let flags = fcntl(sock, F_GETFL, 0)
      _ = fcntl(sock, F_SETFL, flags | O_NONBLOCK)

      var connected = false
      let rc = connect(sock, ai.ai_addr, ai.ai_addrlen)
      if rc == 0 {
        connected = true
      } else if errno == EINPROGRESS {
        var wfds = fd_set()
        FD_ZERO(&wfds)
        FD_SET(sock, &wfds)
        var tv = timeval(tv_sec: timeoutMs/1000, tv_usec: (timeoutMs%1000)*1000)
        let sel = select(sock + 1, nil, &wfds, nil, &tv)
        if sel > 0 {
          var errVal: Int32 = 0
          var len = socklen_t(MemoryLayout<Int32>.size)
          if getsockopt(sock, SOL_SOCKET, SO_ERROR, &errVal, &len) == 0 && errVal == 0 {
            connected = true
          }
        }
      }

      if connected {
        let endMs = Int(Date().timeIntervalSince1970 * 1000)
        return max(0, endMs - startMs)
      } else {
        current = ai.ai_next
      }
    }
    return -1
  }
}
