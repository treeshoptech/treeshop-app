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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  StumpGrindingCalculator,
  MulchingCalculator,
  LandClearingCalculator,
  TreeRemovalCalculator,
  TreeTrimmingCalculator,
} from "@/app/components/calculators";

type ServiceType = "Stump Grinding" | "Forestry Mulching" | "Land Clearing" | "Tree Removal" | "Tree Trimming";
type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected";

const STATUS_COLORS: Record<ProposalStatus, "default" | "info" | "warning" | "success" | "error"> = {
  "Draft": "default",
  "Sent": "info",
  "Viewed": "warning",
  "Accepted": "success",
  "Rejected": "error",
};

export default function ProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as Id<"projects">;

  const [editMode, setEditMode] = useState(false);
  const [addLineItemMode, setAddLineItemMode] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>("Stump Grinding");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  // Fetch proposal (project)
  const proposal = useQuery(api.projects.get, { id: proposalId });

  // Fetch line items
  const lineItems = useQuery(api.lineItems.listByParent, {
    parentDocId: proposalId,
    parentDocType: "Proposal",
  });

  // Fetch loadouts for calculators
  const loadouts = useQuery(api.loadouts.list);

  // Mutations
  const updateProject = useMutation(api.projects.update);
  const createLineItem = useMutation(api.lineItems.create);
  const updateLineItem = useMutation(api.lineItems.update);
  const removeLineItem = useMutation(api.lineItems.remove);

  // Form state
  const [formData, setFormData] = useState({
    customerName: proposal?.customerName || "",
    customerEmail: proposal?.customerEmail || "",
    customerPhone: proposal?.customerPhone || "",
    propertyAddress: proposal?.propertyAddress || "",
    notes: proposal?.notes || "",
  });

  // Update form when proposal loads
  useState(() => {
    if (proposal) {
      setFormData({
        customerName: proposal.customerName || "",
        customerEmail: proposal.customerEmail || "",
        customerPhone: proposal.customerPhone || "",
        propertyAddress: proposal.propertyAddress || "",
        notes: proposal.notes || "",
      });
    }
  });

  const handleSaveCustomerInfo = async () => {
    try {
      await updateProject({
        id: proposalId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        propertyAddress: formData.propertyAddress,
        notes: formData.notes || undefined,
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating proposal:", error);
    }
  };

  const handleLineItemCreate = async (lineItemData: any) => {
    try {
      const maxLineNumber = lineItems?.reduce((max, item) => Math.max(max, item.lineNumber), 0) || 0;

      await createLineItem({
        parentDocId: proposalId,
        parentDocType: "Proposal",
        lineNumber: maxLineNumber + 1,
        serviceType: lineItemData.serviceType,
        description: lineItemData.description,
        formulaUsed: lineItemData.formulaUsed,
        workVolumeInputs: lineItemData.workVolumeInputs,
        baseScore: lineItemData.baseScore,
        complexityMultiplier: lineItemData.complexityMultiplier,
        adjustedScore: lineItemData.adjustedScore,
        loadoutId: lineItemData.loadoutId,
        loadoutName: lineItemData.loadoutName,
        productionRatePPH: lineItemData.productionRatePPH,
        costPerHour: lineItemData.costPerHour,
        billingRatePerHour: lineItemData.billingRatePerHour,
        targetMargin: lineItemData.targetMargin,
        productionHours: lineItemData.productionHours,
        transportHours: lineItemData.transportHours,
        bufferHours: lineItemData.bufferHours,
        totalEstimatedHours: lineItemData.totalEstimatedHours,
        pricingMethod: lineItemData.pricingMethod,
        totalCost: lineItemData.totalCost,
        totalPrice: lineItemData.totalPrice,
        profit: lineItemData.profit,
        marginPercent: lineItemData.marginPercent,
      });

      setAddLineItemMode(false);
    } catch (error) {
      console.error("Error creating line item:", error);
    }
  };

  const handleRemoveLineItem = async (id: Id<"lineItems">) => {
    if (confirm("Are you sure you want to remove this line item?")) {
      try {
        await removeLineItem({ id });
      } catch (error) {
        console.error("Error removing line item:", error);
      }
    }
  };

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    try {
      await updateProject({
        id: proposalId,
        proposalStatus: newStatus,
      });
      if (newStatus === "Sent") {
        setSendDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleConvertToWorkOrder = async () => {
    try {
      await updateProject({
        id: proposalId,
        status: "Work Order",
        workOrderStatus: "Scheduled",
      });
      router.push("/dashboard/work-orders");
    } catch (error) {
      console.error("Error converting to work order:", error);
    }
  };

  if (!proposal) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const totalValue = lineItems?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
  const totalCost = lineItems?.reduce((sum, item) => sum + item.totalCost, 0) || 0;
  const totalProfit = lineItems?.reduce((sum, item) => sum + item.profit, 0) || 0;
  const totalHours = lineItems?.reduce((sum, item) => sum + item.totalEstimatedHours, 0) || 0;
  const avgMargin = totalValue > 0 ? ((totalProfit / totalValue) * 100) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => router.push("/proposals")}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h3">Proposal Details</Typography>
              <Typography variant="body1" color="text.secondary">
                {proposal.customerName} - {proposal.serviceType}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2}>
            <Chip
              label={proposal.proposalStatus || "Draft"}
              color={STATUS_COLORS[proposal.proposalStatus as ProposalStatus] || "default"}
            />
            {proposal.proposalStatus === "Accepted" && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleConvertToWorkOrder}
              >
                Convert to Work Order
              </Button>
            )}
          </Stack>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Price
                </Typography>
                <Typography variant="h4">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
                <Typography variant="h4" color="text.secondary">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalCost)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Profit
                </Typography>
                <Typography variant="h4" color="success.main">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalProfit)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Avg Margin
                </Typography>
                <Typography variant="h4">{avgMargin.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customer Information */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">Customer Information</Typography>
            {!editMode ? (
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon />
              </IconButton>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button onClick={() => setEditMode(false)} startIcon={<CloseIcon />}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveCustomerInfo} startIcon={<CheckIcon />}>
                  Save
                </Button>
              </Stack>
            )}
          </Box>
          {editMode ? (
            <Stack spacing={2}>
              <TextField
                label="Customer Name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Property Address"
                value={formData.propertyAddress}
                onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Stack>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{proposal.customerName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{proposal.customerEmail || "-"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{proposal.customerPhone || "-"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Property Address
                </Typography>
                <Typography variant="body1">{proposal.propertyAddress}</Typography>
              </Grid>
              {proposal.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">{proposal.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>

        {/* Line Items */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">Line Items</Typography>
            {!addLineItemMode && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddLineItemMode(true)}
              >
                Add Line Item
              </Button>
            )}
          </Box>

          {addLineItemMode ? (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={selectedService}
                    label="Service Type"
                    onChange={(e) => setSelectedService(e.target.value as ServiceType)}
                  >
                    <MenuItem value="Stump Grinding">Stump Grinding</MenuItem>
                    <MenuItem value="Forestry Mulching">Forestry Mulching</MenuItem>
                    <MenuItem value="Land Clearing">Land Clearing</MenuItem>
                    <MenuItem value="Tree Removal">Tree Removal</MenuItem>
                    <MenuItem value="Tree Trimming">Tree Trimming</MenuItem>
                  </Select>
                </FormControl>
                <Button onClick={() => setAddLineItemMode(false)}>Cancel</Button>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              {selectedService === "Stump Grinding" && (
                <StumpGrindingCalculator
                  loadout={loadouts?.[0]}
                  onLineItemCreate={handleLineItemCreate}
                />
              )}
              {selectedService === "Forestry Mulching" && (
                <MulchingCalculator
                  loadout={loadouts?.[0]}
                  onLineItemCreate={handleLineItemCreate}
                />
              )}
              {selectedService === "Land Clearing" && (
                <LandClearingCalculator
                  loadout={loadouts?.[0]}
                  onLineItemCreate={handleLineItemCreate}
                />
              )}
              {selectedService === "Tree Removal" && (
                <TreeRemovalCalculator
                  loadout={loadouts?.[0]}
                  onLineItemCreate={handleLineItemCreate}
                />
              )}
              {selectedService === "Tree Trimming" && (
                <TreeTrimmingCalculator
                  loadout={loadouts?.[0]}
                  onLineItemCreate={handleLineItemCreate}
                />
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Line</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Margin</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!lineItems || lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No line items. Click "Add Line Item" to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {lineItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>{item.lineNumber}</TableCell>
                          <TableCell>{item.serviceType}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.totalEstimatedHours.toFixed(1)} hrs</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(item.totalCost)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(item.totalPrice)}
                          </TableCell>
                          <TableCell>{item.marginPercent.toFixed(1)}%</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveLineItem(item._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="h6">Totals:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6">{totalHours.toFixed(1)} hrs</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(totalCost)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(totalValue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6">{avgMargin.toFixed(1)}%</Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Actions */}
        {!addLineItemMode && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Proposal Actions
            </Typography>
            <Stack direction="row" spacing={2}>
              {proposal.proposalStatus === "Draft" && (
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setSendDialogOpen(true)}
                  disabled={!lineItems || lineItems.length === 0}
                >
                  Send to Customer
                </Button>
              )}
              {proposal.proposalStatus === "Sent" || proposal.proposalStatus === "Viewed" ? (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleStatusChange("Accepted")}
                  >
                    Mark as Accepted
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => handleStatusChange("Rejected")}
                  >
                    Mark as Rejected
                  </Button>
                </>
              ) : null}
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Send Proposal Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Proposal to Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              This will mark the proposal as "Sent" and prepare it for customer review.
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Customer Email
              </Typography>
              <Typography variant="body1">{proposal.customerEmail || "No email provided"}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h5">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalValue)}
              </Typography>
            </Box>
            {!proposal.customerEmail && (
              <Typography variant="body2" color="warning.main">
                Warning: No email address on file. You'll need to send this manually.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleStatusChange("Sent")}
          >
            Mark as Sent
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
