import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput as RNTextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  Modal,
} from 'react-native';
import AppSafeArea from '../component/AppSafeArea';
import {
  Appbar,
  Avatar,
  Chip,
  Divider,
  Card,
  Title,
  Subheading,
  Badge,
  Button as PaperButton,
  DataTable,
  TextInput,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import BASE_URL from '../constants/apiConfig';
import FeedbackModal from '../component/FeedbackModal';

import {useAuth} from '../constants/AuthContext';
// Import the Pagination component
import Pagination from '../components/Pagination';
// Import Picker for task assignment dropdown
import {Picker} from '@react-native-picker/picker';
// Import the new LeaveBalanceTable component
import LeaveBalanceTable from '../components/LeaveBalanceTable';

const LeaveTypeColors = {
  'Casual Leave': '#3b82f6', // Blue
  'Sick Leave': '#ef4444', // Red
  'Paid Leave': '#10b981', // Green
};

const LeaveRequest = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const {user} = useAuth();

  // console.log('First ======================================', user);
  // console.log('Employee Details:', employeeDetails);
  const [leaveApprovalAccess, setLeaveApprovalAccess] = useState(null);
  const [approvalList, setApprovalList] = useState([]); // State to hold the approval list
  const [approveLeaveId, setapproveLeaveId] = useState(null); // State to hold the applyLeaveId
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [isAuthorizedForFinalApproval, setIsAuthorizedForFinalApproval] =
    useState(false);
  // Add state for pending requests count
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Add state to track if user is a reporting manager
  const [isReportingManager, setIsReportingManager] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of items to display per page
  const [paginatedData, setPaginatedData] = useState([]);

  // Add state for task assignment
  const [taskAssignmentEmployees, setTaskAssignmentEmployees] = useState([]);
  const [selectedTaskAssignee, setSelectedTaskAssignee] = useState({});

  // New state for leave balance data
  const [leaveData, setLeaveData] = useState([]);
  const [isLoadingLeaveData, setIsLoadingLeaveData] = useState(false);

  // Feedback modal state
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState('success');
  const [feedbackModalMessage, setFeedbackModalMessage] = useState('');

  // State to control the visibility of the leave balance details modal
  const [leaveBalanceModalVisible, setLeaveBalanceModalVisible] =
    useState(false);

  // Add state for required field validation
  const [remarkErrors, setRemarkErrors] = useState({});

  // Function to show feedback modal
  const showFeedbackModal = (type, message) => {
    setFeedbackModalType(type);
    setFeedbackModalMessage(message);
    setFeedbackModalVisible(true);
  };

  // Function to hide feedback modal
  const hideFeedbackModal = () => {
    setFeedbackModalVisible(false);
  };

  useEffect(() => {
    if (employeeDetails) {
      fetchLeaveApprovalData();
      fetchTaskAssignmentEmployees(); // Fetch employees for task assignment
    }
  }, [employeeDetails]);

  // Add another useEffect to initialize approvedLeaveCount and unapprovedLeaveCount when approvalList changes
  useEffect(() => {
    if (Array.isArray(approvalList) && approvalList.length > 0) {
      const initialCounts = {};
      const initialUnapprovedCounts = {};

      approvalList.forEach(item => {
        const id = item.id || item.applyLeaveId;
        initialCounts[id] = item.leaveNo || 0;
        initialUnapprovedCounts[id] = 0; // Initialize unapproved count with 0
      });

      setApprovedLeaveCount(initialCounts);
      setUnapprovedLeaveCount(initialUnapprovedCounts);

      // Reset to first page when approval list changes
      setCurrentPage(1);

      // Update paginated data
      updatePaginatedData(approvalList, 1);
    } else {
      setPaginatedData([]);
    }
  }, [approvalList]);

  // Update paginated data whenever current page changes
  useEffect(() => {
    updatePaginatedData(approvalList, currentPage);
  }, [currentPage]);

  // Function to paginate data
  const updatePaginatedData = (data, page) => {
    if (!Array.isArray(data) || data.length === 0) {
      setPaginatedData([]);
      return;
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = data.slice(startIndex, endIndex);

    console.log(
      `Paginating: Page ${page}, showing items ${startIndex + 1}-${Math.min(
        endIndex,
        data.length,
      )} of ${data.length}`,
    );

    setPaginatedData(paginatedItems);
  };

  // Handle page change
  const handlePageChange = newPage => {
    console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
  };

  const fetchLeaveApprovalData = async () => {
    const accessData = await fetchFunctionalAccessMenus();
    setLeaveApprovalAccess(accessData);
    // console.log('Leave approval access data set:', accessData);

    const userType = user?.userType; // static as per requirement
    const employeeId = user?.id;
    const companyId = user?.childCompanyId;
    let hasAccess = false;

    if (Array.isArray(accessData)) {
      hasAccess = accessData.some(
        item => item.employeeId === employeeId || userType === 2,
      );
    }

    let ApprovalList;
    try {
      let apiUrl = '';
      if (hasAccess) {
        apiUrl = `${BASE_URL}/ApplyLeave/GetLeaveListForFinalApproval/${companyId}/${employeeId}`;
      } else {
        apiUrl = `${BASE_URL}/ApplyLeave/GetApplyLeaveListForApproval/${companyId}/${employeeId}`;
      }
      // debugger;;
      ApprovalList = await axios.get(apiUrl);
      ApprovalList.data = ApprovalList.data.filter(
        item => item.employeeId != employeeDetails?.id,
      );

      // Get the pending request count
      if (Array.isArray(ApprovalList.data)) {
        setPendingRequestsCount(ApprovalList.data.length);
      }

      // console.log('Leave =================list:', ApprovalList.data);
    } catch (err) {
      console.error('Error fetching leave list:', err);
    }

    let roleurl = '';
    roleurl = `${BASE_URL}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
    const response = await axios.get(roleurl);
    let roleData = null;
    // console.log('Role Details========:', response.data);

    // Check if current user is authorized for final approval
    if (Array.isArray(response.data)) {
      // Check if employee ID exists in role details
      const isAuthorized = response.data.some(
        role => role.employeeId === employeeDetails?.id,
        // (role.roleId === 1 || role.branchId === 0)
      );
      setIsAuthorizedForFinalApproval(isAuthorized);

      // Determine if the user is a reporting manager
      // Check if user is a reporting manager (not an HR/final approver)
      const isManager = hasAccess && !isAuthorized;
      setIsReportingManager(isManager);

      // If employeeId matches, get that role data, else get the first role as fallback
      roleData =
        response.data.find(item => item.employeeId === employeeDetails?.id) ||
        response.data[0] ||
        null;
    }
    // console.log('Role Data==============================', roleData);

    if (roleData.branchId != 0) {
      ApprovalList = ApprovalList.data.some(
        item => item.branchId === roleData.branchId,
      );
    }
    // console.log('Filtered fffffffApproval List:', ApprovalList.data);

    // Integrate the filtered approval list into the UI
    // Set the approval list state for FlatList rendering
    setApprovalList(Array.isArray(ApprovalList.data) ? ApprovalList.data : []);
  };

  // debugger

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

  const fetchFunctionalAccessMenus = async () => {
    try {
      const requestData = {
        DepartmentId: user?.departmentId || 0,
        DesignationId: user?.designtionId || 0,
        EmployeeId: user?.id || 0,
        ControllerName: 'Leaveapproval',
        ActionName: 'LeaveapprovalList',
        ChildCompanyId: user?.childCompanyId || 1,
        BranchId: user?.branchId || 2,
        UserType: user?.userType || 1,
      };

      // console.log(
      //   'Sending request data for leave approval access:',
      //   requestData,
      // );

      const response = await axios.post(
        `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );

      // console.log('Leave fetchFunctionalAccessMenus:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching functional access menus:', error);
      return null;
    }
  };

  // console.log(employeeDetails, 'Employee Details');

  const [rmRemarks, setRmRemarks] = useState({});
  const [approvalRemarks, setApprovalRemarks] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [approvalLeaveId, setApprovalLeaveId] = useState(null);
  // Add state for approved leave count per request
  const [approvedLeaveCount, setApprovedLeaveCount] = useState({});
  // Add state for unapproved leave count per request
  const [unapprovedLeaveCount, setUnapprovedLeaveCount] = useState({});
  // Add validation state for the leave count inputs
  const [leaveCountErrors, setLeaveCountErrors] = useState({});

  // debugger;
  const handleApprove = async id => {
    try {
      // First fetch the detailed leave data directly from API
      const leaveDetails = await fetchLeaveDetailsById(id);

      if (!leaveDetails) {
        showFeedbackModal('fail', 'Cannot fetch leave request details');
        return;
      }

      // Find matching item in approval list for UI display purposes
      const leaveItem = approvalList.find(
        item => (item.id || item.applyLeaveId) === id,
      );

      if (!leaveItem) {
        showFeedbackModal('fail', 'Cannot find leave request details');
        return;
      }

      // Validate required remarks for final approval
      if (
        isAuthorizedForFinalApproval &&
        (!rmRemarks[id] || !rmRemarks[id].trim())
      ) {
        setRemarkErrors(prev => ({
          ...prev,
          [id]: 'Final approval remarks are required',
        }));
        showFeedbackModal('fail', 'Please provide remarks for final approval');
        return;
      }

      const leaveNo = leaveDetails.leaveNo || leaveItem.leaveNo || 0;

      if (leaveNo === 0) {
        showFeedbackModal('fail', 'Leave days (leaveNo) cannot be zero');
        return;
      }

      const approvedCount = Number(approvedLeaveCount[id]) || 0;
      const unapprovedCount = Number(unapprovedLeaveCount[id]) || 0;
      const totalCount = approvedCount + unapprovedCount;

      // Validate leave counts before proceeding
      const isValid = validateLeaveCounts(
        id,
        approvedCount.toString(),
        unapprovedCount.toString(),
        leaveNo,
      );

      if (!isValid) {
        // Get the error message to display
        const errors = leaveCountErrors[id] || {};
        showFeedbackModal(
          'fail',
          errors.total || 'Please enter valid values for leave days',
        );
        return;
      }

      // Step 1: Check if payroll already generated
      const payrollCheckBody = {
        EmployeeId: leaveDetails.employeeId,
        CompanyId: leaveDetails.companyId,
        BranchId: leaveDetails.branchId || 0,
        fromLeaveDate: formatDateForBackend(leaveDetails.fromLeaveDate),
      };

      const payrollRes = await axios.post(
        `${BASE_URL}/PayRollRun/CheckPayRollCreationForLeaveApproval`,
        payrollCheckBody,
      );

      if (payrollRes?.data?.isSuccess) {
        showFeedbackModal(
          'fail',
          'Payroll already generated for this employee. Leave cannot be approved.',
        );
        return;
      }

      // Step 2: Check if current user is in authorization list
      const currentUserId = employeeDetails?.id;
      console.log('Current user ID:', currentUserId);
      console.log('Cached approval access data:', leaveApprovalAccess);

      // First check if we have cached access data
      let accessData = leaveApprovalAccess;

      // If not cached, fetch it
      if (!Array.isArray(accessData) || accessData.length === 0) {
        console.log('No cached approval data, fetching fresh data...');
        accessData = await fetchFunctionalAccessMenus();
        console.log('Freshly fetched approval data:', accessData);
      }

      // Check if current user is an authorization person
      let isAuthorizationPerson = false;

      if (Array.isArray(accessData)) {
        // Log each entry to debug
        accessData.forEach((person, index) => {
          console.log(`Authorization person ${index}:`, person);
        });

        // Match by employeeId
        isAuthorizationPerson = accessData.some(person => {
          const match = person.employeeId === currentUserId;
          if (match) {
            console.log('Found matching authorization person:', person);
          }
          return match;
        });
      }

      console.log('Is authorization person:', isAuthorizationPerson);

      // Step 3: Construct payload using the detailed data from API
      const taskAssignment = selectedTaskAssignee[id] || {};

      const approvalPayload = {
        CompanyId: leaveDetails.companyId,
        Id: leaveDetails.id,
        Visible: false,
        EmployeeId: leaveDetails.employeeId,
        ReportingId: leaveDetails.reportingId,
        DocumentPath: leaveDetails.documentPath || '',
        EmployeeEmail: leaveDetails.employeeEmail || '',
        ApplyLeaveId: leaveDetails.applyLeaveId || 0,
        DepartmentId: leaveDetails.departmentId,
        ReportingMgerEmail: leaveDetails.reportingMgerEmail || '',
        ReportTaskEmail: leaveDetails.reportTaskEmail || '',
        ToLeaveDate: leaveDetails.toLeaveDate,
        FromLeaveDate: leaveDetails.fromLeaveDate,
        EmployeeName: leaveDetails.employeeName,
        EmployeeCode: leaveDetails.employeeCode,
        Designation: leaveDetails.designation,
        Department: leaveDetails.department,
        Remarks: rmRemarks[id] || leaveDetails.remarks || '',
        LeaveNo: leaveNo,
        ApprovedPaidLeave: approvedCount,
        ApprovedUnpaidLeave: unapprovedCount,
        ApprovalStatus: 1, // 1 means approved
        taskAssignmentEmpId:
          taskAssignment.employeeId || leaveDetails.taskAssignmentEmpId || 0,
        taskAssignEmployeeCode:
          taskAssignment.employeeCode ||
          leaveDetails.taskAssignEmployeeCode ||
          '',
        ReportingRemarks: rmRemarks[id] || '',
        leaveType: leaveDetails.leaveType,
        status: 'Approved',
        flag: 1,
        isDelete: 0,
        createdBy: employeeDetails?.id || 0,
        createdDate: new Date().toISOString(),
        modifiedBy: employeeDetails?.id || 0,
        modifiedDate: new Date().toISOString(),
      };

      // Debug the exact payload being sent
      console.log(
        'Final approval payload using detailed data:',
        JSON.stringify(approvalPayload, null, 2),
      );

      const endpoint = isAuthorizationPerson
        ? `${BASE_URL}/LeaveApproval/SaveLeaveFinalApproval`
        : `${BASE_URL}/LeaveApproval/SaveLeaveApproval`;

      console.log('Submitting leave approval to:', endpoint);

      const approvalRes = await axios.post(endpoint, approvalPayload);
      const {data} = approvalRes;

      // Log the full backend response for debugging
      console.log('Backend response:', {
        status: approvalRes.status,
        statusText: approvalRes.statusText,
        headers: approvalRes.headers,
        data: data,
      });

      if (data?.isSuccess) {
        // Simplified success message without employee details
        showFeedbackModal('success', 'Leave Approved Successfully!');

        // After successful approval, refresh the list
        fetchLeaveApprovalData();
      } else {
        console.error('Backend returned error:', data);
        showFeedbackModal(
          'fail',
          `Approval Failed: ${data?.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      console.error('Exception during approval:', error);
      console.error('Error details:', error.response?.data || error.message);
      showFeedbackModal(
        'fail',
        'An unexpected error occurred during leave approval. Please try again.',
      );
    }
  };

  const handleReject = async id => {
    try {
      // First fetch the detailed leave data directly from API
      const leaveDetails = await fetchLeaveDetailsById(id);

      if (!leaveDetails) {
        showFeedbackModal('fail', 'Cannot fetch leave request details');
        return;
      }

      // Find matching item in approval list for UI display purposes
      const leaveItem = approvalList.find(
        item => (item.id || item.applyLeaveId) === id,
      );

      if (!leaveItem) {
        showFeedbackModal('fail', 'Cannot find leave request details');
        return;
      }

      // Validate that remarks are provided for rejection
      if (!rmRemarks[id] || !rmRemarks[id].trim()) {
        setRemarkErrors(prev => ({
          ...prev,
          [id]: isAuthorizedForFinalApproval
            ? 'Final rejection remarks are required'
            : 'Remarks are required for rejection',
        }));
        showFeedbackModal(
          'fail',
          `Please provide remarks for ${
            isAuthorizedForFinalApproval
              ? 'final rejection'
              : 'rejecting this leave request'
          }`,
        );
        return;
      }

      // Step 1: Check if current user is in authorization list
      const currentUserId = employeeDetails?.id;

      // First check if we have cached access data
      let accessData = leaveApprovalAccess;

      // If not cached, fetch it
      if (!Array.isArray(accessData) || accessData.length === 0) {
        accessData = await fetchFunctionalAccessMenus();
      }

      // Check if current user is an authorization person
      let isAuthorizationPerson = false;

      if (Array.isArray(accessData)) {
        isAuthorizationPerson = accessData.some(
          person => person.employeeId === currentUserId,
        );
      }

      console.log(
        'Is authorization person for rejection:',
        isAuthorizationPerson,
      );

      // Step 2: Construct payload using the detailed data from API
      const rejectPayload = {
        CompanyId: leaveDetails.companyId,
        Id: leaveDetails.id,
        Visible: false,
        EmployeeId: leaveDetails.employeeId,
        ReportingId: leaveDetails.reportingId,
        DocumentPath: leaveDetails.documentPath || '',
        EmployeeEmail: leaveDetails.employeeEmail || '',
        ApplyLeaveId: leaveDetails.applyLeaveId || 0,
        DepartmentId: leaveDetails.departmentId,
        ReportingMgerEmail: leaveDetails.reportingMgerEmail || '',
        ReportTaskEmail: leaveDetails.reportTaskEmail || '',
        ToLeaveDate: leaveDetails.toLeaveDate,
        FromLeaveDate: leaveDetails.fromLeaveDate,
        EmployeeName: leaveDetails.employeeName,
        EmployeeCode: leaveDetails.employeeCode,
        Designation: leaveDetails.designation,
        Department: leaveDetails.department,
        Remarks: rmRemarks[id] || leaveDetails.remarks || '',
        LeaveNo: leaveDetails.leaveNo || leaveItem.leaveNo || 0,
        ApprovedPaidLeave: 0,
        ApprovedUnpaidLeave: 0,
        ApprovalStatus: 2, // 2 means rejected
        ReportingRemarks: rmRemarks[id] || 'Rejected by reporting manager',
        leaveType: leaveDetails.leaveType,
        status: 'Rejected',
        flag: 1,
        isDelete: 0,
        createdBy: employeeDetails?.id || 0,
        createdDate: new Date().toISOString(),
        modifiedBy: employeeDetails?.id || 0,
        modifiedDate: new Date().toISOString(),
      };

      // Debug the exact payload being sent
      console.log(
        'Final rejection payload:',
        JSON.stringify(rejectPayload, null, 2),
      );

      const endpoint = isAuthorizationPerson
        ? `${BASE_URL}/LeaveApproval/SaveLeaveFinalApproval`
        : `${BASE_URL}/LeaveApproval/SaveLeaveApproval`;

      console.log('Submitting leave rejection to:', endpoint);

      const rejectionRes = await axios.post(endpoint, rejectPayload);
      const {data} = rejectionRes;

      // Log the full backend response for debugging
      console.log('Backend response for rejection:', {
        status: rejectionRes.status,
        statusText: rejectionRes.statusText,
        data: data,
      });

      if (data?.isSuccess) {
        showFeedbackModal(
          'success',
          `Leave Rejected Successfully\n\nEmployee: ${leaveItem.employeeName}\nLeave Type: ${leaveItem.leaveName}\nReason: ${rmRemarks[id]}`,
        );

        // After successful rejection, refresh the list
        fetchLeaveApprovalData();
      } else {
        console.error('Backend returned error on rejection:', data);
        showFeedbackModal(
          'fail',
          `Rejection Failed: ${data?.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      console.error('Exception during rejection:', error);
      console.error('Error details:', error.response?.data || error.message);
      showFeedbackModal(
        'fail',
        'An unexpected error occurred during leave rejection. Please try again.',
      );
    }
  };
  // if true 244	LeaveApproval	/api/LeaveApproval/GetLeaveApprovalDetailsById/{Id}	GET	Id (Path)
  // else 44	ApplyLeave	/api/ApplyLeave/GetApplyLeaveDetailsById/{Id}	GET	Id (Path)
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const fetchLeaveDetailsById = async id => {
    try {
      console.log(`Fetching leave details for ID: ${id}`);

      const payload = {
        DepartmentId: user?.departmentId || 0,
        DesignationId: user?.designtionId || 0,
        EmployeeId: user?.id || 0,
        ControllerName: 'Leaveapproval',
        ActionName: 'LeaveapprovalList',
        ChildCompanyId: user?.childCompanyId || 1,
        BranchId: user?.branchId || 2,
        UserType: user?.userType || 1,
      };

      let apiUrl = '';
      let source = '';

      // Conditional logic
      if (isAuthorizedForFinalApproval) {
        // Use LeaveApproval endpoint
        apiUrl = `${BASE_URL}/LeaveApproval/GetLeaveApprovalDetailsById/${id}`;
        source = 'LeaveApproval';
      } else {
        // Use ApplyLeave endpoint
        apiUrl = `${BASE_URL}/ApplyLeave/GetApplyLeaveDetailsById/${id}`;
        source = 'ApplyLeave';
      }

      console.log(`API Source: ${source}`);
      console.log(`Calling API: ${apiUrl}`);
      console.log('Request Payload:', payload);

      const response = await axios.get(apiUrl);

      console.log(
        `${source} API Response:`,
        JSON.stringify(response.data, null, 2),
      );

      setLeaveDetails(response.data);

      // Fetch leave balances for this employee
      if (response.data && response.data.employeeId) {
        fetchLeaveData(response.data.employeeId);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching leave details:', error);
      console.error('Error details:', error.response?.data || error.message);
      return null;
    }
  };

  // Function to fetch leave balance data
  const fetchLeaveData = async employeeId => {
    try {
      setIsLoadingLeaveData(true);

      if (!employeeId) return;

      const companyId = user?.childCompanyId;
      if (!companyId) return;

      console.log(
        `Fetching leave balances for employee ${employeeId} in company ${companyId}`,
      );

      const response = await axios.get(
        `${BASE_URL}/CommonDashboard/GetEmployeeLeaveDetails/${companyId}/${employeeId}`,
      );

      if (response.data && response.data.leaveBalances) {
        const transformed = response.data.leaveBalances.map(item => ({
          label: item.leavename,
          used: item.usedLeaveNo,
          available: item.availbleLeaveNo,
        }));

        console.log('Leave balance data:', transformed);
        setLeaveData(transformed);
      } else {
        console.log('No leave balance data available');
        setLeaveData([]);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error.message);
      setLeaveData([]);
    } finally {
      setIsLoadingLeaveData(false);
    }
  };

  // Toggle card expansion
  const toggleCardExpansion = async id => {
    // If we're expanding a card, fetch its details
    if (expandedCard !== id) {
      const details = await fetchLeaveDetailsById(id);
      console.log('Expanded Leave Details:', JSON.stringify(details, null, 2));
    }
    setExpandedCard(expandedCard === id ? null : id);
  };

  const fetchTaskAssignmentEmployees = async (filterEmployeeId = null) => {
    try {
      const companyId = user?.childCompanyId;
      const departmentId = leaveDetails?.departmentId;
      const requestEmployeeId = leaveDetails?.employeeId;

      if (!companyId) {
        console.log('Missing company ID, cannot fetch employees');
        return;
      }

      // First API call - Get employees by department
      const apiUrl = `${BASE_URL}/EmpRegistration/GetEmployeeByDepartmentId/${companyId}/${departmentId}`;
      console.log('Fetching employees from:', apiUrl);

      const response = await axios.get(apiUrl);

      if (!response.data || !Array.isArray(response.data)) {
        console.log('No employee data received or invalid format');
        return;
      }

      const employeesData = Array.isArray(response.data) ? response.data : [];

      console.log('=== EMPLOYEE DATA SUMMARY ===');
      console.log(`Total employees received: ${employeesData.length}`);
      console.log(`Request employee ID: ${requestEmployeeId}`);

      const employeeToFilter = employeesData.find(
        emp => emp.id === requestEmployeeId,
      );

      const filteredEmployees = employeesData.filter(
        employee => employee.id !== requestEmployeeId,
      );

      console.log(`=== FILTERING RESULTS ===`);
      console.log(
        `Filtered ${
          employeesData.length - filteredEmployees.length
        } employees, keeping ${filteredEmployees.length} for task assignment`,
      );

      if (employeeToFilter) {
        console.log('=== REMOVED EMPLOYEE ===');
        console.log(JSON.stringify(employeeToFilter, null, 2));
      }

      const employeeSummary = filteredEmployees.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        department: emp.departmentName,
        designation: emp.designationName,
      }));

      console.log('=== FILTERED EMPLOYEES SUMMARY ===');
      console.log(JSON.stringify(employeeSummary, null, 2));

      // Second API call - Get employees assigned to the same shift
      let shiftEmployeeIds = [];
      try {
        if (requestEmployeeId) {
          const shiftApiUrl = `${BASE_URL}/Shift/GetRotaAsignedEmployeeByEmployeeId/${requestEmployeeId}`;
          console.log('Fetching shift employees from:', shiftApiUrl);

          const shiftResponse = await axios.get(shiftApiUrl);

          if (shiftResponse.data && Array.isArray(shiftResponse.data)) {
            shiftEmployeeIds = shiftResponse.data;
            console.log('=== EMPLOYEES IN SAME SHIFT ===');
            console.log(JSON.stringify(shiftEmployeeIds, null, 2));
          }
        }
      } catch (shiftError) {
        console.error('Error fetching shift employees:', shiftError);
      }

      // Match shiftEmployeeIds with filteredEmployees
      let finalTaskAssignmentEmployees = filteredEmployees;

      if (shiftEmployeeIds.length > 0) {
        finalTaskAssignmentEmployees = filteredEmployees.filter(emp =>
          shiftEmployeeIds.includes(emp.id),
        );

        console.log('=== FINAL MATCHED EMPLOYEES ===');
        const finalSummary = finalTaskAssignmentEmployees.map(emp => ({
          id: emp.id,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          department: emp.departmentName,
          designation: emp.designationName,
        }));
        console.log(JSON.stringify(finalSummary, null, 2));
      }

      setTaskAssignmentEmployees(finalTaskAssignmentEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setTaskAssignmentEmployees([]);
      return null;
    }
  };

  // Add helper function to update task assignee (if not already added)
  const updateTaskAssignee = (leaveId, employeeId) => {
    if (!employeeId) return;

    const selectedEmployee = taskAssignmentEmployees.find(
      emp => emp.id === employeeId,
    );

    if (selectedEmployee) {
      console.log(
        `Setting task assignee for leave ID ${leaveId}:`,
        selectedEmployee,
      );

      setSelectedTaskAssignee(prev => ({
        ...prev,
        [leaveId]: {
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.employeeName,
          employeeCode: selectedEmployee.employeeId,
        },
      }));
    }
  };

  // Add validation function for leave counts
  const validateLeaveCounts = (
    itemId,
    approvedCount,
    unapprovedCount,
    totalLeaveNo,
  ) => {
    const approvedNum = Number(approvedCount) || 0;
    const unapprovedNum = Number(unapprovedCount) || 0;
    const totalCount = approvedNum + unapprovedNum;
    const totalLeave = Number(totalLeaveNo) || 0;

    let errors = {};

    // Validate that total is not more than requested leave days
    if (totalCount > totalLeave) {
      errors.total = `Total (${totalCount}) exceeds requested days (${totalLeave})`;
      errors.approved = true;
      errors.unapproved = true;
    }

    // Validate that approved and unapproved are not negative
    if (approvedNum < 0) {
      errors.approved = true;
      errors.approvedMsg = 'Cannot be negative';
    }

    if (unapprovedNum < 0) {
      errors.unapproved = true;
      errors.unapprovedMsg = 'Cannot be negative';
    }

    // Validate that the total is not zero
    if (totalCount === 0 && (approvedCount !== '' || unapprovedCount !== '')) {
      errors.total = 'Total leave days cannot be zero';
      errors.approved = approvedNum === 0;
      errors.unapproved = unapprovedNum === 0;
    }

    // Update errors state
    setLeaveCountErrors(prev => ({
      ...prev,
      [itemId]: errors,
    }));

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const renderItem = ({item}) => {
    const isExpanded = expandedCard === (item.id || item.applyLeaveId);
    const leaveType = item.leaveName || 'Leave';
    const leaveColor = LeaveTypeColors[leaveType] || '#6b7280';
    const itemId = item.id || item.applyLeaveId;
    const itemErrors = leaveCountErrors[itemId] || {};
    const remarkError = remarkErrors[itemId];

    return (
      <Card
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => toggleCardExpansion(itemId)}>
        <Card.Content>
          {/* Header with employee info and avatar */}
          <View style={styles.cardHeader}>
            <View style={styles.employeenamwee}>
              <Text style={styles.detailText}>
                {item.employeeName || 'Not specified'}
              </Text>

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
            </View>

            <View style={styles.detailItem}>
              <Icon
                name="briefcase"
                size={14}
                color="#6B7280"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                {item.designation || 'Not specified'}
              </Text>

              <View style={styles.detailItem}>
                <Icon
                  name="users"
                  size={14}
                  color="#6B7280"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>
                  {item.department || 'Not specified'}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={styles.sectionDivider} />
          {/* Date and duration info */}
          <View style={styles.dateOuterContainer}>
            <View style={styles.dateInnerContainer}>
              <View style={styles.dateFromToContainer}>
                <Card style={styles.dateCard}>
                  <Card.Content style={styles.dateCardContent}>
                    <Text style={styles.dateLabel}>From</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(item.fromLeaveDate)}
                    </Text>
                  </Card.Content>
                </Card>
                <View style={styles.dateArrow}>
                  <Icon name="arrow-right" size={18} color="#9ca3af" />
                </View>
                <Card style={styles.dateCard}>
                  <Card.Content style={styles.dateCardContent}>
                    <Text style={styles.dateLabel}>To</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(item.toLeaveDate)}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
              <View style={styles.daysContainer}>
                <Text style={styles.daysValue}>{item.leaveNo}</Text>
                <Text style={styles.daysLabel}>
                  {item.leaveNo > 1 ? 'Days' : 'Day'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.durationTypeContainer}>
            <View style={styles.detailItemcard}>
              <View style={styles.detailItemcardLeave}>
                <Icon
                  name="clock" // Better for Leave Type (duration)
                  size={18}
                  color="#6b7280"
                  style={styles.durationIcon}
                />
                <Text style={styles.durationText}>Leave Type:</Text>
                <Text style={styles.durationText}>
                  {item.leaveDuration || 'Full Day'}
                </Text>
              </View>
              <View style={styles.detailItemcardLeave}>
                <Icon
                  name="calendar" // 📅 better for "Leave Type"
                  size={16}
                  color="#6b7280"
                  style={styles.durationIcon}
                />
                <Text style={styles.durationText}>Leave :</Text>
                <Text style={styles.durationText}>
                  {item.leaveName || 'Full Day'}
                </Text>
              </View>
            </View>
            <View style={styles.detailItemcardLeave}>
              <Icon
                name="message-circle" // 📅 better for "Leave Type"
                size={16}
                color="#6b7280"
                style={styles.durationIcon}
              />
              <Text style={styles.durationText}>Reason :</Text>
              <Text style={styles.durationText}>
                {item.remarks || 'No reason '}
              </Text>
              {/* Add right side dropdown arrow icon */}
              <Icon
                name="chevron-down"
                size={18}
                color="#6b7280"
                style={{marginLeft: 8, position: 'absolute', right: 0, top: 0}}
              />
            </View>
          </View>

          {/* Expanded section */}
          {isExpanded && (
            <View style={styles.expandedSection}>
              <Divider style={styles.divider} />

              {/* Document section */}
              {item.documentPath ? (
                <View style={styles.sectionContainer}>
                  <Subheading style={styles.sectionTitle}>
                    Supporting Document
                  </Subheading>
                  <PaperButton
                    icon="file-document"
                    mode="outlined"
                    onPress={() => Linking.openURL(item.documentPath)}
                    style={styles.documentButton}>
                    View document
                  </PaperButton>
                </View>
              ) : null}

              {/* Assignment Employee Department if available */}
              {item.assignmentEmpDepartment && (
                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>
                      Assigned Employee Department
                    </Subheading>
                    <Text style={styles.infoText}>
                      {item.assignmentEmpDepartment}
                    </Text>
                  </Card.Content>
                </Card>
              )}

              {isAuthorizedForFinalApproval && leaveDetails && (
                <>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderRow2}>
                      <Icon
                        name="message-square"
                        size={18}
                        color="#4B5563"
                        style={styles.cardIcon}
                      />
                      <Text style={styles.cardHeaderText}>RM Remarks :</Text>
                    </View>

                    <Text style={styles.remarksText}>
                      {leaveDetails.reportingRemarks?.trim() || 'No remarks'}
                    </Text>
                  </View>

                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderRow2}>
                      <Icon
                        name="calendar"
                        size={18}
                        color="#4B5563"
                        style={styles.cardIcon}
                      />
                      <Text style={styles.cardHeaderText}>
                        Leave Balances :
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setLeaveBalanceModalVisible(true)}
                      style={styles.viewButton}>
                      <Icon
                        name="eye"
                        size={16}
                        color="#3b82f6"
                        style={styles.buttonIcon}
                      />
                      <Text
                        style={{
                          color: '#3b82f6',
                          fontWeight: '500',
                          fontSize: 14,
                        }}>
                        View Balance
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Assignment Employee Designation if available */}
              {item.assignmentEmpDesignation && (
                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>
                      Assigned Employee Designation
                    </Subheading>
                    <Text style={styles.infoText}>
                      {item.assignmentEmpDesignation}
                    </Text>
                  </Card.Content>
                </Card>
              )}

              {/* Leave approval fields - Only show approved and unapproved fields to HR/Final Approvers */}
              {isAuthorizedForFinalApproval && (
                <Card style={styles.infoCard}>
                  <Card.Content>
                    <View style={styles.leaveCountContainer}>
                      {/* How many days approved? */}
                      <View style={styles.leaveCountField}>
                        <Subheading style={styles.sectionTitle}>
                          Approve Leave
                        </Subheading>
                        <TextInput
                          style={[
                            styles.enhancedTextInput,
                            itemErrors.approved && styles.inputError,
                          ]}
                          placeholder="Enter approved days"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={
                            approvedLeaveCount[itemId]
                              ? approvedLeaveCount[itemId].toString()
                              : item.leaveNo?.toString() || '0'
                          }
                          onChangeText={text => {
                            const val = text.replace(/[^0-9-]/g, '');
                            setApprovedLeaveCount(prev => ({
                              ...prev,
                              [itemId]: val,
                            }));

                            // Validate as user types
                            validateLeaveCounts(
                              itemId,
                              val,
                              unapprovedLeaveCount[itemId] || '0',
                              item.leaveNo,
                            );
                          }}
                          mode="outlined"
                          theme={{colors: {primary: '#3b82f6'}}}
                        />
                        {itemErrors.approvedMsg && (
                          <Text style={styles.errorText}>
                            {itemErrors.approvedMsg}
                          </Text>
                        )}
                      </View>

                      {/* How many days unapproved? */}
                      <View style={styles.leaveCountField}>
                        <Subheading style={styles.sectionTitle}>
                          Unapprove Leave
                        </Subheading>
                        <TextInput
                          style={[
                            styles.enhancedTextInput,
                            itemErrors.unapproved && styles.inputError,
                          ]}
                          placeholder="Enter unapproved days"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={
                            unapprovedLeaveCount[itemId]
                              ? unapprovedLeaveCount[itemId].toString()
                              : '0'
                          }
                          onChangeText={text => {
                            const val = text.replace(/[^0-9-]/g, '');
                            setUnapprovedLeaveCount(prev => ({
                              ...prev,
                              [itemId]: val,
                            }));

                            // Validate as user types
                            validateLeaveCounts(
                              itemId,
                              approvedLeaveCount[itemId] ||
                                item.leaveNo?.toString() ||
                                '0',
                              val,
                              item.leaveNo,
                            );
                          }}
                          mode="outlined"
                          theme={{colors: {primary: '#3b82f6'}}}
                        />
                        {itemErrors.unapprovedMsg && (
                          <Text style={styles.errorText}>
                            {itemErrors.unapprovedMsg}
                          </Text>
                        )}
                      </View>
                    </View>
                    {/* Custom validation message for sum exceeding applied leave */}
                    {Number(approvedLeaveCount[itemId] || 0) + Number(unapprovedLeaveCount[itemId] || 0) > Number(item.leaveNo || 0) && (
                      <Text style={styles.errorText}>
                        Approve leave or unapprove leave leave no should not be greater than applied Leave no. Kindly review and adjust your request.
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              )}

              <Card style={styles.infoCard}>
                <Card.Content>
                  <Subheading style={styles.sectionTitle}>
                    Task Assignment
                  </Subheading>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={
                        selectedTaskAssignee[itemId]?.employeeId || null
                      }
                      style={styles.picker}
                      dropdownIconColor="#4B5563"
                      onValueChange={itemValue =>
                        updateTaskAssignee(itemId, itemValue)
                      }>
                      {/* Default placeholder */}
                      <Picker.Item
                        label={
                          taskAssignmentEmployees.length === 0
                            ? 'No data found'
                            : 'Select employee'
                        }
                        value={null}
                        style={styles.pickerPlaceholder}
                      />

                      {/* Show employee list only if available */}
                      {taskAssignmentEmployees.length > 0 &&
                        taskAssignmentEmployees.map(employee => (
                          <Picker.Item
                            key={employee.id}
                            label={`${employee.employeeName} (${
                              employee.employeeId || 'N/A'
                            })`}
                            value={employee.id}
                            style={styles.pickerItem}
                          />
                        ))}
                    </Picker>
                  </View>

                  {/* Display selected employee info */}
                  {selectedTaskAssignee[itemId] && (
                    <Chip
                      icon="account-check"
                      style={styles.taskAssigneeSelected}>
                      Task assigned to:{' '}
                      {selectedTaskAssignee[itemId].employeeName}
                    </Chip>
                  )}
                </Card.Content>
              </Card>

              <Card style={styles.infoCard}>
                <Card.Content>
                  <View style={styles.remarksHeaderContainer}>
                    <Subheading style={styles.sectionTitle}>
                      {isAuthorizedForFinalApproval
                        ? 'Final Remark'
                        : 'RM Remark'}
                      <Text style={styles.requiredField}>*</Text>
                      <Text style={styles.maxCharText}>
                        {' '}
                        (max 400 characters)
                      </Text>
                    </Subheading>
                  </View>

                  <TextInput
                    style={[
                      styles.remarksInput,
                      remarkError && styles.inputError,
                    ]}
                    placeholder={`Write ${
                      isAuthorizedForFinalApproval
                        ? 'final remarks '
                        : 'remarks'
                    } `}
                    placeholderTextColor="#9ca3af"
                    maxLength={400}
                    multiline
                    value={rmRemarks[itemId] || ''}
                    onChangeText={text => {
                      setRmRemarks(prev => ({
                        ...prev,
                        [itemId]: text,
                      }));
                      if (text.trim()) {
                        setRemarkErrors(prev => ({
                          ...prev,
                          [itemId]: null,
                        }));
                      }
                    }}
                    mode="outlined"
                    theme={{colors: {primary: '#3b82f6'}}}
                    numberOfLines={4}
                  />

                  {remarkError && (
                    <Text style={styles.errorText}>{remarkError}</Text>
                  )}
                </Card.Content>
              </Card>

              {/* Task Assignment Dropdown - Fixed to show for any non-HR approver */}
              {/* {!isAuthorizedForFinalApproval && (
                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>
                      Task Assignment
                    </Subheading>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={
                          selectedTaskAssignee[itemId]?.employeeId || null
                        }
                        style={styles.picker}
                        dropdownIconColor="#4B5563"
                        onValueChange={itemValue =>
                          updateTaskAssignee(itemId, itemValue)
                        }>
                        
                        <Picker.Item
                          label={
                            taskAssignmentEmployees.length === 0
                              ? 'No data found'
                              : 'Select employee'
                          }
                          value={null}
                          style={styles.pickerPlaceholder}
                        />

                     
                        {taskAssignmentEmployees.length > 0 &&
                          taskAssignmentEmployees.map(employee => (
                            <Picker.Item
                              key={employee.id}
                              label={`${employee.employeeName} (${
                                employee.employeeId || 'N/A'
                              })`}
                              value={employee.id}
                              style={styles.pickerItem}
                            />
                          ))}
                      </Picker>
                    </View>

                
                    {selectedTaskAssignee[itemId] && (
                      <Chip
                        icon="account-check"
                        style={styles.taskAssigneeSelected}>
                        Task assigned to:{' '}
                        {selectedTaskAssignee[itemId].employeeName}
                      </Chip>
                    )}
                  </Card.Content>
                </Card>
              )} */}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <PaperButton
                  mode="contained"
                  icon="check-circle"
                  style={[styles.button, styles.approveButton]}
                  labelStyle={styles.buttonText}
                  onPress={() => handleApprove(item.id || item.applyLeaveId)}>
                  {isAuthorizedForFinalApproval ? 'Final Approve' : 'Approve'}
                </PaperButton>
                <PaperButton
                  mode="contained"
                  icon="close-circle"
                  style={[styles.button, styles.rejectButton]}
                  labelStyle={styles.buttonText}
                  onPress={() => handleReject(item.id || item.applyLeaveId)}>
                  Reject
                </PaperButton>
              </View>
            </View>
          )}
        </Card.Content>
        <View />
      </Card>
    );
  };

  const LeaveBalanceModal = () => (
    <Modal
      visible={leaveBalanceModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setLeaveBalanceModalVisible(false)}>
      <View style={styles.modalContainer}>
     
        {/* centers content */}
        <View style={styles.modalPopup}>
         
          {/* styled popup */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Leave Balance Details</Text>
            <TouchableOpacity
              onPress={() => setLeaveBalanceModalVisible(false)}>
              <Icon name="x" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            <LeaveBalanceTable
              leaveData={leaveData}
              isLoadingLeaveData={isLoadingLeaveData}
            />
          </ScrollView>
          <PaperButton
            mode="contained"
            onPress={() => setLeaveBalanceModalVisible(false)}
            style={styles.closeModalButton}>
            Close
          </PaperButton>
        </View>
      </View>
    </Modal>
  );

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Employee's Leave Request"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Pending Requests Card - Updated to show actual count */}
      {pendingRequestsCount > 0 && (
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
      )}

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={paginatedData}
        keyExtractor={item =>
          item.id?.toString() ||
          item.applyLeaveId?.toString() ||
          Math.random().toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <>
            {/* Debug pagination visibility */}
            {console.log(
              'Pagination debug - List length:',
              approvalList.length,
              'Should show pagination:',
              approvalList.length >= 3,
            )}

            {/* Only show pagination when there are 3 or more items */}
            {approvalList.length >= 3 && (
              <View style={styles.paginationContainer}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(approvalList.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={approvalList.length}
                />
              </View>
            )}
          </>
        )}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContainer}>
              <Icon name="inbox" size={60} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                No pending exit requests found
              </Text>
            </Card.Content>
          </Card>
        }
      />

      {/* Add the modal to the root of the component */}
      <LeaveBalanceModal />

      {/* Add the feedback modal */}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={hideFeedbackModal}
        type={feedbackModalType}
        message={feedbackModalMessage}
      />
    </AppSafeArea>
  );
};

