"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
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
  Grid,
  Tabs,
  Tab,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  ContactMail as ContactMailIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  LocalOffer as TagIcon,
  Note as NoteIcon,
  Yard as ForestIcon,
  BubbleChart as StumpIcon,
  Landscape as LandIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import {
  StumpGrindingCalculator,
  MulchingCalculator,
  LandClearingCalculator,
} from "@/app/components/calculators";
import { Id } from "@/convex/_generated/dataModel";

const CUSTOMER_SOURCES = ['Referral', 'Website', 'Google Search', 'Social Media', 'Repeat Customer', 'Door Hanger', 'Yard Sign', 'Vehicle Wrap', 'Other'];
const CUSTOMER_TYPES = ['Residential', 'Commercial', 'Municipal', 'HOA', 'Property Management', 'Real Estate'];
const CONTACT_METHODS = ['Phone', 'Email', 'Text', 'Any'];
const AVAILABLE_TAGS = ['VIP', 'Repeat Customer', 'High Value', 'Quick Pay', 'Difficult Access', 'Gated Community', 'Large Property', 'Preferred'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Inner component that uses useSearchParams
function NewProposalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [leadId, setLeadId] = useState<Id<"projects"> | null>(null);
  const customerCreatedRef = useRef(false);

  // Proposal data
  const [selectedLeadId, setSelectedLeadId] = useState<Id<"projects"> | "">("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | "">("");
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<Id<"loadouts"> | "">("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [notes, setNotes] = useState("");
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateCustomers, setDuplicateCustomers] = useState<any[]>([]);
  const [leadToConvert, setLeadToConvert] = useState<any>(null);

  // Expanded sections
  const [customerExpanded, setCustomerExpanded] = useState(true);
  const [loadoutExpanded, setLoadoutExpanded] = useState(false);
  const [lineItemsExpanded, setLineItemsExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [sitePlansExpanded, setSitePlansExpanded] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);

  // Active service calculator
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  // New customer form - matches customers page
  const [formTab, setFormTab] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', secondaryPhone: '', company: '',
    propertyAddress: '', propertyCity: '', propertyState: 'FL', propertyZip: '',
    billingAddress: '', billingCity: '', billingState: 'FL', billingZip: '',
    source: 'Website', referredBy: '', customerType: 'Residential', preferredContactMethod: 'Phone',
    tags: [] as string[], notes: '',
  });

  // Fetch data FIRST
  const loadouts = useQuery(api.loadouts.list);
  const customers = useQuery(api.customers.list);
  const leads = useQuery(api.projects.list, { status: "Lead" });

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const createLineItem = useMutation(api.lineItems.create);
  const createCustomer = useMutation(api.customers.create);

  // Handle lead selection
  const handleLeadSelect = (leadIdValue: Id<"projects"> | "") => {
    setSelectedLeadId(leadIdValue);

    if (!leadIdValue) return;

    const lead = leads?.find(l => l._id === leadIdValue);
    if (!lead) return;

    setLeadId(leadIdValue);

    // Auto-fill from lead data
    if (lead.customerId) {
      setSelectedCustomerId(lead.customerId);
    }
    if (lead.propertyAddress) {
      setScopeOfWork(`Work to be performed at: ${lead.propertyAddress}`);
    }

    // Collapse customer section, expand line items
    setCustomerExpanded(false);
    setLineItemsExpanded(true);
  };

  const handleLineItemCreate = (lineItemData: any) => {
    setLineItems([...lineItems, { ...lineItemData, id: crypto.randomUUID() }]);
    // Close calculator and return to accordion
    setActiveCalculator(null);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleCreateCustomer = async () => {
    if (!formData.firstName || !formData.lastName || !formData.propertyAddress) {
      alert('Please fill in required fields (First Name, Last Name, Property Address)');
      return;
    }

    try {
      const customerId = await createCustomer(formData);
      setSelectedCustomerId(customerId);
      setShowNewCustomerDialog(false);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', secondaryPhone: '', company: '',
        propertyAddress: '', propertyCity: '', propertyState: 'FL', propertyZip: '',
        billingAddress: '', billingCity: '', billingState: 'FL', billingZip: '',
        source: 'Website', referredBy: '', customerType: 'Residential', preferredContactMethod: 'Phone',
        tags: [], notes: '',
      });
      // Expand line items section after customer is created
      setCustomerExpanded(false);
      setLineItemsExpanded(true);
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const handleSaveProposal = async () => {
    console.log("🔍 handleSaveProposal called");
    console.log("🔍 selectedCustomerId:", selectedCustomerId);
    console.log("🔍 leadId:", leadId);
    console.log("🔍 lineItems.length:", lineItems.length);

    if ((!selectedCustomerId && !leadId) || lineItems.length === 0) {
      console.log("❌ Validation failed");
      alert("Please select a customer or lead and add at least one line item");
      return;
    }

    console.log("✅ Validation passed, proceeding to save");
    try {
      let projectId: Id<"projects">;
      let customerId: Id<"customers"> | undefined;

      const selectedCustomer = customers?.find((c) => c._id === selectedCustomerId);

      // If converting from lead, check for duplicate customers first
      if (leadId) {
        const lead = leads?.find(l => l._id === leadId);

        // Check if lead already has a customer linked
        if (lead?.customerId) {
          customerId = lead.customerId;
        } else if (lead) {
          // Search for potential duplicate customers by email or phone
          const potentialDuplicates = customers?.filter(c =>
            (lead.customerEmail && c.email === lead.customerEmail) ||
            (lead.customerPhone && c.phone === lead.customerPhone)
          ) || [];

          if (potentialDuplicates.length > 0) {
            // Found potential duplicates - show dialog
            setDuplicateCustomers(potentialDuplicates);
            setLeadToConvert(lead);
            setShowDuplicateDialog(true);
            return; // Exit here, user will choose what to do
          } else {
            // No duplicates found, create new customer from lead
            customerId = await createCustomer({
              name: lead.customerName || "",
              email: lead.customerEmail || "",
              phone: lead.customerPhone || "",
              propertyAddress: lead.propertyAddress || "",
              source: lead.leadSource || "Lead",
              customerType: "Residential",
              preferredContactMethod: "Phone",
            });
          }
        }

        // Update the project with customer ID and change status to Proposal
        await updateProject({
          id: leadId,
          customerId,
          status: "Proposal",
          proposalStatus: "Draft",
          estimatedValue: totalInvestment,
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
          estimatedValue: totalInvestment,
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

  // Calculate proposal-level totals
  const lineItemsTotal = lineItems.reduce((sum, item) => sum + (item.lineItemPrice || item.totalPrice || 0), 0);
  const totalWorkHours = lineItems.reduce((sum, item) => sum + (item.totalWorkHours || item.totalEstimatedHours || 0), 0);

  // Transport calculated ONCE for entire project (30 min default drive time, 0.5 rate)
  const driveTimeMinutes = 30; // TODO: Get from customer address
  const transportHours = (driveTimeMinutes / 60 * 2) * 0.5;
  const avgBillingRate = lineItemsTotal / (totalWorkHours || 1); // Avoid division by zero
  const transportCost = transportHours * avgBillingRate;

  // Buffer calculated ONCE for entire project (10% of work + transport)
  const bufferHours = (totalWorkHours + transportHours) * 0.10;
  const bufferCost = bufferHours * avgBillingRate;

  // Total Investment = Line Items + Transport + Buffer
  const totalInvestment = lineItemsTotal + transportCost + bufferCost;

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
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
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
              <Stack spacing={3}>
                {/* Lead Selection (Optional) */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                    Convert from Lead (Optional)
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Select Lead</InputLabel>
                    <Select
                      value={selectedLeadId}
                      label="Select Lead"
                      onChange={(e) => handleLeadSelect(e.target.value as Id<"projects"> | "")}
                    >
                      <MenuItem value="">
                        <em>None - Start Fresh</em>
                      </MenuItem>
                      {leads?.map((lead) => (
                        <MenuItem key={lead._id} value={lead._id}>
                          {lead.customerName || 'Unknown'} - {lead.propertyAddress || 'No address'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Selecting a lead will auto-fill customer and property information
                  </Typography>
                </Box>

                <Divider />

                {/* Customer Selection */}
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

        {/* 2. Loadout Selection */}
        <Paper>
          <SectionHeader
            title="2. Loadout Selection"
            expanded={loadoutExpanded}
            onToggle={() => setLoadoutExpanded(!loadoutExpanded)}
          />
          <Collapse in={loadoutExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Select Equipment Loadout
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Loadout</InputLabel>
                <Select
                  value={selectedLoadoutId}
                  label="Loadout"
                  onChange={(e) => {
                    setSelectedLoadoutId(e.target.value as Id<"loadouts">);
                    setLoadoutExpanded(false);
                    setLineItemsExpanded(true);
                  }}
                >
                  {loadouts?.map((loadout) => (
                    <MenuItem key={loadout._id} value={loadout._id}>
                      {loadout.name} - {loadout.productionRate || 0} PpH @ ${(loadout.totalCostPerHour || 0).toFixed(2)}/hr
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedLoadoutId && loadouts && (
                <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, mt: 2 }}>
                  {(() => {
                    const selectedLoadout = loadouts.find(l => l._id === selectedLoadoutId);
                    return selectedLoadout ? (
                      <>
                        <Typography variant="body2"><strong>Production Rate:</strong> {selectedLoadout.productionRate || 0} points per hour</Typography>
                        <Typography variant="body2"><strong>Cost Per Hour:</strong> ${(selectedLoadout.totalCostPerHour || 0).toFixed(2)}</Typography>
                        <Typography variant="body2"><strong>Billing Rates:</strong> ${(selectedLoadout.billingRates?.margin50 || 0).toFixed(2)}/hr (50% margin)</Typography>
                      </>
                    ) : null;
                  })()}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                The selected loadout determines available services and pricing rates for this proposal.
              </Typography>
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
                  {lineItems.map((item, index) => {
                    const scoreName = item.serviceType === 'Stump Grinding'
                      ? 'StumpScore'
                      : item.serviceType === 'Forestry Mulching'
                        ? 'Mulching Score'
                        : 'Score';
                    const scoreValue = item.baseScore || 0;

                    return (
                      <Paper
                        key={item.id}
                        elevation={2}
                        sx={{
                          bgcolor: '#2C2C2E',
                          border: '1px solid #3C3C3E',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#00D26A', mb: 0.5 }}>
                                {item.serviceType}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveLineItem(item.id)}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid #3C3C3E'
                          }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Work Volume
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: '#00D26A' }}>
                                {scoreValue.toFixed(1)} {scoreName}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Work Hours
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {(item.totalWorkHours || item.totalEstimatedHours) && !isNaN(item.totalWorkHours || item.totalEstimatedHours) ? (item.totalWorkHours || item.totalEstimatedHours).toFixed(1) : '0.0'} hrs
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}

                  {/* Total Investment - Only place price is shown */}
                  <Paper
                    elevation={4}
                    sx={{
                      bgcolor: 'primary.dark',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          TOTAL INVESTMENT
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lineItems.length} service{lineItems.length !== 1 ? 's' : ''} • {totalWorkHours.toFixed(1)} work hrs • {transportHours.toFixed(1)} transport • {bufferHours.toFixed(1)} buffer
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#00D26A' }}>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(totalInvestment)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #3C3C3E' }}>
                      <Typography variant="body2" color="text.secondary">Services Total:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(lineItemsTotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Transport & Buffer:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(transportCost + bufferCost)}</Typography>
                    </Box>
                  </Paper>
                </Stack>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Service Selection - Card Style */}
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, color: 'text.secondary' }}>
                SELECT SERVICE TYPE
              </Typography>
              <Stack spacing={2}>
                {/* Forestry Mulching */}
                <Paper
                  onClick={() => setActiveCalculator("Forestry Mulching")}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: '#2C2C2E',
                    border: '1px solid #3C3C3E',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#3C3C3E',
                      borderColor: '#00D26A',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: '#1e4620',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ForestIcon sx={{ fontSize: 32, color: '#00D26A' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#00D26A', mb: 0.5 }}>
                        Forestry Mulching
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clear vegetation by acreage and DBH
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                </Paper>

                {/* Stump Grinding */}
                <Paper
                  onClick={() => setActiveCalculator("Stump Grinding")}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: '#2C2C2E',
                    border: '1px solid #3C3C3E',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#3C3C3E',
                      borderColor: '#00D26A',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: '#3d2d1f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <StumpIcon sx={{ fontSize: 32, color: '#ff9500' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#00D26A', mb: 0.5 }}>
                        Stump Grinding
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Grind stumps with diameter and depth
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                </Paper>

                {/* Land Clearing */}
                <Paper
                  onClick={() => setActiveCalculator("Land Clearing")}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: '#2C2C2E',
                    border: '1px solid #3C3C3E',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#3C3C3E',
                      borderColor: '#00D26A',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: '#3a2f24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <LandIcon sx={{ fontSize: 32, color: '#8e7654' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#00D26A', mb: 0.5 }}>
                        Land Clearing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clear lots by project type and intensity
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                </Paper>
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
                  Save this proposal or send it to the customer.
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      alert(`TEST: Customer=${selectedCustomerId}, Lead=${leadId}, Items=${lineItems.length}`);
                      handleSaveProposal();
                    }}
                    size="large"
                    fullWidth
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSaveProposal}
                    size="large"
                    fullWidth
                    disabled={(!selectedCustomerId && !leadId) || lineItems.length === 0}
                  >
                    Save & Send
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => {
                      alert("Export clicked!");
                    }}
                  >
                    Export
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Paper>
      </Stack>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onClose={() => setShowNewCustomerDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E' } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add New Customer
            </Typography>
            <IconButton onClick={() => setShowNewCustomerDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Tabs value={formTab} onChange={(_, v) => setFormTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab label="Basic Info" />
          <Tab label="Addresses" />
          <Tab label="Details" />
        </Tabs>
        <DialogContent>
          <TabPanel value={formTab} index={0}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ContactMailIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Contact</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Secondary Phone" value={formData.secondaryPhone} onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })} /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={1}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Property Address</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Property Address"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    fullWidth
                    required
                    placeholder="123 Main St"
                  />
                </Grid>
                <Grid item xs={5}><TextField fullWidth label="City" value={formData.propertyCity} onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="State" value={formData.propertyState} onChange={(e) => setFormData({ ...formData, propertyState: e.target.value })} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="ZIP" value={formData.propertyZip} onChange={(e) => setFormData({ ...formData, propertyZip: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Billing Address</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>(if different)</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Street Address" value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} /></Grid>
                <Grid item xs={5}><TextField fullWidth label="City" value={formData.billingCity} onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="State" value={formData.billingState} onChange={(e) => setFormData({ ...formData, billingState: e.target.value })} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="ZIP" value={formData.billingZip} onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })} /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={2}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Customer Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Customer Type</InputLabel>
                    <Select value={formData.customerType} label="Customer Type" onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}>
                      {CUSTOMER_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Source</InputLabel>
                    <Select value={formData.source} label="Source" onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                      {CUSTOMER_SOURCES.map(source => <MenuItem key={source} value={source}>{source}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Contact Method</InputLabel>
                    <Select value={formData.preferredContactMethod} label="Preferred Contact Method" onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}>
                      {CONTACT_METHODS.map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}><TextField fullWidth label="Referred By" value={formData.referredBy} onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TagIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Tags</Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Select Tags</InputLabel>
                <Select
                  multiple
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                  input={<OutlinedInput label="Select Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (<Chip key={value} label={value} size="small" />))}
                    </Box>
                  )}
                >
                  {AVAILABLE_TAGS.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      <Checkbox checked={formData.tags.indexOf(tag) > -1} />
                      <ListItemText primary={tag} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NoteIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Notes</Typography>
              </Box>
              <TextField fullWidth multiline rows={4} label="Customer Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any notes about this customer..." />
            </Paper>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowNewCustomerDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCustomer} variant="contained" disabled={!formData.firstName || !formData.lastName || !formData.propertyAddress}>
            Add Customer
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
              loadout={loadouts?.find(l => l._id === selectedLoadoutId)}
              loadouts={loadouts}
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
              loadout={loadouts?.find(l => l._id === selectedLoadoutId)}
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
              loadout={loadouts?.find(l => l._id === selectedLoadoutId)}
              loadouts={loadouts}
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
