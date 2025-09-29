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
import LeaveStatus from '../component/LeaveStatus';
import * as geolib from 'geolib';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import {useAuth} from '../constants/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import OnLeaveUsers from '../component/OnLeaveUsers';
import BASE_URL from '../constants/apiConfig';
// 🔹 Config
const INPUT_SIZE = 112;
const COSINE_THRESHOLD = 0.7;
const EUCLIDEAN_THRESHOLD = 0.85;

const BIO_URL = 'http://192.168.29.2:91/api';
const TEST_COORDINATES = {
  latitude: 20.304756,
  longitude: 85.863306,
};

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

  const employeeDetails = {id: 29, childCompanyId: 2};
  const progressIntervalRef = useRef(null);
  const {user} = useAuth();
  // Format elapsed time
  const formatTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Progress timer
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Load ONNX model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelPath = `${RNFS.DocumentDirectoryPath}/mobilefacenet.onnx`;
        if (!(await RNFS.exists(modelPath))) {
          console.log('📥 Copying model to DocumentDirectory...');
          await RNFS.copyFileAssets('mobilefacenet.onnx', modelPath);
        }
        const s = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['cpu'],
          graphOptimizationLevel: 'all',
        });
        setSession(s);
        console.log('✅ Model loaded successfully');
      } catch (e) {
        console.error('❌ Model load error:', e);
        Alert.alert('Error', 'Failed to load ONNX model. Check assets.');
      }
    };
    loadModel();
  }, []);

  // Fetch employee biometric
  useEffect(() => {
    const fetchBiometricDetails = async () => {
      try {
        const response = await axios.get(
          `${BIO_URL}/EmployeeBiomatricRegister/getEmployeeBiomatricDetailsByString/${employeeDetails.id}/${employeeDetails.childCompanyId}`,
        );
        if (response.data?.faceImage) {
          setRegisteredFace(
            `data:image/jpeg;base64,${response.data.faceImage}`,
          );
          console.log('✅ Registered face loaded from API');
        } else {
          setShowRegistration(true);
        }
      } catch (err) {
        console.error('❌ API Error:', err?.response?.data || err.message);
        setShowRegistration(true);
      }
    };
    fetchBiometricDetails();
  }, []);

  
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

      await RNFS.unlink(filePath);
      await RNFS.unlink(resizedPath);

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

  // Launch camera
  const launchCamera = callback => {
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

  // Capture image for registration
  const captureRegistrationImage = () => {
    launchCamera(res => {
      if (res.assets?.[0]?.base64) {
        setRegisteredFace(`data:image/jpeg;base64,${res.assets[0].base64}`);
        setShowRegistration(false);
      }
    });
  };

  // Capture image for check-in
  const captureCheckInImage = () => {
    launchCamera(res => {
      if (res.assets?.[0]?.base64) {
        setCapturedFace(`data:image/jpeg;base64,${res.assets[0].base64}`);
      }
    });
  };

  // Register face
  const registerFace = async () => {
    if (!registeredFace) {
      Alert.alert('Error', 'Please capture an image first');
      return;
    }
    if (!session) {
      Alert.alert('Error', 'Model not loaded yet');
      return;
    }

    try {
      setIsProcessing(true);
      const emb = await getEmbedding(registeredFace);
      if (!emb) throw new Error('Face embedding generation failed');

      const buffer = Buffer.from(new Float32Array(emb).buffer);
      const embeddingBase64 = buffer.toString('base64');
      const pureBase64 = registeredFace.replace(/^data:image\/\w+;base64,/, '');

      const registrationData = {
        EmployeeId: employeeDetails?.id,
        FaceImage: pureBase64,
        FaceEmbeding: embeddingBase64,
        FingerImage: null,
        FingerEmbeding: null,
        RetinaImage: null,
        RetinaEmbeding: null,
        VoiceRecord: null,
        VoiceRecordEmbeding: null,
        CreatedDate: new Date().toISOString(),
        ModifiedDate: null,
        ModifiedBy: null,
        CreatedBy: employeeDetails?.id,
        IsDelete: 0,
        CompanyId: employeeDetails?.childCompanyId,
      };

      const response = await axios.post(
        `${BASE_URL}/EmployeeBiomatricRegister/SaveEmployeeImageStringFormat`,
        registrationData,
      );

      if (response.data?.isSuccess) {
        Alert.alert('✅ Registration Success', 'Face registered successfully');
        setShowRegistration(false);
      } else {
        Alert.alert(
          '❌ Registration Failed',
          response.data?.message || 'Unknown error',
        );
      }
    } catch (error) {
      console.error('❌ Registration Error:', error);
      Alert.alert('Registration Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check location
  const checkLocation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/GeoFencing/GetGeoFenceDetails/4`,
      );
      const officeLocation = {
        latitude: parseFloat(res.data.lattitude),
        longitude: parseFloat(res.data.longitude),
      };
      const radiusInMeters = parseInt(res.data.radius) || 50;

      const distanceInMeters = geolib.getDistance(
        TEST_COORDINATES,
        officeLocation,
      );
      console.log('Distance:', distanceInMeters, 'm');

      return distanceInMeters <= 10;
    } catch (err) {
      console.error('Location check error:', err);
      return false;
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
    const isWithinLocation = await checkLocation();
    if (!isWithinLocation) {
      Alert.alert(
        '❌ Location Failed',
        'You are not within the required location',
      );
      setIsLoading(false);
      return;
    }

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

  // const employeeData = {
  //   employeeName: 'Abhishek',
  //   designationName: 'Software Engineer',
  //   departmentName: 'IT Department'
  // };

  const employeeData = useFetchEmployeeDetails();

  return (
    <ScrollView style={styles.container}>
      {/* Employee Info */}
      {employeeData && (
        <LinearGradient
          colors={['#eaeaeaff', '#ffffffff']}
          style={styles.employeeCard}>
          <View style={styles.employeeCardContent}>
            <View style={styles.leftInfo}>
              <Text style={styles.employeeName}>
                {employeeData.employeeName}
              </Text>
              <Text style={styles.attendanceNote}>Mark your Attendance</Text>
            </View>
            <View style={styles.rightInfo}>
              <Text style={styles.designation}>
                {employeeData.designationName}
              </Text>
              <Text style={styles.department}>
                {employeeData.departmentName}
              </Text>
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
            {showRegistration && (
              <View style={styles.registrationSection}>
                <Text style={styles.sectionTitle}>📝 Register Your Face</Text>
                <Text style={styles.sectionSubtitle}>
                  You need to register your face before checking in
                </Text>

                {registeredFace && (
                  <Image
                    source={{uri: registeredFace}}
                    style={styles.preview}
                  />
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={captureRegistrationImage}
                    disabled={isProcessing}>
                    <Text style={styles.buttonText}>📸 Capture Face</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      !registeredFace && styles.disabledButton,
                    ]}
                    onPress={registerFace}
                    disabled={isProcessing || !registeredFace}>
                    <Text style={styles.buttonText}>
                      {isProcessing ? '🔄 Processing...' : '✅ Register'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                    style={styles.gradientButton}>
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
                    style={styles.gradientButton}>
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
                {registeredFace ? (
                  <Image
                    source={{uri: registeredFace}}
                    style={styles.previewImage}
                  />
                ) : (
                  <Text style={styles.placeholderText}>No face registered</Text>
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
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  employeeCard: {borderRadius: 16, margin: 16, padding: 16},
  employeeCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  gradientCard: {margin: 16, borderRadius: 16},
  card: {borderRadius: 16, backgroundColor: '#fff'},
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  sectionSubtitle: {fontSize: 14, color: '#666', marginBottom: 15},

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
  buttonRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 10},
  gradientButton: {flex: 1, borderRadius: 25},
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
    gap: 10,
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
});
