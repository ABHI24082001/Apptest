// ExpenseRequestStatusScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusTabs = [
  { label: 'Pending', color: '#FFA500', icon: 'clock-alert-outline' },
  { label: 'Approved', color: '#00C851', icon: 'check-circle-outline' },
  { label: 'Rejected', color: '#ff4444', icon: 'close-circle-outline' },
];

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
  },
];

const ExpenseRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  const filteredData = expenseData.filter(item => item.status === selectedStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#2F3846" />
        </TouchableOpacity>
        <Text style={styles.title}>Expense Request Status</Text>
      </View>

      <View style={styles.tabContainer}>
        {statusTabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              selectedStatus === tab.label && {
                backgroundColor: `${tab.color}15`,
                borderColor: tab.color,
              },
            ]}
            onPress={() => setSelectedStatus(tab.label)}
          >
            <Icon name={tab.icon} size={18} color={tab.color} style={styles.tabIcon} />
            <Text style={[styles.tabText, { color: tab.color }]}>
              {tab.label} (
              {expenseData.filter(item => item.status === tab.label).length}
              )
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {selectedStatus} requests</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => navigation.navigate('ExpenseRequestDetails', {item})}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(item.status)}15`,
                      borderColor: getStatusColor(item.status),
                    },
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subtitle}>{item.designation}, {item.dept}</Text>

                <View style={styles.detailRow}>
                  <Icon name="identifier" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Employee ID: {item.empId}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="briefcase-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Project: {item.project}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="calendar-blank-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Applied On: {item.appliedDate}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="cash-multiple" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Type: {item.paymentType}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="currency-inr" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Amount: {item.amount}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="message-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Remarks: {item.remarks}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return '#FFA500';
    case 'Approved': return '#00C851';
    case 'Rejected': return '#ff4444';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 4, marginRight: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#111827' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabIcon: { marginRight: 6 },
  tabText: { fontWeight: '600', fontSize: 14 },
  scrollContainer: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontWeight: '600', fontSize: 16, color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#4B5563', marginLeft: 8 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
});

export default ExpenseRequestStatusScreen;
