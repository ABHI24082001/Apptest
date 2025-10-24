import React from 'react';
import {Text, TextInput,View} from 'react-native';

const TotalAmountInput = ({requestType, totalAmount, setTotalAmount}) => (
  <View style={{marginTop: 16}}>
    <Text style={{fontSize: 16, fontWeight: '600'}}>Total Amount</Text>
    <TextInput
      value={
        requestType === 'advance'
          ? totalAmount.toString()
          : `₹${totalAmount.toFixed(2)}`
      }
      editable={requestType === 'advance'}
      onChangeText={value => {
        if (requestType === 'advance') {
          const numericValue = parseFloat(value) || 0;
          setTotalAmount(numericValue);
        }
      }}
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        backgroundColor: requestType === 'advance' ? '#fff' : '#f3f4f6',
      }}
    />
  </View>
);

export default TotalAmountInput;
