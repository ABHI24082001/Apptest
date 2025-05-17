import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons for arrows

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 1 && styles.disabled]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        activeOpacity={0.7}
      >
        <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#aaa' : 'white'} />
        <Text style={[styles.buttonText, currentPage === 1 && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageInfo}>
        Page <Text style={styles.currentPage}>{currentPage}</Text> of <Text style={styles.totalPages}>{totalPages}</Text>
      </Text>

      <TouchableOpacity
        style={[styles.button, currentPage === totalPages && styles.disabled]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, currentPage === totalPages && styles.disabledText]}>
          Next
        </Text>
        <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#aaa' : 'white'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D75FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabled: {
    backgroundColor: '#ddd',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledText: {
    color: '#999',
  },
  pageInfo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  currentPage: {
    color: '#6D75FF',
  },
  totalPages: {
    color: '#888',
  },
});

export default Pagination;
