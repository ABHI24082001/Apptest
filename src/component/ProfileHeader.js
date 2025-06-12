import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './profileStyles';

const ProfileHeader = ({
  employeeDetails,
  handleProfilePhotoUpdate,
  uploading,
  imageUrl,
}) => (
  <View style={styles.profileContent}>
    <View style={styles.profilePhotoContainer}>
      <TouchableOpacity
        onPress={handleProfilePhotoUpdate}
        style={styles.profilePhotoTouchable}>
        <Image
          source={
            imageUrl
              ? {uri: imageUrl}
              : require('../assets/image/boy.png')
          }
          style={styles.profileImage}
        />
        <View style={styles.profilePhotoEditIcon}>
          {uploading ? (
            <ActivityIndicator size={18} color="#2196F3" />
          ) : (
            <Icon name="camera" size={22} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    </View>
    <Text style={styles.name}>{employeeDetails.employeeName}</Text>
    <Text style={styles.role}>
      {employeeDetails.designationName}, {employeeDetails.departmentName}
    </Text>
  </View>
);

export default ProfileHeader;