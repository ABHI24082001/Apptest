import {StyleSheet, Platform} from 'react-native';


const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  amountText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  expenseItemsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemsCount: {
    backgroundColor: '#10B981',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  expenseItem: {
    paddingVertical: 10,
  },
  expenseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  expenseItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  expenseItemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseItemDetails: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  itemDivider: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 10,
  },
  documentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  documentLinkText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#2962ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default styles;