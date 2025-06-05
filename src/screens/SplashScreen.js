import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkFirstTime = async () => {
      const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
      if (hasLoggedIn === 'true') {
        navigation.replace('Main');
        return;
      }

      setTimeout(() => {
        navigation.replace('Main'); // Navigate to dashboard screen
      }, 3000); // Show splash screen for 3 seconds
    };

    checkFirstTime();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require('../assets/image/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});