import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import styles from '../Stylesheet/RequestDetailsCs';

const getRequestTypeAndColor = (notification) => {
  const msg = notification.toLowerCase();
  if (msg.includes('approved')) {
    return { type: 'Approved Request', color: '#4CAF50' }; // green
  } else if (msg.includes('rejected')) {
    return { type: 'Rejected Request', color: '#F44336' }; // red
  } else if (msg.includes('pending')) {
    return { type: 'Pending Request', color: '#FF9800' }; // orange
  } else if (msg.includes('exit')) {
    return { type: 'Exit Request', color: '#9C27B0' }; // purple
  }
  return { type: 'Leave Request', color: '#2196F3' }; // default blue
};

const RequestCard = ({ item, onPress }) => {
  const { type, color } = getRequestTypeAndColor(item.notification);
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[styles.card, { borderLeftColor: color  }]}
    >
      <View style={styles.row}>
        <View style={styles.textContent}>
          <Text style={[styles.employeeName, { color }]} numberOfLines={1}>
            {type}
          </Text>
          <Text style={styles.notificationText} numberOfLines={2}>
            {item.notification}ID {item.id || 'NO ID '}
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

const RequestDetailsScreen = ({ navigation }) => {

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
    if (companyId && userId) {
      fetchNotifications();
    }
  }, [companyId, userId]); // Add dependencies to re-fetch when IDs are available
  
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

      console.log('===============================', response.data)
      
      if (response.data && Array.isArray(response.data)) {
        processNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
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

  const markNotificationsAsRead = async () => {
    try {
      const response = await axiosinstance.get(
        `${BASE_URL}/Notification/NotificationMarkasRead/${companyId}/${userId}`
      );
      
      if (response.status === 200) {
        // Update local state after successful API call
        const updatedNotifications = {
          today: notifications.today.map(item => ({ ...item, unread: false })),
          older: notifications.older.map(item => ({ ...item, unread: false }))
        };
        setNotifications(updatedNotifications);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const markAllAsRead = () => {
    markNotificationsAsRead(); // Call the API function
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
                <Text style={styles.emptyText}>No notifications available</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </AppSafeArea>
  );
};

export default RequestDetailsScreen;

