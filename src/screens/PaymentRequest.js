import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Appbar} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import RNPickerSelect from 'react-native-picker-select';
import {pick} from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm, Controller} from 'react-hook-form';
import useFetchEmployeeDetails from '../components/FetchEmployeeDetails';
import axiosinstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../constants/apiConfig';
const PaymentRequest = ({navigation, route}) => {
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseItems, setExpenseItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]); // New state for payment details
  const [isDateSelected, setIsDateSelected] = useState(false); // New state
  // Extract data passed via route.params
  const expenceData = route?.params?.expence || null;
  console.log('PaymentRequest Routes:', expenceData);

  const employeeDetails = useFetchEmployeeDetails();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      RequestTypeId: 1,
      requestType: 'expense',
      EmployeeId: employeeDetails?.id || 0,
      projectName: '',
      expenseHead: '',
      amount: '',
      paymentTitle: '',
      remarks: '',
      date: new Date(),
      CreatedDate: employeeDetails?.createdDate
        ? new Date(employeeDetails.createdDate)
        : new Date(),
      ModifiedBy: employeeDetails?.id ?? '',
      ModifiedDate: new Date(),
      CreatedBy: employeeDetails?.id ?? '',
    },
  });

  // Initialize form with edit data if available
  useEffect(() => {
    if (expenceData) {
      // Set the request type
      setValue(
        'requestType',
        expenceData.requestType?.toLowerCase() || 'expense',
      );
      setValue(
        'RequestTypeId',
        expenceData.requestType?.toLowerCase() === 'advance' ? 2 : 1,
      );

      // Set remarks if available
      if (expenceData.remarks) {
        setValue('remarks', expenceData.remarks);
        console.log('Setting remarks:', expenceData.remarks);
      }

      // Set total amount
      if (expenceData.totalAmount) {
        setTotalAmount(parseFloat(expenceData.totalAmount) || 0);
        setValue('amount', expenceData.totalAmount.toString());
      }

      // Update UI to show we're in edit mode
      navigation.setOptions({
        headerTitle: `Edit ${expenceData.requestType || 'Payment'} Request`,
      });
    }
  }, [expenceData, setValue, navigation]);

  // Watch the requestType value
  const requestType = watch('requestType');

  // Calculate total amount whenever expenseItems change
  useEffect(() => {
    const sum = expenseItems.reduce(
      (total, item) => total + parseFloat(item.amount || 0),
      0,
    );
    setTotalAmount(sum);
  }, [expenseItems]);

  useEffect(() => {
    if (requestType === 'expense' || expenseItems.length > 0) {
      // If we have expense items, force requestType to be 'expense'
      if (expenseItems.length > 0 && requestType !== 'expense') {
        setValue('requestType', 'expense');
        setValue('RequestTypeId', 1);
        console.log('Forced request type to expense because items exist');
      }
    }
  }, [requestType, expenseItems.length, setValue]);

  // Clear expense items when switching to Advance mode - add confirmation
  useEffect(() => {
    if (requestType === 'advance' && expenseItems.length > 0) {
      Alert.alert(
        'Change Request Type',
        'Switching to Advance will clear your expense items. Continue?',
        [
          {
            text: 'Cancel',
            onPress: () => {
              setValue('requestType', 'expense');
              setValue('RequestTypeId', 1);
            },
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: async () => {
              setExpenseItems([]);
              try {
                await AsyncStorage.removeItem('stored_expense_items');
                console.log('Cleared expense items due to type change');
              } catch (error) {
                console.error('Error clearing stored expense items:', error);
              }
            },
          },
        ],
      );
    }
  }, [requestType, expenseItems.length, setValue]);

  // Reset modal form when opening
  const openAddExpenseModal = () => {
    reset({
      expenseHead: '',
      paymentTitle: '',
      amount: '',
      projectName: watch('projectName'),
    });
    setEditingItemId(null);
    setIsModalVisible(true);
  };
  function generatePdfFileName() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `leave_${pad(now.getDate())}${pad(
      now.getMonth() + 1,
    )}${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds(),
    )}.pdf`;
  }

  // Document picker handler
  const handleDocumentPick = async () => {
    try {
      const res = await pick({
        mode: 'open',
        allowMultiSelection: false,
        type: ['application/pdf', 'image/jpeg', 'image/png'], // Support PDF and images
      });

      if (res && res.length > 0) {
        const file = res[0];
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size should be less than 5MB');
          return;
        }

        const fileName = file.name || generatePdfFileName(); // Use file name or generate one
        setUploadedFile({
          name: fileName,
          uri: file.uri,
          type: file.type,
        });
        setValue('DocumentPath', fileName); // Update form value
        Alert.alert('File Selected', `File will be saved as: ${fileName}`);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Error selecting file:', err);
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  // Fetch expense head list
  useEffect(() => {
    const fetchExpenseHeads = async () => {
      try {
        const response = await axiosinstance.get(
          `${BASE_URL}/ExpHeadMaster/GetExpenseHeadList/${employeeDetails?.childCompanyId}`,
        );
        setExpenseHeads(
          response.data.map(head => ({
            id: head.id,
            name: head.expenseHead, // Map the correct property
          })),
        );
      } catch (error) {
        console.error('Error fetching expense heads:', error);
      }
    };

    if (employeeDetails?.childCompanyId) {
      fetchExpenseHeads();
    }
  }, [employeeDetails]);

  // Add expense item handler
  const handleAddExpense = () => {
    const data = getValues();

    // Validate required fields
    if (!data.expenseHead) {
      Alert.alert('Error', 'Expense Head is required');
      return;
    }

    if (!data.amount) {
      Alert.alert('Error', 'Amount is required');
      return;
    }

    if (!data.date) {
      Alert.alert('Error', 'Transaction Date is required');
      return;
    }

    // Validate amount format
    if (!/^[0-9]*(\.[0-9]{0,2})?$/.test(data.amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const selectedExpenseHead = expenseHeads.find(
      head => head.name === data.expenseHead,
    );

    if (editingItemId) {
      // Update existing item
      setExpenseItems(
        expenseItems.map(item =>
          item.id === editingItemId
            ? {
                ...item,
                headId: selectedExpenseHead?.id,
                head: data.expenseHead,
                project: data.projectName,
                title: data.paymentTitle,
                amount: data.amount,
                date: data.date,
                document: uploadedFile || item.document,
              }
            : item,
        ),
      );
    } else {
      // Add new item
      const newItem = {
        id: Date.now().toString(),
        headId: selectedExpenseHead?.id,
        head: data.expenseHead,
        project: data.projectName,
        title: data.paymentTitle,
        amount: data.amount,
        date: data.date,
        document: uploadedFile,
      };
      setExpenseItems([...expenseItems, newItem]);
      console.log('Added Expense Item:', newItem); // Debugging added item
    }

    setIsModalVisible(false);
    setUploadedFile(null);
    reset({
      ...data,
      expenseHead: '',
      paymentTitle: '',
      amount: '',
    });
  };

  // Delete expense item handler
  const handleDeleteExpense = id => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () =>
            setExpenseItems(expenseItems.filter(item => item.id !== id)),
          style: 'destructive',
        },
      ],
    );
  };

  function formatDateForBackend(date) {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }
  // Submit form handler
  const onSubmit = async data => {
    try {
      const isEditing = !!expenceData?.requestId;
      // Always determine request type and RequestTypeId from the picker value
      const reqType = (data.requestType || '').toLowerCase();
      const requestTypeId = reqType === 'advance' ? 2 : 1; // 1: Expense, 2: Advance

      if (reqType === 'advance') {
        const formData = {
          PaymentRequest: {
            RequestId: isEditing ? expenceData.requestId : 0,
            RequestTypeId: 2, // Always 2 for advance
            EmployeeId: employeeDetails?.id,
            ProjectId: null,
            ReportingMgrId: employeeDetails?.reportingEmpId,
            TotalAmount: totalAmount,
            CompanyId: employeeDetails?.childCompanyId,
            Status: 'Pending',
            Remarks: data.remarks,
            IsDelete: 0,
            Flag: 1,
            CreatedBy: employeeDetails?.id ?? 0,
            CreatedDate: isEditing
              ? expenceData?.createdDate
              : formatDateForBackend(new Date()),
            ModifiedBy: employeeDetails?.id ?? 0,
            ModifiedDate: formatDateForBackend(new Date()),
          },
          tempPayments: [],
        };

        console.log(
          `${isEditing ? 'Updating' : 'Submitting'} Advance Form Data:`,
          formData,
        );

        const response = await axiosinstance.post(
          `${BASE_URL}/PaymentAdvanceRequest/SaveAndUpdatePaymentAdvanceRequest`,
          formData,
        );

        console.log('API Response:', response.data);
        Alert.alert(
          'Success',
          isEditing
            ? 'Advance request updated successfully'
            : 'Advance request submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Main'),
            },
          ],
        );
        reset();
        setTotalAmount(0);
        setUploadedFile(null);
        try {
          await AsyncStorage.removeItem('stored_expense_items');
        } catch (error) {
          console.error('Error clearing stored expense items:', error);
        }
      } else if (reqType === 'expense') {
        if (!isEditing && expenseItems.length === 0) {
          Alert.alert('Error', 'Please add at least one expense item');
          return;
        }
        if (!data.remarks) {
          Alert.alert('Error', 'Please provide remarks');
          return;
        }
        const formData = {
          PaymentRequest: {
            RequestId: isEditing ? expenceData.requestId : 0,
            RequestTypeId: 1, // Always 1 for expense
            EmployeeId: employeeDetails?.id,
            ProjectId: null,
            ReportingMgrId: employeeDetails?.reportingEmpId,
            TotalAmount: totalAmount,
            CompanyId: employeeDetails?.childCompanyId,
            Status: 'Pending',
            Remarks: data.remarks,
            IsDelete: 0,
            Flag: 1,
            CreatedBy: employeeDetails?.id ?? 0,
            CreatedDate: isEditing
              ? expenceData?.createdDate
              : formatDateForBackend(new Date()),
            ModifiedBy: employeeDetails?.id ?? 0,
            ModifiedDate: formatDateForBackend(new Date()),
          },
          tempPayments: expenseItems.map(item => ({
            Id: isEditing ? item.id : 0,
            TransactionDate: formatDateForBackend(item.date),
            ExpenseHeadId: item.headId,
            ExpenseHead: item.head,
            Amount: parseFloat(item.amount),
            ApprovedAmount: 0,
            RequestType: 1, // Always 1 for expense
            DocumentPath: item.document?.uri || null,
          })),
        };

        console.log(
          `${isEditing ? 'Updating' : 'Submitting'} Expense Form Data:`,
          formData,
        );

        const response = await axiosinstance.post(
          `${BASE_URL}/PaymentAdvanceRequest/SaveAndUpdatePaymentAdvanceRequest`,
          formData,
        );

        console.log('API Response:', response.data);
        Alert.alert(
          'Success',
          isEditing
            ? 'Expense request updated successfully'
            : 'Expense request submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Main'),
            },
          ],
        );
        reset();
        setExpenseItems([]);
        setUploadedFile(null);
        try {
          await AsyncStorage.removeItem('stored_expense_items');
        } catch (error) {
          console.error('Error clearing stored expense items:', error);
        }
      }
    } catch (error) {
      console.error('Error submitting request:', error);

      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
      }

      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = amount => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  // Format date
  const formatDate = date => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  };

  // Extract data passed via route.params
  const paymentData = route?.params?.paymentData || null;

  // Log the passed data for debugging
  useEffect(() => {
    if (paymentData) {
      console.log('Received Payment Data:', paymentData);
    }
  }, [paymentData]);
  // debugger
  // Fetch expense details if editing an existing request
  useEffect(() => {
    const fetchExpenseDetails = async () => {
      if (expenceData?.requestId && expenceData?.companyId) {
        try {
          const response = await axiosinstance.get(
            `${BASE_URL}/PaymentAdvanceRequest/GetPaymentAdvanveDetailsRequest/${expenceData.companyId}/${expenceData.requestId}`,
          );

          const expenseDetails = response.data;

          console.log('Fetched sdddddddddddddddddd Details:', expenseDetails);

          // Populate form fields with fetched data
          if (expenseDetails?.remarks) {
            console.log('Setting remarks:', expenseDetails.remarks);
            setValue('remarks', expenseDetails.remarks);
          }

          if (expenseDetails?.totalAmount) {
            const amount = parseFloat(expenseDetails.totalAmount) || 0;
            console.log('Setting total amount:', amount);
            setValue('amount', amount.toString());
            setTotalAmount(amount);
          }

          // Display success message with details
          if (expenseDetails) {
            // setFeedbackVisible(true);
            // setFeedbackType('info');
            // setFeedbackMessage(`Loaded request: ${expenceData.requestType} - ₹${expenseDetails.totalAmount}`);

            // Show a summary of the loaded request
            setTimeout(() => {
              // setFeedbackVisible(false);
            }, 2000);
          }

          // Populate expense items if available
          if (expenseDetails?.tempPayments) {
            setExpenseItems(
              expenseDetails.tempPayments.map(item => ({
                id: item.id || Date.now().toString(),
                headId: item.expenseHeadId,
                head: item.expenseHead,
                project: item.projectName,
                title: item.paymentTitle,
                amount: item.amount,
                date: new Date(item.transactionDate),
                document: item.documentPath
                  ? {
                      uri: item.documentPath,
                      name: item.documentPath.split('/').pop(),
                    }
                  : null,
              })),
            );
          }

          // Set paymentDetails for UI display
          if (expenseDetails?.paymentDetails) {
            setPaymentDetails(expenseDetails.paymentDetails);
          } else {
            setPaymentDetails([]);
          }
        } catch (error) {
          console.error('Error fetching expense details:', error);

          if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
          }

          Alert.alert(
            'Error',
            'Failed to fetch expense details. Please try again.',
          );
        }
      }
    };

    fetchExpenseDetails();
  }, [expenceData, setValue]);

  // Enhance the UI when in edit mode
  useEffect(() => {
    if (expenceData) {
      // Set the request type
      setValue(
        'requestType',
        expenceData.requestType?.toLowerCase() || 'expense',
      );
      setValue(
        'RequestTypeId',
        expenceData.requestType?.toLowerCase() === 'advance' ? 2 : 1,
      );

      // Set remarks if available
      if (expenceData.remarks) {
        setValue('remarks', expenceData.remarks);
        console.log('Setting remarks:', expenceData.remarks);
      }

      // Set total amount
      if (expenceData.totalAmount) {
        setTotalAmount(parseFloat(expenceData.totalAmount) || 0);
        setValue('amount', expenceData.totalAmount.toString());
      }

      // Update UI to show we're in edit mode
      navigation.setOptions({
        headerTitle: `Edit ${expenceData.requestType || 'Payment'} Request`,
      });
    }
  }, [expenceData, setValue, navigation]);

  // Add a function to handle item selection for editing

  // Conditional rendering based on request type
  return (
    <AppSafeArea>
      {/* Feedback Modal removed */}
      {/* <FeedbackModal ... /> */}
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.navigate('Main')} />
        <Appbar.Content
          title={
            expenceData
              ? `Edit ${expenceData.requestType || 'Payment'} Request`
              : 'Payment Request'
          }
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Icon name="credit-card-outline" size={40} color="#10B981" />
          <Text style={styles.headerText}>
            {expenceData ? 'Edit Payment Request' : 'Payment Request'}
          </Text>
          <Text style={styles.subHeaderText}>
            {expenceData
              ? 'Update the details of your payment request'
              : 'Please fill in the details below to submit your payment request'}
          </Text>
        </View>

        <Text style={styles.label}>
          Request Type <Text style={styles.required}>*</Text>
          {errors.requestType && (
            <Text style={styles.errorText}> {errors.requestType.message}</Text>
          )}
        </Text>
        <Controller
          control={control}
          name="requestType"
          rules={{required: 'Request type is required'}}
          render={({field: {onChange, value}}) => (
            <RNPickerSelect
              onValueChange={selectedValue => {
                // Only allow changing to advance if no expense items exist
                if (selectedValue === 'advance' && expenseItems.length > 0) {
                  Alert.alert(
                    'Cannot Change Request Type',
                    'You have expense items added. Please remove all expense items before changing to Advance request type.',
                    [{text: 'OK'}],
                  );
                  return;
                }

                // Otherwise allow the change
                onChange(selectedValue);
                setValue('RequestTypeId', selectedValue === 'expense' ? 1 : 2);
                console.log('Request type changed to:', selectedValue);
              }}
              value={value}
              disabled={
                !!expenceData ||
                (value === 'expense' && expenseItems.length > 0)
              } // Disable when editing or has items
              placeholder={{label: 'Select Request Type', value: null}}
              items={[
                {label: 'Expense', value: 'expense'},
                {label: 'Advance', value: 'advance'},
              ]}
              style={{
                ...pickerSelectStyles,
                inputIOS: {
                  ...pickerSelectStyles.inputIOS,
                  color:
                    expenceData ||
                    (value === 'expense' && expenseItems.length > 0)
                      ? '#666'
                      : '#000',
                },
                inputAndroid: {
                  ...pickerSelectStyles.inputAndroid,
                  color:
                    expenceData ||
                    (value === 'expense' && expenseItems.length > 0)
                      ? '#666'
                      : '#000',
                },
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
            />
          )}
        />

        {/* Expense Items Section - Always show when request type is expense */}
        {requestType === 'expense' && (
          <View style={styles.expenseSection}>
            <View style={styles.expenseSectionHeader}>
              <Text style={styles.expenseSectionTitle}>
                {expenceData ? 'Edit Expense Items' : 'Expense Items'}
              </Text>
              {expenseItems.length > 0 && !expenceData && (
                <Text style={styles.itemsCountBadge}>
                  {expenseItems.length}{' '}
                  {expenseItems.length === 1 ? 'Item' : 'Items'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={openAddExpenseModal}
              disabled={!!expenceData} // Disable add button in edit mode
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.addBtnText}>
                {expenceData ? 'Add' : 'Add Expense'}
              </Text>
            </TouchableOpacity>

            {/* Show paymentDetails in edit mode */}
            {expenceData && paymentDetails && paymentDetails.length > 0 ? (
              <View style={{marginTop: 16}}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 16, marginBottom: 8}}>
                  Payment Details
                </Text>
                <View style={styles.gridContainer}>
                  <View style={styles.gridHeader}>
                    <Text style={styles.gridHeaderText}>Date</Text>
                    <Text style={styles.gridHeaderText}>Expense Head</Text>
                    <Text style={styles.gridHeaderText}>Amount</Text>
                    <Text style={styles.gridHeaderText}>Document</Text>
                    <Text style={styles.gridHeaderText}>Remarks</Text>
                    <Text style={styles.gridHeaderText}>Actions</Text>
                  </View>
                  {paymentDetails.map(item => (
                    
                    <View key={item.id} style={styles.gridRow}>
                      <Text style={styles.gridCell}>
                        {item.transactionDate
                          ? new Date(item.transactionDate).toLocaleDateString()
                          : '—'}
                      </Text>
                      <Text style={styles.gridCell}>{item.expenseHead || '—'}</Text>
                      <Text style={styles.gridCell}>
                        ₹{formatCurrency(item.amount)}
                      </Text>
                      <View style={styles.gridCell}>
                        {item.documentPath ? (
                          <Icon
                            name="file-check-outline"
                            size={20}
                            color="#10B981"
                          />
                        ) : (
                          <Icon
                            name="file-remove-outline"
                            size={20}
                            color="#EF4444"
                          />
                        )}
                      </View>
                      <Text style={styles.gridCell}>{item.remark || '—'}</Text>
                      <View style={[styles.gridCell, styles.actionsCell]}>
                        <TouchableOpacity
                          style={styles.gridActionBtn}
                          onPress={() => {
                            Alert.alert(
                              'Delete Payment Detail',
                              'Are you sure you want to delete this payment detail?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () => {
                                    // Remove from paymentDetails state
                                    setPaymentDetails(prev =>
                                      prev.filter(detail => detail.id !== item.id)
                                    );
                                  },
                                },
                              ]
                            );
                          }}>
                          <Icon name="trash-can" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              // Show the normal expense items grid for new requests
              expenseItems.length > 0 && (
                <View style={styles.gridContainer}>
                  {/* Grid Header */}
                  <View style={styles.gridHeader}>
                    <Text style={styles.gridHeaderText}>Date</Text>
                    <Text style={styles.gridHeaderText}>Expense Head</Text>
                    <Text style={styles.gridHeaderText}>Title</Text>
                    <Text style={styles.gridHeaderText}>Amount</Text>
                    <Text style={styles.gridHeaderText}>Document</Text>
                    <Text style={styles.gridHeaderText}>Actions</Text>
                  </View>

                  {/* Grid Rows */}
                  {expenseItems.map(item => (
                    <View key={item.id} style={styles.gridRow}>
                      <Text style={styles.gridCell}>
                        {formatDate(item.date)}
                      </Text>
                      <Text style={styles.gridCell}>{item.head}</Text>
                      <Text style={styles.gridCell}>{item.title || '—'}</Text>
                      <Text style={styles.gridCell}>
                        ₹{formatCurrency(item.amount)}
                      </Text>
                      <View style={styles.gridCell}>
                        {item.document ? (
                          <Icon
                            name="file-check-outline"
                            size={20}
                            color="#10B981"
                          />
                        ) : (
                          <Icon
                            name="file-remove-outline"
                            size={20}
                            color="#EF4444"
                          />
                        )}
                      </View>
                      <View style={[styles.gridCell, styles.actionsCell]}>
                        <TouchableOpacity
                          style={styles.gridActionBtn}
                          onPress={() => handleDeleteExpense(item.id)}>
                          <Icon name="trash-can" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>
        )}

        {/* Total Amount Input Field */}
        <View style={styles.totalAmountContainer}>
          <Text style={styles.label}>Total Amount</Text>
          {/* <TextInput
            value={
              requestType === 'advance'
                ? totalAmount.toString()
                : `₹${totalAmount}`
            }
            editable={requestType === 'advance' && !expenceData?.status?.toLowerCase()?.includes('approved')} 
            onChangeText={value => {
              if (requestType === 'advance') {
                // const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
                setTotalAmount(value);
              }
            }}
            style={[
              styles.input, 
              styles.totalAmountInput,
              {color: '#000'} // Ensure text is visible
            ]}
            keyboardType="numeric"
          /> */}

          <TextInput
            value={
              requestType === 'advance'
                ? totalAmount.toString()
                : `₹${totalAmount}`
            }
            placeholder={
              requestType === 'advance'
                ? 'Enter advance amount'
                : 'Total amount (auto-calculated)'
            }
            editable={
              requestType === 'advance' &&
              !expenceData?.status?.toLowerCase()?.includes('approved')
            }
            onChangeText={value => {
              if (requestType === 'advance') {
                setTotalAmount(value);
              }
            }}
            style={[
              styles.input,
              styles.totalAmountInput,
              {color: '#000'}, // Ensure text is visible
            ]}
            keyboardType="numeric"
          />
        </View>

        {/* Remarks */}
        <Text style={styles.label}>
          Remarks <Text style={styles.required}>*</Text>
          {errors.remarks && (
            <Text style={styles.errorText}> {errors.remarks.message}</Text>
          )}
        </Text>
        <Controller
          control={control}
          name="remarks"
          rules={{required: 'Remarks are required'}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Add Remarks"
              multiline
              style={[
                styles.input,
                {height: 100, textAlignVertical: 'top'},
                errors.remarks && styles.errorInput,
              ]}
            />
          )}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            expenceData && {backgroundColor: '#0891B2'},
          ]}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitText}>
            {expenceData ? 'Update' : 'Submit'}
          </Text>
        </TouchableOpacity>

        {/* Show a Cancel button when editing */}
        {expenceData && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItemId ? 'Edit Expense' : 'Add New Expense'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Transaction Date */}
              <Text style={styles.label}>
                Transaction Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => setOpenDatePicker(true)}>
                <Text
                  style={[styles.dateText, !isDateSelected && {color: '#aaa'}]}>
                  {isDateSelected ? date.toDateString() : 'Select Date'}
                </Text>
                <Icon name="calendar-month-outline" size={22} color="#555" />
              </TouchableOpacity>

              <DatePicker
                modal
                open={openDatePicker}
                date={date}
                mode="date"
                onConfirm={selectedDate => {
                  setOpenDatePicker(false);
                  setDate(selectedDate);
                  setIsDateSelected(true);
                  setValue('date', selectedDate);
                }}
                onCancel={() => setOpenDatePicker(false)}
              />

             

              {/* Expense Head */}
              <Text style={styles.label}>
                Expense Head <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="expenseHead"
                rules={{required: 'Expense head is required'}}
                render={({field: {onChange, value}}) => (
                  <RNPickerSelect
                    onValueChange={onChange}
                    value={value}
                    placeholder={{label: 'Select Expense Head', value: null}}
                    items={expenseHeads.map(head => ({
                      label: head.name,
                      value: head.name,
                    }))}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => (
                      <Icon name="chevron-down" size={20} color="#555" />
                    )}
                  />
                )}
              />

              {/* Payment Title */}
              <Text style={styles.label}>Transaction Details</Text>
              <Controller
                control={control}
                name="paymentTitle"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter Transaction Details"
                    style={styles.input}
                  />
                )}
              />

              {/* Amount */}
              <Text style={styles.label}>
                Amount <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="amount"
                rules={{
                  required: 'Amount is required',
                  pattern: {
                    value: /^[0-9]*(\.[0-9]{0,2})?$/,
                    message: 'Please enter a valid amount',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter Amount"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                )}
              />

              {/* Upload Document */}
              <Text style={styles.label}>Upload Document</Text>
              <TouchableOpacity style={styles.uploadBox}>
                {uploadedFile ? (
                  <View style={styles.uploadedFileContainer}>
                    <Icon name="file-pdf-box" size={24} color="#E11D48" />
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {uploadedFile.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setUploadedFile(null);
                        setValue('DocumentPath', ''); // Clear form value
                      }}
                      style={styles.removeFileBtn}>
                      <Icon name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <TouchableOpacity
                      onPress={handleDocumentPick}
                      style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon name="upload" size={24} color="#999" />
                      <Text style={styles.uploadPlaceholderText}>
                        Choose PDF or Image
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={handleAddExpense}>
                <Text style={styles.modalAddBtnText}>
                  {editingItemId ? 'Update' : 'Add'} Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppSafeArea>
  );
};
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'normal',
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  uploadBox: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  uploadedFileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  removeFileBtn: {
    marginLeft: 10,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  submitBtn: {
    backgroundColor: '#2962ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  expenseSection: {
    marginTop: 20,
  },
  expenseSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseSectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  actionBtn: {
    paddingHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalAddBtn: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  modalAddBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalCancelBtn: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  modalCancelBtnText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 15,
  },
  gridContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  gridHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#334155',
    fontSize: 12,
  },
  gridRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  gridCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
    paddingHorizontal: 4,
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridActionBtn: {
    paddingHorizontal: 6,
  },
  totalAmountContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  totalAmountInput: {
    backgroundColor: '#ffffffff',
    color: '#ffffffff',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4b5563',
    width: 80,
  },
  summaryValue: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  expenseSummaryCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  expenseSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginLeft: 8,
  },
  expenseSummaryContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  expenseSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  expenseSummaryLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  expenseSummaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 'bold',
  },
  itemsCountBadge: {
    backgroundColor: '#2962ff',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  advanceSection: {
    marginTop: 20,
  },
  advanceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  advanceInfoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  advanceInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  advanceTotalAmountContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  advanceLabel: {
    color: '#047857',
    marginTop: 0,
  },
  advanceAmountInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
    color: '#047857',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 8,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 8,
  },
  iconContainer: {
    top: 18,
    right: 10,
  },
};

export default PaymentRequest;
