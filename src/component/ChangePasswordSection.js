import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './profileStyles';

const ChangePasswordSection = ({
  editedFields,
  setEditedFields,
  handleUpdatePassword,
}) => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = field => {
    setShowPassword(prev => ({...prev, [field]: !prev[field]}));
  };

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon
            name="lock-outline"
            size={22}
            color="#333"
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Change Password</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {['current', 'new', 'confirm'].map(field => (
          <View key={field} style={styles.passwordInputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.icon} />
            <View style={styles.passwordInputWrapper}>
              <Text style={styles.passwordLabel}>{`${
                field.charAt(0).toUpperCase() + field.slice(1)
              } Password`}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder={`Enter ${field} password`}
                  secureTextEntry={!showPassword[field]}
                  style={styles.input}
                  onChangeText={text =>
                    setEditedFields({
                      ...editedFields,
                      [`${field}Password`]: text,
                    })
                  }
                />
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility(field)}
                  style={styles.eyeButton}>
                  <Icon
                    name={showPassword[field] ? 'eye' : 'eye-off'}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity
          onPress={handleUpdatePassword}
          style={styles.updateButton}>
          <Icon name="lock-reset" size={20} color="#fff" />
          <Text style={styles.updateButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default ChangePasswordSection;