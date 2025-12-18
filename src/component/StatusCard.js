import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Avatar, Button, Chip, Divider } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const StatusCard = ({
  title,
  subtitle,
  details,
  status,
  remarks,
  onEdit,
  onDelete,
  initials, // Add initials prop for Avatar
  leaveType, // Add leaveType prop for Chip
  empty, // Add empty prop for empty state
}) => {
  const getStatusIcon = status => {
    if (!status) return {icon: 'help-circle', color: '#9E9E9E'};
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('approved by manager') || 
        statusLower.includes('approved by reporting') || 
        (statusLower.includes('approved') && 
         (statusLower.includes('manager') || statusLower.includes('reporting')))) {
      return {icon: 'check-circle', color: '#16a34a'}; // Bright green for manager approval
    } else if (statusLower.includes('approved')) {
      return {icon: 'check-circle', color: '#4CAF50'};
    } else if (statusLower.includes('pending')) {
      return {icon: 'clock', color: '#FFA000'};
    } else if (statusLower.includes('rejected')) {
      return {icon: 'close-circle', color: '#F44336'};
    } else {
      return {icon: 'help-circle', color: '#9E9E9E'};
    }
  };

  const statusIcon = getStatusIcon(status);
  
  // Get status-specific styling
  const getStatusStyle = status => {
    if (!status) return { backgroundColor: '#F8F8F8' };
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('approved by manager') || 
        statusLower.includes('approved by reporting') ||
        (statusLower.includes('approved') && 
         (statusLower.includes('manager') || statusLower.includes('reporting')))) {
      return {
        backgroundColor: '#dcfce7', // Light green
        borderColor: '#86efac',    // Medium green
        borderWidth: 1,
      };
    } else if (statusLower.includes('approved')) {
      return {
        backgroundColor: '#d1fae5', // Lighter green
        borderColor: '#6ee7b7',    // Medium green
        borderWidth: 1,
      };
    } else if (statusLower.includes('pending')) {
      return {
        backgroundColor: '#FFF9E5',
        borderColor: '#FFA500',
        borderWidth: 1,
      };
    } else if (statusLower.includes('rejected')) {
      return {
        backgroundColor: '#fee2e2', // Light red
        borderColor: '#fca5a5',    // Medium red
        borderWidth: 1,
      };
    }
    return {
      backgroundColor: '#F8F8F8',
    };
  };

  // Format status text to look better
  const formatStatusText = (status) => {
    if (!status) return '';
    
    // Split status into words and capitalize each word
    return status.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Helper function to check if status is any form of approved
  const isApproved = (status) => {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower.includes('approved');
  };

  if (empty) {
    // Improved empty state with Card
    return (
      <Card style={styles.emptyCard}>
        <Card.Content>
          <Text style={styles.emptyText}>No Data Available</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#5252e0ff', '#A7BFE8']}
        style={styles.headerGradient}
        start={{x: 1, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerContent}>
        
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
      <Card.Content>
        {/* <View style={styles.chipRow}>
          <Chip style={styles.chip} icon="calendar">{leaveType || 'Leave Type'}</Chip>
        </View> */}
        {details.map((detail, index) => (
          <Card style={styles.detailCard} key={index}>
            <Card.Content style={styles.detailRow}>
              <Icon name={detail.icon} size={20} color="#6D75FF" />
              <Text style={styles.label}>{detail.label}</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{detail.value}</Text>
            </Card.Content>
          </Card>
        ))}
        <Card style={styles.detailCard}>
          <Card.Content style={styles.detailRow}>
            <Icon name="message-outline" size={20} color="#6D75FF" />
            <Text style={styles.label}>Remarks</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{remarks || 'No Remark'}</Text>
          </Card.Content>
        </Card>
      </Card.Content>
      {/* Only show Card.Actions if status is not approved */}
      {!isApproved(status) && (
        <Card.Actions style={styles.cardFooter}>
          <Button
            mode="contained"
            icon="pencil-outline"
            onPress={onEdit}
            style={styles.editButton}
            labelStyle={styles.actionText}
            compact
          >
            Update
          </Button>
          <Button
            mode="contained"
            icon="trash-can-outline"
            onPress={onDelete}
            style={styles.deleteButton}
            labelStyle={styles.actionText}
            compact
          >
            Remove
          </Button>
        </Card.Actions>
      )}

      <Card.Content style={styles.statusFooter}>
        <Text style={styles.statusLabel}>Status</Text>
        <View style={[styles.statusBadge, getStatusStyle(status)]}>
          <Icon name={statusIcon.icon} size={16} color={statusIcon.color} />
          <Text style={[styles.statusText, {color: statusIcon.color}]}>
            {formatStatusText(status)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  headerGradient: {
    borderTopLeftRadius: Platform.OS === 'ios' ? 8 : 16,
    borderTopRightRadius: Platform.OS === 'ios' ? 8 : 16,
    padding: Platform.OS === 'ios' ? 5 : 16,
    // marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  title: {fontWeight: '700', fontSize: 18, color: '#FFF'},
  subtitle: {fontSize: 15, color: '#E0E7FF', marginBottom: 4},
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#EEF2FF',
    color: '#6D75FF',
    fontWeight: '600',
    fontSize: 14,
  },
  detailCard: {
    marginVertical: 4,
    backgroundColor: '#F8FAFC',
    elevation: 0,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    width: 100,
    fontWeight: '500',
  },
  colon: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    backgroundColor: '#E6F0FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
    marginRight: 8,
    borderRadius: 6,
    elevation: 0,
  },
  deleteButton: {
    backgroundColor: '#FFEAEA',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 6,
    elevation: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 19,
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    backgroundColor: '#F8F8F8',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  emptyCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 0,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StatusCard;
