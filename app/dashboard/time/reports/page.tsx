"use client";

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
} from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexAuthGuard } from '@/app/components/ConvexAuthGuard';
import { useUserRole } from '@/app/hooks/useUserRole';
import { Assessment as ReportsIcon, Download as DownloadIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TimeReportsPage() {
  return (
    <ConvexAuthGuard>
      <TimeReportsPageContent />
    </ConvexAuthGuard>
  );
}

function TimeReportsPageContent() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [tabValue, setTabValue] = useState(0);

  // Date range state (default to last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // Get data
  const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
  const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

  const timeEntries = useQuery(
    api.timeEntries.list,
    { startDate: startTimestamp, endDate: endTimestamp }
  ) || [];

  const employees = useQuery(api.employees.list) || [];
  const workOrders = useQuery(api.workOrders.list) || [];

  // Loading/permission check
  if (roleLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Container>
    );
  }

  // Report 1: By Employee
  const employeeReport = employees.map(emp => {
    const empEntries = timeEntries.filter((e: any) => e.employeeId === emp._id);
    const totalMinutes = empEntries.reduce((sum: number, e: any) => sum + (e.durationMinutes || 0), 0);
    const billableMinutes = empEntries.filter((e: any) => e.isBillable).reduce((sum: number, e: any) => sum + (e.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(2);
    const billableHours = (billableMinutes / 60).toFixed(2);
    const entryCount = empEntries.length;

    return {
      name: `${emp.firstName} ${emp.lastName}`,
      totalHours,
      billableHours,
      entryCount,
      totalMinutes,
      billableMinutes,
    };
  }).filter(r => parseFloat(r.totalHours) > 0);

  // Report 2: By Work Order
  const workOrderMap = new Map(workOrders.map((wo: any) => [wo._id, wo]));
  const workOrderReport = Array.from(
    timeEntries.reduce((map: Map<string, any>, entry: any) => {
      const woId = entry.workOrderId;
      if (!map.has(woId)) {
        const wo = workOrderMap.get(woId);
        map.set(woId, {
          workOrderName: entry.workOrderName || 'Unknown',
          customerName: wo?.customerName || 'Unknown Customer',
          totalMinutes: 0,
          billableMinutes: 0,
          entryCount: 0,
        });
      }
      const record = map.get(woId);
      record.totalMinutes += entry.durationMinutes || 0;
      if (entry.isBillable) record.billableMinutes += entry.durationMinutes || 0;
      record.entryCount += 1;
      return map;
    }, new Map()).values()
  ).map(r => ({
    ...r,
    totalHours: (r.totalMinutes / 60).toFixed(2),
    billableHours: (r.billableMinutes / 60).toFixed(2),
  }));

  // Report 3: Payroll Summary
  const payrollReport = employees.map(emp => {
    const empEntries = timeEntries.filter((e: any) => e.employeeId === emp._id);
    const totalMinutes = empEntries.reduce((sum: number, e: any) => sum + (e.durationMinutes || 0), 0);
    const totalHours = totalMinutes / 60;
    const hourlyRate = emp.baseHourlyRate || 0;
    const grossPay = totalHours * hourlyRate;

    return {
      name: `${emp.firstName} ${emp.lastName}`,
      totalHours: totalHours.toFixed(2),
      hourlyRate: hourlyRate.toFixed(2),
      grossPay: grossPay.toFixed(2),
    };
  }).filter(r => parseFloat(r.totalHours) > 0);

  const totalPayrollCost = payrollReport.reduce((sum, r) => sum + parseFloat(r.grossPay), 0);

  // Export to CSV function
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const key = h.toLowerCase().replace(/ /g, '');
        return row[key] || '';
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${startDate}_to_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportsIcon sx={{ fontSize: 32 }} />
          Time Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive time tracking reports and analytics
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Report Period
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: '#2C2C2E', px: 2 }}
        >
          <Tab label="By Employee" />
          <Tab label="By Work Order" />
          <Tab label="Payroll Summary" />
        </Tabs>

        {/* Tab 1: By Employee */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Hours by Employee
              </Typography>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => exportToCSV(employeeReport, 'employee_hours', ['Name', 'Total Hours', 'Billable Hours', 'Entry Count'])}
              >
                Export CSV
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Hours</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Billable Hours</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Entries</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeReport.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color: '#34C759' }}>
                        {row.totalHours}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color: '#007AFF' }}>
                        {row.billableHours}
                      </TableCell>
                      <TableCell align="right">{row.entryCount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#2C2C2E' }}>
                    <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#34C759' }}>
                      {employeeReport.reduce((sum, r) => sum + parseFloat(r.totalHours), 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#007AFF' }}>
                      {employeeReport.reduce((sum, r) => sum + parseFloat(r.billableHours), 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {employeeReport.reduce((sum, r) => sum + r.entryCount, 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab 2: By Work Order */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Hours by Work Order
              </Typography>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => exportToCSV(workOrderReport, 'workorder_hours', ['Customer Name', 'Work Order Name', 'Total Hours', 'Billable Hours'])}
              >
                Export CSV
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Work Order</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Hours</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Billable Hours</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Entries</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrderReport.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.workOrderName}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color: '#34C759' }}>
                        {row.totalHours}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color: '#007AFF' }}>
                        {row.billableHours}
                      </TableCell>
                      <TableCell align="right">{row.entryCount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#2C2C2E' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#34C759' }}>
                      {workOrderReport.reduce((sum, r) => sum + parseFloat(r.totalHours), 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#007AFF' }}>
                      {workOrderReport.reduce((sum, r) => sum + parseFloat(r.billableHours), 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {workOrderReport.reduce((sum, r) => sum + r.entryCount, 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab 3: Payroll Summary */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payroll Summary
              </Typography>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => exportToCSV(payrollReport, 'payroll_summary', ['Name', 'Total Hours', 'Hourly Rate', 'Gross Pay'])}
              >
                Export CSV
              </Button>
            </Box>

            {/* Total Payroll Box */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#2C2C2E', border: '1px solid #007AFF' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Total Payroll Cost
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#34C759' }}>
                ${totalPayrollCost.toFixed(2)}
              </Typography>
            </Paper>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Hours</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Hourly Rate</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Gross Pay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payrollReport.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {row.totalHours}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color: '#007AFF' }}>
                        ${row.hourlyRate}/hr
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#34C759' }}>
                        ${row.grossPay}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#2C2C2E' }}>
                    <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {payrollReport.reduce((sum, r) => sum + parseFloat(r.totalHours), 0).toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#34C759' }}>
                      ${totalPayrollCost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
