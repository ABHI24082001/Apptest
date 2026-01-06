// components/LeaveStatus.js
import React from 'react';
import {View, Text, ScrollView, StyleSheet, Dimensions, Platform, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const LeaveStatus = ({leaveData = []}) => {
  const hasData = leaveData && leaveData.length > 0;
  const hasNoLeaveAssigned = hasData && leaveData.some(item => item.label === "No Leave Assigned");

  const handleContactHR = () => {
    // You can implement navigation to HR contact or open email/phone
    console.log('Contact HR pressed');
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.leaveHeaderRow}>
          <Text style={styles.sectionTitle}>Leave Status</Text>
          <Text style={styles.sectionSub}>Summary of available leaves</Text>
        </View>

        {hasData && !hasNoLeaveAssigned ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.leaveScrollContainer}>
            {leaveData.map((item, index) => (
              <LinearGradient
                key={index}
                colors={['#e0f7fa', '#ffffff']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.leaveCard}>
                <Text style={styles.leaveType}>{item.label}</Text>

                <View style={styles.leaveRow}>
                  <Text style={styles.leaveInfo}>Used</Text>
                  <Text style={styles.leaveValue}>{item.used}</Text>
                </View>

                <View style={styles.leaveRow}>
                  <Text style={styles.leaveInfo}>Available</Text>
                  <Text style={[styles.leaveValue, {color: '#059669'}]}>
                    {item.available}
                  </Text>
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noLeaveTitle}>No Leave Balance</Text>
            <Text style={styles.noLeaveDescription}>
              You don't have any leave policies assigned
            </Text>
            <TouchableOpacity 
              style={styles.contactHRButton}
              onPress={handleContactHR}>
              <Text style={styles.contactHRText}>Contact HR</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Custom Card wrapper (instead of react-native-paper Card)
  card: {
    margin: 5,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 20,
  },
  cardContent: {
    padding: 14,
  },
  leaveHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  leaveScrollContainer: {
    paddingVertical: Platform.OS === 'ios' ? 5 : 10,
    paddingLeft: Platform.OS === 'ios' ? 0 : 6,
    paddingRight: 6,
  },
  leaveCard: {
    width: width * 0.35,
    borderRadius: 14,
    marginRight: 12,
    paddingVertical: Platform.OS === 'ios' ? 0 : 16,
    paddingHorizontal: Platform.OS === 'ios' ? 0 : 14,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
  },
  leaveType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom:  Platform.OS === 'ios' ? 20 : 0,
    // marginTop: 10,
    marginHorizontal: Platform.OS === 'ios' ? 10 : 0,
    marginVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 7,
    marginTop: 2,
    marginHorizontal: Platform.OS === 'ios' ? 10 : 2,
    marginVertical: Platform.OS === 'ios' ? 10 : 2,
  },
  leaveInfo: {
    fontSize: 13,
    color: '#475569',
  },
  leaveValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0c4a6e',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: 10,
  },
  noLeaveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noLeaveDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactHRButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  contactHRText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default LeaveStatus;
