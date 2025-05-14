// components/GlobalPicker.js
import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';

const GlobalPicker = ({ value, setValue, placeholder, items }) => {
  return (
    <RNPickerSelect
      onValueChange={value => setValue(value)}
      value={value}
      placeholder={placeholder}
      items={items}
      style={pickerSelectStyles}
      useNativeAndroidPickerStyle={false}
      Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
    />
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    padding: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#000',
    marginBottom: 16,
    paddingRight: 30, // space for icon
  },
  inputAndroid: {
    fontSize: 14,
    fontWeight: '600',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#000',
    marginBottom: 16,
    paddingRight: 30, // space for icon
  },
  iconContainer: {
    top: 16,
    right: 12,
  },
});

export default GlobalPicker;
