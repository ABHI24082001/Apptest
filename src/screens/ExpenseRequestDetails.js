import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ExpenseRequestDetails = () => {
  const route = useRoute();
  const {item} = route.params;
  const navigation = useNavigation();

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#2F3846" />
        </TouchableOpacity>

        <Text style={styles.title}>Expense Request Details</Text>

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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <DetailRow icon="account" label="Name" value={item.name} />
          <DetailRow icon="briefcase" label="Designation" value={item.designation} />
          <DetailRow icon="office-building" label="Department" value={item.dept} />
          <DetailRow icon="identifier" label="Employee ID" value={item.empId} />
          <DetailRow icon="calendar-blank-outline" label="Applied On" value={item.appliedDate} />
          <DetailRow icon="briefcase-outline" label="Project" value={item.project} />
          <DetailRow icon="cash-multiple" label="Type" value={item.paymentType} />
          <DetailRow icon="currency-inr" label="Amount" value={item.amount} />
          <DetailRow icon="message-outline" label="Remarks" value={item.remarks} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({icon, label, value}: {icon: string; label: string; value: string}) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={18} color="#6B7280" style={{marginRight: 12}} />
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  backButton: {
    zIndex: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});

export default ExpenseRequestDetails;
