import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AttendanceCard = ({ data }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{data.date}</Text>
      <Text style={styles.shift}>{data.shift}</Text>

      <View style={styles.row}>
        <Icon name="time-outline" size={16} color="#000" />
        <Text style={styles.time}>{data.time}</Text>
        <Text style={styles.required}>Required: {data.required}</Text>
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          Check In: <Text style={styles.bold}>{data.checkIn}</Text>  Check Out: <Text style={styles.bold}>{data.checkOut}</Text>
        </Text>
        <Text style={styles.statusText}>Worked Hour: {data.worked}</Text>
        <Text style={styles.statusText}>Status: <Text style={styles.statusBold}>{data.status}</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  date: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shift: {
    fontSize: 15,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  time: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  required: {
    fontWeight: '600',
    color: '#000',
  },
  statusBox: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  statusText: {
    fontSize: 13,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
  statusBold: {
    fontWeight: '700',
    color: '#333',
  },
});

export default AttendanceCard;
