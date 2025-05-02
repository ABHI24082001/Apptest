import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { View, Text, StyleSheet, Platform } from 'react-native';

const CustomPicker = ({ label, items, onValueChange, value, placeholder }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNPickerSelect
        onValueChange={onValueChange}
        items={items}
        value={value}
        placeholder={placeholder}
        style={{
          inputAndroid: styles.input, 
          inputIOS: styles.input,
          iconContainer: {
            top: 15,
            right: 12,
          },
          ...Platform.select({
            ios: {
              inputIOS: styles.inputIOS,
            },
            android: {
              inputAndroid: styles.inputAndroid,
            },
          }),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputIOS: {
    borderColor: '#1E88E5',
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
  },
  inputAndroid: {
    borderColor: '#1E88E5',
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
});

export default CustomPicker;
