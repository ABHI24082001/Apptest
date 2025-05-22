import AsyncStorage from '@react-native-async-storage/async-storage';

export const setSessionId = async (sessionId) => {
  try {
    await AsyncStorage.setItem('SESSION_ID', sessionId);
  } catch (error) {
    console.error('Error saving session ID:', error);
  }
};

export const getSessionId = async () => {
  try {
    return await AsyncStorage.getItem('SESSION_ID');
  } catch (error) {
    console.error('Error retrieving session ID:', error);
    return null;
  }
};

export const clearSessionId = async () => {
  try {
    await AsyncStorage.removeItem('SESSION_ID');
  } catch (error) {
    console.error('Error clearing session ID:', error);
  }
};