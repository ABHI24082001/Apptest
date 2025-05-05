import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import {AgendaList} from 'react-native-calendars';
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const WeekCalendarWithAgenda = ({
  events = {},
  initialDate = moment().format('YYYY-MM-DD'),
  onDateChange = () => {},
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekDays, setWeekDays] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempYear, setTempYear] = useState(moment().year());
  const [tempMonth, setTempMonth] = useState(moment().month());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Enhanced event type configuration
  const eventTypes = {
    holiday: {
      name: 'Holiday',
      color: '#FF5252',
      bg: '#FFEBEE',
      icon: 'celebration',
      description: 'Public holiday',
    },
    'day-shift': {
      name: 'Day Shift',
      color: '#4CAF50',
      bg: '#E8F5E9',
      icon: 'wb-sunny',
      description: 'Day time working hours',
    },
    'night-shift': {
      name: 'Night Shift',
      color: '#303F9F',
      bg: '#E8EAF6',
      icon: 'nights-stay',
      description: 'Night time working hours',
    },
    'week-off': {
      name: 'Week Off',
      color: '#2196F3',
      bg: '#E3F2FD',
      icon: 'weekend',
      description: 'Weekly day off',
    },
    leave: {
      name: 'Leave',
      color: '#FF9800',
      bg: '#FFF8E1',
      icon: 'beach-access',
      description: 'Paid time off',
    },
    meeting: {
      name: 'Meeting',
      color: '#9C27B0',
      bg: '#F3E5F5',
      icon: 'meeting-room',
      description: 'Team meeting',
    },
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

  // Merge sample events with provided events
  const allEvents = {...sampleEvents, ...events};

  const generateWeekDays = date => {
    const start = moment(date).startOf('isoWeek');
    return Array.from({length: 7}, (_, i) => {
      const d = start.clone().add(i, 'days');
      return {
        dateString: d.format('YYYY-MM-DD'),
        day: d.format('ddd'),
        date: d.format('D'),
        isToday: d.isSame(moment(), 'day'),
        isWeekend: d.isoWeekday() >= 6, // Saturday or Sunday
      };
    });
  };

  useEffect(() => {
    const days = generateWeekDays(initialDate);
    setWeekDays(days);
  }, [initialDate]);

  const handleDateSelect = date => {
    setSelectedDate(date);
    onDateChange(date);
  };

  const changeWeek = direction => {
    const refDate =
      direction === 'prev'
        ? moment(weekDays[0].dateString).subtract(7, 'days')
        : moment(weekDays[6].dateString).add(1, 'days');
    const days = generateWeekDays(refDate);
    setWeekDays(days);
  };

  const getAgendaItems = () => {
    if (allEvents[selectedDate]) {
      return [{title: selectedDate, data: allEvents[selectedDate]}];
    }
    return [
      {
        title: selectedDate,
        data: [
          {
            id: 'empty',
            type: 'empty',
            name: 'No events scheduled',
            description: 'No shifts, holidays or leaves scheduled for this day',
          },
        ],
      },
    ];
  };

  const handleEventPress = event => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const renderItem = ({item}) => {
    if (item.type === 'empty') {
      return (
        <View style={[styles.item, styles.emptyItem]}>
          <MaterialIcons name="event-available" size={24} color="#999" />
          <Text style={styles.emptyText}>{item.name}</Text>
          <Text style={styles.emptySubText}>{item.description}</Text>
        </View>
      );
    }

    const eventType = eventTypes[item.type] || eventTypes['day-shift'];

    return (
      <TouchableOpacity
        style={[styles.item, {backgroundColor: eventType.bg}]}
        onPress={() => handleEventPress(item)}>
        <View style={styles.itemHeader}>
          <MaterialIcons
            name={eventType.icon}
            size={20}
            color={eventType.color}
          />
          <Text style={[styles.itemType, {color: eventType.color}]}>
            {eventType.name}
          </Text>
        </View>
        <Text style={styles.itemTitle}>{item.name}</Text>
        {item.time && (
          <View style={styles.timeContainer}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.itemTime}>{item.time}</Text>
          </View>
        )}
        {item.location && (
          <View style={styles.detailContainer}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.itemDetail}>{item.location}</Text>
          </View>
        )}
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}
        <View style={styles.moreInfoContainer}>
          <Text style={styles.moreInfoText}>Tap for details</Text>
          <MaterialIcons name="chevron-right" size={16} color="#666" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.agendaTitle}>
        {moment(selectedDate).format('dddd, MMMM D')}
      </Text>
      <Text style={styles.agendaSubtitle}>
        {allEvents[selectedDate]
          ? `${allEvents[selectedDate].length} events`
          : 'No events'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => changeWeek('prev')}
          style={styles.navButton}>
          <MaterialIcons name="chevron-left" size={28} color="#3F51B5" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.monthButton}>
          <Text style={styles.headerText}>
            {moment(weekDays[0]?.dateString).format('MMMM YYYY')}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#3F51B5" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => changeWeek('next')}
          style={styles.navButton}>
          <MaterialIcons name="chevron-right" size={28} color="#3F51B5" />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekContainer}>
        {weekDays.map(day => (
          <TouchableOpacity
            key={day.dateString}
            style={[
              styles.dayBox,
              selectedDate === day.dateString && styles.daySelected,
              day.isToday && styles.todayBox,
              day.isWeekend && styles.weekendBox,
            ]}
            onPress={() => handleDateSelect(day.dateString)}>
            <Text
              style={[
                styles.dayLabel,
                selectedDate === day.dateString && styles.dayTextSelected,
                day.isToday &&
                  !(selectedDate === day.dateString) &&
                  styles.todayText,
                day.isWeekend &&
                  !(selectedDate === day.dateString) &&
                  styles.weekendText,
              ]}>
              {day.day}
            </Text>
            <Text
              style={[
                styles.dateLabel,
                selectedDate === day.dateString && styles.dayTextSelected,
                day.isToday &&
                  !(selectedDate === day.dateString) &&
                  styles.todayText,
                day.isWeekend &&
                  !(selectedDate === day.dateString) &&
                  styles.weekendText,
              ]}>
              {day.date}
            </Text>
            {allEvents[day.dateString] && (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: allEvents[day.dateString][0]
                      ? eventTypes[allEvents[day.dateString][0].type]?.color ||
                        '#3F51B5'
                      : '#3F51B5',
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Agenda View */}
      <View style={styles.agendaContainer}>
        <FlatList
          ListHeaderComponent={renderSectionHeader}
          data={getAgendaItems()[0].data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.agendaContent}
        />
      </View>

      {/* Month/Year Picker Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Month and Year</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tempMonth}
                  onValueChange={setTempMonth}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {moment.months().map((month, i) => (
                    <Picker.Item label={month} value={i} key={month} />
                  ))}
                </Picker>

                <Picker
                  selectedValue={tempYear}
                  onValueChange={setTempYear}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {Array.from({length: 11}, (_, i) => {
                    const y = moment().year() - 5 + i;
                    return <Picker.Item label={`${y}`} value={y} key={y} />;
                  })}
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const newDate = moment({
                      year: tempYear,
                      month: tempMonth,
                      day: 1,
                    }).format('YYYY-MM-DD');
                    setSelectedDate(newDate);
                    setWeekDays(generateWeekDays(newDate));
                    setShowPicker(false);
                    onDateChange(newDate);
                  }}
                  style={[styles.modalButton, styles.confirmButton]}>
                  <Text style={[styles.modalButtonText, {color: '#000'}]}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Detail Modal */}
      <Modal visible={showEventModal} transparent animationType="slide">
        <View style={styles.eventModalOverlay}>
          <View style={styles.eventModalContainer}>
            {selectedEvent && (
              <>
                <View style={styles.eventModalHeader}>
                  <Text style={styles.eventModalTitle}>
                    {selectedEvent.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEventModal(false)}
                    style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.eventTypeBadge,
                    {
                      backgroundColor:
                        eventTypes[selectedEvent.type]?.bg || '#F5F5F5',
                      borderColor:
                        eventTypes[selectedEvent.type]?.color || '#3F51B5',
                    },
                  ]}>
                  <MaterialIcons
                    name={eventTypes[selectedEvent.type]?.icon || 'event'}
                    size={16}
                    color={eventTypes[selectedEvent.type]?.color || '#3F51B5'}
                  />
                  <Text
                    style={[
                      styles.eventTypeText,
                      {
                        color:
                          eventTypes[selectedEvent.type]?.color || '#3F51B5',
                      },
                    ]}>
                    {eventTypes[selectedEvent.type]?.name || 'Event'}
                  </Text>
                </View>

                <View style={styles.eventDetailRow}>
                  <MaterialIcons name="event" size={20} color="#666" />
                  <Text style={styles.eventDetailText}>
                    {moment(selectedDate).format('dddd, MMMM D, YYYY')}
                  </Text>
                </View>

                {selectedEvent.time && (
                  <View style={styles.eventDetailRow}>
                    <MaterialIcons name="access-time" size={20} color="#666" />
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.time}
                    </Text>
                  </View>
                )}

                {selectedEvent.location && (
                  <View style={styles.eventDetailRow}>
                    <MaterialIcons name="location-on" size={20} color="#666" />
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.location}
                    </Text>
                  </View>
                )}

                <View style={styles.eventDescription}>
                  <Text style={styles.eventDescriptionTitle}>Description</Text>
                  <Text style={styles.eventDescriptionText}>
                    {selectedEvent.description ||
                      eventTypes[selectedEvent.type]?.description ||
                      'No description available'}
                  </Text>
                </View>

                {selectedEvent.notes && (
                  <View style={styles.eventNotes}>
                    <Text style={styles.eventNotesTitle}>Notes</Text>
                    <Text style={styles.eventNotesText}>
                      {selectedEvent.notes}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navButton: {
    padding: 8,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F51B5',
    marginRight: 4,
  },
  weekContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'transparent', // Remove default background
  },
  daySelected: {
    borderWidth: 2, // Add border instead of background
    borderColor: '#3F51B5',
    backgroundColor: 'transparent', // No background color
  },
  todayBox: {
    borderWidth: 1,
    borderColor: '#3F51B5',
    backgroundColor: 'transparent', // No background color
  },
  weekendBox: {
    backgroundColor: '#F9F9F9',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000', // Always black text
    textTransform: 'uppercase',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#000', // Always black text
  },
  dayTextSelected: {
    color: '#000',
  },
  todayText: {
    color: '#000',
  },
  weekendText: {
    color: '#888',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  agendaContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  agendaContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  agendaSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  item: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  moreInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  moreInfoText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    height: 180,
  },
  pickerItem: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#3F51B5',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Event Modal Styles
  eventModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  eventModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  eventModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventDescription: {
    marginTop: 16,
    marginBottom: 16,
  },
  eventDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDescriptionText: {
    fontSize: 14,
    color: '#666',
  },
  eventNotes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  eventNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventNotesText: {
    fontSize: 14,
    color: '#666',
  },
});

export default WeekCalendarWithAgenda;
