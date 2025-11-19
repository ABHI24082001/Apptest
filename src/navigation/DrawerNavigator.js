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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CustomDrawer from '../component/CustomDrawer';
import BottomTabNavigator from './BottomTabNavigator';
import NotificationScreen from '../screens/NotificationScreen';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useAuth} from '../constants/AuthContext';

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
    const {logout} = useAuth();
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
      style={{marginRight: 10 ,  backgroundColor: 'rgba(255, 255, 255, 1)'  , borderRadius: 15 , padding:2}}>
      <MaterialIcons name="notifications" size={30} color="rgba(75, 142, 225, 1)" />
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
  const [visible, setVisible] = useState(false);
  const {user, logout} = useAuth();
  const [imageUrl, setImageUrl] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);

  // Fetch employee details
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (user?.id) {
          const response = await axiosinstance.get(
            `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${user.id}`,
          );
          setEmployeeDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [user?.id]);

  // Add function to fetch image as base64
  const fetchImageAsBase64 = async (fileName) => {
    try {
      const fetchUrl = `https://hcmv2.anantatek.com/api/UploadDocument/FetchFile?fileNameWithExtension=${fileName}`;
      console.log('📡 Fetching profile image from:', fetchUrl);

      const response = await fetch(fetchUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          
          if (result.base64File) {
            // Determine the file extension
            const extension = fileName.split('.').pop() || 'jpg';
            const imageUri = `data:image/${extension};base64,${result.base64File}`;
            setImageUrl(imageUri);
            console.log('✅ Profile image loaded successfully in drawer');
            return;
          }
        }
      }
      
      // Fallback to static URL if API fetch fails
      console.log('⚠️ API fetch failed, using static URL');
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${fileName}`;
      setImageUrl(staticImageUrl);
      
    } catch (error) {
      console.error('❌ Error fetching profile image:', error);
      // Fallback to static URL
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${fileName}`;
      setImageUrl(staticImageUrl);
    }
  };

  useEffect(() => {
    // Use employeeDetails.empImage instead of user.empImage
    console.log('Employee Details empImage:', employeeDetails?.empImage);

    if (employeeDetails?.empImage) {
      // First try to fetch the image as base64 from the API
      fetchImageAsBase64(employeeDetails.empImage);
    } else {
      setImageUrl(null);
    }
  }, [employeeDetails?.empImage]);
  
const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      await logout(); // ✅ Clear user and AsyncStorage
      console.log('Logout successful, navigating to Login screen');
      
      // Ensure we reset the navigation stack to prevent going back
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}], // ✅ Navigate to Login
      });
    } catch (error) {
      console.error('Logout Error:', error);
      // Even if there's an error during logout, try to navigate to Login
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };
  
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      contentStyle={styles.menuContainer}
      anchor={
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={{marginRight: 10 , backgroundColor: 'rgba(255, 255, 255, 1)'  , borderRadius: 15 , padding:2}}>
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
              size={30}
              color="rgba(75, 142, 225, 1)"
            />
          )}
        </TouchableOpacity>
      }>
      {/* <View style={styles.menuHeader}>
        <MaterialCommunityIcons name="account-circle" size={24} color="#4b8ee1ff" />
        <View style={styles.menuHeaderText}>
          <Text style={styles.menuUserName}>{user?.name || 'User'}</Text>
          <Text style={styles.menuUserEmail}>{user?.email || 'No email'}</Text>
        </View>
      </View> */}
      
      <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.navigate('Profile');
        }}
        leadingIcon={() => (
          <View style={styles.menuIconContainer}>
            <MaterialIcons name="person" size={24} color="rgba(75, 142, 225, 1)" />
          </View>
        )}
        style={styles.menuItem}
        titleStyle={styles.menuItemTitle}
        title="My Profile"
      />
      
      <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.navigate('Setting');
        }}
        leadingIcon={() => (
          <View style={styles.menuIconContainer}>
            <MaterialIcons name="settings-suggest" size={24} color="#4b8ee1ff" />
          </View>
        )}
        style={styles.menuItem}
        titleStyle={styles.menuItemTitle}
        title="Setting"
      />
      
      <Menu.Item
        onPress={() => {
          setVisible(false);
          handleLogout();
        }}
        leadingIcon={() => (
          <View style={styles.menuIconContainer}>
            <MaterialIcons name="logout" size={24} color="#4b8ee1ff" />
          </View>
        )}
        style={styles.menuItem}
        titleStyle={styles.menuItemTitle}
        title="Logout"
      />
    </Menu>
  );
};

// Create a custom header component with gradient
const GradientHeader = ({children, style}) => (
  <LinearGradient
    colors={['#1E40AF', '#2563EB']}
    style={[{flex: 1}, style]}
    start={{x: 0, y: 0}}
    end={{x: 0, y: 1}}>
    {children}
  </LinearGradient>
);

// ---------------- Drawer Navigator ----------------
export default function DrawerNavigator() {
  return (
    <Provider>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        screenOptions={({navigation}) => ({
          headerShown: true,
          headerBackground: () => (
            <GradientHeader style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} />
          ),
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
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
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{
                marginLeft: 25,
                marginRight: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 7,
              }}>
              <MaterialIcons name="grid-view" size={23} color="#FFFFFF" />
            </TouchableOpacity>
          ),
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
              case 'Leave':
                title = 'Leave Apply';
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
  // New menu styles
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: 200,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    height: 56,
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  menuIconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f7ff',
    borderRadius: 8,
  },
});
