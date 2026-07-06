import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert, Stack,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, useTheme, Chip, Avatar
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';

// Recharts
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, Cell, PieChart, Pie
} from 'recharts';

// ─── Color Palette ────────────────────────────────────────────────────────────
const PALETTE = {
  indigo:  '#6366f1',
  rose:    '#f43f5e',
  emerald: '#10b981',
  amber:   '#f59e0b',
  sky:     '#0ea5e9',
  violet:  '#8b5cf6',
  pink:    '#ec4899',
  teal:    '#14b8a6',
};

// Custom tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminInsights() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // ── Data States ────────────────────────────────────────────────────────────
  const [topBuyers, setTopBuyers] = useState([]);
  const [topLtv, setTopLtv] = useState([]);
  const [topEngagement, setTopEngagement] = useState([]);
  
  const [retention, setRetention] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [cityData, setCityData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Loader Function ────────────────────────────────────────────────────────
  const loadAdminInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        buyersRes, ltvRes, engagementRes, retentionRes,
        sessionRes, purchaseRes, paymentRes, cityRes
      ] = await Promise.all([
        api.get('/analytics/customers/top-buyers'),
        api.get('/analytics/customers/top-lifetime'),
        api.get('/analytics/customers/top-engagement'),
        api.get('/analytics/customers/retention'),
        api.get('/analytics/customers/session-analysis'),
        api.get('/analytics/customers/purchase-analysis'),
        api.get('/analytics/customers/payment-analysis'),
        api.get('/analytics/customers/city-analysis')
      ]);

      setTopBuyers(buyersRes.data.data ?? []);
      setTopLtv(ltvRes.data.data ?? []);
      setTopEngagement(engagementRes.data.data ?? []);
      setRetention(retentionRes.data.data ?? []);
      setSessionData(sessionRes.data.data ?? []);
      setPurchaseData(purchaseRes.data.data ?? []);
      setPaymentData(paymentRes.data.data ?? []);
      setCityData(cityRes.data.data ?? []);

    } catch (err) {
      console.error('Failed to load admin insights:', err);
      setError('Failed to retrieve administrative data. Please ensure the database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminInsights();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // ── Formatters ─────────────────────────────────────────────────────────────
  const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const renderTopCustomersTable = (data, valueKey, label, isCurrency = false) => (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
      <Table size="medium">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Country & City</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Age / Gender</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Purchases</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">{label}</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">Churn Risk</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from(new Array(5)).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={50} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={60} /></TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">No customer insights available.</TableCell>
            </TableRow>
          ) : (
            data.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
                      {c.name ? c.name.charAt(0) : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{c.city}, {c.country}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{c.age} yrs / {c.gender}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>{Math.round(c.purchases)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {isCurrency ? fmtCurrency(c[valueKey]) : Number(c[valueKey]).toFixed(1)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={c.churned === 1 ? 'High Risk' : 'Healthy'}
                    color={c.churned === 1 ? 'error' : 'success'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Parse payment methods based on numeric keys mapping
  const paymentMethodMap = {
    0: 'Credit Card',
    1: 'Debit Card',
    2: 'Paypal',
    3: 'UPI/Wallet',
    4: 'COD'
  };

  const processedPaymentData = paymentData.map(p => ({
    method: paymentMethodMap[p._id] || `Method ${p._id}`,
    customers: p.count,
    avgLTV: Math.round(p.averageLifetimeValue),
    churnRate: Number(p.churnRate).toFixed(1)
  }));

  const processedSessionData = sessionData.map(s => ({
    membership: `${s._id} yr${s._id !== 1 ? 's' : ''}`,
    duration: Math.round(s.averageSessionDuration),
    logins: Math.round(s.averageLoginFrequency),
    pages: Number(s.averagePagesPerSession).toFixed(1),
    mobile: Math.round(s.averageMobileUsage)
  }));

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>

        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'error.main', display: 'flex', color: 'white' }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
                Administrative Insights Area
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Secure access restricted to Administrative Role Accounts
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Reload insights">
            <IconButton onClick={loadAdminInsights} disabled={loading} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* ── Tabs Navigation ── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin insights tabs" variant="scrollable" scrollButtons="auto">
            <Tab icon={<InsightsIcon />} iconPosition="start" label="Advanced Data Analytics" />
            <Tab icon={<LeaderboardIcon />} iconPosition="start" label="VIP Customer Standings" />
          </Tabs>
        </Box>

        {/* ── Tab 1: Advanced Analytics ── */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>

            {/* Regional Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>City-Level Market Performance</Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cityData.slice(0, 7)} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                          <XAxis type="number" stroke={theme.palette.text.secondary} />
                          <YAxis dataKey="_id" type="category" stroke={theme.palette.text.secondary} />
                          <RechartTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                            formatter={(v, name) => {
                              if (name === 'averageLifetimeValue') return [fmtCurrency(v), 'Avg LTV'];
                              return [v.toLocaleString(), 'Customers'];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="count" name="Customers" fill={PALETTE.indigo} radius={[0, 4, 4, 0]} barSize={12} />
                          <Bar dataKey="averageLifetimeValue" name="Avg LTV" fill={PALETTE.emerald} radius={[0, 4, 4, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Cohort Signup Quarter Retention Rate */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Cohort Signup Quarter Retention Rate</Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={retention} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={PALETTE.rose} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={PALETTE.rose} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                          <XAxis dataKey="_id" stroke={theme.palette.text.secondary} />
                          <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `${v}%`} />
                          <RechartTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                            formatter={(v) => [`${v}%`, 'Retention Rate']}
                          />
                          <Area type="monotone" dataKey="retentionRate" stroke={PALETTE.rose} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRetention)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Purchase Spend Brackets Churn Correlation */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Purchase Spend Brackets Churn Rate</Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={purchaseData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                          <XAxis dataKey="_id" stroke={theme.palette.text.secondary} />
                          <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `${v}%`} />
                          <RechartTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                            formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Churn Rate']}
                          />
                          <Bar dataKey="churnRate" name="Churn Rate" fill={PALETTE.amber} radius={[4, 4, 0, 0]}>
                            {purchaseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.churnRate > 40 ? PALETTE.rose : PALETTE.amber} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Session duration & Logins by Membership Tier */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Session Duration & Logins by Membership Tier</Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedSessionData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                          <XAxis dataKey="membership" stroke={theme.palette.text.secondary} />
                          <YAxis stroke={theme.palette.text.secondary} />
                          <RechartTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="duration" name="Avg Session Duration" stroke={PALETTE.indigo} strokeWidth={2.5} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="logins" name="Avg Logins" stroke={PALETTE.teal} strokeWidth={2.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Method Distribution */}
            <Grid item xs={12}>
              <Card sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Payment Methods Churn Rate Correlation</Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                          <XAxis dataKey="method" stroke={theme.palette.text.secondary} />
                          <YAxis stroke={theme.palette.text.secondary} />
                          <RechartTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                            formatter={(v, name) => {
                              if (name === 'churnRate') return [`${v}%`, 'Churn Rate'];
                              return [v.toLocaleString(), name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="customers" name="Customers count" fill={PALETTE.indigo} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="churnRate" name="Churn Rate %" fill={PALETTE.rose} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </TabPanel>

        {/* ── Tab 2: VIP Standings ── */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            
            {/* Top LTV Customers */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
                  VIP Customers by Lifetime Value (LTV)
                </Typography>
                {renderTopCustomersTable(topLtv, 'lifetimeValue', 'Total LTV', true)}
              </Box>
            </Grid>

            {/* Top Purchase Buyers */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} color="secondary" sx={{ mb: 1.5 }}>
                  Top Volume Buyers (Total Purchases)
                </Typography>
                {renderTopCustomersTable(topBuyers, 'purchases', 'Purchases count')}
              </Box>
            </Grid>

            {/* Most Engaged Customers */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mb: 1.5 }}>
                  Top Engaged Customers (Engagement Index Score)
                </Typography>
                {renderTopCustomersTable(topEngagement, 'engagementScore', 'Engagement Score')}
              </Box>
            </Grid>

          </Grid>
        </TabPanel>

      </Box>
    </DashboardLayout>
  );
}
