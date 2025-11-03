import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
  AppState,
  Image,
  StatusBar,
} from 'react-native';
import styles from '../Stylesheet/dashboardcss';
import LinearGradient from 'react-native-linear-gradient';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import {Buffer} from 'buffer';
import jpeg from 'jpeg-js';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import axios from 'axios';
import AppSafeArea from '../component/AppSafeArea';
import * as geolib from 'geolib';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import {useAuth} from '../constants/AuthContext';
import BASE_URL from '../constants/apiConfig';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundService from 'react-native-background-actions';
import axiosInstance from '../utils/axiosInstance';
import LeaveStatus from '../component/LeaveStatus';
import OnLeaveUsers from '../component/OnLeaveUsers';
// Icons
const CheckIcon = () => <Text style={styles.icon}>✓</Text>;
const CameraIcon = () => <Text style={styles.icon}>📷</Text>;
const ClockIcon = () => <Text style={styles.icon}>🕐</Text>;
const CrossIcon = () => <Text style={[styles.icon, {color: 'red'}]}>✗</Text>;

// Config
const INPUT_SIZE = 112;
const COSINE_THRESHOLD = 0.7;
const EUCLIDEAN_THRESHOLD = 0.85;
const CHECK_IN_STORAGE_KEY = 'user_check_in_data';
const CAPTURED_FACE_STORAGE_KEY = 'captured_face_data';
const BG_LAST_ELAPSED_KEY = 'bg_last_elapsed_seconds';

const HomeScreen = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [missedPercentage, setMissedPercentage] = useState(0);

  const [shiftHours, setShiftHours] = useState('');
  const [shiftName, setShiftName] = useState(''); // NEW: Track shift name
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [session, setSession] = useState(null);
  const [registeredFace, setRegisteredFace] = useState(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRegistration, setShowRegistration] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFaceLoading, setIsFaceLoading] = useState(true); // Start with true
  const [cachedFaceImage, setCachedFaceImage] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // NEW: Track initial load
  const [leaveData, setLeaveData] = useState([]);
  const [leaveUsers, setLeaveUsers] = useState([]);
  const [totalShiftSeconds, setTotalShiftSeconds] = useState(28800); // Default 8 hours, will be updated dynamically

  const employeeDetails = useFetchEmployeeDetails();
  const progressIntervalRef = useRef(null);
  const imageProcessingTimeoutRef = useRef(null);
  const appStateSubscriptionRef = useRef(null);
  const {user} = useAuth();

  // Background service configuration
  const bgOptions = {
    taskName: 'Shift Progress',
    taskTitle: 'Shift in progress',
    taskDesc: 'Working...',
    taskIcon: {name: 'ic_launcher', type: 'mipmap'},
    color: '#2563EB',
    parameters: {delay: 1000},
  };

// Replace background service functions:

const backgroundTask = async (taskData) => {
  const delay = taskData?.delay ?? 1000;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 5;
  
  try {
    while (BackgroundService.isRunning()) {
      try {
        const elapsedData = await AsyncStorage.getItem(BG_LAST_ELAPSED_KEY);
        let elapsedSeconds = elapsedData ? parseInt(elapsedData, 10) : 0;
        elapsedSeconds += 1;
        
        await AsyncStorage.setItem(BG_LAST_ELAPSED_KEY, elapsedSeconds.toString());
        
        // Reset error counter on success
        consecutiveErrors = 0;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (innerError) {
        consecutiveErrors++;
        console.error(`Background task error ${consecutiveErrors}:`, innerError);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error('Too many consecutive errors, stopping background task');
          break;
        }
        
        // Exponential backoff on errors
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(delay * Math.pow(2, consecutiveErrors), 10000))
        );
      }
    }
  } catch (err) {
    console.error('Fatal background task error:', err);
  }
};

