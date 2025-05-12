import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';

const requestsData = {
  today: [
    {
      type: 'Exit Request',
      name: 'Anusman Samal',
      title: '.Net Developer',
      department: 'IT Dept',
      id: '784512',
      time: '4/3/2025 06:45 PM',
      status: 'Rejected by HR',
      color: '#FF5252',
      icon: 'close-circle',
      avatar: { uri: 'https://i.pravatar.cc/150?img=1' },
      unread: true,
    },
    {
      type: 'Leave Status Update',
      name: 'Jayanta Behera',
      title: 'Marketing, Sale Executive',
      department: '',
      id: '784512',
      time: '4/3/2025 06:45 PM',
      status: 'Approved',
      color: '#4CAF50',
      icon: 'check-circle',
      avatar: 'J',
      unread: true,
    },
    {
      type: 'Pending Request',
      name: 'Durga Prasad',
      title: 'UI Developer',
      department: 'IT Dept',
      id: '784510',
      time: '22/02/2025 10:45 AM',
      status: 'Pending Your Approval',
      color: '#FFC107',
      icon: 'clock-alert',
      avatar: 'D',
      unread: true,
    },
  ],
  older: [
    {
      type: 'Exit Request',
      name: 'Kush Samal',
      title: 'React Developer',
      department: 'IT Dept',
      id: '784512',
      time: '4/3/2025 06:45 PM',
      status: 'Rejected by HR',
      color: '#E91E63',
      icon: 'close-circle',
      avatar: 'K',
      unread: false,
    },
    {
      type: 'Exit Request',
      name: 'Kush Sharma',
      title: 'Rust Developer',
      department: 'IT Dept',
      id: '784512',
      time: '4/3/2025 06:45 PM',
      status: 'Rejected by HR',
      color: '#9C27B0',
      icon: 'close-circle',
      avatar: 'T',
      unread: false,
    },
    {
      type: 'Exit Request',
      name: 'Suman Samal',
      title: '.Net Developer',
      department: 'IT Dept',
      id: '784512',
      time: '4/3/2025 06:45 PM',
      status: 'Rejected by HR',
      color: '#FF9800',
      icon: 'close-circle',
      avatar: 'S',
      unread: false,
    },
  ],
};

const RequestCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[styles.card, { borderLeftColor: item.color }]}
    >
      <View style={styles.row}>
        {typeof item.avatar === 'string' ? (
          <Avatar.Text 
            size={44} 
            label={item.avatar} 
            style={[styles.avatar, { backgroundColor: `${item.color}20` }]} 
            labelStyle={styles.avatarText}
          />
        ) : (
          <Avatar.Image size={44} source={item.avatar} style={styles.avatar} />
        )}
        <View style={styles.textContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.type}</Text>
            {item.unread && <View style={styles.unreadBadge} />}
          </View>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={16} 
              color={item.color} 
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: item.color }]} numberOfLines={1}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {`${item.name}, ${item.title}${item.department ? `, ${item.department}` : ''}`}
          </Text>
          <Text style={styles.idText} numberOfLines={1}>{`ID: ${item.id}`}</Text>
        </View>
      </View>
      <View style={styles.timeRow}>
        <MaterialCommunityIcons 
          name="clock-time-four-outline" 
          size={14} 
          color="#757575" 
          style={styles.timeIcon}
        />
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RequestDetailsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState(requestsData);
  const [unreadCount, setUnreadCount] = useState(3);

  const markAllAsRead = () => {
    const updatedRequests = {
      today: requests.today.map(item => ({ ...item, unread: false })),
      older: requests.older
    };
    setRequests(updatedRequests);
    setUnreadCount(0);
  };

  const handleCardPress = (section, index) => {
    if (section === 'today' && requests.today[index].unread) {
      const updatedRequests = { ...requests };
      updatedRequests.today[index].unread = false;
      setRequests(updatedRequests);
      setUnreadCount(prev => prev - 1);
    }
  };

  return (
    <AppSafeArea>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity> */}
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
        {/* Today Section */}
        {requests.today.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadCount}>
                  <Text style={styles.unreadCountText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardsContainer}>
              {requests.today.map((item, index) => (
                <RequestCard 
                  item={item} 
                  key={`today-${index}`}
                  onPress={() => handleCardPress('today', index)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Older Section */}
        {requests.older.length > 0 && (
          <View style={styles.section}>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Older</Text>
            <View style={styles.cardsContainer}>
              {requests.older.map((item, index) => (
                <RequestCard 
                  item={item} 
                  key={`older-${index}`}
                  onPress={() => {}}
                />
              ))}
            </View>
          </View>
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
  avatar: {
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
  },
  textContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  meta: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 2,
  },
  idText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'flex-end',
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
});