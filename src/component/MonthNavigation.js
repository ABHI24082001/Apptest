import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const MonthNavigation = ({ currentMonth, onChange }) => {
  const scaleLeft = useSharedValue(1);
  const scaleRight = useSharedValue(1);

  const animate = (direction) => {
    const scale = direction === 'prev' ? scaleLeft : scaleRight;
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    onChange(direction);
  };

  const animatedStyle = (scale) => useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Animated.View style={animatedStyle(scaleLeft)}>
          <Pressable onPress={() => animate('prev')} style={styles.iconWrapper}>
            <MaterialIcons name="chevron-left" size={28} color="#3F51B5" />
          </Pressable>
        </Animated.View>

        <Text style={styles.month}>{currentMonth.format('MMMM YYYY')}</Text>

        <Animated.View style={animatedStyle(scaleRight)}>
          <Pressable onPress={() => animate('next')} style={styles.iconWrapper}>
            <MaterialIcons name="chevron-right" size={28} color="#3F51B5" />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  container: {
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  month: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F51B5',
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 50,
  },
});

export default MonthNavigation;
