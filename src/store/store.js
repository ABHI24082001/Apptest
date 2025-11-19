import { configureStore } from '@reduxjs/toolkit';
import payslipReducer from './slices/payslipSlice';

// यह आपका main storage है - जैसे बड़ा warehouse
export const store = configureStore({
  reducer: {
    payslip: payslipReducer, // Payslip का अलग section
    // auth: authReducer,    // भविष्य में auth का section
    // leaves: leaveReducer, // भविष्य में leaves का section
  },
  
  // Middleware - ये गार्ड की तरह काम करते हैं
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Date objects को ignore करो क्योंकि वे serializable नहीं हैं
        ignoredActions: ['payslip/setFromDate', 'payslip/setToDate'],
        ignoredActionsPaths: ['payload.fromDate', 'payload.toDate'],
        ignoredPaths: ['payslip.fromDate', 'payslip.toDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
