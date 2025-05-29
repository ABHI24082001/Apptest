// components/LeaveHeader.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveHeader = () => {
  return (
    <View style={styles.headerSection}>
      <Icon name="calendar-account-outline" size={40} color="#3B82F6" />
      <Text style={styles.headerText}>Leave application</Text>
      <Text style={styles.subHeaderText}>
        Please fill in the details below to submit your leave request
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LeaveHeader;