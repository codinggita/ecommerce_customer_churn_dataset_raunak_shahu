import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import { Unauthorized, NotFound } from './pages/ErrorPages';
import AdminInsights from './pages/AdminInsights';
import Customers from './pages/Customers';

function App() {
  const { themeMode } = useSelector((state) => state.ui);
  const activeTheme = themeMode === 'light' ? lightTheme : darkTheme;

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

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
