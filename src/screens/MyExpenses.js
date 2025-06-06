import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Card, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
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
  const [reports, setReports] = useState([]); // Updated to dynamic data
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
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
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeDetails?.id) {
      fetchReports();
    }
  }, [activeTab, fromDate, toDate, employeeDetails]);

  const getStatusIcon = status => {
    switch (status.toLowerCase()) {
      case 'approved':
        return {icon: 'check-circle', color: '#4CAF50'};
      case 'pending':
        return {icon: 'clock', color: '#FFA000'};
      case 'rejected':
        return {icon: 'close-circle', color: '#F44336'};
      default:
        return {icon: 'help-circle', color: '#9E9E9E'};
    }
  };

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-GB');
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
    <View style={styles.headerContainer}>
      {/* Date Range Filter */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateText}>
            {fromDate ? formatDate(fromDate) : 'From Date'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateText}>
            {toDate ? formatDate(toDate) : 'To Date'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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

      <ScrollView style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'expense' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('expense')}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'expense' && styles.activeTabButtonText,
              ]}>
              Expense Report
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'advance' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('advance')}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'advance' && styles.activeTabButtonText,
              ]}>
              Advance Report
            </Text>
          </TouchableOpacity>
        </View>

        <ListHeader />

        {/* Date Pickers */}
        <DatePicker
          modal
          open={showFromPicker}
          date={fromDate || new Date()}
          mode="date"
          onConfirm={date => {
            setShowFromPicker(false);
            setFromDate(date);
            setSelectedFilter('all'); // reset filter on date change
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
            setSelectedFilter('all'); // reset filter on date change
          }}
          onCancel={() => setShowToPicker(false)}
        />

        {/* Report Cards */}
        {loading ? (
          <Text style={{textAlign: 'center', marginTop: 40, color: '#999'}}>
            Loading reports...
          </Text>
        ) : activeTab === 'advance' ? (
          filteredReports.length > 0 ? (
            filteredReports.map(report => {
              const statusIcon = getStatusIcon(report.status);
              return (
                <Card key={report.requestId} style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <Icon name="calendar-check" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Date:</Text>
                      <Text style={styles.value}>
                        {formatDate(report.transactionDate || report.createdDate)}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="cash" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Request Amount:</Text>
                      <Text style={styles.value}>₹{report.totalAmount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="cash-check" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Approved Amount:</Text>
                      <Text style={styles.value}>₹{report.approvalAmount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="check" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Remarks:</Text>
                      <Text style={styles.value}>
                        {report.remarks || 'No Remark'}
                      </Text>
                    </View>

                    <View style={styles.statusRow}>
                      <Icon
                        name={statusIcon.icon}
                        size={20}
                        color={statusIcon.color}
                      />
                      <Text
                        style={[styles.statusText, {color: statusIcon.color}]}>
                        {report.status.charAt(0).toUpperCase() +
                          report.status.slice(1)}
                      </Text>
                      <Text style={styles.statusDate}>
                        {formatDate(report.createdDate)}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          ) : (
            <Text style={{textAlign: 'center', marginTop: 40, color: '#999'}}>
              No advance reports found
            </Text>
          )
        ) : (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.row}>
                <Icon name="calendar" size={20} color="#6D75FF" />
                <Text style={styles.label}>Transaction Date:</Text>
                <Text style={styles.value}>01/04/2025</Text>
              </View>
              <View style={styles.row}>
                <Icon name="file-document" size={20} color="#6D75FF" />
                <Text style={styles.label}>Expense:</Text>
                <Text style={styles.value}>Travel</Text>
              </View>
              <View style={styles.row}>
                <Icon name="currency-inr" size={20} color="#6D75FF" />
                <Text style={styles.label}>Amount:</Text>
                <Text style={styles.value}>₹2000</Text>
              </View>
              <View style={styles.statusRow}>
                <Icon name="clock" size={20} color="#FFA000" />
                <Text style={[styles.statusText, {color: '#FFA000'}]}>
                  Pending
                </Text>
                <Text style={styles.statusDate}>05/04/2025</Text>
              </View>
            </View>
          </Card>
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
});

export default AdvancePaymentReport;
