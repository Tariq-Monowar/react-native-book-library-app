module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    // Release builds: drop console.log calls, which cost CPU on every call
    // even when nobody is reading the log.
    production: {
      plugins: [['transform-remove-console', {exclude: ['error', 'warn']}]],
    },
  },
  plugins: [
    // Must stay last.
    'react-native-reanimated/plugin',
  ],
};
