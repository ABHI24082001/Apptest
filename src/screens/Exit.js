import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Appbar, Button} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm, Controller} from 'react-hook-form';
import AppSafeArea from '../component/AppSafeArea';
import axiosinstance from '../utils/axiosInstance';
import {useFocusEffect} from '@react-navigation/native';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import FeedbackModal from '../component/FeedbackModal';
import LeaveHeader from '../component/LeaveHeader';
import styles from '../Stylesheet/Exitcss';
import LinearGradient from 'react-native-linear-gradient';

const GradientHeader = ({children, style}) => (
  <LinearGradient
    colors={['#2563EB', '#3B82F6']}
    start={{x: 0, y: 1}}
    end={{x: 0, y: 0}}>
    {children}
  </LinearGradient>
);

const ExitApplyScreen = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate minimum allowed exit date (30 days from today)
  const minimumExitDate = new Date();
  minimumExitDate.setDate(minimumExitDate.getDate() + 30);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      EmployeeId: employeeDetails?.id ?? '',
      exitDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      appliedDate: new Date(),
      reason: '',
    },
  });

  // Check if user has any pending exit requests
  useFocusEffect(
    React.useCallback(() => {
      const checkExistingRequests = async () => {
        if (!employeeDetails?.id) return;

        setCheckingStatus(true);
        try {
          const response = await axiosinstance.get(
            `${BASE_URL}/EmployeeExit/GetExEmpByEmpId/${employeeDetails.id}`,
          );

          const exitRequests = Array.isArray(response.data)
            ? response.data
            : [];
          const hasPendingRequest = exitRequests.some(
            req => req.applicationStatus?.toLowerCase() === 'pending',
          );

          if (hasPendingRequest) {
            setHasActiveRequest(true);
            // If we have a pending request, show alert and navigate back
            Alert.alert(
              'Request Already Exists',
              'You already have a pending exit application. Please withdraw it before submitting a new one.',
              [
                {
                  text: 'View Requests',
                  onPress: () => navigation.navigate('ExitRequestStatus'),
                },
              ],
            );
          } else {
            setHasActiveRequest(false);
          }
        } catch (error) {
          console.error('Error checking exit requests:', error);
        } finally {
          setCheckingStatus(false);
        }
      };

      checkExistingRequests();

      return () => {};
    }, [employeeDetails?.id]),
  );

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

  // Validate the selected exit date is at least 30 days in the future
  const validateExitDate = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 30);
    minDate.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < minDate) {
      Alert.alert(
        'Invalid Exit Date',
        'Your exit date must be at least 30 days from today as per company policy.',
        [{text: 'OK'}],
      );
      return false;
    }
    return true;
  };

  const onSubmit = async data => {
    // Validate fields first
    if (!data.exitDate) {
      Alert.alert('Validation Error', 'Exit date is required');
      return;
    }
    if (!data.reason) {
      Alert.alert('Validation Error', 'Reason is required');
      return;
    }

    // Validate exit date
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 30);

    if (new Date(data.exitDate) < minDate) {
      Alert.alert(
        'Validation Error',
        'Exit date must be at least 30 days from today as per company policy.',
      );
      return;
    }

    // Double check for active requests before submission
    if (hasActiveRequest) {
      Alert.alert(
        'Request Already Exists',
        'You already have a pending exit application. Please withdraw it before submitting a new one.',
        [
          {
            text: 'View Requests',
            onPress: () => navigation.navigate('ExitRequestStatus'),
          },
        ],
      );
      return;
    }

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

      const response = await axiosinstance.post(
        `${BASE_URL}/EmployeeExit/SaveEmpExitApplication`,
        exitApplicationData,
      );
      console.log('API Resp=============onse:', response.data);

      if (response.status === 200) {
        setSubmitSuccess(true);
        setFeedbackMessage(
          response.data?.message
            ? response.data.message
            : 'Exit application submitted successfully.',
        );
        setFeedbackVisible(true);
        // Navigation will be handled after modal closes
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

  // Show loading indicator while checking for existing requests
  if (checkingStatus) {
    return (
      <AppSafeArea>
        <GradientHeader>
          <Appbar.Header style={styles.gradientHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Appbar.Content
              title="Exit Application"
              titleStyle={styles.headerTitle}
            />
          </Appbar.Header>
        </GradientHeader>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Checking application status...</Text>
        </View>
      </AppSafeArea>
    );
  }

  // If there's an active request, redirect to status screen
  if (hasActiveRequest) {
    return (
      <AppSafeArea>
        <GradientHeader>
          <Appbar.Header style={styles.gradientHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Appbar.Content
              title="Exit Application"
              titleStyle={styles.headerTitle}
            />
          </Appbar.Header>
        </GradientHeader>

        <View style={styles.redirectContainer}>
          <Icon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.redirectTitle}>Application In Progress</Text>
          <Text style={styles.redirectText}>
            You already have a pending exit application. Please withdraw it
            before submitting a new one.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ExitRequestStatus')}
            style={styles.redirectButton}>
            View My Requests
          </Button>
        </View>
      </AppSafeArea>
    );
  }

  return (
    <AppSafeArea>
      <GradientHeader>
        <Appbar.Header style={styles.gradientHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Appbar.Content
            title="Exit Application"
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>
      </GradientHeader>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header Section */}
          {/* <View style={styles.headerSection}>
            <Icon name="exit-run" size={40} color="#3B82F6" />
            <Text style={styles.headerText}>Request Exit</Text>
            <Text style={styles.subHeaderText}>
              Please fill in the details below to submit your exit request
            </Text>
          </View> */}

          <LeaveHeader
            title="Exit Request"
            subtitle="Please fill in the details below to submit your exit request"
            iconName="exit-run"
          />

          {/* Form Section */}
          <View style={styles.formContainer}>
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
                rules={{
                  required: 'Reason is required',
                  maxLength: {
                    value: 100,
                    message: 'Reason cannot exceed 100 characters',
                  },
                }}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    placeholder="Explain your reason for leaving....."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={5}
                    value={value}
                    onChangeText={text => {
                      // Limit text to 100 characters
                      if (text.length <= 100) {
                        onChange(text);
                      }
                    }}
                    style={styles.textArea}
                  />
                )}
              />
              <Text
                style={[
                  styles.charCount,
                  watch('reason')?.length >= 100 ? {color: 'red'} : {},
                ]}>
                {watch('reason')?.length || 0}/100 characters
              </Text>
              {errors.reason && (
                <Text style={styles.errorText}>{errors.reason.message}</Text>
              )}
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButtonSmall}
              contentStyle={styles.buttonContentSmall}
              labelStyle={styles.buttonLabelSmall}
              icon="send-check"
              disabled={isSubmitting}
              loading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
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
        minimumDate={minimumExitDate}
        onConfirm={date => {
          setShowDatePicker(false);
          if (validateExitDate(date)) {
            setValue('exitDate', date, {shouldValidate: true});
          } else {
            // If validation fails, set to minimum acceptable date
            setValue('exitDate', new Date(minimumExitDate), {
              shouldValidate: true,
            });
          }
        }}
        onCancel={() => setShowDatePicker(false)}
        theme="light"
      />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        type="success"
        message={feedbackMessage}
        onClose={() => {
          setFeedbackVisible(false);
          navigation.navigate('ExitRequestStatus');
        }}
      />
    </AppSafeArea>
  );
};

export default ExitApplyScreen;


