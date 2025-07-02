import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Card, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import DateRangeFilter from '../components/DateRangeFilter'; // Import the reusable component
import TabFilter from '../components/TabFilter'; // Import the reusable component
import StatusCard from '../components/StatusCard'; // Import the reusable component
const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';

const AdvancePaymentReport = () => {
  const employeeDetails = useFetchEmployeeDetails();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('expense');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === 'advance'
          ? `${BASE_URL_PROD}/PaymentAdvanceRequest/GetAdvanceReport`
          : `${BASE_URL_PROD}/PaymentAdvanceRequest/GetExpenseReport`;

      const response = await axios.get(endpoint, {
        params: {
          employeeId: employeeDetails?.id,
          fromDate: fromDate ? fromDate.toISOString() : null,
          toDate: toDate ? toDate.toISOString() : null,
        },
      });

      if (response.status === 200) {
        setReports(response.data);
        console.log('Data fetched successfully:', response.data.length);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, fromDate, toDate, employeeDetails]);

  useEffect(() => {
    if (employeeDetails?.id) {
      fetchReports();
    }
  }, [activeTab, employeeDetails]); // Don't auto-fetch on date changes

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFromDate(null);
    setToDate(null);
    fetchReports();
  }, [fetchReports]);

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
      // We'll fetch in the next useEffect call
    }
    fetchReports();
  };

  // Clear filters function
  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
    fetchReports();
  };

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isWithinDateRange = dateStr => {
    if (!fromDate || !toDate) return true;
    const d = new Date(dateStr);
    return d >= fromDate && d <= toDate;
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter =
      selectedFilter === 'all' || report.status.toLowerCase() === selectedFilter;
    const matchesDate = isWithinDateRange(report.transactionDate || report.createdDate);
    return matchesFilter && matchesDate;
  });

  const ListHeader = () => (
    <DateRangeFilter
      fromDate={fromDate}
      toDate={toDate}
      setFromDate={setFromDate}
      setToDate={setToDate}
      showFromPicker={showFromPicker}
      setShowFromPicker={setShowFromPicker}
      showToPicker={showToPicker}
      setShowToPicker={setShowToPicker}
    />
  );

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Payment Request Report"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2962ff']}
            tintColor="#2962ff"
          />
        }
      >
        {/* Tabs */}
        <TabFilter
          tabs={[
            {label: 'Expense Report', value: 'expense'},
            {label: 'Advance Report', value: 'advance'},
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

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

        {/* Report Cards */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2962ff" />
            <Text style={styles.loaderText}>Loading reports...</Text>
          </View>
        ) : activeTab === 'advance' ? (
          filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <StatusCard
                key={report.requestId}
                title={report.employeeName}
                subtitle={`${report.designation}, ${report.department}`}
                details={[
                  {icon: 'calendar', label: 'Transaction Date', value: formatDate(report.transactionDate || report.createdDate)},
                  {icon: 'cash', label: 'Amount', value: `₹${report.totalAmount}`},
                ]}
                status={report.status}
                remarks={report.remarks}
                onEdit={() => console.log('Edit:', report)} // Replace with actual edit logic
                onDelete={() => console.log('Delete:', report)} // Replace with actual delete logic
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="file-document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No advance reports found</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={onRefresh}
              >
                <Icon name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <StatusCard
                key={report.requestId}
                title={report.employeeName || "Expense Report"}
                subtitle={report.description || "Expense Details"}
                details={[
                  {icon: 'calendar', label: 'Transaction Date', value: formatDate(report.transactionDate || report.createdDate)},
                  {icon: 'file-document', label: 'Expense Type', value: report.expenseType || 'N/A'},
                  {icon: 'currency-inr', label: 'Amount', value: `₹${report.totalAmount}`},
                ]}
                status={report.status}
                remarks={report.remarks}
                onEdit={() => console.log('Edit:', report)} // Replace with actual edit logic
                onDelete={() => console.log('Delete:', report)} // Replace with actual delete logic
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="file-document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No expense reports found</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={onRefresh}
              >
                <Icon name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FC', paddingHorizontal: 16},
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#333'},
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#F0F2FF',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {backgroundColor: '#6D75FF'},
  tabButtonText: {fontSize: 14, fontWeight: '500', color: '#666'},
  activeTabButtonText: {color: '#FFF'},
  headerContainer: {marginBottom: 16},
  dateRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  dateBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  dateText: {color: '#333'},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? {width: 0, height: 2} : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
  },
  cardContent: {padding: 16},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  label: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
    width: 120,
  },
  value: {fontSize: 14, fontWeight: '500', color: '#333', flex: 1},
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusText: {fontSize: 14, fontWeight: '600', marginLeft: 12},
  statusDate: {fontSize: 12, color: '#999', marginLeft: 'auto'},
  
  // New styles for the date filter toggle and UI
  filterToggleButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 8,
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
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
});

export default AdvancePaymentReport;