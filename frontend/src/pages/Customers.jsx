import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TableSortLabel, TablePagination, 
  Paper, Chip, Skeleton, Alert, Stack 
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import api from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';

export default function Customers() {
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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mongoose sort param matches: field (asc) or -field (desc)
      const sortParam = order === 'desc' ? `-${orderBy}` : orderBy;
      
      const response = await api.get('/customers', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          sort: sortParam
        }
      });

      const { customers: list, pagination } = response.data.data;
      setCustomers(list || []);
      setTotalCount(pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError(err.message || "Failed to load customer records.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
    { id: 'churned', label: 'Status', sortable: true }
  ];

  return (
    <DashboardLayout>
      <Box className="w-full">
        {/* Page Title & Icon */}
        <Box className="flex items-center gap-3 mb-6">
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', display: 'flex', color: 'primary.contrastText' }}>
            <PeopleIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" className="font-extrabold tracking-tight">
              Customer Accounts Database
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review, sort, and paginate through Mongoose customer records
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="mb-6" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 650, borderRadius: 0 }}>
              <Table stickyHeader sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
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
                    // Skeleton loader rows
                    Array.from(new Array(rowsPerPage)).map((_, index) => (
                      <TableRow key={index}>
                        {tableHeaders.map((_, idx) => (
                          <TableCell key={idx}>
                            <Skeleton variant="text" width={idx === 1 ? 200 : 80} height={24} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No customer records found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow 
                        key={customer._id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell className="font-semibold">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
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
                      </TableRow>
                    ))
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
      </Box>
    </DashboardLayout>
  );
}
