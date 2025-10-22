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

import {setAuthToken, setUserIdHeader} from '../utils/axiosInstance'
import axiosInstance from '../utils/axiosInstance'; 
const ERROR_COLOR = '#f44336';

import { useAuth } from '../constants/AuthContext';

const LoginScreen = () => {
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

    const token =
      'SoN8HIgE3rYpS22E4ngvUj7Bj5PypE0JKUvbgIo3N7bMy1bVnhAWNKyFaMmBAnZz+n1Nyry29JujM3MmZJ4fdpzC2LMf0pCoR4a44dJxDXtutvdcMLZVBNoMYNcwbnx5Na1/ujDmC2SO/mCYZ8HXuL++c+EMS3EDVHc0gEcjxyEOb8rMv3q5XOY8Ha+hV0DIn5e1lfsp18cz9Kwm0mBlo9IykXIyeQyNCp1/AxhmaRQkb37BLRLOXfX251myZJbm';

    try {
      // 🔍 Step 1: Fetch User ID
      console.log('🔄 Sending request to FetchCompanyUserId...');
      const fetchUserIdResponse = await axiosInstance.post(
        '/EmpRegistration/FetchCompanyUserId',
        {
          UserName: username,
          Password: password,
          descriptor: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            UserId: '0',
          },
        }
      );

      const fetchedUserId = fetchUserIdResponse?.data;

      if (!fetchedUserId) {
        throw new Error('User ID not found. Please check your username/password.');
      }

      // ✅ Set token and userId globally for all axiosInstance calls
      setAuthToken(token);
      setUserIdHeader(fetchedUserId);

      // 🔐 Step 2: Authenticate User
      console.log(`🔄 Sending GetAuthUser request with UserId: ${fetchedUserId}`);

      const getAuthUserResponse = await axiosInstance.post(
        '/EmpRegistration/GetAuthUser',
        {
          UserName: username,
          Password: password,
          UserType: 0,
        }
      );

      console.log('✅ GetAuthUser Response:', getAuthUserResponse.data);

      if (getAuthUserResponse.data) {
        // Use the login function from AuthContext to handle all auth-related tasks
        await login(getAuthUserResponse.data, token, fetchedUserId);
        
        setLoginMessage({
          type: 'success',
          text: 'Login Successful. Welcome back!',
        });

        navigation.replace('Main');
      } else {
        setLoginMessage({
          type: 'error',
          text: 'Invalid username or password.',
        });
      }
    } catch (error) {
      console.error('❌ Login flow error:', error?.response?.data || error.message);

      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Login failed';

      const isUsernameError = message.toLowerCase().includes('username');
      const isPasswordError = message.toLowerCase().includes('password');

      if (status === 404 || isUsernameError || isPasswordError) {
        if (isUsernameError) {
          setError('username', { type: 'manual', message: 'Username is invalid' });
        }
        if (isPasswordError) {
          setError('password', { type: 'manual', message: 'Password is invalid' });
        }
        if (!isUsernameError && !isPasswordError) {
          setLoginMessage({ type: 'error', text: 'Username or Password is invalid' });
        }
      } else {
        setLoginMessage({ type: 'error', text: message });
      }
    } finally {
      console.log('✅ Login process completed.');
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

export default LoginScreen;

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
