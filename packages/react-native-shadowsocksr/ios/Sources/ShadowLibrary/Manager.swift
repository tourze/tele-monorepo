// 从宿主迁移（去除 ICSMainFramework 依赖），供库内与上层调用
import Foundation
import NetworkExtension
import MMWormhole
import Async
import Alamofire

@objc open class NodeModel: NSObject {
  @objc open var ip: String? = nil
  @objc open var port: NSNumber? = nil
  @objc open var passwd: String? = nil
  @objc open var method: String? = nil
  @objc open var pprotocol: String? = nil
  @objc open var protoparam: String? = nil
  @objc open var obfs: String? = nil
  @objc open var obfsparam: String? = nil
  @objc open var remarks: String? = nil
  @objc public convenience init(dic: [String: Any]) {
    self.init();
    self.ip = dic["ip"] as? String
    self.port = dic["port"] as? NSNumber
    self.passwd = dic["passwd"] as? String
    self.method = dic["method"] as? String
    self.pprotocol = dic["protocol"] as? String
    self.protoparam = dic["protocolParam"] as? String
    self.obfs = dic["obfs"] as? String
    self.obfsparam = dic["obfs_param"] as? String
    self.remarks = dic["remarks"] as? String
  }
}

public enum VPNStatus { case off, connecting, on, disconnecting, reasserting }
public enum ProxyModeType: String { case Global = "Global", ChinaOut = "China Out", ChinaIn = "China In" }

public let kSelectNode = "selectNode"
public let kProxyServiceVPNStatusNotification = "kProxyServiceVPNStatusNotification"

@objc open class Manager: NSObject {
  @objc public static let sharedManager = Manager()
  open fileprivate(set) var vpnStatus = VPNStatus.off {
    didSet { NotificationCenter.default.post(name: Foundation.Notification.Name(rawValue: kProxyServiceVPNStatusNotification), object: nil) }
  }
  public let wormhole = MMWormhole(applicationGroupIdentifier: Shadow.sharedGroupIdentifier(), optionalDirectory: "wormhole")
  var observerAdded: Bool = false
  open var isChangeProxy: Bool = false
  open var pingCheckDic: Dictionary<String, Any> = [:]
  open var selectNode: NodeModel?

  fileprivate override init() { super.init(); addVPNStatusObserver() }

  @objc func setSelectNode(_ node: NodeModel?) { self.selectNode = node }
  @objc func setChangeProxy(_ isChange: Bool) { self.isChangeProxy = isChange }

  func addVPNStatusObserver() {
    guard !observerAdded else { return }
    loadProviderManager { [unowned self] (manager) -> Void in
      if let m = manager { self.observerAdded = true; NotificationCenter.default.addObserver(forName: NSNotification.Name.NEVPNStatusDidChange, object: m.connection, queue: .main) { [unowned self] _ in self.updateVPNStatus(m) } }
    }
  }

  deinit { NotificationCenter.default.removeObserver(self) }

  func updateVPNStatus(_ manager: NEVPNManager) {
    switch manager.connection.status {
      case .connected: self.vpnStatus = .on
      case .connecting, .reasserting: self.vpnStatus = .connecting
      case .disconnecting: self.vpnStatus = .disconnecting
      case .disconnected, .invalid: self.vpnStatus = .off
      @unknown default: self.vpnStatus = .off
    }
  }

  @objc open func switchVPN(_ completion: ((NETunnelProviderManager?, Error?) -> Void)? = nil) {
    loadProviderManager { [unowned self] (manager) in
      if let m = manager { self.updateVPNStatus(m) }
      let current = self.vpnStatus
      guard current != .connecting && current != .disconnecting else { return }
      if current == .off { self.startVPN { completion?($0,$1) } } else { self.stopVPN(); completion?(nil,nil) }
    }
  }

  open func setup() {
    try? copyGEOIPData(); try? copyTemplateData();
    if Shadow.sharedUserDefaults().string(forKey: "ProxyModeType") == nil { Shadow.sharedUserDefaults().set(ProxyModeType.ChinaOut.rawValue, forKey: "ProxyModeType") }
    setupDefaultConf();
  }

  func setupDefaultConf(){
    if let defaultAclUrl = Bundle.main.url(forResource: "default", withExtension: "acl") {
      let fm = FileManager.default
      let groupDefaultAclUrl = Shadow.sharedDefaultAclUrl()
      if !fm.fileExists(atPath: groupDefaultAclUrl.path) {
        try? fm.copyItem(at: defaultAclUrl, to: groupDefaultAclUrl)
      }
    }
  }

  open func downloadDefaultConfAndUpdate(_ aclFileUrl: String) {
    let destination: DownloadRequest.DownloadFileDestination = { (_, _) in (Shadow.sharedDefaultAclUrl(), [.removePreviousFile,.createIntermediateDirectories]) }
    let urlRequest = URLRequest(url: URL(string:aclFileUrl)!)
    Alamofire.download(urlRequest, to: destination).response { _ in }
  }

  func copyGEOIPData() throws {
    guard let fromURL = Bundle.main.url(forResource: "GeoLite2-Country", withExtension: "mmdb") else { return }
    let toURL = Shadow.sharedUrl().appendingPathComponent("GeoLite2-Country.mmdb")
    if FileManager.default.fileExists(atPath: fromURL.path) {
      if FileManager.default.fileExists(atPath: toURL.path) { try FileManager.default.removeItem(at: toURL) }
      try FileManager.default.copyItem(at: fromURL, to: toURL)
    }
  }

  func copyTemplateData() throws { /* 模板资源暂略，可按需补充 */ }

  @objc open func setDefaultConfigGroup() { try? regenerateConfigFiles() }
  open func regenerateConfigFiles() throws { try generateShadowsocksConfig(); try generateHttpProxyConfig() }

  var upstreamNodeProxy: NodeModel? { return Manager.sharedManager.selectNode }

  func generateShadowsocksConfig() throws {
    let confURL = Shadow.sharedProxyConfUrl()
    var content = ""
    if let upstream = upstreamNodeProxy {
      let arr:[String:Any] = ["host": upstream.ip ?? "",
                              "port": upstream.port ?? 0,
                              "password": upstream.passwd ?? "",
                              "authscheme": upstream.method ?? "",
                              "ota": false,
                              "protocol": upstream.pprotocol ?? "",
                              "protocolParam": upstream.protoparam ?? "",
                              "obfs": upstream.obfs ?? "",
                              "obfs_param": upstream.obfsparam ?? ""]
      let data = try JSONSerialization.data(withJSONObject: arr, options: .prettyPrinted)
      content = String(data: data, encoding: .utf8) ?? ""
    }
    try content.write(to: confURL, atomically: true, encoding: .utf8)
  }

  func generateHttpProxyConfig() throws {
    let rootUrl = Shadow.sharedUrl(); let confDirUrl = rootUrl.appendingPathComponent("httpconf")
    if !FileManager.default.fileExists(atPath: confDirUrl.path) {
      try FileManager.default.createDirectory(at: confDirUrl, withIntermediateDirectories: true, attributes: nil)
    }
  }
}

// MARK: - NEVPN 辅助
extension Manager {
  func loadProviderManager(_ callback: @escaping (NETunnelProviderManager?) -> Void) {
    NETunnelProviderManager.loadAllFromPreferences { (managers, _) in callback(managers?.first) }
  }
  func startVPN(_ completion: @escaping (NETunnelProviderManager?, Error?) -> Void) {
    loadProviderManager { (m) in completion(m, nil) }
  }
  func stopVPN() { }
}

