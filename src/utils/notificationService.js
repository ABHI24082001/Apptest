import messaging from '@react-native-firebase/messaging';

/**
 * Request notification permission
 */
export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('🔔 Notification permission granted');
    await getFCMToken();
  }
};

/**
 * Get FCM Token
 */
export const getFCMToken = async () => {
  const token = await messaging().getToken();
  console.log('🔥 FCM TOKEN:', token);
};

/**
 * Foreground notification listener
 */
export const foregroundListener = () => {
  return messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground notification:', remoteMessage);
  });
};
