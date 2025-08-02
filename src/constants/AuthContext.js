// context/AuthContext.js
import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setUserIdHeader} from '../utils/axiosInstance'
const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

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

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
