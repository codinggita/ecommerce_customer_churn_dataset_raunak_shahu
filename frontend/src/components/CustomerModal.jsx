import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  Typography, Alert, Box, Divider, CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../utils/api';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  age: Yup.number().positive('Age must be positive').integer().required('Age is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
  country: Yup.string().required('Country is required'),
  city: Yup.string().required('City is required'),
  membershipYears: Yup.number().min(0).required('Membership years is required'),
  loginFrequency: Yup.number().min(0).required('Login frequency is required'),
  sessionDuration: Yup.number().min(0).required('Session duration average is required'),
  pagesPerSession: Yup.number().min(0).required('Pages per session is required'),
  cartAbandonmentRate: Yup.number().min(0).max(100).required('Cart abandonment is required'),
  wishlistItems: Yup.number().min(0).required('Wishlist count is required'),
  purchases: Yup.number().min(0).required('Total purchases is required'),
  averageOrderValue: Yup.number().min(0).required('Average order value is required'),
  daysSinceLastPurchase: Yup.number().min(0).required('Days since last purchase is required'),
  discountRate: Yup.number().min(0).max(100).required('Discount rate is required'),
  returnsRate: Yup.number().min(0).max(100).required('Returns rate is required'),
  emailOpenRate: Yup.number().min(0).max(100).required('Email open rate is required'),
  customerServiceCalls: Yup.number().min(0).required('Customer service calls count is required'),
  lifetimeValue: Yup.number().min(0).required('Lifetime Value (LTV) is required'),
  creditBalance: Yup.number().min(0).required('Credit balance is required'),
  churned: Yup.number().oneOf([0, 1]).required('Churn status is required'),
  signupQuarter: Yup.string().oneOf(['Q1', 'Q2', 'Q3', 'Q4']).required('Signup quarter is required'),
});

const defaultValues = {
  name: '',
  email: '',
  age: 30,
  gender: 'Female',
  country: 'United States',
  city: 'New York',
  membershipYears: 1,
  loginFrequency: 12,
  sessionDuration: 15,
  pagesPerSession: 4,
  cartAbandonmentRate: 20,
  wishlistItems: 3,
  purchases: 5,
  averageOrderValue: 45,
  daysSinceLastPurchase: 10,
  discountRate: 5,
  returnsRate: 2,
  emailOpenRate: 40,
  customerServiceCalls: 1,
  lifetimeValue: 250,
  creditBalance: 15,
  churned: 0,
  signupQuarter: 'Q1',
};

