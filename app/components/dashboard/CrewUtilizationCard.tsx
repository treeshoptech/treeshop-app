"use client";

import { Card, CardContent, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function CrewUtilizationCard() {
  const data = useQuery(api.analytics.getCrewUtilization);

  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  const utilization = data.utilization || 0;
  const utilizationColor =
    utilization >= 85 ? '#4caf50' :
    utilization >= 70 ? '#ff9800' :
    '#f44336';

  const statusEmoji =
    utilization >= 85 ? '🔥' :
    utilization >= 70 ? '✅' :
    '⚠️';

  const statusText =
    utilization >= 85 ? 'High utilization' :
    utilization >= 70 ? 'Healthy utilization' :
    'Low utilization';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
          Crew Utilization
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={utilization}
              size={140}
              thickness={6}
              sx={{ color: utilizationColor }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h3" component="div" fontWeight={700} sx={{ color: utilizationColor }}>
                {utilization}%
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {statusEmoji} {statusText}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Available</Typography>
            <Typography variant="body2" fontWeight={600}>{data.availableHours} hrs</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Used</Typography>
            <Typography variant="body2" fontWeight={600}>{data.usedHours} hrs</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
