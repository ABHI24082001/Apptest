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
import Pagination from '../component/Pagination';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import LinearGradient from 'react-native-linear-gradient';
import WebView from 'react-native-webview';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import FeedbackModal from '../component/FeedbackModal';
import styles from '../Stylesheet/ExpenseRequestDetails';

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


    setPaginatedData(paginatedItems);
  };

  // Handle page change
  const handlePageChange = newPage => {
    // console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
  };

  
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

      const response = await axiosinstance.get(apiUrl);

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
          const empResponse = await axiosinstance.get(
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

      const payrollRes = await axiosinstance.post(
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

      const approvalRes = await axiosinstance.post(endpoint, approvalPayload);
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
    if (!approvalRemarks[id]) {
      Alert.alert('Validation', 'Please add remarks before rejecting');
      return;
    }

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
              // Prepare payload for rejection
              const expenceDetails = await fetchExpenseById(id);
              if (!expenceDetails) {
                setFeedbackType('fail');
                setFeedbackMessage('Failed to fetch expense details.');
                setFeedbackVisible(true);
                return;
              }

              const payload = {
                paymentRequest: {
                  ...expenceDetails.paymentRequest,
                  approvalStatus: 2, // 2 = Rejected
                  remarks: approvalRemarks[id],
                  managerReason: approvalRemarks[id],
                  paymentStatus: 'Rejected',
                  modifiedBy: expenceDetails.paymentRequest?.modifiedBy || expenceDetails.paymentRequest?.employeeId || 0,
                  modifiedDate: new Date().toISOString(),
                },
                paymentDetails: (expenceDetails.paymentDetails || []).map(detail => ({
                  ...detail,
                  status: 'Rejected',
                })),
              };

              // Use the correct endpoint for rejection (adjust if needed)
              const endpoint = isAuthorizedForFinalApproval
                ? `${BASE_URL}/PaymentAdvanceRequest/SaveClaimRequestFinalApproval`
                : `${BASE_URL}/PaymentAdvanceRequest/SaveClaimRequestMGRApproval`;

              const response = await axiosinstance.post(endpoint, payload);

              if (response.data?.isSuccess) {
                setFeedbackType('fail');
                setFeedbackMessage('Expense request has been rejected');
                setFeedbackVisible(true);

                // Remove the rejected item from the list
                const updatedList = expenseList.filter(
                  item => (item.id || item.requestId) !== id,
                );
                setExpenseList(updatedList);
                setPendingRequestsCount(updatedList.length);
                updatePaginatedData(updatedList, currentPage);
              } else {
                setFeedbackType('fail');
                setFeedbackMessage(response.data?.message || 'Rejection failed');
                setFeedbackVisible(true);
              }
            } catch (error) {
              console.error('Error in rejection:', error);
              setFeedbackType('fail');
              setFeedbackMessage('Error occurred during rejection');
              setFeedbackVisible(true);
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

      const response = await axiosinstance.post(
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
        const roleResponse = await axiosinstance.get(roleUrl);
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
        const response = await axiosinstance.get(apiUrl);

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



export default ExpenseRequestDetails;
