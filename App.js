import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import CustomToast from './src/component/CustomToast';
import {AuthProvider} from './src/constants/AuthContext'; // ✅ Auth Context
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

export default function App() {
  return (
    <Provider store={store}>
      {/* <StatusBar
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#3c9cf1ff' : '#7BC1FF'}
        translucent={Platform.OS === 'android' ? false : true}
        animated={true}
      /> */}

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
    </Provider>
  );
}
