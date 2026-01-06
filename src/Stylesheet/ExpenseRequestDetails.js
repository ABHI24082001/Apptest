import {StyleSheet , Platform} from 'react-native';

const styles = StyleSheet.create({
  gradientHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  expandedCard: {
    elevation: 4,
  },
  cardStatusHeader: {
    position: 'absolute',
    top: 0,
    right: 12,
    zIndex: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusApproved: {
    color: '#059669',
    backgroundColor: '#ECFDF5',
    fontWeight: '500',
  },
  statusRejected: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    fontWeight: '500',
  },
  statusPending: {
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  leaveTypeChip: {
    height: 32,
    borderWidth: 2,
  },
  employeeInfoSection: {
    marginBottom: 14,
  },
  employeeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeNameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  employeeName: {
    fontSize: 23,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  employeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4B5563',
  },
  detailDivider: {
    height: 14,
    width: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  sectionDivider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  //  {/* Date and amount info */}
  dateOuterContainer: {
    marginVertical: 8,   
  },
  dateCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: '#FFFFFF',
  },
  dateCardContent: {
    padding: 8,
  },
  dateFromToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    // color: '#111827',
  },
  dateArrow: {
    marginHorizontal: 8,
  },
  amountCard: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    elevation: 1,
  },
  amountCardContent: {
    alignItems: 'center',
    padding: 10,
  },
  daysValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  daysLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  durationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingLeft: 4,
  },
  durationIcon: {
    marginRight: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  remarksCard: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  remarksSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  remarksLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  remarksValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 10,
    flex: 1,
  },
  expandedSection: {
    marginTop: 16,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
  },
  detailCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  remarksInput: {
    backgroundColor: '#F9FAFB',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    paddingVertical: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingAlertCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    elevation: 0,
  },
  pendingAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  pendingAlertCountSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e42',
  },
  emptyCard: {
    marginVertical: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#4b5563',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 54,
    width: '100%',
    color: '#111827',
    fontSize: 15,
  },
  pickerItem: {
    fontSize: 15,
    color: '#111827',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  taskAssigneeSelected: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginBottom: 8,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  employeenamwee: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  statusApprovedBadge: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusRejectedBadge: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendingBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApprovedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  statusRejectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  statusPendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f59e0b',
  },
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4B5563',
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  amountInput: {
    backgroundColor: '#F9FAFB',
  },
  remarksLimit: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  remarksTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredField: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  amountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDetailsButton: {
    marginLeft: 2,
    borderColor: '#3b82f6',
    borderRadius: 4,
    height: 36,
  },
  infoButton: {
    margin: 0,
    padding: 0,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 12,
    elevation: 5,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentDetailItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  amountChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  itemDivider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  closeButton: {
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  documentViewerContainer: {
    flex: 1,
    margin: 20,
  },
  documentViewerCard: {
    flex: 1,
    borderRadius: 12,
  },
  webViewContainer: {
    flex: 1,
    padding: 0,
  },
  webView: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  noDocumentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDocumentText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Updated modal styles for centered popup design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 0,
  },
  centeredModalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 12,
    elevation: 5,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentDetailItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  amountChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  itemDivider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  closeButton: {
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  documentViewerContainer: {
    flex: 1,
    margin: 20,
  },
  documentViewerCard: {
    flex: 1,
    borderRadius: 12,
  },
  webViewContainer: {
    flex: 1,
    padding: 0,
  },
  webView: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  noDocumentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDocumentText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Updated modal styles for centered popup design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 0,
  },
  centeredModalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default styles;