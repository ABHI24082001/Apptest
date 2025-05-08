import React from 'react';
import { View, ScrollView, Image, StyleSheet, Text, Platform } from 'react-native';
import { Card, Appbar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const renderItem = (icon, label, value) => (
    <View>
      <View style={styles.row}>
        <Icon name={icon} size={20} color="#666" style={styles.icon} />
        <View style={styles.textWrapper}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      <Divider style={{ marginVertical: 4 }} />
    </View>
  );
  
  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Section Heading */}
        

        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            <Image source={require('../assets/image/boy.png')} style={styles.profileImage} />
            <Text style={styles.name}>Jayanta Behera</Text>
            <Text style={styles.role}>IT, .Net Developer</Text>
          </View>
        </Card>

        {/* General Info Section */}
        <Text style={styles.sectionTitle}>General Info</Text>
        <Card style={styles.infoCard}>
          {renderItem('badge-account', 'Employee ID', 'AA_28')}
          {renderItem('calendar-month', 'Date Of Joining', '06/07/2023')}
          {renderItem('map-marker', 'Branch', 'Noida')}
          {renderItem('email', 'Email', 'Jayanta@cloudtree.com')}
          {renderItem('lock', 'Password', 'jayantacloud@2025')}
          {renderItem('phone', 'Primary No', '+00 99371520')}
          {renderItem('cellphone', 'Emergency No', '+00 99371520')}
          {renderItem('water', 'Blood Group', 'A+')}
          {renderItem('account-heart', 'Marital Status', 'Un-Married')}
          {renderItem('account', "Father's Name", 'Jacob Birgitta')}
          {renderItem('account', "Mother's Name", 'Bella Birgitta')}
        </Card>

        {/* Professional Details Section */}
        <Text style={styles.sectionTitle}>Professional Details</Text>
        <Card style={styles.infoCard}>
          {renderItem('calendar-month', 'Date Of Joining', '06/07/2023')}
          {renderItem('domain', 'Company Vertical', 'Pacific')}
          {renderItem('briefcase', 'Individual Company', 'Honey and Heath Trading')}
          {renderItem('account-group', 'Employee Type', 'Apprentice')}
          {renderItem('office-building', 'Branch Name', 'Mumbai')}
          {renderItem('account-supervisor', 'Reporting Employee', 'Vance Young (Accounts Manager)')}
          {renderItem('bank', 'Bank Name', 'Urielle Ellison')}
          {renderItem('credit-card', 'Bank AC Number', '858')}
          {renderItem('barcode', 'Bank IFSC Code', 'Sit consequat Quam')}
        </Card>
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 10,
  },
  profileCard: {
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 20,
    alignItems: 'center',
  },
  profileContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    marginTop: 20,
    color: '#333',
  },
  infoCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  icon: {
    marginTop: 2,
    marginRight: 10,
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',  
  },
  label: {
    width: 120, // Fixed width for alignment
    fontWeight: '600',
    fontSize: 14,
    color: '#333',  
  },
  colon: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  value: {
    flexShrink: 1,
    fontSize: 13,
    color: '#555',
  },
  
});

export default ProfileScreen;
