import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Skeleton, Alert,
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
import FiberManualRecordIcon    from '@mui/icons-material/FiberManualRecord';
import ExpandMoreIcon           from '@mui/icons-material/ExpandMore';
import { useDispatch }          from 'react-redux';
import { showToast }            from '../store/slices';
import api                      from '../utils/api';
import DashboardLayout          from '../components/DashboardLayout';
import { useNavigate }          from 'react-router-dom';

import {
  ResponsiveContainer, PieChart, Pie, Cell,
  Tooltip as RT, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

// ─── Tokens ──────────────────────────────────────────────────────────────────
const gold    = '#c9a84c';
const amber   = '#f59e0b';
const emerald = '#10b981';
const rose    = '#f43f5e';
const sky     = '#38bdf8';
const violet  = '#8b5cf6';
const pink    = '#ec4899';
const teal    = '#14b8a6';
const card    = '#161a1e';
const border  = 'rgba(255,255,255,0.07)';
const txt     = '#f1f3f5';
const sub     = '#8b95a1';
const muted   = '#4b5563';

const PIE1 = [emerald, rose];
const PIE2 = [sky, rose, violet, teal];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fc = v => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v??0);
const fn = v => v!=null ? Number(v).toLocaleString() : '—';

function spark(base, vol, n, seed) {
  const d = []; let v = base, s = seed;
  for(let i=0;i<n;i++){
    s=(s*9301+49297)%233280;
    v=Math.max(0, v*(1+((s/233280)-.5)*vol*2));
    d.push({i,v});
  }
  return d;
}

function calcScore(c) {
  return Math.min(99, Math.round(
    Math.min((c.customerServiceCalls??0)*8,32)+
    (c.cartAbandonmentRate??0)*0.3+
    Math.max(0,20-(c.loginFrequency??20))*1.5+
    Math.min((c.daysSinceLastPurchase??0)*0.4,16)
  ));
}

function lastAgo(d) {
  if(!d||d===0) return 'Today';
  if(d<7) return `${d} days ago`;
  if(d<14) return '1 week ago';
  return `${Math.round(d/7)} weeks ago`;
}

const AVC = [gold,sky,rose,violet,emerald];
const ini = (n='') => n.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();

// ─── Tooltip style ────────────────────────────────────────────────────────────
const TT = {
  contentStyle:{
    background:'#1c2025', border:`1px solid ${border}`,
    borderRadius:10, fontSize:12, color:txt,
    boxShadow:'0 8px 32px rgba(0,0,0,.5)',
  }
};

