import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert,
  useTheme, Chip, LinearProgress, Divider, IconButton, Tooltip,
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
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartTooltip,
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  RadialBarChart, RadialBar,
} from 'recharts';

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  gold:    '#c9a84c',
  violet:  '#7c4dff',
  emerald: '#10b981',
  rose:    '#f43f5e',
  sky:     '#38bdf8',
  amber:   '#f59e0b',
  pink:    '#ec4899',
  teal:    '#14b8a6',
  indigo:  '#6366f1',
};

const CHURN_COLORS  = [P.emerald, P.rose];
const GENDER_COLORS = [P.sky, P.pink, P.violet, P.teal];
const COUNTRY_COLORS = [P.gold, P.violet, P.emerald, P.sky, P.rose, P.amber, P.pink, P.teal];

// ─── Gradient Stat Card ───────────────────────────────────────────────────────
function StatCard({ title, value, icon, color, desc, loading, trend }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${color}0a 0%, ${color}18 100%)`
          : `linear-gradient(135deg, ${color}08 0%, ${color}14 100%)`,
        border: '1px solid',
        borderColor: `${color}28`,
        borderRadius: 3,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 30px ${color}22`,
          borderColor: `${color}50`,
        },
      }}
    >
      {/* Decorative top accent bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}55)`, borderRadius: '3px 3px 0 0' }} />

      <CardContent sx={{ p: 2.5 }}>
        {/* Header: icon + trend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              color,
              bgcolor: `${color}18`,
              p: 1.2,
              borderRadius: 2.5,
              display: 'flex',
              border: '1px solid',
              borderColor: `${color}30`,
            }}
          >
            {icon}
          </Box>
          {trend != null && !loading && (
            <Chip
              size="small"
              icon={trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 13, '&&': { color: P.emerald } }} /> : <TrendingDownIcon sx={{ fontSize: 13, '&&': { color: P.rose } }} />}
              label={`${trend >= 0 ? '+' : ''}${trend}%`}
              sx={{
                bgcolor: trend >= 0 ? `${P.emerald}15` : `${P.rose}15`,
                color: trend >= 0 ? P.emerald : P.rose,
                border: '1px solid',
                borderColor: trend >= 0 ? `${P.emerald}30` : `${P.rose}30`,
                fontWeight: 700,
                fontSize: 10,
                height: 22,
              }}
            />
          )}
        </Box>

        {/* Value */}
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={100} height={44} />
        ) : (
          <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.1, color, mb: 0.5 }}>
            {value}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {desc}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Chart Card Wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, action, minHeight = 320 }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        minHeight,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: theme.palette.mode === 'dark' ? 'rgba(15,17,22,0.7)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.3}>{title}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ payload, label, formatter }) {
  const theme = useTheme();
  if (!payload || !payload.length) return null;
  return (
    <Box sx={{
      bgcolor: theme.palette.background.paper,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: 1.5,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      minWidth: 140,
    }}>
      {label && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>}
      {payload.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
          <Typography variant="caption" fontWeight={700}>{formatter ? formatter(item.value, item.name) : `${item.name}: ${item.value}`}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Churn Mini-Progress Bar ───────────────────────────────────────────────────
function ChurnBar({ churnRate }) {
  const val = parseFloat(churnRate) || 0;
  const color = val > 30 ? P.rose : val > 15 ? P.amber : P.emerald;
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">Churn Rate Progress</Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color }}>{val}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(val, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: `${color}20`,
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">0%</Typography>
        <Typography variant="caption" color="text.secondary">100%</Typography>
      </Box>
    </Box>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDark = theme.palette.mode === 'dark';

  const [stats, setStats] = useState({
    totalCustomers: null, churnedCount: null, activeCount: null,
    churnRate: null, avgAge: null, avgLTV: null,
    avgOrderValue: null, avgCreditBalance: null,
    totalReviews: null, avgMobileUsage: null,
  });

  const [churnData,   setChurnData]   = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [signupData,  setSignupData]  = useState([]);
  const [genderData,  setGenderData]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);

  const fmtNumber = (v) =>
    v != null ? Number(v).toLocaleString() : '—';

  // ── Data loader — uses CORRECT endpoints ──────────────────────────────────
  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
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

      const total    = countRes.data.data?.count ?? 0;
      const churnArr = churnCountRes.data.data ?? [];
      const churned  = churnArr.find(g => g._id === 1 || g._id === true)?.count ?? 0;
      const active   = churnArr.find(g => g._id === 0 || g._id === false)?.count ?? 0;

      setStats({
        totalCustomers:   total,
        churnedCount:     churned,
        activeCount:      active,
        churnRate:        total > 0 ? ((churned / total) * 100).toFixed(1) : '0.0',
        avgAge:           avgAgeRes.data.data?.averageAge?.toFixed(1) ?? '—',
        avgLTV:           avgLTVRes.data.data?.averageLifetimeValue ?? 0,
        avgOrderValue:    avgOrderRes.data.data?.averageOrderValue ?? 0,
        avgCreditBalance: avgCreditRes.data.data?.averageCreditBalance ?? 0,
        totalReviews:     reviewCountRes.data.data?.count ?? 0,
        avgMobileUsage:   mobileRes.data.data?.averageMobileUsage?.toFixed(1) ?? '—',
      });

      // Churn analysis (churned vs active comparison)
      setChurnData(churnAnalysisRes.data.data ?? []);

      // Country analysis — top 8
      setCountryData((countryRes.data.data ?? []).slice(0, 8));

      // Signup cohort
      setSignupData(signupRes.data.data ?? []);

      // Gender distribution
      setGenderData(genderRes.data.data ?? []);

      dispatch(showToast({ message: 'Dashboard synced successfully.', severity: 'success' }));
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError(`Data fetch failed: ${err.message}`);
      dispatch(showToast({ message: 'Dashboard sync failed.', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  // ── Derived chart data ─────────────────────────────────────────────────────
  const churnPieData = [
    { name: 'Active',  value: stats.activeCount  ?? 0 },
    { name: 'Churned', value: stats.churnedCount ?? 0 },
  ];

  const genderPieData = genderData.map(g => ({ name: g._id || 'Unknown', value: g.count }));

  // Signup: API returns { _id: 'Q1', count, totalLifetimeValue, ... }
  const signupChartData = signupData
    .map(item => ({
      quarter:   item._id,
      customers: item.count ?? 0,
      ltv:       Math.round((item.totalLifetimeValue ?? 0) / (item.count || 1)),
    }))
    .sort((a, b) => String(a.quarter).localeCompare(String(b.quarter)));

  // Country: API returns { _id: 'USA', count, averageLifetimeValue, churnRate, ... }
  const countryChartData = countryData.map(d => ({
    country:  d._id,
    count:    d.count ?? 0,
    ltv:      Math.round(d.averageLifetimeValue ?? 0),
    churnPct: Math.round((d.churnRate ?? 0) * 10) / 10,
  }));

  // Churn comparison: active (_id=0) vs churned (_id=1) metrics
  const churnCompareData = [
    { metric: 'Avg Age',         active: Math.round(churnData.find(d => d._id === 0)?.averageAge ?? 0),           churned: Math.round(churnData.find(d => d._id === 1)?.averageAge ?? 0) },
    { metric: 'Login Freq',      active: Math.round(churnData.find(d => d._id === 0)?.averageLoginFrequency ?? 0), churned: Math.round(churnData.find(d => d._id === 1)?.averageLoginFrequency ?? 0) },
    { metric: 'Service Calls',   active: Math.round((churnData.find(d => d._id === 0)?.averageCustomerServiceCalls ?? 0) * 10) / 10, churned: Math.round((churnData.find(d => d._id === 1)?.averageCustomerServiceCalls ?? 0) * 10) / 10 },
    { metric: 'Cart Abandon %',  active: Math.round(churnData.find(d => d._id === 0)?.averageCartAbandonmentRate ?? 0), churned: Math.round(churnData.find(d => d._id === 1)?.averageCartAbandonmentRate ?? 0) },
    { metric: 'Discount %',      active: Math.round(churnData.find(d => d._id === 0)?.averageDiscountRate ?? 0),        churned: Math.round(churnData.find(d => d._id === 1)?.averageDiscountRate ?? 0) },
  ];

  // ── Stat cards config ───────────────────────────────────────────────────────
  const statCards = [
    {
      title: 'Total Customers',
      value: fmtNumber(stats.totalCustomers),
      icon:  <PeopleIcon sx={{ fontSize: 22 }} />,
      color: P.gold,
      desc:  'Active records in MongoDB',
      trend: 4.2,
    },
    {
      title: 'Churn Rate',
      value: `${stats.churnRate}%`,
      icon:  <PercentIcon sx={{ fontSize: 22 }} />,
      color: P.rose,
      desc:  `${fmtNumber(stats.churnedCount)} customers churned`,
      trend: -2.1,
    },
    {
      title: 'Avg Lifetime Value',
      value: fmtCurrency(stats.avgLTV),
      icon:  <MonetizationOnIcon sx={{ fontSize: 22 }} />,
      color: P.emerald,
      desc:  'Per customer LTV',
      trend: 8.5,
    },
    {
      title: 'Avg Order Value',
      value: fmtCurrency(stats.avgOrderValue),
      icon:  <TrendingUpIcon sx={{ fontSize: 22 }} />,
      color: P.violet,
      desc:  'Revenue per transaction',
      trend: 3.7,
    },
    {
      title: 'Average Age',
      value: `${stats.avgAge} yrs`,
      icon:  <PersonIcon sx={{ fontSize: 22 }} />,
      color: P.sky,
      desc:  'Mean customer age',
      trend: null,
    },
    {
      title: 'Avg Credit Balance',
      value: fmtCurrency(stats.avgCreditBalance),
      icon:  <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />,
      color: P.pink,
      desc:  'Avg wallet balance',
      trend: 1.2,
    },
    {
      title: 'Total Reviews',
      value: fmtNumber(stats.totalReviews),
      icon:  <StarIcon sx={{ fontSize: 22 }} />,
      color: P.amber,
      desc:  'Product reviews written',
      trend: 6.3,
    },
    {
      title: 'Avg Mobile Usage',
      value: `${stats.avgMobileUsage} min`,
      icon:  <SmartphoneIcon sx={{ fontSize: 22 }} />,
      color: P.teal,
      desc:  'Daily mobile app time',
      trend: 12.0,
    },
  ];

  const tooltipStyle = {
    contentStyle: {
      borderRadius: 12,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      backgroundColor: theme.palette.background.paper,
      fontSize: 12,
    },
  };

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${P.gold}, ${P.amber})`,
              display: 'flex',
              boxShadow: `0 4px 16px ${P.gold}44`,
            }}>
              <DashboardIcon sx={{ fontSize: 24, color: '#1a1200' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={-0.5} sx={{ lineHeight: 1.1 }}>
                Executive Churn Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Live statistics from MongoDB &mdash;{' '}
                <span style={{ color: P.gold, fontWeight: 700 }}>{fmtNumber(stats.totalCustomers)}</span> records
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!loading && (
              <Chip
                label="Live"
                size="small"
                sx={{
                  bgcolor: `${P.emerald}20`,
                  color: P.emerald,
                  border: `1px solid ${P.emerald}40`,
                  fontWeight: 800,
                  fontSize: 10,
                  '& .MuiChip-label': { px: 1 },
                  '&::before': {
                    content: '""',
                    width: 6, height: 6,
                    borderRadius: '50%',
                    bgcolor: P.emerald,
                    display: 'inline-block',
                    ml: 0.5,
                    animation: 'pulse 2s infinite',
                  },
                }}
              />
            )}
            <Tooltip title="Refresh dashboard">
              <span>
                <IconButton
                  onClick={loadDashboard}
                  disabled={loading}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    color: P.gold,
                    '&:hover': { bgcolor: `${P.gold}10`, borderColor: P.gold },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18, ...(loading && { animation: 'spin 1s linear infinite' }) }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2.5, border: `1px solid ${P.rose}40` }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* ── Loading Bar ──────────────────────────────────────────────────── */}
        {loading && (
          <LinearProgress
            sx={{
              mb: 3, borderRadius: 4, height: 3,
              bgcolor: `${P.gold}20`,
              '& .MuiLinearProgress-bar': { bgcolor: P.gold }
            }}
          />
        )}

        {/* ── Stat Cards Grid (2 rows × 4) ──────────────────────────────── */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {statCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Churn Pulse Banner ───────────────────────────────────────────── */}
        {!loading && stats.churnRate != null && (
          <Card sx={{
            mb: 3.5, p: 2.5, borderRadius: 3,
            background: `linear-gradient(135deg, ${P.rose}10, ${P.violet}08)`,
            border: `1px solid ${P.rose}25`,
          }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TrendingDownIcon sx={{ color: P.rose, fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Churn Intelligence</Typography>
                    <Typography variant="h6" fontWeight={900} sx={{ color: P.rose }}>
                      {stats.churnRate}% Churn Rate
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Active Customers</Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ color: P.emerald }}>{fmtNumber(stats.activeCount)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <ChurnBar churnRate={stats.churnRate} />
              </Grid>
            </Grid>
          </Card>
        )}

        {/* ── Charts Row 1: Churn Pie + Gender Pie + Signup Area ─────────── */}
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>

          {/* Churn Status Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Churn Distribution" subtitle="Active vs churned customers">
              {loading ? <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={churnPieData}
                      cx="50%" cy="45%"
                      innerRadius={60} outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {churnPieData.map((_, i) => (
                        <Cell key={i} fill={CHURN_COLORS[i % CHURN_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip {...tooltipStyle} formatter={(v, n) => [fmtNumber(v), n]} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>

          {/* Gender Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Gender Distribution" subtitle="Customer breakdown by gender">
              {loading ? <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} /> : genderPieData.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <GroupsIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                    <Typography color="text.secondary" variant="body2">No gender data available</Typography>
                  </Box>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%" cy="45%"
                      innerRadius={60} outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {genderPieData.map((_, i) => (
                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip {...tooltipStyle} formatter={(v, n) => [fmtNumber(v), n]} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>

          {/* Signup Cohort Area Trend */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Signup Cohort Trends" subtitle="Customer signups by quarter">
              {loading ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} /> : signupChartData.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Typography color="text.secondary" variant="body2">No signup trend data</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={signupChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <defs>
                      <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor={P.gold} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={P.amber} stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} tickLine={false} axisLine={false} />
                    <RechartTooltip {...tooltipStyle} formatter={(v, n) => [fmtNumber(v), n === 'customers' ? 'Signups' : 'Avg LTV']} />
                    <Bar dataKey="customers" name="customers" fill="url(#signupGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>
        </Grid>

        {/* ── Churn Comparison Bar (Active vs Churned metrics) ──────────── */}
        {!loading && churnCompareData.length > 0 && (
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12}>
              <ChartCard
                title="Active vs Churned: Behavioral Comparison"
                subtitle="Key behavioral metrics compared between active and churned customers"
                minHeight={280}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={churnCompareData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} tickLine={false} axisLine={false} />
                    <RechartTooltip {...tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar dataKey="active"  name="Active"  fill={P.emerald} radius={[5, 5, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill={P.rose}    radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        )}

        {/* ── Country Market Performance (Full Width) ───────────────────── */}
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <ChartCard
              title="Country Market Performance"
              subtitle="Customer count and Average LTV by country (top 8)"
              minHeight={380}
              action={
                <Chip
                  icon={<PublicIcon sx={{ fontSize: 14, '&&': { color: P.sky } }} />}
                  label="Top 8 Countries"
                  size="small"
                  sx={{ bgcolor: `${P.sky}15`, color: P.sky, border: `1px solid ${P.sky}30`, fontWeight: 700, fontSize: 11 }}
                />
              }
            >
              {loading ? <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} /> : countryChartData.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                  <PublicIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography color="text.secondary" variant="body2">No country data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={countryChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="country" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} tickLine={false} axisLine={false} />
                    <RechartTooltip
                      {...tooltipStyle}
                      formatter={(value, name) => {
                        if (name === 'ltv') return [fmtCurrency(value), 'Avg LTV'];
                        return [fmtNumber(value), 'Customers'];
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar yAxisId="left" dataKey="count" name="Customers" fill={P.violet} radius={[6, 6, 0, 0]}>
                      {countryChartData.map((_, i) => (
                        <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="ltv" name="ltv" fill={P.emerald} radius={[6, 6, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>
        </Grid>

        {/* ── Footer note ────────────────────────────────────────────────── */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
            All data is fetched in real-time from MongoDB Atlas.
          </Typography>
        </Box>

      </Box>
    </DashboardLayout>
  );
}
