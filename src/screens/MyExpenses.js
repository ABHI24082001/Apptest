import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Appbar,
  Card,
  Avatar,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import axiosinstance from '../utils/axiosInstance';
import AppSafeArea from '../component/AppSafeArea';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import styles from '../Stylesheet/MyExpenses';

const MyExpenses = ({navigation}) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('expense');
  const [expenseData, setExpenseData] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);

  const employeeDetails = useFetchEmployeeDetails();

  const formatDate = date => date ? moment(date).format('DD/MM/YY') : 'Select';

  const formatForDotNet = date => {
    return moment(date).format('YYYY-MM-DDT00:00:00');
  };

  const buildCommonParameterPayload = () => ({
    EmployeeId: employeeDetails?.id || 0,
    ChildCompanyId: employeeDetails?.childCompanyId || 0,
    FromDate: fromDate ? formatForDotNet(fromDate) : null,
    ToDate: toDate ? formatForDotNet(toDate) : null,
    status: employeeDetails?.status || null,
  });

  const fetchLeaveData = async () => {
    if (!fromDate || !toDate || !employeeDetails) return;

    setLoading(true);
    try {
      const payload = buildCommonParameterPayload();
      const endpoint = `${BASE_URL}/PaymentAdvanceRequest/${tab === 'expense' ? 'GetExpenseReport' : 'GetAdvanceReport'}`;
      
      const response = await axiosinstance.post(endpoint, payload);
      const data = Array.isArray(response.data) ? response.data : [];
      
      if (tab === 'expense') {
        setExpenseData(data);
      } else {
        setAdvanceData(data);
      }
    } catch (error) {
      // console.error('API Error:', error.message);
      if (tab === 'expense') setExpenseData([]);
      else setAdvanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type, date) => {
    if (type === 'from') setFromDate(date);
    if (type === 'to') setToDate(date);
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchLeaveData();
    }
  }, [fromDate, toDate, employeeDetails, tab]);

  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    setFromDate(oneYearAgo);
    setToDate(today);
  }, []);

  // Helper to get initials for Avatar
  const getInitials = name => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Enhanced gradient AppBar
  const renderAppBar = () => (
    <Appbar.Header style={styles.header}>
      <Appbar.BackAction color="#000" onPress={() => navigation.goBack()} />
      <Appbar.Content
        title="My Expenses Report"
        titleStyle={styles.headerTitle}
      />
    </Appbar.Header>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.dateFilterToggleButton}
        onPress={() => setShowDateFilter(!showDateFilter)}>
        <View style={styles.filterToggleContent}>
          <MaterialIcon
            name={showDateFilter ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#3B82F6"
          />
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
              style={[styles.dateButton, toDate && styles.dateButtonActive]}
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

  // Card for each expense/advance record
  const renderExpenseCard = ({item}) => {
    return (
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={item.employeeName || item.EmployeeName || 'N/A'}
        subtitle={item.employeeCode || item.EmployeeCode || 'N/A'}
        left={() => (
          <Avatar.Text
            size={40}
            label={getInitials(item.employeeName || item.EmployeeName || '')}
            style={{backgroundColor: '#2563EB'}}
            color="#fff"
          />
        )}
       
      />
      <Card.Content>
        <View style={styles.row}>
          <Chip style={styles.chip}>{item.branchName || item.BranchName || 'N/A'}</Chip>
          <Chip style={styles.chip}>{item.department || item.Department || 'N/A'}</Chip>
          <Chip style={styles.chip}>{item.designation || item.Designation || 'N/A'}</Chip>
        </View>
        <View style={styles.row}>
          <Chip style={styles.chip}>Total: {item.totalAmount || item.TotalAmount || 0}</Chip>
          <Chip style={styles.chip}>Approved: {item.approvalAmount || item.ApprovalAmount || 0}</Chip>
        </View>
        <View style={styles.row}>
          <Card style={styles.dateCard} elevation={0}>
            <Card.Content>
              <Text style={styles.dateLabel}>Transaction</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.transactionDate || item.TransactionDate)}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.dateCard} elevation={0}>
            <Card.Content>
              <Text style={styles.dateLabel}>Created</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.createdDate || item.CreatedDate)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </Card.Content>
    </Card>
  )};

  return (
    <AppSafeArea>
      {renderAppBar()}
      {renderHeader()}

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            {value: 'expense', label: 'Expense'},
            {value: 'advance', label: 'Advance'},
          ]}
          style={styles.segmented}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2962ff" />
          <Text style={styles.loaderText}>Loading data...</Text>
        </View>
      ) : (
        <FlatList
          data={tab === 'expense' ? expenseData : advanceData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderExpenseCard}
          contentContainerStyle={styles.cardListContainer}
          ListEmptyComponent={
            <Card style={styles.emptyCard} elevation={1}>
              <Card.Content style={{alignItems: 'center'}}>
                <MaterialIcon
                  name="file-document-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyText}>No records found</Text>
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
        onConfirm={date => {
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
        onConfirm={date => {
          setShowToPicker(false);
          handleDateChange('to', date);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </AppSafeArea>
  );
};


export default MyExpenses;
