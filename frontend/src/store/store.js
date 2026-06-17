import { configureStore } from '@reduxjs/toolkit';
import { authReducer, uiReducer } from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors with non-serializable payloads if any
    }),
});

export default store;
