// const BASE_URL = 'http://192.168.29.2:91/api';
const BASE_URL = 'https://hcmapiv2.anantatek.com/api';
export default BASE_URL;




// Setting.js
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import { InferenceSession, Tensor } from "onnxruntime-react-native";
// import RNFS from "react-native-fs";
// import * as ImagePicker from "react-native-image-picker";
// import ImageResizer from "@bam.tech/react-native-image-resizer";
// import { Buffer } from "buffer";
// import jpeg from "jpeg-js";
// import useFetchEmployeeDetails from "../components/FetchEmployeeDetails";
// import * as ort from "onnxruntime-react-native";
// import axios from "axios";
// import BASE_URL from "../constants/apiConfig";

// import {
//   check,
//   request,
//   PERMISSIONS,
//   RESULTS,
//   openSettings,
// } from "react-native-permissions";

// // ================== CONFIG ===================
// const INPUT_SIZE = 112;
// // =============================================

// export default function Setting() {
//   const [session, setSession] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [registeredFace, setRegisteredFace] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showRegistration, setShowRegistration] = useState(true);
//   // const employeeDetails = useFetchEmployeeDetails();
//   const employeeDetails = {id: 29, childCompanyId: 2};
//   // ===== MODEL LOADING =====
//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         setIsLoading(true);
//         let modelPath = "";

//         if (Platform.OS === "ios") {
//           modelPath = `${RNFS.MainBundlePath}/mobilefacenet.onnx`;
//         } else {
//           const destPath = `${RNFS.CachesDirectoryPath}/mobilefacenet.onnx`;
//           const exists = await RNFS.exists(destPath);
//           if (!exists) {
//             console.log("📥 Copying model from assets...");
//             const data = await RNFS.readFileAssets("mobilefacenet.onnx", "base64");
//             await RNFS.writeFile(destPath, data, "base64");
//           }
//           modelPath = destPath;
//         }

//         const exists = await RNFS.exists(modelPath);
//         console.log("📂 Model path:", modelPath, "Exists:", exists);

//         if (!exists) {
//           Alert.alert("Error", "Model not found in assets or cache");
//           return;
//         }

//         console.log("⚙️ Loading ONNX model...");
//         const s = await ort.InferenceSession.create(modelPath, {
//           executionProviders: ["cpu"],
//           graphOptimizationLevel: "all",
//         });

//         setSession(s);
//         console.log("✅ Model loaded successfully!");
//       } catch (e) {
//         console.error("❌ Model load failed:", e);
//         Alert.alert("Error", `Model load failed: ${e.message}`);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadModel();
//   }, []);

//   // ===== PERMISSIONS =====
//   const requestCameraPermission = async () => {
//     try {
//       if (Platform.OS === "ios") {
//         const result = await request(PERMISSIONS.IOS.CAMERA);
//         if (result === RESULTS.BLOCKED) {
//           Alert.alert("Camera Access Needed", "Please allow camera access in Settings", [
//             { text: "Cancel", style: "cancel" },
//             { text: "Open Settings", onPress: () => openSettings() },
//           ]);
//           return false;
//         }
//         return result === RESULTS.GRANTED;
//       } else {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       }
//     } catch (err) {
//       console.error("Permission error:", err);
//       return false;
//     }
//   };

//   // ===== IMAGE PICKER =====
//   const launchCamera = async (callback) => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) return;

//     ImagePicker.launchCamera(
//       {
//         mediaType: "photo",
//         includeBase64: true,
//         saveToPhotos: false,
//         cameraType: "front",
//         quality: 0.7,
//       },
//       (res) => {
//         if (res.didCancel) {
//           console.log("User cancelled camera");
//         } else if (res.errorCode) {
//           Alert.alert("Error", res.errorMessage);
//         } else if (res.assets?.[0]?.base64) {
//           callback(`data:image/jpeg;base64,${res.assets[0].base64}`);
//         } else {
//           Alert.alert("Error", "No image data returned");
//         }
//       }
//     );
//   };

