import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Button, Grid, Card, CardContent, Container, Stack, useTheme, Avatar, Divider
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SecurityIcon from '@mui/icons-material/Security';
import BrushIcon from '@mui/icons-material/Brush';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LoginIcon from '@mui/icons-material/Login';

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Check if authenticated
  const { token, user } = useSelector((state) => state.auth);

  const features = [
    {
      icon: <ShowChartIcon sx={{ color: '#e6c364', fontSize: 32 }} />,
      title: 'Executive Churn Metrics',
      desc: 'Interactive Recharts visualization pipelines mapping signup trends, city breakdowns, and LTV distribution analysis.'
    },
    {
      icon: <PeopleAltIcon sx={{ color: '#e6c364', fontSize: 32 }} />,
      title: '15,259 Seeded Transactions',
      desc: 'A robust production-grade dataset loaded into MongoDB Atlas to demonstrate sorting, paging, and searching operations.'
    },
    {
      icon: <BrushIcon sx={{ color: '#e6c364', fontSize: 32 }} />,
      title: 'Premium Theme Re-Skin',
      desc: 'LexIndia-inspired style architecture utilizing Gold (#c9a84c) and Violet (#7c4dff) accents with sleek glassmorphic profiles.'
    },
    {
      icon: <SecurityIcon sx={{ color: '#e6c364', fontSize: 32 }} />,
      title: 'Role-Based Authorization',
      desc: 'Custom access controls securing administrative modules and VIP tables from unauthorized user roles.'
    }
  ];

  const techStack = [
    { name: 'React 19', category: 'Frontend framework' },
    { name: 'Material UI (MUI)', category: 'Design system components' },
    { name: 'Tailwind CSS', category: 'Styling layout classes' },
    { name: 'Redux Toolkit', category: 'Global state manager' },
    { name: 'Recharts', category: 'Data visualization pipelines' },
    { name: 'Node.js & Express', category: 'REST API services' },
    { name: 'MongoDB Atlas', category: 'Cloud database storage' },
    { name: 'JSON Web Tokens', category: 'Authentication standard' }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glowing overlays */}
      <Box sx={{
        position: 'absolute',
        top: '-15%',
        left: '-15%',
        width: '60%',
        height: '60%',
        background: isDark 
          ? 'radial-gradient(circle, rgba(230, 195, 100, 0.05) 0%, rgba(230, 195, 100, 0) 70%)'
          : 'radial-gradient(circle, rgba(201, 168, 76, 0.04) 0%, rgba(201, 168, 76, 0) 70%)',
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-15%',
        right: '-15%',
        width: '60%',
        height: '60%',
        background: isDark 
          ? 'radial-gradient(circle, rgba(124, 77, 255, 0.04) 0%, rgba(124, 77, 255, 0) 70%)'
          : 'radial-gradient(circle, rgba(124, 77, 255, 0.03) 0%, rgba(124, 77, 255, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Header Navigation */}
      <Box sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        background: isDark ? 'rgba(19, 21, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        py: 1.8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 36, 
                height: 36, 
                fontSize: '1rem', 
                fontWeight: 800, 
                color: 'primary.contrastText' 
              }}>
                A
              </Avatar>
              <Typography variant="h6" className="text-gradient-gold font-extrabold tracking-tight" sx={{ fontSize: '1.25rem' }}>
                Antigravity
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              {token && user ? (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/dashboard')}
                  startIcon={<RocketLaunchIcon />}
                  sx={{ borderRadius: '12px', fontWeight: 700 }}
                >
                  Enter Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="text" 
                    color="inherit" 
                    onClick={() => navigate('/login')}
                    startIcon={<LoginIcon />}
                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                  >
                    Log In
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/register')}
                    sx={{ borderRadius: '12px', fontWeight: 700 }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box>
              <Typography variant="caption" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'primary.main', fontWeight: 700 }}>
                Enterprise Customer Intelligence
              </Typography>
              <Typography variant="h1" sx={{ mt: 1.5, mb: 3, fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.8rem' }, lineHeight: 1.1 }}>
                Customer Churn <br />
                <span className="text-gradient-gold">Analytics Pipeline</span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', mb: 4, maxWidth: 580, lineHeight: 1.6 }}>
                Identify retention behaviors, predict churning risks, and manage user demographics within a premium gold-accented analytics cockpit built for modern databases.
              </Typography>
              
              <Stack direction="row" spacing={2.5}>
                {token && user ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700, boxShadow: '0 4px 20px rgba(201,168,76,0.25)' }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700, boxShadow: '0 4px 20px rgba(201,168,76,0.25)' }}
                    >
                      Get Started
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}
                    >
                      Demo Log In
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '24px', 
              border: '1px solid',
              borderColor: 'divider',
              background: isDark ? 'rgba(19, 21, 23, 0.4)' : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: 400
            }}>
              <Box sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(124,77,255,0.15) 100%)',
                p: 4,
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <Typography variant="h2" sx={{ color: 'primary.main', fontWeight: 900 }}>15.2k+</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>Fully Seeded Database</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                  Loaded with demographic details, purchases, LTV, credit balances, and session engagement indexes.
                </Typography>
                <Divider sx={{ my: 3 }} />
                <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
                  <CheckCircleOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Connected to Live MongoDB Cluster
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Grid Section */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: { xs: 8, md: 12 }, bgcolor: isDark ? 'rgba(19, 21, 23, 0.2)' : 'rgba(255,255,255,0.2)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="caption" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'secondary.main', fontWeight: 700 }}>
              System Highlights
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Designed For High-Fidelity Data Management
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((f, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: '16px', 
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  background: isDark ? 'rgba(19, 21, 23, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.04)'
                  }
                }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', display: 'inline-flex', mb: 2.5 }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Tech Stack Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'primary.main', fontWeight: 700 }}>
            Architecture Overview
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Fully Connected Full-Stack Engine
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {techStack.map((tech, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ 
                p: 3, 
                borderRadius: '16px', 
                border: '1px solid',
                borderColor: 'divider',
                background: isDark ? 'rgba(19, 21, 23, 0.5)' : '#ffffff',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'secondary.main',
                  transform: 'scale(1.02)'
                }
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {tech.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {tech.category}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 5, textAlign: 'center', bgcolor: isDark ? '#0c0d0e' : '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Antigravity Customer Churn Analytics. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
