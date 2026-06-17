import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import { Unauthorized, NotFound } from './pages/ErrorPages';
import AdminInsights from './pages/AdminInsights';

// Simple global UI theme context so child components can toggle the theme
export const ThemeModeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {}
});

export const useThemeMode = () => useContext(ThemeModeContext);

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'dark');

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    localStorage.setItem('themeMode', nextMode);
  };

  const activeTheme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
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
    </ThemeModeContext.Provider>
  );
}

export default App;
