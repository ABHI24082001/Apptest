
// touch


// import React, {useState, useRef} from 'react';
// import {
//   View,
//   StyleSheet,
//   Text,
//   Platform,
//   TouchableOpacity,
//   Dimensions,
//   Pressable,
//   Animated,
//   Easing,
// } from 'react-native';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import HomeScreen from '../screens/HomeScreen';
// import Attendance from '../screens/Attendance';
// import MyExit from '../screens/MyExit';
// import MyPaySlip from '../screens/Payslip';
// import Approvals from '../screens/Approvals';

// const Tab = createBottomTabNavigator();

// export default function BottomTabNavigator({navigation}) {
//   const [isVisible, setIsVisible] = useState(false);
//   const sheetAnim = useRef(new Animated.Value(0)).current;

//   const handleActionPress = () => {
//     setIsVisible(true);
//     Animated.timing(sheetAnim, {
//       toValue: 1,
//       duration: 300,
//       easing: Easing.out(Easing.ease),
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeSheet = () => {
//     Animated.timing(sheetAnim, {
//       toValue: 0,
//       duration: 250,
//       easing: Easing.in(Easing.ease),
//       useNativeDriver: true,
//     }).start(() => setIsVisible(false));
//   };

//   const translateY = sheetAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [300, 0],
//   });

//   const backdropOpacity = sheetAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 0.4],
//   });

//   const handleNavigate = (screen) => {
//     closeSheet();
//     navigation.navigate(screen);
//   };

//   return (
//     <View style={{flex: 1}}>
//       <Tab.Navigator
//         screenOptions={({route}) => ({
//           headerShown: false,
//           tabBarIcon: ({color, focused}) => {
//             const icons = {
//               Dashboard: 'view-dashboard-outline',
//               Exit: 'exit-run',
//               Attendance: 'calendar-month-outline',
//               Payslip: 'file-document-outline',
//             };
//             return (
//               <MaterialCommunityIcons
//                 name={icons[route.name]}
//                 size={28}
//                 color={color}
//                 style={{transform: [{scale: focused ? 1.3 : 1}]}}
//               />
//             );
//           },
//           tabBarLabel: ({focused}) => (
//             <Text
//               style={[
//                 styles.tabLabel,
//                 {
//                   color: focused ? '#1E88E5' : '#757575',
//                   fontWeight: focused ? 'bold' : 'normal',
//                 },
//               ]}>
//               {route.name}
//             </Text>
//           ),
//           tabBarActiveTintColor: '#1E88E5',
//           tabBarInactiveTintColor: '#757575',
//           tabBarStyle: {
//             height: Platform.OS === 'ios' ? 80 : 70,
//             paddingTop: Platform.OS === 'ios' ? 10 : 5,
//             backgroundColor: '#fff',
//             borderTopWidth: 1,
//             borderTopColor: '#e0e0e0',
//           },
//           tabBarButton: (props) => {
//             if (route.name === 'Action') {
//               return (
//                 <TouchableOpacity
//                   {...props}
//                   style={styles.actionButton}
//                   onPress={handleActionPress}>
//                   <MaterialCommunityIcons
//                     name="gesture-tap-button"
//                     size={32}
//                     color="#1E88E5"
//                   />
//                   <Text style={styles.actionButtonText}>Action</Text>
//                 </TouchableOpacity>
//               );
//             }
//             return <TouchableOpacity {...props} />;
//           },
//         })}>
//         <Tab.Screen name="Dashboard" component={HomeScreen} />
//         <Tab.Screen name="Exit" component={MyExit} />
//         <Tab.Screen name="Action" component={() => null} options={{tabBarLabel: () => null}} />
//         <Tab.Screen name="Attendance" component={Attendance} />
//         <Tab.Screen name="Payslip" component={MyPaySlip} />
//       </Tab.Navigator>

//       {/* Animated Bottom Sheet */}
//       {isVisible && (
//         <>
//           <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
//             <Animated.View
//               style={[styles.backdrop, {opacity: backdropOpacity}]}
//             />
//           </Pressable>

//           <Animated.View
//             style={[
//               styles.sheet,
//               {
//                 transform: [{translateY}],
//               },
//             ]}>
//             <Text style={styles.sheetTitle}>Quick Actions</Text>

//             <TouchableOpacity
//               style={styles.sheetBtn}
//               onPress={() => handleNavigate('ApplyLeave')}>
//               <MaterialIcons name="event-available" size={24} color="#1E88E5" />
//               <Text style={styles.sheetText}>Leave Approval</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.sheetBtn}
//               onPress={() => handleNavigate('Exit')}>
//               <MaterialCommunityIcons name="exit-run" size={24} color="#1E88E5" />
//               <Text style={styles.sheetText}>Exit Approval</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.sheetBtn}
//               onPress={() => handleNavigate('Approvals')}>
//               <MaterialIcons name="request-quote" size={24} color="#1E88E5" />
//               <Text style={styles.sheetText}>Expense Approval</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={closeSheet} style={styles.sheetCancel}>
//               <Text style={styles.sheetCancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   tabLabel: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   actionButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 7,
//   },
//   actionButtonText: {
//     color: '#1E88E5',
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   backdrop: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   sheet: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     backgroundColor: '#fff',
//     paddingTop: 20,
//     paddingBottom: 30,
//     paddingHorizontal: 25,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     elevation: 10,
//   },
//   sheetTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1E88E5',
//     marginBottom: 16,
//   },
//   sheetBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   sheetText: {
//     fontSize: 16,
//     marginLeft: 12,
//     color: '#424242',
//   },
//   sheetCancel: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   sheetCancelText: {
//     fontSize: 16,
//     color: '#E53935',
//     fontWeight: 'bold',
//   },
// });


// side menu 


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Platform,
// } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import HomeScreen from '../screens/HomeScreen';
// import Attendance from '../screens/Attendance';
// import MyExit from '../screens/MyExit';
// import MyPaySlip from '../screens/Payslip';
// import Approvals from '../screens/Approvals';

// const Tab = createBottomTabNavigator();

// export default function BottomTabNavigator({ navigation }) {
//   const [modalVisible, setModalVisible] = useState(false);

//   const handleNavigate = (screen) => {
//     setModalVisible(false);
//     navigation.navigate(screen);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => {
//             const icons = {
//               Dashboard: 'view-dashboard-outline',
//               Exit: 'exit-run',
//               Attendance: 'calendar-month-outline',
//               Payslip: 'file-document-outline',
//             };
//             return (
//               <MaterialCommunityIcons
//                 name={icons[route.name]}
//                 size={28}
//                 color={color}
//                 style={{ transform: [{ scale: focused ? 1.2 : 1 }] }}
//               />
//             );
//           },
//           tabBarLabel: ({ focused }) => (
//             <Text
//               style={{
//                 fontSize: 12,
//                 color: focused ? '#1E88E5' : '#757575',
//                 fontWeight: focused ? 'bold' : 'normal',
//               }}>
//               {route.name}
//             </Text>
//           ),
//           tabBarActiveTintColor: '#1E88E5',
//           tabBarInactiveTintColor: '#757575',
//           tabBarStyle: {
//             height: Platform.OS === 'ios' ? 80 : 65,
//             paddingTop: Platform.OS === 'ios' ? 10 : 5,
//             backgroundColor: '#fff',
//             borderTopWidth: 1,
//             borderTopColor: '#e0e0e0',
//           },
//         })}>
//         <Tab.Screen name="Dashboard" component={HomeScreen} />
//         <Tab.Screen name="Exit" component={MyExit} />
//         <Tab.Screen name="Attendance" component={Attendance} />
//         <Tab.Screen name="Payslip" component={MyPaySlip} />
//       </Tab.Navigator>

//       {/* Floating Action Button */}
//       <TouchableOpacity
//         onPress={() => setModalVisible(true)}
//         style={styles.fab}>
//         <MaterialIcons name="add" size={28} color="#fff" />
//       </TouchableOpacity>

//       {/* Modal for Quick Actions */}
//       <Modal
//         transparent
//         animationType="fade"
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}>
//         <TouchableOpacity
//           style={styles.modalBackdrop}
//           onPress={() => setModalVisible(false)}
//           activeOpacity={1}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Quick Actions</Text>

