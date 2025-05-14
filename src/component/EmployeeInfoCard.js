import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';

const EmployeeInfoCard = ({ employee }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{employee.name}</Text>
        <Text style={styles.id}>ID: {employee.code}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.extraDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Department</Text>
          <Text style={styles.value}>{employee.department}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Designation</Text>
          <Text style={styles.value}>{employee.designation}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{employee.type}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  id: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  divider: {
    marginVertical: 6,
  },
  extraDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  detailItem: {
    width: '30%',
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#1e293b',
  },
});

export default EmployeeInfoCard;
