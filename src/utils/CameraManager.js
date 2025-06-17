import { Camera } from 'react-native-vision-camera';
import { Platform, NativeModules, PermissionsAndroid } from 'react-native';

/**
 * Camera utility functions for troubleshooting common issues
 */
export const CameraManager = {
  /**
   * Check if camera permissions are already granted
   */
  checkPermissions: async () => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      console.log("Camera permission status:", status);
      return status === 'granted';
    } catch (error) {
      console.error("Error checking camera permissions:", error);
      return false;
    }
  },

  /**
   * Request camera permissions using both vision-camera and native Android methods
   */
  requestPermission: async () => {
    try {
      console.log("Requesting camera permission...");
      let result = await Camera.requestCameraPermission();
      console.log("Camera permission result:", result);
      
      // On Android, try direct request if Vision Camera's method fails
      if (Platform.OS === 'android' && result !== 'granted') {
        try {
          console.log("Trying direct Android permission request...");
          const androidResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Camera Permission",
              message: "This app needs access to your camera for attendance verification",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          console.log("Direct Android permission result:", androidResult);
          if (androidResult === PermissionsAndroid.RESULTS.GRANTED) {
            result = 'granted';
          }
        } catch (androidError) {
          console.error("Error with direct Android permission:", androidError);
        }
      }
      
      return result === 'granted';
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  },

  /**
   * Get information about the device environment
   */
  getEnvironmentInfo: () => {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isEmulator: Platform.constants?.Brand?.includes('google') || 
                 Platform.constants?.Brand?.includes('Android') || 
                 Platform.OS === 'ios' && Platform.constants?.Model?.includes('Simulator')
    };
  },
  
  /**
   * Force Android to refresh camera detection
   * This workaround is specifically for devices where camera detection fails initially
   */
  forceRefreshCameraDevices: async () => {
    if (Platform.OS !== 'android') return false;
    
    try {
      console.log("Attempting to force refresh camera devices");
      
      // Try to access native camera module directly as a workaround
      if (NativeModules.RNCameraManager || NativeModules.RNCamera) {
        console.log("Accessing native camera module");
      }
      
      // Make sure permission is granted before proceeding
      const hasPermission = await CameraManager.requestPermission();
      if (!hasPermission) {
        console.log("No camera permission for refresh");
        return false;
      }
      
      // On some Android devices, we need to wait a bit for camera system to initialize
      await CameraManager.delay(1000);
      return true;
    } catch (e) {
      console.error("Error refreshing camera devices:", e);
      return false;
    }
  },
  
  /**
   * Create a mock camera device for compatibility mode
   * This is a last resort for devices where camera detection completely fails
   */
  createFallbackCameraDevice: () => {
    console.log("Creating fallback camera device");
    return {
      id: "fallback-camera",
      name: "Fallback Camera",
      position: "back",
      hasFlash: false,
      hasTorch: false,
      isAvailable: true,
      supportsLowLightBoost: false,
      supportsDepthCapture: false,
      supportsFocus: false,
      supportsZoom: false,
      minZoom: 1,
      maxZoom: 1,
      neutralZoom: 1,
      formats: [],
      devices: {
        back: {
          id: "fallback-camera-back",
          name: "Fallback Back Camera"
        }
      }
    };
  },

  /**
   * Log troubleshooting information
   */
  logDeviceInfo: (devices) => {
    const devicesInfo = {
      hasFront: !!devices?.front,
      hasBack: !!devices?.back,
      frontDevice: devices?.front ? {
        id: devices.front.id,
        name: devices.front.name,
        position: devices.front.position
      } : null,
      backDevice: devices?.back ? {
        id: devices.back.id,
        name: devices.back.name,
        position: devices.back.position
      } : null,
      environment: CameraManager.getEnvironmentInfo()
    };

    console.log("Camera devices debug info:", JSON.stringify(devicesInfo, null, 2));
    return devicesInfo;
  },
  
  /**
   * Helper function to delay promise execution
   */
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

export default CameraManager;
