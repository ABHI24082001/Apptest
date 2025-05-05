import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import SplashScreen1 from '../screens/SplashScreen1';
import SplashScreen2 from '../screens/SplashScreen2';
import SplashScreen3 from '../screens/SplashScreen3';
import LoginScreen from '../screens/LoginScreen';
import DrawerNavigator from './DrawerNavigator';
import ForgotPassword from '../screens/ForgotPassword';
import Otp from '../screens/Otp';
import NewPassword from '../screens/NewPassword';
import PasswordChange from '../screens/PasswordChange';
import NotificationScreen from '../screens/NotificationScreen';
import Approvals from '../screens/Approvals';
import Attendance from '../screens/Attendance';
import Payslip from '../screens/Payslip';
import WhoLeave from '../screens/WhoLeave';

//  drawer
import LogReport from '../screens/LogReport';
import ApplyLeave from '../screens/ApplyLeave';
import MyPayslip from '../screens/MyPayslip';
import PaymentRequest from '../screens/PaymentRequest';
import MyExpenses from '../screens/MyExpenses';
import AdvanceReport from '../screens/AdvanceReport';
import Exit from '../screens/Exit';
import Profile from '../screens/Profile';



const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Splash1" component={SplashScreen1}/>
      <Stack.Screen name="Splash2" component={SplashScreen2}/>
      <Stack.Screen name="Splash3" component={SplashScreen3}/>

      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="NewPassword" component={NewPassword} />
      <Stack.Screen name="PasswordChange" component={PasswordChange} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />

      {/* bottomtabbar */}
      <Stack.Screen name="Approvals" component={Approvals} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="Payslip" component={Payslip} />
     
       {/* DrawerTabbar */}
      <Stack.Screen name="LogReport" component={LogReport} />
      <Stack.Screen name="ApplyLeave" component={ApplyLeave} />
      <Stack.Screen name="MyPayslip" component={MyPayslip} />
      <Stack.Screen name="PaymentRequest" component={PaymentRequest} />
      <Stack.Screen name="MyExpenses" component={MyExpenses} />
      <Stack.Screen name="AdvanceReport" component={AdvanceReport} />
      <Stack.Screen name="Exit" component={Exit} />
      <Stack.Screen name="WhoLeave" component={WhoLeave} />
      <Stack.Screen name="Profile"  component={Profile}/>


      

      {/* Add more screens as needed */}
    </Stack.Navigator>
  );
}
