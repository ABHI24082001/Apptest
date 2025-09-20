import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../constants/apiConfig';
const { width } = Dimensions.get('window');
import axiosInstance from '../utils/axiosInstance';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
export default function MonthCalendarWithAgenda({
  events = {},
  initialDate = moment().format('YYYY-MM-DD'),
  onDateChange = () => {},
  employeeId,
  childCompanyId,
  branchId,
}) {
  const [currentMonth, setCurrentMonth] = useState(moment(initialDate));
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentMonth.year());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);


  const employeeDetails = useFetchEmployeeDetails();

  const fetchAttendanceData = async () => {
    try {
      if (!employeeDetails) {
        console.log('Employee details not loaded yet');
        return;
      }

      setLoading(true);
debugger
      // Use employee details from the hook
      const empId = employeeDetails?.id || employeeId;
      const empChildCompanyId = employeeDetails?.childCompanyId || childCompanyId;
      const empBranchId = employeeDetails?.branchId || branchId;
      const empDepartmentId = employeeDetails?.departmentId || 0;
      const empDesignationId = employeeDetails?.designtionId || 0;
      const empEmployeeType = employeeDetails?.employeeType || 0;

      // Make sure we have the correct API endpoint with leading slash if needed
      const endpoint = `${BASE_URL}/BiomatricAttendance/GetCalendorForSingleEmployee`;
      
      console.log('Making API request to:', endpoint);

      const requestData = {
        EmployeeId: empId,
        Month: currentMonth.month() + 1,
        Year: currentMonth.year(),
        ChildCompanyId: empChildCompanyId,
        BranchId: empBranchId,
        FromDate: currentMonth.startOf('month').format('YYYY-MM-DDT00:00:00'),
        ToDate: currentMonth.endOf('month').format('YYYY-MM-DDT00:00:00'),
        EmployeeTypeId: empEmployeeType,
        DepartmentId: empDepartmentId,
        DesignationId: empDesignationId,
        UserType: 0,
        CalculationType: 0,
        hasAllReportAccess: false,
        // Adding other fields from the example request
        YearList: null,
        BranchName: null,
        Did: 0,
        UserId: 0,
        status: null,
        Ids: null,
        CoverLatter: null
      };
      
      console.log('Request data:', JSON.stringify(requestData));
      
      const response = await axiosInstance.post(endpoint, requestData);
      
      console.log('API Response:', response.status);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeDetails) {
      fetchAttendanceData();
    }
  }, [currentMonth, employeeDetails]);

  // Event types configuration
  const eventTypes = {
    'present': { color: '#666666', icon: 'check', status: 'P' },
    'absent': { color: '#FF0000', icon: 'close', status: 'A' },
    'weekend': { color: '#FFFFFF', icon: 'weekend' },
    'holiday': { color: '#FF0000', icon: 'celebration' },
  };

  useEffect(() => {
    const start = currentMonth.clone().startOf('month');
    const end = currentMonth.clone().endOf('month');
    const days = [];
    for (let m = start; m.isSameOrBefore(end, 'day'); m.add(1, 'day')) {
      days.push({
        key: m.format('YYYY-MM-DD'),
        date: m.clone(),
      });
    }
    setDaysInMonth(days);
    // Reset selection if out of month
    if (!moment(selectedDate).isSame(currentMonth, 'month')) {
      setSelectedDate(currentMonth.format('YYYY-MM-DD'));
      onDateChange(currentMonth.format('YYYY-MM-DD'));
    }
  }, [currentMonth]);

  const goMonth = (dir) => {
    setCurrentMonth((cm) => cm.clone().add(dir === 'prev' ? -1 : 1, 'month'));
  };

  const pickYear = (y) => {
    setPickerYear(y);
    const newMonth = currentMonth.clone().year(y);
    setCurrentMonth(newMonth);
    setShowPicker(false);
  };

  // Generate events for the current month
  const generateMonthEvents = () => {
    const events = {};
    const start = currentMonth.clone().startOf('month');
    const end = currentMonth.clone().endOf('month');

    if (!attendanceData || !attendanceData.calendarModels || !attendanceData.calendarModels[0]) {
      return events;
    }

    const attendance = attendanceData.calendarModels[0];
    const holidays = attendanceData.holidays || [];

    for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, 'day')) {
      const dayOfWeek = date.day();
      const dateStr = date.format('YYYY-MM-DD');
      const dayOfMonth = parseInt(date.format('D'));
      
      // Weekend check
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        events[dateStr] = [{
          id: `weekend-${dateStr}`,
          type: 'weekend',
          name: dayOfWeek === 0 ? 'Sunday' : 'Saturday',
        }];
        continue;
      }

      // Holiday check
      const isHoliday = holidays.some(h => h.day === dayOfMonth);
      if (isHoliday) {
        events[dateStr] = [{
          id: `holiday-${dateStr}`,
          type: 'holiday',
          name: 'Holiday'
        }];
        continue;
      }

      // Attendance check
      const loginKey = `${getDayText(dayOfMonth)}LogIn`;
      const logoutKey = `${getDayText(dayOfMonth)}LogOut`;
      
      if (attendance[loginKey] && attendance[logoutKey]) {
        events[dateStr] = [{
          id: `present-${dateStr}`,
          type: 'present',
          name: 'Present',
          time: `${attendance[loginKey]} - ${attendance[logoutKey]}`
        }];
      } else {
        events[dateStr] = [{
          id: `absent-${dateStr}`,
          type: 'absent',
          name: 'Absent'
        }];
      }
    }
    
    return events;
  };

  const getDayText = (day) => {
    const texts = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'forteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
      'nineteen', 'twenty', 'twentyOne', 'twentyTwo', 'twentyThree', 'twentyFour', 'twentyFive',
      'twentySix', 'twentySeven', 'twentyEight', 'twentyNine', 'thirty', 'thirtyOne'];
    return texts[day];
  };

  const sampleEvents = generateMonthEvents();

  const renderDay = ({ item }) => {
    const isSelected = item.key === selectedDate;
    const evts = events[item.key] || [];
    const dayName = item.date.format('ddd'); // Mon, Tue
    const dateNumber = item.date.format('D'); // 6, 7
    const dayOfWeek = item.date.day(); // 0 for Sunday, 6 for Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isAbsent = evts.some(e => e.type === 'absent');
    const isPresent = evts.some(e => e.type === 'present');
  
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDate(item.key);
          onDateChange(item.key);
        }}
        style={[
          styles.dayCard, 
          isWeekend && styles.weekendCard,
          isAbsent && styles.absentCard,
          isPresent && styles.presentCard,
          isSelected && styles.dayCardSelected
        ]}
      >
        {/* Day Name */}
        <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
          {dayName}
        </Text>
  
        {/* Date Number */}
        <Text style={[styles.dateLabel, isSelected && styles.dayLabelSelected]}>
          {dateNumber}
        </Text>
  
        {/* Event Dots/Icons */}
        {evts.slice(0, 2).map((e) => (
          <View key={e.id} style={styles.dotRow}>
            <MaterialIcons
              name={eventTypes[e.type]?.icon || 'event'}
              size={12}
              color={eventTypes[e.type]?.color || '#777'}
            />
            {e.type === 'present' && (
              <>
                <Text style={[styles.statusText, { color: eventTypes[e.type]?.color }]}>P</Text>
                <Text style={styles.timeText}>In: {e.time.split(' - ')[0]}</Text>
                <Text style={styles.timeText}>Out: {e.time.split(' - ')[1]}</Text>
              </>
            )}
            {e.type === 'absent' && (
              <Text style={[
                styles.statusText, 
                { 
                  color: eventTypes[e.type]?.color,
                  backgroundColor: '#FFEBEE',
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 4
                }
              ]}>A</Text>
            )}
          </View>
        ))}
      </TouchableOpacity>
    );
  };
  

  const agendaItems = sampleEvents[selectedDate] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goMonth('prev')}>
          <MaterialIcons name="chevron-left" size={28} color="#3F51B5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={styles.title}>
            {currentMonth.format('MMMM YYYY')}
            <MaterialIcons name="arrow-drop-down" size={20} color="#3F51B5" />
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => goMonth('next')}>
          <MaterialIcons name="chevron-right" size={28} color="#3F51B5" />
        </TouchableOpacity>
      </View>

      {/* Days Scroll */}
      <FlatList
        data={daysInMonth}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(d) => d.key}
        renderItem={renderDay}
        contentContainerStyle={styles.daysContainer}
        initialScrollIndex={daysInMonth.findIndex(day => day.key === moment().format('YYYY-MM-DD'))}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH + 8,
          offset: (CARD_WIDTH + 8) * index,
          index,
        })}
      />

      {/* Agenda */}
      <View style={styles.agenda}>
        <Text style={styles.agendaHeader}>
          {moment(selectedDate).format('dddd, MMMM D')}
        </Text>
        {agendaItems.length === 0 ? (
          <View style={styles.emptyAgenda}>
            <MaterialIcons name="event-busy" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No events</Text>
          </View>
        ) : (
          agendaItems.map((evt) => (
            <View key={evt.id} style={[
              styles.eventCard,
              evt.type === 'absent' && { backgroundColor: '#FFEBEE', borderLeftColor: '#FF0000' },
              evt.type === 'weekend' && { backgroundColor: '#FFF8E1', borderLeftColor: '#FFA500' },
              evt.type === 'holiday' && { backgroundColor: '#FFEBEE', borderLeftColor: '#FF0000' },
              evt.type === 'present' && { borderLeftColor: '#666666' }
            ]}>
              <View style={styles.eventRow}>
                <MaterialIcons
                  name={eventTypes[evt.type]?.icon || 'event'}
                  size={20}
                  color={eventTypes[evt.type]?.color}
                />
                <Text style={styles.eventTitle}>{evt.name}</Text>
              </View>
              {evt.time && (
                <View style={styles.timeDetails}>
                  <Text style={styles.timeLabel}>Login: </Text>
                  <Text style={styles.timeValue}>{evt.time.split(' - ')[0]}</Text>
                  <Text style={styles.timeLabel}> Logout: </Text>
                  <Text style={styles.timeValue}>{evt.time.split(' - ')[1]}</Text>
                </View>
              )}
              {evt.location && <Text style={styles.eventDetail}>{evt.location}</Text>}
            </View>
          ))
        )}
      </View>

      {/* Year Picker */}
      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Year</Text>
            <RNPickerSelect
              onValueChange={pickYear}
              items={Array.from({ length: 11 }, (_, i) => {
                const y = moment().year() - 5 + i;
                return { label: `${y}`, value: y };
              })}
              value={pickerYear}
            />
            <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closePicker}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CARD_WIDTH = 50;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F51B5',
  },
  daysContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#ffffffff',
    borderRadius: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayCard: {
    width: CARD_WIDTH + 10,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayCardSelected: {
    backgroundColor: '#77d6f9ff',
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weekendCard: {
    backgroundColor: '#f2c570ff',
  },
  absentCard: {
    backgroundColor: '#FF4444',
    borderColor: '#FF0000',
    borderWidth: 1,
    shadowColor: '#FF0000',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  presentCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
   dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dayLabelSelected: {
    color: '#FFF',
  },
  dotRow: { 
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold'
  },
  timeText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#666'
  },
  agenda: {
    flex: 1,
    padding: 12,
  },
  agendaHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1F2937',
    paddingHorizontal: 4,
  },
  emptyAgenda: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 16,
    padding: 32,
  },
  emptyText: {
    color: '#CCC',
    marginTop: 8,
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#666666',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  eventDetail: {
    fontSize: 13,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  closePicker: {
    marginTop: 16,
    alignSelf: 'center',
  },
  closeText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600'
  },
  timeValue: {
    fontSize: 13,
    color: '#1F2937',
    marginRight: 12,
    fontWeight: '500'
  },
});
