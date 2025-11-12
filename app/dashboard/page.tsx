"use client";

import { Container, Grid, Typography, Box } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MetricCard } from '@/app/components/dashboard/MetricCard';
import { MarginTrendWidget } from '@/app/components/dashboard/MarginTrendWidget';
import { RevenueBreakdownWidget } from '@/app/components/dashboard/RevenueBreakdownWidget';
import { PipelineWidget } from '@/app/components/dashboard/PipelineWidget';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarIcon from '@mui/icons-material/CalendarMonth';

export default function DashboardPage() {
  const metrics = useQuery(api.dashboard.getMetrics);

  if (!metrics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Business Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time metrics and performance tracking
        </Typography>
      </Box>

      {/* Top Row: Key Financial Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            subtitle="All-time revenue"
            icon={<MoneyIcon />}
            format="currency"
            color="#34C759"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Gross Profit"
            value={metrics.grossProfit}
            subtitle={`${metrics.profitMargin.toFixed(1)}% margin`}
            icon={<TrendingUpIcon />}
            format="currency"
            color="#007AFF"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Monthly Revenue"
            value={metrics.monthlyRevenue}
            subtitle="Last 30 days"
            icon={<CalendarIcon />}
            format="currency"
            color="#667eea"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Avg Job Value"
            value={metrics.avgJobValue}
            subtitle={`${metrics.totalInvoices} jobs completed`}
            icon={<ReceiptIcon />}
            format="currency"
            color="#FF9500"
          />
        </Grid>
      </Grid>

      {/* Second Row: Job & Completion Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Active Jobs"
            value={metrics.activeJobs}
            subtitle="Work orders in progress"
            icon={<WorkIcon />}
            color="#FF9500"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Completion Rate"
            value={metrics.completionRate}
            subtitle={`${metrics.completedJobs} jobs completed`}
            icon={<CheckCircleIcon />}
            format="percentage"
            color="#34C759"
            progress={metrics.completionRate}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Customer Satisfaction"
            value={metrics.customerSatisfaction}
            subtitle={`${metrics.repeatCustomerRate}% repeat rate`}
            icon={<StarIcon />}
            format="rating"
            color="#FF9500"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Avg Response Time"
            value={metrics.avgResponseTime}
            subtitle="Lead to proposal"
            icon={<TimerIcon />}
            color="#007AFF"
          />
        </Grid>
      </Grid>

      {/* Third Row: Margin Trend & Pipeline */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <MarginTrendWidget />
        </Grid>

        <Grid item xs={12} lg={4}>
          <PipelineWidget />
        </Grid>
      </Grid>

      {/* Fourth Row: Revenue Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <RevenueBreakdownWidget />
        </Grid>
      </Grid>
    </Container>
  );
}
