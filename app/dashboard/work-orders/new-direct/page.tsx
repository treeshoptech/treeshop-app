"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  IconButton,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";

const steps = ["Customer Info", "Line Items", "Contract & Schedule"];

export default function NewDirectWorkOrderPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [createCustomerDialogOpen, setCreateCustomerDialogOpen] = useState(false);

  // Customer data
  const [customerData, setCustomerData] = useState({
    customerId: "" as Id<"customers"> | "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
  });

  // New customer form data
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    notes: "",
  });

  // Line items
  const [lineItems, setLineItems] = useState<
    Array<{
      serviceType: string;
      acreage?: string;
      dbhPackage?: string;
      description?: string;
    }>
  >([{ serviceType: "", acreage: "", dbhPackage: "", description: "" }]);

  // Contract data
  const [contractData, setContractData] = useState({
    contractAmount: "",
    loadoutId: "" as Id<"loadouts"> | "",
    poNumber: "",
    scheduledDate: "",
    specialInstructions: "",
    notes: "",
  });

  // Queries
  const customers = useQuery(api.customers.list);
  const loadouts = useQuery(api.loadouts.list);

  // Mutations
  const createProject = useMutation(api.projects.create);
  const createWorkOrder = useMutation(api.workOrders.create);
  const createCustomer = useMutation(api.customers.create);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { serviceType: "", acreage: "", dbhPackage: "", description: "" },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleCreateCustomer = async () => {
    try {
      const customerId = await createCustomer({
        firstName: newCustomerData.firstName,
        lastName: newCustomerData.lastName,
        email: newCustomerData.email || undefined,
        phone: newCustomerData.phone || undefined,
        propertyAddress: newCustomerData.propertyAddress,
        propertyCity: newCustomerData.propertyCity || undefined,
        propertyState: newCustomerData.propertyState || undefined,
        propertyZip: newCustomerData.propertyZip || undefined,
        notes: newCustomerData.notes || undefined,
      });

      // Set the newly created customer as selected AND auto-populate their address
      setCustomerData({
        customerId,
        propertyAddress: newCustomerData.propertyAddress,
        propertyCity: newCustomerData.propertyCity,
        propertyState: newCustomerData.propertyState,
        propertyZip: newCustomerData.propertyZip,
      });

      // Reset form and close dialog
      setNewCustomerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        propertyAddress: "",
        propertyCity: "",
        propertyState: "",
        propertyZip: "",
        notes: "",
      });
      setCreateCustomerDialogOpen(false);
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer");
    }
  };

  // Handler for when customer is selected from dropdown
  const handleCustomerSelect = (customerId: Id<"customers"> | "") => {
    const customer = customers?.find((c) => c._id === customerId);

    if (customer) {
      // Auto-populate address from selected customer
      setCustomerData({
        customerId,
        propertyAddress: customer.propertyAddress || "",
        propertyCity: customer.propertyCity || "",
        propertyState: customer.propertyState || "",
        propertyZip: customer.propertyZip || "",
      });
    } else {
      // Clear if no customer selected
      setCustomerData({
        customerId: "",
        propertyAddress: "",
        propertyCity: "",
        propertyState: "",
        propertyZip: "",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: Create project and work order
      // This will be implemented after we understand the exact flow you want

      console.log("Customer:", customerData);
      console.log("Line Items:", lineItems);
      console.log("Contract:", contractData);

      alert("Direct Work Order created! (Full implementation pending)");
      router.push("/dashboard/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      alert("Failed to create work order");
    }
  };

  const selectedCustomer = customers?.find((c) => c._id === customerData.customerId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push("/dashboard/work-orders")}
            sx={{ mb: 2 }}
          >
            Back to Work Orders
          </Button>
          <Typography variant="h3" gutterBottom>
            Create Direct Work Order
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quick-start a work order without proposal approval
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Paper sx={{ p: 4 }}>
          {/* STEP 1: Customer Info */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Customer & Property Information</Typography>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setCreateCustomerDialogOpen(true)}
                >
                  New Customer
                </Button>
              </Box>

              <FormControl fullWidth required>
                <InputLabel>Select Customer</InputLabel>
                <Select
                  value={customerData.customerId}
                  label="Select Customer"
                  onChange={(e) => handleCustomerSelect(e.target.value as any)}
                >
                  {customers?.map((customer) => (
                    <MenuItem key={customer._id} value={customer._id}>
                      {customer.name} - {customer.email || customer.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCustomer && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Selected Customer
                    </Typography>
                    <Typography variant="h6">{selectedCustomer.name}</Typography>
                    <Typography variant="body2">{selectedCustomer.email}</Typography>
                    <Typography variant="body2">{selectedCustomer.phone}</Typography>
                  </CardContent>
                </Card>
              )}

              <Divider />

              <Typography variant="h6">Property Address</Typography>

              <TextField
                fullWidth
                required
                label="Street Address"
                value={customerData.propertyAddress}
                onChange={(e) =>
                  setCustomerData({ ...customerData, propertyAddress: e.target.value })
                }
                placeholder="123 Main Street"
              />

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  required
                  label="City"
                  value={customerData.propertyCity}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, propertyCity: e.target.value })
                  }
                />
                <TextField
                  label="State"
                  value={customerData.propertyState}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, propertyState: e.target.value })
                  }
                  sx={{ width: 100 }}
                />
                <TextField
                  label="ZIP"
                  value={customerData.propertyZip}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, propertyZip: e.target.value })
                  }
                  sx={{ width: 150 }}
                />
              </Box>
            </Stack>
          )}

          {/* STEP 2: Line Items */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Service Line Items</Typography>
                <Button startIcon={<AddIcon />} onClick={addLineItem} variant="outlined">
                  Add Line Item
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Add services to track work volume and calculate PPH. These are scored for
                efficiency reporting, not pricing.
              </Typography>

              {lineItems.map((item, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">Line Item {index + 1}</Typography>
                        {lineItems.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeLineItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>

                      <FormControl fullWidth required>
                        <InputLabel>Service Type</InputLabel>
                        <Select
                          value={item.serviceType}
                          label="Service Type"
                          onChange={(e) =>
                            updateLineItem(index, "serviceType", e.target.value)
                          }
                        >
                          <MenuItem value="Forestry Mulching">Forestry Mulching</MenuItem>
                          <MenuItem value="Land Clearing">Land Clearing</MenuItem>
                          <MenuItem value="Stump Grinding">Stump Grinding</MenuItem>
                          <MenuItem value="Tree Removal">Tree Removal</MenuItem>
                          <MenuItem value="Brush Clearing">Brush Clearing</MenuItem>
                          <MenuItem value="Excavation">Excavation</MenuItem>
                        </Select>
                      </FormControl>

                      {item.serviceType === "Forestry Mulching" && (
                        <>
                          <TextField
                            fullWidth
                            label="Acreage"
                            type="number"
                            value={item.acreage}
                            onChange={(e) => updateLineItem(index, "acreage", e.target.value)}
                            inputProps={{ step: "0.1" }}
                          />
                          <FormControl fullWidth>
                            <InputLabel>DBH Package</InputLabel>
                            <Select
                              value={item.dbhPackage}
                              label="DBH Package"
                              onChange={(e) =>
                                updateLineItem(index, "dbhPackage", e.target.value)
                              }
                            >
                              <MenuItem value="4">4" - Small Package</MenuItem>
                              <MenuItem value="6">6" - Medium Package</MenuItem>
                              <MenuItem value="8">8" - Large Package</MenuItem>
                              <MenuItem value="10">10" - Very Large Package</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      )}

                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder="Additional details about this service..."
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          {/* STEP 3: Contract & Schedule */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Typography variant="h5">Contract Details</Typography>

              <TextField
                fullWidth
                required
                label="Total Contract Amount"
                type="number"
                value={contractData.contractAmount}
                onChange={(e) =>
                  setContractData({ ...contractData, contractAmount: e.target.value })
                }
                InputProps={{
                  startAdornment: "$",
                }}
                helperText="Enter the final negotiated price (not calculated from line items)"
              />

              <FormControl fullWidth>
                <InputLabel>Primary Loadout</InputLabel>
                <Select
                  value={contractData.loadoutId}
                  label="Primary Loadout"
                  onChange={(e) =>
                    setContractData({ ...contractData, loadoutId: e.target.value as any })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {loadouts?.map((loadout) => (
                    <MenuItem key={loadout._id} value={loadout._id}>
                      {loadout.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Customer PO Number"
                value={contractData.poNumber}
                onChange={(e) =>
                  setContractData({ ...contractData, poNumber: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Scheduled Start Date"
                type="date"
                value={contractData.scheduledDate}
                onChange={(e) =>
                  setContractData({ ...contractData, scheduledDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={3}
                value={contractData.specialInstructions}
                onChange={(e) =>
                  setContractData({ ...contractData, specialInstructions: e.target.value })
                }
                placeholder="Gate codes, site hazards, access notes..."
              />

              <TextField
                fullWidth
                label="Internal Notes"
                multiline
                rows={3}
                value={contractData.notes}
                onChange={(e) => setContractData({ ...contractData, notes: e.target.value })}
                placeholder="Internal project notes..."
              />
            </Stack>
          )}

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<BackIcon />}>
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ForwardIcon />}
                disabled={
                  (activeStep === 0 &&
                    (!customerData.customerId || !customerData.propertyAddress)) ||
                  (activeStep === 1 &&
                    lineItems.some((item) => !item.serviceType))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!contractData.contractAmount}
              >
                Create Work Order
              </Button>
            )}
          </Box>
        </Paper>
      </Stack>

      {/* Create Customer Dialog */}
      <Dialog
        open={createCustomerDialogOpen}
        onClose={() => setCreateCustomerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={newCustomerData.firstName}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, firstName: e.target.value })}
                  placeholder="John"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={newCustomerData.lastName}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, lastName: e.target.value })}
                  placeholder="Smith"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Property Address (Required)
            </Typography>

            <TextField
              fullWidth
              required
              label="Street Address"
              value={newCustomerData.propertyAddress}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, propertyAddress: e.target.value })}
              placeholder="123 Main Street"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="City"
                  value={newCustomerData.propertyCity}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, propertyCity: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={newCustomerData.propertyState}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, propertyState: e.target.value })}
                  placeholder="FL"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={newCustomerData.propertyZip}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, propertyZip: e.target.value })}
                  placeholder="32168"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={newCustomerData.notes}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, notes: e.target.value })}
              placeholder="Any special notes about this customer..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCustomerDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCustomer}
            variant="contained"
            disabled={
              !newCustomerData.firstName ||
              !newCustomerData.lastName ||
              !newCustomerData.propertyAddress
            }
          >
            Create Customer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
