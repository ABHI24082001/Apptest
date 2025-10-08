import React from 'react';
import {View, Text, FlatList, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const OnLeaveUsers = ({leaveUsers}) => {
  const navigation = useNavigation();

  // If there's no data or empty array, don't render anything
  if (!leaveUsers || leaveUsers.length === 0) {
    return null;
  }

  const renderUserItem = ({item}) => (
    <View style={styles.userCard}>
      <Image source={item.image} style={styles.userImage} />
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.role} numberOfLines={2}>{item.role}</Text>
      </View>
    </View>
  );

  return (
    <Card style={styles.containerCard}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Who is on Leave</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WhoLeave')}>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevron-right" size={20} color="#1976D2" />
          </View>
        </TouchableOpacity>
      </View>
      <FlatList
        data={leaveUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    borderRadius: 14,
    marginHorizontal: 10,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0f0fc',
    paddingBottom: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  userCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#d0e7f3',
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  role: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default OnLeaveUsers;




