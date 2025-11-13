"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Fab, CircularProgress } from '@mui/material';
import { AccessTime as ClockIcon } from '@mui/icons-material';

interface TimeClockButtonProps {
  activeEntry: any | null;
  onClockIn: () => void;
  onClockOut: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Large circular time clock button
 *
 * Features:
 * - Changes color based on clock status (green = out, red = in)
 * - Shows elapsed time when clocked in
 * - Pulse animation when active
 * - Loading state during mutations
 */
export function TimeClockButton({
  activeEntry,
  onClockIn,
  onClockOut,
  disabled = false,
  loading = false,
}: TimeClockButtonProps) {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const isClockedIn = activeEntry !== null;

  // Update elapsed time every second
  useEffect(() => {
    if (!activeEntry || !activeEntry.startTime) {
      setElapsedTime('00:00:00');
      return;
    }

    const updateElapsed = () => {
      const start = activeEntry.startTime;
      const now = Date.now();
      const elapsed = now - start;

      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Update immediately
    updateElapsed();

    // Then update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  const buttonColor = isClockedIn ? '#FF3B30' : '#34C759';
  const buttonText = isClockedIn ? 'CLOCK OUT' : 'CLOCK IN';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Main Clock Button */}
      <Box
        sx={{
          position: 'relative',
          width: 220,
          height: 220,
        }}
      >
        {/* Pulse Animation Ring */}
        {isClockedIn && !disabled && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 240,
              height: 240,
              borderRadius: '50%',
              border: `2px solid ${buttonColor}`,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(1)',
                },
                '100%': {
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(1.15)',
                },
              },
            }}
          />
        )}

        {/* Main Button */}
        <Fab
          onClick={isClockedIn ? onClockOut : onClockIn}
          disabled={disabled || loading}
          sx={{
            width: 220,
            height: 220,
            bgcolor: buttonColor,
            color: '#FFF',
            '&:hover': {
              bgcolor: isClockedIn ? '#FF2520' : '#2FB848',
            },
            '&.Mui-disabled': {
              bgcolor: '#8E8E93',
              color: '#FFF',
            },
            transition: 'all 0.3s ease',
            boxShadow: `0 8px 24px ${buttonColor}40`,
          }}
        >
          {loading ? (
            <CircularProgress size={60} sx={{ color: '#FFF' }} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <ClockIcon sx={{ fontSize: 60 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                {buttonText}
              </Typography>
            </Box>
          )}
        </Fab>
      </Box>

      {/* Elapsed Time Display */}
      {isClockedIn && (
        <Box
          sx={{
            textAlign: 'center',
            p: 2,
            bgcolor: '#1C1C1E',
            borderRadius: 2,
            border: '1px solid #2C2C2E',
            minWidth: 200,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            TIME ELAPSED
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: buttonColor,
              fontFamily: 'monospace',
              letterSpacing: 2,
            }}
          >
            {elapsedTime}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
