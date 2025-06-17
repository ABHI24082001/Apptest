import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Alert, Platform, ToastAndroid} from 'react-native';
import { Button, IconButton, ActivityIndicator } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import * as geolib from 'geolib';
import { FaceDetector } from 'react-native-vision-camera-face-detector';
import base64 from 'react-native-base64';
import { runOnJS } from 'react-native-reanimated';
import axios from 'axios';

// Face detection settings
const FACE_DETECTION_CONFIG = {
  minDetectionConfidence: 0.85,
  stabilityThreshold: 1000,
  maxFaces: 1
};

const API_URL = 'http://192.168.29.2:90/api/';

const GeofencingCamera = ({
  visible,
  onClose,
  onSuccess,
  employeeDetails,
  geoFenceDetails = [],
}) => {
  // State for location verification
  const [currentStep, setCurrentStep] = useState('location'); // 'location', 'camera'
  const [userLocation, setUserLocation] = useState(null);
  const [nearestOffice, setNearestOffice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Camera state
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const [cameraDevice, setCameraDevice] = useState(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(false);
  const [faceBounds, setFaceBounds] = useState(null);
  const [faceDetectionStartTime, setFaceDetectionStartTime] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceDetectionMessage, setFaceDetectionMessage] = useState('Position your face in the frame');
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [photoBase64, setPhotoBase64] = useState(null);
  
  // Silent countdown timer
  const countdownTimerRef = useRef(null);
  const [countdownActive, setCountdownActive] = useState(false);
  
  // Frame dimensions for calculations
  const [frameDimensions, setFrameDimensions] = useState({ width: 0, height: 0 });
  
  // Effects and handlers
  useEffect(() => {
    if (visible) {
      setCurrentStep('location');
      verifyLocation();
    } else {
      // Reset state when modal is closed
      setCurrentStep('location');
      setError(null);
      setFaceDetected(false);
      setFaceVerified(false);
      setCameraInitialized(false);
      setCameraReady(false);
      setFaceDetectionEnabled(false);
      stopCountdown();
    }
  }, [visible]);
  
  // Start countdown timer function
  const startCountdown = useCallback(() => {
    if (countdownActive) return;
    
    setCountdownActive(true);
    let secondsRemaining = 15;
    
    countdownTimerRef.current = setInterval(() => {
      secondsRemaining -= 1;
      
      if (secondsRemaining <= 0) {
        // Time's up, stop countdown
        stopCountdown();
        setFaceVerified(true);
        setFaceDetectionMessage('Face verified! Ready to proceed.');
      }
    }, 1000);
  }, [countdownActive]);
  
  // Stop countdown timer function
  const stopCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownActive(false);
  }, []);
  
  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);
  
  // Toast function that works on both platforms
  const showToast = useCallback((message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  }, []);

  // Measure camera view dimensions when it's rendered
  const onCameraLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setFrameDimensions({ width, height });
  }, []);

  // Check if the face is centered properly in the frame
  const isFaceCentered = useCallback((faceBounds, frameWidth, frameHeight) => {
    if (!faceBounds) return false;
    
    const centerX = faceBounds.x + faceBounds.width / 2;
    const centerY = faceBounds.y + faceBounds.height / 2;
    
    const frameCenterX = frameWidth / 2;
    const frameCenterY = frameHeight / 2;
    
    // Calculate how far the face is from the center (as a percentage)
    const offsetX = Math.abs(centerX - frameCenterX) / frameWidth;
    const offsetY = Math.abs(centerY - frameCenterY) / frameHeight;
    
    // Face is centered if it's within 15% of the center in both axes
    return offsetX < 0.15 && offsetY < 0.15;
  }, []);
  
  // Check if the face is at an appropriate size (not too small or large)
  const isAppropriateSize = useCallback((faceBounds, frameWidth, frameHeight) => {
    if (!faceBounds) return false;
    
    // Calculate face area as a percentage of the frame
    const faceArea = faceBounds.width * faceBounds.height;
    const frameArea = frameWidth * frameHeight;
    const areaPercentage = faceArea / frameArea;
    
    // Face should occupy between 10-50% of the frame
    return areaPercentage > 0.1 && areaPercentage < 0.5;
  }, []);

  // Enhanced face detection processor with stability tracking
  const faceDetectionProcessor = useCallback(async (frame) => {
    'worklet';
    try {
      if (!faceDetectionEnabled) return;

      // Get frame dimensions for calculations
      const frameWidth = frame.width;
      const frameHeight = frame.height;

      // Detect faces in the current frame
      const faces = await FaceDetector.detectFaces(frame);
      
      // Check if any face was detected and meets confidence threshold
      const validFaces = faces?.filter(face => 
        face.detection?.score >= FACE_DETECTION_CONFIG.minDetectionConfidence
      ) || [];
      
      const hasDetectedFace = validFaces.length > 0;
      
      // Get bounds of the first detected face (if any)
      const detectedFaceBounds = hasDetectedFace ? validFaces[0].bounds : null;
      const detectionConfidence = hasDetectedFace ? validFaces[0].detection?.score || 0 : 0;
      
      // Update state via worklet compatible methods
      runOnJS(setFaceDetected)(hasDetectedFace);
      runOnJS(setFaceBounds)(detectedFaceBounds);
      runOnJS(setFaceConfidence)(detectionConfidence * 100); // Convert to percentage
      
      // Update face detection message
      if (!hasDetectedFace) {
        runOnJS(setFaceDetectionMessage)('Position your face in the frame');
        runOnJS(setFaceDetectionStartTime)(null);
        runOnJS(setFaceVerified)(false);
        runOnJS(stopCountdown)();
        return;
      }
      
      // Check if face is centered and at appropriate size
      const isCentered = isFaceCentered(
        detectedFaceBounds, 
        frameWidth, 
        frameHeight
      );
      
      const isGoodSize = isAppropriateSize(
        detectedFaceBounds, 
        frameWidth, 
        frameHeight
      );
      
      // Determine message based on face position and size
      if (!isCentered) {
        runOnJS(setFaceDetectionMessage)('Center your face in the frame');
        runOnJS(setFaceDetectionStartTime)(null);
        runOnJS(stopCountdown)();
      } else if (!isGoodSize) {
        runOnJS(setFaceDetectionMessage)('Move closer or further from camera');
        runOnJS(setFaceDetectionStartTime)(null);
        runOnJS(stopCountdown)();
      } else {
        // Face is well-positioned, start the detection timer if not already started
        const currentTime = Date.now();
        if (!faceDetectionStartTime) {
          runOnJS(setFaceDetectionMessage)('Hold still, verifying face...');
          runOnJS(setFaceDetectionStartTime)(currentTime);
          runOnJS(startCountdown)();
        }
      }
    } catch (e) {
      // Silently handle errors
      console.log('Face detection error', e);
    }
  }, [faceDetectionEnabled, faceDetectionStartTime, faceVerified, isFaceCentered, isAppropriateSize, startCountdown, stopCountdown]);

  // Initialize camera with proper permission handling
  const initializeCamera = useCallback(async () => {
    try {
      // Check current permission status first
      const currentPermission = await Camera.getCameraPermissionStatus();
      
      if (currentPermission !== 'authorized' && currentPermission !== 'granted') {
        // Explicitly request permission if not already granted
        const permission = await Camera.requestCameraPermission();
        
        if (permission !== 'authorized' && permission !== 'granted') {
          setError('Camera permission required. Please grant camera access in settings.');
          return false;
        }
      }
      
      return true;
    } catch (err) {
      setError('Failed to initialize camera: ' + err.message);
      return false;
    }
  }, []);

  // Location verification function
  const verifyLocation = useCallback(() => {
    try {
      setCurrentStep('location');
      setIsLoading(true);
      setError(null);
      
      // If no geo fence details provided, show error
      if (!geoFenceDetails || geoFenceDetails.length === 0) {
        setError('No location details available. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      Geolocation.getCurrentPosition(
        position => {
          const userPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setUserLocation(userPos);
          
          // Convert geo fence details to the expected format
          const officeLocations = geoFenceDetails.map(geo => ({
            latitude: parseFloat(geo.lattitude),
            longitude: parseFloat(geo.longitude),
            title: geo.geoLocationName,
            radius: parseFloat(geo.radius) * 1000, // Convert radius to meters
            address: geo.address,
            areaType: geo.areaType,
            geoLocationId: geo.gid
          }));
          
          // Calculate distance to each office and find nearest
          let nearestLoc = null;
          let shortestDistance = Number.MAX_VALUE;
          
          officeLocations.forEach((office) => {
            const distance = geolib.getDistance(
              userPos,
              { latitude: office.latitude, longitude: office.longitude }
            );
            
            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestLoc = {
                ...office,
                distance: distance
              };
            }
          });
          
          setNearestOffice(nearestLoc);
          
          // Check if user is within allowed radius of the nearest office
          const withinRadius = nearestLoc && nearestLoc.distance <= nearestLoc.radius;
          
          setTimeout(() => {
            setIsLoading(false);
            
            if (withinRadius) {
              showToast(`Location verified: ${nearestLoc.title}`);
              setCurrentStep('camera');
              
              // Initialize camera
              const initCamera = async () => {
                const hasPermission = await initializeCamera();
                if (hasPermission) {
                  setCameraInitialized(true);
                  setFaceDetectionEnabled(true);
                }
              };
              initCamera();
            } else {
              // Show alert for location mismatch
              const distance = nearestLoc ? nearestLoc.distance : 0;
              const radius = nearestLoc ? nearestLoc.radius : 0;
              const title = nearestLoc ? nearestLoc.title : "office";
              
              Alert.alert(
                "Location Verification Failed",
                `You are ${(distance/1000).toFixed(2)} km away from ${title}. You need to be within ${(radius/1000).toFixed(2)} km radius to check in.`,
                [
                  {
                    text: "Try Again",
                    onPress: () => verifyLocation()
                  },
                  {
                    text: "Cancel",
                    onPress: () => {
                      onClose();
                    },
                    style: "cancel"
                  }
                ]
              );
              setError(`You are too far from ${title}. Please move closer to check in.`);
            }
          }, 1500);
        },
        err => {
          setIsLoading(false);
          setError(`Location error: ${err.message}`);
          Alert.alert("Location Error", err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch (err) {
      setIsLoading(false);
      setError(`Location verification failed: ${err.message}`);
    }
  }, [geoFenceDetails, initializeCamera, onClose, showToast]);

  // Camera error handler
  const onCameraError = useCallback((error) => {
    setError(`Camera error: ${error.message}`);
    setCameraInitialized(false);
    setCameraReady(false);
  }, []);

  // Camera ready handler
  const onCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  // Update camera device when devices change
  useEffect(() => {
    if (devices) {
      // Try to get front camera first
      const frontCamera = devices.front;
      
      // If no front camera, try any available camera
      const anyCamera = Object.values(devices).find(d => d) || null;
      
      setCameraDevice(frontCamera || anyCamera);
      
      if (!frontCamera && !anyCamera) {
        setError('No camera device found on this device');
      }
    }
  }, [devices]);

  // Handle taking photo
  const handleTakePhoto = async () => {
    if (!cameraRef.current) {
      showToast('Camera not initialized');
      return;
    }
    
    if (!faceVerified) {
      showToast('Please wait for face verification to complete');
      return;
    }
    
    try {
      setProcessingPhoto(true);
      
      let photoPath = null;
      let photoBase64Data = null;
      
      try {
        // Take photo with face detection data
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'balanced',
          enableAutoRedEyeReduction: true,
          includeBase64: true,
        });
        
        photoPath = photo.path;
        
        // Store base64 data if available
        if (photo.base64) {
          photoBase64Data = photo.base64;
          setPhotoBase64(photoBase64Data);
        }
      } catch (cameraErr) {
        console.error('Error taking photo:', cameraErr);
      }
      
      showToast('Face verification successful');
      
      // Send success data back to parent component
      onSuccess({
        userLocation,
        nearestOffice,
        photoPath,
        photoBase64: photoBase64Data,
        faceDetected: true,
        faceBounds
      });
      
      setProcessingPhoto(false);
      
    } catch (err) {
      setProcessingPhoto(false);
      setError(`Failed to process: ${err.message}`);
    }
  };

  // Render face detection overlay
  const renderFaceDetectionOverlay = () => {
    if (!faceDetectionEnabled) return null;
    
    return (
      <View style={styles.faceDetectionOverlay} onLayout={onCameraLayout}>
        {/* Status indicator */}
        <View style={[
          styles.faceStatusIndicator,
          faceVerified ? styles.faceVerifiedIndicator : 
          faceDetected ? styles.faceDetectedIndicator :
          styles.faceNotDetectedIndicator
        ]}>
          <IconButton 
            icon={faceVerified ? "check-circle" : "face-recognition"} 
            size={24} 
            color={faceVerified ? "#4CAF50" : faceDetected ? "#2196F3" : "#FFC107"} 
          />
          <Text style={[
            styles.faceStatusText,
            faceVerified ? styles.faceVerifiedText : 
            faceDetected ? styles.faceDetectedText :
            styles.faceNotDetectedText
          ]}>
            {faceDetectionMessage}
          </Text>
        </View>
        
        {/* Face tracking box */}
        {faceBounds && (
          <View
            style={[
              styles.faceBoundsBox,
              {
                left: faceBounds.x,
                top: faceBounds.y,
                width: faceBounds.width,
                height: faceBounds.height,
                borderColor: faceVerified ? '#4CAF50' : '#2196F3'
              }
            ]}
          />
        )}
        
        {/* Targeting guide overlay when no face is detected */}
        {!faceDetected && (
          <View style={styles.faceGuideOverlay}>
            <View style={styles.faceGuideBorder} />
          </View>
        )}
        
        {/* Confidence indicator */}
        {faceDetected && (
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBarBg}>
              <View 
                style={[
                  styles.confidenceBarFill, 
                  { width: `${faceConfidence}%` },
                  faceConfidence > 90 ? styles.confidenceHigh : 
                  faceConfidence > 75 ? styles.confidenceMedium :
                  styles.confidenceLow
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(faceConfidence)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render camera component
  const renderCamera = () => {
    if (!cameraDevice) {
      return (
        <View style={styles.cameraPlaceholder}>
          <IconButton icon="camera-off" size={36} color="#F44336" />
          <Text style={styles.placeholderText}>No camera available</Text>
          <Button 
            mode="contained"
            onPress={async () => {
              const success = await initializeCamera();
              if (success) {
                setCameraInitialized(true);
              }
            }}
            style={{marginTop: 12}}
          >
            Retry Camera
          </Button>
        </View>
      );
    }

    return (
      <>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={cameraDevice}
          isActive={currentStep === 'camera' && cameraInitialized}
          photo={true}
          orientation="portrait"
          onInitialized={onCameraReady}
          onError={onCameraError}
          frameProcessor={faceDetectionProcessor}
          frameProcessorFps={5}
        />
        
        {!cameraReady && (
          <View style={styles.cameraLoadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.cameraLoadingText}>Initializing Camera...</Text>
          </View>
        )}
        
        {renderFaceDetectionOverlay()}
        
        <View style={styles.cameraControlsOverlay}>
          <Button
            mode="contained"
            icon="camera"
            onPress={handleTakePhoto}
            style={styles.captureButton}
            disabled={!cameraReady || !faceVerified || processingPhoto}
            loading={processingPhoto}
          >
            {processingPhoto ? 'Processing...' : 'Capture'}
          </Button>
        </View>
      </>
    );
  };

  // Render geofencing success display
  const renderGeofencingSuccess = () => {
    if (nearestOffice && !error) {
      return (
        <View style={styles.geofencingSuccessContainer}>
          <View style={styles.successCircle}>
            <IconButton icon="check" size={36} color="#fff" />
          </View>
          <Text style={styles.successText}>
            Location verified: {nearestOffice.title}
          </Text>
          <Text style={styles.infoText}>
            Distance: {(nearestOffice.distance / 1000).toFixed(2)} km
          </Text>
          {nearestOffice.address && (
            <Text style={styles.addressText}>
              {nearestOffice.address}
            </Text>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (!isLoading) onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentStep === 'location' ? 'Location Verification' : 'Face Verification'}
          </Text>
          
          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>
                {currentStep === 'location' ? 'Verifying your location...' : 'Processing...'}
              </Text>
            </View>
          )}
          
          {/* Error display */}
          {error && !isLoading && currentStep === 'location' && (
            <View style={styles.errorContainer}>
              <IconButton icon="alert-circle" size={32} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                mode="contained" 
                onPress={() => {
                  setError(null);
                  verifyLocation();
                }}
                style={styles.retryButton}
              >
                Retry
              </Button>
            </View>
          )}
          
          {/* Success message for geofencing */}
          {currentStep === 'location' && !isLoading && renderGeofencingSuccess()}
          
          {/* Camera for face verification */}
          {currentStep === 'camera' && !isLoading && (
            <View style={styles.cameraContainer}>
              {renderCamera()}
            </View>
          )}
          
          {/* Bottom buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="text"
              onPress={onClose}
              disabled={isLoading || processingPhoto}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  loadingContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#F44336',
    marginVertical: 8,
  },
  retryButton: {
    marginTop: 12,
  },
  geofencingSuccessContainer: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: '#388E3C',
    marginBottom: 8,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16
  },
  cameraContainer: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginVertical: 16,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
    padding: 10,
  },
  cameraLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraLoadingText: {
    color: '#FFF',
    marginTop: 12,
  },
  cameraControlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
  },
  captureButton: {
    width: 150,
    borderRadius: 24,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  cancelButton: {
    alignSelf: 'flex-end',
  },
  faceDetectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  faceStatusIndicator: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  faceVerifiedIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  faceDetectedIndicator: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
  },
  faceNotDetectedIndicator: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  faceStatusText: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  faceVerifiedText: {
    color: '#FFFFFF',
  },
  faceDetectedText: {
    color: '#FFFFFF',
  },
  faceNotDetectedText: {
    color: '#FFC107',
  },
  faceBoundsBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  faceGuideOverlay: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: '70%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuideBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 140,
    borderStyle: 'dashed',
  },
  confidenceContainer: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  confidenceBarBg: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: 6,
  },
  confidenceHigh: {
    backgroundColor: '#4CAF50',
  },
  confidenceMedium: {
    backgroundColor: '#FFC107',
  },
  confidenceLow: {
    backgroundColor: '#F44336',
  },
  confidenceText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFF',
  },
  countdownContainer: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  countdownText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  }
});

export default GeofencingCamera;
