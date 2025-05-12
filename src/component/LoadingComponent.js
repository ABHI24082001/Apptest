import React from 'react';
import {Modal, View, StyleSheet, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';

const {width, height} = Dimensions.get('window');

const LoadingComponent = ({visible = false}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LottieView
          source={require('../lotti/loading.json')} // 👈 Replace with your Lottie file
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 100,
    height: 80,
  },
});

export default LoadingComponent;
