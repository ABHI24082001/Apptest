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


// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   useWindowDimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Card, Button, Avatar } from 'react-native-paper';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
// } from 'react-native-reanimated';
// import { format, differenceInSeconds } from 'date-fns';
// import ShiftCalendar from '../component/ShiftCalendar';

// const Dashboard = () => {
//   const { width } = useWindowDimensions();

//   const [checkedIn, setCheckedIn] = useState(false);
//   const [checkInTime, setCheckInTime] = useState(null);
//   const [elapsedTime, setElapsedTime] = useState('00:00:00');
//   const [shiftCompleted, setShiftCompleted] = useState(false);
//   const TOTAL_SHIFT_SECONDS = 60;
//   const SHIFT_HOURS = '10:00 AM - 10:01 AM';

//   const [selectedShiftInfo, setSelectedShiftInfo] = useState(null);

//   const leaveData = useMemo(() => ([
//     { label: 'Total', value: 30 },
//     { label: 'CL (Casual)', value: 10 },
//     { label: 'SL (Sick)', value: 8 },
//     { label: 'PL (Paid)', value: 12 },
//     { label: 'Used', value: 5 },
//   ]), []);

//   const progress = useSharedValue(0);

//   const handleCheckIn = () => {
//     const now = new Date();
//     setCheckInTime(now);
//     setCheckedIn(true);
//     setShiftCompleted(false);
//   };

//   const handleCheckOut = () => {
//     setCheckedIn(false);
//     setCheckInTime(null);
//     setElapsedTime('00:00:00');
//     progress.value = 0;
//     setShiftCompleted(false);
//   };

//   const formatTime = (seconds) => {
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
//   };

//   useEffect(() => {
//     let interval;
//     if (checkedIn && checkInTime) {
//       interval = setInterval(() => {
//         const now = new Date();
//         const diff = differenceInSeconds(now, checkInTime);
//         const progressValue = Math.min(diff / TOTAL_SHIFT_SECONDS, 1);

//         progress.value = withTiming(progressValue, {
//           duration: 1000,
//           easing: Easing.linear,
//         });

//         setElapsedTime(formatTime(diff));

//         if (diff >= TOTAL_SHIFT_SECONDS) {
//           clearInterval(interval);
//           setCheckedIn(false);
//           setShiftCompleted(true);
//         }
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [checkedIn, checkInTime]);

//   const handleDateSelect = (date, shift) => {
//     setSelectedShiftInfo({
//       date: format(new Date(date), 'MMM dd, yyyy'),
//       shift,
//     });
//   };

//   const animatedProgressStyle = useAnimatedStyle(() => ({
//     width: `${progress.value * 100}%`,
//   }));

//   const progressPercentage = Math.floor(progress.value * 100);

//   const leaveUsers = [
//     { id: '1', name: 'Anjana Mishra', role: 'HR, Management', image: require('../assets/image/woman.png') },
//     { id: '2', name: 'Jayanta Behera', role: 'Backend Developer, IT', image: require('../assets/image/withh.png') },
//     { id: '3', name: 'Abhispa Pathak', role: 'Android Developer, IT', image: require('../assets/image/withh.png') },
//     { id: '4', name: 'Ansuman Samal', role: '.Net Developer, IT', image: require('../assets/image/withh.png') },
//   ];

//   const renderUserItem = ({ item }) => (
//     <View style={styles.userContainer}>
//       {item.image ? (
//         <Avatar.Image source={item.image} size={48} />
//       ) : (
//         <Avatar.Icon icon="account" size={48} />
//       )}
//       <Text style={styles.roleText}>{item.role}</Text>
//       <Text style={styles.nameText}>{item.name}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.name}>Welcome, Jayanta Behera</Text>
//             <Text style={styles.role}>.Net Developer, IT</Text>
//             <Text style={styles.company}>The Cloudtree</Text>

//             <View style={styles.statusRow}>
//               <View style={[styles.statusBox, checkedIn ? styles.active : styles.inactive]}>
//                 <Text style={styles.statusText}>Check In {elapsedTime}</Text>
//               </View>
//               <View style={[styles.statusBox, !checkedIn ? styles.active : styles.inactive]}>
//                 <Text style={styles.statusText}>Check Out 00:00:00</Text>
//               </View>
//             </View>

//             <View style={styles.progressContainer}>
//               <View style={styles.progressBarBg}>
//                 <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
//               </View>
//               <Text style={styles.progressText}>{progressPercentage}%</Text>
//             </View>

//             <Text style={styles.shiftTime}>🕐 Shift: {SHIFT_HOURS}</Text>

//             {shiftCompleted && (
//               <Text style={styles.completedText}>✅ Shift Completed</Text>
//             )}

