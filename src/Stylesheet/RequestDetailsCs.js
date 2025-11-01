import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212121',
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  markAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  unreadCount: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContent: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#616161',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  debugText: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
  },
});


export default styles;