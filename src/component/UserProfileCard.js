import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from 'react-native-paper';

const UserProfileCard = ({name, designation, department, company}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.label}>
          Designation: <Text style={styles.value}>{designation}</Text>
        </Text>
        <Text style={styles.label}>
          Department: <Text style={styles.value}>{department}</Text>
        </Text>
        {company && (
          <Text style={styles.label}>
            Company: <Text style={styles.value}>{company}</Text>
          </Text>
        )}
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
    borderColor: '#ace2fc',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    marginBottom: 2,
  },
  value: {
    fontWeight: '400',
    color: '#555',
  },
});

export default UserProfileCard;
