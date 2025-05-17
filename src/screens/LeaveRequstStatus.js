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
import { Appbar } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import Pagination from '../component/Pagination';
import DatePicker from 'react-native-date-picker';

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
  // More records added below
  {
  name: 'Neha Singh',
  role: 'Marketing Manager',
  dept: 'Marketing',
  empId: '963852',
  recordId: 'ID5693',
  type: 'Casual Leave',
  days: 1,
  date: '12 April 2025',
  reason: 'Personal Work',
  status: 'Pending',
  appliedOn: '4/7/2025 09:20:14 AM',
  },
  {
  name: 'Manish Joshi',
  role: 'Finance Analyst',
  dept: 'Finance',
  empId: '741258',
  recordId: 'ID5694',
  type: 'Earned Leave',
  days: 5,
  date: '15 April 2025 - 19 April 2025',
  reason: 'Vacation',
  status: 'Approved',
  appliedOn: '4/5/2025 04:50:33 PM',
  },
  {
  name: 'Sunita Verma',
  role: 'Project Manager',
  dept: 'IT Dept',
  empId: '852369',
  recordId: 'ID5695',
  type: 'Sick Leave',
  days: 2,
  date: '20 April 2025 - 21 April 2025',
  reason: 'Flu',
  status: 'Rejected',
  appliedOn: '4/15/2025 11:45:00 AM',
  },
  {
  name: 'Rajesh Kumar',
  role: 'Sales Executive',
  dept: 'Sales',
  empId: '963741',
  recordId: 'ID5696',
  type: 'Casual Leave',
  days: 1,
  date: '22 April 2025',
  reason: 'Family Emergency',
  status: 'Pending',
  appliedOn: '4/20/2025 08:30:00 AM',
  },
  {
  name: 'Aarti Desai',
  role: 'HR Manager',
  dept: 'HR',
  empId: '159753',
  recordId: 'ID5697',
  type: 'Maternity Leave',
  days: 30,
  date: '1 May 2025 - 30 May 2025',
  reason: 'Maternity',
  status: 'Approved',
  appliedOn: '4/10/2025 01:15:45 PM',
  },
  {
  name: 'Karan Mehta',
  role: 'Software Engineer',
  dept: 'IT Dept',
  empId: '357951',
  recordId: 'ID5698',
  type: 'Casual Leave',
  days: 2,
  date: '25 April 2025 - 26 April 2025',
  reason: 'Personal',
  status: 'Pending',
  appliedOn: '4/18/2025 10:00:00 AM',
  },
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

const ITEMS_PER_PAGE = 2;

const LeaveRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-GB') : 'Select';
  };

  // Filter data by selected status and date range
  const filteredData = originalLeaveData.filter(item => {
    const matchesStatus = item.status === selectedStatus;
    if (!fromDate && !toDate) return matchesStatus;
    
    const itemDate = new Date(item.appliedOn.split(' ')[0]);
    const fromMatch = fromDate ? itemDate >= fromDate : true;
    const toMatch = toDate ? itemDate <= toDate : true;
    
    return matchesStatus && fromMatch && toMatch;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Paginate filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, fromDate, toDate]);

  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Leave" titleStyle={styles.headerTitle} />
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

      {/* Date Range Picker */}
      <View style={styles.dateRangeContainer}>
        <Text style={styles.filterTitle}>Filter by Applied Date</Text>
        <View style={styles.datePickerRow}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowFromPicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={18} color="#3B82F6" />
              <Text style={styles.dateButtonText}>
                {fromDate ? formatDate(fromDate) : 'From Date'}
              </Text>
            </View>
          </TouchableOpacity>

          <Icon name="arrow-right" size={20} color="#6B7280" style={styles.arrowIcon} />

          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowToPicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={18} color="#3B82F6" />
              <Text style={styles.dateButtonText}>
                {toDate ? formatDate(toDate) : 'To Date'}
              </Text>
            </View>
          </TouchableOpacity>

          {(fromDate || toDate) && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setFromDate(null);
                setToDate(null);
              }}
            >
              <Icon name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Leave Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {paginatedData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {selectedStatus} requests</Text>
            {(fromDate || toDate) && (
              <Text style={styles.emptySubText}>for selected date range</Text>
            )}
          </View>
        ) : (
          paginatedData.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9}>
              <View style={styles.card}>
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

                <View style={styles.detailRow}>
                  <Icon name="clock-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Applied on: {item.appliedOn}</Text>
                </View>

                <View style={styles.cardFooter}>
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
                  {item.status === 'Pending' && (
                    <TouchableOpacity style={styles.cancelBtn}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowFromPicker(false);
          setFromDate(date);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        open={showToPicker}
        date={toDate || new Date()}
        mode="date"
        minimumDate={fromDate}
        onConfirm={(date) => {
          setShowToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setShowToPicker(false)}
      />
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
    justifyContent: 'space-between',
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
  arrowIcon: {
    marginHorizontal: 8,
  },
  clearButton: {
    marginLeft: 12,
    padding: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
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
