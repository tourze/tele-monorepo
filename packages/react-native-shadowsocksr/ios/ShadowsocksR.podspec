Pod::Spec.new do |s|
  s.name         = 'ShadowsocksR'
  s.version      = '0.1.0'
  s.summary      = 'React Native SSR/VPN 模块（占位骨架）'
  s.description  = <<-DESC
    iOS 侧桥接：提供与 Android 一致的 SSR/VPN 能力入口，
    包含 TTManager（RN Bridge）、ShadowLibrary/Manager 与 PacketTunnel/ProxyManager 等核心文件。
  DESC
  s.homepage     = 'https://example.com/'
  s.license      = { :type => 'UNLICENSED' }
  s.author       = { 'example' => 'dev@example.com' }
  s.source       = { :path => '.' }
  # 默认仅暴露 RN Bridge（核心逻辑由宿主沿用，避免与现有工程重复编译）
  s.source_files = 'Sources/SSRManager.{h,m}'
  s.platforms    = { :ios => '12.0' }
  s.dependency 'React-Core'
  # 依赖宿主工程中使用到的三方库/本地框架（保持与原 Podfile 一致）
  s.dependency 'MMWormhole'
  s.dependency 'KeychainAccess'
  s.dependency 'AsyncSwift'
  s.dependency 'Alamofire', '~> 4.9.1'
  s.dependency 'CryptoSwift'
  s.dependency 'FCUUID'
  s.dependency 'HandyJSON', '~> 5.0.2'
  s.dependency 'CocoaAsyncSocket'
  s.dependency 'MMDB-Swift'
  s.dependency 'Yaml'
  s.dependency 'HappyDNS', '1.0.4'

  # 可选子规格：启用后将包含 PacketTunnel/ShadowLibrary 全量源码（需同步从宿主工程移除对应编译项以避免重复）
  s.subspec 'full' do |ss|
    # 全量迁移：PacketTunnel + ShadowLibrary + ShadowBase + RN Bridge
    ss.source_files = 'Sources/SSRManager.{h,m}',
                      'Sources/PacketTunnel/**/*.{h,m,mm,swift}',
                      'Sources/ShadowLibrary/**/*.{h,m,mm,swift}',
                      'Sources/ShadowBase/**/*.{h,m,mm,swift}'
    ss.resources = ['Resources/*']
    ss.dependency 'MMWormhole'
    ss.dependency 'KeychainAccess'
    ss.dependency 'AsyncSwift'
    ss.dependency 'Alamofire', '~> 4.9.1'
    ss.dependency 'CryptoSwift'
    ss.dependency 'FCUUID'
    ss.dependency 'HandyJSON', '~> 5.0.2'
    ss.dependency 'CocoaAsyncSocket'
    ss.dependency 'MMDB-Swift'
    ss.dependency 'Yaml'
    ss.dependency 'HappyDNS', '1.0.4'
  end
end
