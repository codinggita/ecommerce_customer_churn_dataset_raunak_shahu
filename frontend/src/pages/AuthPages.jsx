import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card, CardContent, Typography, TextField, Button, Box, Alert, Stack,
  CircularProgress, MenuItem, FormControl, InputLabel, Select, Grid, useTheme,
  ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SecurityIcon from '@mui/icons-material/Security';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../utils/api';
import { setCredentials } from '../store/slices';

// ─── Branding Left Column Banner ──────────────────────────────────────────────
function AuthLeftBanner({ isRegister = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const benefits = [
    {
      icon: <ShowChartIcon sx={{ color: '#e6c364' }} />,
      title: 'Executive Churn Metrics',
      desc: 'Visualize retention behaviors and market share splits with interactive Recharts pipelines.'
    },
    {
      icon: <PeopleAltIcon sx={{ color: '#e6c364' }} />,
      title: '15,259 Active Customer Records',
      desc: 'Explore, page, sort, and segment a fully seeded database of real customer transactions.'
    },
    {
      icon: <SecurityIcon sx={{ color: '#e6c364' }} />,
      title: 'Role-Based Administration',
      desc: 'Toggle custom database segments and access advanced deep-dives restricted to Admin accounts.'
    }
  ];

  return (
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        p: 6,
        bgcolor: isDark ? '#0c0d0e' : '#141619', // Premium deep dark side
        color: '#f1f3f5',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Background radial overlays */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(230, 195, 100, 0.06) 0%, rgba(230, 195, 100, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(124, 77, 255, 0.05) 0%, rgba(124, 77, 255, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e6c364' }}>
            Database Intelligence
          </Typography>
          <Typography variant="h3" fontWeight={900} sx={{ mt: 1, mb: 2, lineHeight: 1.1 }}>
            E-Commerce Churn <span className="text-gradient-gold">Analytics</span>
          </Typography>
          <Typography variant="body1" sx={{ color: '#919da9', maxWidth: 460 }}>
            Identify at-risk accounts, analyze payment method churn correlations, and manage customer segments securely.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {benefits.map((b, idx) => (
            <Stack key={idx} direction="row" spacing={2.5} alignItems="flex-start">
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                {b.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f1f3f5' }}>{b.title}</Typography>
                <Typography variant="body2" sx={{ color: '#919da9', mt: 0.5, lineHeight: 1.4 }}>{b.desc}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <CheckCircleOutlinedIcon sx={{ color: '#e6c364', fontSize: 20 }} />
          <Typography variant="caption" sx={{ color: '#919da9', fontWeight: 500 }}>
            Fully operational connected endpoints. Live database seeding verified.
          </Typography>
        </Box>
      </Stack>
    </Grid>
  );
}

// ─── Login Component ──────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Grid container sx={{ width: '100%' }}>
        
        {/* Left Column Banner */}
        <AuthLeftBanner />

        {/* Right Column Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative'
          }}
        >
          {/* Subtle gradient glow in light/dark mode */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '40%',
              height: '40%',
              background: theme.palette.mode === 'dark' 
                ? 'radial-gradient(circle, rgba(230, 195, 100, 0.03) 0%, rgba(230, 195, 100, 0) 70%)'
                : 'radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, rgba(201, 168, 76, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <Card sx={{ maxWidth: 460, width: '100%', border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3.5}>
                  
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                      <Box sx={{ p: 1.25, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', color: 'primary.contrastText' }}>
                        <LockOpenIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h5" fontWeight={850} letterSpacing={-0.5}>
                        Welcome Back
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Sign in to your administrative account to manage churn analytics.
                    </Typography>
                  </Box>

                  {errorMsg && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
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
                    placeholder="admin@example.com"
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.005)' },
                      }
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
                    placeholder="••••••••"
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.005)' },
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ height: 50, borderRadius: 3, fontSize: '0.95rem' }}
                  >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                  </Button>

                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link to="/register" style={{ color: theme.palette.primary.main, fontWeight: 700, textDecoration: 'none' }}>
                        Create one
                      </Link>
                    </Typography>
                  </Box>

                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Register Component ───────────────────────────────────────────────────────
export function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Grid container sx={{ width: '100%' }}>
        
        {/* Left Column Banner */}
        <AuthLeftBanner isRegister />

        {/* Right Column Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative'
          }}
        >
          {/* Subtle gradient glow in light/dark mode */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '40%',
              height: '40%',
              background: theme.palette.mode === 'dark' 
                ? 'radial-gradient(circle, rgba(124, 77, 255, 0.02) 0%, rgba(124, 77, 255, 0) 70%)'
                : 'radial-gradient(circle, rgba(124, 77, 255, 0.04) 0%, rgba(124, 77, 255, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <Card sx={{ maxWidth: 460, width: '100%', border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                      <Box sx={{ p: 1.25, borderRadius: 3, bgcolor: 'secondary.main', display: 'flex', color: 'secondary.contrastText' }}>
                        <AppRegistrationIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h5" fontWeight={850} letterSpacing={-0.5}>
                        Create Account
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Register to access the customer database and check analytics.
                    </Typography>
                  </Box>

                  {errorMsg && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
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
                    placeholder="John Doe"
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.005)' },
                      }
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
                    placeholder="user@example.com"
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.005)' },
                      }
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
                    placeholder="Minimum 6 characters"
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.005)' },
                      }
                    }}
                  />

                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="role-label" shrink>User Authority Role</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      label="User Authority Role"
                      displayEmpty
                      sx={{
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.005)' },
                      }}
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
                    sx={{ height: 50, borderRadius: 3, fontSize: '0.95rem', mt: 1 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                  </Button>

                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: theme.palette.secondary.main, fontWeight: 700, textDecoration: 'none' }}>
                        Sign In
                      </Link>
                    </Typography>
                  </Box>

                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
