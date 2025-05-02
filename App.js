import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message'; // ✅ Import Toast
import CustomToast from './src/component/CustomToast';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export default function App() {
  return (
    <>
      {/* ✅ Global StatusBar */}
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#7BC1FF' : undefined}
        translucent={Platform.OS === 'android' ? false : true}
        animated={true}
      />

      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>

      {/* ✅ Toast must be outside Navigation */}
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
