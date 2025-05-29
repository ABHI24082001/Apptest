import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { scanFaces } from 'vision-camera-face-detector';
import { runOnJS } from 'react-native-reanimated';

const FaceCapture = ({ onFaceCaptured }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);

  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    Camera.requestCameraPermission().then((status) => {
      setHasPermission(status === 'authorized');
    });
  }, []);

  const onBlink = () => {
    if (!blinkDetected) {
      setBlinkDetected(true);
      console.log('Blink detected');
      captureFace();
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const faces = scanFaces(frame);
    if (faces.length > 0) {
      const face = faces[0];
      const { leftEyeOpenProbability, rightEyeOpenProbability } = face;

      if (leftEyeOpenProbability < 0.3 && rightEyeOpenProbability < 0.3) {
        runOnJS(setEyesClosed)(true);
      } else if (eyesClosed) {
        runOnJS(onBlink)();
        runOnJS(setEyesClosed)(false);
      }
    }
  }, [eyesClosed]);

  const captureFace = async () => {
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const uri = `file://${photo.path}`;
      setPhotoUri(uri);

      const imageData = await fetch(uri);
      const blob = await imageData.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        onFaceCaptured(base64); // Pass to parent or upload
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      Alert.alert('Error capturing face');
    }
  };

  if (!device || !hasPermission) return <View style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      {blinkDetected && <Text style={styles.text}>Blink Detected!</Text>}
      {photoUri && <Image source={{ uri: photoUri }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  text: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'green',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderWidth: 2,
    borderColor: 'green',
  },
});

export default FaceCapture;


const uploadToServer = async (base64, isCheckIn = false) => {
  const url = isCheckIn
    ? 'https://your-api.com/face/checkin'
    : 'https://your-api.com/face/register';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'emp_001',
      imageBase64: base64,
    }),
  });

  const result = await res.json();
  console.log(result);
};
