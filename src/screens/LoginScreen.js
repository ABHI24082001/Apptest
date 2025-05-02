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

const SignInScreen = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();
  const [hidePassword, setHidePassword] = useState(true);
  const [loginMessage, setLoginMessage] = useState({type: '', text: ''});
  const navigation = useNavigation();

  const onSubmit = data => {
    const {email, password} = data;

    if (email === 'sonukr2408100@gmail.com' && password === '12345') {
      setLoginMessage({
        type: 'success',
        text: 'Login Successful. Welcome back!',
      });
      navigation.navigate('Main');
    } else {
      setLoginMessage({
        type: 'error',
        text: 'Invalid email or password',
      });
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

          {/* Top Banner Image */}
          <Image
            source={require('../assets/image/withh.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          {/* Decorative Corner Banner (Top Left) */}
          <Image
            source={require('../assets/image/hr2.jpg')}
            style={styles.cornerBanner}
            resizeMode="contain"
          />

          {/* Card View for Login Form */}
          <View style={styles.card}>
            <CoreText
              size="xxl"
              font="bold"
              color="primary"
              style={styles.welcomeTitle}>
              Welcome Cloudtree
            </CoreText>
            <CoreText
              size="md"
              font="bold"
              color="#666"
              style={styles.subtitle}>
              Login in to explore HCM Solutions.
            </CoreText>

            {/* Inline Login Message */}
            {loginMessage.text !== '' && (
              <CoreText
                size="sm"
                font="medium"
                color={loginMessage.type === 'error' ? 'red' : 'green'}
                style={{textAlign: 'center', marginBottom: 10}}>
                {loginMessage.text}
              </CoreText>
            )}

            <HookFormInput
              control={control}
              name="email"
              placeholder="Email"
              leftIcon="email-outline"
              keyboardType="email-address"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              }}
            />

            <HookFormInput
              control={control}
              name="password"
              placeholder="Password"
              leftIcon="lock-outline"
              secureTextEntry={hidePassword}
              rules={{required: 'Password is required'}}
              rightIcon={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              rightIconType="MaterialCommunityIcons"
              rightIconOnPress={() => setHidePassword(!hidePassword)}
              style={styles.input}
              error={errors.password}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotContainer}>
              <CoreText font="medium" size="md" color="primary">
                Forgot Password?
              </CoreText>
            </TouchableOpacity>

            <CustomButton title="Log In" onPress={handleSubmit(onSubmit)} />

            <CoreText size="xs" color="primary" style={styles.terms}>
              Privacy Policy and Terms of Service
            </CoreText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <CoreText style={styles.footerText}>Powered By</CoreText>
        <Image
          source={require('../assets/image/logo.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
      </View>
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
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
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
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
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
