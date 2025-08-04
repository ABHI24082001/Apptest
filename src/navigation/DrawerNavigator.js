import React, {useState, useEffect} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
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
import {useAuth} from '../constants/AuthContext';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BASE_URL from '../constants/apiConfig';
import axiosinstance from '../utils/axiosInstance';

const Drawer = createDrawerNavigator();

// ---------------- Notification Button ----------------
const NotificationButton = ({navigation}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [visible, setVisible] = useState(false);
  const {user} = useAuth();
  const [hasNotification, setHasNotification] = useState(false); // <-- new state

  useEffect(() => {
    scale.value = withRepeat(withTiming(2, {duration: 1200}), -1, false);
    opacity.value = withRepeat(withTiming(0, {duration: 1200}), -1, false);

    const fetchNotifications = async () => {
      try {
        const companyId = user?.childCompanyId;
        const userId = user?.id ;
        if (companyId && userId) {
          const response = await axiosinstance.get(
            `${BASE_URL}/Email/GetAllNotificationByEmployeeIdWithSenderDetails/${companyId}/${userId}`,
          );
          console.log('Notification API d==================================:', response.data);
          // Set notification state based on response
          setHasNotification(
            response.data && (
              Array.isArray(response.data) ? response.data.length > 0 : Object.keys(response.data).length > 0
            )
          );
        }
      } catch (error) {
        console.log('Notification API error:', error);
        setHasNotification(false);
      }
    };

    fetchNotifications();
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
      {hasNotification && (
        <View style={styles.dotContainer}>
          <Animated.View style={[styles.wave, waveStyle]} />
          <View style={styles.dot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ---------------- Profile Menu ----------------
const ProfileMenu = ({navigation}) => {
  const IMG_BASE_URL = 'https://hcmv2.anantatek.com/assets/UploadImg/';
  const [visible, setVisible] = useState(false);
  const {user} = useAuth();
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    // Always log the user object for debugging
    console.log('ProfileMenu user:', user);
    // debugger; // Debug here to inspect user object

    if (user?.empImage) {
      // Compose the direct image URL using empImage
      const directImageUrl = `${IMG_BASE_URL}${user.empImage}`;
      setImageUrl(directImageUrl);

      // Optionally, check if the image exists on the server
      const fetchUrl = `https://hcmv2.anantatek.com/UploadDocument/FetchFile?fileNameWithExtension=${user.empImage}`;
      fetch(fetchUrl, { method: 'GET' })
        .then(response => {
          console.log('Profile image fetch URL:', fetchUrl);
          console.log('Profile image fetch response:', response);
          // debugger; // Debug here to inspect fetch response
          if (!response.ok) {
            setImageUrl(null);
          }
        })
        .catch(err => {
          console.log('Profile image fetch error:', err);
          setImageUrl(null);
        });
    } else {
      setImageUrl(null);
    }
  }, [user?.empImage]);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={{marginRight: 10}}>
          {imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#ccc',
              }}
              resizeMode="cover"
              onError={e =>
                console.log('⚠️ avatar load failed:', e.nativeEvent.error)
              }
            />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={26}
              color="#000"
            />
          )}
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
