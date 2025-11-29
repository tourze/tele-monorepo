require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Udp"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.license      = package["license"]
  s.homepage     = package["homepage"] || "https://github.com/vibe-shell/react-native-udp"

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/vibe-shell/react-native-udp.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true
  s.private_header_files = "ios/**/*.h"

  s.dependency "React-Core"
  s.dependency "CocoaAsyncSocket", "~> 7.6"

  install_modules_dependencies(s)
end
