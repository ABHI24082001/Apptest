import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {Button} from 'react-native-paper';

// Third-party components
import DatePicker from 'react-native-date-picker';
import {useForm, Controller} from 'react-hook-form';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {pick} from '@react-native-documents/picker';

// Custom components and utilities
import ScrollAwareContainer from '../component/ScrollAwareContainer';
import CustomHeader from '../component/CustomHeader';
import LeaveHeader from '../component/LeaveHeader';
import LeaveBalanceCards from '../component/LeaveBalanceCards';
import styles from '../Stylesheet/Applyleave';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import FeedbackModal from '../component/FeedbackModal';
import axiosInstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';

const ApplyLeaveScreen = ({navigation, route}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentPath, setDocumentPath] = useState('');
  const [charCount, setCharCount] = useState(100);
  const [feedback, setFeedback] = useState({
    visible: false,
    type: '',
    message: '',
  }); // State for FeedbackModal

  const passedLeaveData = route.params?.leaveData;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
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

  // Helper function to format date for backend
  function formatDateForBackend(date) {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // Fetch leave policies on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!employeeDetails?.childCompanyId) {
          throw new Error('Invalid employee details: Missing childCompanyId');
        }

        const policiesResponse = await axiosInstance.get(
          `${BASE_URL}/LeavePolicy/GetAllLeavePolicy/${employeeDetails?.childCompanyId}`,
        );

        if (!Array.isArray(policiesResponse.data)) {
          throw new Error('Invalid response format: Expected an array');
        }

        const policies = policiesResponse.data.map(policy => ({
          policyId: policy.policyId,
          leaveName: policy.leaveName,
        }));

        setLeavePolicies(policies);

        // Set default leave policy if data is passed
        if (passedLeaveData?.LeaveId || passedLeaveData?.leaveName) {
          const selectedPolicy = policies.find(
            policy =>
              policy.policyId === passedLeaveData?.LeaveId ||
              policy.leaveName === passedLeaveData?.leaveName,
          );
          if (selectedPolicy) {
            setValue('LeaveId', selectedPolicy.policyId);
          }
        }
      } catch (error) {
        console.error('Error fetching leave policies:', error.message);
      }
    };

    fetchData();
  }, [employeeDetails, passedLeaveData, setValue]);

  // Helper to generate unique filename
  function generatePdfFileName() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `leave_${pad(now.getDate())}${pad(
      now.getMonth() + 1,
    )}${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds(),
    )}.pdf`;
  }

  // Handle document selection
  const handleDocumentPick = async () => {
    try {
      const res = await pick({
        mode: 'open',
        allowMultiSelection: false,
        type: ['application/pdf', 'image/jpeg', 'image/png'], // Support PDF and images
      });

      if (res?.[0]) {
        const file = res[0];
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size should be less than 5MB');
          return;
        }

        const fileName = file.name || generatePdfFileName(); // Use file name or generate one
        setUploadedFile(file);
        setDocumentPath(fileName);
        setValue('DocumentPath', fileName);
        Alert.alert('Success', `File selected: ${fileName}`);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  // Handle form submission
  const onSubmit = async data => {
    // Check if user has valid leave assignments before submitting
    const hasValidLeaves = leaveData && leaveData.length > 0 && 
      leaveData.some(item => item.label !== "No Leave Assigned" && (item.used > 0 || item.available > 0));

    if (!hasValidLeaves) {
      setFeedback({
        visible: true,
        type: 'fail',
        message: 'No Leave Assigned. Please contact HR to get leave policies assigned.',
      });
      return;
    }

    // Check if selected leave policy is valid
    if (!data.LeaveId || data.LeaveId === '') {
      setFeedback({
        visible: true,
        type: 'fail',
        message: 'Please select a valid leave type.',
      });
      return;
    }

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

    console.log('Payload sent:', payload);

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/ApplyLeave/SaveAndUpdateApplyLeave`,
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
          setFeedback({visible: false, type: '', message: ''});
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
          const response = await axiosInstance.get(
            `${BASE_URL}/CommonDashboard/GetEmployeeLeaveDetails/${employeeDetails.childCompanyId}/${employeeDetails.id}`,
          );

          // Filter and transform leave data
          const validLeaves = response.data.leaveBalances.filter(item => 
            item.usedLeaveNo > 0 || item.availbleLeaveNo > 0
          );

          const transformed = validLeaves.length > 0 
            ? validLeaves.map(item => ({
                label: item.leavename,
                used: item.usedLeaveNo,
                available: item.availbleLeaveNo,
              }))
            : [{
                label: "No Leave Assigned",
                used: 0,
                available: 0,
              }];

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
      },
    );
  };

  return (
    <ScrollAwareContainer
      navigation={navigation}
      currentRoute="ApplyLeave"
      showBottomTab={true}>
      <CustomHeader title="Apply Leave" navigation={navigation} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <LeaveHeader
            title="Apply Leave"
            subtitle="Please fill in the details below to submit your leave request."
            iconName="calendar-account-outline"
          />

          <Text style={styles.headerText}>Leave application</Text>

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
                    [
                      {label: 'Select Leave', value: ''},
                      ...leavePolicies.map(policy => ({
                        label: policy.leaveName,
                        value: policy.policyId,
                      })),
                    ],
                    watch('LeaveId'),
                    value => setValue('LeaveId', value),
                  )
                }>
                <Text style={styles.iosPickerText}>
                  {leavePolicies.find(
                    policy => policy.policyId === watch('LeaveId'),
                  )?.leaveName || 'Select Leave'}
                </Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
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
                      {label: 'Select Leave Type', value: ''},
                      {label: 'Full Day', value: '1'},
                      {label: 'Half Day', value: '2'},
                      {label: 'Company Off', value: '3'},
                    ],
                    watch('LeaveType'),
                    value => setValue('LeaveType', value),
                  )
                }>
                <Text style={styles.iosPickerText}>
                  {['Select Leave Type', 'Full Day', 'Half Day', 'Company Off'][
                    Number(watch('LeaveType'))
                  ] || 'Select Leave Type'}
                </Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
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
            )}
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
              {errors.FromLeaveDate && (
                <Text style={styles.errorText}>
                  {errors.FromLeaveDate.message}
                </Text>
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
              <Icon
                name="calendar"
                size={20}
                color="#3B82F6"
                style={{marginRight: 8}}
              />
              <Text
                style={[
                  styles.dateText,
                  {flex: 1, fontSize: 14, color: '#374151'},
                ]}>
                {fromLeaveDateValue
                  ? new Date(fromLeaveDateValue).toLocaleDateString()
                  : 'Select Date'}
              </Text>
              <Icon name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <DatePicker
              modal
              open={showFromDatePicker}
              date={
                fromLeaveDateValue ? new Date(fromLeaveDateValue) : new Date()
              }
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
                      onPress={() =>
                        onChange(Math.max(1, (Number(value) || 1) - 1))
                      }>
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
                maxLength: {
                  value: 100,
                  message: 'Maximum 100 characters allowed',
                },
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
            <Text style={styles.charCount}>
              {charCount} characters remaining
            </Text>
          </View>

          {/* Document Upload UI */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Supporting Document</Text>
            <Text style={styles.subLabel}>
              Upload PDF, JPG, or PNG files (Optional)
            </Text>

            {uploadedFile ? (
              <View style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <Icon
                    name={
                      uploadedFile.type.includes('pdf')
                        ? 'file-pdf-box'
                        : 'file-image'
                    }
                    size={28}
                    color={
                      uploadedFile.type.includes('pdf') ? '#DC2626' : '#2563EB'
                    }
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {documentPath}
                  </Text>
                  <Text style={styles.documentSize}>
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setUploadedFile(null);
                    setDocumentPath('');
                    setValue('DocumentPath', '');
                  }}
                  activeOpacity={0.7}>
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={handleDocumentPick}
                activeOpacity={0.7}>
                <View style={styles.uploadIconWrapper}>
                  <Icon name="cloud-upload" size={32} color="#3B82F6" />
                </View>
                <Text style={styles.uploadTitle}>Upload Document</Text>
                <Text style={styles.uploadSubtitle}>
                  Tap to browse files from your device
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.uploadHints}>
              <View style={styles.hintRow}>
                <Icon name="information" size={16} color="#6B7280" />
                <Text style={styles.hintText}>Maximum file size: 5MB</Text>
              </View>
              <View style={styles.hintRow}>
                <Icon name="file-check" size={16} color="#6B7280" />
                <Text style={styles.hintText}>Supported: PDF, JPG, PNG</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#2563EB">
            Submit
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({visible: false, type: '', message: ''})}
      />
    </ScrollAwareContainer>
  );
};

export default ApplyLeaveScreen;
