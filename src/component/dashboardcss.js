import {StyleSheet, Platform} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    marginBottom: -40, // Added bottom padding to prevent content from being cut off
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 16,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  progressDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  shiftNameContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    textAlign: 'center',
  },
  shiftNameValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3B82F6',
    // marginTop: 4,
  },
  shiftDetailLabel: {
    fontSize: 15,
    color: '#3d4554ff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  checkInButton: {},
  checkOutButton: {},
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  actionButtonIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  facePreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
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
  facePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  facePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facePreviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  facePreviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  faceImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  faceImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  faceImagePlaceholderText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  facePreviewDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  reregisterButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  reregisterButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  matchResultCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 2,
  },
  matchSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  matchFailure: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  matchResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  matchResultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  matchResultItem: {
    alignItems: 'center',
  },
  matchResultLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  matchResultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  infoCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  icon: {
    fontSize: 18,
    color: '#fff',
  },
  contentContainer: {
    paddingBottom: 30, // Add extra padding at the bottom of scrollable content
  },
  safeAreaBottom: {
    height: 20,
  }
});

export default styles;
