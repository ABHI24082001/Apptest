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
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import {useAuth} from '../constants/AuthContext';
import DatePicker from 'react-native-date-picker';
import FeedbackModal from '../component/FeedbackModal';
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

const ExitRequestStatusScreen = ({navigation, route}) => {
  // const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();

  console.log( 'employeeDetails:', employeeDetails);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // Add state for the selected request

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isAuthorizedForFinalApproval, setIsAuthorizedForFinalApproval] = useState(false);
  const [statusAction, setStatusAction] = useState(''); // Add this new state for status actions
  
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  
  // Add new state variables for Account role
  const [isAccountRole, setIsAccountRole] = useState(false);
  const [isAuthorizedAccount, setIsAuthorizedAccount] = useState(false);
  const [accountRequests, setAccountRequests] = useState([]);

  // Get user details from Auth context
  const {user} = useAuth();

  console.log('User details:', user);

  // Check if user is in Account department
  const checkAccountRole = () => {
    if (user && 
        (user.departmentName === 'Account' || 
         user.designationName === 'Account Head' || 
         user.departmentId === 64 ||  // Updated to 64 based on your user object
         user.departmentId === 3)) {   // Keep the original value as fallback
      console.log('User is in Account department role');
      setIsAccountRole(true);
      return true;
    }
    console.log('User is NOT in Account department role');
    return false;
  };

  // Fetch all employees from the registration API
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const childCompanyId = user?.childCompanyId;

      if (!childCompanyId) {
        console.warn('❗ Missing childCompanyId. Cannot fetch employees.');
        return;
      }

      const response = await fetch(
        `${BASE_URL}/EmpRegistration/GetAllEmpRegistration/${childCompanyId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        '✅ Employee registration ==========================================data:',
        data,
      );

      // Transform data into the format needed for picker
      const formattedEmployees = Array.isArray(data)
        ? data.map(emp => ({
            id: emp.empId || emp.id,
            name: `(${emp.employeeId || 'No  ID'})`,
            empCode: emp.empCode,
          }))
        : [];

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (employeeDetails?.id) {
        // Check if user is in Account department
        const isAccountUser = checkAccountRole();
        console.log('Is account user:', isAccountUser);
        
        if (isAccountUser) {
          console.log('Fetching account requests...');
          fetchAccountRequests();
        } else {
          console.log('Fetching employee requests...');
          currentEmploye();
        }
        
        fetchEmployees();
        
        // Get selected request from route params if available
        if (route.params?.selectedRequest) {
          setSelectedRequest(route.params.selectedRequest);
        }
      }

      return () => {}; // cleanup if needed
    }, [
      employeeDetails?.id,
      user?.childCompanyId,
      route.params?.selectedRequest,
    ]),
  );

  const fetchAccountRequests = async () => {
    setLoading(true);

    try {
      const childCompanyId = user?.childCompanyId;

      if (!childCompanyId) {
        console.warn('❗ Missing childCompanyId. Cannot fetch exit records.');
        return;
      }

      console.log('Fetching account requests with childCompanyId:', childCompanyId);
      
      const response = await fetch(
        `${BASE_URL}/EmployeeExit/GetAllEmpExitAccountRecords/${childCompanyId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ All employee in accounted side exit records:==========================', data);

      // Filter pending records for account department - log counts to debug
      console.log('Total account records received:', Array.isArray(data) ? data.length : 0);
      
      // Ensure we're getting data and properly filtering
      const pendingAccountRequests = Array.isArray(data) 
        ? data.filter(item => {
            const isPending = item.accountStatus === 'Pending' || item.accountStatus === '' || !item.accountStatus;
            console.log(`Record ${item.id}: accountStatus=${item.accountStatus}, isPending=${isPending}`);
            return isPending;
          })
        : [];
      
      console.log('Pending account requests after filter:', pendingAccountRequests.length);
      
      // If we have no data after filtering, try showing all records for debugging
      if (pendingAccountRequests.length === 0 && Array.isArray(data) && data.length > 0) {
        console.log('No pending requests found. Showing all account requests for debugging.');
        setRequests(data);
        if (data.length > 0) {
          setSelectedRequest(data[0]);
        }
      } else {
        setRequests(pendingAccountRequests);
        setAccountRequests(pendingAccountRequests);
        
        // If no selected request but we have requests, select the first one
        if (!selectedRequest && pendingAccountRequests.length > 0) {
          setSelectedRequest(pendingAccountRequests[0]);
        }
      }

    } catch (error) {
      console.error('❌ Error fetching account exit records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is authorized for account approvals
  const checkAccountAuthorization = async () => {
    try {
      const requestData = {
        DepartmentId: user?.departmentId || 0,
        DesignationId: user?.designtionId || 0,
        EmployeeId: user?.id || 0,
        ControllerName: 'Employeeexit',
        ActionName: 'EmpExitApplicationAccountList',
        ChildCompanyId: user?.childCompanyId || 1,
        BranchId: user?.branchId || 2,
        UserType: user?.userType || 1,
      };

      console.log('Checking account authorization with data:', requestData);

      const response = await axiosinstance.post(
        `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );

      console.log('Account authorization data:', response.data);

      if (Array.isArray(response.data)) {
        const isAuthorized = response.data.some(item => item.employeeId === user?.id);
        console.log('Is user authorized for account actions:', isAuthorized);
        setIsAuthorizedAccount(isAuthorized);
        return isAuthorized;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking account authorization:', error);
      return false;
    }
  };

  // Existing fetchAccountRequest renamed to avoid confusion
  const fetchAccountRequest = async () => {
    setLoading(true);

    try {
      const childCompanyId = user?.childCompanyId;

      if (!childCompanyId) {
        console.warn('❗ Missing childCompanyId. Cannot fetch exit records.');
        return;
      }

      const response = await fetch(
        `${BASE_URL}/EmployeeExit/GetAllEmpExitAccountRecords/${childCompanyId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ All employee in accounted side exit records:==========================', data);

    
    } catch (error) {
      console.error('❌ Error fetching exit records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFunctionAccessMenu = async () => {
    try {
      const requestData = {
        DepartmentId: user?.departmentId || 0,
        DesignationId: user?.designtionId || 0,

        EmployeeId: user?.id || 0,
        ControllerName: 'Employeeexit',
        ActionName: 'EmpExitApplicationSupervisorList',
        ChildCompanyId: user?.childCompanyId || 1,
        BranchId: user?.branchId || 2,
        UserType: user?.userType || 1,
      };

      // Post request to fetch all authorization records
      // for the `Employeeexit` controller and `EmpExitApplicationSupervisorList` action
      const response = await axiosinstance.post(
        `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );

      // Log fetched authorization records
      console.log(
        'Exit fetchFunctionAccessMenu data=================================================:',
        response.data,
      );

      // Log specific properties if available
      if (Array.isArray(response.data)) {
        console.log('Number of authorization records:', response.data.length);

        // Log the first record for inspection if available
        if (response.data.length > 0) {
          console.log('First authorization record sample:', response.data[0]);
        }
      }

      return response.data;
    } catch (error) {
      // Log error if something went wrong
      console.error('Error fetching functional access menus:', error);
      return null;
    }
  };

  const currentEmploye = async () => {
    setLoading(true);

    try {
      const currentEmployeeId = user?.id;

      if (!currentEmployeeId) {
        console.warn('❗ No current employee ID found.');
        return;
      }

      // Step 1: Fetch functional access data
      const accessList = await fetchFunctionAccessMenu();

      // Step 2: Fetch all exit requests
      const exitResponse = await fetch(
        `${BASE_URL}/EmployeeExit/GetAllEmpExitRecords/${user?.childCompanyId}`,
      );

      if (!exitResponse.ok) {
        throw new Error(`HTTP error! status: ${exitResponse.status}`);
      }

      const allExitRequests = await exitResponse.json();
      console.log('✅ All employee exit records:', allExitRequests);

      let filteredList = [];

      // Step 3: Check if current employee is in access list
      const hasApprovalAccess = Array.isArray(accessList)
        ? accessList.some(item => item.employeeId === currentEmployeeId)
        : false;

      setIsAuthorizedForFinalApproval(hasApprovalAccess);

      if (hasApprovalAccess) {
        // Filter where applicationStatus is Pending
        filteredList = allExitRequests.filter(
          item => item.applicationStatus === 'Pending',
        );
        console.log(
          '✅ Employee has access. FINAL APPROVAL Filtered approval list============================================================================:',
          filteredList,
        );
      } else {
        // Filter where reportingId === currentEmployeeId && supervisorStatus === 'Pending'
        filteredList = allExitRequests.filter(
          item =>
            item.reportingId === currentEmployeeId &&
            item.supervisorStatus === 'Pending',
        );
        console.log(
          '✅ Employee has NO access. Filtered REPORTING MANAGER APPROVAL supervisor list:',
          filteredList,
        );
      }

      // Set the filtered list to the requests state
      setRequests(filteredList);

      // If no selected request but we have requests, select the first one
      if (!selectedRequest && filteredList.length > 0) {
        setSelectedRequest(filteredList[0]);
      }
    } catch (error) {
      console.error('❌ Error in currentEmploye logic:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultStatus = {
    status: 'pending',
    color: '#F59E0B',
  };

  // Get status color based on status string
  const getStatusDetails = statusStr => {
    if (!statusStr) return defaultStatus;

    const status = statusStr.toLowerCase();
    if (status.includes('approved')) {
      return {status: 'Approved', color: '#10B981'};
    } else if (status.includes('rejected')) {
      return {status: 'Rejected', color: '#EF4444'};
    } else {
      return {status: 'Pending', color: '#F59E0B'};
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

  // Add state variables for the feedback modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState('success');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleApprove = async () => {
    if (!remarks.trim()) {
      Alert.alert('Required', 'Please enter remarks before approving.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of the selected request to update
      const updatedRequest = { ...selectedRequest };
      
      // Set the correct fields based on who's approving
      if (isAuthorizedForFinalApproval) {
        // HR approval flow
        updatedRequest.hrstatus = 'Approved';
        updatedRequest.hrremarks = remarks;
        updatedRequest.applicationStatus = 'Approved';
        updatedRequest.exitDt = fromDate ? fromDate.toISOString() : updatedRequest.exitDt;
        updatedRequest.contingentEmpId = selectedEmployee || null;
      } else if (isAccountRole) {
        // Account approval flow
        updatedRequest.accountStatus = 'Approved';
        updatedRequest.accountRemarks = remarks;
      } else {
        // Supervisor/reporting manager approval flow
        updatedRequest.supervisorStatus = 'Approved';
        updatedRequest.supervisorRemarks = remarks;
      }
      
      // Common updates
      updatedRequest.modifiedBy = user?.id;
      updatedRequest.modifiedDate = new Date().toISOString();
      
      console.log('Sending approval request with data:', updatedRequest);
      
      // Make API call
      const response = await axiosinstance.post(
        `${BASE_URL}/EmployeeExit/SaveEmpExitApplication`,
        updatedRequest
      );
      
      console.log('API Response:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        // Show feedback modal instead of alert
        setFeedbackType('success');
        
        // Set appropriate message based on role
        if (isAccountRole) {
          setFeedbackMessage('Request has been approved by Account department');
        } else if (isAuthorizedForFinalApproval) {
          setFeedbackMessage('Request has been approved by HR');
        } else {
          setFeedbackMessage('Request has been approved by supervisor');
        }
        
        setFeedbackVisible(true);
        
        // Refresh data after a short delay
        setTimeout(() => {
          if (isAccountRole) {
            fetchAccountRequests();
          } else {
            currentEmploye();
          }
          setSelectedRequest(null);
          setRemarks('');
        }, 3000);
      } else {
        throw new Error('Failed to update request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      // Show error in feedback modal
      setFeedbackType('fail');
      setFeedbackMessage(`Failed to approve request: ${error.message || 'Unknown error occurred'}`);
      setFeedbackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      Alert.alert('Required', 'Please enter remarks before rejecting.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of the selected request to update
      const updatedRequest = { ...selectedRequest };
      
      // Set the correct fields based on who's rejecting
      if (isAuthorizedForFinalApproval) {
        // HR rejection flow
        updatedRequest.hrstatus = 'Rejected';
        updatedRequest.hrremarks = remarks;
        updatedRequest.applicationStatus = 'Rejected';
      } else if (isAccountRole) {
        // Account rejection flow
        updatedRequest.accountStatus = 'Rejected';
        updatedRequest.accountRemarks = remarks;
      } else {
        // Supervisor/reporting manager rejection flow
        updatedRequest.supervisorStatus = 'Rejected';
        updatedRequest.supervisorRemarks = remarks;
        updatedRequest.applicationStatus = 'Rejected'; // Also reject the application if supervisor rejects
      }
      
      // Common updates
      updatedRequest.modifiedBy = user?.id;
      updatedRequest.modifiedDate = new Date().toISOString();
      
      console.log('Sending rejection request with data:', updatedRequest);
      
      // Make API call
      const response = await axiosinstance.post(
        `${BASE_URL}/EmployeeExit/SaveEmpExitApplication`,
        updatedRequest
      );
      
      console.log('API Response:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        // Show feedback modal instead of alert
        setFeedbackType('fail'); // Using 'fail' type as it's visually appropriate for rejection
        
        // Set appropriate message based on role
        if (isAccountRole) {
          setFeedbackMessage('Request has been rejected by Account department');
        } else if (isAuthorizedForFinalApproval) {
          setFeedbackMessage('Request has been rejected by HR');
        } else {
          setFeedbackMessage('Request has been rejected by supervisor');
        }
        
        setFeedbackVisible(true);
        
        // Refresh data after a short delay
        setTimeout(() => {
          if (isAccountRole) {
            fetchAccountRequests();
          } else {
            currentEmploye();
          }
          setSelectedRequest(null);
          setRemarks('');
        }, 3000);
      } else {
        throw new Error('Failed to update request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Show error in feedback modal
      setFeedbackType('fail');
      setFeedbackMessage(`Failed to reject request: ${error.message || 'Unknown error occurred'}`);
      setFeedbackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Define status actions available for selection
  const statusActions = [
    {id: 'inprogress', label: 'In Progress'},
    {id: 'approve', label: 'Approve'},
    {id: 'reject', label: 'Reject'},
    {id: 'escalate', label: 'Escalate Account'},
  ];


  return (
    <AppSafeArea>
      {/* Header with Gradient Background */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title={isAccountRole ? "Account's Exit Requests" : "Employee's Exit Request"}
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackType}
        message={feedbackMessage}
        onClose={() => setFeedbackVisible(false)}
      />

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              Loading exit request details...
            </Text>
          </View>
        ) : requests.length > 0 ? (
          <>
            {/* Horizontal Employee Request Cards */}
            <Text style={styles.sectionTitle}>
              {isAccountRole 
                ? "Pending Account Clearance Requests" 
                : "Pending Exit Requests"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollView}>
              {requests.map((request, index) => (
                <TouchableOpacity
                  key={request.id}
                  style={[
                    styles.requestItem,
                    selectedRequest?.id === request.id &&
                      styles.selectedRequestItem,
                  ]}
                  onPress={() => setSelectedRequest(request)}>
                  <View style={styles.requestItemContent}>
                    <View style={styles.requestNameRow}>
                      <Text style={styles.requestName} numberOfLines={1}>
                        {request.empName || 'N/A'}
                      </Text>
                      <View
                        style={[
                          styles.miniStatusIndicator,
                          {
                            backgroundColor: getStatusColor(
                              isAccountRole ? request.accountStatus : request.applicationStatus,
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.requestCode} numberOfLines={1}>
                      {request.employeeCode || 'N/A'}
                    </Text>
                    <Text style={styles.requestDate} numberOfLines={1}>
                      Exit: {formatDate(request.exitDt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Detail Card */}
            <Card style={styles.formCard}>
              <Card.Content>
                {/* Employee Info Section */}
                <Card style={styles.employeeInfoCard}>
                  <Card.Content>
                    <View style={styles.employeeInfoContainer}>
                      <View style={styles.employeeDetails}>
                        <Text style={styles.employeeName}>
                          {selectedRequest?.empName || 'Employee Name'}
                        </Text>
                        <View style={[styles.statusBadgeContainer]}>
                          <View
                            style={[
                              styles.statusIndicator,
                              {
                                backgroundColor: getStatusColor(
                                  isAccountRole 
                                    ? selectedRequest?.accountStatus 
                                    : selectedRequest?.applicationStatus,
                                ),
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: getStatusColor(
                                  isAccountRole 
                                    ? selectedRequest?.accountStatus 
                                    : selectedRequest?.applicationStatus,
                                ),
                              },
                            ]}>
                            {isAccountRole 
                              ? (selectedRequest?.accountStatus || 'Pending') 
                              : (selectedRequest?.applicationStatus || 'Pending')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.employeeDate}>
                        <Text style={styles.employeeDesignation}>
                          {selectedRequest?.empDesignation || 'Designation'}
                        </Text>
                        <Text style={styles.employeeDepartment}>
                          {selectedRequest?.empDepartment || 'Department'}
                        </Text>
                      </View>

                      {/* Employee Code */}
                      <Text style={styles.employeeCode}>
                        Employee Code: {selectedRequest?.employeeCode || 'N/A'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Card for date fields and reason in row format */}
                <Card style={styles.dataCard}>
                  <Card.Content>
                    {/* Row for Applied Date */}
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="calendar-plus" size={20} color="#3B82F6" />
                        <Text style={styles.dataLabel}>Applied Date :</Text>
                      </View>
                      <Text style={styles.dataValue}>
                        {selectedRequest
                          ? formatDate(selectedRequest.appliedDt)
                          : 'N/A'}
                      </Text>
                    </View>

                    {/* Row for Exit Date */}
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon
                          name="calendar-remove"
                          size={20}
                          color="#EF4444"
                        />
                        <Text style={styles.dataLabel}>Exit Date :</Text>
                      </View>
                      <Text style={styles.dataValue}>
                        {selectedRequest
                          ? formatDate(selectedRequest.exitDt)
                          : 'N/A'}
                      </Text>
                    </View>

                    {/* Row for Reasons */}
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon
                          name="information-outline"
                          size={20}
                          color="#8B5CF6"
                        />
                        <Text style={styles.dataLabel}>Reasons :</Text>
                      </View>
                      <Text style={styles.dataValue}>
                        {selectedRequest?.exitReasons || 'N/A'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Status Info Card - Show for all roles with appropriate information */}
                <Card style={[styles.dataCard, {borderLeftColor: '#F59E0B'}]}>
                  <Card.Content>
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon
                          name="account-supervisor"
                          size={20}
                          color="#F59E0B"
                        />
                        <Text style={styles.dataLabel}>Supervisor:</Text>
                      </View>
                      <Text
                        style={[
                          styles.dataValue,
                          {
                            color: getStatusColor(
                              selectedRequest?.supervisorStatus,
                            ),
                          },
                        ]}>
                        {selectedRequest?.supervisorStatus || 'Pending'}
                        {selectedRequest?.supervisorRemarks &&
                          ` (${selectedRequest.supervisorRemarks})`}
                      </Text>
                    </View>

                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="account-cash" size={20} color="#F59E0B" />
                        <Text style={styles.dataLabel}>Account:</Text>
                      </View>
                      <Text
                        style={[
                          styles.dataValue,
                          {
                            color: getStatusColor(
                              selectedRequest?.accountStatus,
                            ),
                          },
                        ]}>
                        {selectedRequest?.accountStatus || 'Pending'}
                        {selectedRequest?.accountRemarks &&
                          ` (${selectedRequest.accountRemarks})`}
                      </Text>
                    </View>

                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="account-tie" size={20} color="#F59E0B" />
                        <Text style={styles.dataLabel}>HR:</Text>
                      </View>
                      <Text
                        style={[
                          styles.dataValue,
                          {color: getStatusColor(selectedRequest?.hrstatus)},
                        ]}>
                        {selectedRequest?.hrstatus || 'Pending'}
                        {selectedRequest?.hrremarks &&
                          ` (${selectedRequest.hrremarks})`}
                      </Text>
                    </View>
                    <View style={styles.dataRow}>
                      <View style={styles.dataLabelContainer}>
                        <Icon name="account-tie" size={20} color="#F59E0B" />
                        <Text style={styles.dataLabel}>
                          Application Status:
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.dataValue,
                          {
                            color: getStatusColor(
                              selectedRequest?.applicationStatus,
                            ),
                          },
                        ]}>
                        {selectedRequest?.applicationStatus &&
                          ` ${selectedRequest.applicationStatus}`}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Only show contingent employee selection for HR */}
                {isAuthorizedForFinalApproval && (
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>
                      Authorized Person's Status
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={statusAction}
                        style={styles.picker}
                        onValueChange={itemValue => setStatusAction(itemValue)}>
                        <Picker.Item label="Select Action" value="" />
                        {statusActions.map(action => (
                          <Picker.Item
                            key={action.id}
                            label={action.label}
                            value={action.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}

                {/* HR Exit Date - Only show for HR */}
                {isAuthorizedForFinalApproval && (
                  <Card style={[styles.dataCard, {borderLeftColor: '#8B5CF6'}]}>
                    <Card.Title title="HR Approval Date Range" />
                    <Card.Content>
                      <View style={styles.dateRangeContainer}>
                        {/* From Date Selection */}
                        <View style={styles.datePickerField}>
                          <Text style={styles.datePickerLabel}>
                            Select Exit Date
                          </Text>
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowFromPicker(true)}>
                            <Text style={styles.datePickerText}>
                              {fromDate ? formatDate(fromDate) : 'Select Date'}
                            </Text>
                            <Icon name="calendar" size={20} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )}

                {/* Date Pickers (Modal) */}
                <DatePicker
                  modal
                  open={showFromPicker}
                  date={fromDate || new Date()}
                  mode="date"
                  title="Select From Date"
                  confirmText="Confirm"
                  cancelText="Cancel"
                  onConfirm={date => {
                    setShowFromPicker(false);
                    setFromDate(date);
                    // If to date is not set or is before from date, update to date
                    if (!toDate || toDate < date) {
                      setToDate(
                        new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
                      ); // Default to 7 days after
                    }
                  }}
                  onCancel={() => setShowFromPicker(false)}
                />

                <DatePicker
                  modal
                  open={showToPicker}
                  date={
                    toDate ||
                    (fromDate
                      ? new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                      : new Date())
                  }
                  mode="date"
                  minimumDate={fromDate || undefined}
                  title="Select To Date"
                  confirmText="Confirm"
                  cancelText="Cancel"
                  onConfirm={date => {
                    setShowToPicker(false);
                    setToDate(date);
                  }}
                  onCancel={() => setShowToPicker(false)}
                />

                {/* Only show contingent employee picker for HR */}
                {isAuthorizedForFinalApproval && (
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>
                      Contingent Employees' Code
                    </Text>
                    <View style={styles.pickerContainer}>
                      {loadingEmployees ? (
                        <ActivityIndicator
                          size="small"
                          color="#3B82F6"
                          style={styles.pickerLoading}
                        />
                      ) : (
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
                              value={employee.empCode || employee.id}
                            />
                          ))}
                        </Picker>
                      )}
                    </View>
                  </View>
                )}

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
                  onPress={handleApprove}
                  style={styles.approveBtn}>
                  {isAccountRole ? "Approve Account Clearance" : "Approve"}
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleReject}
                  style={styles.rejectBtn}
                  labelStyle={styles.rejectBtnLabel}>
                  Reject
                </Button>
              </Card.Actions>
            </Card>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="account-off-outline" size={60} color="#9CA3AF" />
            <Text style={styles.noDataText}>
              {isAccountRole 
                ? "No pending account clearance requests" 
                : "No pending exit requests found"}
            </Text>
            <Text style={styles.noDataSubText}>
              {isAccountRole 
                ? `Account clearance requests will appear here. Department ID: ${user?.departmentId}` 
                : "All exit requests will appear here"}
            </Text>
            <Button 
              mode="contained" 
              style={{marginTop: 20}} 
              onPress={isAccountRole ? fetchAccountRequests : currentEmploye}>
              Refresh Data
            </Button>
          </View>
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
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerLoading: {
    padding: 10,
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
  dataValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  employeeCode: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    marginLeft: 4,
  },
  horizontalScrollView: {
    paddingBottom: 16,
  },
  requestItem: {
    width: 140,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRequestItem: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  requestItemContent: {
    flex: 1,
  },
  requestNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  miniStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  requestCode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePickerField: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  datePickerText: {
    fontSize: 14,
    color: '#1F2937',
  },
});

export default ExitRequestStatusScreen;



