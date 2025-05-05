import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/Ionicons';
import AppSafeArea from '../component/AppSafeArea';
import AttendanceCard from '../component/AttendanceCard';

const months = [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
];


const years = [
  { label: '2020', value: '2020' },
  { label: '2021', value: '2021' },
  { label: '2022', value: '2022' },
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
  { label: '2028', value: '2028' },
  { label: '2029', value: '2029' },
  { label: '2030', value: '2030' },
];


const attendanceData = [
  {
    date: '2025-04-17',
    shift: 'Morning Shift',
    time: '09:00 AM - 06:00 PM',
    required: '9h',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    worked: '9h 00m',
    status: 'Full Day',
  },
  {
    date: '2025-04-16',
    shift: 'Morning Shift',
    time: '09:00 AM - 06:00 PM',
    required: '9h',
    checkIn: '09:15 AM',
    checkOut: '02:30 PM',
    worked: '5h 15m',
    status: 'Half Day',
  },
  {
    date: '2025-05-15',
    shift: 'Morning Shift',
    time: '09:00 AM - 06:00 PM',
    required: '9h',
    checkIn: '----',
    checkOut: '----',
    worked: '----',
    status: 'Absent',
  },
  {
    date: '2025-05-14',
    shift: 'Morning Shift',
    time: '09:00 AM - 06:00 PM',
    required: '9h',
    checkIn: '09:00 AM',
    checkOut: '----',
    worked: '----',
    status: 'Pending',
  },
  {
    date: '2025-03-13',
    shift: 'Night Shift',
    time: '09:00 PM - 06:00 AM',
    required: '9h',
    checkIn: '09:00 PM',
    checkOut: '06:00 AM',
    worked: '9h 00m',
    status: 'Full Day',
  },
  {
    date: '2025-03-12',
    shift: 'Night Shift',
    time: '09:00 PM - 06:00 AM',
    required: '9h',
    checkIn: '10:30 PM',
    checkOut: '02:00 AM',
    worked: '3h 30m',
    status: 'Half Day',
  },
  {
    date: '2025-05-11',
    shift: 'General Shift',
    time: '10:00 AM - 07:00 PM',
    required: '9h',
    checkIn: '----',
    checkOut: '----',
    worked: '----',
    status: 'Absent',
  },
  {
    date: '2025-05-10',
    shift: 'General Shift',
    time: '10:00 AM - 07:00 PM',
    required: '9h',
    checkIn: '10:00 AM',
    checkOut: '----',
    worked: '----',
    status: 'Pending',
  },
];


const MyAttendanceScreen = ({navigation}) => {
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [search, setSearch] = useState('');

  // Filter logic
  const filteredData = attendanceData.filter(item => {
    const itemDate = new Date(item.date);
    const monthMatch =
      itemDate.toLocaleString('default', {month: 'long'}) === selectedMonth;
    const yearMatch = itemDate.getFullYear().toString() === selectedYear;
    const searchMatch = item.shift.toLowerCase().includes(search.toLowerCase());
    return monthMatch && yearMatch && searchMatch;
  });


  return (
    <AppSafeArea>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{paddingBottom: 30}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginTop: 16,
                marginBottom: 10,
                marginHorizontal: 16,
              }}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: '#333'}}>
                Attendance
              </Text>
            </View>

            {/* Search */}
            {/* <View style={styles.searchWrapper}>
              <Icon name="search-outline" size={20} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Shift"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
              />
            </View> */}

            {/* Month Picker */}
            <RNPickerSelect
              onValueChange={setSelectedMonth}
              items={months}
              value={selectedMonth}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Icon name="chevron-down-outline" size={20} color="#000" />
              )}
            />

            {/* Year Picker */}
            <RNPickerSelect
              onValueChange={setSelectedYear}
              items={years}
              value={selectedYear}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Icon name="chevron-down-outline" size={20} color="#000" />
              )}
            />

            {/* Attendance Cards */}
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <AttendanceCard key={index} data={item} />
              ))
            ) : (
              <Text style={styles.noDataText}>
                No attendance records found.
              </Text>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
    paddingHorizontal: 12,
    margin: 16,
    height: 45,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f1f3f4',
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f1f3f4',
    color: '#333',
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 15 : 12,
    right: 20,
  },
});

export default MyAttendanceScreen;