//   // ===== IMAGE PREPROCESS =====
//   const preprocessImage = async (base64Image) => {
//     try {
//       const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
//       const filePath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.jpg`;
//       await RNFS.writeFile(filePath, pureBase64, "base64");

//       const resized = await ImageResizer.createResizedImage(
//         filePath,
//         INPUT_SIZE,
//         INPUT_SIZE,
//         "JPEG",
//         80,
//         0
//       );

//       const resizedPath = resized.uri.replace("file://", "");
//       const resizedBase64 = await RNFS.readFile(resizedPath, "base64");

//       await RNFS.unlink(filePath);
//       await RNFS.unlink(resizedPath);

//       return resizedBase64;
//     } catch (err) {
//       console.error("Preprocess error:", err);
//       return null;
//     }
//   };

//   // ===== EMBEDDING COMPUTATION =====
//   const normalize = (vec) => {
//     const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
//     return norm === 0 ? vec : vec.map((v) => v / norm);
//   };

//   const getEmbedding = async (base64Image) => {
//     try {
//       if (!session) throw new Error("ONNX session not loaded");
//       const processed = await preprocessImage(base64Image);
//       if (!processed) throw new Error("Image preprocessing failed");

//       const raw = jpeg.decode(Buffer.from(processed, "base64"), {
//         useTArray: true,
//         formatAsRGBA: false,
//       });

//       const mean = [0.5, 0.5, 0.5];
//       const std = [0.5, 0.5, 0.5];
//       const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);

//       for (let y = 0; y < INPUT_SIZE; y++) {
//         for (let x = 0; x < INPUT_SIZE; x++) {
//           const idx = (y * INPUT_SIZE + x) * 3;
//           const r = (raw.data[idx] / 255 - mean[0]) / std[0];
//           const g = (raw.data[idx + 1] / 255 - mean[1]) / std[1];
//           const b = (raw.data[idx + 2] / 255 - mean[2]) / std[2];
//           floatData[y * INPUT_SIZE + x] = r;
//           floatData[INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = g;
//           floatData[2 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = b;
//         }
//       }

//       const tensor = new Tensor("float32", floatData, [1, 3, INPUT_SIZE, INPUT_SIZE]);
//       const feeds = { [session.inputNames[0]]: tensor };
//       const results = await session.run(feeds);
//       const embedding = results[session.outputNames[0]].data;

//       return normalize(Array.from(embedding));
//     } catch (err) {
//       console.error("Embedding error:", err);
//       return null;
//     }
//   };

//   // ===== FACE REGISTRATION =====
//   const registerFace = async () => {
//     if (!registeredFace) {
//       Alert.alert("Error", "Please capture an image first");
//       return;
//     }
//     if (!session) {
//       Alert.alert("Error", "Model not loaded yet");
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       const emb = await getEmbedding(registeredFace);
//       if (!emb) throw new Error("Face embedding generation failed");

//       const buffer = Buffer.from(new Float32Array(emb).buffer);
//       const embeddingBase64 = buffer.toString("base64");
//       const pureBase64 = registeredFace.replace(/^data:image\/\w+;base64,/, "");

//       const registrationData = {
//         EmployeeId: employeeDetails?.id,
//         FaceImage: pureBase64,
//         FaceEmbeding: embeddingBase64,
//         FingerImage: null,
//         FingerEmbeding: null,
//         RetinaImage: null,
//         RetinaEmbeding: null,
//         VoiceRecord: null,
//         VoiceRecordEmbeding: null,
//         CreatedDate: new Date().toISOString(),
//         ModifiedDate: null,
//         ModifiedBy: null,
//         CreatedBy: employeeDetails?.id,
//         IsDelete: 0,
//         CompanyId: employeeDetails?.childCompanyId,
//       };

//       const response = await axios.post(
//         `${BASE_URL}/EmployeeBiomatricRegister/SaveEmployeeImageStringFormat`,
//         registrationData
//       );

