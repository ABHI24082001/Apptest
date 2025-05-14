import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Modal } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Appbar } from 'react-native-paper';
import AppSafeArea from '../component/AppSafeArea';

const PaymentRequest = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [paymentTitle, setPaymentTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  return (
    <AppSafeArea>
      <Appbar.Header elevated style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Payment Request" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Payment Title</Text>
        <TextInput
          value={paymentTitle}
          onChangeText={setPaymentTitle}
          placeholder="Enter Payment Title"
          style={styles.input}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter Amount"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setOpenDatePicker(true)}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          mode="date"
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpenDatePicker(false)}
        />

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Add Remarks (optional)"
          multiline
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        />

        <Text style={styles.label}>Uploaded Document</Text>
        <TouchableOpacity style={styles.uploadBox}>
          <Text style={{ color: '#999', textAlign: 'center' }}>Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
  },
  uploadBox: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
});

export default PaymentRequest;
