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
  StatusBar,
  
} from 'react-native';
import {Card, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import AppSafeArea from '../component/AppSafeArea';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
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
import CustomHeader from '../component/CustomHeader';
import ScrollAwareContainer from '../component/ScrollAwareContainer';

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


  const GradientHeader = ({children, style}) => (
    <LinearGradient
      colors={['#2563EB', '#3B82F6']}
      // style={[{flex: 1}, style]}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      {children}
    </LinearGradient>
  );
  
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

    if (user?.empImage) {
      // Use the static image URL directly
      const staticImageUrl = `https://hcmv2.anantatek.com/assets/UploadImg/${user.empImage}`;
      setImageUrl(staticImageUrl);
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
          payslipData.lateComminAmount > 0 && {
            name: 'Late Coming Deduction',
            amount: formatCurrency(payslipData.lateComminAmount),
          },
          {
            name: 'Early Going Deduction',
            amount: formatCurrency(payslipData.earlyGoingDeduction ?? 0),
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
      <tr>
        <td class="py-1 px-2">${item.name}</td>
        <td class="py-1 px-2 text-right">${item.amount}</td>
      </tr>
    `,
          )
          .join('');

      const earningsHtml = generateRows(formattedData.earnings);
      const deductionsHtml = generateRows(formattedData.deductions);

      // Get user profile image
      let userImageBase64 = '';
      if (imageUrl) {
        try {
          const userImageResult = await RNFS.downloadFile({
            fromUrl: imageUrl,
            toFile: `${RNFS.TemporaryDirectoryPath}/user_image.png`,
          }).promise;

          if (userImageResult.statusCode === 200) {
            const userImageData = await RNFS.readFile(
              `${RNFS.TemporaryDirectoryPath}/user_image.png`,
              'base64'
            );
            userImageBase64 = `data:image/png;base64,${userImageData}`;
            await RNFS.unlink(`${RNFS.TemporaryDirectoryPath}/user_image.png`);
          }
        } catch (userImageError) {
          console.warn('Could not load user image:', userImageError);
        }
      }

      // Get company logo
      let logoBase64 = '';
      try {
        const downloadResult = await RNFS.downloadFile({
          fromUrl: STATIC_LOGO_URL,
          toFile: `${RNFS.TemporaryDirectoryPath}/company_logo.png`,
        }).promise;

        if (downloadResult.statusCode === 200) {
          const logoBase64Data = await RNFS.readFile(
            `${RNFS.TemporaryDirectoryPath}/company_logo.png`,
            'base64'
          );
          logoBase64 = `data:image/png;base64,${logoBase64Data}`;
          await RNFS.unlink(`${RNFS.TemporaryDirectoryPath}/company_logo.png`);
        }
      } catch (logoError) {
        console.warn('Could not load company logo:', logoError);
      }

      const dynamicHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      color: #000;
      line-height: 1.6;
      padding: 20px;
    }
    .payslip {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      border: 2px solid #333;
      padding: 20px;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .company-info h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .company-info p { color: #666; font-size: 12px; }
    .logo { width: 80px; height: 80px; object-fit: contain; }
    .separator { border-top: 2px solid #333; margin: 15px 0; }
    .payslip-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    .employee-info { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; }
    .employee-details h2 { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
    .employee-details p { margin-bottom: 3px; font-size: 14px; }
    .employee-image { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 2px solid #ddd; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .left-details, .right-details { width: 48%; }
    .net-pay { font-size: 18px; font-weight: bold; color: #2e7d32; text-align: right; }
    .earnings-deductions { display: flex; gap: 20px; }
    .earnings, .deductions { flex: 1; }
    .section-title { background: #f5f5f5; padding: 8px; font-weight: bold; text-transform: uppercase; border: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 6px 8px; border: 1px solid #ddd; }
    .amount { text-align: right; }
    .total-row { font-weight: bold; background: #f9f9f9; }
    .text-right { text-align: right; }
    .py-1 { padding: 6px 0; }
    .px-2 { padding: 0 8px; }
  </style>
</head>
<body>
  <div class="payslip">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>Honey and Heath Trading</h1>
        <p>Rz 2550, Est nisi veniam ipsum delectus deserunt corporis sapiente impedit voluptas sunt rerum, New Delhi, 456123</p>
      </div>
      ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo" />` : '<div style="width: 80px; height: 80px; background: #f0f0f0; border: 1px solid #ddd;"></div>'}
    </div>

    <div class="separator"></div>

    <!-- Payslip Title -->
    <div class="payslip-title">Payslip for the Period: ${formattedData.payPeriod}</div>

    <!-- Employee Info -->
    <div class="employee-info">
      <div class="employee-details">
        <h2>${formattedData.name} (${formattedData.empId})</h2>
        <p><strong>${formattedData.designation}, ${formattedData.department}</strong></p>
        <p>Date of Joining: ${formattedData.doj}</p>
      </div>
      ${userImageBase64 ? `<img src="${userImageBase64}" class="employee-image" alt="Employee Photo" />` : '<div style="width: 80px; height: 80px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px;"></div>'}
    </div>

    <!-- Details Row -->
    <div class="details-row">
      <div class="left-details">
        <p><strong>UAN Number:</strong> ${employeeData?.uanno || 'NA'}</p>
        <p><strong>PF A/C Number:</strong> ${employeeDetails?.pfaccNo || 'NA'}</p>
        <p><strong>Bank Account Number:</strong> ${employeeDetails?.bankAcNo || 'NA'}</p>
      </div>
      <div class="right-details">
        <div class="net-pay">Employee Net Pay: ${formattedData.netPay}</div>
        <p class="text-right"><strong>Paid Days:</strong> ${formattedData.paidDays} | <strong>LOP Days:</strong> ${formattedData.lopDays}</p>
      </div>
    </div>

    <!-- Earnings and Deductions -->
    <div class="earnings-deductions">
      <div class="earnings">
        <div class="section-title">Earnings</div>
        <table>
          <thead>
            <tr style="background: #f9f9f9;">
              <td><strong>Component</strong></td>
              <td class="amount"><strong>Amount</strong></td>
            </tr>
          </thead>
          <tbody>
            ${earningsHtml}
            <tr class="total-row">
              <td><strong>Gross Earnings</strong></td>
              <td class="amount"><strong>${formatCurrency(totalEarnings)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="deductions">
        <div class="section-title">Deductions</div>
        <table>
          <thead>
            <tr style="background: #f9f9f9;">
              <td><strong>Component</strong></td>
              <td class="amount"><strong>Amount</strong></td>
            </tr>
          </thead>
          <tbody>
            ${deductionsHtml}
            <tr class="total-row">
              <td><strong>Total Deductions</strong></td>
              <td class="amount"><strong>${formatCurrency(totalDeductions)}</strong></td>
            </tr>
          </tbody>
        </table>
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
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
     
      <CustomHeader title="My Payslip" navigation={navigation} />


      <LeaveHeader
        title="Payslip"
        subtitle="Here's the summary of your monthly earnings and deductions."
        iconName="file-document-outline"
      />
      {/* Show logoBase64 image if available */}
      {(console.log('logoBase64 value:', logoBase64), typeof logoBase64 === 'string' && !!logoBase64) && (
        <Image
          source={{ uri: `data:image/png;base64,${logoBase64}` }}
          style={{ width: 70, height: 70, alignSelf: 'center', marginVertical: 10 }}
          resizeMode="contain"
          onLoad={() => console.log('Company logo loaded successfully')}
          onError={(error) => console.log('Company logo load error:', error)}
        />
      )}

      <ScrollAwareContainer navigation={navigation} currentRoute="MyPayslip">
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
          showsVerticalScrollIndicator={false}
        />
      </ScrollAwareContainer>

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
  gradientHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 131, 246, 0.3)',
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginLeft: 20
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

