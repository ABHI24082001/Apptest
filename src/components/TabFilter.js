import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

const TabFilter = ({tabs, activeTab, setActiveTab}) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.value}
          style={[
            styles.tabButton,
            activeTab === tab.value && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab(tab.value)}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.value && styles.activeTabButtonText,
            ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#F0F2FF',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {backgroundColor: '#6D75FF'},
  tabButtonText: {fontSize: 14, fontWeight: '500', color: '#666'},
  activeTabButtonText: {color: '#FFF'},
});

export default TabFilter;
