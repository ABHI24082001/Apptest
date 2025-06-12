import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {Card, Appbar, Divider, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import AppSafeArea from '../component/AppSafeArea';
import BASE_URL from '../constants/apiConfig';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axios from 'axios';
import {pick} from '@react-native-documents/picker'; // <-- Add this import

// EditableField Component
const EditableField = ({
  icon,
  label,
  value,
  editable,
  isEditing,
  editedFields,
  setEditedFields,
  onEdit,
}) => (
  <View key={label} style={styles.row}>
    <Icon name={icon} size={20} color="#666" style={styles.icon} />
    <View style={styles.textWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.editInput}
          value={
            editedFields[label] !== undefined ? editedFields[label] : value
          }
          onChangeText={text =>
            setEditedFields({...editedFields, [label]: text})
          }
        />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
    {editable && !isEditing && (
      <TouchableOpacity onPress={() => onEdit(label)} style={styles.editIcon}>
        <View style={styles.editIconContainer}>
          <Icon name="pencil" size={20} color="#3B82F6" />
          {/* <Text style={styles.editIconText}>Edit</Text> */}
        </View>
      </TouchableOpacity>
    )}
    <Divider style={{marginVertical: 4}} />
  </View>
);

// ProfileSection Component
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
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleSection = () => {
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 1, {duration: 300});
    height.value = withTiming(isOpen ? 0 : 1, {duration: 300});
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg`},
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    height: interpolate(
      height.value,
      [0, 1],
      [0, data.length * 60 + (data.length - 1) * 4],
      Extrapolate.CLAMP,
    ),
    opacity: height.value,
    overflow: 'hidden',
  }));

  return (
    <Card style={styles.sectionCard}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon
              name={icon}
              size={22}
              color="#333"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Animated.View style={iconStyle}>
            <Icon name="chevron-down" size={24} color="#333" />
          </Animated.View>
        </View>
      </TouchableOpacity>
      <Animated.View style={contentStyle}>
        <View style={styles.sectionContent}>
          {data.map(item => (
            <EditableField
              key={item.label}
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

// ChangePasswordSection Component
const ChangePasswordSection = ({
  editedFields,
  setEditedFields,
  handleUpdatePassword,
}) => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
   
  });

  const togglePasswordVisibility = field => {
    setShowPassword(prev => ({...prev, [field]: !prev[field]}));
  };

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionContent}>
        {['current', 'new' ].map(field => (
          <View key={field} style={styles.passwordInputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.icon} />
            <View style={styles.passwordInputWrapper}>
              <Text style={styles.passwordLabel}>{`${
                field.charAt(0).toUpperCase() + field.slice(1)
              } Password`}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder={`Enter ${field} password`}
                  secureTextEntry={!showPassword[field]}
                  value={editedFields[`${field}Password`]}
                  style={styles.input}
                  onChangeText={text =>
                    setEditedFields({
                      ...editedFields,
                      [`${field}Password`]: text,
                    })
                  }
                />
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility(field)}
                  style={styles.eyeButton}>
                  <Icon
                    name={showPassword[field] ? 'eye' : 'eye-off'}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity
          onPress={handleUpdatePassword}
          style={styles.updateButton}>
          <Icon name="lock-reset" size={20} color="#fff" />
          <Text style={styles.updateButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

// ProfileScreen Component
const ProfileScreen = () => {
  const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [showCredentialsDropdown, setShowCredentialsDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleChangePasswordVisibility = () => {
    setIsChangePasswordVisible(prev => !prev);
  };
  // debugger
  const handleUpdatePassword = async () => {
    try {
      
      const newPassword =
        editedFields.newPassword ||
        editedFields.Password ||
        editedFields.password ||
        '';

      if (!newPassword) {
        Alert.alert('Error', 'Please enter a new password.');
        return;
      }

      // Build the payload with only the required fields for password update
      const payload = {
        Id: employeeDetails.id,
        EmployeeId: employeeDetails.employeeId,
        Password: newPassword,
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

      console.log('Payload for password update:', payload);

      const response = await axios.post(
        `${BASE_URL}EmpRegistration/SaveEmpRegistration`,
        payload,
      );

      // Show backend response in an alert for debugging
      console.log('Password update backend response:', response);
      Alert.alert(
        'Backend Response',
        `Status: ${response.status}\nData: ${JSON.stringify(
          response.data,
          null,
          2,
        )}`,
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Password updated successfully!');
        setEditedFields({});
      } else {
        throw new Error('Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response) {
        Alert.alert('Error', JSON.stringify(error.response.data, null, 2));
      } else {
        Alert.alert('Error', error.message || 'Something went wrong.');
      }
    }
  };
  function formatDateForBackend(date) {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }

  const handleEdit = field => {
    setIsEditing(true);
    setEditedFields({...editedFields, [field]: employeeDetails[field]});
  };
  // debugger;
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

      // console.log('Payload================= sent to backend:', payload);
      const response = await axios.post(
        `${BASE_URL}EmpRegistration/SaveEmpRegistration`,
        payload,
      );

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
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile.',
      );
    }
  };

  const handleProfilePhotoUpdate = async () => {
    try {
      const result = await pick({
        type: ['image/*'],
        allowMultiSelection: false,
      });
      if (!result || !result[0]) return;

      setUploading(true);

      const photo = result[0];
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: photo.type,
        name: photo.name || 'profile.jpg',
      });
      formData.append('EmployeeId', employeeDetails.id);

      const response = await axios.post(
        `${BASE_URL}EmpRegistration/UploadProfilePhoto`,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      setUploading(false);

      if (response.status === 200) {
        Alert.alert('Success', 'Profile photo updated!');
        // Optionally, refresh employeeDetails here
      } else {
        throw new Error('Failed to update profile photo.');
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to update profile photo.');
    }
  };

  const IMG_BASE_URL = 'https://hcmv2.anantatek.com/assets/UploadImg/';
  const imageUrl = employeeDetails?.empImage
    ? `${IMG_BASE_URL}${employeeDetails.empImage}`
    : null;

  if (!employeeDetails) {
    return (
      <AppSafeArea>
        <Appbar.Header>
          <Appbar.Content title="Profile" />
        </Appbar.Header>
        <Text style={{padding: 20, textAlign: 'center'}}>
          Loading profile...
        </Text>
      </AppSafeArea>
    );
  }

  const generalInfoData = [
    {
      icon: 'badge-account',
      label: 'Employee ID',
      value: employeeDetails.employeeId,
    },
    {icon: 'map-marker', label: 'Branch', value: employeeDetails.branchName},
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
    },
    {
      icon: 'phone',
      label: 'Primary No',
      value: employeeDetails.pcontactNo,
      editable: true,
    },
    {
      icon: 'cellphone',
      label: 'Emergency No',
      value: employeeDetails.emergencyContactNo,
      editable: true,
    },
  ];

  const credentialsData = [
    {icon: 'email', label: 'Email', value: employeeDetails.emailAddress},
    {icon: 'account', label: 'Username', value: employeeDetails.username},
    {icon: 'id-card', label: 'User ID', value: employeeDetails.employeeId},
  ];

  const professionalData = [
    {
      icon: 'domain',
      label: 'Vertical',
      value: employeeDetails.companyVerticalId?.toString() ?? 'N/A',
    },
    {
      icon: 'briefcase',
      label: 'Branch Name',
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
      icon: 'account-supervisor',
      label: 'Department',
      value: employeeDetails.departmentName,
    },
  ];

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard} elevation={2}>
          <View style={styles.profileContent}>
            <View style={styles.profilePhotoContainer}>
              <TouchableOpacity
                onPress={handleProfilePhotoUpdate}
                style={styles.profilePhotoTouchable}>
                <Image
                  source={
                    imageUrl
                      ? {uri: imageUrl}
                      : require('../assets/image/boy.png')
                  }
                  style={styles.profileImage}
                />
                <View style={styles.profilePhotoEditIcon}>
                  {uploading ? (
                    <ActivityIndicator size={18} color="#2196F3" />
                  ) : (
                    <Icon name="camera" size={22} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{employeeDetails.employeeName}</Text>
            <Text style={styles.role}>
              {employeeDetails.designationName},{' '}
              {employeeDetails.departmentName}
            </Text>
          </View>
        </Card>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <ProfileSection
          title="General Info"
          icon="information-outline"
          data={generalInfoData}
          isEditing={isEditing}
          editedFields={editedFields}
          setEditedFields={setEditedFields}
          onEdit={handleEdit}
        />

        <ProfileSection
          title="Contact"
          icon="phone-outline"
          data={contactData}
          isEditing={isEditing}
          editedFields={editedFields}
          setEditedFields={setEditedFields}
          onEdit={handleEdit}
        />

        {/* Credentials Section with Change Password Dropdown */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCredentialsDropdown(v => !v)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon
                  name="shield-account-outline"
                  size={22}
                  color="#333"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Credentials</Text>
              </View>
              <Icon
                name={showCredentialsDropdown ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#333"
              />
            </View>
          </TouchableOpacity>
          {showCredentialsDropdown && (
            <View>
              <View style={styles.sectionContent}>
                {credentialsData.map(item => (
                  <EditableField
                    key={item.label}
                    {...item}
                    isEditing={isEditing}
                    editedFields={editedFields}
                    setEditedFields={setEditedFields}
                    onEdit={handleEdit}
                  />
                ))}
              </View>
              {/* Change Password Section inside Credentials dropdown */}
              <TouchableOpacity
                onPress={toggleChangePasswordVisibility}
                style={styles.sectionToggle}>
                <View style={styles.sectionToggleContent}>
                  <View style={styles.sectionToggleTextContainer}>
                    <Icon
                      name="lock-outline"
                      size={20}
                      color="#333"
                      style={styles.sectionToggleIcon}
                    />
                    <Text style={styles.sectionToggleText}>
                      Change Password
                    </Text>
                  </View>
                  <Icon
                    name={
                      isChangePasswordVisible ? 'chevron-up' : 'chevron-down'
                    }
                    size={20}
                    color="#333"
                  />
                </View>
              </TouchableOpacity>
              {isChangePasswordVisible && (
                <ChangePasswordSection
                  editedFields={editedFields}
                  setEditedFields={setEditedFields}
                  handleUpdatePassword={handleUpdatePassword}
                />
              )}
            </View>
          )}
        </Card>

        <ProfileSection
          title="Professional Details"
          icon="briefcase-outline"
          data={professionalData}
          isEditing={isEditing}
          editedFields={editedFields}
          setEditedFields={setEditedFields}
          onEdit={handleEdit}
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
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  container: {flex: 1, backgroundColor: '#f4f6f8'},
  scrollContent: {paddingHorizontal: 16, paddingBottom: 50, paddingTop: 10},
  profileCard: {
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContent: {alignItems: 'center'},
  profilePhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profilePhotoTouchable: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#f0f0f0',
  },
  profilePhotoEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#222'},
  role: {fontSize: 14, color: '#666'},
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
  sectionTitleContainer: {flexDirection: 'row', alignItems: 'center'},
  sectionIcon: {marginRight: 10},
  sectionTitle: {fontSize: 16, fontWeight: '800', color: '#333'},
  sectionContent: {padding: 12},
  row: {flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6},
  icon: {marginTop: 2, marginRight: 10, width: 20, textAlign: 'center'},
  textWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {width: 110, fontWeight: '800', fontSize: 16, color: '#333'},
  colon: {marginRight: 4, fontSize: 14, fontWeight: '800', color: '#333'},
  value: {flexShrink: 1, fontSize: 16, color: '#555', fontWeight: '600'},
  editIcon: {marginLeft: 10},
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
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInputWrapper: {
    flex: 1,
  },
  passwordLabel: {
    fontWeight: '800',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  eyeButton: {
    padding: 8,
  },
  updateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row', // Added for icon and text alignment
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8, // Added spacing between icon and text
  },
  sectionToggle: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionToggleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionToggleIcon: {
    marginRight: 8, // Added spacing between the clock icon and text
  },
  sectionToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ProfileScreen;
