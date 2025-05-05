import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';

const WeekCalendarWithAgenda = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [weekDays, setWeekDays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [tempYear, setTempYear] = useState(moment().year());
  const [tempMonth, setTempMonth] = useState(moment().month());

  const sampleEvents = {
    '2025-05-01': [{ type: 'holiday', name: 'Labor Day', id: '1' }],
    '2025-05-03': [{ type: 'dayOff', name: 'Day Off', id: '2' }],
    '2025-05-04': [{ type: 'shift', name: 'Night Shift', time: '22:00 - 06:00', id: '3' }],
    '2025-05-05': [{ type: 'shift', name: 'Day Shift', time: '09:00 - 17:00', id: '4' }],
    '2025-05-07': [{ type: 'leave', name: 'Annual Leave', id: '5' }],
  };

  const generateWeekDays = (date) => {
    const start = moment(date).startOf('isoWeek');  // Monday start of the week
    const firstOfMonth = moment(date).startOf('month');
    
    if (start.isBefore(firstOfMonth)) {
      start.date(1);  // Reset to the 1st day of the selected month if the start is before that
    }

    return Array.from({ length: 7 }, (_, i) => {
      const d = start.clone().add(i, 'days');
      return {
        dateString: d.format('YYYY-MM-DD'),
        day: d.format('ddd'),
        date: d.format('D'),
      };
    });
  };

  const updateMarkedDates = (days, selected) => {
    const newMarks = {};
    days.forEach((day) => {
      newMarks[day.dateString] = {
        selected: day.dateString === selected,
        marked: !!sampleEvents[day.dateString],
        dotColor: '#007bff',
        selectedColor: '#2196f3',
      };
    });
    setMarkedDates(newMarks);
  };

  useEffect(() => {
    const days = generateWeekDays(selectedDate);
    setWeekDays(days);
    setEvents(sampleEvents);
    updateMarkedDates(days, selectedDate);
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    updateMarkedDates(weekDays, date);
  };

  const changeWeek = (direction) => {
    const refDate = direction === 'prev'
      ? moment(weekDays[0].dateString).subtract(7, 'days')
      : moment(weekDays[6].dateString).add(1, 'days');
    const days = generateWeekDays(refDate);
    setWeekDays(days);
    updateMarkedDates(days, selectedDate);
  };

  const renderAgendaItem = (item) => {
    let background = '#fff';
    let borderColor = '#ccc';
    const colorMap = {
      holiday: ['#ffebee', '#f44336'],
      dayOff: ['#e3f2fd', '#2196f3'],
      shift: ['#e8f5e9', '#4caf50'],
      leave: ['#fff8e1', '#ffb300'],
    };

    if (colorMap[item.type]) {
      [background, borderColor] = colorMap[item.type];
    }

    return (
      <View style={[styles.eventCard, { backgroundColor: background, borderLeftColor: borderColor }]}>
        <Text style={styles.eventTitle}>{item.name}</Text>
        {item.time && <Text style={styles.eventTime}>{item.time}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeWeek('prev')}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={styles.headerText}>
            {moment(weekDays[0]?.dateString).format('MMMM YYYY')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeWeek('next')}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekRow}>
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.dateString}
            style={[
              styles.dayBox,
              selectedDate === day.dateString && styles.daySelected,
            ]}
            onPress={() => handleDateSelect(day.dateString)}
          >
            <Text style={[
              styles.dayLabel,
              selectedDate === day.dateString && styles.dayTextSelected
            ]}>{day.day}</Text>
            <Text style={[
              styles.dateLabel,
              selectedDate === day.dateString && styles.dayTextSelected
            ]}>{day.date}</Text>
            {sampleEvents[day.dateString] && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Agenda */}
      <View style={styles.agenda}>
        <Text style={styles.agendaTitle}>Agenda - {moment(selectedDate).format('MMM D, YYYY')}</Text>
        {events[selectedDate] ? (
          <ScrollView>
            {events[selectedDate].map((event) => (
              <View key={event.id}>{renderAgendaItem(event)}</View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noEvents}>No events</Text>
        )}
      </View>

      {/* Modal for Year/Month Picker */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year and Month</Text>

            {/* Year Picker */}
            <Picker
              selectedValue={tempYear}
              onValueChange={(itemValue) => setTempYear(itemValue)}
            >
              {Array.from({ length: 10 }, (_, i) => {
                const y = moment().year() - 5 + i;
                return <Picker.Item label={`${y}`} value={y} key={y} />;
              })}
            </Picker>

            {/* Month Picker */}
            <Picker
              selectedValue={tempMonth}
              onValueChange={(itemValue) => setTempMonth(itemValue)}
            >
              {moment.months().map((month, index) => (
                <Picker.Item label={month} value={index} key={month} />
              ))}
            </Picker>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newDate = moment({ year: tempYear, month: tempMonth, day: 1 }).format('YYYY-MM-DD');
                  setSelectedDate(newDate);  // Set to the 1st day of the selected month
                  const days = generateWeekDays(newDate);
                  setWeekDays(days);
                  updateMarkedDates(days, newDate);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.okBtn}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerText: { fontSize: 16, fontWeight: 'bold' },
  navText: { fontSize: 18, fontWeight: 'bold' },
  weekRow: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  dayBox: {
    width: 52,
    alignItems: 'center',
    marginHorizontal: 6,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  daySelected: {
    backgroundColor: '#2196f3',
  },
  dayLabel: {
    fontSize: 12,
    color: '#555',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  dayTextSelected: {
    color: '#fff',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ff5252',
    marginTop: 3,
  },
  agenda: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  eventCard: {
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderRadius: 6,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  eventTime: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  noEvents: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 20,
    borderRadius: 20,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  cancelBtn: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
  okBtn: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WeekCalendarWithAgenda;
