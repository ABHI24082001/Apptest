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
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useForm, Controller} from 'react-hook-form';
import axios from 'axios';
import {useAuth} from '../constants/AuthContext';
import AppSafeArea from '../component/AppSafeArea';
import {Appbar, Button} from 'react-native-paper';
import LeaveHeader from '../component/LeaveHeader';
import LeaveBalanceCards from '../component/LeaveBalanceCards';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {pick} from '@react-native-documents/picker';
import { Platform } from 'react-native';

const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api'; // Use your local API
const BASE_URL_LOCAL = 'http://192.168.29.2:90/api/'; // Use your local API

const ApplyLeaveScreen = ({navigation}) => {
  const {user} = useAuth();
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentPath, setDocumentPath] = useState('');
  const [charCount, setCharCount] = useState(100);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = useForm({
    defaultValues: {
      EmployeeId: user?.id ?? '',
      ReportingId: '13' ?? '',
      LeaveType: '1',
      LeaveId: '',
      FromLeaveDate: new Date(),
      ToLeaveDate: new Date(),
      LeaveNo: 1,
      Remarks: '',
      DocumentPath: '', // <-- Add DocumentPath to form
      Status: 'Pending',
      CompanyId: user?.childCompanyId ?? '',
      IsDelete: 0,
      Flag: 1,
      CreatedBy: user?.id ?? '',
      CreatedDate: new Date(),
      ModifiedBy: user?.id ?? '',
      ModifiedDate: new Date(),
      ApprovalStatus: 1,
      ApplyLeaveId: 0,
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
        // Fetch leave policies for Leave Name dropdown
        const policiesResponse = await axios.get(
          `${BASE_URL_PROD}/LeavePolicy/GetAllLeavePolicy/1`
        );
        setLeavePolicies(
          Array.isArray(policiesResponse.data)
            ? policiesResponse.data
            : policiesResponse.data?.data || []
        );
        // Fetch leave balances if needed
        if (user?.id) {
          const balancesResponse = await axios.get(
            `${BASE_URL_PROD}/LeaveBalance/GetByEmployee/${user.id}`
          );
          setLeaveBalances(
            Array.isArray(balancesResponse.data)
              ? balancesResponse.data
              : balancesResponse.data?.data || []
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 404) {
          Alert.alert(
            'API Not Found',
            'The requested API endpoint was not found (404). Please check your API URL, network connection, or contact your backend team.'
          );
        } else if (
          error.code === 'ENOTFOUND' ||
          error.message?.includes('Network')
        ) {
          Alert.alert(
            'Network Error',
            'Unable to reach the server. Please check your internet connection or VPN settings.'
          );
        } else {
          Alert.alert('Error', 'Failed to load initial data');
        }
      }
    };
    fetchData();
  }, [user]);

  // Helper to generate unique filename
  function generatePdfFileName() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `leave_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.pdf`;
  }

  // Pick and store PDF file (no RNFS, just filename logic)
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
        setUploadedFile(file);
        setDocumentPath(fileName);
        setValue('DocumentPath', fileName);
        Alert.alert('File Selected', `PDF will be saved as: ${fileName}`);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  const handleRemarksChange = text => {
    setValue('Remarks', text);
    setCharCount(100 - (text ? text.length : 0));
  };

  const onSubmit = async data => {
    // Log the data and formData for debugging
    console.log('Form data:', data);

    const payload = {
      Id: 0,
      EmployeeId: user?.id ?? 0,
      ReportingId: data.ReportingId ? Number(data.ReportingId) : 0,
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
      DocumentPath: data.DocumentPath || documentPath || '', // <-- Add DocumentPath to payload
      Status: data.Status ?? 'Pending',
      CompanyId: user?.childCompanyId ?? 0,
      IsDelete: 0,
      Flag: 1,
      CreatedBy: user?.id ?? 0,
      CreatedDate: data.CreatedDate
        ? formatDateForBackend(data.CreatedDate)
        : '',
      ModifiedBy: user?.id ?? 0,
      ModifiedDate: data.ModifiedDate
        ? formatDateForBackend(data.ModifiedDate)
        : '',
      ApprovalStatus: 1,
      ApplyLeaveId: 0,
    };

    console.log('Submitting payload:', payload);

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'https://hcmapiv2.anantatek.com/api/ApplyLeave/SaveAndUpdateApplyLeave',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );
      console.log('Backend API response:', response?.data);

      if (response?.data?.isSuccess || response?.status === 200) {
        Alert.alert('Success', 'Leave applied successfully');
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          response?.data?.message || 'Failed to apply leave',
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('400 Bad Request:', error.response?.data);
        Alert.alert(
          'Bad Request',
          error.response?.data?.message ||
            'The server rejected your request. Please check all required fields and data formats.',
        );
      } else if (error.response && error.response.status === 503) {
        Alert.alert(
          'Service Unavailable',
          'The server is temporarily unavailable (503). Please try again later or contact your IT/admin team.',
        );
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert(
          'Timeout',
          'The request timed out. Please check your internet connection or try again later.',
        );
      } else {
        console.log('Backend error:', error?.response?.data);
        Alert.alert(
          'Error',
          error.response?.data?.message || error.message || 'Unknown error',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const employeeId = user?.id;
        const companyId = user?.childCompanyId;

        if (!employeeId || !companyId) return;

        const response = await axios.get(
          `https://hcmapiv2.anantatek.com/api/CommonDashboard/GetEmployeeLeaveDetails/${companyId}/${employeeId}`,
        );

        const transformed = response.data.leaveBalances.map(item => ({
          label: item.leavename,
          used: item.usedLeaveNo,
          available: item.availbleLeaveNo,
        }));

        setLeaveData(transformed);
      } catch (error) {
        console.error('Error fetching leave data:', error.message);
      }
    };

    fetchLeaveData();
  }, []);

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
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
            <View style={styles.pickerContainer}>
              <Controller
                control={control}
                rules={{required: 'This field is required'}}
                name="LeaveId"
                render={({field: {onChange, value}}) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}>
                    <Picker.Item label="Select Leave" value="" />
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
          </View>

          {/* Leave Type Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Leave Type <Text style={styles.required}>*</Text>
              {errors.LeaveType && (
                <Text style={styles.errorText}>{errors.LeaveType.message}</Text>
              )}
            </Text>
            <View style={styles.pickerContainer}>
              <Controller
                control={control}
                rules={{required: 'This field is required'}}
                name="LeaveType"
                render={({field: {onChange, value}}) => (
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
                <Icon name="file-pdf-box" size={24} color="#e74c3c" />
                <Text style={styles.documentName}>{documentPath}</Text>
                <TouchableOpacity onPress={() => {
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
