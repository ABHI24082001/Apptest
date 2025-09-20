import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Appbar, Card} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import Attendancecalender from '../component/Attendancecalender';

const Attandance = ({navigation}) => {
  return ( 
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content
          title="Log Report"
          titleStyle={styles.headerTitle} 
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Attandance</Text>
            <Attendancecalender />
          </Card.Content>
        </Card>
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({

    header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
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