//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => handleNavigate('ApplyLeave')}>
//               <MaterialIcons name="event-available" size={22} color="#1E88E5" />
//               <Text style={styles.modalButtonText}>Leave Approval</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => handleNavigate('Exit')}>
//               <MaterialCommunityIcons name="exit-run" size={22} color="#1E88E5" />
//               <Text style={styles.modalButtonText}>Exit Approval</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalButton}
//               onPress={() => handleNavigate('Approvals')}>
//               <MaterialIcons name="request-quote" size={22} color="#1E88E5" />
//               <Text style={styles.modalButtonText}>Expense Approval</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => setModalVisible(false)}
//               style={styles.cancelButton}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   fab: {
//     position: 'absolute',
//     bottom: 90,
//     right: 20,
//     backgroundColor: '#1E88E5',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 6,
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1E88E5',
//     marginBottom: 16,
//   },
//   modalButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   modalButtonText: {
//     fontSize: 16,
//     marginLeft: 12,
//     color: '#424242',
//   },
//   cancelButton: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   cancelText: {
//     fontSize: 16,
//     color: '#E53935',
//     fontWeight: 'bold',
//   },
// });


// radaer

// import React, {useState} from 'react';
// import {
//   View,
//   StyleSheet,
//   Text,
//   Platform,
//   TouchableOpacity,
//   Dimensions,
//   Modal,
//   Pressable,
// } from 'react-native';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   Easing,
// } from 'react-native-reanimated';

