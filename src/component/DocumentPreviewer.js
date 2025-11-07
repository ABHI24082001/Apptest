// import React, {useState} from 'react';
// import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
// import DocumentPicker, {pick} from 'react-native-document-picker';
// import {openDocument} from '@react-native-documents/viewer';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const DocumentPreviewer = () => {
//   const [file, setFile] = useState(null);

//   const pickDocument = async () => {
//     try {
//       const res = await DocumentPicker.pickSingle({
//         type: DocumentPicker.types.allFiles,
//       });

//       setFile(res);
//     } catch (err) {
//       if (DocumentPicker.isCancel(err)) {
//         console.log('User cancelled');
//       } else {
//         console.error('Document pick error:', err);
//       }
//     }
//   };

//   const viewDocument = async () => {
//     if (file?.uri) {
//       openDocument(file.uri, file.name);
//     }
//   };

//   const handleFilePick = async () => {
//     try {
//       const file = await pick({
//         type: ['application/pdf'],
//       });
//       if (file) {
//         console.log('Selected file:', file);
//         // Handle the selected file (e.g., save it to state or upload it)
//       }
//     } catch (err) {
//       if (!pick.isCancel(err)) {
//         console.error('Error picking document:', err);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Uploaded Document</Text>

//       <TouchableOpacity
//         style={styles.previewBox}
//         onPress={file ? viewDocument : pickDocument}>
//         <Icon name="insert-drive-file" size={40} color="#777" />
//         <Text style={styles.previewText}>
//           {file ? file.name : 'Tap to upload / preview'}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={handleFilePick} style={styles.button}>
//         <Text style={styles.buttonText}>Pick a Document</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 15,
//     color: '#444',
//     marginBottom: 8,
//   },
//   previewBox: {
//     backgroundColor: '#F5F6FA',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: {width: 0, height: 1},
//     shadowRadius: 3,
//   },
//   previewText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#666',
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default DocumentPreviewer;


import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const DocumentPreviewer = () => {
  return (
    <View>
      <Text>DocumentPreviewer</Text>
    </View>
  )
}

export default DocumentPreviewer

const styles = StyleSheet.create({})