import React, {useEffect, useState, useRef} from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import {Appbar, FAB, Card, Button, IconButton} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';

const Setting = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  // Start tracking right away for better location accuracy
  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, []);

  const setSpecificLocation = () => {
    getLocation();
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const employeeDetails = useFetchEmployeeDetails();

  // Function to post attendance data to the API
  const postAttendanceData = async () => {
    try {
      setLoading(true);
      // Use employee details from the hook or use default values
      const employeeId = employeeDetails?.id || 9;
      const companyId = employeeDetails?.childCompanyId || 1;

      // Make sure location data is available
      if (!location) {
        Alert.alert(
          'Error',
          'Location data is not available. Please try again.',
        );
        setLoading(false);
        return;
      }

      const apiUrl = 'YOUR_API_ENDPOINT_HERE'; // Replace with your actual API endpoint

      // Create payload with detailed location information
      const payload = {
        id: employeeId,
        childCompanyId: companyId,
        // Location data
        latitude: location.latitude,
        longitude: location.longitude,
        // Additional useful fields
        timestamp: new Date().toISOString(),
        deviceInfo: Platform.OS + ' ' + Platform.Version,
      };

      console.log('Posting iiiiiiiiiiii data:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Attendance marked successfully!');
        console.log('API Response:', responseData);
      } else {
        throw new Error(responseData.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error posting attendance data:', error);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong while marking attendance',
      );
    } finally {
      setLoading(false);
    }
  };

  console.log('Employee==================== Details:', employeeDetails);

  const getLocation = async () => {
    setLoading(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLoading(false);
      Alert.alert(
        'Permission Denied',
        'Location permission is required for this app to work properly.',
      );
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          // Add any additional location properties you might need
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(currentLocation);

        if (!initialRegion) {
          setInitialRegion({
            ...currentLocation,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...currentLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000,
          );
        }

        setLoading(false);
      },
      error => {
        console.error(error);
        Alert.alert(
          'Location Error',
          'Failed to get your location: ' + error.message,
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Always get fresh location
      },
    );
  };

  const startTracking = async () => {
    setTracking(true);

    // Use the fixed location instead of GPS tracking
    const fixedLocation = {
      latitude: 20.29234264345145,
      longitude: 85.8575183695706,
    };

    setLocation(fixedLocation);

    if (!initialRegion) {
      setInitialRegion({
        ...fixedLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  const handleMapError = () => {
    setMapError(true);
  };

  const handleRefresh = () => {
    getLocation();
  };

  const toggleTracking = () => {
    if (tracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const useSpecificLocation = () => {
    setSpecificLocation();
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Attendance" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <View style={styles.container}>
        {location && !mapError ? (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 20.29234264345145,
                longitude: 85.8575183695706,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              showsUserLocation={true}
              followsUserLocation={true}
              onError={handleMapError}>
              <Marker
                coordinate={{
                  latitude: 20.29234264345145,
                  longitude: 85.8575183695706,
                }}
                title="Your Current Location"
                description={`Lat: 20.29234264345145, Lng: 85.8575183695706`}
                pinColor="#2196F3"
              />
            </MapView>

            {/* Refresh FAB */}
            <FAB
              style={styles.refreshFab}
              icon="refresh"
              loading={loading}
              onPress={handleRefresh}
            />

            {/* Bottom Card */}
            <Card style={styles.bottomCard}>
              <Card.Content>
                <View style={styles.cardRow}>
                  <View style={styles.coordinatesBox}>
                    <Text style={styles.cardLabel}>Location Details:</Text>
                    <Text style={styles.coordinatesText}>
                      Latitude: {location.latitude.toFixed(6)}
                    </Text>
                    <Text style={styles.coordinatesText}>
                      Longitude: {location.longitude.toFixed(6)}
                    </Text>
                    <Button
                      mode="contained"
                      style={styles.punchButton}
                      labelStyle={styles.punchButtonLabel}
                      compact={true}
                      onPress={() => {
                        // Share location using the native share dialog
                        const shareMessage = `My current location:\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}`;
                        if (Platform.OS === 'android' || Platform.OS === 'ios') {
                          import('react-native').then(({Share}) => {
                            Share.share({ message: shareMessage });
                          });
                        } else {
                          Alert.alert('Share', shareMessage);
                        }
                      }}
                      loading={loading}>
                      Share
                    </Button>
                    {/* Optionally, keep the attendance button as well */}
                    {/* 
                    <Button
                      mode="contained"
                      style={styles.punchButton}
                      labelStyle={styles.punchButtonLabel}
                      compact={true}
                      onPress={postAttendanceData}
                      loading={loading}>
                      Mark Attendance
                    </Button>
                    */}
                  </View>
                </View>
              </Card.Content>
            </Card>
          </>
        ) : (
          <View style={styles.loader}>
            {mapError ? (
              <View>
                <Text style={styles.errorText}>Map couldn't be loaded</Text>
                <Text>Please check your Google Maps API key</Text>
              </View>
            ) : (
              <>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Fetching location...</Text>
              </>
            )}
          </View>
        )}
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  // FAB styles
  refreshFab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    top: 16,
    backgroundColor: 'white',
  },
  homeFab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 220,
    backgroundColor: '#4CAF50',
  },
  trackingFab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 150,
  },
  trackingButton: {
    backgroundColor: '#FF9800',
  },
  trackingActiveButton: {
    backgroundColor: '#E91E63',
  },
  // Bottom card styles
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  coordinatesBox: {
    flex: 1,
    paddingRight: 10,
  },
  actionBox: {
    flex: 1,
    paddingLeft: 10,
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  coordinatesText: {
    fontSize: 15,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  trackingText: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: 'bold',
    marginTop: 2,
  },
  employeeInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  punchButtonLabel: {
    fontSize: 12,
    margin: 0,
    color: 'white',
    fontWeight: 'bold',
  },
  employeeInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  attendanceButton: {
    marginTop: 10,
    borderRadius: 5,
    height: 50,
    paddingHorizontal: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  punchButton: {
    backgroundColor: '#2196F3',
  },
});

export default Setting;
