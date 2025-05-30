import {useEffect, useState} from 'react';
import axios from 'axios';
import {useAuth} from '../constants/AuthContext';

const useFetchLeaveData = () => {
  const {user} = useAuth();
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const employeeId = user?.id;
        const companyId = user?.childCompanyId;

        if (!employeeId || !companyId) return;

        const response = await axios.get(
          `https://hcmapiv2.anantatek.com/api/CommonDashboard/GetEmployeeLeaveDetails/${companyId}/${employeeId}`,
        );

        const transformed = response.data.leaveBalances.map(item => ({
          label: item.leavename,
          used: item.usedLeaveNo,
          available: item.availbleLeaveNo,
        }));

        setLeaveData(transformed);
      } catch (error) {
        console.error('Error fetching leave data:', error.message);
      }
    };

    fetchLeaveData();
  }, [user]);

  return leaveData;
};

export default useFetchLeaveData;
