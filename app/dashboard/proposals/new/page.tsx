"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
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
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import {
  StumpGrindingCalculator,
  MulchingCalculator,
  LandClearingCalculator,
} from "@/app/components/calculators";
import { Id } from "@/convex/_generated/dataModel";

// Inner component that uses useSearchParams
function NewProposalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [leadId, setLeadId] = useState<Id<"projects"> | null>(null);

  // Proposal data
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | "">("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [notes, setNotes] = useState("");
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // Expanded sections
  const [customerExpanded, setCustomerExpanded] = useState(true);
  const [scopeExpanded, setScopeExpanded] = useState(false);
  const [lineItemsExpanded, setLineItemsExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [sitePlansExpanded, setSitePlansExpanded] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);

  // Active service calculator
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  // New customer form
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  // Pre-fill form from URL parameters (from lead)
  useEffect(() => {
    const name = searchParams.get("customerName");
    const email = searchParams.get("customerEmail");
    const phone = searchParams.get("customerPhone");
    const address = searchParams.get("propertyAddress");
    const id = searchParams.get("leadId");

    if (address) setScopeOfWork(`Work to be performed at: ${address}`);
    if (id) setLeadId(id as Id<"projects">);

    // Auto-fill new customer form if coming from lead
    if (name) {
      setNewCustomerName(name);
      setNewCustomerEmail(email || "");
      setNewCustomerPhone(phone || "");
      setNewCustomerAddress(address || "");
      // Auto-open customer dialog
      setShowNewCustomerDialog(true);
    }
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
    // Close calculator and return to accordion
    setActiveCalculator(null);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleCreateCustomer = async () => {
    try {
      // Split name into first and last
      const nameParts = newCustomerName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const customerId = await createCustomer({
        firstName,
        lastName,
        email: newCustomerEmail || undefined,
        phone: newCustomerPhone || undefined,
        propertyAddress: newCustomerAddress,
      });
      setSelectedCustomerId(customerId);
      setShowNewCustomerDialog(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
      // Expand line items section after customer is created
      setCustomerExpanded(false);
      setLineItemsExpanded(true);
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

  // Auto-aggregate unique terms from all line items
  const aggregatedTerms = useMemo(() => {
    const allTerms = lineItems.flatMap(item => item.termsAndConditions || []);
    return [...new Set(allTerms)]; // Remove duplicates
  }, [lineItems]);

  const SectionHeader = ({ title, expanded, onToggle }: any) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
      }}
      onClick={onToggle}
    >
      <Typography variant="h6">{title}</Typography>
      <ExpandMoreIcon
        sx={{
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s",
        }}
      />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => router.push("/proposals")}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">New Proposal</Typography>
          </Box>
        </Box>

        {/* 1. Customer Information */}
        <Paper>
          <SectionHeader
            title="1. Customer Information"
            expanded={customerExpanded}
            onToggle={() => setCustomerExpanded(!customerExpanded)}
          />
          <Collapse in={customerExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControl fullWidth required sx={{ mr: 2 }}>
                    <InputLabel>Select Customer</InputLabel>
                    <Select
                      value={selectedCustomerId}
                      label="Select Customer"
                      onChange={(e) => setSelectedCustomerId(e.target.value as Id<"customers">)}
                    >
                      {customers?.map((customer) => (
                        <MenuItem key={customer._id} value={customer._id}>
                          {customer.firstName} {customer.lastName} {customer.propertyAddress && `- ${customer.propertyAddress}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    startIcon={<PersonAddIcon />}
                    onClick={() => setShowNewCustomerDialog(true)}
                    variant="outlined"
                  >
                    New Customer
                  </Button>
                </Box>

                {selectedCustomer && (
                  <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                    <Typography variant="body2"><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</Typography>
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
            </Box>
          </Collapse>
        </Paper>

        {/* 2. Scope of Work */}
        <Paper>
          <SectionHeader
            title="2. Scope of Work"
            expanded={scopeExpanded}
            onToggle={() => setScopeExpanded(!scopeExpanded)}
          />
          <Collapse in={scopeExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                placeholder="Describe the work to be performed..."
              />
            </Box>
          </Collapse>
        </Paper>

        {/* 3. Service Line Items */}
        <Paper>
          <SectionHeader
            title="3. Service Line Items"
            expanded={lineItemsExpanded}
            onToggle={() => setLineItemsExpanded(!lineItemsExpanded)}
          />
          <Collapse in={lineItemsExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              {/* Added Line Items */}
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
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
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
                  <Box sx={{ p: 2, bgcolor: "primary.dark", borderRadius: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h4">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(totalValue)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Service Selection Buttons */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Add Service
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => setActiveCalculator("Stump Grinding")}
                  size="large"
                >
                  Stump Grinding
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveCalculator("Forestry Mulching")}
                  size="large"
                >
                  Forestry Mulching
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveCalculator("Land Clearing")}
                  size="large"
                >
                  Land Clearing
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        {/* 4. Notes */}
        <Paper>
          <SectionHeader
            title="4. Notes (Internal - for crew)"
            expanded={notesExpanded}
            onToggle={() => setNotesExpanded(!notesExpanded)}
          />
          <Collapse in={notesExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes for the crew delivering and completing this work..."
              />
            </Box>
          </Collapse>
        </Paper>

        {/* 5. Terms & Conditions */}
        <Paper>
          <SectionHeader
            title="5. Terms & Conditions"
            expanded={termsExpanded}
            onToggle={() => setTermsExpanded(!termsExpanded)}
          />
          <Collapse in={termsExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              <Stack spacing={2}>
                {aggregatedTerms.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Service-Specific Terms</Typography>
                    {aggregatedTerms.map((term, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {term}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Environmental Responsibility</Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Tree Shop is committed to environmental stewardship and will not impact federally protected wetlands
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Payment Terms</Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 25% deposit required to secure scheduling<br />
                    • Remaining balance due upon completion<br />
                    • 3% daily fee applies to late payments
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        {/* 6. Site Plans */}
        <Paper>
          <SectionHeader
            title="6. Site Plans & Maps"
            expanded={sitePlansExpanded}
            onToggle={() => setSitePlansExpanded(!sitePlansExpanded)}
          />
          <Collapse in={sitePlansExpanded}>
            <Box sx={{ p: 3, pt: 0, textAlign: "center" }}>
              <Typography variant="h6" color="primary" gutterBottom>
                🗺️ Coming Soon!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Satellite maps with work area drawings and project details will be available here.
              </Typography>
            </Box>
          </Collapse>
        </Paper>

        {/* 7. Status & Actions */}
        <Paper>
          <SectionHeader
            title="7. Status & Actions"
            expanded={statusExpanded}
            onToggle={() => setStatusExpanded(!statusExpanded)}
          />
          <Collapse in={statusExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Save this proposal as a draft or send it to the customer for review.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleSaveProposal}
                    size="large"
                    fullWidth
                    disabled={!selectedCustomerId || lineItems.length === 0}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSaveProposal}
                    size="large"
                    fullWidth
                    disabled={!selectedCustomerId || lineItems.length === 0}
                  >
                    Save & Send
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Paper>
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

      {/* Calculator Dialogs */}
      <Dialog
        open={activeCalculator === "Stump Grinding"}
        onClose={() => setActiveCalculator(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Stump Grinding Calculator</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <StumpGrindingCalculator
              loadout={loadouts?.[0]}
              onLineItemCreate={handleLineItemCreate}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeCalculator === "Forestry Mulching"}
        onClose={() => setActiveCalculator(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Forestry Mulching Calculator</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <MulchingCalculator
              loadout={loadouts?.[0]}
              loadouts={loadouts}
              onLineItemCreate={handleLineItemCreate}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeCalculator === "Land Clearing"}
        onClose={() => setActiveCalculator(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Land Clearing Calculator</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <LandClearingCalculator
              loadout={loadouts?.[0]}
              onLineItemCreate={handleLineItemCreate}
            />
          </Box>
        </DialogContent>
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
