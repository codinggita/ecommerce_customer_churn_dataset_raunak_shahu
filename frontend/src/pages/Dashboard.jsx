import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert,
  useTheme, Chip, IconButton, Tooltip, Avatar, LinearProgress,
  Select, MenuItem, Button,
} from '@mui/material';
import DashboardIcon            from '@mui/icons-material/Dashboard';
import PeopleIcon               from '@mui/icons-material/People';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon       from '@mui/icons-material/MonetizationOn';
import PercentIcon              from '@mui/icons-material/Percent';
import PersonIcon               from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon                 from '@mui/icons-material/Star';
import SmartphoneIcon           from '@mui/icons-material/Smartphone';
import RefreshIcon              from '@mui/icons-material/Refresh';
import PublicIcon               from '@mui/icons-material/Public';
import CalendarTodayIcon        from '@mui/icons-material/CalendarToday';
import ArrowUpwardIcon          from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon        from '@mui/icons-material/ArrowDownward';
import FiberManualRecordIcon    from '@mui/icons-material/FiberManualRecord';
import ExpandMoreIcon           from '@mui/icons-material/ExpandMore';
import { useDispatch }          from 'react-redux';
import { showToast }            from '../store/slices';
import api                      from '../utils/api';
import DashboardLayout          from '../components/DashboardLayout';
import { useNavigate }          from 'react-router-dom';

import {
  ResponsiveContainer, PieChart, Pie, Cell,
  Tooltip as RT, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts';

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  gold:    '#c9a84c',
  goldLt:  '#e6c364',
  emerald: '#10b981',
  rose:    '#f43f5e',
  sky:     '#38bdf8',
  violet:  '#8b5cf6',
  amber:   '#f59e0b',
  pink:    '#ec4899',
  teal:    '#14b8a6',
  card:    '#161a1e',
  border:  'rgba(255,255,255,0.07)',
  txt:     '#f1f3f5',
  sub:     '#8b95a1',
  muted:   '#4b5563',
};

const DONUT_CHURN  = [C.emerald, C.rose];
const DONUT_GENDER = [C.sky, C.rose, C.violet, C.teal];

