import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import CustomToast from './src/component/CustomToast';
import { AuthProvider } from './src/constants/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

import { requestUserPermission, foregroundListener } from './src/utils/notificationService';


export default function App() {

useEffect(() => {
  requestUserPermission();
  const unsubscribe = foregroundListener();

  return unsubscribe;
}, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
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
    </Provider>
  );
}
