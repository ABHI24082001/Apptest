import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AppSafeArea from "../component/AppSafeArea";
import { Appbar } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import axiosInstance from '../utils/axiosInstance';
import {useAuth} from '../constants/AuthContext';
import styles from "../Stylesheet/WhoLeave";
import BASE_URL from '../constants/apiConfig';

const WhoLeave = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const companyId = user?.childCompanyId || 2;
        const branchId = user?.branchId || 20;
        const departmentId = user?.departmentId || 39;
        const employeeId = user?.id || 29;
        
        const url = `${BASE_URL}/CommonDashboard/GetLeaveApprovalDetails/${companyId}/${branchId}/${departmentId}/${employeeId}`;
        const response = await axiosInstance.get(url);

        console.log(response,'.]df][')
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
          <Image 
            source={
              item.empImage 
                ? { uri: `${BASE_URL}/uploads/employee/${item.empImage}` }
                : { uri: `https://avatar.iran.liara.run/public/26` }
            } 
            style={styles.avatar} 
            defaultSource={require('../assets/image/woman.png')}
          />
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>
              {item.designation}, {item.department}
            </Text>
          </View>
        </View>
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
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#4B5563" />
        <Appbar.Content title="Who is on Leave" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {loading ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
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
                    <Text style={styles.emptyStateText}>No employees found</Text>
                    <Text style={styles.emptyStateSubtext}>Try again later</Text>
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

export default WhoLeave;
