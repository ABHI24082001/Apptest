import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ToastAndroid } from 'react-native';
import { Button, Card, Snackbar, ActivityIndicator } from 'react-native-paper';
import axiosinstance from '../utils/axiosInstance';
import * as geolib from 'geolib';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
// import CameraComponent from './CameraComponent';

const API_URL = 'http://192.168.29.2:90/api/';

// Test coordinates for checking against office location
const TEST_COORDINATES = {
  latitude: 20.304756,
  longitude: 85.863306
};



// API service for attendance
const attendanceApi = {
  checkIn: async (data) => {
    try {
      const response = await axiosinstance.post(`${API_URL}/attendance/check-in`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  checkOut: async (data) => {
    try {
      const response = await axiosinstance.post(`${API_URL}/attendance/check-out`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
};

const AttendanceTracker = ({
  checkedIn,
  elapsedTime,
  progressPercentage,
  shiftHours,
  shiftCompleted,
  onCheckIn,
  onCheckOut,
}) => {
  // Employee details from custom hook
  const employeeDetails = useFetchEmployeeDetails();
  
  // State for check-in process
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(''); // 'success', 'failed', or ''
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Add state for camera visibility
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);

  // Toast function that works on both platforms
  const showToast = useCallback((message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  }, []);

  // Use useEffect to ensure console logging happens after state updates
  useEffect(() => {
    if (isCameraVisible) {
      console.log('Camera has been set to visible:', isCameraVisible);
    }
  }, [isCameraVisible]);
  
  // Use ref to track render count and prevent excessive logging
  const renderCount = useRef(0);
  
  // Handle check-in process with camera integration - optimized
  const handleStartCheckIn = useCallback(async () => {
    try {
      console.log('Starting check-in process...');
      
      // Reset states
      setError(null);
      setIsLoading(true);
      setCheckInStatus('');
      
      // Fetch geo-fence details from the API
      const response = await axiosinstance.get(`${API_URL}GeoFencing/GetGeoFenceDetails/4`);
      console.log('Geo Fence Details:', response.data);

      // Extract coordinates and radius from API response
      const officeLocation = {
        latitude: parseFloat(response.data.lattitude),
        longitude: parseFloat(response.data.longitude),
      };
      
      const radiusInMeters = parseInt(response.data.radius) || 50;
      
      console.log('Test User Location:', TEST_COORDINATES);
      console.log('Office Location:', officeLocation);
      console.log('Office Radius (meters):', radiusInMeters);

      // Calculate distance between test coordinates and office
      const distanceInMeters = geolib.getDistance(TEST_COORDINATES, officeLocation);
      console.log('Distance between test coordinates and office:', distanceInMeters, 'meters');

      // Check if test coordinates are within the specified radius of the office
      const isWithinRadius = geolib.isPointWithinRadius(
        TEST_COORDINATES, 
        officeLocation,
        radiusInMeters
      );
      console.log(`Is within ${radiusInMeters} meter radius:`, isWithinRadius);
    
      // Format distance for display
      const formattedDistance = Math.round(distanceInMeters);

      // Simulate a short delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isWithinRadius) {
        console.log('Location verification successful. Opening camera...');
        setLocationVerified(true);
        showToast(`Location verified! Distance: ${formattedDistance}m`);
      
        // Show camera after location verification is successful - with a slight delay
        // to ensure state updates properly
        setTimeout(() => {
          setIsCameraVisible(true);
        }, 300);
      
      } else {
        console.log('Location verification failed. User too far from office.');
        setCheckInStatus('failed');
        showToast(`Check-in failed! You are ${formattedDistance} meters away (must be within ${radiusInMeters} meters).`);
      
        Alert.alert(
          "Check-in Failed",
          `You are too far from the office.\nCurrent distance: ${formattedDistance} meters.\nYou need to be within ${radiusInMeters} meters to check in.`,
          [{ text: "OK" }]
        );
      
        // Reset status after some time
        setTimeout(() => {
          setCheckInStatus('');
        }, 3000);
      }
    
      setIsLoading(false);
    } catch (err) {
      console.error('Error during check-in process:', err);
      setError(`Error: ${err.message}`);
      showToast(`Check-in failed: ${err.message}`);
      setIsLoading(false);
    
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [employeeDetails]); // Add dependencies as needed

  // Add handler for camera picture taken
  const handlePictureTaken = (photo) => {
    console.log('Picture taken with data:', photo);
    
    if (!photo || !photo.base64) {
      console.error('Invalid photo data received');
      showToast('Failed to process photo: Missing data');
      return;
    }
    
    // Process the check-in with the captured photo
    processCameraCheckIn(photo);
  };
  
  // Process check-in with photo - improved error handling
  const processCameraCheckIn = async (photo) => {
    try {
      setIsLoading(true);
      
      // Build check-in data with photo
      const checkInData = {
        employeeId: employeeDetails?.id || '0',
        employeeCode: employeeDetails?.employeeId || 'UNKNOWN',
        companyId: employeeDetails?.childCompanyId || '0',
        latitude: TEST_COORDINATES.latitude,  // Using test coordinates
        longitude: TEST_COORDINATES.longitude,
        timestamp: new Date().toISOString(),
        checkInTime: new Date().toISOString(),
        photoBase64: photo.base64,  // Include the captured photo
        faceDetected: true
      };
      
      console.log('Submitting check-in data with photo');
      
      // Here you would make the API call to check-in
      // const result = await attendanceApi.checkIn(checkInData);
      
      // For now, we're simulating a successful check-in
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCheckInStatus('success');
      showToast('Check-in successful with photo verification!');
      
      // Notify parent component of successful check-in
      if (onCheckIn) onCheckIn();
      
      // Reset status after some time
      setTimeout(() => {
        setCheckInStatus('');
      }, 3000);
    } catch (err) {
      console.error('Error during photo check-in:', err);
      setError(`Error: ${err.message}`);
      showToast(`Photo check-in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out process
  const handleStartCheckOut = () => {
    // Directly submit check-out
    submitCheckOut();
  };

  // Check-out submission function
  const submitCheckOut = async () => {
    try {
      setIsLoading(true);
      
      // Get current location
      Geolocation.getCurrentPosition(
        async position => {
          const userPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          // Build check-out data
          const checkOutData = {
            employeeId: employeeDetails?.id,
            employeeCode: employeeDetails?.employeeId,
            companyId: employeeDetails?.childCompanyId,
            latitude: userPos.latitude,
            longitude: userPos.longitude,
            timestamp: new Date().toISOString(),
            checkOutTime: new Date().toISOString(),
          };
          
          // Send check-out data to API
          const result = await attendanceApi.checkOut(checkOutData);
          
          if (result.success) {
            if (onCheckOut) onCheckOut();
            showToast('Check-out successful');
          } else {
            throw new Error(result.error || 'API check-out failed');
          }
        },
        err => {
          showToast(`Location error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch (error) {
      showToast('Failed to submit check-out: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the camera component to prevent re-renders
  // const cameraComponentMemo = React.useMemo(() => (
  //   <CameraComponent 
  //     visible={isCameraVisible}
  //     onClose={() => setIsCameraVisible(false)}
  //     onPictureTaken={handlePictureTaken}
  //     testMode={true} // Add test mode for debugging
  //   />
  // ), [isCameraVisible, handlePictureTaken]);

  // Log render counts in development only, remove in production
  useEffect(() => {
    if (__DEV__) {
      renderCount.current += 1;
      if (renderCount.current % 10 === 0) { // Only log every 10 renders
        console.log(`AttendanceTracker rendered ${renderCount.current} times`);
      }
    }
  });

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <View style={[styles.statusBox, checkedIn ? styles.active : styles.inactive]}>
              <Text style={styles.statusText}>Check In {elapsedTime || '00:00:00'}</Text>
            </View>
            <View style={[styles.statusBox, !checkedIn ? styles.active : styles.inactive]}>
              <Text style={styles.statusText}>Check Out 00:00:00</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage || 0}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercentage || 0}%</Text>
          </View>
          
          <Text style={styles.shiftTime}>Shift: {shiftHours || '00:00'}</Text>
          {shiftCompleted && <Text style={styles.completedText}>Shift Completed</Text>}
          
          {/* Status Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {checkInStatus === 'success' && (
            <View style={styles.statusContainer}>
              <Text style={styles.successText}>Check-in Successful! ✓</Text>
            </View>
          )}
          
          {checkInStatus === 'failed' && (
            <View style={styles.statusContainer}>
              <Text style={styles.errorText}>Check-in Failed! Too far from office.</Text>
            </View>
          )}
          
          {/* Button Row */}
          <View style={styles.buttonRow}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Processing check-in...</Text>
              </View>
            ) : (
              <>
                <Button
                  mode="contained"
                  onPress={handleStartCheckIn}
                  disabled={checkedIn || isLoading}
                  style={[styles.button, checkedIn ? styles.disabled : styles.green]}
                >
                  Check In
                </Button>
                <Button
                  mode="contained"
                  onPress={handleStartCheckOut}
                  disabled={!checkedIn || isLoading}
                  style={[styles.button, !checkedIn ? styles.disabled : styles.red]}
                >
                  Check Out
                </Button>
              </>
            )}
          </View>
        </Card.Content>
      </Card>
      
      {/* Camera Component with proper props and debug logs */}

      
      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#e8f5e9',
  },
  inactive: {
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
  shiftTime: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  completedText: {
    color: '#388E3C',
    fontSize: 13,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    height: 40,
  },
  green: {
    backgroundColor: '#4CAF50',
  },
  red: {
    backgroundColor: '#F44336',
  },
  disabled: {
    backgroundColor: '#BDBDBD',
  },
  loadingContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  errorContainer: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  errorText: {
    textAlign: 'center',
    color: '#F44336',
  },
  statusContainer: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
  },
  successText: {
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: 'bold',
  }
});

export default AttendanceTracker;


