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
import {Appbar, Button} from 'react-native-paper';
import FeedbackModal from '../component/FeedbackModal';
import { useForm, Controller } from 'react-hook-form';

const leaveData = [
  {label: 'CL', available: 10, used: 5},
  {label: 'PL', available: 8, used: 2},
  {label: 'SL', available: 4, used: 1},
  {label: 'ML', available: 10, used: 4},
  {label: 'EL', available: 6, used: 2},
  {label: 'WFH', available: 3, used: 1},
];

const ApplyLeaveScreen = ({navigation}) => {
  const [leaveDate, setLeaveDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const leaveScrollRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      leaveName: '',
      leaveType: '',
      appliedLeaveNo: 1,
      remark: '',
    },
  });

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

  const onSubmit = (data) => {
    console.log(data);
    setModalType('success');
    setModalMessage('Leave applied successfully!');
    setModalVisible(true);
  };

  const onError = (errors) => {
    console.log(errors);
    setModalType('fail');
    setModalMessage('Please fill all required fields correctly.');
    setModalVisible(true);
  };

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Apply Leave"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Icon name="calendar-account-outline" size={40} color="#3B82F6" />
            <Text style={styles.headerText}>Leave application</Text>
            <Text style={styles.subHeaderText}>
              Please fill in the details below to submit your leave request
            </Text>
          </View>

          {/* Leave Balance Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.leaveScrollContainer}
            ref={leaveScrollRef}>
            {leaveData.map(item => (
              <View key={item.label} style={styles.leaveCard}>
                <Text style={styles.leaveType}>{item.label}</Text>
                <Text style={styles.leaveInfo}>
                  Available: <Text style={styles.leaveBold}>{item.available}</Text>
                </Text>
                <Text style={styles.leaveInfo}>
                  Used: <Text style={styles.leaveBold}>{item.used}</Text>
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Leave Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Leave Name <Text style={styles.required}>*</Text>
                {errors.leaveName && (
                  <Text style={styles.errorText}> {errors.leaveName.message}</Text>
                )}
              </Text>
              <View style={styles.pickerContainer}>
                <Controller
                  control={control}
                  rules={{
                    required: 'This field is required',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <RNPickerSelect
                      onValueChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder={{label: 'Select Leave Name', value: ''}}
                      items={[
                        {label: 'Casual Leave', value: 'casual'},
                        {label: 'Sick Leave', value: 'sick'},
                        {label: 'Paid Leave', value: 'paid'},
                      ]}
                      style={pickerSelectStyles}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => <Icon name="chevron-down" size={20} color="#9CA3AF" />}
                    />
                  )}
                  name="leaveName"
                />
              </View>
            </View>

            {/* Leave Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Leave Type <Text style={styles.required}>*</Text>
                {errors.leaveType && (
                  <Text style={styles.errorText}> {errors.leaveType.message}</Text>
                )}
              </Text>
              <View style={styles.pickerContainer}>
                <Controller
                  control={control}
                  rules={{
                    required: 'This field is required',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <RNPickerSelect
                      onValueChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder={{label: 'Select Leave Type', value: ''}}
                      items={[
                        {label: 'Full Day', value: 'full'},
                        {label: 'Half Day', value: 'half'},
                      ]}
                      style={pickerSelectStyles}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => <Icon name="chevron-down" size={20} color="#9CA3AF" />}
                    />
                  )}
                  name="leaveType"
                />
              </View>
            </View>

            {/* Leave Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Leave Date</Text>
              <TouchableOpacity
                style={styles.dateInputWrapper}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}>
                <Icon 
                  name="calendar" 
                  size={20} 
                  color="#3B82F6" 
                  style={styles.dateIcon}
                />
                <Text style={styles.dateText}>
                  {moment(leaveDate).format('MMMM D, YYYY')}
                </Text>
                <Icon 
                  name="chevron-down" 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
              <DatePicker
                modal
                open={showDatePicker}
                date={leaveDate}
                mode="date"
                minimumDate={new Date()}
                onConfirm={date => {
                  setShowDatePicker(false);
                  setLeaveDate(date);
                }}
                onCancel={() => setShowDatePicker(false)}
                theme="light"
              />
            </View>

            {/* Applied Leave No */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Number of Days <Text style={styles.required}>*</Text>
                {errors.appliedLeaveNo && (
                  <Text style={styles.errorText}> {errors.appliedLeaveNo.message}</Text>
                )}
              </Text>
              <View style={styles.numberInputWrapper}>
                <Controller
                  control={control}
                  rules={{
                    required: 'This field is required',
                    min: {
                      value: 1,
                      message: 'Minimum 1 day required'
                    },
                    max: {
                      value: 30,
                      message: 'Maximum 30 days allowed'
                    }
                  }}
                  render={({ field: { value } }) => (
                    <>
                      <TouchableOpacity 
                        style={styles.numberButton}
                        onPress={() => setValue('appliedLeaveNo', Math.max(1, value - 1))}>
                        <Icon name="minus" size={20} color="#6B7280" />
                      </TouchableOpacity>
                      <Text style={styles.numberDisplay}>{value}</Text>
                      <TouchableOpacity 
                        style={styles.numberButton}
                        onPress={() => setValue('appliedLeaveNo', value + 1)}>
                        <Icon name="plus" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </>
                  )}
                  name="appliedLeaveNo"
                />
              </View>
            </View>

            {/* Supporting Document */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Supporting Document</Text>
              <TouchableOpacity 
                style={styles.uploadBox} 
                onPress={handleFilePick}
                activeOpacity={0.7}>
                <Icon name="file-upload-outline" size={22} color="#3B82F6" />
                <Text style={styles.uploadText}>
                  {uploadedFile ? 'Change Document' : 'Upload PDF'}
                </Text>
              </TouchableOpacity>
              {uploadedFile && (
                <View style={styles.filePreview}>
                  <Icon name="file-pdf-box" size={20} color="#EF4444" />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {uploadedFile.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Remark */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Reason <Text style={styles.required}>*</Text>
                {errors.remark && (
                  <Text style={styles.errorText}> {errors.remark.message}</Text>
                )}
              </Text>
              <Controller
                control={control}
                rules={{
                  required: 'This field is required',
                  maxLength: {
                    value: 200,
                    message: 'Maximum 200 characters allowed'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.textArea, errors.remark && styles.errorInput]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your reason for leave..."
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                  />
                )}
                name="remark"
              />
              <Text style={styles.charCount}>
                {watch('remark')?.length || 0}/200 characters
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit, onError)}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="send-check">
              Submit Request
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : undefined,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  leaveScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  leaveType: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#111827',
  },
  leaveInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
  leaveBold: {
    fontWeight: '700',
    color: '#111827',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 9,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'normal',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  numberInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
  },
  numberButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  numberDisplay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    padding: 14,
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileName: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    height: 120,
    lineHeight: 22,
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#111827',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#111827',
    paddingRight: 30,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  iconContainer: {
    top: '50%',
    right: 10,
    transform: [{ translateY: -10 }],
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default ApplyLeaveScreen;