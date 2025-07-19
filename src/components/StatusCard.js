import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatusCard = ({
  title,
  subtitle,
  details,
  status,
  remarks,
  onEdit,
  onDelete,
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

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {details.map((detail, index) => (
          <View key={index} style={styles.detailRow}>
            <Icon name={detail.icon} size={20} color="#6D75FF" />
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{detail.value}</Text>
          </View>
        ))}

        <View style={styles.detailRow}>
          <Icon name="message-outline" size={20} color="#6D75FF" />
          <Text style={styles.label}>Remarks</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{remarks || 'No Remark'}</Text>
        </View>


        <View style={styles.cardFooter}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={onEdit}>
              <Icon name="pencil-outline" size={20} color="#3B82F6" />
              <Text style={styles.actionText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={onDelete}>
              <Icon name="trash-can-outline" size={20} color="#F44336" />
              <Text style={styles.actionText}>Remove </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.actionButtons}>
            <View style={[
              styles.statusRow,
              getStatusStyle(status)
            ]}>
              <Icon name={statusIcon.icon} size={20} color={statusIcon.color} />
              <Text style={[styles.statusText, {color: statusIcon.color}]}>
                {formatStatusText(status)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {padding: 16},
  title: {fontWeight: '800', fontSize: 16, color: '#111827'},
  subtitle: {fontSize: 14, color: '#6B7280', marginBottom: 12},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    width: 100,
  },
  colon: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#E6F0FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: '#FFEAEA',
    borderColor: '#F44336',
    borderWidth: 1,
  },
});

export default StatusCard;
