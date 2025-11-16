"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Timer,
  Person,
  Construction,
  CheckCircle,
  Edit,
  Delete,
} from "@mui/icons-material";
import { getTasksForService, groupTasksByCategory } from "@/lib/timeTrackingTasks";

interface TimeTrackerProps {
  workOrderId: Id<"workOrders">;
  lineItemId?: Id<"lineItems">;
}

export default function TimeTracker({ workOrderId, lineItemId }: TimeTrackerProps) {
  const [clockInDialogOpen, setClockInDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Id<"employees"> | "">("");
  const [selectedLineItem, setSelectedLineItem] = useState<Id<"lineItems"> | "">("");
  const [selectedTask, setSelectedTask] = useState<string>("");

  // Queries
  const timeEntries = useQuery(api.timeEntries.listByWorkOrder, { workOrderId });
  const lineItems = useQuery(api.lineItems.listByParent, {
    parentDocId: workOrderId,
    parentDocType: "WorkOrder",
  });
  const employees = useQuery(api.employees.list);

  // Mutations
  const startTimeEntry = useMutation(api.timeEntries.start);
  const stopTimeEntry = useMutation(api.timeEntries.stop);
  const deleteTimeEntry = useMutation(api.timeEntries.remove);

  // Filter active entries
  const activeEntries = timeEntries?.filter((entry) => !entry.endTime) || [];
  const completedEntries = timeEntries?.filter((entry) => entry.endTime) || [];

  // Filter by line item if provided
  const filteredActive = lineItemId
    ? activeEntries.filter((e) => e.lineItemId === lineItemId)
    : activeEntries;
  const filteredCompleted = lineItemId
    ? completedEntries.filter((e) => e.lineItemId === lineItemId)
    : completedEntries;

  // Get available tasks based on selected line item's service type
  const availableTasks = useMemo(() => {
    if (!selectedLineItem || !lineItems) return [];
    const lineItem = lineItems.find((li) => li._id === selectedLineItem);
    if (!lineItem) return [];
    return getTasksForService(lineItem.serviceType);
  }, [selectedLineItem, lineItems]);

  // Group tasks by category for organized display
  const groupedTasks = useMemo(() => {
    return groupTasksByCategory(availableTasks);
  }, [availableTasks]);

  // Calculate totals
  const totalActiveHours = filteredActive.reduce((sum, entry) => {
    const elapsed = (Date.now() - entry.startTime) / (1000 * 60 * 60);
    return sum + elapsed;
  }, 0);

  const totalCompletedHours = filteredCompleted.reduce((sum, entry) => {
    return sum + (entry.durationHours || 0);
  }, 0);

  const totalHours = totalActiveHours + totalCompletedHours;

  const handleClockIn = async () => {
    if (!selectedEmployee || !selectedLineItem || !selectedTask) {
      alert("Please select employee, line item, and task");
      return;
    }

    const employee = employees?.find((e) => e._id === selectedEmployee);
    if (!employee) return;

    const employeeCode = `${employee.primaryTrack}${employee.tier}`;

    // Find the selected task to get its category and billable status
    const task = availableTasks.find((t) => t.name === selectedTask);
    if (!task) return;

    try {
      await startTimeEntry({
        workOrderId,
        lineItemId: selectedLineItem,
        employeeId: selectedEmployee,
        employeeCode,
        activityCategory: task.category,
        activityType: task.name,
        billable: task.billable,
        recordedMethod: "Manual Entry",
      });

      setClockInDialogOpen(false);
      setSelectedEmployee("");
      setSelectedLineItem("");
      setSelectedTask("");
    } catch (error) {
      console.error("Error clocking in:", error);
      alert("Failed to clock in");
    }
  };

  const handleClockOut = async (entryId: Id<"timeEntries">) => {
    try {
      await stopTimeEntry({ id: entryId });
    } catch (error) {
      console.error("Error clocking out:", error);
      alert("Failed to clock out");
    }
  };

  const handleDeleteEntry = async (entryId: Id<"timeEntries">) => {
    if (!confirm("Delete this time entry?")) return;

    try {
      await deleteTimeEntry({ id: entryId });
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete time entry");
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getElapsedTime = (startTime: number) => {
    const elapsed = (Date.now() - startTime) / (1000 * 60 * 60);
    return formatDuration(elapsed);
  };

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: "primary.50" }}>
            <Typography variant="body2" color="text.secondary">
              Active Time Entries
            </Typography>
            <Typography variant="h5">{filteredActive.length}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDuration(totalActiveHours)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: "success.50" }}>
            <Typography variant="body2" color="text.secondary">
              Completed Today
            </Typography>
            <Typography variant="h5">{filteredCompleted.length}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDuration(totalCompletedHours)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: "info.50" }}>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
            <Typography variant="h5">{formatDuration(totalHours)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Clock In Button */}
      <Box mb={3}>
        <Button variant="contained" startIcon={<PlayArrow />} onClick={() => setClockInDialogOpen(true)}>
          Clock In Crew Member
        </Button>
      </Box>

      {/* Active Time Entries */}
      {filteredActive.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Time Entries ({filteredActive.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Line Item</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Elapsed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActive.map((entry) => {
                    const employee = employees?.find((e) => e._id === entry.employeeId);
                    const lineItem = lineItems?.find((li) => li._id === entry.lineItemId);

                    return (
                      <TableRow key={entry._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" />
                            {employee?.firstName} {employee?.lastName}
                          </Box>
                        </TableCell>
                        <TableCell>{lineItem?.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={entry.activityType || entry.activityCategory}
                            size="small"
                            color={entry.billable ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>{new Date(entry.startTime).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {getElapsedTime(entry.startTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="success" onClick={() => handleClockOut(entry._id)}>
                            <Stop />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Completed Time Entries */}
      {filteredCompleted.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Completed Time Entries ({filteredCompleted.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Line Item</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Ended</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompleted.map((entry) => {
                    const employee = employees?.find((e) => e._id === entry.employeeId);
                    const lineItem = lineItems?.find((li) => li._id === entry.lineItemId);

                    return (
                      <TableRow key={entry._id}>
                        <TableCell>
                          {employee?.firstName} {employee?.lastName}
                        </TableCell>
                        <TableCell>{lineItem?.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={entry.activityType || entry.activityCategory}
                            size="small"
                            color={entry.billable ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>{new Date(entry.startTime).toLocaleTimeString()}</TableCell>
                        <TableCell>{entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : "-"}</TableCell>
                        <TableCell>{formatDuration(entry.durationHours || 0)}</TableCell>
                        <TableCell>${(entry.laborCost || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {!entry.approved && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteEntry(entry._id)}>
                              <Delete />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Clock In Dialog */}
      <Dialog open={clockInDialogOpen} onClose={() => setClockInDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Clock In Crew Member</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                label="Employee"
                onChange={(e) => setSelectedEmployee(e.target.value as Id<"employees">)}
              >
                {employees?.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} - {emp.primaryTrack}
                    {emp.tier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Line Item</InputLabel>
              <Select
                value={selectedLineItem}
                label="Line Item"
                onChange={(e) => setSelectedLineItem(e.target.value as Id<"lineItems">)}
              >
                {lineItems?.map((li) => (
                  <MenuItem key={li._id} value={li._id}>
                    {li.description} ({li.status})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Task</InputLabel>
              <Select
                value={selectedTask}
                label="Task"
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={!selectedLineItem}
              >
                {!selectedLineItem && (
                  <MenuItem value="" disabled>
                    Select a line item first
                  </MenuItem>
                )}
                {Array.from(groupedTasks.entries()).map(([category, tasks]) => [
                  <ListItem key={category} sx={{ py: 0.5, px: 2, bgcolor: "action.hover" }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      {category}
                    </Typography>
                  </ListItem>,
                  ...tasks.map((task) => (
                    <MenuItem key={task.name} value={task.name} sx={{ pl: 4 }}>
                      <Stack direction="row" spacing={1} alignItems="center" width="100%">
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {task.name}
                        </Typography>
                        <Chip
                          label={task.billable ? "Billable" : "Overhead"}
                          size="small"
                          color={task.billable ? "success" : "default"}
                          sx={{ ml: 1 }}
                        />
                      </Stack>
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClockInDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClockIn}
            variant="contained"
            disabled={!selectedEmployee || !selectedLineItem || !selectedTask}
          >
            Clock In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
