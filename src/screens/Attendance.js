import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Card} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import Attendancecalender from '../component/Attendancecalender';

const Attandance = () => {
  return (
    <AppSafeArea>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Attandance</Text>
            <Attendancecalender/>
          </Card.Content>
        </Card>
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F5F7FA',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
});

export default Attandance;
