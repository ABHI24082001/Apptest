// LeaveDatePicker.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const LeaveDatePicker = ({ leaveDate, setLeaveDate, showDatePicker, setShowDatePicker }) => {
  return (
    <>
      <Text style={styles.label}>Leave Date*</Text>
      <TouchableOpacity
        style={styles.inputWithIcon}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.inputText}>
          {moment(leaveDate).format('DD-MM-YYYY')}
        </Text>
        <Icon name="calendar" size={22} color="#555" />
      </TouchableOpacity>
      <DatePicker
        modal
        open={showDatePicker}
        date={leaveDate}
        mode="date"
        onConfirm={date => {
          setShowDatePicker(false);
          setLeaveDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  inputText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LeaveDatePicker;
