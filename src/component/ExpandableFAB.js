import React, {useState, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ExpandableFAB = ({navigation}) => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: false,
    }).start();
    setOpen(!open);
  };

  const leaveStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -90],
        }),
      },
    ],
    opacity: animation,
  };

  const expenseStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0],
        }),
      },
    ],
    opacity: animation,
  };

  const advanceStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 90],
        }),
      },
    ],
    opacity: animation,
  };

  const iconRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const {width} = Dimensions.get('window');

  return (
    <View style={[styles.fabContainer, {left: width / 2 - 27.5}]}>
      {/* Leave */}
      <Animated.View style={[styles.miniButton, leaveStyle]}>
        <TouchableOpacity onPress={() => navigation.navigate('LeaveScreen')}>
          <MaterialIcons name="event" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Expense */}
      <Animated.View style={[styles.miniButton, expenseStyle]}>
        <TouchableOpacity onPress={() => navigation.navigate('ExpenseScreen')}>
          <MaterialIcons name="money-off" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Advance */}
      <Animated.View style={[styles.miniButton, advanceStyle]}>
        <TouchableOpacity onPress={() => navigation.navigate('AdvanceScreen')}>
          <MaterialIcons name="trending-up" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main FAB with Gray Plus Icon */}
     
    </View>
  );
};

export default ExpandableFAB;

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 6, // Tweak this as needed
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#757575', // Text color matching icon color
    fontSize: 14, // Increased font size for better readability
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'Roboto', // Platform-specific font
  },

  mainFab: {
    
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  miniButton: {
    position: 'absolute',
    bottom: 65,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
