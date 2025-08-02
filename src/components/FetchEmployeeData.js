import {useEffect, useState} from 'react';
import axiosinstance from '../utils/axiosInstance';
import {useAuth} from '../constants/AuthContext';
import BASE_URL from '../constants/apiConfig';

const useFetchEmployeeData = () => {
  const {user} = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (user?.id) {
          const response = await axiosinstance.get(
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

  return employeeData;
};

export default useFetchEmployeeData;
