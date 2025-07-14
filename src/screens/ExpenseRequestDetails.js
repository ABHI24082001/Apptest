import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import AppSafeArea from '../component/AppSafeArea';
import {
  Appbar,
  Avatar,
  Chip,
  Divider,
  Badge,
  Button,
  Card,
  TextInput,
  IconButton,
  Portal,
  Provider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

import {useAuth} from '../constants/AuthContext';
// Import the Pagination component
import Pagination from '../components/Pagination';
import axios from 'axios';
import BASE_URL from '../constants/apiConfig';
import LinearGradient from 'react-native-linear-gradient';
import WebView from 'react-native-webview';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import FeedbackModal from '../component/FeedbackModal';

const ExpenseTypeColors = {
  Advance: '#3b82f6', // Blue
  Expense: '#ef4444', // Red
  Reimbursement: '#10b981', // Green
};

// Removing static expense data and replacing with empty array as initial state
// The data will be populated from the API

const ExpenseRequestDetails = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  // console.log(employeeDetails, 'Employee Details in Expense Request Details');
  const {user} = useAuth();

  // State variables for expense management
  const [expenseList, setExpenseList] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState({});
  const [expenceApprovalAccess, setexpenceApprovalAccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Increased from 2 to show more items
  const [paginatedData, setPaginatedData] = useState([]);
  const [isAuthorizedForFinalApproval, setIsAuthorizedForFinalApproval] =
    useState(false);
  const [approveamount, setApproveAmount] = useState('');
  // New state variables for the modal and document viewer
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [documentViewerVisible, setDocumentViewerVisible] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  // Add feedback modal state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  // Helper function to format date string
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Helper function to get initials from name
  const getInitials = name => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Field mapping helper to handle API response structure differences
  const getFieldValue = (item, fieldNames, defaultValue = 'N/A') => {
    if (!item) return defaultValue;

    // Try each field name in order
    for (const field of fieldNames) {
      if (item[field] !== undefined && item[field] !== null) {
        return item[field];
      }
    }
    return defaultValue;
  };

  useEffect(() => {
    // Initialize paginated data
    updatePaginatedData(expenseList, 1);

    // Set pending count
    setPendingRequestsCount(expenseList.length);
  }, [expenseList]);

  // Update paginated data whenever current page changes
  useEffect(() => {
    updatePaginatedData(expenseList, currentPage);
  }, [currentPage]);

  // Add useEffect to call ExpenseRequestAccessMenus when component loads
  useEffect(() => {
    const fetchExpenseAccessData = async () => {
      try {
        // console.log('Fetching expense request access data...');
        const accessData = await ExpenseRequestAccessMenus();
        // console.log('EXPENSE REQUEST ACCESS DATA:', accessData);
      } catch (error) {
        // console.error('Error fetching expense access data:', error);
      }
    };

    fetchExpenseAccessData();
  }, [user]); // Add user as dependency to re-run when user data is available

  // Function to paginate data
  const updatePaginatedData = (data, page) => {
    if (!Array.isArray(data) || data.length === 0) {
      setPaginatedData([]);
      return;
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = data.slice(startIndex, endIndex);

    // console.log(
    //   `Paginating: Page ${page}, showing items ${startIndex + 1}-${Math.min(
    //     endIndex,
    //     data.length,
    //   )} of ${data.length}`,
    // );

    setPaginatedData(paginatedItems);
  };

  // Handle page change
  const handlePageChange = newPage => {
    // console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
  };

  //  const fetchFunctionAccessMenu = async () => {
  //     try {
  //       const requestData = {
  //       DepartmentId: user?.departmentId || 0,
  //       DesignationId: user?.designtionId || 0,
  //       EmployeeId: user?.id || 0,
  //       ControllerName: 'Employeeexit',
  //       ActionName: 'EmpExitApplicationSupervisorList',
  //       ChildCompanyId: user?.childCompanyId || 1,
  //       BranchId: user?.branchId || 2,
  //       UserType: user?.userType || 1,
  //     };

  //       const response = await axios.post(
  //       `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
  //       requestData,
  //     );

  //       console.log('Exit fetchFunctionAccessMenu data=================================================:', response.data);

  //       // Log specific properties if available
  //       if (Array.isArray(response.data)) {
  //         console.log('Number of authorization records:', response.data.length);

  //         // Log the first record for inspection if available
  //         if (response.data.length > 0) {
  //           console.log('First authorization record sample:', response.data[0]);
  //         }
  //       }

  //       return response.data;
  //     } catch (error) {
  //       console.error('Error fetching functional access menus:', error);
  //       return null;
  //     }
  //  }
  const fetchExpenseById = async id => {
    try {
      // console.log(`Fetching expense details for ID: ${id}`);

      const payload = {
        DepartmentId: user?.departmentId || 0,
        DesignationId: user?.designtionId || 0,
        EmployeeId: user?.id || 0,
        ControllerName: 'ExpenseMgt',
        ActionName: 'EmpPaymentRequestList',
        ChildCompanyId: user?.childCompanyId || 1,
        BranchId: user?.branchId || 2,
        UserType: user?.userType || 1,
      };

      let apiUrl = '';
      let source = '';
      const companyId = user?.childCompanyId || 1;

      if (isAuthorizedForFinalApproval) {
        apiUrl = `${BASE_URL}/PaymentAdvanceRequest/GetPaymentAdvanveDetailsRequestForFinalApproval/${companyId}/${id}`;
        source = 'FinalApproval';
      } else {
        apiUrl = `${BASE_URL}/PaymentAdvanceRequest/GetPaymentAdvanveDetailsRequest/${companyId}/${id}`;
        source = 'StandardRequest';
      }

      console.log(`API Source: ${source}`);
      console.log(`Calling API: ${apiUrl}`);
      console.log('Request Payload:', payload);

      const response = await axios.get(apiUrl);

      // Log the complete response for debugging
      console.log('Expense Details from API:', response.data);

      // Ensure we're storing the complete response data
      // Create a properly structured expense details object
      const expenseData = {
        ...response.data,
        // Extract common fields for easier access throughout the component
        requestId: response.data?.paymentRequest?.requestId || id,
        employeeId: response.data?.paymentRequest?.employeeId,
        requestTypeId: response.data?.paymentRequest?.requestTypeId,
        companyId:
          response.data?.paymentRequest?.companyId || user?.childCompanyId,
        branchId: response.data?.paymentRequest?.branchId || user?.branchId,
        totalAmount:
          response.data?.paymentRequest?.totalAmount ||
          response.data?.amountApproved ||
          0,
        remarks: response.data?.paymentRequest?.remarks,
        status: response.data?.paymentRequest?.status,
        reportingMgrId: response.data?.paymentRequest?.reportingMgrId,
      };

      // Now set the properly structured data
      setExpenseDetails(expenseData);

      // === Extract employeeId from nested paymentRequest ===
      const employeeId = response.data?.paymentRequest?.employeeId;
      if (employeeId) {
        try {
          const empResponse = await axios.get(
            `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${employeeId}`,
          );

          setEmployeeData(empResponse.data);
          console.log('Employee data retrieved successfully');
        } catch (empError) {
          console.error('Error fetching employee details:', empError);
        }
      } else {
        console.warn('Employee ID not found in response.paymentRequest');
      }

      return expenseData; // Return the structured data
    } catch (error) {
      console.error('Error fetching expense details:', error);
      console.error('Error details:', error.response?.data || error.message);
      return null;
    }
  };

  const toggleCardExpansion = async id => {
    // If we're closing the current expanded card
    if (expandedCard === id) {
      setExpandedCard(null);
      setExpenseDetails(null);
      return;
    }

    // If we're opening a new card, fetch its details
    setExpandedCard(id);
    await fetchExpenseById(id);
  };

  function formatDateForBackend(date) {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }

  const handleApprove = async id => {
    try {
      const expenceDetails = await fetchExpenseById(id);
      if (!expenceDetails) {
        Alert.alert(
          'Error',
          'Failed to fetch expense details. Please try again.',
        );
        return;
      }

      const expenceItem = expenseList.find(
        item => (item.id || item.requestId) === id,
      );
      if (!expenceItem) {
        Alert.alert('Error', 'Expense item not found. Please try again.');
        return;
      }

      if (!approvalRemarks[id]) {
        Alert.alert(
          'Validation',
          'Please add approval remarks before proceeding.',
        );
        return;
      }

      // Improved validation for approvedAmount
      const approvedAmountValue = parseFloat(approvedAmount);

      if (
        !approvedAmount ||
        isNaN(approvedAmountValue) ||
        approvedAmountValue <= 0
      ) {
        Alert.alert(
          'Validation',
          'Please enter a valid approved amount greater than zero.',
        );
        return;
      }

      console.log('Approved amount value:', approvedAmountValue);

      // Get the original amount from the structured expense details
      const originalAmount = expenceDetails.totalAmount || 0;

      // Additional check to ensure we don't proceed with zero amount
      if (approvedAmountValue <= 0) {
        Alert.alert('Error', 'Cannot approve an expense with zero amount.');
        return;
      }

      // ⚠️ Show alert if approved amount exceeds original
      if (approvedAmountValue > originalAmount) {
        const confirmExcessAmount = () => {
          return new Promise(resolve => {
            Alert.alert(
              'Confirm Approval',
              `The approved amount (₹${approvedAmountValue}) is greater than the requested amount (₹${originalAmount}).\n\nDo you want to continue?`,
              [
                {
                  text: 'Cancel',
                  onPress: () => resolve(false),
                  style: 'cancel',
                },
                {text: 'Continue', onPress: () => resolve(true)},
              ],
              {cancelable: false},
            );
          });
        };

        const shouldProceed = await confirmExcessAmount();
        if (!shouldProceed) return;
      }

      // Check if expense amount is zero - modified to use approvedAmountValue directly
      if (approvedAmountValue <= 0) {
        Alert.alert('Error', 'Cannot approve an expense with zero amount.');
        return;
      }

      // Check if payroll is already generated for this employee
      const payrollCheckBody = {
        EmployeeId: expenceDetails.employeeId,
        CompanyId: expenceDetails.companyId,
        BranchId: expenceDetails.branchId || 0,
        appliedDate: formatDateForBackend(
          expenceDetails?.paymentRequest?.createdDate ||
            expenceDetails?.createdDate ||
            expenceDetails?.appliedDate,
        ),
      };

      console.log('Checking payroll with data:', payrollCheckBody);

      const payrollRes = await axios.post(
        `${BASE_URL}/PayRollRun/CheckPayRollCreationForLeaveApproval`,
        payrollCheckBody,
      );

      console.log('Payroll check response:', payrollRes.data);

      if (payrollRes?.data?.isSuccess) {
        Alert.alert(
          'Payroll Conflict',
          'Payroll already generated for this employee. Expense cannot be approved.',
        );
        return;
      }

      // Extract payment details from expense details
      const paymentDetails = expenceDetails.paymentDetails || [];

      // Update approved amounts for each payment detail
      const updatedPaymentDetails = paymentDetails.map(detail => {
        // For simple distribution, we allocate approved amount proportionally
        // Only do this if there are multiple payment details
        let itemApprovedAmount = detail.amount;

        if (paymentDetails.length > 1) {
          const ratio = detail.amount / originalAmount;
          itemApprovedAmount =
            Math.round(approvedAmountValue * ratio * 100) / 100; // Round to 2 decimal places
        } else if (paymentDetails.length === 1) {
          // If only one payment detail, assign full approved amount
          itemApprovedAmount = approvedAmountValue;
        }

        return {
          ...detail,
          approvedAmount: itemApprovedAmount,
          status: 'Approved',
        };
      });

      // Create comprehensive payment request object
      const paymentRequest = {
        requestId: expenceDetails.requestId || id,
        requestTypeId:
          expenceDetails.paymentRequest?.requestTypeId ||
          expenceDetails.requestTypeId ||
          expenceItem.requestTypeId ||
          1,
        employeeId:
          expenceDetails.paymentRequest?.employeeId ||
          expenceDetails.employeeId ||
          expenceItem.employeeId ||
          0,
        reportingMgrId:
          expenceDetails.paymentRequest?.reportingMgrId ||
          expenceDetails.reportingMgrId ||
          expenceItem.reportingId ||
          user?.id ||
          0,
        totalAmount: originalAmount,
        remarks:
          expenceDetails.paymentRequest?.remarks ||
          expenceDetails.remarks ||
          approvalRemarks[id] ||
          '',
        companyId: expenceDetails.companyId || 2,
        isDelete: 0,
        flag: 1,
        createdBy: expenceDetails.paymentRequest?.createdBy || user?.id || 0,
        createdDate:
          expenceDetails.paymentRequest?.createdDate ||
          new Date().toISOString(),
        modifiedBy: user?.id || 0,
        modifiedDate: new Date().toISOString(),
        paymentStatus: 'Approved',
        employeeCode:
          expenceDetails.paymentRequest?.employeeCode ||
          expenceItem.employeeCode ||
          '',
        reason:
          expenceDetails.paymentRequest?.reason ||
          expenceDetails.reason ||
          approvalRemarks[id] ||
          '',
        approvalStatus: 1, // 1 = Approved
        approvalAmount: approvedAmountValue,
        // Additional fields from your prompt model
        visible:
          expenceDetails.paymentRequest?.visible !== undefined
            ? expenceDetails.paymentRequest?.visible
            : true,
        branchId: expenceDetails.branchId || 0,
        employeeName:
          expenceDetails.paymentRequest?.employeeName ||
          expenceDetails.employeeName ||
          expenceItem.employeeName ||
          '',
        department:
          expenceDetails.paymentRequest?.department ||
          expenceDetails.department ||
          expenceItem.department ||
          '',
        designation:
          expenceDetails.paymentRequest?.designation ||
          expenceDetails.designation ||
          expenceItem.designation ||
          '',
        branchName: expenceDetails.paymentRequest?.branchName || 'cutttuck',
        employeeEmail: expenceDetails.paymentRequest?.employeeEmail || 'sonu',
        reportingMgerEmail:
          expenceDetails.paymentRequest?.reportingMgerEmail ||
          expenceDetails.reportingMgerEmail ||
          'aa@thecloudtree.ai',
        managerReason: approvalRemarks[id] || '',
      };

      // Create comprehensive approval payload with all required fields
      const approvalPayload = {
        paymentRequest: paymentRequest,
        paymentDetails: updatedPaymentDetails,
      };

      const endpoint = isAuthorizedForFinalApproval
        ? `${BASE_URL}/PaymentAdvanceRequest/SaveClaimRequestFinalApproval`
        : `${BASE_URL}/PaymentAdvanceRequest/SaveClaimRequestMGRApproval`;

      console.log('⬇️⬇️⬇️ APPROVAL PAYLOAD ⬇️⬇️⬇️');
      console.log(JSON.stringify(approvalPayload, null, 2));
      console.log(
        `Endpoint: ${
          isAuthorizedForFinalApproval ? 'FINAL APPROVAL' : 'MANAGER APPROVAL'
        }`,
      );
      console.log(`Using API URL: ${endpoint}`);
      console.log('⬆️⬆️⬆️ APPROVAL PAYLOAD ⬆️⬆️⬆️');

      const approvalRes = await axios.post(endpoint, approvalPayload);
      console.log('Approval response:', approvalRes.data);

      if (approvalRes.data?.isSuccess) {
        // Show the feedback modal instead of Alert
        setFeedbackType('success');
        setFeedbackMessage(
          `${
            isAuthorizedForFinalApproval ? 'Final Approval' : 'Approval'
          } Successful!`,
        );
        setFeedbackVisible(true);

        setApprovedAmount('');
        FetchExpenceApprovalData();
      } else {
        console.error('Backend returned error:', approvalRes.data);
        // Show error feedback
        setFeedbackType('fail');
        setFeedbackMessage(approvalRes.data?.message || 'Approval failed');
        setFeedbackVisible(true);
      }
    } catch (error) {
      console.error('Exception during approval:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Show error feedback
      setFeedbackType('fail');
      setFeedbackMessage(
        'An unexpected error occurred during expense approval',
      );
      setFeedbackVisible(true);
    }
  };

  const handleReject = async id => {
    // Add implementation for reject function if needed
    if (!approvalRemarks[id]) {
      Alert.alert('Validation', 'Please add remarks before rejecting');
      return;
    }

    // Show confirmation before rejection
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this expense request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // Show feedback modal for rejection
              setFeedbackType('fail');
              setFeedbackMessage('Expense request has been rejected');
              setFeedbackVisible(true);

              // Additional implementation for rejection API call would go here

              // Update the list after rejection
              const updatedList = expenseList.filter(
                item => (item.id || item.requestId) !== id,
              );
              setExpenseList(updatedList);
              setPendingRequestsCount(updatedList.length);
              updatePaginatedData(updatedList, currentPage);
            } catch (error) {
              console.error('Error in rejection:', error);
            }
          },
        },
      ],
    );
  };

  const ExpenseRequestAccessMenus = async () => {
    try {
      // debugger
      const requestData = {
        DepartmentId: user?.departmentId || 0,
        DesignationId: user?.designtionId || 0,
        EmployeeId: user?.id || 0,
        ControllerName: 'ExpenseMgt',
        ActionName: 'EmpPaymentRequestList',
        ChildCompanyId: user?.childCompanyId || 1,
        BranchId: user?.branchId || 2,
        UserType: user?.userType || 1,
      };

      console.log(
        'Sending request data for leave approval access:',
        requestData,
      );

      const response = await axios.post(
        `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );
      // debugger
      console.log(
        'Expense================== fetchFunctionalAccessMenus:',
        response.data,
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching functional access menus:', error);
      return null;
    }
  };

  const FetchExpenceApprovalData = async () => {
    try {
      setIsLoading(true);

      // Step 1: Extract required user data early to avoid redundant checks
      const userType = user?.userType;
      const employeeId = user?.id;
      const companyId = user?.childCompanyId;

      if (!companyId || !employeeId) {
        console.error('Missing required user data (companyId or employeeId)');
        setIsLoading(false);
        return [];
      }

      // Step 2: Get access menu data
      const accessData = await ExpenseRequestAccessMenus();
      setexpenceApprovalAccess(accessData);

      // Step 3: Check if user has approval access
      const hasAccess =
        Array.isArray(accessData) &&
        (accessData.some(item => item.employeeId === employeeId) ||
          userType === 2);
      // console.log('User has approval access:', hasAccess);

      // Step 4: Get role configuration data
      let roleData = null;
      try {
        const roleUrl = `${BASE_URL}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
        const roleResponse = await axios.get(roleUrl);
        console.log(
          'Role Details from API:',
          JSON.stringify(roleResponse.data, null, 2),
        );

        if (Array.isArray(roleResponse.data)) {
          // Check if employee ID exists in role details
          const isAuthorized = roleResponse.data.some(
            role => role.employeeId === employeeDetails?.id,
          );
          setIsAuthorizedForFinalApproval(isAuthorized);

          // If employeeId matches, get that role data, else get the first role as fallback
          roleData =
            roleResponse.data.find(
              item => item.employeeId === employeeDetails?.id,
            ) ||
            roleResponse.data[0] ||
            null;
        }
      } catch (roleError) {
        console.error('Error fetching role configuration:', roleError);
      }

      // Step 5: Fetch approval data
      let approvalData = [];
      try {
        const apiUrl = hasAccess
          ? `${BASE_URL}/PaymentAdvanceRequest/GetRequestForFinalApproval/${companyId}/${employeeId}`
          : `${BASE_URL}/PaymentAdvanceRequest/GetRequestsForMgrApproval/${companyId}/${employeeId}`;

        console.log(`Fetching approval data from: ${apiUrl}`);
        const response = await axios.get(apiUrl);

        if (Array.isArray(response.data)) {
          // Filter out user's own requests
          approvalData = response.data.filter(
            item => item.employeeId !== employeeDetails?.id,
          );

          // Filter by branch if role has branch restriction
          if (roleData && roleData.branchId !== 0) {
            const branchId = roleData.branchId;
            approvalData = approvalData.filter(
              item => item.branchId === branchId,
            );
            console.log(`Filtered approvals by branch ID ${branchId}`);
          }

          // Log the filtered approval data
          // console.log(
          //   `Fetched===================================== ${approvalData.length} expense approval records after filtering`,
          // );
          console.log(
            'Filtered========================================= Approval List:',
            JSON.stringify(approvalData, null, 2),
          );

          // Update state with filtered data
          setExpenseList(approvalData);
          setPendingRequestsCount(approvalData.length);
          updatePaginatedData(approvalData, 1);
        } else {
          console.warn('Unexpected response format from API');
          setExpenseList([]);
          setPendingRequestsCount(0);
        }
      } catch (error) {
        console.error('Error fetching approval list:', error);
        setExpenseList([]);
        setPendingRequestsCount(0);
      }

      setIsLoading(false);
      return approvalData;
    } catch (error) {
      console.error('Unexpected error in FetchExpenceApprovalData:', error);
      setIsLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (user && employeeDetails) {
      console.log('Fetching expense approval data...');
      FetchExpenceApprovalData()
        .then(data => {
          console.log(`Fetched ${data.length} expense approval records`);
        })
        .catch(err => {
          console.error('Error executing FetchExpenceApprovalData:', err);
        });
    }
  }, [user, employeeDetails]);

  // Helper function to determine if request is an Expense request
  const isExpenseRequest = item => {
    // Check direct properties first
    if (item && item.requestTypeId === 1) return true;

    // Check in expense details if available
    if (expenseDetails && expenseDetails.paymentRequest) {
      return expenseDetails.paymentRequest.requestTypeId === 1;
    }

    // Try to determine from request type string
    if (item && item.requestType) {
      return item.requestType.toLowerCase().includes('expense');
    }

    // Default to false if can't determine
    return false;
  };

  // Function to open the payment details modal - updated with null check
  const openPaymentDetailsModal = item => {
    if (!expenseDetails) {
      Alertalert('Payment details not available');
      return;
    }

    // Check if this is an expense request with payment details
    if (
      !isExpenseRequest(item) ||
      !expenseDetails.paymentDetails ||
      !Array.isArray(expenseDetails.paymentDetails)
    ) {
      Alert.alert('No payment details available for this request type');
      return;
    }

    setSelectedPaymentDetail(expenseDetails.paymentDetails);
    setModalVisible(true);
  };

  const renderItem = ({item}) => {
    const isExpanded =
      expandedCard === item.id || expandedCard === item.requestId;

    // Get expense type with fallback options
    const expenseType = getFieldValue(
      item,
      ['requestType', 'paymentType'],
      'Expense',
    );
    const expenseColor = ExpenseTypeColors[expenseType] || '#6b7280';

    // Get item ID - either 'id' or 'requestId'
    const itemId = item.id || item.requestId;

    // Check if this is an expense request (requestTypeId = 1)
    const showInfoButton = isExpenseRequest(item);

    // Get employee name with fallback
    const employeeName = getFieldValue(item, ['employeeName', 'name']);

    // Get employee code with fallback
    const employeeCode = getFieldValue(item, ['employeeCode', 'empId']);

    // Get amount with fallback and formatting
    const amount = getFieldValue(item, [
      'totalAmount',
      'approvalAmount',
      'amount',
    ]);
    const formattedAmount =
      typeof amount === 'number'
        ? `₹${amount.toLocaleString('en-IN')}`
        : amount;

    // Get branch name with fallback options
    const branchName = getFieldValue(item, ['branchName', 'branch']);

    // Get branch ID if name is not available (to show something rather than nothing)
    const branchId = item.branchId || expenseDetails?.branchId;

    // Get status with fallback
    const status = getFieldValue(item, ['status'], 'Pending');

    // Get remarks/reason with fallback
    const remarks = getFieldValue(item, ['remarks', 'reason']);

    // Get date with fallback
    const appliedDate = formatDate(
      getFieldValue(item, ['transactionDate', 'createdDate', 'appliedDate']),
    );

    return (
      <Card
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => toggleCardExpansion(itemId)}>
        <Card.Content>
          {/* Employee info section with info button - always visible */}
          <View style={styles.employeeInfoSection}>
            <View style={styles.employeeHeaderRow}>
              <View style={styles.employeeNameContainer}>
                <View style={styles.employeenamwee}>
                  <Text style={styles.employeeName}>{employeeName}</Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status?.toLowerCase().includes('approved')
                          ? styles.statusApprovedBadge
                          : item.status?.toLowerCase().includes('rejected')
                          ? styles.statusRejectedBadge
                          : styles.statusPendingBadge,
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          item.status?.toLowerCase().includes('approved')
                            ? styles.statusApprovedText
                            : item.status?.toLowerCase().includes('rejected')
                            ? styles.statusRejectedText
                            : styles.statusPendingText,
                        ]}>
                        {item.status || 'Pending'}
                      </Text>
                    </View>

                    <View style={{marginLeft: 10}}>
                      <Chip
                        style={[
                          styles.leaveTypeChip,
                          {backgroundColor: `${expenseColor}20`},
                        ]}
                        textStyle={{color: expenseColor, fontWeight: '800'}}>
                        {expenseType}
                      </Chip>
                    </View>
                  </View>
                </View>
                <View style={styles.employeeDetails}>
                  <Text style={styles.detailText}>
                    {item.designation || 'Not specified'}
                  </Text>
                  <View style={styles.detailDivider} />
                  <Text style={styles.detailText}>
                    {item.department || 'Not specified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Date and amount info */}
          <View style={styles.dateOuterContainer}>
            <Card style={styles.dateCard}>
              <Card.Content style={styles.dateCardContent}>
                <View style={styles.dateFromToContainer}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Applied Date</Text>
                    <Text style={styles.dateValue}>{appliedDate}</Text>
                  </View>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Branch</Text>
                    <Text style={styles.dateValue}>
                      {employeeData?.branchName || 'Not Specified'}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Expanded section */}
          {isExpanded && (
            <View style={styles.expandedSection}>
              <Divider style={styles.divider} />

              {expandedCard === itemId && !expenseDetails && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Fetching expense details...
                  </Text>
                </View>
              )}

              {/* Project Details Section */}
              <Card style={styles.detailCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Request Details</Text>
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Request Type:</Text>
                      <Text style={styles.detailValue}>
                        {expenseDetails?.paymentRequest?.requestTypeId === 1
                          ? 'Expense'
                          : expenseDetails?.paymentRequest?.requestTypeId === 2
                          ? 'Advance'
                          : expenseType}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>

                      <View style={styles.amountContainer}>
                        <View style={styles.amountRow}>
                          <Text style={styles.detailValue}>
                            {formattedAmount}
                          </Text>

                          {showInfoButton && (
                            <IconButton
                              icon="eye"
                              size={20}
                              onPress={() => openPaymentDetailsModal(item)}
                              style={styles.eyeButton}
                            />
                          )}
                        </View>
                      </View>
                    </View>

                    {expenseDetails && expenseDetails.projectId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Project ID:</Text>
                        <Text style={styles.detailValue}>
                          {expenseDetails.projectId}
                        </Text>
                      </View>
                    )}

                    {expenseDetails && expenseDetails.paymentType && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Type:</Text>
                        <Text style={styles.detailValue}>
                          {expenseDetails.paymentType}
                        </Text>
                      </View>
                    )}

                    {item.purpose && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Purpose:</Text>
                        <Text style={styles.detailValue}>{item.purpose}</Text>
                      </View>
                    )}

                    {item.remarks && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Reason:</Text>
                        <Text style={styles.detailValue}>{item.remarks}</Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>

              {isAuthorizedForFinalApproval && (
                <Card style={styles.detailCard}>
                  <Card.Content>
                    <Text style={styles.sectionTitle}>
                      Amount Request Details
                    </Text>
                    <View style={styles.detailsContainer}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount:</Text>
                        <View style={styles.amountContainer}>
                          <Text style={styles.detailValue}>
                            ₹
                            {expenseDetails?.paymentRequest?.approvalAmount?.toLocaleString(
                              'en-IN',
                            ) || '0'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>RM Reason:</Text>
                        <Text style={styles.detailValue}>
                          {expenseDetails?.paymentRequest?.reason ||
                            'No reason provided'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              )}

              {/* Total amount of approve - Changed to Approved Amount */}
              <Card style={styles.detailCard}>
                <Card.Content>
                  <View style={styles.remarksTitleContainer}>
                    <Text style={styles.sectionTitle}>Approved Amount</Text>
                    <Text style={styles.requiredField}>*</Text>
                  </View>

                  <TextInput
                    style={styles.amountInput}
                    placeholder="Enter approved amount"
                    placeholderTextColor="#9ca3af"
                    mode="outlined"
                    value={approvedAmount}
                    onChangeText={text => {
                      // Ensure we only accept numbers and validate as we type
                      if (!text || text === '' || /^\d*\.?\d*$/.test(text)) {
                        setApprovedAmount(text);
                      }
                    }}
                    maxLength={10}
                    keyboardType="numeric"
                  />
                </Card.Content>
              </Card>
              {/* Approval Remarks */}
              <Card style={styles.detailCard}>
                <Card.Content>
                  <View style={styles.remarksTitleContainer}>
                    <Text style={styles.sectionTitle}>Approval Remarks</Text>
                    <Text style={styles.remarksLimit}>
                      (Max 100 Characters)
                    </Text>
                    <Text style={styles.requiredField}>*</Text>
                  </View>

                  <TextInput
                    mode="outlined"
                    style={styles.remarksInput}
                    placeholder="Add your remarks"
                    placeholderTextColor="#9ca3af"
                    maxLength={100}
                    multiline
                    value={approvalRemarks[itemId] || ''}
                    onChangeText={text =>
                      setApprovalRemarks(prev => ({
                        ...prev,
                        [itemId]: text,
                      }))
                    }
                  />
                  <Text style={styles.characterCount}>
                    {(approvalRemarks[itemId] || '').length}/100
                  </Text>
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  style={[styles.actionButton, styles.approveButton]}
                  labelStyle={styles.buttonText}
                  icon="check"
                  onPress={() => handleApprove(item.id || item.requestId)}
                  // onPress={() => handleApprove(itemId)}
                >
                  {isAuthorizedForFinalApproval ? 'Final Approve' : 'Approve'}
                </Button>
                <Button
                  mode="contained"
                  style={[styles.actionButton, styles.rejectButton]}
                  labelStyle={styles.buttonText}
                  icon="close"
                  onPress={() => handleReject(item.id || item.requestId)}>
                  Reject
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };
  // const currentEmploye = async () => {
  //   setLoading(true);

  //   try {
  //     const currentEmployeeId = user?.id;

  //     if (!currentEmployeeId) {
  //       console.warn('❗ No current employee ID found.');
  //       return;
  //     }

  //     // Step 1: Fetch functional access data
  //     const accessList = await fetchFunctionAccessMenu();

  //     // Step 2: Fetch all exit requests
  //     const exitResponse = await fetch(
  //       `${BASE_URL}/EmployeeExit/GetAllEmpExitRecords/${user?.childCompanyId}`
  //     );

  //     if (!exitResponse.ok) {
  //       throw new Error(`HTTP error! status: ${exitResponse.status}`);
  //     }

  //     const allExitRequests = await exitResponse.json();
  //     console.log('✅ All employee exit records:', allExitRequests);

  //     let filteredList = [];

  //     // Step 3: Check if current employee is in access list
  //     const hasApprovalAccess = Array.isArray(accessList)
  //       ? accessList.some(item => item.employeeId === currentEmployeeId)
  //       : false;

  //     setIsAuthorizedForFinalApproval(hasApprovalAccess);

  //     if (hasApprovalAccess) {
  //       // Filter where applicationStatus is Pending
  //       filteredList = allExitRequests.filter(
  //         item => item.applicationStatus === 'Pending'
  //       );
  //       console.log('✅ Employee has access.FINAL APPROVAL Filtered approval list:', filteredList);
  //     } else {
  //       // Filter where reportingId === currentEmployeeId && supervisorStatus === 'Pending'
  //       filteredList = allExitRequests.filter(
  //         item =>
  //           item.reportingId === currentEmployeeId &&
  //           item.supervisorStatus === 'Pending'
  //       );
  //       console.log('✅ Employee has NO access. Filtered REPORTING MANAGER APPROVAL supervisor list:', filteredList);
  //     }

  //     // Set the filtered list to the requests state
  //     setRequests(filteredList);

  //   } catch (error) {
  //     console.error('❌ Error in currentEmploye logic:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Updated Payment Details Modal to handle the structured API response
  const renderPaymentDetailsModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.centeredModalContainer}>
        <View style={styles.modalOverlay}>
          <Card style={styles.centeredModalCard}>
            <Card.Title
              title="Payment Details"
              titleStyle={styles.modalTitle}
              right={props => (
                <IconButton
                  {...props}
                  icon="close"
                  size={20}
                  onPress={() => setModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              <ScrollView style={styles.modalScrollView}>
                {selectedPaymentDetail &&
                Array.isArray(selectedPaymentDetail) &&
                selectedPaymentDetail.length > 0 ? (
                  selectedPaymentDetail.map((detail, index) => (
                    <View
                      key={`payment-${detail.id || index}`}
                      style={styles.paymentDetailItem}>
                      <View style={styles.paymentDetailHeader}>
                        <Text style={styles.paymentDetailTitle}>
                          {detail.expenseHead || 'Expense'}
                        </Text>
                        <Chip mode="outlined" style={styles.amountChip}>
                          ₹{detail.amount?.toLocaleString('en-IN') || '0'}
                        </Chip>
                      </View>

                      <Divider style={styles.itemDivider} />

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>
                          {formatDate(detail.transactionDate)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expense Type:</Text>
                        <Text style={styles.detailValue}>
                          {detail.expenseHead || 'Not Specified'}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expense ID:</Text>
                        <Text style={styles.detailValue}>
                          {detail.id || 'N/A'}
                        </Text>
                      </View>

                      {detail.approvedAmount !== null && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Approved Amount:
                          </Text>
                          <Text style={styles.detailValue}>
                            ₹
                            {detail.approvedAmount?.toLocaleString('en-IN') ||
                              '0'}
                          </Text>
                        </View>
                      )}

                      {detail.documentPath && (
                        <Button
                          mode="outlined"
                          icon="file-document-outline"
                          onPress={() =>
                            handleViewDocument(detail.documentPath)
                          }
                          style={styles.viewDocumentButton}>
                          View Document
                        </Button>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>
                    No payment details available
                  </Text>
                )}
              </ScrollView>
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                Close
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <Provider>
      <AppSafeArea>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction
            onPress={() => navigation.goBack()}
            color="#4B5563"
          />
          <Appbar.Content
            title="Employee's Expense Request"
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>

        {/* Pending Requests Badge */}
        <Card style={styles.pendingAlertCard}>
          <Card.Content style={styles.pendingAlertContent}>
            <Icon
              name="alert-circle"
              size={20}
              color="#f59e42"
              style={{marginRight: 8}}
            />
            <Text style={styles.pendingAlertCountSmall}>
              {pendingRequestsCount} Pending Request
              {pendingRequestsCount !== 1 ? 's' : ''}
            </Text>
          </Card.Content>
        </Card>

        <FlatList
          contentContainerStyle={styles.listContainer}
          data={paginatedData}
          keyExtractor={(item, index) => {
            const uniqueId = `${item.requestId || item.id || 'item'}-${index}`;
            return uniqueId.toString();
          }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            expenseList.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(expenseList.length / itemsPerPage)}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={expenseList.length}
              />
            ) : null
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContainer}>
                <Icon name="inbox" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>
                  No pending expense requests found
                </Text>
              </Card.Content>
            </Card>
          }
        />

        {/* Payment Details Modal */}
        {renderPaymentDetailsModal()}

        {/* Document Viewer Modal */}
        <Portal>
          <Modal
            visible={documentViewerVisible}
            onDismiss={() => setDocumentViewerVisible(false)}
            contentContainerStyle={styles.documentViewerContainer}>
            <Card style={styles.documentViewerCard}>
              <Card.Title
                title="Document Viewer"
                right={props => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setDocumentViewerVisible(false)}
                  />
                )}
              />
              <Card.Content style={styles.webViewContainer}>
                {documentUrl ? (
                  <WebView
                    source={{uri: documentUrl}}
                    style={styles.webView}
                    startInLoadingState={true}
                    onError={syntheticEvent => {
                      const {nativeEvent} = syntheticEvent;
                      console.error('WebView error: ', nativeEvent);
                      alert(
                        `Error loading document: ${nativeEvent.description}`,
                      );
                    }}
                  />
                ) : (
                  <View style={styles.noDocumentContainer}>
                    <Icon name="file-text" size={50} color="#9CA3AF" />
                    <Text style={styles.noDocumentText}>
                      No document to display
                    </Text>
                  </View>
                )}
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={() => setDocumentViewerVisible(false)}
                  style={styles.closeButton}>
                  Close
                </Button>
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>

        {/* Add Feedback Modal */}
        <FeedbackModal
          visible={feedbackVisible}
          onClose={() => setFeedbackVisible(false)}
          type={feedbackType}
          message={feedbackMessage}
        />
      </AppSafeArea>
    </Provider>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  expandedCard: {
    elevation: 4,
  },
  cardStatusHeader: {
    position: 'absolute',
    top: 0,
    right: 12,
    zIndex: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusApproved: {
    color: '#059669',
    backgroundColor: '#ECFDF5',
    fontWeight: '500',
  },
  statusRejected: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    fontWeight: '500',
  },
  statusPending: {
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  leaveTypeChip: {
    height: 32,
    borderWidth: 2,
  },
  employeeInfoSection: {
    marginBottom: 14,
  },
  employeeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeNameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  employeeName: {
    fontSize: 23,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  employeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4B5563',
  },
  detailDivider: {
    height: 14,
    width: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  sectionDivider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateOuterContainer: {
    marginVertical: 8,
  },
  dateCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  dateCardContent: {
    padding: 8,
  },
  dateFromToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateArrow: {
    marginHorizontal: 8,
  },
  amountCard: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    elevation: 1,
  },
  amountCardContent: {
    alignItems: 'center',
    padding: 10,
  },
  daysValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  daysLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  durationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingLeft: 4,
  },
  durationIcon: {
    marginRight: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  remarksCard: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  remarksSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  remarksLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  remarksValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 10,
    flex: 1,
  },
  expandedSection: {
    marginTop: 16,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
  },
  detailCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  remarksInput: {
    backgroundColor: '#F9FAFB',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    paddingVertical: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingAlertCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    elevation: 0,
  },
  pendingAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  pendingAlertCountSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  emptyCard: {
    marginVertical: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#4b5563',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 54,
    width: '100%',
    color: '#111827',
    fontSize: 15,
  },
  pickerItem: {
    fontSize: 15,
    color: '#111827',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  taskAssigneeSelected: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginBottom: 8,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  employeenamwee: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  statusApprovedBadge: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusRejectedBadge: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendingBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApprovedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  statusRejectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  statusPendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f59e0b',
  },
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4B5563',
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  amountInput: {
    backgroundColor: '#F9FAFB',
  },
  remarksLimit: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  remarksTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredField: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  amountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDetailsButton: {
    marginLeft: 2,
    borderColor: '#3b82f6',
    borderRadius: 4,
    height: 36,
  },
  infoButton: {
    margin: 0,
    padding: 0,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 12,
    elevation: 5,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentDetailItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  amountChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  itemDivider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  closeButton: {
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  documentViewerContainer: {
    flex: 1,
    margin: 20,
  },
  documentViewerCard: {
    flex: 1,
    borderRadius: 12,
  },
  webViewContainer: {
    flex: 1,
    padding: 0,
  },
  webView: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  noDocumentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDocumentText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Updated modal styles for centered popup design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 0,
  },
  centeredModalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 12,
    elevation: 5,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentDetailItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  amountChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  itemDivider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  closeButton: {
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  documentViewerContainer: {
    flex: 1,
    margin: 20,
  },
  documentViewerCard: {
    flex: 1,
    borderRadius: 12,
  },
  webViewContainer: {
    flex: 1,
    padding: 0,
  },
  webView: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  noDocumentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDocumentText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Updated modal styles for centered popup design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 0,
  },
  centeredModalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ExpenseRequestDetails;

// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useNavigation, useFocusEffect} from '@react-navigation/native';
// import {
//   Appbar,
//   Button,
//   Card,
//   TextInput,
//   Avatar,
//   Badge,
//   Divider,
//   Title,
//   Paragraph,
// } from 'react-native-paper';
// import LinearGradient from 'react-native-linear-gradient';
// import {Picker} from '@react-native-picker/picker';
// import AppSafeArea from '../component/AppSafeArea';
// import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
// import axios from 'axios';
// import BASE_URL from '../constants/apiConfig';
// import {useAuth} from '../constants/AuthContext';

// // Helper to format date string as DD-MM-YYYY
// function formatDate(dateStr) {
//   if (!dateStr) return '';
//   const d = new Date(dateStr);
//   return `${String(d.getDate()).padStart(2, '0')}-${String(
//     d.getMonth() + 1,
//   ).padStart(2, '0')}-${d.getFullYear()}`;
// }

// // Status badge color helper
// const getStatusColor = status => {
//   switch ((status || '').toLowerCase()) {
//     case 'pending':
//       return '#FFA500';
//     case 'approved':
//       return '#00C851';
//     case 'rejected':
//       return '#ff4444';
//     default:
//       return '#6B7280';
//   }
// };

// const ExitRequestStatusScreen = ({navigation}) => {
//   // const navigation = useNavigation();
//   const employeeDetails = useFetchEmployeeDetails();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [withdrawingId, setWithdrawingId] = useState(null);
//   const [canApplyNew, setCanApplyNew] = useState(true);

//   const [selectedEmployee, setSelectedEmployee] = useState('');
//   const [remarks, setRemarks] = useState('');

//   const [employees] = useState([
//     {id: 'AA_43', name: 'Employee 1'},
//     {id: 'AA_45', name: 'Employee 2'},
//   ]);

//   const {user} = useAuth();

//   console.log('User details:', user);

//   useFocusEffect(
//     React.useCallback(() => {
//       if (employeeDetails?.id) {
//         // Replace fetchExitRequests with currentEmploye
//         currentEmploye();
//       }

//       return () => {}; // cleanup if needed
//     }, [employeeDetails?.id, user?.childCompanyId]),
//   );

// const fetchExitRequests = async () => {
//   setLoading(true);

//   try {
//     const childCompanyId = user?.childCompanyId;

//     if (!childCompanyId) {
//       console.warn('❗ Missing childCompanyId. Cannot fetch exit records.');
//       return;
//     }

//     const response = await fetch(
//       `${BASE_URL}/EmployeeExit/GetAllEmpExitRecords/${childCompanyId}`
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('✅ All employee exit records:', data);

//     // Store in state if needed
//     // setAllExitRecords(data);

//   } catch (error) {
//     console.error('❌ Error fetching exit records:', error);
//   } finally {
//     setLoading(false);
//   }
// };
// const fetchFunctionAccessMenu = async () => {
//       try {
//         const requestData = {
//         DepartmentId: user?.departmentId || 0,
//         DesignationId: user?.designtionId || 0,
// /*************  ✨ Windsurf Command 🌟  *************/
//         EmployeeId: user?.id || 0,
//         ControllerName: 'Employeeexit',
//         ActionName: 'EmpExitApplicationSupervisorList',
//         ChildCompanyId: user?.childCompanyId || 1,
//         BranchId: user?.branchId || 2,
//         UserType: user?.userType || 1,
//       };

//         // Post request to fetch all authorization records
//         // for the `Employeeexit` controller and `EmpExitApplicationSupervisorList` action
//         const response = await axios.post(
//         `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
//         requestData,
//       );

//         // Log fetched authorization records
//         console.log('Exit fetchFunctionAccessMenu data=================================================:', response.data);

//         // Log specific properties if available
//         if (Array.isArray(response.data)) {
//           console.log('Number of authorization records:', response.data.length);

//           // Log the first record for inspection if available
//           if (response.data.length > 0) {
//             console.log('First authorization record sample:', response.data[0]);
//           }
//         }

//         return response.data;
//       } catch (error) {
//         // Log error if something went wrong
//         console.error('Error fetching functional access menus:', error);
//         return null;
//       }
// }

// const currentEmploye = async () => {
//   try {
//     // First get the authorization list
//     const accessList = await fetchFunctionAccessMenu();
//     console.log('Access list in currentEmploye:', accessList);

//     // Check if current employee has access permissions
//     const currentEmpId = user?.id || 0;
//     const hasAccessPermission = Array.isArray(accessList) &&
//       accessList.some(item => item.employeeId === currentEmpId && item.isApprove === true);

//     console.log('Current employee ID:', currentEmpId);
//     console.log('Has access permission:', hasAccessPermission);

//     // Fetch all exit records
//     const childCompanyId = user?.childCompanyId;
//     if (!childCompanyId) {
//       console.warn('Missing childCompanyId. Cannot fetch exit records.');
//       return;
//     }

//     const response = await fetch(
//       `${BASE_URL}/EmployeeExit/GetAllEmpExitRecords/${childCompanyId}`
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const allExitRecords = await response.json();
//     console.log('All exit records fetched:', allExitRecords.length);

//     let filteredRecords = [];

//     if (hasAccessPermission) {
//       // If employee has special access, show all pending applications
//       filteredRecords = allExitRecords.filter(
//         record => record.applicationStatus === "Pending" &&
//         !["Approved", "Rejected"].includes(record.supervisorStatus)
//       );
//       console.log('Filtered records based on access permissions:', filteredRecords.length);
//     } else {
//       // If no special access, only show records where this employee is the reporting manager
//       filteredRecords = allExitRecords.filter(
//         record => record.reportingId === currentEmpId &&
//         record.supervisorStatus === "Pending" &&
//         record.applicationStatus === "Pending"
//       );
//       console.log('Filtered records where user is reporting manager============:', filteredRecords.length);
//     }

//     // Update the requests state with filtered records
//     setRequests(filteredRecords);
//     console.log('Exit requests that requir==================e attention:', filteredRecords);

//     // Set loading state to false after processing
//     setLoading(false);

//   } catch (error) {
//     console.error('Error in currentEmploye function:', error);
//     setLoading(false);
//   }
// };

// // const currentEmploye = async () => {
// //   setLoading(true);

// //   try {
// //     const currentEmployeeId = user?.id;

// //     if (!currentEmployeeId) {
// //       console.warn('❗ No current employee ID found.');
// //       return;
// //     }

// //     // Step 1: Fetch functional access data
// //     const accessList = await fetchFunctionAccessMenu();

// //     // Step 2: Fetch all exit requests
// //     const exitResponse = await fetch(
// //       `${BASE_URL}/EmployeeExit/GetAllEmpExitRecords/${user?.childCompanyId}`
// //     );

// //     if (!exitResponse.ok) {
// //       throw new Error(`HTTP error! status: ${exitResponse.status}`);
// //     }

// //     const allExitRequests = await exitResponse.json();
// //     console.log('✅ All employee exit records:', allExitRequests);

// //     let filteredList = [];

// //     // Step 3: Check if current employee is in access list
// //     const hasApprovalAccess = Array.isArray(accessList)
// //       ? accessList.some(item => item.employeeId === currentEmployeeId)
// //       : false;

// //     if (hasApprovalAccess) {
// //       // Filter where applicationStatus is Pending
// //       filteredList = allExitRequests.filter(
// //         item => item.applicationStatus === 'Pending'
// //       );
// //       console.log('✅ Employee has access. Filtered approval list:===============', filteredList);
// //     } else {
// //       // Filter where reportingId === currentEmployeeId && supervisorStatus === 'Pending'
// //       filteredList = allExitRequests.filter(
// //         item =>
// //           item.reportingId === currentEmployeeId &&
// //           item.supervisorStatus === 'Pending'
// //       );
// //       console.log('✅ Employee has NO access. Filtered supervisor list:=======================', filteredList);
// //     }

// //     // Return or use the filteredList
// //     return filteredList;

// //   } catch (error) {
// //     console.error('❌ Error in currentEmploye logic:', error);
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// const defaultStatus = {

//     status: 'pending',
//     color: '#F59E0B',
//   };

//   // Get status color based on status string
//   const getStatusDetails = statusStr => {
//     if (!statusStr) return defaultStatus;

//     const status = statusStr.toLowerCase();
//     if (status.includes('approved')) {
//       return {status: 'Approved', color: '#10B981'};
//     } else if (status.includes('rejected')) {
//       return {status: 'Rejected', color: '#EF4444'};
//     } else {
//       return {status: 'Pending', color: '#F59E0B'};
//     }
//   };

//   // Get employee initials for avatar
//   const getInitials = name => {
//     if (!name) return 'NA';
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   return (
//     <AppSafeArea>
//       {/* Header with Gradient Background */}
//       <Appbar.Header style={styles.header}>
//         <Appbar.BackAction
//           onPress={() => navigation.goBack()}
//           color="#4B5563"
//         />
//         <Appbar.Content
//           title="Employee's Exit Request"
//           titleStyle={styles.headerTitle}
//         />
//       </Appbar.Header>

//       {/* Exit Request Cards */}
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#3B82F6" />
//             <Text style={styles.loadingText}>
//               Loading your exit requests...
//             </Text>
//           </View>
//         ) : requests.length === 0 ? (
//           canApplyNew ? (
//             <Card style={styles.formCard}>
//               <Card.Content>
//                 {/* Employee Info Section */}
//                 <Card style={styles.employeeInfoCard}>
//                   <Card.Content>
//                     <View style={styles.employeeInfoContainer}>
//                       <View style={styles.employeeDetails}>
//                         <Text style={styles.employeeName}>
//                           {employeeDetails?.empName || 'Employee Name'}
//                         </Text>
//                         <View style={[styles.statusBadgeContainer]}>
//                           <View
//                             style={[
//                               styles.statusIndicator,
//                               {backgroundColor: defaultStatus.color},
//                             ]}
//                           />
//                           <Text
//                             style={[
//                               styles.statusText,
//                               {color: defaultStatus.color},
//                             ]}>
//                             {defaultStatus.status}
//                           </Text>
//                         </View>
//                       </View>

//                       <View style={styles.employeeDate}>
//                         <Text style={styles.employeeDesignation}>
//                           {employeeDetails?.designation || 'Designation'}
//                         </Text>
//                         <Text style={styles.employeeDepartment}>
//                           {employeeDetails?.department || 'Department'}
//                         </Text>
//                       </View>
//                     </View>
//                   </Card.Content>
//                 </Card>

//                 {/* Dropdown for Employee Selection */}
//                 <View style={styles.formField}>
//                   <Text style={styles.formLabel}>
//                     Contingent Employees' Code
//                   </Text>
//                   <View style={styles.pickerContainer}>
//                     <Picker
//                       selectedValue={selectedEmployee}
//                       style={styles.picker}
//                       onValueChange={itemValue =>
//                         setSelectedEmployee(itemValue)
//                       }>
//                       <Picker.Item label="Select Employee" value="" />
//                       {employees.map(employee => (
//                         <Picker.Item
//                           key={employee.id}
//                           label={employee.name}
//                           value={employee.id}
//                         />
//                       ))}
//                     </Picker>
//                   </View>
//                 </View>

//                 {/* Card for date fields and reason in row format */}
//                 <Card style={styles.dataCard}>
//                   <Card.Content>
//                     {/* Row for Applied Date */}
//                     <View style={styles.dataRow}>
//                       <View style={styles.dataLabelContainer}>
//                         <Icon name="calendar-plus" size={20} color="#3B82F6" />
//                         <Text style={styles.dataLabel}>Applied Date :</Text>
//                       </View>
//                       <Text style={styles.dataLabel}>Applied Date </Text>
//                     </View>

//                     {/* Row for Exit Date */}
//                     <View style={styles.dataRow}>
//                       <View style={styles.dataLabelContainer}>
//                         <Icon
//                           name="calendar-remove"
//                           size={20}
//                           color="#EF4444"
//                         />
//                         <Text style={styles.dataLabel}>Exit Date :</Text>
//                       </View>
//                       <Text style={styles.dataLabel}>Exit Date </Text>
//                     </View>

//                     {/* Row for Reasons */}
//                     <View style={styles.dataRow}>
//                       <View style={styles.dataLabelContainer}>
//                         <Icon
//                           name="information-outline"
//                           size={20}
//                           color="#8B5CF6"
//                         />
//                         <Text style={styles.dataLabel}>Reasons :</Text>
//                       </View>
//                       <Text style={styles.dataLabel}>Reasons </Text>
//                     </View>
//                   </Card.Content>
//                 </Card>

//                 {/* Remarks Input */}
//                 <View style={styles.formField}>
//                   <Text style={styles.formLabel}>
//                     Remarks (Maximum 100 Characters)*
//                   </Text>
//                   <TextInput
//                     style={styles.input}
//                     value={remarks}
//                     onChangeText={text => {
//                       if (text.length <= 100) setRemarks(text);
//                     }}
//                     mode="outlined"
//                     placeholder="Enter Remarks"
//                     multiline
//                     numberOfLines={3}
//                     maxLength={100}
//                     right={<TextInput.Affix text={`${remarks.length}/100`} />}
//                   />
//                 </View>
//               </Card.Content>
//               <Card.Actions style={styles.cardActions}>
//                 <Button
//                   mode="contained"
//                   onPress={() =>
//                     Alert.alert('Success', 'Request has been approved.')
//                   }
//                   style={styles.approveBtn}>
//                   Approve
//                 </Button>
//                 <Button
//                   mode="outlined"
//                   onPress={() =>
//                     Alert.alert('Rejected', 'Request has been rejected.')
//                   }
//                   style={styles.rejectBtn}
//                   labelStyle={styles.rejectBtnLabel}>
//                   Reject
//                 </Button>
//               </Card.Actions>
//             </Card>
//           ) : (
//             <Card style={styles.warningCard}>
//               <Card.Content style={styles.pendingMessageContainer}>
//                 <Icon name="alert-circle-outline" size={48} color="#FFA500" />
//                 <Text style={styles.pendingMessageText}>
//                   You already have a pending exit application. Please withdraw
//                   it before submitting a new one.
//                 </Text>
//               </Card.Content>
//               <Card.Actions style={styles.cardActions}>
//                 <Button
//                   mode="contained"
//                   onPress={() => navigation.navigate('Home')}
//                   style={[styles.cancelBtn, {backgroundColor: '#EF4444'}]}
//                   labelStyle={{color: '#fff'}}>
//                   Cancel
//                 </Button>
//               </Card.Actions>
//             </Card>
//           )
//         ) : (
//           <>
//             {requests.map((item, index) => (
//               <Card key={index} style={styles.requestCard}>
//                 {/* Employee Info Section */}
//                 <Card.Content>
//                   <View style={styles.employeeInfoContainer}>
//                     <Avatar.Text
//                       size={50}
//                       label={getInitials(employeeDetails?.empName)}
//                       style={styles.avatar}
//                     />
//                     <View style={styles.employeeDetails}>
//                       <Text style={styles.employeeName}>
//                         {employeeDetails?.empName || 'Employee Name'}
//                       </Text>
//                       <Text style={styles.employeeDesignation}>
//                         {employeeDetails?.designation || 'Designation'}
//                       </Text>
//                       <Text style={styles.employeeDepartment}>
//                         {employeeDetails?.department || 'Department'}
//                       </Text>
//                     </View>
//                     <Badge
//                       style={[
//                         styles.statusBadge,
//                         {
//                           backgroundColor: getStatusDetails(
//                             item.applicationStatus,
//                           ).color,
//                         },
//                       ]}>
//                       {getStatusDetails(item.applicationStatus).status}
//                     </Badge>
//                   </View>
//                 </Card.Content>

//                 <Divider style={styles.divider} />

//                 {/* Exit Details Section */}
//                 <Card.Content>
//                   <View style={styles.detailsContainer}>
//                     {/* Applied Date Card */}
//                     <Card style={styles.detailCard}>
//                       <Card.Content>
//                         <View style={styles.detailRow}>
//                           <Icon
//                             name="calendar-check"
//                             size={24}
//                             color="#3B82F6"
//                           />
//                           <View style={styles.detailTextContainer}>
//                             <Text style={styles.detailLabel}>Applied Date</Text>
//                             <Text style={styles.detailValue}>
//                               {formatDate(item.appliedDt)}
//                             </Text>
//                           </View>
//                         </View>
//                       </Card.Content>
//                     </Card>

//                     {/* Exit Date Card */}
//                     <Card style={styles.detailCard}>
//                       <Card.Content>
//                         <View style={styles.detailRow}>
//                           <Icon
//                             name="calendar-remove"
//                             size={24}
//                             color="#EF4444"
//                           />
//                           <View style={styles.detailTextContainer}>
//                             <Text style={styles.detailLabel}>Exit Date</Text>
//                             <Text style={styles.detailValue}>
//                               {formatDate(item.exitDt)}
//                             </Text>
//                           </View>
//                         </View>
//                       </Card.Content>
//                     </Card>
//                   </View>

//                   {/* Reason Section */}
//                   <Card style={styles.reasonCard}>
//                     <Card.Content>
//                       <Text style={styles.reasonTitle}>Reason for Exit</Text>
//                       <Paragraph style={styles.reasonText}>
//                         {item.exitReasons}
//                       </Paragraph>
//                     </Card.Content>
//                   </Card>

//                   {/* Supervisor Remarks */}
//                   {item.supervisorRemarks && (
//                     <Card style={styles.remarksCard}>
//                       <Card.Content>
//                         <View style={styles.remarksHeader}>
//                           <Icon name="account-tie" size={20} color="#6B7280" />
//                           <Text style={styles.remarksTitle}>
//                             Supervisor Remarks
//                           </Text>
//                         </View>
//                         <Paragraph style={styles.remarksText}>
//                           {item.supervisorRemarks}
//                         </Paragraph>
//                       </Card.Content>
//                     </Card>
//                   )}

//                   {/* HR Remarks */}
//                   {item.hrremarks && (
//                     <Card style={styles.remarksCard}>
//                       <Card.Content>
//                         <View style={styles.remarksHeader}>
//                           <Icon
//                             name="account-group"
//                             size={20}
//                             color="#6366F1"
//                           />
//                           <Text
//                             style={[styles.remarksTitle, {color: '#6366F1'}]}>
//                             HR Remarks
//                           </Text>
//                         </View>
//                         <Paragraph
//                           style={[styles.remarksText, {color: '#6366F1'}]}>
//                           {item.hrremarks}
//                         </Paragraph>
//                       </Card.Content>
//                     </Card>
//                   )}
//                 </Card.Content>

//                 {/* Action buttons */}
//                 {item.applicationStatus?.toLowerCase() === 'pending' && (
//                   <Card.Actions style={styles.cardActions}>
//                     <Button
//                       mode="outlined"
//                       onPress={() => handleWithdraw(item.id)}
//                       loading={withdrawingId === item.id}
//                       disabled={withdrawingId !== null}
//                       style={styles.withdrawBtn}
//                       labelStyle={styles.withdrawBtnLabel}
//                       icon="close-circle-outline">
//                       Withdraw Application
//                     </Button>
//                   </Card.Actions>
//                 )}

//                 {/* Add reapply button for rejected applications */}
//                 {item.applicationStatus?.toLowerCase() === 'rejected' && (
//                   <Card.Actions style={styles.cardActions}>
//                     <Button
//                       mode="contained"
//                       onPress={handleApplyNew}
//                       style={styles.reapplyBtn}
//                       labelStyle={styles.reapplyBtnLabel}
//                       icon="refresh">
//                       Apply Again
//                     </Button>
//                   </Card.Actions>
//                 )}
//               </Card>
//             ))}
//           </>
//         )}
//       </ScrollView>
//     </AppSafeArea>
//   );
// };

// const styles = StyleSheet.create({
//   gradientHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 10,
//     elevation: 4,
//   },
//   header: {
//     backgroundColor: '#FFFFFF',
//     elevation: 0,
//     shadowOpacity: 0,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   headerTitle: {
//     color: '#111827',
//     fontWeight: '800',
//     fontSize: 18,
//   },
//   scrollContainer: {
//     padding: 12,
//     paddingBottom: 24,
//   },
//   requestCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   formCard: {
//     marginTop: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   warningCard: {
//     marginTop: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   avatarIcon: {
//     backgroundColor: '#3B82F6',
//   },
//   employeeInfoCard: {
//     marginBottom: 16,
//     borderRadius: 8,
//     backgroundColor: '#F8FAFC',
//     elevation: 1,
//   },
//   employeeInfoContainer: {
//     paddingVertical: 8,
//   },
//   avatar: {
//     backgroundColor: '#3B82F6',
//     marginRight: 12,
//   },
//   employeeDetails: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   employeeDate: {
//     flex: 1,
//     flexDirection: 'row',
//     alignContent: 'center',
//     alignItems: 'center',
//   },
//   employeeName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1E293B',
//   },
//   employeeDesignation: {
//     fontSize: 14,
//     color: '#64748B',

//     marginRight: 12,
//     textAlign: 'center',
//     alignItems: 'center',
//     alignContent: 'center',
//   },
//   employeeDepartment: {
//     fontSize: 14,
//     color: '#64748B',
//   },
//   statusBadgeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     borderRadius: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     alignSelf: 'flex-start',
//     borderWidth: 1,
//     borderColor: 'orange',
//   },
//   statusIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '700',
//     letterSpacing: 0.3,
//     textTransform: 'capitalize',
//   },
//   divider: {
//     marginVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailTextContainer: {
//     marginLeft: 12,
//   },
//   detailLabel: {
//     fontSize: 12,
//     color: '#64748B',
//     fontWeight: '500',
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#1E293B',
//     fontWeight: '700',
//   },
//   reasonCard: {
//     marginBottom: 12,
//     borderRadius: 8,
//     backgroundColor: '#F8FAFC',
//     elevation: 1,
//   },
//   reasonTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#64748B',
//     marginBottom: 6,
//   },
//   reasonText: {
//     fontSize: 15,
//     color: '#1E293B',
//   },
//   remarksCard: {
//     marginBottom: 12,
//     borderRadius: 8,
//     backgroundColor: '#F8FAFC',
//     borderLeftWidth: 3,
//     borderLeftColor: '#CBD5E1',
//     elevation: 1,
//   },
//   remarksHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   remarksTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#64748B',
//     marginLeft: 8,
//   },
//   remarksText: {
//     fontSize: 14,
//     color: '#334155',
//     lineHeight: 20,
//   },
//   formField: {
//     marginBottom: 16,
//   },
//   formLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#475569',
//     marginBottom: 6,
//   },
//   input: {
//     backgroundColor: '#F8FAFC',
//     fontSize: 15,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     borderRadius: 4,
//     backgroundColor: '#F8FAFC',
//     marginBottom: 8,
//   },
//   picker: {
//     height: 50,
//   },
//   cardActions: {
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     flexDirection: 'row',
//     paddingTop: 2,
//     paddingBottom: 6,
//     paddingHorizontal: 2,
//   },
//   submitBtn: {
//     backgroundColor: '#3B82F6',
//     marginRight: 8,
//   },
//   cancelBtn: {
//     borderColor: '#64748B',
//   },
//   withdrawBtn: {
//     borderColor: '#ef4444',
//     borderWidth: 1.5,
//   },
//   withdrawBtnLabel: {
//     color: '#ef4444',
//   },
//   reapplyBtn: {
//     backgroundColor: '#10B981',
//   },
//   reapplyBtnLabel: {
//     color: '#FFFFFF',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#6B7280',
//   },
//   pendingMessageContainer: {
//     alignItems: 'center',
//     paddingVertical: 24,
//   },
//   pendingMessageText: {
//     fontSize: 16,
//     color: '#6B7280',
//     marginTop: 16,
//     fontWeight: '500',
//     textAlign: 'center',
//     paddingHorizontal: 24,
//   },
//   dataCard: {
//     marginBottom: 16,
//     borderRadius: 8,
//     backgroundColor: '#F8FAFC',
//     elevation: 2,
//     borderLeftWidth: 3,
//     borderLeftColor: '#3B82F6',
//   },
//   dataRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   dataLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: 120,
//   },
//   dataLabel: {
//     fontSize: 14,
//     color: '#475569',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   dataInput: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//     fontSize: 14,
//     height: 20,
//   },
//   approveBtn: {
//     backgroundColor: '#10B981', // Green
//     paddingVertical: 1,
//     paddingHorizontal: 11,
//     borderRadius: 8,
//     marginRight: 8,
//   },
//   approveBtnLabel: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },

//   // Reject Button Styles
//   rejectBtn: {
//     backgroundColor: '#ffffff',
//     paddingVertical: 1,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#EF4444', // Red border
//   },
//   rejectBtnLabel: {
//     color: '#EF4444',
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

// export default ExitRequestStatusScreen;
