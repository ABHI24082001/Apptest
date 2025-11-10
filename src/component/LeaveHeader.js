// components/LeaveHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveHeader = ({
  title = 'Leave Application',
  subtitle = 'Please fill in the details below to submit your leave request.',
  iconName = 'calendar-account-outline',
  iconSize = 24,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icon name={iconName} size={iconSize} color="#3B82F6" />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.headerText, titleStyle]}>{title}</Text>
          <Text style={[styles.subHeaderText, subtitleStyle]}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffffff',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    fontWeight: '400',
  },
});

export default LeaveHeader;
