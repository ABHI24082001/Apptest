import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {Controller} from 'react-hook-form';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HookFormInput = ({
  control,
  name,
  placeholder,
  rules = {},
  secureTextEntry = false,
  leftIcon = null,
  rightIcon = null,
  rightIconOnPress = null,
  leftIconOnPress = null,
  keyboardType = 'default',
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
        <>
          <View
            style={[
              styles.inputContainer,
              !!error && {borderColor: '#f44336'},
            ]}>
            {/* Left Icon */}
            {leftIcon && (
              <TouchableOpacity
                onPress={leftIconOnPress}
                style={styles.leftIconWrapper}
                disabled={!leftIconOnPress}>
                {typeof leftIcon === 'string' ? (
                  <MaterialCommunityIcons
                    name={leftIcon}
                    size={22}
                    color={error ? '#f44336' : '#666'}
                  />
                ) : (
                  leftIcon
                )}
              </TouchableOpacity>
            )}

            {/* Text Input */}
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#999"
              style={[
                styles.input,
                leftIcon && {paddingLeft: 10}, // Add padding if left icon exists
              ]}
              secureTextEntry={secureTextEntry}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              underlineColorAndroid="transparent"
              keyboardType={keyboardType}
            />

            {/* Right Icon */}
            {rightIcon && (
              <TouchableOpacity
                onPress={rightIconOnPress}
                style={styles.rightIconWrapper}>
                {typeof rightIcon === 'string' ? (
                  <MaterialCommunityIcons
                    name={rightIcon}
                    size={22}
                    color={error ? '#f44336' : '#666'}
                  />
                ) : (
                  rightIcon
                )}
              </TouchableOpacity>
            )}
          </View>

          {error && (
            <Text style={styles.errorText}>{error.message || 'Error'}</Text>
          )}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 50,
    marginBottom: 16,
    paddingRight: 10,
    paddingLeft: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  leftIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconWrapper: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 13,
    marginTop: -10,
    marginBottom: 10,
    paddingLeft: 4,
  },
});

export default HookFormInput;