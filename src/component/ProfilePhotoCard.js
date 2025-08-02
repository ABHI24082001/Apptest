// components/ProfilePhotoCard.js

import React, {useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Card} from 'react-native-paper';
import {pick} from '@react-native-documents/picker'; // 👈 using pick here
import {uploadDocumentBase64, saveProfileImage} from '../component/uploadProfileImage';

const staticImageUrl = 'http://192.168.29.2:90/UploadDocument/FetchFile?fileNameWithExtension=';
const STATIC_PROFILE_IMAGE = 'https://hcmv2.anantatek.com/assets/UploadImg/02082025121929.png';

const ProfilePhotoCard = ({employeeDetails, onRefresh}) => {
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState(
    employeeDetails?.empImage
      ? `${staticImageUrl}${employeeDetails.empImage}`
      : STATIC_PROFILE_IMAGE,
  );

  const pickImageAndUpload = async () => {
    try {
      const result = await pick({
        type: ['image/*'],
        title: 'Select a Profile Photo',
        message: 'Choose a photo to set as your profile picture',
        cancelText: 'Cancel',
        confirmText: 'Select',
        multiple: false,
        allowMultiSelection: false,
      });

      if (!result || result.length === 0) {
        console.log('User cancelled or no image selected.');
        return;
      }

      const photo = result[0];
      const isImage =
        photo.type?.startsWith('image/') ||
        photo.uri?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);

      if (!isImage) {
        Alert.alert('Invalid File', 'Please select a valid image file.');
        return;
      }

      setUploading(true);

      const fileName = await uploadDocumentBase64(photo);
      if (fileName) {
        const success = await saveProfileImage(employeeDetails, fileName);
        if (success) {
          setPhotoUri(`${staticImageUrl}${fileName}`);
          onRefresh?.();
        }
      }
    } catch (err) {
      console.error('File picker error:', err);
      Alert.alert('Error', 'Failed to select or upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileContent}>
        <TouchableOpacity
          onPress={pickImageAndUpload}
          style={styles.profilePhotoContainer}
          activeOpacity={0.8}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: photoUri,
              }}
              style={styles.profileImage}
            />
            <View style={styles.profilePhotoOverlay}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Icon name="camera" size={20} color="#fff" />
              )}
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{employeeDetails?.employeeName}</Text>
        <Text style={styles.profileRole}>{employeeDetails?.designationName}</Text>
        <Text style={styles.profileDepartment}>{employeeDetails?.departmentName}</Text>
      </View>
    </Card>
  );
};

export default ProfilePhotoCard;

const styles = StyleSheet.create({
  profileCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    margin: 10,
  },
  profileContent: {
    alignItems: 'center',
  },
  profilePhotoContainer: {
    marginBottom: 12,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  profilePhotoOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0008',
    borderRadius: 20,
    padding: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  profileRole: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  profileDepartment: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});
