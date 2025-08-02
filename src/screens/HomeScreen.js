import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import {Card} from 'react-native-paper';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {format, differenceInSeconds} from 'date-fns';
import AppSafeArea from '../component/AppSafeArea';
import UserProfileCard from '../component/UserProfileCard';
import AttendanceTracker from '../component/AttendanceTracker';
import LeaveStatus from '../component/LeaveStatus';
import ShiftCalendarSection from '../component/ShiftCalendarSection';
import OnLeaveUsers from '../component/OnLeaveUsers';
import BASE_URL from '../constants/apiConfig';

import {useAuth} from '../constants/AuthContext';
import axiosInstance from '../utils/axiosInstance'; 

import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';

const Dashboard = () => {
  const TOTAL_SHIFT_SECONDS = 60;
  const SHIFT_HOURS = '10:00 AM - 10:01 AM';

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [shiftCompleted, setShiftCompleted] = useState(false);
  const [selectedShiftInfo, setSelectedShiftInfo] = useState(null);

  const employeeData = useFetchEmployeeDetails();
  const [leaveData, setLeaveData] = useState([]);

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
  const progressPercentage = Math.floor(progress.value * 100);

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

        progress.value = progressValue;
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

  const {user} = useAuth();

  // console.log(user, 'User============ Data');
  // console.log(employeeData, 'Employee================== Data'); // Log employeeData
  // console.log(employeeDetails, 'Fetch Employee Details'); // Log fetchEmployeeDetails
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const employeeId = user?.id;
        const companyId = user?.childCompanyId;

        if (!employeeId || !companyId) return;

        const response = await axiosInstance.get(
          `${BASE_URL}/CommonDashboard/GetEmployeeLeaveDetails/${companyId}/${employeeId}`,
        );

        const transformed = response.data.leaveBalances.map(item => ({
          label: item.leavename,
          used: item.usedLeaveNo,
          available: item.availbleLeaveNo,
        }));

        setLeaveData(transformed);
      } catch (error) {
        console.error('Error fetching leave data:', error.message);
      }
    };

    fetchLeaveData();
  }, []);

  return (
    <AppSafeArea>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {employeeData && (
            <UserProfileCard
              name={employeeData.employeeName}
              designation={employeeData.designationName}
              department={employeeData.departmentName}
            />
          )}

          <AttendanceTracker
            checkedIn={checkedIn}
            elapsedTime={elapsedTime}
            progress={progress}
            progressPercentage={progressPercentage}
            shiftHours={SHIFT_HOURS}
            shiftCompleted={shiftCompleted}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />

          <LeaveStatus leaveData={leaveData} />

          {/* Uncomment if you want shift calendar */}
          {/* <ShiftCalendarSection
            onSelectDate={handleDateSelect}
            selectedShiftInfo={selectedShiftInfo}
          /> */}

          <OnLeaveUsers leaveUsers={leaveUsers} />

          {/* {employeeDetails && (
            <View style={styles.card}>
              <Text style={styles.title}>Employee Details</Text>
              <Text>Name: {employeeDetails.employeeName}</Text>
              <Text>Designation: {employeeDetails.designationName}</Text>
              <Text>Department: {employeeDetails.departmentName}</Text>
              <Text>Branch: {employeeDetails.branchName}</Text>
              <Text>Email: {employeeDetails.emailAddress}</Text>
              <Text>Contact: {employeeDetails.pcontactNo}</Text>
              <Text>Address: {employeeDetails.presentAddress}</Text>
              <Text>Date of Joining: {employeeDetails.dateofJoin}</Text>
            </View>
          )} */}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
    paddingBottom: 22,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 10,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default Dashboard;
