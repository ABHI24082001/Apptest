import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar, Dimensions, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

export default function SplashScreen({navigation}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, {duration: 2000}, (finished) => {
        if (finished) {
          runOnJS(navigation.replace)('Splash1');
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <LinearGradient
      colors={['#000000', '#0f0f0f', '#00BFFF']}
      style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require('../assets/image/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </LinearGradient>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#00BFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
});
