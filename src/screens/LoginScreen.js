import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import CustomButton from '../component/Button';
import CoreText from '../component/CoreText';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import HookFormInput from '../component/HookFormInput';
import axios from 'axios';
import BASE_URL from '../constants/apiConfig';
// const BASE_URL = 'https://hcmapiv2.anantatek.com/api/';
const ERROR_COLOR = '#f44336';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../constants/AuthContext';
const SignInScreen = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    setError,
    clearErrors,
  } = useForm();

  const [hidePassword, setHidePassword] = useState(true);
  const [loginMessage, setLoginMessage] = useState({type: '', text: ''});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const {login} = useAuth();

  const onSubmit = async (data) => {
    const { username, password } = data;
    setLoading(true);
    setLoginMessage({ type: '', text: '' });
    clearErrors();
  
    try {
      const response = await axios.post(`${BASE_URL}/EmpRegistration/GetAuthUser`, {
        UserName: username,
        Password: password,
        UserType: 0,
      });
  
      if (response.data) {
        console.log('Login Response:', response.data); // ✅ Console log user data
  
        await AsyncStorage.setItem('hasLoggedIn', 'true');
  
        login(response.data); // ✅ Set user globally
  
        setLoginMessage({
          type: 'success',
          text: 'Login Successful. Welcome back!',
        });
  
        navigation.navigate('Main');
      } else {
        setLoginMessage({
          type: 'error',
          text: 'Invalid username or password',
        });
      }
  
    } catch (error) {
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      const lowerMsg = errorMessage.toLowerCase();
  
      const isUsernameError = lowerMsg.includes('username');
      const isPasswordError = lowerMsg.includes('password');
  
      if (status === 404 || isUsernameError || isPasswordError) {
        if (isUsernameError) {
          setError('username', {
            type: 'manual',
            message: 'Username is invalid',
          });
        }
        if (isPasswordError) {
          setError('password', {
            type: 'manual',
            message: 'Password is invalid',
          });
        }
        if (!isUsernameError && !isPasswordError) {
          setLoginMessage({
            type: 'error',
            text: 'Username or Password is invalid',
          });
        }
      } else {
        setLoginMessage({
          type: 'error',
          text: errorMessage,
        });
      }
  
    } finally {
      setLoading(false);
    }
  };
  



  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          <Image
            source={require('../assets/image/withh.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          <Image
            source={require('../assets/image/hr2.jpg')}
            style={styles.cornerBanner}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <CoreText size="xxl" font="bold" color="primary" style={styles.welcomeTitle}>
              Welcome Cloudtree
            </CoreText>
            <CoreText size="md" font="bold" color="#666" style={styles.subtitle}>
              Login in to explore HCM Solutions.
            </CoreText>

            {loginMessage.text !== '' && (
              <CoreText
                size="sm"
                font="medium"
                color={loginMessage.type === 'error' ? ERROR_COLOR : 'green'}
                style={{textAlign: 'center', marginBottom: 10}}>
                {loginMessage.text}
              </CoreText>
            )}

            <HookFormInput
              control={control}
              name="username"
              placeholder="Username"
              leftIcon="account-outline"
              keyboardType="default"
              rules={{required: 'Username is required'}}
              error={errors.username}
            />

            <HookFormInput
              control={control}
              name="password"
              placeholder="Password"
              leftIcon="lock-outline"
              secureTextEntry={hidePassword}
              rules={{required: 'Password is required'}}
              rightIcon={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              rightIconOnPress={() => setHidePassword(!hidePassword)}
              error={errors.password}
            />

            {/* {errors.username && (
              <CoreText size="sm" color={ERROR_COLOR} style={{ marginBottom: 10 }}>
                {errors.username.message}
              </CoreText>
            )}

            {errors.password && (
              <CoreText size="sm" color={ERROR_COLOR} style={{ marginBottom: 10 }}>
                {errors.password.message}
              </CoreText>
            )} */}

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotContainer}>
              <CoreText font="medium" size="md" color="primary">
                Forgot Password?
              </CoreText>
            </TouchableOpacity>

            <CustomButton
              title={loading ? 'Logging In...' : 'Log In'}
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
            />

            <CoreText size="xs" color="primary" style={styles.terms}>
              Privacy Policy and Terms of Service
            </CoreText>
          </View>

          <View style={styles.footerContainer}>
            <CoreText style={styles.footerText}>Powered By</CoreText>
            <Image
              source={require('../assets/image/logo.png')}
              style={styles.footerLogo}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  cornerBanner: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 10,
    borderRadius: 50,
  },
  card: {
    marginTop: 90,
    backgroundColor: '#fff',
    marginHorizontal: 25,
    padding: 20,
    borderRadius: 12,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  terms: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  footerContainer: {
    marginTop: 30,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    marginRight: 5,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    color: '#444',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  footerLogo: {
    width: 100,
    height: 100,
  },
});