// import HomeScreen from '../screens/HomeScreen';
// import Attendance from '../screens/Attendance';
// import MyExit from '../screens/MyExit';
// import MyPaySlip from '../screens/Payslip';
// import Approvals from '../screens/Approvals';

// const Tab = createBottomTabNavigator();
// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// export default function BottomTabNavigator({navigation}) {
//   const [modalVisible, setModalVisible] = useState(false);
//   const modalScale = useSharedValue(0);
//   const modalOpacity = useSharedValue(0);
//   const button1Opacity = useSharedValue(0);
//   const button2Opacity = useSharedValue(0);
//   const button3Opacity = useSharedValue(0);

//   const {width, height} = Dimensions.get('window');

//   const handleActionPress = () => {
//     setModalVisible(true);
//     modalScale.value = withSpring(1, {
//       damping: 15,
//       stiffness: 120,
//     });
//     modalOpacity.value = withTiming(1, {duration: 200});
    
//     // Stagger the button animations
//     setTimeout(() => {
//       button1Opacity.value = withTiming(1, {duration: 200});
//     }, 100);
//     setTimeout(() => {
//       button2Opacity.value = withTiming(1, {duration: 200});
//     }, 200);
//     setTimeout(() => {
//       button3Opacity.value = withTiming(1, {duration: 200});
//     }, 300);
//   };

//   const closeModal = () => {
//     button1Opacity.value = withTiming(0, {duration: 100});
//     button2Opacity.value = withTiming(0, {duration: 100});
//     button3Opacity.value = withTiming(0, {duration: 100});
//     modalScale.value = withTiming(0, {
//       duration: 200,
//       easing: Easing.ease,
//     });
//     modalOpacity.value = withTiming(0, {duration: 200});
//     setTimeout(() => setModalVisible(false), 200);
//   };

//   const handleNavigate = (screen) => {
//     closeModal();
//     setTimeout(() => navigation.navigate(screen), 250);
//   };

//   const modalAnimatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{scale: modalScale.value}],
//       opacity: modalOpacity.value,
//     };
//   });

//   const button1Style = useAnimatedStyle(() => {
//     return {
//       opacity: button1Opacity.value,
//       transform: [{translateY: withTiming(button1Opacity.value ? 0 : 20)}],
//     };
//   });

//   const button2Style = useAnimatedStyle(() => {
//     return {
//       opacity: button2Opacity.value,
//       transform: [{translateY: withTiming(button2Opacity.value ? 0 : 20)}],
//     };
//   });

//   const button3Style = useAnimatedStyle(() => {
//     return {
//       opacity: button3Opacity.value,
//       transform: [{translateY: withTiming(button3Opacity.value ? 0 : 20)}],
//     };
//   });

