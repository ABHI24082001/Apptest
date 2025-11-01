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
import axiosinstance from '../utils/axiosInstance';
import AppSafeArea from '../component/AppSafeArea';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import styles from '../Stylesheet/LeaveReportScreen';
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


   const formatForDotNet = date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T00:00:00`;
  };

  // Build payload for CommonParameter API
  const buildCommonParameterPayload = () => {
    // Required fields with fallback to default values
    return {
     EmployeeId: employeeDetails?.id || 0,
        Month: 0,
        Year: 0,
        YearList: null,
        ChildCompanyId: employeeDetails?.childCompanyId || 0,
        FromDate: fromDate ? formatForDotNet(fromDate) : null,
        ToDate: toDate ? formatForDotNet(toDate) : null,
        BranchName: null,
        BranchId: 0,
        EmployeeTypeId: 0,
        DraftName: null,
        Did: 0,
        UserId: 0,
        status: null,
        Ids: null,
        CoverLatter: null,
        DepartmentId: 0,
        DesignationId: 0,
        UserType: 0,
        CalculationType: 0,
        childCompanies: null,
        branchIds: null,
        departmentsIds: null,
        designationIds: null,
        employeeTypeIds: null,
        employeeIds: null,
        hasAllReportAccess: false,
    };
  };

  // Example POST request using the above payload
  const postCommonParameter = async () => {
    const payload = buildCommonParameterPayload();
    console.log('Posting CommonParameter payload:', payload);
    try {
      // Replace with your actual API endpoint
      const response = await axiosinstance.post(`${BASE_URL}/LeaveApproval/GetLeaveReport`, payload);
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
      const response = await axiosinstance.post(`${BASE_URL}/LeaveApproval/GetLeaveReport`, payload);
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
          {/* <Chip style={styles.chip}>Amount: {item.paidLeaveAmount ?? 0}</Chip> */}
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



export default LeaveReportScreen;
