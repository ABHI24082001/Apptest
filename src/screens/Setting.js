import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Modal,
  Text,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Appbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import AppSafeArea from '../component/AppSafeArea';
import LottieView from 'lottie-react-native';

const ChangePasswordScreen = ({ navigation }) => {
  const { control, handleSubmit, setError } = useForm();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      setModalType('failure');
      setModalVisible(true);
      return;
    }

    console.log('Password change data:', data);
    setModalType('success');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      navigation.navigate('PasswordChanged');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#000" />
        <Appbar.Content title="Change Password" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="currentPassword"
              rules={{ required: 'Current password is required' }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter current password"
                    secureTextEntry={!showPassword.current}
                    style={[styles.input, error && styles.inputError]}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('current')}
                    style={styles.eyeButton}
                  >
                    <Icon name={showPassword.current ? 'eye' : 'eye-off'} size={20} color="#000" />
                  </TouchableOpacity>
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="newPassword"
              rules={{ required: 'New password is required' }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter new password"
                    secureTextEntry={!showPassword.new}
                    style={[styles.input, error && styles.inputError]}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('new')}
                    style={styles.eyeButton}
                  >
                    <Icon name={showPassword.new ? 'eye' : 'eye-off'} size={20} color="#000" />
                  </TouchableOpacity>
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{ required: 'Confirm your new password' }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Re-enter new password"
                    secureTextEntry={!showPassword.confirm}
                    style={[styles.input, error && styles.inputError]}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('confirm')}
                    style={styles.eyeButton}
                  >
                    <Icon name={showPassword.confirm ? 'eye' : 'eye-off'} size={20} color="#000" />
                  </TouchableOpacity>
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LottieView
              source={
                modalType === 'success'
                  ? require('../lotti/Sucess.json')
                  : require('../lotti/Fail.json')
              }
              autoPlay
              loop={false}
              style={styles.lottie}
              onAnimationFinish={closeModal}
            />
            <Text style={styles.modalText}>
              {modalType === 'success'
                ? 'Password changed successfully!'
                : 'Password change failed. Please try again.'}
            </Text>
          </View>
        </View>
      </Modal>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2138',
    marginLeft: -20,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2138',
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 45,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#3366FF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  modalText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1A2138',
  },
});

export default ChangePasswordScreen;
