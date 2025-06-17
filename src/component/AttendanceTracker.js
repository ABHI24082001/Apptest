import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card, Snackbar } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import GeofencingCamera from './GeofencingCamera';
import axios from 'axios';

const API_URL = 'http://192.168.29.2:90/api/';

// API service for attendance
const attendanceApi = {
  checkIn: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/attendance/check-in`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  checkOut: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/attendance/check-out`, data);
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
  
  // State for geo-fencing
  const [geoFenceDetails, setGeoFenceDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [geofencingModalVisible, setGeofencingModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Toast function that works on both platforms
  const showToast = useCallback((message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);
  
  // Fetch geo-fence details when needed
  const fetchGeoFenceDetails = useCallback(async () => {
    if (!employeeDetails?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch assigned geo locations for the employee
      const response = await axios.get(
        `${API_URL}GeoFencing/getAssignedGeoLocationIdsByEmployeeId/${employeeDetails.id}/${employeeDetails.childCompanyId}`
      );
      
      if (response.data && response.data.length > 0) {
        const fetchedGeoDetails = [];
        
        for (const assignedGeo of response.data) {
          const geoId = assignedGeo.geoLocationId;
          try {
            const geoDetailsResponse = await axios.get(
              `${API_URL}GeoFencing/GetGeoFenceDetails/${geoId}`
            );
            
            fetchedGeoDetails.push(geoDetailsResponse.data);
          } catch (error) {
            console.error(`Error fetching geo fence details for ID ${geoId}:`, error);
          }
        }
        
        setGeoFenceDetails(fetchedGeoDetails);
      } else {
        // If no assigned locations, fetch a default one (ID: 2)
        try {
          const geoDetailsResponse = await axios.get(
            `${API_URL}GeoFencing/GetGeoFenceDetails/2`
          );
          setGeoFenceDetails([geoDetailsResponse.data]);
        } catch (error) {
          console.error('Error fetching default geo fence details:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching assigned geo locations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeDetails?.id, employeeDetails?.childCompanyId]);

  // Handle check-in process
  const handleStartCheckIn = async () => {
    // Fetch geo fence details if not already loaded
    if (geoFenceDetails.length === 0) {
      await fetchGeoFenceDetails();
    }
    
    // Open the geofencing and camera modal
    setGeofencingModalVisible(true);
  };

  // Handle successful verification from GeofencingCamera
  const handleGeofencingSuccess = async (data) => {
    try {
      setIsLoading(true);
      
      const { userLocation, nearestOffice, photoPath, photoBase64, faceBounds } = data;
      
      // Prepare check-in data
      const checkInData = {
        employeeId: employeeDetails.id,
        employeeCode: employeeDetails.employeeId,
        companyId: employeeDetails.childCompanyId,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        officeTitle: nearestOffice?.title,
        officeLatitude: nearestOffice?.latitude,
        officeLongitude: nearestOffice?.longitude,
        distance: nearestOffice?.distance,
        photoPath: photoPath || null,
        photoBase64: photoBase64 || null,
        timestamp: new Date().toISOString(),
        faceDetected: true,
        faceBounds: faceBounds,
        geoLocationId: nearestOffice?.geoLocationId || null,
        areaType: nearestOffice?.areaType || null
      };
      
      // Make API call to check in
      const result = await attendanceApi.checkIn(checkInData);
      
      if (result.success) {
        setGeofencingModalVisible(false);
        if (onCheckIn) onCheckIn();
        showToast('Check-in successful');
      } else {
        throw new Error(result.error || 'API check-in failed');
      }
      
    } catch (error) {
      showToast('Failed to submit check-in: ' + error.message);
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
          
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={handleStartCheckIn}
              disabled={checkedIn || isLoading}
              style={[styles.button, checkedIn ? styles.disabled : styles.green]}
              loading={isLoading}
            >
              Check In
            </Button>
            <Button
              mode="contained"
              onPress={handleStartCheckOut}
              disabled={!checkedIn || isLoading}
              style={[styles.button, !checkedIn ? styles.disabled : styles.red]}
              loading={isLoading}
            >
              Check Out
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Geofencing & Camera Modal */}
      <GeofencingCamera
        visible={geofencingModalVisible}
        onClose={() => setGeofencingModalVisible(false)}
        onSuccess={handleGeofencingSuccess}
        employeeDetails={employeeDetails}
        geoFenceDetails={geoFenceDetails}
      />
      
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
});

export default AttendanceTracker;


