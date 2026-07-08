import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Skeleton, Alert, useTheme
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

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = {
  gold:    '#c9a84c',
  violet:  '#7c4dff',
  emerald: '#10b981',
  rose:    '#f43f5e',
  sky:     '#0ea5e9',
  amber:   '#f59e0b',
  pink:    '#ec4899',
  teal:    '#14b8a6',
};
const CHART_COLORS = [PALETTE.gold, PALETTE.violet, PALETTE.emerald, PALETTE.sky, PALETTE.pink, PALETTE.teal, PALETTE.amber, PALETTE.rose];
const card   = '#161a1e';
const border = 'rgba(255,255,255,0.07)';
const txt    = '#f1f3f5';
const sub    = '#8b95a1';

const TT = {
  contentStyle: {
    background: '#1c2025', border: `1px solid ${border}`,
    borderRadius: 10, fontSize: 12, color: txt,
    boxShadow: '0 8px 32px rgba(0,0,0,.5)',
  }
};

function ChartCard({ title, subtitle, loading, children }) {
  return (
    <Card sx={{ height: 400, display: 'flex', flexDirection: 'column', bgcolor: card, border: `1px solid ${border}`, borderRadius: '12px', boxShadow: 'none' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ mb: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: txt, lineHeight: 1.3 }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 11, color: sub, mt: .3 }}>{subtitle}</Typography>}
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
        ) : (
          <Box sx={{ flexGrow: 1, minHeight: 0, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              {children}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const theme = useTheme();

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

  const loadAnalyticsData = async () => {
    setLoading(true); setError(null);
    try {
      const [countryRes, cityRes, signupRes, retentionRes, purchaseRes, paymentRes, sessionRes, churnRes] = await Promise.all([
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
      console.error('Failed to load analytics:', err);
      setError('Failed to retrieve analytics data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAnalyticsData(); }, []);

  const fmtCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);

  const paymentMethodMap = { 0: 'Credit Card', 1: 'Debit Card', 2: 'Paypal', 3: 'UPI/Wallet', 4: 'COD' };
  const processedPaymentData = paymentData.map(p => ({ name: paymentMethodMap[p._id] || `Method ${p._id}`, value: p.count }));
  const processedSessionData = sessionData.map(s => ({
    membership: `${s._id} yr${s._id !== 1 ? 's' : ''}`,
    duration: Math.round(s.averageSessionDuration),
    pages: Number(s.averagePagesPerSession).toFixed(1)
  })).sort((a, b) => a.membership.localeCompare(b.membership));
  const processedRetentionData = retentionData.map(r => ({ quarter: r._id, active: r.activeCount, churned: r.churnedCount })).sort((a, b) => a.quarter.localeCompare(b.quarter));
  const processedChurnComparisonData = churnData.map(c => ({
    status: c._id === 1 ? 'Churned' : 'Active',
    avgLTV: Math.round(c.averageLifetimeValue),
    avgLogins: Math.round(c.averageLoginFrequency),
    avgCalls: Number(c.averageCustomerServiceCalls).toFixed(1),
    avgAbandonment: Math.round(c.averageCartAbandonmentRate)
  }));

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>

        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 46, height: 46, borderRadius: '13px', flexShrink: 0,
              background: `linear-gradient(135deg, ${PALETTE.violet}, ${PALETTE.pink})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 18px ${PALETTE.violet}44`,
            }}>
              <BarChartIcon sx={{ fontSize: 23, color: '#fff' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: txt, letterSpacing: '-.5px', lineHeight: 1.2 }}>
                Analytics Deep Dive
              </Typography>
              <Typography sx={{ fontSize: 12, color: sub, mt: .4 }}>
                Comprehensive customer behavior profiles, regional churn distributions, and cohort breakdowns
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Reload analytics">
            <IconButton onClick={loadAnalyticsData} disabled={loading} sx={{
              bgcolor: card, border: `1px solid ${border}`, borderRadius: '10px',
              color: sub, p: 1,
              '&:hover': { borderColor: PALETTE.gold, color: PALETTE.gold, bgcolor: `${PALETTE.gold}12` },
            }}>
              <RefreshIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* ── Row 1: 4 equal columns ── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(0,1fr)', xl: 'repeat(4, minmax(0,1fr))' },
          gap: 2, mb: 2,
        }}>

          {/* Chart 1: Country Breakdown */}
          <ChartCard title="Regional Customer Volume" subtitle="Total active customer distribution by country" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <BarChart data={countryData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} formatter={(v) => [v.toLocaleString(), 'Customers']} />
                <Bar dataKey="count" name="Customers" fill={PALETTE.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 2: Top Cities */}
          <ChartCard title="Top City Cohorts" subtitle="Customer density ranking per metropolitan area" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <BarChart data={cityData.slice(0, 8)} layout="vertical" margin={{ left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="_id" type="category" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} formatter={(v) => [v.toLocaleString(), 'Customers']} />
                <Bar dataKey="count" name="Customers" fill={PALETTE.sky} radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 3: Signup Growth Trends */}
          <ChartCard title="Signup Growth Trend" subtitle="New user registrations grouped by quarter" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={signupData.sort((a, b) => a._id.localeCompare(b._id))}>
                <defs>
                  <linearGradient id="colorSignupArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.violet} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PALETTE.violet} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} formatter={(v) => [v.toLocaleString(), 'Signups']} />
                <Area type="monotone" dataKey="count" stroke={PALETTE.violet} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignupArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 4: Cohort Active vs Churned */}
          <ChartCard title="Retention Cohort Breakdown" subtitle="Active vs Churned customer counts by signup quarter" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <BarChart data={processedRetentionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quarter" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="active" name="Active" fill={PALETTE.emerald} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill={PALETTE.rose} stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* ── Row 2: 3 equal columns ── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(0,1fr)', xl: 'repeat(3, minmax(0,1fr))' },
          gap: 2, mb: 2,
        }}>

          {/* Chart 5: Spend Brackets */}
          <ChartCard title="Spend Brackets Cohort Counts" subtitle="Customer counts segmented by order spend bracket" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <BarChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} formatter={(v) => [v.toLocaleString(), 'Customers']} />
                <Bar dataKey="count" name="Customers" fill={PALETTE.violet} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 6: Payment Methods */}
          <ChartCard title="Preferred Payment Platforms" subtitle="Distribution of payment method preferences" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <PieChart>
                <Pie data={processedPaymentData} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {processedPaymentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <RechartTooltip {...TT} formatter={(v) => [v.toLocaleString(), 'Users']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 7: Session Duration */}
          <ChartCard title="Session Duration vs Membership Length" subtitle="Average site interaction times by loyalty years" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <LineChart data={processedSessionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="membership" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} formatter={(v) => [`${v} mins`, 'Avg Session Length']} />
                <Line type="monotone" dataKey="duration" name="Duration" stroke={PALETTE.gold} strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* ── Row 3: Full-width chart ── */}
        <Box sx={{ mb: 2 }}>
          <ChartCard title="Behavior Metrics: Active vs Churned" subtitle="Comparison of cart abandonment and service calls" loading={loading}>
            <ResponsiveContainer width="99%" height="99%">
              <BarChart data={processedChurnComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="status" stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke={sub} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartTooltip {...TT} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgAbandonment" name="Cart Abandonment Rate %" fill={PALETTE.rose} radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgCalls" name="Customer Service Calls (Mean)" fill={PALETTE.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

      </Box>
    </DashboardLayout>
  );
}
