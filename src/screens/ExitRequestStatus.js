import React from 'react';
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

const exitRequestData = [
  {
    empId: 'AA_13',
    name: 'Geoffrey Buckley',
    role: 'Customer Service Manager',
    dept: 'Customer Service',
    appliedDate: '01-03-2025',
    exitDate: '31-03-2025',
    reason: 'JLSd',
    accountStatus: 'Pending',
    authorizedStatus: 'Pending',
    status: 'Pending',
  },
];

const ExitRequestStatusScreen = () => {
  const navigation = useNavigation();

  // Show all requests (or filter here if needed)
  const filteredData = exitRequestData;

  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Exit Request" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No requests</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9}>
              <View style={styles.card}>
                <InfoRow icon="calendar-edit" label={`Applied: ${item.appliedDate}`} />
                <InfoRow icon="calendar-remove-outline" label={`Exit: ${item.exitDate}`} />
                <InfoRow icon="information-outline" label={`Reason: ${item.reason}`} />

                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(item.status)}15`,
                        borderColor: getStatusColor(item.status),
                      },
                    ]}>
                    <Text style={[styles.statusText, {color: getStatusColor(item.status)}]}>
                      {item.status}
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

const InfoRow = ({icon, label}: {icon: string; label: string}) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={26} color="#6B7280" />
    <Text style={styles.detailText}>{label}</Text>
  </View>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return '#FFA500';
    case 'Approved':
      return '#00C851';
    case 'Rejected':
      return '#ff4444';
    default:
      return '#6B7280';
  }
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {padding: 16, paddingBottom: 24},
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 17,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
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
  },
});

export default ExitRequestStatusScreen;
