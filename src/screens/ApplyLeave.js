import React, {useState, useRef} from 'react';
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
import {pick} from '@react-native-documents/picker';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import AppSafeArea from '../component/AppSafeArea';
import {Card, Appbar} from 'react-native-paper';
import FeedbackModal from '../component/FeedbackModal';

const leaveData = [
  {label: 'CL', available: 10, used: 5},
  {label: 'PL', available: 8, used: 2},
  {label: 'SL', available: 4, used: 1},
  {label: 'ML', available: 10, used: 4},
  {label: 'EL', available: 6, used: 2},
  {label: 'WFH', available: 3, used: 1},
];

const ApplyLeaveScreen = ({navigation}) => {
  const [leaveName, setLeaveName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appliedLeaveNo, setAppliedLeaveNo] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const leaveScrollRef = useRef(null);
  const [remark, setRemark] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');

  const handleFilePick = async () => {
    try {
      const [file] = await pick({type: ['application/pdf']});
      if (file) setUploadedFile(file);
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('File pick error:', err);
      }
    }
  };

  const handleSubmit = () => {
    if (!leaveName) {
      setModalType('fail');
      setModalMessage('Please select a leave name.');
      setModalVisible(true);
      return;
    }

    if (!leaveType) {
      setModalType('fail');
      setModalMessage('Please select a leave type.');
      setModalVisible(true);
      return;
    }

    // All good - show success
    setModalType('success');
    setModalMessage('Leave applied successfully!');
    setModalVisible(true);

    // You can also perform API call here
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Apply Leave" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Horizontal Leave Balance UI */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.leaveScrollContainer}
          ref={leaveScrollRef}>
          {leaveData.map(item => (
            <View key={item.label} style={styles.leaveCard}>
              <Text style={styles.leaveType}>{item.label}</Text>
              <Text style={styles.leaveInfo}>
                Available:{' '}
                <Text style={styles.leaveBold}>{item.available}</Text>
              </Text>
              <Text style={styles.leaveInfo}>
                Used: <Text style={styles.leaveBold}>{item.used}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Leave Name */}
        <Text style={styles.label}>Leave</Text>
        <RNPickerSelect
          onValueChange={value => setLeaveName(value)}
          value={leaveName}
          placeholder={{label: 'Select Leave Name', value: ''}}
          items={[
            {label: 'Casual Leave', value: 'casual'},
            {label: 'Sick Leave', value: 'sick'},
            {label: 'Paid Leave', value: 'paid'},
          ]}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
        />

        {/* Leave Type */}
        <Text style={styles.label}>Leave Type*</Text>
        <RNPickerSelect
          onValueChange={value => setLeaveType(value)}
          value={leaveType}
          placeholder={{label: 'Select Leave Type', value: ''}}
          items={[
            {label: 'Full Day', value: 'full'},
            {label: 'Half Day', value: 'half'},
          ]}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
        />

        {/* Leave Date */}
        <Text style={styles.label}>Leave Date*</Text>
        <TouchableOpacity
          style={styles.inputWithIcon}
          onPress={() => setShowDatePicker(true)}>
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
          onConfirm={date => {
            setShowDatePicker(false);
            setLeaveDate(date);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Applied Leave No */}
        <Text style={styles.label}>Applied Leave No.*</Text>
        <TextInput
          style={styles.textInput}
          value={appliedLeaveNo.toString()}
          editable={true}
        />

        {/* Upload PDF */}
        <Text style={styles.label}>Supporting Document (.pdf,jpg)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={handleFilePick}>
          <Icon name="file-upload-outline" size={22} color="#666" />
          <Text style={styles.uploadText}>Upload PDF</Text>
        </TouchableOpacity>

        {/* Remark */}
        <Text style={styles.label}>Remark</Text>
        <TextInput
          style={[styles.textInput, {height: 100, textAlignVertical: 'top'}]}
          value={remark}
          onChangeText={setRemark}
          placeholder="Enter any remarks (optional)"
          placeholderTextColor={'#000'}
          multiline={true}
        />

        {/* File Preview */}
        {uploadedFile && (
          <View style={styles.previewBox}>
            <Icon name="file-pdf-box" size={24} color="#d32f2f" />
            <Text style={styles.previewText}>{uploadedFile.name}</Text>
          </View>
        )}

        {/* Submit & Cancel Buttons */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal
        visible={modalVisible}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
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
  leaveScrollContainer: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  leaveCard: {
    backgroundColor: '#f2f4f7',
    borderRadius: 10,
    padding: 14,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  leaveType: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  leaveInfo: {
    fontSize: 13,
    color: '#555',
  },
  leaveBold: {
    fontWeight: 'bold',
    color: '#000',
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
    paddingRight: 30, // space for icon
  },
  inputAndroid: {
    fontSize: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#000',
    marginBottom: 16,
    paddingRight: 30, // space for icon
  },
  iconContainer: {
    top: Platform.OS === 'android' ? 20 : 16,
    right: 12,
  },
});

export default ApplyLeaveScreen;
