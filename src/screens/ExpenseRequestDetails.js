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
import {useAuth} from '../constants/AuthContext';
// Import the Pagination component
import Pagination from '../components/Pagination';
import axios from 'axios';
import BASE_URL from '../constants/apiConfig';

const ExpenseTypeColors = {
  'Advance': '#3b82f6', // Blue
  'Expense': '#ef4444', // Red
  'Reimbursement': '#10b981', // Green
};

// Removing static expense data and replacing with empty array as initial state
// The data will be populated from the API

const ExpenseRequestDetails = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();
  const {user} = useAuth();

  // State variables for expense management
  const [expenseList, setExpenseList] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState({});
  const [expenceApprovalAccess, setexpenceApprovalAccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseDetails, setExpenseDetails] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Increased from 2 to show more items
  const [paginatedData, setPaginatedData] = useState([]);
    const [isAuthorizedForFinalApproval, setIsAuthorizedForFinalApproval] = useState(false);

  // Helper function to format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString || 'N/A';
    }
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
        console.log('Fetching expense request access data...');
        const accessData = await ExpenseRequestAccessMenus();
        console.log('EXPENSE REQUEST ACCESS DATA:', accessData);
      } catch (error) {
        console.error('Error fetching expense access data:', error);
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
    
    console.log(`Paginating: Page ${page}, showing items ${startIndex + 1}-${Math.min(endIndex, data.length)} of ${data.length}`);
    
    setPaginatedData(paginatedItems);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
  };


  const fetchExpenseById = async (id) => {
    try {
      console.log(`Fetching expense details for ID: ${id}`);
      const companyId = user?.childCompanyId;
      
      if (!companyId) {
        console.error('Missing company ID for expense details fetch');
        return null;
      }
      
      const response = await axios.get(
        `${BASE_URL}/PaymentAdvanceRequest/GetPaymentAdvanveDetailsRequest/${companyId}/${id}`
      );
      
      console.log('Expense Details API Response:', JSON.stringify(response.data, null, 2));
      
      // Store the fetched details in state
      setExpenseDetails(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense details:', error);
      console.error('Error details:', error.response?.data || error.message);
      return null;
    }
  };

  const toggleCardExpansion = async (id) => {
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

  // const handleApprove = (id) => {
  //   if (!approvalRemarks[id]) {
  //     alert('Please add remarks before approving');
  //     return;
  //   }
    
  //   alert(`Expense request #${id} approved with remarks: ${approvalRemarks[id]}`);
    
  //   // Remove the approved item from the list
  //   const updatedList = expenseList.filter(item => item.id !== id);
  //   setExpenseList(updatedList);
  //   setPendingRequestsCount(updatedList.length);
  //   updatePaginatedData(updatedList, currentPage);
  // };

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
      // Fetch expense details
      const expenceDetails = await fetchExpenseById(id);
      if (!expenceDetails) {
        alert('Failed to fetch expense details. Please try again.');
        return;
      }

      // Find matching item in expense list
      const expenceItem = expenseList.find(
        item => (item.id || item.requestId) === id,
      );
      if (!expenceItem) {
        alert('Expense item not found. Please try again.');
        return;
      }

      // Check if approval remarks are provided
      if (!approvalRemarks[id]) {
        alert('Please add approval remarks before proceeding.');
        return;
      }

      // Check if expense amount is zero
      const amount = expenceDetails.totalAmount || expenceDetails.approvalAmount || expenceDetails.amount || 0;
      if (amount <= 0) {
        alert('Cannot approve an expense with zero amount.');
        return;
      }

      // Check if payroll is already generated for this employee
      const payrollCheckBody = {
        EmployeeId: expenceDetails.employeeId,
        CompanyId: expenceDetails.companyId,
        BranchId: expenceDetails.branchId || 0,
        fromLeaveDate: formatDateForBackend(expenceDetails.transactionDate || expenceDetails.createdDate)
      };

      console.log('Checking payroll with data:', payrollCheckBody);
      
      const payrollRes = await axios.post(
        `${BASE_URL}/PayRollRun/CheckPayRollCreationForLeaveApproval`,
        payrollCheckBody
      );
      
      console.log('Payroll check response:', payrollRes.data);
      
      if (payrollRes?.data?.isSuccess) {
        alert(
          'Payroll already generated for this employee. Expense cannot be approved.'
        );
        return;
      }

      // If all checks pass, proceed with approval
      // Construct approval payload
      const approvalPayload = {
        CompanyId: expenceDetails.companyId,
        Id: expenceDetails.id || id,
        RequestId: expenceDetails.requestId || id,
        EmployeeId: expenceDetails.employeeId,
        ApprovalRemarks: approvalRemarks[id] || "",
        ApprovalStatus: 1, // 1 means approved
        TotalAmount: amount,
        createdBy: employeeDetails?.id || 0,
        createdDate: new Date().toISOString(),
        modifiedBy: employeeDetails?.id || 0,
        modifiedDate: new Date().toISOString()
      };

      console.log('Sending approval with payload:', approvalPayload);

      // Determine which endpoint to use based on authorization status
      const endpoint = isAuthorizedForFinalApproval
        ? `${BASE_URL}/api/PaymentAdvanceRequest/SaveClaimRequestFinalApproval`
        : `${BASE_URL}PaymentAdvanceRequest/SaveClaimRequestMGRApproval`;

      console.log('Using approval endpoint:', endpoint);

      // Submit the approval
      const approvalRes = await axios.post(endpoint, approvalPayload);
      console.log('Approval response:', approvalRes.data);

      if (approvalRes.data?.isSuccess) {
        alert(
          `✅ Expense Approved!\n\nEmployee: ${expenceItem.employeeName || expenceDetails.employeeName}\nAmount: ${typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount}`
        );

        // After successful approval, refresh the list
        FetchExpenceApprovalData();
      } else {
        console.error('Backend returned error:', approvalRes.data);
        alert(`❌ Approval Failed: ${approvalRes.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Exception during approval:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(
        'An unexpected error occurred during expense approval. Please try again.'
      );
    }
  };

  const handleReject = (id) => {
    if (!approvalRemarks[id]) {
      alert('Please add remarks before rejecting');
      return;
    }
    
    alert(`Expense request #${id} rejected with remarks: ${approvalRemarks[id]}`);
    
    // Remove the rejected item from the list
    const updatedList = expenseList.filter(item => item.id !== id);
    setExpenseList(updatedList);
    setPendingRequestsCount(updatedList.length);
    updatePaginatedData(updatedList, currentPage);
  };

  
// debugger

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
      console.log('Expense================== fetchFunctionalAccessMenus:', response.data);

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
    const hasAccess = Array.isArray(accessData) && 
      (accessData.some(item => item.employeeId === employeeId) || userType === 2);
    console.log('User has approval access:', hasAccess);

    // Step 4: Get role configuration data
    let roleData = null;
    try {
      const roleUrl = `${BASE_URL}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
      const roleResponse = await axios.get(roleUrl);
      console.log('Role Details from API:', JSON.stringify(roleResponse.data, null, 2));
      
      if (Array.isArray(roleResponse.data)) {
        // Check if employee ID exists in role details
        const isAuthorized = roleResponse.data.some(role => 
          role.employeeId === employeeDetails?.id
        );
        setIsAuthorizedForFinalApproval(isAuthorized);
        
        // If employeeId matches, get that role data, else get the first role as fallback
        roleData = roleResponse.data.find(item => item.employeeId === employeeDetails?.id) || 
                   roleResponse.data[0] || null;
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
        approvalData = response.data.filter(item => item.employeeId !== employeeDetails?.id);
        
        // Filter by branch if role has branch restriction
        if (roleData && roleData.branchId !== 0) {
          const branchId = roleData.branchId;
          approvalData = approvalData.filter(item => item.branchId === branchId);
          console.log(`Filtered approvals by branch ID ${branchId}`);
        }
        
        // Log the filtered approval data
        console.log(`Fetched===================================== ${approvalData.length} expense approval records after filtering`);
        console.log('Filtered========================================= Approval List:', JSON.stringify(approvalData, null, 2));
        
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

  const renderItem = ({item}) => {
    const isExpanded = expandedCard === item.id || expandedCard === item.requestId;
    
    // Get expense type with fallback options
    const expenseType = getFieldValue(item, ['requestType', 'paymentType'], 'Expense');
    const expenseColor = ExpenseTypeColors[expenseType] || '#6b7280';
    
    // Get item ID - either 'id' or 'requestId'
    const itemId = item.id || item.requestId;
    
    // Get employee name with fallback
    const employeeName = getFieldValue(item, ['employeeName', 'name']);
    
    // Get employee code with fallback
    const employeeCode = getFieldValue(item, ['employeeCode', 'empId']);
    
    // Get amount with fallback and formatting
    const amount = getFieldValue(item, ['totalAmount', 'approvalAmount', 'amount']);
    const formattedAmount = typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount;
    
    // Get project name with fallback
    const projectName = getFieldValue(item, ['projectName', 'project']);
    
    // Get status with fallback
    const status = getFieldValue(item, ['status'], 'Pending');
    
    // Get remarks/reason with fallback
    const remarks = getFieldValue(item, ['remarks', 'reason']);
    
    // Get date with fallback
    const appliedDate = formatDate(getFieldValue(item, ['transactionDate', 'createdDate', 'appliedDate']));

    return (
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => toggleCardExpansion(itemId)}
        activeOpacity={0.9}>
        {/* Status badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{status}</Text>
        </View>

        {/* Header with expense type and toggle icon */}
        <View style={styles.cardHeader}>
          <View style={styles.leaveTypeContainer}>
            <Chip
              style={[
                styles.leaveTypeChip,
                {backgroundColor: `${expenseColor}20`},
              ]}
              textStyle={{color: expenseColor, fontWeight: '800'}}>
              {expenseType}
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
          <Text style={styles.employeeName}>{employeeName}</Text>
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

        {/* Date and amount info */}
        <View style={styles.dateOuterContainer}>
          <View style={styles.dateInnerContainer}>
            <View style={styles.dateFromToContainer}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Applied Date</Text>
                <Text style={styles.dateValue}>
                  {appliedDate}
                </Text>
              </View>
              <View style={styles.dateArrow}>
                <Icon name="file-text" size={18} color="#9ca3af" />
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Project</Text>
                <Text style={styles.dateValue}>
                  {projectName || 'Not Specified'}
                </Text>
              </View>
            </View>
            <View style={styles.daysContainer}>
              <Text style={styles.daysValue}>{formattedAmount}</Text>
              <Text style={styles.daysLabel}>Amount</Text>
            </View>
          </View>

          {/* Employee ID */}
          <View style={styles.durationTypeContainer}>
            <Icon
              name="user"
              size={16}
              color="#6b7280"
              style={styles.durationIcon}
            />
            <Text style={styles.durationText}>
              Employee ID: {employeeCode}
            </Text>
          </View>

          {/* Reason/Remarks Section */}
          <View style={styles.remarksSection}>
            <Text style={styles.remarksLabel}>Purpose:</Text>
            <Text style={styles.remarksValue}>{remarks || 'No purpose provided'}</Text>
          </View>
          
          {/* Status Section with color-coded status */}
          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue,
              status?.toLowerCase().includes('approved') 
                ? styles.statusApproved 
                : status?.toLowerCase().includes('rejected')
                  ? styles.statusRejected
                  : styles.statusPending
            ]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Expanded section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Divider style={styles.divider} />

            {/* Fetching indicator */}
            {expandedCard === itemId && !expenseDetails && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Fetching expense details...</Text>
              </View>
            )}

            {/* Project Details Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Request Details</Text>
              <Text style={styles.infoText}>
                {`Request ID: ${itemId}\nRequest Type: ${expenseType}\nTotal Amount: ${formattedAmount}`}
                {expenseDetails && expenseDetails.projectId ? `\nProject ID: ${expenseDetails.projectId}` : ''}
                {expenseDetails && expenseDetails.paymentType ? `\nPayment Type: ${expenseDetails.paymentType}` : ''}
              </Text>
            </View>

            {/* Payment Details Section - Only show if we have fetched details */}
            {expenseDetails && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                <Text style={styles.infoText}>
                  {`Transaction ID: ${expenseDetails.transactionId || 'N/A'}`}
                  {expenseDetails.bankName ? `\nBank: ${expenseDetails.bankName}` : ''}
                  {expenseDetails.accountNumber ? `\nAccount: ${expenseDetails.accountNumber}` : ''}
                  {expenseDetails.requestStatus ? `\nStatus: ${expenseDetails.requestStatus}` : ''}
                </Text>
              </View>
            )}

            {/* Department & Designation */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Department & Designation</Text>
              <Text style={styles.infoText}>
                {`Department: ${item.department || expenseDetails?.department || 'Not Specified'}\nDesignation: ${item.designation || expenseDetails?.designation || 'Not Specified'}`}
              </Text>
            </View>

            {/* Approval Remarks */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Approval Remarks
              </Text>
              <TextInput
                style={[styles.enhancedTextInput, styles.remarksInput]}
                placeholder="Add your approval remarks here (required)"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={approvalRemarks[itemId] || ''}
                onChangeText={text =>
                  setApprovalRemarks(prev => ({
                    ...prev,
                    [itemId]: text,
                  }))
                }
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprove(itemId)}>
                <Icon
                  name="check"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  Approve
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(itemId)}>
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
          title="Expense Requests"
          titleStyle={styles.headerTitle}
        />
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
        data={paginatedData} // Use paginated data instead of full expenseList
        keyExtractor={(item, index) => {
          // Create a truly unique key by using multiple properties or fallback to index
          const uniqueId = item.requestId || item.id || `item-${index}`;
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
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No pending expense requests found</Text>
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
    color: '#4b5563',
    fontStyle: 'italic',
  },
}); 



export default ExpenseRequestDetails;

