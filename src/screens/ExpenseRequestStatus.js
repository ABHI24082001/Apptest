import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {Appbar} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import DatePicker from 'react-native-date-picker';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import FeedbackModal from '../component/FeedbackModal'; // Import FeedbackModal
const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';

const ExpenseRequestStatusScreen = () => {
  const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [selectedType, setSelectedType] = useState(null); // 'Expense' | 'Advance' | null
  const [feedbackVisible, setFeedbackVisible] = useState(false); // Feedback modal visibility
  const [feedbackMessage, setFeedbackMessage] = useState(''); // Feedback message

  // Fetch expense data from API
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!employeeDetails?.childCompanyId || !employeeDetails?.id) {
        console.warn('Employee details are missing'); // Log a warning instead of showing an alert
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL_PROD}/PaymentAdvanceRequest/GetPaymentAdvanveRequestList/${employeeDetails.childCompanyId}/${employeeDetails.id}`,
        );
        setExpenseData(response.data);

        console.log(response.data , 'ttttttytttttttttt'); // Log the fetched data for debugging
      } catch (error) {
        console.error('Error fetching expense data:', error);
        Alert.alert('Error', 'Failed to fetch expense data');
      }
    };

    fetchExpenseData();
  }, [employeeDetails]);

  const filteredData = expenseData.filter(item => {
    const matchesType = selectedType ? item.requestType === selectedType : true;

    if (!fromDate && !toDate) return matchesType;

    const itemDate = new Date(item.createdDate);
    const fromMatch = fromDate ? itemDate >= fromDate : true;
    const toMatch = toDate ? itemDate <= toDate : true;

    return matchesType && fromMatch && toMatch;
  });

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteExpense = async (requestId, companyId) => {
    try {
      const response = await axios.get(
        `${BASE_URL_PROD}/PaymentAdvanceRequest/DeletePaymentAdvanveRequest/${requestId}/${companyId}`
      );

      if (response?.status === 200) {
        setExpenseData(prevData => prevData.filter(item => item.requestId !== requestId)); // Remove deleted expense from state
        setFeedbackMessage('Expense request deleted successfully'); // Set feedback message
        setFeedbackVisible(true); // Show feedback modal
      } else {
        Alert.alert('Error', 'Failed to delete expense request');
      }
    } catch (error) {
      console.error('Error deleting expense request:', error);
      Alert.alert('Error', 'Failed to delete expense request');
    }
  };

  const handleEditExpense = (expense) => {
    console.log('Selected ========== Data:', expense); // Log the selected expense for debugging
    navigation.navigate('PaymentRequest', {
      expence: expense, // Pass the selected expense data with the correct key 'expence'
    });
  };

  const getStatusColor = status => {
    const colors = {
      Pending: '#FFA500',
      Approved: '#00C851',
      Rejected: '#ff4444',
    };
    return colors[status] || '#6B7280';
  };

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="  My Expense" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Type Filter */}
      <View style={styles.typeFilterContainer}>
        <Text style={styles.filterTitle}>Filter by Type</Text>
        <View style={styles.typeFilterRow}>
          {['Expense', 'Advance'].map(type => {
            const isActive = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeFilterButton,
                  isActive && {
                    backgroundColor: '#E0F2FE',
                    borderColor: '#3B82F6',
                  },
                ]}
                onPress={() =>
                  setSelectedType(type === selectedType ? null : type)
                }>
                <Text
                  style={[
                    styles.typeFilterText,
                    {color: isActive ? '#1D4ED8' : '#374151'},
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Date Filter */}
      <View style={styles.dateRangeContainer}>
        <Text style={styles.filterTitle}>Filter by Applied Date</Text>
        <View style={styles.datePickerRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowFromPicker(true)}>
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={18} color="#3B82F6" />
              <Text style={styles.dateButtonText}>
                {fromDate ? formatDate(fromDate) : 'From Date'}
              </Text>
            </View>
          </TouchableOpacity>

          <Icon
            name="arrow-right"
            size={20}
            color="#6B7280"
            style={styles.arrowIcon}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowToPicker(true)}>
            <View style={styles.dateButtonContent}>
              <Icon name="calendar" size={18} color="#3B82F6" />
              <Text style={styles.dateButtonText}>
                {toDate ? formatDate(toDate) : 'To Date'}
              </Text>
            </View>
          </TouchableOpacity>

          {(fromDate || toDate) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setFromDate(null);
                setToDate(null);
              }}>
              <Icon name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Pickers */}
      <DatePicker
        modal
        mode="date"
        open={showFromPicker}
        date={fromDate || new Date()}
        onConfirm={date => {
          setShowFromPicker(false);
          setFromDate(date);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={showToPicker}
        date={toDate || new Date()}
        onConfirm={date => {
          setShowToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setShowToPicker(false)}
      />

      {/* Expense Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.name}>{item.employeeName}</Text>
              <Text style={styles.subtitle}>
                {item.designation}, {item.department}
              </Text>

              <View style={styles.detailRow}>
                <Icon name="calendar-blank-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Applied On: {formatDate(item.createdDate)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Icon name="cash-multiple" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Type: {item.requestType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Icon name="currency-inr" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Amount: ₹{item.totalAmount}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Icon name="message-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Remarks: {item.remarks}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(item.status)}15`,
                      borderColor: getStatusColor(item.status),
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: getStatusColor(item.status)},
                    ]}>
                    {item.status}
                  </Text>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditExpense(item)}>
                  <Icon name="pencil-outline" size={18} color="#3B82F6" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert(
                      'Delete',
                      `Are you sure you want to delete the request for ${item.employeeName}?`,
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () =>
                            handleDeleteExpense(item.requestId, item.companyId),
                        },
                      ],
                    );
                  }}>
                  <Icon name="trash-can-outline" size={18} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        type="deleted"
        message={feedbackMessage}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  typeFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeFilterRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeFilterButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateRangeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  arrowIcon: {marginHorizontal: 8},
  clearButton: {marginLeft: 12, padding: 8},

  scrollContainer: {padding: 16, paddingBottom: 24},
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {fontWeight: '800', fontSize: 16, color: '#111827'},
  subtitle: {fontSize: 14, color: '#6B7280', marginBottom: 8},
  detailRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  detailText: {fontSize: 15, color: '#4B5563', marginLeft: 8},
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {fontSize: 12, fontWeight: '600'},
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {fontSize: 16, color: '#6B7280', marginTop: 16},
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default ExpenseRequestStatusScreen;
