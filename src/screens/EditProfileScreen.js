import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import postApi from './postApi';

const EditProfileScreen = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  onst[(maritalStatus, setMaritalStatus)] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const handleSaveProfile = async () => {
    const profileData = {
      bloodGroup,
      maritalStatus,
      bankName,
      accountNumber,
      ifscCode,
    };
    await postApi('/saveProfile', profileData);
    console.log('Profile saved:', profileData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Blood Group:</Text>
      <TextInput
        style={styles.input}
        value={bloodGroup}
        onChangeText={setBloodGroup}
        placeholder="Enter Blood Group"
      />

      <Text style={styles.label}>Marital Status:</Text>
      <TextInput
        style={styles.input}
        value={maritalStatus}
        onChangeText={setMaritalStatus}
        placeholder="Enter Marital Status"
      />

      <Text style={styles.label}>Bank Name:</Text>
      <TextInput
        style={styles.input}
        value={bankName}
        onChangeText={setBankName}
        placeholder="Enter Bank Name"
      />

      <Text style={styles.label}>Account Number:</Text>
      <TextInput
        style={styles.input}
        value={accountNumber}
        onChangeText={setAccountNumber}
        placeholder="Enter Account Number"
        keyboardType="numeric"
      />

      <Text style={styles.label}>IFSC Code:</Text>
      <TextInput
        style={styles.input}
        value={ifscCode}
        onChangeText={setIfscCode}
        placeholder="Enter IFSC Code"
      />

      <Button title="Save Profile" onPress={handleSaveProfile} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default EditProfileScreen;
