import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  Appbar,
  Button,
  Card,
  TextInput,
  Avatar,
  Badge,
  Divider,
  Title,
  Paragraph,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {Picker} from '@react-native-picker/picker';
import AppSafeArea from '../component/AppSafeArea';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import BASE_URL from '../constants/apiConfig';
import {useAuth} from '../constants/AuthContext';

// Helper to format date string as DD-MM-YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}-${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}-${d.getFullYear()}`;
}

// Status badge color helper
const getStatusColor = status => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return '#FFA500';
    case 'approved':
      return '#00C851';
    case 'rejected':
      return '#ff4444';
    default:
      return '#6B7280';
  }
};

const ExitRequestStatusScreen = ({navigation}) => {
  // const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [canApplyNew, setCanApplyNew] = useState(true);
  const [exitDate, setExitDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [remarks, setRemarks] = useState('');
  const [employees] = useState([
    {id: 'AA_43', name: 'Employee 1'},
    {id: 'AA_45', name: 'Employee 2'},
  ]);
  const [allExitRecords, setAllExitRecords] = useState([]);

  // Get user details from Auth context
  const {user} = useAuth();

  console.log('User details:', user);

  // Fetch all exit records using the API
  const fetchAllExitRecords = async () => {
    if (!user?.childCompanyId) {
      console.log('No child company ID found in user data');
      return;
    }
    
    try {
      console.log(`Fetching exit records for company ID: ${user.childCompanyId}`);
      const response = await axios.get(
        `${BASE_URL}/EmployeeExit/GetAllEmpExitRecords/${user.childCompanyId}`
      );
      
      if (response.status === 200) {
        const records = response.data;
        setAllExitRecords(records);
        console.log('All exit records:', records);
      } else {
        console.error('Failed to fetch all exit records:', response.status);
      }
    } catch (error) {
      console.error('Error fetching all exit records:', error);
    }
  };

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (employeeDetails?.id) {
        fetchExitRequests();
      }
      
      // Fetch all exit records if user has childCompanyId
      if (user?.childCompanyId) {
        fetchAllExitRecords();
      }
      
      return () => {}; // cleanup if needed
    }, [employeeDetails?.id, user?.childCompanyId]),
  );

  const fetchExitRequests = async () => {
    if (!employeeDetails?.id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/EmployeeExit/GetExEmpByEmpId/${employeeDetails.id}`,
      );
      const data = await res.json();
      const exitRequests = Array.isArray(data) ? data : [];
      setRequests(exitRequests);

      // Check if user can apply new exit request
      const hasPendingRequest = exitRequests.some(
        req => req.applicationStatus?.toLowerCase() === 'pending',
      );

      // Set canApplyNew based on existing requests
      setCanApplyNew(!hasPendingRequest);
    } catch (e) {
      console.error('Error fetching exit requests:', e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle withdraw request
  const handleWithdraw = async id => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this exit application?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setWithdrawingId(id);
              const response = await axios.get(
                `${BASE_URL}/EmployeeExit/WithdrawExitApplication/${id}`,
              );

              if (response.status === 200) {
                Alert.alert(
                  'Success',
                  'Exit application withdrawn successfully',
                  [{text: 'OK'}],
                );
                // Refresh the exit requests after withdrawal
                fetchExitRequests();
              } else {
                Alert.alert('Error', 'Failed to withdraw application');
              }
            } catch (error) {
              console.error('Error withdrawing application:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message ||
                  'Failed to withdraw application',
              );
            } finally {
              setWithdrawingId(null);
            }
          },
        },
      ],
    );
  };

  // Handle navigation to apply new exit request
  const handleApplyNew = () => {
    if (!canApplyNew) {
      Alert.alert(
        'Application In Progress',
        'You already have a pending exit application. Please withdraw it before submitting a new one.',
        [{text: 'OK'}],
      );
      return;
    }
    
    // Add navigation or additional logic here
  };
  
  // Default status for new applications
  const defaultStatus = {
    status: 'pending',
    color: '#F59E0B'
  };
  
  // Get status color based on status string
  const getStatusDetails = (statusStr) => {
    if (!statusStr) return defaultStatus;
    
    const status = statusStr.toLowerCase();
    if (status.includes('approved')) {
      return { status: 'Approved', color: '#10B981' };
    } else if (status.includes('rejected')) {
      return { status: 'Rejected', color: '#EF4444' };
    } else {
      return { status: 'Pending', color: '#F59E0B' };
    }
  };
  
  // Get employee initials for avatar
  const getInitials = name => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AppSafeArea>
      {/* Header with Gradient Background */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Employee's Exit Request"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              Loading your exit requests...
            </Text>
          </View>
        ) : requests.length === 0 ? (
          canApplyNew ? (
            <Card style={styles.formCard}>
              <Card.Content>
                {/* Employee Info Section */}
                <Card style={styles.employeeInfoCard}>
                  <Card.Content>
                    <View style={styles.employeeInfoContainer}>
                      <View style={styles.employeeDetails}>
                        <Text style={styles.employeeName}>
                          {employeeDetails?.empName || 'Employee Name'}
                        </Text>
                        <View
                          style={[
                            styles.statusBadgeContainer,
                          ]}>
                          <View 
                            style={[
                              styles.statusIndicator, 
                              { backgroundColor: defaultStatus.color }
                            ]} 
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: defaultStatus.color }
                            ]}>
                            {defaultStatus.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.employeeDate}>
                        <Text style={styles.employeeDesignation}>
                          {employeeDetails?.designation || 'Designation'}
                        </Text>
                        <Text style={styles.employeeDepartment}>
                          {employeeDetails?.department || 'Department'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Dropdown for Employee Selection */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Contingent Employees' Code</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedEmployee}
                      style={styles.picker}
                      onValueChange={itemValue =>
                        setSelectedEmployee(itemValue)
                      }>
                      <Picker.Item label="Select Employee" value="" />
                      {employees.map(employee => (
                        <Picker.Item
                          key={employee.id}
                          label={employee.name}
                          value={employee.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Card for date fields and reason in row format */}
                <Card style={styles.dataCard}>
                  <Card.Content>
                    {/* Row for Applied Date */}
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="calendar-plus" size={20} color="#3B82F6" />
                        <Text style={styles.dataLabel}>Applied Date :</Text>
                      </View>
                     <Text style={styles.dataLabel}>Applied Date </Text>
                    
                    </View>
                    
                    {/* Row for Exit Date */}
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="calendar-remove" size={20} color="#EF4444" />
                        <Text style={styles.dataLabel}>Exit Date :</Text>
                      </View>
                       <Text style={styles.dataLabel}>Exit Date </Text>
                    </View>
                    
                    {/* Row for Reasons */}
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="information-outline" size={20} color="#8B5CF6" />
                        <Text style={styles.dataLabel}>Reasons :</Text>
                      </View>
                     <Text style={styles.dataLabel}>Reasons </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Remarks Input */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>
                    Remarks (Maximum 100 Characters)*
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={remarks}
                    onChangeText={text => {
                      if (text.length <= 100) setRemarks(text);
                    }}
                    mode="outlined"
                    placeholder="Enter Remarks"
                    multiline
                    numberOfLines={3}
                    maxLength={100}
                    right={<TextInput.Affix text={`${remarks.length}/100`} />}
                  />
                </View>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="contained"
                  onPress={() =>
                    Alert.alert(
                      'Success',
                      'Request has been approved.',
                    )
                  }
                  style={styles.approveBtn}>
                  Approve
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Rejected', 'Request has been rejected.')}
                  style={styles.rejectBtn}
                  labelStyle={styles.rejectBtnLabel}>
                  Reject
                </Button>
              </Card.Actions>
            </Card>
          ) : (
            <Card style={styles.warningCard}>
              <Card.Content style={styles.pendingMessageContainer}>
                <Icon name="alert-circle-outline" size={48} color="#FFA500" />
                <Text style={styles.pendingMessageText}>
                  You already have a pending exit application. Please withdraw
                  it before submitting a new one.
                </Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Home')}
                  style={[styles.cancelBtn, {backgroundColor: '#EF4444'}]}
                  labelStyle={{color: '#fff'}}>
                  Cancel
                </Button>
              </Card.Actions>
            </Card>
          )
        ) : (
          <>
            {requests.map((item, index) => (
              <Card key={index} style={styles.requestCard}>
                {/* Employee Info Section */}
                <Card.Content>
                  <View style={styles.employeeInfoContainer}>
                    <Avatar.Text
                      size={50}
                      label={getInitials(employeeDetails?.empName)}
                      style={styles.avatar}
                    />
                    <View style={styles.employeeDetails}>
                      <Text style={styles.employeeName}>
                        {employeeDetails?.empName || 'Employee Name'}
                      </Text>
                      <Text style={styles.employeeDesignation}>
                        {employeeDetails?.designation || 'Designation'}
                      </Text>
                      <Text style={styles.employeeDepartment}>
                        {employeeDetails?.department || 'Department'}
                      </Text>
                    </View>
                    <Badge
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusDetails(item.applicationStatus).color,
                        },
                      ]}>
                      {getStatusDetails(item.applicationStatus).status}
                    </Badge>
                  </View>
                </Card.Content>

                <Divider style={styles.divider} />

                {/* Exit Details Section */}
                <Card.Content>
                  <View style={styles.detailsContainer}>
                    {/* Applied Date Card */}
                    <Card style={styles.detailCard}>
                      <Card.Content>
                        <View style={styles.detailRow}>
                          <Icon
                            name="calendar-check"
                            size={24}
                            color="#3B82F6"
                          />
                          <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Applied Date</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(item.appliedDt)}
                            </Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>

                    {/* Exit Date Card */}
                    <Card style={styles.detailCard}>
                      <Card.Content>
                        <View style={styles.detailRow}>
                          <Icon
                            name="calendar-remove"
                            size={24}
                            color="#EF4444"
                          />
                          <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Exit Date</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(item.exitDt)}
                            </Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>

                  {/* Reason Section */}
                  <Card style={styles.reasonCard}>
                    <Card.Content>
                      <Text style={styles.reasonTitle}>Reason for Exit</Text>
                      <Paragraph style={styles.reasonText}>
                        {item.exitReasons}
                      </Paragraph>
                    </Card.Content>
                  </Card>

                  {/* Supervisor Remarks */}
                  {item.supervisorRemarks && (
                    <Card style={styles.remarksCard}>
                      <Card.Content>
                        <View style={styles.remarksHeader}>
                          <Icon name="account-tie" size={20} color="#6B7280" />
                          <Text style={styles.remarksTitle}>
                            Supervisor Remarks
                          </Text>
                        </View>
                        <Paragraph style={styles.remarksText}>
                          {item.supervisorRemarks}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  )}

                  {/* HR Remarks */}
                  {item.hrremarks && (
                    <Card style={styles.remarksCard}>
                      <Card.Content>
                        <View style={styles.remarksHeader}>
                          <Icon
                            name="account-group"
                            size={20}
                            color="#6366F1"
                          />
                          <Text
                            style={[styles.remarksTitle, {color: '#6366F1'}]}>
                            HR Remarks
                          </Text>
                        </View>
                        <Paragraph
                          style={[styles.remarksText, {color: '#6366F1'}]}>
                          {item.hrremarks}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  )}
                </Card.Content>

                {/* Action buttons */}
                {item.applicationStatus?.toLowerCase() === 'pending' && (
                  <Card.Actions style={styles.cardActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleWithdraw(item.id)}
                      loading={withdrawingId === item.id}
                      disabled={withdrawingId !== null}
                      style={styles.withdrawBtn}
                      labelStyle={styles.withdrawBtnLabel}
                      icon="close-circle-outline">
                      Withdraw Application
                    </Button>
                  </Card.Actions>
                )}

                {/* Add reapply button for rejected applications */}
                {item.applicationStatus?.toLowerCase() === 'rejected' && (
                  <Card.Actions style={styles.cardActions}>
                    <Button
                      mode="contained"
                      onPress={handleApplyNew}
                      style={styles.reapplyBtn}
                      labelStyle={styles.reapplyBtnLabel}
                      icon="refresh">
                      Apply Again
                    </Button>
                  </Card.Actions>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    elevation: 4,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 18,
  },
  scrollContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  formCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 3,
  },
  warningCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarIcon: {
    backgroundColor: '#3B82F6',
  },
  employeeInfoCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 1,
  },
  employeeInfoContainer: {
    paddingVertical: 8,
  },
  avatar: {
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  
  },
   employeeDate: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  employeeDesignation: {
    fontSize: 14,
    color: '#64748B',
    
    marginRight: 12,
    textAlign: 'center',
    alignItems: 'center',
    alignContent: 'center',

  },
  employeeDepartment: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'orange',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  divider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  reasonCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 15,
    color: '#1E293B',
  },
  remarksCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#CBD5E1',
    elevation: 1,
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  remarksTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  remarksText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    fontSize: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  cardActions: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 2,
    paddingBottom: 6,
    paddingHorizontal: 2,
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  cancelBtn: {
    borderColor: '#64748B',
  },
  withdrawBtn: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  withdrawBtnLabel: {
    color: '#ef4444',
  },
  reapplyBtn: {
    backgroundColor: '#10B981',
  },
  reapplyBtnLabel: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  pendingMessageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pendingMessageText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  dataCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  dataLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 8,
  },
  dataInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    height: 20,
  },
  approveBtn: {
    backgroundColor: '#10B981', // Green
    paddingVertical: 1,
    paddingHorizontal: 11,
    borderRadius: 8,
    marginRight: 8,
  },
  approveBtnLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Reject Button Styles
  rejectBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 1,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444', // Red border
  },
  rejectBtnLabel: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
 
export default ExitRequestStatusScreen;
