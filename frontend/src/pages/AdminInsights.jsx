import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Skeleton, Alert, Stack,
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
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, Cell
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
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.07)', bgcolor: '#161a1e', backgroundImage: 'none' }}>
      <Table size="medium">
        <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#8b95a1' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#8b95a1' }}>Country & City</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#8b95a1' }} align="right">Age / Gender</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#8b95a1' }} align="right">Purchases</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#8b95a1' }} align="right">{label}</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#8b95a1' }} align="center">Churn Risk</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from(new Array(5)).map((_, idx) => (
              <TableRow key={idx} sx={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <TableCell><Skeleton variant="text" width={150} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={80} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={50} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ color: '#8b95a1' }}>No customer insights available.</TableCell>
            </TableRow>
          ) : (
            data.map((c, i) => (
              <TableRow key={c._id} hover sx={{ borderBottom: i < data.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(201, 168, 76, 0.15)', color: '#c9a84c', width: 32, height: 32, fontSize: '0.875rem', fontWeight: 800 }}>
                      {c.name ? c.name.charAt(0) : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f3f5' }}>{c.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#8b95a1' }}>{c.email}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#f1f3f5' }}>{c.city}, {c.country}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: '#f1f3f5' }}>{c.age} yrs / {c.gender}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f3f5' }}>{Math.round(c.purchases)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#c9a84c' }}>
                    {isCurrency ? fmtCurrency(c[valueKey]) : Number(c[valueKey]).toFixed(1)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={c.churned === 1 ? 'High Risk' : 'Healthy'}
                    color={c.churned === 1 ? 'error' : 'success'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: '5px' }}
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
            <Box sx={{ 
              width: 46, height: 46, borderRadius: '13px', 
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px rgba(244, 63, 94, 0.25)', color: 'white' 
            }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#f1f3f5', letterSpacing: '-.5px', lineHeight: 1.2 }}>
                Administrative Insights Area
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#8b95a1', mt: .4 }}>
                Secure access restricted to Administrative Role Accounts
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Reload insights">
            <IconButton onClick={loadAdminInsights} disabled={loading} sx={{
              bgcolor: '#161a1e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px',
              color: '#8b95a1', p: 1,
              '&:hover': { borderColor: '#c9a84c', color: '#c9a84c', bgcolor: 'rgba(201, 168, 76, 0.07)' },
            }}>
              <RefreshIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* ── Tabs Navigation ── */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.07)', mb: 1 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="admin insights tabs" 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#c9a84c' },
              '& .MuiTab-root': { color: '#8b95a1', fontWeight: 600, textTransform: 'none', minHeight: 48 },
              '& .MuiTab-root.Mui-selected': { color: '#c9a84c', fontWeight: 800 },
            }}
          >
            <Tab icon={<InsightsIcon />} iconPosition="start" label="Advanced Data Analytics" />
            <Tab icon={<LeaderboardIcon />} iconPosition="start" label="VIP Customer Standings" />
          </Tabs>
        </Box>

        {/* ── Tab 1: Advanced Analytics ── */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' },
            gap: 3,
            mb: 3,
          }}>

            {/* Regional Performance Metrics */}
            <Card sx={{ height: 400, bgcolor: '#161a1e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', boxShadow: 'none' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#f1f3f5', fontSize: 15 }}>City-Level Market Performance</Typography>
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
                ) : (
                  <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <ResponsiveContainer width="99%" height="99%">
                        <BarChart data={cityData.slice(0, 7)} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#8b95a1" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="_id" type="category" stroke="#8b95a1" tick={{ fontSize: 10 }} />
                          <RechartTooltip
                            contentStyle={{ background: '#1c2025', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f1f3f5' }}
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
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Cohort Signup Quarter Retention Rate */}
            <Card sx={{ height: 400, bgcolor: '#161a1e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', boxShadow: 'none' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#f1f3f5', fontSize: 15 }}>Cohort Signup Quarter Retention Rate</Typography>
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
                ) : (
                  <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <ResponsiveContainer width="99%" height="99%">
                        <AreaChart data={retention} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={PALETTE.rose} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={PALETTE.rose} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="_id" stroke="#8b95a1" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#8b95a1" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                          <RechartTooltip
                            contentStyle={{ background: '#1c2025', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f1f3f5' }}
                            formatter={(v) => [`${v}%`, 'Retention Rate']}
                          />
                          <Area type="monotone" dataKey="retentionRate" stroke={PALETTE.rose} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRetention)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Purchase Spend Brackets Churn Correlation */}
            <Card sx={{ height: 400, bgcolor: '#161a1e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', boxShadow: 'none' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#f1f3f5', fontSize: 15 }}>Purchase Spend Brackets Churn Rate</Typography>
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
                ) : (
                  <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <ResponsiveContainer width="99%" height="99%">
                        <BarChart data={purchaseData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="_id" stroke="#8b95a1" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#8b95a1" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                          <RechartTooltip
                            contentStyle={{ background: '#1c2025', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f1f3f5' }}
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
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Session duration & Logins by Membership Tier */}
            <Card sx={{ height: 400, bgcolor: '#161a1e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', boxShadow: 'none' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#f1f3f5', fontSize: 15 }}>Session Duration & Logins by Membership Tier</Typography>
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
                ) : (
                  <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <ResponsiveContainer width="99%" height="99%">
                        <LineChart data={processedSessionData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="membership" stroke="#8b95a1" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#8b95a1" tick={{ fontSize: 10 }} />
                          <RechartTooltip
                            contentStyle={{ background: '#1c2025', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f1f3f5' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="duration" name="Avg Session Duration" stroke={PALETTE.indigo} strokeWidth={2.5} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="logins" name="Avg Logins" stroke={PALETTE.teal} strokeWidth={2.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Distribution */}
            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 2' } }}>
              <Card sx={{ height: 400, bgcolor: '#161a1e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', boxShadow: 'none' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#f1f3f5', fontSize: 15 }}>Payment Methods Churn Rate Correlation</Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
                  ) : (
                    <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <ResponsiveContainer width="99%" height="99%">
                          <BarChart data={processedPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="method" stroke="#8b95a1" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#8b95a1" tick={{ fontSize: 10 }} />
                            <RechartTooltip
                              contentStyle={{ background: '#1c2025', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f1f3f5' }}
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
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

          </Box>
        </TabPanel>

        {/* ── Tab 2: VIP Standings ── */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Top LTV Customers */}
            <Box>
              <Typography variant="h6" fontWeight={750} color="primary" sx={{ mb: 1.5, fontSize: 16 }}>
                VIP Customers by Lifetime Value (LTV)
              </Typography>
              {renderTopCustomersTable(topLtv, 'lifetimeValue', 'Total LTV', true)}
            </Box>

            {/* Top Purchase Buyers */}
            <Box>
              <Typography variant="h6" fontWeight={750} color="secondary" sx={{ mb: 1.5, fontSize: 16 }}>
                Top Volume Buyers (Total Purchases)
              </Typography>
              {renderTopCustomersTable(topBuyers, 'purchases', 'Purchases count')}
            </Box>

            {/* Most Engaged Customers */}
            <Box>
              <Typography variant="h6" fontWeight={750} color="success.main" sx={{ mb: 1.5, fontSize: 16 }}>
                Top Engaged Customers (Engagement Index Score)
              </Typography>
              {renderTopCustomersTable(topEngagement, 'engagementScore', 'Engagement Score')}
            </Box>

          </Box>
        </TabPanel>

      </Box>
    </DashboardLayout>
  );
}
