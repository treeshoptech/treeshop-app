"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";

interface MobileTimeTrackerProps {
  workOrderId: Id<"workOrders">;
  employeeId: Id<"employees">;
}

export default function MobileTimeTracker({
  workOrderId,
  employeeId,
}: MobileTimeTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch task definitions grouped by category
  const taskGroups = useQuery(api.taskDefinitions.getByCategory);

  // Get active time entry
  const activeEntry = useQuery(api.timeTracking.getActiveEntry, {
    employeeId,
    workOrderId,
  });

  // Get task summary
  const taskSummary = useQuery(api.timeTracking.getTaskSummary, {
    workOrderId,
  });

  // Mutations
  const startTask = useMutation(api.timeTracking.startTask);
  const stopTask = useMutation(api.timeTracking.stopTask);

  // Update GPS location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("GPS error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Update elapsed time timer
  useEffect(() => {
    if (!activeEntry) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      const elapsed = Date.now() - activeEntry.startTime;
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  const handleStartTask = async (taskDefinitionId: Id<"taskDefinitions">) => {
    try {
      await startTask({
        employeeId,
        workOrderId,
        taskDefinitionId,
        location: currentLocation || undefined,
      });
    } catch (error) {
      console.error("Failed to start task:", error);
      alert("Failed to start task. Please try again.");
    }
  };

  const handleStopTask = async () => {
    try {
      await stopTask({
        employeeId,
        workOrderId,
        location: currentLocation || undefined,
      });
    } catch (error) {
      console.error("Failed to stop task:", error);
      alert("Failed to stop task. Please try again.");
    }
  };

  const formatElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const h = hours.toString().padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");

    return `${h}:${m}:${s}`;
  };

  if (!taskGroups) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Current Task Display */}
      {activeEntry && (
        <Card
          sx={{
            bgcolor: "primary.dark",
            color: "primary.contrastText",
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">{activeEntry.taskName}</Typography>
                <Chip
                  label={activeEntry.taskCategory}
                  size="small"
                  sx={{ bgcolor: "background.paper" }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimeIcon />
                <Typography variant="h4" fontWeight="bold">
                  {formatElapsed(elapsedTime)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                {activeEntry.billable && (
                  <Chip label="Billable" size="small" color="success" />
                )}
                {activeEntry.countsForPPH && (
                  <Chip label="Production" size="small" color="warning" />
                )}
              </Box>

              <Button
                variant="contained"
                color="error"
                size="large"
                fullWidth
                startIcon={<StopIcon />}
                onClick={handleStopTask}
              >
                Stop Task
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* GPS Status */}
      {!currentLocation && (
        <Alert severity="warning">
          GPS location not available. Time entries will be recorded without location data.
        </Alert>
      )}

      {/* Production Tasks */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Production (Billable + Counts for PPH)
        </Typography>
        <Grid container spacing={1}>
          {taskGroups.production.map((task) => (
            <Grid item xs={6} sm={4} key={task._id}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  bgcolor: task.color || "primary.main",
                  height: "80px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
                onClick={() => handleStartTask(task._id)}
                disabled={activeEntry?.taskDefinitionId === task._id}
              >
                <Typography variant="h4">{task.icon}</Typography>
                <Typography variant="caption" sx={{ textAlign: "center" }}>
                  {task.taskName}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider />

      {/* Site Support Tasks */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Site Support (Billable, No PPH)
        </Typography>
        <Grid container spacing={1}>
          {taskGroups.siteSupport.map((task) => (
            <Grid item xs={6} sm={4} key={task._id}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  borderColor: task.color || "primary.main",
                  color: task.color || "primary.main",
                  height: "80px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
                onClick={() => handleStartTask(task._id)}
                disabled={activeEntry?.taskDefinitionId === task._id}
              >
                <Typography variant="h4">{task.icon}</Typography>
                <Typography variant="caption" sx={{ textAlign: "center" }}>
                  {task.taskName}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider />

      {/* General Support Tasks */}
      <Box>
        <Typography variant="h6" gutterBottom>
          General Support (Non-Billable)
        </Typography>
        <Grid container spacing={1}>
          {taskGroups.generalSupport.map((task) => (
            <Grid item xs={6} sm={4} key={task._id}>
              <Button
                variant="text"
                fullWidth
                size="large"
                sx={{
                  borderColor: task.color || "text.secondary",
                  color: task.color || "text.secondary",
                  height: "80px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  border: "1px dashed",
                }}
                onClick={() => handleStartTask(task._id)}
                disabled={activeEntry?.taskDefinitionId === task._id}
              >
                <Typography variant="h4">{task.icon}</Typography>
                <Typography variant="caption" sx={{ textAlign: "center" }}>
                  {task.taskName}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Task Summary */}
      {taskSummary && taskSummary.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom>
              Today's Summary
            </Typography>
            <Stack spacing={1}>
              {taskSummary.map((summary) => (
                <Card key={summary.taskName} variant="outlined">
                  <CardContent sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2">{summary.taskName}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {summary.totalHours.toFixed(2)} hrs
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                      {summary.isBillable && (
                        <Chip label="Billable" size="small" color="success" />
                      )}
                      {summary.countsForPPH && (
                        <Chip label="PPH" size="small" color="warning" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}
