// import React, {useState, useEffect, useCallback} from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   RefreshControl,
//   Alert,
//   TouchableOpacity,
// } from 'react-native';
// import {Appbar, Card, FAB, ActivityIndicator} from 'react-native-paper';
// import {useNavigation} from '@react-navigation/native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import RNFS from 'react-native-fs';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useAuth} from '../contexts/AuthContext';
// import ProfileSection from '../component/ProfileSection';
// import ChangePasswordModal from '../component/ChangePasswordModal';
// import styles from '../component/profilecss';

// // API endpoint
// const BASE_URL = 'http://192.168.29.2:91/api';
// const axiosInstance = axios.create({
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// /**
//  * ProfileScreen - User profile management screen
//  * Displays user information in collapsible sections with editing capabilities
//  */
// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const {user} = useAuth();
  
//   // State variables
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedFields, setEditedFields] = useState({});
//   const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
//   const [uploadedPhoto, setUploadedPhoto] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [passwordLoading, setPasswordLoading] = useState(false);
//   const [isPickingPhoto, setIsPickingPhoto] = useState(false);
//   const [uploadedPhotoFileName, setUploadedPhotoFileName] = useState(null);
//   const [visible, setVisible] = useState(false);
//   const [imageUrl, setImageUrl] = useState(null);
//   const [employeeData, setEmployeeData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch employee data
//   useEffect(() => {
//     fetchEmployeeData();
//   }, [user]);

//   // Set profile image
//   useEffect(() => {
//     if (user?.empImage) {
//       const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${user.empImage}`;
//       setImageUrl(staticImageUrl);
//     } else {
//       setImageUrl(null);
//     }
//   }, [user?.empImage]);

//   // Fetch employee data function
//   const fetchEmployeeData = async () => {
//     try {
//       setLoading(true);
//       if (user?.id) {
//         const response = await axiosInstance.get(
//           `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${user.id}`,
//         );
//         setEmployeeData(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching employee data:', error);
//       Alert.alert('Error', 'Failed to load profile data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh functionality
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await fetchEmployeeData();
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, []);

//   // Auto-refresh after successful operations
//   const refreshAfterSuccess = useCallback(() => {
//     setTimeout(() => {
//       onRefresh();
//     }, 1000);
//   }, [onRefresh]);

//   // Format date for backend
//   const formatDateForBackend = date => {
//     if (!date || isNaN(new Date(date).getTime())) return null;
//     const d = new Date(date);
//     const pad = n => String(n).padStart(2, '0');
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
//       d.getDate(),
//     )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
//   };

//   // Handle password change
//   const handlePasswordChange = async passwords => {
//     setPasswordLoading(true);
//     try {
//       const payload = {
//         Id: employeeData.id,
//         EmployeeId: employeeData.employeeId ?? '',
//         EmployeeName: employeeData.employeeName ?? '',
//         // Include all other fields from employeeData
//         // ...
//         Password: passwords.new,
//         ModifiedBy: employeeData.id ?? 0,
//         ModifiedDate: formatDateForBackend(new Date()),
//       };

//       const response = await axiosInstance.post(
//         `${BASE_URL}/EmpRegistration/SaveEmpRegistration`, 
//         payload
//       );

//       if (response && response.status >= 200 && response.status < 300) {
//         Alert.alert('Success', 'Password updated successfully!');
//         setIsPasswordModalVisible(false);
//       } else {
//         throw new Error('Failed to update password - Invalid response');
//       }
//     } catch (error) {
//       console.error('Password update error:', error);
//       let errorMessage = 'Failed to update password';

//       if (error.response) {
//         errorMessage =
//           error.response.data?.message ||
//           (typeof error.response.data === 'string'
//             ? error.response.data
//             : errorMessage);
//       }

//       Alert.alert('Error', errorMessage);
//     } finally {
//       setPasswordLoading(false);
//     }
//   };

//   // Upload profile photo as base64
//   const uploadDocumentBase64 = async photo => {
//     try {
//       setUploading(true);

//       // Convert local file to base64
//       const base64Data = await RNFS.readFile(photo.uri, 'base64');
//       const fileName = photo.name || photo.fileName || 'photo.jpg';
//       const extension = fileName.split('.').pop() || 'jpg';

//       const payload = {
//         fileName,
//         base64File: base64Data,
//         extension,
//         category: 'img',
//       };

//       const response = await fetch(
//         'http://192.168.29.2:90/api/UploadDocument/UploadDocument',
//         {
//           method: 'POST',
//           headers: {'Content-Type': 'application/json'},
//           body: JSON.stringify(payload),
//         },
//       );

//       const result = await response.json();

