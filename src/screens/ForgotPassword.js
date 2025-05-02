import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import CoreText from '../component/CoreText';
import CustomButton from '../component/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const [step, setStep] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const navigation = useNavigation();
  const [resendTimer, setResendTimer] = useState(30);

  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onSubmitPhone = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number');
      return;
    }
    setStep('otp');
    setResendTimer(30); // Start timer
  };

  const onSubmitOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      Alert.alert('Success', 'OTP Verified!');
      navigation.navigate('NewPassword');
    } else {
      Alert.alert('Error', 'Please enter complete OTP');
    }
  };

  const onResendOtp = () => {
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();
    Alert.alert('OTP Sent', 'A new OTP has been sent to your number.');
  };

  useEffect(() => {
    let interval;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* ✅ Full width banner (no horizontal padding) */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../assets/image/withh.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <Image
            source={require('../assets/image/forget.jpg')}
            style={styles.centerBanner}
            resizeMode="contain"
          />
        </View>

        {/* ✅ Main content with padding */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.innerContent}>
            <CoreText size="xxl" color="primary" style={styles.title}>
              Forgot Password
            </CoreText>
            <CoreText size="md" style={styles.subtitle}>
              {step === 'login'
                ? 'Enter phone number or email ID'
                : 'Enter your OTP'}
            </CoreText>

            {step === 'login' ? (
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone number or Email"
                keyboardType="default"
                style={styles.input}
                autoCapitalize="none"
              />
            ) : (
              <View style={styles.otpWrapper}>
                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (otpRefs.current[index] = ref)}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      returnKeyType="next"
                    />
                  ))}
                </View>

                {/* 🔁 Resend OTP Section */}
                <View style={{alignItems: 'center', marginTop: 16}}>
                  {resendTimer > 0 ? (
                    <CoreText size="sm" color="gray">
                      Resend OTP in {resendTimer} sec
                    </CoreText>
                  ) : (
                    <TouchableOpacity onPress={onResendOtp}>
                      <CoreText
                        size="sm"
                        color="primary"
                        style={{fontWeight: 'bold'}}>
                        Resend OTP
                      </CoreText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <CustomButton
              title={step === 'login' ? 'Continue' : 'Verify OTP'}
              onPress={step === 'login' ? onSubmitPhone : onSubmitOtp}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  bannerImage: {
    width: '101%',
    height: 200,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    position: 'relative',
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  innerContent: {
    paddingHorizontal: 25,
  },
  centerBanner: {
    position: 'absolute',
    top: 110,
    left: '50%',
    transform: [{translateX: -75}],
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 20,
  },
  otpWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 10,
    left: 15,
    zIndex: 99,
  },
});
