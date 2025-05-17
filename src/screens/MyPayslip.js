import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { Card, Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import { WebView } from 'react-native-webview';
import Pdf from 'react-native-pdf';
import AppSafeArea from '../component/AppSafeArea';
import { useNavigation } from '@react-navigation/native';
import DownloadSuccessModal from '../component/DownloadSuccessModal';

const MyPaySlip = () => {
  const navigation = useNavigation();
  const allPayslips = [
    {
      id: '1',
      month: 'April, 2025',
      salary: '₹50,000',
      date: new Date('2025-04-01'),
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: '2',
      month: 'March, 2025',
      salary: '₹50,000',
      date: new Date('2025-03-01'),
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: '3',
      month: 'February, 2025',
      salary: '₹50,000',
      date: new Date('2025-02-01'),
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: '4',
      month: 'January, 2025',
      salary: '₹50,000',
      date: new Date('2025-01-01'),
    },
    {
      id: '5',
      month: 'December, 2024',
      salary: '₹50,000',
      date: new Date('2024-12-01'),
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  ];

  const filterOptions = [
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState('');

  const filterPayslips = useCallback(() => {
    let filtered = [...allPayslips];
    const now = new Date();
    let from = new Date();

    if (selectedFilter) {
      switch (selectedFilter) {
        case 'last_month':
          from.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
        case 'quarterly':
          from.setMonth(now.getMonth() - 3);
          break;
        case 'yearly':
          from.setFullYear(now.getFullYear() - 1);
          break;
      }
      filtered = filtered.filter(p => p.date >= from && p.date <= now);
    } else if (fromDate && toDate) {
      filtered = filtered.filter(p => p.date >= fromDate && p.date <= toDate);
    }

    setFilteredPayslips(filtered);
  }, [selectedFilter, fromDate, toDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      filterPayslips();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [filterPayslips]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      filterPayslips();
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = date => date?.toLocaleDateString('en-GB') || '--';

  const openPdf = (uri) => {
    setPdfUri(uri);
    setPdfModalVisible(true);
  };

  const closePdf = () => {
    setPdfModalVisible(false);
    setPdfUri('');
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-document-outline" size={30} color="#6D75FF" />
        <View style={styles.cardText}>
          <Text style={styles.month}>{item.month}</Text>
          <Text style={styles.salary}>Disbursed Salary: {item.salary}</Text>
        </View>
        {item.pdfUrl && (
          <TouchableOpacity 
            style={styles.previewBtn} 
            onPress={() => openPdf(item.pdfUrl)}
          >
            <Icon name="eye" size={24} color="#6D75FF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.downloadBtn}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="download" size={24} color="#6D75FF" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip, 
              selectedFilter === option.value && styles.chipSelected
            ]}
            onPress={() => {
              setSelectedFilter(option.value);
              setFromDate(null);
              setToDate(null);
            }}
          >
            <Text style={[
              styles.chipText, 
              selectedFilter === option.value && styles.chipTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dateRow}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowFromPicker(true)}
        >
          <View style={styles.dateInputContainer}>
            <Icon name="calendar" size={16} color="#6D75FF" />
            <Text style={styles.dateValue}>
              {fromDate ? formatDate(fromDate) : 'From Date'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dateIconWrapper}>
          <Icon name="arrow-right" size={16} color="#666" />
        </View>

        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowToPicker(true)}
        >
          <View style={styles.dateInputContainer}>
            <Icon name="calendar" size={16} color="#6D75FF" />
            <Text style={styles.dateValue}>
              {toDate ? formatDate(toDate) : 'To Date'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Payslip" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <FlatList
        data={filteredPayslips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="file-remove-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No payslips found for selected filters.</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      />

      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={date => {
          setShowFromPicker(false);
          setFromDate(date);
          setSelectedFilter(null);
        }}
        onCancel={() => setShowFromPicker(false)}
      />

      <DatePicker
        modal
        open={showToPicker}
        date={toDate || new Date()}
        mode="date"
        onConfirm={date => {
          setShowToPicker(false);
          setToDate(date);
          setSelectedFilter(null);
        }}
        onCancel={() => setShowToPicker(false)}
      />

      <DownloadSuccessModal
        visible={modalVisible}
        fileName="MyPayslip_April.pdf"
        onClose={() => setModalVisible(false)}
      />

      <Modal
        visible={pdfModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePdf}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payslip Preview</Text>
              <Pressable onPress={closePdf}>
                <Icon name="close" size={24} color="#666" />
              </Pressable>
            </View>

            {Platform.OS === 'android' ? (
              <WebView
                source={{ uri: `https://docs.google.com/gview?embedded=true&url=${pdfUri}` }}
                style={styles.pdf}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
              />
            ) : (
              <Pdf
                source={{ uri: pdfUri, cache: true }}
                style={styles.pdf}
              />
            )}
          </View>
        </View>
      </Modal>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerContainer: {
    paddingVertical: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#6D75FF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
  dateIconWrapper: {
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  month: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  salary: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  previewBtn: {
    marginRight: 12,
    padding: 6,
  },
  downloadBtn: {
    padding: 6,
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
    height: '80%',
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
    fontWeight: '600',
    color: '#333',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});

export default MyPaySlip;