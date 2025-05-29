// FaceScanner.js

import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
const FaceScanner = () => {
  const cameraRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);

  const takeSelfie = async (type) => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setImageUri(data.uri);

      // TODO: Send data.base64 to backend for face match
      Alert.alert(`${type} Success`, "Face scanned successfully");
    }
  };

  const detectFace = async (imagePath) => {
    const faces = await FaceDetection.detectFromFile(imagePath);
    if (faces.length > 0) {
      console.log("Face Detected!");
    } else {
      console.log("No Face Detected!");
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={RNCamera.Constants.Type.front}
        captureAudio={false}
      />
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => takeSelfie('Check In')} style={styles.button}>
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => takeSelfie('Check Out')} style={styles.button}>
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      </View>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 3, justifyContent: 'flex-end', alignItems: 'center' },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  image: { width: '100%', height: 200, marginTop: 10 },
});

export default FaceScanner;
