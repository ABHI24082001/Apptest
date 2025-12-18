import React from 'react';
import {View, Text, StatusBar, Platform, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../Stylesheet/dashboardcss';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const HeaderSection = ({
  employeeName = 'Employee',
  currentTime = '',
  currentDate = '', 
  checkedIn = false,
  checkInTime = null,
  showStatusBadge = true,
  style = {},
  absolute = false, // New prop to control absolute positioning
}) => {
  // Format time helper
  const formatLoginTime = time => {
    const parseCheckInTime = val => {
      if (val == null) return null;
      if (typeof val === 'number' && !isNaN(val)) return val;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const asNumber = Number(trimmed);
        if (!isNaN(asNumber)) return asNumber;
        const parsedIso = Date.parse(trimmed);
        if (!isNaN(parsedIso)) return parsedIso;
        const timeMatch = trimmed.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          const now = new Date();
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const seconds = parseInt(timeMatch[3], 10);
          const dt = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            seconds,
          );
          return dt.getTime();
        }
      }
      return null;
    };

    const ms = parseCheckInTime(time);
    if (!ms) return '';
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  // Calculate safe area heights
  // const getHeaderHeight = () => {
  //   const baseHeight = showStatusBadge ? 180 : 140;
  //   const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  //   return baseHeight + statusBarHeight;
  // };

  // Header container style with absolute positioning option
  const headerContainerStyle = [
    styles.headerContainer,
    absolute && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: getHeaderHeight(),
    },
    style,
  ];

  return (
    <>
      {/* <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      /> */}
      <LinearGradient 
        colors={['#1E40AF', '#2563EB', '#3B82F6']} 
        style={headerContainerStyle}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 1}}
      >
        <View style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerGreeting}>Welcome back!</Text>
              <Text style={styles.headerName}>{employeeName}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.timeContainer}>
                <Text style={styles.headerTime}>{currentTime}</Text>
                <Text style={styles.headerDate}>{currentDate}</Text>
              </View>
            </View>
          </View>

          {/* Status Badge */}
          {showStatusBadge && (
            <View style={styles.statusBadgeContainer}>
              <View style={styles.statusBadge}>
                <View style={styles.statusContent}>
                  <View
                    style={[
                      styles.statusDot,
                      checkedIn ? styles.statusActive : styles.statusInactive,
                    ]}
                  />
                  <View style={styles.statusTextContainer}>
                    <Text style={styles.statusLabel}>
                      {checkedIn ? 'Checked In' : 'Not Checked In'}
                    </Text>
                    {checkedIn && checkInTime && (
                      <Text style={styles.statusTime}>
                        {formatLoginTime(checkInTime)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </>
  );
};

// Export a simplified version for navigation headerBackground
export const GradientHeader = ({style = {}}) => (
  <LinearGradient 
    colors={['#1E40AF', '#2563EB', '#3B82F6']} 
    style={[
      {
        flex: 1,
        borderBottomLeftRadius: 0, 
        borderBottomRightRadius: 0
      }, 
      style
    ]}
    start={{x: 0, y: 0}}
    end={{x: 0, y: 1}}
  />
);

// Export header height calculator for proper content padding
export const getHeaderHeight = (showStatusBadge = true) => {
  const baseHeight = showStatusBadge ? 180 : 140;
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  return baseHeight + statusBarHeight;
};

export default HeaderSection;