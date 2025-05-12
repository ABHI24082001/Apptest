import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import {Button, Appbar} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import AppSafeArea from '../component/AppSafeArea';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ExitApplyScreen = ({navigation}) => {
  const [form, setForm] = useState({
    applyDate: null,
    exitDate: null,
    employeeCode: '',
    bioMetricId: '',
    name: '',
    designation: '',
    department: '',
    reason: '',
  });

  const [showDatePicker, setShowDatePicker] = useState({
    type: '',
    visible: false,
  });

  const handleChange = (key, value) => {
    setForm({...form, [key]: value});
  };

  const handleSubmit = () => {
    console.log('Form Submitted:', form);
  };

  return (
    <AppSafeArea>
      <Appbar.Header style={{backgroundColor: '#fff'}}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Exit Apply"
          titleStyle={{color: '#000', fontWeight: 'bold'}}
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Apply Date */}
        <Text style={styles.label}>Apply Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker({type: 'applyDate', visible: true})}
          activeOpacity={0.8}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="MM/DD/YYYY"
              placeholderTextColor="black"
              value={
                form.applyDate
                  ? moment(form.applyDate).format('MM/DD/YYYY')
                  : ''
              }
              editable={false}
              style={styles.inputWithIcon}
              pointerEvents="none"
            />
            <Icon name="calendar" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Employee Code */}
        <Text style={styles.label}>Employee Code</Text>
        <TextInput
          placeholder="Code"
          placeholderTextColor="black"
          value={form.employeeCode}
          onChangeText={text => handleChange('employeeCode', text)}
          style={styles.input}
        />

        {/* Bio Metric ID */}
        <Text style={styles.label}>Bio-Matric Id</Text>
        <TextInput
          placeholder="Id"
          placeholderTextColor="black"
          value={form.bioMetricId}
          onChangeText={text => handleChange('bioMetricId', text)}
          style={styles.input}
        />

        {/* Name */}
        <Text style={styles.label}>Employee Name</Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor="black"
          value={form.name}
          onChangeText={text => handleChange('name', text)}
          style={styles.input}
        />

        {/* Designation */}
        <Text style={styles.label}>Designation</Text>
        <TextInput
          placeholder="Designation"
          placeholderTextColor="black"
          value={form.designation}
          onChangeText={text => handleChange('designation', text)}
          style={styles.input}
        />

        {/* Department */}
        <Text style={styles.label}>Department</Text>
        <TextInput
          placeholder="Department"
          placeholderTextColor="black"
          value={form.department}
          onChangeText={text => handleChange('department', text)}
          style={styles.input}
        />

        {/* Exit Date */}
        <Text style={styles.label}>Exit Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker({type: 'exitDate', visible: true})}
          activeOpacity={0.8}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="MM/DD/YYYY"
              placeholderTextColor="black"
              value={
                form.exitDate
                  ? moment(form.exitDate).format('MM/DD/YYYY')
                  : ''
              }
              editable={false}
              style={styles.inputWithIcon}
              pointerEvents="none"
            />
            <Icon name="calendar" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Reason */}
        <Text style={styles.label}>Reason</Text>
        <TextInput
          placeholder="Remarks.."
          placeholderTextColor="black"
          multiline
          numberOfLines={4}
          value={form.reason}
          onChangeText={text => handleChange('reason', text)}
          style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
        />

        {/* Submit and Cancel Buttons */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={{paddingVertical: 8}}>
          Submit
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          contentStyle={{paddingVertical: 8}}>
          Cancel
        </Button>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker.visible}
        date={form[showDatePicker.type] || new Date()}
        mode="date"
        onConfirm={date => {
          setShowDatePicker({type: '', visible: false});
          handleChange(showDatePicker.type, date);
        }}
        onCancel={() => setShowDatePicker({type: '', visible: false})}
      />
    </AppSafeArea>
  );
};

export default ExitApplyScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingRight: 10,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
    backgroundColor: '#1D61E7',
  },
  cancelButton: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#E3EAF3',
  },
});
