// components/Dropdown.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Dropdown = ({
  data = [],
  onSelect,
  selectedItem,
  placeholder = 'Select an option',
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState(null);
  const buttonRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  const openDropdown = () => {
    if (disabled) return;

    buttonRef.current.measure((fx, fy, width, height, px, py) => {
      setButtonLayout({
        width,
        top: py + height + (Platform.OS === 'ios' ? 4 : 0),
        left: px,
      });
      setVisible(true);
    });
  };

  const closeDropdown = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleSelect = item => {
    onSelect(item);
    closeDropdown();
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedItem?.value === item.value && styles.selectedItem,
      ]}
      onPress={() => handleSelect(item)}>
      <Text
        style={[
          styles.itemText,
          selectedItem?.value === item.value && styles.selectedItemText,
        ]}>
        {item.label || item.toString()}
      </Text>
      {selectedItem?.value === item.value && (
        <Icon name="check" size={20} color="#4a90e2" style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.dropdownButton,
          disabled && styles.disabledButton,
          visible && styles.dropdownButtonActive,
        ]}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled}>
        <Text
          style={[
            styles.dropdownButtonText,
            !selectedItem && styles.placeholderText,
            disabled && styles.disabledText,
          ]}>
          {selectedItem?.label || placeholder}
        </Text>
        <Icon
          name={visible ? 'arrow-drop-up' : 'arrow-drop-down'}
          size={24}
          color={disabled ? '#aaa' : '#555'}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}>
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.dropdownContainer,
            buttonLayout && {
              top: buttonLayout.top,
              left: buttonLayout.left,
              width: buttonLayout.width,
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="always"
          />
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dropdownButtonActive: {
    borderColor: '#4a90e2',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  disabledText: {
    color: '#aaa',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.4,
    zIndex: 999,
  },
  listContent: {
    paddingVertical: 8,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItem: {
    backgroundColor: '#f5f9ff',
  },
  selectedItemText: {
    color: '#4a90e2',
    fontWeight: '500',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
});

export default Dropdown;
