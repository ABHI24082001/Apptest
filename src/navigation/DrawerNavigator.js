import React, {useState, useEffect} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {TouchableOpacity, View, StyleSheet, Platform} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Menu, Provider} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // <- ADD THIS
import CustomDrawer from '../component/CustomDrawer';
import BottomTabNavigator from './BottomTabNavigator';
import NotificationScreen from '../screens/NotificationScreen';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'

const Drawer = createDrawerNavigator();

// ---------------- Notification Button ----------------
const NotificationButton = ({navigation}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(2, {duration: 1200}), -1, false);
    opacity.value = withRepeat(withTiming(0, {duration: 1200}), -1, false);
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      style={{marginRight: 10}}>
      <MaterialIcons name="notifications-none" size={28} color="#000" />
      {/* Red Dot + Animated Wave */}
      <View style={styles.dotContainer}>
        <Animated.View style={[styles.wave, waveStyle]} />
        <View style={styles.dot} />
      </View>
    </TouchableOpacity>
  );
};

// ---------------- Profile Menu ----------------
const ProfileMenu = ({navigation}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={{marginRight: 10}}>
          <MaterialCommunityIcons
            name="account-circle"
            size={26}
            color="#000"
          />
        </TouchableOpacity>
      }>
      <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.navigate('Profile');
        }}
        leadingIcon={() => (
          <MaterialIcons name="person" size={20} color="#555" />
        )}
        title="My Profile"
      />
      <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.navigate('Setting');
        }}
        leadingIcon={() => (
          <MaterialIcons name="settings-suggest" size={20} color="#555" />
        )}
        title="Setting"
      />

      {/* <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.navigate('Exit');
        }}
        leadingIcon={() => (
          <MaterialIcons name="exit-to-app" size={20} color="#555" />
        )}
        title="Exit"
      /> */}
      <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        }}
        leadingIcon={() => (
          <MaterialIcons name="logout" size={20} color="#E74C3C" />
        )}
        title="Logout"
      />
    </Menu>
  );
};

// ---------------- Drawer Navigator ----------------
export default function DrawerNavigator() {
  return (
    <Provider>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        screenOptions={({navigation}) => ({
          headerShown: true,
          drawerStyle: {
            width: 300,
            backgroundColor: '#fff',
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            ...Platform.select({
              android: {
                elevation: 10,
              },
              ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: {width: 0, height: 5},
                shadowRadius: 10,
              },
            }),
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 10,
              }}>
              <NotificationButton navigation={navigation} />
              <ProfileMenu navigation={navigation} />
            </View>
          ),
          headerTitleAlign: 'left',
        })}>
        <Drawer.Screen
          name="Tabs"
          component={BottomTabNavigator}
          options={({route}) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
            let title = 'Dashboard';

            switch (routeName) {
              case 'Home':
                title = 'Dashboard';
                break;
              case 'Attendance':
                title = 'Attendance';
                break;
              case 'Exit':
                title = 'Exit Apply';
                break;
              case 'Payslip':
                title = 'Payslip';
                break;
              default:
                title = 'Dashboard';
            }

            return {
              title,
            };
          }}
        />

        <Drawer.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{title: 'Notifications'}}
        />
      </Drawer.Navigator>
    </Provider>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  dotContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 8,
    backgroundColor: 'red',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    zIndex: 2,
  },
});
