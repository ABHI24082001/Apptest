// components/ShiftCalendar.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, eachDayOfInterval } from 'date-fns';

const ShiftCalendar = ({ onSelectDate }) => {
  // Configuration
  const currentYear = 2025;
  const currentMonth = 4; // April
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0);
  
  // Generate shift pattern: 7 days General, 7 days Night, then repeat
  const generateShiftPattern = () => {
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const shiftPattern = [];
    
    daysInMonth.forEach((day, index) => {
      // Every Sunday is off
      if (day.getDay() === 0) {
        shiftPattern.push({ date: day, shift: 'Off' });
        return;
      }
      
      // April 19th is a holiday
      if (day.getDate() === 19 && day.getMonth() + 1 === 4) {
        shiftPattern.push({ date: day, shift: 'Holiday' });
        return;
      }
      
      // Calculate which 7-day block we're in
      const block = Math.floor(index / 7) % 2; // Alternates between 0 and 1
      shiftPattern.push({ 
        date: day, 
        shift: block === 0 ? 'General' : 'Night' 
      });
    });
    
    return shiftPattern;
  };

  const shiftSchedule = useMemo(() => {
    const pattern = generateShiftPattern();
    const schedule = {};
    
    pattern.forEach(({ date, shift }) => {
      const dateString = format(date, 'yyyy-MM-dd');
      schedule[dateString] = shift;
    });
    
    return schedule;
  }, []);

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'General': return '#90caf9'; // Light blue
      case 'Night': return '#b39ddb'; // Light purple
      case 'Off': return '#a5d6a7'; // Light green
      case 'Holiday': return '#ffab91'; // Light orange
      default: return '#e0e0e0'; // Light gray
    }
  };

  const getMarkedDates = (selectedDate) => {
    const marked = {};
    
    Object.entries(shiftSchedule).forEach(([date, shift]) => {
      marked[date] = {
        customStyles: {
          container: {
            backgroundColor: getShiftColor(shift),
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          },
          text: {
            color: '#000',
            fontWeight: 'bold',
          },
        }
      };
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: '#2196f3',
        selectedTextColor: '#fff',
      };
    }

    return marked;
  };

  const handleDayPress = (day) => {
    const shift = shiftSchedule[day.dateString] || 'General';
    onSelectDate(day.dateString, shift);
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={format(startDate, 'yyyy-MM-dd')}
        markingType={'custom'}
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        theme={{
          calendarBackground: '#fff',
          textSectionTitleColor: '#333',
          todayTextColor: '#2196f3',
          dayTextColor: '#333',
          selectedDayBackgroundColor: '#2196f3',
          selectedDayTextColor: '#fff',
          monthTextColor: '#333',
          arrowColor: '#2196f3',
        }}
        style={styles.calendar}
        hideExtraDays={false}
        firstDay={1} // Start week on Monday
      />
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#90caf9' }]} />
          <Text style={styles.legendText}>General Shift</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#b39ddb' }]} />
          <Text style={styles.legendText}>Night Shift</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#a5d6a7' }]} />
          <Text style={styles.legendText}>Week Off</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ffab91' }]} />
          <Text style={styles.legendText}>Holiday</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
  },
  calendar: {
    borderRadius: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
});

export default ShiftCalendar;