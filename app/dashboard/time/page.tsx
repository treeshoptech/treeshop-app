"use client";

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Autocomplete, TextField, Stack, Alert } from '@mui/material';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexAuthGuard } from '@/app/components/ConvexAuthGuard';
import { useUserRole } from '@/app/hooks/useUserRole';
import { TimeClockButton } from '@/app/components/time/TimeClockButton';
import { TimeEntryCard } from '@/app/components/time/TimeEntryCard';
import { AccessTime as ClockIcon } from '@mui/icons-material';

export default function TimeClockPage() {
  return (
    <ConvexAuthGuard>
      <TimeClockPageContent />
    </ConvexAuthGuard>
  );
}

function TimeClockPageContent() {
  const { employee, loading: roleLoading } = useUserRole();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if there's an active time entry
  const activeEntry = useQuery(
    api.timeEntries.getActiveForEmployee,
    employee ? { employeeId: employee._id } : "skip"
  );

  // Get employee's assigned work orders
  const myWorkOrders = useQuery(api.workOrders.getMyWorkOrders) || [];

  // Get today's time entries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayEntries = useQuery(
    api.timeEntries.listByEmployee,
    employee ? {
      employeeId: employee._id,
      startDate: todayStart.getTime(),
      endDate: todayEnd.getTime(),
    } : "skip"
  ) || [];

  // Mutations
  const startTime = useMutation(api.timeEntries.start);
  const stopTime = useMutation(api.timeEntries.stop);

  const [isClocking, setIsClocking] = useState(false);

  // Filter work orders to only show Scheduled or In Progress
  const availableWorkOrders = myWorkOrders.filter((wo: any) =>
    wo.status === 'Scheduled' || wo.status === 'In Progress'
  );

  // Handle clock in
  const handleClockIn = async () => {
    if (!selectedWorkOrder) {
      setError('Please select a work order first');
      return;
    }

    if (!employee) {
      setError('Employee record not found');
      return;
    }

    setError(null);
    setIsClocking(true);

    try {
      await startTime({
        workOrderId: selectedWorkOrder._id,
        employeeId: employee._id,
        activityType: 'Regular Work',
        isBillable: true,
      });
      setSelectedWorkOrder(null); // Clear selection after clocking in
    } catch (err: any) {
      setError(err.message || 'Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    if (!activeEntry) {
      setError('No active time entry found');
      return;
    }

    setError(null);
    setIsClocking(true);

    try {
      await stopTime({ timeEntryId: activeEntry._id });
    } catch (err: any) {
      setError(err.message || 'Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  };

  // Loading state
  if (roleLoading || !employee) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  // Calculate today's total hours
  const todayTotalMinutes = todayEntries.reduce((sum: number, entry: any) => {
    return sum + (entry.durationMinutes || 0);
  }, 0);
  const todayHours = Math.floor(todayTotalMinutes / 60);
  const todayMinutes = todayTotalMinutes % 60;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClockIcon sx={{ fontSize: 32 }} />
          Time Clock
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back, {employee.firstName}! Clock in to start tracking your time.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Clock Section */}
      <Paper sx={{ p: 4, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3, textAlign: 'center' }}>
        {/* Current Time Display */}
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Typography>

        {/* Clock In/Out Button */}
        <Box sx={{ mb: 4 }}>
          <TimeClockButton
            activeEntry={activeEntry}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            disabled={!activeEntry && !selectedWorkOrder}
            loading={isClocking}
          />
        </Box>

        {/* Work Order Selector (only show when not clocked in) */}
        {!activeEntry && (
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Autocomplete
              value={selectedWorkOrder}
              onChange={(_, newValue) => setSelectedWorkOrder(newValue)}
              options={availableWorkOrders}
              getOptionLabel={(option: any) => option.customerName || option.propertyAddress || 'Unknown Work Order'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Work Order"
                  placeholder="Choose the job you're working on"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#0A0A0A',
                    }
                  }}
                />
              )}
              renderOption={(props, option: any) => (
                <li {...props} key={option._id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.customerName || 'Unknown Customer'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.propertyAddress}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText="No work orders assigned to you"
            />
          </Box>
        )}

        {/* Active Work Order Display (when clocked in) */}
        {activeEntry && (
          <Paper sx={{ p: 2, bgcolor: '#0A0A0A', border: '1px solid #FF9500', maxWidth: 400, mx: 'auto' }}>
            <Typography variant="caption" sx={{ color: '#FF9500', display: 'block', mb: 0.5 }}>
              CURRENT JOB
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {activeEntry.workOrderName || 'Unknown Work Order'}
            </Typography>
          </Paper>
        )}
      </Paper>

      {/* Today's Summary */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Today's Summary
        </Typography>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Total Time
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
              {todayHours}h {todayMinutes}m
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Time Entries
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {todayEntries.length}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Today's Time Entries */}
      {todayEntries.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Today's Time Entries
          </Typography>
          <Stack spacing={2}>
            {todayEntries.map((entry: any) => (
              <TimeEntryCard key={entry._id} entry={entry} showWorkOrder compact />
            ))}
          </Stack>
        </Box>
      )}

      {/* Empty State */}
      {todayEntries.length === 0 && !activeEntry && (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <ClockIcon sx={{ fontSize: 48, color: '#8E8E93', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            No time entries yet today. Select a work order and clock in to start tracking.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
