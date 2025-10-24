import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AppSafeArea from '../component/AppSafeArea';
import {Appbar, Avatar, Chip, Divider, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import styles from '../Stylesheet/LeaveRequest';

const LeaveTypeColors = {
  'Casual Leave': '#3b82f6', // Blue
  'Sick Leave': '#ef4444', // Red
  'Paid Leave': '#10b981', // Green
};

const ITEMS_PER_PAGE = 5;

const LeaveRequest = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();

  // Function to navigate to HR screen
  const navigateToHRScreen = () => {
    navigation.navigate('HRScreen'); // Replace 'HRScreen' with the actual name of your HR screen
  };

  console.log('Employee Details:', employeeDetails);
  const [leaveApprovalAccess, setLeaveApprovalAccess] = useState(null);
  const [approvalList, setApprovalList] = useState([]); // State to hold the approval list
  const [approveLeaveId, setapproveLeaveId] = useState(null); // State to hold the applyLeaveId
  const [expandedCard, setExpandedCard] = useState(null);
  const [approvedLeaveCount, setApprovedLeaveCount] = useState({});
  const [rmRemarks, setRmRemarks] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (employeeDetails) {
      fetchLeaveApprovalData();
    }
  }, [employeeDetails]);

  // Add another useEffect to initialize approvedLeaveCount when approvalList changes
  useEffect(() => {
    if (Array.isArray(approvalList) && approvalList.length > 0) {
      // Initialize approvedLeaveCount with the requested leave days from each request
      const initialCounts = {};
      approvalList.forEach(item => {
        const id = item.id || item.applyLeaveId;
        initialCounts[id] = item.leaveNo || 0;
      });
      setApprovedLeaveCount(initialCounts);
    }
  }, [approvalList]);

  const fetchLeaveApprovalData = async () => {
    const accessData = await fetchFunctionalAccessMenus();
    setLeaveApprovalAccess(accessData);
    console.log('Leave approval access data set:', accessData);

    // Logic to match employeeId and UserType 2
    const userType = 2; // static as per requirement
    const employeeId = employeeDetails?.id;
    const companyId = employeeDetails?.childCompanyId;
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
      ApprovalList = await axiosinstance.get(apiUrl);
      ApprovalList.data = ApprovalList.data.filter(
        item => item.employeeId != employeeDetails?.id,
      );
      console.log('Leave list:', ApprovalList.data);
    } catch (err) {
      console.error('Error fetching leave list:', err);
    }

    let roleurl = '';
    roleurl = `${BASE_URL}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
    const response = await axiosinstance.get(roleurl);
    let roleData = null;
    console.log('Role Details========:', response.data);
    if (Array.isArray(response.data)) {
      // If employeeId matches, get that role data, else get the first role as fallback
      roleData =
        response.data.find(item => item.employeeId === employeeDetails?.id) ||
        response.data[0] ||
        null;
    }
    console.log('Role Data=========:', roleData);

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
        DepartmentId: employeeDetails?.departmentId || 0,
        DesignationId: employeeDetails?.designtionId || 0,
        EmployeeId: employeeDetails?.id || 0,
        ControllerName: 'Leaveapproval',
        ActionName: 'LeaveapprovalList',
        ChildCompanyId: employeeDetails?.childCompanyId || 1,
        BranchId: employeeDetails?.branchId || 2,
        UserType: 1,
      };

      console.log(
        'Sending request data for leave approval access:',
        requestData,
      );

      const response = await axiosinstance.post(
        `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
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

  const handleApprove = async id => {
    try {
      // Find leave item in approvalList
      const leaveItem = approvalList.find(
        item => (item.id || item.applyLeaveId) === id,
      );
      
      if (!leaveItem) {
        alert('Cannot find leave request details');
        return;
      }

      if (leaveItem.leaveNo === 0) {
        alert('Leave days (leaveNo) cannot be zero');
        return;
      }

      const approvedCount = Number(approvedLeaveCount[id]);
      if (!approvedCount || approvedCount === 0) {
        alert('You cannot approve 0 leave days. Please enter a valid number.');
        return;
      }

      if (approvedCount > leaveItem.leaveNo) {
        alert(
          'Approved leave days cannot be greater than requested leave days',
        );
        return;
      }

      // Step 1: Check if payroll already generated
      const payrollCheckBody = {
        EmployeeId: leaveItem.employeeId,
        CompanyId: leaveItem.companyId || employeeDetails?.childCompanyId,
        BranchId: leaveItem.branchId || employeeDetails?.branchId,
        fromLeaveDate: formatDateForBackend(leaveItem.fromLeaveDate),
      };

      const payrollRes = await axiosinstance.post(
        `${BASE_URL}/PayRollRun/CheckPayRollCreationForLeaveApproval`,
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

      // Step 3: Construct payload - Using the exact field structure from your console output
      const approvalPayload = {
        CompanyId: 1, // Hardcoded as per your console output
        Id: leaveItem.id || 0, 
        Visible: false,
        EmployeeId: leaveItem.employeeId || 9, // Default to 9 if not available
        ReportingId: leaveItem.reportingId || 13, // Default to 13 if not available
        DocumentPath: leaveItem.documentPath || "",
        EmployeeEmail: leaveItem.employeeEmail || "rahulsynap@thecloudtree.ai",
        ApplyLeaveId: leaveItem.applyLeaveId || 0,
        DepartmentId: leaveItem.departmentId || 22,
        ReportingMgerEmail: leaveItem.reportingMgerEmail || "",
        ReportTaskEmail: leaveItem.reportTaskEmail || "",
        ToLeaveDate: leaveItem.toLeaveDate,
        FromLeaveDate: leaveItem.fromLeaveDate,
        EmployeeName: leaveItem.employeeName || "William Puckett",
        EmployeeCode: leaveItem.employeeCode || "AA_10",
        Designation: leaveItem.designation || "HR Manager",
        Department: leaveItem.department || "Human Resources",
        Remarks: rmRemarks[id] || "testing for mail",
        LeaveNo: leaveItem.leaveNo || 1,
        ApprovedPaidLeave: approvedCount || 0,
        ApprovedUnpaidLeave: 0, // Set to 0 as per console output
        ApprovalStatus: 1, // 1 means approved
        taskAssignmentEmpId: leaveItem.taskAssignmentEmpId || 0,
        assignmentEmpDepartment: leaveItem.assignmentEmpDepartment || "",
        assignmentEmpDesignation: leaveItem.assignmentEmpDesignation || "",
        ReportingRemarks: rmRemarks[id] || "dd",
        // Additional fields from your original payload
        leaveType: leaveItem.leaveType || 1,
        status: 'Approved',
        flag: 1,
        isDelete: 0,
        createdBy: employeeDetails?.id || 0,
        createdDate: new Date().toISOString(),
        modifiedBy: employeeDetails?.id || 0,
        modifiedDate: new Date().toISOString()
      };

      // Debug the exact payload being sent
      console.log('Final payload being sent to API:', JSON.stringify(approvalPayload, null, 2));

      const endpoint = isAuthorizationPerson
        ? `${BASE_URL}/LeaveApproval/SaveLeaveFinalApproval`
        : `${BASE_URL}/LeaveApproval/SaveLeaveApproval`;

      console.log('Submitting leave approval to:', endpoint);

      const approvalRes = await axiosinstance.post(endpoint, approvalPayload);
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

  const toggleCardExpansion = id => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Update FlatList to use approvalList
  const renderItem = ({item}) => {
    const isExpanded = expandedCard === (item.id || item.applyLeaveId);
    const leaveType = item.leaveName || 'Leave';
    const leaveColor = LeaveTypeColors[leaveType] || '#6b7280';

    return (
      <View style={[styles.card, isExpanded && styles.expandedCard]}>
        {/* Status badge - always visible at the top */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>PENDING</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => toggleCardExpansion(item.id || item.applyLeaveId)}
          activeOpacity={0.9}>
          
          {/* Header with leave type and toggle icon */}
          <View style={styles.cardHeader}>
            <View style={styles.leaveTypeContainer}>
              <Chip
                style={[styles.leaveTypeChip, { backgroundColor: `${leaveColor}15` }]}
                textStyle={{ color: leaveColor, fontWeight: '700' }}>
                {leaveType}
              </Chip>
            </View>
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6b7280"
            />
          </View>
          
          {/* Employee basic info - always visible */}
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{item.employeeName}</Text>
            <View style={styles.employeeDetails}>
              <Text style={styles.detailText}>{item.designation}</Text>
              <Text style={styles.detailSeparator}>•</Text>
              <Text style={styles.detailText}>{item.department}</Text>
            </View>
          </View>
          
          {/* Date and duration info - always visible */}
          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>{formatDate(item.fromLeaveDate)}</Text>
            </View>
            <View style={styles.dateArrow}>
              <Icon name="arrow-right" size={18} color="#9ca3af" />
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>{formatDate(item.toLeaveDate)}</Text>
            </View>
            <View style={styles.daysContainer}>
              <Text style={styles.daysValue}>{item.leaveNo}</Text>
              <Text style={styles.daysLabel}>{item.leaveNo > 1 ? 'Days' : 'Day'}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Expanded section with inputs and actions */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Divider style={styles.divider} />
            
            {/* No of Approved Leave */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>No of Approved Leave</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter number of approved leave days"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={approvedLeaveCount[item.id]?.toString() || item.leaveNo.toString()}
                onChangeText={text => {
                  const val = text.replace(/[^0-9]/g, '');
                  setApprovedLeaveCount(prev => ({
                    ...prev,
                    [item.id]: val,
                  }));
                }}
              />
            </View>

            {/* Reporting Manager Remarks */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Final Approval Manager Remarks</Text>
              <TextInput
                style={[styles.textInput, styles.remarksInput]}
                placeholder="Add your remarks here (required)"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={rmRemarks[item.id] || ''}
                onChangeText={text =>
                  setRmRemarks(prev => ({
                    ...prev,
                    [item.id]: text,
                  }))
                }
              />
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprove(item.id)}>
                <Icon name="check" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(item.id)}>
                <Icon name="x" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const totalPages = Math.ceil(approvalList.length / ITEMS_PER_PAGE);
  
  // Calculate current items based on pagination
  const currentItems = approvalList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsLoading(false);
      }, 300);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Leave Requests Hr"
          titleStyle={styles.headerTitle}
        />
        {/* <TouchableOpacity 
          style={styles.hrButton}
          onPress={navigateToHRScreen}>
          <Icon name="users" size={22} color="#4B5563" />
        </TouchableOpacity> */}
      </Appbar.Header>

      {/* Pending Requests Card */}
      <View style={styles.pendingAlertSmall}>
        <Icon
          name="alert-circle"
          size={20}
          color="#f59e42"
          style={{marginRight: 8}}
        />
        <Text style={styles.pendingAlertCountSmall}>200 Pending Requests</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <>
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={currentItems}
            keyExtractor={item =>
              item.id?.toString() ||
              item.applyLeaveId?.toString() ||
              Math.random().toString()
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Pagination controls */}
          <View style={styles.paginationContainer}>
            <Button 
              mode="outlined" 
              onPress={handlePreviousPage}
              disabled={currentPage === 1}
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}>
              Previous
            </Button>
            <Text style={styles.pageIndicator}>
              Page {currentPage} of {totalPages}
            </Text>
            <Button 
              mode="outlined" 
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}>
              Next
            </Button>
          </View>
        </>
      )}
    </AppSafeArea>
  );
};



export default LeaveRequest;

