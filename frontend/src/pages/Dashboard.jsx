import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Alert,
  IconButton, Tooltip, Avatar, LinearProgress, Select, MenuItem, Button,
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gold:    '#c9a84c',
  amber:   '#f59e0b',
  emerald: '#10b981',
  rose:    '#f43f5e',
  sky:     '#38bdf8',
  violet:  '#8b5cf6',
  pink:    '#ec4899',
  teal:    '#14b8a6',
  card:    '#161a1e',
  border:  'rgba(255,255,255,0.07)',
  borderH: 'rgba(255,255,255,0.14)',
  txt:     '#f1f3f5',
  sub:     '#8b95a1',
  muted:   '#4b5563',
};

const PIE_CHURN  = [C.emerald, C.rose];
const PIE_GENDER = [C.sky, C.rose, C.violet, C.teal];

// ─── Sparkline seed generator ─────────────────────────────────────────────────
function mkSpark(base, vol, n, seed) {
  const d = []; let v = base, s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    v = Math.max(0, v * (1 + ((s / 233280) - 0.5) * vol * 2));
    d.push({ i, v });
  }
  return d;
}

// ─── Sparkline chart ──────────────────────────────────────────────────────────
function Spark({ d, color }) {
  const id = `sp${color.replace('#', '')}`;
  return (
    <Box sx={{ width: 88, height: 38, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={d} margin={{ top: 3, right: 2, left: 2, bottom: 3 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8}
            fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, sub, icon, color, spark, pct, loading }) {
  const up = (pct ?? 0) >= 0;
  return (
    <Card sx={{
      bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px',
      boxShadow: 'none', height: '100%',
      '&:hover': { borderColor: `${color}50` },
      transition: 'border-color .2s',
    }}>
      <CardContent sx={{ p: 2.5, pb: '20px !important' }}>
        {/* Label row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 30, height: 30, borderRadius: '8px',
              bgcolor: `${color}1a`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
            }}>
              {React.cloneElement(icon, { sx: { fontSize: 16 } })}
            </Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.4px', lineHeight: 1 }}>
              {title}
            </Typography>
          </Box>
          {pct != null && !loading && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: .25, px: .7, py: .25, borderRadius: '6px',
              bgcolor: up ? `${C.emerald}1a` : `${C.rose}1a`,
              color: up ? C.emerald : C.rose, fontSize: 10.5, fontWeight: 700, flexShrink: 0,
            }}>
              {up
                ? <ArrowUpwardIcon sx={{ fontSize: 10 }} />
                : <ArrowDownwardIcon sx={{ fontSize: 10 }} />}
              {Math.abs(pct)}%
            </Box>
          )}
        </Box>

        {/* Value + sparkline */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {loading
              ? <Skeleton variant="text" width={80} height={40} />
              : <Typography sx={{ fontSize: 24, fontWeight: 800, color: C.txt, letterSpacing: '-1px', lineHeight: 1.1 }}>
                  {value}
                </Typography>
            }
            <Typography sx={{ fontSize: 11, color: C.sub, mt: .5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub}
            </Typography>
          </Box>
          {spark && !loading && <Spark d={spark} color={color} />}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function CCard({ title, sub, children, action, minH = 300 }) {
  return (
    <Card sx={{
      bgcolor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px',
      boxShadow: 'none', height: '100%', minHeight: minH,
    }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', pb: '20px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.txt, lineHeight: 1.3 }}>{title}</Typography>
            {sub && <Typography sx={{ fontSize: 11.5, color: C.sub, mt: .25 }}>{sub}</Typography>}
          </Box>
          {action}
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Recharts tooltip styles ──────────────────────────────────────────────────
const TTS = {
  contentStyle: {
    background: '#1e2429',
    border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: 10, fontSize: 12, color: '#f1f3f5',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
};

// ─── Donut center ─────────────────────────────────────────────────────────────
function DCenter({ cx, cy, val, lbl }) {
  return (
    <g>
      <text x={cx} y={cy - 8}  textAnchor="middle" fill="#f1f3f5" fontSize={20} fontWeight={800}>{val}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#8b95a1" fontSize={11}>{lbl}</text>
    </g>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function Risk({ s }) {
  const lv = s >= 80 ? 'High' : s >= 60 ? 'Medium' : 'Low';
  const co = s >= 80 ? C.rose : s >= 60 ? C.amber : C.emerald;
  return (
    <Box component="span" sx={{
      px: 1.1, py: .3, borderRadius: '6px',
      bgcolor: `${co}20`, color: co, border: `1px solid ${co}40`,
      fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {lv}
    </Box>
  );
}

// ─── Churn score helper ───────────────────────────────────────────────────────
function calcScore(c) {
  return Math.min(99, Math.round(
    Math.min((c.customerServiceCalls ?? 0) * 8, 32)
    + (c.cartAbandonmentRate ?? 0) * 0.3
    + Math.max(0, 20 - (c.loginFrequency ?? 20)) * 1.5
    + Math.min((c.daysSinceLastPurchase ?? 0) * 0.4, 16)
  ));
}

function lastActive(d) {
  if (!d || d === 0) return 'Today';
  if (d < 7)  return `${d} days ago`;
  if (d < 14) return '1 week ago';
  return `${Math.round(d / 7)} weeks ago`;
}

const AV_COLORS = [C.gold, C.sky, C.rose, C.violet, C.emerald];
function initials(n = '') { return n.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase(); }
function fmtC(v) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0); }
function fmtN(v) { return v != null ? Number(v).toLocaleString() : '—'; }

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCustomers: null, churnedCount: null, activeCount: null, churnRate: null,
    avgAge: null, avgLTV: null, avgOrderValue: null, avgCreditBalance: null,
    totalReviews: null, avgMobileUsage: null,
  });
  const [churnData,  setChurnData]  = useState([]);
  const [countryData,setCountryData]= useState([]);
  const [signupData, setSignupData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [atRisk,     setAtRisk]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [dateRange,  setDateRange]  = useState('Last 30 Days');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cntR, chR, ageR, ltvR, aovR, credR, revR, mobR,
             chAR, ctryR, sigR, genR, riskR] = await Promise.all([
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
      const cArr    = chR.data.data ?? [];
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

      setChurnData(chAR.data.data ?? []);
      setCountryData((ctryR.data.data ?? []).slice(0, 8));
      setSignupData(sigR.data.data ?? []);
      setGenderData(genR.data.data ?? []);

      const custs = (riskR.data.data?.customers ?? [])
        .map(c => ({ ...c, sc: calcScore(c) }))
        .sort((a, b) => b.sc - a.sc)
        .slice(0, 5);
      setAtRisk(custs);

      dispatch(showToast({ message: 'Dashboard synced.', severity: 'success' }));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally { setLoading(false); }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const tot = (stats.activeCount ?? 0) + (stats.churnedCount ?? 0);
  const aP  = tot > 0 ? ((stats.activeCount  / tot) * 100).toFixed(1) : '0.0';
  const cP  = tot > 0 ? ((stats.churnedCount / tot) * 100).toFixed(1) : '0.0';

  const churnPie  = [{ name: 'Active', value: stats.activeCount ?? 0 }, { name: 'Churned', value: stats.churnedCount ?? 0 }];
  const genderPie = genderData.map(g => ({ name: g._id || 'Other', value: g.count }));
  const sigChart  = signupData.map(d => ({ q: d._id, v: d.count ?? 0 })).sort((a, b) => a.q > b.q ? 1 : -1);
  const ctChart   = countryData.map(d => ({ c: d._id, cnt: d.count ?? 0, ltv: Math.round(d.averageLifetimeValue ?? 0) }));

  // ── KPI definitions ────────────────────────────────────────────────────────
  const KPIS = [
    { title:'Total Customers',    value:fmtN(stats.totalCustomers),   sub:'Active records in database',  icon:<PeopleIcon />,               color:C.gold,    spark:mkSpark(14000,.06,10,1), pct:12.4 },
    { title:'Churn Rate',         value:`${stats.churnRate}%`,        sub:`${fmtN(stats.churnedCount)} customers lost`, icon:<PercentIcon />,color:C.rose,    spark:mkSpark(28,.05,10,2),    pct:3.2  },
    { title:'Avg Lifetime Value', value:fmtC(stats.avgLTV),           sub:'Average customer LTV',        icon:<MonetizationOnIcon />,        color:C.emerald, spark:mkSpark(1400,.06,10,3),  pct:8.7  },
    { title:'Avg Order Value',    value:fmtC(stats.avgOrderValue),    sub:'Average spend per order',     icon:<TrendingUpIcon />,            color:C.violet,  spark:mkSpark(120,.07,10,4),   pct:6.1  },
    { title:'Average Age',        value:`${stats.avgAge} yrs`,        sub:'Mean customer age',           icon:<PersonIcon />,                color:C.sky,     spark:mkSpark(37,.02,10,5),    pct:null },
    { title:'Avg Credit Balance', value:fmtC(stats.avgCreditBalance), sub:'Avg wallet credit balance',   icon:<AccountBalanceWalletIcon />,  color:C.pink,    spark:mkSpark(1700,.06,10,6),  pct:4.5  },
    { title:'Total Reviews',      value:fmtN(stats.totalReviews),     sub:'Product reviews written',     icon:<StarIcon />,                  color:C.amber,   spark:mkSpark(38000,.07,10,7), pct:15.3 },
    { title:'Avg Mobile Usage',   value:`${stats.avgMobileUsage} min`,sub:'Avg mobile app usage',        icon:<SmartphoneIcon />,            color:C.teal,    spark:mkSpark(17,.08,10,8),    pct:9.6  },
  ];

  function SmBtn({ label, icon }) {
    return (
      <Box sx={{
        display:'flex', alignItems:'center', gap:.5,
        bgcolor:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`,
        borderRadius:'8px', px:1.2, py:.55, cursor:'default',
        fontSize:11.5, fontWeight:600, color:C.sub, whiteSpace:'nowrap', flexShrink:0,
      }}>
        {icon && React.cloneElement(icon, { sx:{ fontSize:13 } })}
        {label} <ExpandMoreIcon sx={{ fontSize:14 }} />
      </Box>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:2 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <Box sx={{
            width:48, height:48, borderRadius:'13px', flexShrink:0,
            background:`linear-gradient(135deg, ${C.gold}, ${C.amber})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 0 20px ${C.gold}44`,
          }}>
            <DashboardIcon sx={{ fontSize:24, color:'#0d0f12' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize:20, fontWeight:900, color:C.txt, letterSpacing:'-.5px', lineHeight:1.2 }}>
              Executive Churn Intelligence
            </Typography>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mt:.4, flexWrap:'wrap' }}>
              <Typography sx={{ fontSize:12.5, color:C.sub }}>
                Live statistics from MongoDB &nbsp;•&nbsp; {loading ? '…' : fmtN(stats.totalCustomers)} records
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:.5 }}>
                <FiberManualRecordIcon sx={{ fontSize:7, color:C.emerald, animation:'pulse 2s infinite' }} />
                <Typography sx={{ fontSize:11.5, color:C.emerald, fontWeight:600 }}>Real-time</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, flexShrink:0 }}>
          <Box sx={{
            display:'flex', alignItems:'center', gap:1,
            bgcolor:C.card, border:`1px solid ${C.border}`, borderRadius:'10px', px:1.5, py:.8,
          }}>
            <CalendarTodayIcon sx={{ fontSize:13, color:C.sub }} />
            <Select value={dateRange} onChange={e => setDateRange(e.target.value)}
              variant="standard" disableUnderline
              sx={{ fontSize:12.5, fontWeight:600, color:C.txt, '& .MuiSelect-select':{ p:0 }, '& .MuiSelect-icon':{ color:C.sub, fontSize:17 } }}>
              {['Last 7 Days','Last 30 Days','Last 90 Days','This Year','All Time'].map(o => (
                <MenuItem key={o} value={o} sx={{ fontSize:12.5 }}>{o}</MenuItem>
              ))}
            </Select>
          </Box>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={load} disabled={loading} sx={{
                bgcolor:C.card, border:`1px solid ${C.border}`, borderRadius:'10px',
                color:C.sub, p:1,
                '&:hover':{ borderColor:C.gold, color:C.gold, bgcolor:`${C.gold}12` },
                '&.Mui-disabled':{ opacity:.4 },
              }}>
                <RefreshIcon sx={{ fontSize:18, ...(loading && { animation:'spin 1s linear infinite' }) }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
      `}</style>

      {error && (
        <Alert severity="warning" onClose={() => setError(null)} sx={{
          mb:2.5, borderRadius:'10px', border:`1px solid ${C.amber}30`,
          bgcolor:`${C.amber}12`, color:C.txt, '& .MuiAlert-icon':{ color:C.amber },
        }}>
          {error}
        </Alert>
      )}

      {/* ── KPI Row 1 ────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb:2 }}>
        {KPIS.slice(0,4).map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><KPICard {...k} loading={loading} /></Grid>
        ))}
      </Grid>
      {/* ── KPI Row 2 ────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb:2.5 }}>
        {KPIS.slice(4).map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><KPICard {...k} loading={loading} /></Grid>
        ))}
      </Grid>

      {/* ── Analytics Row ────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb:2 }}>

        {/* Churn donut */}
        <Grid item xs={12} md={4}>
          <CCard title="Churn Status Distribution"
            sub={loading ? 'Loading…' : `${stats.churnRate}% overall churn rate`}
            minH={340}>
            {loading
              ? <Box sx={{ display:'flex', justifyContent:'center', pt:4 }}><Skeleton variant="circular" width={160} height={160} /></Box>
              : (
                <Box sx={{ height:'100%', display:'flex', flexDirection:'column' }}>
                  <Box sx={{ display:'flex', alignItems:'center' }}>
                    {/* Donut */}
                    <Box sx={{ width:185, flexShrink:0 }}>
                      <ResponsiveContainer width="100%" height={185}>
                        <PieChart>
                          <Pie data={churnPie} cx="50%" cy="50%"
                            innerRadius={56} outerRadius={82}
                            paddingAngle={3} dataKey="value" stroke="none" labelLine={false}
                            label={({ cx, cy }) => <DCenter cx={cx} cy={cy} val={`${stats.churnRate}%`} lbl="Churn Rate" />}>
                            {churnPie.map((_, i) => <Cell key={i} fill={PIE_CHURN[i]} />)}
                          </Pie>
                          <RT {...TTS} formatter={(v,n) => [fmtN(v), n]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    {/* Legend */}
                    <Box sx={{ flexGrow:1, pl:1 }}>
                      {[
                        { name:'Active',  col:C.emerald, cnt:stats.activeCount,  pct:aP },
                        { name:'Churned', col:C.rose,    cnt:stats.churnedCount, pct:cP },
                      ].map(r => (
                        <Box key={r.name} sx={{ mb:1.5 }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.3 }}>
                            <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:r.col, flexShrink:0 }} />
                            <Typography sx={{ fontSize:13, fontWeight:700, color:C.txt }}>{r.name}</Typography>
                          </Box>
                          <Typography sx={{ fontSize:11.5, color:C.sub, pl:2.25 }}>
                            {fmtN(r.cnt)} ({r.pct}%)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mt:'auto', pt:1.5, borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
                    <Typography sx={{ fontSize:11.5, color:C.muted }}>Total Customers: {fmtN(tot)}</Typography>
                  </Box>
                </Box>
              )
            }
          </CCard>
        </Grid>

        {/* Gender donut */}
        <Grid item xs={12} md={4}>
          <CCard title="Gender Distribution" sub="Customer breakdown by gender" minH={340}>
            {loading
              ? <Box sx={{ display:'flex', justifyContent:'center', pt:4 }}><Skeleton variant="circular" width={160} height={160} /></Box>
              : genderPie.length === 0
                ? <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}><Typography sx={{ color:C.sub }}>No gender data</Typography></Box>
                : (
                  <Box sx={{ height:280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={genderPie} cx="50%" cy="44%"
                          innerRadius={64} outerRadius={98}
                          paddingAngle={3} dataKey="value" stroke="none">
                          {genderPie.map((_, i) => <Cell key={i} fill={PIE_GENDER[i % PIE_GENDER.length]} />)}
                        </Pie>
                        <RT {...TTS} formatter={(v,n) => [fmtN(v), n]} />
                        <Legend verticalAlign="bottom" height={50} iconType="circle" iconSize={8}
                          formatter={(val, entry) => (
                            <span style={{ color:C.sub, fontSize:11.5 }}>
                              {val}&nbsp;
                              <span style={{ color:C.muted }}>
                                {tot > 0 ? ((entry.payload.value / tot)*100).toFixed(1) : 0}% ({fmtN(entry.payload.value)})
                              </span>
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )
            }
          </CCard>
        </Grid>

        {/* Signup cohort area chart */}
        <Grid item xs={12} md={4}>
          <CCard title="Signup Cohort Trends" sub="Customer signups grouped by quarter"
            minH={340} action={<SmBtn label="This Year" />}>
            {loading
              ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius:2 }} />
              : sigChart.length === 0
                ? <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}><Typography sx={{ color:C.sub }}>No signup data</Typography></Box>
                : (
                  <Box sx={{ height:260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sigChart} margin={{ top:28, right:6, left:-14, bottom:0 }}>
                        <defs>
                          <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={C.gold} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={C.gold} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="q" tick={{ fontSize:11.5, fill:C.sub }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize:10.5, fill:C.sub }} tickLine={false} axisLine={false} />
                        <RT {...TTS} formatter={v => [fmtN(v), 'Signups']} />
                        <Area type="monotone" dataKey="v" stroke={C.gold} strokeWidth={2.5}
                          fill="url(#sigGrad)"
                          dot={{ fill:C.gold, r:4, strokeWidth:0 }}
                          activeDot={{ r:6, strokeWidth:0 }}
                          label={{ position:'top', fill:C.sub, fontSize:11, formatter:fmtN }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )
            }
          </CCard>
        </Grid>
      </Grid>

      {/* ── Bottom Row ───────────────────────────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Country chart */}
        <Grid item xs={12} lg={7}>
          <CCard title="Country Market Performance"
            sub="Customer count vs Average LTV by country (Top 8)"
            minH={320}
            action={<SmBtn label="Top 8 Countries" icon={<PublicIcon />} />}>
            {loading
              ? <Skeleton variant="rectangular" height={230} sx={{ borderRadius:2 }} />
              : ctChart.length === 0
                ? <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}><Typography sx={{ color:C.sub }}>No country data</Typography></Box>
                : (
                  <Box sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
                    {/* Legend */}
                    <Box sx={{ display:'flex', gap:2.5, mb:1 }}>
                      {[{ l:'Customer Count', c:C.gold }, { l:'Average LTV ($)', c:C.emerald }].map(x => (
                        <Box key={x.l} sx={{ display:'flex', alignItems:'center', gap:.75 }}>
                          <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:x.c }} />
                          <Typography sx={{ fontSize:11.5, color:C.sub }}>{x.l}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ flexGrow:1, minHeight:0 }}>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={ctChart} margin={{ top:4, right:12, left:-14, bottom:4 }} barGap={3} barCategoryGap="28%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="c" tick={{ fontSize:11, fill:C.sub }} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="l" tick={{ fontSize:10, fill:C.sub }} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:C.sub }} tickLine={false} axisLine={false} />
                          <RT {...TTS} formatter={(v,n) => n==='ltv' ? [fmtC(v),'Avg LTV'] : [fmtN(v),'Customers']} />
                          <Bar yAxisId="l" dataKey="cnt" name="cnt" fill={C.gold}    radius={[4,4,0,0]} maxBarSize={32} />
                          <Bar yAxisId="r" dataKey="ltv" name="ltv" fill={C.emerald} radius={[4,4,0,0]} maxBarSize={32} opacity={.9} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )
            }
          </CCard>
        </Grid>

        {/* At-Risk table */}
        <Grid item xs={12} lg={5}>
          <CCard title="Top At-Risk Customers" sub="Customers with highest churn probability"
            minH={320}
            action={
              <Button size="small" onClick={() => navigate('/customers')} sx={{
                fontSize:11.5, fontWeight:600, color:C.sub,
                border:`1px solid ${C.border}`, borderRadius:'8px',
                px:1.5, py:.45, textTransform:'none', minWidth:0,
                '&:hover':{ borderColor:C.gold, color:C.gold, bgcolor:`${C.gold}10` },
              }}>
                View All
              </Button>
            }>
            {loading
              ? (
                <Box>
                  {[1,2,3,4,5].map(i => (
                    <Box key={i} sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1.5 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box sx={{ flex:1 }}><Skeleton width="50%" height={13} /><Skeleton width="38%" height={11} /></Box>
                      <Skeleton width={42} height={13} />
                      <Skeleton width={48} height={24} sx={{ borderRadius:1 }} />
                    </Box>
                  ))}
                </Box>
              )
              : atRisk.length === 0
                ? <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}><Typography sx={{ color:C.sub }}>No data available</Typography></Box>
                : (
                  <Box>
                    {/* Column headers */}
                    <Box sx={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 0.9fr 0.8fr', gap:'8px', pb:.75, borderBottom:`1px solid ${C.border}`, mb:.25 }}>
                      {['Customer','Churn Score','LTV','Risk'].map(h => (
                        <Typography key={h} sx={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'.4px' }}>{h}</Typography>
                      ))}
                    </Box>
                    {/* Rows */}
                    {atRisk.map((cust, idx) => {
                      const s   = cust.sc ?? 0;
                      const bC  = s >= 80 ? C.rose : s >= 60 ? C.amber : C.emerald;
                      return (
                        <Box key={cust._id} sx={{
                          display:'grid', gridTemplateColumns:'2fr 1.5fr 0.9fr 0.8fr',
                          gap:'8px', alignItems:'center',
                          py:1, borderBottom:idx < atRisk.length-1 ? `1px solid ${C.border}` : 'none',
                        }}>
                          {/* Customer */}
                          <Box sx={{ display:'flex', alignItems:'center', gap:1, minWidth:0 }}>
                            <Avatar sx={{
                              width:30, height:30, borderRadius:'8px', flexShrink:0,
                              bgcolor:`${AV_COLORS[idx % AV_COLORS.length]}22`,
                              color: AV_COLORS[idx % AV_COLORS.length],
                              fontSize:10.5, fontWeight:800,
                            }}>
                              {initials(cust.name)}
                            </Avatar>
                            <Box sx={{ minWidth:0 }}>
                              <Typography sx={{ fontSize:11.5, fontWeight:700, color:C.txt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {cust.name}
                              </Typography>
                              <Typography sx={{ fontSize:10, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {cust.email}
                              </Typography>
                            </Box>
                          </Box>
                          {/* Score + bar */}
                          <Box sx={{ pr:1 }}>
                            <Typography sx={{ fontSize:10.5, color:C.sub, fontWeight:600, mb:.4 }}>{s}%</Typography>
                            <LinearProgress variant="determinate" value={s} sx={{
                              height:4, borderRadius:2,
                              bgcolor:`${bC}18`,
                              '& .MuiLinearProgress-bar':{ bgcolor:bC, borderRadius:2 },
                            }} />
                          </Box>
                          {/* LTV + last active */}
                          <Box>
                            <Typography sx={{ fontSize:11.5, fontWeight:700, color:C.txt }}>{fmtC(cust.lifetimeValue)}</Typography>
                            <Typography sx={{ fontSize:10, color:C.muted }}>{lastActive(cust.daysSinceLastPurchase)}</Typography>
                          </Box>
                          {/* Risk badge */}
                          <Box>
                            <Risk s={s} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )
            }
          </CCard>
        </Grid>
      </Grid>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Box sx={{ mt:3.5, textAlign:'center' }}>
        <Typography sx={{ fontSize:11.5, color:C.muted }}>
          All data is fetched in real-time from MongoDB.
        </Typography>
      </Box>

    </DashboardLayout>
  );
}