const startBackgroundService = async () => {
  try {
    // Check if already running
    const isRunning = BackgroundService.isRunning();
    if (isRunning) {
      console.log('Background service already running, stopping first...');
      await BackgroundService.stop();
      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await BackgroundService.start(bgOptions);
    await BackgroundService.updateNotification({
      taskDesc: 'Shift in progress...',
    });
    
    // Start the background task with enhanced error handling
    backgroundTask(bgOptions.parameters).catch(error => {
      console.error('Background task failed to start:', error);
      // Try to restart once
      setTimeout(() => {
        if (BackgroundService.isRunning()) {
          backgroundTask(bgOptions.parameters).catch(console.error);
        }
      }, 5000);
    });
    
    console.log('✅ Background service started successfully');
    
  } catch (e) {
    console.error('Failed to start background service:', e);
    // Don't throw, as this shouldn't fail check-in
  }
};

const stopBackgroundService = async () => {
  try {
    const isRunning = BackgroundService.isRunning();
    if (isRunning) {
      await BackgroundService.stop();
    }
  } catch (e) {
    console.error('Failed to stop background service:', e);
  }
};

  // Format time in Indian format
  const formatIndianTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatIndianDate = (date = new Date()) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Format time in hours and minutes
  const formatHoursMinutes = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Update current time every second
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(formatIndianTime());
      setCurrentDate(formatIndianDate());
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check-in state management
  const saveCheckInState = async (
    isCheckedIn,
    startTime = null,
    faceData = null,
  ) => {
    try {
      const data = {
        checkedIn: isCheckedIn,
        checkInTime: startTime || (isCheckedIn ? new Date().getTime() : null),
      };
      await AsyncStorage.setItem(CHECK_IN_STORAGE_KEY, JSON.stringify(data));
      if (faceData) {
        await AsyncStorage.setItem(CAPTURED_FACE_STORAGE_KEY, faceData);
      } else if (!isCheckedIn) {
        await AsyncStorage.removeItem(CAPTURED_FACE_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving check-in state:', error);
    }
  };

  // Add: parse and format helpers to normalize various time formats (numbers, ISO strings, or "HH:MM:SS.ffffff")
  const parseCheckInTime = val => {
    if (val == null) return null;
    // Already epoch ms
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      // Numeric string (epoch)
      const asNumber = Number(trimmed);
      if (!isNaN(asNumber)) return asNumber;
      // ISO date/time string
      const parsedIso = Date.parse(trimmed);
      if (!isNaN(parsedIso)) return parsedIso;
      // Bare time like "07:16:32.4300000" or "07:16:32"
      const timeMatch = trimmed.match(/(\d{1,2}):(\d{2}):(\d{2})/);
      if (timeMatch) {
        const now = new Date();
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        const dt = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          seconds,
        );
        return dt.getTime();
      }
    }
    return null;
  };

  const formatLoginTime = time => {
    const ms = parseCheckInTime(time);
    if (!ms) return '';
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  // Replace: loadCheckInState -> parse stored check-in values robustly
  const loadCheckInState = async () => {
    try {
      const [checkInData, faceData] = await Promise.all([
        AsyncStorage.getItem(CHECK_IN_STORAGE_KEY),
        AsyncStorage.getItem(CAPTURED_FACE_STORAGE_KEY),
      ]);

      if (faceData) setCapturedFace(faceData);

      if (checkInData) {
        const parsedData = JSON.parse(checkInData);

        // Use parser to ensure we have epoch ms for calculations
        const parsedCheckInMs = parseCheckInTime(parsedData.checkInTime);

        if (parsedData.checkedIn && parsedCheckInMs) {
          setCheckedIn(true);
          setCheckInTime(parsedCheckInMs);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - parsedCheckInMs) / 1000);
          setElapsedTime(formatTime(elapsedSeconds));
          startShiftProgress(elapsedSeconds, parsedData.shiftStartTime);
        } else {
          // Guard: if stored state is inconsistent, clear stale saved check-in to avoid NaN calculations
          if (parsedData.checkedIn && !parsedCheckInMs) {
            console.warn(
              'Stored check-in time could not be parsed, clearing stored check-in entry:',
              parsedData.checkInTime,
            );
            await AsyncStorage.removeItem(CHECK_IN_STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Error loading check-in state:', error);
    }
  };

  const startShiftProgress = (startSeconds = 0, shiftStartTime = null) => {
  try {
    let elapsedSeconds = startSeconds;
    let missedSeconds = 0;
    let missedPercent = 0;

    // Clear any existing interval first
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Calculate missed time if shift start time is available
    if (shiftStartTime && checkInTime) {
      const shiftStart = new Date(shiftStartTime);
      const actualCheckIn = new Date(checkInTime);
      missedSeconds = Math.max(0, (actualCheckIn - shiftStart) / 1000);
      missedPercent = Math.min(100, (missedSeconds / totalShiftSeconds) * 100);
      setMissedPercentage(missedPercent);
    }

    // Helper to compute progress
    const computeProgress = elapsedSec => {
      const effectiveDuration = totalShiftSeconds - missedSeconds;
      if (effectiveDuration <= 0) return 0;
      const workProgress = (elapsedSec / effectiveDuration) * (100 - missedPercent);
      return Math.min(100 - missedPercent, Math.max(0, workProgress));
    };

    // Set initial state
    setElapsedTime(formatTime(elapsedSeconds));
    setProgressPercentage(computeProgress(elapsedSeconds));

    // Check if already complete
    if (elapsedSeconds >= totalShiftSeconds) {
      setElapsedTime(formatTime(totalShiftSeconds));
      setProgressPercentage(100);
      return;
    }

    // Start interval with error handling
    progressIntervalRef.current = setInterval(() => {
      try {
        elapsedSeconds++;

        if (elapsedSeconds >= totalShiftSeconds) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          setElapsedTime(formatTime(totalShiftSeconds));
          setProgressPercentage(100);
          return;
        }

        setElapsedTime(formatTime(elapsedSeconds));
        setProgressPercentage(computeProgress(elapsedSeconds));
      } catch (intervalError) {
        console.error('Progress interval error:', intervalError);
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 1000);
  } catch (error) {
    console.error('Error starting shift progress:', error);
  }
};
  

// Replace your current useEffect with this enhanced version
useEffect(() => {
  let isMounted = true; // Track component mount status
  
  const initializeApp = async () => {
    try {
      if (!isMounted) return;
      
      await loadCheckInState();
      
      if (!isMounted) return;
      
      const checkInData = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);
      if (checkInData && isMounted) {
        const parsedData = JSON.parse(checkInData);
        if (parsedData.checkedIn && parsedData.checkInTime) {
          await startBackgroundService().catch(error => {
            console.error('Background service initialization failed:', error);
          });
        }
      }
    } catch (e) {
      console.error('Failed to initialize app:', e);
      if (isMounted) {
        // Show user-friendly error only if component is still mounted
        Alert.alert('Initialization Error', 'Please restart the app');
      }
    }
  };

  initializeApp();

  // Enhanced cleanup
  return () => {
    isMounted = false; // Prevent state updates after unmount
    
    // Clear all intervals and timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (imageProcessingTimeoutRef.current) {
      clearTimeout(imageProcessingTimeoutRef.current);
      imageProcessingTimeoutRef.current = null;
    }
    
    // Stop background service safely
    stopBackgroundService().catch(console.error);
  };
}, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        let modelPath = '';
        if (Platform.OS === 'android') {
          modelPath = `${RNFS.DocumentDirectoryPath}/mobilefacenet.onnx`;
          if (!(await RNFS.exists(modelPath))) {
            await RNFS.copyFileAssets('mobilefacenet.onnx', modelPath);
          }
        } else {
          const rawPath = `${RNFS.MainBundlePath}/mobilefacenet.onnx`;
          if (!(await RNFS.exists(rawPath))) {
            console.error('Model file not found in bundle');
            return;
          }
          modelPath = `file://${rawPath}`;
        }

        const s = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['cpu'],
          graphOptimizationLevel: 'all',
        });
        setSession(s);
      } catch (e) {
        console.error('Model load error:', e);
        Alert.alert('Error', `Failed to load model: ${e.message}`);
      }
    };

    loadModel();
  }, []);

  // FIXED: Face registration logic with better state management
  useEffect(() => {
    const fetchBiometricDetails = async () => {
      if (!employeeDetails?.id || !employeeDetails?.childCompanyId) {
        // console.log('❌ Employee details not available yet');
        setIsFaceLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      try {
        setIsFaceLoading(true);
        console.log(
          '🔍 Checking face registration for employee:',
          employeeDetails.id,
        );

        // Check cache first
        if (cachedFaceImage) {
          console.log('✅ Found face in cache');
          setRegisteredFace(cachedFaceImage);
          setShowRegistration(false);
          setIsFaceLoading(false);
          setInitialLoadComplete(true);
          return;
        }

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 10000),
        );

        const fetchPromise = axios.get(
          `${BASE_URL}/EmployeeBiomatricRegister/getEmployeeBiomatricDetailsByString/${employeeDetails.id}/${employeeDetails.childCompanyId}`,
        );

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // console.log('📦 API Response received:', {
        //   hasFaceImage: !!response.data?.faceImage,
        //   faceImageLength: response.data?.faceImage?.length,
        // });

        // VALIDATE face image properly
        const faceImage = response.data?.faceImage;
        const hasValidFaceImage =
          !!faceImage &&
          faceImage !== 'null' &&
          faceImage.trim() !== '' &&
          faceImage.length > 100;

        if (hasValidFaceImage) {
          // console.log('✅ Valid face image found');
          const imageData = `data:image/jpeg;base64,${faceImage}`;

          // Set all states together to avoid race conditions
          setRegisteredFace(imageData);
          setCachedFaceImage(imageData);
          setShowRegistration(false); // HIDE registration
          console.log('🎯 Setting showRegistration to FALSE');
        } else {
          // console.log('❌ No valid face image found');
          setRegisteredFace(null);
          setShowRegistration(true); // SHOW registration
          console.log('🎯 Setting showRegistration to TRUE');
        }
      } catch (err) {
        console.error('❌ API Error:', err?.response?.data || err.message);
        setRegisteredFace(null);
        setShowRegistration(true); // SHOW registration on error
        console.log('🎯 Setting showRegistration to TRUE due to error');
      } finally {
        setIsFaceLoading(false);
        setInitialLoadComplete(true);
        console.log('🏁 Initial load complete');
      }
    };

    fetchBiometricDetails();
  }, [employeeDetails, cachedFaceImage]);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔍 STATE UPDATE:', {
      showRegistration,
      registeredFace: !!registeredFace,
      isFaceLoading,
      initialLoadComplete,
    });
  }, [showRegistration, registeredFace, isFaceLoading, initialLoadComplete]);

  // Face registration handler
 // Replace handleReregisterFace function:

