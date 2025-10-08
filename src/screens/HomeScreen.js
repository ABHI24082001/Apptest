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

// 🔹 Config
const INPUT_SIZE = 112;
const COSINE_THRESHOLD = 0.7;
const EUCLIDEAN_THRESHOLD = 0.86;




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

  // const employeeDetails = {id: 29, childCompanyId: 2};

  const employeeDetails = useFetchEmployeeDetails();

  console.log(employeeDetails, 'employeeDetails');
  const progressIntervalRef = useRef(null);
  const imageProcessingTimeoutRef = useRef(null); // Add the missing ref
  const {user} = useAuth();
  // Format elapsed time
  const formatTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startShiftProgress = () => {
    const totalSeconds = 60; // demo: 1 minute
    let elapsedSeconds = 0;
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      elapsedSeconds++;
      if (elapsedSeconds >= totalSeconds) {
        setElapsedTime('01:00');
        setProgressPercentage(100);
        setShiftCompleted(true);
        clearInterval(progressIntervalRef.current);
        return;
      }
      setElapsedTime(formatTime(elapsedSeconds));
      setProgressPercentage(Math.floor((elapsedSeconds / totalSeconds) * 100));
    }, 1000);
  };

  useEffect(() => {
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
          setShowRegistration(true);
        }
      } catch (err) {
        console.error('❌ API Error:', err?.response?.data || err.message);
        setShowRegistration(true);
      } finally {
        setIsFaceLoading(false);
      }
    };

    if (employeeDetails?.id && employeeDetails?.childCompanyId) {
      fetchBiometricDetails();
    }

    return () => {
      // Clear any pending timeouts
      if (imageProcessingTimeoutRef.current) {
        clearTimeout(imageProcessingTimeoutRef.current);
      }
    };
  }, [employeeDetails]);

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

  // Normalize embeddings
  const normalize = vec => {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm === 0) return vec;
    const normalized = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      normalized[i] = vec[i] / norm;
    }
    return normalized;
  };

  // Preprocess image
  const preprocessImage = async base64Image => {
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
        80, // Reduced quality from 100 to 80
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
  };

  // Get embedding
  const getEmbedding = async base64Image => {
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
  };

  // Cosine similarity
  const cosineSimilarity = (a, b) => {
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
  };

  // Euclidean distance
  const euclideanDistance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

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

  const requestCameraPermission = async () => {
    try {
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
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
      },
      callback,
    );
  };

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
        maxWidth: 500, // Limit image size
        maxHeight: 500, // Limit image size
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
            Alert.alert('✅ Success', 'Face re-registered successfully');
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

  // request location permission
  // ✅ Request location permission (Android)
const requestLocationPermission = async () => {
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
  }
  return true;
};

  // ✅ Get current GPS coordinates as a Promise
const getCurrentPositionPromise = async (
  options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
) => {
  try {
    return await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, options);
    });
  } catch (error) {
    console.warn('⚠️ Retrying with lower accuracy...');
    return await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 20000 },
      );
    });
  }
};

