import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import { Unauthorized, NotFound } from './pages/ErrorPages';
import AdminInsights from './pages/AdminInsights';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import { hideToast } from './store/slices';

function App() {
  const dispatch = useDispatch();
  const { themeMode, toast } = useSelector((state) => state.ui);
  const activeTheme = themeMode === 'light' ? lightTheme : darkTheme;

  const handleCloseToast = () => {
    dispatch(hideToast());
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes (Authenticated users) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } 
          />

          {/* Admin Restricted Routes */}
          <Route 
            path="/admin-insights" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminInsights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      {/* Global Snackbar Toast Alert */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