const handleReregisterFace = async () => {
  if (!session) {
    Alert.alert('Error', 'Face recognition model not loaded');
    return;
  }

  try {
    setIsRegistering(true);
    
    await launchCamera(async (res) => {
      try {
        if (!res.assets?.[0]?.base64) {
          throw new Error('No image captured');
        }

        const base64Image = `data:image/jpeg;base64,${res.assets[0].base64}`;
        
        // Process face embedding with timeout
        const embeddingPromise = getEmbedding(base64Image);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Face processing timeout')), 15000)
        );

        const embedding = await Promise.race([embeddingPromise, timeoutPromise]);
        
        if (!embedding) {
          throw new Error('Failed to process face');
        }

        // Save to server
        const payload = {
          EmployeeId: employeeDetails?.id,
          BiometricData: base64Image.split(',')[1], // Remove data:image/jpeg;base64,
        };

        const response = await axiosInstance.post(
          `${BASE_URL}/Employee/SaveEmployeeBiometric`,
          payload
        );

        if (!response.data?.isSuccess) {
          throw new Error(response.data?.message || 'Failed to save biometric data');
        }

        // Update local state
        setRegisteredFace(base64Image);
        setCachedFaceImage(base64Image);
        setShowRegistration(false);
        
        // Cache locally
        await AsyncStorage.setItem(CAPTURED_FACE_STORAGE_KEY, base64Image);

        Alert.alert('✅ Success', 'Face registered successfully!');
        
      } catch (error) {
        console.error('Face registration error:', error);
        Alert.alert('❌ Registration Failed', error.message || 'Please try again');
      }
    });
    
  } catch (error) {
    console.error('Registration process error:', error);
    Alert.alert('Error', 'Failed to start camera');
  } finally {
    setIsRegistering(false);
  }
};
  

  // Add memory cleanup in your camera functions
