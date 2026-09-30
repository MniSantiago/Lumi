Pod::Spec.new do |s|
  s.name           = 'LampiScreenTime'
  s.version        = '1.0.0'
  s.summary        = 'Family Controls, DeviceActivity y ManagedSettings para Lampi'
  s.license        = { :type => 'MIT' }
  s.author         = { 'Lampi' => 'noreply@lampi.app' }
  s.homepage       = 'https://github.com/MniSantiago/Lumi'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,swift}'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
