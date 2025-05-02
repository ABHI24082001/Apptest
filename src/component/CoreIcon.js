import React from 'react';
import {StyleSheet} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Theme from '../constants/theme';

const IconMap = {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  Entypo,
};

export default function CoreIcon({
  name,
  type = 'MaterialIcons',
  size = 24,
  color = 'black',
  style = {}, // ✅ optional with default
  ...props
}) {
  const IconComponent = IconMap[type] || MaterialIcons;

  return (
    <IconComponent
      name={name}
      size={size}
      color={Theme.Colors[color] || color}
      style={[styles.icon, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    marginVertical: 4,
  },
});





// import React, {useState} from 'react';
// import {View, StyleSheet, Alert} from 'react-native';
// import CoreText from './src/component/CoreText';
// import CoreIcon from './src/component/CoreIcon';
// import CoreInput from './src/component/CoreInput';
// import {Button} from 'react-native-paper'; // or use your own CoreButton

// const App = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [secure, setSecure] = useState(true);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in both fields.');
//       return;
//     }

//     try {
//       // Simulated API call
//       const response = await fetch('https://reqres.in/api/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({email, password}),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert('Success', 'Login successful!');
//         console.log(data);
//       } else {
//         Alert.alert('Login Failed', data.error || 'Invalid credentials');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Something went wrong!');
//       console.error(error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CoreText font="extraBold" size="xl" color="primary">
//         🚀 Welcome Core UI
//       </CoreText>
//       <CoreText font="regular" size="lg" color="gray">
//         Login with your credentials
//       </CoreText>

//       <CoreInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         iconName="email"
//         iconType="MaterialIcons"
//         keyboardType="email-address"
//       />

//       <CoreInput
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         iconName="lock"
//         iconType="MaterialIcons"
//         rightIconName={secure ? 'eye-off' : 'eye'} // 👁️
//         rightIconType="Feather" // 🪶 now supported
//         onRightIconPress={() => setSecure(!secure)}
//         secureTextEntry={secure}
//       />

//       <Button mode="contained" onPress={handleLogin}>
//         Login
//       </Button>
//     </View>
//   );
// };

// export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F0F0F0',
//     paddingHorizontal: 20,
//   },
// });
