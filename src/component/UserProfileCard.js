import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from 'react-native-paper';

const UserProfileCard = ({name, role, company}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.company}>{company}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ace2fc', // Light grey border
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  role: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  company: {
    fontSize: 15,
    color: '#777',
  },
});

export default UserProfileCard;
