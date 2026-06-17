import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial auth state from localStorage if present
const initialToken = localStorage.getItem('token') || null;
let initialUser = null;
try {
  const userStr = localStorage.getItem('user');
  initialUser = userStr ? JSON.parse(userStr) : null;
} catch (e) {
  console.error("Failed to parse initial user state from localStorage", e);
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    loading: false,
    themeMode: localStorage.getItem('themeMode') || 'dark',
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    toggleTheme: (state) => {
      const nextMode = state.themeMode === 'light' ? 'dark' : 'light';
      state.themeMode = nextMode;
      localStorage.setItem('themeMode', nextMode);
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const { toggleSidebar, setSidebar, setLoading, toggleTheme } = uiSlice.actions;

export const authReducer = authSlice.reducer;
export const uiReducer = uiSlice.reducer;
