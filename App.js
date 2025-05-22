import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import CustomToast from './src/component/CustomToast';
import {AuthProvider} from './src/constants/AuthContext'; // ✅ Auth Context
import {SafeAreaProvider} from 'react-native-safe-area-context';

export default function App() {
  return (
    <>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#7BC1FF' : undefined}
        translucent={Platform.OS === 'android' ? false : true}
        animated={true}
      />

      {/* ✅ Wrap with AuthProvider */}
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>

      <Toast
        config={{
          success: props => <CustomToast {...props} type="success" />,
          error: props => <CustomToast {...props} type="error" />,
          info: props => <CustomToast {...props} type="info" />,
        }}
      />
    </>
  );
}
