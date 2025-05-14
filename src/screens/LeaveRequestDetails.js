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
              backgroundColor: `${getStatusColor(item.status)}15`,
              borderColor: getStatusColor(item.status),
            },
          ]}>
          <Text style={[styles.statusText, {color: getStatusColor(item.status)}]}>
            {item.status}
          </Text>
        </View>
        
        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('LeaveRequestedit')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
  
      {/* Role & Department */}
      <Text style={styles.subtext}>{item.role} • {item.dept}</Text>
  
      {/* Leave Dates */}
      {/* <View style={styles.dateRow}>
        <Icon name="calendar" size={16} color="#6B7280" />
        <Text style={styles.dateText}>{item.date}</Text>
      </View> */}
  
      {/* Additional Details */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Emp ID: {item.empId}</Text>
        <Text style={styles.metaText}>Record ID: {item.recordId}</Text>
        <Text style={styles.metaText}>Leave Type: {item.type}</Text>
        <Text style={styles.metaText}>Days: {item.days}</Text>
        <Text style={styles.metaText}>Reason: {item.reason}</Text>
        <Text style={styles.metaText}>Applied On: {item.appliedOn}</Text>
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
        <Text style={styles.headerTitle}>Leave Request Status</Text>
        <View style={{width: 24}} /> {/* Placeholder to center title */}
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.list}
        data={originalLeaveData}
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

export default LeaveRequestStatusScreen;
