import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LottieView from 'lottie-react-native';

const FeedbackModal = ({
  visible,
  onClose,
  type = 'success', // 'success' or 'fail'
  message = '',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <LottieView
            source={
              type === 'success'
                ? require('../lotti/Sucess.json')
                : require('../lotti/Fail.json')
            }
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
  },
  closeBtn: {
    backgroundColor: '#2962ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
