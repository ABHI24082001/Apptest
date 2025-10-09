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
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';


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
  summaryContainer: {
    backgroundColor: '#FFF7ED',
    borderBottomWidth: 1,
    borderBottomColor: '#FDBA74',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: 14,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  summaryText: {
    fontSize: 14,
    color: '#92400e',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
    paddingTop: 24,
  },
  expandedCard: {
    elevation: 4,
    shadowOpacity: 0.1,
    backgroundColor: '#FFFFFF',
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
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveTypeChip: {
    height: 32,
  },
  employeeInfo: {
    marginBottom: 14,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  employeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailSeparator: {
    marginHorizontal: 8,
    color: '#D1D5DB',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827',
    minHeight: 45, // Reduced from 80
  },
  remarksInput: {
    minHeight: 60, // Still allow more space for remarks, but reduced
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  paginationButton: {
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  hrButton: {
    padding: 8,
    marginRight: 8,
  },
});

export default LeaveRequest;

// {
//         "employeeCode": "AA_10",
//         "employeeName": "William Puckett",
//         "leaveName": "Casual Leave",
//         "gender": "Male",
//         "department": "Human Resources",
//         "designation": "HR Manager",
//         "employeeEmail": null,
//         "mobileNo": "918945689456",
//         "departmentId": null,
//         "designationId": null,
//         "approvalStatus": 0,
//         "taskAssignmentEmpId": null,
//         "taskAssignEmployeeCode": null,
//         "reportTaskEmail": null,
//         "reason": null,
//         "applyLeaveId": 0,
//         "reportingMgerName": null,
//         "reportingMgerEmail": null,
//         "approvedPaidLeave": null,
//         "approvedUnpaidLeave": null,
//         "paidLeaveAmount": null,
//         "month": 0,
//         "year": 0,
//         "assignmentEmpDepartment": null,
//         "assignmentEmpDesignation": null,
//         "reportingRemarks": null,
//         "branchName": null,
//         "branchId": 2,
//         "id": 136,
//         "employeeId": 9,
//         "reportingId": 0,
//         "leaveType": 1,
//         "leaveId": 0,
//         "fromLeaveDate": "2025-06-04T13:14:51",
//         "toLeaveDate": "2025-06-05T13:14:51",
//         "leaveNo": 2,
//         "documentPath": null,
//         "remarks": "rfrrrr",
//         "status": "Pending",
//         "companyId": 0,
//         "isDelete": 0,
//         "flag": 1,
//         "createdBy": 0,
//         "createdDate": "2025-06-04T13:15:04.793",
//         "modifiedBy": null,
//         "modifiedDate": null,
//         "reporting": null,
//         "tblLeaveDates": []
// }



