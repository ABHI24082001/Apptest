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

const ExpenseRequestedit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};



  const defaultData = {
    empId: 'AA_10',
    name: 'William Puckett',
    dept: 'Human Resources',
    designation: 'HR Manager',
    project: 'Employee Onboarding Revamp',
    appliedDate: '24-Apr-2025',
    paymentType: 'Advance',
    amount: '₹48,956',
    remarks: 'Client visit travel expenses',
    status: 'Pending',
    exitDate: '15-May-2025',
    reasons: 'Relocation due to family commitments',
    contingentCode: 'CT_09',
    contingentName: 'Sarah Mitchell',
    contingentDesignation: 'Assistant Manager',
    contingentDept: 'Finance',
    contingentBranch: 'New York Branch',
    reportingStatus: 'Approved',
    reportingRemarks: 'Verified and recommended',
    accountStatus: 'Reviewed',
    accountRemarks: 'Advance processed, pending disbursal',
    authorizedStatus: 'Pending',
    applicationStatus: 'In Process',
  }

  const leaveData = item || defaultData;
  const [isEditable, setIsEditable] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(leaveData.status);
  const [reportingRemarks, setReportingRemarks] = useState(leaveData.reportingRemarks);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const handleSubmit = () => {
    alert(`Leave request ${approvalStatus.toLowerCase()}d!`);
    navigation.goBack();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FFA500';
      case 'Approved': return '#00C851';
      case 'Rejected': return '#ff4444';
      default: return '#6B7280';
    }
  };

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
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
            <Text style={[styles.statusText, { color: getStatusColor(approvalStatus) }]}> {approvalStatus} </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.card}>
            <FormField label="Employee Name" value={leaveData.name} isRequired />
            <FormField label="Employee Id" value={leaveData.empId} isRequired />
            <FormField label="Designation" value={leaveData.role} isRequired />
            <FormField label="Department" value={leaveData.dept} isRequired />
            <FormField label="Employee Remarks" value={leaveData.remarks} editable={isEditable} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Details</Text>
          <View style={styles.card}>
            <FormField label="Project" value={leaveData.project} />
            <FormField label="Applied Date" value={leaveData.appliedDate} />
            <FormField label="Payment Type" value={leaveData.paymentType} />
            <FormField label="Amount" value={leaveData.amount} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval Information</Text>
          <View style={styles.card}>
            <FormField label="Exit Date" value={leaveData.exitDate} />
            <FormField label="Reasons" value={leaveData.reasons} />
            <FormField label="Contingent Code" value={leaveData.contingentCode} />
            <FormField label="Contingent Name" value={leaveData.contingentName} />
            <FormField label="Contingent Designation" value={leaveData.contingentDesignation} />
            <FormField label="Contingent Department" value={leaveData.contingentDept} />
            <FormField label="Contingent Branch" value={leaveData.contingentBranch} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remarks</Text>
          <View style={styles.card}>
            <FormField label="Reporting Status" value={leaveData.reportingStatus} />
            <FormField label="Reporting Remarks" value={reportingRemarks} editable={isEditable} onChangeText={setReportingRemarks} />
            <FormField label="Account Status" value={leaveData.accountStatus} />
            <FormField label="Account Remarks" value={leaveData.accountRemarks} />
            <FormField label="Authorized Status" value={leaveData.authorizedStatus} />
            <FormField label="Application Status" value={leaveData.applicationStatus} />
          </View>
        </View>

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

        {isEditable && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#00C851' }]} onPress={() => setApprovalStatus('Approved')}>
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff4444' }]} onPress={() => setApprovalStatus('Rejected')}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E5E7EB' }]} onPress={handleSubmit}>
              <Text style={[styles.buttonText, { color: '#374151' }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#374151',
  },
  container: {
    padding: 16,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#374151',
    marginBottom: 4,
  },
  required: {
    color: '#DC2626',
  },
  fieldValue: {
    color: '#111827',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    marginRight: 8,
    fontWeight: '500',
    color: '#374151',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    color: '#111827',
    minHeight: 80,
  },
  charCount: {
    textAlign: 'right',
    color: '#6B7280',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ExpenseRequestedit;
