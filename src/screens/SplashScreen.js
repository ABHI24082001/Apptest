import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, StatusBar, Text, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setUserIdHeader } from '../utils/axiosInstance';
import { useAuth } from '../constants/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoSlideAnim = useRef(new Animated.Value(100)).current;
  const titleSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoSlideAnim, {
          toValue: 0,
          duration: 1200,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 800,
          delay: 600,
          useNativeDriver: true,
        }),
      ]).start();
    };

    startAnimations();

    const checkAuthStatus = async () => {
      try {
        // Pause on splash screen for a minimum duration
        const splashTimeout = new Promise(resolve => setTimeout(resolve, 3000));
        
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
      colors={['#8a8afa9f', '#007bff', '#c4d1fcff']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      {/* Background decorative elements */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
        
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ translateY: logoSlideAnim }]
            }
          ]}>
          <Image
            source={require('../assets/image/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.titleContainer,
            {
              transform: [{ translateY: titleSlideAnim }]
            }
          ]}>
          <Text style={styles.appTitle}>HRMS</Text>
          <Text style={styles.appSubtitle}>Human Resource Management</Text>
          
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundDecor: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  decorCircle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: -50,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logo: {
    width: 160,
    height: 160,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  loadingContainer: {
    marginTop: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
});

export default SplashScreen;