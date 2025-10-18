// components/LeaveStatus.js
import React from 'react';
import {View, Text, ScrollView, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const LeaveStatus = ({leaveData = []}) => {
  const hasData = leaveData && leaveData.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.leaveHeaderRow}>
          <Text style={styles.sectionTitle}>Leave Status</Text>
          <Text style={styles.sectionSub}>Summary of available leaves</Text>
        </View>

        {hasData ? (
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
            <LinearGradient
              colors={['#f0f9ff', '#ffffff']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.noDataCard}>
              <Text style={styles.noDataText}>No Leave Data Available</Text>
            </LinearGradient>
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
    paddingVertical: 10,
    paddingRight: 6,
  },
  leaveCard: {
    width: width * 0.35,
    borderRadius: 14,
    marginRight: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
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
    marginBottom: 10,
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    paddingVertical: 16,
  },
  noDataCard: {
    width: width * 0.6,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  noDataText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default LeaveStatus;
