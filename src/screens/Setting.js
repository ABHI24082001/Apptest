import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import DocumentPicker, {pick} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import axios from 'axios';

const BASE_URL = 'http://192.168.29.2:90/UploadDocument';

export default function ProfileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleProfilePhotoUpdate = async () => {
    try {
      const result = await pick({
        type: ['image/*'],
        allowMultiSelection: false,
      });

      if (!result || result.length === 0) {
        console.log('❌ No image selected');
        return;
      }

      const file = result[0];
      console.log('📷 Selected:', file);

      // Convert to base64
      const filePath = file.uri.replace('file://', '');
      const base64File = await RNFS.readFile(filePath, 'base64');

      // Get extension
      const extension = file.name?.split('.').pop() || 'jpg';
      const payload = {
        fileName: file.name || 'profile.jpg',
        base64File,
        extension,
        category: 'img',
      };

      setUploading(true);
      console.log('➡️ Uploading to:', `${BASE_URL}/UploadDocument`);
      console.log('Payload:', payload);

      // Upload to server
      const response = await axios.post(
        `${BASE_URL}/UploadDocument`,
        payload,
        {headers: {'Content-Type': 'application/json'}},
      );

      console.log('✅ Upload response:', response.data);

      if (response.data?.fileName) {
        const uploadedFileName = response.data.fileName;

        // Fetch uploaded file to display
        const fetchUrl = `${BASE_URL}/FetchFile?fileNameWithExtension=${uploadedFileName}`;
        const fileResponse = await axios.get(fetchUrl);

        if (fileResponse.data?.base64File) {
          const imgUri = `data:image/${extension};base64,${fileResponse.data.base64File}`;
          setUploadedImage(imgUri);
        }

        Alert.alert('Success', 'Profile photo uploaded!');
      } else {
        throw new Error('Upload failed, no filename returned');
      }
    } catch (error) {
      console.error('❌ Upload error:', error.message);
      Alert.alert('Error', error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleProfilePhotoUpdate}>
        {uploading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Image
            source={
              uploadedImage
                ? {uri: uploadedImage}
                : {uri: 'https://via.placeholder.com/150'}
            }
            style={styles.image}
          />
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Tap image to upload profile photo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 20,
  },
  image: {width: '100%', height: '100%'},
  label: {fontSize: 16, color: '#333'},
});
