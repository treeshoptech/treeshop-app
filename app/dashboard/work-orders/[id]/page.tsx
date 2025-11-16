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
  Tab,
  Tabs,
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
  Note,
  Phone,
  Email,
  Warning,
  CheckCircleOutline,
} from "@mui/icons-material";
import { useState } from "react";
import TimeTracker from "./components/TimeTracker";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id as Id<"workOrders">;

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Id<"employees">[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Id<"equipment">[]>([]);
  const [noteText, setNoteText] = useState("");

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

  const addNote = async () => {
    if (!noteText.trim()) return;

    try {
      const currentNotes = workOrder.notes || "";
      const timestamp = new Date().toLocaleString();
      const newNote = `[${timestamp}] ${noteText}`;
      const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;

      await updateWorkOrder({
        id: workOrderId,
        notes: updatedNotes,
      });

      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header with Actions */}
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
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Work Order #{workOrder.workOrderNumber || workOrderId.slice(-6)}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {workOrder.propertyAddress}
              </Typography>
              {workOrder.scheduledDate && (
                <Typography variant="body2" color="text.secondary">
                  Scheduled: {new Date(workOrder.scheduledDate).toLocaleDateString()}
                  {workOrder.scheduledStartTime && ` at ${workOrder.scheduledStartTime}`}
                </Typography>
              )}
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
                sx={{ fontSize: "1rem", px: 2, py: 3 }}
              />

              {workOrder.status === "Scheduled" && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleStartWork}
                  sx={{ px: 3 }}
                >
                  Start Work
                </Button>
              )}

              {workOrder.status === "InProgress" && isComplete && (
                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={handleCompleteWork}
                  sx={{ px: 3 }}
                >
                  Complete Work
                </Button>
              )}

              {workOrder.status === "Completed" && (
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  onClick={handleConvertToInvoice}
                  sx={{ px: 3 }}
                >
                  Create Invoice
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Progress Overview */}
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6" fontWeight="600">
                  Project Progress
                </Typography>
                <Typography variant="h6" fontWeight="700" color="primary.main">
                  {progressPercent.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 12, borderRadius: 6 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {completedLineItems} of {totalLineItems} tasks completed
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.100" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Estimated Hours
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{totalEstimatedHours.toFixed(1)}</Typography>
                  <Typography variant="caption" color="text.secondary">Budget</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: workOrder.status === "InProgress" ? "info.50" : "grey.100" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Actual Hours
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{totalActualHours.toFixed(1)}</Typography>
                  {hoursVariance !== 0 && (
                    <Box display="flex" alignItems="center" justifyContent="center">
                      {hoursVariance > 0 ? <TrendingUp fontSize="small" color="error" /> : <TrendingDown fontSize="small" color="success" />}
                      <Typography variant="caption" color={hoursVariance > 0 ? "error.main" : "success.main"} ml={0.5}>
                        {hoursVariance > 0 ? "+" : ""}{hoursVariance.toFixed(1)}h ({hoursVariancePercent > 0 ? "+" : ""}{hoursVariancePercent.toFixed(1)}%)
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "success.50" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Target Margin
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: "success.dark" }}>{estimatedMargin.toFixed(1)}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${estimatedProfit.toFixed(0)} profit
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: actualMargin >= estimatedMargin ? "success.100" : "warning.50",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Actual Margin
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: actualMargin >= estimatedMargin ? "success.dark" : "warning.dark" }}>
                    {actualMargin.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${actualProfit.toFixed(0)} profit
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabbed Interface */}
        <Paper elevation={2}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab icon={<Assignment />} label="Tasks & Progress" iconPosition="start" />
            <Tab icon={<Timer />} label="Time Tracking" iconPosition="start" />
            <Tab icon={<Person />} label="Team & Equipment" iconPosition="start" />
            <Tab icon={<CheckCircleOutline />} label="Completion Checklist" iconPosition="start" />
            <Tab icon={<Note />} label="Notes & Communication" iconPosition="start" />
            <Tab icon={<CameraAlt />} label="Photos & Documentation" iconPosition="start" />
          </Tabs>

          {/* Tab 1: Tasks & Progress */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Service Line Items ({totalLineItems})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Track progress on each service task
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Est. Hours</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actual Hours</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Variance</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItems.map((lineItem) => {
                      const variance = (lineItem.totalActualHours || 0) - lineItem.totalEstimatedHours;
                      const variancePercent =
                        lineItem.totalEstimatedHours > 0 ? (variance / lineItem.totalEstimatedHours) * 100 : 0;

                      return (
                        <TableRow key={lineItem._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {lineItem.serviceType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {lineItem.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{lineItem.totalEstimatedHours.toFixed(1)}</TableCell>
                          <TableCell align="right">{lineItem.totalActualHours?.toFixed(1) || "-"}</TableCell>
                          <TableCell align="right">
                            {lineItem.totalActualHours ? (
                              <Typography
                                variant="body2"
                                fontWeight="600"
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
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600">
                              ${lineItem.totalPrice.toFixed(0)}
                            </Typography>
                          </TableCell>
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
                                variant="outlined"
                                startIcon={<PlayArrow />}
                                onClick={() => handleStartLineItem(lineItem._id)}
                              >
                                Start
                              </Button>
                            )}
                            {lineItem.status === "In Progress" && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleCompleteLineItem(lineItem._id)}
                              >
                                Complete
                              </Button>
                            )}
                            {lineItem.status === "Completed" && (
                              <Chip icon={<CheckCircle />} label="Done" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </TabPanel>

          {/* Tab 2: Time Tracking */}
          <TabPanel value={activeTab} index={1}>
            {(workOrder.status === "InProgress" || workOrder.status === "Completed") ? (
              <TimeTracker workOrderId={workOrderId} />
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Timer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Time Tracking Unavailable</Typography>
                <Typography variant="body2" color="text.secondary">
                  Start the work order to begin tracking time
                </Typography>
              </Paper>
            )}
          </TabPanel>

          {/* Tab 3: Team & Equipment */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Crew Members
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setCrewDialogOpen(true)}
                      >
                        Assign Crew
                      </Button>
                    </Box>

                    {workOrder.crewMemberIds && workOrder.crewMemberIds.length > 0 ? (
                      <Stack spacing={1}>
                        {workOrder.crewMemberIds.map((empId) => {
                          const emp = employees?.find((e) => e._id === empId);
                          return (
                            <Paper key={empId} sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="body1" fontWeight="600">
                                {emp?.firstName} {emp?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {emp?.primaryTrack}{emp?.tier}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No crew assigned
                        </Typography>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <Construction sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Equipment
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setEquipmentDialogOpen(true)}
                      >
                        Assign Equipment
                      </Button>
                    </Box>

                    {workOrder.equipmentIds && workOrder.equipmentIds.length > 0 ? (
                      <Stack spacing={1}>
                        {workOrder.equipmentIds.map((eqId) => {
                          const eq = equipment?.find((e) => e._id === eqId);
                          return (
                            <Paper key={eqId} sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="body1" fontWeight="600">
                                {eq?.nickname || `${eq?.make} ${eq?.model}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {eq?.equipmentCategory}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Construction sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No equipment assigned
                        </Typography>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: Completion Checklist */}
          <TabPanel value={activeTab} index={3}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Pre-Completion Checklist
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Complete all items before finishing the work order
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
                        disabled={workOrder.status !== "InProgress"}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">All line items complete</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Verify all service tasks are finished
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
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
                        disabled={workOrder.status !== "InProgress"}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">Final photos uploaded</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Before, during, and after photos documented
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
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
                        disabled={workOrder.status !== "InProgress"}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">Debris removed from site</Typography>
                        <Typography variant="caption" color="text.secondary">
                          All wood chips, logs, and waste cleared
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
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
                        disabled={workOrder.status !== "InProgress"}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">Site restored</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ruts filled, grass seeded, property cleaned
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
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
                        disabled={workOrder.status !== "InProgress"}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">Equipment cleaned</Typography>
                        <Typography variant="caption" color="text.secondary">
                          All equipment washed and inspected
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
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
                        disabled={workOrder.status !== "InProgress"}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">Customer walkthrough complete</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Customer approved final work and signed off
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </TabPanel>

          {/* Tab 5: Notes & Communication */}
          <TabPanel value={activeTab} index={4}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Project Notes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track important details, customer requests, and field updates
                </Typography>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a new note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={addNote}
                  disabled={!noteText.trim()}
                >
                  Add Note
                </Button>
              </Box>

              {workOrder.notes && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {workOrder.notes}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 6: Photos & Documentation */}
          <TabPanel value={activeTab} index={5}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <CameraAlt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Photo Upload Coming Soon</Typography>
              <Typography variant="body2" color="text.secondary">
                Upload before, during, and after photos to document work
              </Typography>
            </Paper>
          </TabPanel>
        </Paper>
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
                <ListItemText
                  primary={`${emp.firstName} ${emp.lastName}`}
                  secondary={`${emp.primaryTrack}${emp.tier}`}
                />
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
                <ListItemText
                  primary={eq.nickname || `${eq.make} ${eq.model}`}
                  secondary={eq.equipmentCategory}
                />
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
