const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    ...jestExpoPreset.transform,
    // jest-expo's transform only matches \.[jt]sx?$, which excludes .mjs.
    // A file matching no transform pattern is loaded as-is, so rettime's
    // ESM-only .mjs build hits Node's CJS loader and throws.
    '\\.mjs$': jestExpoPreset.transform['\\.[jt]sx?$'],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|msw|@mswjs|@open-draft|rettime|outvariant|until-async|headers-polyfill|is-node-process|strict-event-emitter|cookie|tough-cookie|path-to-regexp|statuses|picocolors|graphql|type-fest))',
  ],
};