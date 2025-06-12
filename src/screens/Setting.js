import React, {useEffect, useState, useRef} from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Setting = ({navigation}) => {
  const handleTrackLocation = () => {
    navigation.navigate('Mylocation');
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.container}>
        <TouchableOpacity style={styles.rowCard} onPress={handleTrackLocation} activeOpacity={0.8}>
          <View style={styles.rowCardContent}>
            <Icon name="my-location" size={28} color="#2196F3" style={styles.rowCardIcon} />
            <Text style={styles.rowCardText}>Track your location</Text>
          </View>
          <Icon name="keyboard-arrow-right" size={28} color="#888" />
        </TouchableOpacity>
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
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
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
  },
  rowCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCardIcon: {
    marginRight: 16,
  },
  rowCardText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
});

export default Setting;
