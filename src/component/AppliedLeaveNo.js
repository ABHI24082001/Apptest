// AppliedLeaveNo.js
import React from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

const AppliedLeaveNo = ({ appliedLeaveNo, setAppliedLeaveNo }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Applied Leave No.*</Text>
      <TextInput
        style={styles.textInput}
        value={appliedLeaveNo}
        editable={true}
        keyboardType="numeric"
        onChangeText={text => setAppliedLeaveNo(parseInt(text))}
        placeholder="Enter number of days"
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  textInput: {
    height: 50,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
});

export default AppliedLeaveNo;



 <View
          key={evt.id}
          style={[
            styles.eventCard,
            evt.type === 'absent' && styles.absentCard,
            (evt.type === 'holiday' || evt.type === 'week-off') && {
              backgroundColor: evt.color ? `${evt.color}33` : '#fff3e0',
              borderLeftColor: evt.color || '#FF9800',
            },
            evt.type === 'present' && styles.presentCard,
          ]}>
          {showDate && (
            <Text style={styles.eventDate}>
              {moment(evt.date).format('DD MMM YYYY')}
            </Text>
          )}        
          {times.length >= 2 && (
            <View style={styles.timeDetails}>
              <Text style={styles.timeLabel}>Check In: </Text>
              <Text style={styles.timeValue}>{times[0]}</Text>
              <Text style={styles.timeLabel}> Check Out: </Text>
              <Text style={styles.timeValue}>{times[1]}</Text>
            </View>
          )}
          <View style={styles.dotRow}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={[styles.eventTitle, {color: '#666'}]}>
              Working Hours: {workingHours}
            </Text>
          </View>
           <View style={styles.dotRow}>
            <MaterialIcons  />
            <Text style={[styles.eventTitle, {color: evt.color || '#333'}]}>
            Status {evt.name || leaveColors[evt.type]?.label || evt.type}
            </Text>
          </View>

          {dayShift && (
            <>
              <View style={styles.dotRow}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={[styles.eventTitle, {color: '#666'}]}>
                  Shift: {dayShift.shiftName}
                </Text>
              </View>
              <View style={styles.timeDetails}>
                <Text style={styles.timeLabel}>Shift Time: </Text>
                <Text style={styles.timeValue}>
                  {dayShift.shiftStartTime} - {dayShift.shiftEndTime}
                </Text>
              </View>
              <View style={styles.timeDetails}>
                <Text style={styles.timeLabel}>Required Hours: </Text>
                <Text style={styles.timeValue}>{requiredHours}</Text>
              </View>
            </>
          )}
        </View>
