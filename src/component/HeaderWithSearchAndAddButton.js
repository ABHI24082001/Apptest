import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HeaderWithSearchAndAddButton = ({
  title,
  onAddPress,
  onBackPress,
  searchQuery,
  onSearchChange,
  showSearch = true,  // Toggle search visibility (default is true)
  showAdd = true,     // Toggle add button visibility (default is true)
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const handleSearchToggle = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(animation, {
      toValue: isSearchVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <Appbar.Header style={styles.header}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Icon
              name={Platform.OS === 'ios' ? 'arrow-back' : 'arrow-back'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        )}

        {/* Title */}
        <Appbar.Content
          title={title}
          style={styles.title}
          titleStyle={styles.titleText}
        />

        {/* Add Button */}
        {showAdd && (
          <TouchableOpacity
            style={[styles.addButton, isSearchVisible && styles.addButtonActive]}
            onPress={onAddPress}>
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* Search Toggle Button */}
        {showSearch && (
          <TouchableOpacity
            style={styles.searchToggleButton}
            onPress={handleSearchToggle}>
            <Icon
              name={isSearchVisible ? 'close' : 'search'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        )}
      </Appbar.Header>

      {/* Search Input - Appears below header */}
      {isSearchVisible && (
        <Animated.View style={[styles.searchContainer, {opacity: animation}]}>
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search"
            style={styles.searchInput}
            autoFocus={true}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    height: Platform.OS === 'ios' ? 56 : 46,
    justifyContent: 'space-between', // Ensures proper spacing between elements
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: Platform.OS === 'ios' ? 20 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    fontStyle: 'normal',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  addButton: {
    width: 35,
    height: 35,
    backgroundColor: '#007bff',
    borderRadius: 35 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonActive: {
    backgroundColor: '#ff5722',
  },
  searchToggleButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeaderWithSearchAndAddButton;
