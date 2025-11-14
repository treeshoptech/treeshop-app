"use client";

import { Suspense, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  LibraryBooks as LibraryIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  StumpGrindingCalculator,
  MulchingCalculator,
  LandClearingCalculator,
  TreeRemovalCalculator,
  TreeTrimmingCalculator,
} from "@/app/components/calculators";

type ServiceType = "Stump Grinding" | "Forestry Mulching" | "Land Clearing" | "Tree Removal" | "Tree Trimming";

const steps = ["Customer Info", "Add Line Items", "Review & Save"];

function NewProposalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const [activeStep, setActiveStep] = useState(0);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>("Stump Grinding");
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Form data
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch lead data if leadId is provided
  const allProjects = useQuery(api.projects.list);
  const leadData = leadId ? allProjects?.find(p => p._id === leadId as Id<"projects">) : null;

  // Pre-fill form data from lead
  useEffect(() => {
    if (leadData) {
      setCustomerName(leadData.customerName || "");
      setCustomerEmail(leadData.customerEmail || "");
      setCustomerPhone(leadData.customerPhone || "");
      setPropertyAddress(leadData.propertyAddress || "");
      setNotes(leadData.notes || "");
    }
  }, [leadData]);

  // Fetch loadouts for calculators
  const loadouts = useQuery(api.loadouts.list);

  // Fetch line item templates
  const lineItemTemplates = useQuery(api.lineItemTemplates.list);

  // Mutations
  const createProject = useMutation(api.projects.create);
  const createLineItem = useMutation(api.lineItems.create);
  const incrementTemplateUsage = useMutation(api.lineItemTemplates.incrementUsage);

  const handleLineItemCreate = (lineItemData: any) => {
    setLineItems([...lineItems, { ...lineItemData, id: crypto.randomUUID() }]);
    setShowCalculator(false);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleUseTemplate = async (template: any) => {
    // Convert template to line item format
    const lineItem = {
      id: crypto.randomUUID(),
      serviceType: template.serviceType || template.category,
      description: template.description,
      defaultUnit: template.defaultUnit,
      defaultUnitPrice: template.defaultUnitPrice,
      defaultQuantity: template.defaultQuantity || 1,
      totalPrice: template.defaultUnitPrice * (template.defaultQuantity || 1),
      totalCost: (template.costPerUnit || 0) * (template.defaultQuantity || 1),
      profit: (template.defaultUnitPrice - (template.costPerUnit || 0)) * (template.defaultQuantity || 1),
      marginPercent: template.defaultMargin || 0,
      totalEstimatedHours: (template.defaultQuantity || 1) / 1, // Placeholder
      afissFactorIds: template.afissFactorIds || [], // Store factor IDs
    };

    setLineItems([...lineItems, lineItem]);

    // Increment usage count
    if (template._id) {
      await incrementTemplateUsage({ id: template._id });
    }

    setShowTemplateLibrary(false);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSaveProposal = async () => {
    try {
      // Create project
      const projectId = await createProject({
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
          <IconButton onClick={() => router.push("/dashboard/proposals")}>
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
              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Line</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.serviceType}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.totalEstimatedHours.toFixed(1)} hrs</TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(item.totalPrice)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveLineItem(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <Typography variant="h6">Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(totalValue)}
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Add Line Item Section */}
            {!showCalculator ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Add Line Item
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowCalculator(true)}
                    >
                      Open Calculator
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LibraryIcon />}
                      onClick={() => setShowTemplateLibrary(true)}
                    >
                      Use Template
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6">{selectedService} Calculator</Typography>
                  <Button onClick={() => setShowCalculator(false)}>Cancel</Button>
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

      {/* Template Library Dialog */}
      <Dialog
        open={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Line Item Template</DialogTitle>
        <DialogContent>
          {lineItemTemplates && lineItemTemplates.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>AFISS</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItemTemplates.map((template) => (
                    <TableRow key={template._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={template.category} size="small" />
                      </TableCell>
                      <TableCell>{template.defaultUnit}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(template.defaultUnitPrice)}
                      </TableCell>
                      <TableCell>
                        {template.afissFactorIds && template.afissFactorIds.length > 0 ? (
                          <Chip
                            label={`${template.afissFactorIds.length} factors`}
                            size="small"
                            color="primary"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No line item templates found.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create templates in Settings → Line Items Library
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateLibrary(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    }>
      <NewProposalContent />
    </Suspense>
  );
}
