// src/components/CoreText.js

import React from 'react';
import { Text, Platform } from 'react-native';
import { theme } from '../theme';

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
  const { FONT_SIZES, COLORS, FONT_FAMILIES } = theme;

  const calculatedLineHeight = lineHeight || FONT_SIZES[size] * 1.4;

  const textStyles = {
    fontSize: FONT_SIZES[size] || FONT_SIZES.md,
    color: COLORS[color] || COLORS.dark,
    fontFamily: FONT_FAMILIES[font] || FONT_FAMILIES.regular,
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
