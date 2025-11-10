// components/LeaveBalanceCards.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LeaveBalanceCards = ({ leaveData }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.leaveScrollContainer}>
        
      {leaveData.map((item, index) => (
        <View key={index} style={styles.cardWrapper}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.leaveCard}>
            <Text style={styles.leaveType}>{item.label}</Text>
            {/* <View style={styles.divider} /> */}
            <View style={styles.infoContainer}>
              <Text style={styles.leaveInfo}>
                Available: <Text style={styles.leaveBold}>{item.available}</Text>
              </Text>
              <Text style={styles.leaveInfo}>
                Used: <Text style={styles.leaveBold}>{item.used}</Text>
              </Text>
            </View>
          </LinearGradient>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  leaveScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardWrapper: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  leaveCard: {
    borderRadius: 16,
    padding: 20,
    minWidth: 140,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaveType: {
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    marginVertical: 8,
  },
  infoContainer: {
    alignItems: 'center',
    gap: 4,
  },
  leaveInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  leaveBold: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 15,
  },
});

export default LeaveBalanceCards;