//   return (
//     <View style={{flex: 1}}>
//       <Tab.Navigator
//         screenOptions={({route}) => ({
//           headerShown: false,
//           tabBarIcon: ({color, size, focused}) => {
//             const icons = {
//               Dashboard: 'view-dashboard-outline',
//               Exit: 'exit-run',
//               Attendance: 'calendar-month-outline',
//               Payslip: 'file-document-outline',
//             };

//             const animatedIconStyle = {
//               transform: [{scale: focused ? 1.3 : 1}],
//             };

//             return (
//               <View style={animatedIconStyle}>
//                 <MaterialCommunityIcons
//                   name={icons[route.name]}
//                   size={28}
//                   color={color}
//                 />
//               </View>
//             );
//           },
//           tabBarLabel: ({focused}) => (
//             <Text
//               style={[
//                 styles.tabLabel,
//                 {
//                   color: focused ? '#1E88E5' : '#757575',
//                   fontWeight: focused ? 'bold' : 'normal',
//                 },
//               ]}>
//               {route.name}
//             </Text>
//           ),
//           tabBarActiveTintColor: '#1E88E5',
//           tabBarInactiveTintColor: '#757575',
//           tabBarStyle: {
//             height: Platform.OS === 'ios' ? 80 : 70,
//             paddingTop: Platform.OS === 'ios' ? 10 : 5,
//             margin: Platform.OS === 'ios' ? 3 : 1,
//             backgroundColor: '#fff',
//             borderTopWidth: 1,
//             borderTopColor: '#e0e0e0',
//           },
//           tabBarButton: (props) => {
//             if (route.name === 'Action') {
//               return (
//                 <TouchableOpacity
//                   {...props}
//                   style={styles.actionButton}
//                   onPress={handleActionPress}>
//                   <Animated.View style={styles.actionButtonInner}>
//                     <MaterialCommunityIcons
//                       name="lightning-bolt"
//                       size={32}
//                       color="#1E88E5"
//                     />
//                     <Text style={styles.actionButtonText}>Action</Text>
//                   </Animated.View>
//                 </TouchableOpacity>
//               );
//             }
//             return <TouchableOpacity {...props} />;
//           },
//         })}>
//         <Tab.Screen name="Dashboard" component={HomeScreen} />
//         <Tab.Screen name="Exit" component={MyExit} />
//         <Tab.Screen
//           name="Action"
//           component={() => null}
//           options={{tabBarLabel: () => null}}
//         />
//         <Tab.Screen name="Attendance" component={Attendance} />
//         <Tab.Screen name="Payslip" component={MyPaySlip} />
//       </Tab.Navigator>

//       {/* Animated Action Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="none"
//         onRequestClose={closeModal}>
//         <AnimatedPressable
//           style={[styles.modalOverlay, {opacity: modalOpacity}]}
//           onPress={closeModal}>
//           <Animated.View style={[styles.modalContent, modalAnimatedStyle]}>
//             <Text style={styles.modalTitle}>Quick Actions</Text>
            
//             <AnimatedTouchable
//               style={[styles.modalButton, button1Style]}
//               onPress={() => handleNavigate('ApplyLeave')}>
//               <MaterialIcons name="event-available" size={24} color="#fff" />
//               <Text style={styles.modalButtonText}>Leave Approval</Text>
//               <MaterialIcons
//                 name="chevron-right"
//                 size={24}
//                 color="#fff"
//                 style={styles.arrowIcon}
//               />
//             </AnimatedTouchable>

//             <AnimatedTouchable
//               style={[styles.modalButton, button2Style]}
//               onPress={() => handleNavigate('Exit')}>
//               <MaterialCommunityIcons name="exit-run" size={24} color="#fff" />
//               <Text style={styles.modalButtonText}>Exit Approval</Text>
//               <MaterialIcons
//                 name="chevron-right"
//                 size={24}
//                 color="#fff"
//                 style={styles.arrowIcon}
//               />
//             </AnimatedTouchable>

//             <AnimatedTouchable
//               style={[styles.modalButton, button3Style]}
//               onPress={() => handleNavigate('Approvals')}>
//               <MaterialIcons name="request-quote" size={24} color="#fff" />
//               <Text style={styles.modalButtonText}>Expense Approval</Text>
//               <MaterialIcons
//                 name="chevron-right"
//                 size={24}
//                 color="#fff"
//                 style={styles.arrowIcon}
//               />
//             </AnimatedTouchable>

