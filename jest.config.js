module.exports = {
  preset: 'react-native',

  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|react-native-gesture-handler' +
      '|react-native-reanimated' +
      '|react-native-screens' +
      '|react-native-safe-area-context' +
      '|react-native-toast-message' +
      '|react-native-vector-icons' +
      '|lottie-react-native' +
      '|react-native-linear-gradient' +
      '|react-native-drawer-layout' +
      '|react-native-date-picker' +
      '|react-native-html-to-pdf' +
      '|react-native-print' +
      '|react-native-pdf' +
      '|@react-native-firebase' +
      '|react-redux' +
      '|@reduxjs/toolkit' +
      '|immer' +
      '|react-native-document-picker' +
      '|react-native-permissions' +
      ')/)',
  ],

  moduleNameMapper: {
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Disable watchman to avoid permission issues
  watchman: false,
};
