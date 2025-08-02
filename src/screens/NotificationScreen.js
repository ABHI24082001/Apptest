import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
const RequestCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[styles.card, { borderLeftColor: '#2196F3' }]}
    >
      <View style={styles.row}>
        <View style={styles.textContent}>
          <Text style={styles.employeeName} numberOfLines={1}>
            {item.employeeName || 'Unknown'}
          </Text>
          <Text style={styles.notificationText} numberOfLines={2}>
            {item.notification}
          </Text>
          <View style={styles.timeRow}>
            <MaterialCommunityIcons 
              name="clock-time-four-outline" 
              size={14} 
              color="#757575" 
              style={styles.timeIcon}
            />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RequestDetailsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState({
    today: [],
    older: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const employeeDetails = useFetchEmployeeDetails();
// debugger
  console.log('Employee Details:==========================', employeeDetails);
  console.log('Company ID:', employeeDetails?.companyId);
  console.log('User ID:', employeeDetails?.userId);
  console.log('Employee Details:', JSON.stringify(employeeDetails, null, 2));

  const companyId = employeeDetails?.childCompanyId ; // fallback to 1 if not loaded
  const userId = employeeDetails?.id ;      // fallback to 11 if not loaded

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Moved fetchNotifications outside to be able to call it from the retry button
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      
      // Use dynamic companyId and userId
      const response = await axiosinstance.get(
        `${BASE_URL}/Email/GetAllNotificationByEmployeeIdWithSenderDetails/${companyId}/${userId}`
      );
      console.log('API Response:', JSON.stringify(response.data));
      
      if (response.data && Array.isArray(response.data)) {
        processNotifications(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(`Failed to load notifications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Process and format notifications with improved date handling
  const processNotifications = (data) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayNotifications = [];
      const olderNotifications = [];
      let unreadCounter = 0;

      data.forEach(item => {
        try {
          const notificationDate = new Date(item.createdDate);
          const formattedDate = formatDate(item.createdDate);

          const notification = {
            id: item.id || Math.random().toString(),
            employeeName: item.employeeName || 'Unknown',
            notification: item.notification || '',
            time: formattedDate,
            unread: true,
          };

          if (!isNaN(notificationDate.getTime())) {
            if (notificationDate >= today) {
              todayNotifications.push(notification);
            } else {
              olderNotifications.push(notification);
            }
          } else {
            olderNotifications.push(notification);
          }
          unreadCounter++;
        } catch (itemErr) {
          console.error('Error processing notification item:', itemErr, item);
        }
      });

      setNotifications({
        today: todayNotifications,
        older: olderNotifications
      });
      setUnreadCount(unreadCounter);
    } catch (processErr) {
      console.error('Error in processNotifications:', processErr);
      setError('Error processing notification data');
    }
  };
  
  // Helper functions with more robust date handling
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${formatTime(date)}`;
    } catch (err) {
      console.error('Error formatting date:', err, dateString);
      return 'Unknown date';
    }
  };
  
  const formatTime = (date) => {
    try {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (err) {
      console.error('Error formatting time:', err);
      return '';
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = {
      today: notifications.today.map(item => ({ ...item, unread: false })),
      older: notifications.older.map(item => ({ ...item, unread: false }))
    };
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const handleCardPress = (section, index) => {
    if (section === 'today' && notifications.today[index].unread) {
      const updatedNotifications = { ...notifications };
      updatedNotifications.today[index].unread = false;
      setNotifications(updatedNotifications);
      setUnreadCount(prev => prev - 1);
    } else if (section === 'older' && notifications.older[index].unread) {
      const updatedNotifications = { ...notifications };
      updatedNotifications.older[index].unread = false;
      setNotifications(updatedNotifications);
      setUnreadCount(prev => prev - 1);
    }
  };

  // Add console logs to the UI render section
  return (
    <AppSafeArea>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Details</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            onPress={markAllAsRead}
            activeOpacity={0.7}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loaderText}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={40} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchNotifications();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Debug info */}
            <Text style={styles.debugText}>
              Today: {notifications.today.length}, Older: {notifications.older.length}
            </Text>
            
            {/* Today Section */}
            {notifications.today.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Today</Text>
                  {notifications.today.filter(item => item.unread).length > 0 && (
                    <View style={styles.unreadCount}>
                      <Text style={styles.unreadCountText}>
                        {notifications.today.filter(item => item.unread).length}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardsContainer}>
                  {notifications.today.map((item, index) => (
                    <RequestCard 
                      item={item} 
                      key={`today-${item.id}`}
                      onPress={() => handleCardPress('today', index)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Older Section */}
            {notifications.older.length > 0 && (
              <View style={styles.section}>
                {notifications.today.length > 0 && <Divider style={styles.divider} />}
                <Text style={styles.sectionTitle}>Older</Text>
                <View style={styles.cardsContainer}>
                  {notifications.older.map((item, index) => (
                    <RequestCard 
                      item={item} 
                      key={`older-${item.id}`}
                      onPress={() => handleCardPress('older', index)}
                    />
                  ))}
                </View>
              </View>
            )}

            {notifications.today.length === 0 && notifications.older.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="bell-off" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>No notifications to display</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

export default RequestDetailsScreen;

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