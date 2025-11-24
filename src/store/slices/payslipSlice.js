import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosinstance from '../../utils/axiosInstance';
import BASE_URL from '../../constants/apiConfig';

// ========== ASYNC THUNKS - API CALLS ==========
// ये functions हैं जो API call करते हैं और automatic loading states manage करते हैं

export const fetchPayslips = createAsyncThunk(
  'payslip/fetchPayslips', // Action का नाम
  async ({ employeeId, childCompanyId, fromDate, toDate }, { rejectWithValue }) => {
    try {
      // Date को .NET format में convert करना
      const formatForDotNet = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0); // Time को 00:00:00 set करना
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T00:00:00`;
      };

      // API के लिए payload बनाना
      const payload = {
        EmployeeId: employeeId || 0,
        Month: 0,
        Year: 0,
        YearList: null,
        ChildCompanyId: childCompanyId || 0,
        FromDate: fromDate ? formatForDotNet(fromDate) : null,
        ToDate: toDate ? formatForDotNet(toDate) : null,
        // ... बाकी सब fields
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

      console.log('📤 Redux: API को भेज रहे हैं:', payload);

      // Actual API call
      const response = await axiosinstance.post(
        `${BASE_URL}/PayRollRun/GetEmployeePaySlipList`,
        payload
      );

      console.log('✅ Redux: API से मिला:', response.data);
      
      // Success होने पर data return करना
      return response.data?.payRollDraftViewModels || [];
    } catch (error) {
      console.error('❌ Redux: API Error:', error);
      
      // Error होने पर proper error message return करना
      if (error.response) {
        console.error('❌ Redux: Server Error:', error.response.data);
        return rejectWithValue(error.response.data.message || 'Server से data नहीं मिला');
      }
      return rejectWithValue(error.message || 'Network error हुई');
    }
  }
);

// Employee data fetch करने के लिए अलग thunk
export const fetchEmployeeData = createAsyncThunk(
  'payslip/fetchEmployeeData',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID चाहिए');
      }

      const response = await axiosinstance.get(
        `${BASE_URL}/EmpRegistration/GetEmpRegistrationById/${userId}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Redux: Employee data error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Employee data नहीं मिला');
    }
  }
);

// ========== INITIAL STATE ==========
// शुरुआती state - जैसे empty warehouse
const initialState = {
  // Payslip related data
  payslips: [],              // सारे payslips का array
  isLoading: false,          // क्या data load हो रहा है?
  error: null,               // कोई error है?
  
  // Employee related data
  employeeData: null,        // Employee की details
  employeeLoading: false,    // Employee data load हो रहा है?
  employeeError: null,       // Employee data में error?
  
  // Date filters
  fromDate: null,            // From date filter
  toDate: null,              // To date filter
  
  // UI states - screen की हालत
  refreshing: false,         // Pull to refresh हो रहा है?
  selectedPayslip: null,     // कौन सा payslip select है?
  showPayslipModal: false,   // Payslip modal दिख रहा है?
  
  // PDF generation states
  downloadLoading: false,    // PDF download हो रहा है?
  pdfError: null,           // PDF में error?
  
  // Image state
  imageUrl: null,           // User की image का URL
  
  // Modal states - कौन से popup खुले हैं?
  showFromPicker: false,    // From date picker खुला है?
  showToPicker: false,      // To date picker खुला है?
};

// ========== SLICE DEFINITION ==========
const payslipSlice = createSlice({
  name: 'payslip',
  initialState,
  
  // ========== SYNC REDUCERS ==========
  // ये functions तुरंत state update करते हैं (no API calls)
  // 
  // SYNC REDUCERS ka matlab:
  // 1. ये instantly काम करते हैं - कोई waiting नहीं
  // 2. ये सिर्फ state को change करते हैं - कोई API call नहीं करते
  // 3. जैसे आप एक switch on/off करते हैं - तुरंत result मिलता है
  // 4. Redux में ये "pure functions" कहलाते हैं
  // 
  // Example: जब आप date picker खोलते हैं, तो showFromPicker तुरंत true हो जाता है
  //          कोई server se पूछने की जरूरत नहीं
  // 
  // ASYNC vs SYNC difference:
  // - SYNC: तुरंत होता है, जैसे light switch
  // - ASYNC: time लगता है, जैसे online order (wait करना पड़ता है)
  
  reducers: {
    // Date actions - तारीख set करना
    setFromDate: (state, action) => {
      state.fromDate = action.payload;
      console.log('📅 From Date set:', action.payload);
    },
    setToDate: (state, action) => {
      state.toDate = action.payload;
      console.log('📅 To Date set:', action.payload);
    },
    
    // Modal actions - popup दिखाना/छुपाना
    setShowFromPicker: (state, action) => {
      state.showFromPicker = action.payload;
    },
    setShowToPicker: (state, action) => {
      state.showToPicker = action.payload;
    },
    setShowPayslipModal: (state, action) => {
      state.showPayslipModal = action.payload;
    },
    
    // Payslip selection
    setSelectedPayslip: (state, action) => {
      state.selectedPayslip = action.payload;
      console.log('📄 Payslip selected:', action.payload?.id);
    },
    
    // PDF actions
    setDownloadLoading: (state, action) => {
      state.downloadLoading = action.payload;
    },
    setPdfError: (state, action) => {
      state.pdfError = action.payload;
      if (action.payload) {
        console.error('📄 PDF Error:', action.payload);
      }
    },
    
    // Image URL
    setImageUrl: (state, action) => {
      state.imageUrl = action.payload;
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.pdfError = null;
      state.employeeError = null;
      console.log('🧹 Errors cleared');
    },
    
    // Complete reset
    resetPayslipState: (state) => {
      return initialState; // सब कुछ reset करना
    },
  },
  
  // ========== ASYNC REDUCERS ==========
  // ये async thunks के responses handle करते हैं
  extraReducers: (builder) => {
    // Fetch payslips के तीन states handle करना
    builder
      .addCase(fetchPayslips.pending, (state) => {
        console.log('🔄 Payslips fetch शुरू हुई');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayslips.fulfilled, (state, action) => {
        console.log('✅ Payslips fetch successful:', action.payload.length, 'items');
        state.isLoading = false;
        state.refreshing = false;
        state.payslips = action.payload;
        state.error = null;
      })
      .addCase(fetchPayslips.rejected, (state, action) => {
        console.error('❌ Payslips fetch failed:', action.payload);
        state.isLoading = false;
        state.refreshing = false;
        state.error = action.payload;
      })
      
    // Fetch employee data के states
      .addCase(fetchEmployeeData.pending, (state) => {
        console.log('🔄 Employee data fetch शुरू हुई');
        state.employeeLoading = true;
        state.employeeError = null;
      })
      .addCase(fetchEmployeeData.fulfilled, (state, action) => {
        console.log('✅ Employee data fetch successful');
        state.employeeLoading = false;
        state.employeeData = action.payload;
        state.employeeError = null;
      })
      .addCase(fetchEmployeeData.rejected, (state, action) => {
        console.error('❌ Employee data fetch failed:', action.payload);
        state.employeeLoading = false;
        state.employeeError = action.payload;
      });
  },
});

// Actions को export करना
export const {
  setFromDate,
  setToDate,
  setShowFromPicker,
  setShowToPicker,
  setShowPayslipModal,
  setSelectedPayslip,
  setDownloadLoading,
  setPdfError,
  setImageUrl,
  clearError,
  resetPayslipState,
} = payslipSlice.actions;

// Reducer को export करना
export default payslipSlice.reducer;
