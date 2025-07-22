import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Appbar,
  Card,
  Avatar,
  Chip,
  Badge,
  Button,
} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

import AppSafeArea from '../component/AppSafeArea';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';

const LeaveReportScreen = ({ navigation }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);

  const employeeDetails = useFetchEmployeeDetails();

  const formatDate = (date) =>
    date ? moment(date).format('DD/MM/YY') : 'Select';

  // Helper to format date for backend (YYYY-MM-DDTHH:mm:ss)
  const formatDateForBackend = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Build payload for CommonParameter API
  const buildCommonParameterPayload = () => {
    // Required fields with fallback to default values
    return {
      childCompanyId: employeeDetails?.childCompanyId ?? 0,
      branchId: employeeDetails?.branchId ?? 0,
      designationId: employeeDetails?.designtionId ?? 0,
      userType: employeeDetails?.employeeType ?? 0,
      employeeId: employeeDetails?.id ?? 0,
      departmentId: employeeDetails?.departmentId ?? 0,
      fromDate: formatDateForBackend(fromDate) ?? null,
      toDate: formatDateForBackend(toDate) ?? null,
    };
  };

  // Example POST request using the above payload
  const postCommonParameter = async () => {
    const payload = buildCommonParameterPayload();
    console.log('Posting CommonParameter payload:', payload);
    try {
      // Replace with your actual API endpoint
      const response = await axios.post(`${BASE_URL}/LeaveApproval/GetLeaveReport`, payload);
      // Handle response as needed
      console.log('API response:===============', response.data);
    } catch (error) {
      console.error('CommonParameter API error:', error);
    }
  };

  const fetchLeaveData = async () => {
    if (!fromDate || !toDate || !employeeDetails?.id) return;

    setLoading(true);
    try {
      const payload = buildCommonParameterPayload();
      const response = await axios.post(`${BASE_URL}/LeaveApproval/GetLeaveReport`, payload);
      // Set leaveData directly from API response
      setLeaveData(response.data || []);
    } catch (error) {
      console.error('LeaveReport API error:', error);
      setLeaveData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type, date) => {
    if (type === 'from') setFromDate(date);
    if (type === 'to') setToDate(date);
  };

  useEffect(() => {
    if (fromDate && toDate && employeeDetails?.id) {
      fetchLeaveData();
    }
  }, [fromDate, toDate, employeeDetails]);

  // Example usage: call postCommonParameter when both dates and employeeDetails are available
  useEffect(() => {
    if (fromDate && toDate && employeeDetails?.id) {
      postCommonParameter();
    }
  }, [fromDate, toDate, employeeDetails]);

  // Helper to get initials for Avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Status color for Badge
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return '#22c55e';
      case 'pending':
        return '#f59e42';
      case 'rejected':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  // Enhanced gradient AppBar
  const renderAppBar = () => (
   
      <Appbar.Header style={styles.header} >
        <Appbar.BackAction color="#000" onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Leave Report" titleStyle={styles.headerTitle} />
      </Appbar.Header>
   
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.dateFilterToggleButton}
        onPress={() => setShowDateFilter(!showDateFilter)}
      >
        <View style={styles.filterToggleContent}>
          <MaterialIcon name={showDateFilter ? 'chevron-up' : 'chevron-down'} size={22} color="#3B82F6" />
          <Text style={styles.filterToggleText}>Date Filter</Text>
          {(fromDate || toDate) && (
            <View style={styles.activeDateFilterBadge}>
              <Text style={styles.activeDateFilterText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {showDateFilter && (
        <View style={styles.dateRangeContainer}>
          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={[styles.dateButton, fromDate && styles.dateButtonActive]}
              onPress={() => setShowFromPicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <MaterialIcon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>{fromDate ? formatDate(fromDate) : 'From Date'}</Text>
              </View>
            </TouchableOpacity>

            <MaterialIcon name="arrow-right" size={20} color="#6B7280" style={styles.arrowIcon} />

            <TouchableOpacity
              style={[styles.dateButton, toDate && styles.dateButtonActive]}
              onPress={() => setShowToPicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <MaterialIcon name="calendar" size={18} color="#3B82F6" />
                <Text style={styles.dateButtonText}>{toDate ? formatDate(toDate) : 'To Date'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // Enhanced Card for each leave record
  const renderLeaveCard = ({ item }) => (
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={item.employeeName}
        subtitle={item.employeeCode}
        left={() => (
          <Avatar.Text
            size={40}
            label={getInitials(item.employeeName)}
            style={{ backgroundColor: '#2563EB' }}
            color="#fff"
          />
        )}
        right={() => (
          <Badge
            style={{
              backgroundColor: getStatusColor(item.status),
              alignSelf: 'center',
              marginRight: 8,
            }}
            size={28}
          >
            {item.status}
          </Badge>
        )}
      />
      <Card.Content>
        <View style={styles.row}>
          <Chip style={styles.chip}>{item.branchName}</Chip>
          <Chip style={styles.chip}>{item.department}</Chip>
          <Chip style={styles.chip}>{item.designation}</Chip>
        </View>
        <View style={styles.row}>
          <Chip icon="calendar" style={styles.leaveTypeChip}>
            {item.leaveName}
          </Chip>
          <Chip icon="account" style={styles.chip}>
            {item.taskAssignEmployeeCode}
          </Chip>
        </View>
        <View style={styles.row}>
          <Card style={styles.dateCard} elevation={0}>
            <Card.Content>
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>{formatDate(item.fromLeaveDate)}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.dateCard} elevation={0}>
            <Card.Content>
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>{formatDate(item.toLeaveDate)}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.dateCard} elevation={0}>
            <Card.Content>
              <Text style={styles.dateLabel}>Applied</Text>
              <Text style={styles.dateValue}>{formatDate(item.createdDate)}</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.row}>
          <Chip style={styles.chip}>Paid: {item.approvedPaidLeave}</Chip>
          <Chip style={styles.chip}>Unpaid: {item.approvedUnpaidLeave}</Chip>
          <Chip style={styles.chip}>Amount: {item.paidLeaveAmount ?? 0}</Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <AppSafeArea>
      {renderAppBar()}
      {renderHeader()}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2962ff" />
          <Text style={styles.loaderText}>Loading leave data...</Text>
        </View>
      ) : (
        <FlatList
          data={leaveData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderLeaveCard}
          contentContainerStyle={styles.cardListContainer}
          ListEmptyComponent={
            <Card style={styles.emptyCard} elevation={1}>
              <Card.Content style={{ alignItems: 'center' }}>
                <MaterialIcon name="file-document-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No leave records found</Text>
              </Card.Content>
            </Card>
          }
        />
      )}

      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowFromPicker(false);
          handleDateChange('from', date);
        }}
        onCancel={() => setShowFromPicker(false)}
      />

      <DatePicker
        modal
        open={showToPicker}
        date={toDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowToPicker(false);
          handleDateChange('to', date);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    width: '100%',
    paddingBottom: 0,
  },
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerContainer: {
    paddingVertical: 16,
  },
  headerTitleGradient: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cardListContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
  },
  leaveTypeChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  dateCard: {
    flex: 1,
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    elevation: 0,
  },
  dateLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  emptyCard: {
    margin: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  headerContainer: {
    marginBottom: 16,
  },
  dateFilterToggleButton: {
    backgroundColor: '#fff',
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
    color: '#fff',
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
  dateButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default LeaveReportScreen;
