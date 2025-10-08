// GeoFenceChecker.js
import React, { useState } from 'react';
import { View, Text, Button, Platform, PermissionsAndroid, Alert, ScrollView } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import * as geolib from 'geolib';

const API_URL = 'http://192.168.29.2:91/api/GeoFencing/getGeoLocationDetailsByEmployeeId/29/2';

async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission',
        message: 'Allow app to access your location to check geo-fencing',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  // iOS: Info.plist must contain the usage key; the system will automatically prompt
  return true;
}

// Promisify the callback-based geolocation API
function getCurrentPositionPromise(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }) {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      options
    );
  });
}

// safe parse helpers
function safeParseFloat(val, fallback = NaN) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

export default function GeoFenceChecker() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const checkGeoFences = async () => {
    try {
      setStatus('requesting-permission');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission denied', 'Location permission is required.');
        setStatus('permission-denied');
        return;
      }

      setStatus('getting-location');
      const pos = await getCurrentPositionPromise({ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
      const current = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setStatus('fetching-fences');
      const res = await axios.get(API_URL); // returns array
      const fences = Array.isArray(res.data) ? res.data : [];

      // iterate fences, compute distance, check inside
      const matches = [];
      let nearest = null;

      for (const f of fences) {
        // NOTE: your API uses "lattitude" (double t) in the sample. handle both keys.
        const lat = safeParseFloat(f.lattitude ?? f.latitude ?? f.lat, NaN);
        const lon = safeParseFloat(f.longitude ?? f.long ?? f.lng, NaN);
        let radiusMeters = safeParseFloat(f.radius ?? f.Radius ?? f.radiusInMeters, NaN);

        // if radius is empty / NaN, fall back to a default (e.g., 50m)
        if (!Number.isFinite(radiusMeters)) radiusMeters = 50;

        // If your radius in DB is kilometers, multiply by 1000 here:
        // e.g. if (f.radiusUnit === 'km') radiusMeters *= 1000;

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          console.warn('Invalid fence coords', f);
          continue;
        }

        const distance = geolib.getDistance(
          { latitude: current.latitude, longitude: current.longitude },
          { latitude: lat, longitude: lon }
        ); // returns meters

        const inside = distance <= radiusMeters;
        const fenceInfo = { fence: f, lat, lon, radiusMeters, distance, inside };

        if (inside) matches.push(fenceInfo);
        if (!nearest || distance < nearest.distance) nearest = fenceInfo;
      }

      setResult({ current, matches, nearest, fetchedCount: fences.length });
      setStatus('done');
    } catch (err) {
      console.error('checkGeoFences error', err);
      setStatus('error');
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ marginBottom: 8 }}>Status: {status}</Text>
      <Button title="Check Current Location vs GeoFences" onPress={checkGeoFences} />

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text>Current: {result.current.latitude}, {result.current.longitude}</Text>
          <Text>GeoFences fetched: {result.fetchedCount}</Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>Nearest fence:</Text>
            {result.nearest ? (
              <>
                <Text>Name: {result.nearest.fence.geoLocationName}</Text>
                <Text>Distance: {Math.round(result.nearest.distance)} m</Text>
                <Text>Radius: {result.nearest.radiusMeters} m</Text>
                <Text>Inside: {result.nearest.inside ? 'YES' : 'NO'}</Text>
              </>
            ) : (
              <Text>No fences found</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>Matched fences (inside):</Text>
            {result.matches.length ? (
              result.matches.map((m, i) => (
                <View key={i} style={{ marginTop: 8 }}>
                  <Text>{m.fence.geoLocationName} — {Math.round(m.distance)} m / {m.radiusMeters} m</Text>
                  <Text>Address: {m.fence.address}</Text>
                </View>
              ))
            ) : (
              <Text>None</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
