import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Text, Platform, TouchableOpacity } from 'react-native';
import { Card, Appbar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AppSafeArea from '../component/AppSafeArea';

const ProfileSection = ({ title, icon, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleSection = () => {
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 1, { duration: 300 });
    height.value = withTiming(isOpen ? 0 : 1, { duration: 300 });
  };

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }
      ]
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        height.value,
        [0, 1],
        [0, data.length * 60 + (data.length - 1) * 4],
        Extrapolate.CLAMP
      ),
      opacity: height.value,
      overflow: 'hidden',
    };
  });

  const renderItem = (icon, label, value) => (
    <View key={label}>
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
    <Card style={styles.sectionCard}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name={icon} size={22} color="#333" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Animated.View style={iconStyle}>
            <Icon name="chevron-down" size={24} color="#333" />
          </Animated.View>
        </View>
      </TouchableOpacity>
      
      <Animated.View style={contentStyle}>
        <View style={styles.sectionContent}>
          {data.map(item => renderItem(item.icon, item.label, item.value))}
        </View>
      </Animated.View>
    </Card>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();

  const generalInfoData = [
    { icon: 'badge-account', label: 'Employee ID', value: 'AA_28' },
    { icon: 'map-marker', label: 'Branch', value: 'Noida' },
    { icon: 'water', label: 'Blood Group', value: 'A+' },
    { icon: 'account-heart', label: 'Marital Status', value: 'Un-Married' },
    { icon: 'account', label: "Father's Name", value: 'Jacob Birgitta' },
    { icon: 'account', label: "Mother's Name", value: 'Bella Birgitta' },
    { icon: 'bank', label: 'Bank Name', value: 'Urielle Ellison' },
    { icon: 'credit-card', label: 'Bank AC Number', value: '858' },
    { icon: 'barcode', label: 'Bank IFSC Code', value: 'Sit consequat Quam' }
  ];

  const contactData = [
    { icon: 'email', label: 'Email', value: 'Jayanta@cloudtree.com' },
    { icon: 'phone', label: 'Primary No', value: '+00 99371520' },
    { icon: 'cellphone', label: 'Emergency No', value: '+00 99371520' }
  ];

  const credentialsData = [
    { icon: 'email', label: 'Email', value: 'Jayanta@cloudtree.com' },
    { icon: 'account', label: 'User name', value: 'Jayanta Beher' },
    { icon: 'id-card', label: 'User id', value: 'A23' }
  ];

  const professionalData = [
    { icon: 'domain', label: 'Vertical', value: 'Pacific' },
    { icon: 'briefcase', label: 'Individual Company', value: 'Honey and Heath Trading' },
    { icon: 'account-group', label: 'Employee Type', value: 'Apprentice' },
    { icon: 'account-supervisor', label: 'Reporting Manager', value: '(Accounts Manager)' }
  ];
  
  return (
    <AppSafeArea>
      {/* Header */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard} elevation={2}>
          <View style={styles.profileContent}>
            <Image source={require('../assets/image/boy.png')} style={styles.profileImage} />
            <Text style={styles.name}>Jayanta Behera</Text>
            <Text style={styles.role}>IT, .Net Developer</Text>
          </View>
        </Card>

        {/* Section Components */}
        <ProfileSection 
          title="General Info" 
          icon="information-outline"
          data={generalInfoData} 
        />
        
        <ProfileSection 
          title="Contact" 
          icon="phone-outline"
          data={contactData} 
        />
        
        <ProfileSection 
          title="Credentials" 
          icon="shield-account-outline"
          data={credentialsData} 
        />
        
        <ProfileSection 
          title="Professional Details" 
          icon="briefcase-outline"
          data={professionalData} 
        />
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 3 : 0,
   
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
    paddingTop: 10,
  },
  profileCard: {
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#f0f0f0',
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
  sectionCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionContent: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  icon: {
    marginTop: 2,
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',  
  },
  label: {
    width: 120,
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