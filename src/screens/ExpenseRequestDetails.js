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

// New data structure for expense requests
const expenseData = [
  {
    empId: 'AA_10',
    name: 'William Puckett',
    dept: 'Human Resources',
    designation: 'HR Manager',
    project: '—',
    appliedDate: '24-Apr-2025',
    paymentType: 'Advance',
    amount: '₹48,956',
    remarks: 'Client visit travel expenses',
    status: 'Pending',
    exitDate: '—',
    reasons: '—',
    contingentCode: '—',
    contingentName: '—',
    contingentDesignation: '—',
    contingentDept: '—',
    contingentBranch: '—',
    reportingStatus: 'Pending',
    reportingRemarks: '—',
    accountStatus: 'Pending',
    accountRemarks: '—',
    authorizedStatus: 'Pending',
    applicationStatus: 'Pending',
  },
  {
    empId: 'BB_23',
    name: 'Amanda Reeves',
    dept: 'Finance',
    designation: 'Accounts Executive',
    project: 'Annual Budget 2025',
    appliedDate: '18-Apr-2025',
    paymentType: 'Reimbursement',
    amount: '₹9,250',
    remarks: 'Hotel stay and meals',
    status: 'Approved',
    exitDate: '—',
    reasons: '—',
    contingentCode: '—',
    contingentName: '—',
    contingentDesignation: '—',
    contingentDept: '—',
    contingentBranch: '—',
    reportingStatus: 'Approved',
    reportingRemarks: '—',
    accountStatus: 'Approved',
    accountRemarks: '—',
    authorizedStatus: 'Approved',
    applicationStatus: 'Approved',
  },
  {
    empId: 'CC_35',
    name: 'Daniel Kim',
    dept: 'IT',
    designation: 'Software Engineer',
    project: 'Mobile App Revamp',
    appliedDate: '10-Apr-2025',
    paymentType: 'Advance',
    amount: '₹12,000',
    remarks: 'Conference registration',
    status: 'Rejected',
    exitDate: '—',
    reasons: '—',
    contingentCode: '—',
    contingentName: '—',
    contingentDesignation: '—',
    contingentDept: '—',
    contingentBranch: '—',
    reportingStatus: 'Rejected',
    reportingRemarks: '—',
    accountStatus: 'Rejected',
    accountRemarks: '—',
    authorizedStatus: 'Rejected',
    applicationStatus: 'Rejected',
  },
];

const getStatusColor = (status: string) => {
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

const ExpenseRequestDetails = () => {
  const navigation = useNavigation();

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ExpenseRequestDetails', {item})}>
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${getStatusColor(item.status)}15`,
              borderColor: getStatusColor(item.status),
            },
          ]}>
          <Text style={[styles.statusText, {color: getStatusColor(item.status)}]}>
            {item.status}
          </Text>
        </View>
        
        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ExpenseRequestedit')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
  
      {/* Role & Department */}
      <Text style={styles.subtext}>{item.designation} • {item.dept}</Text>
  
      {/* Applied Date */}
      <View style={styles.dateRow}>
        <Icon name="calendar" size={16} color="#6B7280" />
        <Text style={styles.dateText}>Applied on: {item.appliedDate}</Text>
      </View>
  
      {/* Additional Details */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Employee ID: {item.empId}</Text>
        <Text style={styles.metaText}>Payment Type: {item.paymentType}</Text>
        <Text style={styles.metaText}>Amount: {item.amount}</Text>
        <Text style={styles.metaText}>Remarks: {item.remarks}</Text>
        <Text style={styles.metaText}>Exit Date: {item.exitDate}</Text>
        <Text style={styles.metaText}>Reasons: {item.reasons}</Text>
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
        <Text style={styles.headerTitle}>Expense Request Status</Text>
        <View style={{width: 24}} /> {/* Placeholder to center title */}
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.list}
        data={expenseData}
        keyExtractor={(item, index) => item.empId + index}
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

export default ExpenseRequestDetails;