//       if (response.ok && result.fileName) {
//         setUploadedPhotoFileName(result.fileName);
//         await saveProfileImage(result.fileName);
//         return result.fileName;
//       } else {
//         throw new Error(result.message || 'Upload failed');
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       Alert.alert(
//         'Upload Failed',
//         error.message || 'Could not upload profile photo',
//       );
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Save profile image in database
//   const saveProfileImage = async fileName => {
//     try {
//       const payload = {
//         ...employeeData,
//         empImage: fileName,
//         ModifiedDate: formatDateForBackend(new Date()),
//       };

//       await axiosInstance.post(
//         `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
//         payload,
//       );

//       Alert.alert('Success', 'Profile photo updated successfully!');
//       refreshAfterSuccess();
//     } catch (error) {
//       console.error('Save profile image error:', error);
//       Alert.alert('Error', 'Failed to update profile photo');
//     }
//   };

//   // Handle profile photo update
//   const handleProfilePhotoUpdate = async () => {
//     if (isPickingPhoto) return;
    
//     setIsPickingPhoto(true);
//     try {
//       // Implement photo picking logic here
//       // Example: use react-native-image-picker or similar library
//     } catch (err) {
//       console.error('Photo selection error:', err);
//       Alert.alert('Error', 'Could not select photo');
//     } finally {
//       setIsPickingPhoto(false);
//     }
//   };

//   // Handle field edit
//   const handleEdit = field => {
//     if (!isEditing) {
//       setIsEditing(true);
//     }
//   };

//   // Handle save profile changes
//   const handleSaveProfile = async () => {
//     try {
//       // Prepare updated data payload
//       const updatedData = {
//         ...employeeData,
//         ...editedFields,
//         ModifiedDate: formatDateForBackend(new Date()),
//       };

//       // Save profile data
//       const response = await axiosInstance.post(
//         `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
//         updatedData
//       );

//       if (response && response.status >= 200 && response.status < 300) {
//         Alert.alert('Success', 'Profile updated successfully!');
//         setEditedFields({});
//         setIsEditing(false);
//         refreshAfterSuccess();
//       } else {
//         throw new Error('Failed to update profile - Invalid response');
//       }
//     } catch (error) {
//       console.error('Profile update error:', error);
//       Alert.alert('Error', 'Failed to update profile');
//     }
//   };

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setEditedFields({});
//     setIsEditing(false);
//   };

//   // Define profile sections with fields
//   const profileSections = [
//     {
//       title: 'Personal Information',
//       icon: 'account-circle',
//       data: [
//         { 
//           icon: 'account', 
//           label: 'Name', 
//           value: employeeData?.employeeName,
//           editable: false 
//         },
//         { 
//           icon: 'cake', 
//           label: 'Date of Birth', 
//           value: employeeData?.dob?.split('T')[0],
//           editable: true 
//         },
//         // Add more personal info fields here
//       ]
//     },
//     {
//       title: 'Contact Information',
//       icon: 'phone',
//       data: [
//         { 
//           icon: 'cellphone', 
//           label: 'Phone Number', 
//           value: employeeData?.pcontactNo, 
//           editable: true,
//           keyboardType: 'phone-pad',
//           required: true
//         },
//         { 
//           icon: 'email', 
//           label: 'Email', 
//           value: employeeData?.emailAddress, 
//           editable: true,
//           keyboardType: 'email-address',
//           required: true
//         },
//         // Add more contact fields here
//       ]
//     },
//     // Add more sections as needed
//   ];

//   // Show loading indicator while fetching data
//   if (loading && !employeeData) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Appbar.Header style={styles.header}>
//           <Appbar.BackAction onPress={() => navigation.goBack()} />
//           <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
//         </Appbar.Header>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#3B82F6" />
//           <Text style={styles.loadingText}>Loading profile...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <Appbar.Header style={styles.header}>
//         <Appbar.BackAction onPress={() => navigation.goBack()} />
//         <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
//         <Appbar.Action icon="key" onPress={() => setIsPasswordModalVisible(true)} />
//       </Appbar.Header>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }>
//         {/* Profile Card */}
//         <Card style={styles.profileCard} elevation={3}>
//           <View style={styles.profileContent}>
//             {/* Profile Photo */}
//             <View style={styles.profilePhotoContainer}>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 onPress={handleProfilePhotoUpdate}
//                 disabled={uploading}>
//                 <View style={styles.profileImageContainer}>
//                   {/* Profile image logic here */}
//                   {uploading ? (
//                     <ActivityIndicator size="large" color="#3B82F6" />
//                   ) : (
//                     <>
//                       {/* Profile image component goes here */}
//                       {/* User photo with edit overlay */}
//                     </>
//                   )}
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.profileName}>{employeeData?.employeeName}</Text>
//             <Text style={styles.profileRole}>{employeeData?.designationName}</Text>
//             <Text style={styles.profileDepartment}>{employeeData?.departmentName}</Text>
//           </View>
//         </Card>

//         {/* Profile Sections */}
//         {profileSections.map((section, index) => (
//           <ProfileSection
//             key={`section-${index}`}
//             title={section.title}
//             icon={section.icon}
//             data={section.data}
//             isEditing={isEditing}
//             editedFields={editedFields}
//             setEditedFields={setEditedFields}
//             onEdit={handleEdit}
//           />
//         ))}
//       </ScrollView>

//       {/* Change Password Modal */}
//       <ChangePasswordModal
//         visible={isPasswordModalVisible}
//         onDismiss={() => setIsPasswordModalVisible(false)}
//         onSubmit={handlePasswordChange}
//         loading={passwordLoading}
//       />

//       {/* Edit/Save FAB */}
//       <FAB
//         style={styles.fab}
//         icon={isEditing ? 'content-save' : 'pencil'}
//         onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
//       />

//       {/* Cancel Edit FAB - only shown when editing */}
//       {isEditing && (
//         <FAB
//           style={[styles.fab, {bottom: 80, backgroundColor: '#f44336'}]}
//           icon="close"
//           onPress={handleCancelEdit}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default ProfileScreen;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ProfileScreen = () => {
  return (
    <View>
      <Text>ProfileScreen</Text>
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})