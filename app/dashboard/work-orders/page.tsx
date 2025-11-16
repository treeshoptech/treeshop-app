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
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  TextField,
  Typography,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "" as Id<"customers"> | "",
    propertyAddress: "",
    contractAmount: "",
    loadoutId: "" as Id<"loadouts"> | "",
    poNumber: "",
    specialInstructions: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<Array<{
    serviceType: string;
    acreage?: number;
    dbhPackage?: number;
    treeShopScore?: number;
  }>>([]);

  // Ensure dev organization exists (for development mode)
  const ensureDevOrg = useMutation(api.organizations.ensureDevOrg);

  useEffect(() => {
    ensureDevOrg()
      .catch((err) => console.error("Failed to ensure dev org:", err));
  }, [ensureDevOrg]);

  // Fetch data
  const allProjects = useQuery(api.projects.list);
  const workOrderProjects = allProjects?.filter((p) => p.status === "Work Order") || [];
  const customers = useQuery(api.customers.list);
  const loadouts = useQuery(api.loadouts.list);

  // Filter by status
  const filteredWorkOrders = statusFilter === "All"
    ? workOrderProjects
    : workOrderProjects.filter((wo) => wo.workOrderStatus === statusFilter);

  // Mutations
  const updateProject = useMutation(api.projects.update);
  const createDirectWorkOrder = useMutation(api.workOrders.createDirect);

  const handleCreateDirectWorkOrder = async () => {
    try {
      const workOrderId = await createDirectWorkOrder({
        customerId: formData.customerId as Id<"customers">,
        projectName: formData.projectName,
        propertyAddress: formData.propertyAddress,
        serviceType: formData.serviceType,
        contractAmount: parseFloat(formData.contractAmount),
        estimatedAcres: formData.estimatedAcres ? parseFloat(formData.estimatedAcres) : undefined,
        loadoutId: formData.loadoutId || undefined,
        poNumber: formData.poNumber || undefined,
        specialInstructions: formData.specialInstructions || undefined,
        notes: formData.notes || undefined,
      });

      // Reset form and close dialog
      setFormData({
        customerId: "",
        projectName: "",
        propertyAddress: "",
        serviceType: "",
        contractAmount: "",
        estimatedAcres: "",
        loadoutId: "",
        poNumber: "",
        specialInstructions: "",
        notes: "",
      });
      setDialogOpen(false);

      // Navigate to the new work order (once detail page exists)
      // router.push(`/dashboard/work-orders/${workOrderId}`);
    } catch (error) {
      console.error("Error creating direct work order:", error);
      alert("Failed to create work order. Please check all required fields.");
    }
  };

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
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => router.push(`/dashboard/work-orders/${workOrder._id}`)}
                        >
                          View
                        </Button>
                        {(!workOrder.workOrderStatus || workOrder.workOrderStatus === "Scheduled") && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<StartIcon />}
                            onClick={() => handleStartWork(workOrder)}
                          >
                            Start Work
                          </Button>
                        )}
                        {workOrder.workOrderStatus === "In Progress" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<StopIcon />}
                            onClick={() => handleCompleteWork(workOrder)}
                          >
                            Complete
                          </Button>
                        )}
                        {workOrder.workOrderStatus === "Completed" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowForwardIcon />}
                            onClick={() => handleConvertToInvoice(workOrder)}
                          >
                            Create Invoice
                          </Button>
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

      {/* New Direct Work Order Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Direct Work Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Customer Selection */}
            <FormControl fullWidth required>
              <InputLabel>Customer</InputLabel>
              <Select
                value={formData.customerId}
                label="Customer"
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value as any })}
              >
                {customers?.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Project Name */}
            <TextField
              fullWidth
              required
              label="Project Name"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g., Land Clearing - Oak Street"
            />

            {/* Property Address */}
            <TextField
              fullWidth
              required
              label="Property Address"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              placeholder="123 Main St, City, State ZIP"
            />

            {/* Service Type */}
            <FormControl fullWidth required>
              <InputLabel>Service Type</InputLabel>
              <Select
                value={formData.serviceType}
                label="Service Type"
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <MenuItem value="Forestry Mulching">Forestry Mulching</MenuItem>
                <MenuItem value="Land Clearing">Land Clearing</MenuItem>
                <MenuItem value="Stump Grinding">Stump Grinding</MenuItem>
                <MenuItem value="Tree Removal">Tree Removal</MenuItem>
                <MenuItem value="Brush Clearing">Brush Clearing</MenuItem>
                <MenuItem value="Excavation">Excavation</MenuItem>
              </Select>
            </FormControl>

            {/* Contract Amount */}
            <TextField
              fullWidth
              required
              label="Contract Amount"
              type="number"
              value={formData.contractAmount}
              onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
              InputProps={{
                startAdornment: "$",
              }}
            />

            {/* Estimated Acres */}
            <TextField
              fullWidth
              label="Estimated Acres"
              type="number"
              value={formData.estimatedAcres}
              onChange={(e) => setFormData({ ...formData, estimatedAcres: e.target.value })}
              inputProps={{ step: "0.1" }}
            />

            {/* Loadout Selection */}
            <FormControl fullWidth>
              <InputLabel>Loadout (Optional)</InputLabel>
              <Select
                value={formData.loadoutId}
                label="Loadout (Optional)"
                onChange={(e) => setFormData({ ...formData, loadoutId: e.target.value as any })}
              >
                <MenuItem value="">None</MenuItem>
                {loadouts?.map((loadout) => (
                  <MenuItem key={loadout._id} value={loadout._id}>
                    {loadout.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* PO Number */}
            <TextField
              fullWidth
              label="PO Number"
              value={formData.poNumber}
              onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
              placeholder="Customer PO or reference number"
            />

            {/* Special Instructions */}
            <TextField
              fullWidth
              label="Special Instructions"
              multiline
              rows={2}
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              placeholder="Gate codes, hazards, special requirements..."
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="Internal Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes about this work order..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateDirectWorkOrder}
            variant="contained"
            disabled={
              !formData.customerId ||
              !formData.projectName ||
              !formData.propertyAddress ||
              !formData.serviceType ||
              !formData.contractAmount
            }
          >
            Create Work Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
