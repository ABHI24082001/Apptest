import {useEffect, useState} from 'react';
// import axiosinstance from 'axiosinstance';
import {useAuth} from '../constants/AuthContext';
import axiosinstance from '../utils/axiosInstance';
import BASE_URL from '../constants/apiConfig';
const useFetchEmployeeDetails = () => {
  const {user} = useAuth();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        if (user?.id) {
          console.log('Fetching employee details for user ID:', user.id); // Debug user ID
          const response = await axiosinstance.get(
            // `https://hcmapiv2.anantatek.com/api/EmpRegistration/GetEmpRegistrationById/${user.id}`,
           `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${user.id}`,
          );
          console.log('API response:', response.data); // Debug API response
          setEmployeeDetails(response.data);
        } else {
          console.log('User ID is null or undefined'); // Debug null user ID
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [user]);

  return employeeDetails;
};

export default useFetchEmployeeDetails;




//   header: {
//     backgroundColor: '#fff',
//     elevation: Platform.OS === 'android' ? 3 : 0,
//   },
//   headerTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
//   container: {flex: 1, backgroundColor: '#f4f6f8'},
//   scrollContent: {paddingHorizontal: 16, paddingBottom: 50, paddingTop: 10},
//   profileCard: {
//     borderRadius: 12,
//     marginBottom: 16,
//     paddingVertical: 20,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   profileContent: {alignItems: 'center'},
//   profilePhotoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   profilePhotoTouchable: {
//     position: 'relative',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 1,
//     borderColor: '#2196F3',
//     backgroundColor: '#f0f0f0',
//   },
//   profilePhotoEditIcon: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#2196F3',
//     borderRadius: 16,
//     padding: 4,
//     borderWidth: 2,
//     borderColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   name: {fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#222'},
//   role: {fontSize: 14, color: '#666'},
//   sectionCard: {
//     borderRadius: 12,
//     marginBottom: 16,
//     backgroundColor: '#fff',
//     overflow: 'hidden',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   sectionTitleContainer: {flexDirection: 'row', alignItems: 'center'},
//   sectionIcon: {marginRight: 10},
//   sectionTitle: {fontSize: 16, fontWeight: '800', color: '#333'},
//   sectionContent: {padding: 12},
//   row: {flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6},
//   icon: {marginTop: 2, marginRight: 10, width: 20, textAlign: 'center'},
//   textWrapper: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   label: {width: 110, fontWeight: '800', fontSize: 16, color: '#333'},
//   colon: {marginRight: 4, fontSize: 14, fontWeight: '800', color: '#333'},
//   value: {flexShrink: 1, fontSize: 16, color: '#555', fontWeight: '600'},
//   editIcon: {marginLeft: 10},
//   editInput: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     fontSize: 16,
//     color: '#555',
//     flex: 1,
//   },
//   editActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 1,
//     paddingHorizontal: 16,
//     marginBottom: 16,
//     paddingVertical: 10,
//   },
//   saveButton: {
//     backgroundColor: '#3B82F6',
//     padding: 10,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 10,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   cancelButton: {
//     backgroundColor: '#ccc',
//     padding: 10,
//     borderRadius: 8,
//     flex: 1,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   passwordInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   passwordInputWrapper: {
//     flex: 1,
//   },
//   passwordLabel: {
//     fontWeight: '800',
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 4,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//     height: 50,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//   },
//   eyeButton: {
//     padding: 8,
//   },
//   updateButton: {
//     backgroundColor: '#3B82F6',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//     flexDirection: 'row', // Added for icon and text alignment
//     justifyContent: 'center',
//   },
//   updateButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginLeft: 8, // Added spacing between icon and text
//   },
//   sectionToggle: {
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   sectionToggleContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   sectionToggleTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sectionToggleIcon: {
//     marginRight: 8, // Added spacing between the clock icon and text
//   },
//   sectionToggleText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
// });