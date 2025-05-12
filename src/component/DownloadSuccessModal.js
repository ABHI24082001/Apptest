import React from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity, Platform} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DownloadSuccessModal = ({visible, onClose, fileName}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <LottieView
            source={require('../lotti/download.json')} // ✅ path to your lottie file
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.title}>Download Successful!</Text>
          <Text style={styles.subtitle}>{fileName} has been saved.</Text>

          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DownloadSuccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#6D75FF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
