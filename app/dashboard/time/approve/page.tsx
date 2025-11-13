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
  Button,
  Checkbox,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexAuthGuard } from '@/app/components/ConvexAuthGuard';
import { useUserRole } from '@/app/hooks/useUserRole';
import { TimeEntryCard } from '@/app/components/time/TimeEntryCard';
import { CheckCircle as ApproveIcon } from '@mui/icons-material';

export default function TimeApprovePage() {
  return (
    <ConvexAuthGuard>
      <TimeApprovePageContent />
    </ConvexAuthGuard>
  );
}

function TimeApprovePageContent() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Date range state (default to last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  // Get all time entries
  const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
  const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

  const allTimeEntries = useQuery(
    api.timeEntries.list,
    {
      startDate: startTimestamp,
      endDate: endTimestamp,
    }
  ) || [];

  // Get all employees
  const allEmployees = useQuery(api.employees.list) || [];

  // Mutations
  const approveEntry = useMutation(api.timeEntries.approve);
  const updateEntry = useMutation(api.timeEntries.update);
  const deleteEntry = useMutation(api.timeEntries.remove);

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

  // Filter entries
  const filteredEntries = allTimeEntries.filter((entry: any) => {
    // Status filter
    if (statusFilter === 'pending' && entry.approvalStatus === 'Approved') return false;
    if (statusFilter === 'approved' && entry.approvalStatus !== 'Approved') return false;

    // Employee filter
    if (employeeFilter !== 'all' && entry.employeeId !== employeeFilter) return false;

    return true;
  });

  // Group by employee
  const entriesByEmployee = filteredEntries.reduce((groups: any, entry: any) => {
    const employeeName = entry.employeeName || 'Unknown Employee';
    if (!groups[employeeName]) {
      groups[employeeName] = [];
    }
    groups[employeeName].push(entry);
    return groups;
  }, {});

  // Handle checkbox toggle
  const handleToggleEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  // Handle select all for employee
  const handleSelectAllForEmployee = (entries: any[]) => {
    const newSelected = new Set(selectedEntries);
    const allSelected = entries.every(e => newSelected.has(e._id));

    if (allSelected) {
      // Deselect all
      entries.forEach(e => newSelected.delete(e._id));
    } else {
      // Select all
      entries.forEach(e => newSelected.add(e._id));
    }
    setSelectedEntries(newSelected);
  };

  // Handle approve selected
  const handleApproveSelected = async () => {
    if (selectedEntries.size === 0) {
      setErrorMessage('No entries selected');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const promises = Array.from(selectedEntries).map(entryId =>
        approveEntry({ timeEntryId: entryId as any })
      );
      await Promise.all(promises);
      setSuccessMessage(`Successfully approved ${selectedEntries.size} time entries`);
      setSelectedEntries(new Set());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve entries');
    }
  };

  // Handle approve all pending
  const handleApproveAll = async () => {
    const pendingEntries = filteredEntries.filter((e: any) => e.approvalStatus !== 'Approved');
    if (pendingEntries.length === 0) {
      setErrorMessage('No pending entries to approve');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const promises = pendingEntries.map((entry: any) =>
        approveEntry({ timeEntryId: entry._id })
      );
      await Promise.all(promises);
      setSuccessMessage(`Successfully approved ${pendingEntries.length} time entries`);
      setSelectedEntries(new Set());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve all entries');
    }
  };

  // Handle delete
  const handleDelete = async (entry: any) => {
    if (!confirm(`Delete time entry for ${entry.workOrderName}?`)) return;

    try {
      await deleteEntry({ timeEntryId: entry._id });
      setSuccessMessage('Time entry deleted');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete entry');
    }
  };

  // Calculate totals
  const pendingCount = filteredEntries.filter((e: any) => e.approvalStatus !== 'Approved').length;
  const totalMinutes = filteredEntries.reduce((sum: number, entry: any) => {
    return sum + (entry.durationMinutes || 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApproveIcon sx={{ fontSize: 32 }} />
          Approve Time Entries
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve employee time entries
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Filters
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending Only</MenuItem>
              <MenuItem value="approved">Approved Only</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={employeeFilter}
              label="Employee"
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <MenuItem value="all">All Employees</MenuItem>
              {allEmployees.map((emp: any) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApproveSelected}
            disabled={selectedEntries.size === 0}
          >
            Approve Selected ({selectedEntries.size})
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleApproveAll}
            disabled={pendingCount === 0}
          >
            Approve All Pending ({pendingCount})
          </Button>
        </Stack>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Pending Approval
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
              {pendingCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Total Hours
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {totalHours}h {totalMins}m
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Total Entries
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {filteredEntries.length}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Time Entries Grouped by Employee */}
      {Object.keys(entriesByEmployee).length > 0 ? (
        <Box>
          {Object.entries(entriesByEmployee).map(([employeeName, entries]: [string, any]) => {
            const allSelected = entries.every((e: any) => selectedEntries.has(e._id));
            const someSelected = entries.some((e: any) => selectedEntries.has(e._id));

            return (
              <Box key={employeeName} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={() => handleSelectAllForEmployee(entries)}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {employeeName}
                  </Typography>
                  <Chip
                    label={`${entries.length} entries`}
                    size="small"
                    sx={{ bgcolor: '#007AFF20', color: '#007AFF' }}
                  />
                </Box>

                <Stack spacing={2}>
                  {entries.map((entry: any) => (
                    <Box key={entry._id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Checkbox
                        checked={selectedEntries.has(entry._id)}
                        onChange={() => handleToggleEntry(entry._id)}
                        sx={{ mt: 1 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <TimeEntryCard
                          entry={entry}
                          showWorkOrder
                          onDelete={handleDelete}
                          compact
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ mt: 3, borderColor: '#2C2C2E' }} />
              </Box>
            );
          })}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <ApproveIcon sx={{ fontSize: 48, color: '#8E8E93', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            No time entries found for the selected filters.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
