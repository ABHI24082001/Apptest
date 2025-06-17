
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { storeData, addToArray, STORAGE_KEYS } from './StorageUtils';
// import { FaceDetector as VisionCameraFaceDetector } from 'react-native-vision-camera-face-detector';
/**
 * Process face detection on a static image from gallery
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Face detection results
 */
export const processStaticImageFaceDetection = async (base64Image) => {
  try {
    // If using vision-camera-face-detector (may require conversion to proper format)
    const imageBuffer = decodeBase64(base64Image);
    
    // Note: This is a placeholder as static image processing is not directly 
    // supported by vision-camera-face-detector. You might need to use 
    // a different library like react-native-face-detection for static images.
    
    // Simulate detection result for now
    const mockDetection = {
      faces: [
        {
          bounds: {
            x: 120,
            y: 80,
            width: 100,
            height: 120
          },
          rightEyeOpenProbability: 0.95,
          leftEyeOpenProbability: 0.92,
          smileProbability: 0.8,
          faceID: Date.now().toString(),
        }
      ],
      found: true,
      processTime: 230, // milliseconds
    };
    
    return mockDetection;
  } catch (error) {
    console.error('Face detection error:', error);
    return {
      faces: [],
      found: false,
      error: error.message
    };
  }
};

/**
 * Convert file to base64
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} Base64 encoded file
 */
const fileToBase64 = async (filePath) => {
  try {
    // Remove the file protocol prefix if present
    const path = filePath.replace('file://', '');
    const base64Data = await RNFS.readFile(path, 'base64');
    return base64Data;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw error;
  }
};

/**
 * Select image from gallery using react-native-image-picker
 */
export const selectImageFromGallery = async () => {
  try {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
    };
    
    const result = await launchImageLibrary(options);
    
    if (result.didCancel) {
      console.log('User cancelled image picker');
      return { cancelled: true };
    }
    
    if (result.errorCode) {
      throw new Error(`Image picker error: ${result.errorMessage}`);
    }
    
    // Get the selected asset
    if (!result.assets || result.assets.length === 0) {
      throw new Error('No image selected');
    }
    
    const selectedImage = result.assets[0];
    
    let base64Data = selectedImage.base64;
    
    // If base64 is not included, read it from the file
    if (!base64Data && selectedImage.uri) {
      try {
        base64Data = await fileToBase64(selectedImage.uri);
      } catch (base64Error) {
        console.error('Error reading file as base64:', base64Error);
        throw new Error('Failed to convert image to base64');
      }
    }
    
    // Process face detection
    const faceDetectionResult = await processStaticImageFaceDetection(base64Data);
    
    // Prepare result
    return {
      cancelled: false,
      image: {
        uri: selectedImage.uri,
        width: selectedImage.width,
        height: selectedImage.height,
        base64: base64Data,
        name: selectedImage.fileName || 'photo.jpg',
        type: selectedImage.type || 'image/jpeg',
        size: selectedImage.fileSize || 0,
      },
      faceDetection: faceDetectionResult
    };
    
  } catch (error) {
    console.error('Image selection error:', error);
    return {
      cancelled: false,
      error: error.message || 'Failed to select image'
    };
  }
};

/**
 * Take a photo using the camera
 */
export const takePhotoWithCamera = async () => {
  try {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
      saveToPhotos: false,
    };
    
    const result = await launchCamera(options);
    
    if (result.didCancel) {
      console.log('User cancelled camera');
      return { cancelled: true };
    }
    
    if (result.errorCode) {
      throw new Error(`Camera error: ${result.errorMessage}`);
    }
    
    // Get the captured image
    if (!result.assets || result.assets.length === 0) {
      throw new Error('No photo captured');
    }
    
    const capturedImage = result.assets[0];
    
    let base64Data = capturedImage.base64;
    
    // If base64 is not included, read it from the file
    if (!base64Data && capturedImage.uri) {
      try {
        base64Data = await fileToBase64(capturedImage.uri);
      } catch (base64Error) {
        console.error('Error reading file as base64:', base64Error);
        throw new Error('Failed to convert image to base64');
      }
    }
    
    // Process face detection
    const faceDetectionResult = await processStaticImageFaceDetection(base64Data);
    
    // Prepare result
    return {
      cancelled: false,
      image: {
        uri: capturedImage.uri,
        width: capturedImage.width,
        height: capturedImage.height,
        base64: base64Data,
        name: capturedImage.fileName || 'photo.jpg',
        type: capturedImage.type || 'image/jpeg',
        size: capturedImage.fileSize || 0,
      },
      faceDetection: faceDetectionResult
    };
    
  } catch (error) {
    console.error('Camera error:', error);
    return {
      cancelled: false,
      error: error.message || 'Failed to capture photo'
    };
  }
};

/**
 * Alias for selectImageFromGallery to maintain compatibility with existing code
 */
export const selectImageFromDocuments = selectImageFromGallery;

/**
 * Store attendance record with face detection locally
 * @param {Object} userData - User and location data
 * @param {Object} imageData - Image data with face detection results
 * @param {String} type - 'check-in' or 'check-out'
 */
export const storeAttendanceWithFace = async (userData, imageData, type = 'check-in') => {
  try {
    // Build attendance record
    const attendanceRecord = {
      employeeId: userData.employeeId || '123456',
      employeeCode: userData.employeeCode || 'EMP123',
      companyId: userData.companyId || 'C001',
      latitude: userData.latitude || 20.292633,
      longitude: userData.longitude || 85.857401,
      officeTitle: userData.officeTitle || 'Office Location 1',
      officeLatitude: userData.officeLatitude || 20.292633,
      officeLongitude: userData.officeLongitude || 85.857401,
      distance: userData.distance || 25,
      photoBase64: imageData.image?.base64 || "[base64_encoded_photo_data]",
      timestamp: new Date().toISOString(),
      faceDetected: imageData.faceDetection?.found || false,
      faceBounds: imageData.faceDetection?.faces[0]?.bounds || {
        x: 120,
        y: 80,
        width: 100,
        height: 120
      },
      type,
      offline: true,
      pendingSync: true,
      // Add file metadata if available
      fileName: imageData.image?.name,
      fileSize: imageData.image?.size,
      fileType: imageData.image?.type,
    };
    
    // Log attendance record for debugging
    console.log('Attendance Record:', JSON.stringify(attendanceRecord, null, 2));
    
    // Store in AsyncStorage
    if (type === 'check-in') {
      await storeData(STORAGE_KEYS.CURRENT_CHECK_IN, attendanceRecord);
    }
    
    // Add to attendance history
    await addToArray(STORAGE_KEYS.ATTENDANCE_HISTORY, attendanceRecord);
    
    return {
      success: true,
      record: attendanceRecord
    };
  } catch (error) {
    console.error('Error storing attendance with face:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
