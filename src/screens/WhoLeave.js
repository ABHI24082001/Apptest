import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderWithSearchAndAddButton from '../component/HeaderWithSearchAndAddButton';
import AppSafeArea from '../component/AppSafeArea';

const branches = ['Noida', 'Delhi', 'Mumbai', 'Bhubaneswar', 'Kolkata'];

const leaveUsers = [
  {
    id: '1',
    name: 'Anjana Mishra',
    role: 'HR, Management',
    image: require('../assets/image/woman.png'),
  },
  {
    id: '2',
    name: 'Jayanta Behera',
    role: 'Backend Developer, IT',
    image: require('../assets/image/boy.png'),
  },
  {
    id: '3',
    name: 'Abhispa Pathak',
    role: 'Android Developer, IT',
    image: require('../assets/image/boy.png'),
  },
  {
    id: '4',
    name: 'Ansuman Samal',
    role: '.Net Developer, IT',
    image: require('../assets/image/boy.png'),
  },
];

const WhoLeave = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  const filteredUsers = leaveUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackPress = () => navigation.goBack();

  const renderUserCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.avatar} />
      <View>
        <Text style={styles.role}>{item.role}</Text>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <AppSafeArea>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <HeaderWithSearchAndAddButton
              title="Who is on Leave"
              onBackPress={handleBackPress}
              showSearch={false}
              showAdd={false}
            />

            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Icon name="search-outline" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                placeholder="Search by name or role"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor="#999"
              />
            </View>

            {/* Branch Picker */}
            <Text style={styles.label}>Branch</Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={setSelectedBranch}
                items={branches.map(branch => ({ label: branch, value: branch }))}
                value={selectedBranch}
                useNativeAndroidPickerStyle={false}
                style={pickerSelectStyles}
                Icon={() => <Icon name="chevron-down-outline" size={20} color="#333" />}
                placeholder={{}}
              />
            </View>

            {/* Employee List */}
            <Text style={styles.label}>Employees</Text>
            <FlatList
              data={filteredUsers}
              keyExtractor={item => item.id}
              renderItem={renderUserCard}
              contentContainerStyle={styles.list}
              scrollEnabled={false}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 16,
    fontSize: 16,
    color: '#222',
  },
  pickerContainer: {
    marginHorizontal: 16,
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 25,
  },
  role: {
    fontWeight: '600',
    fontSize: 15,
    color: '#111',
  },
  name: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#333',
    backgroundColor: '#f1f3f4',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#333',
    backgroundColor: '#f1f3f4',
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 15 : 12,
    right: 10,
  },
});

export default WhoLeave;
