// components/LeaveStatus.js
import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {Card} from 'react-native-paper';

const LeaveStatus = ({leaveData}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.leaveHeaderRow}>
          <Text style={styles.sectionTitle}>Leave Status</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.leaveScrollContainer}>
          {leaveData.map(item => (
            <View key={item.label} style={styles.leaveCard}>
              <Text style={styles.leaveType}>{item.label}</Text>
              <Text style={styles.leaveInfo}>
                Used: <Text style={styles.leaveBold}>{item.used}</Text>
              </Text>
              <Text style={styles.leaveInfo}>
                Available: <Text style={styles.leaveBold}>{item.available}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0e8f2', // Soft border
    elevation: 2,
  },
  leaveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b', // Dark slate
    marginBottom: 4,
  },
  leaveScrollContainer: {
    paddingVertical: 8,
    paddingLeft: 4,
  },
  leaveCard: {
    backgroundColor: '#f8fbfd', // Light blueish card
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  leaveType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  leaveInfo: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  leaveBold: {
    fontWeight: '700',
    color: '#0c4a6e',
  },
});

export default LeaveStatus;
