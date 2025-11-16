"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
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

const steps = ["Customer Info", "Add Line Items", "Review & Save"];

// Custom Line Item Form Component
function CustomLineItemForm({ onLineItemCreate }: { onLineItemCreate: (data: any) => void }) {
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState(1);
  const [pricePerHour, setPricePerHour] = useState(500);

  const handleCreate = () => {
    const totalPrice = hours * pricePerHour;
    const totalCost = totalPrice * 0.5; // Assume 50% margin for custom items

    onLineItemCreate({
      serviceType: "Custom",
      description: description || "Custom line item",
      formulaUsed: "Manual Entry",
      workVolumeInputs: {},
      baseScore: 0,
      complexityMultiplier: 1,
      adjustedScore: 0,
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
  const [activeStep, setActiveStep] = useState(0);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [showServiceCatalog, setShowServiceCatalog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [leadId, setLeadId] = useState<Id<"projects"> | null>(null);

  // Form data
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-fill form from URL parameters (from lead)
  useEffect(() => {
    const name = searchParams.get("customerName");
    const email = searchParams.get("customerEmail");
    const phone = searchParams.get("customerPhone");
    const address = searchParams.get("propertyAddress");
    const id = searchParams.get("leadId");

    if (name) setCustomerName(name);
    if (email) setCustomerEmail(email);
    if (phone) setCustomerPhone(phone);
    if (address) setPropertyAddress(address);
    if (id) setLeadId(id as Id<"projects">);
  }, [searchParams]);

  // Fetch loadouts for calculators
  const loadouts = useQuery(api.loadouts.list);

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const createLineItem = useMutation(api.lineItems.create);

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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSaveProposal = async () => {
    try {
      let projectId: Id<"projects">;

      // If converting from lead, update the existing project
      if (leadId) {
        await updateProject({
          id: leadId,
          status: "Proposal",
          proposalStatus: "Draft",
          estimatedValue: lineItems.reduce((sum, item) => sum + item.totalPrice, 0),
        });
        projectId = leadId;
      } else {
        // Create new project
        projectId = await createProject({
          name: `${customerName} - Proposal`,
          customerName,
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
          propertyAddress,
          serviceType: lineItems[0]?.serviceType || "Stump Grinding",
          status: "Proposal",
          proposalStatus: "Draft",
          estimatedValue: lineItems.reduce((sum, item) => sum + item.totalPrice, 0),
          notes: notes || undefined,
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
          formulaUsed: item.formulaUsed,
          workVolumeInputs: item.workVolumeInputs,
          baseScore: item.baseScore,
          complexityMultiplier: item.complexityMultiplier,
          adjustedScore: item.adjustedScore,
          loadoutId: item.loadoutId,
          loadoutName: item.loadoutName,
          productionRatePPH: item.productionRatePPH,
          costPerHour: item.costPerHour,
          billingRatePerHour: item.billingRatePerHour,
          targetMargin: item.targetMargin,
          productionHours: item.productionHours,
          transportHours: item.transportHours,
          bufferHours: item.bufferHours,
          totalEstimatedHours: item.totalEstimatedHours,
          pricingMethod: item.pricingMethod,
          totalCost: item.totalCost,
          totalPrice: item.totalPrice,
          profit: item.profit,
          marginPercent: item.marginPercent,
        });
      }

      router.push("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  const totalValue = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCost = lineItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalProfit = lineItems.reduce((sum, item) => sum + item.profit, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.push("/proposals")}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h3">New Proposal</Typography>
            <Typography variant="body1" color="text.secondary">
              Build a detailed proposal with line item pricing
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        {activeStep === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Customer Information
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
              />
              <TextField
                label="Property Address"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                fullWidth
                required
                multiline
                rows={2}
              />
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!customerName || !propertyAddress}
              >
                Next
              </Button>
            </Box>
          </Paper>
        )}

        {activeStep === 1 && (
          <Stack spacing={3}>
            {/* Line Items List */}
            {lineItems.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Line Items
                </Typography>
                <Stack spacing={2}>
                  {lineItems.map((item, index) => (
                    <Card key={item.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="h6">
                                {index + 1}. {item.serviceType}
                              </Typography>
                              {item.baseScore && (
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
              </Paper>
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

            {/* Service Catalog Modal */}
            {showServiceCatalog && (
              <Paper sx={{ p: 3 }}>
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
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover", borderStyle: "dashed" } }}
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
              </Paper>
            )}

            {/* Calculator Form */}
            {showCalculator && selectedService && (
              <Paper sx={{ p: 3 }}>
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

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={lineItems.length === 0}
              >
                Next
              </Button>
            </Box>
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack spacing={3}>
            {/* Summary */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Proposal Summary
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="h6">{customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Property Address
                  </Typography>
                  <Typography>{propertyAddress}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Line Items
                  </Typography>
                  <Typography variant="h6">{lineItems.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost
                  </Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalCost)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Price
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalValue)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Profit
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalProfit)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProposal}
                size="large"
              >
                Save Proposal
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
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
