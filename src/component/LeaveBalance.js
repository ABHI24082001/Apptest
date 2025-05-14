import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const LeaveBalance = ({ leaveData }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.leaveScrollContainer}
    >
      {leaveData.map(item => (
        <View key={item.label} style={styles.leaveCard}>
          <Text style={styles.leaveType}>{item.label}</Text>
          <Text style={styles.leaveInfo}>
            Available: <Text style={styles.leaveBold}>{item.available}</Text>
          </Text>
          <Text style={styles.leaveInfo}>
            Used: <Text style={styles.leaveBold}>{item.used}</Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  leaveScrollContainer: {
    paddingVertical: 10,
    paddingLeft: 16,
    marginBottom: 20,
  },
  leaveCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3, // Android
  },
  leaveType: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e1e1e',
    marginBottom: 6,
  },
  leaveInfo: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  leaveBold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default LeaveBalance;
