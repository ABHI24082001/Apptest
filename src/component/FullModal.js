import React, { useEffect, useState } from 'react';
import {
  Modal,
  ActivityIndicator,
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { TextInput } from 'react-native-paper';  // React Native Paper TextInput
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { COLORS, height, width } from '../../styles';

const ModalComponent = ({
  fullModalVisible,
  setFullModalVisible,
  data,
  OnSelect,
  isValidating,
}) => {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = searchQuery
    ? data?.filter(item =>
        item?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  useEffect(() => {
    setSearchQuery('');
  }, [data?.length, isFocused]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={fullModalVisible}
      onRequestClose={() => {
        setFullModalVisible(!fullModalVisible);
        setSearchQuery('');
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TextInput
              label="Search for result"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.input}
              mode="outlined"
            />
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setFullModalVisible(!fullModalVisible);
              }}>
              <Ionicons name="close" size={25} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          {isValidating ? (
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredData}
              contentContainerStyle={styles.flatListContainer}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    OnSelect(item);
                    setSearchQuery('');
                  }}>
                  <Text style={styles.itemText}>{`${index + 1}. ${item?.title}`}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={
                !isValidating && <Text>No Data Found</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalComponent;

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background overlay
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    width: width * 0.9,
    borderRadius: 10,
    padding: 20,
    zIndex: 1000,  // Ensure it's on top of other elements
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  flatListContainer: {
    paddingBottom: '80%',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  itemText: {
    fontWeight: 'medium',
    fontSize: 14,
  },
});