// Replace the existing launchCamera function with this fixed version:

// Replace launchCamera function with production-safe version
const launchCamera = async (callback) => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    // Clear any existing timeouts
    if (imageProcessingTimeoutRef.current) {
      clearTimeout(imageProcessingTimeoutRef.current);
      imageProcessingTimeoutRef.current = null;
    }

    return new Promise((resolve, reject) => {
      // Set timeout for camera operation
      const timeoutId = setTimeout(() => {
        reject(new Error('Camera operation timed out'));
      }, 30000);

      ImagePicker.launchCamera(
        {
          mediaType: 'photo',
          includeBase64: true,
          cameraType: 'front',
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          saveToPhotos: false, // Important for production
        },
        (response) => {
          clearTimeout(timeoutId);
          
          try {
            if (response.didCancel) {
              reject(new Error('Camera cancelled by user'));
              return;
            }
            
            if (response.errorCode || response.errorMessage) {
              reject(new Error(response.errorMessage || 'Camera error'));
              return;
            }

            if (!response.assets?.[0]?.base64) {
              reject(new Error('No image captured'));
              return;
            }

            // Validate image size (prevent memory issues)
            const imageSize = response.assets[0].base64.length;
            if (imageSize > 5000000) { // 5MB limit
              reject(new Error('Image too large. Please try again.'));
              return;
            }

            const result = callback(response);
            resolve(result);
          } catch (error) {
            console.error('Camera callback error:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Launch camera error:', error);
    throw error;
  }
};


 const getFormattedLocalDateTime = () => {
      const now = new Date();
      const pad = n => (n < 10 ? `0${n}` : n);

      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());

      const logDate = `${year}-${month}-${day}`;
      const logTime = `${hours}:${minutes}:${seconds}`;
      const logDateTime = `${logDate}T${logTime}`; // ✅ Local ISO (no milliseconds, no 'Z')

      return {logDate, logTime, logDateTime};
};

const handleCheckIn = async () => {
  if (!registeredFace) {
    Alert.alert(
      'Registration Required',
      'Please register your face first to enable check-in.',
    );
    setShowRegistration(true);
    return;
  }

  setIsLoading(true);

  try {
    // Step 1: Check location with timeout
    const locationPromise = checkLocation();
    const locationTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Location check timeout')), 20000)
    );
    
    const locationResult = await Promise.race([locationPromise, locationTimeout]);
    
    if (!locationResult.inside) {
      const nearest = locationResult.nearestFence
        ? `${locationResult.nearestFence.geoLocationName} (${Math.round(
            locationResult.nearestFence.distance,
          )}m away)`
        : 'Unknown area';

      Alert.alert(
        '❌ Location Failed',
        `You are not within the required area.\nNearest: ${nearest}`,
      );
      return;
    }

    // Step 2: Face verification with proper Promise handling
    const faceVerificationResult = await new Promise((resolve, reject) => {
      Alert.alert(
        'Face Verification',
        'Please capture your face for verification',
        [
          { 
            text: 'Cancel', 
            style: 'cancel', 
            onPress: () => reject(new Error('User cancelled verification'))
          },
          {
            text: 'Capture',
            onPress: async () => {
              try {
                await launchCamera(async (res) => {
                  try {
                    const capturedImage = `data:image/jpeg;base64,${res.assets[0].base64}`;
                    setCapturedFace(capturedImage);

                    // Match faces with timeout
                    const matchPromise = matchFaces(registeredFace, capturedImage);
                    const matchTimeout = new Promise((_, reject) => 
                      setTimeout(() => reject(new Error('Face matching timeout')), 20000)
                    );

                    const result = await Promise.race([matchPromise, matchTimeout]);
                    
                    if (!result?.isMatch) {
                      throw new Error('Face verification failed');
                    }

                    resolve({ capturedImage, matchResult: result });
                  } catch (error) {
                    reject(error);
                  }
                });
              } catch (error) {
                reject(error);
              }
            },
          },
        ],
      );
    });

    // Step 3: Save attendance with proper error handling
    const { logDate, logTime, logDateTime } = getFormattedLocalDateTime();

    const attendancePayload = {
      EmployeeId: String(employeeDetails?.id || '29'),
      EmployeeCode: String(employeeDetails?.id || '29'),
      LogDateTime: logDateTime,
      LogDate: logDate,
      LogTime: logTime,
      Direction: 'In',
      DeviceName: 'Bhubneswar',
      SerialNo: '1',
      VerificationCode: '1',
    };

    const attendancePromise = axiosInstance.post(
      `${BASE_URL}/BiomatricAttendance/SaveAttenance`,
      attendancePayload,
    );
    
    console.log('📤 Posting check-in attendance:', attendancePayload);


    const attendanceTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Attendance save timeout')), 15000)
    );

    const attendanceResponse = await Promise.race([attendancePromise, attendanceTimeout]);

    if (!attendanceResponse.data?.isSuccess) {
      throw new Error(
        attendanceResponse.data?.message || 'Failed to save attendance',
      );
    }

    // Step 4: Update state and start services
    const checkInMs = new Date().getTime();
    setCheckedIn(true);
    setCheckInTime(checkInMs);
    
    await Promise.all([
      saveCheckInState(true, checkInMs, faceVerificationResult.capturedImage),
      startBackgroundService()
    ]);

    Alert.alert(
      '✅ Check-In Successful',
      `Login: ${logDate} ${logTime}\nWelcome! Your shift has started.`,
    );

    // Start progress tracking
    startShiftProgress(0);

  } catch (error) {
    console.error('Check-in error:', error);
    let errorMessage = 'Something went wrong during check-in.';
    
    if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.message?.includes('cancelled')) {
      errorMessage = 'Check-in was cancelled.';
    } else if (error.message?.includes('verification failed')) {
      errorMessage = 'Face verification failed. Please try again.';
    }
    
    Alert.alert('❌ Check-In Failed', errorMessage);
  } finally {
    setIsLoading(false);
  }
};