export default LeaveRequest;

const styles = StyleSheet.create({
  headerGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedCard: {
    elevation: 5,
    shadowOpacity: 0.15,
  },
  cardHeader: {
    marginBottom: 8,
  },
  employeeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#3b82f6',
    marginRight: 12,
  },
  // employeeTextInfo: {
  //   flex: 1,
  // },
  employeeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  employeenamwee: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailItemcard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailItemcard1: {
    // backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  detailItemcardLeave: {
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '700',
    marginRight: 10,
  },
  requiredField: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveTypeChip: {
    borderRadius: 16,
    height: 36,
  },
  sectionDivider: {
    marginVertical: 10,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  dateOuterContainer: {
    marginBottom: 12,
  },
  dateInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFromToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateCard: {
    flex: 1,
    elevation: 1,
    backgroundColor: '#F9FAFB',
  },
  dateCardContent: {
    padding: 10,
  },
  dateArrow: {
    marginHorizontal: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  daysContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginLeft: 12,
    minWidth: 60,
  },
  daysValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  daysLabel: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  durationTypeContainer: {
    marginTop: 8,
  },
  durationIcon: {
    marginRight: 6,
    color: '#6B7280',
    size: 16,
  },
  durationText: {
    color: '#4B5563',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 4,
  },
  remarksCard: {
    marginVertical: 8,
    backgroundColor: '#F9FAFB',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  remarksSection: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    marginLeft: 8,
  },
  remarksLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  remarksValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 20,
    marginLeft: 8,
    fontWeight: '500',
  },
  statusSection: {
    marginBottom: 8,
  },
  statusBadgeContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  expandedSection: {
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  documentButton: {
    borderColor: '#3b82f6',
    borderRadius: 8,
  },
  infoCard: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  enhancedTextInput: {
    backgroundColor: '#F9FAFB',
  },
  remarksInput: {
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    // marginTop: 16,
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    paddingVertical: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingAlertCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
    elevation: 0,
  },
  pendingAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pendingAlertCountSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  emptyCard: {
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  reportingRemarksSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 54,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  taskAssigneeSelected: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },

  // Styles for Leave Balance Table
  leaveBalanceTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  leaveTypeColumn: {
    flex: 2,
    paddingRight: 5,
  },
  leaveDataColumn: {
    flex: 1,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 150, // Limit the height of the table
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 14,
    color: '#111827',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  // Add these new styles for validation
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  totalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  totalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  leaveCountContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  leaveCountField: {
    flex: 1,
  },
  // Add a dedicated style for the pagination container
  paginationContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  totalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  leaveCountContainer: {
    flexDirection: 'row',
    gap: 12,
    color: '#f59e0b', // amber-500
    fontWeight: 'bold',
  },
  statusApprovedBadge: {
    backgroundColor: '#d1fae5', // Emerald 100
    borderColor: '#10b981', // Emerald 600
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusRejectedBadge: {
    backgroundColor: '#fee2e2', // Rose 100
    borderColor: '#ef4444', // Rose 600
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendingBadge: {
    backgroundColor: '#fffbeb', // Amber 50
    borderColor: '#f59e0b', // Amber 600
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApprovedText: {
    color: '#10b981',
    fontWeight: '500',
  },
  statusRejectedText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  statusPendingText: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  // New styles for Leave Balance Details Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
  },

  modalPopup: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  closeModalButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },

  cardIcon: {
    marginRight: 8,
    alignSelf: 'center',
    color: '#4B5563',
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B5563',
    marginLeft: 4,
  },

  remarksText: {
    color: '#4B5563', // Final chosen color
    marginLeft: 8,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 8,
    fontWeight: '800', // Final chosen weight
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 4,
    alignSelf: 'center',
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginLeft: 8,
  },
  rmRemarksContent: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rmRemarksText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  noRemarksText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardHeaderRow: {
    flexDirection: 'row',

    marginBottom: 8,
  },
  cardHeaderRow2: {
    marginBottom: 8,
    flexDirection: 'row',
    paddingLeft: 8,
    alignItems: 'center',
  },
  // Add this to your existing styles object at the bottom of the file
  cardIcon: {
    marginRight: 8,
    alignSelf: 'center',
    color: '#4B5563',
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B5563',
    marginLeft: 4,
  },

  remarksText: {
    color: '#4B5563', // Final chosen color
    marginLeft: 8,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 8,
    fontWeight: '800', // Final chosen weight
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 4,
    alignSelf: 'center',
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginLeft: 8,
  },
});
