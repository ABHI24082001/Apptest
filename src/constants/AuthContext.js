// context/AuthContext.js
import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setUserIdHeader} from '../utils/axiosInstance'
const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user from AsyncStorage when the app starts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const [userData, userToken, userIdValue] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('userId')
        ]);

        if (userData && userToken && userIdValue) {
          setUser(JSON.parse(userData));
          setToken(userToken);
          setUserId(userIdValue);
          setAuthToken(userToken);
          setUserIdHeader(userIdValue);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Fixed login function to properly update all state
  const login = async (userData, userToken, userIdValue) => {
    try {
      // Set global axios headers
      setAuthToken(userToken);
      setUserIdHeader(userIdValue);

      // Update context state
      setUser(userData);
      setToken(userToken);
      setUserId(userIdValue);

      // Store in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', userToken);
      await AsyncStorage.setItem('userId', String(userIdValue));
      await AsyncStorage.setItem('hasLoggedIn', 'true');

     
    } catch (error) {
      console.error('❌ Auth context login error:', error);
      throw error;
    }
  };

  // Ensure logout function properly clears all AsyncStorage keys
  const logout = async () => {
    try {
      console.log('Executing logout function in AuthContext...');
      
      // Clear all authentication-related items from AsyncStorage
      const keysToRemove = ['hasLoggedIn', 'user', 'token', 'userId'];
      await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
      
      // Reset authentication state
      setUser(null);
      setToken(null);
      setUserId(null);
      
      // Clear axios headers
      setAuthToken(null);
      setUserIdHeader(null);
      
      console.log('✅ AuthContext logout: All auth data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ AuthContext logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        userId,
        isLoading,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
