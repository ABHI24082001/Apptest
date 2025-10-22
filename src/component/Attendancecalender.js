import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import axiosInstance from '../utils/axiosInstance';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 50;

export default function MonthCalendarWithAgenda({
  events = {},
  initialDate = moment().format('YYYY-MM-DD'),
  onDateChange = () => {},
  employeeId,
  childCompanyId,
  branchId,
}) {
  // state
  const [currentMonth, setCurrentMonth] = useState(moment(initialDate));
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment(initialDate).format('YYYY-MM-DD'));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(moment(initialDate).year());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const employeeDetails = useFetchEmployeeDetails();

  // FlatList ref for safe scrolling
  const daysListRef = useRef(null);

  // Event type defaults (used for color/icon fallbacks)
  const eventTypes = {
    present: { color: '#666666', icon: 'check', status: 'P' },
    absent: { color: '#aeaeaeff', icon: 'close', status: 'A' },
    holiday: { color: '#a80000ff', icon: 'celebration', status: 'H' },
  };

  // Leave/holiday mapping — normalized icons + colors. Keep keys as internal types.
  const leaveColors = {
    'week-off': { color: '#3bba46', icon: 'weekend', label: 'Week Off' },
    holiday: { color: '#FF9800', icon: 'celebration', label: 'Holiday' },
    'national holiday': { color: '#ffab40', icon: 'flag', label: 'National Holiday' },
    'casual leave': { color: '#a5d6a7', icon: 'beach-access', label: 'Casual Leave' },
  };

  // Fetch attendance data from API (uses employeeDetails when available)
  const fetchAttendanceData = async () => {
    try {
      if (!employeeDetails && !employeeId) {
        console.log('Employee details not available yet');
        return;
      }

      setLoading(true);

      const empId = employeeDetails?.id || employeeId;
      const empChildCompanyId = employeeDetails?.childCompanyId || childCompanyId;
      const empBranchId = employeeDetails?.branchId || branchId;
      const empDepartmentId = employeeDetails?.departmentId || 0;
      const empDesignationId = employeeDetails?.designtionId || 0;
      const empEmployeeType = employeeDetails?.employeeType || 0;

      const endpoint = `${BASE_URL}/BiomatricAttendance/GetCalendorForSingleEmployee`;

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
        YearList: null,
        BranchName: null,
        Did: 0,
        UserId: 0,
        status: null,
        Ids: null,
        CoverLatter: null,
      };

      const response = await axiosInstance.post(endpoint, requestData);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // When month or employee details change, refetch attendance
  useEffect(() => {
    if (employeeDetails || employeeId) fetchAttendanceData();
  }, [currentMonth, employeeDetails, employeeId]);

  // Recompute daysInMonth when currentMonth changes
  useEffect(() => {
    const start = currentMonth.clone().startOf('month');
    const end = currentMonth.clone().endOf('month');
    const days = [];
    for (let m = start.clone(); m.isSameOrBefore(end, 'day'); m.add(1, 'day')) {
      days.push({ key: m.format('YYYY-MM-DD'), date: m.clone() });
    }
    setDaysInMonth(days);

    // If selectedDate is not in current month, reset it
    if (!moment(selectedDate).isSame(currentMonth, 'month')) {
      const firstOfMonth = currentMonth.format('YYYY-MM-DD');
      setSelectedDate(firstOfMonth);
      onDateChange(firstOfMonth);
    }
  }, [currentMonth]);

  // Helper to convert day number to object key text used by API response
  const getDayText = day => {
    const texts = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
      'eighteen', 'nineteen', 'twenty', 'twentyOne', 'twentyTwo', 'twentyThree',
      'twentyFour', 'twentyFive', 'twentySix', 'twentySeven', 'twentyEight',
      'twentyNine', 'thirty', 'thirtyOne',
    ];
    return texts[day] || '';
  };

  // Normalize leaveName from API to internal keys: 'week-off' | 'holiday' | other lowercase.
  const normalizeLeaveName = raw => {
    if (!raw) return 'holiday';
    const r = String(raw).trim().toLowerCase();
    if (r === 'week-off' || r === 'week off' || r === 'weekoff') return 'week-off';
    if (r === 'holiday') return 'holiday';
    if (r.includes('national')) return 'national holiday';
    // fallback to lowercased name
    return r.replace(/\s+/g, ' ');
  };

  // Compute month events from attendanceData (memoized)
  const monthEvents = useMemo(() => {
    const events = {};
    if (!attendanceData || !attendanceData.calendarModels || !attendanceData.calendarModels[0]) return events;

    const attendance = attendanceData.calendarModels[0]; // single employee model
    const holidays = attendanceData.holidays || [];

    const start = currentMonth.clone().startOf('month');
    const end = currentMonth.clone().endOf('month');

    for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, 'day')) {
      const dateStr = date.format('YYYY-MM-DD');
      const dayOfMonth = parseInt(date.format('D'), 10);
      const evts = [];

      // weekend detection (Sat/Sun) -> mark week-off
      const isWeekend = date.day() === 0 || date.day() === 7;
      if (isWeekend) {
        evts.push({
          id: `week-off-${dateStr}`,
          type: 'week-off',
          name: 'Week Off',
          color: leaveColors['week-off'].color,
          icon: leaveColors['week-off'].icon,
        });
        events[dateStr] = evts;
        continue;
      }

      // API holidays array uses 'day' to indicate day-of-month in your example
      const holidayObj = holidays.find(h => Number(h.day) === dayOfMonth);
      if (holidayObj) {
        const normalized = normalizeLeaveName(holidayObj.leaveName);
        const leaveStyle = leaveColors[normalized] || leaveColors['holiday'];

        evts.push({
          id: `${normalized}-${dateStr}`,
          type: normalized,
          name: holidayObj.leaveName || leaveStyle.label || 'Holiday',
          color: leaveStyle.color,
          icon: leaveStyle.icon,
        });
        events[dateStr] = evts;
        continue;
      }

      // Attendance keys in API use "oneLogIn", "oneLogOut", "twoLogIn", ... so build keys
      const loginKey = `${getDayText(dayOfMonth)}LogIn`;
      const logoutKey = `${getDayText(dayOfMonth)}LogOut`;

      // If both login & logout present -> present
      if (attendance[loginKey] && attendance[logoutKey]) {
        evts.push({
          id: `present-${dateStr}`,
          type: 'present',
          name: 'Present',
          time: `${attendance[loginKey]} - ${attendance[logoutKey]}`,
        });
      } else {
        // If not holiday/weekend and no login/logout -> absent
        evts.push({
          id: `absent-${dateStr}`,
          type: 'absent',
          name: 'Absent',
        });
      }

      events[dateStr] = evts;
    }

    return events;
  }, [attendanceData, currentMonth]);

  // Derived agenda for the selected date
  const agendaItems = monthEvents[selectedDate] || [];

  // Helpers to change month
  const goMonth = dir => {
    setCurrentMonth(cm => cm.clone().add(dir === 'prev' ? -1 : 1, 'month'));
  };

  // Year picker handler
  const pickYear = y => {
    setPickerYear(y);
    setCurrentMonth(cm => cm.clone().year(y));
    setShowPicker(false);
  };

  // When daysInMonth changes, try to scroll FlatList to today's date index safely
  useEffect(() => {
    if (!daysInMonth || daysInMonth.length === 0 || !daysListRef.current) return;
    const todayKey = moment().format('YYYY-MM-DD');
    const idx = daysInMonth.findIndex(d => d.key === todayKey);
    if (idx >= 0 && daysListRef.current?.scrollToIndex) {
      // Wrap in timeout to ensure FlatList layout measured
      setTimeout(() => {
        try {
          daysListRef.current.scrollToIndex({ index: idx, animated: false, viewPosition: 0.5 });
        } catch (err) {
          // ignore if out-of-range
        }
      }, 50);
    }
  }, [daysInMonth]);

  // Render a single day card in the horizontal month strip
  const renderDay = ({ item }) => {
    const isSelected = item.key === selectedDate;
    // Use monthEvents (computed) rather than undefined 'events'
    const evts = monthEvents[item.key] || [];
    const dayName = item.date.format('ddd'); // Mon, Tue
    const dateNumber = item.date.format('D'); // 6, 7
    const isAbsent = evts.some(e => e.type === 'absent');
    const isPresent = evts.some(e => e.type === 'present');
    const isWeekOff = evts.some(e => e.type === 'week-off');
    const isHoliday = evts.some(e => e.type === 'holiday');

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDate(item.key);
          onDateChange(item.key);
        }}
        style={[
          styles.dayCard,
          isHoliday && styles.holidayCard,
          isAbsent && styles.absentCard,
          isPresent && styles.presentCard,
          isWeekOff && styles.weekOffCard,
          isSelected && styles.dayCardSelected,
        ]}
      >
        <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{dayName}</Text>
        <Text style={[styles.dateLabel, isSelected && styles.dayLabelSelected]}>{dateNumber}</Text>

        {/* show up to 2 small status items (icon + short text) */}
        {evts.slice(0, 2).map(e => {
          // compute safe icon and color
          const iconName =
            e?.icon ||
            eventTypes[e.type]?.icon ||
            (e.type === 'holiday' ? 'celebration' : e.type === 'week-off' ? 'weekend' : 'event');
          const iconColor = e?.color || eventTypes[e.type]?.color || '#777';
          return (
            <View key={e.id} style={styles.dotRow}>
              {/* <MaterialIcons name={iconName} size={12} color={iconColor} style={{ marginRight: 6 }} /> */}

              {/* Short label for small day tile */}
              {/* {e.type === 'week-off' && <Text style={[styles.statusText, { color: leaveColors['week-off'].color }]}>WO</Text>} */}

              {e.type === 'holiday' && (
                <Text style={[styles.statusText, { color: e.color || eventTypes['holiday']?.color }]}>
                  {e.name ? (String(e.name).length > 8 ? String(e.name).slice(0, 8) + '...' : e.name) : 'Holiday'}
                </Text>
              )}

              {/* {e.type === 'present' && (
                <Text style={[styles.statusText, { color: eventTypes['present'].color }]}>P</Text>
              )} */}

              {/* {e.type === 'absent' && (
                <Text style={[styles.statusText, {
                  color: eventTypes['absent'].color,
                  backgroundColor: '#FFEBEE',
                 
                }]}>A</Text>
              )} */}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goMonth('prev')}>
          <MaterialIcons name="chevron-left" size={28} color="#3F51B5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowPicker(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.title}>{currentMonth.format('MMMM YYYY')}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#3F51B5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => goMonth('next')}>
          <MaterialIcons name="chevron-right" size={28} color="#3F51B5" />
        </TouchableOpacity>
      </View>

      {/* Horizontal month days */}
      <FlatList
        ref={daysListRef}
        data={daysInMonth}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={d => d.key}
        renderItem={renderDay}
        contentContainerStyle={styles.daysContainer}
        initialNumToRender={31}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH + 8,
          offset: (CARD_WIDTH + 8) * index,
          index,
        })}
      />

      {/* Agenda (selected date details) */}
      <View style={styles.agenda}>
        <Text style={styles.agendaHeader}>{moment(selectedDate).format('dddd, MMMM D')}</Text>

        {agendaItems.length === 0 ? (
          <View style={styles.emptyAgenda}>
            <MaterialIcons name="event-busy" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No events</Text>
          </View>
        ) : (
          agendaItems.map(evt => {
            // Safe icon fallback for agenda card
            const iconName = evt?.icon || eventTypes[evt.type]?.icon || (evt.type === 'holiday' ? 'celebration' : evt.type === 'week-off' ? 'weekend' : 'event');
            const iconColor = evt?.color || eventTypes[evt.type]?.color || '#777';
            // split time safely
            const times = evt.time ? String(evt.time).split(' - ') : [];
            return (
              <View
                key={evt.id}
                style={[
                  styles.eventCard,
                  evt.type === 'absent' && { backgroundColor: '#FFEBEE', borderLeftColor: '#FF0000' },
                  (evt.type === 'holiday' || evt.type === 'week-off') && { backgroundColor: evt.color ? `${evt.color}33` : '#fff3e0', borderLeftColor: evt.color || '#FF9800' },
                  evt.type === 'present' && { borderLeftColor: '#666666' },
                ]}
              >
                <View style={styles.dotRow}>
                  <MaterialIcons name={iconName} size={16} color={iconColor} />
                  <Text style={[styles.eventTitle, { color: evt.color || '#333' }]}>{evt.name || (leaveColors[evt.type]?.label || evt.type)}</Text>
                </View>

                {/* Show login/logout times, if present */}
                {times.length >= 2 && (
                  <View style={styles.timeDetails}>
                    <Text style={styles.timeLabel}>Login: </Text>
                    <Text style={styles.timeValue}>{times[0]}</Text>
                    <Text style={styles.timeLabel}> Logout: </Text>
                    <Text style={styles.timeValue}>{times[1]}</Text>
                  </View>
                )}

                {/* Optional extra details */}
                {evt.location && <Text style={styles.eventDetail}>{evt.location}</Text>}
              </View>
            );
          })
        )}
      </View>

      {/* Year Picker Modal */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

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
  title: { fontSize: 18, fontWeight: '600', color: '#3F51B5', marginRight: 6 },

  daysContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    elevation: 2,
  },

  dayCard: {
    width: CARD_WIDTH + 10,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  dayCardSelected: {
    backgroundColor: '#77d6f9',
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  holidayCard: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  weekOffCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#3bba46',
    borderWidth: 1,
  },
  absentCard: {
    backgroundColor: '#f9f9f9ff',
    borderColor: '#fcfcfcff',
    borderWidth: 1,
  },
  presentCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },

  dayLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  dateLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  dayLabelSelected: { color: '#FFF' },

  dotRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  statusText: { marginLeft: 4, fontSize: 12, fontWeight: 'bold' },

  timeText: { marginLeft: 4, fontSize: 10, color: '#666' },

  agenda: { flex: 1, padding: 12 },
  agendaHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1F2937' },

  emptyAgenda: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 16,
    padding: 32,
  },
  emptyText: { color: '#CCC', marginTop: 8, fontSize: 14 },

  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#666666',
  },

  eventTitle: { marginLeft: 8, fontSize: 15, fontWeight: '600' },
  eventDetail: { fontSize: 13, color: '#666' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  pickerContainer: { width: width * 0.8, padding: 20, backgroundColor: '#FFF', borderRadius: 12 },
  pickerTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  closePicker: { marginTop: 16, alignSelf: 'center' },
  closeText: { color: '#3F51B5', fontSize: 16, fontWeight: '600' },

  timeDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', backgroundColor: '#F8F9FA', padding: 8, borderRadius: 8 },
  timeLabel: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  timeValue: { fontSize: 13, color: '#1F2937', marginRight: 12, fontWeight: '500' },
});
