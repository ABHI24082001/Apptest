import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';

// Predefined constants for better maintainability
const FONT_SIZES = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  xxxxl: 36,
};

const COLORS = {
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

const FONT_FAMILIES = {
  regular: {
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  },
  medium: {
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'sans-serif-medium',
  },
  bold: {
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'sans-serif-bold',
  },
  light: {
    ios: 'System',
    android: 'Roboto-Light',
    default: 'sans-serif-light',
  },
};

const CoreText = ({
  size = 'md',
  color = 'dark',
  style,
  children,
  font = 'regular',
  align = 'left',
  numberOfLines,
  ellipsizeMode,
  onPress,
  testID,
  lineHeight,
  letterSpacing,
  textDecorationLine,
}) => {
  // Get platform-specific font family
  const getFontFamily = (weight) => {
    const family = FONT_FAMILIES[weight] || FONT_FAMILIES.regular;
    return Platform.select(family);
  };

  // Calculate line height relative to font size if not provided
  const calculatedLineHeight = lineHeight || FONT_SIZES[size] * 1.4;

  const textStyles = {
    fontSize: FONT_SIZES[size] || FONT_SIZES.md,
    color: COLORS[color] || COLORS.dark,
    fontFamily: getFontFamily(font),
    textAlign: align,
    includeFontPadding: false,
    lineHeight: calculatedLineHeight,
    letterSpacing,
    textDecorationLine,
  };

  return (
    <Text
      style={[textStyles, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onPress={onPress}
      testID={testID}
      accessible
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={typeof children === 'string' ? children : undefined}
    >
      {children}
    </Text>
  );
};

export default React.memo(CoreText);