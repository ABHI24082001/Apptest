import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {Appbar} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import DatePicker from 'react-native-date-picker';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import FeedbackModal from '../component/FeedbackModal'; // Import FeedbackModal
import StatusCard from '../components/StatusCard'; // Import the StatusCard component
import Pagination from '../components/Pagination'; // Import the Pagination component
import BASE_URL from '../constants/apiConfig';
const statusTabs = [
  {label: 'Pending', color: '#FFA500', icon: 'clock-alert-outline'},
];

const LeaveRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const employeeDetails = useFetchEmployeeDetails();
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Show 5 items per page

 

  // Updated fetch data function with callback
  const fetchLeaveData = useCallback(async () => {
    try {
      setLoading(true);
      if (employeeDetails?.id) {
        const response = await axios.get(
          `${BASE_URL}/ApplyLeave/GetAllEmployeeApplyLeave/${employeeDetails.childCompanyId}/${employeeDetails.id}`,
        );
        setLeaveData(response.data);
        console.log('Fetched leave data:', response.data.length);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employeeDetails]);

  // Initial data loading
  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  // Reset to first page when filter changes or on refresh
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFromDate(null);
    setToDate(null);
    fetchLeaveData();
  }, [fetchLeaveData]);

  // Format date for display using the same format as ExpenseRequestStatus
  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Improved date filter function
  const filteredData = leaveData.filter(item => {
    if (!fromDate && !toDate) return true;

    const itemDate = new Date(item.createdDate || item.fromLeaveDate);
    const fromMatch = fromDate ? itemDate >= fromDate : true;
    const toMatch = toDate ? itemDate <= toDate : true;

    return fromMatch && toMatch;
  });
  
  // Get current items for the current page
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // When fromDate or toDate changes due to datePicker
  useEffect(() => {
    if (fromDate && toDate) {
      // Validate date range
      if (fromDate > toDate) {
        Alert.alert('Invalid Date Range', 'From Date cannot be after To Date', [
          {
            text: 'OK',
            onPress: () => setFromDate(null),
          },
        ]);
        return;
      }
    }
  }, [fromDate, toDate]);

  // Apply date filter
  const applyDateFilter = () => {
    if (!fromDate && !toDate) {
      Alert.alert('Filter Error', 'Please select at least one date to filter');
      return;
    }

    // If fromDate is set but toDate is not, set toDate to today
    if (fromDate && !toDate) {
      const today = new Date();
      setToDate(today);
    } else {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Clear filters function
  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      default:
        return '#6B7280';
    }
  };

  const handleDeleteLeave = async id => {
    try {
      const leaveToDelete = leaveData.find(item => item.id === id);
      console.log('Deleting leave data:', leaveToDelete); // Log the leave data being deleted
      console.log('Leave ID to delete:', id); // Log the ID being deleted

      const response = await axios.get(
        `${BASE_URL}/ApplyLeave/DeleteApplyLeave/${id}`,
      );

      if (response?.status === 200) {
        setLeaveData(prevData => prevData.filter(item => item.id !== id)); // Remove deleted leave from state
        setFeedbackMessage('Leave deleted successfully'); // Set success message
        setFeedbackVisible(true); // Show FeedbackModal
      } else {
        Alert.alert('Error', 'Failed to delete leave');
      }
    } catch (error) {
      console.error('Error deleting leave:', error);
      Alert.alert('Error', 'Failed to delete leave');
    }
  };

  const handleEditLeave = leaveDataToPass => {
    navigation.navigate('ApplyLeave', {leaveData: leaveDataToPass});
  };

  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Leave" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Date Filter Toggle Button */}
      <TouchableOpacity
        style={styles.filterToggleButton}
        onPress={() => setShowDateFilter(!showDateFilter)}>
        <View style={styles.filterToggleContent}>
          <Icon
            name={showDateFilter ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#3B82F6"
          />
          <Text style={styles.filterToggleText}>
            {showDateFilter ? 'Hide Date Filter' : 'Show Date Filter'}
          </Text>

          {/* Badge to show active filters */}
          {(fromDate || toDate) && (
            <View style={styles.activeDateFilterBadge}>
              <Text style={styles.activeDateFilterText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Collapsible Date Filter Section */}
      {showDateFilter && (
        <View style={styles.dateRangeContainer}>
          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                fromDate && {
                  borderColor: '#3B82F6',
                  backgroundColor: '#EFF6FF',
                },
              ]}
              onPress={() => setShowFromPicker(true)}>
              <View style={styles.dateButtonContent}>
                <Icon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {fromDate ? formatDate(fromDate) : 'From Date'}
                </Text>
              </View>
            </TouchableOpacity>

            <Icon
              name="arrow-right"
              size={20}
              color="#6B7280"
              style={styles.arrowIcon}
            />

            <TouchableOpacity
              style={[
                styles.dateButton,
                toDate && { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
              ]}
              onPress={() => setShowToPicker(true)}>
              <View style={styles.dateButtonContent}>
                <Icon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {toDate ? formatDate(toDate) : 'To Date'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.filterActions}>
            {(fromDate || toDate) && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={clearFilters}>
                <Icon name="close" size={16} color="#EF4444" />
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.applyFilterButton,
                !fromDate && !toDate && { opacity: 0.6 },
              ]}
              onPress={applyDateFilter}>
              <Icon name="filter" size={16} color="#FFFFFF" />
              <Text style={styles.applyFilterText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Pickers */}
      <DatePicker
        modal
        mode="date"
        open={showFromPicker}
        date={fromDate || new Date()}
        onConfirm={date => {
          setShowFromPicker(false);
          // Set time to beginning of day
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          setFromDate(startOfDay);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={showToPicker}
        date={toDate || new Date()}
        onConfirm={date => {
          setShowToPicker(false);
          // Set time to end of day
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          setToDate(endOfDay);
        }}
        onCancel={() => setShowToPicker(false)}
      />

      {/* Leave Cards with loading state and refresh control */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2962ff" />
          <Text style={styles.loaderText}>Loading leave data...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2962ff']}
              tintColor="#2962ff"
            />
          }>
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="file-document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No requests</Text>
              {(fromDate || toDate) && (
                <Text style={styles.emptySubText}>for selected date range</Text>
              )}
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={onRefresh}
              >
                <Icon name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Display only current page items */}
              {getCurrentItems().map(item => (
                <StatusCard
                  key={item.id}
                  title={`${item.employeeName || 'Leave Request'}`}
                  subtitle={`${item.fromLeaveDate ? formatDate(item.fromLeaveDate) : ''} to ${item.toLeaveDate ? formatDate(item.toLeaveDate) : ''}`}
                  details={[
                    {icon: 'briefcase-outline', label: 'Leave Type', value: item.leaveName || 'N/A'},
                    {icon: 'calendar-range', label: 'Leave Days', value: item.leaveDays || '0'},
                    {icon: 'clock-outline', label: 'Applied On', value: formatDate(item.createdDate)},
                  ]}
                  status={item.status || 'Pending'}
                  remarks={item.remarks}
                  onEdit={() => handleEditLeave(item)}
                  onDelete={() => item.status === 'Pending' && 
                    Alert.alert(
                      'Delete Leave Request',
                      'Are you sure you want to delete this leave request?',
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteLeave(item.id),
                        },
                      ],
                    )
                  }
                />
              ))}
              
              {/* Pagination component - only show if we have enough items */}
              {filteredData.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredData.length}
                />
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        type="deleted"
        message={feedbackMessage}
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
  filterToggleButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 8,
  },
  activeDateFilterBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeDateFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateRangeContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearFilterText: {
    marginLeft: 4,
    color: '#EF4444',
    fontWeight: '500',
    fontSize: 14,
  },
  applyFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  applyFilterText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
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
    shadowOffset: {width: 0, height: 1},
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
  editBtn: {
    backgroundColor: '#E0F7FA',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ACC1',
    marginLeft: 8,
  },
  editText: {
    color: '#00796B',
    fontSize: 13,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  
  // Add pagination styles if needed
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
