import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {Appbar} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';

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

  useEffect(() => {
    const fetchExitRequests = async () => {
      if (!employeeDetails?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL_PROD}/EmployeeExit/GetExEmpByEmpId/${employeeDetails.id}`);
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExitRequests();
  }, [employeeDetails?.id]);



  
  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Exit Request" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <Text style={{textAlign: 'center', marginTop: 32}}>Loading...</Text>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No requests</Text>
          </View>
        ) : (
          requests.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9} style={styles.cardTouchable}>
              <View style={styles.card}>
               
                <View style={styles.infoRow}>
                  <Icon name="calendar-edit" size={20} color="#6B7280" />
                  <Text style={styles.infoText}>Applied: {formatDate(item.appliedDt)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="calendar-remove-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoText}>Exit: {formatDate(item.exitDt)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="information-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoText}>Reason: {item.exitReasons}</Text>
                </View>
                {item.supervisorRemarks ? (
                  <View style={styles.infoRow}>
                    <Icon name="comment-account-outline" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>Supervisor Remarks: {item.supervisorRemarks}</Text>
                  </View>
                ) : null}
                {item.hrremarks ? (
                  <View style={styles.infoRow}>
                    <Icon name="comment-account-outline" size={18} color="#6366F1" />
                    <Text style={styles.infoText}>HR Remarks: <Text style={styles.remarksText}>{item.hrremarks}</Text></Text>
                  </View>
                ) : null}

                <View style={styles.cardFooterRow}>
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
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  scrollContainer: {padding: 12, paddingBottom: 24},
  cardTouchable: {
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E7EF',
    elevation: 3,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
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
    marginTop: 7,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15.5,
    color: '#334155',
    marginLeft: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  remarksText: {
    color: '#6366F1',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 15.5,
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
});

export default ExitRequestStatusScreen;
