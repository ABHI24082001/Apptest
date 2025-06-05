import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActionSheetIOS,
  ActivityIndicator
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useForm, Controller} from 'react-hook-form';
import axios from 'axios';
import AppSafeArea from '../component/AppSafeArea';
import {Appbar, Button} from 'react-native-paper';
import LeaveHeader from '../component/LeaveHeader';
import LeaveBalanceCards from '../component/LeaveBalanceCards';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {pick} from '@react-native-documents/picker';
import { Platform } from 'react-native';

import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import FeedbackModal from '../component/FeedbackModal';

const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api'; 
const BASE_URL_LOCAL = 'http://192.168.29.2:90/api/'; 

const ApplyLeaveScreen = ({ navigation, route }) => {
  const employeeDetails = useFetchEmployeeDetails();
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentPath, setDocumentPath] = useState('');
  const [charCount, setCharCount] = useState(100);
  const [feedback, setFeedback] = useState({ visible: false, type: '', message: '' }); // State for FeedbackModal

  const passedLeaveData = route.params?.leaveData; 

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      EmployeeId: employeeDetails?.id ?? '',
      ReportingId: employeeDetails?.reportingEmpId ?? '',
      LeaveType: passedLeaveData?.leaveType?.toString() ?? '1',
      LeaveId: passedLeaveData?.leaveId?.toString() ?? '',
      FromLeaveDate: passedLeaveData?.fromLeaveDate
        ? new Date(passedLeaveData.fromLeaveDate)
        : new Date(),
      ToLeaveDate: passedLeaveData?.toLeaveDate
        ? new Date(passedLeaveData.toLeaveDate)
        : new Date(),
      LeaveNo: passedLeaveData?.leaveNo ?? 1,
      Remarks: passedLeaveData?.remarks ?? '',
      DocumentPath: passedLeaveData?.documentPath ?? '',
      Status: passedLeaveData?.status ?? 'Pending',
      CompanyId: employeeDetails?.childCompanyId ?? '',
      IsDelete: 0,
      Flag: 1,
      CreatedBy: employeeDetails?.id ?? '',
      CreatedDate: passedLeaveData?.createdDate
        ? new Date(passedLeaveData.createdDate)
        : new Date(),
      ModifiedBy: employeeDetails?.id ?? '',
      ModifiedDate: new Date(),
      ApprovalStatus: passedLeaveData?.approvalStatus ?? 1,
      ApplyLeaveId: passedLeaveData?.id ?? 0,
    },
  });

  const leaveNoValue = watch('LeaveNo');
  const fromLeaveDateValue = watch('FromLeaveDate');
  const toLeaveDateValue = watch('ToLeaveDate');

  useEffect(() => {
    if (fromLeaveDateValue && leaveNoValue && leaveNoValue > 0) {
      const toDate = new Date(fromLeaveDateValue);
      toDate.setDate(toDate.getDate() + leaveNoValue - 1);
      setValue('ToLeaveDate', toDate);
    }
  }, [fromLeaveDateValue, leaveNoValue, setValue]);

  function formatDateForBackend(date) {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validate employeeDetails and childCompanyId
        if (!employeeDetails?.childCompanyId) {
          throw new Error('Invalid employee details: Missing childCompanyId');
        }

        // Fetch leave policies for Leave Name dropdown
        const policiesResponse = await axios.get(
          `${BASE_URL_PROD}/LeavePolicy/GetAllLeavePolicy/${employeeDetails?.childCompanyId}`,
        
        );

        // Validate response data
        if (!Array.isArray(policiesResponse.data)) {
          throw new Error('Invalid response format: Expected an array');
        }

        const policies = policiesResponse.data.map(policy => ({
          policyId: policy.policyId,
          leaveName: policy.leaveName,
        }));

        // console.log(policiesResponse.data, 'Leave Policies Fetched'); // Debugging: Check fetched policies

        setLeavePolicies(policies);

        
        if (passedLeaveData?.LeaveId || passedLeaveData?.leaveName) {
          const selectedPolicy = policies.find(
            policy =>
              policy.policyId === passedLeaveData?.LeaveId ||
              policy.leaveName === passedLeaveData?.leaveName
          );
          if (selectedPolicy) {
            setValue('LeaveId', selectedPolicy.policyId); 
          }
        }
      } catch (error) {
        console.error('Error fetching leave policies:', error.message || error);
      
      }
    };

    fetchData();
  }, [employeeDetails, passedLeaveData, setValue]);

  // Helper to generate unique filename
  function generatePdfFileName() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `leave_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.pdf`;
  }

  // Document picker handler
  const handleDocumentPick = async () => {
    try {
      const res = await pick({
        mode: 'open',
        allowMultiSelection: false,
        type: ['application/pdf', 'image/jpeg', 'image/png'], // Support PDF and images
      });

      if (res && res.length > 0) {
        const file = res[0];
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size should be less than 5MB');
          return;
        }

        const fileName = file.name || generatePdfFileName(); // Use file name or generate one
        setUploadedFile(file);
        setDocumentPath(fileName);
        setValue('DocumentPath', fileName);
        Alert.alert('File Selected', `File will be saved as: ${fileName}`);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };



  const onSubmit = async data => {
    const payload = {
      Id: data.ApplyLeaveId,
      EmployeeId: employeeDetails?.id ?? 0,
      ReportingId: employeeDetails?.reportingEmpId ?? 0,
      LeaveType: Number(data.LeaveType),
      LeaveId: Number(data.LeaveId),
      FromLeaveDate: data.FromLeaveDate
        ? formatDateForBackend(data.FromLeaveDate)
        : '',
      ToLeaveDate: data.ToLeaveDate
        ? formatDateForBackend(data.ToLeaveDate)
        : '',
      LeaveNo: Number(data.LeaveNo),
      Remarks: data.Remarks,
      DocumentPath: data.DocumentPath || documentPath || '',
      Status: data.Status ?? 'Pending',
      CompanyId: employeeDetails?.childCompanyId ?? 0,
      IsDelete: 0,
      Flag: 1,
      CreatedBy: employeeDetails?.id ?? 0,
      CreatedDate: formatDateForBackend(data.CreatedDate),
      ModifiedBy: employeeDetails?.id ?? 0,
      ModifiedDate: formatDateForBackend(new Date()),
      ApprovalStatus: data.ApprovalStatus ?? 1,
    };

    // console.log('Payload sent:', payload);

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BASE_URL_PROD}/ApplyLeave/SaveAndUpdateApplyLeave`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );
      // console.log('Backend API response:', response?.data);

      if (response?.data?.isSuccess || response?.status === 200) {
        const successMessage = data.ApplyLeaveId
          ? 'Leave updated successfully'
          : 'Leave applied successfully';

        setFeedback({
          visible: true,
          type: 'success',
          message: successMessage,
        });

        // Clear form data if applying a new leave
        if (!data.ApplyLeaveId) {
          setValue('LeaveId', '');
          setValue('LeaveType', '1');
          setValue('FromLeaveDate', new Date());
          setValue('ToLeaveDate', new Date());
          setValue('LeaveNo', 1);
          setValue('Remarks', '');
          setValue('DocumentPath', '');
          setUploadedFile(null);
          setDocumentPath('');
        }

        // Delay navigation until feedback modal is closed
        setTimeout(() => {
          setFeedback({ visible: false, type: '', message: '' });
          navigation.navigate('LeaveRequstStatus');
        }, 2000); // Adjust delay as needed
      } else {
        setFeedback({
          visible: true,
          type: 'fail',
          message: response?.data?.message || 'Failed to apply/update leave',
        });
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      setFeedback({
        visible: true,
        type: 'fail',
        message: 'Failed to submit leave',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


    useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        if (employeeDetails?.id && employeeDetails?.childCompanyId) {
          const response = await axios.get(
            `${BASE_URL_PROD}/CommonDashboard/GetEmployeeLeaveDetails/${employeeDetails.childCompanyId}/${employeeDetails.id}`
          );

          const transformed = response.data.leaveBalances.map(item => ({
            label: item.leavename,
            used: item.usedLeaveNo,
            available: item.availbleLeaveNo,
          }));

          setLeaveData(transformed);
          console.log('Leave data fetched:', transformed); // Debug leaveData
        }
      } catch (error) {
        console.error('Error fetching leave data:', error.message);
      }
    };

    fetchLeaveData();
  }, [employeeDetails]);

  const showIOSPicker = (options, selectedValue, onChange) => {
    const labels = options.map(option => option.label);
    const values = options.map(option => option.value);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', ...labels],
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex > 0) {
          onChange(values[buttonIndex - 1]);
        }
      }
    );
  };

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#4B5563" />
        <Appbar.Content title="Apply Leave" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <LeaveHeader />
          <LeaveBalanceCards leaveData={leaveData} />

          {/* Leave Name Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Leave Name <Text style={styles.required}>*</Text>
              {errors.LeaveId && (
                <Text style={styles.errorText}>{errors.LeaveId.message}</Text>
              )}
            </Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={() =>
                  showIOSPicker(
                    leavePolicies.map(policy => ({
                      label: policy.leaveName,
                      value: policy.policyId,
                    })),
                    watch('LeaveId'),
                    value => setValue('LeaveId', value)
                  )
                }>
                <Text style={styles.iosPickerText}>
                  {leavePolicies.find(policy => policy.policyId === watch('LeaveId'))?.leaveName || 'Select Leave'}
                </Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Controller
                  control={control}
                  rules={{ required: 'This field is required' }}
                  name="LeaveId"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}>
                      
                      {leavePolicies.map(policy => (
                        <Picker.Item
                          key={policy.policyId}
                          label={policy.leaveName}
                          value={policy.policyId}
                        />
                      ))}
                    </Picker>
                  )}
                />
              </View>
            )}
          </View>

          {/* Leave Type Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Leave Type <Text style={styles.required}>*</Text>
              {errors.LeaveType && (
                <Text style={styles.errorText}>{errors.LeaveType.message}</Text>
              )}
            </Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={() =>
                  showIOSPicker(
                    [
                      { label: 'Select Leave Type', value: '' },
                      { label: 'Full Day', value: '1' },
                      { label: 'Half Day', value: '2' },
                      { label: 'Company Off', value: '3' },
                    ],
                    watch('LeaveType'),
                    value => setValue('LeaveType', value)
                  )
                }>
                <Text style={styles.iosPickerText}>
                  {['Select Leave Type', 'Full Day', 'Half Day', 'Company Off'][Number(watch('LeaveType'))] || 'Select Leave Type'}
                </Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Controller
                  control={control}
                  rules={{ required: 'This field is required' }}
                  name="LeaveType"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}>

                      <Picker.Item label="Full Day" value="1" />
                      <Picker.Item label="Half Day" value="2" />
                      <Picker.Item label="Company Off" value="3" />
                    </Picker>
                  )}
                />
              </View>
            )}
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
              {errors.FromLeaveDate && (
                <Text style={styles.errorText}>{errors.FromLeaveDate.message}</Text>
              )}
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInputWrapper,
                {
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  backgroundColor: '#F9FAFB',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
              onPress={() => setShowFromDatePicker(true)}
              activeOpacity={0.7}>
              <Icon name="calendar" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={[styles.dateText, {flex: 1, fontSize: 14, color: '#374151'}]}>
                {fromLeaveDateValue
                  ? new Date(fromLeaveDateValue).toLocaleDateString()
                  : 'Select Date'}
              </Text>
              <Icon name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <DatePicker
              modal
              open={showFromDatePicker}
              date={fromLeaveDateValue ? new Date(fromLeaveDateValue) : new Date()}
              mode="date"
              minimumDate={new Date()}
              onConfirm={date => {
                setShowFromDatePicker(false);
                setValue('FromLeaveDate', date);
                if (toLeaveDateValue && new Date(toLeaveDateValue) < date) {
                  setValue('ToLeaveDate', date);
                }
              }}
              onCancel={() => setShowFromDatePicker(false)}
            />
          </View>

          {/* Number of Days */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Number of Days <Text style={styles.required}>*</Text>
              {errors.LeaveNo && (
                <Text style={styles.errorText}>{errors.LeaveNo.message}</Text>
              )}
            </Text>
            <View style={styles.numberInputWrapper}>
              <Controller
                control={control}
                name="LeaveNo"
                rules={{
                  required: 'This field is required',
                  min: {value: 1, message: 'Minimum 1 day required'},
                  max: {value: 30, message: 'Maximum 30 days allowed'},
                }}
                render={({field: {value, onChange}}) => (
                  <>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => onChange(Math.max(1, (Number(value) || 1) - 1))}>
                      <Icon name="minus" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.numberDisplay}>{value}</Text>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => onChange((Number(value) || 1) + 1)}>
                      <Icon name="plus" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </>
                )}
              />
            </View>
          </View>

          {/* Reason */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Reason <Text style={styles.required}>*</Text>
              {errors.Remarks && (
                <Text style={styles.errorText}>{errors.Remarks.message}</Text>
              )}
            </Text>
            <Controller
              control={control}
              name="Remarks"
              rules={{
                required: 'Reason is required',
                maxLength: {value: 100, message: 'Maximum 100 characters allowed'},
              }}
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[styles.textArea, errors.Remarks && styles.errorInput]}
                  value={value}
                  onChangeText={text => {
                    onChange(text);
                    setCharCount(100 - (text ? text.length : 0));
                  }}
                  placeholder="Enter your reason for leave..."
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                />
              )}
            />
            <Text style={styles.charCount}>{charCount} characters remaining</Text>
          </View>

          {/* Document Upload UI */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Supporting Document (PDF only)</Text>
            {uploadedFile ? (
              <View style={styles.documentPreview}>
                <Icon
                  name={uploadedFile.type.includes('pdf') ? 'file-pdf-box' : 'file-image'}
                  size={24}
                  color={uploadedFile.type.includes('pdf') ? '#e74c3c' : '#3498db'}
                />
                <Text style={styles.documentName}>{documentPath}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setUploadedFile(null);
                    setDocumentPath('');
                    setValue('DocumentPath', '');
                  }}>
                  <Icon name="close" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                <Icon name="upload" size={20} color="#3498db" />
                <Text style={styles.uploadText}>Upload Document</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.fileHint}>Max file size: 5MB</Text>
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}>
            Submit
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ visible: false, type: '', message: '' })}
      />
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
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
  },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
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
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#111827',
  },
  pickerIOS: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  readonlyInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#6B7280',
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
  card: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 0,
  },
  uploadButton: {
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
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentName: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  fileHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
  },
  iosPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iosPickerText: {
    fontSize: 16,
    color: '#111827',
  },
});


/*
How to save a PDF to your own app folder (like WhatsApp):

1. **Install react-native-fs**
   - Run: `npm install react-native-fs`
   - For iOS: run `cd ios && pod install`

2. **Import react-native-fs**
   ```javascript
   import RNFS from 'react-native-fs';
   ```

3. **Define your app folder path**
   - For Android: `const folderPath = RNFS.ExternalDirectoryPath + '/YourApp/PDFs';`
   - For iOS: `const folderPath = RNFS.DocumentDirectoryPath + '/PDFs';`
   - You can use `Platform.OS` to handle both.

4. **Create the folder if it doesn't exist**
   ```javascript
   await RNFS.mkdir(folderPath);
   ```

5. **Copy the picked PDF to your folder**
   - After picking the file, get its URI (`file.uri`).
   - Generate your unique filename (as you already do).
   - Build the destination path: `const destPath = folderPath + '/' + fileName;`
   - Copy:
     ```javascript
     await RNFS.copyFile(file.uri, destPath);
     ```

6. **Store only the filename (or relative path) in your backend**
   - Use `fileName` for `DocumentPath` as you do now.

7. **Example integration in your handleDocumentPick:**
   ```javascript
   import RNFS from 'react-native-fs';
   import { Platform } from 'react-native';
   // ...existing code...

   const handleDocumentPick = async () => {
     try {
       const res = await pick({
         mode: 'open',
         allowMultiSelection: false,
         type: ['application/pdf'],
       });
       if (res && res.length > 0) {
         const file = res[0];
         if (file.size > 5 * 1024 * 1024) {
           Alert.alert('Error', 'File size should be less than 5MB');
           return;
         }
         const fileName = generatePdfFileName();
         const folderPath =
           Platform.OS === 'android'
             ? RNFS.ExternalDirectoryPath + '/YourApp/PDFs'
             : RNFS.DocumentDirectoryPath + '/PDFs';
         await RNFS.mkdir(folderPath);
         const destPath = folderPath + '/' + fileName;
         await RNFS.copyFile(file.uri, destPath);
         setUploadedFile(file);
         setDocumentPath(fileName);
         setValue('DocumentPath', fileName);
         Alert.alert('File Saved', `PDF saved to: ${destPath}`);
       }
     } catch (err) {
       if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
         Alert.alert('Error', 'Failed to select file');
       }
     }
   };
   ```

8. **Accessing the PDF later**
   - Use the same folder path and filename to access or open the PDF.

**Summary:**  
- Use `react-native-fs` to copy the picked PDF to your app's folder.
- Store only the filename in your backend.
- This will mimic WhatsApp's behavior of saving files in a dedicated folder.

*/

export default ApplyLeaveScreen;
