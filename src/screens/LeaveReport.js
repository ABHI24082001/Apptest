import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Appbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import moment from 'moment';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';


const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api'; // Use your local API
const BASE_URL_LOCAL = 'http://192.168.29.2:90/api/'; // Use your local API

const filterOptions = [
  { label: 'All', value: '' },
  { label: 'Sick Leave', value: 'Sick Leave' },
  { label: 'Casual Leave', value: 'Casual Leave' },
];

const LeaveReportScreen = ({ navigation }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [leaveData, setLeaveData] = useState([]); // Replace mock data with dynamic data

  const employeeDetails = useFetchEmployeeDetails();

  console.log(employeeDetails, 'Employee Details');

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL_PROD}/ApplyLeave/GetAllEmployeeApplyLeave/1/${employeeDetails?.id}`
        );
        setLeaveData(response.data); // Set fetched data
        console.log('Fetched leave data:', response.data); // Debug fetched data
      } catch (error) {
        console.error('Error fetching leave data:', error);
        Alert.alert('Error', 'Failed to fetch leave data');
      }
    };

    if (employeeDetails?.id) {
      fetchLeaveData();
    }
  }, [employeeDetails]);

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YY') : 'Select';
  };

  const filterData = () => {
    return leaveData.filter(item => {
      const itemDate = new Date(item.fromLeaveDate);
      const fromMatch = fromDate ? itemDate >= new Date(fromDate) : true;
      const toMatch = toDate ? itemDate <= new Date(toDate) : true;
      const leaveTypeMatch = selectedFilter ? item.leaveName === selectedFilter : true;
      return fromMatch && toMatch && leaveTypeMatch;
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
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Filter By Leave Type</Text>
        <View style={styles.chipRow}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.chip,
                selectedFilter === option.value && styles.chipSelected,
              ]}
              onPress={() => {
                setSelectedFilter(option.value);
                setFromDate(null);
                setToDate(null);
              }}
            >
              <Text style={[
                styles.chipText,
                selectedFilter === option.value && styles.chipTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Filter By Date Range</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowFromPicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={16} color="#1976d2" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>From</Text>
                <Text style={styles.dateValue}>{formatDate(fromDate)}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.dateIconWrapper}>
            <Icon name="arrow-forward" size={20} color="#666" />
          </View>

          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowToPicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={16} color="#1976d2" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>To</Text>
                <Text style={styles.dateValue}>{formatDate(toDate)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCard = ({ item, index }) => {
    const statusColor = item.status === 'Approved'
      ? '#4caf50'
      : item.status === 'Rejected'
        ? '#f44336'
        : '#f4b400';

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.statusBadge}>
              <Icon
                name="ellipse"
                size={10}
                color={statusColor}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.statusDate}>
              Approval Date: {item.createdDate ? formatDate(item.createdDate) : 'Processing'}
            </Text>
            <Icon
              name="create-outline"
              size={20}
              color="#1976d2"
              onPress={() => {
                const leaveDataToPass = {
                  ...item,
                  leaveName: item.leaveName, // Ensure Leave Name is passed
                };
                navigation.navigate('ApplyLeave', { leaveData: leaveDataToPass }); // Pass leaveData correctly
              }}
            />
          </View>

          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>From Date</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.fromLeaveDate)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>To Date</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.toLeaveDate)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Leave Days</Text>
              <Text style={styles.dateValue}>
                {item.leaveNo} {item.leaveNo > 1 ? 'days' : 'day'}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Leave Name</Text> {/* Add Leave Name */}
              <Text style={styles.detailValue}>{item.leaveName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Remarks</Text>
              <Text style={styles.detailValue}>{item.remarks || 'N/A'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <AppSafeArea>
      {renderAppBar()}
      <FlatList
        data={filterData()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  filterContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  chipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
    
  },
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  dateTextContainer: {
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dateLabel: { 
    fontSize: 16, 
    color: '#666', 
    fontWeight: '500' ,
  },
  dateValue: { 
    fontSize: 15, 
    color: '#333', 
 
    fontWeight: '600' ,
    margin: 2
  },
  dateIconWrapper: { 
    paddingHorizontal: 10 
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
});

export default LeaveReportScreen;