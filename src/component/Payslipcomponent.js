import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';


const PDFViewer = ({payslipData, visible, onClose , employeeDetails }) => {
  const [pdfPath, setPdfPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  console.log(employeeDetails, 'employeeDetails ==================================================================================in PDFViewer');

  useEffect(() => {
    if (payslipData && visible) {
      generatePDF();
    }
  }, [payslipData, visible]);

const generatePDF = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const formatCurrency = (value) => {
      if (isNaN(parseFloat(value))) return '₹0.00';
      return `₹${parseFloat(value).toFixed(2)}`;
    };

    const formattedData = {
      empId: payslipData.employeeCodeNo || 'N/A',
      name: payslipData.employeeName || 'N/A',
      designation: employeeDetails.designationName || 'N/A',
      department: employeeDetails.departmentName || 'N/A',
      doj: payslipData.doj || '10-06-2023',
      uan: payslipData.uan || 'N/A',
      pfAccount: payslipData.pafAccNo || 'N/A',
      bankAccount: payslipData.bankAcNo || 'N/A',
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
          amount: formatCurrency(payslipData.OvertimeAmount),
        },
      ].filter(Boolean),
      deductions: [
        {
          name: 'Esic Employee',
          amount: formatCurrency(payslipData.esicemployee),
        },
        {name: 'EPF Employee', amount: formatCurrency(payslipData.epfemployee)},
        payslipData.tdsAmt > 0 && {
          name: 'TDS',
          amount: formatCurrency(payslipData.tdsAmt),
        },
        {
          name: 'Professional Tax',
          amount: formatCurrency(payslipData.professionalTax),
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
          amount: formatCurrency(payslipData.earlyGoingDeduction),
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

    const calculateTotal = (items) =>
      items.reduce((total, item) => total + parseFloat(item.amount.replace(/[^0-9.]/g, '')), 0);

    const totalEarnings = calculateTotal(formattedData.earnings);
    const totalDeductions = calculateTotal(formattedData.deductions);

    const generateRows = (items) => items.map(item => `
      <div class="d-flex justify-content-between px-2 py-1">
        <p class="mb-1 fw-semibold">${item.name}</p>
        <p class="mb-1 fw-semibold">${item.amount}</p>
      </div>
    `).join('');

    const earningsHtml = generateRows(formattedData.earnings);
    const deductionsHtml = generateRows(formattedData.deductions);

    const logoBase64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAADrL+HoY7K6mL5mpr3kunKrqXz2`;

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
        <h1 class="fw-bold mb-1">Info Trading Pvt Ltd</h1>
        <p class="text-muted">Delhi Secretariat, I.P. Estate, New Delhi-110002</p>
      </div>
      <img src="${logoBase64}" width="70" />
    </div>

    <hr class="mt-2 mb-1">

    <div class="mt-2">
      <h2 class="fw-bold mb-1">Payslip for: ${formattedData.payPeriod}</h2>
      <h3 class="mb-1">${formattedData.name} (Emp ID: ${formattedData.empId})</h3>
      <p class="mb-1">${formattedData.designation}, ${formattedData.department}</p>
      <p>Date of Joining: ${formattedData.doj}</p>
    </div>

    <div class="d-flex justify-content-between align-items-end mt-2" style="flex-wrap: wrap;">
      <div>
        <p class="fw-semibold">UAN: ${formattedData.uan}</p>
        <p class="fw-semibold">PF A/C: ${formattedData.pfAccount}</p>
        <p class="fw-semibold">Bank A/C: ${formattedData.bankAccount}</p>
      </div>
      <div class="text-right">
        <p class="fw-semibold">Paid Days: ${formattedData.paidDays}</p>
        <p class="fw-semibold">LOP Days: ${formattedData.lopDays}</p>
        <p class="net-pay">Net Pay: ${formattedData.netPay}</p>
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
    setPdfPath(file.filePath);
    
  } catch (err) {
    console.error('PDF generation error:', err);
    setError(err.message || 'Failed to generate PDF');
  } finally {
    setIsLoading(false);
  }
};

const printBill = async () => {
  try {
    setIsLoading(true);
    let filePath = pdfPath;
    
    // If no PDF path exists yet, generate it first
    if (!filePath) {
      filePath = await generatePDF();
    }
    
    if (filePath) {
      await RNPrint.print({filePath});
    } else {
      setError('Failed to get PDF file path for printing');
    }
  } catch (err) {
    console.error('Print error:', err);
    setError(err.message || 'Failed to print PDF');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Payslip</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.printButton} onPress={printBill}>
              <Text style={styles.buttonText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Generating PDF document...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : pdfPath ? (
          <Pdf
            source={{
              uri: Platform.OS === 'android' ? `file://${pdfPath}` : pdfPath,
              cache: true,
            }}
            style={styles.pdf}
            onError={error => {
              console.error('PDF error:', error);
              setError('Failed to load PDF');
            }}
            onLoadComplete={() => console.log('PDF loaded successfully')}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>No PDF to display</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pdf: {
    flex: 1,
    margin: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printButton: {
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#ff5c5c',
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
});

export default PDFViewer;
