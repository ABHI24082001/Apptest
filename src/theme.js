// src/theme/theme.js

import { Platform } from 'react-native';

// export const FONT_SIZES = {
//   xxs: 10,
//   xs: 12,
//   sm: 14,
//   md: 16,
//   lg: 18,
//   xl: 20,
//   xxl: 24,
//   xxxl: 30,
//   xxxxl: 36,
// };

export const COLORS = {
  primary: '#2A4ECA',
  secondary: '#2ecc71',
  success: '#27ae60',
  danger: '#e74c3c',
  warning: '#f39c12',
  light: '#f8f9fa',
  dark: '#212529',
  muted: '#6c757d',
  white: '#ffffff',
  black: '#000000',
};

export const FONT_FAMILIES = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'sans-serif-bold' }),
  light: Platform.select({ ios: 'System', android: 'Roboto-Light', default: 'sans-serif-light' }),
};

export const theme = {
  FONT_SIZES,
  COLORS,
  FONT_FAMILIES,
};
