import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, AppBar, Toolbar, Typography, Divider, IconButton, 
  Avatar, Menu, MenuItem, Tooltip, useTheme, Stack, Chip, ListItemIcon, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShieldIcon from '@mui/icons-material/Shield';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { toggleTheme, clearCredentials } from '../store/slices';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { user } = useSelector((state) => state.auth);
  const { themeMode } = useSelector((state) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileClose = () => {
    setMobileAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(clearCredentials());
    navigate('/login');
  };

  // Determine current active section name for title on smaller screens
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/customers': return 'Customer Database';
      case '/analytics': return 'Analytics Deep Dive';
      case '/admin-insights': return 'Administrative Insights';
      default: return 'Customer Analytics';
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} />, path: '/dashboard' },
    { text: 'Customers', icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: '/customers' },
  ];

  // Admin-only menu items
  if (user && user.role === 'Admin') {
    menuItems.push({ text: 'Analytics', icon: <BarChartIcon sx={{ fontSize: 20 }} />, path: '/analytics' });
    menuItems.push({ text: 'Admin Insights', icon: <ShieldIcon sx={{ fontSize: 20 }} />, path: '/admin-insights' });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      
      {/* Horizontal Top Navigation Bar */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(19, 21, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          top: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, md: 4 }, py: 0.5, minHeight: '56px !important' }}>
          {/* Left Side: Navigation Items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile Menu Icon Button */}
            <IconButton
              color="inherit"
              aria-label="open mobile menu"
              onClick={handleMobileOpen}
              edge="start"
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Desktop Navigation Items */}
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      borderRadius: '12px',
                      px: 2.2,
                      py: 1,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 700 : 600,
                      backgroundColor: isActive 
                        ? (theme.palette.mode === 'dark' ? 'rgba(230, 195, 100, 0.08)' : 'rgba(201, 168, 76, 0.08)')
                        : 'transparent',
                      textTransform: 'none',
                      fontSize: '0.925rem',
                      transition: 'all 0.2s ease',
                      border: '1px solid',
                      borderColor: isActive ? 'rgba(201, 168, 76, 0.2)' : 'transparent',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: isActive 
                          ? (theme.palette.mode === 'dark' ? 'rgba(230, 195, 100, 0.12)' : 'rgba(201, 168, 76, 0.12)')
                          : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'),
                        transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Mobile Page Title Header (Visible on xs screens) */}
          <Typography 
            variant="subtitle1" 
            sx={{ 
              display: { xs: 'block', md: 'none' }, 
              fontWeight: 800, 
              letterSpacing: '-0.01em',
              color: 'text.primary'
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* Right Side: Theme Mode & Account Profile Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Theme Toggle Button */}
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}>
              <IconButton 
                onClick={() => dispatch(toggleTheme())} 
                color="inherit"
                sx={{ 
                  '&:hover': { transform: 'rotate(15deg) scale(1.05)' }, 
                  '&:active': { transform: 'scale(0.95)' }, 
                  transition: 'all 0.2s' 
                }}
              >
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Profile Avatar Settings Trigger */}
            <Tooltip title="Account Settings">
              <IconButton onClick={handleMenuOpen} sx={{ p: 0, '&:hover': { transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: user?.role === 'Admin' ? 'primary.main' : 'secondary.main',
                    width: 38,
                    height: 38,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: user?.role === 'Admin' ? 'primary.contrastText' : 'secondary.contrastText',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Premium Account Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{ mt: 1.5 }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '16px',
                    minWidth: 240,
                    p: 2,
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 10px 40px rgba(0, 0, 0, 0.5)' : '0 10px 40px rgba(0, 0, 0, 0.08)',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(19, 21, 23, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    backgroundImage: 'none'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1.5, px: 1 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: user?.role === 'Admin' ? 'primary.main' : 'secondary.main',
                    width: 56,
                    height: 56,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: user?.role === 'Admin' ? 'primary.contrastText' : 'secondary.contrastText',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.25 }}>{user?.email}</Typography>
                </Box>
                <Chip 
                  label={user?.role} 
                  size="small" 
                  color={user?.role === 'Admin' ? 'primary' : 'secondary'}
                  sx={{ fontWeight: 700, px: 1.5, borderRadius: '6px' }}
                />
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <MenuItem onClick={handleLogout} sx={{ 
                py: 1.2, 
                borderRadius: '10px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  '& .logout-text, & .logout-icon': {
                    color: 'error.main'
                  }
                }
              }}>
                <LogoutIcon className="logout-icon" fontSize="small" sx={{ color: 'text.secondary', transition: 'all 0.2s' }} />
                <Typography className="logout-text" sx={{ fontWeight: 750, color: 'text.primary', transition: 'all 0.2s', fontSize: '0.9rem' }}>
                  Log Out
                </Typography>
              </MenuItem>
            </Menu>

            {/* Mobile Dropdown Menu (Visible on xs/sm screens) */}
            <Menu
              anchorEl={mobileAnchorEl}
              open={Boolean(mobileAnchorEl)}
              onClose={handleMobileClose}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              sx={{ mt: 1.5, display: { xs: 'block', md: 'none' } }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '16px',
                    minWidth: 200,
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(19, 21, 23, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    backgroundImage: 'none'
                  }
                }
              }}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <MenuItem 
                    key={item.text} 
                    onClick={() => {
                      handleMobileClose();
                      navigate(item.path);
                    }}
                    sx={{ 
                      borderRadius: '10px',
                      my: 0.5,
                      py: 1,
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? 'rgba(201, 168, 76, 0.06)' : 'transparent',
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 32 }}>
                      {item.icon}
                    </ListItemIcon>
                    {item.text}
                  </MenuItem>
                );
              })}
            </Menu>

          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Workspace */}
      <Box component="main" sx={{
        flexGrow: 1,
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3, md: 3 },
        pb: { xs: 4, sm: 5, md: 6 },
        boxSizing: 'border-box',
      }}>
        {children}
      </Box>
    </Box>
  );
}
