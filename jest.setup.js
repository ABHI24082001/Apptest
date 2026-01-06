// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(component => component),
    Directions: {},
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock lottie-react-native
jest.mock('lottie-react-native', () => 'LottieView');

// Mock onnxruntime-react-native
jest.mock('onnxruntime-react-native', () => ({
  InferenceSession: {
    create: jest.fn(),
  },
  Tensor: jest.fn(),
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  readFile: jest.fn(() => Promise.resolve('')),
  writeFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(false)),
  mkdir: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock buffer
jest.mock('buffer', () => ({
  Buffer: {
    from: jest.fn((data) => data),
    alloc: jest.fn(),
  },
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(() => Promise.resolve()),
  setRNConfiguration: jest.fn(),
}));

// Mock react-native-background-actions
jest.mock('react-native-background-actions', () => ({
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  updateNotification: jest.fn(),
  isRunning: jest.fn(() => Promise.resolve(false)),
}));

// Mock react-native-date-picker
jest.mock('react-native-date-picker', () => 'DatePicker');

// Mock moment
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return moment;
});

// Mock react-native-html-to-pdf
jest.mock('react-native-html-to-pdf', () => ({
  convert: jest.fn(() => Promise.resolve({ filePath: '/mock/path/file.pdf' })),
}));

// Mock react-native-print
jest.mock('react-native-print', () => ({
  print: jest.fn(() => Promise.resolve()),
}));

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    requestPermission: jest.fn(() => Promise.resolve(1)),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    setBackgroundMessageHandler: jest.fn(),
  })),
}));

// Mock react-native-pdf
jest.mock('react-native-pdf', () => 'Pdf');

// Mock react-native-document-picker - conditional mock
try {
  require.resolve('react-native-document-picker');
  jest.mock('react-native-document-picker', () => ({
    pick: jest.fn(() => Promise.resolve([])),
    types: {
      allFiles: 'public.item',
      images: 'public.image',
      pdf: 'com.adobe.pdf',
    },
  }));
} catch (e) {
  // Package not installed, skip mock
}

// Mock react-native-permissions - conditional mock
try {
  require.resolve('react-native-permissions');
  jest.mock('react-native-permissions', () => ({
    check: jest.fn(() => Promise.resolve('granted')),
    request: jest.fn(() => Promise.resolve('granted')),
    PERMISSIONS: {
      IOS: {},
      ANDROID: {},
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      BLOCKED: 'blocked',
    },
  }));
} catch (e) {
  // Package not installed, skip mock
}

// Mock axios
jest.mock('axios');

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock redux store
jest.mock('./src/store/store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Mock AuthContext
jest.mock('./src/constants/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock notification service
jest.mock('./src/utils/notificationService', () => ({
  requestUserPermission: jest.fn(),
  foregroundListener: jest.fn(() => jest.fn()),
}));

// Mock AppNavigator to avoid loading all screens
jest.mock('./src/navigation/AppNavigator', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockAppNavigator() {
    return React.createElement(View, null, React.createElement(Text, null, 'MockAppNavigator'));
  };
});
