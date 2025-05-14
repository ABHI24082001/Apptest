import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const DayDetails = ({ date, data }) => {
  const isWeekOff = data === 'Week-Off';
  const isWeekend = date.day() === 0 || date.day() === 6;

  const calculateDuration = (login, logout) => {
    if (!login || !logout) return '--:--';
    const start = moment(login, 'HH:mm:ss');
    const end = moment(logout, 'HH:mm:ss');
    const duration = moment.duration(end.diff(start));
    return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{date.format('dddd, MMMM D, YYYY')}</Text>

      {isWeekOff || isWeekend ? (
        <View style={styles.statusRow}>
          <MaterialIcons
            name="weekend"
            size={28}
            color={isWeekOff ? '#2196F3' : '#FF9800'}
          />
          <Text style={[styles.status, isWeekOff && styles.weekOff]}>
            {isWeekOff ? 'Week Off' : 'Weekend'}
          </Text>
        </View>
      ) : (
        <View style={styles.timeSection}>
          <View style={styles.timeRow}>
            <MaterialIcons name="login" size={24} color="#4CAF50" />
            <Text style={styles.timeText}>Login: {data?.login || '--:--:--'}</Text>
          </View>
          <View style={styles.timeRow}>
            <MaterialIcons name="logout" size={24} color="#F44336" />
            <Text style={styles.timeText}>Logout: {data?.logout || '--:--:--'}</Text>
          </View>
          {data?.login && data?.logout && (
            <View style={styles.timeRow}>
              <MaterialIcons name="access-time" size={20} color="#607D8B" />
              <Text style={styles.timeText}>
                Worked: {calculateDuration(data.login, data.logout)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  status: { fontSize: 16, marginLeft: 10, color: '#777' },
  weekOff: { color: '#2196F3' },
  timeSection: { marginTop: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  timeText: { marginLeft: 10, fontSize: 15 },
});

export default DayDetails;
