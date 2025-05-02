import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import CoreText from './CoreText';
import CustomButton from './Button';
import Icon from 'react-native-vector-icons/Feather';

const iconMap = {
    success: {
      uri: 'https://cdn-icons-png.flaticon.com/512/845/845646.png',
    },
    fail: {
      uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828665.png',
    },
    empty: {
      uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png',
    },
    noData: {
      uri: 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png',
    },
  };
  

const StatusModal = ({
  visible,
  onClose,
  status = 'success', // 'success' | 'fail' | 'empty' | 'noData'
  title = '',
  subtitle = '',
  buttonText = 'Okay',
  onButtonPress,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={iconMap[status] || iconMap.success}

            style={styles.icon}
            resizeMode="contain"
          />

          {title ? (
            <CoreText font="bold" size="xl" style={styles.title}>
              {title}
            </CoreText>
          ) : null}

          {subtitle ? (
            <CoreText size="md" color="muted" style={styles.subtitle}>
              {subtitle}
            </CoreText>
          ) : null}

          <CustomButton
            title={buttonText}
            onPress={onButtonPress || onClose}
            buttonStyle={styles.button}
          />

          <Pressable onPress={onClose}>
            <CoreText size="sm" color="primary" style={styles.secondaryText}>
              Close
            </CoreText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 45,
    marginBottom: 10,
  },
  secondaryText: {
    textAlign: 'center',
    marginTop: 5,
  },
});
