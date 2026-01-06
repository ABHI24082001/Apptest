import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Text,
  Animated,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { setAuthToken, setUserIdHeader } from '../utils/axiosInstance';
import { useAuth } from '../constants/AuthContext';


const SplashScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  // 🔹 Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(120)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);

    // 🎬 Splash animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(200),

      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 🔐 Auth check
    const checkAuthStatus = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2800));

        const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (
          hasLoggedIn === 'true' &&
          storedUser &&
          storedToken &&
          storedUserId
        ) {
          const userData = JSON.parse(storedUser);

          login(userData, storedToken, storedUserId);
          setAuthToken(storedToken);
          setUserIdHeader(storedUserId);

          navigation.replace('Main');
        } else {
          navigation.replace('Splash1');
        }
      } catch (error) {
        console.log('Splash error:', error);
        navigation.replace('Splash1');
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/image/image.png')}
      style={StyleSheet.absoluteFillObject}
      resizeMode= 'cover'

    >
      <LinearGradient
        colors={['#bcddff0c', '#42a4f50b']}
        style={styles.gradient}
      >

          <Animated.View
            style={[
              styles.centerContent,
              { opacity: fadeAnim },
            ]}
          >
            {/* Logo + App Name */}
            <Animated.View
              style={[
                styles.mainRow,
                {
                  transform: [
                    { translateX: slideAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <View style={styles.logoBox}>
                <Image
                  source={require('../assets/image/Cloud.png')}
                  style={styles.logo}
                />
              </View>

              <Text style={styles.appName}>HRMS</Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View
              style={[
                styles.subtitleWrapper,
                { opacity: subtitleFadeAnim },
              ]}
            >
              <Text style={styles.subtitle}>
                Human Resource Management
              </Text>
              <Text style={styles.tagline}>
                Manage Your Workforce Smarter
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              { opacity: subtitleFadeAnim },
            ]}
          >
            <Text style={styles.version}>v1.2.0</Text>
          </Animated.View>
        
      </LinearGradient>
    </ImageBackground>
  );
};

export default SplashScreen;


const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },

  logoBox: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    elevation: 8,
    shadowColor: '#2195f3ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  logo: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },

  appName: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },

  subtitleWrapper: {
    alignItems: 'center',
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757272ff',
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 14,
    color: '#747272ff',
    letterSpacing: 0.8,
  },

  footer: {
    alignItems: 'center',
    paddingBottom: 28,
  },

  version: {
    fontSize: 11,
    color: '#90caf9',
    letterSpacing: 1,
  },
});
