import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  TextInput
} from 'react-native';
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
import BASE_URL from '../constants/apiConfig';
import { useAuth } from '../constants/AuthContext';
import axios from 'axios';

const ProfileSection = ({ title, icon, data, onEdit }) => {
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

  const renderItem = (icon, label, value, editable = false) => (
    <View key={label} style={styles.row}>
      <Icon name={icon} size={20} color="#666" style={styles.icon} />
      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {editable && (
        <TouchableOpacity onPress={() => onEdit(label)} style={styles.editIcon}>
          <Icon name="pencil" size={20} color="#000" />
        </TouchableOpacity>
      )}
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
          {data.map(item =>
            renderItem(item.icon, item.label, item.value, item.editable)
          )}
        </View>
      </Animated.View>
    </Card>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to track editing
  const [editedBloodGroup, setEditedBloodGroup] = useState(''); // State for edited blood group

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (user?.id) {
          const response = await axios.get(
            `${BASE_URL}EmpRegistration/GetEmpRegistrationById/${user.id}`
          );
          setEmployeeData(response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [user]);

  const handleEdit = (field) => {
    if (field === 'Blood Group') {
      setIsEditing(true);
      setEditedBloodGroup(employeeData.bloodGroup); // Pre-fill with current value
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = { ...employeeData, bloodGroup: editedBloodGroup };
      await axios.put(
        `${BASE_URL}EmpRegistration/UpdateEmpRegistration/${user.id}`,
        updatedData
      );
      setEmployeeData(updatedData); // Update local state
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error('Error updating blood group:', error);
    }
  };

  const IMG_BASE_URL = 'https://hcmv2.anantatek.com/assets/UploadImg/';
  const imageUrl = user?.empImage ? `${IMG_BASE_URL}${user.empImage}` : null;

  if (!employeeData) {
    return (
      <AppSafeArea>
        <Appbar.Header>
          <Appbar.Content title="Profile" />
        </Appbar.Header>
        <Text style={{ padding: 20, textAlign: 'center' }}>Loading profile...</Text>
      </AppSafeArea>
    );
  }

  const generalInfoData = [
    { icon: 'badge-account', label: 'Employee ID', value: employeeData.employeeId },
    { icon: 'map-marker', label: 'Branch', value: employeeData.branchName },
    {
      icon: 'water',
      label: 'Blood Group',
      value: isEditing ? (
        <TextInput
          style={styles.editInput}
          value={editedBloodGroup}
          onChangeText={setEditedBloodGroup}
        />
      ) : (
        employeeData.bloodGroup
      ),
      editable: true,
    },
    { icon: 'account-heart', label: 'Marital Status', value: employeeData.maritalStatus },
    { icon: 'account', label: "Father's Name", value: employeeData.empFather },
    { icon: 'account', label: "Mother's Name", value: employeeData.empMother },
    { icon: 'bank', label: 'Bank Name', value: employeeData.existingBank },
    { icon: 'credit-card', label: ' AC Number', value: employeeData.bankAcNo },
    { icon: 'barcode', label: 'IFSC Code', value: employeeData.bankIfsc }
  ];

  const contactData = [
    { icon: 'email', label: 'Email', value: employeeData.emailAddress },
    { icon: 'phone', label: 'Primary No', value: employeeData.pcontactNo },
    { icon: 'cellphone', label: 'Emergency No', value: employeeData.emergencyContactNo }
  ];

  const credentialsData = [
    { icon: 'email', label: 'Email', value: employeeData.emailAddress },
    { icon: 'account', label: 'Username', value: employeeData.username },
    { icon: 'id-card', label: 'User ID', value: employeeData.employeeId }
  ];

  const professionalData = [
    { icon: 'domain', label: 'Vertical', value: employeeData.companyVerticalId?.toString() ?? 'N/A' },
    { icon: 'briefcase', label: 'Branch Name', value: employeeData.branchName },
    { icon: 'account-group', label: 'Employee Type', value: employeeData.employeeTypeName },
    { icon: 'account-supervisor', label: 'Designation', value: employeeData.designationName}, 
    { icon: 'account-supervisor', label: 'Department', value: employeeData.departmentName}

  ];

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard} elevation={2}>
          <View style={styles.profileContent}>
            <Image
              source={imageUrl ? { uri: imageUrl } : require('../assets/image/boy.png')}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{employeeData.employeeName}</Text>
            <Text style={styles.role}>
              {employeeData.designationName}, {employeeData.departmentName}
            </Text>
          </View>
        </Card>

        <ProfileSection
          title="General Info"
          icon="information-outline"
          data={generalInfoData}
          onEdit={handleEdit}
        />

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <ProfileSection title="Contact" icon="phone-outline" data={contactData} />
        <ProfileSection title="Credentials" icon="shield-account-outline" data={credentialsData} />
        <ProfileSection title="Professional Details" icon="briefcase-outline" data={professionalData} />
      </ScrollView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: '#fff', elevation: Platform.OS === 'android' ? 3 : 0 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 10 },
  profileCard: { borderRadius: 12, marginBottom: 16, paddingVertical: 20, alignItems: 'center', backgroundColor: '#fff' },
  profileContent: { alignItems: 'center' },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 3, borderColor: '#f0f0f0' },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#222' },
  role: { fontSize: 14, color: '#666' },
  sectionCard: { borderRadius: 12, marginBottom: 16, backgroundColor: '#fff', overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f9f9f9' },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  sectionContent: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6 },
  icon: { marginTop: 2, marginRight: 10, width: 20, textAlign: 'center' },
  textWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  label: { width: 110, fontWeight: '800', fontSize: 16, color: '#333' },
  colon: { marginRight: 4, fontSize: 14, fontWeight: '800', color: '#333' },
  value: { flexShrink: 1, fontSize: 16, color: '#555', fontWeight: '600' },
  editIcon: {
    marginLeft: 10,
  },
  editInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
