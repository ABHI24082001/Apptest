import React, { useState } from 'react';
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
import { Appbar, Avatar, Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

const leaveData = [
  {
    id: '1',
    leaveType: 'Casual Leave',
    leaveDuration: 'Full Day',
    numberOfDays: 3,
    document: 'https://example.com/medical-certificate.pdf',
    remark: 'Need to attend sister wedding',
    startDate: '2025-05-01',
    endDate: '2025-05-03',
    status: 'Pending',
  },
  {
    id: '2',
    leaveType: 'Sick Leave',
    leaveDuration: 'Half Day',
    numberOfDays: 1,
    document: '',
    remark: '',
    startDate: '2025-05-06',
    endDate: '2025-05-06',
    status: 'Pending',
  },
  {
    id: '3',
    leaveType: 'Paid Leave',
    leaveDuration: 'Full Day',
    numberOfDays: 5,
    document: 'https://example.com/travel-plan.pdf',
    remark: 'Vacation',
    startDate: '2025-05-10',
    endDate: '2025-05-14',
    status: 'Pending',
  },
];

const LeaveTypeColors = {
  'Casual Leave': '#3b82f6', // Blue
  'Sick Leave': '#ef4444',   // Red
  'Paid Leave': '#10b981',   // Green
};

const LeaveRequest = ({ navigation }) => {
  const [rmRemarks, setRmRemarks] = useState({});
  const [approvalRemarks, setApprovalRemarks] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

  const handleApprove = (id) => {
    if (!rmRemarks[id]?.trim()) {
      alert('Please add remarks before approving');
      return;
    }
    alert(`Approved leave request ID: ${id}`);
  };

  const handleReject = (id) => {
    if (!rmRemarks[id]?.trim()) {
      alert('Please add remarks before rejecting');
      return;
    }
    alert(`Rejected leave request ID: ${id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleCardExpansion = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedCard === item.id;
    const leaveColor = LeaveTypeColors[item.leaveType] || '#6b7280';

    return (
      <TouchableOpacity 
        style={[styles.card, isExpanded && styles.expandedCard]} 
        onPress={() => toggleCardExpansion(item.id)}
        activeOpacity={0.9}
      >
        {/* Header section */}
        <View style={styles.cardHeader}>
          <View style={styles.leaveTypeContainer}>
            <Chip
              style={[styles.leaveTypeChip, { backgroundColor: `${leaveColor}20` }]}
              textStyle={{ color: leaveColor, fontWeight: '800' }}
            >
              {item.leaveType}
            </Chip>
            <Chip
              style={styles.statusChip}
              textStyle={styles.statusText}
            >
              {item.status}
            </Chip>
          </View>
          
          <Icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6b7280" 
          />
        </View>
        
        {/* Date and duration info */}
        <View style={styles.dateContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
          </View>
          
          <View style={styles.dateArrow}>
            <Icon name="arrow-right" size={18} color="#9ca3af" />
          </View>
          
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
          </View>
          
          <View style={styles.daysContainer}>
            <Text style={styles.daysValue}>{item.numberOfDays}</Text>
            <Text style={styles.daysLabel}>{item.numberOfDays > 1 ? 'Days' : 'Day'}</Text>
          </View>
        </View>

        {/* Duration type */}
        <View style={styles.durationTypeContainer}>
          <Icon name="clock" size={16} color="#6b7280" style={styles.durationIcon} />
          <Text style={styles.durationText}>{item.leaveDuration}</Text>
        </View>

        {/* Expanded section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Divider style={styles.divider} />
            
            {/* Reason section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Reason</Text>
              <Text style={styles.reasonText}>
                {item.remark ? item.remark : 'No reason provided'}
              </Text>
            </View>

            {/* Document section */}
            {item.document ? (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Supporting Document</Text>
                <TouchableOpacity 
                  style={styles.documentButton}
                  onPress={() => Linking.openURL(item.document)}
                >
                  <Icon name="file-text" size={18} color="#3b82f6" />
                  <Text style={styles.documentText}>View document</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Reporting Manager Remarks */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Reporting Manager Remarks</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add your remarks here (required)"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={rmRemarks[item.id] || ''}
                onChangeText={(text) => setRmRemarks((prev) => ({ ...prev, [item.id]: text }))}
              />
            </View>

            {/* Approval Remarks (optional) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Approve Manager Remarks</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add approval Mangaer notes"
                placeholderTextColor="#9ca3af"
                maxLength={400}
                multiline
                value={approvalRemarks[item.id] || ''}
                onChangeText={(text) => setApprovalRemarks((prev) => ({ ...prev, [item.id]: text }))}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <Icon name="x" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprove(item.id)}
              >
                <Icon name="check" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Approve</Text>
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
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#4B5563" />
        <Appbar.Content title="Leave Requests" titleStyle={styles.headerTitle} />
        {/* <Appbar.Action icon="filter" color="#4B5563" onPress={() => alert('Filter pressed')} /> */}
      </Appbar.Header>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={leaveData}
        keyExtractor={(item) => item.id}
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
    shadowOffset: { width: 0, height: 2 },
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