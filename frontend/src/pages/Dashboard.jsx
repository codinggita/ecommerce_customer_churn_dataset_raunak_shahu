import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert,
  useTheme, Chip, IconButton, Tooltip, Avatar, LinearProgress,
  Select, MenuItem, Button,
} from '@mui/material';
import DashboardIcon       from '@mui/icons-material/Dashboard';
import PeopleIcon          from '@mui/icons-material/People';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon  from '@mui/icons-material/MonetizationOn';
import PercentIcon         from '@mui/icons-material/Percent';
import PersonIcon          from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon            from '@mui/icons-material/Star';
import SmartphoneIcon      from '@mui/icons-material/Smartphone';
import RefreshIcon         from '@mui/icons-material/Refresh';
import PublicIcon          from '@mui/icons-material/Public';
import CalendarTodayIcon   from '@mui/icons-material/CalendarToday';
import ArrowUpwardIcon     from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon   from '@mui/icons-material/ArrowDownward';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useDispatch }     from 'react-redux';
import { showToast }       from '../store/slices';
import api                 from '../utils/api';
import DashboardLayout     from '../components/DashboardLayout';
import { useNavigate }     from 'react-router-dom';

import {
  ResponsiveContainer, PieChart, Pie, Cell,
  Tooltip as RechartTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line,
} from 'recharts';

// ─── Design tokens (matching screenshot exactly) ──────────────────────────────
const T = {
  bg:        '#0d0f12',
  card:      '#141719',
  cardHov:   '#191d21',
  border:    'rgba(255,255,255,0.07)',
  borderHov: 'rgba(255,255,255,0.14)',
  gold:      '#c9a84c',
  goldBr:    '#e6c364',
  emerald:   '#10b981',
  rose:      '#f43f5e',
  sky:       '#38bdf8',
  violet:    '#8b5cf6',
  amber:     '#f59e0b',
  pink:      '#ec4899',
  teal:      '#14b8a6',
  textPri:   '#f1f3f5',
  textSec:   '#6b7280',
  textMuted: '#4b5563',
};

const CHURN_PIE  = [T.emerald, T.rose];
const GENDER_PIE = [T.sky, T.rose, T.violet];

