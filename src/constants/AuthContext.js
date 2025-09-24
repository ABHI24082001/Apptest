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
  
  // Load user from AsyncStorage if needed
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);

  const login = async (userData, token, userId) => {
  setAuthToken(token);           // ✅ Set token globally
  setUserIdHeader(userId);       // ✅ Set userId globally

  setUser(userData);
  await AsyncStorage.setItem('user', JSON.stringify(userData));
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('userId', String(userId));
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

  // Make sure to include logout in the context value
  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        userId,
        isLoading,
        login: (userData, userToken, userId) => {
          setUser(userData);
          setToken(userToken);
          setUserId(userId);
        },
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
