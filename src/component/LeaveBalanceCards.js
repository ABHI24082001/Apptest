// components/LeaveBalanceCards.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
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
            colors={['#699dffff', '#518be2ff']}
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
    ...Platform.select({
      ios: {
        paddingBottom: 20,
      },
      android: {
        paddingBottom: 15,
      },
    }),
  },
  cardWrapper: {
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  leaveCard: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: Platform.OS === 'ios' ? -7 : 25,
    // padding: 20,
    minWidth: 140,
    minHeight: Platform.OS === 'ios' ? 70 : 120,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      android: {
        backgroundColor: 'transparent', // Ensure gradient shows properly on Android
      },
    }),
  },
  leaveType: {
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
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
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
});

export default LeaveBalanceCards;
