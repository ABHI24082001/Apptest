// MainScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import HeaderWithSearchAndAddButton from '../component/HeaderWithSearchAndAddButton'; // Adjust the import path

const MyExpenses = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddPress = () => {
    console.log('Add button pressed');
    // Handle Add action here
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleBackPress = () => {
    console.log('Back button pressed');
    // You can navigate back here if using a navigation library like React Navigation
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <HeaderWithSearchAndAddButton
        title="My Expenses"
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddPress={handleAddPress}
        onBackPress={handleBackPress}
      />
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text>Main content goes here!</Text>
        {/* Your other screen content */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default MyExpenses;
