// components/AttendanceTracker.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AttendanceTracker = ({
  checkedIn,
  elapsedTime,
  progress,
  progressPercentage,
  shiftHours,
  shiftCompleted,
  onCheckIn,
  onCheckOut,
}) => {
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBox,
              checkedIn ? styles.active : styles.inactive,
            ]}
          >
            <Text style={styles.statusText}>Check In {elapsedTime}</Text>
          </View>
          <View
            style={[
              styles.statusBox,
              !checkedIn ? styles.active : styles.inactive,
            ]}
          >
            <Text style={styles.statusText}>Check Out 00:00:00</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
          </View>
          <Text style={styles.progressText}>{progressPercentage}%</Text>
        </View>

        <Text style={styles.shiftTime}>Shift: {shiftHours}</Text>
        {shiftCompleted && <Text style={styles.completedText}>Shift Completed</Text>}

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={onCheckIn}
            disabled={checkedIn}
            style={[styles.button, checkedIn ? styles.disabled : styles.green]}
          >
            Check In
          </Button>
          <Button
            mode="contained"
            onPress={onCheckOut}
            disabled={!checkedIn}
            style={[styles.button, !checkedIn ? styles.disabled : styles.red]}
          >
            Check Out
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#e8f5e9',
  },
  inactive: {
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
  shiftTime: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  completedText: {
    color: '#388E3C',
    fontSize: 13,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    height: 40,
  },
  green: {
    backgroundColor: '#4CAF50',
  },
  red: {
    backgroundColor: '#F44336',
  },
  disabled: {
    backgroundColor: '#BDBDBD',
  },
});

export default AttendanceTracker;
