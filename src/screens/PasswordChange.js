import React from 'react';
import {View, StyleSheet, TouchableOpacity , Image} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import CoreText from '../component/CoreText'; // adjust path
import CoreButton from '../component/Button'; // custom button component

const PasswordChangedScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Center Content */}
      <View style={styles.centerContent}>
        <View style={styles.circle}>
          <Icon name="check" size={36} color="#2E6CF6" />
        </View>

        <CoreText size="xl" color="primary" style={styles.title}>
          Password Changed
        </CoreText>

        <CoreButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
          style={styles.loginButton}
        />
      </View>

      {/* Footer */}
     <View style={styles.footerContainer}>
             <CoreText style={styles.footerText}>Powered By</CoreText>
             <Image
               source={require('../assets/image/logo.png')}
               style={styles.footerLogo}
               resizeMode="contain"
             />
           </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2E6CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 30,
  },
  loginButton: {
    paddingHorizontal: 60,
  },
 footerContainer: {
     position: 'absolute',
     bottom: Platform.OS === 'ios' ? 40 : 40,
     left: 0,
     right: 0,
     flexDirection: 'row',
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 20,
   },
   footerText: {
     fontSize: 14,
     marginRight: 10,
     fontWeight: 'bold',
   },
   footerLogo: {
     width: 120,
     height: 120,
   },
});

export default PasswordChangedScreen;
