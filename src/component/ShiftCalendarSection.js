import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OnLeaveUsers = ({leaveUsers, navigation}) => {
  const renderUserItem = ({item}) => (
    <Card style={styles.userCard}>
      <Card.Content style={styles.userContent}>
        <View style={styles.iconWrapper}>
          <Icon name="account-circle" size={40} color="#90caf9" />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
        </View>
      </Card.Content>
    </Card>
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
      <Card.Content style={styles.listContent}>
        <FlatList
          data={leaveUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    margin: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0e7f3',
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
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
  listContent: {
    paddingBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  userCard: {
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0f0fc',
    width: 160,
    elevation: 2,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrapper: {
    marginRight: 10,
  },
  textWrapper: {
    flexShrink: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  role: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
  },
});

export default OnLeaveUsers;
