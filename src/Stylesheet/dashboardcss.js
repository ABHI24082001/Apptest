import {StyleSheet, Platform } from 'react-native';
const IOS_TOP =  Platform.OS === "ios" ? -30 : 0;

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingBottom: Platform.OS === 'ios' ? IOS_TOP : 0,  
  },
  header: {
  paddingHorizontal: Platform.OS === 'ios' ? 0 : 20,   // fixed — no negative padding!
  marginBottom: 20,
  paddingTop: Platform.OS === 'ios' ? IOS_TOP : 20,
  paddingBottom: 20,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  headerGreeting: {
    fontSize: 20,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  headerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  headerTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerDate: {
    fontSize: 11,
    color: '#DBEAFE',
    marginTop: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },


statusBadge: {
  backgroundColor: '#ffffffff',
  borderRadius: 16,
  paddingVertical: 10,
  paddingHorizontal: 14,
  marginTop: 16,
  marginBottom: 10,
  marginLeft: Platform.OS === 'ios' ? 20 : 0,
  alignSelf: 'flex-start',
  minWidth: '60%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 0.5,
  borderColor: '#E5E7EB',
},

statusContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  flex: 1,
},

statusDot: {
  width: 14,
  height: 14,
  borderRadius: 7,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 1.5,
},

statusActive: {
  backgroundColor: '#22C55E', // Tailwind Green-500
},

statusInactive: {
  backgroundColor: '#EF4444', // Tailwind Red-500
},

statusTextContainer: {
  flex: 1,
},

statusLabel: {
  fontSize: 15,
  fontWeight: '600',
  color: '#111827',
  letterSpacing: 0.2,
},

statusTime: {
  fontSize: 13,
  fontWeight: '500',
  color: '#6B7280',
  marginTop: 2,
},


// Hide the old complex status badge styles
statusBadgeContent: {
  display: 'none',
},
statusIndicatorContainer: {
  display: 'none',
},
modernStatusDot: {
  display: 'none',
},
statusActiveModern: {
  display: 'none',
},
statusInactiveModern: {
  display: 'none',
},
statusDotInner: {
  display: 'none',
},
statusPulse: {
  display: 'none',
},
modernStatusText: {
  display: 'none',
},
statusTimeText: {
  display: 'none',
},

  content: {
    padding: 20,
    paddingTop: 10,
  },
  registrationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginBottom: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  registrationGradient: {
    padding: 30,
    alignItems: 'center',
  },
  registrationIconWrapper: {
    marginBottom: 20,
  },
  registrationIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  registrationIconText: {
    fontSize: 36,
  },
  registrationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  registrationDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  registerButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Progress card 

  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconContainer: {
    backgroundColor: '#EEF2FF',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-evenly',
    marginTop: 5,
  },
  missesPercentageText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#d73f1dff',
  },
  progressPercentageText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  percentageBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  progressBarWrapper: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
  },
  missedTimeFill: {
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
    left: 0,
  },
  progressIndicator: {
    position: 'absolute',
    top: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  progressStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  missedTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  workedTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  remainingTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Remove old styles that are no longer needed
  // progressRow: { ... } - removed
  // missesPercentageText: { ... } - removed  
  // progressPercentageText: { ... } - removed

  contentContainer: {
    paddingBottom: 30, // Add extra padding at the bottom of scrollable content
  },
  safeAreaBottom: {
    height: 20,
  },

  // Enhanced Progress Details
  progressDetailsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  progressDetailCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailIconWrapper: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  detailIcon: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  progressDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  timeDisplayRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    marginLeft: -4,
  },
  timeSegment: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    lineHeight: 16,
  },
  timeUnit: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  // Enhanced Shift Info
  shiftInfoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shiftInfoGradient: {
    padding: Platform.OS === 'ios' ? 0 : 16,
  },
  shiftInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shiftIconContainer: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shiftIcon: {
    fontSize: 20,
  },
  shiftTextContainer: {
    flex: 1,
  },
  shiftLabel: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shiftValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },

  // Enhanced Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  modernActionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  checkInButtonActive: {
    transform: [{ scale: 1 }],
  },
  checkOutButtonActive: {
    transform: [{ scale: 1 }],
  },
  actionButtonDisabled: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
  actionButtonGradient: {
    paddingVertical: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: Platform.OS === 'ios' ? 0 : 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionButtonSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  activeButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  disabledButtonSubtext: {
    color: '#6B7280',
  },
  actionButtonIcon: {
    fontSize: 20,
  },

  // Remove old styles
  progressDetails: {
    display: 'none', // Hide old style
  },
  progressDetailItem: {
    display: 'none', // Hide old style
  },
  progressDivider: {
    display: 'none', // Hide old style
  },
  shiftNameContainer: {
    display: 'none', // Hide old style
  },
  shiftNameValue: {
    display: 'none', // Hide old style
  },
  shiftDetailLabel: {
    display: 'none', // Hide old style
  },
  actionButtons: {
    display: 'none', // Hide old style
  },
  actionButton: {
    display: 'none', // Hide old style
  },
});

export default styles;
