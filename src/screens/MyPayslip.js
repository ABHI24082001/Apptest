import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Card , Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';

const MyPaySlip = () => {
  const navigation = useNavigation();

  const allPayslips = [
    {
      id: '1',
      month: 'April, 2025',
      salary: '₹50,000',
      date: new Date('2025-04-01'),
    },
    {
      id: '2',
      month: 'March, 2025',
      salary: '₹50,000',
      date: new Date('2025-03-01'),
    },
    {
      id: '3',
      month: 'February, 2025',
      salary: '₹50,000',
      date: new Date('2025-02-01'),
    },
    {
      id: '4',
      month: 'January, 2025',
      salary: '₹50,000',
      date: new Date('2025-01-01'),
    },
    {
      id: '5',
      month: 'December, 2024',
      salary: '₹50,000',
      date: new Date('2024-12-01'),
    },
  ];

  const filterOptions = [
    {label: 'Last Month', value: 'last_month'},
    {label: 'Last 3 Months', value: 'last_3_months'},
    {label: 'Quarterly', value: 'quarterly'},
    {label: 'Yearly', value: 'yearly'},
  ];

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filteredPayslips, setFilteredPayslips] = useState(allPayslips);

  const filterPayslips = () => {
    let filtered = [...allPayslips];

    if (selectedFilter) {
      const now = new Date();
      let from = new Date();

      switch (selectedFilter) {
        case 'last_month':
          from.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
        case 'quarterly':
          from.setMonth(now.getMonth() - 3);
          break;
        case 'yearly':
          from.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(p => p.date >= from && p.date <= now);
    } else if (fromDate && toDate) {
      filtered = filtered.filter(p => p.date >= fromDate && p.date <= toDate);
    }

    setFilteredPayslips(filtered);
  };

  useEffect(() => {
    filterPayslips();
  }, [selectedFilter, fromDate, toDate]);

  const formatDate = date => date?.toLocaleDateString('en-GB') || '--';

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-document-outline" size={30} color="#6D75FF" />
        <View style={styles.cardText}>
          <Text style={styles.month}>{item.month}</Text>
          <Text style={styles.salary}>Disbursed Salary: {item.salary}</Text>
        </View>
        <TouchableOpacity style={styles.previewBtn}>
          <Text style={styles.previewText}>Preview</Text>
        </TouchableOpacity>
        <Icon name="download" size={24} color="#666" />
      </View>
    </Card>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.chipRow}>
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              selectedFilter === option.value && styles.chipSelected,
            ]}
            onPress={() => {
              setSelectedFilter(option.value);
              setFromDate(null);
              setToDate(null);
            }}>
            <Text
              style={[
                styles.chipText,
                selectedFilter === option.value && styles.chipTextSelected,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{formatDate(fromDate)}</Text>
        </TouchableOpacity>

        <View style={styles.dateIconWrapper}>
          <Icon name="arrow-right" size={20} color="#666" />
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{formatDate(toDate)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppSafeArea>
          <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Payslip" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <FlatList
        data={filteredPayslips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="file-remove-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>
              No payslips found for selected filters.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.scrollContent}
      />

      {/* Date Pickers */}
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
    </AppSafeArea>
  );
};

export default MyPaySlip;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#6D75FF',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#888',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  dateIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  month: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  salary: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '600',
  },
  previewBtn: {
    backgroundColor: '#6D75FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  previewText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
});
