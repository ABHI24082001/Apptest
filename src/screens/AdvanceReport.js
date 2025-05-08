import React, {useState} from 'react';
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
import RNPickerSelect from 'react-native-picker-select';

import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';
const AdvancePaymentReport = () => {
 
  const [selectedFilter, setSelectedFilter] = useState('last_month');
  const [activeTab, setActiveTab] = useState('advance');

  const reports = [
    {
      id: '1',
      requestDate: '2025-04-01',
      requestAmount: '1000',
      approvedAmount: '1000',
      status: 'approved',
      statusDate: '2025-04-30',
    },
    {
      id: '2',
      requestDate: '2025-03-01',
      requestAmount: '1500',
      approvedAmount: '1500',
      status: 'pending',
      statusDate: '2025-04-10',
    },
    {
      id: '3',
      requestDate: '2025-02-01',
      requestAmount: '5000',
      approvedAmount: '5000',
      status: 'rejected',
      statusDate: '2025-02-01',
    },
  ];

  const filterOptions = [
    {label: 'Last Month', value: 'last_month'},
    {label: 'Last 3 Months', value: 'last_3_months'},
    {label: 'This Year', value: 'yearly'},
  ];

  const getStatusIcon = status => {
    switch (status) {
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

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };
    const navigation = useNavigation();
  

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Payment Request List"
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

        {/* Filter Dropdown */}
        <View style={styles.filterRow}>
          <RNPickerSelect
            value={selectedFilter}
            onValueChange={value => setSelectedFilter(value)}
            items={filterOptions}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Icon name="chevron-down" size={20} color="#6D75FF" />}
          />
        </View>

        {/* Report Cards */}
        {activeTab === 'advance' ? (
          reports.length > 0 ? (
            reports.map(report => {
              const statusIcon = getStatusIcon(report.status);
              return (
                <Card key={report.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <Icon name="calendar-check" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Request Date:</Text>
                      <Text style={styles.value}>
                        {formatDate(report.requestDate)}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="cash" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Request Amount:</Text>
                      <Text style={styles.value}>₹{report.requestAmount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="cash-check" size={20} color="#6D75FF" />
                      <Text style={styles.label}>Approved Amount:</Text>
                      <Text style={styles.value}>₹{report.approvedAmount}</Text>
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
                        {formatDate(report.statusDate)}
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
                <Text style={styles.label}>Expense Date:</Text>
                <Text style={styles.value}>01/04/2025</Text>
              </View>
              <View style={styles.row}>
                <Icon name="file-document" size={20} color="#6D75FF" />
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>Travel</Text>
              </View>
              <View style={styles.row}>
                <Icon name="currency-inr" size={20} color="#6D75FF" />
                <Text style={styles.label}>Amount:</Text>
                <Text style={styles.value}>₹2000</Text>
              </View>
              <View style={styles.statusRow}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={[styles.statusText, {color: '#4CAF50'}]}>
                  Approved
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    
  },
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
  activeTabButton: {
    backgroundColor: '#6D75FF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#FFF',
  },
  filterRow: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
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
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
    width: 120,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  statusDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#333',
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
  placeholder: {
    color: '#999',
  },
});

export default AdvancePaymentReport;
