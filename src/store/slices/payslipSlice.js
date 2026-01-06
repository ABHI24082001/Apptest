import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosinstance from '../../utils/axiosInstance';
import BASE_URL from '../../constants/apiConfig';

// ========== ASYNC THUNKS - API CALLS ==========
// ये functions हैं जो API call करते हैं और automatic loading states manage करते हैं

export const fetchPayslips = createAsyncThunk(
  'payslip/fetchPayslips',
  async ({ employeeId, childCompanyId, fromDate, toDate }, { rejectWithValue, dispatch }) => {
    try {
      console.log('🚀 ========== FETCH PAYSLIPS API START ==========');
      console.log('📥 Input Params:', { employeeId, childCompanyId, fromDate, toDate });
      // debugger; // Pause to inspect input

      const formatForDotNet = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T00:00:00`;
      };

      const payload = {
        EmployeeId: employeeId || 0,
        Month: 0,
        Year: 0,
        YearList: null,
        ChildCompanyId: childCompanyId || 0,
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

      console.log('📤 API Payload:', JSON.stringify(payload, null, 2));
      console.log('🌐 API URL:', `${BASE_URL}/PayRollRun/GetEmployeePaySlipList`);
    

      const response = await axiosinstance.post(
        `${BASE_URL}/PayRollRun/GetEmployeePaySlipList`,
        payload
      );

      console.log('✅ ========== PAYSLIP LIST RESPONSE ==========');
      console.log('📊 Full Response:', JSON.stringify(response.data, null, 2));
      console.log('📋 Payslips Count:', response.data?.payRollDraftViewModels?.length || 0);


      const payslipList = response.data?.payRollDraftViewModels || [];

      // Fetch detailed data for each payslip using their IDs
      if (payslipList.length > 0) {
        console.log('🔄 Fetching detailed payslip data for each ID...');
        for (const payslip of payslipList) {
          console.log(`📤 Fetching details for Payslip ID: ${payslip.id}`);
          dispatch(fetchEmployeePayslipDetail(payslip.id));
        }
      }

      return payslipList;
    } catch (error) {
      console.error('❌ ========== PAYSLIP LIST ERROR ==========');
      console.error('❌ Error:', error.message);
      console.error('❌ Full Error:', error);


      if (error.response) {
        console.error('❌ Server Response:', JSON.stringify(error.response.data, null, 2));
        return rejectWithValue(error.response.data.message || 'Server से data नहीं मिला');
      }
      return rejectWithValue(error.message || 'Network error हुई');
    }
  }
);

// Fetch single payslip detail by ID
export const fetchEmployeePayslipDetail = createAsyncThunk(
  'payslip/fetchEmployeePayslipDetail',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🚀 ========== FETCH PAYSLIP DETAIL API START ==========');
      console.log('📥 Payslip ID:', id);
      // debugger; // Pause to inspect ID

      if (!id) {
        throw new Error('Payslip ID चाहिए');
      }

      const apiUrl = `${BASE_URL}/PayRollRun/GetEmployeePaySlip/${id}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await axiosinstance.get(apiUrl);

      console.log('✅ ========== PAYSLIP DETAIL RESPONSE ==========');
      console.log('📊 Response Status:', response.status);
      console.log('📦 Payslip Detail Data:', JSON.stringify(response.data, null, 2));
      // debugger; // Pause to inspect detail data

      return { id, data: response.data };
    } catch (error) {
      console.error('❌ ========== PAYSLIP DETAIL ERROR ==========');
      console.error('❌ Payslip ID:', id);
      console.error('❌ Error:', error.message);
      console.error('❌ Full Error:', error);
      // debugger; // Pause on error

      return rejectWithValue(error.response?.data?.message || error.message || 'Payslip detail नहीं मिला');
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
  payslipDetails: {},          // Store detailed payslip data by ID
  payslipDetailLoading: false, // Loading state for detail fetch
  payslipDetailError: null,    // Error state for detail fetch
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
      state.payslipDetailError = null;
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
    builder
      // Fetch payslips list
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
      
      // Fetch payslip detail by ID
      .addCase(fetchEmployeePayslipDetail.pending, (state) => {
        console.log('🔄 Payslip detail fetch शुरू हुई');
        state.payslipDetailLoading = true;
        state.payslipDetailError = null;
      })
      .addCase(fetchEmployeePayslipDetail.fulfilled, (state, action) => {
        console.log('✅ Payslip detail fetch successful for ID:', action.payload.id);
        console.log('📦 Detail Data:', JSON.stringify(action.payload.data, null, 2));
        state.payslipDetailLoading = false;
        state.payslipDetails[action.payload.id] = action.payload.data;
        state.payslipDetailError = null;
      })
      .addCase(fetchEmployeePayslipDetail.rejected, (state, action) => {
        console.error('❌ Payslip detail fetch failed:', action.payload);
        state.payslipDetailLoading = false;
        state.payslipDetailError = action.payload;
      })
      
      // Fetch employee data
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
