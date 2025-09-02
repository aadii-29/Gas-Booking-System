import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      console.log('loginUser: Response', JSON.stringify(response.data, null, 2));
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        return {
          user: {
            _id: response.data.user.id,
            name: response.data.user.username,
            email: response.data.user.email,
            role: response.data.user.role.toLowerCase(),
            AgencyID: response.data.user.AgencyID,
            CustomerID: response.data.user.CustomerID,
            EmployeeID: response.data.user.EmployeeID,
          },
          accessToken: response.data.accessToken,
        };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('loginUser thunk error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getUserInfo();
      const userData = response.data.data;
      console.log('fetchUserInfo: Response', JSON.stringify(response.data, null, 2));
      return {
        _id: userData.id,
        name: userData.username,
        email: userData.email,
        role: userData.role.toLowerCase(),
        permissions: userData.permissions,
        loginCount: userData.loginCount,
        profilePicture: userData.profilePicture,
        AgencyID: userData.AgencyID,
        CustomerID: userData.CustomerID,
        EmployeeID: userData.EmployeeID,
      };
    } catch (error) {
      console.error('fetchUserInfo error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user info');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(userData);
      console.log('signupUser: Response', response.data);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('signupUser thunk error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.logout();
      localStorage.removeItem('accessToken');
      console.log('logoutUser: Response', response.data);
      return response.data;
    } catch (error) {
      console.error('logoutUser error:', error.response?.data);
      localStorage.removeItem('accessToken');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(emailData);
      console.log('forgotPassword: Response', response.data);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('forgotPassword error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to send password reset link');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'auth/uploadProfilePicture',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authApi.uploadProfilePicture(formData);
      const userData = response.data.data;
      console.log('uploadProfilePicture: Response', response.data);
      return {
        _id: userData.id,
        name: userData.username,
        email: userData.email,
        role: userData.role.toLowerCase(),
        permissions: userData.permissions,
        loginCount: userData.loginCount,
        profilePicture: userData.profilePicture,
        AgencyID: userData.AgencyID,
        CustomerID: userData.CustomerID,
        EmployeeID: userData.EmployeeID,
      };
    } catch (error) {
      console.error('uploadProfilePicture error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to upload profile picture');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        console.log('authSlice: User state updated', JSON.stringify(state.user, null, 2));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        console.log('authSlice: User state updated (fetchUserInfo)', JSON.stringify(state.user, null, 2));
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;