// components/LeaveBalanceCards.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';

const LeaveBalanceCards = ({ leaveData = [] }) => {
  const cardColors = [
    '#4A90E2', // Blue
    '#50C878', // Green
    '#FF6B6B', // Red
    '#9B59B6', // Purple
    '#F39C12', // Orange
    '#1ABC9C', // Teal
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.leaveScrollContainer}
      bounces={false}
      overScrollMode="never">

      {leaveData.map((item, index) => (
        <View key={index} style={styles.cardWrapper}>
          <View 
            style={[
              styles.leaveCard, 
              { backgroundColor: cardColors[index % cardColors.length] }
            ]}>

            <View style={styles.tableHeader}>
              <Text style={styles.leaveType} numberOfLines={2}>
                {item.label}
              </Text>
            </View>

            <View style={styles.tableBody}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Available</Text>
                <Text style={styles.tableValue}>{item.available}</Text>
              </View>
              
              <View style={styles.tableDivider} />
              
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Used</Text>
                <Text style={styles.tableValue}>{item.used}</Text>
              </View>
            </View>

          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default LeaveBalanceCards;


const styles = StyleSheet.create({
  leaveScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  cardWrapper: {
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  leaveCard: {
    width: 180,
    height: 130,
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
  },

  tableHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  leaveType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 20,
  },

  tableBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  tableDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 6,
  },

  tableLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  tableValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
