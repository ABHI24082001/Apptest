// // App.js
// import {
//   Linking,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Alert,
// } from 'react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Camera,
//   useCameraDevice,
// } from 'react-native-vision-camera';
// import axiosInstance from '../utils/axiosInstance';
// import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
// import RNFetchBlob from 'rn-fetch-blob';
// import RNFS from 'react-native-fs';
// import * as ort from 'onnxruntime-react-native';
// import ImageResizer from '@bam.tech/react-native-image-resizer';
// import { Buffer } from 'buffer';

// const App = () => {
//   const camera = useRef(null);
//   const employeDetails = useFetchEmployeeDetails();
//   const [storedFaceData, setStoredFaceData] = useState(null);
//   const [session, setSession] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [matchingResult, setMatchingResult] = useState(null);

//   const device = useCameraDevice('front');
//   if (device == null) return <View style={styles.loadingContainer} />;

//   // Permissions
//   useEffect(() => {
//     async function getPermission() {
//       const cameraPermission = await Camera.requestCameraPermission();
//       if (cameraPermission === 'denied') await Linking.openSettings();
//     }
//     getPermission();
//   }, []);

//   // Load ONNX model
//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         const modelPath = `${RNFS.DocumentDirectoryPath}/faceNet.onnx`;
//         if (!(await RNFS.exists(modelPath))) {
//           await RNFS.copyFileAssets('faceNet.onnx', modelPath);
//         }
//         const s = await ort.InferenceSession.create(modelPath);
//         setSession(s);
//         console.log('✅ Model loaded');
//       } catch (e) {
//         console.error('❌ Model load error:', e);
//       }
//     };
//     loadModel();
//   }, []);

//   // Load face data
//   useEffect(() => {
//     if (employeDetails?.id && employeDetails?.childCompanyId) {
//       loadStoredFaceData();
//     }
//   }, [employeDetails]);

//   const base64ToByteArray = (base64) => {
//     const buffer = Buffer.from(base64, 'base64');
//     return new Uint8Array(buffer);
//   };

//   const normalizeVector = (vector) => {
//     const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
//     return vector.map((val) => val / norm);
//   };

//   const cosineSimilarity = (a, b) => {
//     const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
//     const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
//     const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
//     return (dot / (normA * normB)) * 100;
//   };

//   const euclideanDistance = (a, b) => {
//     let sum = 0;
//     for (let i = 0; i < a.length; i++) {
//       sum += (a[i] - b[i]) ** 2;
//     }
//     return Math.sqrt(sum);
//   };

//   const generateEmbedding = async (base64, session) => {
//     const resized = await ImageResizer.createResizedImage(
//       `data:image/jpeg;base64,${base64}`,
//       160,
//       160,
//       'JPEG',
//       100
//     );

//     const croppedBase64 = await RNFetchBlob.fs.readFile(resized.uri, 'base64');
//     const byteArray = base64ToByteArray(croppedBase64);
//     const floatArray = Float32Array.from(byteArray, (c) => c / 255.0);

//     const input = new ort.Tensor('float32', floatArray, [1, 3, 160, 160]);
//     const inputName = session.inputNames[0];
//     const output = await session.run({ [inputName]: input });
//     const outputName = session.outputNames[0];

//     return normalizeVector(Array.from(output[outputName].data));
//   };

//   const loadStoredFaceData = async () => {
//     try {
//       setIsProcessing(true);
//       const res = await axiosInstance.get(
//         `/EmployeeBiomatricRegister/getEmployeeBiomatricDetailsByString/${employeDetails?.id}/${employeDetails?.childCompanyId}`
//       );
//       if (res.data?.isSuccess && res.data?.data) {
//         setStoredFaceData(res.data.data);
//         console.log('✅ Loaded stored face data');
//       } else {
//         setStoredFaceData(null);
//       }
//     } catch (err) {
//       console.error('❌ Load face data error:', err.message);
//       setStoredFaceData(null);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const registerBiometricData = async () => {
//     if (!camera.current || !session) return;
//     try {
//       setIsProcessing(true);
//       const photo = await camera.current.takePhoto({ flash: 'off' });
//       if (!photo?.path) throw new Error('Photo capture failed.');

//       const filePath = `file://${photo.path}`;
//       const base64Data = await RNFetchBlob.fs.readFile(filePath, 'base64');

