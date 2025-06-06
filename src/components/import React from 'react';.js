import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ExpenseItemsSection = ({expenseItems, setExpenseItems, onAddExpense, onEditExpense}) => {
  const handleDeleteExpense = id => {
    setExpenseItems(expenseItems.filter(item => item.id !== id));
  };

  return (
    <View style={{marginTop: 20}}>
      <Text style={{fontSize: 18, fontWeight: 'bold'}}>Expense Items</Text>
      <TouchableOpacity
        style={{
          marginTop: 10,
          backgroundColor: '#10B981',
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
        }}
        onPress={onAddExpense}>
        <Icon name="plus" size={20} color="#fff" />
        <Text style={{color: '#fff', marginLeft: 8}}>Add Expense</Text>
      </TouchableOpacity>
      {expenseItems.map(item => (
        <View key={item.id} style={{flexDirection: 'row', marginTop: 10}}>
          <Text>{item.head}</Text>
          <TouchableOpacity onPress={() => onEditExpense(item)}>
            <Icon name="pencil" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteExpense(item.id)}>
            <Icon name="trash-can" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default ExpenseItemsSection;