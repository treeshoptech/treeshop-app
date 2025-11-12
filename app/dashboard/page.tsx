"use client";

import { Container, Grid, Typography, Box } from '@mui/material';
import { RevenueCard } from '@/app/components/dashboard/RevenueCard';
import { PipelineCard } from '@/app/components/dashboard/PipelineCard';
import { CrewUtilizationCard } from '@/app/components/dashboard/CrewUtilizationCard';
import { TerritoryMap } from '@/app/components/dashboard/TerritoryMap';
import { RevenueForecastChart } from '@/app/components/dashboard/RevenueForecastChart';
import { LoadoutPerformanceMatrix } from '@/app/components/dashboard/LoadoutPerformanceMatrix';
import { GrowthOpportunities } from '@/app/components/dashboard/GrowthOpportunities';

export default function DashboardPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Strategic Command Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Executive-level business intelligence and operations platform
        </Typography>
      </Box>

      {/* Hero KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <RevenueCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <PipelineCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrewUtilizationCard />
        </Grid>
      </Grid>

      {/* Territory Map */}
      <Box sx={{ mb: 4 }}>
        <TerritoryMap />
      </Box>

      {/* Revenue Forecast & Growth Opportunities */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <RevenueForecastChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <GrowthOpportunities />
        </Grid>
      </Grid>

      {/* Loadout Performance Matrix */}
      <Box sx={{ mb: 4 }}>
        <LoadoutPerformanceMatrix />
      </Box>
    </Container>
  );
}
