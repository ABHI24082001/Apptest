import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Text, Platform } from 'react-native';
import { Card, Appbar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
const MyPaySlip = () => {
  const navigation = useNavigation();

  
const payslips = [
  {id: '1', month: 'April, 2025', salary: '******'},
  {id: '2', month: 'March, 2025', salary: '******'},
  {id: '3', month: 'February, 2025', salary: '******'},
];

const filterOptions = [
  {label: 'Last Month', value: 'last_month'},
  {label: 'Last 3 Months', value: 'last_3_months'},
  {label: 'Quarterly', value: 'quarterly'},
  {label: 'Yearly', value: 'yearly'},
];


 const [selectedFilter, setSelectedFilter] = useState('last_month');

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-document-outline" size={30} color="#6D75FF" />
        <View style={styles.cardText}>
          <Text style={styles.month}>{item.month}</Text>
          <Text style={styles.salary}>Net Salary: {item.salary}</Text>
        </View>
        <TouchableOpacity style={styles.previewBtn}>
          <Text style={styles.previewText}>Preview</Text>
        </TouchableOpacity>
        <Icon name="download" size={24} color="#666" />
      </View>
    </Card>
  );
  
  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="MyPaySlip" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
       
        
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginTop: 13,
          marginBottom: 10,
          marginHorizontal: 16,
        }}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#333'}}>
          PaySlip
        </Text>
      </View>

      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          value={selectedFilter}
          onValueChange={setSelectedFilter}
          items={filterOptions}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
        />
      </View>

      <FlatList
        data={payslips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
   

      
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



export default MyPaySlip;
