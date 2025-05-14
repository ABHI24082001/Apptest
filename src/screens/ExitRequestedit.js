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

const EditRequestedit = () => {
  const navigation = useNavigation();  // Access navigation to navigate between screens
  const route = useRoute();  // Access route params to get the passed data
  const { item } = route.params || {};  // Get the passed leave data or use default data

  // Default data to show if no data is passed via route
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

  // Use passed item data, otherwise use defaultData
  const leaveData = item || defaultData;

  // State variables to track editability, status, and remarks
  const [isEditable, setIsEditable] = useState(false); // To toggle between view and edit mode
  const [approvalStatus, setApprovalStatus] = useState(leaveData.status); // Status of leave request
  const [reportingRemarks, setReportingRemarks] = useState(leaveData.reportingManagerRemarks); // Reporting manager's remarks
  const [approvalRemarks, setApprovalRemarks] = useState(leaveData.approvalRemarks); // HR approval remarks

  // Handle leave status change (Approved/Rejected/Pending)
  const handleStatusChange = (newStatus) => {
    setApprovalStatus(newStatus);
  };

  // Handle form submission (approve or reject leave request)
  const handleSubmit = () => {
    alert(`Leave request ${approvalStatus.toLowerCase()}d!`); // Alert the user when the status changes
    navigation.goBack(); // Navigate back to the previous screen
  };

  // Function to return appropriate color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500'; // Orange for Pending
      case 'Approved':
        return '#00C851'; // Green for Approved
      case 'Rejected':
        return '#ff4444'; // Red for Rejected
      default:
        return '#6B7280'; // Gray for unknown status
    }
  };

  // Reusable FormField component for displaying form inputs/fields
  const FormField = ({ label, value, isRequired = false, editable = false, onChangeText }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      {/* Editable field */}
      {isEditable && editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text> // Non-editable field (view only)
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> {/* Set the status bar style */}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}> {/* Back button */}
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Request Details</Text>
        {/* Edit toggle switch */}
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
            {/* Editable remarks field */}
            <FormField 
              label="Employee Remarks" 
              value={leaveData.remarks} 
              isRequired={true} 
              editable={true}
              onChangeText={(text) => setReportingRemarks(text)} // Update remarks
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
            {/* Approval Status Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Approval Status <Text style={styles.required}>*</Text>
              </Text>
              {isEditable ? (
                <View style={styles.statusOptions}>
                  {/* Status options (Approved, Rejected, Pending) */}
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

        {/* Remarks Sections for Reporting Manager and HR */}
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
              editable={isEditable} // Remarks are editable in edit mode
            />
          </View>
        </View>

        {/* Approval Remarks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval Remarks</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.remarksInput}
              placeholder="Enter remarks (Maximum 400 characters)"
              multiline
              maxLength={400}
              value={approvalRemarks}
              onChangeText={setApprovalRemarks}
              editable={isEditable} // Remarks are editable in edit mode
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  editToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editToggleLabel: {
    fontSize: 16,
    marginRight: 5,
  },
  container: {
    padding: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  required: {
    color: 'red',
  },
  input: {
    fontSize: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  fieldValue: {
    fontSize: 14,
    padding: 10,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusOption: {
    margin: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  remarksInput: {
    fontSize: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: '#00C851',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditRequestedit;