//       const registrationData = {
//         EmployeeId: employeDetails?.id,
//         FaceImage: base64Data,
//         FaceEmbeding: base64Data, // Optional: Replace with actual embedding in future
//         FingerImage: null,
//         FingerEmbeding: null,
//         RetinaImage: null,
//         RetinaEmbeding: null,
//         VoiceRecord: null,
//         VoiceRecordEmbeding: null,
//         CreatedDate: new Date().toISOString(),
//         ModifiedDate: null,
//         ModifiedBy: null,
//         CreatedBy: employeDetails?.id,
//         IsDelete: 0,
//         CompanyId: employeDetails?.childCompanyId,
//       };

//       const response = await axiosInstance.post(
//         '/EmployeeBiomatricRegister/SaveEmployeeImageStringFormat',
//         registrationData
//       );

//       if (response.data?.isSuccess) {
//         Alert.alert('Registration Success ✅', 'Face registered successfully.', [
//           {
//             text: 'OK',
//             onPress: () => {
//               setTimeout(() => loadStoredFaceData(), 1000);
//             },
//           },
//         ]);
//       } else {
//         Alert.alert('Registration Failed ❌', response.data?.message || 'Unknown error');
//       }
//     } catch (error) {
//       console.error('❌ Registration Error:', error.message);
//       Alert.alert('Registration Error', error.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const matchFaceLocally = async () => {
//     if (!camera.current || !session || !storedFaceData?.FaceEmbeding) return;
//     try {
//       setIsProcessing(true);

//       const photo = await camera.current.takePhoto({ flash: 'off' });
//       if (!photo?.path) throw new Error('Photo capture failed.');

//       const base64 = await RNFetchBlob.fs.readFile(`file://${photo.path}`, 'base64');
//       const embeddingCaptured = await generateEmbedding(base64, session);

//       let embeddingStored = null;
//       try {
//         const decoded = Buffer.from(storedFaceData.FaceEmbeding, 'base64').toString('utf8');
//         const parsed = JSON.parse(decoded);
//         embeddingStored = Array.isArray(parsed[0]) ? parsed[0] : parsed;
//         if (!Array.isArray(embeddingStored)) throw new Error('Parsed embedding is invalid.');
//       } catch (err) {
//         console.error('❌ Parsing error:', err);
//         Alert.alert('Face Data Error', 'Stored embedding is invalid.');
//         return;
//       }

//       const similarity = cosineSimilarity(embeddingCaptured, embeddingStored);
//       const distance = euclideanDistance(embeddingCaptured, embeddingStored);
//       const isMatch = similarity >= 85 && distance < 0.6;

//       const result = {
//         isMatch,
//         matchPercentage: similarity,
//         euclideanDistance: distance,
//         message: isMatch
//           ? `✅ Face Matched (Cosine: ${similarity.toFixed(1)}%, Euclidean: ${distance.toFixed(3)})`
//           : `❌ Not Matched (Cosine: ${similarity.toFixed(1)}%, Euclidean: ${distance.toFixed(3)})`,
//       };

//       setMatchingResult(result);
//       Alert.alert(isMatch ? 'Match ✅' : 'No Match ❌', result.message);
//     } catch (e) {
//       console.error('❌ Match error:', e);
//       Alert.alert('Error', e.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Camera
//         ref={camera}
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         photo={true}
//       />

//       <View style={styles.ui}>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={registerBiometricData}
//           disabled={isProcessing}
//         >
//           <Text style={styles.text}>📸 Register Face</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.button}
//           onPress={matchFaceLocally}
//           disabled={isProcessing || !storedFaceData?.FaceEmbeding}
//         >
//           <Text style={styles.text}>🔍 Match Face</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.button}
//           onPress={loadStoredFaceData}
//           disabled={isProcessing}
//         >
//           <Text style={styles.text}>🔄 Reload Data</Text>
//         </TouchableOpacity>

//         {matchingResult && (
//           <Text style={styles.resultText}>
//             {matchingResult.message}
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   ui: {
//     position: 'absolute',
//     bottom: 80,
//     left: 20,
//     right: 20,
//     alignItems: 'center',
//     gap: 12,
//   },
//   button: {
//     padding: 14,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 20,
//     width: '80%',
//     alignItems: 'center',
//   },
//   text: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   resultText: {
//     color: 'white',
//     fontSize: 16,
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
// });

// export default App;



import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Setting = () => {
  return (
    <View>
      <Text>Setting</Text>
    </View>
  )
}

export default Setting

const styles = StyleSheet.create({})