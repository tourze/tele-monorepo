Pod::Spec.new do |s|
  s.name         = 'TcpPing'
  s.version      = '0.1.0'
  s.summary      = 'React Native TCP Ping 模块'
  s.description  = '提供跨端 TCP Ping 能力（新架构/旧架构兼容）'
  s.homepage     = 'https://example.local/'
  s.license      = { :type => 'MIT' }
  s.author       = { 'react-native-tcp-ping' => 'dev@local' }
  s.platforms    = { :ios => '12.0' }
  s.source       = { :git => 'https://example.local/TcpPing.git', :tag => s.version.to_s }

  s.source_files  = 'ios/*.{h,m,mm}'
  s.requires_arc  = true

  s.dependency 'React-Core'
end
