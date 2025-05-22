import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AppSafeArea from '../component/AppSafeArea';
import { Appbar, Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

const ExpenseRequestDetails = [
  {
    id: '1',
    empId: 'AA_10',
    name: 'William Puckett',
    dept: 'Human Resources',
    designation: 'HR Manager',
    project: 'Travel Food',
    appliedDate: '24-Apr-2025',
    paymentType: 'Advance',
    amount: '₹48,956',
    remarks: 'Client visit travel expenses',
    status: 'Pending',
  },
  {
    id: '2',
    empId: 'BB_23',
    name: 'Amanda Reeves',
    dept: 'Finance',
    designation: 'Accounts Executive',
    project: 'Annual Budget 2025',
    appliedDate: '18-Apr-2025',
    paymentType: 'Expense',
    amount: '₹9,250',
    remarks: 'Hotel stay and meals',
    status: 'Pending',
  },
  {
    id: '3',
    empId: 'CC_35',
    name: 'Daniel Kim',
    dept: 'IT',
    designation: 'Software Engineer',
    project: 'Mobile App Revamp',
    appliedDate: '10-Apr-2025',
    paymentType: 'Advance',
    amount: '₹12,000',
    remarks: 'Conference registration',
    status: 'Pending',
  },
];

const PaymentTypeColors = {
  Advance: '#3b82f6', // Blue
  Expense: '#10b981', // Green
};

const ExpenseRequest = ({ navigation }) => {
  const [rmRemarks, setRmRemarks] = useState({});
  const [approvalRemarks, setApprovalRemarks] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [amounts, setAmounts] = useState(() => {
    const initialAmounts = {};
    ExpenseRequestDetails.forEach(item => {
      initialAmounts[item.id] = item.amount.replace('₹', ''); // Store without ₹ symbol
    });
    return initialAmounts;
  });

  const handleApprove = (id) => {
    if (!rmRemarks[id]?.trim()) {
      alert('Please add remarks before approving');
      return;
    }
    alert(`Approved expense request ID: ${id} with amount: ₹${amounts[id]}`);
  };

  const handleReject = (id) => {
    if (!rmRemarks[id]?.trim()) {
      alert('Please add remarks before rejecting');
      return;
    }
    alert(`Rejected expense request ID: ${id} with amount: ₹${amounts[id]}`);
  };

  const toggleCardExpansion = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleAmountChange = (text, id) => {
    // Remove all non-digit characters except commas
    const cleanedText = text.replace(/[^0-9,]/g, '');
    
    // Format the number with commas
    let formattedValue = cleanedText;
    if (cleanedText.length > 3) {
      const parts = cleanedText.split(',');
      const numberPart = parts.join(''); // Remove existing commas
      formattedValue = numberPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    setAmounts(prev => ({ ...prev, [id]: formattedValue }));
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedCard === item.id;
    const paymentColor = PaymentTypeColors[item.paymentType] || '#6b7280';

    return (
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => toggleCardExpansion(item.id)}
        activeOpacity={0.9}
      >
        {/* Header section */}
        <View style={styles.cardHeader}>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeDetail}>{item.designation}</Text>
              <Text style={styles.employeeDetail}>• {item.dept}</Text>
            </View>
          </View>
        </View>

        {/* Payment info */}
        <View style={styles.paymentInfoContainer}>
          <View style={styles.paymentTypeContainer}>
            <Chip
              style={[styles.paymentTypeChip, { backgroundColor: `${paymentColor}20` }]}
              textStyle={{ color: paymentColor, fontWeight: '800' }}
            >
              {item.paymentType}
            </Chip>

            <View style={styles.amountBox}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amounts[item.id]}
                onChangeText={(text) => handleAmountChange(text, item.id)}
                keyboardType="numeric"
                maxLength={15}
                placeholder="0"
                placeholderTextColor="#065f46"
              />
            </View>
          </View>

          <View style={styles.projectContainer}>
            <Text style={styles.projectLabel}>Project:</Text>
            <Text style={styles.projectValue}>{item.project}</Text>
          </View>
        </View>

        {/* Applied date */}
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={16} color="#6b7280" />
          <Text style={styles.dateText}>Applied on: {item.appliedDate}</Text>
        </View>

        {/* Expanded section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Divider style={styles.divider} />

            {/* Remarks section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Remarks</Text>
              <Text style={styles.reasonText}>
                {item.remarks ? item.remarks : 'No remarks provided'}
              </Text>
            </View>

            {/* Reporting Manager Remarks */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Reporting Manager Remarks</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add your remarks here"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={rmRemarks[item.id] || ''}
                onChangeText={(text) => setRmRemarks((prev) => ({ ...prev, [item.id]: text }))}
              />
            </View>

            {/* Approval Remarks (optional) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Final Approve Manager Remarks</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add approval Manager remarks"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={approvalRemarks[item.id] || ''}
                onChangeText={(text) => setApprovalRemarks((prev) => ({ ...prev, [item.id]: text }))}
              />
            </View>

            {/* Action Buttons */}
            {item.status === 'Pending' && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  onPress={() => handleApprove(item.id)}
                >
                  <Icon name="check" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(item.id)}
                >
                  <Icon name="x" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#4B5563" />
        <Appbar.Content title="Expense Requests" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={ExpenseRequestDetails}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  expandedCard: {
    elevation: 4,
    shadowOpacity: 0.12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  employeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeDetail: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 8,
  },
  paymentInfoContainer: {
    marginBottom: 10,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  paymentTypeChip: {
    height: 35,
    marginRight: 12,
  },
  amountBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    minWidth: 100,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    marginRight: 2,
  },
  amountInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    padding: 0,
    flex: 1,
    minWidth: 60,
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 4,
  },
  projectValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  expandedSection: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e5e7eb',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827',
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ExpenseRequest;