import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Text, Button, Divider, TextInput, DataTable, Title, Subheading, Badge, Avatar, Chip } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ExitRequestDetails = () => {
  const [approvalRemarks, setApprovalRemarks] = useState('');
  
  // Sample data for demonstration - replace with your actual data source
  const employeeData = {
    name: "John Doe",
    id: "EMP00123",
    designation: "Senior Software Engineer",
    department: "Technology",
    remark: "Good performer",
    leaveType: {
      type: "Casual",
      duration: "Full Day",
      absent: "1st Half"
    },
    leaveNo: 1,
    dates: "22-Aug-2023 to 24-Aug-2023",
    approvedLeaves: 3,
    unapprovedLeaves: 1,
    status: "Pending",
    reason: "Family function",
    managerRemarks: "Employee has sufficient leave balance",
    taskAssignment: {
      department: "Technology",
      designation: "Junior Developer"
    }
  };
  
  const documentList = [
    { id: 1, name: "Medical Certificate", url: "doc1.pdf" },
    { id: 2, name: "Application Letter", url: "doc2.pdf" }
  ];
  
  const leaveTable = [
    { slNo: 1, leaveName: "Casual Leave", leaveNo: 8 },
    { slNo: 2, leaveName: "Sick Leave", leaveNo: 12 },
    { slNo: 3, leaveName: "Privilege Leave", leaveNo: 15 }
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#f6f8fa', '#e9f0f8']}
        style={styles.headerGradient}>
        <Text style={styles.headerText}>Exit Request Details</Text>
      </LinearGradient>

      <Card style={styles.card} elevation={3}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.cardHeader}>
          <View style={styles.employeeInfoHeader}>
            <Avatar.Icon size={50} icon="account" style={styles.avatar} />
            <View style={styles.employeeHeaderDetails}>
              <Text style={styles.employeeName}>{employeeData.name}</Text>
              <Text style={styles.employeeId}>ID: {employeeData.id}</Text>
            </View>
            <Badge style={styles.statusBadge}>{employeeData.status}</Badge>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          {/* Employee Basic Information */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Designation</Text>
                <Chip icon="briefcase" style={styles.chip}>{employeeData.designation}</Chip>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Department</Text>
                <Chip icon="office-building" style={styles.chip}>{employeeData.department}</Chip>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Employee Remark</Text>
                <Text style={styles.infoValue}>{employeeData.remark}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            {/* Leave Information */}
            <View style={styles.leaveInfoSection}>
              <Text style={styles.sectionTitle}>Leave Details</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Leave Type</Text>
                  <Chip icon="calendar" style={styles.chip}>{employeeData.leaveType.type}</Chip>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Chip icon="clock-outline" style={styles.chip}>{employeeData.leaveType.duration}</Chip>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Applied Leave No</Text>
                  <Text style={styles.infoValue}>{employeeData.leaveNo}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Absent</Text>
                  <Text style={styles.infoValue}>{employeeData.leaveType.absent}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Applied Leave Date(s)</Text>
                  <Text style={styles.infoValue}>{employeeData.dates}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>No of Approved Leave</Text>
                  <Text style={styles.infoValue}>{employeeData.approvedLeaves}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>No of Unapproved Leave</Text>
                  <Text style={styles.infoValue}>{employeeData.unapprovedLeaves}</Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
            </View>
            
            {/* Task Assignment */}
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Task Assignment</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Assign Employee Department</Text>
                  <Chip icon="office-building" style={styles.chip}>{employeeData.taskAssignment.department}</Chip>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Assign Employee Designation</Text>
                  <Chip icon="briefcase" style={styles.chip}>{employeeData.taskAssignment.designation}</Chip>
                </View>
              </View>
              
              <Divider style={styles.divider} />
            </View>
            
            {/* Reason and Remarks */}
            <View style={styles.remarksSection}>
              <Text style={styles.sectionTitle}>Reason & Remarks</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.fullWidthItem}>
                  <Text style={styles.infoLabel}>Reason</Text>
                  <Text style={styles.infoValue}>{employeeData.reason}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.fullWidthItem}>
                  <Text style={styles.infoLabel}>Reporting Manager Remarks</Text>
                  <Text style={styles.infoValue}>{employeeData.managerRemarks}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.fullWidthItem}>
                  <Text style={styles.infoLabel}>Approval Remarks (Maximum 400 characters)</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    maxLength={400}
                    value={approvalRemarks}
                    onChangeText={setApprovalRemarks}
                    placeholder="Enter your approval remarks here"
                  />
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button mode="contained" style={styles.approveButton} contentStyle={styles.buttonContent} icon="check">
                  Approve
                </Button>
                <Button mode="contained" style={styles.rejectButton} contentStyle={styles.buttonContent} icon="close">
                  Reject
                </Button>
              </View>
              
              <Divider style={styles.divider} />
            </View>
            
            {/* Leave Table */}
            <View style={styles.tableSection}>
              <Text style={styles.sectionTitle}>Leave Details</Text>
              
              <DataTable style={styles.table}>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title><Text style={styles.tableHeaderText}>SL No</Text></DataTable.Title>
                  <DataTable.Title><Text style={styles.tableHeaderText}>Leave Name</Text></DataTable.Title>
                  <DataTable.Title numeric><Text style={styles.tableHeaderText}>Leave No</Text></DataTable.Title>
                </DataTable.Header>
                
                {leaveTable.map((item) => (
                  <DataTable.Row key={item.slNo} style={styles.tableRow}>
                    <DataTable.Cell>{item.slNo}</DataTable.Cell>
                    <DataTable.Cell>{item.leaveName}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.leaveNo}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
              
              <Divider style={styles.divider} />
            </View>
            
            {/* Document List */}
            <View style={styles.documentSection}>
              <Text style={styles.sectionTitle}>Document List</Text>
              
              {documentList.length > 0 ? (
                documentList.map((doc) => (
                  <Chip 
                    key={doc.id}
                    icon="file-document"
                    style={styles.documentChip} 
                    onPress={() => console.log('Document pressed', doc.url)}
                  >
                    {doc.name}
                  </Chip>
                ))
              ) : (
                <Text style={styles.noDocuments}>No documents available</Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export default ExitRequestDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Slightly lighter blue-tinted background
  },
  headerGradient: {
    padding: 18,
    marginBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  card: {
    margin: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 24,
  },
  cardHeader: {
    padding: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  employeeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  employeeHeaderDetails: {
    marginLeft: 14,
    flex: 1,
  },
  employeeName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  employeeId: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#FFC107',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: 12,
    paddingHorizontal: 6,
    elevation: 2,
  },
  infoSection: {
    marginTop: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    letterSpacing: 0.3,
    paddingLeft: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#3b5998',
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoItem: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fullWidthItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: '#5d6d7e',
    marginBottom: 6,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  chip: {
    height: 32,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#e8f0fe',
  },
  divider: {
    height: 1.5,
    marginVertical: 18,
    backgroundColor: '#e0e6ed',
  },
  leaveInfoSection: {
    marginTop: 12,
    backgroundColor: '#fafbfd',
    padding: 12,
    borderRadius: 12,
  },
  taskSection: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  remarksSection: {
    marginTop: 12,
    backgroundColor: '#fcfcfd',
    padding: 12,
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    elevation: 1,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 18,
  },
  approveButton: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  rejectButton: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    paddingVertical: 10,
    height: 48,
  },
  tableSection: {
    marginTop: 12,
    backgroundColor: '#f9fafc',
    padding: 12,
    borderRadius: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#fff',
  },
  tableHeader: {
    backgroundColor: '#edf2f7',
    height: 50,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2c3e50',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
    height: 46,
  },
  documentSection: {
    marginTop: 12,
    backgroundColor: '#f9fafc',
    padding: 12,
    borderRadius: 12,
  },
  documentChip: {
    margin: 6,
    backgroundColor: '#E3F2FD',
    height: 40,
    borderRadius: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  noDocuments: {
    fontStyle: 'italic',
    color: '#757575',
    marginTop: 12,
    textAlign: 'center',
    padding: 10,
  }
});

// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TextInput as RNTextInput,
//   TouchableOpacity,
//   Linking,
//   ScrollView,
// } from 'react-native';
// import AppSafeArea from '../component/AppSafeArea';
// import {
//   Appbar,
//   Avatar,
//   Chip,
//   Divider,
//   Card,
//   Title,
//   Subheading,
//   Badge,
//   Button as PaperButton,
//   DataTable,
//   TextInput,
// } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/Feather';
// import LinearGradient from 'react-native-linear-gradient';
// import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
// import axios from 'axios';
// import BASE_URL from '../constants/apiConfig';
// import FeedbackModal from '../component/FeedbackModal';

// import {useAuth} from '../constants/AuthContext';
// // Import the Pagination component
// import Pagination from '../components/Pagination';
// // Import Picker for task assignment dropdown
// import {Picker} from '@react-native-picker/picker';
// // Import the new LeaveBalanceTable component
// import LeaveBalanceTable from '../components/LeaveBalanceTable';

// const LeaveTypeColors = {
//   'Casual Leave': '#3b82f6', // Blue
//   'Sick Leave': '#ef4444', // Red
//   'Paid Leave': '#10b981', // Green
// };

// const LeaveRequest = ({navigation}) => {
//   const employeeDetails = useFetchEmployeeDetails();
//   const {user} = useAuth();

//   // console.log('First ======================================', user);
//   // console.log('Employee Details:', employeeDetails);
//   const [leaveApprovalAccess, setLeaveApprovalAccess] = useState(null);
//   const [approvalList, setApprovalList] = useState([]); // State to hold the approval list
//   const [approveLeaveId, setapproveLeaveId] = useState(null); // State to hold the applyLeaveId
//   const [leaveDetails, setLeaveDetails] = useState(null);
//   const [isAuthorizedForFinalApproval, setIsAuthorizedForFinalApproval] = useState(false);
//   // Add state for pending requests count
//   const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

//   // Add state to track if user is a reporting manager
//   const [isReportingManager, setIsReportingManager] = useState(false);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items to display per page
//   const [paginatedData, setPaginatedData] = useState([]);

//   // Add state for task assignment
//   const [taskAssignmentEmployees, setTaskAssignmentEmployees] = useState([]);
//   const [selectedTaskAssignee, setSelectedTaskAssignee] = useState({});

//   // New state for leave balance data
//   const [leaveData, setLeaveData] = useState([]);
//   const [isLoadingLeaveData, setIsLoadingLeaveData] = useState(false);

//   // Feedback modal state
//   const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
//   const [feedbackModalType, setFeedbackModalType] = useState('success');
//   const [feedbackModalMessage, setFeedbackModalMessage] = useState('');

//   // Function to show feedback modal
//   const showFeedbackModal = (type, message) => {
//     setFeedbackModalType(type);
//     setFeedbackModalMessage(message);
//     setFeedbackModalVisible(true);
//   };

//   // Function to hide feedback modal
//   const hideFeedbackModal = () => {
//     setFeedbackModalVisible(false);
//   };

//   useEffect(() => {
//     if (employeeDetails) {
//       fetchLeaveApprovalData();
//       fetchTaskAssignmentEmployees(); // Fetch employees for task assignment
//     }
//   }, [employeeDetails]);

//   // Add another useEffect to initialize approvedLeaveCount and unapprovedLeaveCount when approvalList changes
//   useEffect(() => {
//     if (Array.isArray(approvalList) && approvalList.length > 0) {
//       const initialCounts = {};
//       const initialUnapprovedCounts = {};
      
//       approvalList.forEach(item => {
//         const id = item.id || item.applyLeaveId;
//         initialCounts[id] = item.leaveNo || 0;
//         initialUnapprovedCounts[id] = 0; // Initialize unapproved count with 0
//       });
      
//       setApprovedLeaveCount(initialCounts);
//       setUnapprovedLeaveCount(initialUnapprovedCounts);
      
//       // Reset to first page when approval list changes
//       setCurrentPage(1);
      
//       // Update paginated data
//       updatePaginatedData(approvalList, 1);
//     } else {
//       setPaginatedData([]);
//     }
//   }, [approvalList]);

//   // Update paginated data whenever current page changes
//   useEffect(() => {
//     updatePaginatedData(approvalList, currentPage);
//   }, [currentPage]);

//   // Function to paginate data
//   const updatePaginatedData = (data, page) => {
//     if (!Array.isArray(data) || data.length === 0) {
//       setPaginatedData([]);
//       return;
//     }

//     const startIndex = (page - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const paginatedItems = data.slice(startIndex, endIndex);

//     console.log(
//       `Paginating: Page ${page}, showing items ${startIndex + 1}-${Math.min(
//         endIndex,
//         data.length,
//       )} of ${data.length}`,
//     );

//     setPaginatedData(paginatedItems);
//   };

//   // Handle page change
//   const handlePageChange = newPage => {
//     console.log(`Changing to page ${newPage}`);
//     setCurrentPage(newPage);
//   };

//   const fetchLeaveApprovalData = async () => {
//     const accessData = await fetchFunctionalAccessMenus();
//     setLeaveApprovalAccess(accessData);
//     // console.log('Leave approval access data set:', accessData);

//     const userType = user?.userType; // static as per requirement
//     const employeeId = user?.id;
//     const companyId = user?.childCompanyId;
//     let hasAccess = false;

//     if (Array.isArray(accessData)) {
//       hasAccess = accessData.some(
//         item => item.employeeId === employeeId || userType === 2,
//       );
//     }

//     let ApprovalList;
//     try {
//       let apiUrl = '';
//       if (hasAccess) {
//         apiUrl = `${BASE_URL}/ApplyLeave/GetLeaveListForFinalApproval/${companyId}/${employeeId}`;
//       } else {
//         apiUrl = `${BASE_URL}/ApplyLeave/GetApplyLeaveListForApproval/${companyId}/${employeeId}`;
//       }
//       // debugger;;
//       ApprovalList = await axios.get(apiUrl);
//       ApprovalList.data = ApprovalList.data.filter(
//         item => item.employeeId != employeeDetails?.id,
//       );

//       // Get the pending request count
//       if (Array.isArray(ApprovalList.data)) {
//         setPendingRequestsCount(ApprovalList.data.length);
//       }

//       // console.log('Leave =================list:', ApprovalList.data);
//     } catch (err) {
//       console.error('Error fetching leave list:', err);
//     }

//     let roleurl = '';
//     roleurl = `${BASE_URL}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
//     const response = await axios.get(roleurl);
//     let roleData = null;
//     // console.log('Role Details========:', response.data);

//     // Check if current user is authorized for final approval
//     if (Array.isArray(response.data)) {
//       // Check if employee ID exists in role details
//       const isAuthorized = response.data.some(
//         role => role.employeeId === employeeDetails?.id,
//         // (role.roleId === 1 || role.branchId === 0)
//       );
//       setIsAuthorizedForFinalApproval(isAuthorized);

//       // Determine if the user is a reporting manager
//       // Check if user is a reporting manager (not an HR/final approver)
//       const isManager = hasAccess && !isAuthorized;
//       setIsReportingManager(isManager);

//       // If employeeId matches, get that role data, else get the first role as fallback
//       roleData =
//         response.data.find(item => item.employeeId === employeeDetails?.id) ||
//         response.data[0] ||
//         null;
//     }
//     // console.log('Role Data==============================', roleData);

//     if (roleData.branchId != 0) {
//       ApprovalList = ApprovalList.data.some(
//         item => item.branchId === roleData.branchId,
//       );
//     }
//     // console.log('Filtered fffffffApproval List:', ApprovalList.data);

//     // Integrate the filtered approval list into the UI
//     // Set the approval list state for FlatList rendering
//     setApprovalList(Array.isArray(ApprovalList.data) ? ApprovalList.data : []);
//   };

//   // debugger

//   function formatDateForBackend(date) {
//     if (!date || isNaN(new Date(date).getTime())) return null;
//     const d = new Date(date);
//     const pad = n => String(n).padStart(2, '0');
//     return (
//       d.getFullYear() +
//       '-' +
//       pad(d.getMonth() + 1) +
//       '-' +
//       pad(d.getDate()) +
//       'T' +
//       pad(d.getHours()) +
//       ':' +
//       pad(d.getMinutes()) +
//       ':' +
//       pad(d.getSeconds())
//     );
//   }

//   const fetchFunctionalAccessMenus = async () => {
//     try {
//       const requestData = {
//         DepartmentId: user?.departmentId || 0,
//         DesignationId: user?.designtionId || 0,
//         EmployeeId: user?.id || 0,
//         ControllerName: 'Leaveapproval',
//         ActionName: 'LeaveapprovalList',
//         ChildCompanyId: user?.childCompanyId || 1,
//         BranchId: user?.branchId || 2,
//         UserType: user?.userType || 1,
//       };

//       // console.log(
//       //   'Sending request data for leave approval access:',
//       //   requestData,
//       // );

//       const response = await axios.post(
//         `${BASE_URL}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
//         requestData,
//       );

//       // console.log('Leave fetchFunctionalAccessMenus:', response.data);

//       return response.data;
//     } catch (error) {
//       console.error('Error fetching functional access menus:', error);
//       return null;
//     }
//   };

//   // console.log(employeeDetails, 'Employee Details');

//   const [rmRemarks, setRmRemarks] = useState({});
//   const [approvalRemarks, setApprovalRemarks] = useState({});
//   const [expandedCard, setExpandedCard] = useState(null);
//   const [approvalLeaveId, setApprovalLeaveId] = useState(null);
//   // Add state for approved leave count per request
//   const [approvedLeaveCount, setApprovedLeaveCount] = useState({});
//   // Add state for unapproved leave count per request
//   const [unapprovedLeaveCount, setUnapprovedLeaveCount] = useState({});
//   // Add validation state for the leave count inputs
//   const [leaveCountErrors, setLeaveCountErrors] = useState({});

//   // debugger;
//   const handleApprove = async id => {
//     try {
//       // First fetch the detailed leave data directly from API
//       const leaveDetails = await fetchLeaveDetailsById(id);

//       if (!leaveDetails) {
//         showFeedbackModal('fail', 'Cannot fetch leave request details');
//         return;
//       }

//       // Find matching item in approval list for UI display purposes
//       const leaveItem = approvalList.find(
//         item => (item.id || item.applyLeaveId) === id,
//       );

//       if (!leaveItem) {
//         showFeedbackModal('fail', 'Cannot find leave request details');
//         return;
//       }

//       const leaveNo = leaveDetails.leaveNo || leaveItem.leaveNo || 0;

//       if (leaveNo === 0) {
//         showFeedbackModal('fail', 'Leave days (leaveNo) cannot be zero');
//         return;
//       }

//       const approvedCount = Number(approvedLeaveCount[id]) || 0;
//       const unapprovedCount = Number(unapprovedLeaveCount[id]) || 0;
//       const totalCount = approvedCount + unapprovedCount;
      
//       // Validate leave counts before proceeding
//       const isValid = validateLeaveCounts(id, approvedCount.toString(), unapprovedCount.toString(), leaveNo);
      
//       if (!isValid) {
//         // Get the error message to display
//         const errors = leaveCountErrors[id] || {};
//         showFeedbackModal('fail', errors.total || 'Please enter valid values for leave days');
//         return;
//       }

//       // Step 1: Check if payroll already generated
//       const payrollCheckBody = {
//         EmployeeId: leaveDetails.employeeId,
//         CompanyId: leaveDetails.companyId,
//         BranchId: leaveDetails.branchId || 0,
//         fromLeaveDate: formatDateForBackend(leaveDetails.fromLeaveDate),
//       };

//       const payrollRes = await axios.post(
//         `${BASE_URL}/PayRollRun/CheckPayRollCreationForLeaveApproval`,
//         payrollCheckBody,
//       );

//       if (payrollRes?.data?.isSuccess) {
//         showFeedbackModal('fail', 'Payroll already generated for this employee. Leave cannot be approved.');
//         return;
//       }

//       // Step 2: Check if current user is in authorization list
//       const currentUserId = employeeDetails?.id;
//       console.log('Current user ID:', currentUserId);
//       console.log('Cached approval access data:', leaveApprovalAccess);

//       // First check if we have cached access data
//       let accessData = leaveApprovalAccess;

//       // If not cached, fetch it
//       if (!Array.isArray(accessData) || accessData.length === 0) {
//         console.log('No cached approval data, fetching fresh data...');
//         accessData = await fetchFunctionalAccessMenus();
//         console.log('Freshly fetched approval data:', accessData);
//       }

//       // Check if current user is an authorization person
//       let isAuthorizationPerson = false;

//       if (Array.isArray(accessData)) {
//         // Log each entry to debug
//         accessData.forEach((person, index) => {
//           console.log(`Authorization person ${index}:`, person);
//         });

//         // Match by employeeId
//         isAuthorizationPerson = accessData.some(person => {
//           const match = person.employeeId === currentUserId;
//           if (match) {
//             console.log('Found matching authorization person:', person);
//           }
//           return match;
//         });
//       }

//       console.log('Is authorization person:', isAuthorizationPerson);

//       // Step 3: Construct payload using the detailed data from API
//       const taskAssignment = selectedTaskAssignee[id] || {};

//       const approvalPayload = {
//         CompanyId: leaveDetails.companyId,
//         Id: leaveDetails.id,
//         Visible: false,
//         EmployeeId: leaveDetails.employeeId,
//         ReportingId: leaveDetails.reportingId,
//         DocumentPath: leaveDetails.documentPath || '',
//         EmployeeEmail: leaveDetails.employeeEmail || '',
//         ApplyLeaveId: leaveDetails.applyLeaveId || 0,
//         DepartmentId: leaveDetails.departmentId,
//         ReportingMgerEmail: leaveDetails.reportingMgerEmail || '',
//         ReportTaskEmail: leaveDetails.reportTaskEmail || '',
//         ToLeaveDate: leaveDetails.toLeaveDate,
//         FromLeaveDate: leaveDetails.fromLeaveDate,
//         EmployeeName: leaveDetails.employeeName,
//         EmployeeCode: leaveDetails.employeeCode,
//         Designation: leaveDetails.designation,
//         Department: leaveDetails.department,
//         Remarks: rmRemarks[id] || leaveDetails.remarks || '',
//         LeaveNo: leaveNo,
//         ApprovedPaidLeave: approvedCount,
//         ApprovedUnpaidLeave: unapprovedCount,
//         ApprovalStatus: 1, // 1 means approved
//         taskAssignmentEmpId:
//           taskAssignment.employeeId || leaveDetails.taskAssignmentEmpId || 0,
//         taskAssignEmployeeCode:
//           taskAssignment.employeeCode ||
//           leaveDetails.taskAssignEmployeeCode ||
//           '',
//         ReportingRemarks: rmRemarks[id] || '',
//         leaveType: leaveDetails.leaveType,
//         status: 'Approved',
//         flag: 1,
//         isDelete: 0,
//         createdBy: employeeDetails?.id || 0,
//         createdDate: new Date().toISOString(),
//         modifiedBy: employeeDetails?.id || 0,
//         modifiedDate: new Date().toISOString(),
//       };

//       // Debug the exact payload being sent
//       console.log(
//         'Final approval payload using detailed data:',
//         JSON.stringify(approvalPayload, null, 2),
//       );

//       const endpoint = isAuthorizationPerson
//         ? `${BASE_URL}/LeaveApproval/SaveLeaveFinalApproval`
//         : `${BASE_URL}/LeaveApproval/SaveLeaveApproval`;

//       console.log('Submitting leave approval to:', endpoint);

//       const approvalRes = await axios.post(endpoint, approvalPayload);
//       const {data} = approvalRes;

//       // Log the full backend response for debugging
//       console.log('Backend response:', {
//         status: approvalRes.status,
//         statusText: approvalRes.statusText,
//         headers: approvalRes.headers,
//         data: data,
//       });

//       if (data?.isSuccess) {
//         // Simplified success message without employee details
//         showFeedbackModal('success', 'Leave Approved Successfully!');

//         // After successful approval, refresh the list
//         fetchLeaveApprovalData();
//       } else {
//         console.error('Backend returned error:', data);
//         showFeedbackModal('fail', `Approval Failed: ${data?.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Exception during approval:', error);
//       console.error('Error details:', error.response?.data || error.message);
//       showFeedbackModal('fail', 'An unexpected error occurred during leave approval. Please try again.');
//     }
//   };

//   const handleReject = async id => {
//     try {
//       // First fetch the detailed leave data directly from API
//       const leaveDetails = await fetchLeaveDetailsById(id);

//       if (!leaveDetails) {
//         showFeedbackModal('fail', 'Cannot fetch leave request details');
//         return;
//       }

//       // Find matching item in approval list for UI display purposes
//       const leaveItem = approvalList.find(
//         item => (item.id || item.applyLeaveId) === id,
//       );

//       if (!leaveItem) {
//         showFeedbackModal('fail', 'Cannot find leave request details');
//         return;
//       }

//       // Validate that remarks are provided for rejection
//       if (!rmRemarks[id]) {
//         showFeedbackModal('fail', 'Please provide remarks for rejecting this leave request');
//         return;
//       }

//       // Step 1: Check if current user is in authorization list
//       const currentUserId = employeeDetails?.id;

//       // First check if we have cached access data
//       let accessData = leaveApprovalAccess;

//       // If not cached, fetch it
//       if (!Array.isArray(accessData) || accessData.length === 0) {
//         accessData = await fetchFunctionalAccessMenus();
//       }

//       // Check if current user is an authorization person
//       let isAuthorizationPerson = false;

//       if (Array.isArray(accessData)) {
//         isAuthorizationPerson = accessData.some(
//           person => person.employeeId === currentUserId,
//         );
//       }

//       console.log(
//         'Is authorization person for rejection:',
//         isAuthorizationPerson,
//       );

//       // Step 2: Construct payload using the detailed data from API
//       const rejectPayload = {
//         CompanyId: leaveDetails.companyId,
//         Id: leaveDetails.id,
//         Visible: false,
//         EmployeeId: leaveDetails.employeeId,
//         ReportingId: leaveDetails.reportingId,
//         DocumentPath: leaveDetails.documentPath || '',
//         EmployeeEmail: leaveDetails.employeeEmail || '',
//         ApplyLeaveId: leaveDetails.applyLeaveId || 0,
//         DepartmentId: leaveDetails.departmentId,
//         ReportingMgerEmail: leaveDetails.reportingMgerEmail || '',
//         ReportTaskEmail: leaveDetails.reportTaskEmail || '',
//         ToLeaveDate: leaveDetails.toLeaveDate,
//         FromLeaveDate: leaveDetails.fromLeaveDate,
//         EmployeeName: leaveDetails.employeeName,
//         EmployeeCode: leaveDetails.employeeCode,
//         Designation: leaveDetails.designation,
//         Department: leaveDetails.department,
//         Remarks: rmRemarks[id] || leaveDetails.remarks || '',
//         LeaveNo: leaveDetails.leaveNo || leaveItem.leaveNo || 0,
//         ApprovedPaidLeave: 0,
//         ApprovedUnpaidLeave: 0,
//         ApprovalStatus: 2, // 2 means rejected
//         ReportingRemarks: rmRemarks[id] || 'Rejected by reporting manager',
//         leaveType: leaveDetails.leaveType,
//         status: 'Rejected',
//         flag: 1,
//         isDelete: 0,
//         createdBy: employeeDetails?.id || 0,
//         createdDate: new Date().toISOString(),
//         modifiedBy: employeeDetails?.id || 0,
//         modifiedDate: new Date().toISOString(),
//       };

//       // Debug the exact payload being sent
//       console.log(
//         'Final rejection payload:',
//         JSON.stringify(rejectPayload, null, 2),
//       );

//       const endpoint = isAuthorizationPerson
//         ? `${BASE_URL}/LeaveApproval/SaveLeaveFinalApproval`
//         : `${BASE_URL}/LeaveApproval/SaveLeaveApproval`;

//       console.log('Submitting leave rejection to:', endpoint);

//       const rejectionRes = await axios.post(endpoint, rejectPayload);
//       const {data} = rejectionRes;

//       // Log the full backend response for debugging
//       console.log('Backend response for rejection:', {
//         status: rejectionRes.status,
//         statusText: rejectionRes.statusText,
//         data: data,
//       });

//       if (data?.isSuccess) {
//         showFeedbackModal(
//           'success',
//           `Leave Rejected Successfully\n\nEmployee: ${leaveItem.employeeName}\nLeave Type: ${leaveItem.leaveName}\nReason: ${rmRemarks[id]}`
//         );

//         // After successful rejection, refresh the list
//         fetchLeaveApprovalData();
//       } else {
//         console.error('Backend returned error on rejection:', data);
//         showFeedbackModal('fail', `Rejection Failed: ${data?.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Exception during rejection:', error);
//       console.error('Error details:', error.response?.data || error.message);
//       showFeedbackModal('fail', 'An unexpected error occurred during leave rejection. Please try again.');
//     }
//   };

//   const formatDate = dateString => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };
//   // debugger
//   // Function to fetch leave details by ID
//   const fetchLeaveDetailsById = async id => {
//     try {
//       console.log(`Fetching leave details for ID: ${id}`);

//       const response = await axios.get(
//         `${BASE_URL}/ApplyLeave/GetApplyLeaveDetailsById/${id}`,
//       );
//       console.log(
//         'Leave Details API ==============================Response:',
//         JSON.stringify(response.data, null, 2),
//       );
//       setLeaveDetails(response.data);
      
//       // Fetch leave balances for this employee
//       if (response.data && response.data.employeeId) {
//         fetchLeaveData(response.data.employeeId);
//       }
      
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching leave details:', error);
//       console.error('Error details:', error.response?.data || error.message);
//       return null;
//     }
//   };
  
//   // Function to fetch leave balance data
//   const fetchLeaveData = async (employeeId) => {
//     try {
//       setIsLoadingLeaveData(true);
      
//       if (!employeeId) return;
      
//       const companyId = user?.childCompanyId;
//       if (!companyId) return;

//       console.log(`Fetching leave balances for employee ${employeeId} in company ${companyId}`);
      
//       const response = await axios.get(
//         `${BASE_URL}/CommonDashboard/GetEmployeeLeaveDetails/${companyId}/${employeeId}`,
//       );

//       if (response.data && response.data.leaveBalances) {
//         const transformed = response.data.leaveBalances.map(item => ({
//           label: item.leavename,
//           used: item.usedLeaveNo,
//           available: item.availbleLeaveNo,
//         }));

//         console.log('Leave balance data:', transformed);
//         setLeaveData(transformed);
//       } else {
//         console.log('No leave balance data available');
//         setLeaveData([]);
//       }
//     } catch (error) {
//       console.error('Error fetching leave data:', error.message);
//       setLeaveData([]);
//     } finally {
//       setIsLoadingLeaveData(false);
//     }
//   };

//   // Toggle card expansion
//   const toggleCardExpansion = async id => {
//     // If we're expanding a card, fetch its details
//     if (expandedCard !== id) {
//       const details = await fetchLeaveDetailsById(id);
//       console.log('Expanded Leave Details:', JSON.stringify(details, null, 2));
//     }
//     setExpandedCard(expandedCard === id ? null : id);
//   };

//   const fetchTaskAssignmentEmployees = async (filterEmployeeId = null) => {
//     try {
//       const companyId = user?.childCompanyId;
//       const departmentId = leaveDetails?.departmentId;
//       const requestEmployeeId = leaveDetails?.employeeId;

//       if (!companyId) {
//         console.log('Missing company ID, cannot fetch employees');
//         return;
//       }

//       // First API call - Get employees by department
//       const apiUrl = `${BASE_URL}/EmpRegistration/GetEmployeeByDepartmentId/${companyId}/${departmentId}`;
//       console.log('Fetching employees from:', apiUrl);

//       const response = await axios.get(apiUrl);

//       if (!response.data || !Array.isArray(response.data)) {
//         console.log('No employee data received or invalid format');
//         return;
//       }

//       const employeesData = Array.isArray(response.data) ? response.data : [];

//       console.log('=== EMPLOYEE DATA SUMMARY ===');
//       console.log(`Total employees received: ${employeesData.length}`);
//       console.log(`Request employee ID: ${requestEmployeeId}`);

//       const employeeToFilter = employeesData.find(
//         emp => emp.id === requestEmployeeId,
//       );

//       const filteredEmployees = employeesData.filter(
//         employee => employee.id !== requestEmployeeId,
//       );

//       console.log(`=== FILTERING RESULTS ===`);
//       console.log(
//         `Filtered ${
//           employeesData.length - filteredEmployees.length
//         } employees, keeping ${filteredEmployees.length} for task assignment`,
//       );

//       if (employeeToFilter) {
//         console.log('=== REMOVED EMPLOYEE ===');
//         console.log(JSON.stringify(employeeToFilter, null, 2));
//       }

//       const employeeSummary = filteredEmployees.map(emp => ({
//         id: emp.id,
//         employeeId: emp.employeeId,
//         employeeName: emp.employeeName,
//         department: emp.departmentName,
//         designation: emp.designationName,
//       }));

//       console.log('=== FILTERED EMPLOYEES SUMMARY ===');
//       console.log(JSON.stringify(employeeSummary, null, 2));

//       // Second API call - Get employees assigned to the same shift
//       let shiftEmployeeIds = [];
//       try {
//         if (requestEmployeeId) {
//           const shiftApiUrl = `${BASE_URL}/Shift/GetRotaAsignedEmployeeByEmployeeId/${requestEmployeeId}`;
//           console.log('Fetching shift employees from:', shiftApiUrl);

//           const shiftResponse = await axios.get(shiftApiUrl);

//           if (shiftResponse.data && Array.isArray(shiftResponse.data)) {
//             shiftEmployeeIds = shiftResponse.data;
//             console.log('=== EMPLOYEES IN SAME SHIFT ===');
//             console.log(JSON.stringify(shiftEmployeeIds, null, 2));
//           }
//         }
//       } catch (shiftError) {
//         console.error('Error fetching shift employees:', shiftError);
//       }

//       // Match shiftEmployeeIds with filteredEmployees
//       let finalTaskAssignmentEmployees = filteredEmployees;

//       if (shiftEmployeeIds.length > 0) {
//         finalTaskAssignmentEmployees = filteredEmployees.filter(emp =>
//           shiftEmployeeIds.includes(emp.id),
//         );

//         console.log('=== FINAL MATCHED EMPLOYEES ===');
//         const finalSummary = finalTaskAssignmentEmployees.map(emp => ({
//           id: emp.id,
//           employeeId: emp.employeeId,
//           employeeName: emp.employeeName,
//           department: emp.departmentName,
//           designation: emp.designationName,
//         }));
//         console.log(JSON.stringify(finalSummary, null, 2));
//       }

//       setTaskAssignmentEmployees(finalTaskAssignmentEmployees);
//     } catch (error) {
//       console.error('Error fetching employees:', error);
//       setTaskAssignmentEmployees([]);
//       return null;
//     }
//   };

//   // Add helper function to update task assignee (if not already added)
//   const updateTaskAssignee = (leaveId, employeeId) => {
//     if (!employeeId) return;

//     const selectedEmployee = taskAssignmentEmployees.find(
//       emp => emp.id === employeeId,
//     );

//     if (selectedEmployee) {
//       console.log(
//         `Setting task assignee for leave ID ${leaveId}:`,
//         selectedEmployee,
//       );

//       setSelectedTaskAssignee(prev => ({
//         ...prev,
//         [leaveId]: {
//           employeeId: selectedEmployee.id,
//           employeeName: selectedEmployee.employeeName,
//           employeeCode: selectedEmployee.employeeId,
//         },
//       }));
//     }
//   };

//   // Add validation function for leave counts
//   const validateLeaveCounts = (itemId, approvedCount, unapprovedCount, totalLeaveNo) => {
//     const approvedNum = Number(approvedCount) || 0;
//     const unapprovedNum = Number(unapprovedCount) || 0;
//     const totalCount = approvedNum + unapprovedNum;
//     const totalLeave = Number(totalLeaveNo) || 0;
    
//     let errors = {};
    
//     // Validate that total is not more than requested leave days
//     if (totalCount > totalLeave) {
//       errors.total = `Total (${totalCount}) exceeds requested days (${totalLeave})`;
//       errors.approved = true;
//       errors.unapproved = true;
//     }
    
//     // Validate that approved and unapproved are not negative
//     if (approvedNum < 0) {
//       errors.approved = true;
//       errors.approvedMsg = "Cannot be negative";
//     }
    
//     if (unapprovedNum < 0) {
//       errors.unapproved = true;
//       errors.unapprovedMsg = "Cannot be negative";
//     }
    
//     // Validate that the total is not zero
//     if (totalCount === 0 && (approvedCount !== '' || unapprovedCount !== '')) {
//       errors.total = "Total leave days cannot be zero";
//       errors.approved = approvedNum === 0;
//       errors.unapproved = unapprovedNum === 0;
//     }
    
//     // Update errors state
//     setLeaveCountErrors(prev => ({
//       ...prev,
//       [itemId]: errors
//     }));
    
//     // Return true if no errors
//     return Object.keys(errors).length === 0;
//   };
  
//   const renderItem = ({item}) => {
//     const isExpanded = expandedCard === (item.id || item.applyLeaveId);
//     const leaveType = item.leaveName || 'Leave';
//     const leaveColor = LeaveTypeColors[leaveType] || '#6b7280';
//     const itemId = item.id || item.applyLeaveId;
//     const itemErrors = leaveCountErrors[itemId] || {};

//     return (
//       <Card
//         style={[styles.card, isExpanded && styles.expandedCard]}
//         onPress={() => toggleCardExpansion(itemId)}>
//         <Card.Content>
//           {/* Header with employee info and avatar */}
//           <View style={styles.cardHeader}>
//             <View style={styles.employeeInfoContainer}>
//               <Avatar.Text 
//                 size={46} 
//                 label={item.employeeName.substring(0, 2).toUpperCase()}
//                 style={styles.avatar} 
//               />
//               <View style={styles.employeeTextInfo}>
//                 <Title style={styles.employeeName}>{item.employeeName}</Title>
//                 <View style={styles.employeeDetails}>
//                   <View style={styles.detailItem}>
//                     <Icon
//                       name="briefcase"
//                       size={14}
//                       color="#6B7280"
//                       style={styles.detailIcon}
//                     />
//                     <Text style={styles.detailText}>
//                       {item.designation || 'Not specified'}
//                     </Text>
//                   </View>
//                   <View style={styles.detailDivider} />
//                   <View style={styles.detailItem}>
//                     <Icon
//                       name="users"
//                       size={14}
//                       color="#6B7280"
//                       style={styles.detailIcon}
//                     />
//                     <Text style={styles.detailText}>
//                       {item.department || 'Not specified'}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//             <Chip 
//               style={[styles.leaveTypeChip, {backgroundColor: `${leaveColor}20`}]}
//               textStyle={{color: leaveColor, fontWeight: '700'}}>
//               {leaveType}
//             </Chip>
//           </View>

//           <Divider style={styles.sectionDivider} />

//           {/* Date and duration info */}
//           <View style={styles.dateOuterContainer}>
//             <View style={styles.dateInnerContainer}>
//               <View style={styles.dateFromToContainer}>
//                 <Card style={styles.dateCard}>
//                   <Card.Content style={styles.dateCardContent}>
//                     <Text style={styles.dateLabel}>From</Text>
//                     <Text style={styles.dateValue}>
//                       {formatDate(item.fromLeaveDate)}
//                     </Text>
//                   </Card.Content>
//                 </Card>
//                 <View style={styles.dateArrow}>
//                   <Icon name="arrow-right" size={18} color="#9ca3af" />
//                 </View>
//                 <Card style={styles.dateCard}>
//                   <Card.Content style={styles.dateCardContent}>
//                     <Text style={styles.dateLabel}>To</Text>
//                     <Text style={styles.dateValue}>
//                       {formatDate(item.toLeaveDate)}
//                     </Text>
//                   </Card.Content>
//                 </Card>
//               </View>
//               <View style={styles.daysContainer}>
//                 <Text style={styles.daysValue}>{item.leaveNo}</Text>
//                 <Text style={styles.daysLabel}>
//                   {item.leaveNo > 1 ? 'Days' : 'Day'}
//                 </Text>
//               </View>
//             </View>

//             {/* Duration type */}
//             <View style={styles.durationTypeContainer}>
//               <Icon
//                 name="clock"
//                 size={16}
//                 color="#6b7280"
//                 style={styles.durationIcon}
//               />
//               <Text style={styles.durationText}>
//                 {item.leaveDuration || 'Full Day'}
//               </Text>
//             </View>
//           </View>

//           {/* Reason/Remarks Section */}
//           <Card style={styles.remarksCard}>
//             <Card.Content>
//               <View style={styles.remarksSection}>
//                 <Subheading style={styles.remarksLabel}>Reason:</Subheading>
//                 <Text style={styles.remarksValue}>
//                   {item.remarks || 'No reason provided'}
//                 </Text>
//               </View>
//             </Card.Content>
//           </Card>

//           {/* Status Section with color-coded status */}
//           {isAuthorizedForFinalApproval && (
//             <Card style={[styles.remarksCard, {marginTop: 12}]}>
//               <Card.Content>
//                 <View style={styles.statusSection}>
//                   <Subheading style={styles.remarksLabel}>Reporting Manager Remarks:</Subheading>
//                   <Text style={styles.remarksValue}>
//                     {item.reportingRemarks || 'No remarks provided'}
//                   </Text>
//                 </View>
//                 <View style={styles.statusBadgeContainer}>
//                   <Badge 
//                     style={styles.statusBadge}
//                     size={20}>
//                     Pending
//                   </Badge>
//                 </View>
//               </Card.Content>
//             </Card>
//           )}

//           {/* Expanded section */}
//           {isExpanded && (
//             <View style={styles.expandedSection}>
//               <Divider style={styles.divider} />

//               {/* Document section */}
//               {item.documentPath ? (
//                 <View style={styles.sectionContainer}>
//                   <Subheading style={styles.sectionTitle}>Supporting Document</Subheading>
//                   <PaperButton
//                     icon="file-document"
//                     mode="outlined"
//                     onPress={() => Linking.openURL(item.documentPath)}
//                     style={styles.documentButton}>
//                     View document
//                   </PaperButton>
//                 </View>
//               ) : null}

//               {/* Assignment Employee Department if available */}
//               {item.assignmentEmpDepartment && (
//                 <Card style={styles.infoCard}>
//                   <Card.Content>
//                     <Subheading style={styles.sectionTitle}>
//                       Assigned Employee Department
//                     </Subheading>
//                     <Text style={styles.infoText}>
//                       {item.assignmentEmpDepartment}
//                     </Text>
//                   </Card.Content>
//                 </Card>
//               )}

//               {/* Assignment Employee Designation if available */}
//               {item.assignmentEmpDesignation && (
//                 <Card style={styles.infoCard}>
//                   <Card.Content>
//                     <Subheading style={styles.sectionTitle}>
//                       Assigned Employee Designation
//                     </Subheading>
//                     <Text style={styles.infoText}>
//                       {item.assignmentEmpDesignation}
//                     </Text>
//                   </Card.Content>
//                 </Card>
//               )}

//               {/* Leave approval fields - Only show approved and unapproved fields to HR/Final Approvers */}
//               {isAuthorizedForFinalApproval && (
//                 <Card style={styles.infoCard}>
//                   <Card.Content>
//                     <View style={styles.leaveCountContainer}>
//                       {/* How many days approved? */}
//                       <View style={styles.leaveCountField}>
//                         <Subheading style={styles.sectionTitle}>No of Approved Leave</Subheading>
//                         <TextInput
//                           style={[
//                             styles.enhancedTextInput,
//                             itemErrors.approved && styles.inputError,
//                           ]}
//                           placeholder="Enter approved days"
//                           placeholderTextColor="#9ca3af"
//                           keyboardType="numeric"
//                           value={
//                             approvedLeaveCount[itemId]
//                               ? approvedLeaveCount[itemId].toString()
//                               : item.leaveNo?.toString() || '0'
//                           }
//                           onChangeText={text => {
//                             const val = text.replace(/[^0-9-]/g, '');
//                             setApprovedLeaveCount(prev => ({
//                               ...prev,
//                               [itemId]: val,
//                             }));

//                             // Validate as user types
//                             validateLeaveCounts(
//                               itemId,
//                               val,
//                               unapprovedLeaveCount[itemId] || '0',
//                               item.leaveNo,
//                             );
//                           }}
//                           mode="outlined"
//                           theme={{ colors: { primary: '#3b82f6' }}}
//                         />
//                         {itemErrors.approvedMsg && (
//                           <Text style={styles.errorText}>
//                             {itemErrors.approvedMsg}
//                           </Text>
//                         )}
//                       </View>

//                       {/* How many days unapproved? */}
//                       <View style={styles.leaveCountField}>
//                         <Subheading style={styles.sectionTitle}>
//                           No of UnApproval Leave
//                         </Subheading>
//                         <TextInput
//                           style={[
//                             styles.enhancedTextInput,
//                             itemErrors.unapproved && styles.inputError,
//                           ]}
//                           placeholder="Enter unapproved days"
//                           placeholderTextColor="#9ca3af"
//                           keyboardType="numeric"
//                           value={
//                             unapprovedLeaveCount[itemId]
//                               ? unapprovedLeaveCount[itemId].toString()
//                               : '0'
//                           }
//                           onChangeText={text => {
//                             const val = text.replace(/[^0-9-]/g, '');
//                             setUnapprovedLeaveCount(prev => ({
//                               ...prev,
//                               [itemId]: val,
//                             }));

//                             // Validate as user types
//                             validateLeaveCounts(
//                               itemId,
//                               approvedLeaveCount[itemId] ||
//                                 item.leaveNo?.toString() ||
//                                 '0',
//                               val,
//                               item.leaveNo,
//                             );
//                           }}
//                           mode="outlined"
//                           theme={{ colors: { primary: '#3b82f6' }}}
//                         />
//                         {itemErrors.unapprovedMsg && (
//                           <Text style={styles.errorText}>
//                             {itemErrors.unapprovedMsg}
//                           </Text>
//                         )}
//                       </View>
//                     </View>
//                   </Card.Content>
//                 </Card>
//               )}

//               {/* Leave Balance Table - Only for HR */}
//               {isAuthorizedForFinalApproval && (
//                 <Card style={styles.infoCard}>
//                   <Card.Content>
//                     <Subheading style={styles.sectionTitle}>Employee Leave Balances</Subheading>
//                     <LeaveBalanceTable
//                       leaveData={leaveData}
//                       isLoadingLeaveData={isLoadingLeaveData}
//                     />
//                   </Card.Content>
//                 </Card>
//               )}

//               {/* Reporting Manager Remarks */}
//               <Card style={styles.infoCard}>
//                 <Card.Content>
//                   <Subheading style={styles.sectionTitle}>
//                     {isAuthorizedForFinalApproval
//                       ? 'Final Approval Manager Remarks'
//                       : 'Reporting Manager Remarks'}
//                   </Subheading>
//                   <TextInput
//                     style={styles.remarksInput}
//                     placeholder={`Add your ${
//                       isAuthorizedForFinalApproval
//                         ? 'final approval'
//                         : 'reporting manager'
//                     } remarks here (required)`}
//                     placeholderTextColor="#9ca3af"
//                     maxLength={400}
//                     multiline
//                     value={rmRemarks[item.id || item.approvalRemarks] || ''}
//                     onChangeText={text =>
//                       setRmRemarks(prev => ({
//                         ...prev,
//                         [item.id || item.setApprovalRemarks]: text,
//                       }))
//                     }
//                     mode="outlined"
//                     theme={{ colors: { primary: '#3b82f6' }}}
//                     numberOfLines={4}
//                   />
//                 </Card.Content>
//               </Card>

//               {/* Task Assignment Dropdown - Fixed to show for any non-HR approver */}
//               {!isAuthorizedForFinalApproval && (
//                 <Card style={styles.infoCard}>
//                   <Card.Content>
//                     <Subheading style={styles.sectionTitle}>Task Assignment</Subheading>
//                     <View style={styles.pickerContainer}>
//                       <Picker
//                         selectedValue={
//                           selectedTaskAssignee[itemId]?.employeeId || null
//                         }
//                         style={styles.picker}
//                         dropdownIconColor="#4B5563"
//                         onValueChange={itemValue =>
//                           updateTaskAssignee(itemId, itemValue)
//                         }>
//                         <Picker.Item
//                           label="Select an employee for task assignment"
//                           value={null}
//                           style={styles.pickerPlaceholder}
//                         />
//                         {taskAssignmentEmployees.map(employee => (
//                           <Picker.Item
//                             key={employee.id}
//                             label={`${employee.employeeName} (${
//                               employee.employeeId || 'N/A'
//                             })`}
//                             value={employee.id}
//                             style={styles.pickerItem}
//                           />
//                         ))}
//                       </Picker>
//                     </View>

//                     {/* Display selected employee information if available */}
//                     {selectedTaskAssignee[itemId] && (
//                       <Chip 
//                         icon="account-check" 
//                         style={styles.taskAssigneeSelected}>
//                         Task assigned to: {selectedTaskAssignee[itemId].employeeName}
//                       </Chip>
//                     )}
//                   </Card.Content>
//                 </Card>
//               )}

//               {/* Action Buttons */}
//               <View style={styles.buttonContainer}>
//                 <PaperButton
//                   mode="contained"
//                   icon="check-circle"
//                   style={[styles.button, styles.approveButton]}
//                   labelStyle={styles.buttonText}
//                   onPress={() => handleApprove(item.id || item.applyLeaveId)}>
//                   {isAuthorizedForFinalApproval ? 'Final Approve' : 'Approve'}
//                 </PaperButton>
//                 <PaperButton
//                   mode="contained"
//                   icon="close-circle"
//                   style={[styles.button, styles.rejectButton]}
//                   labelStyle={styles.buttonText}
//                   onPress={() => handleReject(item.id || item.applyLeaveId)}>
//                   Reject
//                 </PaperButton>
//               </View>
//             </View>
//           )}
//         </Card.Content>
//       </Card>
//     );
//   };

//   return (
//     <AppSafeArea>
//       <LinearGradient
//         colors={['#3b82f6', '#1d4ed8']}
//         start={{x: 0, y: 0}}
//         end={{x: 1, y: 0}}
//         style={styles.headerGradient}>
//         <Appbar.Header style={styles.header}>
//           <Appbar.BackAction
//             onPress={() => navigation.goBack()}
//             color="#FFFFFF"
//           />
//           <Appbar.Content
//             title="Exit Request Details"
//             titleStyle={styles.headerTitle}
//           />
//         </Appbar.Header>
//       </LinearGradient>

//       {/* Pending Requests Card - Updated to show actual count */}
//       {pendingRequestsCount > 0 && (
//         <Card style={styles.pendingAlertCard}>
//           <Card.Content style={styles.pendingAlertContent}>
//             <Icon
//               name="alert-circle"
//               size={20}
//               color="#f59e42"
//               style={{marginRight: 8}}
//             />
//             <Text style={styles.pendingAlertCountSmall}>
//               {pendingRequestsCount} Pending Request
//               {pendingRequestsCount !== 1 ? 's' : ''}
//             </Text>
//           </Card.Content>
//         </Card>
//       )}

//       <FlatList
//         contentContainerStyle={styles.listContainer}
//         data={paginatedData}
//         keyExtractor={item =>
//           item.id?.toString() ||
//           item.applyLeaveId?.toString() ||
//           Math.random().toString()
//         }
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         ListFooterComponent={() => (
//           <>
//             {/* Debug pagination visibility */}
//             {console.log('Pagination debug - List length:', approvalList.length, 'Should show pagination:', approvalList.length >= 3)}
            
//             {/* Only show pagination when there are 3 or more items */}
//             {approvalList.length >= 3 && (
//               <View style={styles.paginationContainer}>
//                 <Pagination
//                   currentPage={currentPage}
//                   totalPages={Math.ceil(approvalList.length / itemsPerPage)}
//                   onPageChange={handlePageChange}
//                   itemsPerPage={itemsPerPage}
//                   totalItems={approvalList.length}
//                 />
//               </View>
//             )}
//           </>
//         )}
//         ListEmptyComponent={
//           <Card style={styles.emptyCard}>
//             <Card.Content style={styles.emptyContainer}>
//               <Icon name="inbox" size={60} color="#9CA3AF" />
//               <Text style={styles.emptyText}>
//                 No pending exit requests found
//               </Text>
//             </Card.Content>
//           </Card>
//         }
//       />
      
//       {/* Add the feedback modal */}
//       <FeedbackModal
//         visible={feedbackModalVisible}
//         onClose={hideFeedbackModal}
//         type={feedbackModalType}
//         message={feedbackModalMessage}
//       />
//     </AppSafeArea>
//   );
// };

// const styles = StyleSheet.create({
//   headerGradient: {
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//   },
//   header: {
//     backgroundColor: 'transparent',
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   headerTitle: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//     fontSize: 20,
//   },
//   listContainer: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   card: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     shadowOffset: {width: 0, height: 2},
//   },
//   expandedCard: {
//     elevation: 5,
//     shadowOpacity: 0.15,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   employeeInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatar: {
//     backgroundColor: '#3b82f6',
//     marginRight: 12,
//   },
//   employeeTextInfo: {
//     flex: 1,
//   },
//   employeeName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 2,
//   },
//   employeeDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 4,
//   },
//   detailIcon: {
//     marginRight: 6,
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#4B5563',
//     fontWeight: '500',
//   },
//   leaveTypeChip: {
//     borderRadius: 16,
//     height: 36,
//   },
//   sectionDivider: {
//     marginVertical: 12,
//     backgroundColor: '#E5E7EB',
//     height: 1,
//   },
//   dateOuterContainer: {
//     marginBottom: 12,
//   },
//   dateInnerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   dateFromToContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   dateCard: {
//     flex: 1,
//     elevation: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   dateCardContent: {
//     padding: 10,
//   },
//   dateArrow: {
//     marginHorizontal: 8,
//   },
//   dateLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   dateValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   daysContainer: {
//     backgroundColor: '#EFF6FF',
//     borderRadius: 8,
//     padding: 10,
//     alignItems: 'center',
//     marginLeft: 12,
//     minWidth: 60,
//   },
//   daysValue: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#3b82f6',
//   },
//   daysLabel: {
//     fontSize: 12,
//     color: '#3b82f6',
//     fontWeight: '500',
//   },
//   durationTypeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     backgroundColor: '#F3F4F6',
//     padding: 8,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   durationIcon: {
//     marginRight: 6,
//   },
//   durationText: {
//     color: '#4B5563',
//     fontWeight: '500',
//   },
//   remarksCard: {
//     marginVertical: 8,
//     backgroundColor: '#F9FAFB',
//     elevation: 0,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   remarksSection: {
//     marginBottom: 4,
//   },
//   remarksLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#4B5563',
//     marginBottom: 4,
//   },
//   remarksValue: {
//     fontSize: 14,
//     color: '#1F2937',
//     lineHeight: 20,
//   },
//   statusSection: {
//     marginBottom: 8,
//   },
//   statusBadgeContainer: {
//     alignItems: 'flex-start',
//     marginTop: 8,
//   },
//   statusBadge: {
//     backgroundColor: '#FBBF24',
//     color: '#92400E',
//     fontSize: 12,
//   },
//   expandedSection: {
//     marginTop: 12,
//   },
//   divider: {
//     marginVertical: 16,
//     backgroundColor: '#E5E7EB',
//     height: 1,
//   },
//   sectionContainer: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#4B5563',
//     marginBottom: 8,
//   },
//   documentButton: {
//     borderColor: '#3b82f6',
//     borderRadius: 8,
//   },
//   infoCard: {
//     marginBottom: 16,
//     borderRadius: 8,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     elevation: 1,
//   },
//   infoText: {
//     fontSize: 14,
//     color: '#1F2937',
//     backgroundColor: '#F9FAFB',
//     padding: 12,
//     borderRadius: 8,
//   },
//   enhancedTextInput: {
//     backgroundColor: '#F9FAFB',
//   },
//   remarksInput: {
//     backgroundColor: '#F9FAFB',
//     textAlignVertical: 'top',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     marginTop: 16,
//     justifyContent: 'space-between',
//   },
//   button: {
//     flex: 1,
//     marginHorizontal: 6,
//     borderRadius: 8,
//     paddingVertical: 8,
//   },
//   approveButton: {
//     backgroundColor: '#10B981',
//   },
//   rejectButton: {
//     backgroundColor: '#EF4444',
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   pendingAlertCard: {
//     margin: 16,
//     marginBottom: 0,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#FDBA74',
//     backgroundColor: '#FFF7ED',
//     elevation: 0,
//   },
//   pendingAlertContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//   },
//   pendingAlertCountSmall: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#f59e42',
//   },
//   emptyCard: {
//     marginTop: 24,
//     borderRadius: 12,
//     backgroundColor: '#F9FAFB',
//     elevation: 0,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   emptyContainer: {
//     padding: 32,
//     alignItems: 'center',
//   },
//   emptyText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   reportingRemarksSection: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//   },
//   statusValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     backgroundColor: '#ECFDF5',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//   },
//   pickerContainer: {
//     backgroundColor: '#F9FAFB',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     marginBottom: 8,
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 54,
//     width: '100%',
//   },
//   pickerItem: {
//     fontSize: 14,
//   },
//   pickerPlaceholder: {
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
//   taskAssigneeSelected: {
//     backgroundColor: '#ECFDF5',
//     marginTop: 8,
//   },
//   leaveCountContainer: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   leaveCountField: {
//     flex: 1,
//   },
//   inputError: {
//     borderColor: '#ef4444',
//     backgroundColor: '#FEF2F2',
//   },
//   errorText: {
//     color: '#ef4444',
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   paginationContainer: {
//     marginTop: 16,
//     marginBottom: 24,
//     width: '100%',
//   },
//   pickerItem: {
//     fontSize: 15,
//     color: '#111827',
//   },
//   pickerPlaceholder: {
//     fontSize: 15,
//     color: '#9CA3AF',
//   },
//   taskAssigneeSelected: {
//     fontSize: 14,
//     color: '#10b981',
//     fontWeight: '500',
//     marginBottom: 8,
//     backgroundColor: '#ECFDF5',
//     padding: 8,
//     borderRadius: 6,
//   },
  
//   // Styles for Leave Balance Table
//   leaveBalanceTable: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginBottom: 16,
//     backgroundColor: '#FFFFFF',
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#F3F4F6',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   tableHeaderText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#4B5563',
//   },
//   leaveTypeColumn: {
//     flex: 2,
//     paddingRight: 5,
//   },
//   leaveDataColumn: {
//     flex: 1,
//     textAlign: 'center',
//   },
//   tableBody: {
//     maxHeight: 150, // Limit the height of the table
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   tableRowEven: {
//     backgroundColor: '#FFFFFF',
//   },
//   tableRowOdd: {
//     backgroundColor: '#F9FAFB',
//   },
//   tableCell: {
//     fontSize: 14,
//     color: '#111827',
//   },
//   loadingContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   loadingText: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   noDataContainer: {
//     padding: 20,
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 8,
//   },
//   noDataText: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontStyle: 'italic',
//   },
//   // Add these new styles for validation
//   inputError: {
//     borderColor: '#ef4444',
//     borderWidth: 2,
//     backgroundColor: '#FEF2F2',
//   },
//   errorText: {
//     color: '#ef4444',
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   totalErrorText: {
//     color: '#ef4444',
//     fontSize: 13,
//     marginBottom: 12,
//     fontWeight: '600',
//     backgroundColor: '#FEF2F2',
//     padding: 8,
//     borderRadius: 6,
//     textAlign: 'center',
//   },
//   leaveCountContainer: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   leaveCountField: {
//     flex: 1,
//   },
//   // Add a dedicated style for the pagination container
//   paginationContainer: {
//     marginTop: 10,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//     width: '100%',
//   },
//   totalErrorText: {
//     color: '#ef4444',
//     fontSize: 13,
//     marginBottom: 12,
//     fontWeight: '600',
//     backgroundColor: '#FEF2F2',
//     padding: 8,
//     borderRadius: 6,
//     textAlign: 'center',
//   },
//   leaveCountContainer: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   leaveCountField: {
//     flex: 1,
//   },
// });





// export default LeaveRequest;

