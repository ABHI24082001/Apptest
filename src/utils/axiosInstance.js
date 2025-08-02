import axios from 'axios';
import BASE_URL from '../constants/apiConfig';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🟢 Set Authorization token
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// 🟢 Set UserId
export const setUserIdHeader = (userId) => {
  if (userId) {
    axiosInstance.defaults.headers.common['UserId'] = String(userId);
  } else {
    delete axiosInstance.defaults.headers.common['UserId'];
  }
};

export default axiosInstance;
