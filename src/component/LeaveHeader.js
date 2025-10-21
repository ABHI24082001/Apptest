// components/LeaveHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveHeader = ({
  title = 'Leave Application',
  subtitle = 'Please fill in the details below to submit your leave request.',
  iconName = 'calendar-account-outline',
  iconSize = 44,
  colors = ['#3B82F6', '#2563EB'],
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerSection, style]}>
      <Icon name={iconName} size={iconSize} color="#FFFFFF" />
      <Text style={[styles.headerText, titleStyle]}>{title}</Text>
      <Text style={[styles.subHeaderText, subtitleStyle]}>{subtitle}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 6,
  },
  subHeaderText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});

export default LeaveHeader;