export default function CustomerModal({ open, onClose, customer, onSuccess }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!customer;

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setErrorMsg(null);
      try {
        if (isEdit) {
          await api.put(`/customers/${customer._id}`, values);
        } else {
          await api.post('/customers', values);
        }
        onSuccess(isEdit ? 'Customer updated successfully' : 'Customer created successfully');
        onClose();
      } catch (err) {
        console.error("Save customer failed:", err);
        setErrorMsg(err.message || 'Failed to save customer record.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Load values when editing
  useEffect(() => {
    if (customer) {
      const editValues = {};
      Object.keys(defaultValues).forEach(key => {
        editValues[key] = customer[key] !== undefined ? customer[key] : defaultValues[key];
      });
      formik.setValues(editValues);
    } else {
      formik.setValues(defaultValues);
    }
  }, [customer, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="font-bold">
        {isEdit ? 'Edit Customer File' : 'Add New Customer Profile'}
      </DialogTitle>
      <Divider />
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ p: 4 }}>
          {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

          <Grid container spacing={3}>
            {/* Section 1: Demographics */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" className="font-bold">
                1. Demographics & Identity
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="email"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="age"
                name="age"
                label="Age"
                type="number"
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.age && Boolean(formik.errors.age)}
                helperText={formik.touched.age && formik.errors.age}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="quarter-label">Signup Quarter</InputLabel>
                <Select
                  labelId="quarter-label"
                  id="signupQuarter"
                  name="signupQuarter"
                  value={formik.values.signupQuarter}
                  onChange={formik.handleChange}
                  label="Signup Quarter"
                >
                  <MenuItem value="Q1">Q1</MenuItem>
                  <MenuItem value="Q2">Q2</MenuItem>
                  <MenuItem value="Q3">Q3</MenuItem>
                  <MenuItem value="Q4">Q4</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="country"
                name="country"
                label="Country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="city"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* Section 2: Engagement */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" className="font-bold">
                2. App Engagement & Customer Service
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="membershipYears"
                name="membershipYears"
                label="Membership Years"
                type="number"
                value={formik.values.membershipYears}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.membershipYears && Boolean(formik.errors.membershipYears)}
                helperText={formik.touched.membershipYears && formik.errors.membershipYears}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="loginFrequency"
                name="loginFrequency"
                label="Login Frequency (Monthly)"
                type="number"
                value={formik.values.loginFrequency}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.loginFrequency && Boolean(formik.errors.loginFrequency)}
                helperText={formik.touched.loginFrequency && formik.errors.loginFrequency}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="sessionDuration"
                name="sessionDuration"
                label="Avg Session Duration (Mins)"
                type="number"
                value={formik.values.sessionDuration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sessionDuration && Boolean(formik.errors.sessionDuration)}
                helperText={formik.touched.sessionDuration && formik.errors.sessionDuration}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="pagesPerSession"
                name="pagesPerSession"
                label="Pages Per Session"
                type="number"
                value={formik.values.pagesPerSession}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pagesPerSession && Boolean(formik.errors.pagesPerSession)}
                helperText={formik.touched.pagesPerSession && formik.errors.pagesPerSession}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="customerServiceCalls"
                name="customerServiceCalls"
                label="Customer Service Calls"
                type="number"
                value={formik.values.customerServiceCalls}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.customerServiceCalls && Boolean(formik.errors.customerServiceCalls)}
                helperText={formik.touched.customerServiceCalls && formik.errors.customerServiceCalls}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="emailOpenRate"
                name="emailOpenRate"
                label="Email Open Rate (%)"
                type="number"
                value={formik.values.emailOpenRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emailOpenRate && Boolean(formik.errors.emailOpenRate)}
                helperText={formik.touched.emailOpenRate && formik.errors.emailOpenRate}
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* Section 3: Commercial metrics */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" className="font-bold">
                3. Commercial Metrics & Status
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                id="purchases"
                name="purchases"
                label="Total Purchases"
                type="number"
                value={formik.values.purchases}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purchases && Boolean(formik.errors.purchases)}
                helperText={formik.touched.purchases && formik.errors.purchases}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                id="averageOrderValue"
                name="averageOrderValue"
                label="Avg Order Value ($)"
                type="number"
                value={formik.values.averageOrderValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.averageOrderValue && Boolean(formik.errors.averageOrderValue)}
                helperText={formik.touched.averageOrderValue && formik.errors.averageOrderValue}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                id="lifetimeValue"
                name="lifetimeValue"
                label="Lifetime Value ($)"
                type="number"
                value={formik.values.lifetimeValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lifetimeValue && Boolean(formik.errors.lifetimeValue)}
                helperText={formik.touched.lifetimeValue && formik.errors.lifetimeValue}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                id="creditBalance"
                name="creditBalance"
                label="Credit Balance ($)"
                type="number"
                value={formik.values.creditBalance}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.creditBalance && Boolean(formik.errors.creditBalance)}
                helperText={formik.touched.creditBalance && formik.errors.creditBalance}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="cartAbandonmentRate"
                name="cartAbandonmentRate"
                label="Cart Abandonment Rate (%)"
                type="number"
                value={formik.values.cartAbandonmentRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cartAbandonmentRate && Boolean(formik.errors.cartAbandonmentRate)}
                helperText={formik.touched.cartAbandonmentRate && formik.errors.cartAbandonmentRate}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="wishlistItems"
                name="wishlistItems"
                label="Wishlist Items"
                type="number"
                value={formik.values.wishlistItems}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.wishlistItems && Boolean(formik.errors.wishlistItems)}
                helperText={formik.touched.wishlistItems && formik.errors.wishlistItems}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="daysSinceLastPurchase"
                name="daysSinceLastPurchase"
                label="Days Since Last Order"
                type="number"
                value={formik.values.daysSinceLastPurchase}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.daysSinceLastPurchase && Boolean(formik.errors.daysSinceLastPurchase)}
                helperText={formik.touched.daysSinceLastPurchase && formik.errors.daysSinceLastPurchase}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="discountRate"
                name="discountRate"
                label="Discount Rate Usage (%)"
                type="number"
                value={formik.values.discountRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.discountRate && Boolean(formik.errors.discountRate)}
                helperText={formik.touched.discountRate && formik.errors.discountRate}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                id="returnsRate"
                name="returnsRate"
                label="Product Returns Rate (%)"
                type="number"
                value={formik.values.returnsRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.returnsRate && Boolean(formik.errors.returnsRate)}
                helperText={formik.touched.returnsRate && formik.errors.returnsRate}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="churned-label">Churn Status</InputLabel>
                <Select
                  labelId="churned-label"
                  id="churned"
                  name="churned"
                  value={formik.values.churned}
                  onChange={formik.handleChange}
                  label="Churn Status"
                >
                  <MenuItem value={0}>Active</MenuItem>
                  <MenuItem value={1}>Churned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />

        <DialogActions sx={{ px: 4, py: 2.5 }}>
          <Button onClick={onClose} color="secondary" variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={submitting}
            sx={{ minWidth: 100 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Save Profile'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
