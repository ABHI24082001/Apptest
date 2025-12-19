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
  Modal,
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
import moment from 'moment';
import LottieView from 'lottie-react-native';


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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // NEW: Track initial load
  const [leaveData, setLeaveData] = useState([]);
  const [leaveUsers, setLeaveUsers] = useState([]);
  const [totalShiftSeconds, setTotalShiftSeconds] = useState(28800); // Default 8 hours, will be updated dynamically
  const [totalShiftHours, setTotalShiftHours] = useState(8);
  const [autoCheckoutEnabled, setAutoCheckoutEnabled] = useState(false);
  const [isLocationProcessing, setIsLocationProcessing] = useState(false);

  const employeeDetails = useFetchEmployeeDetails();

  
  const progressIntervalRef = useRef(null);
  const imageProcessingTimeoutRef = useRef(null);
  const sleep = t => new Promise(resolve => setTimeout(resolve, t));
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

  const backgroundTask = async taskData => {
    const delay = taskData?.delay ?? 1000;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    try {
      while (BackgroundService.isRunning()) {
        try {
          const elapsedData = await AsyncStorage.getItem(BG_LAST_ELAPSED_KEY);
          let elapsedSeconds = elapsedData ? parseInt(elapsedData, 10) : 0;
          elapsedSeconds += 1;

          await AsyncStorage.setItem(
            BG_LAST_ELAPSED_KEY,
            elapsedSeconds.toString(),
          );

          // Reset error counter on success
          consecutiveErrors = 0;

          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (innerError) {
          consecutiveErrors++;
          console.error(
            `Background task error ${consecutiveErrors}:`,
            innerError,
          );

          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error(
              'Too many consecutive errors, stopping background task',
            );
            break;
          }

          // Exponential backoff on errors
          await new Promise(resolve =>
            setTimeout(
              resolve,
              Math.min(delay * Math.pow(2, consecutiveErrors), 10000),
            ),
          );
        }
      }
    } catch (err) {
      console.error('Fatal background task error:', err);
    }
  };

  // Start background service

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

  // stop background service

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

  // format date in Indian format

  const formatIndianDate = (date = new Date()) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time in HH:MM:SS

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

  // Check-in  saveCheckInState

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

      // Save check-in date for midnight comparison
      if (isCheckedIn) {
        const today = moment().format('YYYY-MM-DD');
        await AsyncStorage.setItem('CHECK_IN_DATE', today);
      } else {
        await AsyncStorage.removeItem('CHECK_IN_DATE');
      }

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

  // Add: format helpers

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

  // Add: startShiftProgress

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

      // Calculate missed time if shift start time is available and user is checked in
      if (shiftStartTime && checkInTime) {
        const shiftStart = new Date(shiftStartTime);
        const actualCheckIn = new Date(checkInTime);

        // Only calculate missed time if check-in was after shift start
        if (actualCheckIn > shiftStart) {
          missedSeconds = Math.max(0, (actualCheckIn - shiftStart) / 1000);
          missedPercent = Math.min(
            100,
            (missedSeconds / totalShiftSeconds) * 100,
          );

          console.log('Progress Missed Time Calculation:', {
            shiftStart: shiftStart.toLocaleString(),
            actualCheckIn: actualCheckIn.toLocaleString(),
            missedSeconds,
            missedPercent: missedPercent.toFixed(2) + '%',
            totalShiftSeconds,
          });
        }

        setMissedPercentage(missedPercent);
      }

      // Helper to compute progress
      const computeProgress = elapsedSec => {
        // Calculate progress based on actual work time vs expected work time
        const expectedWorkSeconds = totalShiftSeconds - missedSeconds;
        if (expectedWorkSeconds <= 0) return 0;

        const workProgress = (elapsedSec / totalShiftSeconds) * 100;
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

  // On mount: load check-in state and start background service if needed

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

  // Load ONNX model on mount

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
          const rawPath = `${RNFS.MainBundlePath}/tiny_model.onnx`;
          if (!(await RNFS.exists(rawPath))) {
             await RNFS.copyFileAssets('tiny_model.onnx', rawPath);
          } else {
            console.log('❌ iOS model NOT found');
          }
          modelPath = rawPath;
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

  // handle re-register face
  const handleReregisterFace = async () => {
    if (!session) {
      Alert.alert('Error', 'Model not loaded yet');
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access required');
      return;
    }

    setIsRegistering(true);

    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
        cameraType: 'front',
        quality: 0.7,
        maxWidth: 500,
        maxHeight: 500,
      },
      async res => {
        if (res.didCancel) {
          setIsRegistering(false);
          return;
        }

        if (!res.assets?.[0]?.base64) {
          Alert.alert('Error', 'No image captured');
          setIsRegistering(false);
          return;
        }

        try {
          setIsProcessing(true);
          const base64Image = `data:image/jpeg;base64,${res.assets[0].base64}`;

          let embeddingComplete = false;
          imageProcessingTimeoutRef.current = setTimeout(() => {
            if (!embeddingComplete) {
              setIsProcessing(false);
              setIsRegistering(false);
              Alert.alert(
                'Processing Error',
                'Face processing took too long. Please try again.',
              );
            }
          }, 15000);

          const emb = await getEmbedding(base64Image);
          embeddingComplete = true;

          if (!emb) throw new Error('Failed to get embedding');

          const buffer = Buffer.from(new Float32Array(emb).buffer);
          const embeddingBase64 = buffer.toString('base64');
          const pureBase64 = base64Image.replace(
            /^data:image\/\w+;base64,/,
            '',
          );

          const payload = {
            EmployeeId: employeeDetails.id,
            FaceImage: pureBase64,
            FaceEmbeding: embeddingBase64,
            FingerImage: null,
            FingerEmbeding: null,
            RetinaImage: null,
            RetinaEmbeding: null,
            VoiceRecord: null,
            VoiceRecordEmbeding: null,
            CreatedDate: new Date().toISOString(),
            ModifiedBy: employeeDetails.id,
            IsDelete: 0,
            CompanyId: employeeDetails.childCompanyId,
          };

          const response = await axios.post(
            `${BASE_URL}/EmployeeBiomatricRegister/SaveEmployeeImageStringFormat`,
            payload,
          );

          if (response.data?.isSuccess) {
            console.log('✅ Face registration successful');
            // Set all states together
            setRegisteredFace(base64Image);
            setCachedFaceImage(base64Image);
            setShowRegistration(false); // IMPORTANT: Hide registration after success
            Alert.alert(
              '✅ Success',
              'Face registered successfully! You can now check in.',
            );
          } else {
            Alert.alert(
              'Error',
              response.data?.message || 'Failed to save face',
            );
          }
        } catch (err) {
          console.error('Re-Register Error:', err);
          Alert.alert('Error', err.message);
        } finally {
          if (imageProcessingTimeoutRef.current) {
            clearTimeout(imageProcessingTimeoutRef.current);
          }
          setIsProcessing(false);
          setIsRegistering(false);
        }
      },
    );
  };

  // handle launch camera with timeout and error handling

  // const launchCamera = async callback => {
  //   try {
  //     const hasPermission = await requestCameraPermission();
  //     if (!hasPermission) {
  //       throw new Error('Camera permission denied');
  //     }

  //     // Clear any existing timeouts
  //     if (imageProcessingTimeoutRef.current) {
  //       clearTimeout(imageProcessingTimeoutRef.current);
  //       imageProcessingTimeoutRef.current = null;
  //     }

  //     return new Promise((resolve, reject) => {
  //       // Set timeout for camera operation
  //       const timeoutId = setTimeout(() => {
  //         reject(new Error('Camera operation timed out'));
  //       }, 30000);

  //       ImagePicker.launchCamera(
  //         {
  //           mediaType: 'photo',
  //           includeBase64: true,
  //           cameraType: 'front',
  //           maxWidth: 800,
  //           maxHeight: 800,
  //           quality: 0.8,
  //           saveToPhotos: false, // Important for production
  //         },
  //         response => {
  //           clearTimeout(timeoutId);

  //           try {
  //             if (response.didCancel) {
  //               reject(new Error('Camera cancelled by user'));
  //               return;
  //             }

  //             if (response.errorCode || response.errorMessage) {
  //               reject(new Error(response.errorMessage || 'Camera error'));
  //               return;
  //             }

  //             if (!response.assets?.[0]?.base64) {
  //               reject(new Error('No image captured'));
  //               return;
  //             }

  //             // Validate image size (prevent memory issues)
  //             const imageSize = response.assets[0].base64.length;
  //             if (imageSize > 5000000) {
  //               // 5MB limit
  //               reject(new Error('Image too large. Please try again.'));
  //               return;
  //             }

  //             const result = callback(response);
  //             resolve(result);
  //           } catch (error) {
  //             console.error('Camera callback error:', error);
  //             reject(error);
  //           }
  //         },
  //       );
  //     });
  //   } catch (error) {
  //     console.error('Camera launch error:', error);
  //     throw error;
  //   }
  // };


  const launchCamera = async callback => {
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
      const timeoutId = setTimeout(() => {
        reject(new Error('Camera operation timed out'));
      }, 25000);

      // Enhanced ImagePicker options for release build
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        cameraType: 'front',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        saveToPhotos: false,
         includeExtra: false,
         forceJpg: true,
          enableRotationFix: false,
        // Add these for better release build compatibility
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
        // Ensure proper EXIF handling
        includeExtra: true,
      };

      ImagePicker.launchCamera(options, response => {
        clearTimeout(timeoutId);

        try {
          if (response.didCancel) {
            reject(new Error('Camera cancelled by user'));
            return;
          }

          if (response.errorCode || response.errorMessage) {
            console.error('Camera error:', response.errorCode, response.errorMessage);
            reject(new Error(response.errorMessage || 'Camera error occurred'));
            return;
          }

          if (!response.assets?.[0]?.base64) {
            reject(new Error('No image captured or base64 missing'));
            return;
          }

          // Validate image size for release build
          const imageSize = response.assets[0].base64.length;
          if (imageSize > 5000000) { // 5MB limit
            reject(new Error('Image too large. Please try again.'));
            return;
          }

          // Additional validation for release builds
          if (response.assets[0].fileSize && response.assets[0].fileSize > 10 * 1024 * 1024) {
            reject(new Error('Image file size too large'));
            return;
          }

          const result = callback(response);
          resolve(result);
        } catch (error) {
          console.error('Camera callback error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Camera launch error:', error);
    throw error;
  }
};
  // Get formatted local date-time strings

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

  // Midnight background task for auto checkout

  const midnightBackgroundTask = async ({handleCheckOut}) => {
    console.log('🌙 Midnight service started...');

    while (BackgroundService.isRunning()) {
      try {
        const checkInData = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);

        if (checkInData) {
          const parsedData = JSON.parse(checkInData);
          const checkInDate = await AsyncStorage.getItem('CHECK_IN_DATE');
          const today = moment().format('YYYY-MM-DD');

          // Check if user is still checked in but date has changed (midnight passed)
          if (parsedData.checkedIn && checkInDate && checkInDate !== today) {
            console.log('⏳ MIDNIGHT PASSED →  CHECKOUT TRIGGERED');

            try {
              await handleCheckOut(true); // true = from background
            } catch (e) {
              console.log('Auto checkout failed:', e);
            }

            // Stop the background service after auto checkout
            await BackgroundService.stop();
            break;
          }
        }
      } catch (e) {
        console.log('Background loop error:', e);
      }

      await sleep(30 * 1000); // check every 30 seconds
    }
  };

  const startMidnightService = async () => {
    const options = {
      taskName: 'AutoCheckout',
      taskTitle: 'Shift Active',
      taskDesc: 'Monitoring midnight auto-checkout',
      taskIcon: {name: 'ic_launcher', type: 'mipmap'},
      color: '#007bff',
      parameters: {handleCheckOut},
    };

    try {
      // Stop existing service if running
      if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
        await sleep(1000);
      }

      await BackgroundService.start(midnightBackgroundTask, options);
      console.log('▶ Midnight service STARTED');
    } catch (e) {
      console.log('Error starting midnight service:', e);
    }
  };

  // Stop midnight background service
  const stopMidnightService = async () => {
    try {
      if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
        console.log('⏹ Midnight service STOPPED');
      }
    } catch (e) {
      console.log('Error stopping midnight service:', e);
    }
  };

  // On mount: check and restart midnight service if needed

  useEffect(() => {
    const checkAndRestartMidnightService = async () => {
      try {
        const checkInData = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);
        if (checkInData) {
          const parsedData = JSON.parse(checkInData);
          if (parsedData.checkedIn) {
            console.log('User is checked in, starting midnight service...');
            await startMidnightService();
          }
        }
      } catch (error) {
        console.error('Error checking midnight service:', error);
      }
    };

    checkAndRestartMidnightService();
  }, []);

  // Handle check-in process with Lottie animation
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
      // Step 1: Check location with Lottie animation
      setIsLocationProcessing(true);
      
      const locationPromise = checkLocation();
      const locationTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Location check timeout')), 20000),
      );

      const locationResult = await Promise.race([
        locationPromise,
        locationTimeout,
      ]);

      setIsLocationProcessing(false);

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
              onPress: () => reject(new Error('User cancelled verification')),
            },
            {
              text: 'Capture',
              onPress: async () => {
                try {
                  await launchCamera(async res => {
                    try {
                      const capturedImage = `data:image/jpeg;base64,${res.assets[0].base64}`;
                      setCapturedFace(capturedImage);

                      // Match faces with timeout
                      const matchPromise = matchFaces(
                        registeredFace,
                        capturedImage,
                      );
                      const matchTimeout = new Promise((_, reject) =>
                        setTimeout(
                          () => reject(new Error('Face matching timeout')),
                          20000,
                        ),
                      );

                      const result = await Promise.race([
                        matchPromise,
                        matchTimeout,
                      ]);

                      if (!result?.isMatch) {
                        throw new Error('Face verification failed');
                      }

                      resolve({capturedImage, matchResult: result});
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
      const {logDate, logTime, logDateTime} = getFormattedLocalDateTime();

      const attendancePayload = {
        EmployeeId: String(employeeDetails?.id || '9'),
        EmployeeCode: String(employeeDetails?.id || '9'),
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
        setTimeout(() => reject(new Error('Attendance save timeout')), 15000),
      );

      const attendanceResponse = await Promise.race([
        attendancePromise,
        attendanceTimeout,
      ]);

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
        startBackgroundService(),
        startMidnightService(), // Add midnight service
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
        errorMessage =
          'Request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('cancelled')) {
        errorMessage = 'Check-in was cancelled.';
      } else if (error.message?.includes('verification failed')) {
        errorMessage = 'Face verification failed. Please try again.';
      }

      Alert.alert('❌ Check-In Failed', errorMessage);
    } finally {
      setIsLoading(false);
      setIsLocationProcessing(false);
    }
  };

  const handleCheckOut = async (fromBackground = false) => {
    try {
      console.log(
        '▶ Checkout Triggered:',
        fromBackground ? '(AUTO)' : '(MANUAL)',
      );

      const {logDate, logTime, logDateTime} = getFormattedLocalDateTime();
      const employeeId = String(employeeDetails?.id);
      const current = moment();

      // ----------------------------------------------------
      // 1️⃣ SIMPLE OT CALCULATION (Only for manual checkout)
      // ----------------------------------------------------
      if (!fromBackground) {
        let minOtMinutes = 30;

        // Load OT policy
        try {
          const policyRes = await axiosInstance.get(
            `${BASE_URL}/OtPolicyMaster/GetAllOtPolicy/${user?.childCompanyId}`,
          );

          const otPolicy = policyRes.data?.find(
            p => p.policyCategory === 'MinOverTime',
          );

          if (otPolicy) minOtMinutes = Number(otPolicy.value) || 30;
        } catch (e) {
          console.log('⚠ OT policy failed → using default 30 min');
        }

        // Parse shift end time
        let shiftEndTime = null;

        if (shiftHours && shiftHours.includes(' - ')) {
          const endStr = shiftHours.split(' - ')[1];
          shiftEndTime = moment(endStr, 'HH:mm');
        }

        if (shiftEndTime) {
          // Early logout → allow
          if (current.isBefore(shiftEndTime)) {
            console.log('Early Logout → Allowed');
          }
          // Exact time → allow
          else if (current.isSame(shiftEndTime, 'minute')) {
            console.log('Exact shift end → Allowed');
          }
          // After shift → OT calculation
          else {
            const diffMinutes = current.diff(shiftEndTime, 'minutes');

            if (diffMinutes < minOtMinutes) {
              return Alert.alert(
                'Minimum OT Required',
                `Required: ${minOtMinutes} min\nCompleted: ${diffMinutes} min`,
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Checkout Anyway',
                    onPress: () => handleCheckOut(true), // bypass OT for second call
                  },
                ],
              );
            }
          }
        }
      }

      // ----------------------------------------------------
      // 2️⃣ SHOW CHECKOUT CONFIRMATION (Before API call)
      // ----------------------------------------------------
      const confirmMessage = fromBackground
        ? `Are you sure you want to check out?`
        : `Checkout Successful`
       

      const confirmTitle = fromBackground
        ? 'Checkout'
        : 'Are you sure you want to check out?';

      return new Promise(resolve => {
        Alert.alert(confirmTitle, confirmMessage, [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('Checkout cancelled by user');
              resolve(false);
            },
          },
          {
            text: 'Checkout',
            style: fromBackground ? 'destructive' : 'default',
            onPress: async () => {
              try {
                // ----------------------------------------------------
                // 3️⃣ PERFORM ACTUAL CHECKOUT API CALL
                // ----------------------------------------------------
                const attendancePayload = {
                  EmployeeId: String(employeeDetails?.id || '9'),
                  EmployeeCode: String(employeeDetails?.id || '9'),
                  LogDateTime: logDateTime,
                  LogDate: logDate,
                  LogTime: logTime,
                  Direction: 'In',
                  DeviceName: 'Bhubneswar',
                  SerialNo: '1',
                  VerificationCode: '1',
                };

                const response = await Promise.race([
                  axiosInstance.post(
                    `${BASE_URL}/BiomatricAttendance/SaveAttenance`,
                    attendancePayload,
                  ),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 15000),
                  ),
                ]);

                if (!response.data?.isSuccess) {
                  throw new Error(response.data?.message || 'API Failed');
                }

                // ----------------------------------------------------
                // 4️⃣ RESET STATES AFTER SUCCESSFUL API CALL
                // ----------------------------------------------------
                await Promise.all([
                  saveCheckInState(false),
                  stopBackgroundService(),
                  stopMidnightService(),
                  AsyncStorage.multiRemove([
                    BG_LAST_ELAPSED_KEY,
                    CAPTURED_FACE_STORAGE_KEY,
                    'CHECK_IN_DATE',
                  ]),
                ]);

                setCheckedIn(false);
                setCheckInTime(null);
                setProgressPercentage(0);
                setMissedPercentage(0);
                setElapsedTime('00:00:00');
                setCapturedFace(null);
                setAutoCheckoutEnabled(false);

                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }

                // ----------------------------------------------------
                // 5️⃣ SHOW SUCCESS ALERT AFTER CHECKOUT
                // ----------------------------------------------------
                const successTitle = fromBackground
                  ? '✔  Checkout Successful'
                  : '✔ Checkout Successful';
                const successMessage = `Logout: ${logDate} ${logTime}`;

                Alert.alert(successTitle, successMessage);

                resolve(true);
              } catch (err) {
                console.log('Checkout Error:', err);
                Alert.alert('Error', 'Checkout failed. Please try again.');
                resolve(false);
              }
            },
          },
        ]);
      });
    } catch (err) {
      console.log('Checkout Error:', err);
      if (!fromBackground) {
        Alert.alert('Error', 'Checkout failed. Please try again.');
      }
      return false;
    } finally {
      if (!fromBackground) setIsLoading(false);
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

  // preprocessImage function

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

  // getEmbedding function. ///===e=e===========================

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

  // Replace matchFaces function:================================

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
      const [emb1, emb2] = await Promise.race([
        embeddingPromise,
        timeoutPromise,
      ]);

      if (!emb1 || !emb2) {
        throw new Error('Failed to generate face embeddings');
      }

      // Calculate similarity synchronously (no await needed)
      const similarity = cosineSimilarity(emb1, emb2);
      const distance = euclideanDistance(emb1, emb2);

      const isMatch =
        similarity >= COSINE_THRESHOLD && distance <= EUCLIDEAN_THRESHOLD;

      let confidence = 'LOW';
      if (similarity >= 0.75 && distance <= 0.6) confidence = 'HIGH';
      else if (similarity >= 0.7 && distance <= 0.7) confidence = 'MEDIUM';

      const result = {isMatch, similarity, distance, confidence};
      setMatchResult(result);

      return result;
    } catch (error) {
      console.error('Matching error:', error);
      throw error; // Re-throw to be handled by caller
    } finally {
      setIsProcessing(false);
    }
  };

  // Request camera permission ==============
  // const requestCameraPermission = async () => {
  //   try {
  //     if (Platform.OS === 'android') {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //         {
  //           title: 'Camera Permission',
  //           message: 'App needs access to your camera',
  //           buttonNeutral: 'Ask Me Later',
  //           buttonNegative: 'Cancel',
  //           buttonPositive: 'OK',
  //         },
  //       );
  //       return granted === PermissionsAndroid.RESULTS.GRANTED;
  //     } else {
  //       return true;
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //     return false;
  //   }
  // };

  const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      // Request multiple camera permissions for release build compatibility
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];
      
      // For Android 13+, request media permissions
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      } else {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
      
      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      // Check if camera permission is granted
      const cameraGranted = results[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
      
      if (!cameraGranted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to use face verification.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Linking.canOpenURL('package:com.cloudtree.hrms')) {
                  Linking.openURL('package:com.cloudtree.hrms');
                }
              }
            }
          ]
        );
        return false;
      }
      
      return cameraGranted;
    } else {
      // iOS camera permission
      const permission = await check(PERMISSIONS.IOS.CAMERA);
      if (permission === RESULTS.GRANTED) {
        return true;
      }
      
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

  // Request location permission ==============

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

  // Get current position with fallback options ==============

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

  // Check.   safeParseFloat ==============

  const safeParseFloat = (val, fallback = NaN) => {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  };

  // Check location against geofences ==============

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

  // Fetch employees on leave ==============

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

  // Fetch leave balance data ==============

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

        console.log(response.data, 'shift data response');

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
            // Parse shift times correctly for today's date
            const parseShiftTime = timeStr => {
              if (!timeStr) return null;

              // If it's already a full datetime, use it directly
              if (timeStr.includes('T') || timeStr.includes(' ')) {
                return new Date(timeStr);
              }

              // If it's just time (HH:mm:ss), combine with today's date
              const today = new Date();
              const timeParts = timeStr.split(':');
              if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0], 10);
                const minutes = parseInt(timeParts[1], 10);
                const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

                return new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  hours,
                  minutes,
                  seconds,
                );
              }

              return null;
            };

            const shiftStart = parseShiftTime(todayShift.shiftStartTime);
            const shiftEnd = parseShiftTime(todayShift.shiftEndTime);

            // Debug logging
            console.log('Shift Details:', {
              shiftStart: shiftStart?.toLocaleString(),
              shiftEnd: shiftEnd?.toLocaleString(),
              rawShiftStart: todayShift.shiftStartTime,
              rawShiftEnd: todayShift.shiftEndTime,
            });

            // Validate shift times
            if (
              shiftStart &&
              shiftEnd &&
              !isNaN(shiftStart.getTime()) &&
              !isNaN(shiftEnd.getTime())
            ) {
              // Calculate total shift duration in seconds
              let calculatedTotalShiftSeconds = Math.max(
                0,
                (shiftEnd - shiftStart) / 1000,
              );

              // Handle overnight shifts (if end time is before start time, add 24 hours)
              if (shiftEnd <= shiftStart) {
                const nextDayEnd = new Date(shiftEnd);
                nextDayEnd.setDate(nextDayEnd.getDate() + 1);
                calculatedTotalShiftSeconds = Math.max(
                  0,
                  (nextDayEnd - shiftStart) / 1000,
                );
              }

              // Update the state with the calculated shift duration
              setTotalShiftSeconds(calculatedTotalShiftSeconds);
              setTotalShiftHours(
                Math.round(calculatedTotalShiftSeconds / 3600),
              );

              console.log('Calculated shift duration:', {
                calculatedTotalShiftSeconds,
                hours: (calculatedTotalShiftSeconds / 3600).toFixed(2),
              });

              // Calculate missed time ONLY if user is checked in
              if (checkedIn && checkInTime && calculatedTotalShiftSeconds > 0) {
                const actualCheckIn = new Date(checkInTime);

                console.log('Time Comparison:', {
                  shiftStartTime: shiftStart.toLocaleString(),
                  actualCheckInTime: actualCheckIn.toLocaleString(),
                  checkInTime: checkInTime,
                });

                // Calculate missed time only if check-in was after shift start
                const missedSeconds = Math.max(
                  0,
                  (actualCheckIn - shiftStart) / 1000,
                );
                const missedPercent = Math.min(
                  100,
                  (missedSeconds / calculatedTotalShiftSeconds) * 100,
                );

                console.log('Missed Time Calculations:', {
                  totalShiftSeconds: calculatedTotalShiftSeconds,
                  missedSeconds,
                  missedPercent: missedPercent.toFixed(2) + '%',
                  missedTime: formatHoursMinutes(missedSeconds),
                });

                setMissedPercentage(missedPercent);
              } else if (!checkedIn) {
                // If not checked in, reset missed percentage
                setMissedPercentage(0);
              }

              // Format times for display in 24-hour format
              const formatTime24Hour = dateTime => {
                try {
                  if (!dateTime || isNaN(dateTime.getTime()))
                    return 'Invalid time';
                  return dateTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false, // Changed to 24-hour format
                  });
                } catch (err) {
                  console.error('Time format error:', err);
                  return 'Invalid time';
                }
              };

              const startTime = formatTime24Hour(shiftStart);
              const endTime = formatTime24Hour(shiftEnd);

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
                startShiftProgress(elapsedSeconds, shiftStart.getTime());
              }
            } else {
              console.error('Invalid shift times:', {
                start: todayShift.shiftStartTime,
                end: todayShift.shiftEndTime,
              });
              setShiftHours('Invalid shift times');
            }
          } else {
            console.log('No shift found for today:', todayDateStr);
            setShiftHours('No shift assigned for today');
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
          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <View style={styles.headerIconContainer}>
                <ClockIcon />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.progressTitle}>Today's Progress</Text>
                <Text style={styles.progressSubtitle}>
                  Track your daily performance
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}

          <View style={styles.progressBarContainer}>
            {/* Progress Bar Header with Percentage */}
            <View style={styles.progressBarHeader}>
              <Text style={styles.progressBarTitle}>Daily Progress</Text>
            </View>

            {/* Enhanced Progress Bar */}
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBg}>
                {/* Missed time portion with gradient */}
                <LinearGradient
                  colors={['#FCA5A5', '#EF4444']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[
                    styles.missedTimeFill,
                    {
                      width: `${missedPercentage}%`,
                    },
                  ]}
                />
                {/* Active work time portion */}
                <LinearGradient
                  colors={['#60A5FA', '#3B82F6', '#2563EB']}
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
                {/* Progress indicator dot */}
                <View
                  style={[
                    styles.progressIndicator,
                    {
                      left: `${Math.min(
                        progressPercentage + missedPercentage,
                        95,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Progress Stats */}
            <View style={styles.progressStatsContainer}>
              <View style={styles.progressStatItem}>
                <View style={styles.statIndicatorRow}>
                  <View
                    style={[styles.statDot, {backgroundColor: '#EF4444'}]}
                  />
                  <Text style={styles.statLabel}>Missed</Text>
                </View>
                <Text style={styles.missedTimeText}>
                  {formatHoursMinutes(
                    Math.floor((missedPercentage / 100) * totalShiftSeconds),
                  )}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.progressStatItem}>
                <View style={styles.statIndicatorRow}>
                  <View
                    style={[styles.statDot, {backgroundColor: '#3B82F6'}]}
                  />
                  <Text style={styles.statLabel}>Worked</Text>
                </View>
                <Text style={styles.workedTimeText}>
                  {formatHoursMinutes(
                    Math.floor((progressPercentage / 100) * totalShiftSeconds),
                  )}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.progressStatItem}>
                <View style={styles.statIndicatorRow}>
                  <View
                    style={[styles.statDot, {backgroundColor: '#E5E7EB'}]}
                  />
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
                <Text style={styles.remainingTimeText}>
                  {formatHoursMinutes(
                    Math.floor(
                      ((100 - progressPercentage - missedPercentage) / 100) *
                        totalShiftSeconds,
                    ),
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Details */}
          <View style={styles.progressDetailsContainer}>
            <View style={styles.progressDetailCard}>
              <View style={styles.detailContent}>
                <Text style={styles.progressDetailLabel}>Working Time</Text>
                <View style={styles.timeDisplayRow}>
                  {elapsedTime.split(':').map((time, index) => (
                    <View key={index} style={styles.timeSegment}>
                      <Text style={styles.timeValue}>{time}</Text>
                      <Text style={styles.timeUnit}>
                        {index === 0 ? 'HRS' : index === 1 ? 'MIN' : 'SEC'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.progressDetailCard}>
              <View style={styles.detailContent}>
                <Text style={styles.shiftDetailsLebal}>Shift Hours</Text>
                <Text style={styles.shiftDetailValue}>
                  {shiftHours || 'No shift assigned'}
                </Text>
              </View>
            </View>
          </View>

          {/* Shift Name */}
          <View style={styles.shiftInfoCard}>
            <LinearGradient
              colors={['#EFF6FF', '#DBEAFE']}
              style={styles.shiftInfoGradient}>
              <View style={styles.shiftInfoHeader}>
                <View style={styles.shiftIconContainer}>
                  <Text style={styles.shiftIcon}>🏢</Text>
                </View>
                <View style={styles.shiftTextContainer}>
                  <Text style={styles.shiftLabel}>Current Shift</Text>
                  <Text style={styles.shiftValue}>
                    {shiftName || 'Not Assigned'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Check In/Out Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.modernActionButton,
                !checkedIn
                  ? styles.checkInButtonActive
                  : styles.actionButtonDisabled,
              ]}
              onPress={handleCheckIn}
              disabled={checkedIn || isLoading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={
                  !checkedIn
                    ? ['#10B981', '#059669', '#047857']
                    : ['#F3F4F6', '#E5E7EB']
                }
                style={styles.actionButtonGradient}>
                <View style={styles.buttonContent}>
                  {isLoading && !checkedIn ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      {/* <View style={styles.buttonIconContainer}>
                      <Text style={styles.actionButtonIcon}>📥</Text>
                    </View> */}
                      <View style={styles.buttonTextContainer}>
                        <Text
                          style={[
                            styles.actionButtonText,
                            !checkedIn
                              ? styles.activeButtonText
                              : styles.disabledButtonText,
                          ]}>
                          Check In
                        </Text>
                        <Text
                          style={[
                            styles.actionButtonSubtext,
                            !checkedIn
                              ? styles.activeButtonSubtext
                              : styles.disabledButtonSubtext,
                          ]}>
                          Start your shift
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modernActionButton,
                checkedIn
                  ? styles.checkOutButtonActive
                  : styles.actionButtonDisabled,
              ]}
              onPress={handleCheckOut}
              disabled={!checkedIn || isLoading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={
                  checkedIn
                    ? ['#EF4444', '#DC2626', '#B91C1C']
                    : ['#F3F4F6', '#E5E7EB']
                }
                style={styles.actionButtonGradient}>
                <View style={styles.buttonContent}>
                  {isLoading && checkedIn ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <View style={styles.buttonTextContainer}>
                        <Text
                          style={[
                            styles.actionButtonText,
                            checkedIn
                              ? styles.activeButtonText
                              : styles.disabledButtonText,
                          ]}>
                          Check Out
                        </Text>
                        <Text
                          style={[
                            styles.actionButtonSubtext,
                            checkedIn
                              ? styles.activeButtonSubtext
                              : styles.disabledButtonSubtext,
                          ]}>
                          End your shift
                        </Text>
                      </View>
                    </>
                  )}
                </View>
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
        </View>
        <LeaveStatus leaveData={leaveData} />

        <OnLeaveUsers leaveUsers={leaveUsers} />
      </>
    );
  };

  // Render location processing modal
  const renderLocationModal = () => (
    <Modal
      visible={isLocationProcessing}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <View style={styles.locationModalOverlay}>
        <View style={styles.locationModalContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.locationModalContent}>
            
            {/* Lottie Animation */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../lotti/Location Pin.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
                speed={0.8}
              />
            </View>

            {/* Processing Text */}
            <View style={styles.locationProcessingTextContainer}>
              <Text style={styles.locationProcessingTitle}>
                Getting Your Location
              </Text>
              <Text style={styles.locationProcessingDescription}>
                Please wait while we verify your location for check-in
              </Text>
            </View>

            {/* Cancel Button */}
            {/* <TouchableOpacity
              style={styles.locationCancelButton}
              onPress={() => {
                setIsLocationProcessing(false);
                setIsLoading(false);
              }}>
              <Text style={styles.locationCancelButtonText}>Cancel</Text>
            </TouchableOpacity> */}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  // Main render function
  return (
    <AppSafeArea>
      {/* <StatusBar barStyle="light-content" backgroundColor="#1E40AF" /> */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        {/* <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.header}> */}
         <View style={styles.header}> 
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
            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusDot,
                  checkedIn ? styles.statusActive : styles.statusInactive,
                ]}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>
                  {checkedIn ? 'Checked In' : 'Not Checked In'}
                </Text>
                {checkedIn && checkInTime && (
                  <Text style={styles.statusTime}>
                    {formatLoginTime(checkInTime)}
                  </Text>
                )}
              </View>
            </View>
          </View>

           </View>
        {/* </LinearGradient> */}

        {/* Main Content */}
        <View style={styles.content}>{renderContent()}</View>
      </ScrollView>
      
      {/* Location Processing Modal */}
      {renderLocationModal()}
    </AppSafeArea>
  );
};

export default HomeScreen;