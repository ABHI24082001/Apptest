import React from 'react';
import {StyleSheet} from 'react-native';
import {TextInput} from 'react-native-paper';

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
  Feather
};

export default function CoreInput({
  value,
  onChangeText,
  placeholder,
  iconName = '' , // ✅ optional
  iconType = 'MaterialIcons',
  rightIconName = '', // ✅ optional
  rightIconType = 'MaterialIcons',
  onRightIconPress = () => {},
  secureTextEntry = false,
  keyboardType = 'default',
  style = {},
  ...rest
}) {
  const LeftIconComponent = IconMap[iconType] || MaterialIcons;
  const RightIconComponent = IconMap[rightIconType] || MaterialIcons;

  const renderLeftIcon = iconName
    ? () => <LeftIconComponent name={iconName} size={20} color="#777" />
    : undefined;

  const renderRightIcon = rightIconName
    ? () => <RightIconComponent name={rightIconName} size={20} color="#777" />
    : undefined;

  return (
    <TextInput
      mode="outlined"
      label={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={[styles.input, style]}
      left={iconName ? <TextInput.Icon icon={renderLeftIcon} /> : null}
      right={
        rightIconName ? (
          <TextInput.Icon icon={renderRightIcon} onPress={onRightIconPress} />
        ) : null
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '90%',
    marginVertical: 10,
  },
});
