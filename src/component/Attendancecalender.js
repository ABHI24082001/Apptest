import React, {useEffect, useMemo, useRef, useState, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../constants/apiConfig';
import axiosInstance from '../utils/axiosInstance';
import useFetchEmployeeDetails from './FetchEmployeeDetails';
const {width} = Dimensions.get('window');
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
  const [selectedDate, setSelectedDate] = useState(
    moment(initialDate).format('YYYY-MM-DD'),
  );
  const [attendanceData, setAttendanceData] = useState(null);
  const [shiftData, setShiftData] = useState({});
  const [loading, setLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const employeeDetails = useFetchEmployeeDetails();
  const daysListRef = useRef(null);

  // Event type defaults (used for color/icon fallbacks)
  const eventTypes = {
    present: {color: '#666666', icon: 'check', status: 'P'},
    absent: {color: '#aeaeaeff', icon: 'close', status: 'A'},
    holiday: {color: '#a80000ff', icon: 'celebration', status: 'H'},
  };

  // Leave/holiday mapping — normalized icons + colors. Keep keys as internal types.
  const leaveColors = {
    'week-off': {color: '#3bba46', icon: 'weekend', label: 'Week Off'},
    holiday: {color: '#FF9800', icon: 'celebration', label: 'Holiday'},
    'national holiday': {
      color: '#ffab40',
      icon: 'flag',
      label: 'National Holiday',
    },
    'casual leave': {
      color: '#a5d6a7',
      icon: 'beach-access',
      label: 'Casual Leave',
    },
  };

  // Optimized fetchAttendanceData
  const fetchAttendanceData = useCallback(async () => {
    if (!employeeDetails && !employeeId) return;

    setLoading(true);
    try {
      const empId = employeeDetails?.id || employeeId;
      const requestData = {
        EmployeeId: empId,
        Month: currentMonth.month() + 1,
        Year: currentMonth.year(),
        ChildCompanyId: employeeDetails?.childCompanyId || childCompanyId,
        BranchId: employeeDetails?.branchId || branchId,
        FromDate: currentMonth.startOf('month').format('YYYY-MM-DDT00:00:00'),
        ToDate: currentMonth.endOf('month').format('YYYY-MM-DDT00:00:00'),
      };

      console.log('Request Data:', requestData);

      const [response, shiftResponse] = await Promise.all([
        axiosInstance.post(
          `${BASE_URL}/BiomatricAttendance/GetCalendorForSingleEmployee`,
          requestData,
        ),
        axiosInstance.post(
          `${BASE_URL}/Shift/GetAttendanceDataForSingleEmployeebyshiftwiseForeachDay`,
          requestData,
        ),
      ]);

      console.log(
        '📅 Attendance data=============== fetched:',
        response.data,
        'shift data',
        shiftResponse,
      );
      console.log('📅 Shift data fetched:', shiftResponse.data);

      // Process shift data into a map keyed by date
      const shiftMap = {};

      // Process current month shift data
      shiftResponse.data.forEach(shift => {
        const date = moment(shift.date, 'DD MMM YYYY').format('YYYY-MM-DD');
        shiftMap[date] = {
          shiftName: shift.shiftName,
          shiftStartTime: moment(shift.shiftStartTime).format('HH:mm'),
          shiftEndTime: moment(shift.shiftEndTime).format('HH:mm'),
          halfDayStartTime: moment(shift.halfDayStartTime).format('HH:mm'),
          halfDayEndTime: moment(shift.halfDayEndTime).format('HH:mm'),
          loginTime: shift.loginTime,
          logoutTime: shift.logoutTime,
          holidayName: shift.holidayName,
          leaveName: shift.leaveName,
        };
      });

      setShiftData(shiftMap);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, employeeDetails, employeeId, childCompanyId, branchId]);

  useEffect(() => {
    if (employeeDetails || employeeId) fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Recompute daysInMonth when currentMonth changes
  // useEffect(() => {
  //   const start = currentMonth.clone().startOf('month');
  //   const end = currentMonth.clone().endOf('month');
  //   const days = [];
  //   for (let m = start.clone(); m.isSameOrBefore(end, 'day'); m.add(1, 'day')) {
  //     days.push({key: m.format('YYYY-MM-DD'), date: m.clone()});
  //   }
  //   setDaysInMonth(days);

  //   // If selectedDate is not in current month, reset it
  //   if (!moment(selectedDate).isSame(currentMonth, 'month')) {
  //     const firstOfMonth = currentMonth.format('YYYY-MM-DD');
  //     setSelectedDate(firstOfMonth);
  //     onDateChange(firstOfMonth);
  //   }
  // }, [currentMonth]);
  useEffect(() => {
    const start = currentMonth.clone().startOf('month');
    const end = currentMonth.clone().endOf('month');
    const days = [];
    for (let m = start.clone(); m.isSameOrBefore(end, 'day'); m.add(1, 'day')) {
      days.push({key: m.format('YYYY-MM-DD'), date: m.clone()});
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
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
      'twenty',
      'twentyOne',
      'twentyTwo',
      'twentyThree',
      'twentyFour',
      'twentyFive',
      'twentySix',
      'twentySeven',
      'twentyEight',
      'twentyNine',
      'thirty',
      'thirtyOne',
    ];
    return texts[day] || '';
  };

  // Normalize leaveName from API to internal keys: 'week-off' | 'holiday' | other lowercase.
  const normalizeLeaveName = raw => {
    if (!raw) return 'holiday';
    const r = String(raw).trim().toLowerCase();
    if (r === 'week-off' || r === 'week off' || r === 'weekoff')
      return 'week-off';
    if (r.includes('holiday')) return 'holiday';
    if (r.includes('national')) return 'national holiday';
    // fallback to lowercased name
    return r.replace(/\s+/g, ' ');
  };

  // Compute month events from attendanceData (memoized)
  // const monthEvents = useMemo(() => {
  //   const events = {};
  //   if (
  //     !attendanceData ||
  //     !attendanceData.calendarModels ||
  //     !attendanceData.calendarModels[0]
  //   )
  //     return events;

  //   const attendance = attendanceData.calendarModels[0]; // single employee model
  //   const holidays = attendanceData.holidays || [];

  //   const start = currentMonth.clone().startOf('month');
  //   const end = currentMonth.clone().endOf('month');

  //   for (
  //     let date = start.clone();
  //     date.isSameOrBefore(end);
  //     date.add(1, 'day')
  //   ) {
  //     const dateStr = date.format('YYYY-MM-DD');
  //     const dayOfMonth = parseInt(date.format('D'), 10);
  //     const evts = [];

  //     // weekend detection (Sat/Sun) -> mark week-off
  //     const isWeekend = date.day() === 0 || date.day() === 7;
  //     if (isWeekend) {
  //       evts.push({
  //         id: `week-off-${dateStr}`,
  //         type: 'week-off',
  //         name: 'Week Off',
  //         color: leaveColors['week-off'].color,
  //         icon: leaveColors['week-off'].icon,
  //       });
  //       events[dateStr] = evts;
  //       continue;
  //     }

  //     // API holidays array uses 'day' to indicate day-of-month in your example
  //     const holidayObj = holidays.find(h => Number(h.day) === dayOfMonth);
  //     if (holidayObj) {
  //       const normalized = normalizeLeaveName(holidayObj.leaveName);
  //       const leaveStyle = leaveColors[normalized] || leaveColors['holiday'];

  //       evts.push({
  //         id: `${normalized}-${dateStr}`,
  //         type: normalized,
  //         name: holidayObj.leaveName || leaveStyle.label || 'Holiday',
  //         color: leaveStyle.color,
  //         icon: leaveStyle.icon,
  //       });
  //       events[dateStr] = evts;
  //       continue;
  //     }

  //     // Attendance keys in API use "oneLogIn", "oneLogOut", "twoLogIn", ... so build keys
  //     const loginKey = `${getDayText(dayOfMonth)}LogIn`;
  //     const logoutKey = `${getDayText(dayOfMonth)}LogOut`;

  //     // If both login & logout present -> present
  //     if (attendance[loginKey] && attendance[logoutKey]) {
  //       evts.push({
  //         id: `present-${dateStr}`,
  //         type: 'present',
  //         name: 'Present',
  //         time: `${attendance[loginKey]} - ${attendance[logoutKey]}`,
  //       });
  //     } else {
  //       // If not holiday/weekend and no login/logout -> absent
  //       evts.push({
  //         id: `absent-${dateStr}`,
  //         type: 'absent',
  //         name: 'Absent',
  //       });
  //     }

  //     events[dateStr] = evts;
  //   }

  //   return events;
  // }, [attendanceData, currentMonth]);
  // const monthEvents = useMemo(() => {
  //   const events = {};
  //    const attendance = attendanceData?.calendarModels?.[0] || {}; // <--- define here
  //   const start = moment(currentMonth).startOf('month');
  //   const end = moment(currentMonth).endOf('month');

  //   for (
  //     let date = start.clone();
  //     date.isSameOrBefore(end);
  //     date.add(1, 'day')
  //   ) {
  //     const dateStr = date.format('YYYY-MM-DD');
  //     const evts = [];

  //     const loginKey = `login_${dateStr}`;
  //     const logoutKey = `logout_${dateStr}`;

  //     const dayShift = shiftData?.[dateStr];
  //     const isFuture = date.isAfter(moment(), 'day');
  //     const isPast = date.isBefore(moment(), 'day');

  //     /* ---------------- HOLIDAY ---------------- */
  //     if (dayShift?.holidayName) {
  //       evts.push({
  //         id: `holiday-${dateStr}`,
  //         type: 'holiday',
  //         name: dayShift.holidayName,
  //       });
  //     }

  //     /* ---------------- LEAVE ---------------- */
  //     if (dayShift?.leaveName) {
  //       evts.push({
  //         id: `leave-${dateStr}`,
  //         type: 'leave',
  //         name: dayShift.leaveName,
  //       });
  //     }

  //     /* ---------------- PRESENT ---------------- */
  //     if (attendance?.[loginKey] && attendance?.[logoutKey]) {
  //       evts.push({
  //         id: `present-${dateStr}`,
  //         type: 'present',
  //         name: 'Present',
  //         loginTime: attendance[loginKey],
  //         logoutTime: attendance[logoutKey],
  //       });
  //     }

  //     /* ---------------- FUTURE SHIFT ---------------- */
  //     else if (isFuture && dayShift) {
  //       evts.push({
  //         id: `shift-${dateStr}`,
  //         type: 'shift',
  //         name: 'Shift Scheduled',
  //         shiftName: dayShift.shiftName,
  //         shiftTime: `${dayShift.shiftStartTime} - ${dayShift.shiftEndTime}`,
  //       });
  //     }

  //     /* ---------------- ABSENT (PAST ONLY) ---------------- */
  //     else if (isPast && dayShift) {
  //       evts.push({
  //         id: `absent-${dateStr}`,
  //         type: 'absent',
  //         name: 'Absent',
  //       });
  //     }

  //     if (evts.length > 0) {
  //       events[dateStr] = evts;
  //     }
  //   }

  //   return events;
  // }, [currentMonth, shiftData, attendanceData]);

  const monthEvents = useMemo(() => {
    const events = {};
    const attendance = attendanceData?.calendarModels?.[0] || {}; // single employee attendance
    const holidays = attendanceData?.holidays || []; // holidays from API

    console.log(
      attendance,
      'attendanceData?.calendarModels?.[0====================================]',
    );
    const start = currentMonth.clone().startOf('month');

    console.log(start, 'month=======lllllfnfjajjjbjfbdbfobofdbobofbf');
    const end = currentMonth.clone().endOf('month');
    console.log(end, 'month=======lllllfnfjajjjbjfbdbfobofdbobofbf');

    for (let date = start.clone(); date.isSameOrBefore(end, 'day'); date.add(1, 'day')) {
      const dateStr = date.format('YYYY-MM-DD');
      const dayOfMonth = parseInt(date.format('D'), 10); // 1..31
      const evts = [];

      // shift info for the day
      const dayShift = shiftData?.[dateStr];
      const isFuture = date.isAfter(moment(), 'day');

      // Check for holidays from API
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

      /* ---------------- LEAVE ---------------- */
      if (dayShift?.leaveName) {
        evts.push({
          id: `leave-${dateStr}`,
          type: 'leave',
          name: dayShift.leaveName,
        });
        events[dateStr] = evts;
        continue;
      }

      /* ---------------- ATTENDANCE (PRESENT/ABSENT) ---------------- */
      const loginKey = `${getDayText(dayOfMonth)}LogIn`;
      const logoutKey = `${getDayText(dayOfMonth)}LogOut`;
      const loginTime = attendance[loginKey];
      const logoutTime = attendance[logoutKey];

      if (loginTime && logoutTime) {
        // Calculate working hours
        const checkIn = moment(loginTime, 'HH:mm:ss');
        const checkOut = moment(logoutTime, 'HH:mm:ss');
        const workingHours = moment.duration(checkOut.diff(checkIn)).asHours();

        // Calculate required hours from shift
        let requiredHours = 8; // default
        if (dayShift) {
          const shiftStart = moment(dayShift.shiftStartTime, 'HH:mm');
          const shiftEnd = moment(dayShift.shiftEndTime, 'HH:mm');
          requiredHours = moment.duration(shiftEnd.diff(shiftStart)).asHours();
        }

        // Determine if full day or half day (80% threshold)
        const completionPercentage = (workingHours / requiredHours) * 100;
        const isFullDay = completionPercentage >= 80;

        evts.push({
          id: `present-${dateStr}`,
          type: 'present',
          name: 'Present',
          loginTime: loginTime,
          logoutTime: logoutTime,
          workingHours: workingHours,
          requiredHours: requiredHours,
          workingType: isFullDay ? 'Full Day' : 'Half Day',
          time: `${loginTime} - ${logoutTime}`, // for backward compatibility
        });
      } else if (loginTime && !logoutTime) {
        // Only login, no logout - partial attendance
        evts.push({
          id: `partial-${dateStr}`,
          type: 'present',
          name: 'Partial',
          loginTime: loginTime,
          logoutTime: null,
          workingHours: 0,
          workingType: 'Incomplete',
          time: loginTime,
        });
      } else if (!isFuture) {
        // past day with no attendance → absent
        evts.push({
          id: `absent-${dateStr}`,
          type: 'absent',
          name: 'Absent',
        });
      } else if (isFuture && dayShift) {
        // future day with shift → upcoming shift
        evts.push({
          id: `shift-${dateStr}`,
          type: 'shift',
          name: 'Shift Scheduled',
          shiftName: dayShift.shiftName,
          shiftTime: `${dayShift.shiftStartTime} - ${dayShift.shiftEndTime}`,
        });
      }

      if (evts.length > 0) {
        events[dateStr] = evts;
      }
    }

    return events;
  }, [currentMonth, attendanceData, shiftData]);

  // Derived agenda for the selected date
  const agendaItems = monthEvents[selectedDate] || [];

  // console.log(agendaItems , )

  // Helpers to change month
  const goMonth = dir => {
    setCurrentMonth(cm => cm.clone().add(dir === 'prev' ? -1 : 1, 'month'));
  };

  // When daysInMonth changes, try to scroll FlatList to today's date index safely
  useEffect(() => {
    if (!daysInMonth || daysInMonth.length === 0 || !daysListRef.current)
      return;
    const todayKey = moment().format('YYYY-MM-DD');
    const idx = daysInMonth.findIndex(d => d.key === todayKey);
    if (idx >= 0 && daysListRef.current?.scrollToIndex) {
      // Wrap in timeout to ensure FlatList layout measured
      setTimeout(() => {
        try {
          daysListRef.current.scrollToIndex({
            index: idx,
            animated: false,
            viewPosition: 0.5,
          });
        } catch (err) {
          // ignore if out-of-range
        }
      }, 50);
    }
  }, [daysInMonth]);

  // Render a single day card in the horizontal month strip
  const renderDay = ({item}) => {
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
        ]}>
        <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
          {dayName}
        </Text>
        <Text style={[styles.dateLabel, isSelected && styles.dayLabelSelected]}>
          {dateNumber}
        </Text>

        {/* show up to 2 small status items (icon + short text) */}
        {evts.slice(0, 2).map(e => {
          // compute safe icon and color
          const iconName =
            e?.icon ||
            eventTypes[e.type]?.icon ||
            (e.type === 'holiday'
              ? 'celebration'
              : e.type === 'week-off'
              ? 'weekend'
              : 'event');
          const iconColor = e?.color || eventTypes[e.type]?.color || '#777';
          return (
            <View key={e.id} style={styles.dotRow}>
              {e.type === 'holiday' && (
                <Text
                  style={[
                    styles.statusText,
                    {color: e.color || eventTypes['holiday']?.color},
                  ]}>
                  {e.name
                    ? String(e.name).length > 8
                      ? String(e.name).slice(0, 8) + '...'
                      : e.name
                    : 'Holiday'}
                </Text>
              )}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  // Update month selection handler
  const handleDateSelect = date => {
    setSelectedDateTime(date);
    setCurrentMonth(moment(date));
    setDatePickerOpen(false);
  };

  // Header with DatePicker
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => goMonth('prev')}>
        <MaterialIcons name="chevron-left" size={28} color="#3F51B5" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setDatePickerOpen(true)}
        style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.title}>{currentMonth.format('MMMM YYYY')}</Text>
        <MaterialIcons name="arrow-drop-down" size={20} color="#3F51B5" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => goMonth('next')}>
        <MaterialIcons name="chevron-right" size={28} color="#3F51B5" />
      </TouchableOpacity>

      <DatePicker
        modal
        open={datePickerOpen}
        date={selectedDateTime}
        mode="date"
        onConfirm={handleDateSelect}
        onCancel={() => setDatePickerOpen(false)}
      />
    </View>
  );

  // Helper function to get shift name without +1 logic
  const getShiftNameDisplay = dayShift => {
    if (!dayShift) return 'General';

    // Handle case where shiftName is "--" or empty
    let shiftName = dayShift.shiftName;
    if (!shiftName || shiftName === '--' || shiftName.trim() === '') {
      shiftName = 'General';
    }

    return shiftName;
  };

  // Optimized event rendering
  const renderEvent = useCallback(
    ({item: evt, showDate = false}) => {
      const dateKey = showDate ? evt.date : selectedDate;
      const dayShift = shiftData[dateKey];

      // Use the calculated data from monthEvents
      const workingHours = evt.workingHours || 0;
      const requiredHours = evt.requiredHours || (dayShift ? (() => {
        const start = moment(dayShift.shiftStartTime, 'HH:mm');
        const end = moment(dayShift.shiftEndTime, 'HH:mm');
        return moment.duration(end.diff(start)).asHours();
      })() : 8);
      const workingType = evt.workingType || 'N/A';

      // Helper function to convert decimal hours to HH:MM format
      const formatHoursToHHMM = (decimalHours) => {
        if (!decimalHours || decimalHours <= 0) return '00:00';
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };

      // Helper function to format time from HH:mm:ss to HH:mm
      const formatTimeToHHMM = (timeString) => {
        if (!timeString) return '';
        return moment(timeString, 'HH:mm:ss').format('HH:mm');
      };

      // Helper function to determine which shift time to display
      const getShiftTimeDisplay = () => {
        if (!dayShift) return { startTime: 'N/A', endTime: 'N/A', isHalfDay: false };
        
        // Check if times are valid (not 00:00)
        const hasValidShiftTimes = dayShift.shiftStartTime && 
                                  dayShift.shiftEndTime && 
                                  dayShift.shiftStartTime !== '00:00' && 
                                  dayShift.shiftEndTime !== '00:00';
        
        const hasValidHalfDayTimes = dayShift.halfDayStartTime && 
                                    dayShift.halfDayEndTime && 
                                    dayShift.halfDayStartTime !== '00:00' && 
                                    dayShift.halfDayEndTime !== '00:00';
        
        if (hasValidHalfDayTimes) {
          return {
            startTime: dayShift.halfDayStartTime,
            endTime: dayShift.halfDayEndTime,
            isHalfDay: true
          };
        } else if (hasValidShiftTimes) {
          return {
            startTime: dayShift.shiftStartTime,
            endTime: dayShift.shiftEndTime,
            isHalfDay: false
          };
        } else {
          return { startTime: 'N/A', endTime: 'N/A', isHalfDay: false };
        }
      };

      const shiftTimeDisplay = getShiftTimeDisplay();

      return (
        <View key={evt.id} style={[styles.eventCard, evt.type === 'present' && styles.presentCard]}>
          {showDate && (
            <Text style={styles.dateHeader}>
              {moment(evt.date).format('DD MMM YYYY')}
            </Text>
          )}

          <View style={styles.statusRow}>
            <MaterialIcons
              name="radio-button-checked"
              size={16}
              color={evt.type === 'present' ? '#4CAF50' : '#FF5252'}
            />
            <Text style={styles.statusText}>
              {evt.name || leaveColors[evt.type]?.label || evt.type}
            </Text>
          </View>

          {dayShift && (
            <View style={styles.infoGrid}>
              {/* Note: Holiday or leave info */}
              {(dayShift.holidayName || dayShift.leaveName) && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="info" size={16} color="#FF9800" />
                  <Text style={styles.infoLabel}>Note</Text>
                  <Text style={styles.infoValue}>
                    {normalizeLeaveName(dayShift.leaveName) || dayShift.holidayName || 'N/A'}
                  </Text>
                </View>
              )}

              {/* Shift Name */}
              <View style={styles.infoRow}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={styles.infoLabel}>Shift</Text>
                <Text style={styles.infoValue}>
                  {getShiftNameDisplay(dayShift)}
                </Text>
              </View>

              {/* Shift Time */}
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={16} color="#666" />
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {shiftTimeDisplay.startTime} - {shiftTimeDisplay.endTime}
                  {shiftTimeDisplay.isHalfDay && (
                    <Text style={styles.halfDayIndicator}> (Half Day)</Text>
                  )}
                </Text>
              </View>

              {/* Check-In / Check-Out */}
              <View style={styles.infoRow}>
                <MaterialIcons name="login" size={16} color="#666" />
                <Text style={styles.infoLabel}>Check In-Out</Text>
                <Text style={styles.infoValue}>
                  {evt.loginTime && evt.logoutTime
                    ? `${formatTimeToHHMM(evt.loginTime)} - ${formatTimeToHHMM(evt.logoutTime)}`
                    : evt.loginTime 
                      ? `${formatTimeToHHMM(evt.loginTime)} - Pending`
                      : 'N/A'}
                </Text>
              </View>

              {/* Working Hours */}
              <View style={styles.infoRow}>
                <MaterialIcons name="timer" size={16} color="#666" />
                <Text style={styles.infoLabel}>Working</Text>
                <Text style={styles.infoValue}>
                  {formatHoursToHHMM(workingHours)} hrs
                </Text>
              </View>

              {/* Working Type */}
              <View style={styles.infoRow}>
                <MaterialIcons name="work" size={16} color="#666" />
                <Text style={styles.infoLabel}>Working Type</Text>
                <Text
                  style={[
                    styles.infoValue,
                    workingType === 'Full Day' ? styles.fullDayText : 
                    workingType === 'Half Day' ? styles.halfDayText : styles.infoValue,
                  ]}>
                  {workingType}
                </Text>
              </View>

              {/* Required Hours */}
              <View style={styles.infoRow}>
                <MaterialIcons name="timer" size={16} color="#666" />
                <Text style={styles.infoLabel}>Required</Text>
                <Text style={styles.infoValue}>
                  {formatHoursToHHMM(requiredHours)} hrs
                </Text>
              </View>
            </View>
          )}
        </View>
      );
    },
    [eventTypes, leaveColors, shiftData, selectedDate, getShiftNameDisplay],
  );

  // Combined agenda/list view
  const renderEvents = () => {
    const data =
      viewMode === 'list' ? getAllMonthEvents : monthEvents[selectedDate] || [];

    return (
      <View style={styles.eventsContainer}>
        {viewMode === 'calendar' && (
          <Text style={styles.agendaHeader}>
            {moment(selectedDate).format('dddd, MMMM D')}
          </Text>
        )}
        <FlatList
          data={data}
          renderItem={props =>
            renderEvent({...props, showDate: viewMode === 'list'})
          }
          keyExtractor={item => item.id}
          contentContainerStyle={styles.eventsListContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyAgenda}>
              <MaterialIcons name="event-busy" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {viewMode === 'calendar' ? 'No events' : 'No events this month'}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };

  // Add this function to get all month events as array
  const getAllMonthEvents = useMemo(() => {
    const allEvents = [];
    Object.entries(monthEvents).forEach(([date, events]) => {
      events.forEach(evt => {
        allEvents.push({
          ...evt,
          date,
        });
      });
    });
    return allEvents.sort((a, b) => moment(a.date).diff(moment(b.date)));
  }, [monthEvents]);

  console.log(
    'Selected Date:=====================',
    selectedDate,
    'Shift Exists:',
    shiftData[selectedDate],
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'calendar' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('calendar')}>
          <MaterialIcons
            name="calendar-today"
            size={20}
            color={viewMode === 'calendar' ? '#3F51B5' : '#666'}
          />
          <Text
            style={[
              styles.toggleText,
              viewMode === 'calendar' && styles.toggleTextActive,
            ]}>
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'list' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('list')}>
          <MaterialIcons
            name="list"
            size={20}
            color={viewMode === 'list' ? '#3F51B5' : '#666'}
          />
          <Text
            style={[
              styles.toggleText,
              viewMode === 'list' && styles.toggleTextActive,
            ]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'calendar' && (
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
      )}

      {renderEvents()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {fontSize: 18, fontWeight: '600', color: '#3F51B5', marginRight: 6},

  daysContainer: {
    paddingHorizontal: 18,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dayCardSelected: {
    backgroundColor: '#77d6f9',
    shadowColor: '#3F51B5',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  holidayCard: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF9800',
    borderWidth: 1,
    shadowColor: '#FF9800',
  },
  weekOffCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#3bba46',
    borderWidth: 1,
    shadowColor: '#3bba46',
  },
  absentCard: {
    backgroundColor: '#ffebee',
    borderColor: '#ff5252',
    borderWidth: 1,
    shadowColor: '#ff5252',
  },
  presentCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#6c6c6cff',
    borderWidth: 1,
    shadowColor: '#a0a0a0ff',
  },

  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#FFF',
    fontWeight: '700',
  },

  dotRow: {marginTop: 6, flexDirection: 'row', alignItems: 'center'},
  statusText: {marginLeft: 4, fontSize: 12, fontWeight: 'bold'},

  timeText: {marginLeft: 4, fontSize: 10, color: '#666'},

  agenda: {
    flex: 1,
    padding: 12,
  },
  agendaHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
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
  emptyText: {color: '#CCC', marginTop: 8, fontSize: 14},
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
  },

  dateHeader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  infoGrid: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  infoLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    width: 100,
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },

  presentCard: {
    borderLeftColor: '#4CAF50',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: width * 0.8,
    maxHeight: 350, // Adjusted height to show more years but not too tall
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  yearHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  yearListContent: {
    paddingVertical: 8,
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  yearItemSelected: {
    backgroundColor: '#3F51B5',
  },
  yearText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  yearTextSelected: {
    color: '#FFF',
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
  timeLabel: {fontSize: 13, color: '#4B5563', fontWeight: '600'},
  timeValue: {
    fontSize: 13,
    color: '#1F2937',
    marginRight: 12,
    fontWeight: '500',
  },

  viewToggle: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#E8EAF6',
  },
  toggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#3F51B5',
    fontWeight: '600',
  },
  eventsListContainer: {
    padding: 12,
    flexGrow: 1,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  eventsContainer: {
    flex: 1,
    padding: 12,
  },
  fullDayText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  halfDayText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  halfDayIndicator: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
