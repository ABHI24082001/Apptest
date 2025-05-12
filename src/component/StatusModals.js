import React, {useEffect} from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatusModal = ({visible, onClose, type = 'success', title, subtitle}) => {
  useEffect(() => {
    if (visible) {
      playSound(type);
    }
  }, [visible]);

  const playSound = (statusType) => {
    const soundFile = statusType === 'success' ? 'success.mp3' : 'fail.mp3';
    const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      sound.play(() => sound.release());
    });
  };

  const lottieSource =
    type === 'success'
      ? require('../lotti/Sucess.json')
      : require('../lotti/Fail.json');

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <LottieView
            source={lottieSource}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#999',
    padding: 6,
    borderRadius: 20,
  },
});

export default StatusModal;
