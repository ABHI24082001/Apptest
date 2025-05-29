// components/LeaveBalanceCards.js
import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

const LeaveBalanceCards = ({leaveData}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.leaveScrollContainer}>
      {leaveData.map((item, index) => (
        <View key={index} style={styles.leaveCard}>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  leaveType: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#111827',
  },
  leaveInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
  leaveBold: {
    fontWeight: '700',
    color: '#111827',
  },
});

export default LeaveBalanceCards;