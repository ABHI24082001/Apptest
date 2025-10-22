import React, {useState} from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Dimensions,
  Platform
} from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const OnboardingScreen = ({navigation}) => {
  const [step, setStep] = useState(0); // 0, 1, 2

  const handleNext = () => {
    if (step < 2) {
      setStep(prev => prev + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const getLottieFile = () => {
    switch (step) {
      case 0:
        return require('../lotti/HR.json');
      case 1:
        return require('../lotti/HR1.json');
      case 2:
        return require('../lotti/HR2.json');
      default:
        return require('../lotti/HR.json');
    }
  };

  const getTitle = () => {
    return [
      'Welcome to Cloudtree ESS',
      'Empower Your Workforce',
      'Seamless Attendance Management',
    ][step];
  };
  
  const getSubtitle = () => {
    return [
      'Your trusted HRMS solution for efficient employee self-service.',
      'Streamline HR tasks with smart tools for employees and managers.',
      'Track time, manage shifts, and generate reports effortlessly.',
    ][step];
  };

  return (
    <LinearGradient
      colors={['#1E40AF', '#2563EB', '#3B82F6']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Lottie Animation */}
      <View style={styles.animationContainer}>
        <LottieView
          source={getLottieFile()}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Text Section */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map(index => (
          <View
            key={index}
            style={[
              styles.dot,
              step === index ? styles.dotActive : null,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}>
          <LinearGradient
            colors={['#1E3A8A', '#2563EB']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.nextGradient}>
            <Text style={styles.nextText}>
              {step < 2 ? 'Next' : 'Get Started'}
            </Text>
            <Icon name="arrow-forward-ios" size={16} color="#fff" style={styles.nextIcon} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  animationContainer: {
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  buttonContainer: {
    marginTop: 50,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  nextButton: {
    width: 250,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 16,
  },
  nextGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 6,
  },
  nextIcon: {
    marginTop: 1,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default OnboardingScreen;
