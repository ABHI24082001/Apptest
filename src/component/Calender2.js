import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';
import moment from 'moment';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [showAgenda, setShowAgenda] = useState(false);

  // Sample data for holidays and shifts
  const holidays = {
    '2023-12-25': { name: 'Christmas Day' },
    '2024-01-01': { name: 'New Year' },
  };

  const userShifts = {
    '2023-12-20': { shift: 'Night', reason: 'Regular shift' },
    '2023-12-21': { shift: 'Day', reason: 'Regular shift' },
    '2023-12-22': { shift: 'Day', reason: 'Regular shift' },
    '2023-12-23': { shift: 'Leave', reason: 'Personal leave' },
  };

  // Generate marked dates
  const getMarkedDates = () => {
    let markedDates = {};
    
    // Mark today
    markedDates[moment().format('YYYY-MM-DD')] = { marked: true, dotColor: 'blue' };
    
    // Mark selected date
    markedDates[selectedDate] = { selected: true, selectedColor: '#4285F4' };
    
    // Mark holidays
    Object.keys(holidays).forEach(date => {
      markedDates[date] = {
        ...markedDates[date],
        marked: true,
        dotColor: 'red',
        holiday: true,
      };
    });
    
    // Mark shifts
    Object.keys(userShifts).forEach(date => {
      markedDates[date] = {
        ...markedDates[date],
        marked: true,
        dotColor: userShifts[date].shift === 'Leave' ? 'orange' : 'green',
        shift: userShifts[date],
      };
    });
    
    return markedDates;
  };

  // Load agenda items
  const loadItems = (day) => {
    const items = {};
    
    // Generate 7 days around the selected date
    for (let i = -3; i < 4; i++) {
      const date = moment(day.timestamp).add(i, 'days').format('YYYY-MM-DD');
      
      items[date] = [];
      
      // Add holiday info if exists
      if (holidays[date]) {
        items[date].push({
          name: `Holiday: ${holidays[date].name}`,
          height: 50,
          day: date,
          type: 'holiday',
        });
      }
      
      // Add shift info if exists
      if (userShifts[date]) {
        items[date].push({
          name: `Shift: ${userShifts[date].shift}`,
          details: userShifts[date].reason,
          height: 50,
          day: date,
          type: 'shift',
        });
      }
      
      // Add empty item if no data
      if (items[date].length === 0) {
        items[date].push({
          name: 'No events',
          height: 50,
          day: date,
          type: 'empty',
        });
      }
    }
    
    return items;
  };

  const renderItem = (item) => {
    let backgroundColor = '#fff';
    let textColor = '#000';
    
    if (item.type === 'holiday') {
      backgroundColor = '#FFEBEE';
      textColor = '#D32F2F';
    } else if (item.type === 'shift') {
      backgroundColor = item.name.includes('Leave') ? '#FFF3E0' : '#E8F5E9';
      textColor = item.name.includes('Leave') ? '#E65100' : '#2E7D32';
    }
    
    return (
      <TouchableOpacity 
        style={[styles.item, { backgroundColor }]}
      >
        <Text style={[styles.itemText, { color: textColor }]}>{item.name}</Text>
        {item.details && (
          <Text style={[styles.itemDetails, { color: textColor }]}>{item.details}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Week Calendar */}
      <Calendar
        current={selectedDate}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setShowAgenda(true);
        }}
        markedDates={getMarkedDates()}
        hideExtraDays
        theme={{
          'stylesheet.calendar.header': {
            week: {
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }
          }
        }}
        style={styles.calendar}
        horizontal
        pagingEnabled
        hideArrows={false}
        disableMonthChange
        enableSwipeMonths
      />
      
      {/* Agenda View */}
      {showAgenda && (
        <Agenda
          items={loadItems({ timestamp: Date.parse(selectedDate) })}
          selected={selectedDate}
          renderItem={renderItem}
          renderEmptyDate={() => (
            <View style={styles.emptyDate}>
              <Text>No events</Text>
            </View>
          )}
          rowHasChanged={(r1, r2) => r1.name !== r2.name}
          pastScrollRange={3}
          futureScrollRange={3}
          theme={{
            agendaDayTextColor: '#4285F4',
            agendaDayNumColor: '#4285F4',
            agendaTodayColor: 'red',
            agendaKnobColor: '#4285F4',
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    marginTop: 5,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});

export default CalendarScreen;