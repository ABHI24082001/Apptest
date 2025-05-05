import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { Card, Text, Appbar } from 'react-native-paper';
import { eachDayOfInterval, format } from 'date-fns';

const ShiftAgendaCalendar = () => {
  // Dates setup
  const year = 2025;
  const month = 4; // April
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  // State
  const [selectedDate, setSelectedDate] = useState(format(start, 'yyyy-MM-dd'));

  // Agenda items
  const agendaItems = useMemo(() => {
    const days = eachDayOfInterval({ start, end });
    const items = {};

    days.forEach((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      let shiftType = '';
      let note = '';

      if (day.getDate() === 19) {
        shiftType = 'Holiday';
        note = 'Company Holiday';
      } else if (day.getDay() === 0) {
        shiftType = 'Week Off';
        note = 'Sunday Off';
      } else if (day.getDate() === 10) {
        shiftType = 'ML';
        note = 'Medical Leave';
      } else if (day.getDate() === 15) {
        shiftType = 'SL';
        note = 'Sick Leave';
      } else if (day.getDate() === 22) {
        shiftType = 'CL';
        note = 'Casual Leave';
      } else {
        const block = Math.floor(index / 7) % 3;
        shiftType = block === 0 ? 'General' : block === 1 ? 'Night' : 'Day';
        note = `${shiftType} Shift`;
      }

      items[dateStr] = [
        {
          shiftType,
          note,
        },
      ];
    });

    return items;
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" elevated>
        <Appbar.Content title="Shift Calendar" />
      </Appbar.Header>

      <Agenda
        items={agendaItems}
        selected={selectedDate}
        onDayPress={(day) => {
          if (day.dateString !== selectedDate) {
            setSelectedDate(day.dateString); // ✅ prevents infinite loop
          }
        }}
        renderItem={(item) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.shiftType}</Text>
              <Text variant="bodySmall" style={{ color: '#666' }}>
                {item.note}
              </Text>
            </Card.Content>
          </Card>
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>No Shift Info</Text>
          </View>
        )}
        theme={{
          agendaTodayColor: '#2196f3',
          selectedDayBackgroundColor: '#2196f3',
          dotColor: '#2196f3',
          backgroundColor: '#fff',
          calendarBackground: '#fff',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginRight: 10,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  emptyDate: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
});

export default ShiftAgendaCalendar;
