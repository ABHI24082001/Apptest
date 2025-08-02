import RNFS from 'react-native-fs';
import axiosInstance from '../utils/axiosInstance';
import {Alert} from 'react-native';

export const uploadDocumentBase64 = async (photo) => {
  try {
    const base64Data = await RNFS.readFile(photo.uri, 'base64');
    const fileName = photo.fileName || 'image.jpg';
    const extension = fileName.split('.').pop();

    const payload = {
      fileName,
      base64File: base64Data,
      extension,
      category: 'img',
    };

    console.log('Uploading...', payload);

    const response = await axiosInstance.post('/UploadDocument/UploadDocument', payload);
    console.log('Upload response:', response.data);

    if (response.status === 200 && response.data?.fileName) {
      return response.data.fileName;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error.message);
    Alert.alert('Upload Error', error.message);
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

    const response = await axiosInstance.post('/EmpRegistration/SaveEmpRegistration', payload);

    if (response.status === 200) {
      Alert.alert('Success', 'Profile image updated');
      return true;
    } else {
      throw new Error('Save failed');
    }
  } catch (error) {
    console.error('Save error:', error.message);
    Alert.alert('Error', 'Profile save failed');
    return false;
  }
};
