"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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
  Typography,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

type WorkOrderStatus = "Scheduled" | "In Progress" | "Completed" | "Invoiced";

const STATUS_COLORS: Record<WorkOrderStatus, "default" | "info" | "success" | "primary"> = {
  "Scheduled": "info",
  "In Progress": "primary",
  "Completed": "success",
  "Invoiced": "default",
};

export default function WorkOrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "All">("All");

  // Fetch work orders and projects
  const allProjects = useQuery(api.projects.list);
  const workOrderProjects = allProjects?.filter((p) => p.status === "Work Order") || [];

  // Filter by status
  const filteredWorkOrders = statusFilter === "All"
    ? workOrderProjects
    : workOrderProjects.filter((wo) => wo.workOrderStatus === statusFilter);

  // Mutations
  const updateProject = useMutation(api.projects.update);

  const handleStartWork = async (workOrder: any) => {
    try {
      await updateProject({
        id: workOrder._id,
        workOrderStatus: "In Progress",
      });
    } catch (error) {
      console.error("Error starting work order:", error);
    }
  };

  const handleCompleteWork = async (workOrder: any) => {
    try {
      await updateProject({
        id: workOrder._id,
        workOrderStatus: "Completed",
      });
    } catch (error) {
      console.error("Error completing work order:", error);
    }
  };

  const handleConvertToInvoice = async (workOrder: any) => {
    try {
      await updateProject({
        id: workOrder._id,
        status: "Invoice",
        workOrderStatus: "Invoiced",
      });
    } catch (error) {
      console.error("Error converting to invoice:", error);
    }
  };

  const stats = {
    total: workOrderProjects.length,
    scheduled: workOrderProjects.filter((wo) => wo.workOrderStatus === "Scheduled" || !wo.workOrderStatus).length,
    inProgress: workOrderProjects.filter((wo) => wo.workOrderStatus === "In Progress").length,
    completed: workOrderProjects.filter((wo) => wo.workOrderStatus === "Completed").length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h3" gutterBottom>
            Work Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage field execution and track time
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Work Orders
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Scheduled
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.scheduled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.inProgress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter */}
        <Paper sx={{ p: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="All">All Work Orders</MenuItem>
              <MenuItem value="Scheduled">Scheduled</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Invoiced">Invoiced</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Work Orders Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Property Address</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No work orders found. Convert accepted proposals to work orders.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {workOrder.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{workOrder.propertyAddress}</Typography>
                    </TableCell>
                    <TableCell>{workOrder.serviceType}</TableCell>
                    <TableCell>
                      {workOrder.scheduledDate
                        ? new Date(workOrder.scheduledDate).toLocaleDateString()
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workOrder.workOrderStatus || "Scheduled"}
                        color={STATUS_COLORS[workOrder.workOrderStatus as WorkOrderStatus] || "info"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/work-orders/${workOrder._id}`)}
                          title="View Work Order"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {(!workOrder.workOrderStatus || workOrder.workOrderStatus === "Scheduled") && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleStartWork(workOrder)}
                            title="Start Work"
                          >
                            <StartIcon fontSize="small" />
                          </IconButton>
                        )}
                        {workOrder.workOrderStatus === "In Progress" && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleCompleteWork(workOrder)}
                            title="Complete Work"
                          >
                            <StopIcon fontSize="small" />
                          </IconButton>
                        )}
                        {workOrder.workOrderStatus === "Completed" && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleConvertToInvoice(workOrder)}
                            title="Convert to Invoice"
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
}
