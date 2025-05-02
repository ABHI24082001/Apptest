import React, {useState} from 'react';
import {TextInput, StyleSheet, View, Pressable, Platform} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';

const IconMap = {
  MaterialIcons,
  AntDesign,
  FontAwesome,
  Ionicons,
  Entypo,
  Feather,
};

const InputField = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  leftIcon = '',
  leftIconType = 'MaterialIcons',
  rightIcon = '',
  rightIconType = 'MaterialIcons',
  rightIconOnPress = () => {}, // Made optional with default empty function
}) => {
  const [secure, setSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const LeftIconComponent = leftIcon ? IconMap[leftIconType] : null;
  const RightIconComponent = rightIcon ? IconMap[rightIconType] : null;

  const isPasswordField = rightIcon === 'eye';
  const showRightIcon = rightIcon && RightIconComponent;

  return (
    <View style={styles.container}>
      {/* Left Icon */}
      {LeftIconComponent && (
        <LeftIconComponent
          name={leftIcon}
          size={22}
          color={isFocused ? '#1D61E7' : '#888'}
          style={styles.leftIcon}
        />
      )}

      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          LeftIconComponent && {paddingLeft: 42},
          showRightIcon && {paddingRight: 42},
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888"
        keyboardType={keyboardType}
        secureTextEntry={isPasswordField ? secure : secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Right Icon */}
      {showRightIcon && (
        <Pressable
          style={styles.rightIcon}
          hitSlop={10}
          onPress={
            isPasswordField ? () => setSecure(prev => !prev) : rightIconOnPress
          }>
          <RightIconComponent
            name={
              isPasswordField
                ? secure
                  ? 'visibility-off'
                  : 'visibility'
                : rightIcon
            }
            size={22}
            color={isFocused ? '#1D61E7' : '#888'}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: Platform.OS === 'ios' ? 48 : 50,
    borderWidth: 1,
    borderColor: '#C5DCFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#F5F9FE',
    color: '#000',
  },
  inputFocused: {
    borderColor: '#1D61E7',
  },
  leftIcon: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 13 : 14,
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 13 : 14,
    right: 12,
    zIndex: 1,
  },
});

export default InputField;



// import {StyleSheet, View, Alert} from 'react-native';
// import React, {useState} from 'react';
// import InputField from './src/component/InputField';
// import Button from './src/component/Button';

// const App = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');

//   const handleLogin = async () => {
//     try {
//       const response = await fetch(
//         'https://jsonplaceholder.typicode.com/users/1',
//       );

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
//       Alert.alert('Login Success', `Welcome ${data.name}`);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       Alert.alert('Login Failed', 'Could not fetch user data');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <InputField
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//         leftIcon="email"
//         leftIconType="MaterialIcons"
//       />

//       <InputField
//         value={password}
//         onChangeText={setPassword}
//         placeholder="Password"
//         leftIcon="lock"
//         leftIconType="MaterialIcons"
//         rightIcon="eye"
//         secureTextEntry
//       />

//       <InputField
//         value={name}
//         onChangeText={setName}
//         placeholder="Full Name"
//        />

//       <Button title="Log In" onPress={handleLogin} />
//     </View>
//   );
// };

// export default App;

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     marginTop: 40,
//   },
// });
