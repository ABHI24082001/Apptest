import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const CustomBottomTab = ({
  navigation,
  currentRoute,
  animatedValue,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const tabItems = [
    {
      name: 'Main',
      label: 'Home',
      icon: 'home-analytics',
      activeIcon: 'home-analytics',
    },
    {
      name: 'ApplyLeave',
      label: 'Leave',
      icon: 'calendar',
      activeIcon: 'calendar',
    },
    {
      name: 'Actions',
      label: 'Actions',
      icon: 'apps',
      activeIcon: 'apps',
      isAction: true,
    },
    {
      name: 'LogReport',
      label: 'Attendance',
      icon: 'clock-check-outline',
      activeIcon: 'clock-check-outline',
    },
    {
      name: 'MyPayslip',
      label: 'Payslip',
      icon: 'file-certificate-outline',
      activeIcon: 'file-certificate-outline',
    },
  ];

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

  const handleTabPress = (item) => {
    if (item.isAction) {
      handleActionPress();
    } else {
      navigation.navigate(item.name);
    }
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateY}],
          },
          style,
        ]}>
        <View style={styles.tabBar}>
          {tabItems.map((item, index) => {
            const isActive = currentRoute === item.name;
            
            if (item.isAction) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButton}
                  onPress={() => handleTabPress(item)}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={['#4361ee', '#4fa2faff']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.actionButtonCircle}>
                    <Icon
                      name={item.icon}
                      size={26}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.actionButtonText}>{item.label}</Text>
                </TouchableOpacity>
              );
            }
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleTabPress(item)}
                style={styles.tabItem}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.iconContainer,
                    isActive && styles.focusedIconContainer,
                  ]}>
                  <Icon
                    name={isActive ? item.activeIcon : item.icon}
                    size={24}
                    color={isActive ? '#4a4a4a' : '#9e9e9e'}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? '#64748B' : '#64748B',
                      fontWeight: isActive ? '700' : '500',
                      opacity: isActive ? 1 : 0.9,
                    },
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

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
                <Icon
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
                  <Icon
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
                  <Icon
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
                  <Icon
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 75,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: '#ffffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    letterSpacing: -0.2,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#70747aff',
    fontSize: Platform.OS === 'ios' ? 12 : 11,
    marginTop: 4,
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
});

export default CustomBottomTab;