const safeParseFloat = (val, fallback = NaN) => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
};
debugger
  // Check location
 const checkLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Location permission is required.');
      return { inside: false };
    }

    const pos = await getCurrentPositionPromise();
    const current = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
    if (__DEV__) console.log('📍 Current location:', current);
  
    let fences = [];
    try {
      const res = await axios.get(
        `${BASE_URL}/GeoFencing/getGeoLocationDetailsByEmployeeId/${employeeDetails.id}/${employeeDetails.childCompanyId}`,
      );
      fences = Array.isArray(res.data) ? res.data : [];
      console.log(fences , 'fences===============================================')
    } catch (err) {
      console.error('⚠️ GeoFence API Error:', err.message);
      Alert.alert('Error', 'Could not fetch geofence data');
      return { inside: false };
    }

    const matches = [];
    let nearest = null;

    for (const f of fences) {
      const lat = safeParseFloat(f.lattitude ?? f.latitude ?? f.lat, NaN);
      const lon = safeParseFloat(f.longitude ?? f.long ?? f.lng ?? f.lon, NaN);
      let radiusMeters = safeParseFloat(f.radius, 50);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const distance = geolib.getDistance(current, { latitude: lat, longitude: lon });
      const inside = distance <= radiusMeters;

      const fenceInfo = { ...f, distance, inside };
      if (inside) matches.push(fenceInfo);
      if (!nearest || distance < nearest.distance) nearest = fenceInfo;
    }

    if (__DEV__) console.log('✅ Nearest fence:', nearest?.geoLocationName, nearest?.distance);

    return { inside: matches.length > 0, nearestFence: nearest, matches };
  } catch (err) {
    console.error('❌ Location check error:', err);
    Alert.alert('Error', 'Unable to get your current location');
    return { inside: false };
  }
};
debugger
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
       console.log('✅ Inside area=========================================================================================:', locationResult.nearestFence.geoLocationName);
    // Step 2: Capture face for check-in
    Alert.alert(
      'Face Verification',
      'Please capture your face for verification',
      [
        {text: 'Cancel', style: 'cancel'},
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
                  setCheckedIn(true);
                  setCheckInStatus('success');
                  Alert.alert(
                    '✅ Success',
                    'Location + Face matched, you are checked in!',
                  );
                  startShiftProgress();
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

  const handleCheckOut = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCheckedIn(false);
      setIsLoading(false);
      setShiftCompleted(true);
      setCheckInStatus('success');
      setCapturedFace(null);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    }, 1500);
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

              {/* Registration Section */}
              {showRegistration ? (
                <View style={styles.registrationSection}>
                  <Text style={styles.sectionTitle}>📝 Register Your Face</Text>
                  <Text style={styles.sectionSubtitle}>
                    You need to register your face before checking in
                  </Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.captureButton,
                        {marginRight: 5},
                        isRegistering && styles.disabledButton,
                      ]}
                      onPress={handleReregisterFace}
                      disabled={isProcessing || isRegistering}>
                      {isRegistering ? (
                        <View style={styles.buttonContent}>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={[styles.buttonText, {marginLeft: 8}]}>
                            Processing...
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>📸 Capture Face</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.registrationSuccess}>
                  {isFaceLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#007AFF" />
                      <Text style={styles.loadingText}>
                        Loading face data...
                      </Text>
                    </View>
                  ) : registeredFace ? (
                    <>
                      <Text style={styles.successTitle}>Face Register</Text>
                      <Text style={styles.successSubtitle}>
                        You can now check in with face verification
                      </Text>
                    </>
                  ) : (
                    <View style={styles.loadingContainer}>
                      <Text style={[styles.loadingText, {color: '#007AFF'}]}>
                        No face data found
                      </Text>
                    </View>
                  )}
                </View>
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
                  <Text style={styles.previewTitle}>Captured Face</Text>
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
              <TouchableOpacity
                onPress={handleReregisterFace}
                disabled={isRegistering || isProcessing}>
                <Text
                  style={{
                    color: isRegistering || isProcessing ? '#999' : '#007AFF',
                    fontSize: 16,
                    marginTop: 10,
                    textAlign: 'center',
                  }}>
                  {isRegistering ? '⏳ Processing...' : '📸 Register Face'}
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </LinearGradient>

        {isProcessing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing face...</Text>
          </View>
        )}

        <LeaveStatus leaveData={leaveData} />

        <OnLeaveUsers leaveUsers={leaveUsers} />
      </ScrollView>

      {/* Processing overlay */}
      {(isProcessing || isRegistering) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isRegistering ? 'Registering face...' : 'Processing face...'}
          </Text>
        </View>
      )}
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
    // shadowOffset: { width: 3, height: 3 },
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
    // shadowOffset: { width: 3, height: 3 },
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
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  registrationSuccess: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  sectionSubtitle: {fontSize: 14, color: '#666', marginBottom: 15},
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#155724',
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#155724',
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
});
