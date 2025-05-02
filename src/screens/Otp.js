import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Text,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CoreText from '../component/CoreText';
import CustomButton from '../component/Button';
import {useNavigation} from '@react-navigation/native';

const OTPVerification = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input
  const handleOTPChange = (text, index) => {
    if (!/^\d*$/.test(text)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const finalOtp = otp.join('');
    console.log('Entered OTP:', finalOtp);
    // Add your OTP verification logic here
  };

  const resendOTP = () => {
    setTimer(60);
    console.log('OTP Resent');
    // Add your resend logic here
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <CoreText font="bold" size="xl" color="primary" style={styles.heading}>
          Enter OTP
        </CoreText>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={styles.otpBox}
              value={digit}
              onChangeText={text => handleOTPChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
              returnKeyType="next"
            />
          ))}
        </View>

        <CustomButton
          title="OTP SUBMIT"
          onPress={() => navigation.navigate('NewPassword')}
        />

        <View style={styles.bottomRow}>
          <Text style={styles.subText}>Didn't get OTP?</Text>
          <TouchableOpacity onPress={resendOTP} disabled={timer !== 0}>
            <Text style={[styles.resendText, timer !== 0 && styles.disabled]}>
              {timer === 0 ? ' Resend OTP' : ` Retry in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <CoreText style={styles.footerText}>Powered By</CoreText>
          <Image
            source={require('../assets/image/logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 15,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 45,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
  subText: {
    fontSize: 14,
    color: '#333',
  },
  resendText: {
    fontSize: 14,
    color: '#4169e1',
    fontWeight: 'bold',
  },
  disabled: {
    color: '#aaa',
  },
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginRight: 10,
    fontWeight: 'bold',
  },
  footerLogo: {
    width: 100,
    height: 100,
  },
});

export default OTPVerification;
