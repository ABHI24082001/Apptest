import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Button } from 'react-native-paper';
import FaceDetection from '@react-native-ml-kit/face-detection';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FaceAuthentication = ({ onAuthenticationComplete, onCancel, employeeId, action }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authStep, setAuthStep] = useState(0); // 0: detecting, 1: ready, 2: processing
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
    if (faces.length > 0 && !isAuthenticating) {
      setFaceDetected(true);
      if (authStep === 0) {
        setAuthStep(1);
      }
    } else {
      setFaceDetected(false);
    }
  };

  const authenticateFace = async () => {
    if (!cameraRef.current || isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthStep(2);

    try {
      // Get stored face data
      const storedFaceData = await AsyncStorage.getItem(`face_data_${employeeId}`);
      
      if (!storedFaceData) {
        Alert.alert('Error', 'No registered face found. Please register first.');
        onCancel();
        return;
      }

      const registeredFace = JSON.parse(storedFaceData);

      // Capture current photo
      const photo = await cameraRef.current.takePhoto({
        quality: 0.8,
        enableAutoStabilization: true,
      });

      // Detect faces in current photo
      const currentFaces = await FaceDetection.processImage(photo.path);
      
      if (currentFaces.length === 0) {
        Alert.alert('Error', 'No face detected. Please try again.');
        setIsAuthenticating(false);
        setAuthStep(0);
        return;
      }

      if (currentFaces.length > 1) {
        Alert.alert('Error', 'Multiple faces detected. Please ensure only one person is in the frame.');
        setIsAuthenticating(false);
        setAuthStep(0);
        return;
      }

      // Compare faces (simplified comparison - in production, use proper face matching algorithms)
      const similarity = compareFaces(registeredFace.faceFeatures, currentFaces[0]);
      
      if (similarity > 0.8) { // 80% similarity threshold
        Alert.alert(
          'Success',
          `Face authentication successful! ${action} completed.`,
          [{ text: 'OK', onPress: () => onAuthenticationComplete(true) }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          'Face does not match registered face. Please try again.',
          [
            { text: 'Retry', onPress: () => { setIsAuthenticating(false); setAuthStep(0); } },
            { text: 'Cancel', onPress: onCancel }
          ]
        );
      }

    } catch (error) {
      console.error('Face authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
      setIsAuthenticating(false);
      setAuthStep(0);
    }
  };

  // Simplified face comparison (in production, use proper face recognition algorithms)
  const compareFaces = (face1, face2) => {
    // This is a very basic comparison - in production, you would use:
    // - Face embeddings/encodings
    // - Machine learning models
    // - Third-party face recognition services
    
    const box1 = face1.bounds;
    const box2 = face2.bounds;
    
    // Compare bounding box ratios and positions (simplified)
    const widthRatio = Math.min(box1.width, box2.width) / Math.max(box1.width, box2.width);
    const heightRatio = Math.min(box1.height, box2.height) / Math.max(box1.height, box2.height);
    
    return (widthRatio + heightRatio) / 2;
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
          <Text style={styles.title}>{action} Authentication</Text>
          {authStep === 0 && (
            <Text style={styles.instructionText}>
              Position your face within the frame
            </Text>
          )}
          {authStep === 1 && faceDetected && (
            <Text style={styles.instructionText}>
              Face detected! Tap authenticate to {action.toLowerCase()}
            </Text>
          )}
          {authStep === 2 && (
            <Text style={styles.instructionText}>
              Authenticating... Please wait
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {authStep === 1 && faceDetected && !isAuthenticating && (
            <Button
              mode="contained"
              onPress={authenticateFace}
              style={styles.authButton}
            >
              Authenticate {action}
            </Button>
          )}
          
          {isAuthenticating && (
            <ActivityIndicator size="large" color="#4CAF50" />
          )}
          
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            disabled={isAuthenticating}
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
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  faceFrame: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
    marginTop: 60,
  },
  instructionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  authButton: {
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
    textAlign: 'center',
  },
});
