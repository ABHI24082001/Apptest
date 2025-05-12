import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Card, Button} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {format, differenceInSeconds} from 'date-fns';
import AppSafeArea from '../component/AppSafeArea';
import ShiftCalendar from '../component/ShiftCalendar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';


const Dashboard = () => {
  const TOTAL_SHIFT_SECONDS = 60;
  const SHIFT_HOURS = '10:00 AM - 10:01 AM';

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [shiftCompleted, setShiftCompleted] = useState(false);
  const [selectedShiftInfo, setSelectedShiftInfo] = useState(null);
  

  const leaveData = [
    {label: 'CL', available: 10, used: 5},
    {label: 'PL', available: 8, used: 2},
    {label: 'SL', available: 4, used: 1},
    {label: 'ML', available: 10, used: 4},
    {label: 'EL', available: 6, used: 2},
    {label: 'WFH', available: 3, used: 1},
  ];

  const leaveUsers = [
    {
      id: '1',
      name: 'Anjana Mishra',
      role: 'HR, Management',
      image: require('../assets/image/woman.png'),
    },
    {
      id: '2',
      name: 'Jayanta Behera',
      role: 'Backend Developer, IT',
      image: require('../assets/image/withh.png'),
    },
    {
      id: '3',
      name: 'Abhispa Pathak',
      role: 'Android Developer, IT',
      image: require('../assets/image/withh.png'),
    },
    {
      id: '4',
      name: 'Ansuman Samal',
      role: '.Net Developer, IT',
      image: require('../assets/image/withh.png'),
    },
  ];

  const progress = useSharedValue(0);
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const progressPercentage = Math.floor(progress.value * 100);

  const leaveScrollRef = useRef(null);

  const formatTime = seconds => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval;
    if (checkedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = differenceInSeconds(now, checkInTime);
        const progressValue = Math.min(diff / TOTAL_SHIFT_SECONDS, 1);

        progress.value = withTiming(progressValue, {
          duration: 1000,
          easing: Easing.linear,
        });

        setElapsedTime(formatTime(diff));

        if (diff >= TOTAL_SHIFT_SECONDS) {
          clearInterval(interval);
          setCheckedIn(false);
          setShiftCompleted(true);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkedIn, checkInTime]);

  const handleCheckIn = () => {
    setCheckInTime(new Date());
    setCheckedIn(true);
    setShiftCompleted(false);
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime(null);
    setElapsedTime('00:00:00');
    progress.value = 0;
    setShiftCompleted(false);
  };

  const handleDateSelect = (date, shift) => {
    setSelectedShiftInfo({
      date: format(new Date(date), 'MMM dd, yyyy'),
      shift,
    });
  };

  const navigation = useNavigation();

  const renderUserItem = ({item}) => (
    <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
      <Card.Content style={styles.userContent}>
        {/* <Image source={item.image} style={styles.avatar} /> */}
        <View style={styles.textWrapper}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <AppSafeArea>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
          <Card.Content>
            <Text style={styles.name}>Welcome, Jayanta Behera</Text>
            <Text style={styles.role}>.Net Developer, IT</Text>
            <Text style={styles.company}>The Cloudtree</Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBox,
                  checkedIn ? styles.active : styles.inactive,
                ]}>
                <Text style={styles.statusText}>Check In {elapsedTime}</Text>
              </View>
              <View
                style={[
                  styles.statusBox,
                  !checkedIn ? styles.active : styles.inactive,
                ]}>
                <Text style={styles.statusText}>Check Out 00:00:00</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[styles.progressBarFill, animatedProgressStyle]}
                />
              </View>
              <Text style={styles.progressText}>{progressPercentage}%</Text>
            </View>

            <Text style={styles.shiftTime}>🕐 Shift: {SHIFT_HOURS}</Text>
            {shiftCompleted && (
              <Text style={styles.completedText}>✅ Shift Completed</Text>
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                icon="login"
                onPress={handleCheckIn}
                disabled={checkedIn}
                style={[
                  styles.button,
                  checkedIn ? styles.disabled : styles.green,
                ]}
                labelStyle={styles.buttonLabel}>
                Check In
              </Button>
              <Button
                mode="contained"
                icon="logout"
                onPress={handleCheckOut}
                disabled={!checkedIn}
                style={[
                  styles.button,
                  !checkedIn ? styles.disabled : styles.red,
                ]}
                labelStyle={styles.buttonLabel}>
                Check Out
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
          <Card.Content>
            <View style={styles.leaveHeaderRow}>
              <Text style={styles.sectionTitle}>Leave Status</Text>
              {/* <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={18} color="#007bff" /> */}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.leaveScrollContainer}
              ref={leaveScrollRef}>
              {leaveData.map(item => (
                <View key={item.label} style={styles.leaveCard}>
                  <Text style={styles.leaveType}>{item.label}</Text>
                  <Text style={styles.leaveInfo}>
                    Available:{' '}
                    <Text style={styles.leaveBold}>{item.available}</Text>
                  </Text>
                  <Text style={styles.leaveInfo}>
                    Used: <Text style={styles.leaveBold}>{item.used}</Text>
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Calendar</Text>
            <ShiftCalendar onSelectDate={handleDateSelect} />
            {selectedShiftInfo && (
              <View style={styles.selectedShiftContainer}>
                <Text style={styles.selectedShiftText}>
                  {selectedShiftInfo.date} - {selectedShiftInfo.shift}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]} >
          <View style={styles.leaveHeaderRow}>
            <Text style={styles.sectionTitle}>Who is on Leave</Text>
            <TouchableOpacity  onPress={() => navigation.navigate('WhoLeave')}>
              <View style={styles.leaveHeaderRow}>
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="chevron-right" size={18} color="#007bff" />
              </View>
            </TouchableOpacity>
          </View>
          <Card.Content>
            <FlatList
              data={leaveUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
            {/* <Button
              mode="outlined"
              icon="chevron-right"
              onPress={() => console.log('View All Pressed')}
              style={styles.button}
              labelStyle={styles.buttonLabel}>
              View All
            </Button> */}
          </Card.Content>
        </Card>
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 32, backgroundColor: '#F5F7FA'},
  card: {borderRadius: 12, marginBottom: 16, elevation: 2, margin: 5},
  title: {fontWeight: 'bold', fontSize: 18},
  listContainer: {paddingVertical: 8 , marginLeft: 10},
  userCard: {marginRight: 12, width: 190, borderRadius: 10, elevation: 2},
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 70,
    
  },
  avatar: {width: 44, height: 44, borderRadius: 22, marginRight: 10},
  textWrapper: {flexShrink: 1},
  name: {fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4},
  role: {fontSize: 12, color: '#777', marginBottom: 2, fontWeight: '700'},
  company: {fontSize: 14, color: '#777', marginBottom: 12, fontWeight: '700'},
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  active: {backgroundColor: '#d2f7dc'},
  inactive: {backgroundColor: '#F0F0F0'},
  statusText: {fontSize: 13, color: '#333'},
  progressContainer: {marginVertical: 12, alignItems: 'center'},
  progressBarBg: {
    height: 10,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {height: 10, backgroundColor: '#4CAF50'},
  progressText: {marginTop: 6, fontSize: 12, color: '#333'},
  shiftTime: {fontSize: 14, color: '#444', marginTop: 8},
  completedText: {color: '#388E3C', fontSize: 13, marginTop: 4},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {flex: 1, marginHorizontal: 4, borderRadius: 8},
  buttonLabel: {fontWeight: 'bold', color: '#fff'},
  green: {backgroundColor: '#4CAF50'},
  red: {backgroundColor: '#F44336'},
  disabled: {backgroundColor: '#BDBDBD'},
  leaveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    margin: 5,
  },
  sectionTitle: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  leaveScrollContainer: {paddingVertical: 8},
  leaveCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    elevation: 1,
  },
  leaveType: {fontSize: 16, fontWeight: 'bold', marginBottom: 4},
  leaveInfo: {fontSize: 13, color: '#555'},
  leaveBold: {fontWeight: 'bold'},
  selectedShiftContainer: {marginTop: 8 , },
  selectedShiftText: {fontSize: 14, fontWeight: '500', color: '#333'},
});

export default Dashboard;
