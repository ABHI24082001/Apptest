import React from 'react';
import {Text} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Controller} from 'react-hook-form';

const RequestTypePicker = ({control, errors, setValue}) => (
  <>
    <Text style={{fontSize: 16, fontWeight: '600', marginBottom: 6}}>
      Request Type <Text style={{color: '#EF4444'}}>*</Text>
      {errors.requestType && (
        <Text style={{color: '#EF4444'}}> {errors.requestType.message}</Text>
      )}
    </Text>
    <Controller
      control={control}
      name="requestType"
      rules={{required: 'Request type is required'}}
      render={({field: {onChange, value}}) => (
        <RNPickerSelect
          onValueChange={selectedValue => {
            onChange(selectedValue);
            setValue('RequestTypeId', selectedValue === 'expense' ? 1 : 2);
          }}
          value={value}
          placeholder={{label: 'Select Request Type', value: null}}
          items={[
            {label: 'Expense', value: 'expense'},
            {label: 'Advance', value: 'advance'},
          ]}
          style={{
            inputIOS: {padding: 12, borderWidth: 1, borderColor: '#ccc'},
            inputAndroid: {padding: 12, borderWidth: 1, borderColor: '#ccc'},
          }}
          Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
        />
      )}
    />
  </>
);

export default RequestTypePicker;
