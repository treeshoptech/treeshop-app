"use client";

import { Card, CardContent, Box, Typography } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function MarginTrendWidget() {
  const trend = useQuery(api.dashboard.getRevenueTrend);

  if (!trend) {
    return (
      <Card sx={{ height: '100%', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = trend.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    margin: item.margin,
    profit: item.profit / 1000, // Convert to thousands
    revenue: item.revenue / 1000
  }));

  const avgMargin = trend.length > 0
    ? trend.reduce((sum, item) => sum + item.margin, 0) / trend.length
    : 0;

  const latestMargin = trend.length > 0 ? trend[trend.length - 1].margin : 0;
  const previousMargin = trend.length > 1 ? trend[trend.length - 2].margin : latestMargin;
  const marginChange = latestMargin - previousMargin;

  return (
    <Card sx={{ height: '100%', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: '#34C759' }} />

      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Profit Margin Trend
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93' }}>
              Last 12 months
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#34C759' }}>
              {(latestMargin ?? 0).toFixed(1)}%
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: marginChange >= 0 ? '#34C759' : '#FF3B30',
                fontWeight: 600
              }}
            >
              {marginChange >= 0 ? '+' : ''}{(marginChange ?? 0).toFixed(1)}% vs last month
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34C759" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
              <XAxis
                dataKey="month"
                stroke="#8E8E93"
                tick={{ fill: '#8E8E93', fontSize: 12 }}
              />
              <YAxis
                stroke="#8E8E93"
                tick={{ fill: '#8E8E93', fontSize: 12 }}
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  border: '1px solid #2C2C2E',
                  borderRadius: 8,
                  padding: 12
                }}
                labelStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                itemStyle={{ color: '#8E8E93' }}
                formatter={(value: any, name: string) => {
                  if (name === 'margin') return [`${(value ?? 0).toFixed(1)}%`, 'Margin'];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="margin"
                stroke="#34C759"
                strokeWidth={3}
                fill="url(#marginGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#2C2C2E', borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
            Average Margin (12mo)
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {(avgMargin ?? 0).toFixed(1)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
