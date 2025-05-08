import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

export default function SplashScreen({ navigation }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Fade in and scale up animation
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, { 
      duration: 1000,
      easing: Easing.out(Easing.exp) 
    });

    const timer = setTimeout(() => {
      // Fade out animation
      opacity.value = withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.exp)
      }, (finished) => {
        if (finished) runOnJS(navigation.replace)('Splash1');
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../assets/image/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Pure white background
  },
  logo: {
    width: 180, // Slightly larger logo
    height: 180,
  },
});