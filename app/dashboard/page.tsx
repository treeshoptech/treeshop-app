"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Divider } from '@mui/material';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexAuthGuard } from '@/app/components/ConvexAuthGuard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function DashboardPage() {
  return (
    <ConvexAuthGuard>
      <DashboardPageContent />
    </ConvexAuthGuard>
  );
}

function DashboardPageContent() {
  const [orgInitialized, setOrgInitialized] = useState(false);
  const metrics = useQuery(api.dashboard.getMetrics, orgInitialized ? {} : "skip");
  const ensureDevOrg = useMutation(api.organizations.ensureDevOrg);

  // Initialize development organization on mount
  useEffect(() => {
    ensureDevOrg()
      .then(() => {
        setOrgInitialized(true);
      })
      .catch(err => {
        console.error("Failed to initialize dev organization:", err);
        setOrgInitialized(true);
      });
  }, [ensureDevOrg]);

  if (!orgInitialized || !metrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Loading...</Typography>
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          TreeShop
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ px: 2 }}>
        {/* THIS MONTH - MONEY SECTION */}
        <Paper sx={{ p: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            THIS MONTH
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 2 }}>
            {/* Cash Collected */}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#34C759', fontSize: '2.5rem', lineHeight: 1 }}>
                {formatCurrency(metrics.cashCollected)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Cash Collected
              </Typography>
            </Box>

            {/* Pipeline Value */}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#FF9500', fontSize: '2.5rem', lineHeight: 1 }}>
                {formatCurrency(metrics.pipelineValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Pipeline
              </Typography>
            </Box>

            {/* Close Rate */}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#007AFF', fontSize: '2.5rem', lineHeight: 1 }}>
                {(metrics.closeRate || 0).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Close Rate
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ACTIVITY - THIS WEEK */}
        <Paper sx={{ p: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            ACTIVITY (This Week)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 2 }}>
            {/* Leads In */}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>
                {metrics.leadsThisWeek}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Leads In
              </Typography>
            </Box>

            {/* Proposals Sent */}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>
                {metrics.proposalsSentThisWeek}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Proposals Sent
              </Typography>
            </Box>

            {/* Avg Days to Close */}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>
                {metrics.avgDaysToClose || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Avg Days to Close
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* CONVERSION FUNNEL */}
        <Paper sx={{ p: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            CONVERSION FUNNEL
          </Typography>

          {/* Visual Funnel */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {metrics.totalLeads}
                </Typography>
                <Typography variant="caption" color="text.secondary">Leads</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: (metrics.leadToProposalRate || 0) >= 25 ? '#34C759' : '#FF3B30' }}>
                  {(metrics.leadToProposalRate || 0).toFixed(0)}%
                </Typography>
                {(metrics.leadToProposalRate || 0) >= 25 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#34C759' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#FF3B30' }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.5rem' }}>→</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, pl: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {metrics.totalProposals}
                </Typography>
                <Typography variant="caption" color="text.secondary">Proposals</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: (metrics.proposalToWonRate || 0) >= 50 ? '#34C759' : '#FF3B30' }}>
                  {(metrics.proposalToWonRate || 0).toFixed(0)}%
                </Typography>
                {(metrics.proposalToWonRate || 0) >= 50 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#34C759' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#FF3B30' }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.5rem' }}>→</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 8 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#34C759' }}>
                  {metrics.totalWon}
                </Typography>
                <Typography variant="caption" color="text.secondary">Won</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#2C2C2E' }} />

            {/* Average Proposal Value */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Average Proposal Value
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {formatCurrency(metrics.avgProposalValue)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* CAPACITY */}
        <Paper sx={{ p: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            CAPACITY
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Scheduled Revenue
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF9500' }}>
                {formatCurrency(metrics.scheduledRevenue)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Available Capacity
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: (metrics.availableCapacityPercent || 0) > 50 ? '#34C759' : '#FF3B30' }}>
                {(metrics.availableCapacityPercent || 0).toFixed(0)}%
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Next Open Date
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {metrics.nextOpenDate ? new Date(metrics.nextOpenDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
