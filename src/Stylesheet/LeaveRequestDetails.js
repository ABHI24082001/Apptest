import {StyleSheet , Platform} from 'react-native';

const styles = StyleSheet.create({
  headerGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedCard: {
    elevation: 5,
    shadowOpacity: 0.15,
  },
  cardHeader: {
    marginBottom: 8,
  },
  employeeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#3b82f6',
    marginRight: 12,
  },
  // employeeTextInfo: {
  //   flex: 1,
  // },
  employeeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  employeenamwee: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailItemcard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailItemcard1: {
    // backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  detailItemcardLeave: {
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '700',
    marginRight: 10,
  },
  requiredField: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveTypeChip: {
    borderRadius: 16,
    height: 36,
  },
  sectionDivider: {
    marginVertical: 10,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  dateOuterContainer: {
    marginBottom: 12,
  },
  dateInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFromToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateCard: {
    flex: 1,
    elevation: 1,
    backgroundColor: '#F9FAFB',
  },
  dateCardContent: {
    padding: 10,
  },
  dateArrow: {
    marginHorizontal: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  daysContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginLeft: 12,
    minWidth: 60,
  },
  daysValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  daysLabel: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  durationTypeContainer: {
    marginTop: 8,
  },
  durationIcon: {
    marginRight: 6,
    color: '#6B7280',
    size: 16,
  },
  durationText: {
    color: '#4B5563',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 4,
  },
  remarksCard: {
    marginVertical: 8,
    backgroundColor: '#F9FAFB',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  remarksSection: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    marginLeft: 8,
  },
  remarksLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  remarksValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 20,
    marginLeft: 8,
    fontWeight: '500',
  },
  statusSection: {
    marginBottom: 8,
  },
  statusBadgeContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  expandedSection: {
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  documentButton: {
    borderColor: '#3b82f6',
    borderRadius: 8,
  },
  infoCard: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  enhancedTextInput: {
    backgroundColor: '#F9FAFB',
  },
  remarksInput: {
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    // marginTop: 16,
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    paddingVertical: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingAlertCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
    elevation: 0,
  },
  pendingAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pendingAlertCountSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  emptyCard: {
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  reportingRemarksSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 54,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  taskAssigneeSelected: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },

  // Styles for Leave Balance Table
  leaveBalanceTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  leaveTypeColumn: {
    flex: 2,
    paddingRight: 5,
  },
  leaveDataColumn: {
    flex: 1,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 150, // Limit the height of the table
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 14,
    color: '#111827',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  // Add these new styles for validation
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  totalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  totalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  leaveCountContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  leaveCountField: {
    flex: 1,
  },
  // Add a dedicated style for the pagination container
  paginationContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  totalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  leaveCountContainer: {
    flexDirection: 'row',
    gap: 12,
    color: '#f59e0b', // amber-500
    fontWeight: 'bold',
  },
  statusApprovedBadge: {
    backgroundColor: '#d1fae5', // Emerald 100
    borderColor: '#10b981', // Emerald 600
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusRejectedBadge: {
    backgroundColor: '#fee2e2', // Rose 100
    borderColor: '#ef4444', // Rose 600
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendingBadge: {
    backgroundColor: '#fffbeb', // Amber 50
    borderColor: '#f59e0b', // Amber 600
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApprovedText: {
    color: '#10b981',
    fontWeight: '500',
  },
  statusRejectedText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  statusPendingText: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  // New styles for Leave Balance Details Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
  },

  modalPopup: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
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
    borderRadius: 8,
  },

  cardIcon: {
    marginRight: 8,
    alignSelf: 'center',
    color: '#4B5563',
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B5563',
    marginLeft: 4,
  },

  remarksText: {
    color: '#4B5563', // Final chosen color
    marginLeft: 8,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 8,
    fontWeight: '800', // Final chosen weight
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 4,
    alignSelf: 'center',
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginLeft: 8,
  },
  rmRemarksContent: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rmRemarksText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  noRemarksText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardHeaderRow: {
    flexDirection: 'row',

    marginBottom: 8,
  },
  cardHeaderRow2: {
    marginBottom: 8,
    flexDirection: 'row',
    paddingLeft: 8,
    alignItems: 'center',
  },
  // Add this to your existing styles object at the bottom of the file
  cardIcon: {
    marginRight: 8,
    alignSelf: 'center',
    color: '#4B5563',
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B5563',
    marginLeft: 4,
  },

  remarksText: {
    color: '#4B5563', // Final chosen color
    marginLeft: 8,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 8,
    fontWeight: '800', // Final chosen weight
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 4,
    alignSelf: 'center',
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginLeft: 8,
  },
});

export default styles;