//       if (response.data?.isSuccess) {
//         Alert.alert("✅ Registration Success", "Face registered successfully");
//         setShowRegistration(false);
//       } else {
//         Alert.alert(
//           "❌ Registration Failed",
//           response.data?.message || "Unknown error"
//         );
//       }
//     } catch (error) {
//       console.error("❌ Registration Error:", error);
//       Alert.alert("Registration Error", error.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // ===== UI =====
//   return (
//     <ScrollView style={styles.container}>
//       {showRegistration ? (
//         <>
//           <Text style={styles.title}>Face Registration</Text>

//           {isLoading ? (
//             <ActivityIndicator size="large" color="#0000ff" />
//           ) : (
//             <Text style={styles.statusText}>
//               Model Status: {session ? "✅ Loaded" : "❌ Not Loaded"}
//             </Text>
//           )}

//           <View style={styles.imageBox}>
//             {registeredFace ? (
//               <Image source={{ uri: registeredFace }} style={styles.image} />
//             ) : (
//               <View style={styles.placeholderImage}>
//                 <Text>No Image</Text>
//               </View>
//             )}

//             <TouchableOpacity
//               style={styles.captureButton}
//               onPress={() => launchCamera(setRegisteredFace)}
//             >
//               <Text style={styles.buttonText}>📸 Capture Face</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={[styles.registerButton, isProcessing && styles.disabledButton]}
//             onPress={registerFace}
//             disabled={isProcessing}
//           >
//             <Text style={styles.buttonText}>
//               {isProcessing ? "Registering..." : "Register Face"}
//             </Text>
//           </TouchableOpacity>
//         </>
//       ) : (
//         <View style={{ alignItems: "center", marginTop: 50 }}>
//           <Text style={{ fontSize: 18, color: "green" }}>
//             ✅ Face Registration Completed!
//           </Text>
//           <TouchableOpacity
//             style={[styles.registerButton, { marginTop: 20 }]}
//             onPress={() => setShowRegistration(true)}
//           >
//             <Text style={styles.buttonText}>Register Again</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// // ===== STYLES =====
// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   title: {
//     fontSize: 22,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 10,
//   },
//   statusText: { textAlign: "center", marginVertical: 10 },
//   imageBox: { alignItems: "center", marginVertical: 20 },
//   image: { width: 250, height: 250, borderRadius: 10 },
//   placeholderImage: {
//     width: 250,
//     height: 250,
//     borderRadius: 10,
//     backgroundColor: "#eee",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   captureButton: {
//     backgroundColor: "#3498db",
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 15,
//   },
//   registerButton: {
//     backgroundColor: "#27ae60",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   disabledButton: { backgroundColor: "#ccc" },
//   buttonText: { color: "#fff", fontWeight: "600" },
// });


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
//   Alert,
//   ScrollView,
//   Platform,
//   PermissionsAndroid,
// } from 'react-native';
// import { Card, Button } from 'react-native-paper';
// import LinearGradient from 'react-native-linear-gradient';
// import * as ort from 'onnxruntime-react-native';
// import RNFS from 'react-native-fs';
// import * as ImagePicker from 'react-native-image-picker';
// import { Buffer } from 'buffer';
// import jpeg from 'jpeg-js';
// import ImageResizer from '@bam.tech/react-native-image-resizer';
// import axios from 'axios';
// import AppSafeArea from '../component/AppSafeArea';
// import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
// import { useAuth } from '../constants/AuthContext';
// import BASE_URL from '../constants/apiConfig';

// const INPUT_SIZE = 112;

// const HomeScreen = () => {
//   const [registeredFace, setRegisteredFace] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [session, setSession] = useState(null);
//   const employeeDetails = { id: 29, childCompanyId: 2 };
//   const employeeData = useFetchEmployeeDetails();
//   const { user } = useAuth();

//   // ========== Load ONNX model ==========
//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         let modelPath = '';
//         if (Platform.OS === 'android') {
//           modelPath = `${RNFS.DocumentDirectoryPath}/mobilefacenet.onnx`;
//           if (!(await RNFS.exists(modelPath))) {
//             await RNFS.copyFileAssets('mobilefacenet.onnx', modelPath);
//           }
//         } else {
//           const rawPath = `${RNFS.MainBundlePath}/mobilefacenet.onnx`;
//           const exists = await RNFS.exists(rawPath);
//           if (!exists) {
//             Alert.alert('Error', 'Model not found in bundle');
//             return;
//           }
//           modelPath = `file://${rawPath}`;
//         }
//         const s = await ort.InferenceSession.create(modelPath, { executionProviders: ['cpu'] });
//         setSession(s);
//         console.log('✅ Model loaded');
//       } catch (e) {
//         console.error('Model load error:', e);
//         Alert.alert('Error', `Failed to load model: ${e.message}`);
//       }
//     };
//     loadModel();
//   }, []);

