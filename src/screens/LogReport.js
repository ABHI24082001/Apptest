// // MainScreen.js
// import React, { useState } from 'react';
// import { View, Text, ScrollView, StyleSheet } from 'react-native';
// import HeaderWithSearchAndAddButton from '../component/HeaderWithSearchAndAddButton'; // Adjust the import path

// const LogReport = ({ navigation }) => {
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleAddPress = () => {
//     console.log('Add button pressed');
//     // Handle Add action here
//   };

//   const handleSearchChange = (text) => {
//     setSearchQuery(text);
//   };

//   const handleBackPress = () => {
//     console.log('Back button pressed');
//     // You can navigate back here if using a navigation library like React Navigation
//     navigation.goBack();
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Header */}
//       <HeaderWithSearchAndAddButton
//         title="Log Report"
//         searchQuery={searchQuery}
//         onSearchChange={handleSearchChange}
//         onAddPress={handleAddPress}
//         onBackPress={handleBackPress}
//       />
      
//       {/* Main Content */}
//       <ScrollView contentContainerStyle={styles.content}>
//         <Text>Main content goes here!</Text>
//         {/* Your other screen content */}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   content: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
// });

// export default LogReport;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Provider as PaperProvider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as Progress from 'react-native-progress';

const Dashboard = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setCheckedIn(true);
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime(null);
    setElapsedTime('00:00:00');
  };

  useEffect(() => {
    let interval;
    if (checkedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now - checkInTime;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkedIn, checkInTime]);

  const pad = (n) => (n < 10 ? `0${n}` : n);

  const generateShiftDays = () => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const shifts = ['General', 'Night Shift', 'Holiday'];
      const shift = shifts[i % 3]; // cycle
      return { day, date: dateStr, shift };
    });
  };

  const getShiftStyle = (shift) => {
    switch (shift) {
      case 'General':
        return { color: '#2196F3' };
      case 'Night Shift':
        return { color: '#9C27B0' };
      case 'Holiday':
        return { color: '#F44336' };
      default:
        return {};
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f9f8' }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Greeting + Check-in Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.name}>Welcome, Jayanta Behera</Text>
              <Text style={styles.role}>.Net Developer, IT</Text>
              <Text style={styles.company}>The Cloudtree</Text>

              <View style={styles.statusRow}>
                <View style={[styles.statusBox, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.statusText}>Check In {elapsedTime}</Text>
                </View>
                <View style={[styles.statusBox, { backgroundColor: '#e0e0e0' }]}>
                  <Text style={[styles.statusText, { color: '#333' }]}>Check Out 00:00:00</Text>
                </View>
              </View>

              <Text style={styles.shiftTime}>General Shift 10:00 AM - 07:00 PM</Text>
              <Progress.Bar progress={0.1} width={null} height={10} borderRadius={8} color="#2196F3" unfilledColor="#eee" style={{ marginVertical: 8 }} />

              <View style={styles.punchButtons}>
                <Button
                  mode="contained"
                  icon="login"
                  onPress={handleCheckIn}
                  disabled={checkedIn}
                  style={{ flex: 0.48, backgroundColor: checkedIn ? '#ccc' : '#2196F3' }}
                  labelStyle={styles.actionText}
                >
                  Check In
                </Button>

                <Button
                  mode="contained"
                  icon="logout"
                  onPress={handleCheckOut}
                  disabled={!checkedIn}
                  style={{ flex: 0.48, backgroundColor: !checkedIn ? '#ccc' : '#F44336' }}
                  labelStyle={styles.actionText}
                >
                  Check Out
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Leave Status Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Leave Status</Text>
              <View style={styles.leaveRow}>
                <Text style={styles.leaveLabel}>Total</Text>
                <Text style={styles.leaveValue}>30</Text>
              </View>
              <View style={styles.leaveRow}>
                <Text style={styles.leaveLabel}>CL (Casual)</Text>
                <Text style={styles.leaveValue}>10</Text>
              </View>
              <View style={styles.leaveRow}>
                <Text style={styles.leaveLabel}>SL (Sick)</Text>
                <Text style={styles.leaveValue}>8</Text>
              </View>
              <View style={styles.leaveRow}>
                <Text style={styles.leaveLabel}>PL (Paid)</Text>
                <Text style={styles.leaveValue}>12</Text>
              </View>
              <View style={styles.leaveRow}>
                <Text style={styles.leaveLabel}>Used</Text>
                <Text style={styles.leaveValue}>5</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Horizontal Shift Calendar */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Shift Calendar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {generateShiftDays().map((day) => (
                  <View key={day.date} style={styles.shiftDayBox}>
                    <Text style={styles.shiftDay}>{day.day}</Text>
                    <Text style={styles.shiftDate}>{day.date}</Text>
                    <Text style={[styles.shiftType, getShiftStyle(day.shift)]}>
                      {day.shift}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>

        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f6f9f8'
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  name: { fontWeight: 'bold', fontSize: 18, color: '#333' },
  role: { color: '#666' },
  company: { color: '#999', marginBottom: 12 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  statusBox: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusText: { color: '#fff', fontWeight: 'bold' },
  shiftTime: { marginTop: 10, fontWeight: '500', color: '#444' },
  punchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  actionText: { color: '#fff', fontWeight: '600' },
  sectionTitle: {
    fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: '#333'
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  leaveLabel: {
    color: '#555',
    fontWeight: '500'
  },
  leaveValue: {
    fontWeight: '600',
    color: '#333'
  },
  shiftDayBox: {
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    minWidth: 80
  },
  shiftDay: {
    fontWeight: '600',
    color: '#555'
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222'
  },
  shiftType: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600'
  }
});

export default Dashboard;
