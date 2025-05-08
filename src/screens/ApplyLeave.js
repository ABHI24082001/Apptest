import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';

import { pick } from '@react-native-documents/picker';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import AppSafeArea from '../component/AppSafeArea';
import {Card, Appbar} from 'react-native-paper';

const ApplyLeaveScreen = ({ navigation }) => { // Accept navigation prop here
  const [leaveName, setLeaveName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appliedLeaveNo, setAppliedLeaveNo] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      const [file] = await pick({
        type: ['application/pdf'],
      });
      if (file) {
        setUploadedFile(file);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('File pick error:', err);
      }
    }
  };

  return (
    <AppSafeArea>

<Appbar.Header elevated style={styles.header}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Payment Request List"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header> 
      
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          

          {/* Leave Name */}
          <Text style={styles.label}>Leave Name*</Text>
          <RNPickerSelect
            onValueChange={(value) => setLeaveName(value)}
            value={leaveName}
            placeholder={{ label: 'Select Leave Name', value: '' }}
            items={[
              { label: 'Casual Leave', value: 'casual' },
              { label: 'Sick Leave', value: 'sick' },
              { label: 'Paid Leave', value: 'paid' },
            ]}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />

          {/* Leave Type */}
          <Text style={styles.label}>Leave Type*</Text>
          <RNPickerSelect
            onValueChange={(value) => setLeaveType(value)}
            value={leaveType}
            placeholder={{ label: 'Select Leave Type', value: '' }}
            items={[
              { label: 'Full Day', value: 'full' },
              { label: 'Half Day', value: 'half' },
            ]}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />

          {/* Leave Date */}
          <Text style={styles.label}>Leave Date*</Text>
          <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.inputText}>
              {moment(leaveDate).format('DD-MM-YYYY')}
            </Text>
            <Icon name="calendar" size={22} color="#555" />
          </TouchableOpacity>

          <DatePicker
            modal
            open={showDatePicker}
            date={leaveDate}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setLeaveDate(date);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
          />

          {/* Applied Leave No */}
          <Text style={styles.label}>Applied Leave No.*</Text>
          <TextInput
            style={styles.textInput}
            value={appliedLeaveNo.toString()}
            editable={true}
          />

          {/* Upload PDF */}
          <Text style={styles.label}>Supporting Document (.pdf)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handleFilePick}>
            <Icon name="file-upload-outline" size={22} color="#666" />
            <Text style={styles.uploadText}>Upload PDF</Text>
          </TouchableOpacity>

          {/* File Preview */}
          {uploadedFile && (
            <View style={styles.previewBox}>
              <Icon name="file-pdf-box" size={24} color="#d32f2f" />
              <Text style={styles.previewText}>{uploadedFile.name}</Text>
            </View>
          )}

          {/* Submit & Cancel Buttons */}
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
     
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  inputText: {
    color: '#000',
    fontSize: 14,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000',
    marginBottom: 16,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 24,
  },
  previewText: {
    marginLeft: 8,
    color: '#444',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#2962ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '500',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#000',
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#000',
    marginBottom: 16,
  },
});

export default ApplyLeaveScreen;
