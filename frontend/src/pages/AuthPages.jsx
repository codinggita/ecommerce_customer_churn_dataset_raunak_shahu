import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, CircularProgress, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../utils/api';
import { setCredentials } from '../store/slices';

export function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      setErrorMsg(null);
      setIsSubmitting(true);
      try {
        const response = await api.post('/auth/login', {
          email: values.email,
          password: values.password,
        });

        const { user, token } = response.data.data;
        dispatch(setCredentials({ user, token }));
        navigate('/');
      } catch (err) {
        console.error("Login failed:", err);
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <Card sx={{ maxWidth: 450, width: '100%', backdropFilter: 'blur(16px)', background: 'rgba(30, 41, 59, 0.8)' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', justifyContent: 'center' }}>
                <LockOpenIcon sx={{ fontSize: 32, color: 'primary.contrastText' }} />
              </Box>
              
              <Box textAlign="center">
                <Typography variant="h5" className="font-bold text-slate-50">
                  Welcome Back
                </Typography>
                <Typography variant="body2" className="mt-1 text-slate-400">
                  Sign in to manage your customer analytics
                </Typography>
              </Box>

              {errorMsg && (
                <Alert severity="error" className="w-full text-left" sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
                  {errorMsg}
                </Alert>
              )}

              <TextField
                id="email"
                name="email"
                label="Email Address"
                fullWidth
                variant="outlined"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                placeholder="e.g. admin@demo.com"
                slotProps={{
                  input: { style: { color: 'white' } },
                  inputLabel: { style: { color: '#94a3b8' } }
                }}
              />

              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                placeholder="e.g. ••••••••"
                slotProps={{
                  input: { style: { color: 'white' } },
                  inputLabel: { style: { color: '#94a3b8' } }
                }}
              />

              <Button 
                type="submit"
                variant="contained" 
                color="primary" 
                fullWidth 
                disabled={isSubmitting}
                sx={{ height: 48 }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
              </Button>

              <Typography variant="body2" className="text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
                  Create one
                </Link>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'User',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      role: Yup.string()
        .oneOf(['Admin', 'User'], 'Invalid Role')
        .required('User role is required'),
    }),
    onSubmit: async (values) => {
      setErrorMsg(null);
      setIsSubmitting(true);
      try {
        const response = await api.post('/auth/register', {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        });

        const { user, token } = response.data.data;
        dispatch(setCredentials({ user, token }));
        navigate('/');
      } catch (err) {
        console.error("Registration failed:", err);
        setErrorMsg(err.message || 'Registration failed. Please check inputs.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <Card sx={{ maxWidth: 450, width: '100%', backdropFilter: 'blur(16px)', background: 'rgba(30, 41, 59, 0.8)' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', justifyContent: 'center' }}>
                <AppRegistrationIcon sx={{ fontSize: 32, color: 'secondary.contrastText' }} />
              </Box>
              
              <Box textAlign="center">
                <Typography variant="h5" className="font-bold text-slate-50">
                  Create Account
                </Typography>
                <Typography variant="body2" className="mt-1 text-slate-400">
                  Register to monitor customer churn patterns
                </Typography>
              </Box>

              {errorMsg && (
                <Alert severity="error" className="w-full text-left" sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
                  {errorMsg}
                </Alert>
              )}

              <TextField
                id="name"
                name="name"
                label="Full Name"
                fullWidth
                variant="outlined"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                placeholder="e.g. John Doe"
                slotProps={{
                  input: { style: { color: 'white' } },
                  inputLabel: { style: { color: '#94a3b8' } }
                }}
              />

              <TextField
                id="email"
                name="email"
                label="Email Address"
                fullWidth
                variant="outlined"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                placeholder="e.g. user@demo.com"
                slotProps={{
                  input: { style: { color: 'white' } },
                  inputLabel: { style: { color: '#94a3b8' } }
                }}
              />

              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                placeholder="e.g. Minimum 6 characters"
                slotProps={{
                  input: { style: { color: 'white' } },
                  inputLabel: { style: { color: '#94a3b8' } }
                }}
              />

              <FormControl fullWidth variant="outlined">
                <InputLabel id="role-label" sx={{ color: '#94a3b8' }}>User Authority Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  label="User Authority Role"
                  sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}
                >
                  <MenuItem value="User">User (Regular Access)</MenuItem>
                  <MenuItem value="Admin">Admin (Full Access)</MenuItem>
                </Select>
              </FormControl>

              <Button 
                type="submit"
                variant="contained" 
                color="secondary" 
                fullWidth 
                disabled={isSubmitting}
                sx={{ height: 48 }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>

              <Typography variant="body2" className="text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                  Sign In
                </Link>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
