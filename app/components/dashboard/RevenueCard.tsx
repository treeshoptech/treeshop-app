"use client";

import { Card, CardContent, Typography, LinearProgress, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function RevenueCard() {
  const monthlyData = useQuery(api.analytics.getMonthlyRevenue);

  if (!monthlyData) {
    return (
      <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Loading...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const current = monthlyData.current || 0;
  const lastMonth = monthlyData.lastMonth || 0;
  const growth = lastMonth > 0 ? ((current - lastMonth) / lastMonth) * 100 : 0;
  const isPositiveGrowth = growth >= 0;

  return (
    <Card sx={{
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            Revenue MTD
          </Typography>
          {lastMonth > 0 && (
            <Chip
              icon={isPositiveGrowth ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${isPositiveGrowth ? '+' : ''}${growth.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: isPositiveGrowth ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                color: isPositiveGrowth ? '#4caf50' : '#f44336',
                fontWeight: 600
              }}
            />
          )}
        </Box>

        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, my: 2 }}>
          ${(current / 1000).toFixed(1)}K
        </Typography>

        {lastMonth > 0 && (
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Last month: ${(lastMonth / 1000).toFixed(1)}K
          </Typography>
        )}

        {current === 0 && lastMonth === 0 && (
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
            No completed projects yet this month
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
