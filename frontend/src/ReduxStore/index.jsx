import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import customerReducer from './slices/customerSlice';
import deliveryStaffReducer from './slices/deliveryStaffSlice';
import agencyReducer from './slices/agencySlice';
import adminReducer from './slices/adminSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'], // Persist only auth and user slices
};

const persistedReducer = persistCombineReducers(persistConfig, {
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  deliveryStaff: deliveryStaffReducer,
  agency: agencyReducer,
  admin: adminReducer,
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
});

export const persistor = persistStore(store);