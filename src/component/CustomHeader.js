import React from 'react';
import {TouchableOpacity, StatusBar, View, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Appbar} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomHeader = ({
  title,
  navigation,
  showBackButton = true,
  showHomeButton = true,
  onBackPress,
  onHomePress,
  style,
  titleStyle,
  backButtonStyle,
  homeButtonStyle,
  rightComponent, // Add rightComponent prop
  gradientColors = ['#2568f7ff', '#1c72fcff'],
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Platform.OS === 'ios' ? 'transparent' : '#1861ffe2'}
        translucent={true}
      />
      <SafeAreaView style={{ backgroundColor: gradientColors[0] }} edges={['top']}>
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 1}}
          end={{x: 0, y: 0}}
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              minHeight: 56,
            }}>
            {/* Left Button Container */}
            <View style={{width: 40, alignItems: 'flex-start'}}>
              {showBackButton && (
                <TouchableOpacity
                  onPress={handleBackPress}
                  style={[
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backdropFilter: 'blur(10px)',
                    },
                    backButtonStyle,
                  ]}
                  activeOpacity={0.7}>
                  <Icon name="chevron-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Title Container */}
            <View style={{flex: 1, justifyContent: 'center',}}>
              <Appbar.Content
                title={title}
                titleStyle={[
                  {
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '800',
                    textTransform: 'capitalize',
                    marginHorizontal: 12,
                    marginVertical: 4,           
                    letterSpacing: 0.5,
                  },
                  titleStyle,
                ]}
              />
            </View>

            {/* Right Button Container */}
            <View style={{width: 80, alignItems: 'flex-end'}}>
              {rightComponent ? (
                rightComponent
              ) : showHomeButton ? (
                <TouchableOpacity
                  style={[
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backdropFilter: 'blur(10px)',
                    },
                    homeButtonStyle,
                  ]}
                  onPress={handleHomePress}
                  activeOpacity={0.7}>
                  <Icon name="home-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default CustomHeader;
