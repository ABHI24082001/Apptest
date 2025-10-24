import React, {useState, useEffect} from 'react';
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
  Linking,
  Image,
} from 'react-native';
import {Card, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';

import useFetchEmployeeDetails from '../component/FetchEmployeeDetails';
import BASE_URL from '../constants/apiConfig';
import axiosinstance from '../utils/axiosInstance';
import LeaveHeader from '../component/LeaveHeader';
import moment from 'moment';
import PDFViewer from '../component/Payslipcomponent';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import {useAuth } from '../constants/AuthContext';

const STATIC_LOGO_FILENAME = '28072025121916.png';
const STATIC_LOGO_URL = `https://hcmv2.anantatek.com/assets/UploadImg/${STATIC_LOGO_FILENAME}`; // <-- Set your actual logo hosting path here

const MyPaySlip = () => {
  const navigation = useNavigation();
  const employeeDetails = useFetchEmployeeDetails();
  const {user} = useAuth();

  console.log(user, 'User Details from Auth Context');
  const [apiPayslips, setApiPayslips] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');

  const formatForDotNet = date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T00:00:00`;
  };

  const formatDate = date => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchPayslips = async () => {
    try {
      const payload = {
        EmployeeId: employeeDetails?.id || 0,
        Month: 0,
        Year: 0,
        YearList: null,
        ChildCompanyId: employeeDetails?.childCompanyId || 0,
        FromDate: fromDate ? formatForDotNet(fromDate) : null,
        ToDate: toDate ? formatForDotNet(toDate) : null,
        BranchName: null,
        BranchId: 0,
        EmployeeTypeId: 0,
        DraftName: null,
        Did: 0,
        UserId: 0,
        status: null,
        Ids: null,
        CoverLatter: null,
        DepartmentId: 0,
        DesignationId: 0,
        UserType: 0,
        CalculationType: 0,
        childCompanies: null,
        branchIds: null,
        departmentsIds: null,
        designationIds: null,
        employeeTypeIds: null,
        employeeIds: null,
        hasAllReportAccess: false,
      };

      console.log('📤 Sending Payload to API:', payload);

      const response = await axiosinstance.post(
        `${BASE_URL}/PayRollRun/GetEmployeePaySlipList`,
        payload,
      );

      console.log('✅ API Response:', response.data);
      setApiPayslips(response.data?.payRollDraftViewModels || []);

      console.log(
        '📥 Received Payslips:',
        response.data?.payRollDraftViewModels || [],
      );
    } catch (error) {
      console.error('❌ Error fetching payslip data:', error);
      if (error.response) {
        console.error('❌ API Error Response:', error.response.data);
      }
    }
  };

  const [visible, setVisible] = useState(false);
   const [imageUrl, setImageUrl] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    // const {user} = useAuth();
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (user?.id) {
          const response = await axiosinstance.get(
            `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${user.id}`,
          );
          setEmployeeData(response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [user]);

 useEffect(() => {
      // Always log the user object for debugging
      // console.log('ProfileMenu user:', user);
      // debugger; // Debug here to inspect user object
  
      if (user?.empImage) {
        // Compose the direct image URL using empImage
        const directImageUrl = `${IMG_BASE_URL}${user.empImage}`;
        setImageUrl(directImageUrl);
  
        // Optionally, check if the image exists on the server
        const fetchUrl = `http://192.168.29.2:91/UploadDocument/FetchFile?fileNameWithExtension=${user.empImage}`;
        fetch(fetchUrl, { method: 'GET' })
          .then(response => {
            console.log('Profile image fetch URL:', fetchUrl);
            console.log('Profile image fetch response:', response);
            // debugger; // Debug here to inspect fetch response
            if (!response.ok) {
              setImageUrl(null);
            }
          })
          .catch(err => {
            console.log('Profile image fetch error:', err);
            setImageUrl(null);
          });
      } else {
        setImageUrl(null);
      }
    }, [user?.empImage]);


  useEffect(() => {
    if (
      fromDate &&
      toDate &&
      employeeDetails?.id &&
      employeeDetails?.childCompanyId
    ) {
      setIsLoading(true);
      fetchPayslips().finally(() => setIsLoading(false));
    }
  }, [fromDate, toDate, employeeDetails]);


    const IMG_BASE_URL = 'http://192.168.29.2:90/assets/UploadImg/';


  const onRefresh = () => {
    setRefreshing(true);
    fetchPayslips().finally(() => setRefreshing(false));
  };


  const generatePayslipPDF = async payslipData => {
    try {
      const formatCurrency = value => {
        if (isNaN(parseFloat(value))) return '₹0.00';
        return `₹${parseFloat(value).toFixed(2)}`;
      };

      const formattedData = {
        empId: payslipData.employeeCodeNo || 'N/A',
        name: payslipData.employeeName || 'N/A',
        designation: employeeDetails.designationName || 'N/A',
        department: employeeDetails.departmentName || 'N/A',
        doj: payslipData.doj || '10-06-2023',
        netPay: formatCurrency(payslipData.netPayble),
        paidDays: payslipData.noOfPaybleDays || 0,
        lopDays: payslipData.unpaidLeave || 0,
        earnings: [
          {name: 'Basic', amount: formatCurrency(payslipData.basicSalary)},
          {name: 'HRA', amount: formatCurrency(payslipData.hra)},
          {
            name: 'Conveyance Allowance',
            amount: formatCurrency(payslipData.convAllowance),
          },
          {
            name: 'Travel Allowance',
            amount: formatCurrency(payslipData.travelExpense),
          },
          {
            name: 'Telephone Allowance',
            amount: formatCurrency(payslipData.teleExpense),
          },
          {
            name: 'Medical Allowance',
            amount: formatCurrency(payslipData.medicalAllowance),
          },
          payslipData.performanceBonus > 0 && {
            name: 'Performance Bonus',
            amount: formatCurrency(payslipData.performanceBonus),
          },
          {
            name: 'Expense Claim Amount',
            amount: formatCurrency(payslipData.ExpenseClaimAmount),
          },
          {
            name: 'Overtime Amount',
            amount: formatCurrency(payslipData.overTimeAmount),
          },
        ].filter(Boolean),
        deductions: [
          {
            name: 'Esic Employee',
            amount: formatCurrency(payslipData.esicemployee),
          },
          {
            name: 'EPF Employee',
            amount: formatCurrency(payslipData.epfemployee),
          },
          payslipData.tdsAmt > 0 && {
            name: 'TDS',
            amount: formatCurrency(payslipData.tdsAmt),
          },

          {
            name: 'Advance Recovery',
            amount: formatCurrency(payslipData.advancePayment),
          },
          {
            name: 'Professional Tax',
            amount: formatCurrency(payslipData.professionalTax),
          },
          {
            name: 'Miscellaneous Deduction',
            amount: formatCurrency(payslipData.miscellaneousDeduction),
          },

          // payslipData.Advancerecovery > 0 && {
          //   name: 'Advance Recovery',
          //   amount: formatCurrency(payslipData.AdvanceRecovery)
          // },
          payslipData.lateComminAmount > 0 && {
            name: 'Late Comimg Deduction',
            amount: formatCurrency(payslipData.lateComminAmount),
          },
          {
            name: 'Early Going Deduction',
            amount: formatCurrency(payslipData.earlyGoingDeduction ?? 4.23),
          },
          {
            name: 'Un-Approved Leave Amount',
            amount: formatCurrency(payslipData.unapprovedLeaveAmount),
          },
        ].filter(Boolean),
        payPeriod:
          payslipData.paySliperiod ||
          new Date(payslipData.payslipDate).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
      };

      const calculateTotal = items =>
        items.reduce(
          (total, item) =>
            total + parseFloat(item.amount.replace(/[^0-9.]/g, '')),
          0,
        );

      const totalEarnings = calculateTotal(formattedData.earnings);
      const totalDeductions = calculateTotal(formattedData.deductions);

      const generateRows = items =>
        items
          .map(
            item => `
      <div class="d-flex justify-content-between px-2 py-1">
        <p class="mb-1 fw-semibold">${item.name}</p>
        <p class="mb-1 fw-semibold">${item.amount}</p>
      </div>
    `,
          )
          .join('');

      const earningsHtml = generateRows(formattedData.earnings);
      const deductionsHtml = generateRows(formattedData.deductions);

      // Fetch static logo from the server
      const logoResponse = await axiosinstance.get(STATIC_LOGO_URL, {
        responseType: 'arraybuffer',
      });
      const logoBase64Data = Buffer.from(logoResponse.data).toString('base64');
      const logoBase64 = `data:image/png;base64,${logoBase64Data}`;
   

      const dynamicHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 16px;
      color: #000;
      line-height: 1.8;
    }
    .payslip {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ccc;
      padding: 30px 25px;
    }
    .d-flex { display: flex; }
    .justify-content-between { justify-content: space-between; }
    .align-items-start { align-items: flex-start; }
    .align-items-end { align-items: flex-end; }
    .text-right { text-align: right; }
    .flex-column { flex-direction: column; }
    .row { display: flex; flex-wrap: wrap; margin: 0 -10px; }
    .col-md-6 { width: 50%; padding: 0 10px; }
    .fw-bold { font-weight: 700; }
    .fw-semibold { font-weight: 600; }
    .mb-1 { margin-bottom: 10px; }
    .mt-2 { margin-top: 18px; }
    .py-1 { padding: 10px 0; }
    .py-2 { padding: 14px 0; }
    .px-2 { padding: 0 14px; }
    .p-2 { padding: 14px; }
    .text-center { text-align: center; }
    .text-muted { color: #777; }
    .border { border: 1px solid #ddd; }
    .section-header {
      background: #f4f4f4;
      padding: 12px 14px;
      font-weight: bold;
      font-size: 17px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 26px;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 22px;
      margin-bottom: 8px;
    }
    h3 {
      font-size: 18px;
      margin-bottom: 6px;
    }
    .signature-line {
      border-top: 1px dashed #000;
      width: 180px;
      margin: 30px auto 6px;
    }
    .net-pay {
      font-size: 20px;
      font-weight: 700;
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="payslip">
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h1 class="fw-bold mb-1">Honey and Heath Trading</h1>
        <p class="text-muted">Rz 2550, Est nisi veniam ipsum delectus deserunt corporis sapiente impedit voluptas sunt rerum,New Delhi,456123</p>
      </div>
      <img src="${logoBase64}" width="70" />
    </div>

    <hr class="mt-2 mb-1">

    <div class="mt-2">
      <h2 class="fw-bold mb-1">Payslip for the Period: ${
        formattedData.payPeriod
      }</h2>
      <h3 class="mb-1">${formattedData.name} (Emp ID: ${
        formattedData.empId
      })</h3>
      <p class="mb-1">${formattedData.designation}, ${
        formattedData.department
      }</p>
      <p>Date of Joining: ${formattedData.doj}</p>
    </div>

    <div class="d-flex justify-content-between align-items-end mt-2" style="flex-wrap: wrap;">
      <div>
        <p class="fw-semibold">UAN: ${
          employeeData.uanno ? employeeData.uanno : 'NA'
        }</p>
        <p class="fw-semibold">PF A/C: ${
          employeeDetails.pfaccNo ? employeeDetails.pfaccNo : 'NA'
        }</p>
        <p class="fw-semibold">Bank A/C: ${
          employeeDetails.bankAcNo ? employeeDetails.bankAcNo : 'NA'
        }</p>
      </div>
      <div class="text-right">
              <p class="net-pay">Employee Net Pay: ${formattedData.netPay}</p>
        <p class="fw-semibold">Paid Days: ${formattedData.paidDays || 31}</p>
        <p class="fw-semibold">LOP Days: ${formattedData.lopDays}</p>
      
      </div>
    </div>

    <div class="row mt-2">
      <div class="col-md-6">
        <div class="section-header">Earnings</div>
        ${earningsHtml}
        <div class="d-flex justify-content-between px-2 py-1 border">
          <p class="fw-bold">Total Earnings</p>
          <p class="fw-bold">${formatCurrency(totalEarnings)}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="section-header">Deductions</div>
        ${deductionsHtml}
        <div class="d-flex justify-content-between px-2 py-1 border">
          <p class="fw-bold">Total Deductions</p>
          <p class="fw-bold">${formatCurrency(totalDeductions)}</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

      const options = {
        html: dynamicHtml,
        fileName: `payslip_${formattedData.empId}_${Date.now()}`,
        directory: 'Documents',
        base64: true,
      };

      const file = await RNHTMLtoPDF.convert(options);
      if (!file.filePath) throw new Error('Failed to generate PDF file');
      return file.filePath;
    } catch (err) {
      console.error('PDF generation error:', err);
      throw err;
    }
  };

  // Add a ref to track if download is cancelled
  const downloadCancelled = React.useRef(false);

  // Update downloadPayslip to support cancel
  const downloadPayslip = async payslipData => {
    try {
      setDownloadLoading(true);
      setPdfError(null);
      downloadCancelled.current = false;

      const filePath = await generatePayslipPDF(payslipData);
      if (downloadCancelled.current) return;

      if (filePath) {
        await RNPrint.print({filePath});
        setModalVisible(true);
      }
    } catch (error) {
      if (downloadCancelled.current) return;
      console.error('Download error:', error);
      setPdfError(error.message || 'Failed to download PDF');
    } finally {
      if (!downloadCancelled.current) setDownloadLoading(false);
    }
  };

  // Cancel download handler
  const handleCancelDownload = () => {
    downloadCancelled.current = true;
    setDownloadLoading(false);
    setPdfError(null);
  };

  const openPayslipPreview = payslipData => {
    setSelectedPayslip(payslipData);
    setShowPayslipModal(true);
  };

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-document-outline" size={30} color="#6D75FF" />
        <View style={styles.cardText}>
          <Text style={styles.month}>
            {moment(item.payslipDate).format('MMMM')}
          </Text>

          <Text style={styles.salary}>Disbursed Salary: ₹{item.netPayble}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => openPayslipPreview(item)}>
            <Icon name="eye" size={24} color="#6D75FF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => downloadPayslip(item)}
            disabled={downloadLoading}>
            {downloadLoading ? (
              // Only show ActivityIndicator and Cancel button if downloading
              <View style={{alignItems: 'center'}}>
                <ActivityIndicator size="small" color="#6D75FF" />
                <TouchableOpacity
                  onPress={handleCancelDownload}
                  style={{marginTop: 2}}>
                  <Text style={{color: '#ff5c5c', fontSize: 12}}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Icon name="download" size={24} color="#6D75FF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}>
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
          onPress={() => setShowToPicker(true)}>
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

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Icon name="file-remove-outline" size={48} color="#999" />
      <Text style={styles.emptyText}>
        No payslips found for the selected filters.
      </Text>
    </View>
  );

  return (
    <AppSafeArea>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Payslip" titleStyle={styles.headerTitle} />
      </Appbar.Header>
         <LeaveHeader
        title="Payslip"
        subtitle="Here’s the summary of your monthly earnings and deductions."
        iconName="file-document-outline"
      />
      {/* Show logoBase64 image if available */}
      {typeof logoBase64 === 'string' && !!logoBase64 && (
        <Image
          source={{ uri: `data:image/png;base64,${logoBase64}` }}
          style={{ width: 70, height: 70, alignSelf: 'center', marginVertical: 10 }}
          resizeMode="contain"
        />
      )}

      <FlatList
        data={apiPayslips}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmptyComponent}
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

      {/* Error Modal - optional */}
      {pdfError && (
        <Modal
          transparent={true}
          visible={!!pdfError}
          onRequestClose={() => setPdfError(null)}>
          <View style={styles.errorModalContainer}>
            <View style={styles.errorModalContent}>
              <Text style={styles.errorModalTitle}>Error</Text>
              <Text style={styles.errorModalText}>{pdfError}</Text>
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={() => setPdfError(null)}>
                <Text style={styles.errorModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Payslip Modal */}
      <Modal
        visible={showPayslipModal}
        animationType="slide"
        onRequestClose={() => setShowPayslipModal(false)}>
        {selectedPayslip && (
          <PDFViewer
            payslipData={selectedPayslip}
            visible={showPayslipModal}
            onClose={() => setShowPayslipModal(false)}
            employeeDetails={employeeDetails}
          />
        )}
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  errorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#721c24',
  },
  errorModalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  errorModalButton: {
    backgroundColor: '#6D75FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  errorModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MyPaySlip;

