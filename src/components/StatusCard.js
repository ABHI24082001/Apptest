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
    switch (status.toLowerCase()) {
      case 'approved':
        return {icon: 'check-circle', color: '#4CAF50'};
      case 'pending':
        return {icon: 'clock', color: '#FFA000'};
      case 'rejected':
        return {icon: 'close-circle', color: '#F44336'};
      default:
        return {icon: 'help-circle', color: '#9E9E9E'};
    }
  };

  const statusIcon = getStatusIcon(status);
  
  // Get status-specific styling
  const getStatusStyle = status => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') {
      return {
        backgroundColor: '#FFF9E5',
        borderColor: '#FFA500',
        borderWidth: 1,
      };
    }
    return {
      backgroundColor: '#F8F8F8',
    };
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
          <View style={[
            styles.statusRow,
            getStatusStyle(status)
          ]}>
            <Icon name={statusIcon.icon} size={20} color={statusIcon.color} />
            <Text style={[styles.statusText, {color: statusIcon.color}]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>

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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
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
