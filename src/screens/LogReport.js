import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaList, Calendar } from 'react-native-calendars';
import { Appbar } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';

const data = [
  {
    title: '2025-05-15',
    data: [
      {
        name: 'General Shift',
        loginTime: '09:00 AM',
        logoutTime: '06:00 PM',
        workingHours: '9 hrs',
      }
    ]
  },
  {
    title: '2025-05-16',
    data: [
      {
        name: 'Night Shift',
        loginTime: '09:00 PM',
        logoutTime: '06:00 AM',
        workingHours: '9 hrs',
      }
    ]
  },
  {
    title: '2025-05-17',
    data: [
      {
        name: 'Morning Shift',
        loginTime: '06:00 AM',
        logoutTime: '03:00 PM',
        workingHours: '9 hrs',
      }
    ]
  }
];

const AgendaListScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('2025-05-15');
  const [showCalendar, setShowCalendar] = useState(false);

  // Prepare marked dates
  const markedDates = data.reduce((acc, item) => {
    acc[item.title] = { marked: true, dotColor: '#4285F4' };
    if (item.title === selectedDate) {
      acc[item.title] = { ...acc[item.title], selected: true, selectedColor: '#4285F4' };
    }
    return acc;
  }, {});

  // Filter data for selected date
  const filteredData = data.filter(section => section.title === selectedDate);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.iconLabelGroup}>
            <MaterialIcons name="login" size={18} color="#4285F4" />
            <Text style={styles.label}>Login Time</Text>
          </View>
          <Text style={styles.value}>{item.loginTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.iconLabelGroup}>
            <MaterialIcons name="logout" size={18} color="#4285F4" />
            <Text style={styles.label}>Logout Time</Text>
          </View>
          <Text style={styles.value}>{item.logoutTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.iconLabelGroup}>
            <MaterialIcons name="clock-outline" size={18} color="#4285F4" />
            <Text style={styles.label}>Working Hours</Text>
          </View>
          <Text style={styles.value}>{item.workingHours}</Text>
        </View>
      </View>
    </View>
  );

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const renderEmptyData = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="calendar-blank" size={60} color="#C5CAE9" />
      <Text style={styles.emptyText}>No shifts scheduled for this date</Text>
    </View>
  );

  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction 
          onPress={() => navigation.goBack()} 
          color="#4B5563"
        />
        <Appbar.Content 
          title="Log Report" 
          titleStyle={styles.headerTitle} 
        />
      </Appbar.Header>

      {/* Calendar Header */}
      <TouchableOpacity 
        style={styles.calendarHeader} 
        onPress={toggleCalendar}
        activeOpacity={0.7}
      >
        <View style={styles.dateContainer}>
          <MaterialIcons name="calendar-month" size={20} color="#4285F4" style={styles.calendarIcon} />
          <Text style={styles.calendarHeaderText}>
            {formatDate(selectedDate)}
          </Text>
        </View>
        <MaterialIcons 
          name={showCalendar ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#4285F4" 
        />
      </TouchableOpacity>

      {/* Calendar */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            hideExtraDays
            enableSwipeMonths
            theme={{
              calendarBackground: '#fff',
              selectedDayBackgroundColor: '#4285F4',
              selectedDayTextColor: '#fff',
              todayTextColor: '#4285F4',
              dayTextColor: '#333',
              textDisabledColor: '#d9d9d9',
              monthTextColor: '#4285F4',
              textMonthFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              dotColor: '#4285F4',
              selectedDotColor: '#ffffff',
              arrowColor: '#4285F4',
            }}
          />
        </View>
      )}

      {/* Section Title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Shift Details</Text>
      </View>

      {/* Agenda List */}
      {filteredData.length > 0 ? (
        <AgendaList
          sections={filteredData}
          renderItem={renderItem}
          sectionStyle={styles.section}
          contentContainerStyle={styles.agendaContent}
        />
      ) : (
        renderEmptyData()
      )}
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 8,
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285F4',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitleContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  section: {
    display: 'none', // Hide section headers
  },
  agendaContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1F2937',
  },
  statusBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#4285F4',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  }
});

export default AgendaListScreen;