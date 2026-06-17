import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Box, Alert, Stack } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

export function Login() {
  const navigate = useNavigate();

  const handleMockLogin = (role) => {
    localStorage.setItem('token', 'mock_jwt_token_for_' + role.toLowerCase());
    localStorage.setItem('user', JSON.stringify({
      name: `Demo ${role}`,
      email: `${role.toLowerCase()}@demo.com`,
      role: role
    }));
    navigate('/');
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <Card sx={{ maxWidth: 450, width: '100%', backdropFilter: 'blur(16px)', background: 'rgba(30, 41, 59, 0.8)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', justifyContent: 'center' }}>
              <LockOpenIcon sx={{ fontSize: 32, color: 'primary.contrastText' }} />
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h5" className="font-bold text-slate-50">
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1 text-slate-400">
                Sign in to manage your customer analytics
              </Typography>
            </Box>

            <TextField
              label="Email Address"
              fullWidth
              variant="outlined"
              defaultValue="admin@demo.com"
              disabled
              sx={{ '& input': { color: 'white' }, '& label': { color: 'slate.400' } }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              defaultValue="••••••••"
              disabled
              sx={{ '& input': { color: 'white' } }}
            />

            <Alert severity="info" className="w-full text-left" sx={{ bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#0288d1' }}>
              Authentication APIs will be linked in PR 5. Use the mock triggers below to test the routing and guards.
            </Alert>

            <Stack direction="row" spacing={2} className="w-full">
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={() => handleMockLogin('Admin')}
              >
                Log In (Admin)
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth 
                onClick={() => handleMockLogin('User')}
              >
                Log In (User)
              </Button>
            </Stack>

            <Typography variant="body2" className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
                Create one
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export function Register() {
  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <Card sx={{ maxWidth: 450, width: '100%', backdropFilter: 'blur(16px)', background: 'rgba(30, 41, 59, 0.8)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', justifyContent: 'center' }}>
              <AppRegistrationIcon sx={{ fontSize: 32, color: 'secondary.contrastText' }} />
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h5" className="font-bold text-slate-50">
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1 text-slate-400">
                Register to monitor customer churn patterns
              </Typography>
            </Box>

            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              disabled
              sx={{ '& input': { color: 'white' } }}
            />

            <TextField
              label="Email Address"
              fullWidth
              variant="outlined"
              disabled
              sx={{ '& input': { color: 'white' } }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              disabled
              sx={{ '& input': { color: 'white' } }}
            />

            <Alert severity="info" className="w-full text-left" sx={{ bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#0288d1' }}>
              Registration APIs will be fully integrated with validation in PR 5.
            </Alert>

            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth 
              disabled
            >
              Sign Up
            </Button>

            <Typography variant="body2" className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                Sign In
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
