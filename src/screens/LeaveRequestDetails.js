import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveRequestDetails = () => {
  const route = useRoute();
  const {item} = route.params;
  const navigation = useNavigation();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#2F3846" />
          </TouchableOpacity>
          <Text style={styles.title}>Leave Request Details</Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${getStatusColor(item.status)}15`,
                borderColor: getStatusColor(item.status),
              },
            ]}>
            <Text
              style={[styles.statusText, {color: getStatusColor(item.status)}]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee Information</Text>
            <DetailRow icon="account" label="Name" value={item.name} />
            <DetailRow icon="briefcase" label="Role" value={item.role} />
            <DetailRow
              icon="office-building"
              label="Department"
              value={item.dept}
            />
            <DetailRow
              icon="identifier"
              label="Employee ID"
              value={item.empId}
            />
            <DetailRow
              icon="file-document"
              label="Record ID"
              value={item.recordId}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leave Information</Text>
            <DetailRow icon="calendar" label="Leave Type" value={item.type} />
            <DetailRow
              icon="calendar-range"
              label="Leave Dates"
              value={item.date}
            />
            <DetailRow
              icon="calendar-clock"
              label="Duration"
              value={`${item.days} day${item.days > 1 ? 's' : ''}`}
            />
            <DetailRow icon="clock" label="Applied On" value={item.appliedOn} />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason</Text>
            <View style={styles.reasonBox}>
              <Icon
                name="text-box-outline"
                size={20}
                color="#6B7280"
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string,
  label: string,
  value: string,
}) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={18} color="#6B7280" style={styles.rowIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowIcon: {
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  reasonBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reasonIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});

export default LeaveRequestDetails;
