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
import { Appbar } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';


const statusTabs = [
  { label: 'Pending', color: '#FFA500', icon: 'clock-alert-outline' },
  { label: 'Approved', color: '#00C851', icon: 'check-circle-outline' },
  { label: 'Rejected', color: '#ff4444', icon: 'close-circle-outline' },
];

const originalLeaveData = [
  {
    name: 'Ansuman Samal',
    role: '.Net Developer',
    dept: 'IT Dept',
    empId: '784512',
    recordId: 'ID5690',
    type: 'Sick Leave',
    days: 2,
    date: '9 April 2025 - 10 April 2025',
    reason: 'Sick Leave',
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

const LeaveRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const filteredData = originalLeaveData.filter(
    item => item.status === selectedStatus,
  );

  return (
   <AppSafeArea>
     {/* Header */}

      <Appbar.Header elevated style={styles.header}>
             <Appbar.BackAction onPress={() => navigation.goBack()} />
             <Appbar.Content title="Leave Request" titleStyle={styles.headerTitle} />
           </Appbar.Header>
     
      {/* Status Tabs */}
      <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
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
              {originalLeaveData.filter(item => item.status === tab.label).length})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
            <TouchableOpacity key={index} activeOpacity={0.9}>
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
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subtitle}>{item.role}, {item.dept}</Text>

                <View style={styles.detailRow}>
                  <Icon name="calendar-blank-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {item.date} ({item.days} day{item.days > 1 ? 's' : ''})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="information-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Leave type</Text>
                  <Text style={styles.detailText}>: {item.type}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateRow}>
                    <Icon name="clock-time-four-outline" size={14} color="#9CA3AF" />
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
   </AppSafeArea>
  );
};

export default LeaveRequestStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
 header: {
     backgroundColor: '#fff',
     elevation: Platform.OS === 'android' ? 4 : 0,
   },
   headerTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#333',
   },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
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
  tabScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 15,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontWeight: '700',
    fontSize: 17,
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 17,
    color: '#9CA3AF',
  },
});
