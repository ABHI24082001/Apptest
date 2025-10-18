import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import Attendance from '../screens/Attendance';
import MyPaySlip from '../screens/Payslip';
import AppSafeArea from '../component/AppSafeArea';
import LinearGradient from 'react-native-linear-gradient';
import MyApplyLeave from '../screens/MyApplyLeave';
const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({navigation}) {
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];

  const handleActionPress = () => {
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleNavigate = screen => {
    closeModal();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 200);
  };

  return (
    <AppSafeArea>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({color, size, focused}) => {
            const icons = {
              Dashboard: 'home-analytics',
              Leave: 'calendar', // clean and perfectly symbolic for leave
              Attendance: 'clock-check-outline',
              Payslip: 'file-certificate-outline',
            };

            return (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.focusedIconContainer,
                ]}>
                <MaterialCommunityIcons
                  name={icons[route.name]}
                  size={24}
                  color={focused ? '#4a4a4a' : '#9e9e9e'}
                />
              </View>
            );
          },
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? '#4a4a4a' : '#9e9e9e',
                  fontWeight: focused ? '600' : '400',
                },
              ]}>
              {route.name}
            </Text>
          ),
          tabBarActiveTintColor: '#4a4a4a',
          tabBarInactiveTintColor: '#9e9e9e',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 75,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 28 : 14,
            backgroundColor: '#ffffffff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          },
          tabBarItemStyle: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarButton: props => {
            if (route.name === 'Action') {
              return (
                <TouchableOpacity
                  {...props}
                  style={styles.actionButton}
                  onPress={handleActionPress}>
                  <LinearGradient
                    colors={['#4361ee', '#4fa2faff']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.actionButtonCircle}>
                    <MaterialCommunityIcons
                      name="apps"
                      size={26}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.actionButtonText}>Actions</Text>
                </TouchableOpacity>
              );
            }
            return <TouchableOpacity {...props} />;
          },
        })}>
        <Tab.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{
            title: 'Home',
            tabBarLabel: ({focused}) => (
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? '#64748B' : '#64748B',
                    fontWeight: focused ? '700' : '500',
                    opacity: focused ? 1 : 0.9,
                    letterSpacing: -0.2,
                  },
                ]}>
                Home
              </Text>
            ),
          }}
        />
        <Tab.Screen name="Leave" component={MyApplyLeave} />
        <Tab.Screen
          name="Action"
          component={() => null}
          options={{tabBarLabel: () => null}}
        />
        <Tab.Screen name="Attendance" component={Attendance} />
        <Tab.Screen name="Payslip" component={MyPaySlip} />
      </Tab.Navigator>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <LinearGradient
              colors={['#f8f9fa', '#e9ecef']}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color="#0b0b0bff"
                />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('ApplyLeave')}>
                <LinearGradient
                  colors={['#4361ee', '#4fa2faff']}
                  style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="calendar-plus"
                    size={28}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={styles.actionLabel}>Leave</Text>
                <Text style={styles.actionSubLabel}>Apply & Check</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('Exit')}>
                <LinearGradient
                  colors={['#4361ee', '#4fa2faff']}
                  style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="door-open"
                    size={28}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={styles.actionLabel}>Exit</Text>
                <Text style={styles.actionSubLabel}>Req & Check</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('PaymentRequest')}>
                <LinearGradient
                  colors={['#4361ee', '#4fa2faff']}
                  style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="cash-register"
                    size={28}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={styles.actionLabel}>Expense</Text>
                <Text style={styles.actionSubLabel}>Sub & Check</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 12,
    paddingTop: 4,
    marginBottom: 1,
  },
  focusedIconContainer: {
    backgroundColor: '#f5f5f5',
  },
  tabLabel: {
    fontSize: Platform.OS === 'ios' ? 12 : 11,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    marginTop: 8,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  actionButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    color: '#70747aff',
    fontSize: Platform.OS === 'ios' ? 12 : 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4aff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 5,
  },
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    justifyContent: 'space-evenly',
  },
  actionCard: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: 140,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
    letterSpacing: -0.3,
    textAlign: 'center',
    height: 20,
  },
  actionSubLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: -0.2,
    height: 16,
  },

  recentSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  recentItemSubtitle: {
    fontSize: 12,
    color: '#777',
  },
});
