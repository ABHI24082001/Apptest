import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Appbar,
  Divider,
  ActivityIndicator,
  FAB,
  Button,
  Modal,
  Portal,
  Surface,
  Provider as PaperProvider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  withSpring,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import AppSafeArea from '../component/AppSafeArea';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import {pick} from '@react-native-documents/picker';

const {width: screenWidth} = Dimensions.get('window');

// Enhanced EditableField Component
const EditableField = ({
  icon,
  label,
  value,
  editable = false,
  isEditing,
  editedFields,
  setEditedFields,
  onEdit,
  keyboardType = 'default',
  multiline = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const currentValue = editedFields[label] !== undefined ? editedFields[label] : value;

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconContainer}>
          <Icon name={icon} size={20} color="#666" />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {isEditing && editable ? (
            <TextInput
              style={[
                styles.fieldInput,
                isFocused && styles.fieldInputFocused,
                multiline && styles.fieldInputMultiline,
              ]}
              value={currentValue?.toString() || ''}
              onChangeText={(text) => 
                setEditedFields(prev => ({...prev, [label]: text}))
              }
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType={keyboardType}
              multiline={multiline}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <Text style={styles.fieldValue}>{currentValue || 'Not specified'}</Text>
          )}
        </View>
        {editable && !isEditing && (
          <TouchableOpacity
            onPress={() => onEdit(label)}
            style={styles.fieldEditButton}
            activeOpacity={0.7}
          >
            <Icon name="pencil" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
      <Divider style={styles.fieldDivider} />
    </View>
  );
};

// Enhanced ProfileSection Component
const ProfileSection = ({
  title,
  icon,
  data,
  isEditing,
  editedFields,
  setEditedFields,
  onEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animatedHeight = useSharedValue(0);
  const animatedRotation = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withSpring(isOpen ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
    animatedRotation.value = withTiming(isOpen ? 180 : 0, {
      duration: 300,
    });
  }, [isOpen]);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      animatedHeight.value,
      [0, 1],
      [0, data.length * 80 + 20],
      Extrapolate.CLAMP,
    ),
    opacity: animatedHeight.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${animatedRotation.value}deg`},
    ],
  }));

  return (
    <Card style={styles.sectionCard} elevation={2}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleSection}
        style={styles.sectionHeader}
      >
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <Icon name={icon} size={22} color="#3B82F6" />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Animated.View style={iconAnimatedStyle}>
          <Icon name="chevron-down" size={24} color="#666" />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.sectionContent, animatedStyle]}>
        <View style={styles.sectionInnerContent}>
          {data.map((item, index) => (
            <EditableField
              key={`${item.label}-${index}`}
              {...item}
              isEditing={isEditing}
              editedFields={editedFields}
              setEditedFields={setEditedFields}
              onEdit={onEdit}
            />
          ))}
        </View>
      </Animated.View>
    </Card>
  );
};

// Enhanced ChangePasswordModal Component
const ChangePasswordModal = ({
  visible,
  onDismiss,
  onSubmit,
  loading = false,
}) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!passwords.current) {
      newErrors.current = 'Current password is required';
    }
    
    if (!passwords.new) {
      newErrors.new = 'New password is required';
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters';
    }
    
    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your password';
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validatePasswords()) {
      onSubmit(passwords);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetForm = () => {
    setPasswords({current: '', new: '', confirm: ''});
    setErrors({});
    setShowPasswords({current: false, new: false, confirm: false});
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            {['current', 'new', 'confirm'].map((field) => (
              <View key={field} style={styles.passwordFieldContainer}>
                <Text style={styles.passwordLabel}>
                  {field === 'current' ? 'Current Password' : 
                   field === 'new' ? 'New Password' : 'Confirm Password'}
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      errors[field] && styles.passwordInputError,
                    ]}
                    secureTextEntry={!showPasswords[field]}
                    value={passwords[field]}
                    onChangeText={(text) => 
                      setPasswords(prev => ({...prev, [field]: text}))
                    }
                    placeholder={`Enter ${field} password`}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility(field)}
                    style={styles.passwordToggle}
                  >
                    <Icon
                      name={showPasswords[field] ? 'eye' : 'eye-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors[field] && (
                  <Text style={styles.passwordError}>{errors[field]}</Text>
                )}
              </View>
            ))}
          </View>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.modalButton}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.modalButton, styles.modalSubmitButton]}
              loading={loading}
              disabled={loading}
            >
              Update Password
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

// Main ProfileScreen Component
const ProfileScreen = () => {
  const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof employeeDetails.refreshData === 'function') {
        await employeeDetails.refreshData();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [employeeDetails]);

  // Auto-refresh after successful operations
  const refreshAfterSuccess = useCallback(() => {
    setTimeout(() => {
      onRefresh();
    }, 1000);
  }, [onRefresh]);

  // Format date for backend
  const formatDateForBackend = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Handle password change
  const handlePasswordChange = async (passwords) => {
    setPasswordLoading(true);
    try {
      const payload = {
        Id: employeeDetails.id,
        EmployeeId: employeeDetails.employeeId,
        Password: passwords.new,
        EmployeeName: employeeDetails.employeeName,
        Username: employeeDetails.username,
        Gender: employeeDetails.gender,
        City: employeeDetails.city,
        PcontactNo: employeeDetails.pcontactNo,
        EmailAddress: employeeDetails.emailAddress,
        MaritalStatus: employeeDetails.maritalStatus,
        EmpFather: employeeDetails.empFather,
        EmpMother: employeeDetails.empMother,
        PermaAddress: employeeDetails.permaAddress,
        PresentAddress: employeeDetails.presentAddress,
        EmergencyContactNo: employeeDetails.emergencyContactNo,
        ModifiedBy: employeeDetails.id,
        ModifiedDate: formatDateForBackend(new Date()),
      };

      console.log('Sending password update to:', `${BASE_URL}/EmpRegistration/SaveEmpRegistration`);
      
      const response = await axios.post(
        `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
        payload,
      ).catch(error => {
        console.error('API Error Details:', error.response ? error.response.data : error.message);
        throw error;
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Password updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setIsPasswordModalVisible(false);
              refreshAfterSuccess();
            },
          },
        ]);
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      (typeof error.response.data === 'string' ? error.response.data : errorMessage);
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle profile photo update
//   const handleProfilePhotoUpdate = async () => {
//   try {
//     const result = await pick({
//       type: ['image/*'],
//       allowMultiSelection: false,
//     });

