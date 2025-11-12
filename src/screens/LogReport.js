import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Appbar, Card} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import Attendancecalender from '../component/Attendancecalender';
import CustomHeader from '../component/CustomHeader';
import ScrollAwareContainer from '../component/ScrollAwareContainer';

const Attandance = ({navigation}) => {
  return ( 
    <AppSafeArea>
      <CustomHeader title="Log Report" navigation={navigation} />

      <ScrollAwareContainer navigation={navigation} currentRoute="LogReport">
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>
          <Card style={[styles.card, {backgroundColor: '#f0f0f0'}]}>
            <Card.Content>
              <Attendancecalender />
            </Card.Content>
          </Card>
        </ScrollView>
      </ScrollAwareContainer>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginLeft: 16,
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
