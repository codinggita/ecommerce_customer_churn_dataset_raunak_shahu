import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Tooltip, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShieldIcon from '@mui/icons-material/Shield';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { toggleSidebar, toggleTheme, clearCredentials } from '../store/slices';

const drawerWidth = 260;

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, themeMode } = useSelector((state) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(clearCredentials());
    navigate('/login');
  };

  // Determine current active section name for title
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/customers': return 'Customer Database';
      case '/analytics': return 'Analytics Deep Dive';
      case '/admin-insights': return 'Administrative Insights';
      default: return 'Customer Analytics';
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  ];

  // Admin-only menu items
  if (user && user.role === 'Admin') {
    menuItems.push({ text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' });
    menuItems.push({ text: 'Admin Insights', icon: <ShieldIcon />, path: '/admin-insights' });
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', transition: 'all 0.3s ease' }}>
      
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && {
            marginLeft: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={() => dispatch(toggleSidebar())}
              edge="start"
              sx={{ mr: 1, '&:hover': { transform: 'scale(1.05)' }, '&:active': { transform: 'scale(0.95)' } }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 850, letterSpacing: '-0.02em' }}>
              {getPageTitle()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle Button */}
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}>
              <IconButton 
                onClick={() => dispatch(toggleTheme())} 
                color="inherit"
                sx={{ '&:hover': { transform: 'rotate(15deg) scale(1.05)' }, '&:active': { transform: 'scale(0.95)' }, transition: 'all 0.2s' }}
              >
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Profile Menu Trigger */}
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
                    borderRadius: 3,
                    minWidth: 190,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.75rem' }}>{user?.email}</Typography>
                <Typography variant="caption" color="primary" sx={{ display: 'block', fontWeight: 700, mt: 0.5, letterSpacing: '0.05em' }}>
                  {user?.role?.toUpperCase()}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error" fontWeight={600}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 74,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : 74,
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: [1] }}>
          <Typography variant="subtitle1" className="text-gradient-gold font-extrabold tracking-wider" sx={{ display: sidebarOpen ? 'block' : 'none', letterSpacing: '0.1em' }}>
            CHURN ANALYTICS
          </Typography>
          {!sidebarOpen && (
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.85rem', fontWeight: 800, color: 'primary.contrastText' }}>C</Avatar>
          )}
        </Toolbar>
        <Divider />
        
        <List sx={{ pt: 2.5, px: 1.5 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.75 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: sidebarOpen ? 'initial' : 'center',
                    px: 2,
                    borderRadius: 2.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.main' : 'action.hover',
                      transform: 'scale(1.02)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 2.5 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ opacity: sidebarOpen ? 1 : 0 }} 
                    primaryTypographyProps={{ style: { fontWeight: isActive ? 800 : 600, fontSize: '0.925rem' } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content Workspace */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2.5, md: 4 }, mt: 8, overflowX: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
}
