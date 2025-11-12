"use client";

import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export function GrowthOpportunities() {
  const opportunities = useQuery(api.analytics.getGrowthOpportunities);

  if (!opportunities) {
    return (
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Loading opportunities...</Typography>
        </CardContent>
      </Card>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return { bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' };
      case 'Medium':
        return { bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' };
      case 'Low':
        return { bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' };
      default:
        return { bgcolor: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e' };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Service Expansion':
        return { bgcolor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' };
      case 'Pricing Strategy':
        return { bgcolor: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' };
      case 'Territory Expansion':
        return { bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' };
      case 'Operations':
        return { bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' };
      default:
        return { bgcolor: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e' };
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <LightbulbOutlinedIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              AI-Powered Growth Opportunities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Data-driven recommendations to scale your business
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {opportunities.map((opp, index) => (
            <Card
              key={index}
              variant="outlined"
              sx={{
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {opp.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip
                      label={opp.impact}
                      size="small"
                      sx={{
                        ...getImpactColor(opp.impact),
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    />
                    <Chip
                      label={opp.category}
                      size="small"
                      sx={{
                        ...getCategoryColor(opp.category),
                        fontSize: '11px',
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {opp.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Projected Revenue Impact
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        +${(opp.projectedRevenue / 1000).toFixed(1)}K
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /month
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Confidence Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={opp.confidence}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#667eea',
                          },
                        }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {opp.confidence}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Total Opportunity Value */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 1, border: '1px solid', borderColor: 'rgba(102, 126, 234, 0.2)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Opportunity Value
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '11px' }}>
                Combined monthly revenue potential
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#667eea' }}>
              +${(opportunities.reduce((sum, opp) => sum + opp.projectedRevenue, 0) / 1000).toFixed(1)}K
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
