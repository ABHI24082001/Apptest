import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const OnboardingScreen = ({navigation}) => {
  return (
    <LinearGradient
      colors={['#A16CF8', '#6B4CF8']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Cards */}
      <View style={styles.cardsContainer}>
        {/* <Image
          source={require('../assets/image/onboarding-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        /> */}
      </View>

      {/* Text Section */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to Cloudtree!</Text>
        <Text style={styles.subtitle}>
          Make Smart Decisions! Set clear timelines for projects and celebrate
          your achievements!
        </Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('NextScreen')}>
          <LinearGradient
            colors={['#8E2DE2', '#4A00E0']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.nextGradient}>
            <Text style={styles.nextText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
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
  },
  cardsContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  illustration: {
    width: 320,
    height: 350,
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#f3eaff',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c4b5fd',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  buttonContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  nextButton: {
    width: 250,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  skipText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default OnboardingScreen;
