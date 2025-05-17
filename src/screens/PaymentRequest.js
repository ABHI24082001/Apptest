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
  FlatList,
  Alert,
  Image,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Appbar} from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';
import RNPickerSelect from 'react-native-picker-select';
import DocumentPicker from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm, Controller} from 'react-hook-form';

const PaymentRequest = ({navigation}) => {
  // Form handling with react-hook-form
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
      requestType: '',
      projectName: '',
      expenseHead: '',
      amount: '',
      paymentTitle: '',
      remarks: '',
      date: new Date(),
    },
  });

  // State management
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseItems, setExpenseItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

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
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      setUploadedFile(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('DocumentPicker Error:', err);
      }
    }
  };

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

    // Validate amount format
    if (!/^[0-9]*(\.[0-9]{0,2})?$/.test(data.amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (editingItemId) {
      // Update existing item
      setExpenseItems(
        expenseItems.map(item =>
          item.id === editingItemId
            ? {
                ...item,
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
      setExpenseItems([
        ...expenseItems,
        {
          id: Date.now().toString(),
          head: data.expenseHead,
          project: data.projectName,
          title: data.paymentTitle,
          amount: data.amount,
          date: data.date,
          document: uploadedFile,
        },
      ]);
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

  // Submit form handler
  const onSubmit = data => {
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

    // Prepare data for submission
    const formData = {
      ...data,
      expenseItems,
      totalAmount,
      uploadedFile,
    };

    console.log('Form submitted:', formData);
    Alert.alert('Success', 'Payment request submitted successfully');

    // Reset form after successful submission
    reset();
    setExpenseItems([]);
    setUploadedFile(null);
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
              onValueChange={onChange}
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

        {/* Expense Items Grid Section */}
        <View style={styles.expenseSection}>
          <View style={styles.expenseSectionHeader}>
            <Text style={styles.expenseSectionTitle}>Expense Items</Text>
            {/* <Text style={styles.expenseSectionSubtitle}>
              Total: ₹{formatCurrency(totalAmount)}
            </Text> */}
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={openAddExpenseModal}>
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
                      <Icon name="file-remove-outline" size={20} color="#EF4444" />
                    )}
                  </View>
                  <View style={[styles.gridCell, styles.actionsCell]}>
                    <TouchableOpacity
                      style={styles.gridActionBtn}
                      onPress={() => handleEditExpense(item)}>
                      <Icon name="pencil" size={18} color="#3B82F6" />
                    </TouchableOpacity>
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

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            Alert.alert(
              'Cancel Request',
              'Are you sure you want to cancel this request?',
              [
                {text: 'No', style: 'cancel'},
                {
                  text: 'Yes',
                  onPress: () => {
                    reset();
                    setExpenseItems([]);
                    setUploadedFile(null);
                    navigation.goBack();
                  },
                },
              ],
            );
          }}>
          <Text style={styles.cancelText}>Cancel</Text>
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
              <Text style={styles.label}>Date</Text>
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
                    items={[
                      {label: 'Travel', value: 'travel'},
                      {label: 'Marketing', value: 'marketing'},
                      {label: 'IT Service', value: 'it'},
                    ]}
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
                    <Icon
                      name="file-document-outline"
                      size={24}
                      color="#10B981"
                    />
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {uploadedFile.name}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Icon name="upload" size={24} color="#999" />
                    <Text style={styles.uploadPlaceholderText}>
                      Choose PDF or JPG
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
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  uploadedFileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
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
