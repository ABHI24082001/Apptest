import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const OnboardingScreen = ({navigation}) => {
  const handleNext = () => {
    navigation.navigate('Splash3');
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Lottie Animation */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../lotti/HR.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text variant="titleLarge" style={styles.title}>
          Welcome to Surf.
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Get essential tools and inspiration for your HR designs.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dot Indicators */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Controls */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>Next</Text>
            <Icon name="arrow-forward-ios" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 60 : 0,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  lottie: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  buttonsContainer: {
    margin: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#888',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 6,
    fontWeight: '500',
  },
});
