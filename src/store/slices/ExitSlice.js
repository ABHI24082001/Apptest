import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createSlice , createAsyncThunk } from '@reduxjs/toolkit';
import axiosinstance from '../../utils/axiosInstance';
import BASE_URL from '../../constants/apiConfig';
// ========== ASYNC THUNKS - API CALLS ==========
// ये functions हैं जो API call करते हैं और automatic loading states manage करते हैं

export const fetchExitDetails = createAsyncThunk(
    'EmployeeExit/GetExEmpByEmpId',
    async ({})

)