import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Card} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { differenceInSeconds} from 'date-fns';
import AppSafeArea from '../component/AppSafeArea';
import Attendancecalender from '../component/Attendancecalender'

const Attandance = () => {
  const TOTAL_SHIFT_SECONDS = 60;

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [shiftCompleted, setShiftCompleted] = useState(false);

  const progress = useSharedValue(0);

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

  return (
    <AppSafeArea>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Card  style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Attandance</Text>
            <Attendancecalender/>
          </Card.Content>
        </Card>
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F5F7FA',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
});

export default Attandance;
