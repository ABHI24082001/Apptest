import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import LeaveBalanceTable from './LeaveBalanceTable';

const LeaveBalanceModal = ({ 
  visible, 
  onDismiss, 
  leaveData = [], 
  isLoadingLeaveData = false 
}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Employee Leave Balances</Text>
          <TouchableOpacity onPress={onDismiss}>
            <Icon name="x" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScrollView}>
          <LeaveBalanceTable
            leaveData={leaveData}
            isLoadingLeaveData={isLoadingLeaveData}
          />
        </ScrollView>

        <PaperButton
          mode="contained"
          onPress={onDismiss}
          style={styles.closeModalButton}>
          Close
        </PaperButton>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  closeModalButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
  },
});

export default LeaveBalanceModal;