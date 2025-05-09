import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Appbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useNavigation } from '@react-navigation/native';

const MOCK_DATA = [
  {
    id: '25',
    requestType: 'Leave',
    requestDate: '2025-03-01',
    status: 'Pending',
    statusDate: '2025-04-10',
  },
  {
    id: '26',
    requestType: 'Expense',
    requestDate: '2025-02-15',
    status: 'Approved',
    statusDate: '2025-02-20',
  },
  {
    id: '27',
    requestType: 'Leave',
    requestDate: '2025-03-10',
    status: 'Rejected',
    statusDate: '2025-03-12',
  },
  {
    id: '28',
    requestType: 'Leave',
    requestDate: '2025-04-05',
    status: 'Approved',
    statusDate: '2025-04-08',
  },
  {
    id: '29',
    requestType: 'Expense',
    requestDate: '2025-01-25',
    status: 'Pending',
    statusDate: '2025-02-01',
  },
  {
    id: '30',
    requestType: 'Leave',
    requestDate: '2025-04-12',
    status: 'Approved',
    statusDate: '2025-04-14',
  },
  {
    id: '31',
    requestType: 'Expense',
    requestDate: '2025-03-22',
    status: 'Rejected',
    statusDate: '2025-03-25',
  },
  {
    id: '32',
    requestType: 'Leave',
    requestDate: '2025-02-05',
    status: 'Pending',
    statusDate: '2025-02-08',
  },
  {
    id: '33',
    requestType: 'Expense',
    requestDate: '2025-03-29',
    status: 'Approved',
    statusDate: '2025-04-02',
  },
  {
    id: '34',
    requestType: 'Advance',
    requestDate: '2025-01-18',
    status: 'Rejected',
    statusDate: '2025-01-21',
  },
];

const filterOptions = [
  { label: 'All', value: null },
  { label: 'Leave', value: 'Leave' },
  { label: 'Expense', value: 'Expense' },
  { label: 'Advance', value: 'Advance' },
];

const ApprovalsScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const formatDate = date => (date ? new Date(date).toLocaleDateString() : 'Select');

  const filterData = () => {
    return MOCK_DATA.filter(item => {
      const matchesSearch = item.id.includes(search);
      const matchesType = selectedFilter ? item.requestType === selectedFilter : true;
      const itemDate = new Date(item.requestDate);
      const fromMatch = fromDate ? itemDate >= new Date(fromDate) : true;
      const toMatch = toDate ? itemDate <= new Date(toDate) : true;
      return matchesSearch && matchesType && fromMatch && toMatch;
    });
  };

  const renderAppBar = () => (
    <Appbar.Header mode="center-aligned" >
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title="Approvals" titleStyle={{ fontWeight: 'bold' }} />
    </Appbar.Header>
  );

  const renderHeader = () => (
    <View>
      <Searchbar
        placeholder="Search by Request ID"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

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
          <Icon name="calendar-outline" size={14} color="#999" /> Request Date: {item.requestDate}
        </Text>

        <View style={styles.box}>
          <View>
            <Text style={styles.label}>Request ID</Text>
            <Text style={styles.value}>{item.id}</Text>
          </View>
          <View>
            <Text style={styles.label}>Request Type</Text>
            <Text style={styles.value}>{item.requestType}</Text>
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
          <Text style={[styles.statusText, {
            color:
              item.status === 'Approved'
                ? '#4caf50'
                : item.status === 'Rejected'
                  ? '#f44336'
                  : '#f4b400',
          }]}>
            {item.status} - {item.statusDate}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.root}>
      {renderAppBar()}

      <FlatList
        data={filterData()}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<RNText style={styles.footer}>Showing {filterData().length} records</RNText>}
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
          setSelectedFilter(null);
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
          setSelectedFilter(null);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f5f4' },
  listContainer: { padding: 16, paddingBottom: 40 },
  searchBar: { borderRadius: 10, marginBottom: 12, backgroundColor: '#fff' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  chip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipSelected: { backgroundColor: '#4caf50' },
  chipText: { fontSize: 14, color: '#333' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateLabel: { fontSize: 12, color: '#999' },
  dateValue: { fontSize: 14, color: '#333', marginTop: 4 },
  dateIconWrapper: { paddingHorizontal: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 12,
    elevation: 1,
  },
  dateText: { fontSize: 13, color: '#666', marginBottom: 8 },
  box: {
    backgroundColor: '#f0f4f3',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { color: '#888', fontSize: 13 },
  value: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusText: { fontSize: 13 },
  footer: { textAlign: 'center', marginTop: 12, color: '#666' },
});

export default ApprovalsScreen;
