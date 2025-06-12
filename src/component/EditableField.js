import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Divider} from 'react-native-paper';
import styles from './profileStyles';

const EditableField = ({
  icon,
  label,
  value,
  editable,
  isEditing,
  editedFields,
  setEditedFields,
  onEdit,
}) => (
  <View key={label} style={styles.row}>
    <Icon name={icon} size={20} color="#666" style={styles.icon} />
    <View style={styles.textWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.editInput}
          value={editedFields[label] !== undefined ? editedFields[label] : value}
          onChangeText={text => setEditedFields({...editedFields, [label]: text})}
        />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
    {editable && !isEditing && (
      <TouchableOpacity onPress={() => onEdit(label)} style={styles.editIcon}>
        <View style={styles.editIconContainer}>
          <Icon name="pencil" size={20} color="#3B82F6" />
        </View>
      </TouchableOpacity>
    )}
    <Divider style={{marginVertical: 4}} />
  </View>
);

export default EditableField;