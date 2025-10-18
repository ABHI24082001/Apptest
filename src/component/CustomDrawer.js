import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../constants/AuthContext';
import AppSafeArea from '../component/AppSafeArea';

import axiosInstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
const CustomDrawer = ({navigation}) => {
  const [selectedScreen, setSelectedScreen] = React.useState('Tabs');
  const [isLogExpanded, setIsLogExpanded] = React.useState(false);
  const [isRequestExpanded, setIsRequestExpanded] = React.useState(false);
  const [isRequestExpandedDetails, setIsRequestExpandedDetails] =
    React.useState(false);

  const avatarScale = useSharedValue(1);

  const {logout} = useAuth();
  const handleLogout = async () => {
    try {
      console.log('Starting logout from CustomDrawer...');
      await logout(); // ✅ Clear user and AsyncStorage
      console.log('Logout successful, navigating to Login screen');
      
      // Ensure we reset the navigation stack to prevent going back
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}], // ✅ Navigate to Login
      });
    } catch (error) {
      console.error('Logout Error in CustomDrawer:', error);
      // Even if there's an error during logout, try to navigate to Login
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'view-dashboard-outline',
      activeIcon: 'view-dashboard-outline',
      screen: 'Tabs',
      params: {screen: 'Home'},
    },
    {
      label: 'Apply Leave',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
      screen: 'ApplyLeave',
    },
    {
      label: 'My Payslip',
      icon: 'file-certificate-outline',
      activeIcon: 'file-certificate',
      screen: 'MyPayslip',
    },
    // {label: 'My Expenses', icon: 'cash-minus', activeIcon: 'cash', screen: 'MyExpenses'},
    {
      label: 'Payment Request',
      icon: 'cash-plus',
      activeIcon: 'cash-plus',
      screen: 'PaymentRequest',
    },
    {
      label: 'Exit Apply',
      icon: 'exit-to-app',
      activeIcon: 'exit-to-app',
      screen: 'Exit',
    },
    // {label: 'LeaveReport', icon: 'calendar-outline' , activeIcon: 'calendar',  screen: 'LeaveReport'},
    // {
    //   label: 'LeaveDetails',
    //   icon: 'calendar-outline',
    //   activeIcon: 'calendar',
    //   screen: 'LeaveRequestDetails',
    // },
    // {
    //   label: 'ExpenseDetails',
    //   icon: 'calendar-outline',
    //   activeIcon: 'calendar',
    //   screen: 'ExpenseRequestDetails',
    // },
    // {
    //   label: 'ExitRequest Details',
    //   icon: 'calendar-outline',
    //   activeIcon: 'calendar',
    //   screen: 'ExitRequestDetails',
    // },
  ];

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{scale: withSpring(avatarScale.value)}],
  }));



  const DrawerItem = ({icon, activeIcon, label, screen, params}) => {
    const isActive = selectedScreen === screen;
    const animatedScale = useSharedValue(1);
    const animatedBg = useSharedValue('transparent');

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: withTiming(animatedScale.value, {duration: 200})}],
      backgroundColor: withTiming(animatedBg.value, {duration: 300}),
      borderRadius: 12,
      padding: 10,
    }));

    React.useEffect(() => {
      animatedScale.value = isActive ? 1.05 : 1;
      animatedBg.value = isActive ? '#E3EBF6' : 'transparent';
    }, [isActive]);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setSelectedScreen(screen);
          navigation.navigate(screen, params);
        }}>
        <Animated.View style={[styles.menuItem, animatedStyle]}>
          <MaterialCommunityIcons
            name={isActive ? activeIcon : icon}
            size={26}
            color={isActive ? '#3A5BA0' : '#5D6D7E'}
            style={styles.menuIcon}
          />
          <Text
            style={[
              styles.menuLabel,
              {color: isActive ? '#3A5BA0' : '#5D6D7E'},
            ]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };
  const [visible, setVisible] = useState(false);

  const [imageUrl, setImageUrl] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const {user} = useAuth();

  console.log(user, 'User============ Data');
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (user?.id) {
          const response = await axiosInstance.get(
            `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${user.id}`,
          );
          setEmployeeData(response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [user]);

  useEffect(() => {
    // Always log the user object for debugging
    console.log('ProfileMenu user:', user);

    if (user?.empImage) {
      // Use the static image URL directly
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${user.empImage}`;
      setImageUrl(staticImageUrl);
    } else {
      setImageUrl(null);
    }
  }, [user?.empImage]);


  console.log('employee avatar ➜', imageUrl);

  return (
    <AppSafeArea style={styles.container}>
      <View style={styles.contentContainer}>
        <ScrollView
          visible={visible}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.profile, avatarStyle]}>
            <TouchableOpacity  onPress={() => setVisible(true)} activeOpacity={0.9}>
              <Image
                source={
                  imageUrl ? {uri: imageUrl} : require('../assets/image/boy.png')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>

            {employeeData && (
              <>
                <Text style={styles.name}>{employeeData?.employeeName}</Text>
                <Text style={styles.subText}>{employeeData.designationName}</Text>
              </>
            )}
          </Animated.View>

          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <DrawerItem key={index} {...item} />
            ))}

            {/* Collapsible Log Report Section */}
            {/* Collapsible Report Section */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsLogExpanded(!isLogExpanded)}
              style={[styles.menuItem, {justifyContent: 'space-between'}]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={26}
                  color="#5D6D7E"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}> My Reports</Text>
              </View>
              <MaterialCommunityIcons
                name={isLogExpanded ? 'chevron-down' : 'chevron-right'}
                size={24}
                color="#5D6D7E"
              />
            </TouchableOpacity>

            {isLogExpanded && (
              <>
                {/* Log Report */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('LogReport');
                    navigation.navigate('LogReport');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Log Report
                  </Text>
                </TouchableOpacity>

                {/* My Expenses */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('MyExpenses');
                    navigation.navigate('MyExpenses');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    My Expenses
                  </Text>
                </TouchableOpacity>

                {/* Leave Report */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('LeaveReport');
                    navigation.navigate('LeaveReport');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Leave Report
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Collapsible Requests Section */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsRequestExpanded(!isRequestExpanded)}
              style={[styles.menuItem, {justifyContent: 'space-between'}]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialCommunityIcons
                  name="file-multiple-outline"
                  size={26}
                  color="#5D6D7E"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>My Requests </Text>
              </View>
              <MaterialCommunityIcons
                name={isRequestExpanded ? 'chevron-down' : 'chevron-right'}
                size={24}
                color="#5D6D7E"
              />
            </TouchableOpacity>

            {isRequestExpanded && (
              <>
                {/* Leave Request */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('LeaveRequstStatus');
                    navigation.navigate('LeaveRequstStatus');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Leave Request
                  </Text>
                </TouchableOpacity>

                {/* Expense Request */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('ExpenseRequestStatus');
                    navigation.navigate('ExpenseRequestStatus');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Expense Request
                  </Text>
                </TouchableOpacity>

                {/* Exit Request */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('ExitRequestStatus');
                    navigation.navigate('ExitRequestStatus');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="exit-to-app"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Exit Request
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Collapsible Requests  Details Section */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setIsRequestExpandedDetails(!isRequestExpandedDetails)
              }
              style={[styles.menuItem, {justifyContent: 'space-between'}]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialCommunityIcons
                  name="file-eye-outline"
                  size={26}
                  color="#5D6D7E"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>Employees' Requests</Text>
              </View>
              <MaterialCommunityIcons
                name={isRequestExpandedDetails ? 'chevron-down' : 'chevron-right'}
                size={24}
                color="#5D6D7E"
              />
            </TouchableOpacity>

            {isRequestExpandedDetails && (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('LeaveRequestDetails');
                    navigation.navigate('LeaveRequestDetails');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Leave Request
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('ExpenseRequestDetails');
                    navigation.navigate('ExpenseRequestDetails');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Expense Request
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedScreen('ExitRequestDetails');
                    navigation.navigate('ExitRequestDetails');
                  }}
                  style={[
                    styles.menuItem,
                    {
                      marginLeft: 40,
                      backgroundColor: '#E3EBF6',
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="exit-to-app"
                    size={24}
                    color="#3A5BA0"
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: '#3A5BA0'}]}>
                    Exit Request
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}>
          <MaterialCommunityIcons
            name="logout-variant"
            size={24}
            color="#E74C3C"
            style={styles.menuIcon}
          />
          <Text style={[styles.menuLabel, {color: '#E74C3C'}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 3},
      },
    }),
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3A5BA0',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  subText: {
    fontSize: 14,
    color: '#5D6D7E',
    marginTop: 6,
  },
  menuList: {
    paddingHorizontal: 25,
    marginTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    marginRight: 20,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34495E',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#D6DBDF',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});

// export default CustomDrawer;
//     fontSize: 17,
//     fontWeight: '600',
//     color: '#34495E',
//   },
//   footer: {
//     padding: 25,
//     borderTopWidth: 1,
//     borderColor: '#D6DBDF',
//     backgroundColor: '#fff',
//   },
//   logout: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
// });

export default CustomDrawer;
