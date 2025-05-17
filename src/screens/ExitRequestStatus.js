import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Appbar} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
const statusTabs = [
  {label: 'Pending', color: '#FFA500', icon: 'clock-alert-outline'},
  {label: 'Approved', color: '#00C851', icon: 'check-circle-outline'},
  {label: 'Rejected', color: '#ff4444', icon: 'close-circle-outline'},
];

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
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  const filteredData = exitRequestData.filter(
    item => item.status === selectedStatus,
  );

  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="  My Exit Request"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Status Tabs */}
      <View style={styles.tabContainer}>
        {statusTabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              selectedStatus === tab.label && {
                backgroundColor: `${tab.color}15`,
                borderColor: tab.color,
              },
            ]}
            onPress={() => setSelectedStatus(tab.label)}>
            <Icon
              name={tab.icon}
              size={18}
              color={tab.color}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, {color: tab.color}]}>
              {tab.label} (
              {exitRequestData.filter(item => item.status === tab.label).length}
              )
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Exit Request Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {selectedStatus} requests</Text>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.9}>
              <View key={index} style={styles.card}>
                <InfoRow
                  icon="calendar-edit"
                  label={`Applied: ${item.appliedDate}`}
                />
                <InfoRow
                  icon="calendar-remove-outline"
                  label={`Exit: ${item.exitDate}`}
                />
                <InfoRow
                  icon="information-outline"
                  label={`Reason: ${item.reason}`}
                />

                {/* <View style={styles.manageRow}>
                <Icon name="tools" size={20} color="#6B7280" />
                <Text style={styles.manageText}>Manage</Text>
              </View> */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(item.status)}15`,
                        borderColor: getStatusColor(item.status),
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {color: getStatusColor(item.status)},
                      ]}>
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

const InfoRow = ({icon, label}: {icon: string, label: string}) => (
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
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabIcon: {marginRight: 6},
  tabText: {fontWeight: '600', fontSize: 14},
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
  name: {fontWeight: '800', fontSize: 16, color: '#111827'},
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '700',
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
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  manageText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
});

export default ExitRequestStatusScreen;