const handleCheckOut = async () => { 
    setIsLoading(true);
    try {
      // ✅ Get properly formatted local time
      const {logDate, logTime, logDateTime} = getFormattedLocalDateTime();

      // ✅ Build payload
      const attendancePayload = {
        EmployeeId: String(employeeDetails?.id || '29'),
        EmployeeCode: String(employeeDetails?.id || '29'),
        LogDateTime: logDateTime,
        LogDate: logDate,
        LogTime: logTime,
        Direction: 'In',
        DeviceName: 'Bhubneswar',
        SerialNo: '1',
        VerificationCode: '1',
      };

      console.log('📤 Posting check-out attendance:', attendancePayload);

      // ✅ Send to API
      const attendanceResponse = await axiosInstance.post(
        `${BASE_URL}/BiomatricAttendance/SaveAttenance`,
        attendancePayload,
      );

      if (!attendanceResponse.data?.isSuccess) {
        throw new Error(
          attendanceResponse.data?.message || 'Failed to save attendance',
        );
      }

      // ✅ Reset check-in state after successful checkout
      await saveCheckInState(false);
      await stopBackgroundService();

      setCheckedIn(false);
      setCheckInTime(null);
      setProgressPercentage(0);
      setMissedPercentage(0);
      setElapsedTime('00:00:00');

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      Alert.alert(
        '✅ Check-Out Successful',
        `Logout: ${logDate} ${logTime}\nYour shift has ended. Have a great day!`,
      );
    } catch (error) {
      console.error('Check-out error:', error);
      Alert.alert(
        '❌ Check-Out Failed',
        'Failed to check out. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
};


  const normalize = useCallback(vec => {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm === 0) return vec;
    const normalized = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      normalized[i] = vec[i] / norm;
    }
    return normalized;
  }, []);

  const preprocessImage = useCallback(async base64Image => {
    try {
      const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const filePath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.jpg`;
      await RNFS.writeFile(filePath, pureBase64, 'base64');

      const resized = await ImageResizer.createResizedImage(
        filePath,
        INPUT_SIZE,
        INPUT_SIZE,
        'JPEG',
        100,
        0,
        null,
        false,
        {mode: 'cover', onlyScaleDown: false},
      );

      const resizedPath = resized.uri.replace('file://', '');
      const resizedBase64 = await RNFS.readFile(resizedPath, 'base64');

      RNFS.unlink(filePath).catch(err => console.log('Cleanup error:', err));
      RNFS.unlink(resizedPath).catch(err => console.log('Cleanup error:', err));

      return resizedBase64;
    } catch (err) {
      console.error('Preprocessing error:', err);
      return null;
    }
  }, []);

  const getEmbedding = useCallback(
    async base64Image => {
      try {
        if (!session) throw new Error('ONNX session not initialized');

        const processedBase64 = await preprocessImage(base64Image);
        if (!processedBase64) throw new Error('Image preprocessing failed');

        const raw = jpeg.decode(Buffer.from(processedBase64, 'base64'), {
          useTArray: true,
          formatAsRGBA: false,
        });

        if (!raw || !raw.data) throw new Error('JPEG decode failed');

        const mean = [0.5, 0.5, 0.5];
        const std = [0.5, 0.5, 0.5];
        const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);

        for (let y = 0; y < INPUT_SIZE; y++) {
          for (let x = 0; x < INPUT_SIZE; x++) {
            const idx = (y * INPUT_SIZE + x) * 3;
            const r = (raw.data[idx] / 255.0 - mean[0]) / std[0];
            const g = (raw.data[idx + 1] / 255.0 - mean[1]) / std[1];
            const b = (raw.data[idx + 2] / 255.0 - mean[2]) / std[2];

            floatData[y * INPUT_SIZE + x] = r;
            floatData[INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = g;
            floatData[2 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = b;
          }
        }

        const tensor = new ort.Tensor('float32', floatData, [
          1,
          3,
          INPUT_SIZE,
          INPUT_SIZE,
        ]);
        const feeds = {[session.inputNames[0]]: tensor};
        const results = await session.run(feeds);

        const embedding = results[session.outputNames[0]].data;
        return normalize(embedding);
      } catch (err) {
        console.error('Embedding error:', err);
        return null;
      }
    },
    [session, preprocessImage, normalize],
  );

  const cosineSimilarity = useCallback((a, b) => {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    if (normA === 0 || normB === 0) return 0;
    return Math.max(-1, Math.min(1, dot / (normA * normB)));
  }, []);

  const euclideanDistance = useCallback((a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }, []);

  // Replace matchFaces function:

const matchFaces = async (face1, face2) => {
  if (!session) {
    throw new Error('Model not loaded yet');
  }
  if (!face1 || !face2) {
    throw new Error('Both images are required for matching');
  }

  setIsProcessing(true);
  setMatchResult(null);

  try {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Face processing timeout')), 30000);
    });

    // Create embedding promises
    const embeddingPromise = Promise.all([
      getEmbedding(face1),
      getEmbedding(face2),
    ]);

    // Race against timeout
    const [emb1, emb2] = await Promise.race([embeddingPromise, timeoutPromise]);

    if (!emb1 || !emb2) {
      throw new Error('Failed to generate face embeddings');
    }

    // Calculate similarity synchronously (no await needed)
    const similarity = cosineSimilarity(emb1, emb2);
    const distance = euclideanDistance(emb1, emb2);

    const isMatch = similarity >= COSINE_THRESHOLD && distance <= EUCLIDEAN_THRESHOLD;

    let confidence = 'LOW';
    if (similarity >= 0.75 && distance <= 0.6) confidence = 'HIGH';
    else if (similarity >= 0.7 && distance <= 0.7) confidence = 'MEDIUM';

    const result = { isMatch, similarity, distance, confidence };
    setMatchResult(result);

    return result;
  } catch (error) {
    console.error('Matching error:', error);
    throw error; // Re-throw to be handled by caller
  } finally {
    setIsProcessing(false);
  }
};
  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };



  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.ACCESS_COARSE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        return new Promise(resolve => {
          Geolocation.requestAuthorization(
            () => resolve(true),
            () => resolve(false),
          );
        });
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const getCurrentPositionPromise = async (
    options = {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  ) => {
    try {
      return await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, options);
      });
    } catch (error) {
      return await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 20000,
        });
      });
    }
  };

  const safeParseFloat = (val, fallback = NaN) => {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const checkLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission denied', 'Location permission is required.');
        return {inside: false};
      }

      const pos = await getCurrentPositionPromise();
      const current = {
        latitude: parseFloat(pos.coords.latitude.toFixed(8)),
        longitude: parseFloat(pos.coords.longitude.toFixed(8)),
      };

      let fences = [];
      try {
        const res = await axios.get(
          `${BASE_URL}/GeoFencing/getGeoLocationDetailsByEmployeeId/${employeeDetails.id}/${employeeDetails.childCompanyId}`,
        );
        fences = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('GeoFence API Error:', err.message);
        Alert.alert('Error', 'Could not fetch geofence data');
        return {inside: false};
      }

      const matches = [];
      let nearest = null;
      let shortestDistance = Infinity;

      for (const f of fences) {
        const lat = safeParseFloat(f.lattitude ?? f.latitude);
        const lon = safeParseFloat(f.longitude ?? f.long);
        const radiusMeters = safeParseFloat(f.radius, 60);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

        const distance = geolib.getDistance(
          {latitude: current.latitude, longitude: current.longitude},
          {latitude: lat, longitude: lon},
        );

        const inside = distance <= radiusMeters;
        const fenceInfo = {...f, distance, inside};

        if (inside) matches.push(fenceInfo);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = fenceInfo;
        }
      }

      return {inside: matches.length > 0, nearestFence: nearest, matches};
    } catch (err) {
      console.error('Location check error:', err);
      Alert.alert('Error', 'Unable to get your current location');
      return {inside: false};
    }
  };

  useEffect(() => {
    const fetchEmployeesOnLeave = async () => {
      try {
        const companyId = user?.childCompanyId || 2;
        const branchId = user?.branchId || 20;
        const departmentId = user?.departmentId || 39;
        const employeeId = user?.id || 29;

        const url = `${BASE_URL}/CommonDashboard/GetLeaveApprovalDetails/${companyId}/${branchId}/${departmentId}/${employeeId}`;

        const response = await axiosInstance.get(url);

        // Transform the API data to match the expected format for OnLeaveUsers
        const transformedData = response.data.map(employee => ({
          id: employee.employeeId.toString(),
          name: employee.name,
          role: `${employee.designation}, ${employee.department}`,
          image: employee.empImage
            ? {uri: `${BASE_URL}/uploads/employee/${employee.empImage}`}
            : {uri: 'https://avatar.iran.liara.run/public/26'},
          empImage: employee.empImage, // Keep the original field for conditional rendering
        }));

        setLeaveUsers(transformedData);
      } catch (error) {
        console.error('Error fetching employees on leave:', error);
        setLeaveUsers([]);
      }
    };

    fetchEmployeesOnLeave();
  }, [user]);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const employeeId = user?.id;
        const companyId = user?.childCompanyId;

        if (!employeeId || !companyId) return;

        const response = await axiosInstance.get(
          `${BASE_URL}/CommonDashboard/GetEmployeeLeaveDetails/${companyId}/${employeeId}`,
        );

        const transformed = response.data.leaveBalances.map(item => ({
          label: item.leavename,
          used: item.usedLeaveNo,
          available: item.availbleLeaveNo,
        }));
        setLeaveData(transformed);
      } catch (error) {
        console.error('Error fetching leave data:', error.message);
      }
    };

    fetchLeaveData();
  }, [user]);

  useEffect(() => {
    const fetchShiftDetails = async () => {
      if (!employeeDetails?.id || !user?.childCompanyId) return;

      try {
        const today = new Date();

        // Create date range for API (today plus one day before and after)
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 1);

        const toDate = new Date(today);
        toDate.setDate(today.getDate() + 1);

        const payload = {
          EmployeeId: employeeDetails.id,
          Month: 0,
          Year: 0,
          YearList: null,
          ChildCompanyId: user.childCompanyId,
          FromDate: fromDate.toISOString().split('T')[0] + 'T00:00:00',
          ToDate: toDate.toISOString().split('T')[0] + 'T00:00:00',
          BranchName: null,
          BranchId: 0,
          EmployeeTypeId: 0,
          DraftName: null,
          Did: 0,
          UserId: 0,
          status: null,
          Ids: null,
          CoverLatter: null,
          DepartmentId: 0,
          DesignationId: 0,
          UserType: 0,
          CalculationType: 0,
          childCompanies: null,
          branchIds: null,
          departmentsIds: null,
          designationIds: null,
          employeeTypeIds: null,
          employeeIds: null,
          hasAllReportAccess: false,
        };

        const response = await axiosInstance.post(
          `${BASE_URL}/Shift/GetAttendanceDataForSingleEmployeebyshiftwiseForeachDay`,
          payload,
        );

        console.log(response.data, 'uicgiuogiudvgiudfgiu');

        if (response.data && Array.isArray(response.data)) {
          const todayDateStr =
            today.getDate().toString().padStart(2, '0') +
            ' ' +
            today.toLocaleString('en-US', {month: 'short'}) +
            ' ' +
            today.getFullYear();

          const todayShift = response.data.find(
            item => item.date === todayDateStr,
          );

          if (todayShift) {
            // Ensure valid shift times with fallback
            const shiftStart = new Date(todayShift.shiftStartTime || today);
            const shiftEnd = new Date(todayShift.shiftEndTime || today);
            const actualCheckIn = checkInTime ? new Date(checkInTime) : null;

            // Debug logging
            console.log('Shift Details:', {
              shiftStart: shiftStart.toLocaleString(),
              shiftEnd: shiftEnd.toLocaleString(),
              actualCheckIn:
                actualCheckIn?.toLocaleString() || 'Not checked in',
              rawShiftStart: todayShift.shiftStartTime,
              rawShiftEnd: todayShift.shiftEndTime,
            });

            // Validate shift times
            if (!isNaN(shiftStart.getTime()) && !isNaN(shiftEnd.getTime())) {
              // Calculate total shift duration in seconds dynamically
              const calculatedTotalShiftSeconds = Math.max(
                0,
                (shiftEnd - shiftStart) / 1000,
              );

              // Update the state with the calculated shift duration
              setTotalShiftSeconds(calculatedTotalShiftSeconds);

              console.log('Calculated shift duration:', {
                calculatedTotalShiftSeconds,
                hours: (calculatedTotalShiftSeconds / 3600).toFixed(2),
              });

              // If checked in, calculate missed time
              if (actualCheckIn && calculatedTotalShiftSeconds > 0) {
                const missedSeconds = Math.max(
                  0,
                  (actualCheckIn - shiftStart) / 1000,
                );
                const missedPercent =
                  (missedSeconds / calculatedTotalShiftSeconds) * 100;

                console.log('Time Calculations:', {
                  totalShiftSeconds: calculatedTotalShiftSeconds,
                  missedSeconds,
                  missedPercent: missedPercent.toFixed(2) + '%',
                  shiftStartTime: shiftStart.toLocaleTimeString(),
                  checkInTime: actualCheckIn.toLocaleTimeString(),
                });

                setMissedPercentage(Math.min(100, missedPercent));
              }

              // Format times for display with validation
              const formatTime = dateTimeStr => {
                try {
                  const date = new Date(dateTimeStr);
                  if (isNaN(date.getTime())) throw new Error('Invalid date');
                  return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });
                } catch (err) {
                  console.error('Time format error:', err);
                  return 'Invalid time';
                }
              };

              const startTime = formatTime(todayShift.shiftStartTime);
              const endTime = formatTime(todayShift.shiftEndTime);

              if (startTime !== 'Invalid time' && endTime !== 'Invalid time') {
                setShiftHours(`${startTime} - ${endTime}`);
              } else {
                setShiftHours('Shift times not available');
              }

              setShiftName(todayShift.shiftName || 'N/A');

              // If user is checked in, restart the shift progress with updated duration
              if (checkedIn && checkInTime) {
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - checkInTime) / 1000);
                startShiftProgress(elapsedSeconds, todayShift.shiftStartTime);
              }
            } else {
              console.error('Invalid shift times:', {
                start: todayShift.shiftStartTime,
                end: todayShift.shiftEndTime,
              });
              setShiftHours('Invalid shift times');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching shift details:', error);
        setShiftHours('Error loading shift');
      }
    };

    fetchShiftDetails();
  }, [employeeDetails?.id, user?.childCompanyId, checkInTime]);

  // Render logic
  const renderContent = () => {
    // Show loading until initial check is complete
    if (!initialLoadComplete || isFaceLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Checking face registration...</Text>
        </View>
      );
    }

    // Show registration screen if no face is registered
    if (showRegistration) {
      return (
        <View style={styles.registrationCard}>
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.registrationGradient}>
            <View style={styles.registrationIconWrapper}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.registrationIconBg}>
                <Text style={styles.registrationIconText}>🔐</Text>
              </LinearGradient>
            </View>
            <Text style={styles.registrationTitle}>
              Face Registration Required
            </Text>
            <Text style={styles.registrationDescription}>
              Register your face to enable attendance tracking and secure
              check-in/check-out.
            </Text>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleReregisterFace}
              disabled={isRegistering || isProcessing}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.registerButtonGradient}>
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CameraIcon />
                    <Text style={styles.registerButtonText}>
                      Register Face Now
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // Show dashboard if face is registered
    return (
      <>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <ClockIcon />
              <Text style={styles.progressTitle}>Today's Progress</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              {/* Red portion for missed time */}
              <View
                style={[
                  styles.missedTimeFill,
                  {
                    width: `${missedPercentage}%`,
                    backgroundColor: '#EF4444', // Red color
                    left: 0,
                  },
                ]}
              />
              {/* Blue portion for active work time */}
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercentage}%`,
                    left: `${missedPercentage}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.missesPercentageText}>
                Missed:{' '}
                {formatHoursMinutes(
                  Math.floor((missedPercentage / 100) * totalShiftSeconds),
                )}
              </Text>
              <Text style={styles.progressPercentageText}>
                Worked:{' '}
                {formatHoursMinutes(
                  Math.floor((progressPercentage / 100) * totalShiftSeconds),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.progressDetails}>
            <View style={styles.progressDetailItem}>
              <Text style={styles.progressDetailLabel}>Working Time</Text>
              <View style={{flexDirection: 'row', gap: 5}}>
                <Text style={styles.progressDetailValue}>
                  {elapsedTime.split(':')[0]}h
                </Text>
                <Text style={styles.progressDetailValue}>
                  {elapsedTime.split(':')[1]}m
                </Text>
                <Text style={styles.progressDetailValue}>
                  {elapsedTime.split(':')[2]}s
                </Text>
              </View>
            </View>

            <View style={styles.progressDivider} />
            <View style={styles.progressDetailItem}>
              <Text style={styles.progressDetailLabel}>Shift Hours</Text>
              <Text style={styles.progressDetailValue}>
                {shiftHours || 'No shift'}
              </Text>
            </View>
          </View>

          {shiftName ? (
            <View style={styles.shiftNameContainer}>
              <Text style={styles.shiftDetailLabel}>Shift Name :</Text>
              <Text style={styles.shiftNameValue}>{shiftName}</Text>
            </View>
          ) : (
            <View style={styles.shiftNameContainer}>
              <Text style={styles.shiftDetailLabel}>Shift Name:</Text>
              <Text style={styles.shiftNameValue}>N/A</Text>
            </View>
          )}
        </View>

        {/* Check In/Out Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              !checkedIn ? styles.checkInButton : styles.disabledButton,
            ]}
            onPress={handleCheckIn}
            disabled={checkedIn || isLoading}
            activeOpacity={0.8}>
            <LinearGradient
              colors={
                !checkedIn ? ['#10B981', '#059669'] : ['#D1D5DB', '#9CA3AF']
              }
              style={styles.actionButtonGradient}>
              {isLoading && !checkedIn ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.actionButtonIcon}>→</Text>
                  <Text style={styles.actionButtonText}>Check In</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              checkedIn ? styles.checkOutButton : styles.disabledButton,
            ]}
            onPress={handleCheckOut}
            disabled={!checkedIn || isLoading}
            activeOpacity={0.8}>
            <LinearGradient
              colors={
                checkedIn ? ['#EF4444', '#DC2626'] : ['#D1D5DB', '#9CA3AF']
              }
              style={styles.actionButtonGradient}>
              {isLoading && checkedIn ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.actionButtonIcon}>←</Text>
                  <Text style={styles.actionButtonText}>Check Out</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Face Preview Section */}
        {/* <View style={styles.facePreviewCard}>
          <Text style={styles.facePreviewTitle}>Biometric Verification</Text>
          <View style={styles.facePreviewItem}>
            <Text style={styles.facePreviewLabel}>Registered Face</Text>
            <View style={styles.faceImageContainer}>
              {registeredFace ? (
                <Image
                  source={{uri: registeredFace}}
                  style={styles.faceImage}
                />
              ) : (
                <View style={styles.faceImagePlaceholder}>
                  <Text style={styles.faceImagePlaceholderText}>No Image</Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                {registeredFace ? <CheckIcon /> : <CrossIcon />}
              </View>
            </View>
          </View>
        </View> */}
        <LeaveStatus leaveData={leaveData} />

        <OnLeaveUsers leaveUsers={leaveUsers} />
      </>
    );
  };

  return (
    <AppSafeArea>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#1E40AF', '#2563EB', '#3B82F6']}
          style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerGreeting}>Welcome back!</Text>
              <Text style={styles.headerName}>
                {employeeDetails?.employeeName || 'Employee'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.timeContainer}>
                <Text style={styles.headerTime}>{currentTime}</Text>
                <Text style={styles.headerDate}>{currentDate}</Text>
              </View>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                checkedIn ? styles.statusActive : styles.statusInactive,
              ]}
            />
            {checkedIn && checkInTime ? (
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.statusText}>Checked In</Text>
                <Text style={[styles.statusText, {fontSize: 12, marginTop: 4}]}>
                  Login : {formatLoginTime(checkInTime)}
                </Text>
              </View>
            ) : (
              <Text style={styles.statusText}>Not Checked In</Text>
            )}
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>{renderContent()}</View>
      </ScrollView>
    </AppSafeArea>
  );
};

export default HomeScreen;