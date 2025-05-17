import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller } from 'react-hook-form';
import AppSafeArea from '../component/AppSafeArea';

const ExitApplyScreen = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      exitDate: new Date(),
      reason: '',
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSubmit = data => {
    console.log('Exit Apply Form:', data);
    // Submit logic here
  };

  const exitDate = watch('exitDate');

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#4B5563" />
        <Appbar.Content title="Exit Application" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
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
            {/* Exit Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Exit Date <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <View style={styles.dateInputWrapper}>
                  <Icon name="calendar" size={20} color="#3B82F6" style={styles.dateIcon} />
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
                Reason for Exit <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Controller
                control={control}
                name="reason"
                rules={{ required: 'Reason is required', maxLength: 500 }}
                render={({ field: { onChange, value } }) => (
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
              <Text style={styles.charCount}>{watch('reason')?.length || 0}/500 characters</Text>
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
            >
              Submit Request
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      <DatePicker
        modal
        open={showDatePicker}
        date={exitDate || new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setValue('exitDate', date, { shouldValidate: true });
        }}
        onCancel={() => setShowDatePicker(false)}
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