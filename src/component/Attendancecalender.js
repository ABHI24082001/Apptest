import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function MonthCalendarWithAgenda({
  events = {},
  initialDate = moment().format('YYYY-MM-DD'),
  onDateChange = () => {},
}) {
  const [currentMonth, setCurrentMonth] = useState(moment(initialDate));
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentMonth.year());

  // Event types configuration
  const eventTypes = {
    'day-shift': { color: '#4CAF50', icon: 'wb-sunny' },
    'night-shift': { color: '#303F9F', icon: 'nights-stay' },
    holiday: { color: '#FF5252', icon: 'celebration' },
    leave: { color: '#FF9800', icon: 'beach-access' },
    meeting: { color: '#9C27B0', icon: 'meeting-room' },
    'week-off': { color: '#2196F3', icon: 'weekend' },
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

  // Sample events data structure
  const sampleEvents = {
    [moment().format('YYYY-MM-DD')]: [
      {
        id: '1',
        type: 'day-shift',
        name: 'Morning Shift',
        time: '09:00 - 17:00',
        location: 'Main Office',
        notes: 'Regular working hours',
      },
      {
        id: '2',
        type: 'meeting',
        name: 'Team Sync',
        time: '10:00 - 11:00',
        location: 'Conference Room A',
      },
    ],
    [moment().add(1, 'days').format('YYYY-MM-DD')]: [
      {
        id: '3',
        type: 'night-shift',
        name: 'Night Shift',
        time: '22:00 - 06:00',
        notes: 'Bring security access card',
      },
    ],
    [moment().add(2, 'days').format('YYYY-MM-DD')]: [
      {
        id: '4',
        type: 'week-off',
        name: 'Weekly Off',
      },
    ],
    [moment().add(3, 'days').format('YYYY-MM-DD')]: [
      {
        id: '5',
        type: 'holiday',
        name: 'Public Holiday',
        description: 'National holiday',
      },
    ],
    [moment().add(5, 'days').format('YYYY-MM-DD')]: [
      {
        id: '6',
        type: 'leave',
        name: 'Annual Leave',
        description: 'Family vacation',
        notes: 'Out of office',
      },
    ],
  };

  const renderDay = ({ item }) => {
    const isSelected = item.key === selectedDate;
    const evts = events[item.key] || [];
    const dayName = item.date.format('ddd'); // Mon, Tue
    const dateNumber = item.date.format('D'); // 6, 7
  
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDate(item.key);
          onDateChange(item.key);
        }}
        style={[styles.dayCard, isSelected && styles.dayCardSelected]}
      >
        {/* Day Name */}
        <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
          {dayName}
        </Text>
  
        {/* Date Number */}
        <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>
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
            <View key={evt.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <MaterialIcons
                  name={eventTypes[evt.type]?.icon || 'event'}
                  size={20}
                  color={eventTypes[evt.type]?.color}
                />
                <Text style={styles.eventTitle}>{evt.name}</Text>
              </View>
              {evt.time && <Text style={styles.eventDetail}>{evt.time}</Text>}
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
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F51B5',
  },
  daysContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  dayCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayCardSelected: {
    backgroundColor: '#3F51B5',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dayLabelSelected: {
    color: '#FFF',
  },
  dotRow: { marginTop: 4 },
  agenda: {
    flex: 1,
    padding: 12,
  },
  agendaHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyAgenda: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    color: '#CCC',
    marginTop: 8,
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 1,
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
});
