import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Platform } from 'react-native';

const CustomDropdown = ({ label, items, onSelect, selectedValue, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Toggle the visibility of the dropdown modal
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // Handle item selection
  const handleSelect = (item) => {
    onSelect(item);
    toggleModal(); // Close the modal after selecting
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Display selected value or placeholder */}
      <TouchableOpacity style={styles.input} onPress={toggleModal}>
        <Text style={styles.inputText}>{selectedValue ? selectedValue : placeholder}</Text>
      </TouchableOpacity>

      {/* Modal for displaying dropdown items */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles for the dropdown component
const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: 300,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomDropdown;
