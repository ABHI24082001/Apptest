import React, {useEffect, useState} from 'react';
import {Modal, View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import LottieView from 'lottie-react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: screenWidth} = Dimensions.get('window');

const FeedbackModal = ({
  visible,
  onClose,
  type = 'success', // 'success', 'fail', 'deleted', 'warning', 'info'
  message = '',
  title = '',
  autoClose = true,
  duration = 3000,
  showCloseButton = false,
  customIcon = null,
  customColor = null,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
    }
  }, [visible, onClose, autoClose, duration]);

  const getTypeConfig = () => {
    const configs = {
      success: {
        animation: require('../lotti/Sucess.json'),
        color: '#10B981',
        backgroundColor: '#ECFDF5',
        borderColor: '#6EE7B7',
        title: title || 'Success!',
        iconName: 'check-circle',
      },
      fail: {
        animation: require('../lotti/Fail.json'),
        color: '#EF4444',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        title: title || 'Error!',
        iconName: 'close-circle',
      },
      deleted: {
        animation: require('../lotti/deleted .json'),
        color: '#F59E0B',
        backgroundColor: '#FFFBEB',
        borderColor: '#FCD34D',
        title: title || 'Deleted!',
        iconName: 'delete',
      },
      warning: {
        animation: null,
        color: '#F59E0B',
        backgroundColor: '#FFFBEB',
        borderColor: '#FCD34D',
        title: title || 'Warning!',
        iconName: 'alert-circle',
      },
      info: {
        animation: null,
        color: '#3B82F6',
        backgroundColor: '#EFF6FF',
        borderColor: '#93C5FD',
        title: title || 'Information',
        iconName: 'information',
      },
    };

    return configs[type] || configs.success;
  };

  const getSizeConfig = () => {
    const configs = {
      small: {
        modalWidth: screenWidth * 0.7,
        lottieSize: 80,
        titleSize: 16,
        messageSize: 14,
        padding: 16,
      },
      medium: {
        modalWidth: screenWidth * 0.8,
        lottieSize: 120,
        titleSize: 18,
        messageSize: 16,
        padding: 20,
      },
      large: {
        modalWidth: screenWidth * 0.9,
        lottieSize: 160,
        titleSize: 20,
        messageSize: 18,
        padding: 24,
      },
    };

    return configs[size] || configs.medium;
  };

  const typeConfig = getTypeConfig();
  const sizeConfig = getSizeConfig();

  const handleBackdropPress = () => {
    if (!autoClose) {
      onClose();
    }
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity 
          activeOpacity={1}
          style={[
            styles.modalBox,
            {
              width: sizeConfig.modalWidth,
              padding: sizeConfig.padding,
              backgroundColor: customColor ? `${customColor}10` : typeConfig.backgroundColor,
              borderColor: customColor || typeConfig.borderColor,
            }
          ]}
        >
          {/* Close button */}
          {showCloseButton && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcon 
                name="close" 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          )}

          {/* Animation or Icon */}
          {customIcon ? (
            <View style={[styles.iconContainer, {backgroundColor: (customColor || typeConfig.color) + '20'}]}>
              {customIcon}
            </View>
          ) : typeConfig.animation ? (
            <LottieView
              source={typeConfig.animation}
              autoPlay={isAnimating}
              loop={false}
              style={[
                styles.lottie,
                {
                  width: sizeConfig.lottieSize,
                  height: sizeConfig.lottieSize,
                }
              ]}
            />
          ) : (
            <View style={[
              styles.iconContainer, 
              {backgroundColor: (customColor || typeConfig.color) + '20'}
            ]}>
              <MaterialIcon 
                name={typeConfig.iconName} 
                size={sizeConfig.lottieSize * 0.4} 
                color={customColor || typeConfig.color} 
              />
            </View>
          )}

          {/* Title */}
          {typeConfig.title && (
            <Text style={[
              styles.title,
              {
                fontSize: sizeConfig.titleSize,
                color: customColor || typeConfig.color,
              }
            ]}>
              {typeConfig.title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text style={[
              styles.message,
              {fontSize: sizeConfig.messageSize}
            ]}>
              {message}
            </Text>
          )}

          {/* Progress indicator for auto-close */}
          {autoClose && visible && (
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: customColor || typeConfig.color,
                    animationDuration: `${duration}ms`,
                  }
                ]} 
              />
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lottie: {
    marginBottom: 8,
  },
  iconContainer: {
    borderRadius: 60,
    padding: 20,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  message: {
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
    transform: [{scaleX: 0}],
    transformOrigin: 'left',
    // Note: CSS-like animation would need to be implemented with Animated API for React Native
  },
});
