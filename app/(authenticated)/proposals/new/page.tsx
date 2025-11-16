"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import {
  StumpGrindingCalculator,
  MulchingCalculator,
  LandClearingCalculator,
  TreeRemovalCalculator,
  TreeTrimmingCalculator,
} from "@/app/components/calculators";
import { Id } from "@/convex/_generated/dataModel";

type ServiceType = "Stump Grinding" | "Forestry Mulching" | "Land Clearing" | "Tree Removal" | "Tree Trimming" | "Custom";

// Custom Line Item Form Component
function CustomLineItemForm({ onLineItemCreate }: { onLineItemCreate: (data: any) => void }) {
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState(1);
  const [pricePerHour, setPricePerHour] = useState(500);

  const handleCreate = () => {
    const totalPrice = hours * pricePerHour;
    const totalCost = totalPrice * 0.5;

    onLineItemCreate({
      serviceType: "Custom",
      description: description || "Custom line item",
      formulaUsed: "Manual Entry",
      workVolumeInputs: {},
      baseScore: 0,
      afissFactors: [],
      loadoutId: undefined,
      loadoutName: "Manual Entry",
      productionRatePPH: 0,
      costPerHour: totalCost / hours,
      billingRatePerHour: pricePerHour,
      targetMargin: 50,
      productionHours: hours,
      transportHours: 0,
      bufferHours: 0,
      totalEstimatedHours: hours,
      pricingMethod: "Manual",
      totalCost,
      totalPrice,
      profit: totalPrice - totalCost,
      marginPercent: 50,
    });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Create a custom line item for special services or one-off tasks
      </Typography>
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        required
        multiline
        rows={3}
        placeholder="e.g., Emergency call-out fee, Special equipment rental, Debris hauling"
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Estimated Hours"
            type="number"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
            fullWidth
            InputProps={{ inputProps: { min: 0.5, max: 100, step: 0.5 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price per Hour"
            type="number"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(parseFloat(e.target.value) || 100)}
            fullWidth
            InputProps={{
              startAdornment: "$",
              inputProps: { min: 0, max: 10000, step: 50 },
            }}
          />
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, bgcolor: "background.default" }}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {hours.toFixed(1)} hrs
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Total Price
            </Typography>
            <Typography variant="h6" color="primary">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(hours * pricePerHour)}
            </Typography>
          </Box>
        </Stack>
      </Paper>
      <Button variant="contained" onClick={handleCreate} fullWidth size="large" disabled={!description}>
        Create Line Item
      </Button>
    </Stack>
  );
}

