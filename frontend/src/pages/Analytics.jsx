import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert, Divider, useTheme
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
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

// ─── LexIndia Inspired Palette ────────────────────────────────────────────────
const PALETTE = {
  gold:    '#c9a84c', // Primary Gold
  violet:  '#7c4dff', // Secondary Purple
  emerald: '#10b981', // Success
  rose:    '#f43f5e', // Risk red
  sky:     '#0ea5e9', // Sky blue
  amber:   '#f59e0b', // Accent warning
  pink:    '#ec4899', // Pink accent
  teal:    '#14b8a6', // Teal accent
};

const CHART_COLORS = [
  PALETTE.gold, PALETTE.violet, PALETTE.emerald, PALETTE.sky,
  PALETTE.pink, PALETTE.teal, PALETTE.amber, PALETTE.rose
];

function ChartCard({ title, subtitle, loading, children }) {
  return (
    <Card sx={{ height: 400, display: 'flex', flexDirection: 'column', borderColor: 'divider' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.3} sx={{ lineHeight: 1.2 }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
        ) : (
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const theme = useTheme();

  // ── Data States ────────────────────────────────────────────────────────────
  const [countryData, setCountryData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [signupData, setSignupData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [churnData, setChurnData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Loader Function ────────────────────────────────────────────────────────
  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        countryRes, cityRes, signupRes, retentionRes,
        purchaseRes, paymentRes, sessionRes, churnRes
      ] = await Promise.all([
        api.get('/analytics/customers/country-analysis'),
        api.get('/analytics/customers/city-analysis'),
        api.get('/analytics/customers/signup-analysis'),
        api.get('/analytics/customers/retention'),
        api.get('/analytics/customers/purchase-analysis'),
        api.get('/analytics/customers/payment-analysis'),
        api.get('/analytics/customers/session-analysis'),
        api.get('/analytics/customers/churn-analysis')
      ]);

      setCountryData(countryRes.data.data ?? []);
      setCityData(cityRes.data.data ?? []);
      setSignupData(signupRes.data.data ?? []);
      setRetentionData(retentionRes.data.data ?? []);
      setPurchaseData(purchaseRes.data.data ?? []);
      setPaymentData(paymentRes.data.data ?? []);
      setSessionData(sessionRes.data.data ?? []);
      setChurnData(churnRes.data.data ?? []);

    } catch (err) {
      console.error('Failed to load analytics deep dive data:', err);
      setError('Failed to retrieve analytics data. Please ensure the database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // ── Formatters ─────────────────────────────────────────────────────────────
  const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);

  // ── Processed Data ─────────────────────────────────────────────────────────
  const paymentMethodMap = {
    0: 'Credit Card',
    1: 'Debit Card',
    2: 'Paypal',
    3: 'UPI/Wallet',
    4: 'COD'
  };

  const processedPaymentData = paymentData.map(p => ({
    name: paymentMethodMap[p._id] || `Method ${p._id}`,
    value: p.count
  }));

  const processedSessionData = sessionData.map(s => ({
    membership: `${s._id} yr${s._id !== 1 ? 's' : ''}`,
    duration: Math.round(s.averageSessionDuration),
    pages: Number(s.averagePagesPerSession).toFixed(1)
  })).sort((a, b) => a.membership.localeCompare(b.membership));

  const processedRetentionData = retentionData.map(r => ({
    quarter: r._id,
    active: r.activeCount,
    churned: r.churnedCount
  })).sort((a, b) => a.quarter.localeCompare(b.quarter));

  const processedChurnComparisonData = churnData.map(c => ({
    status: c._id === 1 ? 'Churned' : 'Active',
    avgLTV: Math.round(c.averageLifetimeValue),
    avgLogins: Math.round(c.averageLoginFrequency),
    avgCalls: Number(c.averageCustomerServiceCalls).toFixed(1),
    avgAbandonment: Math.round(c.averageCartAbandonmentRate)
  }));

  const customTooltipStyle = {
    borderRadius: 12,
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.background.paper
  };

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>

        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1.25, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', color: 'primary.contrastText', boxShadow: '0 2px 10px rgba(201,168,76,0.2)' }}>
              <BarChartIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={850} letterSpacing={-0.5}>
                Analytics Deep Dive
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive customer behavior profiles, regional churn distributions, and cohort breakdowns
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Reload analytics">
            <IconButton onClick={loadAnalyticsData} disabled={loading} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* ── Charts Grid ── */}
        <Grid container spacing={3}>

          {/* Chart 1: Country Breakdown */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Regional Customer Volume"
              subtitle="Total active customer distribution by country"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="_id" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [v.toLocaleString(), 'Customers']}
                  />
                  <Bar dataKey="count" name="Customers" fill={PALETTE.gold} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 2: Top Cities */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Top City Cohorts"
              subtitle="Customer density ranking per metropolitan area"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData.slice(0, 8)} layout="vertical" margin={{ left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                  <XAxis type="number" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="_id" type="category" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [v.toLocaleString(), 'Customers']}
                  />
                  <Bar dataKey="count" name="Customers" fill={PALETTE.sky} radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 3: Signup Growth Trends */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Signup Growth Trend"
              subtitle="New user registrations grouped by quarter"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signupData.sort((a,b) => a._id.localeCompare(b._id))}>
                  <defs>
                    <linearGradient id="colorSignupArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.violet} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={PALETTE.violet} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="_id" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [v.toLocaleString(), 'Signups']}
                  />
                  <Area type="monotone" dataKey="count" stroke={PALETTE.violet} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignupArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 4: Cohort Active vs Churned */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Retention Cohort Breakdown"
              subtitle="Active vs Churned customer counts by signup quarter"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="quarter" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="active" name="Active" fill={PALETTE.emerald} stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="churned" name="Churned" fill={PALETTE.rose} stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 5: Spend Brackets Breakdown */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Spend Brackets Cohort Counts"
              subtitle="Customer counts segmented by order spend bracket"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="_id" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [v.toLocaleString(), 'Customers']}
                  />
                  <Bar dataKey="count" name="Customers" fill={PALETTE.violet} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 6: Payment Methods Split */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Preferred Payment Platforms"
              subtitle="Distribution of payment method preferences"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedPaymentData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {processedPaymentData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip 
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [v.toLocaleString(), 'Users']} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 7: Session Length by Membership */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Session Duration vs Membership Length"
              subtitle="Average site interaction times by loyalty years"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedSessionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="membership" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [`${v} mins`, 'Avg Session Length']}
                  />
                  <Line type="monotone" dataKey="duration" name="Duration" stroke={PALETTE.gold} strokeWidth={2.5} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Chart 8: Churn Key Metrics Comparison */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Behavior Metrics: Active vs Churned"
              subtitle="Comparison of cart abandonment and service calls"
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedChurnComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="status" stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={customTooltipStyle}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="avgAbandonment" name="Cart Abandonment Rate %" fill={PALETTE.rose} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgCalls" name="Customer Service Calls (Mean)" fill={PALETTE.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

        </Grid>
      </Box>
    </DashboardLayout>
  );
}
