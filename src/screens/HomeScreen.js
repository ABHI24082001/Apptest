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

  const backgroundTask = async taskData => {
    const delay = taskData?.delay ?? 1000;
    try {
      while (BackgroundService.isRunning()) {
        try {
          const raw = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);
          let checkInTime = null;
          if (raw) {
            const parsed = JSON.parse(raw);
            checkInTime = parsed?.checkInTime || null;
          }

          if (!checkInTime) {
            await AsyncStorage.setItem(
              BG_LAST_ELAPSED_KEY,
              JSON.stringify({
                elapsedSeconds: 0,
                progressPercentage: 0,
                timestamp: Date.now(),
              }),
            );
          } else {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - checkInTime) / 1000);
            // Use dynamic totalShiftSeconds instead of hardcoded 28800
            const clamped = Math.min(
              totalShiftSeconds,
              Math.max(0, elapsedSeconds),
            );
            const progressPercentage = Math.floor(
              (clamped / totalShiftSeconds) * 100,
            );

            await AsyncStorage.setItem(
              BG_LAST_ELAPSED_KEY,
              JSON.stringify({
                elapsedSeconds: clamped,
                progressPercentage,
                timestamp: now,
              }),
            );

            await BackgroundService.updateNotification({
              taskDesc: `${new Date(clamped * 1000)
                .toISOString()
                .substr(11, 8)} — ${progressPercentage}%`,
            });
          }
        } catch (innerErr) {
          console.error('[BackgroundTask] tick error', innerErr);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (err) {
      console.error('[BackgroundTask] error', err);
    }
  };

  const startBackgroundService = async () => {
    try {
      if (await BackgroundService.isRunning()) return;
      await BackgroundService.start(backgroundTask, bgOptions);
    } catch (e) {
      console.error('[BGHelper] failed to start', e);
    }
  };

  const stopBackgroundService = async () => {
    try {
      if (await BackgroundService.isRunning()) {
        await BackgroundService.stop();
        await AsyncStorage.removeItem(BG_LAST_ELAPSED_KEY);
      }
    } catch (e) {
      console.error('[BGHelper] failed to stop', e);
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
    // Use dynamic totalShiftSeconds instead of hardcoded 28800
    let elapsedSeconds = startSeconds;
    let missedSeconds = 0;
    let missedPercent = 0;

    // If shift start and check-in available, calculate missed time
    if (shiftStartTime && checkInTime) {
      const shiftStart = new Date(shiftStartTime);
      const actualCheckIn = new Date(checkInTime);

      missedSeconds = Math.max(0, (actualCheckIn - shiftStart) / 1000);
      missedPercent = Math.min(100, (missedSeconds / totalShiftSeconds) * 100);

      console.log('🕒 Missed Time:', {
        shiftStart: shiftStart.toLocaleString(),
        checkIn: actualCheckIn.toLocaleString(),
        missedSeconds,
        missedPercent: missedPercent.toFixed(2) + '%',
        totalShiftSeconds, // Log the current totalShiftSeconds value
      });

      // Show red portion in UI
      setMissedPercentage(missedPercent);
    }

    // 🧭 Clear any existing interval
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // ⏱️ Helper to compute visible (blue) progress
    const computeProgress = elapsedSec => {
      // Effective working duration = total shift - missed time
      const effectiveDuration = totalShiftSeconds - missedSeconds;
      if (effectiveDuration <= 0) return 0;

      // Blue progress (excluding missed part)
      const workProgress =
        (elapsedSec / effectiveDuration) * (100 - missedPercent);

      // Clamp between 0 and (100 - missed%)
      return Math.min(100 - missedPercent, Math.max(0, workProgress));
    };

    // ⏳ Set initial state
    setElapsedTime(formatTime(elapsedSeconds));
    setProgressPercentage(computeProgress(elapsedSeconds));

    // If already full
    if (elapsedSeconds >= totalShiftSeconds) {
      setElapsedTime(formatTime(totalShiftSeconds));
      setProgressPercentage(100);
      return;
    }

    // ▶️ Start interval
    progressIntervalRef.current = setInterval(() => {
      elapsedSeconds++;

      if (elapsedSeconds >= totalShiftSeconds) {
        clearInterval(progressIntervalRef.current);
        setElapsedTime(formatTime(totalShiftSeconds));
        setProgressPercentage(100);
        return;
      }

      setElapsedTime(formatTime(elapsedSeconds));
      setProgressPercentage(computeProgress(elapsedSeconds));
    }, 1000);
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadCheckInState();
      try {
        const checkInData = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);
        if (checkInData) {
          const parsedData = JSON.parse(checkInData);
          if (parsedData.checkedIn && parsedData.checkInTime) {
            await startBackgroundService();
          }
        }
      } catch (e) {
        console.error('Failed to check background service status:', e);
      }
    };

    initializeApp();

    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (imageProcessingTimeoutRef.current)
        clearTimeout(imageProcessingTimeoutRef.current);
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


          console.log()

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
  // debugger;
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
      const locationResult = await checkLocation();
      if (!locationResult.inside) {
        const nearest = locationResult.nearestFence
          ? `${locationResult.nearestFence.geoLocationName} (${Math.round(
              locationResult.nearestFence.distance,
            )}m away)`
          : 'Unknown area';
        Alert.alert(
          '❌ Location Check Failed',
          `You are not within the required area.\nNearest: ${nearest}`,
        );
        return;
      }

      Alert.alert(
        'Face Verification',
        'Please capture your face for verification',
        [
          {text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false)},
          {
            text: 'Capture',
            onPress: () => {
              launchCamera(async res => {
                try {
                  if (!res.assets?.[0]?.base64) {
                    Alert.alert('No Image Captured', 'Please try again.');
                    return;
                  }

                  const capturedImage = `data:image/jpeg;base64,${res.assets[0].base64}`;
                  setCapturedFace(capturedImage);

                  const result = await matchFaces(
                    registeredFace,
                    capturedImage,
                  );
                  if (!result?.isMatch) {
                    Alert.alert(
                      '❌ Verification Failed',
                      'Face does not match. Please try again.',
                    );
                    return;
                  }

                  const now = new Date();
                  const logDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
                  const logTime = now.toTimeString().split(' ')[0]; // HH:mm:ss

                  // ✅ Build payload
                  const attendancePayload = {
                    EmployeeCode: employeeDetails?.companyUserId || '29',
                    LogDateTime: now.toISOString(), // ✅ full timestamp
                    LogDate: logDate, // ✅ only date
                    LogTime: logTime, // ✅ matches LogDateTime
                    Direction: 'in', // must be lowercase
                    DeviceName: 'Bhubneswar',
                    SerialNo: '1',
                    VerificationCode: '1',
                  };

                  console.log('📤 Posting attendance:', attendancePayload);

                  // ✅ Send to API
                  const attendanceResponse = await axiosInstance.post(
                    `${BASE_URL}/BiomatricAttendance/SaveAttenance`,
                    attendancePayload,
                  );

                  if (!attendanceResponse.data?.isSuccess) {
                    throw new Error(
                      attendanceResponse.data?.message ||
                        'Failed to save attendance',
                    );
                  }

                  // ✅ If success
                  setCheckedIn(true);
                  const checkInMs = new Date().getTime();
                  setCheckInTime(checkInMs);
                  await saveCheckInState(true, checkInMs, capturedImage);
                  await startBackgroundService();

                  const formattedLogin = `${logDate} ${logTime}`;


                  Alert.alert(
                    '✅ Check-In Successful',
                    `Login: ${formattedLogin}\nWelcome! Your shift has started.`,
                  );
                  startShiftProgress(0);
                } catch (error) {
                  console.error('Attendance API Error:', error);
                  Alert.alert(
                    '❌ Check-In Failed',
                    'Failed to record attendance. Please try again.',
                  );
                } finally {
                  setIsLoading(false);
                }
              });
            },
          },
        ],
      );
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Something went wrong during check-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const logDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const logTime = now.toTimeString().split(' ')[0]; // HH:mm:ss

      const attendancePayload = {
        EmployeeCode: employeeDetails?.companyUserId || '29', // ✅ string
        LogDateTime: now.toISOString(), // ✅ full timestamp
        LogDate: logDate, // ✅ only date
        LogTime: logTime, // ✅ matches LogDateTime
        Direction: 'in', // ✅ correct for checkout
        DeviceName: 'Bhubneswar',
        SerialNo: '1',
        VerificationCode: '1',
      };

      console.log('Posting check-out attendance:', attendancePayload);

      const attendanceResponse = await axiosInstance.post(
        `${BASE_URL}/BiomatricAttendance/SaveAttenance`,
        attendancePayload,
      );

      if (!attendanceResponse.data?.isSuccess) {
        throw new Error(
          attendanceResponse.data?.message || 'Failed to save attendance',
        );
      }

      // ✅ If successful, reset check-in state
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
        'Your shift has ended. Have a great day!',
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

  // Keep all your existing helper functions (normalize, preprocessImage, getEmbedding, matchFaces, etc.)
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

  const matchFaces = async (face1, face2) => {
    if (!session) {
      Alert.alert('Error', 'Model not loaded yet');
      return null;
    }
    if (!face1 || !face2) {
      Alert.alert('Error', 'Both images are required for matching');
      return null;
    }

    setIsProcessing(true);
    setMatchResult(null);

    try {
      const [emb1, emb2] = await Promise.all([
        getEmbedding(face1),
        getEmbedding(face2),
      ]);

      if (!emb1 || !emb2) {
        Alert.alert('Error', 'Failed to generate face embeddings');
        return null;
      }

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
      Alert.alert('Error', 'Face matching failed');
      return null;
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

  const launchCamera = async callback => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
        cameraType: 'front',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
      },
      callback,
    );
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


