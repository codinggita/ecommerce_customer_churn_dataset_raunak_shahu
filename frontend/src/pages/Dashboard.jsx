import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert,
  useTheme, Chip, IconButton, Tooltip,
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
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartTooltip,
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line,
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
};

const CHURN_COLORS  = [P.emerald, P.rose];
const GENDER_COLORS = [P.sky, P.pink, P.violet, P.teal];

// ─── Stat Card — icon on right, value on left (matches screenshot exactly) ───
function StatCard({ title, value, icon, iconColor, desc, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'background.paper',
        boxShadow: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: `${iconColor}40`,
          boxShadow: `0 4px 20px ${iconColor}10`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Title row */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            display: 'block',
            mb: 0.75,
          }}
        >
          {title}
        </Typography>

        {/* Value + Icon row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          {loading ? (
            <Skeleton variant="text" width={90} height={52} />
          ) : (
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{ lineHeight: 1.1, letterSpacing: -0.5 }}
            >
              {value}
            </Typography>
          )}

          {/* Circular colored icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: `${iconColor}18`,
              border: '1px solid',
              borderColor: `${iconColor}28`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
              ml: 1,
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {desc}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, action, sx = {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'background.paper',
        boxShadow: 'none',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
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

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, label }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, gap: 1.5 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
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

  // ── Data loader ────────────────────────────────────────────────────────────
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

  useEffect(() => { loadDashboard(); }, []);

  // ── Derived chart data ─────────────────────────────────────────────────────
  const churnPieData = [
    { name: 'Active',  value: stats.activeCount  ?? 0 },
    { name: 'Churned', value: stats.churnedCount ?? 0 },
  ];

  const genderPieData = genderData.map(g => ({ name: g._id || 'Unknown', value: g.count }));

  const signupChartData = signupData
    .map(item => ({ quarter: item._id, customers: item.count ?? 0 }))
    .sort((a, b) => String(a.quarter).localeCompare(String(b.quarter)));

  const countryChartData = countryData.map(d => ({
    country: d._id,
    count:   d.count ?? 0,
    ltv:     Math.round(d.averageLifetimeValue ?? 0),
  }));

  const tooltipStyle = {
    contentStyle: {
      borderRadius: 10,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      fontSize: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
  };

  // ── Stat card configs ──────────────────────────────────────────────────────
  const statCards = [
    { title: 'Total Customers',   value: fmtNumber(stats.totalCustomers),            icon: <PeopleIcon sx={{ fontSize: 20 }} />,                iconColor: P.gold,    desc: 'Active records in database' },
    { title: 'Churn Rate',        value: `${stats.churnRate}%`,                       icon: <PercentIcon sx={{ fontSize: 20 }} />,               iconColor: P.rose,    desc: `${fmtNumber(stats.churnedCount)} customers lost` },
    { title: 'Avg Lifetime Value',value: fmtCurrency(stats.avgLTV),                   icon: <MonetizationOnIcon sx={{ fontSize: 20 }} />,        iconColor: P.emerald, desc: 'Average customer LTV' },
    { title: 'Avg Order Value',   value: fmtCurrency(stats.avgOrderValue),            icon: <TrendingUpIcon sx={{ fontSize: 20 }} />,            iconColor: P.violet,  desc: 'Average spend per order' },
    { title: 'Average Age',       value: `${stats.avgAge} yrs`,                       icon: <PersonIcon sx={{ fontSize: 20 }} />,                iconColor: P.sky,     desc: 'Mean customer age' },
    { title: 'Avg Credit Balance',value: fmtCurrency(stats.avgCreditBalance),         icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />, iconColor: P.pink,    desc: 'Avg wallet credit balance' },
    { title: 'Total Reviews',     value: fmtNumber(stats.totalReviews),               icon: <StarIcon sx={{ fontSize: 20 }} />,                  iconColor: P.amber,   desc: 'Product reviews written' },
    { title: 'Avg Mobile Usage',  value: `${stats.avgMobileUsage} min`,               icon: <SmartphoneIcon sx={{ fontSize: 20 }} />,            iconColor: P.teal,    desc: 'Avg mobile app usage' },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2.5,
                bgcolor: P.gold,
                display: 'flex',
                color: '#1a1200',
                boxShadow: `0 3px 12px ${P.gold}55`,
              }}
            >
              <DashboardIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} letterSpacing={-0.4} sx={{ lineHeight: 1.2 }}>
                Executive Churn Intelligence
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live statistics from MongoDB —{' '}
                {loading
                  ? '— records'
                  : <><span style={{ color: P.gold, fontWeight: 700 }}>{fmtNumber(stats.totalCustomers)}</span> records</>
                }
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Refresh dashboard">
            <span>
              <IconButton
                onClick={loadDashboard}
                disabled={loading}
                sx={{
                  color: P.gold,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  '&:hover': { bgcolor: `${P.gold}12`, borderColor: P.gold },
                  '&.Mui-disabled': { opacity: 0.5 },
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 18,
                    ...(loading && {
                      animation: 'dashSpin 1s linear infinite',
                    }),
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <style>{`
          @keyframes dashSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

        {/* ── Error Alert ─────────────────────────────────────────────────── */}
        {error && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${P.amber}40`,
              bgcolor: isDark ? `${P.amber}10` : `${P.amber}08`,
              '& .MuiAlert-icon': { color: P.amber },
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* ── Stat Cards: Row 1 ────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {statCards.slice(0, 4).map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Stat Cards: Row 2 ────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.slice(4).map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Charts Row: Churn + Gender + Signup ─────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>

          {/* Churn Status Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard
              title="Churn Status Distribution"
              subtitle={loading ? 'Loading...' : `${stats.churnRate}% overall churn rate`}
              sx={{ minHeight: 380 }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <Skeleton variant="circular" width={180} height={180} />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={churnPieData}
                      cx="50%" cy="45%"
                      innerRadius={72} outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {churnPieData.map((_, i) => (
                        <Cell key={i} fill={CHURN_COLORS[i % CHURN_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip
                      {...tooltipStyle}
                      formatter={(v, n) => [v.toLocaleString(), n]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      iconSize={9}
                      formatter={(value) => (
                        <span style={{ color: theme.palette.text.secondary, fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>

          {/* Gender Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard
              title="Gender Distribution"
              subtitle="Customer breakdown by gender"
              sx={{ minHeight: 380 }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <Skeleton variant="circular" width={180} height={180} />
                </Box>
              ) : genderPieData.length === 0 ? (
                <EmptyState
                  icon={<GroupsIcon sx={{ fontSize: 30, color: 'text.secondary', opacity: 0.5 }} />}
                  label="No gender data available"
                />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%" cy="45%"
                      innerRadius={72} outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {genderPieData.map((_, i) => (
                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip
                      {...tooltipStyle}
                      formatter={(v, n) => [v.toLocaleString(), n]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      iconSize={9}
                      formatter={(value) => (
                        <span style={{ color: theme.palette.text.secondary, fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>

          {/* Signup Cohort Trends */}
          <Grid item xs={12} md={4}>
            <ChartCard
              title="Signup Cohort Trends"
              subtitle="Customer signups grouped by quarter"
              sx={{ minHeight: 380 }}
            >
              {loading ? (
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2, mt: 1 }} />
              ) : signupChartData.length === 0 ? (
                <EmptyState
                  icon={<TrendingUpIcon sx={{ fontSize: 30, color: 'text.secondary', opacity: 0.5 }} />}
                  label="No signup trend data available"
                />
              ) : (
                <Box sx={{ mt: 1 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={signupChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="quarter"
                        tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartTooltip
                        {...tooltipStyle}
                        formatter={(v) => [v.toLocaleString(), 'Signups']}
                      />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        stroke={P.gold}
                        strokeWidth={2.5}
                        dot={{ fill: P.gold, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCard>
          </Grid>
        </Grid>

        {/* ── Country Market Performance ───────────────────────────────────── */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ChartCard
              title="Country Market Performance"
              subtitle="Customer count vs Average LTV by country (top 8)"
              action={
                <Chip
                  label="Top 8 Countries"
                  deleteIcon={<ExpandMoreIcon />}
                  onDelete={() => {}}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontWeight: 600,
                    fontSize: 11,
                    '& .MuiChip-deleteIcon': { color: 'text.secondary', fontSize: 16 },
                  }}
                />
              }
              sx={{ minHeight: 380 }}
            >
              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2, mt: 1 }} />
              ) : countryChartData.length === 0 ? (
                <EmptyState
                  icon={<PublicIcon sx={{ fontSize: 30, color: 'text.secondary', opacity: 0.5 }} />}
                  label="No country data available"
                />
              ) : (
                <Box sx={{ mt: 1 }}>
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={countryChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis
                        dataKey="country"
                        tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartTooltip
                        {...tooltipStyle}
                        formatter={(value, name) => {
                          if (name === 'ltv') return [fmtCurrency(value), 'Average LTV'];
                          return [value.toLocaleString(), 'Customer Count'];
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={9}
                        formatter={(value) => (
                          <span style={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                            {value === 'count' ? 'Customer Count' : 'Average LTV'}
                          </span>
                        )}
                      />
                      <Bar yAxisId="left"  dataKey="count" name="count" fill={P.gold}    radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="ltv"   name="ltv"   fill={P.emerald} radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCard>
          </Grid>
        </Grid>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.4, fontSize: 11 }}>
            All data is fetched in real-time from MongoDB.
          </Typography>
        </Box>

      </Box>
    </DashboardLayout>
  );
}
