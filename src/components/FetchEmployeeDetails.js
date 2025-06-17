import {useEffect, useState} from 'react';
import axios from 'axios';
import {useAuth} from '../constants/AuthContext';

const useFetchEmployeeDetails = () => {
  const {user} = useAuth();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const BASE_URL_LOCAL = 'http://192.168.29.2:90/api/'; 
  
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        // For debugging - either use user.id or hardcoded 33 for testing
        const userId = user?.id || 33;
        
        // Make the API call with the userId
        const response = await axios.get(
          `${BASE_URL_LOCAL}EmpRegistration/GetEmpRegistrationById/${userId}`
        );
        
        // Check if we have a valid response
        if (response.data) {
          setEmployeeDetails(response.data);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    // Only fetch if we have user info or in development mode
    fetchEmployeeDetails();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [user]);

  return employeeDetails;
};

export default useFetchEmployeeDetails;