//             <TouchableOpacity
//               style={styles.modalCloseBtn}
//               onPress={closeModal}>
//               <Text style={styles.modalCloseText}>Close</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </AnimatedPressable>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   tabLabel: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   actionButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 7,
//   },
//   actionButtonInner: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   actionButtonText: {
//     color: '#1E88E5',
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '85%',
//     backgroundColor: '#1E88E5',
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   modalTitle: {
//     fontSize: 22,
//     color: '#fff',
//     marginBottom: 25,
//     fontWeight: 'bold',
//   },
//   modalButton: {
//     width: '100%',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginVertical: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     marginLeft: 15,
//     flex: 1,
//   },
//   arrowIcon: {
//     marginLeft: 10,
//   },
//   modalCloseBtn: {
//     marginTop: 20,
//     padding: 10,
//   },
//   modalCloseText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


//////           apps 

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import Attendance from '../screens/Attendance';
import MyExit from '../screens/MyExit';
import MyPaySlip from '../screens/Payslip';
import Approvals from '../screens/Approvals';

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

  const handleNavigate = (screen) => {
    closeModal();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 200);
  };

  return (
    <View style={{flex: 1}}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({color, size, focused}) => {
            const icons = {
              Dashboard: 'view-dashboard-outline',
              Exit: 'exit-run',
              Attendance: 'calendar-month-outline',
              Payslip: 'file-document-outline',
            };

            const animatedIconStyle = {
              transform: [{scale: focused ? 1.3 : 1}],
            };

            return (
              <View style={animatedIconStyle}>
                <MaterialCommunityIcons
                  name={icons[route.name]}
                  size={28}
                  color={color}
                />
              </View>
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
            margin: Platform.OS === 'ios' ? 3 : 1,
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
                  onPress={handleActionPress}>
                  <View style={styles.actionButtonCircle}>
                    <MaterialCommunityIcons
                      name="apps"
                      size={22}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.actionButtonText}>Actions</Text>
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

      {/* Redesigned Action Modal */}
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
                transform: [
                  { scale: scaleAnim }
                ]
              }
            ]}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Approvals</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}>
                <MaterialCommunityIcons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('ApplyLeave')}>
                <View style={[styles.iconCircle, {backgroundColor: '#4CAF50'}]}>
                  <MaterialIcons name="event-available" size={28} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>Leave</Text>
                <Text style={styles.actionSubLabel}>Apply & View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('Exit')}>
                <View style={[styles.iconCircle, {backgroundColor: '#FF5722'}]}>
                  <MaterialCommunityIcons name="exit-run" size={28} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>Exit</Text>
                <Text style={styles.actionSubLabel}>Request & Track</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('PaymentRequest')}>
                <View style={[styles.iconCircle, {backgroundColor: '#9C27B0'}]}>
                  <MaterialIcons name="request-quote" size={28} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>Expense</Text>
                <Text style={styles.actionSubLabel}>Submit & Check</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handleNavigate('TimeSheet')}>
                <View style={[styles.iconCircle, {backgroundColor: '#2196F3'}]}>
                  <MaterialCommunityIcons name="clock-outline" size={28} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>TimeSheet</Text>
                <Text style={styles.actionSubLabel}>Fill & Review</Text>
              </TouchableOpacity> */}
            </View>

            {/* <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Activities</Text>
              
              <TouchableOpacity style={styles.recentItem}>
                <View style={styles.recentIconContainer}>
                  <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentItemTitle}>Leave Request</Text>
                  <Text style={styles.recentItemSubtitle}>Approved • 2 days ago</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.recentItem}>
                <View style={styles.recentIconContainer}>
                  <MaterialIcons name="attach-money" size={20} color="#FF5722" />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentItemTitle}>Expense Report</Text>
                  <Text style={styles.recentItemSubtitle}>Pending • 3 days ago</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            </View> */}
          </Animated.View>
        </View>
      </Modal>
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
  },
  actionButtonCircle: {
    backgroundColor: '#1E88E5',
    marginTop: 10,
    width: 35,
    height: 35,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  actionButtonText: {
    color: '#1E88E5',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  actionCard: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 15,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubLabel: {
    fontSize: 12,
    color: '#777',
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
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