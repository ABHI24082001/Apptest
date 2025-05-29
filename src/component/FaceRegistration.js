import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Button } from 'react-native-paper';
import FaceDetection from '@react-native-ml-kit/face-detection';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const FaceRegistration = ({ onRegistrationComplete, onCancel, employeeId }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(0); // 0: detecting, 1: capturing, 2: processing
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'authorized');
  };

  const onFacesDetected = async (faces) => {
    if (faces.length > 0 && !isRegistering) {
      setFaceDetected(true);
      if (registrationStep === 0) {
        setRegistrationStep(1);
      }
    } else {
      setFaceDetected(false);
    }
  };

  const captureAndRegisterFace = async () => {
    if (!cameraRef.current || isRegistering) return;

    setIsRegistering(true);
    setRegistrationStep(2);

    try {
      // Capture photo
      const photo = await cameraRef.current.takePhoto({
        quality: 0.8,
        enableAutoStabilization: true,
      });

      // Process face detection
      const faces = await FaceDetection.processImage(photo.path);
      
      if (faces.length === 0) {
        Alert.alert('Error', 'No face detected. Please try again.');
        setIsRegistering(false);
        setRegistrationStep(0);
        return;
      }

      if (faces.length > 1) {
        Alert.alert('Error', 'Multiple faces detected. Please ensure only one person is in the frame.');
        setIsRegistering(false);
        setRegistrationStep(0);
        return;
      }

      // Extract face features (simplified - in production, use proper face encoding)
      const faceData = {
        employeeId,
        faceFeatures: faces[0],
        photoPath: photo.path,
        registrationDate: new Date().toISOString(),
        boundingBox: faces[0].bounds,
      };

      // Store face data
      await AsyncStorage.setItem(
        `face_data_${employeeId}`,
        JSON.stringify(faceData)
      );

      Alert.alert(
        'Success',
        'Face registration completed successfully!',
        [{ text: 'OK', onPress: () => onRegistrationComplete(faceData) }]
      );

    } catch (error) {
      console.error('Face registration error:', error);
      Alert.alert('Error', 'Failed to register face. Please try again.');
      setIsRegistering(false);
      setRegistrationStep(0);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <Button mode="contained" onPress={checkCameraPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        onError={(error) => console.error('Camera error:', error)}
      />
      
      <View style={styles.overlay}>
        <View style={styles.faceFrame} />
        
        <View style={styles.instructionContainer}>
          {registrationStep === 0 && (
            <Text style={styles.instructionText}>
              Position your face within the frame
            </Text>
          )}
          {registrationStep === 1 && faceDetected && (
            <Text style={styles.instructionText}>
              Face detected! Tap capture to register
            </Text>
          )}
          {registrationStep === 2 && (
            <Text style={styles.instructionText}>
              Processing... Please wait
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {registrationStep === 1 && faceDetected && !isRegistering && (
            <Button
              mode="contained"
              onPress={captureAndRegisterFace}
              style={styles.captureButton}
            >
              Capture & Register
            </Button>
          )}
          
          {isRegistering && (
            <ActivityIndicator size="large" color="#4CAF50" />
          )}
          
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            disabled={isRegistering}
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  faceFrame: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'transparent',
    marginTop: 60,
  },
  instructionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    marginVertical: 10,
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    borderColor: '#FFF',
    marginTop: 10,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
  },
});
