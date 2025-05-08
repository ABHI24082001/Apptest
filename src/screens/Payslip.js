import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Card, Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPickerSelect from 'react-native-picker-select';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';

const MyPaySlip = () => {
  const navigation = useNavigation();

  const allPayslips = [
    { id: '1', month: 'April, 2025', salary: '₹50,000', date: new Date('2025-04-01') },
    { id: '2', month: 'March, 2025', salary: '₹50,000', date: new Date('2025-03-01') },
    { id: '3', month: 'February, 2025', salary: '₹50,000', date: new Date('2025-02-01') },
    { id: '4', month: 'January, 2025', salary: '₹50,000', date: new Date('2025-01-01') },
    { id: '5', month: 'December, 2024', salary: '₹50,000', date: new Date('2024-12-01') },
  ];

  const filterOptions = [
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
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
          from.setMonth(now.getMonth() - 3);
          break;
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

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-GB') || '--';
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-document-outline" size={30} color="#6D75FF" />
        <View style={styles.cardText}>
          <Text style={styles.month}>{item.month}</Text>
          <Text style={styles.salary}>Disbursed salary: {item.salary}</Text>
        </View>
        <TouchableOpacity style={styles.previewBtn}>
          <Text style={styles.previewText}>Preview</Text>
        </TouchableOpacity>
        <Icon name="download" size={24} color="#666" />
      </View>
    </Card>
  );

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Payslip" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <View style={styles.dropdownWrapper}>
            <RNPickerSelect
              value={selectedFilter}
              onValueChange={(val) => {
                setSelectedFilter(val);
                setFromDate(null);
                setToDate(null);
              }}
              items={filterOptions}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
              placeholder={{ label: 'Select Filter', value: null }}
            />
          </View>

          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateBtnText}>From: {formatDate(fromDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateBtnText}>To: {formatDate(toDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modals */}
        <DatePicker
          modal
          open={showFromPicker}
          date={fromDate || new Date()}
          mode="date"
          onConfirm={(date) => {
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
          onConfirm={(date) => {
            setShowToPicker(false);
            setToDate(date);
            setSelectedFilter(null);
          }}
          onCancel={() => setShowToPicker(false)}
        />

        {/* Payslip List */}
        <FlatList
          data={filteredPayslips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      </ScrollView>
    </AppSafeArea>
  );
};

export default MyPaySlip;

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
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  dropdownWrapper: {
    flex: 1,
    minWidth: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  dateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flex: 1,
    minWidth: '48%',
  },
  dateBtnText: {
    fontSize: 14,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
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
    fontWeight: '600',
    color: '#333',
  },
  salary: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  previewBtn: {
    backgroundColor: '#6D75FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  previewText: {
    color: '#fff',
    fontSize: 12,
  },
  list: {
    paddingBottom: 30,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  iconContainer: {
    top: 14,
    right: 10,
  },
});
