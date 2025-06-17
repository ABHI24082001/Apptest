import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const STORAGE_KEYS = {
  ATTENDANCE_HISTORY: 'attendance_history',
  CURRENT_CHECK_IN: 'current_check_in',
  USER_PROFILE: 'user_profile',
};

/**
 * Save data to AsyncStorage
 * @param {string} key - Storage key
 * @param {any} value - Data to store
 * @returns {Promise<void>}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`Data stored successfully for key: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error storing data for key: ${key}`, error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<any>} - Retrieved data
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key: ${key}`, error);
    return null;
  }
};

/**
 * Add item to an array in AsyncStorage
 * @param {string} key - Storage key
 * @param {any} newItem - Item to add to array
 * @returns {Promise<boolean>} - Success status
 */
export const addToArray = async (key, newItem) => {
  try {
    // Get existing array or create new one
    const existingData = await getData(key) || [];
    
    // Add new item
    existingData.push({
      ...newItem,
      id: Date.now().toString(), // Add unique ID
    });
    
    // Save updated array
    await storeData(key, existingData);
    return true;
  } catch (error) {
    console.error(`Error adding to array for key: ${key}`, error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error clearing AsyncStorage', error);
    return false;
  }
};
