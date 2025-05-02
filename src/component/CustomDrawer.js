import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
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

const CustomDrawer = ({navigation}) => {
  const [selectedScreen, setSelectedScreen] = React.useState('Tabs');
  const avatarScale = useSharedValue(1);

  const menuItems = [
    {label: 'Home', icon: 'home-outline', activeIcon: 'home', screen: 'Tabs', params: {screen: 'Home'}},
    {label: 'Log Report', icon: 'file-document-outline', activeIcon: 'file-document', screen: 'LogReport'},
    {label: 'Apply Leave', icon: 'calendar-outline', activeIcon: 'calendar', screen: 'ApplyLeave'},
    {label: 'My Payslip', icon: 'file-certificate-outline', activeIcon: 'file-certificate', screen: 'MyPayslip'},
    {label: 'Payment Request', icon: 'currency-usd', activeIcon: 'currency-usd-circle', screen: 'PaymentRequest'},
    {label: 'My Expenses', icon: 'cash-minus', activeIcon: 'cash', screen: 'MyExpenses'},
  ];

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{scale: withSpring(avatarScale.value)}],
  }));

  const handleAvatarPress = () => {
    avatarScale.value = 0.95;
    setTimeout(() => (avatarScale.value = 1), 200);
  };

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
        }}
      >
        <Animated.View style={[styles.menuItem, animatedStyle]}>
          <MaterialCommunityIcons
            name={isActive ? activeIcon : icon}
            size={26}
            color={isActive ? '#3A5BA0' : '#5D6D7E'}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuLabel, {color: isActive ? '#3A5BA0' : '#5D6D7E'}]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <Animated.View style={[styles.profile, avatarStyle]}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.9}>
            <Image
              source={require('../assets/image/profile.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.subText}>Department: IT</Text>
        </Animated.View>

        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <DrawerItem key={index} {...item} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logout}
          onPress={() => navigation.reset({index: 0, routes: [{name: 'Login'}]})}
        >
          <MaterialCommunityIcons
            name="logout-variant"
            size={24}
            color="#E74C3C"
            style={styles.menuIcon}
          />
          <Text style={[styles.menuLabel, {color: '#E74C3C'}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 55,
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
      }
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
    fontSize: 22,
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
  footer: {
    padding: 25,
    borderTopWidth: 1,
    borderColor: '#D6DBDF',
    backgroundColor: '#fff',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CustomDrawer;
