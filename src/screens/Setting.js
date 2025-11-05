import React, {useState} from 'react';
import {View, TouchableOpacity, Image, Alert, Text, ActivityIndicator} from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import {launchImageLibrary} from 'react-native-image-picker'; // optional
import Icon from 'react-native-vector-icons/Feather';

// Your base URL (without trailing /)
const BASE_URL = 'http://your-server-ip-or-domain';

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  // 🧾 Helper: Convert file to base64
  const convertFileToBase64 = async uri => {
    try {
      // Android content:// fix
      const path = uri.replace('file://', '');
      return await RNFS.readFile(path, 'base64');
    } catch (err) {
      throw new Error('File read failed: ' + err.message);
    }
  };

  // 📤 Upload file (Image or Document)
  const uploadFileBase64 = async (file, category = 'img') => {
    try {
      setUploading(true);

      const fileName = file.name || file.fileName || 'file';
      const extension = fileName.split('.').pop() || 'jpg';
      const base64File = await convertFileToBase64(file.uri);

      const payload = {
        fileName,
        base64File,
        extension,
        category, // 'img' or 'doc'
      };

      console.log('📤 Uploading to server:', `${BASE_URL}/UploadDocument/UploadDocument`);
      console.log('➡️ Category:', category, 'File:', fileName);

      const response = await fetch(`${BASE_URL}/UploadDocument/UploadDocument`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('📥 Upload result:', result);

      if (response.ok && result.fileName) {
        setUploadedFileName(result.fileName);

        // ✅ Fetch uploaded file preview
        await fetchAndPreviewFile(result.fileName, extension, category);

        // ✅ Optionally update employee profile
        await saveProfileFile(result.fileName, category);

        Alert.alert('Success', `${category === 'img' ? 'Image' : 'Document'} uploaded successfully!`);
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error.message);
      Alert.alert('Error', error.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // 🧩 Fetch and show uploaded image/doc preview
  const fetchAndPreviewFile = async (fileName, extension, category) => {
    try {
      const fetchUrl = `${BASE_URL}/UploadDocument/FetchFile?fileNameWithExtension=${encodeURIComponent(fileName)}`;
      console.log('📡 Fetching file from:', fetchUrl);

      const fileResponse = await fetch(fetchUrl);
      const fileResult = await fileResponse.json();

      if (fileResponse.ok && fileResult.base64File) {
        if (category === 'img') {
          const imageUri = `data:image/${extension};base64,${fileResult.base64File}`;
          setUploadedImage({uri: imageUri});
          console.log('✅ Image preview ready');
        } else {
          console.log('📄 Document fetched successfully (no preview)');
        }
      } else {
        throw new Error('Failed to fetch uploaded file');
      }
    } catch (error) {
      console.error('Fetch file error:', error.message);
    }
  };

  // 💾 Save uploaded file name to employee record
  const saveProfileFile = async (fileName, category) => {
    try {
      const payload = {
        EmpId: 101, // example employee ID
        empImage: category === 'img' ? fileName : null,
        empDocument: category === 'doc' ? fileName : null,
        ModifiedDate: new Date().toISOString(),
      };

      console.log('💾 Saving profile update:', payload);

      const response = await axios.post(`${BASE_URL}/EmpRegistration/SaveEmpRegistration`, payload);

      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Employee record updated successfully');
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile save error:', error.message);
      Alert.alert('Error', 'Failed to save file info in profile');
    }
  };

  // 🖼️ Handle image picker
  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({mediaType: 'photo'});
      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log('📷 Selected image:', image);
        await uploadFileBase64(image, 'img');
      } else {
        console.log('User cancelled image selection');
      }
    } catch (error) {
      console.error('Image picker error:', error.message);
    }
  };

  // 📄 Handle document picker
  const handleDocumentUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('📄 Selected document:', res);
      await uploadFileBase64(res, 'doc');
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document selection');
      } else {
        console.error('Document picker error:', err);
      }
    }
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      {uploading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <TouchableOpacity
            onPress={handleImageUpload}
            style={{
              borderRadius: 100,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#007bff',
            }}>
            <Image
              source={
                uploadedImage
                  ? uploadedImage
                  : {uri: 'https://via.placeholder.com/150'}
              }
              style={{width: 120, height: 120}}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                backgroundColor: '#007bff',
                borderRadius: 12,
                padding: 4,
              }}>
              <Icon name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDocumentUpload}
            style={{
              marginTop: 30,
              backgroundColor: '#007bff',
              padding: 12,
              borderRadius: 8,
            }}>
            <Text style={{color: '#fff', fontSize: 16}}>📎 Upload Document</Text>
          </TouchableOpacity>

          {uploadedFileName ? (
            <Text style={{marginTop: 20}}>Uploaded: {uploadedFileName}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}

