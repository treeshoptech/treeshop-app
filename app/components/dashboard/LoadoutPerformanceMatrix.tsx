"use client";

import { Card, CardContent, Typography, Box, Chip, LinearProgress, Tooltip } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export function LoadoutPerformanceMatrix() {
  const loadouts = useQuery(api.analytics.getLoadoutPerformance);

  if (!loadouts) {
    return (
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Loading loadout data...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (loadouts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Loadout Performance Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No loadouts configured yet. Create loadouts in Settings to see performance metrics.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Loadout Performance Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipment utilization, revenue, and efficiency metrics (30 days)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loadouts.map((loadout) => (
            <Card
              key={loadout.id}
              variant="outlined"
              sx={{
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {loadout.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {loadout.serviceTypes.map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          size="small"
                          sx={{ fontSize: '11px' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Chip
                    label={loadout.recommendation.label}
                    color={
                      loadout.recommendation.type === 'success' ? 'success' :
                      loadout.recommendation.type === 'warning' ? 'warning' :
                      'info'
                    }
                    size="small"
                  />
                </Box>

                {/* Utilization Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Utilization
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {loadout.utilization}%
                      </Typography>
                      {loadout.utilizationTrend !== 0 && (
                        <>
                          {loadout.utilizationTrend > 0 ? (
                            <TrendingUpIcon fontSize="small" sx={{ color: '#4caf50' }} />
                          ) : (
                            <TrendingDownIcon fontSize="small" sx={{ color: '#f44336' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{ color: loadout.utilizationTrend > 0 ? '#4caf50' : '#f44336' }}
                          >
                            {Math.abs(loadout.utilizationTrend)}%
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={loadout.utilization}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor:
                          loadout.utilization >= 85 ? '#4caf50' :
                          loadout.utilization >= 70 ? '#ff9800' :
                          '#f44336',
                      },
                    }}
                  />
                </Box>

                {/* Key Metrics Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      Revenue Generated
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ${(loadout.revenueGenerated / 1000).toFixed(1)}K
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      Avg Margin
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {(loadout.avgMargin ?? 0).toFixed(1)}%
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      PPH Performance
                      <Tooltip title="Actual Production Per Hour vs Estimated">
                        <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                      </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {(loadout.actualPPH ?? 0).toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${loadout.pphPerformance > 0 ? '+' : ''}${(loadout.pphPerformance ?? 0).toFixed(1)}%`}
                        size="small"
                        sx={{
                          fontSize: '10px',
                          height: 20,
                          bgcolor: loadout.pphPerformance > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          color: loadout.pphPerformance > 0 ? '#4caf50' : '#f44336',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Est: {(loadout.estimatedPPH ?? 0).toFixed(2)} PPH
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Jobs Completed
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {loadout.jobsCompleted}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      ROI
                      <Tooltip title="Return on Investment: Revenue / Total Costs">
                        <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                      </Tooltip>
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {loadout.roi > 0 ? `${(loadout.roi ?? 0).toFixed(2)}x` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Summary Stats */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Fleet Revenue
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                ${(loadouts.reduce((sum, l) => sum + l.revenueGenerated, 0) / 1000).toFixed(1)}K
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Avg Fleet Utilization
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {Math.round(loadouts.reduce((sum, l) => sum + l.utilization, 0) / loadouts.length)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Jobs Completed
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {loadouts.reduce((sum, l) => sum + l.jobsCompleted, 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fleet Avg Margin
              </Typography>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {loadouts.length > 0 ? (loadouts.reduce((sum, l) => sum + l.avgMargin, 0) / loadouts.length).toFixed(1) : '0.0'}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
