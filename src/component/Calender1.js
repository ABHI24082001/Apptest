import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Calendar, Agenda} from 'react-native-calendars';
import {useTheme} from 'react-native-paper'; // For styling

const Calendar1 = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState('');
  const [items, setItems] = useState({});
  const {colors} = useTheme();

  // Sample data for shifts, holidays, and leaves
  const holidays = ['2025-05-05', '2025-05-15']; // Example holidays
  const weekOffs = ['2025-05-03', '2025-05-10']; // Example weekly offs
  const shifts = {
    '2025-05-02': {shift: 'Day', userLeave: 'Yes'},
    '2025-05-04': {shift: 'Night', userLeave: 'No'},
  };

  // Function to handle date selection
  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  // Agenda data
  const loadItems = day => {
    const strDate = day.dateString;
    if (!items[strDate]) {
      // Fetch shift data and holidays here based on the selected date
      const shiftDetails = shifts[strDate] || {};
      items[strDate] = [
        {
          shift: shiftDetails.shift || 'No shift',
          leave: shiftDetails.userLeave || 'No leave',
          holiday: holidays.includes(strDate) ? 'Holiday' : 'No holiday',
          weekOff: weekOffs.includes(strDate) ? 'Week Off' : 'Working Day',
        },
      ];
      setItems(newItems);
    }
  };

  // Render Agenda for selected day
  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text>Shift: {item.shift}</Text>
        <Text>Leave: {item.leave}</Text>
        <Text>Holiday: {item.holiday}</Text>
        <Text>Week Off: {item.weekOff}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar with Horizontal Week Scroll */}
      <Calendar
        horizontal={true}
        pagingEnabled={true}
        monthFormat={'yyyy MM'}
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: colors.primary,
            selectedTextColor: 'white',
          },
        }}
        // Define custom day style for the horizontal scroll
        theme={{
          arrowColor: colors.primary,
          todayTextColor: colors.primary,
        }}
      />

      {/* Agenda View for Selected Day */}
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={selectedDate}
        renderItem={renderItem}
        renderEmptyData={() => <Text>No data available</Text>}
        theme={{
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: 'white',
        }}
        style={{height: 300}} // 👈 ensure visibility
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Calendar1;
