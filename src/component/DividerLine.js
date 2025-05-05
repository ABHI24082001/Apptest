import React from 'react';
import {View, StyleSheet} from 'react-native';

const DividerLine = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#d9d9d9',
    marginVertical: 3,
  },
});

export default DividerLine;
