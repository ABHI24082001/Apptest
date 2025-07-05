import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  Appbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import moment from 'moment';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import StatusCard from '../components/StatusCard';
import TabFilter from '../components/TabFilter'; // Import TabFilter component
import BASE_URL from '../constants/apiConfig';


const LeaveReportScreen = ({ navigation }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // New state for status filter
  const [leaveData, setLeaveData] = useState([]); // State for leave data
  const [expandedCardIndex, setExpandedCardIndex] = useState(null); // State to track expanded card
  const [animationHeight] = useState(new Animated.Value(0)); // Animated height state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // New state for toggling filter sections
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showLeaveTypeFilter, setShowLeaveTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  // Modified state for filter values to work with TabFilter
  const [selectedLeaveType, setSelectedLeaveType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const employeeDetails = useFetchEmployeeDetails();

  console.log('Employee====================================== Details:', employeeDetails); // Debug employee details

  // Add refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaveData();
  }, []);

  // Move fetch to useCallback for refresh
  const fetchLeaveData = useCallback(async () => {
    setLoading(true);
    try {
      if (employeeDetails?.id) {
        const response = await axios.get(
          `${BASE_URL}/ApplyLeave/GetAllEmployeeApplyLeave/${employeeDetails.childCompanyId}/${employeeDetails.id}`
        );
        setLeaveData(response.data);
        console.log('Fetched leave data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employeeDetails]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YY') : 'Select';
  };

  // Updated filterData function to work with new filter states
  const filterData = () => {
    return leaveData.filter(item => {
      const itemDate = new Date(item.fromLeaveDate);
      
      const fromMatch = fromDate ? itemDate >= new Date(fromDate) : true;
      const toMatch = toDate ? itemDate <= new Date(toDate) : true;
      
      // Updated filter logic for leave type
      const leaveTypeMatch = selectedLeaveType === 'All' 
        ? true 
        : item.leaveName === selectedLeaveType;
      
      // Updated filter logic for status
      const statusMatch = selectedStatus === 'All' 
        ? true 
        : item.status === selectedStatus;
      
      return fromMatch && toMatch && leaveTypeMatch && statusMatch;
    });
  };

  const renderAppBar = () => (
    <Appbar.Header elevated style={styles.header}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title="Leave Report" titleStyle={styles.headerTitle} />
    </Appbar.Header>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Filter By Leave Type */}
      <View style={styles.filterToggleButton}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon name="filter-variant" size={22} color="#3B82F6" />
          <Text style={styles.filterToggleText}>Leave Type Filters</Text>
        </View>
      </View>

      {/* Collapsible Leave Type Filter */}
      {showLeaveTypeFilter && (
        <View style={styles.tabFilterContainer}>
          <TabFilter
            tabs={[
              {label: 'All', value: 'All'},
              {label: 'Sick Leave', value: 'Sick Leave'},
              {label: 'Casual Leave', value: 'Casual Leave'},
              // Add more leave types as needed
            ]}
            activeTab={selectedLeaveType}
            setActiveTab={setSelectedLeaveType}
          />
        </View>
      )}
      
      {/* Status Filters */}
      <View style={styles.filterToggleButton}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon name="check-circle-outline" size={22} color="#3B82F6" />
          <Text style={styles.filterToggleText}>Status Filters</Text>
        </View>
      </View>
      
      {/* Collapsible Status Filter */}
      {showStatusFilter && (
        <View style={styles.tabFilterContainer}>
          <TabFilter
            tabs={[
              {label: 'All', value: 'All'},
              {label: 'Pending', value: 'Pending'},
              {label: 'Approved', value: 'Approved'},
              {label: 'Rejected', value: 'Rejected'},
            ]}
            activeTab={selectedStatus}
            setActiveTab={setSelectedStatus}
          />
        </View>
      )}

      {/* Date Filter Toggle */}
      <TouchableOpacity
        style={styles.dateFilterToggleButton}
        onPress={() => setShowDateFilter(!showDateFilter)}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon
            name={showDateFilter ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#3B82F6"
          />
          <Text style={styles.filterToggleText}>
            Date Filter
          </Text>

          {/* Badge to show active filters */}
          {(fromDate || toDate) && (
            <View style={styles.activeDateFilterBadge}>
              <Text style={styles.activeDateFilterText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Collapsible Date Range Filters */}
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
                <MaterialIcon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {fromDate ? formatDate(fromDate) : 'From Date'}
                </Text>
              </View>
            </TouchableOpacity>

            <MaterialIcon
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
                <MaterialIcon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {toDate ? formatDate(toDate) : 'To Date'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const toggleCardExpansion = (index) => {
    if (expandedCardIndex === index) {
      // Collapse animation
      Animated.timing(animationHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setExpandedCardIndex(null));
    } else {
      // Expand animation
      setExpandedCardIndex(index);
      Animated.timing(animationHeight, {
        toValue: 100, // Adjust height as needed
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderCard = ({ item, index }) => {
    return (
      <StatusCard
        key={item.id}
        title={item.employeeName || 'Leave Request'}
        subtitle={`${formatDate(item.fromLeaveDate)} to ${formatDate(item.toLeaveDate)} (${item.leaveNo} ${item.leaveNo > 1 ? 'days' : 'day'})`}
        details={[
          { icon: 'calendar-check', label: 'Applied On', value: formatDate(item.createdDate) },
          { icon: 'medical-bag', label: 'Leave Type', value: item.leaveName || 'N/A' },
          { icon: 'account-tie', label: 'Manager Remark', value: item.reportingManagerRemark || 'No remark' },
          { icon: 'account-check', label: 'Approval Remark', value: item.finalApprovalManagerRemark || 'No remark' },
        ]}
        status={item.status || 'Pending'}
        remarks={item.remarks}
        onEdit={() => console.log('Edit leave request:', item)}
        onDelete={() => console.log('Delete leave request:', item)}
      />
    );
  };

  return (
    <AppSafeArea>
      {renderAppBar()}
      
      {/* Type Filters - Using TabFilter with toggle */}
      <TouchableOpacity
        style={styles.filterToggleButton}
        onPress={() => setShowLeaveTypeFilter(!showLeaveTypeFilter)}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon
            name={showLeaveTypeFilter ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#3B82F6"
          />
          <Text style={styles.filterToggleText}>
            Leave Type Filters
          </Text>
          
          {/* Badge to show active leave type filter */}
          {selectedLeaveType !== 'All' && (
            <View style={styles.activeDateFilterBadge}>
              <Text style={styles.activeDateFilterText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Collapsible Leave Type Filter */}
      {showLeaveTypeFilter && (
        <View style={styles.tabFilterContainer}>
          <TabFilter
            tabs={[
              {label: 'All', value: 'All'},
              {label: 'Sick Leave', value: 'Sick Leave'},
              {label: 'Casual Leave', value: 'Casual Leave'},
              // Add more leave types as needed
            ]}
            activeTab={selectedLeaveType}
            setActiveTab={setSelectedLeaveType}
          />
        </View>
      )}
      
      {/* Status Filters - Using TabFilter with toggle */}
      <TouchableOpacity
        style={styles.filterToggleButton}
        onPress={() => setShowStatusFilter(!showStatusFilter)}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon
            name={showStatusFilter ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#3B82F6"
          />
          <Text style={styles.filterToggleText}>
            Status Filters
          </Text>
          
          {/* Badge to show active status filter */}
          {selectedStatus !== 'All' && (
            <View style={styles.activeDateFilterBadge}>
              <Text style={styles.activeDateFilterText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Collapsible Status Filter */}
      {showStatusFilter && (
        <View style={styles.tabFilterContainer}>
          <TabFilter
            tabs={[
              {label: 'All', value: 'All'},
              {label: 'Pending', value: 'Pending'},
              {label: 'Approved', value: 'Approved'},
              {label: 'Rejected', value: 'Rejected'},
            ]}
            activeTab={selectedStatus}
            setActiveTab={setSelectedStatus}
          />
        </View>
      )}

      {/* Date Filter Toggle - Existing code */}
      <TouchableOpacity
        style={styles.filterToggleButton}
        onPress={() => setShowDateFilter(!showDateFilter)}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon
            name={showDateFilter ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#3B82F6"
          />
          <Text style={styles.filterToggleText}>
            Date Filter
          </Text>

          {/* Badge to show active filters */}
          {(fromDate || toDate) && (
            <View style={styles.activeDateFilterBadge}>
              <Text style={styles.activeDateFilterText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Collapsible Date Range Filters - Existing code */}
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
                <MaterialIcon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {fromDate ? formatDate(fromDate) : 'From Date'}
                </Text>
              </View>
            </TouchableOpacity>

            <MaterialIcon
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
                <MaterialIcon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {toDate ? formatDate(toDate) : 'To Date'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Leave Report Cards */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2962ff" />
          <Text style={styles.loaderText}>Loading leave data...</Text>
        </View>
      ) : (
        <FlatList
          data={filterData()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2962ff']}
              tintColor="#2962ff"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcon name="file-document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No leave records found</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}>
                <MaterialIcon name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* Date Pickers */}
      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={date => {
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
        onConfirm={date => {
          setShowToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  listContainer: { 
    padding: 16, 
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 16,
  },
  filterToggleButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateFilterToggleButton: {
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
  filtersContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  dateRangeContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  arrowIcon: {
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  statusDate: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flex: 1,
    padding: 8,
  },
  detailLabel: { 
    color: '#666', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  detailValue: { 
    fontSize: 15, 
    fontWeight: '600', 
    marginTop: 4, 
    color: '#222' 
  },
  remarksContainer: {
    overflow: 'hidden', // Ensure content is hidden during animation
    marginTop: 10,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  remarkItem: {
    marginBottom: 6,
  },
  remarkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  remarkValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginTop: 4,
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
  tabFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});

export default LeaveReportScreen;