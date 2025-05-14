import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text as RNText,
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

const MOCK_LEAVE_DATA = [
  {
    id: '101',
    applyDate: '2025-04-01',
    leaveType: 'Sick Leave',
    noOfLeave: 2,
    status: 'Approved',
    statusDate: '2025-04-03',
  },
  {
    id: '102',
    applyDate: '2025-03-18',
    leaveType: 'Casual Leave',
    noOfLeave: 1,
    status: 'Pending',
    statusDate: '2025-03-20',
  },
  {
    id: '103',
    applyDate: '2025-02-10',
    leaveType: 'Sick Leave',
    noOfLeave: 3,
    status: 'Rejected',
    statusDate: '2025-02-12',
  },
];

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

  const formatDate = date => (date ? new Date(date).toLocaleDateString() : 'Select');

  const filterData = () => {
    return MOCK_LEAVE_DATA.filter(item => {
      const itemDate = new Date(item.applyDate);
      const fromMatch = fromDate ? itemDate >= new Date(fromDate) : true;
      const toMatch = toDate ? itemDate <= new Date(toDate) : true;
      const leaveTypeMatch = selectedFilter ? item.leaveType === selectedFilter : true;
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
    <View>
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
            <Text
              style={[
                styles.chipText,
                selectedFilter === option.value && styles.chipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{formatDate(fromDate)}</Text>
        </TouchableOpacity>

        <View style={styles.dateIconWrapper}>
          <Icon name="arrow-forward" size={20} color="#666" />
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{formatDate(toDate)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.dateText}>
          <Icon name="calendar-outline" size={14} color="#999" /> Apply Date: {item.applyDate}
        </Text>

        <View style={styles.box}>
          <View>
            <Text style={styles.label}>No. of Leave</Text>
            <Text style={styles.value}>{item.noOfLeave}</Text>
          </View>
          <View>
            <Text style={styles.label}>Leave Type</Text>
            <Text style={styles.value}>{item.leaveType}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Icon
            name="ellipse"
            size={10}
            color={
              item.status === 'Approved'
                ? '#4caf50'
                : item.status === 'Rejected'
                  ? '#f44336'
                  : '#f4b400'
            }
            style={{ marginRight: 4 }}
          />
          <Text style={[
            styles.statusText,
            {
              color:
                item.status === 'Approved'
                  ? '#4caf50'
                  : item.status === 'Rejected'
                    ? '#f44336'
                    : '#f4b400',
            },
          ]}>
            {item.status} - {item.statusDate}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <AppSafeArea>
      {renderAppBar()}
      <FlatList
        data={filterData()}
        keyExtractor={item => item.id}
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

export default LeaveReportScreen;

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
  listContainer: { padding: 16, paddingBottom: 40 },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
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
    color: '#333',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  dateValue: { fontSize: 15, color: '#333', marginTop: 4, fontWeight: '600' },
  dateIconWrapper: { paddingHorizontal: 10 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  dateText: { fontSize: 13, color: '#666', marginBottom: 10, fontWeight: '500' },
  box: {
    backgroundColor: '#f5f8f7',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: { color: '#666', fontSize: 14, fontWeight: '500' },
  value: { fontSize: 16, fontWeight: '700', marginTop: 4, color: '#222' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusText: { fontSize: 14, fontWeight: '600' },
  footer: { textAlign: 'center', marginTop: 12, color: '#666' },
});
