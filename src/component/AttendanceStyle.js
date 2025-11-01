import {StyleSheet, Dimensions} from 'react-native';


const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {fontSize: 18, fontWeight: '600', color: '#3F51B5', marginRight: 6},

  daysContainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    elevation: 2,
  },

  dayCard: {
    width: CARD_WIDTH + 10,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dayCardSelected: {
    backgroundColor: '#77d6f9',
    shadowColor: '#3F51B5',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  holidayCard: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF9800',
    borderWidth: 1,
    shadowColor: '#FF9800',
  },
  weekOffCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#3bba46',
    borderWidth: 1,
    shadowColor: '#3bba46',
  },
  absentCard: {
    backgroundColor: '#ffebee',
    borderColor: '#ff5252',
    borderWidth: 1,
    shadowColor: '#ff5252',
  },
  presentCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#6c6c6cff',
    borderWidth: 1,
    shadowColor: '#a0a0a0ff',
  },

  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#FFF',
    fontWeight: '700',
  },

  dotRow: {marginTop: 6, flexDirection: 'row', alignItems: 'center'},
  statusText: {marginLeft: 4, fontSize: 12, fontWeight: 'bold'},

  timeText: {marginLeft: 4, fontSize: 10, color: '#666'},

  agenda: {
    flex: 1,
    padding: 12,
  },
  agendaHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },

  emptyAgenda: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 16,
    padding: 32,
  },
  emptyText: {color: '#CCC', marginTop: 8, fontSize: 14},
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
  },
  
  dateHeader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  infoGrid: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  infoLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    width: 100,
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },

  presentCard: {
    borderLeftColor: '#4CAF50',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: width * 0.8,
    maxHeight: 350, // Adjusted height to show more years but not too tall
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  yearHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  yearListContent: {
    paddingVertical: 8,
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  yearItemSelected: {
    backgroundColor: '#3F51B5',
  },
  yearText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  yearTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },

  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
  },
  timeLabel: {fontSize: 13, color: '#4B5563', fontWeight: '600'},
  timeValue: {
    fontSize: 13,
    color: '#1F2937',
    marginRight: 12,
    fontWeight: '500',
  },

  viewToggle: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#E8EAF6',
  },
  toggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#3F51B5',
    fontWeight: '600',
  },
  eventsListContainer: {
    padding: 12,
    flexGrow: 1,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  eventsContainer: {
    flex: 1,
    padding: 12,
  },
});


export default { styles , width, CARD_WIDTH };
const {width} = Dimensions.get('window');
const CARD_WIDTH = 60;
