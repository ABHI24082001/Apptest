import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import moment from 'moment';

const WeekCalendarWithAgenda = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [weekDays, setWeekDays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState({});

  // Sample events data - in a real app, this would come from your API or database
  const sampleEvents = {
    '2025-05-01': [
      { type: 'holiday', name: 'Labor Day', id: '1' },
    ],
    '2025-05-03': [
      { type: 'dayOff', name: 'Day Off', id: '2' },
    ],
    '2025-05-04': [
      { type: 'shift', name: 'Night Shift', time: '22:00 - 06:00', id: '3' },
    ],
    '2025-05-05': [
      { type: 'shift', name: 'Day Shift', time: '09:00 - 17:00', id: '4' },
    ],
    '2025-05-07': [
      { type: 'leave', name: 'Annual Leave', id: '5' },
    ],
  };

  // Generate dates for the current week
  const generateWeekDays = (date) => {
    const startOfWeek = moment(date).startOf('week');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, 'days');
      days.push({
        dateString: day.format('YYYY-MM-DD'),
        day: day.format('ddd'),
        date: day.format('D'),
      });
    }
    
    return days;
  };

  // Initialize week days on component mount
  useEffect(() => {
    const days = generateWeekDays(selectedDate);
    setWeekDays(days);
    
    // Initialize marked dates
    const marked = {};
    days.forEach(day => {
      marked[day.dateString] = {
        selected: day.dateString === selectedDate,
        marked: sampleEvents[day.dateString] ? true : false,
        dotColor: 'blue',
      };
    });
    
    setMarkedDates(marked);
    setEvents(sampleEvents);
  }, []);

  // Handle date selection
  const handleDateSelect = (date) => {
    const updatedMarkedDates = { ...markedDates };
    
    // Reset previously selected date
    if (markedDates[selectedDate]) {
      updatedMarkedDates[selectedDate] = {
        ...updatedMarkedDates[selectedDate],
        selected: false,
      };
    }
    
    // Mark new date as selected
    updatedMarkedDates[date] = {
      ...updatedMarkedDates[date],
      selected: true,
    };
    
    setSelectedDate(date);
    setMarkedDates(updatedMarkedDates);
  };

  // Navigate to previous week
  const goToPrevWeek = () => {
    const prevWeekDate = moment(weekDays[0].dateString).subtract(7, 'days').format('YYYY-MM-DD');
    const days = generateWeekDays(prevWeekDate);
    setWeekDays(days);
    
    // Update marked dates for the new week
    const marked = {};
    days.forEach(day => {
      marked[day.dateString] = {
        selected: day.dateString === selectedDate,
        marked: sampleEvents[day.dateString] ? true : false,
        dotColor: 'blue',
      };
    });
    
    setMarkedDates(marked);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeekDate = moment(weekDays[6].dateString).add(1, 'days').format('YYYY-MM-DD');
    const days = generateWeekDays(nextWeekDate);
    setWeekDays(days);
    
    // Update marked dates for the new week
    const marked = {};
    days.forEach(day => {
      marked[day.dateString] = {
        selected: day.dateString === selectedDate,
        marked: sampleEvents[day.dateString] ? true : false,
        dotColor: 'blue',
      };
    });
    
    setMarkedDates(marked);
  };

  // Render agenda item based on type
  const renderAgendaItem = (item) => {
    let backgroundColor = '#fff';
    let borderColor = '#ddd';
    
    switch(item.type) {
      case 'holiday':
        backgroundColor = '#ffebee';
        borderColor = '#ef5350';
        break;
      case 'dayOff':
        backgroundColor = '#e3f2fd';
        borderColor = '#42a5f5';
        break;
      case 'shift':
        backgroundColor = '#e8f5e9';
        borderColor = '#66bb6a';
        break;
      case 'leave':
        backgroundColor = '#fff8e1';
        borderColor = '#ffca28';
        break;
      default:
        break;
    }
    
    return (
      <View style={[styles.eventItem, { backgroundColor, borderColor }]}>
        <Text style={styles.eventTitle}>{item.name}</Text>
        {item.time && <Text style={styles.eventTime}>{item.time}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Week Navigation Header */}
      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={goToPrevWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {moment(weekDays[0]?.dateString).format('MMMM YYYY')}
        </Text>
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Week Day Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.weekScroll}
      >
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.dateString}
            style={[
              styles.dayContainer,
              selectedDate === day.dateString && styles.selectedDay
            ]}
            onPress={() => handleDateSelect(day.dateString)}
          >
            <Text style={[
              styles.dayText,
              selectedDate === day.dateString && styles.selectedDayText
            ]}>
              {day.day}
            </Text>
            <Text style={[
              styles.dateText,
              selectedDate === day.dateString && styles.selectedDayText
            ]}>
              {day.date}
            </Text>
            {sampleEvents[day.dateString] && (
              <View style={styles.eventDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Agenda View */}
      <View style={styles.agendaContainer}>
        <Text style={styles.agendaHeader}>
          Agenda for {moment(selectedDate).format('MMMM D, YYYY')}
        </Text>
        
        {events[selectedDate] ? (
          <ScrollView style={styles.eventsList}>
            {events[selectedDate].map((event) => (
              <View key={event.id}>
                {renderAgendaItem(event)}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events scheduled</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekScroll: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayContainer: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedDay: {
    backgroundColor: '#2196f3',
  },
  dayText: {
    fontSize: 12,
    color: '#757575',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  selectedDayText: {
    color: '#fff',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f44336',
    marginTop: 5,
  },
  agendaContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  agendaHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
  },  
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  noEventsText: {
    fontSize: 16,
    color: '#9e9e9e',
  },
});

export default WeekCalendarWithAgenda;