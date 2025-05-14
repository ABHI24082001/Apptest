// AppliedLeaveNo.js
import React from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

const AppliedLeaveNo = ({ appliedLeaveNo, setAppliedLeaveNo }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Applied Leave No.*</Text>
      <TextInput
        style={styles.textInput}
        value={appliedLeaveNo}
        editable={true}
        keyboardType="numeric"
        onChangeText={text => setAppliedLeaveNo(parseInt(text))}
        placeholder="Enter number of days"
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  textInput: {
    height: 50,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
});

export default AppliedLeaveNo;
