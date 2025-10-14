import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import {Card, Button} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import {Buffer} from 'buffer';
import jpeg from 'jpeg-js';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import axios from 'axios';
import AppSafeArea from '../component/AppSafeArea';
import LeaveStatus from '../component/LeaveStatus';
import * as geolib from 'geolib';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import {useAuth} from '../constants/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import OnLeaveUsers from '../component/OnLeaveUsers';
import BASE_URL from '../constants/apiConfig';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundService from 'react-native-background-actions';

// 🔹 Config
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
  const [shiftHours, setShiftHours] = useState('09:00 - 17:00');
  const [shiftCompleted, setShiftCompleted] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [session, setSession] = useState(null);
  const [registeredFace, setRegisteredFace] = useState(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [leaveUsers, setLeaveUsers] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFaceLoading, setIsFaceLoading] = useState(false);
  const [cachedFaceImage, setCachedFaceImage] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const employeeDetails = useFetchEmployeeDetails();
  const progressIntervalRef = useRef(null);
  const imageProcessingTimeoutRef = useRef(null);
  const appStateSubscriptionRef = useRef(null);
  const {user} = useAuth();

  // background task runs in a separate JS context managed by the package
  const bgOptions = {
    taskName: 'Shift Progress',
    taskTitle: 'Shift in progress',
    taskDesc: 'Working...',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    // color etc.
    color: '#43e97b',
    parameters: {
      delay: 1000, // 1 second tick
    },
  };

  // backgroundTask: reads checkInTime from AsyncStorage and updates elapsed & notification.
  // NOTE: Do NOT touch UI here. Only AsyncStorage, logs, and updateNotification are allowed.
  const backgroundTask = async taskData => {
    const delay = taskData?.delay ?? 1000;
    console.log('[BackgroundTask] started with delay', delay);

    try {
      while (BackgroundService.isRunning()) {
        try {
          // Load stored check-in info
          const raw = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);
          let checkInTime = null;
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              checkInTime = parsed?.checkInTime || null;
            } catch (e) {
              console.warn('[BackgroundTask] parse error', e);
            }
          }

          if (!checkInTime) {
            // Nothing to track; write zero and wait
            await AsyncStorage.setItem(
              BG_LAST_ELAPSED_KEY,
              JSON.stringify({
                elapsedSeconds: 0,
                progressPercentage: 0,
                timestamp: Date.now(),
              }),
            );
            console.log('[BackgroundTask] no checkInTime found, sleeping...');
          } else {
            // compute elapsed seconds based on checkInTime
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - checkInTime) / 1000);

            // total shift seconds (demo uses 60), adapt to your real shift length
            const totalSeconds = 60; // <-- adjust to actual shift duration (e.g., 8*3600)
            const clamped = Math.min(totalSeconds, Math.max(0, elapsedSeconds));
            const progressPercentage = Math.floor(
              (clamped / totalSeconds) * 100,
            );

            // persist last elapsed so the UI can read it when app foregrounds
            await AsyncStorage.setItem(
              BG_LAST_ELAPSED_KEY,
              JSON.stringify({
                elapsedSeconds: clamped,
                progressPercentage,
                timestamp: now,
              }),
            );

            // update notification (Android) so user sees progress in notification bar
            try {
              await BackgroundService.updateNotification({
                taskDesc: `Elapsed: ${new Date(clamped * 1000)
                  .toISOString()
                  .substr(11, 8)} — ${progressPercentage}%`,
              });
            } catch (e) {
              // updateNotification can throw on iOS (ignored) — log
              console.warn('[BackgroundTask] updateNotification failed', e);
            }

            console.log(
              `[BackgroundTask] tick elapsed=${clamped}s progress=${progressPercentage}%`,
            );
          }
        } catch (innerErr) {
          console.error('[BackgroundTask] tick error', innerErr);
        }

        // wait delay
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (err) {
      console.error('[BackgroundTask] outer error', err);
    }

    console.log('[BackgroundTask] stopped');
  };

  // call to start background service
  const startBackgroundService = async () => {
    try {
      if (await BackgroundService.isRunning()) {
        console.log('[BGHelper] service already running');
        return;
      }
      await BackgroundService.start(backgroundTask, bgOptions);
      console.log('[BGHelper] service started');
    } catch (e) {
      console.error('[BGHelper] failed to start', e);
    }
  };

  // call to stop background service
  const stopBackgroundService = async () => {
    try {
      if (await BackgroundService.isRunning()) {
        await BackgroundService.stop();
        console.log('[BGHelper] service stopped');
        // optionally clear stored last elapsed
        await AsyncStorage.removeItem(BG_LAST_ELAPSED_KEY);
      } else {
        console.log('[BGHelper] service not running');
      }
    } catch (e) {
      console.error('[BGHelper] failed to stop', e);
    }
  };

  // Format elapsed time
  const formatTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  // debugger

  // Save check-in state and captured face to AsyncStorage
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

      // Save captured face separately
      if (faceData) {
        await AsyncStorage.setItem(CAPTURED_FACE_STORAGE_KEY, faceData);
      } else if (!isCheckedIn) {
        // Clear captured face on check-out
        await AsyncStorage.removeItem(CAPTURED_FACE_STORAGE_KEY);
      }

      console.log('✅ Saved check-in state:', data);
    } catch (error) {
      console.error('❌ Error saving check-in state:', error);
    }
  };

  // Load check-in state and captured face from AsyncStorage
  const loadCheckInState = async () => {
    try {
      const [checkInData, faceData] = await Promise.all([
        AsyncStorage.getItem(CHECK_IN_STORAGE_KEY),
        AsyncStorage.getItem(CAPTURED_FACE_STORAGE_KEY),
      ]);

      // Load captured face if available
      if (faceData) {
        setCapturedFace(faceData);
      }

      if (checkInData) {
        const parsedData = JSON.parse(checkInData);
        console.log('✅ Loaded check-in state:', parsedData);

        if (parsedData.checkedIn && parsedData.checkInTime) {
          setCheckedIn(true);
          setCheckInTime(parsedData.checkInTime);
          // Calculate elapsed time and start progress
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor(
            (now - parsedData.checkInTime) / 1000,
          );
          setElapsedTime(formatTime(elapsedSeconds));

          // Resume the progress tracking
          startShiftProgress(elapsedSeconds);
        }
      }
    } catch (error) {
      console.error('❌ Error loading check-in state:', error);
    }
  };

  const startShiftProgress = (startSeconds = 0) => {
    const totalSeconds = 60; // demo: 1 minute
    let elapsedSeconds = startSeconds;

    // Clear any existing interval
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // Set initial values based on elapsed time
    setElapsedTime(formatTime(elapsedSeconds));
    setProgressPercentage(
      Math.min(100, Math.floor((elapsedSeconds / totalSeconds) * 100)),
    );

    // Already completed?
    if (elapsedSeconds >= totalSeconds) {
      setElapsedTime(formatTime(totalSeconds));
      setProgressPercentage(100);
      setShiftCompleted(true);
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      elapsedSeconds++;
      if (elapsedSeconds >= totalSeconds) {
        setElapsedTime(formatTime(totalSeconds));
        setProgressPercentage(100);
        setShiftCompleted(true);
        clearInterval(progressIntervalRef.current);
        return;
      }
      setElapsedTime(formatTime(elapsedSeconds));
      setProgressPercentage(Math.floor((elapsedSeconds / totalSeconds) * 100));

      // Update last update time to sync when app comes back from background
      setLastUpdateTime(Date.now());
    }, 1000);
  };

  // Handle app state changes to keep shift progress accurate when app goes to background
  useEffect(() => {
    appStateSubscriptionRef.current = AppState.addEventListener(
      'change',
      nextAppState => {
        if (
          appState === 'background' &&
          nextAppState === 'active' &&
          checkedIn &&
          checkInTime
        ) {
          // App has come back to foreground - sync with background service data
          const syncBackgroundProgress = async () => {
            try {
              const bgDataStr = await AsyncStorage.getItem(BG_LAST_ELAPSED_KEY);
              if (bgDataStr) {
                const bgData = JSON.parse(bgDataStr);
                if (bgData && bgData.elapsedSeconds !== undefined) {
                  console.log('[BGSync] Syncing with background data:', bgData);
                  setElapsedTime(formatTime(bgData.elapsedSeconds));
                  setProgressPercentage(bgData.progressPercentage);

                  // Restart progress with synced data
                  startShiftProgress(bgData.elapsedSeconds);
                }
              }
            } catch (e) {
              console.error('[BGSync] Failed to sync with background data:', e);
            }
          };

          syncBackgroundProgress();
        }

        setAppState(nextAppState);
        setLastUpdateTime(Date.now());
      },
    );

    return () => {
      if (appStateSubscriptionRef.current) {
        appStateSubscriptionRef.current.remove();
      }
    };
  }, [appState, checkedIn, checkInTime, lastUpdateTime]);

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      await loadCheckInState();

      // Check if we need to restart background service (in case of app restart)
      try {
        const checkInData = await AsyncStorage.getItem(CHECK_IN_STORAGE_KEY);
        if (checkInData) {
          const parsedData = JSON.parse(checkInData);
          if (parsedData.checkedIn && parsedData.checkInTime) {
            // We're still checked in, so restart background service
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

  // Load the ONNX model
  useEffect(() => {
    const loadModel = async () => {
      try {
        let modelPath = '';

        if (Platform.OS === 'android') {
          // Android: copy assets to DocumentDirectory
          modelPath = `${RNFS.DocumentDirectoryPath}/mobilefacenet.onnx`;
          if (!(await RNFS.exists(modelPath))) {
            console.log('📥 Copying model to DocumentDirectory...');
            await RNFS.copyFileAssets('mobilefacenet.onnx', modelPath);
          }
        } else {
          // iOS: load directly from app bundle
          const rawPath = `${RNFS.MainBundlePath}/mobilefacenet.onnx`;
          console.log('[DBG] iOS rawPath =', rawPath);

          const exists = await RNFS.exists(rawPath);
          console.log('[DBG] iOS exists =', exists);

          if (!exists) {
            console.error('❌ Model file not found in bundle');
            return;
          }

          // Some iOS libs require file:// prefix
          modelPath = `file://${rawPath}`;
        }

        console.log('[DBG] Final modelPath =', modelPath);

        const s = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['cpu'],
          graphOptimizationLevel: 'all',
        });
        setSession(s);
        console.log('✅ Model loaded successfully');
      } catch (e) {
        console.error('❌ Model load error:', e);
        Alert.alert('Error', `Failed to load ONNX model: ${e.message}`);
      }
    };

    loadModel();
  }, []);

  // Load employee's biometric details
  useEffect(() => {
    const fetchBiometricDetails = async () => {
      try {
        setIsFaceLoading(true);

        // Try to load from cache first
        const cacheKey = `face_${employeeDetails.id}_${employeeDetails.childCompanyId}`;
        if (cachedFaceImage) {
          setRegisteredFace(cachedFaceImage);
          setShowRegistration(false);
          setIsFaceLoading(false);
          console.log('✅ Loaded face from cache');
          return;
        }

        // Set timeout to prevent hanging on API call
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 10000),
        );

        // Actual API call
        const fetchPromise = axios.get(
          `${BASE_URL}/EmployeeBiomatricRegister/getEmployeeBiomatricDetailsByString/${employeeDetails.id}/${employeeDetails.childCompanyId}`,
        );

        // Race between timeout and fetch
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (response.data?.faceImage) {
          const imageData = `data:image/jpeg;base64,${response.data.faceImage}`;
          setRegisteredFace(imageData);
          setCachedFaceImage(imageData); // Cache the image
          setShowRegistration(false);
          console.log('✅ Registered face loaded from API');
        } else {
          setRegisteredFace(null); // Explicitly set to null for new users
          setShowRegistration(true);
          console.log('⚠️ No face registration found');
        }
      } catch (err) {
        console.error('❌ API Error:', err?.response?.data || err.message);
        setRegisteredFace(null); // Explicitly set to null on error
        setShowRegistration(true);
      } finally {
        setIsFaceLoading(false);
      }
    };

    if (employeeDetails?.id && employeeDetails?.childCompanyId) {
      fetchBiometricDetails();
    }

    return () => {
      if (imageProcessingTimeoutRef.current) {
        clearTimeout(imageProcessingTimeoutRef.current);
      }
    };
  }, [employeeDetails, cachedFaceImage]);

  // Fetch leave data
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!user?.id || !user?.childCompanyId) return;

      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/CommonDashboard/GetEmployeeLeaveDetails/${user.childCompanyId}/${user.id}`,
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

  // Fetch employees on leave
  useEffect(() => {
    const fetchEmployeesOnLeave = async () => {
      if (!user) return;

      try {
        const companyId = user?.childCompanyId || 2;
        const branchId = user?.branchId || 20;
        const departmentId = user?.departmentId || 39;
        const employeeId = user?.id || 29;

        const url = `${BASE_URL}/CommonDashboard/GetLeaveApprovalDetails/${companyId}/${branchId}/${departmentId}/${employeeId}`;

        const response = await axiosInstance.get(url);

        // Transform the API data
        const transformedData = response.data.map(employee => ({
          id: employee.employeeId.toString(),
          name: employee.name,
          role: `${employee.designation}, ${employee.department}`,
          image: employee.empImage
            ? {uri: `${BASE_URL}/uploads/employee/${employee.empImage}`}
            : {uri: 'https://avatar.iran.liara.run/public/26'},
          empImage: employee.empImage,
        }));

        setLeaveUsers(transformedData);
      } catch (error) {
        console.error('Error fetching employees on leave:', error);
        setLeaveUsers([]);
      }
    };

    fetchEmployeesOnLeave();
  }, [user]);

  // Normalize embeddings
  const normalize = useCallback(vec => {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm === 0) return vec;
    const normalized = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      normalized[i] = vec[i] / norm;
    }
    return normalized;
  }, []);

  // Preprocess image with optimized caching
  const preprocessImage = useCallback(async base64Image => {
    try {
      const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const filePath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.jpg`;
      await RNFS.writeFile(filePath, pureBase64, 'base64');

      // Lower quality for faster processing
      const resized = await ImageResizer.createResizedImage(
        filePath,
        INPUT_SIZE,
        INPUT_SIZE,
        'JPEG',
        100, // Reduced quality from 100 to 80
        0,
        null,
        false,
        {mode: 'cover', onlyScaleDown: false},
      );

      const resizedPath = resized.uri.replace('file://', '');
      const resizedBase64 = await RNFS.readFile(resizedPath, 'base64');

      // Clean up temp files immediately
      RNFS.unlink(filePath).catch(err => console.log('Cleanup error:', err));
      RNFS.unlink(resizedPath).catch(err => console.log('Cleanup error:', err));

      return resizedBase64;
    } catch (err) {
      console.error('❌ Preprocessing error:', err);
      return null;
    }
  }, []);

  // Get embedding with timeout protection
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
        console.error('❌ Embedding error:', err);
        return null;
      }
    },
    [session, preprocessImage, normalize],
  );

  // Compare faces
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
      console.error('❌ Matching error:', error);
      Alert.alert('Error', 'Face matching failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Cosine similarity calculation
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

  // Euclidean distance calculation
  const euclideanDistance = useCallback((a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }, []);

  // Improved camera permission handling
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
        // iOS doesn't need explicit permission for camera through ImagePicker
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Launch camera with permission check
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

  // Handle face registration
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

          // Set a timeout to prevent hanging on embedding calculation
          let embeddingComplete = false;
          imageProcessingTimeoutRef.current = setTimeout(() => {
            if (!embeddingComplete) {
              setIsProcessing(false);
              setIsRegistering(false);
              Alert.alert(
                'Processing Error',
                'Face processing took too long. Please try again in better lighting.',
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
            setRegisteredFace(base64Image);
            setCachedFaceImage(base64Image); // Cache the new image
            setShowRegistration(false); // Hide registration section

            // Instead of just alerting, set a state to hide the bottom section
            Alert.alert('✅ Success', 'Face registered successfully');
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

  // Improved location permission handling
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

  // Get current GPS coordinates with retry
  const getCurrentPositionPromise = async (
    options = {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  ) => {
    try {
      return await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, options);
      });
    } catch (error) {
      console.warn('⚠️ Retrying with lower accuracy...');
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

  // Check if user is within geofence
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

      console.log('📍 Current location:', current);

      let fences = [];
      try {
        const res = await axios.get(
          `${BASE_URL}/GeoFencing/getGeoLocationDetailsByEmployeeId/${employeeDetails.id}/${employeeDetails.childCompanyId}`,
        );
        fences = Array.isArray(res.data) ? res.data : [];
        console.log(
          '📍 Geofence data============================================:',
          fences,
        );
      } catch (err) {
        console.error('⚠️ GeoFence API Error:', err.message);
        Alert.alert('Error', 'Could not fetch geofence data');
        return {inside: false};
      }

      // Use geolib for more accurate distance calculation
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

      if (nearest) {
        console.log(
          '✅ Nearest fence:',
          nearest.geoLocationName,
          `${nearest.distance.toFixed(2)}m away`,
        );
      }

      return {inside: matches.length > 0, nearestFence: nearest, matches};
    } catch (err) {
      console.error('❌ Location check error:', err);
      Alert.alert('Error', 'Unable to get your current location');
      return {inside: false};
    }
  };

  // Main check-in flow
  const handleCheckIn = async () => {
    if (!registeredFace) {
      Alert.alert('Registration Required', 'Please register your face first');
      setShowRegistration(true);
      return;
    }

    setIsLoading(true);

    // Step 1: Check location
    const locationResult = await checkLocation();

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
      setIsLoading(false);
      return;
    }

    // Step 2: Capture face for check-in
    Alert.alert(
      'Face Verification',
      'Please capture your face for verification',
      [
        {text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false)},
        {
          text: 'Capture',
          onPress: () => {
            launchCamera(async res => {
              if (res.assets?.[0]?.base64) {
                const capturedImage = `data:image/jpeg;base64,${res.assets[0].base64}`;
                setCapturedFace(capturedImage);

                // Step 3: Match faces
                const result = await matchFaces(registeredFace, capturedImage);
                if (result && result.isMatch) {
                  const now = new Date().getTime();
                  setCheckedIn(true);
                  setCheckInTime(now);
                  setCheckInStatus('success');
                  setProgressPercentage(0); // Reset progress to 0%

                  // Save state including the captured face
                  await saveCheckInState(true, now, capturedImage);

                  // Start background service to continue tracking when app is minimized
                  await startBackgroundService();

                  Alert.alert(
                    '✅ Success',
                    'Location + Face matched, you are checked in!',
                  );
                  startShiftProgress(0); // Start from 0
                } else {
                  Alert.alert(
                    '❌ Face Not Match',
                    'Face verification failed. Please try again.',
                  );
                }
              }
              setIsLoading(false);
            });
          },
        },
      ],
    );
  };

  // Handle check-out
  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      // Here you would typically call your check-out API
      await saveCheckInState(false); // Clear check-in state

      // Stop background service when checking out
      await stopBackgroundService();

      setCheckedIn(false);
      setCheckInTime(null);
      setShiftCompleted(true);
      setCheckInStatus('success');
      // Don't clear capturedFace so it shows during check-out

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      Alert.alert('✅ Success', 'You have successfully checked out!');
    } catch (error) {
      console.error('❌ Check-out error:', error);
      Alert.alert('Error', 'Failed to check out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppSafeArea>
      <ScrollView style={styles.container}>
        {/* Employee Info */}
        {employeeDetails && (
          <LinearGradient
            colors={['#eaeaea', '#a5a5a5ff']}
            style={styles.gradientCard}>
            <View style={styles.employeeCard}>
              <View style={styles.employeeCardContent}>
                <View style={styles.leftInfo}>
                  <Text style={styles.employeeName}>
                    {employeeDetails.employeeName}
                  </Text>
                  <Text style={styles.attendanceNote}>
                    Mark your Attendance
                  </Text>
                </View>
                <View style={styles.rightInfo}>
                  <Text style={styles.designation}>
                    {employeeDetails.designationName}
                  </Text>
                  <Text style={styles.department}>
                    {employeeDetails.departmentName}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Shift Card */}
        <LinearGradient
          colors={['#ffffff', '#f0f4ff']}
          style={styles.gradientCard}>
          <Card style={[styles.card, styles.shadow]}>
            <Card.Content style={styles.cardContent}>
              {/* Status */}
              <View style={[styles.statusIndicator, styles.shadow]}>
                <View style={styles.statusDotContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      checkedIn ? styles.statusActive : styles.statusInactive,
                    ]}
                  />
                  <Text style={styles.statusLabel}>
                    {checkedIn ? 'Checked In' : 'Checked Out'}
                  </Text>
                </View>
                <Text style={styles.elapsedTime}>{elapsedTime}</Text>
              </View>

              {/* Registration Section or Success Message */}
              {showRegistration ? (
                <View style={styles.registrationSection}>
                  <LinearGradient
                    colors={['#f5f7fa', '#e4e8f0']}
                    style={styles.registrationGradient}>
                    <View style={styles.registrationIconContainer}>
                      <Text style={styles.registrationIcon}>📝</Text>
                    </View>
                    <Text style={styles.registrationTitle}>
                      Face Registration Required
                    </Text>
                    <Text style={styles.registrationNote}>
                      Please register your face to enable check-in
                      functionality.
                    </Text>
                    <LinearGradient
                      colors={['#43e97b', '#38f9d7']}
                      style={styles.registerButtonGradient}>
                      <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleReregisterFace}
                        disabled={isRegistering || isProcessing}>
                        <Text style={styles.registerButtonText}>
                          {isRegistering
                            ? '⏳ Processing...'
                            : '📸 Register Face'}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </LinearGradient>
                </View>
              ) : (
                checkedIn &&
                employeeDetails && (
                  <LinearGradient
                    colors={['#f6f9ff', '#eef2f9']}
                    style={styles.welcomeGradient}>
                    <View style={styles.welcomeSection}>
                      {/* <View style={styles.welcomeIconContainer}>
                        <Text style={styles.welcomeIcon}>👋</Text>
                      </View> */}
                      <Text style={styles.welcomeText}>
                        Welcome back, {employeeDetails.employeeName}
                      </Text>
                      <Text style={styles.welcomeSubtext}>
                        Ready to start your shift?
                      </Text>
                    </View>
                  </LinearGradient>
                )
              )}

              {/* Match Result */}
              {matchResult && (
                <View
                  style={[
                    styles.resultContainer,
                    matchResult.isMatch
                      ? styles.matchSuccess
                      : styles.matchFailure,
                  ]}>
                  <Text style={styles.resultTitle}>
                    {matchResult.isMatch
                      ? '✅ FACE MATCHED'
                      : '❌ FACE NOT MATCHED'}
                  </Text>
                  <Text>Similarity: {matchResult.similarity.toFixed(4)}</Text>
                  <Text>Distance: {matchResult.distance.toFixed(4)}</Text>
                  <Text>Confidence: {matchResult.confidence}</Text>
                </View>
              )}

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Shift Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {progressPercentage}%
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <LinearGradient
                    colors={['#43e97b', '#38f9d7']}
                    style={[
                      styles.progressBarFill,
                      {width: `${progressPercentage}%`},
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  />
                </View>
                <Text style={styles.shiftTime}>Shift: {shiftHours}</Text>
              </View>

              {/* Check In/Out Buttons */}
              <View style={styles.buttonSection}>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#667eea" />
                ) : (
                  <View style={styles.buttonRow}>
                    <LinearGradient
                      colors={
                        checkedIn
                          ? ['#bdbdbd', '#9e9e9e']
                          : ['#43e97b', '#38f9d7']
                      }
                      style={[styles.gradientButton, {marginRight: 5}]}>
                      <Button
                        mode="contained"
                        onPress={handleCheckIn}
                        disabled={checkedIn || showRegistration}
                        style={styles.transparentBtn}
                        labelStyle={styles.buttonLabel}
                        icon="login">
                        Check In
                      </Button>
                    </LinearGradient>

                    <LinearGradient
                      colors={
                        !checkedIn
                          ? ['#bdbdbd', '#9e9e9e']
                          : ['#f5576c', '#f093fb']
                      }
                      style={[styles.gradientButton, {marginLeft: 5}]}>
                      <Button
                        mode="contained"
                        onPress={handleCheckOut}
                        disabled={!checkedIn}
                        style={styles.transparentBtn}
                        labelStyle={styles.buttonLabel}
                        icon="logout">
                        Check Out
                      </Button>
                    </LinearGradient>
                  </View>
                )}
              </View>

              {/* Face Preview Section */}
              <View style={styles.facePreviewSection}>
                <View style={styles.facePreview}>
                  <Text style={styles.previewTitle}>Registered Face</Text>
                  {isFaceLoading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : registeredFace ? (
                    <Image
                      source={{uri: registeredFace}}
                      style={styles.previewImage}
                    />
                  ) : (
                    <Text style={styles.placeholderText}>
                      No face registered
                    </Text>
                  )}
                </View>

                <View style={styles.facePreview}>
                  <Text style={styles.previewTitle}>
                    {checkedIn ? 'Check-In Face' : 'Last Captured Face'}
                  </Text>
                  {capturedFace ? (
                    <Image
                      source={{uri: capturedFace}}
                      style={styles.previewImage}
                    />
                  ) : (
                    <Text style={styles.placeholderText}>Not captured</Text>
                  )}
                </View>
              </View>

              {/* Only show this bottom registration section if face is not registered 
                and not showing the main registration section */}
              {/* ✅ Show either Re-register or Register section depending on face status */}
              {!isFaceLoading &&
                (registeredFace ? (
                  // ✅ Face already registered
                  <View style={styles.registeredFaceContainer}>
                    <Text style={styles.registeredFaceText}>
                      ⚠️ No face registered yet
                    </Text>
                    <TouchableOpacity
                      onPress={handleReregisterFace}
                      disabled={isProcessing}
                      style={[
                        styles.reRegisterButton,
                        styles.reRegisterExistingButton,
                      ]}>
                      <Text style={styles.reRegisterButtonText}>
                        {isProcessing
                          ? '⏳ Processing...'
                          : '📸 Register Face'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // ❌ Face not registered yet
                  <View style={styles.notRegisteredContainer}>
                    <Text style={styles.notRegisteredText}>
                      ⚠️ No face registered yet
                    </Text>
                    <TouchableOpacity
                      onPress={handleReregisterFace}
                      disabled={isProcessing}
                      style={[
                        styles.reRegisterButton,
                        styles.registerNewButton,
                      ]}>
                      <Text style={styles.reRegisterButtonText}>
                        {isProcessing ? '⏳ Processing...' : '📸 Register Face'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </Card.Content>
          </Card>
        </LinearGradient>

        <LeaveStatus leaveData={leaveData} />

        <OnLeaveUsers leaveUsers={leaveUsers} />

        {/* Processing overlay */}
        {(isProcessing || isRegistering) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              {isRegistering ? 'Registering face...' : 'Processing face...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  employeeCard: {borderRadius: 10, margin: 10, backgroundColor: '#fff'},
  employeeCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderTopColor: '#e0dfdfff',
    borderLeftColor: '#a8a8a8ff',
    borderRightColor: '#a8a8a8ff',
    borderBottomColor: '#636363ff',
    borderBottomWidth: 1,
    shadowColor: '#e0dbdbff',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  leftInfo: {flex: 1},
  rightInfo: {alignItems: 'flex-end'},
  employeeName: {fontSize: 18, fontWeight: '700', color: '#000'},
  attendanceNote: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 2,
  },
  designation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  department: {fontSize: 13, color: 'rgba(0, 0, 0, 0.9)'},

  gradientCard: {margin: 16, borderRadius: 16, backgroundColor: '#ffffffff'},

  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderTopColor: '#e0dfdfff',
    borderLeftColor: '#a8a8a8ff',
    borderRightColor: '#a8a8a8ff',
    borderBottomColor: '#636363ff',
    borderBottomWidth: 4,
    shadowColor: '#e0dbdbff',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },

  shadow:
    Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }
      : {
          elevation: 3,
          shadowColor: '#000',
        },
  cardContent: {padding: 20},

  statusIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDotContainer: {flexDirection: 'row', alignItems: 'center'},
  statusDot: {width: 12, height: 12, borderRadius: 6, marginRight: 8},
  statusActive: {backgroundColor: '#43e97b'},
  statusInactive: {backgroundColor: '#f5576c'},
  statusLabel: {fontSize: 14, fontWeight: '500', color: '#000'},
  elapsedTime: {fontSize: 16, fontWeight: '600', color: '#000'},

  registrationSection: {
    marginVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  registrationGradient: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  registrationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registrationIcon: {
    fontSize: 30,
  },
  registrationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  registrationNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  registerButtonGradient: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 5,
  },
  registerButton: {
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Welcome Section Styles
  welcomeGradient: {
    marginVertical: 15,
    borderRadius: 12,
  },
  welcomeSection: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeIcon: {
    fontSize: 30,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  progressSection: {marginVertical: 16},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {fontSize: 14, fontWeight: '600', color: '#000'},
  progressPercentage: {fontSize: 14, fontWeight: '500', color: '#000'},
  progressContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {height: '100%', borderRadius: 5},
  shiftTime: {marginTop: 8, fontSize: 13, fontWeight: '500', color: '#000'},

  buttonSection: {marginTop: 20},
  buttonRow: {flexDirection: 'row', justifyContent: 'space-between'},
  gradientButton: {flex: 1, borderRadius: 25, overflow: 'hidden'},
  transparentBtn: {backgroundColor: 'transparent'},
  buttonLabel: {color: '#fff', fontWeight: 'bold', fontSize: 16},

  captureButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {backgroundColor: '#ccc'},
  buttonText: {color: '#fff', fontWeight: '600', fontSize: 14},

  facePreviewSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  facePreview: {flex: 1, alignItems: 'center'},
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    color: '#000',
  },
  previewImage: {width: 80, height: 80, borderRadius: 8},
  placeholderText: {fontSize: 12, color: '#999', textAlign: 'center'},

  resultContainer: {
    marginVertical: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultTitle: {fontWeight: '700', marginBottom: 4, fontSize: 14},
  matchSuccess: {backgroundColor: '#d4edda', borderColor: '#28a745'},
  matchFailure: {backgroundColor: '#f8d7da', borderColor: '#dc3545'},

  preview: {width: 100, height: 100, marginTop: 10, borderRadius: 8},

  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {color: '#fff', marginTop: 10, fontSize: 16},

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  reRegisterButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  reRegisterExistingButton: {
    backgroundColor: '#de9629ff',
    marginTop: 8,
  },
  registerNewButton: {
    backgroundColor: '#007AFF',
  },
  reRegisterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registeredFaceContainer: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    color: '#ef6612ff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  registeredFaceText: {
    color: '#ff4d00ff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
});
