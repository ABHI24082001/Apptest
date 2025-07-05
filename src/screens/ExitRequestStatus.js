import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Appbar, Button } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import BASE_URL from '../constants/apiConfig';


// Helper to format date string as DD-MM-YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

// Status badge color helper
const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return '#FFA500';
    case 'approved':
      return '#00C851';
    case 'rejected':
      return '#ff4444';
    default:
      return '#6B7280';
  }
};

const ExitRequestStatusScreen = () => {
  const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null); // Track which request is being withdrawn
  const [canApplyNew, setCanApplyNew] = useState(true);

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (employeeDetails?.id) {
        fetchExitRequests();
      }
      return () => {}; // cleanup if needed
    }, [employeeDetails?.id])
  );

  const fetchExitRequests = async () => {
    if (!employeeDetails?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/EmployeeExit/GetExEmpByEmpId/${employeeDetails.id}`);
      const data = await res.json();
      const exitRequests = Array.isArray(data) ? data : [];
      setRequests(exitRequests);
      
      // Check if user can apply new exit request
      const hasPendingRequest = exitRequests.some(req => 
        req.applicationStatus?.toLowerCase() === 'pending'
      );
      
      // Set canApplyNew based on existing requests
      setCanApplyNew(!hasPendingRequest);
      
    } catch (e) {
      console.error('Error fetching exit requests:', e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle withdraw request
  const handleWithdraw = async (id) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this exit application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Withdraw', 
          style: 'destructive',
          onPress: async () => {
            try {
              setWithdrawingId(id);
              const response = await axios.get(
                `${BASE_URL}/EmployeeExit/WithdrawExitApplication/${id}`
              );
              
              if (response.status === 200) {
                Alert.alert(
                  'Success',
                  'Exit application withdrawn successfully',
                  [{ text: 'OK' }]
                );
                // Refresh the exit requests after withdrawal
                fetchExitRequests();
              } else {
                Alert.alert('Error', 'Failed to withdraw application');
              }
            } catch (error) {
              console.error('Error withdrawing application:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to withdraw application'
              );
            } finally {
              setWithdrawingId(null);
            }
          }
        }
      ]
    );
  };

  // Handle navigation to apply new exit request
  const handleApplyNew = () => {
    if (!canApplyNew) {
      Alert.alert(
        'Application In Progress',
        'You already have a pending exit application. Please withdraw it before submitting a new one.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // navigation.navigate('Exit');
  };
  
  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.navigate('Main')} />
        <Appbar.Content title="My Exit Requests" titleStyle={styles.headerTitle} />
        {/* <Appbar.Action 
          icon="plus" 
          onPress={handleApplyNew} 
          color="#1E293B"
          disabled={!canApplyNew}
        /> */}
      </Appbar.Header>

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading your exit requests...</Text>
          </View>
        ) : requests.length === 0 ? (
          canApplyNew ? (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Apply for Exit</Text>
              {/* Add form fields here */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Exit Date:</Text>
                <TouchableOpacity style={styles.datePicker}>
                  <Text style={styles.datePickerText}>Select Date</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Reason:</Text>
                <TouchableOpacity style={styles.textInput}>
                  <Text style={styles.textInputPlaceholder}>Enter reason</Text>
                </TouchableOpacity>
              </View>
              <Button 
                mode="contained" 
                onPress={() => Alert.alert('Form Submitted', 'Your exit request has been submitted.')}
                style={styles.submitBtn}
                labelStyle={styles.submitBtnLabel}
              >
                Submit Request
              </Button>
            </View>
          ) : (
            <View style={styles.pendingMessageContainer}>
              <Icon name="alert-circle-outline" size={48} color="#FFA500" />
              <Text style={styles.pendingMessageText}>
                You already have a pending exit application. Please withdraw it before submitting a new one.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Home')} 
                style={styles.cancelBtn} 
                labelStyle={styles.cancelBtnLabel}
              >
                Cancel
              </Button>
            </View>
          )
        ) : (
          <>
            {requests.map((item, index) => (
              <View key={index} style={styles.card}>
                {/* Status Badge */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(item.applicationStatus)}22`,
                        borderColor: getStatusColor(item.applicationStatus),
                      },
                    ]}>
                    <Text style={[styles.statusText, {color: getStatusColor(item.applicationStatus)}]}>
                      {item.applicationStatus}
                    </Text>
                  </View>
                  
                  <View style={styles.dateChip}>
                    <Icon name="calendar-clock" size={16} color="#475569" />
                    <Text style={styles.dateChipText}>Applied: {formatDate(item.appliedDt)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardDivider} />
                
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Icon name="calendar-remove" size={20} color="#3B82F6" />
                    <Text style={styles.infoLabel}>Exit Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.exitDt)}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Icon name="information" size={20} color="#3B82F6" />
                    <Text style={styles.infoLabel}>Reason:</Text>
                    <Text style={styles.infoValue}>{item.exitReasons}</Text>
                  </View>
                  
                  {item.supervisorRemarks ? (
                    <View style={styles.remarksContainer}>
                      <View style={styles.remarksHeader}>
                        <Icon name="account-tie" size={18} color="#6B7280" />
                        <Text style={styles.remarksTitle}>Supervisor Remarks</Text>
                      </View>
                      <Text style={styles.remarksText}>{item.supervisorRemarks}</Text>
                    </View>
                  ) : null}
                  
                  {item.hrremarks ? (
                    <View style={styles.remarksContainer}>
                      <View style={styles.remarksHeader}>
                        <Icon name="account-group" size={18} color="#6366F1" />
                        <Text style={[styles.remarksTitle, {color: '#6366F1'}]}>HR Remarks</Text>
                      </View>
                      <Text style={[styles.remarksText, {color: '#6366F1'}]}>{item.hrremarks}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Action buttons */}
                {item.applicationStatus?.toLowerCase() === 'pending' && (
                  <View style={styles.cardActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleWithdraw(item.id)}
                      loading={withdrawingId === item.id}
                      disabled={withdrawingId !== null}
                      style={styles.withdrawBtn}
                      labelStyle={styles.withdrawBtnLabel}
                      icon="close-circle-outline"
                    >
                      Withdraw Application
                    </Button>
                  </View>
                )}
                
                {/* Add reapply button for rejected applications */}
                {item.applicationStatus?.toLowerCase() === 'rejected' && (
                  <View style={styles.cardActions}>
                    <Button
                      mode="contained"
                      onPress={handleApplyNew}
                      style={styles.reapplyBtn}
                      labelStyle={styles.reapplyBtnLabel}
                      icon="refresh"
                    >
                      Apply Again
                    </Button>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  scrollContainer: {
    padding: 12, 
    paddingBottom: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  cardBody: {
    padding: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  empName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.1,
  },
  empDept: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 10,
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  remarksContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#CBD5E1',
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  remarksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  remarksText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  newRequestBtn: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  newRequestBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateChipText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  withdrawBtn: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  withdrawBtnLabel: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  reapplyBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  reapplyBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  datePicker: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 15,
    color: '#1E293B',
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  textInputPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  submitBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pendingMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  pendingMessageText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  cancelBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#fff',
  },
});

export default ExitRequestStatusScreen;
