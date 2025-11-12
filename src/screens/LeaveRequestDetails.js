import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
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
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import FeedbackModal from '../component/FeedbackModal';
import styles from '../Stylesheet/LeaveRequestDetails';
import {useAuth} from '../constants/AuthContext';
import Pagination from '../component/Pagination';
import {Picker} from '@react-native-picker/picker';
import LeaveBalanceTable from '../component/LeaveBalanceTable';
import CustomHeader from '../component/CustomHeader';
import ScrollAwareContainer from '../component/ScrollAwareContainer';

const LeaveTypeColors = {
  'Casual Leave': '#3b82f6', // Blue
  'Sick Leave': '#ef4444', // Red
  'Paid Leave': '#10b981', // Green
};

const LeaveRequestDetails = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  // Remove the hardcoded apiUrl, use BASE_URL instead

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
      // Remove fetchTaskAssignmentEmployees() from here since it depends on leaveDetails
    }
  }, [employeeDetails]);

  // Optimize pagination updates with useMemo
  const paginatedItems = useMemo(() => {
    if (!Array.isArray(approvalList) || approvalList.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return approvalList.slice(startIndex, endIndex);
  }, [approvalList, currentPage, itemsPerPage]);

  // Update paginated data only when needed
  useEffect(() => {
    console.log('=== PAGINATION UPDATE ===');
    console.log('Paginated items length:', paginatedItems.length);
    console.log('Paginated items:', paginatedItems.map(item => ({
      id: item.id || item.applyLeaveId,
      employeeName: item.employeeName
    })));
    setPaginatedData(paginatedItems);
  }, [paginatedItems]);

  // Remove the separate pagination update useEffect and updatePaginatedData function

  // Memoize total pages calculation
  const totalPages = useMemo(() => {
    return Math.ceil(approvalList.length / itemsPerPage);
  }, [approvalList.length, itemsPerPage]);

  // Memoize whether to show pagination
  const shouldShowPagination = useMemo(() => {
    return approvalList.length > itemsPerPage; // Changed from >= 3 to > itemsPerPage for better logic
  }, [approvalList.length, itemsPerPage]);

  // Add another useEffect to initialize approvedLeaveCount and unapprovedLeaveCount when approvalList changes
  useEffect(() => {
    console.log('=== APPROVAL LIST CHANGE EFFECT ===');
    console.log('Approval list length:', approvalList.length);
    console.log('Approval list items:', approvalList.map(item => ({
      id: item.id || item.applyLeaveId,
      employeeName: item.employeeName,
      status: item.status
    })));
    
    if (Array.isArray(approvalList) && approvalList.length > 0) {
      const initialCounts = {};
      const initialUnapprovedCounts = {};

      approvalList.forEach(item => {
        const id = item.id || item.applyLeaveId;
        initialCounts[id] = item.leaveNo || 0;
        initialUnapprovedCounts[id] = 0;
      });

      setApprovedLeaveCount(initialCounts);
      setUnapprovedLeaveCount(initialUnapprovedCounts);
      setCurrentPage(1);
    }
  }, [approvalList]);

  // Handle page change
  const handlePageChange = newPage => {
    console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
  };

  const fetchLeaveApprovalData = async () => {
    console.log('=== FETCH LEAVE APPROVAL DATA START ===');
    const accessData = await fetchFunctionalAccessMenus();
    setLeaveApprovalAccess(accessData);
    console.log('Leave approval access data set:', accessData);

    const userType = user?.userType;
    const employeeId = user?.id;
    const companyId = user?.childCompanyId;
    console.log('User context:', { userType, employeeId, companyId });
    
    let hasAccess = false;

    if (Array.isArray(accessData)) {
      hasAccess = accessData.some(
        item => item.employeeId === employeeId || userType === 2,
      );
    }
    console.log('Has access:', hasAccess);

    let ApprovalList;
    try {
      let apiUrl = '';
      if (hasAccess) {
        apiUrl = `${BASE_URL}/ApplyLeave/GetLeaveListForFinalApproval/${companyId}/${employeeId}`;
      } else {
        apiUrl = `${BASE_URL}/ApplyLeave/GetApplyLeaveListForApproval/${companyId}/${employeeId}`;
      }
      console.log('API URL:', apiUrl);
      
      ApprovalList = await axiosinstance.get(apiUrl);
      console.log('Raw API response:', JSON.stringify(ApprovalList.data, null, 2));
      console.log('Raw approval list length:', ApprovalList.data?.length || 0);
      
      // Filter out current user's requests
      const beforeFilter = ApprovalList.data || [];
      ApprovalList.data = beforeFilter.filter(
        item => item.employeeId != employeeDetails?.id,
      );
      
      console.log('After filtering current user:', {
        beforeFilter: beforeFilter.length,
        afterFilter: ApprovalList.data.length,
        currentEmployeeId: employeeDetails?.id,
        filteredItems: ApprovalList.data.map(item => ({
          id: item.id || item.applyLeaveId,
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          status: item.status
        }))
      });

      // Get the pending request count
      if (Array.isArray(ApprovalList.data)) {
        setPendingRequestsCount(ApprovalList.data.length);
        console.log('Setting pending requests count to:', ApprovalList.data.length);
      }

    } catch (err) {
      console.error('Error fetching leave list:', err);
      console.error('Error details:', err.response?.data || err.message);
    }

    let roleurl = '';
    roleurl = `${BASE_URL}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
    const response = await axiosinstance.get(roleurl);
    let roleData = null;
    console.log('Role Details response:', response.data);

    // Check if current user is authorized for final approval
    if (Array.isArray(response.data)) {
      const isAuthorized = response.data.some(
        role => role.employeeId === employeeDetails?.id,
      );
      setIsAuthorizedForFinalApproval(isAuthorized);
      console.log('Is authorized for final approval:', isAuthorized);

      const isManager = hasAccess && !isAuthorized;
      setIsReportingManager(isManager);
      console.log('Is reporting manager:', isManager);

      roleData =
        response.data.find(item => item.employeeId === employeeDetails?.id) ||
        response.data[0] ||
        null;
    }
    console.log('Role Data:', roleData);

    if (roleData?.branchId != 0) {
      const beforeBranchFilter = ApprovalList.data || [];
      ApprovalList.data = beforeBranchFilter.filter(
        item => item.branchId === roleData.branchId,
      );
      console.log('After branch filtering:', {
        beforeBranchFilter: beforeBranchFilter.length,
        afterBranchFilter: ApprovalList.data?.length || 0,
        branchId: roleData.branchId
      });
    }

    const finalApprovalList = Array.isArray(ApprovalList.data) ? ApprovalList.data : [];
    console.log('=== FINAL APPROVAL LIST ===');
    console.log('Final list length:', finalApprovalList.length);
    console.log('Final list items:', finalApprovalList.map(item => ({
      id: item.id || item.applyLeaveId,
      employeeName: item.employeeName,
      status: item.status,
      fromDate: item.fromLeaveDate,
      toDate: item.toLeaveDate
    })));
    
    setApprovalList(finalApprovalList);
    console.log('=== FETCH LEAVE APPROVAL DATA END ===');
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

      const response = await axiosinstance.post(
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

  // === Date Sanitization Helper ===
  const sanitizeDate = date => {
    if (!date || date === '0001-01-01T00:00:00') return null;

    const parsed = new Date(date);
    // Check if it's invalid or before SQL min date
    if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1753) return null;

    return parsed.toISOString();
  };

  const handleFinalApproval = async leaveDetails => {
    try {
      setLoading(true);

      // ✅ Step 1: Sanitize all payload fields
      const sanitizedPayload = {
        CompanyId: leaveDetails.CompanyId ?? user?.childCompanyId ?? 1,
        Id: leaveDetails.Id ?? leaveDetails.EmployeeId,
        Visible: leaveDetails.Visible ?? false,
        EmployeeId: leaveDetails.EmployeeId,
        ReportingId: leaveDetails.ReportingId ?? user?.id,
        DocumentPath: leaveDetails.DocumentPath ?? '',
        EmployeeEmail: leaveDetails.EmployeeEmail ?? '',
        ApplyLeaveId: leaveDetails.ApplyLeaveId ?? 0,
        DepartmentId: leaveDetails.DepartmentId ?? 0,
        ReportingMgerEmail:
          leaveDetails.ReportingMgerEmail ?? user?.email ?? '',
        ReportTaskEmail:
          leaveDetails.ReportTaskEmail ?? leaveDetails.EmployeeEmail,
        ToLeaveDate: leaveDetails.ToLeaveDate ?? new Date().toISOString(),
        FromLeaveDate: leaveDetails.FromLeaveDate ?? new Date().toISOString(),
        EmployeeName: leaveDetails.EmployeeName ?? '',
        EmployeeCode: leaveDetails.EmployeeCode ?? '',
        Designation: leaveDetails.Designation ?? '',
        Department: leaveDetails.Department ?? '',
        Remarks: leaveDetails.Remarks ?? 'Approved by Manager',
        LeaveNo: leaveDetails.LeaveNo ?? 1,
        ApprovedPaidLeave: leaveDetails.ApprovedPaidLeave ?? 0,
        ApprovedUnpaidLeave: leaveDetails.ApprovedUnpaidLeave ?? 0,
        ApprovalStatus: leaveDetails.ApprovalStatus ?? 1,
        taskAssignmentEmpId:
          leaveDetails.taskAssignmentEmpId ?? leaveDetails.ReportingId ?? 0,
        taskAssignEmployeeCode: leaveDetails.taskAssignEmployeeCode ?? '',
        ReportingRemarks:
          leaveDetails.ReportingRemarks ?? leaveDetails.Remarks ?? '',
        leaveType: leaveDetails.leaveType ?? 1,
        status: leaveDetails.status ?? 'Approved',
        flag: leaveDetails.flag ?? 1,
        isDelete: 0,
        createdBy: leaveDetails.createdBy ?? user?.id ?? 0,
        createdDate: new Date().toISOString(),
        modifiedBy: leaveDetails.modifiedBy ?? user?.id ?? 0,
        modifiedDate: new Date().toISOString(),
      };

      console.log('✅ Sanitized Approval Payload:', sanitizedPayload);

      // ✅ Step 2: Submit to backend using axiosinstance and BASE_URL
      const endpoint = `${BASE_URL}/LeaveApproval/SaveLeaveFinalApproval`;
      const response = await axiosinstance.post(endpoint, sanitizedPayload);

      console.log('🛰️ Final approval payload sent to:', endpoint);
      console.log('📦 Backend Response:', response.data);

      // ✅ Step 3: Handle response
      if (response.data?.isSuccess) {
        showFeedbackModal('success', 'Leave Approved Successfully!');

        // Clear form data and refresh
        setExpandedCard(null);
        await fetchLeaveApprovalData();
      } else {
        showFeedbackModal(
          'fail',
          response.data?.message ||
            'Failed to approve leave. Please try again.',
        );
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      showFeedbackModal(
        'fail',
        error.message || 'Something went wrong while approving leave.',
      );
    } finally {
      setLoading(false);
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

      const rejectionRes = await axiosinstance.post(endpoint, rejectPayload);
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

      const response = await axiosinstance.get(apiUrl);

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

      const response = await axiosinstance.get(
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

  // Optimize fetchTaskAssignmentEmployees with better caching
  const fetchTaskAssignmentEmployees = useCallback(
    async (departmentId = null, requestEmployeeId = null) => {
      try {
        const companyId = user?.childCompanyId;

        // Use provided parameters or fall back to leaveDetails
        const finalDepartmentId = departmentId || leaveDetails?.departmentId;
        const finalRequestEmployeeId =
          requestEmployeeId || leaveDetails?.employeeId;

        if (!companyId || !finalDepartmentId || !finalRequestEmployeeId) {
          console.log('Missing required parameters for fetching employees');
          setTaskAssignmentEmployees([]);
          return;
        }

        // Check if we already have data for this employee to avoid duplicate calls
        const cacheKey = `${finalDepartmentId}-${finalRequestEmployeeId}`;
        if (
          taskAssignmentEmployees.length > 0 &&
          taskAssignmentEmployees[0]?.cacheKey === cacheKey
        ) {
          console.log('Using cached task assignment employees');
          return;
        }

        // First API call - Get employees by department
        const apiUrl = `${BASE_URL}/EmpRegistration/GetEmployeeByDepartmentId/${companyId}/${finalDepartmentId}`;

        const response = await axiosinstance.get(apiUrl);

        if (!response.data || !Array.isArray(response.data)) {
          setTaskAssignmentEmployees([]);
          return;
        }

        const employeesData = response.data;
        const filteredEmployees = employeesData.filter(
          employee => employee.id !== finalRequestEmployeeId,
        );

        // Second API call - Get employees assigned to the same shift
        let finalTaskAssignmentEmployees = filteredEmployees;

        try {
          const shiftApiUrl = `${BASE_URL}/Shift/GetRotaAsignedEmployeeByEmployeeId/${finalRequestEmployeeId}`;
          const shiftResponse = await axiosinstance.get(shiftApiUrl);

          if (shiftResponse.data && Array.isArray(shiftResponse.data)) {
            const shiftEmployeeIds = shiftResponse.data;

            if (shiftEmployeeIds.length > 0) {
              finalTaskAssignmentEmployees = filteredEmployees.filter(emp =>
                shiftEmployeeIds.includes(emp.id),
              );
            }
          }
        } catch (shiftError) {
          console.error('Error fetching shift employees:', shiftError);
          // Continue with all department employees if shift fetch fails
        }

        // Add cache key to prevent duplicate calls
        const employeesWithCache = finalTaskAssignmentEmployees.map(emp => ({
          ...emp,
          cacheKey,
        }));

        setTaskAssignmentEmployees(employeesWithCache);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setTaskAssignmentEmployees([]);
      }
    },
    [
      user?.childCompanyId,
      leaveDetails?.departmentId,
      leaveDetails?.employeeId,
      taskAssignmentEmployees.length,
    ],
  );

  // Optimize toggleCardExpansion
  const toggleCardExpansion = useCallback(
    async id => {
      if (expandedCard === id) {
        setExpandedCard(null);
        return;
      }

      // Fetch details and task assignment employees when expanding
      const details = await fetchLeaveDetailsById(id);
      if (details) {
        setExpandedCard(id);

        // Fetch task assignment employees after we have leave details
        if (details.departmentId && details.employeeId) {
          await fetchTaskAssignmentEmployees(
            details.departmentId,
            details.employeeId,
          );
        }
      }
    },
    [expandedCard, fetchTaskAssignmentEmployees],
  );

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
                    {Number(approvedLeaveCount[itemId] || 0) +
                      Number(unapprovedLeaveCount[itemId] || 0) >
                      Number(item.leaveNo || 0) && (
                      <Text style={styles.errorText}>
                        Approve leave or unapprove leave leave no should not be
                        greater than applied Leave no. Kindly review and adjust
                        your request.
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

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <PaperButton
                  mode="contained"
                  icon="check-circle"
                  labelStyle={styles.buttonText}
                  style={[styles.button, styles.approveButton]}
                  disabled={loading}
                  onPress={() => {
                    const currentLeaveDetails = {
                      CompanyId:
                        leaveDetails?.companyId || user?.childCompanyId || 1,
                      Id: leaveDetails?.id || itemId,
                      EmployeeId: leaveDetails?.employeeId || item.employeeId,
                      ReportingId: leaveDetails?.reportingId || user?.id,
                      EmployeeEmail:
                        leaveDetails?.employeeEmail || item.employeeEmail || '',
                      ReportingMgerEmail:
                        leaveDetails?.reportingMgerEmail || user?.email || '',
                      DepartmentId:
                        leaveDetails?.departmentId || item.departmentId,
                      ApplyLeaveId: leaveDetails?.applyLeaveId || itemId,
                      ToLeaveDate:
                        leaveDetails?.toLeaveDate || item.toLeaveDate,
                      FromLeaveDate:
                        leaveDetails?.fromLeaveDate || item.fromLeaveDate,
                      EmployeeName:
                        leaveDetails?.employeeName || item.employeeName,
                      EmployeeCode:
                        leaveDetails?.employeeCode || item.employeeCode,
                      Designation:
                        leaveDetails?.designation || item.designation,
                      Department: leaveDetails?.department || item.department,
                      Remarks:
                        rmRemarks[itemId] ||
                        leaveDetails?.remarks ||
                        item.remarks ||
                        '',
                      LeaveNo: leaveDetails?.leaveNo || item.leaveNo || 1,
                      ApprovedPaidLeave:
                        Number(approvedLeaveCount[itemId]) ||
                        Number(item.leaveNo) ||
                        1,
                      ApprovedUnpaidLeave:
                        Number(unapprovedLeaveCount[itemId]) || 0,
                      ApprovalStatus: 1,
                      taskAssignmentEmpId:
                        selectedTaskAssignee[itemId]?.employeeId ||
                        leaveDetails?.taskAssignmentEmpId ||
                        0,
                      taskAssignEmployeeCode:
                        selectedTaskAssignee[itemId]?.employeeCode ||
                        leaveDetails?.taskAssignEmployeeCode ||
                        '',
                      ReportingRemarks:
                        rmRemarks[itemId] || 'Approved by manager',
                      leaveType: leaveDetails?.leaveType || 1,
                      status: 'Approved',
                      flag: 1,
                    };

                    handleFinalApproval(currentLeaveDetails);
                  }}>
                  {loading ? 'Processing...' : 'Final Approve'}
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
      <CustomHeader title="Employee's Leave Request" navigation={navigation} />

      <ScrollAwareContainer navigation={navigation} currentRoute="LeaveRequestDetails">
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
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingAlertCountSmall}>
                  {pendingRequestsCount} Pending Request
                  {pendingRequestsCount !== 1 ? 's' : ''}
                </Text>
              </View>
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
              {/* Only show pagination when needed */}
              {shouldShowPagination && (
                <View style={styles.paginationContainer}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
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
                  No pending leave requests found
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
                  Debug: Approval list has {approvalList.length} items, 
                  Paginated data has {paginatedData.length} items
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
      </ScrollAwareContainer>
    </AppSafeArea>
  );
};

export default LeaveRequestDetails;
