import React from 'react';
import {Text, TextInput} from 'react-native';
import {Controller} from 'react-hook-form';

const RemarksInput = ({control, errors}) => (
  <>
    <Text style={{fontSize: 16, fontWeight: '600', marginBottom: 6}}>
      Remarks <Text style={{color: '#EF4444'}}>*</Text>
      {errors.remarks && (
        <Text style={{color: '#EF4444'}}> {errors.remarks.message}</Text>
      )}
    </Text>
    <Controller
      control={control}
      name="remarks"
      rules={{required: 'Remarks are required'}}
      render={({field: {onChange, value}}) => (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Add Remarks"
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 12,
            borderRadius: 8,
            height: 100,
          }}
        />
      )}
    />
  </>
);

export default RemarksInput;
