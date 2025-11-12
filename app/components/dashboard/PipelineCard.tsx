"use client";

import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function PipelineCard() {
  const pipeline = useQuery(api.analytics.getPipeline);

  if (!pipeline) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
          Pipeline Value
        </Typography>

        <Typography variant="h3" sx={{ fontWeight: 700, my: 2, color: '#667eea' }}>
          ${(pipeline.totalValue / 1000000).toFixed(1)}M
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{pipeline.proposalCount}</Typography>
            <Typography variant="caption" color="text.secondary">Proposals</Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="success.main">{pipeline.winRate}%</Typography>
            <Typography variant="caption" color="text.secondary">Win Rate</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Expected close
          </Typography>
          <Typography variant="h6" fontWeight={600} color="success.main">
            ${(pipeline.expectedValue / 1000).toFixed(0)}K
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
