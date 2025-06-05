import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
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
const statusTabs = [
  {label: 'Pending', color: '#FFA500', icon: 'clock-alert-outline'},
];

const LeaveRequestStatusScreen = () => {
  const navigation = useNavigation();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [leaveData, setLeaveData] = useState([]); // State for leave data
  const [feedbackVisible, setFeedbackVisible] = useState(false); // State for FeedbackModal visibility
  const [feedbackMessage, setFeedbackMessage] = useState(''); // State for FeedbackModal message
  const employeeDetails = useFetchEmployeeDetails();

  const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api'; // Use your local API
  const BASE_URL_LOCAL = 'http://192.168.29.2:90/api/'; // Use your local API

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        if (employeeDetails?.id) {
          const response = await axios.get(
            `${BASE_URL_PROD}/ApplyLeave/GetAllEmployeeApplyLeave/${employeeDetails.childCompanyId}/${employeeDetails.id}`,
          );
          setLeaveData(response.data); // Set fetched data
          console.log(
            'Fetched ==============================leave data:',
            response.data,
          ); // Debug fetched data
        }

        console.log(
          'Employee Details in LeaveRequestStatusScreen:',
          employeeDetails,)
      } catch (error) {
        console.error('Error fetching leave data:', error);
      }
    };

    fetchLeaveData();
  }, [employeeDetails]);

  console.log('Employee Details', employeeDetails);

  // Format date for display
  const formatDate = date => {
    return date ? date.toLocaleDateString('en-GB') : 'Select';
  };

  // Filter data by date range
  const filteredData = leaveData.filter(item => {
    if (!fromDate && !toDate) return true;

    const itemDate = new Date(item.fromLeaveDate); // Corrected to use `fromLeaveDate`
    const fromMatch = fromDate ? itemDate >= fromDate : true;
    const toMatch = toDate ? itemDate <= toDate : true;

    return fromMatch && toMatch;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      default:
        return '#6B7280';
    }
  };

  const handleDeleteLeave = async id => {
    try {
      const leaveToDelete = leaveData.find(item => item.id === id);
      console.log('Deleting leave data:', leaveToDelete); // Log the leave data being deleted
      console.log('Leave ID to delete:', id); // Log the ID being deleted

      const response = await axios.get(
        `${BASE_URL_PROD}/ApplyLeave/DeleteApplyLeave/${id}`, 
      );

      if (response?.status === 200) {
        setLeaveData(prevData => prevData.filter(item => item.id !== id)); // Remove deleted leave from state
        setFeedbackMessage('Leave deleted successfully'); // Set success message
        setFeedbackVisible(true); // Show FeedbackModal
      } else {
        Alert.alert('Error', 'Failed to delete leave');
      }
    } catch (error) {
      console.error('Error deleting leave:', error);
      Alert.alert('Error', 'Failed to delete leave');
    }
  };

  const handleEditLeave = leaveDataToPass => {
    navigation.navigate('ApplyLeave', {leaveData: leaveDataToPass});
  };

  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Leave" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Date Range Picker */}
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

      {/* Leave Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No requests</Text>
            {(fromDate || toDate) && (
              <Text style={styles.emptySubText}>for selected date range</Text>
            )}
          </View>
        ) : (
          filteredData.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9}>
              <View style={styles.card}>
                {/* Leave Type */}
                <View style={styles.detailRow}>
                  <Icon name="briefcase-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Leave</Text>
                  <Text style={styles.detailText}>
                    : <Text>{item.leaveName || 'N/A'}</Text>
                  </Text>
                </View>

                {/* Remarks */}
                <View style={styles.detailRow}>
                  <Icon name="comment-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>Remarks</Text>
                  <Text style={styles.detailText}>
                    : <Text>{item.remarks || 'N/A'}</Text>
                  </Text>
                </View>

                {/* Applied Date */}
                <View style={styles.detailRow}>
                  <Icon name="clock-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Applied on:{' '}
                    <Text>
                      {item.createdDate
                        ? new Date(item.createdDate).toLocaleDateString()
                        : 'N/A'}
                    </Text>
                  </Text>
                </View>

                {/* Status, Cancel Button, and Edit/Delete Buttons */}
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

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditLeave(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>

                  {item.status === 'Pending' && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleDeleteLeave(item.id)}>
                      <Text style={styles.cancelText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Date Pickers */}
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
        minimumDate={fromDate}
        onConfirm={date => {
          setShowToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setShowToPicker(false)}
      />

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

export default LeaveRequestStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    justifyContent: 'space-between',
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
  arrowIcon: {
    marginHorizontal: 8,
  },
  clearButton: {
    marginLeft: 12,
    padding: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 15,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontWeight: '700',
    fontSize: 17,
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 17,
    color: '#9CA3AF',
  },
  editBtn: {
    backgroundColor: '#E0F7FA',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ACC1',
    marginLeft: 8,
  },
  editText: {
    color: '#00796B',
    fontSize: 13,
    fontWeight: '600',
  },
});
