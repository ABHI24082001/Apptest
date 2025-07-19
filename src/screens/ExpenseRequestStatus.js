import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
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
import TabFilter from '../components/TabFilter'; // Import the reusable TabFilter component
import StatusCard from '../components/StatusCard'; // Import the reusable component
import BASE_URL from '../constants/apiConfig';


const ExpenseRequestStatusScreen = () => {
  const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [selectedType, setSelectedType] = useState('Expense'); // Default to 'Expense'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false); 
  // Fetch expense data from API
  const fetchExpenseData = useCallback(async () => {
    if (!employeeDetails?.childCompanyId || !employeeDetails?.id) {
      console.warn('Employee details are missing'); // Log a warning instead of showing an alert
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/PaymentAdvanceRequest/GetPaymentAdvanveRequestList/${employeeDetails.childCompanyId}/${employeeDetails.id}`,
      );
      setExpenseData(response.data);

      console.log('Data fetched successfully', response.data.length);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      Alert.alert('Error', 'Failed to fetch expense data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employeeDetails]);

  // Initial data load
  useEffect(() => {
    setLoading(true);
    fetchExpenseData();
  }, [fetchExpenseData]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenseData();
  }, [fetchExpenseData]);

  const filteredData = expenseData.filter(item => {
    const matchesType = selectedType ? item.requestType === selectedType : true;

    if (!fromDate && !toDate) return matchesType;

    const itemDate = new Date(item.createdDate);
    const fromMatch = fromDate ? itemDate >= fromDate : true;
    const toMatch = toDate ? itemDate <= toDate : true;

    return matchesType && fromMatch && toMatch;
  });

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

  // Clear filters function
  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setLoading(true);
    fetchExpenseData();
  };
  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  // Apply date filter function - now explicitly called
  const applyDateFilter = () => {
    if (!fromDate && !toDate) {
      Alert.alert('Filter Error', 'Please select at least one date to filter');
      return;
    }

    // If fromDate is set but toDate is not, set toDate to today
    if (fromDate && !toDate) {
      const today = new Date();
      setToDate(today);
      // We'll fetch in the next useEffect call
    } else {
      setLoading(true);
      fetchExpenseData();
    }
  };
  

  const handleDeleteExpense = async (requestId, companyId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/PaymentAdvanceRequest/DeletePaymentAdvanveRequest/${requestId}/${companyId}`
      );

      if (response?.status === 200) {
        setExpenseData(prevData => prevData.filter(item => item.requestId !== requestId)); // Remove deleted expense from state
        Alert.alert('Success', 'Expense request deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete expense request');
      }
    } catch (error) {
      console.error('Error deleting expense request:', error);
      Alert.alert('Error', 'Failed to delete expense request');
    }
  };

  const handleEditExpense = (expense) => {
    console.log('Selected ========== Data:', expense); // Log the selected expense for debugging
    navigation.navigate('PaymentRequest', {
      expence: {
        ...expense,
        // Ensure these fields are passed correctly for editing
        requestId: expense.requestId,
        companyId: expense.companyId,
        requestType: expense.requestType?.toLowerCase(),
        totalAmount: expense.totalAmount,
        remarks: expense.remarks || '',
      }
    });
  };

  

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Expense" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Type Filter */}
      <View style={styles.typeFilterContainer}>
        {/* <Text style={styles.filterTitle}>Filter by Type</Text> */}
        <TabFilter
          tabs={[
            {label: 'Expense', value: 'Expense'},
            {label: 'Advance', value: 'Advance'},
          ]}
          activeTab={selectedType}
          setActiveTab={setSelectedType}
        />
      </View>


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

      {/* Date Filter */}
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
      {/* Expense Cards with Loading & RefreshControl */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2962ff" />
          <Text style={styles.loaderText}>Loading expense data...</Text>
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
          }
        >
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="file-document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No requests found</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={onRefresh}
              >
                <Icon name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredData.map((item, index) => {
              // Log each item to console for debugging
              console.log('Expense item data:', JSON.stringify(item, null, 2));
              
              // Get appropriate status styling
              const statusStyles = getStatusStyles(item.status);
              
              return (
                <StatusCard
                  key={`expense-${item.requestId}-${index}`} // Ensure truly unique keys by combining requestId with index
                  title={item.employeeName}
                  subtitle={`${item.designation}, ${item.department}`}
                  details={[
                    {icon: 'calendar-blank-outline', label: 'Applied On', value: formatDate(item.createdDate)},
                    {icon: 'cash-multiple', label: 'Type', value: item.requestType},
                    {icon: 'currency-inr', label: 'Amount', value: `₹${item.totalAmount}`},
                  ]}
                  status={item.status}
                  statusStyle={statusStyles}
                  remarks={item.remarks}
                  onEdit={() => handleEditExpense(item)}
                  onDelete={() =>
                    Alert.alert(
                      'Delete',
                      `Are you sure you want to delete the request for ${item.employeeName}?`,
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteExpense(item.requestId, item.companyId),
                        },
                      ],
                    )
                  }
                  buttonContainerStyle={styles.actionButtonContainer}
                  editButtonStyle={styles.editButton}
                  deleteButtonStyle={styles.deleteButton}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </AppSafeArea>
  );
};

// Helper function to determine status styles based on status text
const getStatusStyles = (status) => {
  status = status?.toLowerCase() || '';
  
  if (status.includes('approved')) {
    if (status.includes('manager')) {
      return {
        backgroundColor: '#dcfce7', // Light green
        textColor: '#15803d',      // Dark green
        borderColor: '#86efac',    // Medium green
        icon: 'check-circle-outline'
      };
    } else {
      return {
        backgroundColor: '#d1fae5', // Lighter green
        textColor: '#047857',      // Darker green
        borderColor: '#6ee7b7',    // Medium green
        icon: 'check-circle'
      };
    }
  } else if (status.includes('rejected') || status.includes('declined')) {
    return {
      backgroundColor: '#fee2e2', // Light red
      textColor: '#b91c1c',      // Dark red
      borderColor: '#fca5a5',    // Medium red
      icon: 'close-circle'
    };
  } else if (status.includes('pending')) {
    return {
      backgroundColor: '#fef3c7', // Light yellow
      textColor: '#b45309',      // Dark yellow/orange
      borderColor: '#fcd34d',    // Medium yellow
      icon: 'clock-outline'
    };
  } else {
    return {
      backgroundColor: '#e0f2fe', // Light blue
      textColor: '#0369a1',      // Dark blue
      borderColor: '#7dd3fc',    // Medium blue
      icon: 'information-outline'
    };
  }
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
  typeFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeFilterRow: {
    flexDirection: 'row',
    marginTop: 8,
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
  arrowIcon: {marginHorizontal: 8},
  clearButton: {marginLeft: 12, padding: 8},

  scrollContainer: {padding: 16, paddingBottom: 24},
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {fontWeight: '800', fontSize: 16, color: '#111827'},
  subtitle: {fontSize: 14, color: '#6B7280', marginBottom: 8},
  detailRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  detailText: {fontSize: 15, color: '#4B5563', marginLeft: 8},
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {fontSize: 12, fontWeight: '600'},
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {fontSize: 16, color: '#6B7280', marginTop: 16},
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3B82F6',
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
    backgroundColor: '#F9FAFB', // Slightly different background to stand out
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
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16, // Space between buttons
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff', // Light blue background
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2', // Light red background
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
});

export default ExpenseRequestStatusScreen;
