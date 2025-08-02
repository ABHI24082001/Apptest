import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking
} from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosinstance from '../utils/axiosInstance';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import BASE_URL from '../constants/apiConfig';
const ExpenceRequestStatus = ({ navigation, route }) => {
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract passed data
  const routeParams = route?.params?.expenseData || null;
  
  const employeeDetails = useFetchEmployeeDetails();


  // Fetch expense request details either from route params or from storage
  useEffect(() => {
    const getExpenseDetails = async () => {
      try {
        setLoading(true);
        
        if (routeParams) {
          // Use data passed via navigation
          console.log('Using expense data from route params:', routeParams);
          setExpenseData(routeParams);
          setLoading(false);
          return;
        }
        
        // Try to load from AsyncStorage if not in route params
        const savedSubmission = await AsyncStorage.getItem('last_expense_submission');
        if (savedSubmission) {
          const parsedData = JSON.parse(savedSubmission);
          console.log('Loaded expense data from AsyncStorage:', parsedData);
          setExpenseData(parsedData);
          setLoading(false);
          return;
        }
        
        // If we reach here, we don't have any data
        setError('No expense request data found');
        setLoading(false);
      } catch (err) {
        console.error('Error loading expense data:', err);
        setError('Failed to load expense request data');
        setLoading(false);
      }
    };
    
    getExpenseDetails();
  }, [routeParams]);

  // Format currency display
  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Format date display
  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    status = (status || '').toLowerCase();
    if (status === 'approved') return '#10B981';
    if (status === 'pending') return '#F59E0B';
    if (status === 'rejected') return '#EF4444';
    return '#6B7280';
  };

  // Open document if available
  const openDocument = (documentUri) => {
    if (documentUri) {
      Linking.openURL(documentUri)
        .catch(err => console.error('Error opening document:', err));
    }
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title="Expense Request Status" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <View style={styles.messageContainer}>
            <Icon name="sync" size={40} color="#3B82F6" />
            <Text style={styles.messageText}>Loading expense details...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Icon name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={styles.messageText}>{error}</Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PaymentRequest')}>
              <Text style={styles.actionButtonText}>Create New Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Request Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="file-document-outline" size={24} color="#3B82F6" />
                <Text style={styles.cardTitle}>Request Summary</Text>
                
                {expenseData?.status && (
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(expenseData.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(expenseData.status) }
                    ]}>
                      {expenseData.status}
                    </Text>
                  </View>
                )}
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Request Type:</Text>
                <Text style={styles.detailValue}>
                  {expenseData?.requestType === 'expense' ? 'Expense' : 'Advance'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount:</Text>
                <Text style={[styles.detailValue, styles.amountText]}>
                  {formatCurrency(expenseData?.totalAmount)}
                </Text>
              </View>
              
              {expenseData?.submittedAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(expenseData.submittedAt)}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Remarks:</Text>
                <Text style={styles.detailValue}>
                  {expenseData?.remarks || 'No remarks provided'}
                </Text>
              </View>
            </View>

            {/* Expense Items Section */}
            {expenseData?.items && expenseData.items.length > 0 && (
              <View style={styles.expenseItemsCard}>
                <View style={styles.cardHeader}>
                  <Icon name="format-list-bulleted" size={24} color="#10B981" />
                  <Text style={styles.cardTitle}>Expense Items</Text>
                  <Text style={styles.itemsCount}>{expenseData.items.length}</Text>
                </View>

                <Divider style={styles.divider} />

                {expenseData.items.map((item, index) => (
                  <View key={item.id || index} style={styles.expenseItem}>
                    <View style={styles.expenseItemHeader}>
                      <Text style={styles.expenseItemTitle}>
                        {item.head || 'Unknown Expense'}
                      </Text>
                      <Text style={styles.expenseItemAmount}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    
                    <Text style={styles.expenseItemDate}>
                      {formatDate(item.date)}
                    </Text>
                    
                    {item.title && (
                      <Text style={styles.expenseItemDetails}>
                        {item.title}
                      </Text>
                    )}
                    
                    {item.document && (
                      <TouchableOpacity 
                        onPress={() => openDocument(item.document.uri)}
                        style={styles.documentLink}>
                        <Icon name="file-document-outline" size={16} color="#3B82F6" />
                        <Text style={styles.documentLinkText}>
                          {item.document.name || 'View Document'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {index < expenseData.items.length - 1 && (
                      <Divider style={styles.itemDivider} />
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Actions Section */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('PaymentRequest', {
                  expence: {
                    requestId: expenseData?.requestId,
                    companyId: expenseData?.companyId,
                    requestType: 'expense',
                    totalAmount: expenseData?.totalAmount,
                    remarks: expenseData?.remarks
                  }
                })}>
                <Text style={styles.actionButtonText}>Edit Request</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => navigation.navigate('PaymentRequest')}>
                <Text style={styles.secondaryButtonText}>Create New Request</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

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
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  amountText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  expenseItemsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemsCount: {
    backgroundColor: '#10B981',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  expenseItem: {
    paddingVertical: 10,
  },
  expenseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  expenseItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  expenseItemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseItemDetails: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  itemDivider: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 10,
  },
  documentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  documentLinkText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#2962ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ExpenceRequestStatus;
