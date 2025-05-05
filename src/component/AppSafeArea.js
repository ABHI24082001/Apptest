import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Platform, StyleSheet, StatusBar} from 'react-native';

const AppSafeArea = ({children}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7fafc',
    paddingTop: Platform.OS === 'android' ? -30 : -60, // manual fix for Android status bar
  },
});

export default AppSafeArea;
