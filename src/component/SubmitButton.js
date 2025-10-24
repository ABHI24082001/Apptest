import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

const SubmitButton = ({onPress}) => (
  <TouchableOpacity
    style={{
      backgroundColor: '#2962ff',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    }}
    onPress={onPress}>
    <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>Submit</Text>
  </TouchableOpacity>
);

export default SubmitButton;
