// import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
// import axiosinstance from 'axiosinstance';
// import { WebView } from 'react-native-webview';

// const Mylocation = () => {
//   const employeeDetails = useFetchEmployeeDetails();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Prepare the POST data for the WebView
//   const postData = JSON.stringify({
//     EmployeeId: String(employeeDetails?.id || ''),
//     Companyid: String(employeeDetails?.childCompanyId || ''),
//   });

//   // Only show loading until employeeDetails are available
//   useEffect(() => {
//     if (employeeDetails?.id && employeeDetails?.childCompanyId) {
//       setLoading(false);
//     }
//   }, [employeeDetails]);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2962ff" />
//         <Text style={{ marginTop: 12 }}>Loading...</Text>
//       </View>
//     );
//   }

//   if (!employeeDetails?.id || !employeeDetails?.childCompanyId) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>
//           Employee data not loaded. Please contact your administrator.
//         </Text>
//       </View>
//     );
//   }

//   // WebView POST to the URL with JSON body
//   return (
//     <WebView
//       source={{
//         uri: 'https://hcmv2.anantatek.com/BioMatricAuthentication/BioMatric',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: postData,
//       }}
//       startInLoadingState={true}
//       javaScriptEnabled={true}
//       domStorageEnabled={true}
//       originWhitelist={['*']}
//       style={styles.webview}
//       onError={e => {
//         setError('WebView failed to load.');
//         console.error('WebView error:', e.nativeEvent);
//       }}
//       onHttpError={e => {
//         setError('WebView HTTP error.');
//         console.error('WebView HTTP error:', e.nativeEvent);
//       }}
//     />
//   );
// };

// export default Mylocation;

// const styles = StyleSheet.create({
//   center: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center',
//     padding: 20
//   },
//   errorText: {
//     color: 'red', 
//     fontWeight: 'bold', 
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 10
//   },
//   webview: {
//     flex: 1
//   }
// });


import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Mylocation = () => {
  return (
    <View>
      <Text>Mylocation</Text>
    </View>
  )
}

export default Mylocation

const styles = StyleSheet.create({})