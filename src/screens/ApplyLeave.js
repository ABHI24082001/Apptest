import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Appbar } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import FeedbackModal from '../component/FeedbackModal';
import LeaveBalance from '../component/LeaveBalance';
import GlobalPicker from '../component/GlobalPicker';
import LeaveDatePicker from '../component/LeaveDatePicker';
import AppliedLeaveNo from '../component/AppliedLeaveNo';
import UploadFile from '../component/UploadFile';
import RemarkInput from '../component/RemarkInput';

const leaveData = [
  { label: 'CL', available: 10, used: 5 },
  { label: 'PL', available: 8, used: 2 },
  { label: 'SL', available: 4, used: 1 },
  { label: 'ML', available: 10, used: 4 },
  { label: 'EL', available: 6, used: 2 },
  { label: 'WFH', available: 3, used: 1 },
];

const ApplyLeaveScreen = ({ navigation }) => {
  const [leaveName, setLeaveName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appliedLeaveNo, setAppliedLeaveNo] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [remark, setRemark] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = () => {
    if (!leaveName || !leaveType) {
      setModalType('fail');
      setModalMessage(!leaveName ? 'Please select a leave name.' : 'Please select a leave type.');
      setModalVisible(true);
      return;
    }

    // Proceed with submission logic here
    setModalType('success');
    setModalMessage('Leave applied successfully!');
    setModalVisible(true);
  };

  const handleFilePick = async () => {
    // File picking logic goes here
    // Dummy file for demonstration
    setUploadedFile({ name: 'example.pdf' });
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Apply Leave" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <LeaveBalance leaveData={leaveData} />

        <Text style={styles.label}>Leave Name*</Text>
        <GlobalPicker
          value={leaveName}
          setValue={setLeaveName}
          placeholder={{ label: 'Select Leave Name', value: '' }}
          items={[
            { label: 'Casual Leave', value: 'casual' },
            { label: 'Sick Leave', value: 'sick' },
            { label: 'Paid Leave', value: 'paid' },
          ]}
        />

        <Text style={styles.label}>Leave Type*</Text>
        <GlobalPicker
          value={leaveType}
          setValue={setLeaveType}
          placeholder={{ label: 'Select Leave Type', value: '' }}
          items={[
            { label: 'Full Day', value: 'full' },
            { label: 'Half Day', value: 'half' },
          ]}
        />

        <LeaveDatePicker
          leaveDate={leaveDate}
          setLeaveDate={setLeaveDate}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
        />

        <AppliedLeaveNo
          appliedLeaveNo={appliedLeaveNo}
          setAppliedLeaveNo={setAppliedLeaveNo}
        />

        <UploadFile
          handleFilePick={handleFilePick}
          uploadedFile={uploadedFile}
        />

        <RemarkInput
          remark={remark}
          setRemark={setRemark}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  submitBtn: {
    backgroundColor: '#2962ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ApplyLeaveScreen;
