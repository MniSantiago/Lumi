/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'shield-config',
  name: 'LampiShieldConfig',
  bundleIdentifier: '.shieldconfig',
  frameworks: ['DeviceActivity', 'FamilyControls', 'ManagedSettings', 'ManagedSettingsUI'],
  images: { 'lumi-dormida': './lumi-dormida.png' },
  deploymentTarget: '16.0',
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
