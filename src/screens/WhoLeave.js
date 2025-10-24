import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import AppSafeArea from "../component/AppSafeArea";
import { Appbar } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import axiosInstance from '../utils/axiosInstance';
import {useAuth} from '../constants/AuthContext';

import useFetchEmployeeDetails from "../component/FetchEmployeeDetails";
import BASE_URL from '../constants/apiConfig';
const WhoLeave = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const employeeDetails = useFetchEmployeeDetails();
  console.log('Fetched employee details:', employeeDetails);
    const {user} = useAuth();
  
    console.log('User details:', user);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const companyId = user?.childCompanyId || 2;
        const branchId = user?.branchId || 20;
        const departmentId = user?.departmentId || 39;
        const employeeId = user?.id || 29;
        
        const url = `${BASE_URL}/CommonDashboard/GetLeaveApprovalDetails/${companyId}/${branchId}/${departmentId}/${employeeId}`;
        
        const response = await axiosInstance.get(url);
        
        // Transform the API data to match the expected format
        const transformedData = response.data.map(employee => ({
          ...employee,
          id: employee.employeeId.toString(),
          role: `${employee.designation}, ${employee.department}`
        }));
        
        setEmployees(transformedData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user]);

  const renderUserCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          {item.empImage ? (
            <Image 
              source={{ uri: `${BASE_URL}/uploads/employee/${item.empImage}` }} 
              style={styles.avatar} 
              defaultSource={require('../assets/image/woman.png')}
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
          ) : (
            <Image 
              source={{ uri: `https://avatar.iran.liara.run/public/26` }} 
              style={styles.avatar} 
            />
          )}
         
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>
              {item.designation}, {item.department}
            </Text>
          </View>
        </View>

        {/* Example status, you can replace with real API field later */}
        <View style={[styles.statusBadge, styles.leaveStatus]}>
          <Text style={styles.statusText}>On Leave</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.taskWrapper}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskLabel}>Assigned To:</Text>
          <Text style={styles.taskValue}>{item.assignedTo|| 'N/A'}</Text>
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
          title="Who is on Leave"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {loading ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Loading...
              </Text>
            ) : (
              <FlatList
                data={employees}
                keyExtractor={(item) => item.employeeId.toString()}
                renderItem={renderUserCard}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <MaterialIcon name="account-off" size={50} color="#E5E7EB" />
                    <Text style={styles.emptyStateText}>
                      No employees found
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Try again later
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  /* (keep your same styles here) */
  header: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    height: 50,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
