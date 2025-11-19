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
  BackHandler,
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppSafeArea from '../component/AppSafeArea';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import axiosInstance from '../utils/axiosInstance';
import {pick} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import axios from 'axios';
import {useAuth} from '../constants/AuthContext';
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
  isDropdown = false,
  options = [],
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState(null);
  // Close dropdown when tapping outside
  useEffect(() => {
    if (showDropdown) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          setShowDropdown(false);
          return true;
        },
      );
      return () => backHandler.remove();
    }
  }, [showDropdown]);

  const currentValue =
    editedFields[label] !== undefined ? editedFields[label] : value;

  const validateField = val => {
    if (required && (!val || val.trim() === '')) {
      return `${label} is required`;
    }

    if (val && val.trim() !== '') {
      // Field-specific validations
      switch (label) {
        case 'Bank Name':
          const bankNameRegex = /^[A-Za-z ]{3,50}$/;
          if (!bankNameRegex.test(val)) {
            return 'Bank name should contain only letters and be 3-50 characters long';
          }
          break;

        case 'AC Number':
          const acNumberRegex = /^[0-9]{9,18}$/;
          if (!acNumberRegex.test(val)) {
            return 'Account number should contain 9-18 digits only';
          }
          break;

        case 'IFSC Code':
          const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
          if (!ifscRegex.test(val)) {
            return 'Please enter a valid IFSC code (format: ABCD0123456)';
          }
          break;

        case 'Email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(val)) {
            return 'Please enter a valid email address';
          }
          break;

        case 'Primary No':
        case 'Emergency No':
          const phoneRegex = /^[6-9][0-9]{9}$/;
          if (!phoneRegex.test(val)) {
            return 'Phone number should be 10 digits and start with 6-9';
          }
          break;
      }
    }

    return null;
  };

  const handleValueChange = text => {
    const error = validateField(text);
    setValidationError(error);
    setEditedFields(prev => ({...prev, [label]: text}));
  };

  const selectOption = option => {
    handleValueChange(option);
    setShowDropdown(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconContainer}>
          <Icon name={icon} size={20} color="#666" />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>
            {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
          {isEditing && editable ? (
            isDropdown ? (
              <View>
                <TouchableOpacity
                  style={[
                    styles.dropdownField,
                    isFocused && styles.fieldInputFocused,
                    validationError && styles.fieldInputError,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setShowDropdown(!showDropdown)}>
                  <Text
                    style={[
                      currentValue
                        ? styles.dropdownSelectedValue
                        : styles.dropdownPlaceholder,
                      validationError && styles.dropdownErrorText,
                    ]}>
                    {currentValue || `Select ${label.toLowerCase()}`}
                  </Text>
                  <Animated.View
                    style={{
                      transform: [{rotate: showDropdown ? '180deg' : '0deg'}],
                    }}>
                    <Icon
                      name="chevron-down"
                      size={18}
                      color={validationError ? '#F44336' : '#666'}
                    />
                  </Animated.View>
                </TouchableOpacity>

                {showDropdown && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    style={styles.dropdownList}>
                    <ScrollView
                      style={{maxHeight: 180}}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      bounces={false}>
                      {options.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dropdownItem,
                            currentValue === option &&
                              styles.dropdownItemSelected,
                            index === options.length - 1 &&
                              styles.dropdownItemLast,
                          ]}
                          activeOpacity={0.6}
                          onPress={() => selectOption(option)}>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              currentValue === option &&
                                styles.dropdownSelectedText,
                            ]}>
                            {option}
                          </Text>
                          {currentValue === option && (
                            <Icon
                              name="check"
                              size={18}
                              color="#3B82F6"
                              style={{marginLeft: 'auto'}}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Animated.View>
                )}
                {validationError && (
                  <Text style={styles.errorText}>{validationError}</Text>
                )}
              </View>
            ) : (
              <>
                <TextInput
                  style={[
                    styles.fieldInput,
                    isFocused && styles.fieldInputFocused,
                    multiline && styles.fieldInputMultiline,
                    validationError && styles.fieldInputError,
                  ]}
                  value={currentValue?.toString() || ''}
                  onChangeText={handleValueChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    // Always validate on blur for better UX
                    setValidationError(validateField(currentValue));
                  }}
                  keyboardType={keyboardType}
                  multiline={multiline}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  autoCapitalize={label === 'IFSC Code' ? 'characters' : 'none'}
                />
                {validationError && (
                  <Text style={styles.errorText}>{validationError}</Text>
                )}
              </>
            )
          ) : (
            <Text style={styles.fieldValue}>
              {currentValue || 'Not specified'}
            </Text>
          )}
        </View>
        {editable && !isEditing && (
          <TouchableOpacity
            onPress={() => onEdit(label)}
            style={styles.fieldEditButton}
            activeOpacity={0.7}>
            <Text style={styles.fieldEditText}>Edit</Text>
            {/* <Icon name="pencil" size={16} color="#a73109ff" /> */}
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
  // debugger;
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${animatedRotation.value}deg`}],
  }));

  return (
    <Card style={styles.sectionCard} elevation={2}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleSection}
        style={styles.sectionHeader}>
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

  const togglePasswordVisibility = field => {
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
        contentContainerStyle={styles.modalContainer}>
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.modalCloseButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {['current', 'new', 'confirm'].map(field => (
              <View key={field} style={styles.passwordFieldContainer}>
                <Text style={styles.passwordLabel}>
                  {field === 'current'
                    ? 'Current Password'
                    : field === 'new'
                    ? 'New Password'
                    : 'Confirm Password'}
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      errors[field] && styles.passwordInputError,
                    ]}
                    secureTextEntry={!showPasswords[field]}
                    value={passwords[field]}
                    onChangeText={text =>
                      setPasswords(prev => ({...prev, [field]: text}))
                    }
                    placeholder={`Enter ${field} password`}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility(field)}
                    style={styles.passwordToggle}>
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
              disabled={loading}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.modalButton, styles.modalSubmitButton]}
              loading={loading}
              disabled={loading}>
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
  console.log(employeeDetails , 'dkfjnjdinodoidf')
  const insets = useSafeAreaInsets(); // Get safe area insets
  // debugger;
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false); // Prevent multiple pick calls
  const [uploadedPhotoFileName, setUploadedPhotoFileName] = useState(null); // Store uploaded filename

  const [visible, setVisible] = useState(false);
  const [imageUrll, setImageUrl] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const {user} = useAuth();

  console.log(user , 'kjdsvhiouerwhioefhioerwhiegrporeop')

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (user?.id) {
          const response = await axiosInstance.get(
            `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${user.id}`,
          );
          setEmployeeData(response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [user]);

  useEffect(() => {
    // Use employeeDetails.empImage instead of user.empImage
    console.log('Employee Details empImage:', employeeDetails?.empImage);

    if (employeeDetails?.empImage) {
      // First try to fetch the image as base64 from the API
      fetchImageAsBase64(employeeDetails.empImage);
    } else {
      setImageUrl(null);
    }
  }, [employeeDetails?.empImage]); // Changed dependency from user?.empImage to employeeDetails?.empImage

  // Add new function to fetch image as base64
  const fetchImageAsBase64 = async (fileName) => {
    try {
      const fetchUrl = `https://hcmv2.anantatek.com/api/UploadDocument/FetchFile?fileNameWithExtension=${fileName}`;
      console.log('📡 Fetching profile image from:', fetchUrl);

      const response = await fetch(fetchUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          
          if (result.base64File) {
            // Determine the file extension
            const extension = fileName.split('.').pop() || 'jpg';
            const imageUri = `data:image/${extension};base64,${result.base64File}`;
            setImageUrl(imageUri);
            console.log('✅ Profile image loaded successfully');
            return;
          }
        }
      }
      
      // Fallback to static URL if API fetch fails
      console.log('⚠️ API fetch failed, using static URL');
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${fileName}`;
      setImageUrl(staticImageUrl);
      
    } catch (error) {
      console.error('❌ Error fetching profile image:', error);
      // Fallback to static URL
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${fileName}`;
      setImageUrl(staticImageUrl);
    }
  };

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
  const formatDateForBackend = date => {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  // debugger
  // Handle password change
  const handlePasswordChange = async passwords => {
    setPasswordLoading(true);
    try {
      const payload = {
        Id: employeeDetails.id,
        EmployeeId: employeeDetails.employeeId ?? '',
        EmployeeName: employeeDetails.employeeName ?? '',
        Dob: formatDateForBackend(employeeDetails.dob),
        BloodGroup: employeeDetails.bloodGroup ?? '',
        Gender: employeeDetails.gender ?? '',
        MaritalStatus: employeeDetails.maritalStatus ?? '',
        Religion: employeeDetails.religion ?? '',
        PcontactNo: employeeDetails.pcontactNo ?? '',
        EmergencyContactNo: employeeDetails.emergencyContactNo ?? '',
        EmailAddress: employeeDetails.emailAddress ?? '',
        EmpImage: employeeDetails.empImage ?? '',
        EmpFather: employeeDetails.empFather ?? '',
        EmpMother: employeeDetails.empMother ?? '',
        PoliceStation: employeeDetails.policeStation ?? '',
        ZipCode: employeeDetails.zipCode ?? '',
        CountryId: employeeDetails.countryId ?? 0,
        StateId: employeeDetails.stateId ?? 0,
        City: employeeDetails.city ?? '',
        EmployeeType: employeeDetails.employeeType ?? 0,
        ProvisionEndDt: employeeDetails.provisionEndDt ?? null,
        PresentAddress: employeeDetails.presentAddress ?? '',
        PermaAddress: employeeDetails.permaAddress ?? '',
        DateofJoin: formatDateForBackend(employeeDetails.dateofJoin),
        ChildCompanyId: employeeDetails.childCompanyId ?? null,
        BranchId: employeeDetails.branchId ?? null,
        DepartmentId: employeeDetails.departmentId ?? 0,
        CompanyVerticalId: employeeDetails.companyVerticalId ?? null,
        DesigntionId: employeeDetails.designtionId ?? 0,
        ReportingEmpId: employeeDetails.reportingEmpId ?? null,
        ExistingBank: employeeDetails.existingBank ?? '',
        BankAcNo: employeeDetails.bankAcNo ?? '',
        BankIfsc: employeeDetails.bankIfsc ?? '',
        UploadResume: employeeDetails.uploadResume ?? '',
        HighDegree: employeeDetails.highDegree ?? '',
        YearPassing: employeeDetails.yearPassing ?? '',
        Percentage: employeeDetails.percentage ?? null,
        University: employeeDetails.university ?? '',
        OtherQualification: employeeDetails.otherQualification ?? '',
        Uanno: employeeDetails.uanno ?? '',
        Esino: employeeDetails.esino ?? '',
        PanNo: employeeDetails.panNo ?? '',
        AadhaarNo: employeeDetails.aadhaarNo ?? '',
        Category: employeeDetails.category ?? '',
        UploadPan: employeeDetails.uploadPan ?? '',
        UploadAadhaar: employeeDetails.uploadAadhaar ?? '',
        UploadSignature: employeeDetails.uploadSignature ?? '',
        Username: employeeDetails.username ?? '',
        Password: employeeDetails.password ?? '',
        Password: passwords.new,
        IsDelete: employeeDetails.isDelete ?? 0,
        Flag: employeeDetails.flag ?? 1,
        CreatedBy: employeeDetails.createdBy ?? employeeDetails.id ?? 0,
        CreatedDate: formatDateForBackend(employeeDetails.createdDate),
        ModifiedBy: employeeDetails.modifiedBy ?? employeeDetails.id ?? 0,
        ModifiedDate: formatDateForBackend(new Date()),
      };

      console.log(
        'Sending password update to:',
        `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
      );

      const response = await axios
        .post(`${BASE_URL}/EmpRegistration/SaveEmpRegistration`, payload)
        .catch(error => {
          console.error(
            'API Error Details:',
            error.response ? error.response.data : error.message,
          );
          throw error;
        });

      // Check if response exists and has a valid status
      if (response && response.status >= 200 && response.status < 300) {
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
        throw new Error('Failed to update password - Invalid response');
      }
    } catch (error) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password';

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          (typeof error.response.data === 'string'
            ? error.response.data
            : errorMessage);
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  // debugger;

  const uploadDocumentBase64 = async photo => {
    try {
      setUploading(true);

      // Convert local file to base64
      const base64Data = await RNFS.readFile(photo.uri, 'base64');
      const fileName = photo.name || photo.fileName || 'photo.jpg';
      const extension = fileName.split('.').pop() || 'jpg';

      const payload = {
        fileName,
        base64File: base64Data,
        extension,
        category: 'img',
      };

      console.log('📤 Uploading payload:', {
        fileName: payload.fileName,
        extension: payload.extension,
        category: payload.category,
        base64FileLength: payload.base64File?.length || 0
      });

      // Use the correct HTTPS URL
      const uploadUrl = 'https://hcmv2.anantatek.com/api/UploadDocument/UploadDocument';
      console.log('📡 Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log('📥 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, get the text response to see what's actually returned
        const textResponse = await response.text();
        console.log('📥 Non-JSON response:', textResponse);
        throw new Error(`Server returned ${contentType || 'unknown content type'}. Expected JSON. Response: ${textResponse.substring(0, 200)}...`);
      }

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (response.ok && result.fileName) {
        const uploadedFileName = result.fileName;
        
        // Save filename to employee profile first
        await saveProfileImage(uploadedFileName);

        // Then fetch and display the uploaded image
        const imageUri = `data:image/${extension};base64,${base64Data}`;
        setUploadedPhoto({uri: imageUri});
        setImageUrl(imageUri); // Update the main image display
        setUploadedPhotoFileName(uploadedFileName);

        Alert.alert('Success', 'Profile photo uploaded successfully!');
        
        // Refresh the profile data to get updated user info
        refreshAfterSuccess();
        
      } else {
        throw new Error(result?.message || `Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ UploadDocument error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Could not upload profile photo';
      
      if (error.message.includes('JSON Parse error')) {
        errorMessage = 'Server returned invalid response. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const saveProfileImage = async fileName => {
    try {
      const payload = {
        ...employeeDetails,
        EmpImage: fileName, // Use capital E for EmpImage to match backend
        ModifiedDate: formatDateForBackend(new Date()),
        ModifiedBy: employeeDetails.id || 0,
      };

      // Remove unwanted keys if needed (like arrays, etc.)
      delete payload.tblApplyLeaveApprovals;
      delete payload.tblApplyLeaves;
      delete payload.tblFinalLeaveApprovals;
      delete payload.tblNotifications;

      console.log('📤 Saving profile image filename:', fileName);

      const response = await axios.post(
        `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
        payload,
      );

      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Profile image filename saved successfully');
      } else {
        throw new Error('Failed to update profile image in database');
      }
    } catch (error) {
      console.error('❌ Profile image update error:', error.message);
      throw error; // Re-throw to handle in upload function
    }
  };

  const handleProfilePhotoUpdate = async () => {
    if (isPickingPhoto) {
      Alert.alert('Please wait', 'Photo picker is already in progress.');
      return;
    }
    setIsPickingPhoto(true);
    try {
      const result = await pick({
        type: ['image/*'],
        title: 'Select a profile photo',
        message: 'Choose a photo to set as your profile picture',
        cancelText: 'Cancel',
        confirmText: 'Select',
        multiple: false,
        allowMultiSelection: false,
      });

      if (!result || result.length === 0) {
        console.log('User cancelled or no photo selected');
        return;
      }

      const photo = result[0];

      console.log('📷 Selected image:', photo);

      // Validate it's an image
      const isImage =
        photo.type?.startsWith('image/') ||
        photo.uri?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);

      if (!isImage) {
        Alert.alert('Invalid File', 'Please select a valid image file');
        return;
      }

      await uploadDocumentBase64(photo);
    } catch (err) {
      if (err?.message?.includes('already in progress')) {
        Alert.alert(
          'Warning',
          'Previous picker did not settle. Please try again.',
        );
      } else {
        console.error('Document picker error:', err);
        Alert.alert('Error', 'Failed to select photo. Please try again.');
      }
    } finally {
      setIsPickingPhoto(false);
    }
  };

  // Handle field edit
  const handleEdit = field => {
    setIsEditing(true);

    // Map fields to their corresponding property names in employeeDetails
    const fieldToPropertyMap = {
      'Blood Group': 'bloodGroup',
      'Marital Status': 'maritalStatus',
      'Bank Name': 'existingBank',
      'AC Number': 'bankAcNo',
      'IFSC Code': 'bankIfsc',
      Email: 'emailAddress',
      'Primary No': 'pcontactNo',
      'Emergency No': 'emergencyContactNo',
    };

    const propertyName = fieldToPropertyMap[field];
    const value = propertyName
      ? employeeDetails[propertyName]
      : employeeDetails[field];

    setEditedFields(prev => ({
      ...prev,
      [field]: value || '',
    }));
  };

  // Handle save profile with improved error handling
  const handleSave = async () => {
    try {
      // Validate required fields
      const requiredFields = [
        'Blood Group',
        'Marital Status',
        'Bank Name',
        'AC Number',
        'IFSC Code',
        'Email',
        'Primary No',
        'Emergency No',
      ];
      const missingFields = [];

      requiredFields.forEach(field => {
        // Check if the field is empty in both edited fields and employee details
        const fieldToPropertyMap = {
          'Blood Group': 'bloodGroup',
          'Marital Status': 'maritalStatus',
          'Bank Name': 'existingBank',
          'AC Number': 'bankAcNo',
          'IFSC Code': 'bankIfsc',
          Email: 'emailAddress',
          'Primary No': 'pcontactNo',
          'Emergency No': 'emergencyContactNo',
        };

        const propertyName = fieldToPropertyMap[field];
        const existingValue = propertyName
          ? employeeDetails[propertyName]
          : null;

        if (!editedFields[field] && !existingValue) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        Alert.alert(
          'Required Fields Missing',
          `Please provide: ${missingFields.join(', ')}`,
        );
        return;
      }

      // Perform validation on all edited fields
      const validateFieldValue = (field, value) => {
        switch (field) {
          case 'Bank Name':
            const bankNameRegex = /^[A-Za-z ]{3,50}$/;
            return bankNameRegex.test(value)
              ? null
              : 'Bank name should contain only letters and be 3-50 characters';

          case 'AC Number':
            const acNumberRegex = /^[0-9]{9,18}$/;
            return acNumberRegex.test(value)
              ? null
              : 'Account number should contain 9-18 digits only';

          case 'IFSC Code':
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            return ifscRegex.test(value)
              ? null
              : 'Please enter a valid IFSC code (format: ABCD0123456)';

          case 'Email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            return emailRegex.test(value)
              ? null
              : 'Please enter a valid email address';

          case 'Primary No':
          case 'Emergency No':
            const phoneRegex = /^[6-9][0-9]{9}$/;
            return phoneRegex.test(value)
              ? null
              : 'Phone number should be 10 digits and start with 6-9';

          default:
            return null;
        }
      };

      const validationErrors = [];

      // Validate edited fields
      Object.keys(editedFields).forEach(field => {
        const value = editedFields[field];
        const error = validateFieldValue(field, value);
        if (error) {
          validationErrors.push(`${field}: ${error}`);
        }
      });

      if (validationErrors.length > 0) {
        Alert.alert('Validation Failed', validationErrors.join('\n'));
        return;
      }

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

      console.log(
        'Sending profile update to:',
        `${BASE_URL}/EmpRegistration/SaveEmpRegistration`,
      );
      console.log('Edited fields:', editedFields);
      console.log('Blood Group value being sent:', payload.BloodGroup);
      console.log('Marital Status value being sent:', payload.MaritalStatus);
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      const response = await axios
        .post(`${BASE_URL}/EmpRegistration/SaveEmpRegistration`, payload)
        .catch(error => {
          console.error(
            'API Error Details:',
            error.response ? error.response.data : error.message,
          );
          throw error;
        });

      // Check if response exists and has a valid status
      if (
        response &&
        response.status >= 200 &&
        response.status < 300 &&
        response.data
      ) {
        console.log('Backend response:', response.data);
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main'), // Navigate to Main Screen
          },
        ]);
        setEditedFields({});
        setIsEditing(false);
        refreshAfterSuccess();
      } else {
        throw new Error('Failed to update profile - Invalid response');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile.';

      if (error.response) {
        console.log('Error Status:', error.response.status);
        console.log('Error Headers:', error.response.headers);
        console.log('Error Data:', error.response.data);

        errorMessage =
          error.response.data?.message ||
          (typeof error.response.data === 'string'
            ? error.response.data
            : errorMessage);
      }

      Alert.alert('Error', errorMessage);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFields({});
  };

  // Add the missing getProfileImageSource function
  const getProfileImageSource = () => {
    // Priority: uploadedPhoto > imageUrll > employeeDetails static URL > default
    if (uploadedPhoto?.uri) {
      return {uri: uploadedPhoto.uri};
    }
    if (imageUrll) {
      return {uri: imageUrll};
    }
    // Use employeeDetails.empImage for static URL fallback
    if (employeeDetails?.empImage) {
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${employeeDetails.empImage}`;
      return {uri: staticImageUrl};
    }
    // Default fallback image
    return {uri: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d'};
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

  // Remove the unused staticBaseUrl variable since we're using getProfileImageSource
  // const staticBaseUrl = 'https://hcmv2.anantatek.com/assets/UploadImg/${fileNameWithExtension}';
  // const imageUrl = uploadedPhotoFileName
  //   ? `${staticBaseUrl}${uploadedPhotoFileName}`
  //   : employeeDetails?.empImage
  //   ? `${staticBaseUrl}${employeeDetails.empImage}`
  //   : null;

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
      isDropdown: true,
      options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    {
      icon: 'account-heart',
      label: 'Marital Status',
      value: employeeDetails.maritalStatus,
      editable: true,
      isDropdown: true,
      options: ['Married', 'Unmarried', 'Other'],
      required: true,
    },
    {
      icon: 'bank',
      label: 'Bank Name',
      value: employeeDetails.existingBank,
      editable: true,
      required: true,
    },
    {
      icon: 'credit-card',
      label: 'AC Number',
      value: employeeDetails.bankAcNo,
      editable: true,
      keyboardType: 'numeric',
      required: true,
    },
    {
      icon: 'barcode',
      label: 'IFSC Code',
      value: employeeDetails.bankIfsc,
      editable: true,
      required: true,
    },
  ];

  const contactData = [
    {
      icon: 'email',
      label: 'Email',
      value: employeeDetails.emailAddress,
      editable: true,
      keyboardType: 'email-address',
      required: true,
    },
    {
      icon: 'phone',
      label: 'Primary No',
      value: employeeDetails.pcontactNo,
      editable: true,
      keyboardType: 'phone-pad',
      required: true,
    },
    {
      icon: 'cellphone',
      label: 'Emergency No',
      value: employeeDetails.emergencyContactNo,
      editable: true,
      keyboardType: 'phone-pad',
      required: true,
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
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
                iconColor="#ffffffff"
                onPress={() => setIsPasswordModalVisible(true)}
              />
              <Appbar.Action
                icon="pencil"
                iconColor="#ffffffff"
                onPress={() => setIsEditing(true)}
              />
            </>
          )}
        </Appbar.Header>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {/* Enhanced Profile Header Card with LinearGradient */}
          <View style={styles.profileHeaderContainer}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB', '#3B82F6']}
              style={styles.headerGradient}>
              <View style={styles.headerCurve} />

              <View style={styles.profileHeaderContent}>
                {/* Profile Image Section */}
                <TouchableOpacity
                  onPress={handleProfilePhotoUpdate}
                  style={styles.modernProfileImageContainer}
                  disabled={uploading}>
                  <Image
                    source={getProfileImageSource()}
                    style={styles.modernProfileImage}
                  />
                  <View style={styles.editIconContainer}>
                    {uploading ? (
                      <ActivityIndicator size={14} color="#fff" />
                    ) : (
                      <Icon name="camera" size={14} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Profile Info Section */}
                <View style={styles.profileInfoContainer}>
                  <Text style={styles.modernProfileName}>
                    {employeeDetails.employeeName}
                  </Text>
                  <Text style={styles.modernProfileDesignation}>
                    {employeeDetails.designationName}
                  </Text>

                  {/* Employee Status Badge */}
                  {/* <View style={styles.statusBadge}>
                    <Icon name="check-circle" size={14} color="#4CAF50" />
                    <Text style={styles.statusText}>Active Employee</Text>
                  </View> */}
                </View>
              </View>

              {/* Quick Stats Cards - Simplified */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {employeeDetails.employeeId}
                  </Text>
                  <Text style={styles.statLabel}>Employee ID</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {employeeDetails.departmentName?.length > 8 
                      ? employeeDetails.departmentName.substring(0, 8) + '...' 
                      : employeeDetails.departmentName}
                  </Text>
                  <Text style={styles.statLabel}>Department</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {employeeDetails.branchName?.length > 8 
                      ? employeeDetails.branchName.substring(0, 8) + '...' 
                      : employeeDetails.branchName}
                  </Text>
                  <Text style={styles.statLabel}>Branch</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

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

        {/* Removed FAB button */}
      </AppSafeArea>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: '#3B82F6',
    elevation: Platform.OS === 'android' ? 3 : 3,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        paddingLeft: 12,
      },
      android: {
        paddingLeft: 16,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffffff',
  },

  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 10,
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

  // Enhanced Profile card styles with gradient
  profileCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden', // Important to contain the gradient
    elevation: 4,
  },
  profileGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  profileRole: {
    fontSize: 15,
    color: '#e6efff',
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  profileBadgeIcon: {
    marginRight: 5,
  },
  profileDepartment: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },

  // Profile photo styles - enhanced
  profilePhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    borderRadius: 60,
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
  },
  profilePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 8,
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
    alignItems: 'center',
  },
  sectionIconContainer: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
  sectionContent: {
    padding: 12,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
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
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    position: 'relative',
    minHeight: 40,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  dropdownSelectedValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownErrorText: {
    color: '#F44336',
  },
  fieldInputError: {
    borderBottomColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  requiredAsterisk: {
    color: '#F44336',
    fontWeight: 'bold',
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

  // New styles for modern profile header
  profileHeaderContainer: {
    marginBottom: -49,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 80,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#f4f6f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileHeaderContent: {
    alignItems: 'center',
    // paddingHorizontal: 20,
  },
  modernProfileImageContainer: {
    position: 'relative',
    padding: 3,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modernProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4c669f',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  modernProfileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  modernProfileDesignation: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 50,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    minHeight: 60,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ProfileScreen;