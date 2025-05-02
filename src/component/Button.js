// src/component/Button.js
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const Button = ({
  title,
  onPress,
  backgroundColor = '#1D61E7',
  textColor = '#fff',
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor}]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={[styles.text, {color: textColor}]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%', // 👈 Reduced width
    alignSelf: 'center', // 👈 Center the button
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D61E7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});



export default Button;