//             <View style={styles.buttonRow}>
//               <Button mode="contained" icon="login" onPress={handleCheckIn} disabled={checkedIn} style={[styles.button, checkedIn ? styles.disabled : styles.green]} labelStyle={styles.buttonLabel}>Check In</Button>
//               <Button mode="contained" icon="logout" onPress={handleCheckOut} disabled={!checkedIn} style={[styles.button, !checkedIn ? styles.disabled : styles.red]} labelStyle={styles.buttonLabel}>Check Out</Button>
//             </View>
//           </Card.Content>
//         </Card>

//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionTitle}>📄 Leave Status</Text>
//             {leaveData.map(item => (
//               <View style={styles.leaveRow} key={item.label}>
//                 <Text style={styles.leaveLabel}>{item.label}</Text>
//                 <Text style={styles.leaveValue}>{item.value}</Text>
//               </View>
//             ))}
//           </Card.Content>
//         </Card>

//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={styles.sectionTitle}>📅 Shift Calendar</Text>
//             <ShiftCalendar onSelectDate={handleDateSelect} />
//             {selectedShiftInfo && (
//               <View style={styles.selectedShiftContainer}>
//                 <Text style={styles.selectedShiftText}>{selectedShiftInfo.date} - {selectedShiftInfo.shift}</Text>
//               </View>
//             )}
//           </Card.Content>
//         </Card>
//  <Card style={styles.card}>
//           <Card.Title title="Who is on Leave?" titleStyle={styles.title} />
//           <Card.Content>
//             <FlatList
//               data={leaveUsers}
//               renderItem={renderUserItem}
//               keyExtractor={(item) => item.id}
//               numColumns={2}
//               scrollEnabled={false}
//               columnWrapperStyle={styles.row}
//             />
//             <Button
//               mode="outlined"
//               style={styles.leaveButton}
//               labelStyle={styles.leaveButtonLabel}
//               icon="chevron-right"
//               onPress={() => console.log('View All Pressed')}
//             >
//               View All
//             </Button>
//           </Card.Content>
//         </Card> 

//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#f7fafc' },
//   container: { padding: 16 },
//   card: { marginBottom: 16, borderRadius: 12, backgroundColor: '#fff', elevation: 3 },
//   name: { fontSize: 18, fontWeight: '700', color: '#2d3748' },
//   role: { fontSize: 14, color: '#4a5568' },
//   company: { fontSize: 13, color: '#718096', marginBottom: 12 },
//   statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
//   statusBox: { flex: 1, padding: 12, marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
//   active: { backgroundColor: '#4299e1' },
//   inactive: { backgroundColor: '#e2e8f0' },
//   statusText: { color: '#fff', fontWeight: '600', fontSize: 14 },
//   progressContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
//   progressBarBg: { flex: 1, height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
//   progressBarFill: { height: '100%', backgroundColor: '#4299e1' },
//   progressText: { marginLeft: 8, fontSize: 14, color: '#4299e1', fontWeight: '600' },
//   shiftTime: { textAlign: 'center', color: '#4a5568', marginTop: 6, fontWeight: '500' },
//   completedText: { textAlign: 'center', marginTop: 8, color: '#38a169', fontWeight: '600' },
//   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
//   button: { flex: 0.48, borderRadius: 8 },
//   green: { backgroundColor: '#38a169' },
//   red: { backgroundColor: '#e53e3e' },
//   disabled: { backgroundColor: '#cbd5e0' },
//   buttonLabel: { color: '#fff', fontWeight: '600' },
//   sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2d3748', marginBottom: 10 },
//   leaveRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
//   leaveLabel: { fontSize: 14, color: '#4a5568' },
//   leaveValue: { fontSize: 14, fontWeight: '600', color: '#2d3748' },
//   selectedShiftContainer: { marginTop: 12, backgroundColor: '#ebf8ff', padding: 10, borderRadius: 8 },
//   selectedShiftText: { fontSize: 14, color: '#3182ce', fontWeight: '500' },
//   title: { fontWeight: 'bold', fontSize: 16, color: '#2d3748' },
//   row: { justifyContent: 'space-between', marginBottom: 12 },
//   userContainer: { width: '48%', alignItems: 'center', marginBottom: 8 },
//   roleText: { fontSize: 13, fontWeight: '600', color: '#2c5282', textAlign: 'center', marginTop: 6 },
//   nameText: { fontSize: 12, color: '#718096', textAlign: 'center' },
//   leaveButton: { marginTop: 12, borderRadius: 8, borderColor: '#3182ce', alignSelf: 'center', paddingHorizontal: 12 },
//   leaveButtonLabel: { color: '#3182ce', fontWeight: '600' },
// });

// export default Dashboard;