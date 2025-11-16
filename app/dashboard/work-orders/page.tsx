"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon,
  Visibility as ViewIcon,
  ArrowForward as InvoiceIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Construction as EquipmentIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import TimeTracker from "./[id]/components/TimeTracker";

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
  const [expandedWorkOrder, setExpandedWorkOrder] = useState<Id<"projects"> | null>(null);

  // Ensure dev organization exists (for development mode)
  const ensureDevOrg = useMutation(api.organizations.ensureDevOrg);

  useEffect(() => {
    ensureDevOrg()
      .catch((err) => console.error("Failed to ensure dev org:", err));
  }, [ensureDevOrg]);

  // Fetch data
  const allProjects = useQuery(api.projects.list);
  const workOrderProjects = allProjects?.filter((p) => p.status === "Work Order") || [];
  const loadouts = useQuery(api.loadouts.list);
  const employees = useQuery(api.employees.list);

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
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" gutterBottom>
              Work Orders
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage field execution and track time
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/dashboard/work-orders/new-direct")}
            sx={{ mt: 1 }}
          >
            New Work Order
          </Button>
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

        {/* Work Order Cards */}
        {filteredWorkOrders.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No work orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Convert accepted proposals to work orders or create a new work order directly
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/dashboard/work-orders/new-direct")}
            >
              Create First Work Order
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredWorkOrders.map((workOrder) => {
              const isExpanded = expandedWorkOrder === workOrder._id;
              const loadout = loadouts?.find(l => l._id === workOrder.loadoutId);

              return (
                <Card
                  key={workOrder._id}
                  sx={{
                    border: '1px solid',
                    borderColor: isExpanded ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                >
                  <CardContent
                    sx={{
                      cursor: 'pointer',
                      pb: isExpanded ? 2 : 1
                    }}
                    onClick={() => setExpandedWorkOrder(isExpanded ? null : workOrder._id)}
                  >
                    {/* Collapsed View */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                      {/* Customer & Status */}
                      <Box sx={{ minWidth: 200, flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {workOrder.customerName || "Unknown Customer"}
                        </Typography>
                        <Chip
                          label={workOrder.workOrderStatus || "Scheduled"}
                          color={STATUS_COLORS[workOrder.workOrderStatus as WorkOrderStatus] || "info"}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>

                      {/* Service & Location */}
                      <Box sx={{ minWidth: 250, flex: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {workOrder.serviceType}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2" noWrap>
                            {workOrder.propertyAddress?.split(',')[0] || 'No address'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Scheduled Date */}
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {workOrder.scheduledDate
                              ? new Date(workOrder.scheduledDate).toLocaleDateString()
                              : "Not scheduled"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Quick Actions - Only when NOT expanded */}
                      {!isExpanded && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(!workOrder.workOrderStatus || workOrder.workOrderStatus === "Scheduled") && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<StartIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartWork(workOrder);
                              }}
                            >
                              Start
                            </Button>
                          )}
                          {workOrder.workOrderStatus === "In Progress" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CompleteIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteWork(workOrder);
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </Box>
                      )}

                      {/* Expand Icon */}
                      <IconButton size="small">
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    {/* Expanded View */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Grid container spacing={3}>
                          {/* Work Order Details */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Work Order Information
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                <strong>Customer:</strong> {workOrder.customerName || "Unknown"}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Service:</strong> {workOrder.serviceType}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Address:</strong> {workOrder.propertyAddress || 'Not provided'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Scheduled:</strong>{" "}
                                {workOrder.scheduledDate
                                  ? new Date(workOrder.scheduledDate).toLocaleDateString()
                                  : "Not scheduled"}
                              </Typography>
                              {workOrder.contractAmount && (
                                <Typography variant="body2">
                                  <strong>Contract Amount:</strong> ${workOrder.contractAmount.toLocaleString()}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>

                          {/* Loadout & Crew */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Crew & Equipment
                            </Typography>
                            <Stack spacing={1}>
                              {loadout ? (
                                <>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <EquipmentIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      <strong>Loadout:</strong> {loadout.name}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <PersonIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      <strong>Crew Size:</strong> {loadout.employeeIds?.length || 0} members
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    <strong>Equipment:</strong> {loadout.equipmentIds?.length || 0} items
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No loadout assigned
                                </Typography>
                              )}
                            </Stack>
                          </Grid>

                          {/* Special Instructions & Notes */}
                          {(workOrder.specialInstructions || workOrder.notes) && (
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                              {workOrder.specialInstructions && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Special Instructions
                                  </Typography>
                                  <Typography variant="body2">{workOrder.specialInstructions}</Typography>
                                </Box>
                              )}
                              {workOrder.notes && (
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Internal Notes
                                  </Typography>
                                  <Typography variant="body2">{workOrder.notes}</Typography>
                                </Box>
                              )}
                            </Grid>
                          )}

                          {/* Time Tracking Section */}
                          {workOrder.workOrderStatus === "In Progress" && (
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <TimerIcon color="primary" />
                                <Typography variant="h6">Time Tracking</Typography>
                              </Box>
                              <TimeTracker workOrderId={workOrder._id} />
                            </Grid>
                          )}

                          {/* Action Buttons */}
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              <Button
                                variant="outlined"
                                startIcon={<ViewIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/work-orders/${workOrder._id}`);
                                }}
                              >
                                View Full Dashboard
                              </Button>

                              {(!workOrder.workOrderStatus || workOrder.workOrderStatus === "Scheduled") && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<StartIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartWork(workOrder);
                                  }}
                                >
                                  Start Work
                                </Button>
                              )}

                              {workOrder.workOrderStatus === "In Progress" && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<CompleteIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteWork(workOrder);
                                  }}
                                >
                                  Complete Work Order
                                </Button>
                              )}

                              {workOrder.workOrderStatus === "Completed" && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<InvoiceIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConvertToInvoice(workOrder);
                                  }}
                                >
                                  Create Invoice
                                </Button>
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
