/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'device-activity-monitor',
  name: 'LampiMonitor',
  bundleIdentifier: '.monitor',
  frameworks: ['DeviceActivity', 'FamilyControls', 'ManagedSettings'],
  deploymentTarget: '16.0',
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
