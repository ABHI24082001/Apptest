import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveRequestDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};

  // Default data if no item is passed
  const defaultData = {
    name: 'Lane Mcintyre',
    empId: 'AA_16',
    role: 'HR Executive',
    dept: 'Human Resources',
    remarks: 'Need to attend sister wedding',
    type: 'Casual Leave',
    leaveType: 'Full day',
    appliedLeaveNo: '1',
    appliedLeaveDates: '02-05-2025',
    approvedLeave: '0',
    unapprovedLeave: '0',
    status: 'Pending',
    taskAssignment: 'William Puckett',
    assignEmpDept: 'Human Resources',
    assignEmpDesignation: 'HR Manager',
    reason: 'Need to attend sister wedding',
    reportingManagerRemarks: '',
    approvalRemarks: '',
  };

  // Use the passed item or default data
  const leaveData = item || defaultData;

  // State variables
  const [isEditable, setIsEditable] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(leaveData.status);
  const [reportingRemarks, setReportingRemarks] = useState(leaveData.reportingManagerRemarks);
  const [approvalRemarks, setApprovalRemarks] = useState(leaveData.approvalRemarks);

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setApprovalStatus(newStatus);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here you would usually send the data to an API
    alert(`Leave request ${approvalStatus.toLowerCase()}d!`);
    navigation.goBack();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      case 'Approved':
        return '#00C851';
      case 'Rejected':
        return '#ff4444';
      default:
        return '#6B7280';
    }
  };

  // Form Field component for reusability
  const FormField = ({ label, value, isRequired = false, editable = false, onChangeText }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      {isEditable && editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> */}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Request Details</Text>
        <View style={styles.editToggleContainer}>
          <Text style={styles.editToggleLabel}>Edit</Text>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#00C85130' }}
            thumbColor={isEditable ? '#00C851' : '#FFF'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={() => setIsEditable(!isEditable)}
            value={isEditable}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${getStatusColor(approvalStatus)}15`,
                borderColor: getStatusColor(approvalStatus),
              },
            ]}>
            <Text style={[styles.statusText, { color: getStatusColor(approvalStatus) }]}>
              {approvalStatus}
            </Text>
          </View>
        </View>

        {/* Employee Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.card}>
            <FormField label="Employee Name" value={leaveData.name} isRequired={true} />
            <FormField label="Employee Id" value={leaveData.empId} isRequired={true} />
            <FormField label="Designation" value={leaveData.role} isRequired={true} />
            <FormField label="Department" value={leaveData.dept} isRequired={true} />
            <FormField 
              label="Employee Remarks" 
              value={leaveData.remarks} 
              isRequired={true} 
              editable={true}
              onChangeText={(text) => {/* Handle text change */}}
            />
          </View>
        </View>

        {/* Leave Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Details</Text>
          <View style={styles.card}>
            <FormField label="Leave" value={leaveData.type} isRequired={true} />
            <FormField label="Leave Type" value={leaveData.leaveType} isRequired={true} />
            <FormField label="Applied Leave No" value={leaveData.appliedLeaveNo} isRequired={true} />
            <FormField label="Applied Leave Date(s)" value={leaveData.appliedLeaveDates} />
            <FormField label="No of Approved Leave" value={leaveData.approvedLeave} />
            <FormField label="No of Unapproved Leave" value={leaveData.unapprovedLeave} />
          </View>
        </View>

        {/* Approval Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval Information</Text>
          <View style={styles.card}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Approval Status <Text style={styles.required}>*</Text>
              </Text>
              {isEditable ? (
                <View style={styles.statusOptions}>
                  {['Approved', 'Rejected', 'Pending'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        {
                          backgroundColor: approvalStatus === status 
                            ? `${getStatusColor(status)}15` 
                            : '#F3F4F6',
                          borderColor: approvalStatus === status 
                            ? getStatusColor(status) 
                            : '#E5E7EB',
                        },
                      ]}
                      onPress={() => handleStatusChange(status)}>
                      <Text
                        style={[
                          styles.statusOptionText,
                          { color: approvalStatus === status ? getStatusColor(status) : '#6B7280' },
                        ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(approvalStatus)}15`,
                      borderColor: getStatusColor(approvalStatus),
                    },
                  ]}>
                  <Text style={[styles.statusText, { color: getStatusColor(approvalStatus) }]}>
                    {approvalStatus}
                  </Text>
                </View>
              )}
            </View>

            <FormField label="Task Assignment" value={leaveData.taskAssignment} />
            <FormField label="Assign Employee Department" value={leaveData.assignEmpDept} />
            <FormField label="Assign Employee Designation" value={leaveData.assignEmpDesignation} />
            <FormField label="Reason" value={leaveData.reason} />
          </View>
        </View>

        {/* Remarks Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reporting Manager Remarks</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.remarksInput}
              placeholder="Enter remarks (Maximum 400 characters)"
              multiline
              maxLength={400}
              value={reportingRemarks}
              onChangeText={setReportingRemarks}
              editable={isEditable}
            />
            <Text style={styles.charCount}>{reportingRemarks.length}/400</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HR Approval Remarks</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.remarksInput}
              placeholder="Enter approval remarks (Maximum 400 characters)"
              multiline
              maxLength={400}
              value={approvalRemarks}
              onChangeText={setApprovalRemarks}
              editable={isEditable}
            />
            <Text style={styles.charCount}>{approvalRemarks.length}/400</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditable && (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleSubmit}>
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => navigation.goBack()}>
              <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editToggleLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginRight: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
  },
  input: {
    fontSize: 16,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
  },
  required: {
    color: '#EF4444',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  remarksInput: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#00C851',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  cancelText: {
    color: '#6B7280',
  },
});

export default LeaveRequestDetailsScreen;