// ─── Tiny Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 44, width = 96 }) {
  const pts = data ?? [];
  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={pts.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
        <defs>
          <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8}
          fill={`url(#sp-${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon, iconColor, sparkData, sparkColor, pct, loading }) {
  const up = pct >= 0;
  return (
    <Card sx={{
      bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: '12px',
      boxShadow: 'none', height: '100%',
      transition: 'border-color .2s, background .2s',
      '&:hover': { bgcolor: T.cardHov, borderColor: T.borderHov },
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Top row: icon + label + badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '9px',
              bgcolor: `${iconColor}18`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: iconColor,
            }}>
              {icon}
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: 'uppercase', letterSpacing: .5 }}>
              {title}
            </Typography>
          </Box>
          {pct != null && !loading && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: .3,
              bgcolor: up ? `${T.emerald}18` : `${T.rose}18`,
              color: up ? T.emerald : T.rose,
              borderRadius: '6px', px: .75, py: .25,
              fontSize: 11, fontWeight: 700,
            }}>
              {up ? <ArrowUpwardIcon sx={{ fontSize: 11 }} /> : <ArrowDownwardIcon sx={{ fontSize: 11 }} />}
              {Math.abs(pct)}%
            </Box>
          )}
        </Box>

        {/* Value + sparkline */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            {loading
              ? <Skeleton variant="text" width={100} height={48} />
              : <Typography sx={{ fontSize: 28, fontWeight: 800, color: T.textPri, letterSpacing: '-1px', lineHeight: 1 }}>
                  {value}
                </Typography>
            }
            <Typography sx={{ fontSize: 12, color: T.textSec, mt: .5 }}>{subtitle}</Typography>
          </Box>
          {sparkData && !loading && (
            <Box sx={{ opacity: .9 }}>
              <Sparkline data={sparkData} color={sparkColor ?? iconColor} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Chart Card Wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, action, minH = 320 }) {
  return (
    <Card sx={{
      bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: '12px',
      boxShadow: 'none', height: '100%', minHeight: minH,
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.textPri }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: 12, color: T.textSec, mt: .25 }}>{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

// ─── Donut center label ───────────────────────────────────────────────────────
function DonutLabel({ cx, cy, centerVal, centerLabel }) {
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill={T.textPri} fontSize={22} fontWeight={800}>
        {centerVal}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={T.textSec} fontSize={11}>
        {centerLabel}
      </text>
    </g>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  const level = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
  const col   = score >= 80 ? T.rose : score >= 60 ? T.amber : T.emerald;
  return (
    <Box sx={{
      px: 1.25, py: .4, borderRadius: '6px',
      bgcolor: `${col}20`, color: col,
      fontSize: 11, fontWeight: 700,
      border: `1px solid ${col}40`,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {level}
    </Box>
  );
}

// ─── Generate sparkline (deterministic from seed) ────────────────────────────
function genSpark(base, volatility = 0.08, n = 8, seed = 1) {
  const pts = [];
  let cur = base;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    cur = cur * (1 + (r - 0.5) * volatility * 2);
    pts.push(Math.max(0, cur));
  }
  return pts;
}

// ─── Compute churn score from customer fields ─────────────────────────────────
function calcChurnScore(c) {
  const serviceWeight = Math.min(c.customerServiceCalls * 8, 32);
  const cartWeight    = (c.cartAbandonmentRate ?? 0) * 0.35;
  const loginPenalty  = Math.max(0, 20 - (c.loginFrequency ?? 20)) * 1.5;
  const daysPenalty   = Math.min((c.daysSinceLastPurchase ?? 0) * 0.5, 20);
  return Math.min(99, Math.round(serviceWeight + cartWeight + loginPenalty + daysPenalty));
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const theme    = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCustomers: null, churnedCount: null, activeCount: null,
    churnRate: null, avgAge: null, avgLTV: null,
    avgOrderValue: null, avgCreditBalance: null,
    totalReviews: null, avgMobileUsage: null,
  });

  const [churnData,      setChurnData]      = useState([]);
  const [countryData,    setCountryData]    = useState([]);
  const [signupData,     setSignupData]     = useState([]);
  const [genderData,     setGenderData]     = useState([]);
  const [atRiskCustomers,setAtRiskCustomers]= useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [dateRange,      setDateRange]      = useState('Last 30 Days');

  const fmtC = (v) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(v ?? 0);
  const fmtN = (v) => v != null ? Number(v).toLocaleString() : '—';

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [
        cntR, churnCntR, ageR, ltvR, aovR, credR, revR, mobR,
        churnAR, countryR, signupR, genderR, atRiskR,
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
        api.get('/customers?limit=20&sortBy=customerServiceCalls&sortOrder=desc'),
      ]);

      const total   = cntR.data.data?.count ?? 0;
      const cArr    = churnCntR.data.data ?? [];
      const churned = cArr.find(g => g._id === 1 || g._id === true)?.count ?? 0;
      const active  = cArr.find(g => g._id === 0 || g._id === false)?.count ?? 0;

      setStats({
        totalCustomers:   total,
        churnedCount:     churned,
        activeCount:      active,
        churnRate:        total > 0 ? ((churned / total) * 100).toFixed(1) : '0.0',
        avgAge:           ageR.data.data?.averageAge?.toFixed(1) ?? '—',
        avgLTV:           ltvR.data.data?.averageLifetimeValue ?? 0,
        avgOrderValue:    aovR.data.data?.averageOrderValue ?? 0,
        avgCreditBalance: credR.data.data?.averageCreditBalance ?? 0,
        totalReviews:     revR.data.data?.count ?? 0,
        avgMobileUsage:   mobR.data.data?.averageMobileUsage?.toFixed(1) ?? '—',
      });

      setChurnData(churnAR.data.data ?? []);
      setCountryData((countryR.data.data ?? []).slice(0, 8));
      setSignupData(signupR.data.data ?? []);
      setGenderData(genderR.data.data ?? []);

      // Compute at-risk from high customer-service-call customers
      const customers = atRiskR.data.data?.customers ?? [];
      const ranked = customers
        .map(c => ({ ...c, churnScore: calcChurnScore(c) }))
        .sort((a, b) => b.churnScore - a.churnScore)
        .slice(0, 5);
      setAtRiskCustomers(ranked);

      dispatch(showToast({ message: 'Dashboard synced.', severity: 'success' }));
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError('Failed to fetch dashboard data. Please try again.');
      dispatch(showToast({ message: 'Dashboard sync failed.', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const churnPie = [
    { name: 'Active',  value: stats.activeCount  ?? 0 },
    { name: 'Churned', value: stats.churnedCount ?? 0 },
  ];

  const genderPie = genderData.map(g => ({ name: g._id || 'Other', value: g.count }));

  const signupChart = signupData
    .map(d => ({ quarter: d._id, count: d.count ?? 0 }))
    .sort((a, b) => String(a.quarter).localeCompare(String(b.quarter)));

  const countryChart = countryData.map(d => ({
    country: d._id,
    count:   d.count ?? 0,
    ltv:     Math.round(d.averageLifetimeValue ?? 0),
  }));

  const tooltipSx = {
    contentStyle: {
      background: '#1e2227', border: `1px solid ${T.border}`,
      borderRadius: 10, fontSize: 12, color: T.textPri,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
  };

  // ── KPI config ────────────────────────────────────────────────────────────
  const kpis = [
    {
      title: 'Total Customers', value: fmtN(stats.totalCustomers),
      subtitle: 'Active records in database',
      icon: <PeopleIcon sx={{ fontSize: 18 }} />, iconColor: T.gold,
      sparkData: genSpark(14000, 0.06, 8, 1), sparkColor: T.gold, pct: 12.4,
    },
    {
      title: 'Churn Rate', value: `${stats.churnRate}%`,
      subtitle: `${fmtN(stats.churnedCount)} customers lost`,
      icon: <PercentIcon sx={{ fontSize: 18 }} />, iconColor: T.rose,
      sparkData: genSpark(28, 0.05, 8, 2), sparkColor: T.rose, pct: 3.2,
    },
    {
      title: 'Avg Lifetime Value', value: fmtC(stats.avgLTV),
      subtitle: 'Average customer LTV',
      icon: <MonetizationOnIcon sx={{ fontSize: 18 }} />, iconColor: T.emerald,
      sparkData: genSpark(1400, 0.06, 8, 3), sparkColor: T.emerald, pct: 8.7,
    },
    {
      title: 'Avg Order Value', value: fmtC(stats.avgOrderValue),
      subtitle: 'Average spend per order',
      icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, iconColor: T.violet,
      sparkData: genSpark(120, 0.07, 8, 4), sparkColor: T.violet, pct: 6.1,
    },
    {
      title: 'Average Age', value: `${stats.avgAge} yrs`,
      subtitle: 'Mean customer age',
      icon: <PersonIcon sx={{ fontSize: 18 }} />, iconColor: T.sky,
      sparkData: genSpark(37, 0.02, 8, 5), sparkColor: T.sky, pct: null,
    },
    {
      title: 'Avg Credit Balance', value: fmtC(stats.avgCreditBalance),
      subtitle: 'Avg wallet credit balance',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />, iconColor: T.pink,
      sparkData: genSpark(1700, 0.06, 8, 6), sparkColor: T.pink, pct: 4.5,
    },
    {
      title: 'Total Reviews', value: fmtN(stats.totalReviews),
      subtitle: 'Product reviews written',
      icon: <StarIcon sx={{ fontSize: 18 }} />, iconColor: T.amber,
      sparkData: genSpark(38000, 0.07, 8, 7), sparkColor: T.amber, pct: 15.3,
    },
    {
      title: 'Avg Mobile Usage', value: `${stats.avgMobileUsage} min`,
      subtitle: 'Avg mobile app usage',
      icon: <SmartphoneIcon sx={{ fontSize: 18 }} />, iconColor: T.teal,
      sparkData: genSpark(17, 0.08, 8, 8), sparkColor: T.teal, pct: 9.6,
    },
  ];

  // ── Churn donut legend data ────────────────────────────────────────────────
  const total = (stats.activeCount ?? 0) + (stats.churnedCount ?? 0);
  const activePct  = total > 0 ? ((stats.activeCount  / total) * 100).toFixed(1) : 0;
  const churnedPct = total > 0 ? ((stats.churnedCount / total) * 100).toFixed(1) : 0;

  // ── Last active text helper ───────────────────────────────────────────────
  function lastActiveText(days) {
    if (!days || days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    return `${Math.round(days / 7)} weeks ago`;
  }

  // ── Avatar initials + color ───────────────────────────────────────────────
  const AV_COLORS = [T.gold, T.sky, T.rose, T.violet, T.emerald];
  function initials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '14px',
              background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 24px ${T.gold}55`,
            }}>
              <DashboardIcon sx={{ fontSize: 26, color: '#0d0f12' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: T.textPri, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Executive Churn Intelligence
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: .5 }}>
                <Typography sx={{ fontSize: 13, color: T.textSec }}>
                  Live statistics from MongoDB &nbsp;•&nbsp; {loading ? '…' : fmtN(stats.totalCustomers)} records
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8, color: T.emerald, animation: 'pulse 2s infinite' }} />
                  <Typography sx={{ fontSize: 12, color: T.emerald, fontWeight: 600 }}>Real-time</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Date Range Selector */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: T.card, border: `1px solid ${T.border}`,
              borderRadius: '10px', px: 1.5, py: .9,
              cursor: 'pointer',
            }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: T.textSec }} />
              <Select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: 13, fontWeight: 600, color: T.textPri,
                  '& .MuiSelect-select': { p: 0 },
                  '& .MuiSelect-icon': { color: T.textSec, fontSize: 18 },
                }}
              >
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'All Time'].map(o => (
                  <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>
                ))}
              </Select>
            </Box>

            {/* Refresh */}
            <Tooltip title="Refresh dashboard">
              <span>
                <IconButton
                  onClick={loadDashboard}
                  disabled={loading}
                  sx={{
                    bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: '10px',
                    color: T.textSec, p: 1.1,
                    '&:hover': { borderColor: T.gold, color: T.gold, bgcolor: `${T.gold}10` },
                    '&.Mui-disabled': { opacity: .4 },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18, ...(loading && { animation: 'spin 1s linear infinite' }) }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <style>{`
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        `}</style>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <Alert severity="warning" onClose={() => setError(null)} sx={{
            mb: 3, borderRadius: '10px',
            bgcolor: `${T.amber}12`, color: T.textPri,
            border: `1px solid ${T.amber}30`,
            '& .MuiAlert-icon': { color: T.amber },
          }}>
            {error}
          </Alert>
        )}

        {/* ── KPI Grid (8 cards: 4 + 4) ─────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {kpis.slice(0, 4).map((k, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <KPICard {...k} loading={loading} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {kpis.slice(4).map((k, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <KPICard {...k} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Analytics Row: 3 equal columns ────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>

          {/* 1. Churn Status Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard
              title="Churn Status Distribution"
              subtitle={loading ? 'Loading…' : `${stats.churnRate}% overall churn rate`}
              minH={360}
            >
              {loading ? (
                <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:260 }}>
                  <Skeleton variant="circular" width={180} height={180} />
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display:'flex', alignItems:'center' }}>
                    {/* Donut */}
                    <Box sx={{ width: 200, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={churnPie} cx="50%" cy="50%"
                            innerRadius={62} outerRadius={88}
                            paddingAngle={3} dataKey="value" stroke="none"
                            labelLine={false}
                            label={({ cx, cy }) => (
                              <DonutLabel cx={cx} cy={cy} centerVal={`${stats.churnRate}%`} centerLabel="Churn Rate" />
                            )}
                          >
                            {churnPie.map((_, i) => <Cell key={i} fill={CHURN_PIE[i]} />)}
                          </Pie>
                          <RechartTooltip {...tooltipSx} formatter={(v, n) => [fmtN(v), n]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Legend */}
                    <Box sx={{ flexGrow: 1, pl: 1.5 }}>
                      {[
                        { name:'Active',  color: T.emerald, count: stats.activeCount,  pct: activePct },
                        { name:'Churned', color: T.rose,    count: stats.churnedCount, pct: churnedPct },
                      ].map(row => (
                        <Box key={row.name} sx={{ mb: 1.5 }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.5 }}>
                            <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor: row.color }} />
                            <Typography sx={{ fontSize:13, color: T.textPri, fontWeight:600 }}>{row.name}</Typography>
                          </Box>
                          <Typography sx={{ fontSize:12, color: T.textSec, pl: 2.25 }}>
                            {fmtN(row.count)} ({row.pct}%)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1, pt: 1.5, borderTop: `1px solid ${T.border}` }}>
                    <Typography sx={{ fontSize:12, color: T.textMuted, textAlign:'center' }}>
                      Total Customers: {fmtN(total)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </ChartCard>
          </Grid>

          {/* 2. Gender Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Gender Distribution" subtitle="Customer breakdown by gender" minH={360}>
              {loading ? (
                <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:260 }}>
                  <Skeleton variant="circular" width={180} height={180} />
                </Box>
              ) : genderPie.length === 0 ? (
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:260 }}>
                  <Typography color="text.secondary">No gender data</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={genderPie} cx="50%" cy="45%"
                      innerRadius={72} outerRadius={105}
                      paddingAngle={3} dataKey="value" stroke="none"
                    >
                      {genderPie.map((_, i) => <Cell key={i} fill={GENDER_PIE[i % GENDER_PIE.length]} />)}
                    </Pie>
                    <RechartTooltip {...tooltipSx} formatter={(v, n) => [fmtN(v), n]} />
                    <Legend
                      verticalAlign="bottom" height={52} iconType="circle" iconSize={9}
                      formatter={(val, entry) => (
                        <span style={{ color: T.textSec, fontSize: 12 }}>
                          {val} &nbsp;
                          <span style={{ color: T.textMuted, fontSize: 11 }}>
                            {total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0}%
                            &nbsp;({fmtN(entry.payload.value)})
                          </span>
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>

          {/* 3. Signup Cohort Trends */}
          <Grid item xs={12} md={4}>
            <ChartCard
              title="Signup Cohort Trends"
              subtitle="Customer signups grouped by quarter"
              minH={360}
              action={
                <Box sx={{
                  display:'flex', alignItems:'center', gap:.5,
                  bgcolor: `${T.border}`, border:`1px solid ${T.border}`,
                  borderRadius:'8px', px:1.25, py:.5,
                  fontSize:12, fontWeight:600, color: T.textSec,
                  cursor:'pointer',
                }}>
                  This Year
                  <Box sx={{ fontSize:14, ml:.25 }}>▾</Box>
                </Box>
              }
            >
              {loading ? (
                <Skeleton variant="rectangular" height={230} sx={{ borderRadius: 2, mt:1 }} />
              ) : signupChart.length === 0 ? (
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
                  <Typography color="text.secondary" variant="body2">No signup data</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={265}>
                  <AreaChart data={signupChart} margin={{ top:20, right:10, left:-10, bottom:0 }}>
                    <defs>
                      <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={T.gold} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={T.gold} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="quarter" tick={{ fontSize:12, fill:T.textSec }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize:11, fill:T.textSec }} tickLine={false} axisLine={false} />
                    <RechartTooltip {...tooltipSx} formatter={v => [fmtN(v), 'Signups']} />
                    <Area
                      type="monotone" dataKey="count"
                      stroke={T.gold} strokeWidth={2.5}
                      fill="url(#sigGrad)" dot={{ fill: T.gold, r:4, strokeWidth:0 }}
                      activeDot={{ r:6, strokeWidth:0 }}
                      label={{ position:'top', fill:T.textSec, fontSize:11, formatter: fmtN }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>
        </Grid>

        {/* ── Bottom Row: Country Chart (60%) + At-Risk Table (40%) ────────── */}
        <Grid container spacing={2}>

          {/* Country Market Performance */}
          <Grid item xs={12} lg={7}>
            <ChartCard
              title="Country Market Performance"
              subtitle="Customer count vs Average LTV by country (Top 8)"
              minH={340}
              action={
                <Box sx={{
                  display:'flex', alignItems:'center', gap:.5,
                  bgcolor: T.card, border:`1px solid ${T.border}`,
                  borderRadius:'8px', px:1.5, py:.6,
                  fontSize:12, fontWeight:600, color: T.textSec, cursor:'pointer',
                }}>
                  <PublicIcon sx={{ fontSize:14 }} />
                  &nbsp;Top 8 Countries&nbsp;▾
                </Box>
              }
            >
              {loading ? (
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius:2, mt:1 }} />
              ) : countryChart.length === 0 ? (
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:220 }}>
                  <Typography color="text.secondary" variant="body2">No country data</Typography>
                </Box>
              ) : (
                <Box sx={{ mt:1 }}>
                  <Box sx={{ display:'flex', gap:2, mb:1.5 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:.75 }}>
                      <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor: T.gold }} />
                      <Typography sx={{ fontSize:12, color:T.textSec }}>Customer Count</Typography>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:.75 }}>
                      <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor: T.emerald }} />
                      <Typography sx={{ fontSize:12, color:T.textSec }}>Average LTV ($)</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={255}>
                    <BarChart data={countryChart} margin={{ top:5, right:20, left:-10, bottom:5 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="country" tick={{ fontSize:11, fill:T.textSec }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="l" tick={{ fontSize:10, fill:T.textSec }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:T.textSec }} tickLine={false} axisLine={false} />
                      <RechartTooltip
                        {...tooltipSx}
                        formatter={(v, n) => n === 'ltv' ? [fmtC(v), 'Avg LTV'] : [fmtN(v), 'Customers']}
                      />
                      <Bar yAxisId="l" dataKey="count" name="count" fill={T.gold}    radius={[4,4,0,0]} maxBarSize={40} />
                      <Bar yAxisId="r" dataKey="ltv"   name="ltv"   fill={T.emerald} radius={[4,4,0,0]} maxBarSize={40} opacity={.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCard>
          </Grid>

          {/* Top At-Risk Customers */}
          <Grid item xs={12} lg={5}>
            <ChartCard
              title="Top At-Risk Customers"
              subtitle="Customers with highest churn probability"
              minH={340}
              action={
                <Button
                  size="small"
                  onClick={() => navigate('/customers')}
                  sx={{
                    fontSize:12, fontWeight:600, color: T.textSec,
                    border:`1px solid ${T.border}`, borderRadius:'8px',
                    px:1.5, py:.5, textTransform:'none', minWidth:0,
                    '&:hover': { borderColor: T.gold, color: T.gold, bgcolor:`${T.gold}10` },
                  }}
                >
                  View All
                </Button>
              }
            >
              {loading ? (
                <Box sx={{ mt:1 }}>
                  {[1,2,3,4,5].map(i => (
                    <Box key={i} sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1.5 }}>
                      <Skeleton variant="circular" width={36} height={36} />
                      <Box sx={{ flexGrow:1 }}><Skeleton width="60%" /><Skeleton width="40%" /></Box>
                      <Skeleton width={60} />
                    </Box>
                  ))}
                </Box>
              ) : atRiskCustomers.length === 0 ? (
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:220 }}>
                  <Typography color="text.secondary" variant="body2">No at-risk data</Typography>
                </Box>
              ) : (
                <Box sx={{ mt:1 }}>
                  {/* Table header */}
                  <Grid container sx={{ pb:1, borderBottom:`1px solid ${T.border}`, mb:1 }}>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:.4 }}>Customer</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography sx={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:.4 }}>Churn Score</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography sx={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:.4 }}>LTV</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign:'right' }}>
                      <Typography sx={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:.4 }}>Risk</Typography>
                    </Grid>
                  </Grid>

                  {/* Rows */}
                  {atRiskCustomers.map((c, idx) => {
                    const score     = c.churnScore ?? 0;
                    const barColor  = score >= 80 ? T.rose : score >= 60 ? T.amber : T.emerald;
                    const daysSince = c.daysSinceLastPurchase ?? 0;
                    return (
                      <Box key={c._id} sx={{
                        display:'flex', alignItems:'center',
                        py:1.1, borderBottom: idx < atRiskCustomers.length - 1 ? `1px solid ${T.border}` : 'none',
                      }}>
                        {/* Avatar + name/email */}
                        <Box sx={{ width:'33%', display:'flex', alignItems:'center', gap:1.25 }}>
                          <Avatar sx={{
                            width:34, height:34, borderRadius:'9px',
                            bgcolor: AV_COLORS[idx % AV_COLORS.length] + '30',
                            color:   AV_COLORS[idx % AV_COLORS.length],
                            fontSize:12, fontWeight:800,
                          }}>
                            {initials(c.name)}
                          </Avatar>
                          <Box sx={{ minWidth:0 }}>
                            <Typography sx={{ fontSize:12, fontWeight:700, color:T.textPri, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {c.name}
                            </Typography>
                            <Typography sx={{ fontSize:11, color:T.textMuted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {c.email}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Churn Score + progress bar */}
                        <Box sx={{ width:'28%', pr:1.5 }}>
                          <Box sx={{ display:'flex', justifyContent:'space-between', mb:.4 }}>
                            <Typography sx={{ fontSize:11, color:T.textSec }}>{score}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={score}
                            sx={{
                              height:5, borderRadius:3,
                              bgcolor:`${barColor}20`,
                              '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius:3 },
                            }}
                          />
                        </Box>

                        {/* LTV */}
                        <Box sx={{ width:'18%' }}>
                          <Typography sx={{ fontSize:12, fontWeight:700, color:T.textPri }}>
                            {fmtC(c.lifetimeValue)}
                          </Typography>
                          <Typography sx={{ fontSize:10, color:T.textMuted }}>
                            {lastActiveText(daysSince)}
                          </Typography>
                        </Box>

                        {/* Risk badge */}
                        <Box sx={{ width:'21%', textAlign:'right' }}>
                          <RiskBadge score={score} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </ChartCard>
          </Grid>
        </Grid>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <Box sx={{ mt:4, textAlign:'center' }}>
          <Typography sx={{ fontSize:12, color:T.textMuted }}>
            All data is fetched in real-time from MongoDB.
          </Typography>
        </Box>

      </Box>
    </DashboardLayout>
  );
}
