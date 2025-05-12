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

const exitRequestData = [
  {
    empId: 'AA_13',
    name: 'Geoffrey Buckley',
    role: 'Customer Service Manager',
    dept: 'Customer Service',
    appliedDate: '01-03-2025',
    exitDate: '31-03-2025',
    reason: 'JLSd',
    accountStatus: 'Pending',
    authorizedStatus: 'Pending',
    status: 'Pending',
  },
  {
    empId: 'AA_14',
    name: 'Sarah Williams',
    role: 'HR Specialist',
    dept: 'Human Resources',
    appliedDate: '15-04-2025',
    exitDate: '30-04-2025',
    reason: 'Relocation',
    accountStatus: 'Approved',
    authorizedStatus: 'Pending',
    status: 'Pending',
  },
  {
    empId: 'AA_15',
    name: 'James Smith',
    role: 'Software Engineer',
    dept: 'Technology',
    appliedDate: '20-04-2025',
    exitDate: '20-05-2025',
    reason: 'Personal',
    accountStatus: 'Pending',
    authorizedStatus: 'Approved',
    status: 'Approved',
  },
];


const ExitRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  const filteredData = exitRequestData.filter(
    item => item.status === selectedStatus
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#2F3846" />
        </TouchableOpacity>
        <Text style={styles.title}>Exit Request Status</Text>
      </View>

      {/* Status Tabs */}
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
              {exitRequestData.filter(item => item.status === tab.label).length}
              )
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {selectedStatus} requests</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
           <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => navigation.navigate('ExitRequestDetails', {item})}>
             <View key={index} style={styles.card}>
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

              <Text style={styles.subtitle}>{item.role}, {item.dept}</Text>

              <InfoRow icon="identifier" label={`ID: ${item.empId}`} />
              <InfoRow icon="calendar-edit" label={`Applied: ${item.appliedDate}`} />
              <InfoRow icon="calendar-remove-outline" label={`Exit: ${item.exitDate}`} />
              <InfoRow icon="information-outline" label={`Reason: ${item.reason}`} />
              <InfoRow icon="shield-check-outline" label={`Account Status: ${item.accountStatus}`} />
              <InfoRow icon="account-check-outline" label={`Authorized Status: ${item.authorizedStatus}`} />

              {/* <View style={styles.manageRow}>
                <Icon name="tools" size={20} color="#6B7280" />
                <Text style={styles.manageText}>Manage</Text>
              </View> */}
            </View>
           </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={16} color="#6B7280" />
    <Text style={styles.detailText}>{label}</Text>
  </View>
);

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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontWeight: '600', fontSize: 16, color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  manageText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
});

export default ExitRequestStatusScreen;
