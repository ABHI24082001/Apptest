// components/AttendanceTracker.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Platform } from 'react-native';
import { Button, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import FaceDetector from '@react-native-ml-kit/face-detection';

const AttendanceTracker = ({
  checkedIn,
  elapsedTime,
  progress,
  progressPercentage,
  shiftHours,
  shiftCompleted,
  onCheckIn,
  onCheckOut,
}) => {
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [faceStep, setFaceStep] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.front;

  // Get current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    Geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      err => {
        Alert.alert('Location Error', err.message);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Open modal and fetch location
  const handleOpenModal = () => {
    setModalVisible(true);
    setFaceStep(false);
    setFaceDetected(false);
    setCameraActive(false);
    getCurrentLocation();
  };

  // Face detection logic
  const handleFaceId = async () => {
    setCameraActive(true);
    setFaceStep(true);
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      // Use ML Kit to detect face
      try {
        const faces = await FaceDetector.detectFromFile(photo.path);
        if (faces && faces.length > 0) {
          setFaceDetected(true);
          setCameraActive(false);
          Alert.alert('Success', 'Face detected. Check In successful!');
          setModalVisible(false);
          if (onCheckIn) onCheckIn();
        } else {
          Alert.alert('No Face Detected', 'Please try again.');
        }
      } catch (e) {
        Alert.alert('Error', 'Face detection failed.');
      }
    }
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBox,
                checkedIn ? styles.active : styles.inactive,
              ]}
            >
              <Text style={styles.statusText}>Check In {elapsedTime}</Text>
            </View>
            <View
              style={[
                styles.statusBox,
                !checkedIn ? styles.active : styles.inactive,
              ]}
            >
              <Text style={styles.statusText}>Check Out 00:00:00</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
            </View>
            <Text style={styles.progressText}>{progressPercentage}%</Text>
          </View>
          <Text style={styles.shiftTime}>Shift: {shiftHours}</Text>
          {shiftCompleted && <Text style={styles.completedText}>Shift Completed</Text>}
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={handleOpenModal}
              disabled={checkedIn}
              style={[styles.button, checkedIn ? styles.disabled : styles.green]}
            >
              Check In
            </Button>
            <Button
              mode="contained"
              onPress={onCheckOut}
              disabled={!checkedIn}
              style={[styles.button, !checkedIn ? styles.disabled : styles.red]}
            >
              Check Out
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Modal for Check In */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!faceStep ? (
              <>
                <Text style={styles.modalTitle}>Check In Location</Text>
                {loadingLocation ? (
                  <ActivityIndicator size="large" color="#2196F3" />
                ) : location ? (
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    region={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker
                      coordinate={location}
                      title="Your Location"
                      pinColor="#2196F3"
                    />
                  </MapView>
                ) : (
                  <Text>No location found</Text>
                )}
                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                  <Button
                    mode="outlined"
                    onPress={getCurrentLocation}
                    style={{ flex: 1, marginRight: 8 }}
                  >
                    Refresh
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleFaceId}
                    style={{ flex: 1, marginLeft: 8 }}
                    disabled={!location}
                  >
                    Face ID
                  </Button>
                </View>
                <Button
                  mode="text"
                  onPress={() => setModalVisible(false)}
                  style={{ marginTop: 12 }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Face Verification</Text>
                {device && cameraActive ? (
                  <Camera
                    ref={cameraRef}
                    style={styles.camera}
                    device={device}
                    isActive={cameraActive}
                    photo={true}
                  />
                ) : (
                  <ActivityIndicator size="large" color="#2196F3" />
                )}
                <Button
                  mode="contained"
                  onPress={handleTakePicture}
                  style={{ marginTop: 16 }}
                  disabled={!cameraActive}
                >
                  Take Face Photo
                </Button>
                <Button
                  mode="text"
                  onPress={() => {
                    setCameraActive(false);
                    setFaceStep(false);
                  }}
                  style={{ marginTop: 12 }}
                >
                  Back
                </Button>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#e8f5e9',
  },
  inactive: {
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
  shiftTime: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  completedText: {
    color: '#388E3C',
    fontSize: 13,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    height: 40,
  },
  green: {
    backgroundColor: '#4CAF50',
  },
  red: {
    backgroundColor: '#F44336',
  },
  disabled: {
    backgroundColor: '#BDBDBD',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  map: {
    width: 280,
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  camera: {
    width: 280,
    height: 320,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#000',
  },
});

export default AttendanceTracker;