// ─── Tiny Sparkline ───────────────────────────────────────────────────────────
function Spark({d, color}) {
  const gid = `g${color.slice(1)}`;
  return (
    <Box sx={{width:86,height:36,flexShrink:0}}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={d} margin={{top:2,right:2,left:2,bottom:2}}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.28}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8}
            fill={`url(#${gid})`} dot={false} isAnimationActive={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({title,value,sub:subtitle,icon,color,sparkData,pct,loading}) {
  const up = (pct??0)>=0;
  return (
    <Card sx={{
      bgcolor:card, border:`1px solid ${border}`, borderRadius:'12px',
      boxShadow:'none', height:'100%',
      transition:'border-color .2s',
      '&:hover':{borderColor:`${color}44`},
    }}>
      <CardContent sx={{p:2.5,'&:last-child':{pb:2.5}}}>
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between',mb:1.5}}>
          <Box sx={{display:'flex',alignItems:'center',gap:1}}>
            <Box sx={{
              width:30,height:30,borderRadius:'8px',
              bgcolor:`${color}1a`,display:'flex',
              alignItems:'center',justifyContent:'center',color,flexShrink:0
            }}>
              {React.cloneElement(icon,{sx:{fontSize:15}})}
            </Box>
            <Typography sx={{fontSize:10,fontWeight:700,color:sub,textTransform:'uppercase',letterSpacing:'.4px',lineHeight:1}}>
              {title}
            </Typography>
          </Box>
          {pct!=null && !loading && (
            <Box sx={{
              display:'flex',alignItems:'center',gap:.25,
              px:.7,py:.25,borderRadius:'6px',
              bgcolor:`${up?emerald:rose}1a`,
              color:up?emerald:rose,fontSize:10,fontWeight:700,flexShrink:0
            }}>
              <ArrowUpwardIcon sx={{fontSize:9,transform:up?'none':'rotate(180deg)'}}/>
              {Math.abs(pct)}%
            </Box>
          )}
        </Box>
        <Box sx={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:1}}>
          <Box sx={{minWidth:0,flex:1}}>
            {loading
              ? <Skeleton variant="text" width={80} height={38}/>
              : <Typography sx={{fontSize:22,fontWeight:800,color:txt,letterSpacing:'-1px',lineHeight:1.15}}>
                  {value}
                </Typography>
            }
            <Typography sx={{fontSize:11,color:sub,mt:.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {subtitle}
            </Typography>
          </Box>
          {sparkData && !loading && <Spark d={sparkData} color={color}/>}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
function CC({title,sub:subtitle,children,action,h=340}) {
  return (
    <Card sx={{
      bgcolor:card, border:`1px solid ${border}`, borderRadius:'12px',
      boxShadow:'none', height:h, display:'flex', flexDirection:'column',
      overflow:'visible',
    }}>
      <CardContent sx={{p:2.5,height:'100%',display:'flex',flexDirection:'column','&:last-child':{pb:2.5},overflow:'visible'}}>
        <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',mb:1.5,flexShrink:0}}>
          <Box>
            <Typography sx={{fontSize:14,fontWeight:700,color:txt,lineHeight:1.3}}>{title}</Typography>
            {subtitle && <Typography sx={{fontSize:11,color:sub,mt:.3}}>{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        <Box sx={{flex:1,minHeight:0,position:'relative',overflow:'visible',width:'100%',minWidth:0}}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Donut center label ───────────────────────────────────────────────────────
function DC({cx,cy,v1,v2}) {
  return (
    <g>
      <text x={cx} y={cy-7}  textAnchor="middle" fill={txt} fontSize={19} fontWeight={800}>{v1}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill={sub} fontSize={10}>{v2}</text>
    </g>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RB({s}) {
  const lv = s>=80?'High':s>=60?'Medium':'Low';
  const co = s>=80?rose:s>=60?amber:emerald;
  return (
    <Box component="span" sx={{
      px:1.1,py:.3,borderRadius:'5px',display:'inline-block',
      bgcolor:`${co}1a`,color:co,border:`1px solid ${co}35`,
      fontSize:10,fontWeight:700,whiteSpace:'nowrap'
    }}>
      {lv}
    </Box>
  );
}

// ─── Small chip button ────────────────────────────────────────────────────────
function SC({label,icon}) {
  return (
    <Box sx={{
      display:'flex',alignItems:'center',gap:.5,
      bgcolor:'rgba(255,255,255,0.05)',border:`1px solid ${border}`,
      borderRadius:'8px',px:1.1,py:.5,cursor:'default',
      fontSize:11,fontWeight:600,color:sub,whiteSpace:'nowrap',flexShrink:0,
    }}>
      {icon && React.cloneElement(icon,{sx:{fontSize:12}})}
      {label}<ExpandMoreIcon sx={{fontSize:13}}/>
    </Box>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [s, setS] = useState({
    totalCustomers:null,churnedCount:null,activeCount:null,churnRate:null,
    avgAge:null,avgLTV:null,avgOrderValue:null,avgCreditBalance:null,
    totalReviews:null,avgMobileUsage:null,
  });
  const [churnPieData,  setChurnPieData]  = useState([]);
  const [countryData,   setCountryData]   = useState([]);
  const [signupData,    setSignupData]    = useState([]);
  const [genderData,    setGenderData]    = useState([]);
  const [atRisk,        setAtRisk]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [dateRange,     setDateRange]     = useState('Last 30 Days');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cntR,chR,ageR,ltvR,aovR,credR,revR,mobR,chAR,ctR,sigR,genR,riskR] = await Promise.all([
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
      const churned = cArr.find(g=>g._id===1||g._id===true)?.count ?? 0;
      const active  = cArr.find(g=>g._id===0||g._id===false)?.count ?? 0;

      setS({
        totalCustomers:total, churnedCount:churned, activeCount:active,
        churnRate: total>0 ? ((churned/total)*100).toFixed(1) : '0.0',
        avgAge:           ageR.data.data?.averageAge?.toFixed(1) ?? '—',
        avgLTV:           ltvR.data.data?.averageLifetimeValue ?? 0,
        avgOrderValue:    aovR.data.data?.averageOrderValue ?? 0,
        avgCreditBalance: credR.data.data?.averageCreditBalance ?? 0,
        totalReviews:     revR.data.data?.count ?? 0,
        avgMobileUsage:   mobR.data.data?.averageMobileUsage?.toFixed(1) ?? '—',
      });

      setChurnPieData(chAR.data.data ?? []);
      setCountryData((ctR.data.data??[]).slice(0,8));
      setSignupData(sigR.data.data ?? []);
      setGenderData(genR.data.data ?? []);

      const custs = (riskR.data.data?.customers??[])
        .map(c=>({...c,sc:calcScore(c)}))
        .sort((a,b)=>b.sc-a.sc)
        .slice(0,5);
      setAtRisk(custs);

      dispatch(showToast({message:'Dashboard synced.',severity:'success'}));
    } catch(err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally { setLoading(false); }
  },[dispatch]);

  useEffect(()=>{ load(); },[load]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const tot  = (s.activeCount??0)+(s.churnedCount??0);
  const aP   = tot>0 ? ((s.activeCount/tot)*100).toFixed(1) : '0.0';
  const cP   = tot>0 ? ((s.churnedCount/tot)*100).toFixed(1) : '0.0';

  const churnPie = [
    {name:'Active',  value: s.activeCount??0},
    {name:'Churned', value: s.churnedCount??0},
  ];
  // Fallback so donut always renders
  const churnPieSafe = churnPie.every(p=>p.value===0)
    ? [{name:'Active',value:1},{name:'Churned',value:0}]
    : churnPie;

  const genderPie  = genderData.map(g=>({name:g._id||'Other',value:g.count}));
  const sigChart   = signupData.map(d=>({q:d._id,v:d.count??0})).sort((a,b)=>a.q>b.q?1:-1);
  const ctryChart  = countryData.map(d=>({c:d._id,cnt:d.count??0,ltv:Math.round(d.averageLifetimeValue??0)}));

  const KPIS = [
    {title:'Total Customers',   value:fn(s.totalCustomers),   sub:'Active records in database',   icon:<PeopleIcon/>,              color:gold,    sparkData:spark(14000,.06,10,1), pct:12.4},
    {title:'Churn Rate',        value:`${s.churnRate}%`,      sub:`${fn(s.churnedCount)} customers lost`,icon:<PercentIcon/>,      color:rose,    sparkData:spark(28,.05,10,2),    pct:3.2 },
    {title:'Avg Lifetime Value',value:fc(s.avgLTV),           sub:'Average customer LTV',         icon:<MonetizationOnIcon/>,      color:emerald, sparkData:spark(1400,.06,10,3),  pct:8.7 },
    {title:'Avg Order Value',   value:fc(s.avgOrderValue),    sub:'Average spend per order',      icon:<TrendingUpIcon/>,          color:violet,  sparkData:spark(120,.07,10,4),   pct:6.1 },
    {title:'Average Age',       value:`${s.avgAge} yrs`,      sub:'Mean customer age',            icon:<PersonIcon/>,             color:sky,     sparkData:spark(37,.02,10,5),    pct:null},
    {title:'Avg Credit Balance',value:fc(s.avgCreditBalance), sub:'Avg wallet credit balance',    icon:<AccountBalanceWalletIcon/>,color:pink,    sparkData:spark(1700,.06,10,6),  pct:4.5 },
    {title:'Total Reviews',     value:fn(s.totalReviews),     sub:'Product reviews written',      icon:<StarIcon/>,               color:amber,   sparkData:spark(38000,.07,10,7), pct:15.3},
    {title:'Avg Mobile Usage',  value:`${s.avgMobileUsage} min`,sub:'Avg mobile app usage',      icon:<SmartphoneIcon/>,          color:teal,    sparkData:spark(17,.08,10,8),    pct:9.6 },
  ];

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:3,gap:2,flexWrap:'wrap'}}>
        <Box sx={{display:'flex',alignItems:'center',gap:1.5}}>
          <Box sx={{
            width:46,height:46,borderRadius:'13px',flexShrink:0,
            background:`linear-gradient(135deg,${gold},${amber})`,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:`0 0 18px ${gold}44`,
          }}>
            <DashboardIcon sx={{fontSize:23,color:'#0d0f12'}}/>
          </Box>
          <Box>
            <Typography sx={{fontSize:20,fontWeight:900,color:txt,letterSpacing:'-.5px',lineHeight:1.2}}>
              Executive Churn Intelligence
            </Typography>
            <Box sx={{display:'flex',alignItems:'center',gap:1.5,mt:.4,flexWrap:'wrap'}}>
              <Typography sx={{fontSize:12,color:sub}}>
                Live statistics from MongoDB &nbsp;•&nbsp; {loading?'…':fn(s.totalCustomers)} records
              </Typography>
              <Box sx={{display:'flex',alignItems:'center',gap:.5}}>
                <FiberManualRecordIcon sx={{fontSize:7,color:emerald,animation:'pulse 2s infinite'}}/>
                <Typography sx={{fontSize:11,color:emerald,fontWeight:600}}>Real-time</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{display:'flex',alignItems:'center',gap:1.5,flexShrink:0}}>
          <Box sx={{
            display:'flex',alignItems:'center',gap:1,
            bgcolor:card,border:`1px solid ${border}`,borderRadius:'10px',px:1.5,py:.8,
          }}>
            <CalendarTodayIcon sx={{fontSize:12,color:sub}}/>
            <Select value={dateRange} onChange={e=>setDateRange(e.target.value)}
              variant="standard" disableUnderline
              sx={{fontSize:12,fontWeight:600,color:txt,'& .MuiSelect-select':{p:0},'& .MuiSelect-icon':{color:sub,fontSize:16}}}>
              {['Last 7 Days','Last 30 Days','Last 90 Days','This Year','All Time'].map(o=>(
                <MenuItem key={o} value={o} sx={{fontSize:12}}>{o}</MenuItem>
              ))}
            </Select>
          </Box>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={load} disabled={loading} sx={{
                bgcolor:card,border:`1px solid ${border}`,borderRadius:'10px',
                color:sub,p:1,
                '&:hover':{borderColor:gold,color:gold,bgcolor:`${gold}12`},
                '&.Mui-disabled':{opacity:.4},
              }}>
                <RefreshIcon sx={{fontSize:17,...(loading&&{animation:'spin 1s linear infinite'})}}/>
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" onClose={()=>setError(null)} sx={{
          mb:2.5,borderRadius:'10px',border:`1px solid ${amber}30`,
          bgcolor:`${amber}10`,color:txt,'& .MuiAlert-icon':{color:amber},
        }}>
          {error}
        </Alert>
      )}

      {/* ── KPI Row 1 (4 columns) ─────────────────────────────────────────── */}
      <Box sx={{
        display:'grid',
        gridTemplateColumns:{xs:'1fr',sm:'minmax(0, 1fr) minmax(0, 1fr)',md:'repeat(4, minmax(0, 1fr))'},
        gap:2,mb:2,
      }}>
        {KPIS.slice(0,4).map((k,i)=>(
          <Box key={i}><KPI {...k} loading={loading}/></Box>
        ))}
      </Box>

      {/* ── KPI Row 2 (4 columns) ─────────────────────────────────────────── */}
      <Box sx={{
        display:'grid',
        gridTemplateColumns:{xs:'1fr',sm:'minmax(0, 1fr) minmax(0, 1fr)',md:'repeat(4, minmax(0, 1fr))'},
        gap:2,mb:2.5,
      }}>
        {KPIS.slice(4).map((k,i)=>(
          <Box key={i}><KPI {...k} loading={loading}/></Box>
        ))}
      </Box>

      {/* ── Analytics Row: 3 equal thirds ────────────────────────────────── */}
      <Box sx={{
        display:'grid',
        gridTemplateColumns:{xs:'1fr',md:'repeat(3, minmax(0, 1fr))'},
        gap:2,mb:2,
      }}>

        {/* Churn Status Distribution */}
        <CC title="Churn Status Distribution"
          sub={loading?'Loading…':`${s.churnRate??'—'}% overall churn rate`}
          h={340}>
          {loading ? (
            <Box sx={{display:'flex',justifyContent:'center',pt:3}}>
              <Skeleton variant="circular" width={150} height={150}/>
            </Box>
          ) : (
            <Box sx={{display:'flex',flexDirection:'column',height:'100%'}}>
              <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                {/* Donut */}
                <Box sx={{width:180,height:180,flexShrink:0}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={churnPieSafe} cx="50%" cy="50%"
                        innerRadius={54} outerRadius={78}
                        paddingAngle={3} dataKey="value" stroke="none"
                        labelLine={false}
                        label={({cx,cy})=>(
                          <DC cx={cx} cy={cy}
                            v1={tot>0?`${s.churnRate}%`:'—'}
                            v2="Churn Rate"/>
                        )}>
                        {churnPieSafe.map((_,i)=><Cell key={i} fill={PIE1[i]} opacity={tot===0?.3:1}/>)}
                      </Pie>
                      <RT {...TT} formatter={(v,n)=>[fn(tot===0?0:v),n]}/>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                {/* Legend */}
                <Box sx={{flexGrow:1}}>
                  {[
                    {name:'Active',  co:emerald,cnt:s.activeCount,  pct:aP},
                    {name:'Churned', co:rose,    cnt:s.churnedCount, pct:cP},
                  ].map(r=>(
                    <Box key={r.name} sx={{mb:1.5}}>
                      <Box sx={{display:'flex',alignItems:'center',gap:.75,mb:.3}}>
                        <Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:r.co,flexShrink:0}}/>
                        <Typography sx={{fontSize:12.5,fontWeight:700,color:txt}}>{r.name}</Typography>
                      </Box>
                      <Typography sx={{fontSize:11,color:sub,pl:2.25}}>
                        {fn(r.cnt)} ({r.pct}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box sx={{mt:'auto',pt:1.5,borderTop:`1px solid ${border}`,textAlign:'center'}}>
                <Typography sx={{fontSize:11,color:muted}}>
                  Total Customers: {fn(tot)}
                </Typography>
              </Box>
            </Box>
          )}
        </CC>

        {/* Gender Distribution */}
        <CC title="Gender Distribution" sub="Customer breakdown by gender" h={340}>
          {loading ? (
            <Box sx={{display:'flex',justifyContent:'center',pt:3}}>
              <Skeleton variant="circular" width={150} height={150}/>
            </Box>
          ) : genderPie.length===0 ? (
            <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
              <Typography sx={{color:sub,fontSize:13}}>No gender data available</Typography>
            </Box>
          ) : (
            <Box sx={{position:'absolute',top:0,left:0,right:0,bottom:0}}>
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie data={genderPie} cx="50%" cy="42%"
                    innerRadius={60} outerRadius={96}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {genderPie.map((_,i)=><Cell key={i} fill={PIE2[i%PIE2.length]}/>)}
                  </Pie>
                  <RT {...TT} formatter={(v,n)=>[fn(v),n]}/>
                  <Legend verticalAlign="bottom" height={48} iconType="circle" iconSize={8}
                    formatter={(val,entry)=>(
                      <span style={{color:sub,fontSize:11.5}}>
                        {val}&nbsp;
                        <span style={{color:muted,fontSize:11}}>
                          {tot>0?((entry.payload.value/tot)*100).toFixed(1):0}%
                          &nbsp;({fn(entry.payload.value)})
                        </span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CC>

        {/* Signup Cohort Trends */}
        <CC title="Signup Cohort Trends" sub="Customer signups grouped by quarter"
          h={340} action={<SC label="This Year"/>}>
          {loading ? (
            <Skeleton variant="rectangular" height={210} sx={{borderRadius:2,mt:1}}/>
          ) : sigChart.length===0 ? (
            <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
              <Typography sx={{color:sub,fontSize:13}}>No signup data available</Typography>
            </Box>
          ) : (
            <Box sx={{position:'absolute',top:0,left:0,right:0,bottom:0}}>
              <ResponsiveContainer width="99%" height="99%">
                <AreaChart data={sigChart} margin={{top:26,right:8,left:-16,bottom:0}}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={gold} stopOpacity={0.38}/>
                      <stop offset="100%" stopColor={gold} stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="q" tick={{fontSize:11.5,fill:sub}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:10.5,fill:sub}} tickLine={false} axisLine={false}/>
                  <RT {...TT} formatter={v=>[fn(v),'Signups']}/>
                  <Area type="monotone" dataKey="v" stroke={gold} strokeWidth={2.5}
                    fill="url(#sg)"
                    dot={{fill:gold,r:4,strokeWidth:0}}
                    activeDot={{r:6,strokeWidth:0}}
                    label={{position:'top',fill:sub,fontSize:11,formatter:fn}}/>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CC>
      </Box>

      {/* ── Bottom Row: 7/5 split (58% / 42%) ────────────────────────────── */}
      <Box sx={{
        display:'grid',
        gridTemplateColumns:{xs:'1fr',lg:'minmax(0, 7fr) minmax(0, 5fr)'},
        gap:2,
      }}>

        {/* Country Market Performance */}
        <CC title="Country Market Performance"
          sub="Customer count vs Average LTV by country (Top 8)"
          h={360}
          action={<SC label="Top 8 Countries" icon={<PublicIcon/>}/>}>
          {loading ? (
            <Skeleton variant="rectangular" height={250} sx={{borderRadius:2}}/>
          ) : ctryChart.length===0 ? (
            <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
              <Typography sx={{color:sub,fontSize:13}}>No country data available</Typography>
            </Box>
          ) : (
            <Box sx={{display:'flex',flexDirection:'column',height:'100%'}}>
              <Box sx={{display:'flex',gap:2.5,mb:1.5,flexShrink:0}}>
                {[{l:'Customer Count',c:gold},{l:'Average LTV ($)',c:emerald}].map(x=>(
                  <Box key={x.l} sx={{display:'flex',alignItems:'center',gap:.75}}>
                    <Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:x.c}}/>
                    <Typography sx={{fontSize:11.5,color:sub}}>{x.l}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{flex:1,minHeight:0,position:'relative'}}>
                <Box sx={{position:'absolute',top:0,left:0,right:0,bottom:0}}>
                  <ResponsiveContainer width="99%" height="99%">
                    <BarChart data={ctryChart} margin={{top:4,right:14,left:-12,bottom:4}} barGap={3} barCategoryGap="28%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="c" tick={{fontSize:10.5,fill:sub}} tickLine={false} axisLine={false}/>
                    <YAxis yAxisId="l" tick={{fontSize:10,fill:sub}} tickLine={false} axisLine={false}/>
                    <YAxis yAxisId="r" orientation="right" tick={{fontSize:10,fill:sub}} tickLine={false} axisLine={false}/>
                    <RT {...TT} formatter={(v,n)=>n==='ltv'?[fc(v),'Avg LTV']:[fn(v),'Customers']}/>
                    <Bar yAxisId="l" dataKey="cnt" name="cnt" fill={gold}    radius={[4,4,0,0]} maxBarSize={30}/>
                    <Bar yAxisId="r" dataKey="ltv" name="ltv" fill={emerald} radius={[4,4,0,0]} maxBarSize={30} opacity={.9}/>
                  </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          )}
        </CC>

        {/* Top At-Risk Customers */}
        <CC title="Top At-Risk Customers" sub="Customers with highest churn probability"
          h={360}
          action={
            <Button size="small" onClick={()=>navigate('/customers')} sx={{
              fontSize:11,fontWeight:600,color:sub,
              border:`1px solid ${border}`,borderRadius:'7px',
              px:1.25,py:.4,textTransform:'none',minWidth:0,
              '&:hover':{borderColor:gold,color:gold,bgcolor:`${gold}10`},
            }}>
              View All
            </Button>
          }>
          {loading ? (
            <Box>
              {[1,2,3,4,5].map(i=>(
                <Box key={i} sx={{display:'flex',alignItems:'center',gap:1.5,mb:1.5}}>
                  <Skeleton variant="circular" width={30} height={30}/>
                  <Box sx={{flex:1}}><Skeleton width="50%" height={13}/><Skeleton width="38%" height={11}/></Box>
                  <Skeleton width={40} height={13}/>
                  <Skeleton width={44} height={22} sx={{borderRadius:1}}/>
                </Box>
              ))}
            </Box>
          ) : atRisk.length===0 ? (
            <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
              <Typography sx={{color:sub,fontSize:13}}>No data available</Typography>
            </Box>
          ) : (
            <Box sx={{overflow:'auto'}}>
              {/* Table headers */}
              <Box sx={{
                display:'grid',
                gridTemplateColumns:'minmax(0,2fr) minmax(0,1.5fr) minmax(0,0.9fr) minmax(0,0.7fr)',
                gap:'6px',pb:.75,mb:.25,borderBottom:`1px solid ${border}`,
              }}>
                {['Customer','Churn Score','LTV','Risk'].map(h=>(
                  <Typography key={h} sx={{fontSize:9.5,color:muted,fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px'}}>
                    {h}
                  </Typography>
                ))}
              </Box>

              {/* Rows */}
              {atRisk.map((c,idx)=>{
                const sc = c.sc??0;
                const bC = sc>=80?rose:sc>=60?amber:emerald;
                return (
                  <Box key={c._id} sx={{
                    display:'grid',
                    gridTemplateColumns:'minmax(0,2fr) minmax(0,1.5fr) minmax(0,0.9fr) minmax(0,0.7fr)',
                    gap:'6px',alignItems:'center',
                    py:1,borderBottom:idx<atRisk.length-1?`1px solid ${border}`:'none',
                  }}>
                    {/* Customer */}
                    <Box sx={{display:'flex',alignItems:'center',gap:1,minWidth:0}}>
                      <Avatar sx={{
                        width:29,height:29,borderRadius:'7px',flexShrink:0,
                        bgcolor:`${AVC[idx%AVC.length]}20`,
                        color:AVC[idx%AVC.length],
                        fontSize:10,fontWeight:800,
                      }}>
                        {ini(c.name)}
                      </Avatar>
                      <Box sx={{minWidth:0}}>
                        <Typography sx={{fontSize:11.5,fontWeight:700,color:txt,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {c.name}
                        </Typography>
                        <Typography sx={{fontSize:10,color:muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {c.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Churn score */}
                    <Box sx={{pr:1}}>
                      <Typography sx={{fontSize:10.5,color:sub,fontWeight:600,mb:.4}}>{sc}%</Typography>
                      <LinearProgress variant="determinate" value={sc} sx={{
                        height:4,borderRadius:2,
                        bgcolor:`${bC}18`,
                        '& .MuiLinearProgress-bar':{bgcolor:bC,borderRadius:2},
                      }}/>
                    </Box>

                    {/* LTV */}
                    <Box>
                      <Typography sx={{fontSize:11.5,fontWeight:700,color:txt}}>{fc(c.lifetimeValue)}</Typography>
                      <Typography sx={{fontSize:10,color:muted}}>{lastAgo(c.daysSinceLastPurchase)}</Typography>
                    </Box>

                    {/* Badge */}
                    <Box><RB s={sc}/></Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CC>
      </Box>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Box sx={{mt:3.5,textAlign:'center'}}>
        <Typography sx={{fontSize:11.5,color:muted}}>
          All data is fetched in real-time from MongoDB.
        </Typography>
      </Box>
    </DashboardLayout>
  );
}
