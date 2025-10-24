import { StyleSheet, Platform } from 'react-native';
const styles = StyleSheet.create({
  gradientHeader: {
    width: '100%',
    paddingBottom: 0,
  },
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerContainer: {
    paddingVertical: 16,
  },
  headerTitleGradient: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cardListContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
  },
  leaveTypeChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  dateCard: {
    flex: 1,
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    elevation: 0,
  },
  dateLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  emptyCard: {
    margin: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  headerContainer: {
    marginBottom: 16,
  },
  dateFilterToggleButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 8,
  },
  activeDateFilterBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeDateFilterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateRangeContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  tabContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  segmented: {
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default styles;