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
import MyExit from '../screens/MyExit'
import LeaveRequstStatus from '../screens/LeaveRequstStatus';
import LeaveRequestDetails from '../screens/LeaveRequestDetails';
import ExitRequestStatus from '../screens/ExitRequestStatus';
import ExitRequestDetails from '../screens/ExitRequestDetails';
import ExpenseRequestDetails from '../screens/ExpenseRequestDetails';
import ExpenseRequestStatus from '../screens/ExpenseRequestStatus';
//  drawer
import LogReport from '../screens/LogReport';
import ApplyLeave from '../screens/ApplyLeave';
import MyPayslip from '../screens/MyPayslip';
import PaymentRequest from '../screens/PaymentRequest';
import MyExpenses from '../screens/MyExpenses';
import AdvanceReport from '../screens/AdvanceReport';
import Exit from '../screens/Exit';
import Profile from '../screens/Profile';
import LeaveReport from '../screens/LeaveReport';


//   request 

import LeaveRequestedit from '../screens/LeaveRequestedit';
import ExpenseRequestedit from '../screens/ExpenseRequestedit';
import ExitRequestedit from '../screens/ExitRequestedit';
import Setting from '../screens/Setting';
import Mylocation from '../screens/Mylocation';



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
      <Stack.Screen name="MyExit"  component={MyExit}/>
      <Stack.Screen name="LeaveReport"  component={LeaveReport}/>
      <Stack.Screen name="LeaveRequstStatus"  component={LeaveRequstStatus}/>
      <Stack.Screen name="LeaveRequestDetails"  component={LeaveRequestDetails}/>


      <Stack.Screen name="ExitRequestDetails"  component={ExitRequestDetails}/>
      <Stack.Screen name="ExitRequestStatus"  component={ExitRequestStatus}/>
      <Stack.Screen name="ExpenseRequestStatus"  component={ExpenseRequestStatus}/>
      <Stack.Screen name="ExpenseRequestDetails"  component={ExpenseRequestDetails}/>


      <Stack.Screen name="LeaveRequestedit"  component={LeaveRequestedit}/>
      <Stack.Screen name="ExpenseRequestedit"  component={ExpenseRequestedit}/>
      <Stack.Screen name="ExitRequestedit"  component={ExitRequestedit}/>
      <Stack.Screen name="Setting"  component={Setting}/>
      <Stack.Screen name="Mylocation"  component={Mylocation}/>




      





      
      
      
      


      

      {/* Add more screens as needed */}
    </Stack.Navigator>
  );
}
