"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  PlayArrow,
  Stop,
  CheckCircle,
  Person,
  Construction,
  CameraAlt,
  Assignment,
  Timer,
  TrendingUp,
  TrendingDown,
  AttachMoney,
} from "@mui/icons-material";
import { useState } from "react";
import TimeTracker from "./components/TimeTracker";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id as Id<"workOrders">;

  // State
  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Id<"employees">[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Id<"equipment">[]>([]);

  // Queries
  const workOrder = useQuery(api.workOrders.get, { id: workOrderId });
  const lineItems = useQuery(api.lineItems.listByParent, {
    parentDocId: workOrderId,
    parentDocType: "WorkOrder",
  });
  const employees = useQuery(api.employees.list);
  const equipment = useQuery(api.equipment.list);
  const timeEntries = useQuery(api.timeEntries.listByWorkOrder, { workOrderId });

  // Mutations
  const updateWorkOrder = useMutation(api.workOrders.update);
  const startWork = useMutation(api.workOrders.startWork);
  const completeWork = useMutation(api.workOrders.complete);
  const assignCrew = useMutation(api.workOrders.assignCrew);
  const assignEquipment = useMutation(api.workOrders.assignEquipment);
  const updateCompletionChecklist = useMutation(api.workOrders.updateCompletionChecklist);
  const startLineItem = useMutation(api.lineItems.startLineItem);
  const completeLineItem = useMutation(api.lineItems.completeLineItem);
  const transitionToInvoice = useMutation(api.projects.transitionToInvoice);

  if (!workOrder || !lineItems) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading work order...</Typography>
      </Container>
    );
  }

  // Calculate stats
  const totalLineItems = lineItems.length;
  const completedLineItems = lineItems.filter((li) => li.status === "Completed").length;
  const inProgressLineItems = lineItems.filter((li) => li.status === "In Progress").length;

  const totalEstimatedHours = lineItems.reduce((sum, li) => sum + li.totalEstimatedHours, 0);
  const totalActualHours = lineItems.reduce((sum, li) => sum + (li.totalActualHours || 0), 0);
  const hoursVariance = totalActualHours - totalEstimatedHours;
  const hoursVariancePercent = totalEstimatedHours > 0 ? (hoursVariance / totalEstimatedHours) * 100 : 0;

  const totalEstimatedCost = lineItems.reduce((sum, li) => sum + li.totalCost, 0);
  const totalActualCost = lineItems.reduce((sum, li) => sum + (li.actualTotalCost || 0), 0);
  const totalPrice = lineItems.reduce((sum, li) => sum + li.totalPrice, 0);
  const estimatedProfit = totalPrice - totalEstimatedCost;
  const actualProfit = totalPrice - totalActualCost;
  const estimatedMargin = totalPrice > 0 ? (estimatedProfit / totalPrice) * 100 : 0;
  const actualMargin = totalPrice > 0 ? (actualProfit / totalPrice) * 100 : 0;

  const progressPercent = totalLineItems > 0 ? (completedLineItems / totalLineItems) * 100 : 0;

  const isComplete = completedLineItems === totalLineItems && totalLineItems > 0;

  const handleStartWork = async () => {
    try {
      await startWork({ id: workOrderId });
    } catch (error) {
      console.error("Error starting work:", error);
      alert("Failed to start work order");
    }
  };

  const handleCompleteWork = async () => {
    if (!isComplete) {
      alert("Please complete all line items first");
      return;
    }

    try {
      await completeWork({
        id: workOrderId,
        customerSignature: "", // TODO: Add signature canvas
      });
    } catch (error) {
      console.error("Error completing work:", error);
      alert("Failed to complete work order");
    }
  };

  const handleAssignCrew = async () => {
    try {
      await assignCrew({
        id: workOrderId,
        crewMemberIds: selectedCrew,
      });
      setCrewDialogOpen(false);
    } catch (error) {
      console.error("Error assigning crew:", error);
      alert("Failed to assign crew");
    }
  };

  const handleAssignEquipment = async () => {
    try {
      await assignEquipment({
        id: workOrderId,
        equipmentIds: selectedEquipment,
      });
      setEquipmentDialogOpen(false);
    } catch (error) {
      console.error("Error assigning equipment:", error);
      alert("Failed to assign equipment");
    }
  };

  const handleStartLineItem = async (lineItemId: Id<"lineItems">) => {
    try {
      await startLineItem({ id: lineItemId });
    } catch (error) {
      console.error("Error starting line item:", error);
      alert("Failed to start line item");
    }
  };

  const handleCompleteLineItem = async (lineItemId: Id<"lineItems">) => {
    try {
      await completeLineItem({ id: lineItemId });
    } catch (error) {
      console.error("Error completing line item:", error);
      alert("Failed to complete line item");
    }
  };

  const handleConvertToInvoice = async () => {
    if (workOrder.projectId) {
      try {
        await transitionToInvoice({ id: workOrder.projectId });
        router.push(`/dashboard/invoices`);
      } catch (error) {
        console.error("Error converting to invoice:", error);
        alert("Failed to convert to invoice");
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push("/dashboard/work-orders")}
            sx={{ mb: 2 }}
          >
            Back to Work Orders
          </Button>

          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h3" gutterBottom>
                Work Order #{workOrder.workOrderNumber || workOrderId.slice(-6)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {workOrder.propertyAddress}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Chip
                label={workOrder.status}
                color={
                  workOrder.status === "Completed"
                    ? "success"
                    : workOrder.status === "InProgress"
                    ? "primary"
                    : "default"
                }
                size="large"
              />

              {workOrder.status === "Scheduled" && (
                <Button variant="contained" startIcon={<PlayArrow />} onClick={handleStartWork}>
                  Start Work
                </Button>
              )}

              {workOrder.status === "InProgress" && isComplete && (
                <Button variant="contained" color="success" startIcon={<Stop />} onClick={handleCompleteWork}>
                  Complete Work
                </Button>
              )}

              {workOrder.status === "Completed" && (
                <Button variant="contained" color="primary" onClick={handleConvertToInvoice}>
                  Create Invoice
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Progress Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Line Items: {completedLineItems} / {totalLineItems} completed
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {progressPercent.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "primary.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Hours
                  </Typography>
                  <Typography variant="h5">{totalEstimatedHours.toFixed(1)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: workOrder.status === "InProgress" ? "info.50" : "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    Actual Hours
                  </Typography>
                  <Typography variant="h5">{totalActualHours.toFixed(1)}</Typography>
                  {hoursVariance !== 0 && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={0.5}>
                      {hoursVariance > 0 ? <TrendingUp fontSize="small" color="error" /> : <TrendingDown fontSize="small" color="success" />}
                      <Typography variant="caption" color={hoursVariance > 0 ? "error.main" : "success.main"} ml={0.5}>
                        {hoursVariance > 0 ? "+" : ""}
                        {hoursVariance.toFixed(1)}h ({hoursVariancePercent > 0 ? "+" : ""}
                        {hoursVariancePercent.toFixed(1)}%)
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "success.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    Target Margin
                  </Typography>
                  <Typography variant="h5">{estimatedMargin.toFixed(1)}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${estimatedProfit.toFixed(0)} profit
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: actualMargin >= estimatedMargin ? "success.100" : "warning.50",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Actual Margin
                  </Typography>
                  <Typography variant="h5">{actualMargin.toFixed(1)}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${actualProfit.toFixed(0)} profit
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Customer & Schedule Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Property Address" secondary={workOrder.propertyAddress} />
                  </ListItem>
                  {workOrder.scheduledDate && (
                    <ListItem>
                      <ListItemText
                        primary="Scheduled Date"
                        secondary={new Date(workOrder.scheduledDate).toLocaleDateString()}
                      />
                    </ListItem>
                  )}
                  {workOrder.scheduledStartTime && (
                    <ListItem>
                      <ListItemText primary="Start Time" secondary={workOrder.scheduledStartTime} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Crew & Equipment</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Person />}
                      onClick={() => setCrewDialogOpen(true)}
                    >
                      Assign Crew
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Construction />}
                      onClick={() => setEquipmentDialogOpen(true)}
                    >
                      Assign Equipment
                    </Button>
                  </Stack>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Crew Members ({workOrder.crewMemberIds?.length || 0})
                </Typography>
                {workOrder.crewMemberIds && workOrder.crewMemberIds.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {workOrder.crewMemberIds.map((empId) => {
                      const emp = employees?.find((e) => e._id === empId);
                      return <Chip key={empId} label={`${emp?.firstName} ${emp?.lastName}`} size="small" />;
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    No crew assigned
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Equipment ({workOrder.equipmentIds?.length || 0})
                </Typography>
                {workOrder.equipmentIds && workOrder.equipmentIds.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {workOrder.equipmentIds.map((eqId) => {
                      const eq = equipment?.find((e) => e._id === eqId);
                      return <Chip key={eqId} label={eq?.nickname || `${eq?.make} ${eq?.model}`} size="small" variant="outlined" />;
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No equipment assigned
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Line Items */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Line Items ({totalLineItems})
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Est. Hours</TableCell>
                    <TableCell align="right">Actual Hours</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((lineItem) => {
                    const variance = (lineItem.totalActualHours || 0) - lineItem.totalEstimatedHours;
                    const variancePercent =
                      lineItem.totalEstimatedHours > 0 ? (variance / lineItem.totalEstimatedHours) * 100 : 0;

                    return (
                      <TableRow key={lineItem._id}>
                        <TableCell>{lineItem.serviceType}</TableCell>
                        <TableCell>{lineItem.description}</TableCell>
                        <TableCell align="right">{lineItem.totalEstimatedHours.toFixed(1)}</TableCell>
                        <TableCell align="right">{lineItem.totalActualHours?.toFixed(1) || "-"}</TableCell>
                        <TableCell align="right">
                          {lineItem.totalActualHours ? (
                            <Typography
                              variant="body2"
                              color={variance > 0 ? "error.main" : variance < 0 ? "success.main" : "text.primary"}
                            >
                              {variance > 0 ? "+" : ""}
                              {variance.toFixed(1)}h ({variancePercent > 0 ? "+" : ""}
                              {variancePercent.toFixed(0)}%)
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="right">${lineItem.totalPrice.toFixed(0)}</TableCell>
                        <TableCell>
                          <Chip
                            label={lineItem.status}
                            color={
                              lineItem.status === "Completed"
                                ? "success"
                                : lineItem.status === "In Progress"
                                ? "primary"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {lineItem.status === "Pending" && (
                            <Button
                              size="small"
                              startIcon={<Timer />}
                              onClick={() => handleStartLineItem(lineItem._id)}
                            >
                              Start
                            </Button>
                          )}
                          {lineItem.status === "In Progress" && (
                            <Button
                              size="small"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleCompleteLineItem(lineItem._id)}
                            >
                              Complete
                            </Button>
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

        {/* Time Tracking */}
        {(workOrder.status === "InProgress" || workOrder.status === "Completed") && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Time Tracking
              </Typography>
              <TimeTracker workOrderId={workOrderId} />
            </CardContent>
          </Card>
        )}

        {/* Completion Checklist */}
        {workOrder.status === "InProgress" && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion Checklist
              </Typography>

              <List>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workOrder.allLineItemsComplete || false}
                        onChange={(e) =>
                          updateCompletionChecklist({
                            id: workOrderId,
                            allLineItemsComplete: e.target.checked,
                          })
                        }
                      />
                    }
                    label="All line items complete"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workOrder.finalPhotosUploaded || false}
                        onChange={(e) =>
                          updateCompletionChecklist({
                            id: workOrderId,
                            finalPhotosUploaded: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Final photos uploaded"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workOrder.debrisRemoved || false}
                        onChange={(e) =>
                          updateCompletionChecklist({
                            id: workOrderId,
                            debrisRemoved: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Debris removed from site"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workOrder.siteRestored || false}
                        onChange={(e) =>
                          updateCompletionChecklist({
                            id: workOrderId,
                            siteRestored: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Site restored"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workOrder.equipmentCleaned || false}
                        onChange={(e) =>
                          updateCompletionChecklist({
                            id: workOrderId,
                            equipmentCleaned: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Equipment cleaned"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workOrder.customerWalkthroughComplete || false}
                        onChange={(e) =>
                          updateCompletionChecklist({
                            id: workOrderId,
                            customerWalkthroughComplete: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Customer walkthrough complete"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Crew Assignment Dialog */}
      <Dialog open={crewDialogOpen} onClose={() => setCrewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Crew Members</DialogTitle>
        <DialogContent>
          <List>
            {employees?.map((emp) => (
              <ListItem
                key={emp._id}
                button
                onClick={() => {
                  setSelectedCrew((prev) =>
                    prev.includes(emp._id) ? prev.filter((id) => id !== emp._id) : [...prev, emp._id]
                  );
                }}
              >
                <Checkbox checked={selectedCrew.includes(emp._id)} />
                <ListItemText primary={`${emp.firstName} ${emp.lastName}`} secondary={emp.primaryTrack} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCrewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignCrew} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Equipment Assignment Dialog */}
      <Dialog open={equipmentDialogOpen} onClose={() => setEquipmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Equipment</DialogTitle>
        <DialogContent>
          <List>
            {equipment?.map((eq) => (
              <ListItem
                key={eq._id}
                button
                onClick={() => {
                  setSelectedEquipment((prev) =>
                    prev.includes(eq._id) ? prev.filter((id) => id !== eq._id) : [...prev, eq._id]
                  );
                }}
              >
                <Checkbox checked={selectedEquipment.includes(eq._id)} />
                <ListItemText primary={eq.nickname || `${eq.make} ${eq.model}`} secondary={eq.equipmentCategory} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEquipmentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignEquipment} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
