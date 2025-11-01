import {StyleSheet, Platform} from 'react-native';


const styles = StyleSheet.create({
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    elevation: 4,
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
  scrollContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  formCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 3,
  },
  warningCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarIcon: {
    backgroundColor: '#3B82F6',
  },
  employeeInfoCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 1,
  },
  employeeInfoContainer: {
    paddingVertical: 8,
  },
  avatar: {
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeDate: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  employeeDesignation: {
    fontSize: 14,
    color: '#64748B',

    marginRight: 12,
    textAlign: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  employeeDepartment: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'orange',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  divider: {
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  reasonCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 15,
    color: '#1E293B',
  },
  remarksCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#CBD5E1',
    elevation: 1,
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  remarksTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  remarksText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    fontSize: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerLoading: {
    padding: 10,
  },
  picker: {
    height: 50,
  },
  cardActions: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 2,
    paddingBottom: 6,
    paddingHorizontal: 2,
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
  submitBtn: {
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  cancelBtn: {
    borderColor: '#64748B',
  },
  withdrawBtn: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  withdrawBtnLabel: {
    color: '#ef4444',
  },
  reapplyBtn: {
    backgroundColor: '#10B981',
  },
  reapplyBtnLabel: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  pendingMessageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pendingMessageText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  dataCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  dataLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 8,
  },
  dataValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  employeeCode: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  approveBtn: {
    backgroundColor: '#10B981', // Green
    paddingVertical: 1,
    paddingHorizontal: 11,
    borderRadius: 8,
    marginRight: 8,
  },
  approveBtnLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Reject Button Styles
  rejectBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 1,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444', // Red border
  },
  rejectBtnLabel: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    marginLeft: 4,
  },
  horizontalScrollView: {
    paddingBottom: 16,
  },
  requestItem: {
    width: 140,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRequestItem: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  requestItemContent: {
    flex: 1,
  },
  requestNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  miniStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  requestCode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePickerField: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  datePickerText: {
    fontSize: 14,
    color: '#1F2937',
  },
});

export default styles;