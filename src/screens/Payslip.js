import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import AppSafeArea from '../component/AppSafeArea';

const MyPaySlipScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('last_month');

  const payslips = [
    { id: '1', month: 'April, 2025', salary: '₹45,000' },
    { id: '2', month: 'March, 2025', salary: '₹44,500' },
    { id: '3', month: 'February, 2025', salary: '₹44,000' },
  ];

  const filterOptions = [
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-document-outline" size={30} color="#6D75FF" />
        <View style={styles.cardText}>
          <Text style={styles.month}>{item.month}</Text>
          <Text style={styles.salary}>Net Salary: {item.salary}</Text>
        </View>
        <TouchableOpacity style={styles.previewBtn}>
          <Text style={styles.previewText}>Preview</Text>
        </TouchableOpacity>
        <Icon name="download" size={24} color="#666" style={{ marginLeft: 8 }} />
      </View>
    </Card>
  );

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My PaySlip" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          value={selectedFilter}
          onValueChange={setSelectedFilter}
          items={filterOptions}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
        />
      </View>

      <FlatList
        data={payslips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </AppSafeArea>
  );
};

export default MyPaySlipScreen;

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
  pickerWrapper: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  list: { paddingHorizontal: 16 },
  card: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 10,
  },
  month: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  salary: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  previewBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  previewText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: '#333',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#333',
    paddingRight: 30,
  },
  iconContainer: {
    top: 12,
    right: 10,
  },
};
