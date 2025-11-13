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
  Divider,
} from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexAuthGuard } from '@/app/components/ConvexAuthGuard';
import { useUserRole } from '@/app/hooks/useUserRole';
import { TimeEntryCard } from '@/app/components/time/TimeEntryCard';
import { History as HistoryIcon } from '@mui/icons-material';

export default function TimeHistoryPage() {
  return (
    <ConvexAuthGuard>
      <TimeHistoryPageContent />
    </ConvexAuthGuard>
  );
}

function TimeHistoryPageContent() {
  const { employee, loading: roleLoading } = useUserRole();

  // Date range state (default to last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Get time entries for date range
  const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
  const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

  const timeEntries = useQuery(
    api.timeEntries.listByEmployee,
    employee ? {
      employeeId: employee._id,
      startDate: startTimestamp,
      endDate: endTimestamp,
    } : "skip"
  ) || [];

  // Loading state
  if (roleLoading || !employee) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  // Filter by approval status
  const filteredEntries = timeEntries.filter((entry: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return entry.approvalStatus !== 'Approved';
    if (statusFilter === 'approved') return entry.approvalStatus === 'Approved';
    return true;
  });

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a: any, b: any) => {
    if (sortOrder === 'newest') {
      return b.startTime - a.startTime;
    } else {
      return a.startTime - b.startTime;
    }
  });

  // Group by date
  const entriesByDate = sortedEntries.reduce((groups: any, entry: any) => {
    const date = new Date(entry.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  // Calculate totals
  const totalMinutes = filteredEntries.reduce((sum: number, entry: any) => {
    return sum + (entry.durationMinutes || 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  const billableMinutes = filteredEntries
    .filter((e: any) => e.isBillable)
    .reduce((sum: number, entry: any) => sum + (entry.durationMinutes || 0), 0);
  const billableHours = Math.floor(billableMinutes / 60);
  const billableMins = billableMinutes % 60;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 32 }} />
          Time History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and filter your past time entries
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Filters
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
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOrder}
              label="Sort By"
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Summary
        </Typography>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Total Hours
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
              {totalHours}h {totalMins}m
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Billable Hours
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
              {billableHours}h {billableMins}m
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

      {/* Time Entries Grouped by Date */}
      {Object.keys(entriesByDate).length > 0 ? (
        <Box>
          {Object.entries(entriesByDate).map(([date, entries]: [string, any]) => (
            <Box key={date} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {date}
              </Typography>
              <Stack spacing={2}>
                {entries.map((entry: any) => (
                  <TimeEntryCard key={entry._id} entry={entry} showWorkOrder compact />
                ))}
              </Stack>
              <Divider sx={{ mt: 3, borderColor: '#2C2C2E' }} />
            </Box>
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <HistoryIcon sx={{ fontSize: 48, color: '#8E8E93', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            No time entries found for the selected date range and filters.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
