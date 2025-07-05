import {useEffect, useState} from 'react';
import axios from 'axios';
import {useAuth} from '../constants/AuthContext';
import BASE_URL from '../constants/apiConfig';
const useFetchEmployeeDetails = () => {
  const {user} = useAuth();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        if (user?.id) {
          console.log('Fetching employee details for user ID:', user.id); // Debug user ID
          const response = await axios.get(
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
