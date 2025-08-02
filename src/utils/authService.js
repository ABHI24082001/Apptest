
import BASE_URL from '../constants/apiConfig';
import axiosInstance from './axiosInstance';

const token =
  'SoN8HIgE3rYpS22E4ngvUj7Bj5PypE0JKUvbgIo3N7bMy1bVnhAWNKyFaMmBAnZz+n1Nyry29JujM3MmZJ4fdpzC2LMf0pCoR4a44dJxDXtutvdcMLZVBNoMYNcwbnx5Na1/ujDmC2SO/mCYZ8HXuL++c+EMS3EDVHc0gEcjxyEOb8rMv3q5XOY8Ha+hV0DIn5e1lfsp18cz9Kwm0mBlo9IykXIyeQyNCp1/AxhmaRQkb37BLRLOXfX251myZJbm';

export const fetchUserId = async (username, password , token) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/EmpRegistration/FetchCompanyUserId`,
      {
        UserName: username,
        Password: password,
        descriptor: null,
      },
      {
        headers: {
          // 'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
          UserId: '0',
        },
      }
    );

    const userId = response?.data;

    if (!userId) {
      throw new Error('User ID not found. Please check your username/password.');
    }

    return { success: true, userId };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || 'Failed to fetch User ID',
    };
  }
};