//     if (!result || !result[0]) return;

//     setUploading(true);
//     const photo = result[0];

//     // Convert the image to Base64
//     const base64Image = await new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
//       reader.onerror = (error) => reject(error);
//       reader.readAsDataURL(photo);
//     });

//     const payload = {
//       EmployeeId: employeeDetails.id,
//       ImageBase64: base64Image, // Send Base64 string
//       FileName: photo.name || 'profile.jpg',
//     };

//     console.log('Uploading photo to:', `${BASE_URL}/EmpRegistration/SaveEmpRegistration`);

//     const response = await axios.post(
//       `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
//       payload,
//       {
//         headers: { 'Content-Type': 'application/json' },
//       },
//     );

//     if (response.status === 200) {
//       Alert.alert('Success', 'Profile photo updated successfully!', [
//         {
//           text: 'OK',
//           onPress: () => refreshAfterSuccess(),
//         },
//       ]);
//     } else {
//       throw new Error('Failed to update profile photo');
//     }
//   } catch (error) {
//     console.error('Profile photo update error:', error);
//     Alert.alert('Error', error.response?.data?.message || 'Failed to update profile photo');
//   } finally {
//     setUploading(false);
//   }
// };
const handleProfilePhotoUpdate = async () => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.didCancel || !result.assets || !result.assets[0]) {
      console.log('Image selection canceled');
      return;
    }

    const photo = result.assets[0];
    const base64Image = photo.base64; // Use Base64 directly if available

    const payload = {
      EmployeeId: employeeDetails.id,
      ImageBase64: base64Image,
      FileName: photo.fileName || 'profile.jpg',
    };

    console.log('Uploading photo to:', `${BASE_URL}/EmpRegistration/SaveEmpRegistration`);

    const response = await axios.post(
      `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (response.status === 200) {
      Alert.alert('Success', 'Profile photo updated successfully!', [
        {
          text: 'OK',
          onPress: () => refreshAfterSuccess(),
        },
      ]);
    } else {
      throw new Error('Failed to update profile photo');
    }
  } catch (error) {
    console.error('Profile photo update error:', error);
    Alert.alert('Error', error.response?.data?.message || 'Failed to update profile photo');
  }
};
  // Handle field edit
  const handleEdit = (field) => {
    setIsEditing(true);
    setEditedFields(prev => ({
      ...prev,
      [field]: employeeDetails[field] || '',
    }));
  };

  // Handle save profile with improved error handling
  const handleSave = async () => {
    try {
      // Map UI labels to backend property names for edited fields
      const fieldMap = {
        'Blood Group': 'BloodGroup',
        'Marital Status': 'MaritalStatus',
        'Bank Name': 'ExistingBank',
        'AC Number': 'BankAcNo',
        'IFSC Code': 'BankIfsc',
        Email: 'EmailAddress',
        'Primary No': 'PcontactNo',
        'Emergency No': 'EmergencyContactNo',
        password: 'Password',
        // Add more mappings as needed
      };

      const payload = {
        Id: employeeDetails.id,
        EmployeeId: editedFields.EmployeeId ?? employeeDetails.employeeId ?? '',
        EmployeeName:
          editedFields.EmployeeName ?? employeeDetails.employeeName ?? '',
        Dob:
          editedFields.Dob !== undefined
            ? formatDateForBackend(editedFields.Dob)
            : formatDateForBackend(employeeDetails.dob),
        BloodGroup: editedFields.BloodGroup,
        Gender: editedFields.Gender ?? employeeDetails.gender ?? '',
        MaritalStatus:
          editedFields.MaritalStatus ?? employeeDetails.maritalStatus ?? '',
        Religion: editedFields.Religion ?? employeeDetails.religion ?? '',
        PcontactNo: editedFields.PcontactNo ?? employeeDetails.pcontactNo ?? '',
        EmergencyContactNo:
          editedFields.EmergencyContactNo ??
          employeeDetails.emergencyContactNo ??
          '',
        EmailAddress:
          editedFields.EmailAddress ?? employeeDetails.emailAddress ?? '',
        EmpImage: editedFields.EmpImage ?? employeeDetails.empImage ?? '',
        EmpFather: editedFields.EmpFather ?? employeeDetails.empFather ?? '',
        EmpMother: editedFields.EmpMother ?? employeeDetails.empMother ?? '',
        PoliceStation:
          editedFields.PoliceStation ?? employeeDetails.policeStation ?? '',
        ZipCode: editedFields.ZipCode ?? employeeDetails.zipCode ?? '',
        CountryId: editedFields.CountryId ?? employeeDetails.countryId ?? 0,
        StateId: editedFields.StateId ?? employeeDetails.stateId ?? 0,
        City: editedFields.City ?? employeeDetails.city ?? '',
        EmployeeType:
          editedFields.EmployeeType ?? employeeDetails.employeeType ?? 0,
        ProvisionEndDt:
          editedFields.ProvisionEndDt ?? employeeDetails.provisionEndDt ?? null,
        PresentAddress:
          editedFields.PresentAddress ?? employeeDetails.presentAddress ?? '',
        PermaAddress:
          editedFields.PermaAddress ?? employeeDetails.permaAddress ?? '',
        DateofJoin:
          editedFields.DateofJoin !== undefined
            ? formatDateForBackend(editedFields.DateofJoin)
            : formatDateForBackend(employeeDetails.dateofJoin),
        ChildCompanyId:
          editedFields.ChildCompanyId ?? employeeDetails.childCompanyId ?? null,
        BranchId: editedFields.BranchId ?? employeeDetails.branchId ?? null,
        DepartmentId:
          editedFields.DepartmentId ?? employeeDetails.departmentId ?? 0,
        CompanyVerticalId:
          editedFields.CompanyVerticalId ??
          employeeDetails.companyVerticalId ??
          null,
        DesigntionId:
          editedFields.DesigntionId ?? employeeDetails.designtionId ?? 0,
        ReportingEmpId:
          editedFields.ReportingEmpId ?? employeeDetails.reportingEmpId ?? null,
        ExistingBank:
          editedFields.ExistingBank ?? employeeDetails.existingBank ?? '',
        BankAcNo: editedFields.BankAcNo ?? employeeDetails.bankAcNo ?? '',
        BankIfsc: editedFields.BankIfsc ?? employeeDetails.bankIfsc ?? '',
        UploadResume:
          editedFields.UploadResume ?? employeeDetails.uploadResume ?? '',
        HighDegree: editedFields.HighDegree ?? employeeDetails.highDegree ?? '',
        YearPassing:
          editedFields.YearPassing ?? employeeDetails.yearPassing ?? '',
        Percentage:
          editedFields.Percentage ?? employeeDetails.percentage ?? null,
        University: editedFields.University ?? employeeDetails.university ?? '',
        OtherQualification:
          editedFields.OtherQualification ??
          employeeDetails.otherQualification ??
          '',
        Uanno: editedFields.Uanno ?? employeeDetails.uanno ?? '',
        Esino: editedFields.Esino ?? employeeDetails.esino ?? '',
        PanNo: editedFields.PanNo ?? employeeDetails.panNo ?? '',
        AadhaarNo: editedFields.AadhaarNo ?? employeeDetails.aadhaarNo ?? '',
        Category: editedFields.Category ?? employeeDetails.category ?? '',
        UploadPan: editedFields.UploadPan ?? employeeDetails.uploadPan ?? '',
        UploadAadhaar:
          editedFields.UploadAadhaar ?? employeeDetails.uploadAadhaar ?? '',
        UploadSignature:
          editedFields.UploadSignature ?? employeeDetails.uploadSignature ?? '',
        Username: editedFields.Username ?? employeeDetails.username ?? '',
        // Password: editedFields.Password ?? employeeDetails.password ?? '',
        // Instead, always map from editedFields if present, or fallback to employeeDetails
        Password:
          editedFields.Password !== undefined
            ? editedFields.Password
            : editedFields.password !== undefined
            ? editedFields.password
            : employeeDetails.password ?? '',
        IsDelete: editedFields.IsDelete ?? employeeDetails.isDelete ?? 0,
        Flag: editedFields.Flag ?? employeeDetails.flag ?? 1,
        CreatedBy:
          editedFields.CreatedBy ??
          employeeDetails.createdBy ??
          employeeDetails.id ??
          0,
        CreatedDate: formatDateForBackend(
          editedFields.CreatedDate ?? employeeDetails.createdDate,
        ),
        ModifiedBy:
          editedFields.ModifiedBy ??
          employeeDetails.modifiedBy ??
          employeeDetails.id ??
          0,
        ModifiedDate: formatDateForBackend(new Date()),
      };

      // Map UI label fields (like "Blood Group") to backend keys (like "BloodGroup")
      Object.keys(editedFields).forEach(label => {
        const backendKey = fieldMap[label];
        if (backendKey) {
          payload[backendKey] = editedFields[label];
        }
      });

      // Remove undefined fields
      Object.keys(payload).forEach(
        key => payload[key] === undefined && delete payload[key],
      );

      console.log('Sending profile update to:', `${BASE_URL}/EmpRegistration/SaveEmpRegistration`);
      
      const response = await axios.post(
        `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
        payload,
      ).catch(error => {
        console.error('API Error Details:', error.response ? error.response.data : error.message);
        throw error;
      });

      // Log backend response for debugging (show as alert for visibility)
      console.log('Backend==================== response:', response.data);
      Alert.alert('Backend Response', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditedFields({});
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile.';
      
      if (error.response) {
        console.log('Error Status:', error.response.status);
        console.log('Error Headers:', error.response.headers);
        console.log('Error Data:', error.response.data);
        
        errorMessage = error.response.data?.message || 
                      (typeof error.response.data === 'string' ? error.response.data : errorMessage);
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFields({});
  };

  if (!employeeDetails) {
    return (
      <AppSafeArea>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </AppSafeArea>
    );
  }

  // Remove this duplicate BASE_URL declaration
  // const BASE_URL = 'https://hcmv2.anantatek.com/assets/UploadImg/';
  
  // Use the imported BASE_URL with the correct path for images
  const imageBaseUrl = `${BASE_URL}/assets/UploadImg/`;
  const imageUrl = employeeDetails?.empImage
    ? `${imageBaseUrl}${employeeDetails.empImage}`
    : null;

  // Data configurations
  const generalInfoData = [
    {
      icon: 'badge-account',
      label: 'Employee ID',
      value: employeeDetails.employeeId,
    },
    {
      icon: 'map-marker',
      label: 'Branch',
      value: employeeDetails.branchName,
    },
    {
      icon: 'water',
      label: 'Blood Group',
      value: employeeDetails.bloodGroup,
      editable: true,
    },
    {
      icon: 'account-heart',
      label: 'Marital Status',
      value: employeeDetails.maritalStatus,
      editable: true,
    },
    {
      icon: 'bank',
      label: 'Bank Name',
      value: employeeDetails.existingBank,
      editable: true,
    },
    {
      icon: 'credit-card',
      label: 'AC Number',
      value: employeeDetails.bankAcNo,
      editable: true,
    },
    {
      icon: 'barcode',
      label: 'IFSC Code',
      value: employeeDetails.bankIfsc,
      editable: true,
    },
  ];

  const contactData = [
    {
      icon: 'email',
      label: 'Email',
      value: employeeDetails.emailAddress,
      editable: true,
      keyboardType: 'email-address',
    },
    {
      icon: 'phone',
      label: 'Primary No',
      value: employeeDetails.pcontactNo,
      editable: true,
      keyboardType: 'phone-pad',
    },
    {
      icon: 'cellphone',
      label: 'Emergency No',
      value: employeeDetails.emergencyContactNo,
      editable: true,
      keyboardType: 'phone-pad',
    },
  ];

  const credentialsData = [
    {
      icon: 'email',
      label: 'Email',
      value: employeeDetails.emailAddress,
    },
    {
      icon: 'account',
      label: 'Username',
      value: employeeDetails.username,
    },
    {
      icon: 'id-card',
      label: 'User ID',
      value: employeeDetails.employeeId,
    },
  ];

  const professionalData = [
    {
      icon: 'domain',
      label: 'Company',
      value: employeeDetails.companyName || 'N/A',
    },
    {
      icon: 'briefcase',
      label: 'Branch',
      value: employeeDetails.branchName,
    },
    {
      icon: 'account-group',
      label: 'Employee Type',
      value: employeeDetails.employeeTypeName,
    },
    {
      icon: 'account-supervisor',
      label: 'Designation',
      value: employeeDetails.designationName,
    },
    {
      icon: 'office-building',
      label: 'Department',
      value: employeeDetails.departmentName,
    },
  ];

  return (
    <PaperProvider>
      <AppSafeArea>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
          {isEditing ? (
            <>
              <Appbar.Action
                icon="check"
                iconColor="#4CAF50"
                onPress={handleSave}
              />
              <Appbar.Action
                icon="close"
                iconColor="#F44336"
                onPress={handleCancelEdit}
              />
            </>
          ) : (
            <>
              <Appbar.Action
                icon="lock-reset"
                onPress={() => setIsPasswordModalVisible(true)}
              />
              <Appbar.Action icon="pencil" onPress={() => setIsEditing(true)} />
            </>
          )}
        </Appbar.Header>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Profile Header Card */}
          <Card style={styles.profileCard}>
            <View style={styles.profileContent}>
              <TouchableOpacity
                onPress={handleProfilePhotoUpdate}
                style={styles.profilePhotoContainer}
                activeOpacity={0.8}
              >
                <View style={styles.profileImageContainer}>
                  <Image
                    source={
                      imageUrl
                        ? {uri: imageUrl}
                        : require('../assets/image/boy.png')
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.profilePhotoOverlay}>
                    {uploading ? (
                      <ActivityIndicator size={20} color="#fff" />
                    ) : (
                      <Icon name="camera" size={20} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.profileName}>
                {employeeDetails.employeeName}
              </Text>
              <Text style={styles.profileRole}>
                {employeeDetails.designationName}
              </Text>
              <Text style={styles.profileDepartment}>
                {employeeDetails.departmentName}
              </Text>
            </View>
          </Card>

          {/* Profile Sections */}
          <ProfileSection
            title="General Information"
            icon="information-outline"
            data={generalInfoData}
            isEditing={isEditing}
            editedFields={editedFields}
            setEditedFields={setEditedFields}
            onEdit={handleEdit}
          />

          <ProfileSection
            title="Contact Information"
            icon="phone-outline"
            data={contactData}
            isEditing={isEditing}
            editedFields={editedFields}
            setEditedFields={setEditedFields}
            onEdit={handleEdit}
          />

          <ProfileSection
            title="Account Credentials"
            icon="shield-account-outline"
            data={credentialsData}
            isEditing={false}
            editedFields={editedFields}
            setEditedFields={setEditedFields}
            onEdit={handleEdit}
          />

          <ProfileSection
            title="Professional Details"
            icon="briefcase-outline"
            data={professionalData}
            isEditing={false}
            editedFields={editedFields}
            setEditedFields={setEditedFields}
            onEdit={handleEdit}
          />
        </ScrollView>

        {/* Change Password Modal */}
        <ChangePasswordModal
          visible={isPasswordModalVisible}
          onDismiss={() => setIsPasswordModalVisible(false)}
          onSubmit={handlePasswordChange}
          loading={passwordLoading}
        />

        {/* Floating Action Button */}
        {!isEditing && (
          <FAB
            style={styles.fab}
            icon="pencil"
            onPress={() => setIsEditing(true)}
          />
        )}
      </AppSafeArea>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  headerTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333'
  },
  
  // Container styles
  container: {
    flex: 1, 
    backgroundColor: '#f4f6f8'
  },
  scrollContent: {
    paddingHorizontal: 16, 
    paddingBottom: 50, 
    paddingTop: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  
  // Profile card styles
  profileCard: {
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContent: {
    alignItems: 'center'
  },
  profileName: {
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    color: '#222'
  },
  profileRole: {
    fontSize: 14, 
    color: '#666'
  },
  profileDepartment: {
    fontSize: 14, 
    color: '#666'
  },
  
  // Profile photo styles
  profilePhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#f0f0f0',
  },
  profilePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Section styles
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
    alignItems: 'center'
  },
  sectionIconContainer: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16, 
    fontWeight: '800', 
    color: '#333'
  },
  sectionContent: {
    padding: 12
  },
  sectionInnerContent: {
    paddingVertical: 8,
  },
  
  // Field styles
  fieldContainer: {
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldIconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  fieldEditButton: {
    padding: 8,
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  fieldInputFocused: {
    borderBottomColor: '#3B82F6',
  },
  fieldInputMultiline: {
    minHeight: 60,
  },
  fieldDivider: {
    marginTop: 8,
  },
  
  // Password modal styles
  modalContainer: {
    marginHorizontal: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalBody: {
    marginBottom: 20,
  },
  passwordFieldContainer: {
    marginBottom: 16,
  },
  passwordLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordInputError: {
    borderColor: '#F44336',
  },
  passwordToggle: {
    padding: 8,
  },
  passwordError: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 10,
  },
  modalSubmitButton: {
    backgroundColor: '#3B82F6',
  },
  
  // FAB styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});


export default ProfileScreen;