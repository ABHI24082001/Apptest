import React from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const updatedExitData = [
  {
    name: 'Ansuman Samal',
    role: '.Net Developer',
    dept: 'IT Dept',
    empId: '784512',
    recordId: 'ID5690',
    exitDate: '12/06/2025',
    reasons: 'Testing Exit Flow',
    contingentCode: 'AA_28',
    contingentName: 'Abhishek',
    contingentDesignation: 'Accounts Executive',
    contingentDept: 'Accounts',
    contingentBranch: 'Mumbai',
    reportingStatus: 'Pending',
    reportingRemarks: '—',
    accountStatus: 'Pending',
    accountRemarks: 'Account’s Remarks',
    authorizedStatus: 'Reject',
    applicationStatus: 'In Progress',
    remarks: '100 characters remaining',
    managerApprovalStatus: 'Pending',
    hrRemarks: 'Awaiting final review',
    exitApprovalStatus: 'Pending',
    finalRemarks: 'Awaiting exit clearance from HR'
  },
  {
    name: 'Priya Sharma',
    role: 'UI Designer',
    dept: 'Design',
    empId: '145236',
    recordId: 'ID5691',
    exitDate: '12/06/2025',
    reasons: 'Testing Exit Flow',
    contingentCode: 'AA_28',
    contingentName: 'Abhishek',
    contingentDesignation: 'Accounts Executive',
    contingentDept: 'Accounts',
    contingentBranch: 'Mumbai',
    reportingStatus: 'Pending',
    reportingRemarks: '—',
    accountStatus: 'Pending',
    accountRemarks: 'Account’s Remarks',
    authorizedStatus: 'Reject',
    applicationStatus: 'In Progress',
    remarks: '100 characters remaining',
    managerApprovalStatus: 'Pending',
    hrRemarks: 'Awaiting final review',
    exitApprovalStatus: 'Pending',
    finalRemarks: 'Awaiting exit clearance from HR'
  },
  {
    name: 'Ravi Kumar',
    role: 'HR Executive',
    dept: 'HR',
    empId: '784999',
    recordId: 'ID5692',
    exitDate: '12/06/2025',
    reasons: 'Testing Exit Flow',
    contingentCode: 'AA_28',
    contingentName: 'Abhishek',
    contingentDesignation: 'Accounts Executive',
    contingentDept: 'Accounts',
    contingentBranch: 'Mumbai',
    reportingStatus: 'Pending',
    reportingRemarks: '—',
    accountStatus: 'Pending',
    accountRemarks: 'Account’s Remarks',
    authorizedStatus: 'Reject',
    applicationStatus: 'In Progress',
    remarks: '100 characters remaining',
    managerApprovalStatus: 'Pending',
    hrRemarks: 'Awaiting final review',
    exitApprovalStatus: 'Pending',
    finalRemarks: 'Awaiting exit clearance from HR'
  }
];

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

const EditRequestDetails = () => {
  const navigation = useNavigation();

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LeaveRequestDetails', {item})}>
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${getStatusColor(item.reportingStatus)}15`,
              borderColor: getStatusColor(item.reportingStatus),
            },
          ]}>
          <Text style={[styles.statusText, {color: getStatusColor(item.reportingStatus)}]}>
            {item.reportingStatus}
          </Text>
        </View>
        
        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ExitRequestedit')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
  
      {/* Role & Department */}
      <Text style={styles.subtext}>{item.role} • {item.dept}</Text>
  
      {/* Leave Dates */}
      <View style={styles.dateRow}>
        <Icon name="calendar" size={16} color="#6B7280" />
        <Text style={styles.dateText}>{item.exitDate}</Text>
      </View>
  
      {/* Additional Details */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Emp ID: {item.empId}</Text>
        <Text style={styles.metaText}>Record ID: {item.recordId}</Text>
        <Text style={styles.metaText}>Exit Date: {item.exitDate}</Text>
        <Text style={styles.metaText}>Reason: {item.reasons}</Text>
        <Text style={styles.metaText}>Manager Approval: {item.managerApprovalStatus}</Text>
        <Text style={styles.metaText}>HR Remarks: {item.hrRemarks}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#F9FAFB'}}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exit Request Status</Text>
        <View style={{width: 24}} /> {/* Placeholder to center title */}
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.list}
        data={updatedExitData}
        keyExtractor={(item, index) => item.recordId + index}
        renderItem={renderItem}
      />
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    marginTop: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EditRequestDetails;
