"use client";

import { Card, CardContent, Box, Typography, Stack } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function RevenueBreakdownWidget() {
  const metrics = useQuery(api.dashboard.getMetrics);

  if (!metrics) {
    return (
      <Card sx={{ height: '100%', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  const services = Object.entries(metrics.revenueByService || {});
  const totalServiceRevenue = services.reduce((sum, [, rev]) => sum + rev, 0);

  const serviceColors: Record<string, string> = {
    'Forestry Mulching': '#667eea',
    'Land Clearing': '#34C759',
    'Stump Grinding': '#FF9500',
    'Tree Removal': '#FF3B30',
    'Tree Trimming': '#007AFF',
    'Unknown': '#8E8E93'
  };

  return (
    <Card sx={{ height: '100%', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: '#667eea' }} />

      <CardContent sx={{ pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Revenue by Service
        </Typography>

        <Stack spacing={2.5}>
          {services
            .sort(([, a], [, b]) => b - a)
            .map(([service, revenue]) => {
              const percentage = totalServiceRevenue > 0 ? (revenue / totalServiceRevenue) * 100 : 0;
              const color = serviceColors[service] || '#8E8E93';

              return (
                <Box key={service}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: color
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {service}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#2C2C2E',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${percentage}%`,
                          bgcolor: color,
                          borderRadius: 4,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 100, textAlign: 'right' }}>
                      ${(revenue / 1000).toFixed(1)}k
                    </Typography>
                  </Box>
                </Box>
              );
            })}
        </Stack>

        {services.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No revenue data yet. Complete jobs to see breakdown.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