// ─── Deterministic sparkline generator ───────────────────────────────────────
function genSpark(base, vol = 0.06, n = 10, seed = 1) {
  const pts = []; let v = base; let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    v = Math.max(0, v * (1 + ((s / 233280) - 0.5) * vol * 2));
    pts.push({ i, v });
  }
  return pts;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ pts, color }) {
  return (
    <ResponsiveContainer width={90} height={40}>
      <AreaChart data={pts} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8}
          fill={`url(#g${color.slice(1)})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ title, value, sub, icon, color, pts, pct, loading }) {
  const up = (pct ?? 0) >= 0;
  return (
    <Card sx={{
      bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px',
      boxShadow: 'none', height: '100%',
      transition: 'border-color .2s',
      '&:hover': { borderColor: `${color}40` },
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Row 1: icon + label + badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '9px',
              bgcolor: `${color}18`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color,
            }}>
              {React.cloneElement(icon, { sx: { fontSize: 17 } })}
            </Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {title}
            </Typography>
          </Box>
          {pct != null && !loading && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: .3, px: .8, py: .3, borderRadius: '6px',
              bgcolor: up ? `${C.emerald}18` : `${C.rose}18`,
              color:   up ? C.emerald : C.rose, fontSize: 11, fontWeight: 700,
            }}>
              {up ? <ArrowUpwardIcon sx={{ fontSize: 10 }} /> : <ArrowDownwardIcon sx={{ fontSize: 10 }} />}
              {Math.abs(pct)}%
            </Box>
          )}
        </Box>

        {/* Row 2: value + sparkline */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            {loading
              ? <Skeleton variant="text" width={90} height={44} />
              : <Typography sx={{ fontSize: 26, fontWeight: 800, color: C.txt, letterSpacing: '-1px', lineHeight: 1.1 }}>
                  {value}
                </Typography>
            }
            <Typography sx={{ fontSize: 11.5, color: C.sub, mt: .5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sub}
            </Typography>
          </Box>
          {pts && !loading && <Sparkline pts={pts} color={color} />}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────
function CC({ title, sub, children, action, minH = 320 }) {
  return (
    <Card sx={{
      bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px',
      boxShadow: 'none', height: '100%', minHeight: minH,
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: C.txt }}>{title}</Typography>
            {sub && <Typography sx={{ fontSize: 12, color: C.sub, mt: .3 }}>{sub}</Typography>}
          </Box>
          {action}
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const TTS = {
  contentStyle: {
    background: '#1e2429', border: `1px solid ${C.border}`,
    borderRadius: 10, fontSize: 12, color: C.txt,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
};

// ─── Donut center text ────────────────────────────────────────────────────────
function DonutCenter({ cx, cy, v1, v2 }) {
  return (
    <g>
      <text x={cx} y={cy - 9} textAnchor="middle" fill={C.txt} fontSize={21} fontWeight={800}>{v1}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={C.sub} fontSize={11}>{v2}</text>
    </g>
  );
}

// ─── Risk badge ──────────────────────────────────────────────────────────────
function Risk({ s }) {
  const lv = s >= 80 ? 'High' : s >= 60 ? 'Medium' : 'Low';
  const co = s >= 80 ? C.rose : s >= 60 ? C.amber : C.emerald;
  return (
    <Box sx={{ px: 1.25, py: .35, borderRadius: '6px', bgcolor: `${co}20`, color: co,
      border: `1px solid ${co}40`, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>
      {lv}
    </Box>
  );
}

// ─── Churn score ──────────────────────────────────────────────────────────────
function score(c) {
  return Math.min(99, Math.round(
    Math.min(c.customerServiceCalls * 8, 32)
    + (c.cartAbandonmentRate ?? 0) * 0.3
    + Math.max(0, 20 - (c.loginFrequency ?? 20)) * 1.5
    + Math.min((c.daysSinceLastPurchase ?? 0) * 0.4, 16)
  ));
}

function lastActive(d) {
  if (!d || d === 0) return 'Today';
  if (d < 7) return `${d} days ago`;
  if (d < 14) return '1 week ago';
  return `${Math.round(d / 7)} weeks ago`;
}

const AV_BG = [C.gold, C.sky, C.rose, C.violet, C.emerald];

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCustomers: null, churnedCount: null, activeCount: null,
    churnRate: null, avgAge: null, avgLTV: null,
    avgOrderValue: null, avgCreditBalance: null,
    totalReviews: null, avgMobileUsage: null,
  });
  const [churnData,    setChurnData]    = useState([]);
  const [countryData,  setCountryData]  = useState([]);
  const [signupData,   setSignupData]   = useState([]);
  const [genderData,   setGenderData]   = useState([]);
  const [atRisk,       setAtRisk]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [dateRange,    setDateRange]    = useState('Last 30 Days');

  const fmtC = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);
  const fmtN = (v) => v != null ? Number(v).toLocaleString() : '—';

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cntR, churnCR, ageR, ltvR, aovR, credR, revR, mobR,
             churnAR, countryR, signupR, genderR, atRiskR] = await Promise.all([
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
      const cArr    = churnCR.data.data ?? [];
      const churned = cArr.find(g => g._id === 1 || g._id === true)?.count ?? 0;
      const active  = cArr.find(g => g._id === 0 || g._id === false)?.count ?? 0;

      setStats({
        totalCustomers: total, churnedCount: churned, activeCount: active,
        churnRate: total > 0 ? ((churned / total) * 100).toFixed(1) : '0.0',
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

      const custs = (atRiskR.data.data?.customers ?? [])
        .map(c => ({ ...c, churnScore: score(c) }))
        .sort((a, b) => b.churnScore - a.churnScore)
        .slice(0, 5);
      setAtRisk(custs);

      dispatch(showToast({ message: 'Dashboard synced.', severity: 'success' }));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // Derived chart data
  const churnPie = [
    { name: 'Active',  value: stats.activeCount  ?? 0 },
    { name: 'Churned', value: stats.churnedCount ?? 0 },
  ];
  const genderPie = genderData.map(g => ({ name: g._id || 'Other', value: g.count }));
  const signupChart = signupData
    .map(d => ({ q: d._id, v: d.count ?? 0 }))
    .sort((a, b) => String(a.q).localeCompare(String(b.q)));
  const countryChart = countryData.map(d => ({
    c: d._id, count: d.count ?? 0, ltv: Math.round(d.averageLifetimeValue ?? 0),
  }));

  const total     = (stats.activeCount ?? 0) + (stats.churnedCount ?? 0);
  const actPct    = total > 0 ? ((stats.activeCount  / total) * 100).toFixed(1) : '0.0';
  const chnPct    = total > 0 ? ((stats.churnedCount / total) * 100).toFixed(1) : '0.0';

  // KPI configs
  const KPIS = [
    { title: 'Total Customers',   value: fmtN(stats.totalCustomers),   sub: 'Active records in database',   icon: <PeopleIcon />,               color: C.gold,    pts: genSpark(14000, .06, 10, 1), pct: 12.4 },
    { title: 'Churn Rate',        value: `${stats.churnRate}%`,         sub: `${fmtN(stats.churnedCount)} customers lost`, icon: <PercentIcon />, color: C.rose,    pts: genSpark(28, .05, 10, 2),    pct: 3.2  },
    { title: 'Avg Lifetime Value',value: fmtC(stats.avgLTV),            sub: 'Average customer LTV',         icon: <MonetizationOnIcon />,        color: C.emerald, pts: genSpark(1400, .06, 10, 3),  pct: 8.7  },
    { title: 'Avg Order Value',   value: fmtC(stats.avgOrderValue),     sub: 'Average spend per order',      icon: <TrendingUpIcon />,            color: C.violet,  pts: genSpark(120, .07, 10, 4),   pct: 6.1  },
    { title: 'Average Age',       value: `${stats.avgAge} yrs`,         sub: 'Mean customer age',            icon: <PersonIcon />,                color: C.sky,     pts: genSpark(37, .02, 10, 5),    pct: null },
    { title: 'Avg Credit Balance',value: fmtC(stats.avgCreditBalance),  sub: 'Avg wallet credit balance',    icon: <AccountBalanceWalletIcon />,  color: C.pink,    pts: genSpark(1700, .06, 10, 6),  pct: 4.5  },
    { title: 'Total Reviews',     value: fmtN(stats.totalReviews),      sub: 'Product reviews written',      icon: <StarIcon />,                  color: C.amber,   pts: genSpark(38000, .07, 10, 7), pct: 15.3 },
    { title: 'Avg Mobile Usage',  value: `${stats.avgMobileUsage} min`, sub: 'Avg mobile app usage',         icon: <SmartphoneIcon />,            color: C.teal,    pts: genSpark(17, .08, 10, 8),    pct: 9.6  },
  ];

  // Small select-style chips
  const SmChip = ({ label }) => (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: .5,
      bgcolor: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
      borderRadius: '8px', px: 1.25, py: .6, cursor: 'default',
      fontSize: 12, fontWeight: 600, color: C.sub,
    }}>
      {label} <ExpandMoreIcon sx={{ fontSize: 14 }} />
    </Box>
  );

  return (
    <DashboardLayout>
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px',
            background: `linear-gradient(135deg, ${C.gold}, ${C.amber})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 24px ${C.gold}55`, flexShrink: 0,
          }}>
            <DashboardIcon sx={{ fontSize: 26, color: '#0d0f12' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.txt, letterSpacing: '-.5px', lineHeight: 1.2 }}>
              Executive Churn Intelligence
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: .5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13, color: C.sub }}>
                Live statistics from MongoDB &nbsp;•&nbsp; {loading ? '…' : fmtN(stats.totalCustomers)} records
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: C.emerald, animation: 'pulse 2s infinite' }} />
                <Typography sx={{ fontSize: 12, color: C.emerald, fontWeight: 600 }}>Real-time</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', px: 1.5, py: .85,
          }}>
            <CalendarTodayIcon sx={{ fontSize: 13, color: C.sub }} />
            <Select value={dateRange} onChange={e => setDateRange(e.target.value)}
              variant="standard" disableUnderline
              sx={{ fontSize: 13, fontWeight: 600, color: C.txt, '& .MuiSelect-select': { p: 0 }, '& .MuiSelect-icon': { color: C.sub, fontSize: 18 } }}>
              {['Last 7 Days','Last 30 Days','Last 90 Days','This Year','All Time'].map(o =>
                <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>
              )}
            </Select>
          </Box>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={loadDashboard} disabled={loading} sx={{
                bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px',
                color: C.sub, p: 1.1,
                '&:hover': { borderColor: C.gold, color: C.gold, bgcolor: `${C.gold}12` },
                '&.Mui-disabled': { opacity: .4 },
              }}>
                <RefreshIcon sx={{ fontSize: 18, ...(loading && { animation: 'spin 1s linear infinite' }) }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.25; } }
      `}</style>

      {error && (
        <Alert severity="warning" onClose={() => setError(null)} sx={{
          mb: 3, borderRadius: '10px',
          bgcolor: `${C.amber}12`, color: C.txt,
          border: `1px solid ${C.amber}30`,
          '& .MuiAlert-icon': { color: C.amber },
        }}>
          {error}
        </Alert>
      )}

      {/* ── KPI row 1 ────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {KPIS.slice(0, 4).map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KPICard {...k} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── KPI row 2 ────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPIS.slice(4).map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KPICard {...k} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Analytics row: Churn + Gender + Signup (equal thirds) ────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Churn Status Distribution */}
        <Grid item xs={12} md={4}>
          <CC title="Churn Status Distribution"
            sub={loading ? 'Loading…' : `${stats.churnRate}% overall churn rate`}
            minH={350}>
            {loading ? (
              <Box sx={{ display:'flex', justifyContent:'center', pt:4 }}>
                <Skeleton variant="circular" width={170} height={170} />
              </Box>
            ) : (
              <Box>
                {/* Donut + legend side by side */}
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <Box sx={{ width: 190, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height={190}>
                      <PieChart>
                        <Pie data={churnPie} cx="50%" cy="50%"
                          innerRadius={58} outerRadius={84}
                          paddingAngle={3} dataKey="value" stroke="none"
                          labelLine={false}
                          label={({ cx, cy }) => (
                            <DonutCenter cx={cx} cy={cy} v1={`${stats.churnRate}%`} v2="Churn Rate" />
                          )}>
                          {churnPie.map((_, i) => <Cell key={i} fill={DONUT_CHURN[i]} />)}
                        </Pie>
                        <RT {...TTS} formatter={(v, n) => [fmtN(v), n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    {[
                      { name: 'Active',  col: C.emerald, cnt: stats.activeCount,  pct: actPct },
                      { name: 'Churned', col: C.rose,    cnt: stats.churnedCount, pct: chnPct },
                    ].map(r => (
                      <Box key={r.name} sx={{ mb: 1.5 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.4 }}>
                          <Box sx={{ width:9, height:9, borderRadius:'50%', bgcolor:r.col, flexShrink:0 }} />
                          <Typography sx={{ fontSize:13, fontWeight:700, color:C.txt }}>{r.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize:12, color:C.sub, pl:2.25 }}>
                          {fmtN(r.cnt)} ({r.pct}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ pt:1.5, borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
                  <Typography sx={{ fontSize:12, color:C.muted }}>
                    Total Customers: {fmtN(total)}
                  </Typography>
                </Box>
              </Box>
            )}
          </CC>
        </Grid>

        {/* Gender Distribution */}
        <Grid item xs={12} md={4}>
          <CC title="Gender Distribution" sub="Customer breakdown by gender" minH={350}>
            {loading ? (
              <Box sx={{ display:'flex', justifyContent:'center', pt:4 }}>
                <Skeleton variant="circular" width={170} height={170} />
              </Box>
            ) : genderPie.length === 0 ? (
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
                <Typography sx={{ color:C.sub }}>No gender data</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie data={genderPie} cx="50%" cy="44%"
                    innerRadius={68} outerRadius={104}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {genderPie.map((_, i) => <Cell key={i} fill={DONUT_GENDER[i % DONUT_GENDER.length]} />)}
                  </Pie>
                  <RT {...TTS} formatter={(v, n) => [fmtN(v), n]} />
                  <Legend verticalAlign="bottom" height={52} iconType="circle" iconSize={8}
                    formatter={(val, entry) => (
                      <span style={{ color: C.sub, fontSize: 12 }}>
                        {val}&nbsp;
                        <span style={{ color: C.muted, fontSize: 11 }}>
                          {total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0}%&nbsp;
                          ({fmtN(entry.payload.value)})
                        </span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CC>
        </Grid>

        {/* Signup Cohort Trends */}
        <Grid item xs={12} md={4}>
          <CC title="Signup Cohort Trends" sub="Customer signups grouped by quarter"
            minH={350} action={<SmChip label="This Year" />}>
            {loading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius:2, mt:1 }} />
            ) : signupChart.length === 0 ? (
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
                <Typography sx={{ color:C.sub }}>No signup data</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={signupChart} margin={{ top:28, right:10, left:-10, bottom:0 }}>
                  <defs>
                    <linearGradient id="sigFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.gold} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={C.gold} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="q"
                    tick={{ fontSize:12, fill:C.sub }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:11, fill:C.sub }} tickLine={false} axisLine={false} />
                  <RT {...TTS} formatter={v => [fmtN(v), 'Signups']} />
                  <Area type="monotone" dataKey="v"
                    stroke={C.gold} strokeWidth={2.5}
                    fill="url(#sigFill)"
                    dot={{ fill:C.gold, r:4, strokeWidth:0 }}
                    activeDot={{ r:6, strokeWidth:0 }}
                    label={{ position:'top', fill:C.sub, fontSize:11,
                      formatter: (v) => fmtN(v) }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CC>
        </Grid>
      </Grid>

      {/* ── Bottom row: Country 60% + At-Risk 40% ────────────────────────── */}
      <Grid container spacing={2}>

        {/* Country Market Performance */}
        <Grid item xs={12} lg={7}>
          <CC title="Country Market Performance"
            sub="Customer count vs Average LTV by country (Top 8)"
            minH={340}
            action={
              <Box sx={{
                display:'flex', alignItems:'center', gap:.5,
                bgcolor:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`,
                borderRadius:'8px', px:1.25, py:.55, cursor:'default',
                fontSize:12, fontWeight:600, color:C.sub,
              }}>
                <PublicIcon sx={{ fontSize:13 }} /> &nbsp;Top 8 Countries <ExpandMoreIcon sx={{ fontSize:14 }} />
              </Box>
            }>
            {loading ? (
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius:2, mt:1 }} />
            ) : countryChart.length === 0 ? (
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:220 }}>
                <Typography sx={{ color:C.sub }}>No country data</Typography>
              </Box>
            ) : (
              <Box>
                {/* Legend */}
                <Box sx={{ display:'flex', gap:2.5, mb:1 }}>
                  {[{ lbl:'Customer Count', col:C.gold }, { lbl:'Average LTV ($)', col:C.emerald }].map(l => (
                    <Box key={l.lbl} sx={{ display:'flex', alignItems:'center', gap:.75 }}>
                      <Box sx={{ width:9, height:9, borderRadius:'50%', bgcolor:l.col }} />
                      <Typography sx={{ fontSize:12, color:C.sub }}>{l.lbl}</Typography>
                    </Box>
                  ))}
                </Box>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={countryChart} margin={{ top:5, right:16, left:-12, bottom:5 }} barGap={3} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="c" tick={{ fontSize:11, fill:C.sub }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="l" tick={{ fontSize:10, fill:C.sub }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:C.sub }} tickLine={false} axisLine={false} />
                    <RT {...TTS} formatter={(v, n) => n==='ltv' ? [fmtC(v),'Avg LTV'] : [fmtN(v),'Customers']} />
                    <Bar yAxisId="l" dataKey="count" name="count" fill={C.gold}    radius={[4,4,0,0]} maxBarSize={36} />
                    <Bar yAxisId="r" dataKey="ltv"   name="ltv"   fill={C.emerald} radius={[4,4,0,0]} maxBarSize={36} opacity={.9} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CC>
        </Grid>

        {/* Top At-Risk Customers */}
        <Grid item xs={12} lg={5}>
          <CC title="Top At-Risk Customers" sub="Customers with highest churn probability"
            minH={340}
            action={
              <Button size="small" onClick={() => navigate('/customers')} sx={{
                fontSize:12, fontWeight:600, color:C.sub,
                border:`1px solid ${C.border}`, borderRadius:'8px',
                px:1.5, py:.5, textTransform:'none', minWidth:0,
                '&:hover': { borderColor:C.gold, color:C.gold, bgcolor:`${C.gold}10` },
              }}>
                View All
              </Button>
            }>
            {loading ? (
              <Box sx={{ mt:1 }}>
                {[1,2,3,4,5].map(i => (
                  <Box key={i} sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1.5 }}>
                    <Skeleton variant="circular" width={34} height={34} />
                    <Box sx={{ flexGrow:1 }}><Skeleton width="55%" height={14} /><Skeleton width="40%" height={12} /></Box>
                    <Skeleton width={50} height={14} />
                    <Skeleton width={52} height={26} sx={{ borderRadius:1 }} />
                  </Box>
                ))}
              </Box>
            ) : atRisk.length === 0 ? (
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
                <Typography sx={{ color:C.sub }}>No data available</Typography>
              </Box>
            ) : (
              <Box sx={{ mt:1 }}>
                {/* Table head */}
                <Box sx={{ display:'grid', gridTemplateColumns:'2fr 1.6fr 1fr 1fr', gap:1, pb:1, borderBottom:`1px solid ${C.border}`, mb:.5 }}>
                  {['Customer','Churn Score','LTV','Risk'].map(h => (
                    <Typography key={h} sx={{ fontSize:10.5, color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {/* Rows */}
                {atRisk.map((cust, idx) => {
                  const sc   = cust.churnScore ?? 0;
                  const barC = sc >= 80 ? C.rose : sc >= 60 ? C.amber : C.emerald;
                  return (
                    <Box key={cust._id} sx={{
                      display:'grid', gridTemplateColumns:'2fr 1.6fr 1fr 1fr',
                      gap:1, alignItems:'center',
                      py:1.1, borderBottom: idx < atRisk.length-1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      {/* Customer col */}
                      <Box sx={{ display:'flex', alignItems:'center', gap:1, minWidth:0 }}>
                        <Avatar sx={{
                          width:32, height:32, borderRadius:'8px', flexShrink:0,
                          bgcolor:`${AV_BG[idx % AV_BG.length]}25`,
                          color: AV_BG[idx % AV_BG.length],
                          fontSize:11, fontWeight:800,
                        }}>
                          {initials(cust.name)}
                        </Avatar>
                        <Box sx={{ minWidth:0 }}>
                          <Typography sx={{ fontSize:12, fontWeight:700, color:C.txt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {cust.name}
                          </Typography>
                          <Typography sx={{ fontSize:10.5, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {cust.email}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Churn score col */}
                      <Box sx={{ pr:1 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:.5 }}>
                          <Typography sx={{ fontSize:11, color:C.sub, fontWeight:600 }}>{sc}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={sc} sx={{
                          height:5, borderRadius:3,
                          bgcolor:`${barC}18`,
                          '& .MuiLinearProgress-bar': { bgcolor:barC, borderRadius:3 },
                        }} />
                      </Box>

                      {/* LTV col */}
                      <Box>
                        <Typography sx={{ fontSize:12, fontWeight:700, color:C.txt }}>{fmtC(cust.lifetimeValue)}</Typography>
                        <Typography sx={{ fontSize:10.5, color:C.muted }}>{lastActive(cust.daysSinceLastPurchase)}</Typography>
                      </Box>

                      {/* Risk badge */}
                      <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
                        <Risk s={sc} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CC>
        </Grid>
      </Grid>

      {/* ── footer ───────────────────────────────────────────────────────── */}
      <Box sx={{ mt:4, textAlign:'center' }}>
        <Typography sx={{ fontSize:12, color:C.muted }}>
          All data is fetched in real-time from MongoDB.
        </Typography>
      </Box>
    </DashboardLayout>
  );
}
