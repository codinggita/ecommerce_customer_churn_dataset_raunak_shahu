import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert, Stack,
  useTheme, Divider, Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PercentIcon from '@mui/icons-material/Percent';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Recharts
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartTooltip,
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
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

const GENDER_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

// ─── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({ title, value, icon, color, desc, loading }) {
  return (
    <Card
      sx={{
        borderLeft: `4px solid ${color}`,
        height: '100%',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} noWrap>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={48} />
          ) : (
            <Typography variant="h4" fontWeight={800} sx={{ my: 0.5, lineHeight: 1.1 }}>
              {value}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" noWrap>
            {desc}
          </Typography>
        </Box>
        <Box
          sx={{
            color,
            bgcolor: `${color}18`,
            p: 1.5,
            borderRadius: '50%',
            display: 'flex',
            flexShrink: 0,
            ml: 1,
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Chart Section Header ─────────────────────────────────────────────────────
function ChartHeader({ title, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      )}
    </Box>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // ── Stats state (from /stats/* endpoints) ─────────────────────────────────
  const [stats, setStats] = useState({
    totalCustomers:   null,
    churnedCount:     null,
    activeCount:      null,
    churnRate:        null,
    avgAge:           null,
    avgLTV:           null,
    avgOrderValue:    null,
    avgCreditBalance: null,
    totalReviews:     null,
    avgMobileUsage:   null,
  });

  // ── Chart data state ───────────────────────────────────────────────────────
  const [churnData,   setChurnData]   = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [signupData,  setSignupData]  = useState([]);
  const [genderData,  setGenderData]  = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Formatters ─────────────────────────────────────────────────────────────
  const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);

  const fmtNumber = (v) =>
    v != null ? Number(v).toLocaleString() : '—';

  // ── Data loader ────────────────────────────────────────────────────────────
  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all endpoints in parallel
      const [
        countRes, churnCountRes, avgAgeRes, avgLTVRes,
        avgOrderRes, avgCreditRes, reviewCountRes, mobileRes,
        churnAnalysisRes, countryRes, signupRes, genderRes,
      ] = await Promise.all([
        api.get('/stats/customers/count'),
        api.get('/stats/customers/churn-count'),
        api.get('/stats/customers/average-age'),
        api.get('/stats/customers/average-lifetime'),
        api.get('/stats/customers/average-order-value'),
        api.get('/stats/customers/average-credit'),
        api.get('/stats/customers/review-count'),
        api.get('/stats/customers/mobile-usage'),
        api.get('/analytics/customers/churn-analysis'),
        api.get('/analytics/customers/country-analysis'),
        api.get('/analytics/customers/signup-analysis'),
        api.get('/stats/customers/gender-count'),
      ]);

      // ── Stats Cards
      const total    = countRes.data.data?.count ?? 0;
      const churnArr = churnCountRes.data.data ?? [];
      const churned  = churnArr.find(g => g._id === 1)?.count ?? 0;
      const active   = churnArr.find(g => g._id === 0)?.count ?? 0;

      setStats({
        totalCustomers:   total,
        churnedCount:     churned,
        activeCount:      active,
        churnRate:        total > 0 ? ((churned / total) * 100).toFixed(1) : 0,
        avgAge:           avgAgeRes.data.data?.averageAge?.toFixed(1) ?? '—',
        avgLTV:           avgLTVRes.data.data?.averageLifetimeValue ?? 0,
        avgOrderValue:    avgOrderRes.data.data?.averageOrderValue ?? 0,
        avgCreditBalance: avgCreditRes.data.data?.averageCreditBalance ?? 0,
        totalReviews:     reviewCountRes.data.data?.count ?? 0,
        avgMobileUsage:   mobileRes.data.data?.averageMobileUsage?.toFixed(1) ?? '—',
      });

      // ── Chart data
      setChurnData(churnAnalysisRes.data.data ?? []);
      setCountryData((countryRes.data.data ?? []).slice(0, 8));
      setSignupData(signupRes.data.data ?? []);
      setGenderData(genderRes.data.data ?? []);

      dispatch(showToast({ message: 'Dashboard synced successfully.', severity: 'success' }));
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError('Failed to fetch dashboard data. Please try again.');
      dispatch(showToast({ message: 'Dashboard sync failed.', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ── Derived chart data ─────────────────────────────────────────────────────
  const churnPieData = [
    { name: 'Active',  value: stats.activeCount  ?? 0 },
    { name: 'Churned', value: stats.churnedCount ?? 0 },
  ];
  const churnPieColors = [PALETTE.emerald, PALETTE.rose];

  const genderPieData = genderData.map(g => ({ name: g._id || 'Unknown', value: g.count }));

  const signupChartData = (signupData)
    .map(item => ({
      quarter:   item._id,
      customers: item.count,
      LTV:       Math.round(item.totalLifetimeValue ?? 0),
    }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  // ── Stat cards definition ──────────────────────────────────────────────────
  const statsCards = [
    {
      title: 'Total Customers',
      value: loading ? null : fmtNumber(stats.totalCustomers),
      icon:  <PeopleIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.indigo,
      desc:  'Active records in database',
    },
    {
      title: 'Churn Rate',
      value: loading ? null : `${stats.churnRate}%`,
      icon:  <PercentIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.rose,
      desc:  `${fmtNumber(stats.churnedCount)} customers lost`,
    },
    {
      title: 'Avg Lifetime Value',
      value: loading ? null : fmtCurrency(stats.avgLTV),
      icon:  <MonetizationOnIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.emerald,
      desc:  'Average customer LTV',
    },
    {
      title: 'Avg Order Value',
      value: loading ? null : fmtCurrency(stats.avgOrderValue),
      icon:  <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.amber,
      desc:  'Average spend per order',
    },
    {
      title: 'Average Age',
      value: loading ? null : `${stats.avgAge} yrs`,
      icon:  <PersonIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.sky,
      desc:  'Mean customer age',
    },
    {
      title: 'Avg Credit Balance',
      value: loading ? null : fmtCurrency(stats.avgCreditBalance),
      icon:  <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.violet,
      desc:  'Avg wallet credit balance',
    },
    {
      title: 'Total Reviews',
      value: loading ? null : fmtNumber(stats.totalReviews),
      icon:  <StarIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.pink,
      desc:  'Product reviews written',
    },
    {
      title: 'Avg Mobile Usage',
      value: loading ? null : `${stats.avgMobileUsage} min`,
      icon:  <SmartphoneIcon sx={{ fontSize: 28 }} />,
      color: PALETTE.teal,
      desc:  'Avg mobile app usage',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>

        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', color: 'white' }}>
              <DashboardIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
                Executive Churn Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live stats from MongoDB — {fmtNumber(stats.totalCustomers)} records
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Refresh dashboard">
            <IconButton onClick={loadDashboard} disabled={loading} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        {/* ── Stat Cards — Row 1 ── */}
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          {statsCards.slice(0, 4).map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Stat Cards — Row 2 ── */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statsCards.slice(4).map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* ── Charts Row 1: Churn Pie + Gender Pie ── */}
        <Grid container spacing={3} sx={{ mb: 3 }}>

          {/* Churn Status Distribution */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 380 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ChartHeader
                  title="Churn Status Distribution"
                  subtitle={`${stats.churnRate}% overall churn rate`}
                />
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                ) : (
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={churnPieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {churnPieData.map((_, i) => (
                            <Cell key={i} fill={churnPieColors[i]} />
                          ))}
                        </Pie>
                        <RechartTooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Gender Distribution */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 380 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ChartHeader
                  title="Gender Distribution"
                  subtitle="Customer breakdown by gender"
                />
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                ) : genderPieData.length === 0 ? (
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No gender data available</Typography>
                  </Box>
                ) : (
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderPieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {genderPieData.map((_, i) => (
                            <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartTooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── Charts Row 2: Signup Trend (full width) ── */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card sx={{ height: 380 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ChartHeader
                  title="Signup Cohort Trends"
                  subtitle="Customer signups grouped by quarter"
                />
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                ) : signupChartData.length === 0 ? (
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No signup trend data available</Typography>
                  </Box>
                ) : (
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={signupChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={PALETTE.indigo} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={PALETTE.indigo} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="quarter" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <RechartTooltip
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                          formatter={(v) => [v.toLocaleString(), 'Signups']}
                        />
                        <Area
                          type="monotone"
                          dataKey="customers"
                          stroke={PALETTE.indigo}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorSignup)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── Charts Row 3: Country Bar (full width) ── */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: 420 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ChartHeader
                  title="Country Market Performance"
                  subtitle="Customer count vs Average LTV by country (top 8)"
                />
                {loading ? (
                  <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2 }} />
                ) : countryData.length === 0 ? (
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No country data available</Typography>
                  </Box>
                ) : (
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="_id" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <RechartTooltip
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                          formatter={(value, name) => {
                            if (name === 'averageLifetimeValue') return [fmtCurrency(value), 'Avg LTV'];
                            return [value.toLocaleString(), 'Customer Count'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count"                name="Customer Count"  fill={PALETTE.indigo}  radius={[4, 4, 0, 0]} />
                        <Bar dataKey="averageLifetimeValue" name="Average LTV"     fill={PALETTE.emerald} radius={[4, 4, 0, 0]} />
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
