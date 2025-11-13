"use client";

import { Box, Card, CardContent, Typography, Chip, Stack, IconButton } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  AttachMoney as BillableIcon,
} from '@mui/icons-material';

interface TimeEntryCardProps {
  entry: any;
  showWorkOrder?: boolean;
  showEmployee?: boolean;
  onEdit?: (entry: any) => void;
  onDelete?: (entry: any) => void;
  compact?: boolean;
}

/**
 * Time Entry Display Card
 *
 * Displays a single time entry with:
 * - Work order name (optional)
 * - Employee name (optional - for admin view)
 * - Start/end times
 * - Duration
 * - Activity type
 * - Billable status
 * - Approval status
 * - Edit/delete actions (admin only)
 */
export function TimeEntryCard({
  entry,
  showWorkOrder = false,
  showEmployee = false,
  onEdit,
  onDelete,
  compact = false,
}: TimeEntryCardProps) {
  // Format time
  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '--h --m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate duration if not provided
  const duration = entry.durationMinutes || (entry.startTime && entry.endTime
    ? Math.floor((entry.endTime - entry.startTime) / (1000 * 60))
    : 0);

  const isInProgress = entry.startTime && !entry.endTime;
  const isApproved = entry.approvalStatus === 'Approved';

  return (
    <Card
      sx={{
        bgcolor: '#1C1C1E',
        border: '1px solid #2C2C2E',
        '&:hover': {
          borderColor: isInProgress ? '#FF9500' : '#007AFF',
        },
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ p: compact ? 2 : 3, '&:last-child': { pb: compact ? 2 : 3 } }}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {/* Work Order Name */}
            {showWorkOrder && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {entry.workOrderName || 'Unknown Work Order'}
              </Typography>
            )}

            {/* Employee Name */}
            {showEmployee && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {entry.employeeName || 'Unknown Employee'}
              </Typography>
            )}

            {/* Date */}
            <Typography variant="caption" color="text.secondary">
              {new Date(entry.startTime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </Box>

          {/* Action Buttons (Admin Only) */}
          {(onEdit || onDelete) && (
            <Stack direction="row" spacing={0.5}>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(entry)}
                  sx={{ color: '#8E8E93', '&:hover': { color: '#007AFF' } }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(entry)}
                  sx={{ color: '#8E8E93', '&:hover': { color: '#FF3B30' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )}
        </Box>

        {/* Time Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Start
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatTime(entry.startTime)}
            </Typography>
          </Box>

          <Box sx={{ color: '#8E8E93' }}>→</Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              End
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {isInProgress ? 'In Progress' : formatTime(entry.endTime)}
            </Typography>
          </Box>

          <Box sx={{ ml: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
              Duration
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: isInProgress ? '#FF9500' : '#34C759',
                fontFamily: 'monospace',
              }}
            >
              {isInProgress ? 'Active' : formatDuration(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Chips Row */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {/* Activity Type */}
          {entry.activityType && (
            <Chip
              label={entry.activityType}
              size="small"
              sx={{
                bgcolor: '#007AFF20',
                color: '#007AFF',
                height: 24,
                fontSize: 12,
              }}
            />
          )}

          {/* Billable Status */}
          {entry.isBillable && (
            <Chip
              icon={<BillableIcon sx={{ fontSize: 14 }} />}
              label="Billable"
              size="small"
              sx={{
                bgcolor: '#34C75920',
                color: '#34C759',
                height: 24,
                fontSize: 12,
              }}
            />
          )}

          {/* Approval Status */}
          <Chip
            icon={isApproved ? <ApprovedIcon sx={{ fontSize: 14 }} /> : <PendingIcon sx={{ fontSize: 14 }} />}
            label={isApproved ? 'Approved' : 'Pending'}
            size="small"
            sx={{
              bgcolor: isApproved ? '#34C75920' : '#FF950020',
              color: isApproved ? '#34C759' : '#FF9500',
              height: 24,
              fontSize: 12,
            }}
          />

          {/* In Progress Status */}
          {isInProgress && (
            <Chip
              label="In Progress"
              size="small"
              sx={{
                bgcolor: '#FF950020',
                color: '#FF9500',
                height: 24,
                fontSize: 12,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.6 },
                },
              }}
            />
          )}
        </Stack>

        {/* Notes (if present) */}
        {entry.notes && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 2,
              p: 1.5,
              bgcolor: '#0A0A0A',
              borderRadius: 1,
              fontStyle: 'italic',
            }}
          >
            {entry.notes}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
