// // utils/encryption.js
// import AES from 'react-native-aes-crypto';

// const key = '1234567890123456'; // 16 chars
// const iv  = '6543210987654321'; // 16 chars

// console.log('AES Key length:', key.length); // should print 16
// console.log('AES IV length: ', iv.length);  // should print 16

// export async function encrypt(text) {
//   try {
//     debugger
//     const cipher = await AES.encrypt(text, key, iv, 'aes-128-cbc');
//     console.log(`encrypt("${text}") →`, cipher);  // ← debug output
//     return cipher;
//   } catch (e) {
//     console.error('Encryption error:', e);
//     throw e;
//   }
// }


import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const encryption = () => {
  return (
    <View>
      <Text>encryption</Text>
    </View>
  )
}

export default encryption

const styles = StyleSheet.create({})
