import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AppSafeArea from '../component/AppSafeArea';
import {Appbar, Avatar, Chip, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';
import { useAuth } from '../constants/AuthContext';
// Import the Pagination component
import Pagination from '../components/Pagination';
// Import Picker for task assignment dropdown
import {Picker} from '@react-native-picker/picker';

const LeaveTypeColors = {
  'Casual Leave': '#3b82f6', // Blue
  'Sick Leave': '#ef4444', // Red
  'Paid Leave': '#10b981', // Green
};

const LeaveRequest = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const {user} = useAuth();

  console.log('First ======================================', user);
  console.log('Employee Details:', employeeDetails);
  const [leaveApprovalAccess, setLeaveApprovalAccess] = useState(null);
  const [approvalList, setApprovalList] = useState([]); // State to hold the approval list
  const [approveLeaveId, setapproveLeaveId] = useState(null); // State to hold the applyLeaveId
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [isAuthorizedForFinalApproval, setIsAuthorizedForFinalApproval] = useState(false);
  // Add state for pending requests count
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items to display per page
  const [paginatedData, setPaginatedData] = useState([]);

  // Add state for task assignment
  const [taskAssignmentEmployees, setTaskAssignmentEmployees] = useState([]);
  const [selectedTaskAssignee, setSelectedTaskAssignee] = useState({});

  useEffect(() => {
    if (employeeDetails) {
      fetchLeaveApprovalData();
      fetchTaskAssignmentEmployees(); // Fetch employees for task assignment
    }
  }, [employeeDetails]);

  // Add another useEffect to initialize approvedLeaveCount when approvalList changes
  useEffect(() => {
    if (Array.isArray(approvalList) && approvalList.length > 0) {
      // Initialize approvedLeaveCount with tfetchLeaveDetailsByIdhe requested leave days from each request
      const initialCounts = {};
      approvalList.forEach(item => {
        const id = item.id || item.applyLeaveId;
        initialCounts[id] = item.leaveNo || 0;
      });
      setApprovedLeaveCount(initialCounts);
      
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
    
    console.log(`Paginating: Page ${page}, showing items ${startIndex + 1}-${Math.min(endIndex, data.length)} of ${data.length}`);
    
    setPaginatedData(paginatedItems);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
  };

  const fetchLeaveApprovalData = async () => {
    const accessData = await fetchFunctionalAccessMenus();
    setLeaveApprovalAccess(accessData);
    console.log('Leave approval access data set:', accessData);

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
        apiUrl = `${BASE_URL_PROD}/ApplyLeave/GetLeaveListForFinalApproval/${companyId}/${employeeId}`;
      } else {
        apiUrl = `${BASE_URL_PROD}/ApplyLeave/GetApplyLeaveListForApproval/${companyId}/${employeeId}`;
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
      
      console.log('Leave =================list:', ApprovalList.data);
    } catch (err) {
      console.error('Error fetching leave list:', err);
    }

    let roleurl = '';
    roleurl = `${BASE_URL_PROD}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
    const response = await axios.get(roleurl);
    let roleData = null;
    console.log('Role Details========:', response.data);
    
    // Check if current user is authorized for final approval
    if (Array.isArray(response.data)) {
      // Check if employee ID exists in role details
      const isAuthorized = response.data.some(role => 
        role.employeeId === employeeDetails?.id && 
        (role.roleId === 1 || role.branchId === 0) // Assuming roleId 1 or branchId 0 indicates authorization
      );
      setIsAuthorizedForFinalApproval(isAuthorized);
      console.log('User is authorized for final approval:', isAuthorized);
      
      // If employeeId matches, get that role data, else get the first role as fallback
      roleData =
        response.data.find(item => item.employeeId === employeeDetails?.id) ||
        response.data[0] ||
        null;
    }
    console.log('Role Data==============================', roleData);

    if (roleData.branchId != 0) {
      ApprovalList = ApprovalList.data.some(
        item => item.branchId === roleData.branchId,
      );
    }
    console.log('Filtered fffffffApproval List:', ApprovalList.data);

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

      console.log(
        'Sending request data for leave approval access:',
        requestData,
      );

      const response = await axios.post(
        `${BASE_URL_PROD}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );

      console.log('Leave fetchFunctionalAccessMenus:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching functional access menus:', error);
      return null;
    }
  };

  console.log(employeeDetails, 'Employee Details');

  const [rmRemarks, setRmRemarks] = useState({});
  const [approvalRemarks, setApprovalRemarks] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [approvalLeaveId, setApprovalLeaveId] = useState(null);
  // Add state for approved leave count per request
  const [approvedLeaveCount, setApprovedLeaveCount] = useState({});

  
  // debugger;
  const handleApprove = async id => {
    try {
      // First fetch the detailed leave data directly from API
      const leaveDetails = await fetchLeaveDetailsById(id);
      
      if (!leaveDetails) {
        alert('Cannot fetch leave request details');
        return;
      }
      
      // Find matching item in approval list for UI display purposes
      const leaveItem = approvalList.find(
        item => (item.id || item.applyLeaveId) === id,
      );
      
      if (!leaveItem) {
        alert('Cannot find leave request details');
        return;
      }

      const leaveNo = leaveDetails.leaveNo || leaveItem.leaveNo || 0;
      
      if (leaveNo === 0) {
        alert('Leave days (leaveNo) cannot be zero');
        return;
      }

      const approvedCount = Number(approvedLeaveCount[id]);
      if (!approvedCount || approvedCount === 0) {
        alert('You cannot approve 0 leave days. Please enter a valid number.');
        return;
      }

      if (approvedCount > leaveNo) {
        alert(
          'Approved leave days cannot be greater than requested leave days',
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
        `${BASE_URL_PROD}/PayRollRun/CheckPayRollCreationForLeaveApproval`,
        payrollCheckBody,
      );

      if (payrollRes?.data?.isSuccess) {
        alert(
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
        DocumentPath: leaveDetails.documentPath || "",
        EmployeeEmail: leaveDetails.employeeEmail || "",
        ApplyLeaveId: leaveDetails.applyLeaveId || 0,
        DepartmentId: leaveDetails.departmentId,
        ReportingMgerEmail: leaveDetails.reportingMgerEmail || "",
        ReportTaskEmail: leaveDetails.reportTaskEmail || "",
        ToLeaveDate: leaveDetails.toLeaveDate,
        FromLeaveDate: leaveDetails.fromLeaveDate,
        EmployeeName: leaveDetails.employeeName,
        EmployeeCode: leaveDetails.employeeCode,
        Designation: leaveDetails.designation,
        Department: leaveDetails.department,
        Remarks: rmRemarks[id] || leaveDetails.remarks || "",
        LeaveNo: leaveNo,
        ApprovedPaidLeave: approvedCount,
        ApprovedUnpaidLeave: 0,
        ApprovalStatus: 1, // 1 means approved
        taskAssignmentEmpId: taskAssignment.employeeId || leaveDetails.taskAssignmentEmpId || 0,
        taskAssignEmployeeCode: taskAssignment.employeeCode || leaveDetails.taskAssignEmployeeCode || "",
        ReportingRemarks: rmRemarks[id] || "",
        leaveType: leaveDetails.leaveType,
        status: 'Approved',
        flag: 1,
        isDelete: 0,
        createdBy: employeeDetails?.id || 0,
        createdDate: new Date().toISOString(),
        modifiedBy: employeeDetails?.id || 0,
        modifiedDate: new Date().toISOString()
      };

      // Debug the exact payload being sent
      console.log('Final approval payload using detailed data:', JSON.stringify(approvalPayload, null, 2));

      const endpoint = isAuthorizationPerson
        ? `${BASE_URL_PROD}/LeaveApproval/SaveLeaveFinalApproval`
        : `${BASE_URL_PROD}/LeaveApproval/SaveLeaveApproval`;

      console.log('Submitting leave approval to:', endpoint);

      const approvalRes = await axios.post(endpoint, approvalPayload);
      const {data} = approvalRes;
      
      // Log the full backend response for debugging
      console.log('Backend response:', {
        status: approvalRes.status,
        statusText: approvalRes.statusText,
        headers: approvalRes.headers,
        data: data
      });

      if (data?.isSuccess) {
        alert(
          `✅ Leave Approved!\n\nEmployee: ${leaveItem.employeeName}\nLeave Type: ${leaveItem.leaveName}\nRequested: ${leaveItem.leaveNo} day(s)\nApproved: ${approvedCount} day(s)`,
        );

        // After successful approval, refresh the list
        fetchLeaveApprovalData();
      } else {
        console.error('Backend returned error:', data);
        alert(`❌ Approval Failed: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Exception during approval:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(
        'An unexpected error occurred during leave approval. Please try again.',
      );
    }
  };




  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
// debugger
  // Function to fetch leave details by ID
const fetchLeaveDetailsById = async (id) => {
  try {
    console.log(`Fetching leave details for ID: ${id}`);
   
    const response = await axios.get(`${BASE_URL_PROD}/ApplyLeave/GetApplyLeaveDetailsById/${id}`);
    console.log('Leave Details API ==============================Response:', JSON.stringify(response.data, null, 2));
    setLeaveDetails(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave details:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

  const toggleCardExpansion = async (id) => {
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

    if (!companyId) {
      console.log('Missing company ID, cannot fetch employees');
      return;
    }

    const apiUrl = `${BASE_URL_PROD}/EmpRegistration/GetEmployeeByDepartmentId/${companyId}/${departmentId || 0}`;
    console.log('Fetching employees from:', apiUrl);

    const response = await axios.get(apiUrl);

    if (!response.data || !Array.isArray(response.data)) {
      console.log('No employee data received or invalid format');
      return;
    }

    console.log('Received employee data:', response.data);
    
    // Define IDs to match against (using the current leave details or a provided ID)
    const targetId = filterEmployeeId || leaveDetails?.employeeId || null;
    
    // Map data into your structure
    let employeesData = response.data.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      departmentId: emp.departmentId,
      departmentName: emp.departmentName,
      designationName: emp.designationName,
      emailAddress: emp.emailAddress
    }));
    
    // Check if we need to match specific employee IDs
    if (targetId) {
      // Try to find exact match by employee ID or numeric ID
      const matchingEmployee = employeesData.find(emp => 
        emp.employeeId === targetId || emp.id === targetId
      );
      
      if (matchingEmployee) {
        console.log(`Found matching employee with ID ${targetId}:`, matchingEmployee);
        // Filter to only show matching employee
        employeesData = [matchingEmployee];
      } else {
        console.log(`No employee found matching ID ${targetId}, showing full list`);
      }
    } else {
      // If no specific ID to match, filter by department if needed
      if (departmentId) {
        const filteredByDept = employeesData.filter(
          emp => emp.departmentId === departmentId
        );
        
        if (filteredByDept.length > 0) {
          console.log(`Found ${filteredByDept.length} employees in department ${departmentId}`);
          employeesData = filteredByDept;
        } else {
          console.log(`No employees found in depaccccccrtment ${departmentId}, showing full list`);
        }
      }
    }
    
    // Update the state with processed employees
    setTaskAssignmentEmployees(employeesData);
    
    return employeesData; // Return the final filtered response
  } catch (error) {
    console.error('Error fetching employees:', error);
    setTaskAssignmentEmployees([]);
    return null;
  }
};


  // Add helper function to update task assignee (if not already added)
  const updateTaskAssignee = (leaveId, employeeId) => {
    if (!employeeId) return;
    
    const selectedEmployee = taskAssignmentEmployees.find(emp => emp.id === employeeId);
    
    if (selectedEmployee) {
      console.log(`Setting task assignee for leave ID ${leaveId}:`, selectedEmployee);
      
      setSelectedTaskAssignee(prev => ({
        ...prev,
        [leaveId]: {
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.employeeName,
          employeeCode: selectedEmployee.employeeId
        }
      }));
    }
  };

  const renderItem = ({item}) => {
    const isExpanded = expandedCard === (item.id || item.applyLeaveId);
    const leaveType = item.leaveName || 'Leave';
    const leaveColor = LeaveTypeColors[leaveType] || '#6b7280';
    const itemId = item.id || item.applyLeaveId;

    return (
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => toggleCardExpansion(itemId)}
        activeOpacity={0.9}>
        {/* Status badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>PENDING</Text>
        </View>

        {/* Header with leave type and toggle icon */}
        <View style={styles.cardHeader}>
          <View style={styles.leaveTypeContainer}>
            <Chip
              style={[
                styles.leaveTypeChip,
                {backgroundColor: `${leaveColor}20`},
              ]}
              textStyle={{color: leaveColor, fontWeight: '800'}}>
              {leaveType}
            </Chip>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6b7280"
          />
        </View>

        {/* Employee info section - always visible */}
        <View style={styles.employeeInfoSection}>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <View style={styles.employeeDetails}>
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
            </View>
            <View style={styles.detailDivider} />
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

        {/* Date and duration info */}
        <View style={styles.dateOuterContainer}>
          <View style={styles.dateInnerContainer}>
            <View style={styles.dateFromToContainer}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>From</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.fromLeaveDate)}
                </Text>
              </View>
              <View style={styles.dateArrow}>
                <Icon name="arrow-right" size={18} color="#9ca3af" />
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>To</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.toLeaveDate)}
                </Text>
              </View>
            </View>
            <View style={styles.daysContainer}>
              <Text style={styles.daysValue}>{item.leaveNo}</Text>
              <Text style={styles.daysLabel}>
                {item.leaveNo > 1 ? 'Days' : 'Day'}
              </Text>
            </View>
          </View>

          {/* Duration type */}
          <View style={styles.durationTypeContainer}>
            <Icon
              name="clock"
              size={16}
              color="#6b7280"
              style={styles.durationIcon}
            />
            <Text style={styles.durationText}>
              {item.leaveDuration || 'Full Day'}
            </Text>
          </View>

          {/* Reason/Remarks Section */}
          <View style={styles.remarksSection}>
            <Text style={styles.remarksLabel}>Reason:</Text>
            <Text style={styles.remarksValue}>{item.remarks || 'No reason provided'}</Text>
          </View>
          
          {/* Status Section with color-coded status */}
          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue,
              item.status?.toLowerCase().includes('approved') 
                ? styles.statusApproved 
                : item.status?.toLowerCase().includes('rejected')
                  ? styles.statusRejected
                  : styles.statusPending
            ]}>
              {item.status || 'Pending'}
            </Text>
          </View>
          
          {/* Display Reporting Remarks with conditional title based on authorization */}
          {(item.reportingRemarks || item.status?.includes('Approved By Reporting Manager')) && (
            <View style={styles.reportingRemarksSection}>
              <Text style={styles.remarksLabel}>
                {isAuthorizedForFinalApproval 
                  ? 'Final Approval Manager Remarks' 
                  : 'Reporting Manager Remarks'}
              </Text>
              <Text style={styles.remarksValue}>
                {item.reportingRemarks || 'Approved without additional remarks'}
              </Text>
            </View>
          )}
        </View>



        {/* Expanded section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Divider style={styles.divider} />

            {/* Document section */}
            {item.documentPath ? (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Supporting Document</Text>
                <TouchableOpacity
                  style={styles.documentButton}
                  onPress={() => Linking.openURL(item.documentPath)}>
                  <Icon name="file-text" size={18} color="#3b82f6" />
                  <Text style={styles.documentText}>View document</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Assignment Employee Department if available */}
            {item.assignmentEmpDepartment && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Assigned Employee Department</Text>
                <Text style={styles.infoText}>{item.assignmentEmpDepartment}</Text>
              </View>
            )}

            {/* Assignment Employee Designation if available */}
            {item.assignmentEmpDesignation && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Assigned Employee Designation</Text>
                <Text style={styles.infoText}>{item.assignmentEmpDesignation}</Text>
              </View>
            )}

            {/* How many days approved? */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>No of Approved Leave</Text>
              <TextInput
                style={styles.enhancedTextInput}
                placeholder="Enter number of approved leave days (required)"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={
                  approvedLeaveCount[item.id || item.applyLeaveId]
                    ? approvedLeaveCount[
                        item.id || item.applyLeaveId
                      ].toString()
                    : item.leaveNo?.toString() || '0'
                }
                onChangeText={text => {
                  const val = text.replace(/[^0-9]/g, '');
                  setApprovedLeaveCount(prev => ({
                    ...prev,
                    [item.id || item.applyLeaveId]: val,
                  }));
                }}
              />
            </View>
         
          {/* How many days approved? */}

            

            {/* Reporting Manager Remarks */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {isAuthorizedForFinalApproval
                  ? 'Final Approval Manager Remarks'
                  : 'Reporting Manager Remarks'}
              </Text>
              <TextInput
                style={[styles.enhancedTextInput, styles.remarksInput]}
                placeholder={`Add your ${
                  isAuthorizedForFinalApproval
                    ? 'final approval'
                    : 'reporting manager'
                } remarks here (required)`}
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={rmRemarks[item.id || item.approvalRemarks] || ''}
                onChangeText={text =>
                  setRmRemarks(prev => ({
                    ...prev,
                    [item.id || item.setApprovalRemarks]: text,
                  }))
                }
              />
            </View>

            {/* Task Assignment Dropdown */}
            {/* <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Task Assignment</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedTaskAssignee[itemId]?.employeeId || null}
                  style={styles.picker}
                  dropdownIconColor="#4B5563"
                  onValueChange={(itemValue) => updateTaskAssignee(itemId, itemValue)}>
                  <Picker.Item 
                    label="Select an employee for task assignment" 
                    value={null} 
                    style={styles.pickerPlaceholder} 
                  />
                  {taskAssignmentEmployees.map(employee => (
                    <Picker.Item 
                      key={employee.id} 
                      label={`${employee.name} (${employee.employeeCode})`} 
                      value={employee.id}
                      style={styles.pickerItem} 
                    />
                  ))}
                </Picker>
              </View>
            </View> */}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprove(item.id || item.applyLeaveId)}>
                <Icon
                  name="check"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {isAuthorizedForFinalApproval ? 'Final Approve' : 'Approve'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(item.id || item.applyLeaveId)}>
                <Icon
                  name="x"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Leave Requests"
          titleStyle={styles.headerTitle}
        />
        {/* <Appbar.Action icon="filter" color="#4B5563" onPress={() => alert('Filter pressed')} /> */}
      </Appbar.Header>

      {/* Pending Requests Card - Updated to show actual count */}
      <View style={styles.pendingAlertSmall}>
        <Icon
          name="alert-circle"
          size={20}
          color="#f59e42"
          style={{marginRight: 8}}
        />
        <Text style={styles.pendingAlertCountSmall}>{pendingRequestsCount} Pending Request{pendingRequestsCount !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={paginatedData} // Use paginated data instead of full approvalList
        keyExtractor={item =>
          item.id?.toString() ||
          item.applyLeaveId?.toString() ||
          Math.random().toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          approvalList.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(approvalList.length / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={approvalList.length}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No pending leave requests found</Text>
          </View>
        }
      />
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    position: 'relative', // For absolute positioning of status badge
    paddingTop: 24, // Add space for the status badge
  },
  expandedCard: {
    elevation: 4,
    shadowOpacity: 0.12,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    zIndex: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveTypeChip: {
    height: 32,
  },
  employeeInfoSection: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  employeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  detailDivider: {
    height: 16,
    width: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  dateOuterContainer: {
    marginVertical: 8,
  },
  dateInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFromToContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateArrow: {
    marginHorizontal: 8,
  },
  daysContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginLeft: 12,
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
    marginTop: 4,
  },
  durationIcon: {
    marginRight: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  expandedSection: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e5e7eb',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  reasonText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  documentText: {
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827',
    minHeight: 80,
  },

  // Enhanced TextInput styles
  enhancedTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '400',
    backgroundColor: '#F9FAFB',
    color: '#111827',
    minHeight: 54,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  remarksInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  pendingAlertSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#FDBA74',
    alignSelf: 'flex-start',
  },
  pendingAlertCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  pendingAlertCountSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  pendingAlertText: {
    fontSize: 14,
    color: '#92400e',
    marginTop: 2,
    fontWeight: '500',
  },

  // Add these new styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 2,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  remarksSection: {
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',   
   
  },
  statusSection: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportingRemarksSection: {
    marginTop: 8,
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
    color: '#111827',
    fontWeight: '500',    
    marginLeft: 10
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
  infoText: {
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  statusApproved: {
    color: '#059669', // Green for approved
    backgroundColor: '#ECFDF5',
  },
  statusRejected: {
    color: '#DC2626', // Red for rejected
    backgroundColor: '#FEF2F2',
  },
  statusPending: {
    color: '#D97706', // Amber for pending
    backgroundColor: '#FEF3C7',
  },
  // Add styles for the picker
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
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
});

export default LeaveRequest;

