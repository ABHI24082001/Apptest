import axiosinstance from 'axiosinstance';
import BASE_URL from '../constants/apiConfig';

export const postApi = async (endpoint, data, headers = {}) => {
  try {
    const response = await axiosinstance.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in POST API:', error);
    throw error;
  }
};