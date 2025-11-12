"use client";

import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export function RevenueForecastChart() {
  const forecastData = useQuery(api.analytics.getRevenueForecast);

  if (!forecastData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Loading forecast...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = forecastData.chartData.map(d => ({
    ...d,
    actual: d.actual ? d.actual / 1000 : null, // Convert to thousands
    forecast: d.forecast ? d.forecast / 1000 : null,
    forecastHigh: d.forecastHigh ? d.forecastHigh / 1000 : null,
    forecastLow: d.forecastLow ? d.forecastLow / 1000 : null,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {payload[0].payload.month}
          </Typography>
          {payload.map((entry: any) => (
            <Typography key={entry.dataKey} variant="caption" sx={{ color: entry.color, display: 'block' }}>
              {entry.name}: ${entry.value?.toFixed(0)}K
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Revenue Forecast
            </Typography>
            <Typography variant="body2" color="text.secondary">
              6-month projection with {forecastData.confidence}% confidence
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Next Month Forecast
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              ${(forecastData.nextMonth / 1000).toFixed(0)}K
            </Typography>
            <Chip
              icon={<TrendingUpIcon />}
              label="Growing"
              size="small"
              sx={{ mt: 0.5, bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}
            />
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="month"
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#999"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />

            {/* Confidence Interval (High) */}
            <Area
              type="monotone"
              dataKey="forecastHigh"
              stroke="transparent"
              fill="url(#colorConfidence)"
              fillOpacity={0.3}
              name="Upper Bound"
              connectNulls
            />

            {/* Confidence Interval (Low) */}
            <Area
              type="monotone"
              dataKey="forecastLow"
              stroke="transparent"
              fill="url(#colorConfidence)"
              fillOpacity={0.3}
              name="Lower Bound"
              connectNulls
            />

            {/* Actual Revenue */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#667eea"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActual)"
              name="Actual Revenue"
            />

            {/* Forecast Revenue */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#4caf50"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorForecast)"
              name="Forecast"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>

        <Box sx={{ display: 'flex', gap: 3, mt: 3, justifyContent: 'space-around' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              6-Month Projection
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              ${(forecastData.sixMonth / 1000).toFixed(0)}K
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Confidence Level
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              {forecastData.confidence}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Trend
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              {forecastData.trend}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
