import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Appbar, Button } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import styles from '../Stylesheet/ExitRequestStatusScreencss';
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

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
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [canApplyNew, setCanApplyNew] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      if (employeeDetails?.id) {
        fetchExitRequests();
      }
      return () => {};
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

      const hasPendingRequest = exitRequests.some(req =>
        req.applicationStatus?.toLowerCase() === 'pending'
      );
      setCanApplyNew(!hasPendingRequest);
    } catch (e) {
      console.error('Error fetching exit requests:', e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

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
              const response = await axiosinstance.get(
                `${BASE_URL}/EmployeeExit/WithdrawExitApplication/${id}`
              );
              if (response.status === 200) {
                Alert.alert('Success', 'Exit application withdrawn successfully');
                fetchExitRequests();
              } else {
                Alert.alert('Error', 'Failed to withdraw application');
              }
            } catch (error) {
              console.error('Error withdrawing application:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to withdraw application');
            } finally {
              setWithdrawingId(null);
            }
          }
        }
      ]
    );
  };

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
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.navigate('Main')} />
        <Appbar.Content title="My Exit Requests" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading your exit requests...</Text>
          </View>
        ) : requests.length === 0 ? (
          canApplyNew ? (
            <View style={styles.emptyState}>
              <Icon name="folder-open-outline" size={64} color="#94A3B8" />
              <Text style={styles.emptyText}>No Exit Requests Found</Text>
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
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(item.applicationStatus)}22`,
                        borderColor: getStatusColor(item.applicationStatus),
                      },
                    ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.applicationStatus) }]}>
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

                  {item.supervisorRemarks && (
                    <View style={styles.remarksContainer}>
                      <View style={styles.remarksHeader}>
                        <Icon name="account-tie" size={18} color="#6B7280" />
                        <Text style={styles.remarksTitle}>Supervisor Remarks</Text>
                      </View>
                      <Text style={styles.remarksText}>{item.supervisorRemarks}</Text>
                    </View>
                  )}

                  {item.hrremarks && (
                    <View style={styles.remarksContainer}>
                      <View style={styles.remarksHeader}>
                        <Icon name="account-group" size={18} color="#6366F1" />
                        <Text style={[styles.remarksTitle, { color: '#6366F1' }]}>HR Remarks</Text>
                      </View>
                      <Text style={[styles.remarksText, { color: '#6366F1' }]}>{item.hrremarks}</Text>
                    </View>
                  )}
                </View>

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





export default ExitRequestStatusScreen;
