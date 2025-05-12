import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // <- ADD THIS
import {View, StyleSheet, Text, Platform, TouchableOpacity, Dimensions} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import Approvals from '../screens/Approvals';
import Attendance from '../screens/Attendance';
import Exit from '../screens/Exit';
import MyExit from '../screens/MyExit'
import ApplyLeaveScreen from '../screens/ApplyLeave';

import MyPaySlip from '../screens/Payslip';
import Animated, {
  Easing,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({navigation}) {
  const [open, setOpen] = useState(false);
  const animation = useSharedValue(0); // Use useSharedValue instead of Animated.Value

  const toggleMenu = () => {
    animation.value = withTiming(open ? 0 : 1, {
      duration: 300,
      easing: Easing.ease,
    });
    setOpen(!open);
  };

  const leaveStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(open ? -90 : 0, {duration: 300}),
        },
      ],
      opacity: withTiming(open ? 1 : 0),
    };
  });

  const expenseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(open ? 0 : 0, {duration: 300}),
        },
      ],
      opacity: withTiming(open ? 1 : 0),
    };
  });

  const advanceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(open ? 90 : 0, {duration: 300}),
        },
      ],
      opacity: withTiming(open ? 1 : 0),
    };
  });

  const iconRotation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(open ? '45deg' : '0deg', {duration: 300}),
        },
      ],
    };
  });

  const {width} = Dimensions.get('window');

  return (
    <View style={{flex: 1}}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
        
          tabBarIcon: ({color, size, focused}) => {
            const icons = {
              Dashboard: 'view-dashboard-outline',        // MaterialCommunityIcons
              Exit: 'exit-run',
              Attendance: 'calendar-month-outline',
              Payslip: 'file-document-outline', // ← fixed casing
            };

            const animatedIconStyle = useAnimatedStyle(() => {
              return {
                transform: [
                  {
                    scale: withTiming(focused ? 1.3 : 1, {
                      duration: 300,
                      easing: Easing.ease,
                    }),
                  },
                ],
              };
            });

            return (
              <Animated.View style={animatedIconStyle}>
                <MaterialCommunityIcons
                  name={icons[route.name]}
                  size={28}
                  color={color}
                />
              </Animated.View>
            );
          },
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? '#1E88E5' : '#757575',
                  fontWeight: focused ? 'bold' : 'normal',
                },
              ]}>
              {route.name}
            </Text>
          ),
          tabBarActiveTintColor: '#1E88E5',
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 80 : 70,
            paddingTop: Platform.OS === 'ios' ? 10 : 5,
            margin: Platform.OS === 'ios' ? 3: 1,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
           
          },
          tabBarButton: (props) => {
            if (route.name === 'Action') {
              return (
                <TouchableOpacity
                  {...props}
                  style={styles.actionButton}
                  onPress={toggleMenu}>
                  <MaterialIcons name="add" size={32} color="#1E88E5" />
                  <Text style={styles.actionButtonText}>Action</Text>
                </TouchableOpacity>
              );
            }
            return <TouchableOpacity {...props} />;
          },
        })}>
        <Tab.Screen name="Dashboard" component={HomeScreen} />
        <Tab.Screen name="Exit" component={MyExit} />
        <Tab.Screen name="Action" component={() => null} options={{tabBarLabel: () => null}} />
        <Tab.Screen name="Attendance" component={Attendance} />
        <Tab.Screen name="Payslip" component={MyPaySlip} />
      </Tab.Navigator>

      {/* Expandable FAB Component */}
      <View style={[styles.fabContainer, {left: width / 2 - 27.5}]}>
        {/* Leave Button */}
        <Animated.View style={[styles.miniButton, leaveStyle]}>
          <TouchableOpacity onPress={() => navigation.navigate('ApplyLeave')}>
            <MaterialIcons name="event" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Expense Button */}
        <Animated.View style={[styles.miniButton, expenseStyle]}>
          <TouchableOpacity onPress={() => navigation.navigate('MyExpenses')}>
            <MaterialIcons name="money-off" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Advance Button */}
        <Animated.View style={[styles.miniButton, advanceStyle]}>
          <TouchableOpacity onPress={() => navigation.navigate('Approvals')}>
            <MaterialIcons name="check" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB
        <TouchableOpacity
          style={styles.mainFab}
          onPress={toggleMenu}
          activeOpacity={0.7}>
          <MaterialIcons name="add" size={32} color="#1E88E5" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 7,
  },
  actionButtonText: {
    color: '#1E88E5',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
  },
  mainFab: {
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
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