//   // ========== Helpers ==========
//   const normalize = vec => {
//     const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
//     return norm === 0 ? vec : vec.map(v => v / norm);
//   };

//   const preprocessImage = async base64Image => {
//     try {
//       const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
//       const filePath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.jpg`;
//       await RNFS.writeFile(filePath, pureBase64, 'base64');
//       const resized = await ImageResizer.createResizedImage(
//         filePath,
//         INPUT_SIZE,
//         INPUT_SIZE,
//         'JPEG',
//         100,
//         0,
//       );
//       const resizedPath = resized.uri.replace('file://', '');
//       const resizedBase64 = await RNFS.readFile(resizedPath, 'base64');
//       await RNFS.unlink(filePath);
//       await RNFS.unlink(resizedPath);
//       return resizedBase64;
//     } catch (err) {
//       console.error('Preprocess error:', err);
//       return null;
//     }
//   };

//   const getEmbedding = async base64Image => {
//     if (!session) throw new Error('Model not initialized');
//     const processed = await preprocessImage(base64Image);
//     const raw = jpeg.decode(Buffer.from(processed, 'base64'), { useTArray: true });
//     const mean = [0.5, 0.5, 0.5];
//     const std = [0.5, 0.5, 0.5];
//     const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);

//     for (let y = 0; y < INPUT_SIZE; y++) {
//       for (let x = 0; x < INPUT_SIZE; x++) {
//         const idx = (y * INPUT_SIZE + x) * 3;
//         const r = (raw.data[idx] / 255 - mean[0]) / std[0];
//         const g = (raw.data[idx + 1] / 255 - mean[1]) / std[1];
//         const b = (raw.data[idx + 2] / 255 - mean[2]) / std[2];
//         floatData[y * INPUT_SIZE + x] = r;
//         floatData[INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = g;
//         floatData[2 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = b;
//       }
//     }

//     const tensor = new ort.Tensor('float32', floatData, [1, 3, INPUT_SIZE, INPUT_SIZE]);
//     const feeds = { [session.inputNames[0]]: tensor };
//     const results = await session.run(feeds);
//     return normalize(Array.from(results[session.outputNames[0]].data));
//   };

//   const requestCameraPermission = async () => {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.CAMERA,
//       {
//         title: 'Camera Permission',
//         message: 'App needs camera access',
//         buttonPositive: 'OK',
//       },
//     );
//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   };

//   // ========== Re-Register Face ==========
//   const handleReregisterFace = async () => {
//     if (!session) {
//       Alert.alert('Error', 'Model not loaded yet');
//       return;
//     }

//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) {
//       Alert.alert('Permission Denied', 'Camera access required');
//       return;
//     }

//     ImagePicker.launchCamera(
//       { mediaType: 'photo', includeBase64: true, cameraType: 'front', quality: 0.7 },
//       async res => {
//         if (res.didCancel) return;
//         if (!res.assets?.[0]?.base64) {
//           Alert.alert('Error', 'No image captured');
//           return;
//         }

//         try {
//           setIsProcessing(true);
//           const base64Image = `data:image/jpeg;base64,${res.assets[0].base64}`;
//           const emb = await getEmbedding(base64Image);
//           if (!emb) throw new Error('Failed to get embedding');

//           const buffer = Buffer.from(new Float32Array(emb).buffer);
//           const embeddingBase64 = buffer.toString('base64');
//           const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

