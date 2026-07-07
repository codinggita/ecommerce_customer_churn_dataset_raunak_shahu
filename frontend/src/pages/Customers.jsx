import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TableSortLabel, TablePagination, 
  Paper, Chip, Skeleton, Alert, Stack, TextField, Button, InputAdornment,
  Checkbox, Toolbar, Tooltip, IconButton, Grid, FormControl, InputLabel,
  Select, MenuItem, Drawer, Divider
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';
import CustomerModal from '../components/CustomerModal';

export default function Customers() {
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting states
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Search & Filter states
  const [searchVal, setSearchVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    gender: 'All',
    signupQuarter: 'All',
    churned: 'All',
  });
  
  // Staging filters before applying
  const [tempFilters, setTempFilters] = useState({ ...filters });

  // Custom Segment states
  const [currentSegment, setCurrentSegment] = useState('all');

  // Selection state for bulk deletion
  const [selected, setSelected] = useState([]);

  // CRUD Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sortParam = order === 'desc' ? `-${orderBy}` : orderBy;
      let endpoint = '/customers';
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sort: sortParam,
      };

      if (currentSegment !== 'all') {
        endpoint = `/customers/${currentSegment}`;
      } else if (searchQuery) {
        endpoint = '/search/customers';
        params.q = searchQuery;
      } else {
        if (filters.country) params.country = filters.country;
        if (filters.city) params.city = filters.city;
        if (filters.gender !== 'All') params.gender = filters.gender;
        if (filters.signupQuarter !== 'All') params.signupQuarter = filters.signupQuarter;
        if (filters.churned !== 'All') params.churned = filters.churned === 'Churned' ? 1 : 0;
      }

      const response = await api.get(endpoint, { params });

      const { customers: list, pagination } = response.data.data;
      setCustomers(list || []);
      setTotalCount(pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError(err.message || "Failed to load customer records.");
      dispatch(showToast({ message: err.message || "Failed to load customers.", severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order, searchQuery, filters, currentSegment, dispatch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Page handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = customers.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClickSelectRow = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchVal);
    setFilters({ country: '', city: '', gender: 'All', signupQuarter: 'All', churned: 'All' });
    setTempFilters({ country: '', city: '', gender: 'All', signupQuarter: 'All', churned: 'All' });
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchVal('');
    setSearchQuery('');
    setPage(0);
  };

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setSearchVal('');
    setSearchQuery('');
    setPage(0);
    setFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    const resetValues = { country: '', city: '', gender: 'All', signupQuarter: 'All', churned: 'All' };
    setTempFilters(resetValues);
    setFilters(resetValues);
    setPage(0);
    setFilterDrawerOpen(false);
  };

  // Individual Actions
  const handleAddClick = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleEditClick = (e, customer) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this customer? This is a soft delete action.")) {
      try {
        setError(null);
        const response = await api.delete(`/customers/${id}`);
        dispatch(showToast({ 
          message: response.data.message || "Customer deleted successfully.", 
          severity: 'success' 
        }));
        setSelected(prev => prev.filter(selectedId => selectedId !== id));
        fetchCustomers();
      } catch (err) {
        console.error("Delete failed:", err);
        dispatch(showToast({ 
          message: err.message || "Failed to delete customer.", 
          severity: 'error' 
        }));
      }
    }
  };

  const handleModalSuccess = (message) => {
    dispatch(showToast({ message, severity: 'success' }));
    fetchCustomers();
  };

  // Bulk deletion handler
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selected.length} selected customer(s)?`)) {
      try {
        setError(null);
        const response = await api.delete('/customers/bulk-delete', {
          data: { ids: selected }
        });
        dispatch(showToast({ 
          message: response.data.message || `Deleted ${selected.length} customers successfully.`, 
          severity: 'success' 
        }));
        setSelected([]);
        setPage(0);
        fetchCustomers();
      } catch (err) {
        console.error("Bulk delete failed:", err);
        dispatch(showToast({ 
          message: err.message || "Bulk deletion failed.", 
          severity: 'error' 
        }));
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const tableHeaders = [
    { id: 'name', label: 'Customer Name', sortable: true },
    { id: 'email', label: 'Email Address', sortable: false },
    { id: 'age', label: 'Age / Gender', sortable: true },
    { id: 'location', label: 'Location', sortable: false },
    { id: 'purchases', label: 'Purchases', sortable: true },
    { id: 'lifetimeValue', label: 'LTV', sortable: true },
    { id: 'churned', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <DashboardLayout>
      <Box className="w-full">
        {/* Page Title & Icon */}
        <Box className="flex justify-between items-center mb-6">
          <Box className="flex items-center gap-3">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', display: 'flex', color: 'primary.contrastText' }}>
              <PeopleIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" className="font-extrabold tracking-tight">
                Customer Accounts Database
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search, filter, add, edit, and delete customer analytics profiles
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Customer
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              disabled={currentSegment !== 'all'}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              Filters
            </Button>
          </Stack>
        </Box>

        {/* Predefined Quick Segment Chips */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 3 } }}>
          {[
            { id: 'all', label: 'All Customers', color: 'default' },
            { id: 'churned', label: 'Churned Only', color: 'error' },
            { id: 'active', label: 'Active Only', color: 'success' },
            { id: 'high-value', label: 'High LTV', color: 'primary' },
            { id: 'high-purchases', label: 'High Purchases', color: 'secondary' },
            { id: 'high-credit', label: 'High Credit', color: 'warning' },
            { id: 'high-engagement', label: 'Highly Engaged', color: 'info' },
            { id: 'high-mobile-usage', label: 'High Mobile Usage', color: 'primary' },
            { id: 'inactive', label: 'Inactive Buyers', color: 'error' },
            { id: 'loyal', label: 'Loyal Customers', color: 'warning' }
          ].map((seg) => {
            const isSelected = currentSegment === seg.id;
            return (
              <Chip
                key={seg.id}
                label={seg.label}
                color={isSelected ? (seg.color === 'default' ? 'primary' : seg.color) : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                onClick={() => {
                  setCurrentSegment(seg.id);
                  setSearchVal('');
                  setSearchQuery('');
                  setFilters({ country: '', city: '', gender: 'All', signupQuarter: 'All', churned: 'All' });
                  setTempFilters({ country: '', city: '', gender: 'All', signupQuarter: 'All', churned: 'All' });
                  setPage(0);
                }}
                sx={{ 
                  fontWeight: isSelected ? 700 : 500, 
                  px: 0.5,
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.1s ease'
                }}
              />
            );
          })}
        </Box>

        {currentSegment !== 'all' && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<InsightsIcon sx={{ fontSize: 20 }} />}>
            Displaying custom database segment: <strong>{currentSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong>. Standard search and manual filters are disabled for segments.
          </Alert>
        )}

        {error && <Alert severity="error" className="mb-6">{error}</Alert>}

        {/* Toolbar & Search Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSearchSubmit}>
                <Tooltip title={currentSegment !== 'all' ? "Search is disabled when a segment is selected" : ""}>
                  <TextField
                    fullWidth
                    size="small"
                    disabled={currentSegment !== 'all'}
                    placeholder="Search by name, email, country, city, gender..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: searchVal && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={handleClearSearch}>
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Tooltip>
              </form>
            </Grid>

            <Grid item xs={12} md={6} className="text-right">
              {selected.length > 0 && (
                <Toolbar sx={{ justifyContent: 'flex-end', p: '0 !important' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }} className="font-semibold text-rose-500">
                    {selected.length} selected
                  </Typography>
                  <Tooltip title="Delete Selected">
                    <Button 
                      variant="contained" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={handleBulkDelete}
                    >
                      Delete Selected
                    </Button>
                  </Tooltip>
                </Toolbar>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Customer Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 650, borderRadius: 0 }}>
              <Table stickyHeader sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ bgcolor: 'background.paper' }}>
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < customers.length}
                        checked={customers.length > 0 && selected.length === customers.length}
                        onChange={handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all customers' }}
                      />
                    </TableCell>
                    {tableHeaders.map((header) => (
                      <TableCell 
                        key={header.id}
                        sortDirection={orderBy === header.id ? order : false}
                        sx={{ bgcolor: 'background.paper', fontWeight: 700 }}
                      >
                        {header.sortable ? (
                          <TableSortLabel
                            active={orderBy === header.id}
                            direction={orderBy === header.id ? order : 'asc'}
                            onClick={() => handleRequestSort(header.id)}
                          >
                            {header.label}
                          </TableSortLabel>
                        ) : (
                          header.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    Array.from(new Array(rowsPerPage)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell padding="checkbox">
                          <Skeleton variant="rectangular" width={20} height={20} />
                        </TableCell>
                        {tableHeaders.map((_, idx) => (
                          <TableCell key={idx}>
                            <Skeleton variant="text" width={idx === 1 ? 200 : 80} height={24} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length + 1} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No customer records found matching queries.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => {
                      const isItemSelected = isSelected(customer._id);
                      return (
                        <TableRow 
                          key={customer._id}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          onClick={(event) => handleClickSelectRow(event, customer._id)}
                          sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClickSelectRow(event, customer._id)}
                              inputProps={{ 'aria-labelledby': customer._id }}
                            />
                          </TableCell>
                          <TableCell className="font-semibold">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center" onClick={(e) => e.stopPropagation()}>
                              <Typography variant="body2">{customer.age} yrs</Typography>
                              <Chip 
                                label={customer.gender} 
                                size="small" 
                                variant="outlined" 
                                sx={{ fontSize: '0.7rem', height: 18 }} 
                              />
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{customer.city}</Typography>
                            <Typography variant="caption" color="text.secondary">{customer.country}</Typography>
                          </TableCell>
                          <TableCell className="font-mono">{customer.purchases}</TableCell>
                          <TableCell className="font-mono font-bold text-indigo-500">
                            {formatCurrency(customer.lifetimeValue)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={customer.churned === 1 ? 'Churned' : 'Active'} 
                              color={customer.churned === 1 ? 'error' : 'success'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell onClick={(event) => event.stopPropagation()}>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={(e) => handleEditClick(e, customer)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={(e) => handleDeleteClick(e, customer._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
          </CardContent>
        </Card>

        {/* Filters Sidebar (Drawer) */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: 320, p: 3 } } }}
        >
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="font-extrabold flex items-center gap-2">
              <FilterListIcon color="primary" />
              <span>Database Filters</span>
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <ClearIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            {/* Country Filter */}
            <TextField
              label="Country"
              size="small"
              placeholder="e.g. United States"
              value={tempFilters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            />

            {/* City Filter */}
            <TextField
              label="City"
              size="small"
              placeholder="e.g. Los Angeles"
              value={tempFilters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />

            {/* Gender Filter */}
            <FormControl fullWidth size="small">
              <InputLabel id="gender-filter-label">Gender</InputLabel>
              <Select
                labelId="gender-filter-label"
                id="gender-filter"
                value={tempFilters.gender}
                label="Gender"
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <MenuItem value="All">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>

            {/* Signup Quarter Filter */}
            <FormControl fullWidth size="small">
              <InputLabel id="quarter-filter-label">Signup Quarter</InputLabel>
              <Select
                labelId="quarter-filter-label"
                id="quarter-filter"
                value={tempFilters.signupQuarter}
                label="Signup Quarter"
                onChange={(e) => handleFilterChange('signupQuarter', e.target.value)}
              >
                <MenuItem value="All">All Quarters</MenuItem>
                <MenuItem value="Q1">Q1</MenuItem>
                <MenuItem value="Q2">Q2</MenuItem>
                <MenuItem value="Q3">Q3</MenuItem>
                <MenuItem value="Q4">Q4</MenuItem>
              </Select>
            </FormControl>

            {/* Churn Filter */}
            <FormControl fullWidth size="small">
              <InputLabel id="churn-filter-label">Churn Status</InputLabel>
              <Select
                labelId="churn-filter-label"
                id="churn-filter"
                value={tempFilters.churned}
                label="Churn Status"
                onChange={(e) => handleFilterChange('churned', e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Active">Active Only</MenuItem>
                <MenuItem value="Churned">Churned Only</MenuItem>
              </Select>
            </FormControl>

            <Box className="pt-4 flex gap-2">
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<RestartAltIcon />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Box>
          </Stack>
        </Drawer>

        {/* Customer CRUD Modal Form */}
        <CustomerModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          customer={selectedCustomer}
          onSuccess={handleModalSuccess}
        />
      </Box>
    </DashboardLayout>
  );
}
