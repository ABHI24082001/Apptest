import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import EditableField from './EditableField';
import styles from './profileStyles';

const ProfileSection = ({
  title,
  icon,
  data,
  isEditing,
  editedFields,
  setEditedFields,
  onEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleSection = () => {
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 1, {duration: 300});
    height.value = withTiming(isOpen ? 0 : 1, {duration: 300});
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg`},
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    height: interpolate(
      height.value,
      [0, 1],
      [0, data.length * 60 + (data.length - 1) * 4],
      Extrapolate.CLAMP,
    ),
    opacity: height.value,
    overflow: 'hidden',
  }));

  return (
    <Card style={styles.sectionCard}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon
              name={icon}
              size={22}
              color="#333"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Animated.View style={iconStyle}>
            <Icon name="chevron-down" size={24} color="#333" />
          </Animated.View>
        </View>
      </TouchableOpacity>
      <Animated.View style={contentStyle}>
        <View style={styles.sectionContent}>
          {data.map(item => (
            <EditableField
              key={item.label}
              {...item}
              isEditing={isEditing}
              editedFields={editedFields}
              setEditedFields={setEditedFields}
              onEdit={onEdit}
            />
          ))}
        </View>
      </Animated.View>
    </Card>
  );
};

export default ProfileSection;