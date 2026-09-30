/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'shield-action',
  name: 'LampiShieldAction',
  bundleIdentifier: '.shieldaction',
  frameworks: ['DeviceActivity', 'FamilyControls', 'ManagedSettings'],
  deploymentTarget: '16.0',
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
