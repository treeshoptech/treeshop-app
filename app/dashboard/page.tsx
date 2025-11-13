"use client";

import { Container, Grid, Typography, Box, Paper, Divider, Stack } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MetricCard } from '@/app/components/dashboard/MetricCard';
import { MarginTrendWidget } from '@/app/components/dashboard/MarginTrendWidget';
import { RevenueBreakdownWidget } from '@/app/components/dashboard/RevenueBreakdownWidget';
import { RevenueForecastChart } from '@/app/components/dashboard/RevenueForecastChart';
import { LoadoutPerformanceMatrix } from '@/app/components/dashboard/LoadoutPerformanceMatrix';
import { ToDoList } from '@/app/components/dashboard/ToDoList';
import { ConvexAuthGuard } from '@/app/components/ConvexAuthGuard';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import EquipmentIcon from '@mui/icons-material/Construction';

export default function DashboardPage() {
  return (
    <ConvexAuthGuard>
      <DashboardPageContent />
    </ConvexAuthGuard>
  );
}

function DashboardPageContent() {
  const metrics = useQuery(api.dashboard.getMetrics);

  if (!metrics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Business Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time insights, performance tracking, and business projections
        </Typography>
      </Box>

      {/* ============================================
          SECTION 1: SINGLE DATA POINTS (KPIs)
          ============================================ */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#007AFF', borderRadius: 1 }} />
          Key Performance Indicators
        </Typography>

        {/* Financial KPIs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Total Revenue"
              value={metrics.totalRevenue}
              subtitle="All-time"
              icon={<MoneyIcon />}
              format="currency"
              color="#34C759"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Gross Profit"
              value={metrics.grossProfit}
              subtitle={`${metrics.profitMargin.toFixed(1)}% margin`}
              icon={<TrendingUpIcon />}
              format="currency"
              color="#007AFF"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Monthly Revenue"
              value={metrics.monthlyRevenue}
              subtitle="Last 30 days"
              icon={<CalendarIcon />}
              format="currency"
              color="#667eea"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Avg Job Value"
              value={metrics.avgJobValue}
              subtitle={`${metrics.totalInvoices} completed`}
              icon={<ReceiptIcon />}
              format="currency"
              color="#FF9500"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Active Jobs"
              value={metrics.activeJobs}
              subtitle="In progress"
              icon={<WorkIcon />}
              color="#FF9500"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Completion Rate"
              value={metrics.completionRate}
              subtitle={`${metrics.completedJobs} done`}
              icon={<CheckCircleIcon />}
              format="percentage"
              color="#34C759"
              progress={metrics.completionRate}
            />
          </Grid>
        </Grid>

        {/* Operational KPIs */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Response Time"
              value={metrics.avgResponseTime}
              subtitle="Lead to proposal"
              icon={<TimerIcon />}
              color="#007AFF"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Customer Rating"
              value={metrics.customerSatisfaction}
              subtitle={`${metrics.repeatCustomerRate}% repeat`}
              icon={<StarIcon />}
              format="rating"
              color="#FF9500"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Active Crew"
              value={15}
              subtitle="Team members"
              icon={<PeopleIcon />}
              color="#34C759"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Equipment Fleet"
              value={12}
              subtitle="Active pieces"
              icon={<EquipmentIcon />}
              color="#FF9500"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Loadout Configs"
              value={8}
              subtitle="Ready to deploy"
              icon={<WorkIcon />}
              color="#007AFF"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <MetricCard
              title="Avg Margin"
              value={metrics.profitMargin}
              subtitle="Current target"
              icon={<TrendingUpIcon />}
              format="percentage"
              color="#34C759"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: '#2C2C2E' }} />

      {/* ============================================
          SECTION 2: PERFORMANCE CHARTS (HISTORICAL)
          ============================================ */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#34C759', borderRadius: 1 }} />
          Performance & Historical Data
        </Typography>

        <Grid container spacing={3}>
          {/* Margin Trend - Shows historical performance */}
          <Grid item xs={12} lg={8}>
            <MarginTrendWidget />
          </Grid>

          {/* Revenue Breakdown */}
          <Grid item xs={12} lg={4}>
            <RevenueBreakdownWidget />
          </Grid>

          {/* Loadout Performance Matrix */}
          <Grid item xs={12}>
            <LoadoutPerformanceMatrix />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: '#2C2C2E' }} />

      {/* ============================================
          SECTION 3: PROJECTIONS & FORECASTING
          ============================================ */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#FF9500', borderRadius: 1 }} />
          Business Projections & Forecasting
        </Typography>

        <Grid container spacing={3}>
          {/* Revenue Forecast Chart */}
          <Grid item xs={12} lg={8}>
            <RevenueForecastChart />
          </Grid>

          {/* Growth Opportunities Summary */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Growth Insights
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Projected Monthly Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                    $125.5K
                  </Typography>
                  <Typography variant="caption" color="#34C759">
                    +18.3% from current
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#2C2C2E' }} />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Est. Annual Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                    $1.42M
                  </Typography>
                  <Typography variant="caption" color="#007AFF">
                    Based on current trajectory
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#2C2C2E' }} />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Target Achievement
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                    87%
                  </Typography>
                  <Typography variant="caption" color="#8E8E93">
                    On track for annual goal
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#2C2C2E' }} />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Key Growth Drivers
                  </Typography>
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Higher margin jobs</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>+$24K</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Faster production</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>+$18K</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">New equipment ROI</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>+$12K</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Capacity Planning */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Capacity & Resource Planning
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Current Capacity Utilization</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>73%</Typography>
                  </Box>
                  <Box sx={{
                    height: 8,
                    bgcolor: '#0A0A0A',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      width: '73%',
                      height: '100%',
                      bgcolor: '#FF9500',
                      borderRadius: 1,
                    }} />
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Crew Availability</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>12/15 available</Typography>
                  </Box>
                  <Box sx={{
                    height: 8,
                    bgcolor: '#0A0A0A',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      width: '80%',
                      height: '100%',
                      bgcolor: '#34C759',
                      borderRadius: 1,
                    }} />
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Equipment Uptime</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>94%</Typography>
                  </Box>
                  <Box sx={{
                    height: 8,
                    bgcolor: '#0A0A0A',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      width: '94%',
                      height: '100%',
                      bgcolor: '#007AFF',
                      borderRadius: 1,
                    }} />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: '#2C2C2E', my: 1 }} />

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  RECOMMENDATIONS
                </Typography>

                <Box sx={{ p: 2, bgcolor: '#007AFF20', borderRadius: 1, border: '1px solid #007AFF' }}>
                  <Typography variant="body2" sx={{ color: '#007AFF', mb: 0.5 }}>
                    🎯 Hire 2 additional crew members
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current demand suggests you could handle 25% more jobs with expanded crew
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#34C75920', borderRadius: 1, border: '1px solid #34C759' }}>
                  <Typography variant="body2" sx={{ color: '#34C759', mb: 0.5 }}>
                    ✅ Equipment investment paying off
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    New SK200TR mulcher generating $12K/month ROI
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* To-Do List */}
          <Grid item xs={12} lg={6}>
            <ToDoList />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
