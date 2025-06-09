import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';

const DateRangeFilter = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  showFromPicker,
  setShowFromPicker,
  showToPicker,
  setShowToPicker,
}) => {
  const formatDate = date =>
    date ? new Date(date).toLocaleDateString('en-GB') : null;

  return (
    <View style={styles.dateRangeContainer}>
      <Text style={styles.filterTitle}>Filter by Applied Date</Text>
      <View style={styles.datePickerRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}>
          <View style={styles.dateButtonContent}>
            <Icon name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.dateButtonText}>
              {fromDate ? formatDate(fromDate) : 'From Date'}
            </Text>
          </View>
        </TouchableOpacity>

        <Icon
          name="arrow-right"
          size={20}
          color="#6B7280"
          style={styles.arrowIcon}
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}>
          <View style={styles.dateButtonContent}>
            <Icon name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.dateButtonText}>
              {toDate ? formatDate(toDate) : 'To Date'}
            </Text>
          </View>
        </TouchableOpacity>

        {(fromDate || toDate) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setFromDate(null);
              setToDate(null);
            }}>
            <Icon name="close" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Date Pickers */}
      <DatePicker
        modal
        mode="date"
        open={showFromPicker}
        date={fromDate || new Date()}
        onConfirm={date => {
          setShowFromPicker(false);
          setFromDate(date);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={showToPicker}
        date={toDate || new Date()}
        onConfirm={date => {
          setShowToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dateRangeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
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
  arrowIcon: {marginHorizontal: 8},
  clearButton: {marginLeft: 12, padding: 8},
});

export default DateRangeFilter;
