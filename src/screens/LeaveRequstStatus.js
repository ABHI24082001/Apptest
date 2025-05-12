// LeaveRequestStatusScreen.tsx

import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

const statusTabs = [
  {label: 'Pending', color: '#FFA500', icon: 'clock-alert-outline'},
  {label: 'Approved', color: '#00C851', icon: 'check-circle-outline'},
  {label: 'Rejected', color: '#ff4444', icon: 'close-circle-outline'},
];

const originalLeaveData = [
  {
    name: 'Ansuman Samal',
    role: '.Net Developer',
    dept: 'IT Dept',
    empId: '784512',
    recordId: 'ID5690',
    type: 'Leave',
    days: 2,
    date: '9 April 2025 - 10 April 2025',
    reason: 'Personal',
    status: 'Pending',
    appliedOn: '4/3/2025 06:45:54 PM',
  },
  {
    name: 'Priya Sharma',
    role: 'UI Designer',
    dept: 'Design',
    empId: '145236',
    recordId: 'ID5691',
    type: 'Sick Leave',
    days: 1,
    date: '6 April 2025',
    reason: 'Health Issue',
    status: 'Approved',
    appliedOn: '4/1/2025 02:15:22 PM',
  },
  {
    name: 'Ravi Kumar',
    role: 'HR Executive',
    dept: 'HR',
    empId: '784999',
    recordId: 'ID5692',
    type: 'Casual Leave',
    days: 3,
    date: '1 April 2025 - 3 April 2025',
    reason: 'Family Function',
    status: 'Rejected',
    appliedOn: '3/29/2025 10:30:00 AM',
  },
];

const LeaveRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const filteredData = originalLeaveData.filter(
    item => item.status === selectedStatus,
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#2F3846" />
        </TouchableOpacity>
        <Text style={styles.title}>Leave Request Status</Text>
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
            onPress={() => setSelectedStatus(tab.label)}>
            <Icon
              name={tab.icon}
              size={18}
              color={tab.color}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, {color: tab.color}]}>
              {tab.label} (
              {
                originalLeaveData.filter(item => item.status === tab.label)
                  .length
              }
              )
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leave Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {selectedStatus} requests</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate('LeaveRequestDetails', {item})}
              activeOpacity={0.9}>
              <View style={styles.card}>
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
                    <Text
                      style={[
                        styles.statusText,
                        {color: getStatusColor(item.status)},
                      ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subtitle}>
                  {item.role}, {item.dept}
                </Text>

                <View style={styles.detailRow}>
                  <Icon name="identifier" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>ID: {item.empId}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon
                    name="file-document-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.detailText}>
                    Record ID: {item.recordId}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon
                    name="calendar-blank-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.detailText}>
                    {item.date} ({item.days} day{item.days > 1 ? 's' : ''})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="information-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {item.type} • {item.reason}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateRow}>
                    <Icon
                      name="clock-time-four-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text style={styles.timestamp}>{item.appliedOn}</Text>
                  </View>
                  {item.status === 'Pending' && (
                    <TouchableOpacity style={styles.cancelBtn}>
                      <Text style={styles.cancelText}>Cancel Request</Text>
                    </TouchableOpacity>
                  )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
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
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
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
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
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
});

export default LeaveRequestStatusScreen;
