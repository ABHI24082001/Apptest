import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import styles from './profileStyles';

const EditActions = ({isEditing, handleSave, setIsEditing}) => {
  if (!isEditing) return null;

  return (
    <View style={styles.editActions}>
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsEditing(false)}
        style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditActions;