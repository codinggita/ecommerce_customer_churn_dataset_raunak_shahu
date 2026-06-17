import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, Grid, Alert, Chip } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: '100%' }}>
        {/* Content grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" className="font-bold mb-4">
                  Account Authority Level
                </Typography>
                <Box className="flex items-center gap-3 mb-4">
                  <Chip 
                    label={user?.role || 'User'} 
                    color={user?.role === 'Admin' ? 'primary' : 'secondary'} 
                    className="font-bold"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Role-based route guard checks this flag.
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  If you are logged in as an <strong>Admin</strong>, you can access the Admin panel. If you are a standard <strong>User</strong>, clicking the button below will trigger the route guard and redirect you to the Unauthorized page.
                </Typography>

                <Box className="mt-6">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<ShieldIcon />}
                    onClick={() => navigate('/admin-insights')}
                  >
                    Go to Admin Insights
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" className="font-bold mb-4">
                  Next Implementation Steps (PR 7)
                </Typography>
                <Alert severity="success" className="mb-4">
                  Dashboard layouts and navigation are working.
                </Alert>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Next, we will implement the Customer List Page featuring dynamic tables rendering real customer accounts from the MongoDB database, along with backend pagination and sorting.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

export default Dashboard;
