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
import axios from 'axios';
import FeedbackModal from '../component/FeedbackModal'; // Import FeedbackModal

const PaymentRequest = ({navigation}) => {
  // Form handling with react-hook-form

  // State management
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseItems, setExpenseItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expenseHeads, setExpenseHeads] = useState([]);

  // State for FeedbackModal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  const employeeDetails = useFetchEmployeeDetails();
  const BASE_URL_PROD = 'https://hcmapiv2.anantatek.com/api';
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
      RequestTypeId: 1, // Default value for RequestTypeId
      requestType: 'expense', // Auto-select 'Expense' as default
      EmployeeId: employeeDetails?.id || 0, // Use employee ID from fetched details'',
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

  // Document picker handler
  const handleDocumentPick = async () => {
    try {
      const res = await pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      if (res && res[0]) {
        const file = res[0];
        console.log('Selected File:', file); // Debugging file details

        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size should be less than 5MB');
          return;
        }

        setUploadedFile({
          name: file.name,
          uri: file.uri,
          type: file.type,
        });
        Alert.alert('Success', 'File uploaded successfully');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('DocumentPicker Error:', err);
        Alert.alert('Error', 'Failed to upload document');
      }
    }
  };

  // Fetch expense head list
  useEffect(() => {
    const fetchExpenseHeads = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL_PROD}/ExpHeadMaster/GetExpenseHeadList/${employeeDetails?.childCompanyId}`,
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

  // Edit expense item handler
  const handleEditExpense = item => {
    setEditingItemId(item.id);
    setValue('expenseHead', item.head);
    setValue('projectName', item.project);
    setValue('paymentTitle', item.title);
    setValue('amount', item.amount);
    setValue('date', item.date || new Date());
    setUploadedFile(item.document || null);
    setIsModalVisible(true);
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
    if (requestType === 'advance') {
      // Prepare data for Advance submission
      const formData = {
        PaymentRequest: {
          RequestId: 0,
          RequestTypeId: data.RequestTypeId,
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
          CreatedDate: formatDateForBackend(new Date()),
          ModifiedBy: employeeDetails?.id ?? 0,
          ModifiedDate: formatDateForBackend(new Date()),
        },
        tempPayments: [], // No expense items for Advance
      };

      console.log('Advance Submission Payload:', formData);

      try {
        const response = await axios.post(
          `${BASE_URL_PROD}/PaymentAdvanceRequest/SaveAndUpdatePaymentAdvanceRequest`,
          formData,
        );
        console.log('Advance Submission Response:', response.data);
        setFeedbackMessage('Advance request submitted successfully');
        setFeedbackType('success');
        setFeedbackVisible(true);
        reset();
        setTotalAmount(0);
        setUploadedFile(null);
      } catch (error) {
        console.error('Error submitting advance request:', error);
        setFeedbackMessage('Failed to submit advance request');
        setFeedbackType('fail');
        setFeedbackVisible(true);
      }
    } else if (requestType === 'expense') {
      // Validate that at least one expense item is added
      if (expenseItems.length === 0) {
        Alert.alert('Error', 'Please add at least one expense item');
        return;
      }

      // Validate that remarks are provided
      if (!data.remarks) {
        Alert.alert('Error', 'Please provide remarks');
        return;
      }

      // Prepare data for Expense submission
      const formData = {
        PaymentRequest: {
          RequestId: 1,
          RequestTypeId: data.RequestTypeId,
          EmployeeId: employeeDetails?.id,
          ProjectId: null,
          ReportingMgrId: employeeDetails?.reportingEmpId,
          TotalAmount: totalAmount,
          Status: 'Pending',
          Remarks: data.remarks,
          CompanyId: employeeDetails?.childCompanyId,
          IsDelete: 0,
          Flag: 1,
          CreatedBy: employeeDetails?.id ?? 0,
          CreatedDate: formatDateForBackend(new Date()),
          ModifiedBy: employeeDetails?.id ?? 0,
          ModifiedDate: formatDateForBackend(new Date()),
        },
        tempPayments: expenseItems.map(item => ({
          Id: 0,
          TransactionDate: formatDateForBackend(item.date),
          ExpenseHeadId: item.headId,
          ExpenseHead: item.head,
          Amount: parseFloat(item.amount),
          ApprovedAmount: 0,
          RequestType: data.RequestTypeId,
          DocumentPath: item.document?.uri || null,
        })),
      };

      console.log('Expense Submission Payload:', JSON.stringify(formData, null, 2));

      try {
        const response = await axios.post(
          `${BASE_URL_PROD}/PaymentAdvanceRequest/SaveAndUpdatePaymentAdvanceRequest`,
          formData,
        );
        console.log('Expense Submission Response:', response.data);
        setFeedbackMessage('Expense request submitted successfully');
        setFeedbackType('success');
        setFeedbackVisible(true);
        reset();
        setExpenseItems([]);
        setUploadedFile(null);
      } catch (error) {
        console.error('Error submitting expense request:', error);
        setFeedbackMessage('Failed to submit expense request');
        setFeedbackType('fail');
        setFeedbackVisible(true);
      }
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

  return (
    <AppSafeArea>
      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        type={feedbackType}
        message={feedbackMessage}
      />

      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Payment Request"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Icon name="credit-card-outline" size={40} color="#10B981" />
          <Text style={styles.headerText}>Payment Request</Text>
          <Text style={styles.subHeaderText}>
            Please fill in the details below to submit your payment request
          </Text>
        </View>

        {/* Request Type */}
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
                onChange(selectedValue);
                setValue('RequestTypeId', selectedValue === 'expense' ? 1 : 2); // Set RequestTypeId based on selection
              }}
              value={value}
              placeholder={{label: 'Select Request Type', value: null}}
              items={[
                {label: 'Expense', value: 'expense'},
                {label: 'Advance', value: 'advance'},
              ]}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="chevron-down" size={20} color="#555" />}
            />
          )}
        />

        {/* Expense Items Section */}
        {requestType === 'expense' && (
          <View style={styles.expenseSection}>
            <View style={styles.expenseSectionHeader}>
              <Text style={styles.expenseSectionTitle}>Expense Items</Text>
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={openAddExpenseModal}>
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Expense</Text>
            </TouchableOpacity>

            {expenseItems.length > 0 && (
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
                    <Text style={styles.gridCell}>{formatDate(item.date)}</Text>
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
            )}
          </View>
        )}
        {/* Total Amount Input Field */}
        <View style={styles.totalAmountContainer}>
          <Text style={styles.label}>Total Amount</Text>
          <TextInput
            value={
              requestType === 'advance'
                ? totalAmount.toString()
                : `₹${totalAmount.toFixed(2)}`
            } // Editable for 'advance'
            editable={requestType === 'advance'} // Allow editing only for 'advance'
            onChangeText={value => {
              if (requestType === 'advance') {
                const numericValue = parseFloat(value) || 0;
                setTotalAmount(numericValue);
              }
            }}
            style={[styles.input, styles.totalAmountInput]}
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
              value={value}
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
          style={styles.submitBtn}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
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
                <Text style={styles.dateText}>{date.toDateString()}</Text>
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
              <Text style={styles.label}>Payment Title</Text>
              <Controller
                control={control}
                name="paymentTitle"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter Payment Title"
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
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handleDocumentPick}>
                {uploadedFile ? (
                  <View style={styles.uploadedFileContainer}>
                    <Icon name="file-pdf-box" size={24} color="#E11D48" />
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {uploadedFile.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setUploadedFile(null)}
                      style={styles.removeFileBtn}>
                      <Icon name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Icon name="upload" size={24} color="#999" />
                    <Text style={styles.uploadPlaceholderText}>
                      Choose PDF or Image
                    </Text>
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
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: 'bold',
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
