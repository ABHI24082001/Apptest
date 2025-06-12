import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EditableField from './EditableField';
import ChangePasswordSection from './ChangePasswordSection';
import styles from './profileStyles';

const CredentialsSection = ({
  credentialsData,
  isEditing,
  editedFields,
  setEditedFields,
  onEdit,
}) => {
  const [showCredentialsDropdown, setShowCredentialsDropdown] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);

  return (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowCredentialsDropdown(v => !v)}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon
              name="shield-account-outline"
              size={22}
              color="#333"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Credentials</Text>
          </View>
          <Icon
            name={showCredentialsDropdown ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#333"
          />
        </View>
      </TouchableOpacity>
      {showCredentialsDropdown && (
        <View>
          <View style={styles.sectionContent}>
            {credentialsData.map(item => (
              <EditableField
                key={item.label}
                {...item}
                isEditing={isEditing}
                editedFields={editedFields}
                setEditedFields={setEditedFields}
                onEdit={onEdit}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setIsChangePasswordVisible(v => !v)}
            style={styles.sectionToggle}>
            <View style={styles.sectionToggleContent}>
              <View style={styles.sectionToggleTextContainer}>
                <Icon
                  name="lock-outline"
                  size={20}
                  color="#333"
                  style={styles.sectionToggleIcon}
                />
                <Text style={styles.sectionToggleText}>Change Password</Text>
              </View>
              <Icon
                name={isChangePasswordVisible ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#333"
              />
            </View>
          </TouchableOpacity>
          {isChangePasswordVisible && (
            <ChangePasswordSection
              editedFields={editedFields}
              setEditedFields={setEditedFields}
              handleUpdatePassword={handleUpdatePassword}
            />
          )}
        </View>
      )}
    </Card>
  );
};

export default CredentialsSection;