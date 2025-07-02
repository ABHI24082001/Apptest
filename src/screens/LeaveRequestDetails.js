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

const LeaveTypeColors = {
  'Casual Leave': '#3b82f6', // Blue
  'Sick Leave': '#ef4444', // Red
  'Paid Leave': '#10b981', // Green
};

const LeaveRequest = ({navigation}) => {
  const employeeDetails = useFetchEmployeeDetails();

  const [leaveApprovalAccess, setLeaveApprovalAccess] = useState(null);
  const [approvalList, setApprovalList] = useState([]); // State to hold the approval list
  const [approveLeaveId, setapproveLeaveId] = useState(null); // State to hold the applyLeaveId

  useEffect(() => {
    if (employeeDetails) {
      fetchLeaveApprovalData();
    }
  }, [employeeDetails]);

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
        apiUrl = `${BASE_URL_PROD}/ApplyLeave/GetLeaveListForFinalApproval/${companyId}/${employeeId}`;
      } else {
        apiUrl = `${BASE_URL_PROD}/ApplyLeave/GetApplyLeaveListForApproval/${companyId}/${employeeId}`;
      }
      // debugger;;
      ApprovalList = await axios.get(apiUrl);
      ApprovalList.data = ApprovalList.data.filter(
        item => item.employeeId != employeeDetails?.id,
      );
      console.log('Leave list:', ApprovalList.data);
    } catch (err) {
      console.error('Error fetching leave list:', err);
    }

    let roleurl = '';
    roleurl = `${BASE_URL_PROD}/RoleConfiguration/getAllRoleDetailsCompanyWise/${companyId}`;
    const response = await axios.get(roleurl);
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
    console.log('Filtered Approval List:', ApprovalList.data);

    // Integrate the filtered approval list into the UI
    // Set the approval list state for FlatList rendering
    setApprovalList(Array.isArray(ApprovalList.data) ? ApprovalList.data : []);
  };

  // debugger

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

      const response = await axios.post(
        `${BASE_URL_PROD}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );

      console.log('Leave Approval Access List:', response.data);

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

  const handleApprove = id => {
    const leaveItem = approvalList.find(
      item => (item.id || item.applyLeaveId) === id,
    );
    if (!leaveItem || leaveItem.leaveNo === 0) {
      alert('Leave days (leaveNo) cannot be zero');
      return;
    }
    const approvedCount = Number(approvedLeaveCount[id]);
    if (!approvedCount || approvedCount === 0) {
      alert('You cannot approve 0 leave days. Please enter a valid number.');
      return;
    }
    if (approvedCount > leaveItem.leaveNo) {
      alert('Approved leave days cannot be greater than requested leave days');
      return;
    }
    alert(
      `Approved!\n\nEmployee: ${leaveItem.employeeName}\nLeave Type: ${leaveItem.leaveName}\nRequested: ${leaveItem.leaveNo} day(s)\nApproved: ${approvedCount} day(s)`,
    );
    console.log('Approve Payload:', {
      id,
      approvedCount,
      leaveItem,
      remarks: rmRemarks[id],
      approvalRemarks: approvalRemarks[id],
    });
  };

  // const handleReject = id => {
  //   if (!rmRemarks[id]?.trim()) {
  //     alert('Please add remarks before rejecting');
  //     return;
  //   }
  //   alert(`Rejected leave request ID: ${id}`);
  // };

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
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => toggleCardExpansion(item.id || item.applyLeaveId)}
        activeOpacity={0.9}>
        {/* Header section */}
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

        {/* Date and duration info */}
        <View style={styles.dateContainer}>
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
            <Text style={styles.dateValue}>{formatDate(item.toLeaveDate)}</Text>
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

        {/* Expanded section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Divider style={styles.divider} />

            {/* Employee Name */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Employee Name</Text>
              <Text style={styles.reasonText}>
                {item.employeeName || 'No name provided'}
              </Text>
            </View>

            {/* Designation */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Designation</Text>
              <Text style={styles.reasonText}>
                {item.designation || 'No designation provided'}
              </Text>
            </View>

            {/* Department */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Department</Text>
              <Text style={styles.reasonText}>
                {item.department || 'No department provided'}
              </Text>
            </View>

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

            {/* How many days requested? */}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>No of Approved Leave</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter number of approved leave days (required)"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={
                  approvedLeaveCount[item.id || item.applyLeaveId]
                    ? approvedLeaveCount[
                        item.id || item.applyLeaveId
                      ].toString()
                    : ''
                }
                onChangeText={text => {
                  const val = text.replace(/[^0-9]/g, ''); // keep only numbers
                  setApprovedLeaveCount(prev => ({
                    ...prev,
                    [item.id || item.applyLeaveId]: val,
                  }));
                }}
              />
            </View>

            {/* Reporting Manager Remarks */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Reporting Manager Remarks</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add your remarks here (required)"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={rmRemarks[item.id || item.applyLeaveId] || ''}
                onChangeText={text =>
                  setRmRemarks(prev => ({
                    ...prev,
                    [item.id || item.applyLeaveId]: text,
                  }))
                }
              />
            </View>

            {/* Approval Remarks (optional) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Final Approval Manager Remarks
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add approval Manager notes"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={approvalRemarks[item.id || item.applyLeaveId] || ''}
                onChangeText={text =>
                  setApprovalRemarks(prev => ({
                    ...prev,
                    [item.id || item.applyLeaveId]: text,
                  }))
                }
              />
            </View>

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
                <Text style={styles.buttonText}>Approve</Text>
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

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={approvalList}
        keyExtractor={item =>
          item.id?.toString() ||
          item.applyLeaveId?.toString() ||
          Math.random().toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
  },
  expandedCard: {
    elevation: 4,
    shadowOpacity: 0.12,
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
    height: 35,
    marginRight: 8,
  },
  statusChip: {
    backgroundColor: '#FEF3C7',
    height: 35,
  },
  statusText: {
    color: '#D97706',
    fontSize: 15,
    fontWeight: '800',
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
  durationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
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
