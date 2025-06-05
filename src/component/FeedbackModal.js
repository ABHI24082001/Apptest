import React, {useEffect} from 'react';
import {Modal, View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';

const FeedbackModal = ({
  visible,
  onClose,
  type = 'success', // 'success', 'fail', or 'deleted'
  message = '',
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <LottieView
            source={
              type === 'success'
                ? require('../lotti/Sucess.json')
                : type === 'fail'
                ? require('../lotti/Fail.json')
                : require('../lotti/deleted .json') // Corrected file name
            }
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.message}>{message}</Text>
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
    marginTop: 16,
  },
});
