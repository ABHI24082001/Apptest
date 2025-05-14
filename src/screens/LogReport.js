import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Card , Appbar} from 'react-native-paper';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AppSafeArea from '../component/AppSafeArea';
import EmployeeInfoCard from '../component/EmployeeInfoCard';
import MonthNavigation from '../component/MonthNavigation';
import DayDetails from '../component/DayDetails';

const LogReport = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(moment());

  const attendanceData = {
    'AA_16': {
      employee: {
        code: 'AA_16',
        name: 'Lane Mcintyre',
        type: 'Apprentice',
        department: 'HR',
        designation: 'HR Executive',
      },
      attendance: {
        '2025-04': {
          '01': { login: '10:00:00', logout: '19:30:00' },
          '02': { login: '10:00:00', logout: '19:30:00' },
          '06': 'Week-Off',
          '13': 'Week-Off',
          '22': 'Week-Off',
        }
      }
    }
  };

  const employee = attendanceData['AA_16'];
  const monthKey = currentMonth.format('YYYY-MM');
  const monthAttendance = employee.attendance[monthKey] || {};

  const handleDateChange = (date) => setSelectedDate(date);

  const changeMonth = (direction) => {
    const newMonth = direction === 'prev'
      ? currentMonth.clone().subtract(1, 'month')
      : currentMonth.clone().add(1, 'month');

    setCurrentMonth(newMonth);
    setSelectedDate(newMonth.clone().startOf('month'));
  };

  const selectedDayData = monthAttendance[selectedDate.format('DD')];

  const HorizontalCalendar = ({ selectedDate, onDateChange, currentMonth }) => {
    const daysInMonth = Array.from(
      { length: currentMonth.daysInMonth() },
      (_, i) => currentMonth.clone().startOf('month').add(i, 'days')
    );

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContainer}
      >
        {daysInMonth.map((date) => {
          const isSelected = date.isSame(selectedDate, 'day');
          const isToday = date.isSame(moment(), 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;

          const scale = useSharedValue(isSelected ? 1.1 : 1);
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          const handlePress = () => {
            scale.value = withSpring(1.1, { damping: 12 });
            onDateChange(date);
          };

          return (
            <TouchableOpacity
              key={date.format('DD-MM-YYYY')}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedDay,
                  isToday && !isSelected && styles.todayDay,
                  isWeekend && styles.weekendDay,
                  animatedStyle,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText,
                    isWeekend && styles.weekendText,
                  ]}
                >
                  {date.format('D')}
                </Text>
                <Text
                  style={[
                    styles.weekDayText,
                    isSelected && styles.selectedDayText,
                    isWeekend && styles.weekendText,
                  ]}
                >
                  {date.format('ddd')}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
   
    <AppSafeArea>

<Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Log Report" titleStyle={styles.headerTitle} />
      </Appbar.Header>
       <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <EmployeeInfoCard employee={employee.employee} />
            <MonthNavigation currentMonth={currentMonth} onChange={changeMonth} />
            <HorizontalCalendar
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              currentMonth={currentMonth}
            />
            <View style={styles.divider} />
            <DayDetails date={selectedDate} data={selectedDayData} />
          </Card.Content>
        </Card>
      </ScrollView>

    </AppSafeArea>

     
   
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 16 },
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  calendarContainer: {
    marginVertical: 16,
    paddingBottom: 10,
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 50,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weekDayText: {
    fontSize: 12,
    color: '#888',
  },
  selectedDay: {
    backgroundColor: '#3F51B5',
  },
  selectedDayText: {
    color: '#fff',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#FF6347',
  },
  todayText: {
    color: '#FF6347',
  },
  weekendDay: {
    opacity: 0.6,
  },
  weekendText: {
    color: '#FF6347',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
});

export default LogReport;
