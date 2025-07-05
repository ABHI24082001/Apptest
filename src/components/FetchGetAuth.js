import { useState, useCallback } from 'react';
import axios from 'axios';
import useFetchEmployeeDetails from './FetchEmployeeDetails';

const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';

/**
 * Custom hook to fetch authorization data for a specific action
 * @param {string} controllerName - The controller name for the action
 * @param {string} actionName - The action name to check
 * @returns {Object} - Functions and data for authorization
 */
const useFetchAuth = (controllerName = 'Leaveapproval', actionName = 'LeaveapprovalList') => {
  const employeeDetails = useFetchEmployeeDetails();
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFunctionalAccessMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        DepartmentId: employeeDetails?.departmentId || 0,
        DesignationId: employeeDetails?.designtionId || 0,
        EmployeeId: employeeDetails?.id || 0,
        ControllerName: controllerName,
        ActionName: actionName,
        ChildCompanyId: employeeDetails?.childCompanyId || 1,
        BranchId: employeeDetails?.branchId || 2,
        UserType: 1,
      };

      console.log('Sending request data for access:', requestData);

      const response = await axios.post(
        `${BASE_URL_PROD}/FunctionalAccess/GetAllAuthorizatonPersonForTheAction`,
        requestData,
      );

      console.log(`${controllerName} access list:`, response.data);
      
      setAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching functional access for ${controllerName}/${actionName}:`, error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [employeeDetails, controllerName, actionName]);

  /**
   * Check if current user has authorization
   */
  const checkUserAuthorization = useCallback(() => {
    if (!authData || !Array.isArray(authData) || !employeeDetails) {
      return false;
    }
    
    const currentUserId = employeeDetails.id;
    return authData.some(person => person.employeeId === currentUserId);
  }, [authData, employeeDetails]);

  return { 
    fetchFunctionalAccessMenus,
    checkUserAuthorization,
    authData,
    loading,
    error,
    hasAuth: checkUserAuthorization(),
  };
};

export default useFetchAuth;