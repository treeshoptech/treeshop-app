import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number; // Percentage change
  color?: string;
  progress?: number; // 0-100 for progress bar
  format?: 'currency' | 'percentage' | 'number' | 'rating';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = '#007AFF',
  progress,
  format = 'number'
}: MetricCardProps) {

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'rating':
        return `${val.toFixed(1)} / 5.0`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: '#1C1C1E',
        border: '1px solid #2C2C2E',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s'
        }
      }}
    >
      {/* Color accent bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: color
        }}
      />

      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="overline" sx={{ color: '#8E8E93', fontWeight: 600, letterSpacing: 1 }}>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: `${color}20`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 1,
            color: '#FFFFFF'
          }}
        >
          {formatValue(value)}
        </Typography>

        {subtitle && (
          <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 20, color: '#34C759' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 20, color: '#FF3B30' }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trend >= 0 ? '#34C759' : '#FF3B30',
                fontWeight: 600
              }}
            >
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% from last month
            </Typography>
          </Box>
        )}

        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ color: color, fontWeight: 600 }}>
                {progress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#2C2C2E',
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
