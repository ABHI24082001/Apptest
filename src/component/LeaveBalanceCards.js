// components/LeaveBalanceCards.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LeaveBalanceCards = ({ leaveData }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.leaveScrollContainer}>
        
      {leaveData.map((item, index) => (
        <LinearGradient
          key={index}
          colors={['#3B82F6', '#2563EB']}
          style={styles.leaveCard}>
          <Text style={styles.leaveType}>{item.label}</Text>
          <Text style={styles.leaveInfo}>
            Available: <Text style={styles.leaveBold}>{item.available}</Text>
          </Text>
          <Text style={styles.leaveInfo}>
            Used: <Text style={styles.leaveBold}>{item.used}</Text>
          </Text>
        </LinearGradient>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  leaveScrollContainer: {
    // paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveCard: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveType: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#FFFFFF',
  },
  leaveInfo: {
    fontSize: 13,
    color: '#E0E7FF',
  },
  leaveBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default LeaveBalanceCards;
