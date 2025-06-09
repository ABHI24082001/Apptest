import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native'
import React, { useState, useRef } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, withSequence, withDelay } from 'react-native-reanimated'

const { width, height } = Dimensions.get('window');
const BEAD_COUNT = 108; // Traditional mala count
const BEAD_SIZE = 48;
const SPACING = 18;
const START_Y = 220;

const Setting = () => {
  const [count, setCount] = useState(0);
  const [beadIndex, setBeadIndex] = useState(0);
  const [radheList, setRadheList] = useState([]);
  const animY = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const centerTextAnim = useSharedValue(1);
  const countRef = useRef(0); // To maintain count for display
  
  // Flag to enable/disable auto-advancement
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const autoAdvanceRef = useRef(null);

  // Auto-advancement setup - only active if enabled
  React.useEffect(() => {
    if (autoAdvanceEnabled) {
      autoAdvanceRef.current = setInterval(() => {
        if (beadIndex < BEAD_COUNT) {
          handleRadheTap();
        } else {
          clearInterval(autoAdvanceRef.current);
        }
      }, 3000);
    }
    
    // Cleanup interval on unmount or when disabled
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
    };
  }, [beadIndex, autoAdvanceEnabled]);

  // Bead animation without vibration
  const handleRadheTap = () => {
    if (beadIndex < BEAD_COUNT) {
      // Remove vibration
      // Vibration.vibrate(40);
      
      // Update count and add to list
      const newCount = count + 1;
      countRef.current = newCount;
      setCount(newCount);
      
      // Make sure the list update happens after count is updated
      setTimeout(() => {
        setRadheList(list => [{ key: Date.now(), value: newCount }, ...list.slice(0, 9)]);
      }, 0);
      
      // Animate center text scale for emphasis
      centerTextAnim.value = withSequence(
        withTiming(1.3, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) })
      );
      
      // Button press animation
      scaleAnim.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
      
      // Move bead upward with a slight delay
      animY.value = withDelay(
        50,
        withTiming(
          (beadIndex + 1) * (BEAD_SIZE + SPACING),
          { duration: 700, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(setBeadIndex)(beadIndex + 1);
            }
          }
        )
      );
    }
  };

  // Animated styles
  const movingBeadStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -animY.value }]
  }));
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }));
  
  const centerTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerTextAnim.value }]
  }));

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgDecoration} />
      
      {/* Left flowers */}
      <View style={styles.leftFlowers}>
        <Text style={styles.flowerEmoji}>🌼</Text>
        <Text style={styles.flowerEmoji}>🌸</Text>
        <Text style={styles.flowerEmoji}>🌺</Text>
      </View>
      
      {/* Right flowers */}
      <View style={styles.rightFlowers}>
        <Text style={styles.flowerEmoji}>🌼</Text>
        <Text style={styles.flowerEmoji}>🌸</Text>
        <Text style={styles.flowerEmoji}>🌺</Text>
      </View>
      
      <Text style={styles.title}>🌸 राधे राधे 🌸</Text>
      
      {/* Krishna Ji Icon */}
      <View style={styles.krishnaContainer}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png' }}
          style={styles.krishnaIcon}
          resizeMode="contain"
        />
      </View>
      
      {/* Radhe Radhe counter display */}
      <View style={styles.radheColumn}>
        {radheList.map((item, idx) => (
          <View key={item.key} style={[
            styles.radheRow,
            idx === 0 ? styles.radheRowLatest : null
          ]}>
            <Text style={styles.radheBead}>🟤</Text>
            <Text style={styles.radheText}>राधे राधे #{item.value}</Text>
          </View>
        ))}
      </View>
      
      {/* Center counter display */}
      <Animated.View style={[styles.centerCounterContainer, centerTextStyle]}>
        <Text style={styles.centerCounterText}>{count}</Text>
      </Animated.View>
      
      {/* Tap button */}
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleRadheTap}
          activeOpacity={0.7}
          disabled={beadIndex >= BEAD_COUNT}
        >
          <Text style={styles.circleText}>🟤</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.radheCountText}>गिनती: {count}/{BEAD_COUNT}</Text>
      
      {/* Vertical Rudraksha beads */}
      <View style={styles.verticalArea}>
        {/* Static beads */}
        {Array.from({ length: Math.min(12, BEAD_COUNT) }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.rudrash,
              {
                top: START_Y - (i + 1) * (BEAD_SIZE + SPACING),
                opacity: beadIndex > i ? 1 : 0.25,
                position: 'absolute',
                left: width / 2 - BEAD_SIZE / 2,
                zIndex: BEAD_COUNT - i,
              },
            ]}
          />
        ))}
        
        {/* Animated moving bead */}
        {beadIndex < BEAD_COUNT && (
          <Animated.View
            style={[
              styles.rudrash,
              {
                top: START_Y,
                left: width / 2 - BEAD_SIZE / 2,
                position: 'absolute',
                zIndex: 100,
              },
              movingBeadStyle,
            ]}
          />
        )}
      </View>
    </View>
  )
}

export default Setting

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdd0', // Light yellow background
    alignItems: 'center',
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fffdd0',
    opacity: 0.5,
  },
  leftFlowers: {
    position: 'absolute',
    left: 10,
    top: 120,
    bottom: 120,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightFlowers: {
    position: 'absolute',
    right: 10,
    top: 120,
    bottom: 120,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flowerEmoji: {
    fontSize: 30,
    marginVertical: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 36,
    marginBottom: 10,
    color: '#a0522d',
    letterSpacing: 1,
    textAlign: 'center',
  },
  krishnaContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  krishnaIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#7c4700',
    backgroundColor: '#f5e8d7',
  },
  radheColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 30,
  },
  radheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: '#f5e8d7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#a0522d',
    shadowColor: '#a0522d',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  radheBead: {
    fontSize: 22,
    marginRight: 6,
  },
  radheText: {
    fontSize: 18,
    color: '#a0522d',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5e8d7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#a0522d',
    elevation: 3,
  },
  circleText: {
    fontSize: 32,
  },
  radheCountText: {
    fontSize: 19,
    color: '#a0522d',
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  verticalArea: {
    width: width,
    height: height * 0.6,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rudrash: {
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    backgroundColor: '#a0522d',
    borderWidth: 2,
    borderColor: '#d2b48c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  centerCounterContainer: {
    backgroundColor: '#fffbe8',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#a0522d',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  centerCounterText: {
    fontSize: 28,
    color: '#a0522d',
    fontWeight: '700',
  },
  radheRowLatest: {
    backgroundColor: '#ffedd5',
    borderWidth: 1.5,
    borderColor: '#c2410c',
  },
});
