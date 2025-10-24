import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Button, IconButton, ActivityIndicator } from 'react-native-paper';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { FaceDetector } from 'react-native-vision-camera-face-detector';
import base64 from 'react-native-base64';
import { runOnJS } from 'react-native-reanimated';
import * as Base64 from 'react-native-quick-base64';
import useFetchEmployeeDetails from './FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';

// Add imports for all available Base64 packages
import RNBlobUtil from 'react-native-blob-util';
import { decode as atobDecode } from 'base64-arraybuffer';
import base64js from 'base64-js';
import { Buffer } from 'buffer';

// Add a function to fetch and log employee biometric data
const fetchEmployeeBiometricData = async (employeeId = 33, companyId = 2) => {
  try {
    console.log(`Fetching biometric data for employee ${employeeId}, company ${companyId}...`);
    const API_URL = 'http://192.168.29.2:90/api';
    const response = await axiosinstance.get(
      `${API_URL}/EmployeeBiomatricRegister/getEmployeeBiomatricDetails/${employeeId}/${companyId}`
    );
    
    console.log('===== EMPLOYEE BIOMETRIC API RESPONSE =====');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    // Log the full response data
    console.log('Response dataaaaaaaaaaaaaaaaaaaaaaa:', response.data);
    
    // If there's face embedding data, log more details about it
    if (response.data && response.data.faceEmbeding) {
      console.log('\n===== FACE EMBEDDING DETAILS =====');
      console.log('Typeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:', typeof response.data.faceEmbeding);
      console.log('Lengthhhhhhhhhhhhhhhhhhhhhhh:', response.data.faceEmbeding.length);
      console.log('First 100 charssssssssssssssssssssss:', response.data.faceEmbeding.substring(0, 100));
      
      // Check if it's base64 encoded
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(response.data.faceEmbeding.replace(/\s/g, ''));
      console.log('Appears to be base64:', isBase64);
      
      // Try to decode with all available methods
      try {
        const manualDecoded = manualBase64ToByteArray(response.data.faceEmbeding);
        console.log('Manual decode length:', manualDecoded.length);
        console.log('First 10 bytes:', Array.from(manualDecoded.slice(0, 10)));
      } catch (e) {
        console.log('Manual decode failed:', e.message);
      }
    }
    
    // Return the response data for further use
    return response.data;
  } catch (error) {
    console.error('Error fetching biometric data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

// Add a function to parse face embedding data from the specific format received
const parseFaceEmbeddingData = (faceEmbeddingString) => {
  try {
    console.log('Parsing face embedding data...');
    
    // Check if the string starts with 'W' which indicates base64 encoded array format
    if (faceEmbeddingString && faceEmbeddingString.startsWith('W')) {
      // This appears to be a Base64 encoded array of floats
      console.log('Detected Base64 encoded array data');
      
      // Decode the Base64 string
      try {
        const decodedString = base64.decode(faceEmbeddingString);
        console.log('Decoded string first 20 chars:', decodedString.substring(0, 20));
        
        // It looks like the decoded string is a JSON array of floats
        // Check if it starts with '['
        if (decodedString.startsWith('[')) {
          try {
            const floatArray = JSON.parse(decodedString);
            console.log('Successfully parsed float array of length:', floatArray.length);
            
            // Convert float array to fixed-length byte array (128 bytes)
            // We'll take the first 32 float values (32 * 4 = 128 bytes)
            const byteArray = new Uint8Array(128);
            
            // Convert each float to 4 bytes (32-bit float)
            const limitedFloats = floatArray.slice(0, 32); // Limit to 32 floats
            
            limitedFloats.forEach((value, index) => {
              if (index < 32) { // Safety check
                // Convert float to byte representation (4 bytes per float)
                const buffer = new ArrayBuffer(4);
                const view = new DataView(buffer);
                view.setFloat32(0, value, true); // true for little-endian
                
                // Copy 4 bytes into our target array
                const offset = index * 4;
                for (let i = 0; i < 4; i++) {
                  if (offset + i < 128) {
                    byteArray[offset + i] = view.getUint8(i);
                  }
                }
              }
            });
            
            console.log('Converted face embedding to byte array:');
            console.log('First 16 bytes:', Array.from(byteArray.slice(0, 16)));
            
            return {
              originalArray: floatArray,
              byteArray: byteArray,
              format: 'float32Array'
            };
          } catch (parseErr) {
            console.log('Failed to parse JSON array:', parseErr.message);
          }
        }
      } catch (decodeErr) {
        console.log('Base64 decoding failed:', decodeErr.message);
      }
    }
    
    // If we reach here, try direct JSON parsing (it might be a stringified array)
    try {
      const directParsed = JSON.parse(faceEmbeddingString);
      if (Array.isArray(directParsed)) {
        console.log('Parsed direct JSON array of length:', directParsed.length);
        
        // Convert directly parsed array to byte array
        const byteArray = new Uint8Array(128);
        const limitedValues = directParsed.slice(0, 32);
        
        limitedValues.forEach((value, index) => {
          if (index < 32) {
            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setFloat32(0, value, true);
            
            const offset = index * 4;
            for (let i = 0; i < 4; i++) {
              if (offset + i < 128) {
                byteArray[offset + i] = view.getUint8(i);
              }
            }
          }
        });
        
        return {
          originalArray: directParsed,
          byteArray: byteArray,
          format: 'directJsonArray'
        };
      }
    } catch (directParseErr) {
      console.log('Direct JSON parsing failed');
    }
    
    // Last resort - manual base64 conversion
    const byteArray = manualBase64ToByteArray(faceEmbeddingString);
    console.log('Used manual conversion, byte array length:', byteArray.length);
    
    // Create fixed size array
    const fixedByteArray = new Uint8Array(128);
    fixedByteArray.fill(0);
    
    // Copy bytes (up to 128)
    const bytesToCopy = Math.min(byteArray.length, 128);
    for (let i = 0; i < bytesToCopy; i++) {
      fixedByteArray[i] = byteArray[i];
    }
    
    return {
      originalArray: null,
      byteArray: fixedByteArray,
      format: 'manualConversion'
    };
  } catch (error) {
    console.error('Error parsing face embedding data:', error);
    
    // Return empty array on error
    const emptyArray = new Uint8Array(128);
    emptyArray.fill(0);
    return {
      originalArray: null,
      byteArray: emptyArray,
      format: 'error',
      error: error.message
    };
  }
};

// Enhanced function to convert photo to fixed 128 byte array with multiple fallbacks
const convertPhotoToFixedByteArray = (base64String) => {
  console.log('Starting photo to byte array conversion...');
  
  try {
    if (!base64String) {
      throw new Error('No base64 string provided');
    }
    
    console.log('Base64 length:', base64String.length);
    console.log('First 10 chars of base64:', base64String.substring(0, 10));
    
    // Create fixed size array (exactly 128 bytes)
    const fixedByteArray = new Uint8Array(128);
    fixedByteArray.fill(0); // Fill with zeros by default
    
    // Try multiple methods to convert base64 to byte array
    let byteArray = null;
    let conversionMethod = '';
    
    // === Method 1: Use buffer package ===
    try {
      console.log('Trying Buffer method...');
      const buffer = Buffer.from(base64String, 'base64');
      byteArray = new Uint8Array(buffer);
      conversionMethod = 'buffer';
      console.log('Buffer method succeeded');
    } catch (err1) {
      console.log('Buffer method failed:', err1.message);
      
      // === Method 2: Use base64js ===
      try {
        console.log('Trying base64js method...');
        // Clean the base64 string to ensure it's valid
        const cleanBase64 = base64String.replace(/[^A-Za-z0-9+/=]/g, '');
        byteArray = base64js.toByteArray(cleanBase64);
        conversionMethod = 'base64js';
        console.log('base64js method succeeded');
      } catch (err2) {
        console.log('base64js method failed:', err2.message);
        
        // === Method 3: Use base64-arraybuffer ===
        try {
          console.log('Trying base64-arraybuffer method...');
          const arrayBuffer = atobDecode(base64String);
          byteArray = new Uint8Array(arrayBuffer);
          conversionMethod = 'base64-arraybuffer';
          console.log('base64-arraybuffer method succeeded');
        } catch (err3) {
          console.log('base64-arraybuffer method failed:', err3.message);
          
          // === Method 4: Manual conversion (last resort) ===
          console.log('Trying manual conversion method...');
          byteArray = manualBase64ToByteArray(base64String);
          conversionMethod = 'manual';
          console.log('Manual conversion method completed');
        }
      }
    }
    
    // Transfer bytes to fixed-size array (up to 128 bytes)
    if (byteArray && byteArray.length > 0) {
      const bytesToCopy = Math.min(byteArray.length, 128);
      for (let i = 0; i < bytesToCopy; i++) {
        fixedByteArray[i] = byteArray[i];
      }
      
      console.log(`Converted photo to fixed byte array (128 bytes) using ${conversionMethod}`);
      console.log('Original array length:', byteArray.length);
      console.log('First 10 bytes:', Array.from(fixedByteArray.slice(0, 10)));
      
      return fixedByteArray;
    } else {
      throw new Error('All conversion methods failed to produce a valid byte array');
    }
  } catch (error) {
    console.error('Error converting photo to byte array:', error);
    
    // Create fallback array with base64 string length in first byte
    const emptyArray = new Uint8Array(128);
    emptyArray.fill(0);
    
    // Store the error message in the array (as bytes)
    const errorMsg = `Error:${error.message}`;
    const errorBytes = new TextEncoder().encode(errorMsg.substring(0, 127));
    for (let i = 0; i < errorBytes.length; i++) {
      emptyArray[i] = errorBytes[i];
    }
    
    console.log('Returning fallback byte array');
    return emptyArray;
  }
};

// Manual base64 to byte array conversion function
const manualBase64ToByteArray = (base64String) => {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const base64Map = {};
  for (let i = 0; i < base64Chars.length; i++) {
    base64Map[base64Chars.charAt(i)] = i;
  }
  
  // Remove padding and non-base64 chars
  const cleanBase64 = base64String.replace(/[^A-Za-z0-9+/]/g, '');
  
  const byteLength = Math.floor(cleanBase64.length * 3 / 4);
  const bytes = new Uint8Array(byteLength);
  
  let byteIndex = 0;
  
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const encoded1 = base64Map[cleanBase64.charAt(i)] || 0;
    const encoded2 = base64Map[cleanBase64.charAt(i + 1)] || 0;
    const encoded3 = base64Map[cleanBase64.charAt(i + 2)] || 0;
    const encoded4 = base64Map[cleanBase64.charAt(i + 3)] || 0;
    
    bytes[byteIndex++] = (encoded1 << 2) | (encoded2 >> 4);
    if (byteIndex < byteLength) bytes[byteIndex++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (byteIndex < byteLength) bytes[byteIndex++] = ((encoded3 & 3) << 6) | encoded4;
  }
  
  console.log('Manual conversion created array of length:', bytes.length);
  return bytes;
};

// Add a simple function to test all conversion methods and log results
const testAllConversionMethods = () => {
  // Create a simple test string
  const testString = "Test123";
  const testBase64 = base64.encode(testString);
  console.log('=== Testing all base64 conversion methods ===');
  console.log('Test string:', testString);
  console.log('Test base64:', testBase64);
  
  // Test each method
  try {
    console.log('--- Testing Buffer ---');
    const bufferResult = Buffer.from(testBase64, 'base64');
    console.log('Buffer result:', Array.from(bufferResult));
  } catch (e) {
    console.log('Buffer test failed:', e.message);
  }
  
  try {
    console.log('--- Testing base64js ---');
    const base64jsResult = base64js.toByteArray(testBase64);
    console.log('base64js result:', Array.from(base64jsResult));
  } catch (e) {
    console.log('base64js test failed:', e.message);
  }
  
  try {
    console.log('--- Testing base64-arraybuffer ---');
    const arrayBufferResult = new Uint8Array(atobDecode(testBase64));
    console.log('base64-arraybuffer result:', Array.from(arrayBufferResult));
  } catch (e) {
    console.log('base64-arraybuffer test failed:', e.message);
  }
  
  try {
    console.log('--- Testing manual conversion ---');
    const manualResult = manualBase64ToByteArray(testBase64);
    console.log('Manual conversion result:', Array.from(manualResult));
  } catch (e) {
    console.log('Manual conversion test failed:', e.message);
  }
  
  console.log('=== Conversion tests complete ===');
};

// Add a function to test if Base64 library is working correctly
// const testBufferFunctionality = () => {
//   try {
//     // Create a test string
//     const testString = "Testing Base64 library";
    
//     // Convert string to bytes
//     const bytes = new TextEncoder().encode(testString);
    
//     // Convert to base64 using the new library
//     const base64Encoded = Base64.encode(bytes);
    
//     // Decode base64 back to bytes
//     const decodedBytes = Base64.decode(base64Encoded);
    
//     // Convert bytes back to string
//     const decoded = new TextDecoder().decode(decodedBytes);
    
//     // Log results
//     console.log('Base64 Test - Original:', testString);
//     console.log('Base64 Test - Decoded:', decoded);
//     console.log('Base64 Test - Base64:', base64Encoded);
//     console.log('Base64 Test - Success:', testString === decoded);
    
//     return {
//       success: testString === decoded,
//       buffer: Array.from(bytes).slice(0, 10),
//       base64: base64Encoded,
//       version: 'react-native-quick-base64'
//     };
//   } catch (error) {
//     console.error('Base64 Test - Failed:', error);
//     return { success: false, error: error.message };
//   }
// };

// Disable strict mode for Reanimated to avoid warnings
if (global.__reanimatedWorkletInit) {
  global.__reanimatedWorkletInit.extraGlobals.push('console.log');
  
  // Configure logger to reduce warnings
  if (global.ReanimatedDataMock?.setLoggerSettings) {
    global.ReanimatedDataMock.setLoggerSettings({
      level: 1, // 0 - error, 1 - warn, 2 - info, 3 - debug
      warnOnRead: false, // Disable the warning about reading values during render
    });
  }
}

const CameraComponent = ({ visible, onClose, onPictureTaken, testMode = false }) => {
  // Add state for API response data
  const [biometricData, setBiometricData] = useState(null);
  const [bufferTest, setBufferTest] = useState(null);
  const employeeDetails = useFetchEmployeeDetails();

  console.log(employeeDetails, 'Employee Details from Fetch Hook');
  
  // Fetch and log biometric data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Get employee and company ID from props or use defaults
      const empId = employeeDetails?.id || 33;
      const compId = employeeDetails?.childCompanyId || 2;
      
      const data = await fetchEmployeeBiometricData(empId, compId);
      setBiometricData(data);
      
      // Additional logging for face embedding data if available
      if (data?.faceEmbeding) {
        console.log('\n===== PROCESSING FACE EMBEDDING =====');
        
        try {
          // Try to parse as JSON array if it was JSON stringified
          const parsedEmbedding = JSON.parse(data.faceEmbeding);
          console.log('Successfully parsed as JSON:', 
            Array.isArray(parsedEmbedding) ? 'Array[' + parsedEmbedding.length + ']' : typeof parsedEmbedding);
        } catch (e) {
          console.log('Not a valid JSON string');
          
          // Check if it starts with 'W' which might indicate a special format
          if (data.faceEmbeding.startsWith('W')) {
            console.log('Special format detected starting with W');
          }
        }
      }
    };
    
    fetchData();
  }, [employeeDetails]);
  
  // Run buffer test on component mount
  useEffect(() => {
    const result = testBufferFunctionality();
    setBufferTest(result);
    console.log('Buffer test result:', result);
    
    // Also run our comprehensive conversion test
    testAllConversionMethods();
  }, []);
  
  // Avoid logging during every render to prevent excessive re-renders
  const wasVisible = useRef(visible);
  
  // Only log when visibility changes
  useEffect(() => {
    if (wasVisible.current !== visible) {
      console.log('CameraComponent visibility changed to:', visible);
      wasVisible.current = visible;
    }
  }, [visible]);
  
  // Camera state
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const [cameraDevice, setCameraDevice] = useState(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(false);
  const [faceBounds, setFaceBounds] = useState(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [faceRegistered, setFaceRegistered] = useState(false);
  
  // Add additional state for debugging
  const [debugInfo, setDebugInfo] = useState({
    cameraActive: false,
    permissionGranted: false,
    hasDevice: false,
    deviceInfo: null
  });
  
  // Add state to store face data as byte array
  const [faceByteArray, setFaceByteArray] = useState(null);
  
  // Add state for photo byte array
  const [photoByteArray, setPhotoByteArray] = useState(null);
  
  // Initialize camera with proper permission handling
  const initializeCamera = async () => {
    console.log('Initializing camera...');
    try {
      // Check current permission status first
      const currentPermission = await Camera.getCameraPermissionStatus();
      console.log('Current camera permission:', currentPermission);
      
      setDebugInfo(prev => ({...prev, permissionGranted: 
        currentPermission === 'authorized' || currentPermission === 'granted'}));
      
      if (currentPermission !== 'authorized' && currentPermission !== 'granted') {
        // Explicitly request permission if not already granted
        const permission = await Camera.requestCameraPermission();
        console.log('Camera permission request result:', permission);
        
        if (permission !== 'authorized' && permission !== 'granted') {
          setError('Camera permission required. Please grant camera access in settings.');
          return false;
        }
        
        setDebugInfo(prev => ({...prev, permissionGranted: true}));
      }
      
      console.log('Camera permission granted');
      return true;
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Failed to initialize camera: ' + err.message);
      return false;
    }
  };

  // Handle camera errors
  const onCameraError = (error) => {
    console.error('Camera error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    setError(`Camera error: ${error.message}`);
    setCameraInitialized(false);
    setCameraReady(false);
  };

  // Handle camera ready event
  const onCameraReady = () => {
    console.log('Camera is ready!');
    setCameraReady(true);
  };
  
  // Update camera device when devices change - with improved logging
  useEffect(() => {
    if (devices) {
      console.log('Available devices:', Object.keys(devices));
      
      // Try to get front camera first
      const frontCamera = devices.front;
      
      // If no front camera, try any available camera
      const anyCamera = Object.values(devices).find(d => d) || null;
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev, 
        hasDevice: !!(frontCamera || anyCamera),
        deviceInfo: frontCamera 
          ? { type: 'front', id: frontCamera.id } 
          : anyCamera 
            ? { type: 'other', id: anyCamera.id }
            : null
      }));
      
      if (frontCamera || anyCamera) {
        console.log('Setting camera device:', frontCamera ? 'front' : 'other');
        setCameraDevice(frontCamera || anyCamera);
      } else {
        console.error('No camera device found');
        setError('No camera device found on this device');
      }
    }
  }, [devices]);
  
  // Initialize camera when component becomes visible - with improved handling
  useEffect(() => {
    let isMounted = true;
    
    if (visible) {
      // Set a delay to ensure the modal is fully visible first
      const timer = setTimeout(async () => {
        if (!isMounted) return;
        
        const hasPermission = await initializeCamera();
        
        if (!isMounted) return;
        
        if (hasPermission) {
          setCameraInitialized(true);
          setFaceDetectionEnabled(true);
          setDebugInfo(prev => ({...prev, cameraActive: true}));
        }
      }, 500);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      // Clean up when modal is closed
      setCameraInitialized(false);
      setCameraReady(false);
      setFaceDetectionEnabled(false);
      setFaceDetected(false);
      setFaceBounds(null);
      setPhotoBase64(null);
      setDebugInfo(prev => ({...prev, cameraActive: false}));
    }
  }, [visible]);

  // Face detection processor - enhanced to create byte array
  const faceDetectionProcessor = async (frame) => {
    'worklet';
    try {
      // Skip processing if not enabled to reduce workload
      if (!faceDetectionEnabled) return;

      // Detect faces in the current frame
      const faces = await FaceDetector.detectFaces(frame);
      
      // Check if any face was detected
      const hasDetectedFace = faces && faces.length > 0;
      
      // Get bounds of the first detected face (if any)
      const detectedFaceBounds = hasDetectedFace ? faces[0].bounds : null;
      
      // Only update state if there's a change, to reduce renders
      if (hasDetectedFace !== faceDetected) {
        runOnJS(setFaceDetected)(hasDetectedFace);
      }
      
      // Only update bounds if they've changed significantly
      if (detectedFaceBounds && (!faceBounds || 
          Math.abs(detectedFaceBounds.x - faceBounds.x) > 5 ||
          Math.abs(detectedFaceBounds.y - faceBounds.y) > 5)) {
        runOnJS(setFaceBounds)(detectedFaceBounds);
        
        // Convert face data to byte array - this happens in the JS thread
        runOnJS(convertFaceDataToByteArray)(faces[0]);
      }
      
      // Update face registered status without causing excessive renders
      if (hasDetectedFace && !faceRegistered) {
        runOnJS(setFaceRegistered)(true);
      } else if (!hasDetectedFace && faceRegistered) {
        runOnJS(setFaceRegistered)(false);
      }
    } catch (e) {
      // Worklet error handling - log but don't crash
      // Don't log this on every frame to avoid excessive console output
      if (Math.random() < 0.05) { // Log only ~5% of errors
        console.log('Face detection error:', e.message);
      }
    }
  };
  
  // Function to convert face data to byte array
  const convertFaceDataToByteArray = (faceData) => {
    try {
      if (!faceData) return;
      
      // Extract essential face detection data
      const { bounds, landmarks } = faceData;
      
      // Create a compact representation of the face data
      const faceDataObject = {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        // Add landmarks if available (e.g., eyes, nose, mouth)
        landmarks: landmarks ? {
          leftEye: landmarks.leftEye ? [
            Math.round(landmarks.leftEye.x),
            Math.round(landmarks.leftEye.y)
          ] : null,
          rightEye: landmarks.rightEye ? [
            Math.round(landmarks.rightEye.x),
            Math.round(landmarks.rightEye.y)
          ] : null,
        } : {}
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(faceDataObject);
      
      // Convert to byte array
      let byteArray = new TextEncoder().encode(jsonString);
      
      // Limit to 128 bytes if needed
      const limitedByteArray = byteArray.slice(0, 128);
      
      // Store the result
      setFaceByteArray(limitedByteArray);
      
      // Log for debugging (not on every frame)
      if (Math.random() < 0.05) {
        console.log('Face data converted to byte array:');
        console.log('Face data JSON:', jsonString);
        console.log('Byte array length:', limitedByteArray.length);
        console.log('First 10 bytes:', Array.from(limitedByteArray.slice(0, 10)));
      }
      
      return limitedByteArray;
    } catch (error) {
      console.error('Failed to convert face data to byte array:', error);
      return null;
    }
  };
  
  // Add euclidean distance calculation function
  const euclideanDistance = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) {
      console.error('Invalid arrays for euclidean distance calculation');
      return Infinity;
    }
    
    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
      const diff = arr1[i] - arr2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };
  
  // Take photo function - with improved error handling
  const handleTakePhoto = async () => {
    if (!cameraRef.current) {
      console.log('Camera ref is null');
      setError('Camera not initialized properly. Please try again.');
      return;
    }
    
    if (!faceDetected && !testMode) {
      console.log('No face detected and not in test mode');
      setError('Please position your face in the camera view');
      return;
    }
    
    try {
      setProcessingPhoto(true);
      setIsLoading(true);
      console.log('Taking photo...');
      
      // Take photo with face detection data
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'speed',  // Prioritize speed over quality
        enableAutoRedEyeReduction: true,
        includeBase64: true, // Get base64 data
        quality: 0.5, // Lower quality for smaller file size
      });
      
      console.log('Photo taken successfully:', photo.path);
      
      // Store base64 data if available
      let base64Data = photo.base64;
      
      if (!base64Data) {
        // Fallback if camera API doesn't provide base64 directly
        try {
          console.log('Base64 not provided by camera, using fallback...');
          
          // Try using RNBlobUtil to read file and convert to base64
          const data = await RNBlobUtil.fs.readFile(photo.path, 'base64');
          base64Data = data;
          console.log('Successfully read file with RNBlobUtil');
        } catch (blobErr) {
          console.warn('RNBlobUtil failed:', blobErr.message);
          
          // Try second fallback with react-native-base64
          try {
            base64Data = await base64.encode(photo.path);
            console.log('Successfully encoded with react-native-base64');
          } catch (base64Err) {
            console.warn('Failed to encode photo to base64:', base64Err.message);
          }
        }
      }
      
      if (!base64Data) {
        console.error('Failed to get base64 data from photo');
        setError('Failed to process photo. Please try again.');
        setProcessingPhoto(false);
        setIsLoading(false);
        return;
      }
      
      console.log('Base64 data obtained, length:', base64Data.length);
      setPhotoBase64(base64Data);
      
      // Convert photo to 128 byte array
      console.log('Converting photo to 128 byte array...');
      let fixedPhotoByteArray = null;
      try {
        fixedPhotoByteArray = convertPhotoToFixedByteArray(base64Data);
        setPhotoByteArray(fixedPhotoByteArray);
        console.log('Photo successfully converted to byte array');
      } catch (byteArrayErr) {
        console.error('Failed to convert photo to byte array:', byteArrayErr);
      }
      
      if (testMode) {
        console.log('Test mode: Returning simple photo object without processing');
        onPictureTaken({
          path: photo.path,
          base64: "TEST_BASE64_DATA",
          width: photo.width,
          height: photo.height,
          // Include the 128 byte array in test mode
          byteArray: fixedPhotoByteArray ? Array.from(fixedPhotoByteArray) : null
        });
        onClose();
        return;
      }
      
      // Process the image to reduce size
      const processedPhoto = await processImageForUpload({
        path: photo.path,
        base64: base64Data,
        width: photo.width,
        height: photo.height,
        faceData: faceByteArray ? Array.from(faceByteArray) : null // Include face data
      });
      
      // Check for face match if biometric data is available
      if (biometricData?.faceEmbeding && processedPhoto?.fixed128ByteArray) {
        // Parse the stored face embedding
        const storedFaceData = parseFaceEmbeddingData(biometricData.faceEmbeding);
        
        if (storedFaceData?.originalArray && processedPhoto.fixed128ByteArray) {
          // Calculate euclidean distance between embeddings
          const distance = euclideanDistance(
            storedFaceData.originalArray.slice(0, 32),  // Use first 32 values
            processedPhoto.fixed128ByteArray.slice(0, 32)
          );
          
          console.log('Face match distance:', distance);
          processedPhoto.matchDistance = distance;
          processedPhoto.matchResult = distance < 0.6;
          
          // Show match result alert
          if (distance < 0.6) {
            Alert.alert('Face Match ✅', 'Your face has been verified successfully.');
          } else {
            Alert.alert('Face Not Matched ❌', 'Unable to verify your face. Please try again.');
          }
        }
      }
      
      // Pass the photo data to parent component
      if (onPictureTaken) {
        onPictureTaken(processedPhoto);
      }
      
      // Close the camera after capturing
      onClose();
    } catch (err) {
      console.error('Photo capture error:', err);
      setError(`Failed to process: ${err.message}`);
    } finally {
      setProcessingPhoto(false);
      setIsLoading(false);
    }
  };

  // Define camera component for rendering
  const cameraComponent = cameraDevice ? (
    <Camera
      ref={cameraRef}
      style={styles.camera}
      device={cameraDevice}
      isActive={cameraInitialized}
      onError={onCameraError}
      onFrameProcessorPerformanceSuggestionAvailable={() => {}}
      photo={true}
      video={false}
      audio={false}
      enableZoomGesture={true}
      frameProcessor={faceDetectionEnabled ? faceDetectionProcessor : undefined}
      frameProcessorFps={5}
      onCameraReady={onCameraReady}
    />
  ) : null;
  
  // Render face detection overlay
  const renderFaceDetectionOverlay = () => {
    if (!faceDetectionEnabled) return null;
    
    return (
      <View style={styles.faceDetectionOverlay}>
        {faceDetected ? (
          <View style={styles.faceDetectedIndicator}>
            <IconButton icon="face-recognition" size={24} color="#4CAF50" />
            <Text style={styles.faceDetectedText}>Face Detected</Text>
            
            {/* Show stability indicator for auto-capture */}
            {autoCapture && (
              <View style={[
                styles.stabilityIndicator, 
                faceCenteredStable ? styles.stableIndicator : styles.unstableIndicator
              ]}>
                <Text style={styles.stabilityText}>
                  {faceCenteredStable ? 'Stable' : 'Centering...'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.faceNotDetectedIndicator}>
            <IconButton icon="face-recognition" size={24} color="#FFC107" />
            <Text style={styles.faceNotDetectedText}>Position your face</Text>
          </View>
        )}
        
        {/* Display auto-capture countdown */}
        {autoCaptureCountdown !== null && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{autoCaptureCountdown}</Text>
          </View>
        )}
        
        {faceBounds && (
          <View
            style={[
              styles.faceBoundsBox,
              {
                left: faceBounds.x,
                top: faceBounds.y,
                width: faceBounds.width,
                height: faceBounds.height,
              },
              // Add extra styling when face is stable for visual feedback
              faceCenteredStable && styles.faceBoundsStable
            ]}
          />
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
            onPress={initializeCamera}
            style={{marginTop: 12}}
          >
            Retry Camera
          </Button>
        </View>
      );
    }

    return (
      <>CameraComponent
        {cameraComponent}
        
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
            disabled={!cameraReady || !faceDetected || processingPhoto || autoCaptureCountdown !== null}
            loading={processingPhoto}
          >
            {processingPhoto ? 'Processing...' : 'Take Photo'}
          </Button>
          
          {/* Auto-capture toggle button - enhanced with better styling */}
          <Button
            mode="outlined"
            icon={autoCapture ? "auto-fix" : "timer-off"}
            onPress={() => {
              // Clear any ongoing countdown when toggling
              if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
                countdownInterval.current = null;
                setAutoCaptureCountdown(null);
              }
              setAutoCapture(!autoCapture);
              setAutoCaptureTrigger(false);
            }}
            style={[
              styles.autoCaptureButton, 
              autoCapture && styles.autoCaptureEnabled,
              autoCaptureTrigger && styles.autoCaptureTriggered
            ]}
            disabled={!cameraReady || processingPhoto}
          >
            {autoCapture 
              ? (autoCaptureCountdown !== null 
                 ? `Capturing in ${autoCaptureCountdown}s` 
                 : 'Auto Capture ON')
              : 'Auto Capture OFF'}
          </Button>
        </View>
      </>
    );
  };
  
  // Add enhanced auto-capture state
  const [autoCapture, setAutoCapture] = useState(false);
  const [autoCaptureTrigger, setAutoCaptureTrigger] = useState(false);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState(null);
  const [faceCenteredStable, setFaceCenteredStable] = useState(false);
  const lastCaptureTime = useRef(0);
  const faceStableTimeout = useRef(null);
  const countdownInterval = useRef(null);
  
  // Auto-capture configuration
  const AUTO_CAPTURE_COOLDOWN = 3000; // Wait 3s between captures
  const FACE_STABILITY_THRESHOLD = 800; // Wait for face to be stable for 800ms
  const COUNTDOWN_DURATION = 3; // 3 second countdown
  
  // Function to check if face is centered in frame
  const checkFaceCentered = (bounds, frameWidth, frameHeight) => {
    if (!bounds) return false;
    
    // Calculate face center point
    const faceCenterX = bounds.x + (bounds.width / 2);
    const faceCenterY = bounds.y + (bounds.height / 2);
    
    // Calculate frame center
    const frameCenterX = frameWidth / 2;
    const frameCenterY = frameHeight / 2;
    
    // Check if face is reasonably centered (within 25% of center)
    const xOffset = Math.abs(faceCenterX - frameCenterX) / frameWidth;
    const yOffset = Math.abs(faceCenterY - frameCenterY) / frameHeight;
    
    // Face should be centered and of reasonable size
    return (xOffset < 0.25 && yOffset < 0.25 && bounds.width > (frameWidth * 0.2));
  };

  // Check face stability for auto-capture
  useEffect(() => {
    // Clear any existing timers first
    if (faceStableTimeout.current) {
      clearTimeout(faceStableTimeout.current);
      faceStableTimeout.current = null;
    }
    
    // Only proceed if auto-capture is enabled
    if (!autoCapture) {
      setFaceCenteredStable(false);
      return;
    }
    
    // Check if face is detected and in a good position
    if (faceDetected && faceBounds && cameraReady && !processingPhoto) {
      // Get frame dimensions from camera container
      const frameWidth = 400; // Default estimate if actual size unavailable
      const frameHeight = 400; // Default estimate if actual size unavailable
      
      // Check if face is well-centered
      const isCentered = checkFaceCentered(faceBounds, frameWidth, frameHeight);
      
      if (isCentered) {
        // Start stability timer
        faceStableTimeout.current = setTimeout(() => {
          setFaceCenteredStable(true);
          
          // Start the countdown for capture if not already running
          if (!autoCaptureCountdown && !autoCaptureTrigger && 
              (Date.now() - lastCaptureTime.current) > AUTO_CAPTURE_COOLDOWN) {
            startAutoCaptureCountdown();
          }
        }, FACE_STABILITY_THRESHOLD);
      } else {
        setFaceCenteredStable(false);
      }
    } else {
      setFaceCenteredStable(false);
    }
    
    // Clean up on unmount
    return () => {
      if (faceStableTimeout.current) {
        clearTimeout(faceStableTimeout.current);
        faceStableTimeout.current = null;
      }
    };
  }, [autoCapture, faceDetected, faceBounds, cameraReady, processingPhoto]);
  
  // Function to start the countdown for auto-capture
  const startAutoCaptureCountdown = () => {
    // Clear any existing countdown
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    
    // Set initial countdown value
    setAutoCaptureCountdown(COUNTDOWN_DURATION);
    
    // Prevent multiple triggers
    setAutoCaptureTrigger(true);
    
    // Start countdown interval
    countdownInterval.current = setInterval(() => {
      setAutoCaptureCountdown(prev => {
        const newCount = prev - 1;
        
        // When countdown reaches zero, take the photo
        if (newCount <= 0) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
          
          // Take photo if face is still detected and stable
          if (faceDetected && !processingPhoto && faceCenteredStable) {
            console.log('Auto-capturing photo after countdown...');
            handleTakePhoto();
            lastCaptureTime.current = Date.now();
          }
          
          // Reset countdown and trigger
          setTimeout(() => {
            setAutoCaptureTrigger(false);
          }, 1000);
          
          return null;
        }
        
        return newCount;
      });
    }, 1000);
  };
  
  // Cancel auto-capture countdown if face becomes unstable
  useEffect(() => {
    if (autoCapture && autoCaptureCountdown !== null && !faceCenteredStable) {
      // Cancel countdown if face becomes unstable
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      setAutoCaptureCountdown(null);
      
      // Allow trigger to reset after a short delay
      setTimeout(() => {
        setAutoCaptureTrigger(false);
      }, 500);
    }
  }, [autoCapture, faceCenteredStable, autoCaptureCountdown]);
  
  // Clean up all timers when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (faceStableTimeout.current) {
        clearTimeout(faceStableTimeout.current);
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);
  
  // Also clean up timers when modal visibility changes
  useEffect(() => {
    if (!visible) {
      // Reset all auto-capture state when modal closes
      setAutoCaptureTrigger(false);
      setAutoCaptureCountdown(null);
      setFaceCenteredStable(false);
      
      if (faceStableTimeout.current) {
        clearTimeout(faceStableTimeout.current);
        faceStableTimeout.current = null;
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    }
  }, [visible]);

  // Process and resize image to smaller size
  const processImageForUpload = async (imageData) => {
    try {
      if (!imageData || !imageData.base64) {
        console.log('No image data provided for processing');
        return imageData;
      }
      
      console.log('Processing image for upload...');
      
      // Get original data
      const originalBase64 = imageData.base64;
      const originalSize = originalBase64.length;
      
      console.log(`Original image size: ~${Math.round(originalSize / 1024)} KB`);
      
      // Convert to 128 byte array using our robust function
      try {
        console.log('Converting image to 128 byte array...');
        const fixedByteArray = convertPhotoToFixedByteArray(originalBase64);
        
        // Parse face embedding data if available
        let faceEmbeddingData = null;
        let faceComparisonResult = null;
        
        if (biometricData?.faceEmbeding) {
          console.log('Processing stored face embedding data...');
          faceEmbeddingData = parseFaceEmbeddingData(biometricData.faceEmbeding);
          
          // Compare face embedding with photo byte array
          if (faceEmbeddingData?.byteArray && fixedByteArray) {
            faceComparisonResult = compareFaceEmbeddingWithPhoto(
              faceEmbeddingData.byteArray,
              fixedByteArray
            );
          }
        }
        
        // Log bytes for debugging
        console.log('128-byte array created:');
        console.log('First 10 bytes:', Array.from(fixedByteArray.slice(0, 10)));
        console.log('Last 10 bytes:', Array.from(fixedByteArray.slice(118, 128)));
        
        if (faceEmbeddingData?.byteArray) {
          console.log('Face embedding bytes:');
          console.log('First 10 bytes:', Array.from(faceEmbeddingData.byteArray.slice(0, 10)));
        }
        
        return {
          ...imageData,
          fixed128ByteArray: Array.from(fixedByteArray),
          faceEmbeddingArray: faceEmbeddingData?.byteArray ? Array.from(faceEmbeddingData.byteArray) : null,
          faceComparisonScore: faceComparisonResult?.score,
          resized: true,
          originalSize: originalSize
        };
      } catch (error) {
        console.error('Error in byte array conversion:', error);
        
        // Create simple fallback array
        const fallbackArray = new Uint8Array(128);
        fallbackArray.fill(0);
        
        // Add error message in bytes
        const errorMessage = `Error:${error.message}`.substring(0, 50);
        const errorBytes = new TextEncoder().encode(errorMessage);
        for (let i = 0; i < Math.min(errorBytes.length, 50); i++) {
          fallbackArray[i] = errorBytes[i];
        }
        
        return {
          ...imageData,
          fixed128ByteArray: Array.from(fallbackArray),
          resized: false,
          originalSize: originalSize,
          error: error.message
        };
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return imageData; // Return original on error
    }
  };
  
  // Add a function to compare face embedding with photo data
  const compareFaceEmbeddingWithPhoto = (faceEmbeddingBytes, photoBytes) => {
    try {
      if (!faceEmbeddingBytes || !photoBytes) {
        return { score: 0, match: false, error: 'Missing data' };
      }
      
      console.log('Comparing face embedding with photo data...');
      
      // Convert byte arrays to numeric arrays for comparison
      const faceEmbeddingArray = Array.from(faceEmbeddingBytes);
      const photoArray = Array.from(photoBytes);
      
      // Calculate euclidean distance between embeddings
      const distance = euclideanDistance(
        faceEmbeddingArray.slice(0, 32),  // Use first 32 elements
        photoArray.slice(0, 32)
      );
      
      // Convert distance to similarity score (0-100)
      // Lower distance means higher similarity
      // Use an exponential transformation to convert distance to score
      const score = Math.max(0, 100 - Math.min(100, Math.round(distance * 100)));
      
      console.log(`Face comparison result: Distance ${distance.toFixed(2)}, Score: ${score}%`);
      
      return {
        score: score,
        distance: distance,
        match: distance < 0.6, // Threshold for matching
        bytesCompared: 32
      };
    } catch (error) {
      console.error('Error comparing face data:', error);
      return { score: 0, match: false, error: error.message };
    }
  };
  
  // Disable strict mode for Reanimated to avoid warnings
  if (global.__reanimatedWorkletInit) {
    global.__reanimatedWorkletInit.extraGlobals.push('console.log');
    
    // Configure logger to reduce warnings
    if (global.ReanimatedDataMock?.setLoggerSettings) {
      global.ReanimatedDataMock.setLoggerSettings({
        level: 1, // 0 - error, 1 - warn, 2 - info, 3 - debug
        warnOnRead: false, // Disable the warning about reading values during render
      });
    }
  }

  // Render debug info panel - enhanced to show more conversion details
  const renderDebugInfo = () => {
    if (!testMode) return null;
    
    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info</Text>
        
        <Text style={styles.debugText}>Face Detected: {faceDetected ? 'Yes' : 'No'}</Text>
        
        {/* Add biometric data information */}
        <Text style={styles.debugText}>Biometric API: {biometricData ? '✅ Loaded' : '⏳ Loading...'}</Text>
        
        {biometricData?.faceEmbeding && (
          <Text style={styles.debugText}>Face Embed: {biometricData.faceEmbeding.substring(0, 20)}...</Text>
        )}
        
        {/* Add Buffer test information */}
        <Text style={styles.debugText}>Buffer: {bufferTest ? 
          (bufferTest.success ? `✅ ${bufferTest.version}` : `❌ ${bufferTest.error || 'Failed'}`) : 
          '⏳ Testing...'}
        </Text>
        
        {/* Show detailed face embedding data if available */}
        {biometricData?.faceEmbeding && (
          <View style={styles.embeddingDataContainer}>
            <Text style={styles.embeddingDataTitle}>Face Embedding Data</Text>
            <Text style={styles.embeddingDataText}>
              {JSON.stringify(parseFaceEmbeddingData(biometricData.faceEmbeding), null, 2)}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render the modal content
  const modalContents = React.useMemo(() => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Face Verification</Text>
        
        {/* Display buffer status for testing */}
        {testMode && (
          <View style={[
            styles.bufferStatusContainer, 
            {backgroundColor: bufferTest?.success ? '#4CAF50' : '#F44336'}
          ]}>
            <Text style={styles.bufferStatusText}>
              Base64 Library: {bufferTest ? (bufferTest.success ? 'Working ✓' : 'Error ✗') : 'Testing...'}
            </Text>
          </View>
        )}
        
        {/* Add force take photo button for testing */}
        {testMode && (
          <Button 
            mode="contained"
            onPress={handleTakePhoto}
            style={{marginBottom: 8, backgroundColor: 'orange'}}
          >
            Force Take Photo (Test)
          </Button>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <IconButton icon="alert-circle" size={32} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={initializeCamera}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        )}
        
        <View style={styles.cameraContainer}>
          {renderCamera()}
        </View>
        
        {renderDebugInfo()}
        
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
  ), [visible, cameraDevice, cameraReady, error, faceDetected, isLoading, processingPhoto, testMode, bufferTest]);
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={() => {
        onClose();
      }}
    >
      {modalContents}
    </Modal>
  );
};

// Improved styles for better camera visibility
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    padding: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  errorContainer: {
    width: '90%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorText: {
    textAlign: 'center',
    color: '#FFF',
    marginVertical: 8,
  },
  retryButton: {
    marginTop: 12,
  },
  cameraContainer: {
    width: '100%',
    height: '75%' // Make camera take up more vertical space
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
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  cameraLoadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 18,
    fontWeight: '500',
  },
  cameraControlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captureButton: {
    width: 150,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#3498db',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  autoCaptureButton: {
    width: 180,
    borderRadius: 24,
    marginBottom: 8,
  },
  autoCaptureEnabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  autoCaptureTriggered: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderColor: '#2196F3',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cancelButton: {
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: '#FFF',
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
  faceDetectedIndicator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
    alignItems: 'center',
    elevation: 4,
  },
  faceNotDetectedIndicator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 16,
    alignItems: 'center',
  },
  faceDetectedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  faceNotDetectedText: {
    color: '#FFC107',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  faceBoundsBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 10,
  },
  faceBoundsStable: {
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 4,
  },
  debugContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginVertical: 8,
  },
  debugTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  debugText: {
    color: '#ddd',
    fontSize: 12,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  bufferStatusContainer: {
    width: '100%',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  bufferStatusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stabilityIndicator: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stableIndicator: {
    backgroundColor: 'rgba(33, 150, 243, 0.7)',
  },
  unstableIndicator: {
    backgroundColor: 'rgba(255, 152, 0, 0.7)',
  },
  stabilityText: {
    color: '#FFF',
    fontSize: 12,
  },
  countdownContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  embeddingDataContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#222',
    maxHeight: 200,
    overflow: 'hidden',
  },
  embeddingDataTitle: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  embeddingDataText: {
    color: '#ddd',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default CameraComponent;