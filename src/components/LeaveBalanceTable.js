import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const LeaveBalanceTable = ({ leaveData, isLoadingLeaveData }) => {
  if (isLoadingLeaveData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading leave balances...</Text>
      </View>
    );
  }
  
  if (!leaveData || leaveData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No leave balance data available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.leaveBalanceTable}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.leaveTypeColumn]}>Leave Type</Text>
        <Text style={[styles.tableHeaderText, styles.leaveDataColumn]}>Used</Text>
        <Text style={[styles.tableHeaderText, styles.leaveDataColumn]}>Available</Text>
      </View>
      
      <ScrollView style={styles.tableBody} nestedScrollEnabled={true}>
        {leaveData.map((leave, index) => (
          <View key={index} style={[
            styles.tableRow,
            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
          ]}>
            <Text style={[styles.tableCell, styles.leaveTypeColumn]} numberOfLines={1} ellipsizeMode="tail">
              {leave.label}
            </Text>
            <Text style={[styles.tableCell, styles.leaveDataColumn]}>
              {leave.used}
            </Text>
            <Text style={[styles.tableCell, styles.leaveDataColumn]}>
              {leave.available}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  leaveBalanceTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  leaveTypeColumn: {
    flex: 2,
    paddingRight: 5,
  },
  leaveDataColumn: {
    flex: 1,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 150, // Limit the height of the table
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 14,
    color: '#111827',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default LeaveBalanceTable;
