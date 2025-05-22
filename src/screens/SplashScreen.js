import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
  withSpring,
  withRepeat,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Main animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoRotation = useSharedValue(0);
  
  // Background effects
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0.3);
  
  // Particle effects
  const particleValues = Array(6).fill(0).map(() => ({
    x: useSharedValue(0),
    y: useSharedValue(0),
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
  }));
  
  // Glow effect
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  // Enhanced white glow effect
  const enhancedGlowScale = useSharedValue(1);
  const enhancedGlowOpacity = useSharedValue(0.5);

  // useEffect(() => {
  //   // Initial delay
  //   const initialDelay = 300;
    
  //   // Main ripple animation
  //   rippleScale.value = withSequence(
  //     withDelay(initialDelay, 
  //       withTiming(0.1, { duration: 100 })
  //     ),
  //     withTiming(4, {
  //       duration: 1200,
  //       easing: Easing.bezier(0.25, 1, 0.5, 1),
  //     })
  //   );
    
  //   rippleOpacity.value = withSequence(
  //     withDelay(initialDelay,
  //       withTiming(0.4, { duration: 200 })
  //     ),
  //     withTiming(0, { duration: 2000, easing: Easing.out(Easing.cubic) })
  //   );

  //   // Logo animations with bounce effect
  //   logoScale.value = withSequence(
  //     withDelay(initialDelay + 200,
  //       withSpring(1.1, { 
  //         damping: 12,
  //         stiffness: 100,
  //       })
  //     ),
  //     withSpring(1, { 
  //       damping: 15,
  //       stiffness: 120,
  //     })
  //   );
    
  //   logoOpacity.value = withDelay(initialDelay + 200,
  //     withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
  //   );
    
  //   // Subtle rotation for dynamic effect
  //   logoRotation.value = withDelay(initialDelay + 200, 
  //     withSequence(
  //       withTiming(0.1, { duration: 300, easing: Easing.inOut(Easing.quad) }),
  //       withTiming(-0.1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
  //       withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) })
  //     )
  //   );
    
  //   // Glow effect animation
  //   glowScale.value = withDelay(initialDelay + 400, 
  //     withSequence(
  //       withTiming(1.2, { duration: 800, easing: Easing.out(Easing.cubic) }),
  //       withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) })
  //     )
  //   );
    
  //   glowOpacity.value = withDelay(initialDelay + 400,
  //     withSequence(
  //       withTiming(0.4, { duration: 800 }),
  //       withTiming(0.2, { duration: 600 })
  //     )
  //   );
    
  //   // Enhanced white glow animation
  //   enhancedGlowScale.value = withRepeat(
  //     withSequence(
  //       withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.cubic) }),
  //       withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) })
  //     ),
  //     -1, // Infinite repeat
  //     true // Reverse direction
  //   );

  //   enhancedGlowOpacity.value = withRepeat(
  //     withSequence(
  //       withTiming(0.7, { duration: 1000 }),
  //       withTiming(0.5, { duration: 800 })
  //     ),
  //     -1, // Infinite repeat
  //     true // Reverse direction
  //   );

  //   // Animate particles
  //   particleValues.forEach((particle, index) => {
  //     // Random direction and distance
  //     const angle = (Math.PI * 2 * index) / particleValues.length;
  //     const distance = 120 + Math.random() * 50;
      
  //     particle.x.value = withDelay(
  //       initialDelay + 500 + index * 50,
  //       withTiming(Math.cos(angle) * distance, {
  //         duration: 800 + Math.random() * 400,
  //         easing: Easing.out(Easing.cubic),
  //       })
  //     );
      
  //     particle.y.value = withDelay(
  //       initialDelay + 500 + index * 50,
  //       withTiming(Math.sin(angle) * distance, {
  //         duration: 800 + Math.random() * 400,
  //         easing: Easing.out(Easing.cubic),
  //       })
  //     );
      
  //     particle.scale.value = withDelay(
  //       initialDelay + 500 + index * 50,
  //       withSequence(
  //         withTiming(0.6 + Math.random() * 0.4, { duration: 400 }),
  //         withTiming(0, { 
  //           duration: 600 + Math.random() * 300,
  //           easing: Easing.out(Easing.cubic),
  //         })
  //       )
  //     );
      
  //     particle.opacity.value = withDelay(
  //       initialDelay + 500 + index * 50,
  //       withSequence(
  //         withTiming(0.6 + Math.random() * 0.4, { duration: 400 }),
  //         withTiming(0, { 
  //           duration: 600 + Math.random() * 300,
  //           easing: Easing.out(Easing.cubic),
  //         })
  //       )
  //     );
  //   });

  //   // Navigate after animation
  //   const timer = setTimeout(() => {
  //     // Fade out animation
  //     logoOpacity.value = withTiming(0, {
  //       duration: 600,
  //       easing: Easing.in(Easing.exp),
  //     }, (finished) => {
  //       if (finished) runOnJS(navigation.replace)('Splash1');
  //     });
      
  //     logoScale.value = withTiming(0.5, {
  //       duration: 600,
  //       easing: Easing.in(Easing.exp),
  //     });
      
  //     glowOpacity.value = withTiming(0, { duration: 400 });
      
  //   }, 2800);

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    const checkFirstTime = async () => {
      const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
      if (hasLoggedIn === 'true') {
        navigation.replace('Main'); // Or 'Main' if already authenticated
        return;
      }
  
      // All your existing animation logic here...
      const timer = setTimeout(() => {
        logoOpacity.value = withTiming(0, {
          duration: 600,
          easing: Easing.in(Easing.exp),
        }, (finished) => {
          if (finished) runOnJS(navigation.replace)('Splash1');
        });
  
        logoScale.value = withTiming(0.5, {
          duration: 600,
          easing: Easing.in(Easing.exp),
        });
  
        glowOpacity.value = withTiming(0, { duration: 400 });
      }, 2800);
  
      return () => clearTimeout(timer);
    };
  
    checkFirstTime();
  }, []);


  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value * 30}deg` }
    ],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));
  
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));
  
  const enhancedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enhancedGlowScale.value }],
    opacity: enhancedGlowOpacity.value,
  }));
  
  // Generate particle styles
  const particleStyles = particleValues.map((particle) => 
    useAnimatedStyle(() => ({
      transform: [
        { translateX: particle.x.value },
        { translateY: particle.y.value },
        { scale: particle.scale.value }
      ],
      opacity: particle.opacity.value,
    }))
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Ripple Circle Background */}
      <Animated.View style={[styles.ripple, rippleStyle]} />
      
      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Enhanced White Glow effect */}
      <Animated.View style={[styles.enhancedGlow, enhancedGlowStyle]} />

      {/* Logo Animation */}
      <Animated.View style={logoStyle}>
        <Image
          source={require('../assets/image/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Particle effects */}
      {particleStyles.map((style, index) => (
        <Animated.View 
          key={`particle-${index}`}
          style={[styles.particle, style]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#333',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#444',
    shadowColor: '#666',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  enhancedGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 15,
  },
  logo: {
    width: 150,
    height: 150,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});