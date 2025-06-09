import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {Appbar, Button} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm, Controller} from 'react-hook-form';
import AppSafeArea from '../component/AppSafeArea';
import axios from 'axios';

import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';
const ExitApplyScreen = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      EmployeeId: employeeDetails?.id ?? '',
      exitDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days in future
      appliedDate: new Date(), // Today as applied date
      reason: '',
    },
  });
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
    if (employeeDetails?.id) {
      setValue('EmployeeId', employeeDetails.id);
    }
  }, [employeeDetails, setValue]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAppliedDatePicker, setShowAppliedDatePicker] = useState(false);
  
  const onSubmit = async data => {
    setIsSubmitting(true);
    try {
      // Build payload with only the required fields and valid values (no null for required)
      const now = new Date();
      const exitApplicationData = {
        Id: 0,
        AppliedDt: formatDateForBackend(data.appliedDate),
        ExitDt: formatDateForBackend(data.exitDate),
        EmpId: employeeDetails?.id,
        ExitReasons: data.reason,
        SupervisorStatus: 'Pending',
        AccountStatus: '',
        Hrstatus: '',
        SupervisorRemarks: '',
        AccountRemarks: '',
        Hrremarks: '',
        EscalateAccount: 0,
        ContingentEmpId: 0,
        ApplicationStatus: 'Pending',
        Nocstatus: '',
        IsDelete: 0,
        Flag: 1,
        CreatedBy: employeeDetails?.id ?? 0,
        CreatedDate: formatDateForBackend(now), // always set a valid date
        ModifiedBy: employeeDetails?.id ?? 0,
        ModifiedDate: formatDateForBackend(now), // always set a valid date
        CompanyId: employeeDetails?.childCompanyId || 1,
      };

      console.log('Exit Application Payload:', exitApplicationData);

      const response = await axios.post(
        `${BASE_URL_PROD}/EmployeeExit/SaveEmpExitApplication`,
        exitApplicationData,
      );
      console.log('API Resp=============onse:', response.data);

      if (response.status === 200) {
        setSubmitSuccess(true);
        // Show backend response message if available, else default message
        Alert.alert(
          'Success',
          response.data?.message
            ? `Exit application submitted successfully.\n\n${response.data.message}`
            : 'Exit application submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ExitRequestStatus'),
            },
          ],
        );
      } else {
        setSubmitSuccess(false);
        Alert.alert('Error', 'Failed to submit exit application');
      }
    } catch (error) {
      console.error('Error submitting exit application:', error);
      setSubmitSuccess(false);

      // Show backend error message for 400 errors
      if (error.response?.status === 400 && error.response?.data?.message) {
        Alert.alert('Error', `Bad Request: ${error.response.data.message}`);
      } else if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else if (error.response?.status === 409) {
        Alert.alert(
          'Error',
          'Exit application already in process for this employee',
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to submit exit application. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const exitDate = watch('exitDate');
  const appliedDate = watch('appliedDate');

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Exit Application"
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
            <Icon name="exit-run" size={40} color="#3B82F6" />
            <Text style={styles.headerText}>Request Exit</Text>
            <Text style={styles.subHeaderText}>
              Please fill in the details below to submit your exit request
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Employee Information */}
            {/* <View style={styles.employeeInfoCard}>
              <Text style={styles.employeeInfoTitle}>Employee Information</Text>
              <View style={styles.employeeInfoRow}>
                <Text style={styles.employeeInfoLabel}>Employee ID:</Text>
                <Text style={styles.employeeInfoValue}>
                  {employeeDetails?.employeeId || 'Loading...'}
                </Text>
              </View>
              <View style={styles.employeeInfoRow}>
                <Text style={styles.employeeInfoLabel}>Name:</Text>
                <Text style={styles.employeeInfoValue}>
                  {employeeDetails?.employeeName || 'Loading...'}
                </Text>
              </View>
              <View style={styles.employeeInfoRow}>
                <Text style={styles.employeeInfoLabel}>Department:</Text>
                <Text style={styles.employeeInfoValue}>
                  {employeeDetails?.departmentName || 'N/A'}
                </Text>
              </View>
            </View> */}

            {/* Applied Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Applied Date <Text style={{color: 'red'}}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowAppliedDatePicker(true)}
                activeOpacity={0.7}>
                <View style={styles.dateInputWrapper}>
                  <Icon
                    name="calendar"
                    size={20}
                    color="#3B82F6"
                    style={styles.dateIcon}
                  />
                  <Text style={styles.dateText}>
                    {moment(appliedDate).format('MMMM D, YYYY')}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
              {errors.appliedDate && (
                <Text style={styles.errorText}>Applied Date is required</Text>
              )}
            </View>

            {/* Exit Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Exit Date <Text style={{color: 'red'}}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}>
                <View style={styles.dateInputWrapper}>
                  <Icon
                    name="calendar"
                    size={20}
                    color="#3B82F6"
                    style={styles.dateIcon}
                  />
                  <Text style={styles.dateText}>
                    {moment(exitDate).format('MMMM D, YYYY')}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
              {errors.exitDate && (
                <Text style={styles.errorText}>Exit Date is required</Text>
              )}
            </View>

            {/* Reason / Remarks */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Reason for Exit <Text style={{color: 'red'}}>*</Text>
              </Text>
              <Controller
                control={control}
                name="reason"
                rules={{required: 'Reason is required', maxLength: 500}}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    placeholder="Explain your reason for leaving..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={5}
                    value={value}
                    onChangeText={onChange}
                    style={styles.textArea}
                  />
                )}
              />
              <Text style={styles.charCount}>
                {watch('reason')?.length || 0}/500 characters
              </Text>
              {errors.reason && (
                <Text style={styles.errorText}>{errors.reason.message}</Text>
              )}
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="send-check"
              disabled={isSubmitting}
              loading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showDatePicker}
        date={exitDate || new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={date => {
          setShowDatePicker(false);
          setValue('exitDate', date, {shouldValidate: true});
        }}
        onCancel={() => setShowDatePicker(false)}
        theme="light"
      />

      <DatePicker
        modal
        open={showAppliedDatePicker}
        date={appliedDate || new Date()}
        mode="date"
        maximumDate={new Date()}
        onConfirm={date => {
          setShowAppliedDatePicker(false);
          setValue('appliedDate', date, {shouldValidate: true});
        }}
        onCancel={() => setShowAppliedDatePicker(false)}
        theme="light"
      />
    </AppSafeArea>
  );
};

export default ExitApplyScreen;

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
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
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
    height: 140,
    lineHeight: 22,
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
    shadowOffset: {width: 0, height: 4},
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
  employeeInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  employeeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  employeeInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  employeeInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
  },
  employeeInfoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

//  let try with these parameter
//  public int Id { get; set; }
//  public DateTime AppliedDt { get; set; }
//  public DateTime ExitDt { get; set; }
//  public int EmpId { get; set; }
//  public string? ExitReasons { get; set; }
//  public string? SupervisorStatus { get; set; }
//  public string? AccountStatus { get; set; }
//  public string? Hrstatus { get; set; }
//  public string? SupervisorRemarks { get; set; }
//  public string? AccountRemarks { get; set; }
//  public string? Hrremarks { get; set; }
//  public int? EscalateAccount { get; set; }
//  public int? ContingentEmpId { get; set; }
//  public string? ApplicationStatus { get; set; }
//  public string? Nocstatus { get; set; }
//  public int IsDelete { get; set; }
//  public int Flag { get; set; }
//  public int CreatedBy { get; set; }
//  public DateTime CreatedDate { get; set; }
//  public int? ModifiedBy { get; set; }
//  public DateTime? ModifiedDate { get; set; }
//  public int CompanyId { get; set; }
