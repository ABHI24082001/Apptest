import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Avatar} from 'react-native-paper';

const UserCard = ({item}) => {
  return (
    <View style={styles.container}>
      {item.image ? (
        <Avatar.Image source={item.image} size={48} />
      ) : (
        <Avatar.Icon icon="account" size={48} />
      )}
      <Text style={styles.role}>{item.role}</Text>
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  role: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c5282',
    textAlign: 'center',
    marginTop: 6,
  },
  name: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
});

export default UserCard;
