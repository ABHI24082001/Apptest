import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import AppSafeArea from "../component/AppSafeArea";
import { Appbar, Searchbar } from "react-native-paper";

import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';


const leaveUsers = [
  {
    id: "1",
    name: "Anjana Mishra",
    role: "HR, Management",
    image: require("../assets/image/woman.png"),
    assignTask: "Abhi",
    status: "On Leave",
  },
  {
    id: "2",
    name: "Jayanta Behera",
    role: "Backend Developer, IT",
    image: require("../assets/image/boy.png"),
    assignTask: "Abhi",
    status: "Working Remote",
  },
  {
    id: "3",
    name: "Abhispa Pathak",
    role: "Android Developer, IT",
    image: require("../assets/image/boy.png"),
    assignTask: "Abhi",
    status: "On Leave",
  },
  {
    id: "4",
    name: "Ansuman Samal",
    role: ".Net Developer, IT",
    image: require("../assets/image/boy.png"),
    assignTask: "Abhi",
    status: "Sick Leave",
  },
];

const WhoLeave = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const filteredUsers = leaveUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image source={item.image} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, 
          item.status === "On Leave" && styles.leaveStatus,
          item.status === "Working Remote" && styles.remoteStatus,
          item.status === "Sick Leave" && styles.sickStatus
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.taskWrapper}>
        <View style={styles.taskInfo}>
        
          <Text style={styles.taskLabel}>Assigned To:</Text>
          <Text style={styles.taskValue}>{item.assignTask}</Text>
        </View>
       
      </View>
    </View>
  );

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="#4B5563"
        />
        <Appbar.Content 
          title="Log Report" 
          titleStyle={styles.headerTitle} 
          
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            

         
    
            {/* Employee List */}
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderUserCard}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MaterialIcon name="search" size={50} color="#E5E7EB" />
                  <Text style={styles.emptyStateText}>No employees found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search or filter
                  </Text>
                </View>
              }
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    height: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#111827",
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  branchFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  branchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginRight: 8,
  },
  branchSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  branchText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 4,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 25,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leaveStatus: {
    backgroundColor: "#FEF3F2",
  },
  remoteStatus: {
    backgroundColor: "#F0F9FF",
  },
  sickStatus: {
    backgroundColor: "#FFFBEB",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  taskWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    marginRight: 4,
  },
  taskValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#D1D5DB",
    marginTop: 4,
  },
});

export default WhoLeave;