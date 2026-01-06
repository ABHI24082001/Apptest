import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Text, Avatar, Divider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
import styles from '../Stylesheet/RequestDetailsCs';
import CustomHeader from '../component/CustomHeader';
import ScrollAwareContainer from '../component/ScrollAwareContainer';
import {useAuth} from '../constants/AuthContext';

const getRequestTypeAndColor = notification => {
  const msg = notification.toLowerCase();
  if (msg.includes('approved')) {
    return {type: 'Approved Request', color: '#4CAF50'}; // green
  } else if (msg.includes('rejected')) {
    return {type: 'Rejected Request', color: '#F44336'}; // red
  } else if (msg.includes('pending')) {
    return {type: 'Pending Request', color: '#FF9800'}; // orange
  } else if (msg.includes('exit')) {
    return {type: 'Exit Request', color: '#9C27B0'}; // purple
  }
  return {type: 'Leave Request', color: '#2196F3'}; // default blue
};

// Add image cache to avoid repeated API calls
const imageCache = new Map();

// Function to fetch employee image
const fetchEmployeeImage = async (employeeId, employeeImage) => {
  const cacheKey = `${employeeId}_${employeeImage}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    if (employeeImage) {
      const fetchUrl = `https://hcmv2.anantatek.com/api/UploadDocument/FetchFile?fileNameWithExtension=${employeeImage}`;

      const response = await fetch(fetchUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();

          if (result.base64File) {
            const extension = employeeImage.split('.').pop() || 'jpg';
            const imageUri = `data:image/${extension};base64,${result.base64File}`;

            // Cache the result
            imageCache.set(cacheKey, imageUri);
            return imageUri;
          }
        }
      }

      // Fallback to static URL
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${employeeImage}`;
      imageCache.set(cacheKey, staticImageUrl);
      return staticImageUrl;
    }
  } catch (error) {
    console.error('Error fetching employee image:', error);
  }

  // Return null if no image available
  imageCache.set(cacheKey, null);
  return null;
};

const RequestCard = ({item, onPress}) => {
  const {type, color} = getRequestTypeAndColor(item.notification);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true);
      const url = await fetchEmployeeImage(item.employeeId, item.employeeImage);
      setImageUrl(url);
      setImageLoading(false);
    };

    if (item.employeeId && item.employeeImage) {
      loadImage();
    } else {
      setImageLoading(false);
    }
  }, [item.employeeId, item.employeeImage]);

  const renderAvatar = () => {
    if (imageLoading) {
      return (
        <View style={styles.avatarContainer}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      );
    }

    if (imageUrl) {
      return (
        <Image
          source={{uri: imageUrl}}
          style={styles.employeeAvatar}
          onError={() => setImageUrl(null)}
        />
      );
    }

    // Default avatar with employee initials
    const initials = item.employeeName
      ? item.employeeName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
      : '?';

    return (
      <Avatar.Text
        size={48}
        label={initials}
        style={[styles.defaultAvatar, {backgroundColor: color}]}
        labelStyle={styles.avatarText}
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, {borderLeftColor: color}]}>
      <View style={styles.row}>
        <View style={{marginRight: 17, alignItems: 'center'}}>
          {renderAvatar()}
        </View>

        <View style={styles.textContent}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 6,
              minHeight: 24,
            }}>
            <View style={styles.nameSection}>
              <Text style={[styles.employeeName, {color}]} numberOfLines={1}>
                {item.employeeName || 'Unknown Employee'}
              </Text>
            </View>
            <View style={styles.badgeContainer}>
              <View style={[styles.typeBadge, {backgroundColor: color}]}>
                <Text style={styles.badgeText}>
                  {type}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.employeeDetails} numberOfLines={1}>
              • {item.departmentName || 'N/A'} • {item.designationName || 'N/A'}
            </Text>
          </View>

          <Text style={styles.notificationText} numberOfLines={3}>
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

const RequestDetailsScreen = ({navigation}) => {
  const [notifications, setNotifications] = useState({
    today: [],
    older: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const {user} = useAuth();
  // debugger;
  console.log(
    user,
    'kmfdfkndfknodfknodfsknfdknfdkkngnkgdkngdsssgnkgngnkgdknggkn',
  );

  // Use user data instead of employeeDetails
  console.log('User Details:==========================', user);
  console.log('Company ID:', user?.companyId);
  console.log('User ID:', user?.userId);
  console.log('User Details:', JSON.stringify(user, null, 2));

  const companyId = user?.childCompanyId; // fallback to 1 if not loaded
  const userId = user?.id; // fallback to 11 if not loaded

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
        `${BASE_URL}/Email/GetAllNotificationByEmployeeIdWithSenderDetails/${companyId}/${userId}`,
      );
      console.log('API Response:', JSON.stringify(response.data));

      console.log('===============================', response.data);

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
  const processNotifications = data => {
    try {
      console.log('Processing notifications data:', data);

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
            employeeId: item.employeeId,
            employeeName: item.employeeName || 'Unknown',
            employeeCode: item.employeeCode || 'N/A',
            employeeImage: item.employeeImage,
            departmentName: item.departmentName || 'N/A',
            designationName: item.designationName || 'N/A',
            notification: item.notification || '',
            time: formattedDate,
            unread: item.active || true,
            companyId: item.companyId,
            createdBy: item.createdBy,
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

      // Sort notifications by date (newest first)
      todayNotifications.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
      );
      olderNotifications.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
      );

      setNotifications({
        today: todayNotifications,
        older: olderNotifications,
      });
      setUnreadCount(unreadCounter);
    } catch (processErr) {
      console.error('Error in processNotifications:', processErr);
      setError('Error processing notification data');
    }
  };

  // Helper functions with more robust date handling
  const formatDate = dateString => {
    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} ${formatTime(date)}`;
    } catch (err) {
      console.error('Error formatting date:', err, dateString);
      return 'Unknown date';
    }
  };

  const formatTime = date => {
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
        `${BASE_URL}/Notification/NotificationMarkasRead/${companyId}/${userId}`,
      );

      console.log(response.data, 'dvdnzjkbds[uvioufoiuf');

      if (response.status === 200) {
        // Update local state after successful API call
        const updatedNotifications = {
          today: notifications.today.map(item => ({...item, unread: false})),
          older: notifications.older.map(item => ({...item, unread: false})),
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
      const updatedNotifications = {...notifications};
      updatedNotifications.today[index].unread = false;
      setNotifications(updatedNotifications);
      setUnreadCount(prev => prev - 1);
    } else if (section === 'older' && notifications.older[index].unread) {
      const updatedNotifications = {...notifications};
      updatedNotifications.older[index].unread = false;
      setNotifications(updatedNotifications);
      setUnreadCount(prev => prev - 1);
    }
  };

  return (
    <AppSafeArea>
      {/* <CustomHeader 
        title="Request Details" 
        navigation={navigation}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity 
              onPress={markAllAsRead}
              activeOpacity={0.7}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          ) : null
        }
      /> */}

      <ScrollAwareContainer
        navigation={navigation}
        currentRoute="NotificationScreen">
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loaderText}>Loading notifications...</Text>
            </View>
          ) : (
            <>
              {/* Today Section */}
              {notifications.today.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today</Text>
                    {notifications.today.filter(item => item.unread).length >
                      0 && (
                      <View style={styles.unreadCount}>
                        <Text style={styles.unreadCountText}>
                          {
                            notifications.today.filter(item => item.unread)
                              .length
                          }
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
                  {notifications.today.length > 0 && (
                    <Divider style={styles.divider} />
                  )}
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

              {notifications.today.length === 0 &&
                notifications.older.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                      name="bell-off"
                      size={48}
                      color="#BDBDBD"
                    />
                    <Text style={styles.emptyText}>
                      No notifications available
                    </Text>
                  </View>
                )}
            </>
          )}
        </ScrollView>
      </ScrollAwareContainer>
    </AppSafeArea>
  );
};

export default RequestDetailsScreen;
