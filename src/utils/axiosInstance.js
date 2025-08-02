import axios from 'axios';
import BASE_URL from '../constants/apiConfig'; // should be 'http://192.168.29.2:90'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = token => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export const setUserIdHeader = userId => {
  if (userId) {
    axiosInstance.defaults.headers.common['UserId'] = String(userId);
  } else {
    delete axiosInstance.defaults.headers.common['UserId'];
  }
};

export default axiosInstance;
