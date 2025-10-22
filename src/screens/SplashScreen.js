import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setUserIdHeader } from '../utils/axiosInstance';
import { useAuth } from '../constants/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Pause on splash screen for a minimum duration
        const splashTimeout = new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if user is already logged in
        const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        
        // Wait for minimum splash duration
        await splashTimeout;
        
        if (hasLoggedIn === 'true' && storedUser && storedToken && storedUserId) {
          console.log('✅ Found stored credentials, auto-logging in');
          
          // Set the authentication state
          const userData = JSON.parse(storedUser);
          login(userData, storedToken, storedUserId);
          
          // Set headers for axios
          setAuthToken(storedToken);
          setUserIdHeader(storedUserId);
          
          // Navigate to Main screen
          navigation.replace('Main');
        } else {
          // Show the onboarding sequence or login screen
          navigation.replace('Splash1');
        }
      } catch (error) {
        console.error('❌ Error in splash screen auth check:', error);
        navigation.replace('Splash1');
      }
    };

    checkAuthStatus();
  }, [navigation]);

  return (
    <LinearGradient 
      colors={['#1E40AF', '#2563EB', '#3B82F6']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/image/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 150,
    height: 150,
  },
});

export default SplashScreen;