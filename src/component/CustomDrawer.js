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
import LinearGradient from 'react-native-linear-gradient';

import {useAuth} from '../constants/AuthContext';
import AppSafeArea from '../component/AppSafeArea';

import axiosInstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';

// Add theme constants for consistent coloring & small UI tweaks
const ICON_COLOR = '#224F2B';
const ACTIVE_BG = 'rgba(34,79,43,0.08)'; // subtle green highlight
const INACTIVE_TEXT = '#5D6D7E';
const ACTIVE_TEXT = '#224F2B';

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
      label: 'Home',
      icon: 'view-dashboard-outline',
      activeIcon: 'view-dashboard',
      screen: 'Tabs',
      params: {screen: 'Home'},
    },
    {
      label: 'Apply Leave',
      icon: 'calendar-plus',
      activeIcon: 'calendar-plus',
      screen: 'ApplyLeave',
    },
    {
      label: 'My Payslip',
      icon: 'receipt',
      activeIcon: 'receipt',
      screen: 'MyPayslip',
    },
    {
      label: 'Payment Request',
      icon: 'bank-outline',
      activeIcon: 'bank',
      screen: 'PaymentRequest',
    },
    {
      label: 'Exit Apply',
      icon: 'location-exit',
      activeIcon: 'location-exit',
      screen: 'Exit',
    },
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
      paddingVertical: 12,
      paddingHorizontal: 14,
    }));

    React.useEffect(() => {
      animatedScale.value = isActive ? 1.03 : 1;
      animatedBg.value = isActive ? ACTIVE_BG : 'transparent';
    }, [isActive]);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.menuItemContainer}
        onPress={() => {
          setSelectedScreen(screen);
          navigation.navigate(screen, params);
        }}>
        <Animated.View style={[styles.menuItem, animatedStyle]}>
          <MaterialCommunityIcons
            name={isActive ? activeIcon : icon}
            size={26}
            color={ICON_COLOR}
            style={styles.menuIcon}
          />
          <Text
            style={[
              styles.menuLabel,
              {color: isActive ? ACTIVE_TEXT : INACTIVE_TEXT},
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

  // Add function to fetch image as base64
  const fetchImageAsBase64 = async (fileName) => {
    try {
      const fetchUrl = `https://hcmv2.anantatek.com/api/UploadDocument/FetchFile?fileNameWithExtension=${fileName}`;
      console.log('📡 Fetching profile image from drawer:', fetchUrl);

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
    // Use employeeData.empImage instead of user.empImage
    console.log('Employee Details empImage:', employeeData?.empImage);

    if (employeeData?.empImage) {
      // First try to fetch the image as base64 from the API
      fetchImageAsBase64(employeeData.empImage);
    } else {
      setImageUrl(null);
    }
  }, [employeeData?.empImage]);

  return (
    <AppSafeArea style={styles.container}>
      <View style={styles.contentContainer}>
        {/* // StatusBar for better header ui  */}
        <ScrollView
          visible={visible}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
         
         

          <LinearGradient
            colors={['#224F2B', '#224F2B', '#224F2B', '#224F2B']}
            style={[styles.profile]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Animated.View style={[avatarStyle, styles.profileContainer]}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity
                  onPress={() => setVisible(true)}
                  activeOpacity={0.9}>
                  <Image
                    source={
                      imageUrl
                        ? {uri: imageUrl}
                        : require('../assets/image/boy.png')
                    }
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              </View>
              {employeeData && (
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName} numberOfLines={1}>
                    {employeeData?.employeeName || 'Employee Name'}
                  </Text>
                  <Text style={styles.designation} numberOfLines={1}>
                    {employeeData?.designationName || 'Designation'}
                  </Text>
                </View>
              )}
            </Animated.View>
          </LinearGradient>

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
                  name="chart-line"
                  size={26}
                  color={ICON_COLOR}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, {color: INACTIVE_TEXT}]}>
                  {' '}
                  My Reports
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isLogExpanded ? 'chevron-down' : 'chevron-right'}
                size={24}
                color={ICON_COLOR}
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="file-chart"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="credit-card-multiple"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                  name="clipboard-list"
                  size={26}
                  color={ICON_COLOR}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, {color: INACTIVE_TEXT}]}>
                  My Requests{' '}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isRequestExpanded ? 'chevron-down' : 'chevron-right'}
                size={24}
                color={ICON_COLOR}
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="exit-to-app"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                  name="account-group"
                  size={26}
                  color={ICON_COLOR}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, {color: INACTIVE_TEXT}]}>
                  Employees' Requests
                </Text>
              </View>
              <MaterialCommunityIcons
                name={
                  isRequestExpandedDetails ? 'chevron-down' : 'chevron-right'
                }
                size={24}
                color={ICON_COLOR}
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="calendar-search"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="cash-check"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
                      backgroundColor: ACTIVE_BG,
                      borderRadius: 10,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="door-open"
                    size={24}
                    color={ICON_COLOR}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, {color: ACTIVE_TEXT}]}>
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
            name="power"
            size={24}
            color={ICON_COLOR}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuLabel, {color: ICON_COLOR}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
   profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 65 : 67,
  },
   avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  avatar: {
    // margin: 10,
    width: 120,
    marginLeft: 4,
    height: 120,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: '#f0f0f0',
  },
  
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: ACTIVE_TEXT,
  },
  subText: {
    fontSize: 14,
    color: INACTIVE_TEXT,
    marginTop: 6,
  },
  menuList: {
    paddingHorizontal: 25,
    marginTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
  },
  employeeInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  
  employeeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  
  designation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.9,
  },

  employeeIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  employeeId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});

export default CustomDrawer;
