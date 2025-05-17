// RemarkInput.js
import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';

const RemarkInput = ({ remark, setRemark }) => {
  return (
    <>
      <Text style={styles.label}>Remark</Text>
      <TextInput
        style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
        value={remark}
        onChangeText={setRemark}
        placeholder="Enter any remarks (optional)"
        placeholderTextColor={'#000'}
        multiline={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000',
    marginBottom: 16,
  },
});

export default RemarkInput;
