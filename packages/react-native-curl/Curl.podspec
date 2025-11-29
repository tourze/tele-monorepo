require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Curl"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.license      = package["license"]
  s.homepage     = package["homepage"] || "https://github.com/vibe-shell/react-native-curl"
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/vibe-shell/react-native-curl.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,cc}"
  s.private_header_files = "ios/**/*.h"
  s.requires_arc = true

  s.dependency "React-Core"
  s.dependency "curl", "~> 8.0"

  install_modules_dependencies(s)
end
