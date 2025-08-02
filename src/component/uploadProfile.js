// utils/uploadProfile.js

import RNFS from 'react-native-fs';
import {Alert} from 'react-native';
import axiosinstance from '../utils/axiosInstance';

export const uploadDocumentBase64 = async (photo) => {
  try {
    const base64File = await RNFS.readFile(photo.uri, 'base64');
    const fileName = photo.fileName || 'image.jpg';
    const extension = fileName.split('.').pop();

    const payload = {
      fileName,
      base64File,
      extension,
      category: 'img',
    };

    const response = await axiosinstance.post('/UploadDocument/UploadDocument', payload);
    return response.data?.fileName;
  } catch (error) {
    console.error('Upload error:', error.message);
    Alert.alert('Upload Failed', 'Unable to upload photo');
    return null;
  }
};

export const saveProfileImage = async (employeeDetails, fileName) => {
  try {
    const payload = {
      ...employeeDetails,
      empImage: fileName,
      ModifiedDate: new Date().toISOString(),
    };

    delete payload.tblApplyLeaveApprovals;
    delete payload.tblApplyLeaves;
    delete payload.tblFinalLeaveApprovals;
    delete payload.tblNotifications;

    const response = await axiosInstance.post(
      '/EmpRegistration/SaveEmpRegistration',
      payload,
    );

    return response.status === 200;
  } catch (error) {
    console.error('Save profile error:', error.message);
    Alert.alert('Update Failed', 'Could not update profile image');
    return false;
  }
};