// Inner component that uses useSearchParams
function NewProposalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [showServiceCatalog, setShowServiceCatalog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [leadId, setLeadId] = useState<Id<"projects"> | null>(null);

  // Proposal data
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | "">("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [notes, setNotes] = useState("");
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // Collapsible sections
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [mapsExpanded, setMapsExpanded] = useState(false);

  // New customer form
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  // Pre-fill form from URL parameters (from lead)
  useEffect(() => {
    const name = searchParams.get("customerName");
    const address = searchParams.get("propertyAddress");
    const id = searchParams.get("leadId");

    if (address) setScopeOfWork(`Work to be performed at: ${address}`);
    if (id) setLeadId(id as Id<"projects">);
  }, [searchParams]);

  // Fetch data
  const loadouts = useQuery(api.loadouts.list);
  const customers = useQuery(api.customers.list);

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const createLineItem = useMutation(api.lineItems.create);
  const createCustomer = useMutation(api.customers.create);

  const handleLineItemCreate = (lineItemData: any) => {
    setLineItems([...lineItems, { ...lineItemData, id: crypto.randomUUID() }]);
    setShowCalculator(false);
    setShowServiceCatalog(false);
    setSelectedService(null);
  };

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setShowServiceCatalog(false);
    setShowCalculator(true);
  };

  const handleCancelCalculator = () => {
    setShowCalculator(false);
    setSelectedService(null);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleCreateCustomer = async () => {
    try {
      const customerId = await createCustomer({
        name: newCustomerName,
        email: newCustomerEmail || undefined,
        phone: newCustomerPhone || undefined,
        propertyAddress: newCustomerAddress || undefined,
      });
      setSelectedCustomerId(customerId);
      setShowNewCustomerDialog(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const handleSaveProposal = async () => {
    if (!selectedCustomerId || lineItems.length === 0) {
      alert("Please select a customer and add at least one line item");
      return;
    }

    try {
      let projectId: Id<"projects">;

      const totalValue = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const selectedCustomer = customers?.find((c) => c._id === selectedCustomerId);

      // If converting from lead, update the existing project
      if (leadId) {
        await updateProject({
          id: leadId,
          status: "Proposal",
          proposalStatus: "Draft",
          estimatedValue: totalValue,
        });
        projectId = leadId;
      } else {
        // Create new project
        projectId = await createProject({
          name: `${selectedCustomer?.name} - Proposal`,
          customerId: selectedCustomerId,
          customerName: selectedCustomer?.name || "",
          customerEmail: selectedCustomer?.email,
          customerPhone: selectedCustomer?.phone,
          propertyAddress: selectedCustomer?.propertyAddress || "",
          serviceType: lineItems[0]?.serviceType || "Stump Grinding",
          status: "Proposal",
          proposalStatus: "Draft",
          estimatedValue: totalValue,
          notes: scopeOfWork,
        });
      }

      // Create line items
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        await createLineItem({
          parentDocId: projectId,
          parentDocType: "Proposal",
          lineNumber: i + 1,
          serviceType: item.serviceType,
          description: item.description,
          formulaUsed: item.formulaUsed || "",
          workVolumeInputs: item.workVolumeInputs || {},
          baseScore: item.baseScore || 0,
          loadoutId: item.loadoutId,
          loadoutName: item.loadoutName || "",
          productionRatePPH: item.productionRatePPH || 0,
          costPerHour: item.costPerHour || 0,
          billingRatePerHour: item.billingRatePerHour || 0,
          targetMargin: item.targetMargin || 50,
          productionHours: item.productionHours || 0,
          transportHours: item.transportHours || 0,
          bufferHours: item.bufferHours || 0,
          totalEstimatedHours: item.totalEstimatedHours || 0,
          pricingMethod: item.pricingMethod || "Calculated",
          totalCost: item.totalCost || 0,
          totalPrice: item.totalPrice || 0,
          profit: item.profit || 0,
          marginPercent: item.marginPercent || 0,
        });
      }

      router.push("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  const totalValue = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const selectedCustomer = customers?.find((c) => c._id === selectedCustomerId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.push("/proposals")}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">New Proposal</Typography>
            <Typography variant="body2" color="text.secondary">
              Create a professional proposal for your customer
            </Typography>
          </Box>
        </Box>

        {/* Customer Selection */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Customer Information</Typography>
              <Button
                startIcon={<PersonAddIcon />}
                onClick={() => setShowNewCustomerDialog(true)}
                size="small"
              >
                New Customer
              </Button>
            </Box>
            <FormControl fullWidth required>
              <InputLabel>Select Customer</InputLabel>
              <Select
                value={selectedCustomerId}
                label="Select Customer"
                onChange={(e) => setSelectedCustomerId(e.target.value as Id<"customers">)}
              >
                {customers?.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.name} {customer.propertyAddress && `- ${customer.propertyAddress}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCustomer && (
              <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                <Typography variant="body2"><strong>Name:</strong> {selectedCustomer.name}</Typography>
                {selectedCustomer.email && (
                  <Typography variant="body2"><strong>Email:</strong> {selectedCustomer.email}</Typography>
                )}
                {selectedCustomer.phone && (
                  <Typography variant="body2"><strong>Phone:</strong> {selectedCustomer.phone}</Typography>
                )}
                {selectedCustomer.propertyAddress && (
                  <Typography variant="body2"><strong>Address:</strong> {selectedCustomer.propertyAddress}</Typography>
                )}
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Scope of Work */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scope of Work
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Describe the work to be performed in plain English
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={scopeOfWork}
            onChange={(e) => setScopeOfWork(e.target.value)}
            placeholder="e.g., Forestry Mulch the highlighted area (1.69 Acres) at the 4&quot; DBH Package to open up the land for access and reduce the amount of overgrowth throughout the pasture per the attached site plan."
            sx={{ mt: 2 }}
          />
        </Paper>

        {/* Line Items */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pricing & Services
          </Typography>

          {/* Line Items List */}
          {lineItems.length > 0 && (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {lineItems.map((item, index) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="h6">
                            {index + 1}. {item.serviceType}
                          </Typography>
                          {item.baseScore > 0 && (
                            <Chip
                              label={`${item.baseScore.toFixed(1)} ${item.serviceType === 'Stump Grinding' ? 'StumpScore' : 'Inch-Acres'}`}
                              size="small"
                              color="primary"
                            />
                          )}
                          {item.afissFactors?.length > 0 && (
                            <Chip
                              label={`${item.afissFactors.length} AFISS factors`}
                              size="small"
                              color="warning"
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estimated time: {item.totalEstimatedHours.toFixed(1)} hours
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveLineItem(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          {/* Add Service Item Button */}
          {!showCalculator && !showServiceCatalog && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowServiceCatalog(true)}
              size="large"
              fullWidth
              sx={{ maxWidth: 300 }}
            >
              + Service Item
            </Button>
          )}

          {/* Service Catalog */}
          {showServiceCatalog && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Service to Add
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a service type from the catalog
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleServiceSelect("Stump Grinding")}
                  >
                    <CardContent>
                      <Typography variant="h6">Stump Grinding</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Individual stump removal
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleServiceSelect("Forestry Mulching")}
                  >
                    <CardContent>
                      <Typography variant="h6">Forestry Mulching</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Acreage-based clearing
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleServiceSelect("Land Clearing")}
                  >
                    <CardContent>
                      <Typography variant="h6">Land Clearing</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Heavy equipment work
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleServiceSelect("Tree Removal")}
                  >
                    <CardContent>
                      <Typography variant="h6">Tree Removal</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Full tree takedown
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleServiceSelect("Tree Trimming")}
                  >
                    <CardContent>
                      <Typography variant="h6">Tree Trimming</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pruning & maintenance
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleServiceSelect("Custom")}
                    variant="outlined"
                  >
                    <CardContent>
                      <Typography variant="h6">Custom Line Item</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Manual entry
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button onClick={() => setShowServiceCatalog(false)}>Cancel</Button>
              </Box>
            </Box>
          )}

          {/* Calculator Form */}
          {showCalculator && selectedService && (
            <Paper sx={{ p: 3, bgcolor: "background.default" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">{selectedService} Calculator</Typography>
                <Button onClick={handleCancelCalculator}>Cancel</Button>
              </Box>
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
              {selectedService === "Custom" && (
                <CustomLineItemForm onLineItemCreate={handleLineItemCreate} />
              )}
            </Paper>
          )}

          {/* Total */}
          {lineItems.length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "primary.dark", borderRadius: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Proposal Total (USD)</Typography>
                <Typography variant="h4">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalValue)}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Notes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Additional information for the customer (financing, requirements, etc.)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Prefer to pay over time? We offer 0% APR financing up to 24 months..."
            sx={{ mt: 2 }}
          />
        </Paper>

        {/* Terms (Collapsible) */}
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            onClick={() => setTermsExpanded(!termsExpanded)}
          >
            <Typography variant="h6">Terms & Conditions</Typography>
            <IconButton size="small">
              {termsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={termsExpanded}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Environmental Responsibility</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tree Shop is committed to environmental stewardship and will not impact federally protected wetlands.
                  Any necessary changes to the project scope for environmental reasons will be communicated and approved before proceeding.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Permit Responsibility</Typography>
                <Typography variant="body2" color="text.secondary">
                  The landowner is responsible for obtaining all necessary permits. Tree Shop will adhere to all legal and environmental guidelines during the project.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Change Orders</Typography>
                <Typography variant="body2" color="text.secondary">
                  Unforeseen conditions may necessitate a change in scope or budget. Any adjustments will be managed through formal change orders.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Payment Terms</Typography>
                <Typography variant="body2" color="text.secondary">
                  • A 25% deposit is required to secure scheduling.<br />
                  • The remaining balance is due upon project completion.<br />
                  • A 3% daily fee applies to late payments.<br />
                  • Notify Tree Shop of any underground utilities or hazards before project begins.<br />
                  • Estimates are valid for 60 days from the proposal date.
                </Typography>
              </Box>
            </Stack>
          </Collapse>
        </Paper>

        {/* Maps (Collapsible - Coming Soon) */}
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            onClick={() => setMapsExpanded(!mapsExpanded)}
          >
            <Typography variant="h6">Maps & Site Plans</Typography>
            <IconButton size="small">
              {mapsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={mapsExpanded}>
            <Box sx={{ mt: 2, p: 4, bgcolor: "background.default", borderRadius: 1, textAlign: "center" }}>
              <Typography variant="h6" color="primary" gutterBottom>
                🗺️ Coming Soon!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visual property drawings and site plans will be available here. We're working on integrating interactive maps and measurement tools.
              </Typography>
            </Box>
          </Collapse>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveProposal}
            size="large"
            disabled={!selectedCustomerId || lineItems.length === 0}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSaveProposal}
            size="large"
            disabled={!selectedCustomerId || lineItems.length === 0}
          >
            Save & Send
          </Button>
        </Box>
      </Stack>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onClose={() => setShowNewCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Customer Name"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newCustomerEmail}
              onChange={(e) => setNewCustomerEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Phone"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              fullWidth
            />
            <TextField
              label="Property Address"
              value={newCustomerAddress}
              onChange={(e) => setNewCustomerAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCustomerDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCustomer} variant="contained" disabled={!newCustomerName}>
            Create Customer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Wrapper component with Suspense boundary
export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    }>
      <NewProposalPageContent />
    </Suspense>
  );
}
