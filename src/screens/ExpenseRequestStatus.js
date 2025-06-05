import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import DatePicker from 'react-native-date-picker';
// /api/ApplyLeave/GetAllEmployeeApplyLeave/{CompanyId}/{UserId}
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
    paymentType: 'Expense',
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
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null); // 'Expense' | 'Advance' | null


  const filteredData = expenseData.filter((item) => {
    const matchesStatus = item.status === selectedStatus;
    const matchesPayment = selectedPaymentType ? item.paymentType === selectedPaymentType : true;
  
    if (!fromDate && !toDate) return matchesStatus && matchesPayment;
  
    const itemDate = new Date(item.appliedDate);
    const fromMatch = fromDate ? itemDate >= fromDate : true;
    const toMatch = toDate ? itemDate <= toDate : true;
  
    return matchesStatus && fromMatch && toMatch && matchesPayment;
  });
  

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#FFA500',
      Approved: '#00C851',
      Rejected: '#ff4444',
    };
    return colors[status] || '#6B7280';
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="  My Expense" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Status Tabs */}
      <View style={styles.tabWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {statusTabs.map((tab, index) => {
            const isActive = selectedStatus === tab.label;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tab,
                  isActive && {
                    backgroundColor: `${tab.color}15`,
                    borderColor: tab.color,
                  },
                ]}
                onPress={() => setSelectedStatus(tab.label)}
              >
                <Icon name={tab.icon} size={18} color={tab.color} style={styles.tabIcon} />
                <Text style={[
                  styles.tabText,
                  { color: tab.color, fontWeight: isActive ? 'bold' : '600' },
                ]}>
                  {tab.label} ({expenseData.filter(item => item.status === tab.label).length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Date Filter */}
      <View style={styles.dateRangeContainer}>
        <Text style={styles.filterTitle}>Filter by Applied Date</Text>
        <View style={styles.datePickerRow}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={18} color="#3B82F6" />
              <Text style={styles.dateButtonText}>{fromDate ? formatDate(fromDate) : 'From Date'}</Text>
            </View>
          </TouchableOpacity>

          <Icon name="arrow-right" size={20} color="#6B7280" style={styles.arrowIcon} />

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={18} color="#3B82F6" />
              <Text style={styles.dateButtonText}>{toDate ? formatDate(toDate) : 'To Date'}</Text>
            </View>
          </TouchableOpacity>

          {(fromDate || toDate) && (
            <TouchableOpacity style={styles.clearButton} onPress={() => {
              setFromDate(null);
              setToDate(null);
            }}>
              <Icon name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Pickers */}
      <DatePicker
        modal
        mode="date"
        open={showFromPicker}
        date={fromDate || new Date()}
        onConfirm={(date) => {
          setShowFromPicker(false);
          setFromDate(date);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={showToPicker}
        date={toDate || new Date()}
        onConfirm={(date) => {
          setShowToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setShowToPicker(false)}
      />

      {/* Payment Type Filter */}
<View style={styles.paymentTypeContainer}>
  <Text style={styles.filterTitle}>Filter by Payment Type</Text>
  <View style={styles.paymentTypeRow}>
    {['Advance', 'Expense'].map((type) => {
      const isActive = selectedPaymentType === type;
      return (
        <TouchableOpacity
          key={type}
          style={[
            styles.paymentTypeButton,
            isActive && {
              backgroundColor: '#E0F2FE',
              borderColor: '#3B82F6',
            },
          ]}
          onPress={() => setSelectedPaymentType(type === selectedPaymentType ? null : type)}
        >
          <Text style={[
            styles.paymentTypeText,
            { color: isActive ? '#1D4ED8' : '#374151' },
          ]}>
            {type}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>


      {/* Expense Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {selectedStatus} requests</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.designation}, {item.dept}</Text>

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

              <View style={styles.cardHeader}>
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
            </View>
          ))
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tabWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 10,
  },
  tabIcon: { marginRight: 6 },
  tabText: { fontSize: 14 },

  dateRangeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  arrowIcon: { marginHorizontal: 8 },
  clearButton: { marginLeft: 12, padding: 8 },

  scrollContainer: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  paymentTypeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentTypeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  paymentTypeButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  cardHeader: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  name: { fontWeight: '800', fontSize: 16, color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { fontSize: 15, color: '#4B5563', marginLeft: 8 },
  statusBadge: {
    paddingVertical: 6,
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
