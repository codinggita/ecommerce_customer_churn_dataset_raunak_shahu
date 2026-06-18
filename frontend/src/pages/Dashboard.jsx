import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert, Stack, 
  useTheme 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PercentIcon from '@mui/icons-material/Percent';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';

// Recharts components
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartTooltip, 
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';

export default function Dashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Data states
  const [churnData, setChurnData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [signupData, setSignupData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Computed summary states
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    churnRate: 0,
    avgLTV: 0,
    avgPurchases: 0,
  });

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch analytics in parallel
      const [churnRes, countryRes, signupRes] = await Promise.all([
        api.get('/analytics/customers/churn-analysis'),
        api.get('/analytics/customers/country-analysis'),
        api.get('/analytics/customers/signup-analysis'),
      ]);

      const churnList = churnRes.data.data || [];
      const countryList = countryRes.data.data || [];
      const signupList = signupRes.data.data || [];

      setChurnData(churnList);
      setCountryData(countryList.slice(0, 8)); // Top 8 countries for better chart readability
      setSignupData(signupList);

      // Compute statistics summary
      let total = 0;
      let churned = 0;
      let sumLTV = 0;
      let sumPurchases = 0;

      churnList.forEach(group => {
        total += group.count;
        if (group._id === 1) churned = group.count;
        sumLTV += (group.averageLifetimeValue || 0) * group.count;
        sumPurchases += (group.averageLoginFrequency || 0) * group.count; // Use login frequency as proxy if purchases not in churn summary
      });

      // Fetch average purchases directly from country aggregate
      let totalPurchases = 0;
      let countryCount = 0;
      countryList.forEach(c => {
        totalPurchases += (c.averagePurchases || 0) * c.count;
        countryCount += c.count;
      });

      setSummary({
        totalCustomers: total || countryCount,
        churnRate: total > 0 ? ((churned / total) * 100).toFixed(1) : 0,
        avgLTV: total > 0 ? (sumLTV / total).toFixed(2) : 0,
        avgPurchases: countryCount > 0 ? (totalPurchases / countryCount).toFixed(1) : 0,
      });

      dispatch(showToast({ message: "Dashboard metrics synced successfully.", severity: 'success' }));
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to fetch analytics summaries. Seed database if records are missing.");
      dispatch(showToast({ message: "Analytics sync failed.", severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Format methods
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Pie chart customizations
  const COLORS = ['#10b981', '#f43f5e']; // Green-500, Rose-500
  const pieData = churnData.map(group => ({
    name: group._id === 1 ? 'Churned' : 'Active',
    value: group.count
  }));

  // Reformat signup quarter keys
  const signupChartData = signupData.map(item => ({
    quarter: item._id,
    customers: item.count,
    LTV: Math.round(item.totalLifetimeValue)
  })).sort((a,b) => a.quarter.localeCompare(b.quarter));

  const statsCards = [
    {
      title: 'Total Customers',
      value: summary.totalCustomers,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: '#6366f1',
      desc: 'Active MongoDB records'
    },
    {
      title: 'Churn Rate',
      value: `${summary.churnRate}%`,
      icon: <PercentIcon sx={{ fontSize: 32 }} />,
      color: '#f43f5e',
      desc: 'Overall churn distribution'
    },
    {
      title: 'Average LTV',
      value: formatCurrency(summary.avgLTV),
      icon: <MonetizationOnIcon sx={{ fontSize: 32 }} />,
      color: '#10b981',
      desc: 'Average customer lifetime value'
    },
    {
      title: 'Avg Purchases',
      value: summary.avgPurchases,
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: '#f59e0b',
      desc: 'Average orders completed'
    }
  ];

  return (
    <DashboardLayout>
      <Box className="w-full">
        {/* Header */}
        <Box className="flex justify-between items-center mb-8">
          <Box className="flex items-center gap-3">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', display: 'flex', color: 'primary.contrastText' }}>
              <DashboardIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" className="font-extrabold tracking-tight">
                Executive Churn Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aggregated database statistics and Recharts analytics pipelines
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="warning" className="mb-6">{error}</Alert>}

        {/* Stats Cards Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {loading ? (
            Array.from(new Array(4)).map((_, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ p: 1 }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={40} sx={{ my: 1, borderRadius: 1 }} />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            statsCards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ borderLeft: `4px solid ${card.color}` }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" className="font-semibold">
                        {card.title}
                      </Typography>
                      <Typography variant="h4" className="font-black my-1">
                        {card.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.desc}
                      </Typography>
                    </Box>
                    <Box sx={{ color: card.color, bgcolor: `${card.color}15`, p: 1.5, borderRadius: '50%', display: 'flex' }}>
                      {card.icon}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Churn Breakdown (PieChart) */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: 420, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" className="font-bold mb-4">
                  Churn Status Distribution
                </Typography>
                
                {loading ? (
                  <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
                ) : pieData.length === 0 ? (
                  <Box className="flex-grow flex items-center justify-center">
                    <Typography color="text.secondary">No Churn stats available</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartTooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Signup Growth Trend (AreaChart) */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: 420, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" className="font-bold mb-4">
                  Signup Cohort Trends
                </Typography>
                
                {loading ? (
                  <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
                ) : signupChartData.length === 0 ? (
                  <Box className="flex-grow flex items-center justify-center">
                    <Typography color="text.secondary">No signup trend statistics available</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={signupChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="quarter" stroke="#94A3B8" />
                        <YAxis stroke="#94A3B8" />
                        <RechartTooltip formatter={(val) => [val, 'Signups']} />
                        <Area type="monotone" dataKey="customers" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCustomers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Regional Demographics Analysis (BarChart) */}
          <Grid item xs={12}>
            <Card sx={{ height: 450, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" className="font-bold mb-4">
                  Country Market Performance (LTV vs Client Share)
                </Typography>
                
                {loading ? (
                  <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
                ) : countryData.length === 0 ? (
                  <Box className="flex-grow flex items-center justify-center">
                    <Typography color="text.secondary">No regional database breakdown available</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer>
                      <BarChart data={countryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="_id" stroke="#94A3B8" />
                        <YAxis stroke="#94A3B8" />
                        <RechartTooltip 
                          formatter={(value, name) => {
                            if (name === 'averageLifetimeValue') return [formatCurrency(value), 'Avg LTV'];
                            return [value, 'Client Count'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" name="Customer Count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="averageLifetimeValue" name="Average LTV" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