//           const payload = {
//             EmployeeId: employeeDetails.id,
//             FaceImage: pureBase64,
//             FaceEmbeding: embeddingBase64,
//             FingerImage: null,
//             FingerEmbeding: null,
//             RetinaImage: null,
//             RetinaEmbeding: null,
//             VoiceRecord: null,
//             VoiceRecordEmbeding: null,
//             CreatedDate: new Date().toISOString(),
//             ModifiedBy: employeeDetails.id,
//             IsDelete: 0,
//             CompanyId: employeeDetails.childCompanyId,
//           };

//           const response = await axios.post(
//             `${BASE_URL}/EmployeeBiomatricRegister/SaveEmployeeImageStringFormat`,
//             payload,
//           );

//           if (response.data?.isSuccess) {
//             setRegisteredFace(base64Image);
//             Alert.alert('✅ Success', 'Face re-registered successfully');
//           } else {
//             Alert.alert('Error', response.data?.message || 'Failed to save face');
//           }
//         } catch (err) {
//           console.error('Re-Register Error:', err);
//           Alert.alert('Error', err.message);
//         } finally {
//           setIsProcessing(false);
//         }
//       },
//     );
//   };

//   // ========== UI ==========
//   return (
//     <AppSafeArea>
//       <ScrollView style={styles.container}>
//         {employeeData && (
//           <LinearGradient colors={['#eaeaea', '#ffffff']} style={styles.gradientCard}>
//             <View style={styles.employeeCard}>
//               <Text style={styles.employeeName}>{employeeData.employeeName}</Text>
//               <Text style={styles.attendanceNote}>Mark your Attendance</Text>
//             </View>
//           </LinearGradient>
//         )}

//         <LinearGradient colors={['#ffffff', '#f0f4ff']} style={styles.gradientCard}>
//           <Card style={styles.card}>
//             <Card.Content style={styles.cardContent}>
//               {/* 🔹 Re-Register Face Button */}
//               <View style={{ marginVertical: 10 }}>
//                 <LinearGradient
//                   colors={['#4facfe', '#00f2fe']}
//                   style={[styles.gradientButton, { alignSelf: 'center', width: '90%' }]}
//                 >
//                   <Button
//                     mode="contained"
//                     onPress={handleReregisterFace}
//                     disabled={isProcessing}
//                     style={styles.transparentBtn}
//                     labelStyle={styles.buttonLabel}
//                     icon="face-recognition"
//                   >
//                     {isProcessing ? 'Processing...' : 'Re-Register Face'}
//                   </Button>
//                 </LinearGradient>
//               </View>

//               {/* Face Preview */}
//               <View style={styles.facePreviewSection}>
//                 <View style={styles.facePreview}>
//                   <Text style={styles.previewTitle}>Registered Face</Text>
//                   {registeredFace ? (
//                     <Image source={{ uri: registeredFace }} style={styles.previewImage} />
//                   ) : (
//                     <Text style={styles.placeholderText}>Not registered yet</Text>
//                   )}
//                 </View>
//               </View>
//             </Card.Content>
//           </Card>
//         </LinearGradient>

//         {isProcessing && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#007AFF" />
//             <Text style={styles.loadingText}>Processing face...</Text>
//           </View>
//         )}
//       </ScrollView>
//     </AppSafeArea>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f9fafc' },
//   gradientCard: { margin: 10, borderRadius: 16 },
//   card: { borderRadius: 16 },
//   cardContent: { padding: 16 },
//   employeeCard: { padding: 16 },
//   employeeName: { fontSize: 20, fontWeight: 'bold' },
//   attendanceNote: { color: '#666' },
//   gradientButton: { borderRadius: 10 },
//   transparentBtn: { backgroundColor: 'transparent' },
//   buttonLabel: { color: '#fff', fontWeight: 'bold' },
//   facePreviewSection: { alignItems: 'center', marginTop: 20 },
//   facePreview: { alignItems: 'center' },
//   previewTitle: { fontSize: 14, fontWeight: '600' },
//   previewImage: { width: 100, height: 100, borderRadius: 10, marginTop: 5 },
//   placeholderText: { color: '#aaa', fontSize: 12, marginTop: 5 },
//   loadingContainer: { alignItems: 'center', marginVertical: 20 },
//   loadingText: { marginTop: 10, color: '#555' },
// });
