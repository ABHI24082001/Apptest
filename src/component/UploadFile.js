// UploadFile.js
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UploadFile = ({ handleFilePick, uploadedFile }) => {
  return (
    <>
      <Text style={styles.label}>Supporting Document (.pdf, .jpg)</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={handleFilePick}>
        <Icon name="file-upload-outline" size={24} color="#000" />
        <Text style={styles.uploadText}>Upload PDF</Text>
      </TouchableOpacity>

      {/* File Preview */}
      {uploadedFile && (
        <View style={styles.previewBox}>
          <Icon name="file-pdf-box" size={24} color="#d32f2f" />
          <Text style={styles.previewText}>{uploadedFile.name}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    justifyContent: 'center',
    width: '100%',
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  previewText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default UploadFile;
