import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert} from 'react-native';
import {Modal, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './profilecss';

/**
 * ChangePasswordModal - Modal component for changing user password
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onDismiss - Function to call when modal is dismissed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {boolean} props.loading - Whether the form is submitting
 */
const ChangePasswordModal = ({
  visible,
  onDismiss,
  onSubmit,
  loading = false,
}) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  // Validate password fields
  const validatePasswords = () => {
    const newErrors = {};
    
    // Check for empty fields
    if (!passwords.current.trim()) {
      newErrors.current = 'Current password is required';
    }
    
    if (!passwords.new.trim()) {
      newErrors.new = 'New password is required';
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters';
    }
    
    if (!passwords.confirm.trim()) {
      newErrors.confirm = 'Please confirm your new password';
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validatePasswords()) {
      onSubmit(passwords);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Reset form when modal closes
  const resetForm = () => {
    setPasswords({current: '', new: '', confirm: ''});
    setShowPasswords({current: false, new: false, confirm: false});
    setErrors({});
  };

  // Reset form when modal visibility changes
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContent}
      style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Change Password</Text>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.modalCloseButton}
          activeOpacity={0.7}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.modalBody}>
        {/* Current Password */}
        <View style={styles.passwordFieldContainer}>
          <Text style={styles.passwordLabel}>Current Password</Text>
          <View
            style={[
              styles.passwordInputContainer,
              errors.current && styles.passwordInputError,
            ]}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPasswords.current}
              value={passwords.current}
              onChangeText={text => setPasswords({...passwords, current: text})}
              placeholder="Enter current password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => togglePasswordVisibility('current')}>
              <Icon
                name={showPasswords.current ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.current && (
            <Text style={styles.passwordError}>{errors.current}</Text>
          )}
        </View>

        {/* New Password */}
        <View style={styles.passwordFieldContainer}>
          <Text style={styles.passwordLabel}>New Password</Text>
          <View
            style={[
              styles.passwordInputContainer,
              errors.new && styles.passwordInputError,
            ]}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPasswords.new}
              value={passwords.new}
              onChangeText={text => setPasswords({...passwords, new: text})}
              placeholder="Enter new password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => togglePasswordVisibility('new')}>
              <Icon
                name={showPasswords.new ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.new && (
            <Text style={styles.passwordError}>{errors.new}</Text>
          )}
        </View>

        {/* Confirm New Password */}
        <View style={styles.passwordFieldContainer}>
          <Text style={styles.passwordLabel}>Confirm New Password</Text>
          <View
            style={[
              styles.passwordInputContainer,
              errors.confirm && styles.passwordInputError,
            ]}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPasswords.confirm}
              value={passwords.confirm}
              onChangeText={text => setPasswords({...passwords, confirm: text})}
              placeholder="Confirm new password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => togglePasswordVisibility('confirm')}>
              <Icon
                name={showPasswords.confirm ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirm && (
            <Text style={styles.passwordError}>{errors.confirm}</Text>
          )}
        </View>
      </View>

      <View style={styles.modalFooter}>
        <Button
          mode="outlined"
          onPress={onDismiss}
          style={styles.modalButton}
          disabled={loading}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.modalButton, styles.modalSubmitButton]}
          loading={loading}
          disabled={loading}>
          Update Password
        </Button>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;