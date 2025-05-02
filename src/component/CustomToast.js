import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const CustomToast = ({text1, text2, type}) => {
  return (
    <View style={[styles.container, typeStyles[type]]}>
      <Image
        source={
          type === 'success'
            ? require('../assets/image/check.png')
            : type === 'error'
            ? require('../assets/image/close.png')
            : require('../assets/image/info.png')
        }
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
};

const baseStyle = {
  padding: 15,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: {width: 0, height: 2},
  shadowRadius: 4,
  elevation: 4,
  marginHorizontal: 15,
  marginVertical: 5,
};

const typeStyles = {
  success: {backgroundColor: '#D1FAE5'},
  error: {backgroundColor: '#FECACA'},
  info: {backgroundColor: '#BFDBFE'},
};

const styles = StyleSheet.create({
  container: {
    ...baseStyle,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default CustomToast;
