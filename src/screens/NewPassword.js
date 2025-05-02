import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Feather';

import CustomButton from '../component/Button';
import CoreText from '../component/CoreText';
import HookFormInput from '../component/HookFormInput';
import StatusModal from '../component/StatusModal';

const NewPassword = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleLogin = () => {
    setShowSuccessModal(false);
    setTimeout(() => navigation.navigate('Login'), 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Top Banner and Center Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../assets/image/withh.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <Image
            source={require('../assets/image/newpass.jpg')}
            style={styles.centerBanner}
            resizeMode="cover"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <CoreText font="bold" size="xxl" color="primary" style={styles.headerTitle}>
              Create New Password
            </CoreText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <HookFormInput
              control={control}
              name="newPassword"
              placeholder="New Password"
              secureTextEntry={!showPassword}
              leftIcon="lock-outline"
              containerStyle={styles.input}
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters required' },
              }}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              }
            />

            <HookFormInput
              control={control}
              name="confirmPassword"
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              leftIcon="lock-outline"
              containerStyle={styles.input}
              rules={{
                required: 'Please confirm your password',
                validate: value =>
                  value === watch('newPassword') || 'Passwords do not match',
              }}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              }
            />

            {/* <View style={styles.passwordRules}>
              <CoreText size="sm" color="muted">Password must contain:</CoreText>
              <View style={styles.ruleItem}>
                <Icon
                  name={watch('newPassword')?.length >= 8 ? 'check-circle' : 'circle'}
                  size={14}
                  color={watch('newPassword')?.length >= 8 ? '#4CAF50' : '#999'}
                />
                <CoreText size="sm" color="muted" style={styles.ruleText}>
                  Minimum 8 characters
                </CoreText>
              </View>
            </View> */}

            <CustomButton
              title={loading ? 'Updating...' : 'Update Password'}
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              buttonStyle={styles.button}
            />
          </View>
        </ScrollView>

        <StatusModal
          visible={showSuccessModal}
          status="success"
          title="Password Changed!"
          subtitle="Your password has been successfully updated."
          onClose={() => setShowSuccessModal(false)}
          onButtonPress={handleLogin}
          buttonText="Go to Login"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 30,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 130,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
  },
  passwordRules: {
    marginBottom: 20,
    marginLeft: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ruleText: {
    marginLeft: 8,
  },
  button: {
    marginTop: 10,
    height: 50,
    borderRadius: 8,
  },
  bannerContainer: {
    width: '101%',
    position: 'relative',

  },
  bannerImage: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  centerBanner: {
    position: 'absolute',
    top: 140,
    left: '50%',
    transform: [{ translateX: -75 }],
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    zIndex: 10,
  },
});

export default NewPassword;
