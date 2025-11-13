"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
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
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";

type LeadStatus = "New" | "Contacted" | "Qualified" | "Site Visit Scheduled" | "Lost";

const STATUS_COLORS: Record<LeadStatus, "default" | "info" | "warning" | "success" | "error"> = {
  "New": "info",
  "Contacted": "default",
  "Qualified": "warning",
  "Site Visit Scheduled": "success",
  "Lost": "error",
};

export default function LeadsPage() {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [orgInitialized, setOrgInitialized] = useState(false);

  // Mutations
  const ensureDevOrg = useMutation(api.organizations.ensureDevOrg);

  // Initialize development organization on mount
  useEffect(() => {
    ensureDevOrg()
      .then(() => {
        setOrgInitialized(true);
      })
      .catch(err => {
        console.error("Failed to initialize dev organization:", err);
        // Even if it fails (org already exists), mark as initialized
        setOrgInitialized(true);
      });
  }, [ensureDevOrg]);

  // Fetch projects (leads are projects with status "Lead")
  const allProjects = useQuery(api.projects.list, orgInitialized ? {} : "skip");
  const leads = allProjects?.filter((p) => p.status === "Lead") || [];

  // Filter by status
  const filteredLeads = statusFilter === "All"
    ? leads
    : leads.filter((l) => l.leadStatus === statusFilter);

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);

  // Form state for new lead
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    customerEmail: "",
    customerPhone: "",
    propertyAddress: "",
    parcelId: "",
    latitude: "",
    longitude: "",
    serviceType: "Stump Grinding" as any,
    estimatedValue: "",
    leadSource: "",
    notes: "",
    leadStatus: "New" as LeadStatus,
  });

  const handleAddLead = async () => {
    try {
      const customerName = `${formData.firstName} ${formData.lastName}`.trim();

      await createProject({
        name: `${customerName} - ${formData.serviceType}`,
        customerName: customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone,
        propertyAddress: formData.propertyAddress,
        serviceType: formData.serviceType,
        status: "Lead",
        leadStatus: formData.leadStatus,
        leadSource: formData.leadSource || undefined,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        notes: formData.notes || undefined,
      });

      setAddDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        customerEmail: "",
        customerPhone: "",
        propertyAddress: "",
        parcelId: "",
        latitude: "",
        longitude: "",
        serviceType: "Stump Grinding",
        estimatedValue: "",
        leadSource: "",
        notes: "",
        leadStatus: "New",
      });
      setShowAddressOptions(false);
      setMapCoordinates(null);
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  };

  const handleEditLead = async () => {
    if (!selectedLead) return;

    try {
      await updateProject({
        id: selectedLead._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        propertyAddress: formData.propertyAddress,
        serviceType: formData.serviceType,
        leadStatus: formData.leadStatus,
        leadSource: formData.leadSource || undefined,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        notes: formData.notes || undefined,
      });

      setEditDialogOpen(false);
      setSelectedLead(null);
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const handleDeleteLead = async (id: Id<"projects">) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteProject({ id });
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const handleConvertToProposal = (lead: any) => {
    // Navigate to proposal creation page with lead data
    router.push(`/dashboard/proposals/new?leadId=${lead._id}`);
  };

  const openEditDialog = (lead: any) => {
    setSelectedLead(lead);
    setFormData({
      customerName: lead.customerName || "",
      customerEmail: lead.customerEmail || "",
      customerPhone: lead.customerPhone || "",
      propertyAddress: lead.propertyAddress || "",
      serviceType: lead.serviceType || "Stump Grinding",
      estimatedValue: lead.estimatedValue?.toString() || "",
      leadSource: lead.leadSource || "",
      notes: lead.notes || "",
      leadStatus: lead.leadStatus || "New",
    });
    setEditDialogOpen(true);
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.leadStatus === "New").length,
    qualified: leads.filter((l) => l.leadStatus === "Qualified").length,
    scheduled: leads.filter((l) => l.leadStatus === "Site Visit Scheduled").length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              Lead Pipeline
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage incoming leads and qualify for proposals
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            size="large"
          >
            New Lead
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Leads
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  New
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.new}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Qualified
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.qualified}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Site Visits Scheduled
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.scheduled}
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
              <MenuItem value="All">All Leads</MenuItem>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="Qualified">Qualified</MenuItem>
              <MenuItem value="Site Visit Scheduled">Site Visit Scheduled</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Lead Cards Directory */}
        {filteredLeads.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No leads found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Click "New Lead" to add your first lead
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add First Lead
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredLeads.map((lead) => (
              <Card
                key={lead._id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <CardContent
                  sx={{
                    cursor: 'pointer',
                    pb: selectedLead?._id === lead._id ? 2 : 1
                  }}
                  onClick={() => setSelectedLead(selectedLead?._id === lead._id ? null : lead)}
                >
                  {/* Collapsed View */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    {/* Customer Name & Status */}
                    <Box sx={{ minWidth: 200, flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {lead.customerName}
                      </Typography>
                      <Chip
                        label={lead.leadStatus || "New"}
                        color={STATUS_COLORS[lead.leadStatus as LeadStatus] || "default"}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                    {/* Contact Info */}
                    <Box sx={{ minWidth: 200, flex: 1 }}>
                      <Stack spacing={0.5}>
                        {lead.customerPhone && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{lead.customerPhone}</Typography>
                          </Box>
                        )}
                        {lead.customerEmail && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{lead.customerEmail}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* Service & Address */}
                    <Box sx={{ minWidth: 250, flex: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {lead.serviceType}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {lead.propertyAddress?.split(',')[0] || 'No address'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Date */}
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant="caption" color="text.secondary">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                      </Typography>
                    </Box>

                    {/* Expand Icon */}
                    <IconButton size="small">
                      {selectedLead?._id === lead._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  {/* Expanded View */}
                  <Collapse in={selectedLead?._id === lead._id}>
                    <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                      <Grid container spacing={3}>
                        {/* Full Details */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Contact Information
                          </Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              <strong>Name:</strong> {lead.customerName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phone:</strong> {lead.customerPhone || 'Not provided'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Email:</strong> {lead.customerEmail || 'Not provided'}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Service Details
                          </Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              <strong>Service:</strong> {lead.serviceType}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {lead.propertyAddress || 'Not provided'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Source:</strong> {lead.leadSource || 'Not specified'}
                            </Typography>
                          </Stack>
                        </Grid>

                        {lead.notes && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Notes
                            </Typography>
                            <Typography variant="body2">{lead.notes}</Typography>
                          </Grid>
                        )}

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<ArrowForwardIcon />}
                              onClick={() => handleConvertToProposal(lead)}
                            >
                              Create Proposal
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<PhoneIcon />}
                              href={`tel:${lead.customerPhone}`}
                            >
                              Call Customer
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => openEditDialog(lead)}
                            >
                              Edit Lead
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteLead(lead._id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Add Lead Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Contact Info */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                required
                fullWidth
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Box>

            <TextField
              label="Phone Number"
              required
              fullWidth
              sx={{ mb: 2 }}
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              sx={{ mb: 2 }}
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            />

            {/* Service Type */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Service Needed</InputLabel>
              <Select
                value={formData.serviceType}
                label="Service Needed"
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <MenuItem value="Tree Removal">Tree Removal</MenuItem>
                <MenuItem value="Tree Trimming">Trimming/Pruning</MenuItem>
                <MenuItem value="Stump Grinding">Stump Grinding</MenuItem>
                <MenuItem value="Forestry Mulching">Forestry Mulching</MenuItem>
                <MenuItem value="Land Clearing">Land Clearing</MenuItem>
                <MenuItem value="Storm Damage">Storm Damage</MenuItem>
                <MenuItem value="Emergency">Emergency Service</MenuItem>
                <MenuItem value="Consultation">Consultation</MenuItem>
              </Select>
            </FormControl>

            {/* Address with expandable options */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField
                  label="Service Address"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="123 Oak Street, Miami, FL 33101"
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                />
                <IconButton
                  onClick={() => setShowAddressOptions(!showAddressOptions)}
                  sx={{ mt: 1 }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              <Collapse in={showAddressOptions}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                  <TextField
                    label="Parcel ID"
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                    value={formData.parcelId}
                    onChange={(e) => setFormData({ ...formData, parcelId: e.target.value })}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <TextField
                      label="Latitude"
                      size="small"
                      placeholder="25.7617"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                    <TextField
                      label="Longitude"
                      size="small"
                      placeholder="-80.1918"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </Box>
                </Box>
              </Collapse>
            </Box>

            {/* Map Display - Placeholder for future integration */}
            {mapCoordinates && (
              <Paper
                elevation={2}
                sx={{
                  height: 200,
                  mb: 2,
                  bgcolor: 'grey.800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary">
                  Satellite Map View
                </Typography>
                {/* TODO: Integrate Google Maps Static API or Mapbox */}
              </Paper>
            )}

            {/* Notes */}
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={4}
              placeholder="Any additional details about the job, access restrictions, urgency, etc."
              sx={{ mb: 2 }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddLead} variant="contained" size="large">
            Create Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
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
              required
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Service Type</InputLabel>
              <Select
                value={formData.serviceType}
                label="Service Type"
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <MenuItem value="Stump Grinding">Stump Grinding</MenuItem>
                <MenuItem value="Forestry Mulching">Forestry Mulching</MenuItem>
                <MenuItem value="Land Clearing">Land Clearing</MenuItem>
                <MenuItem value="Tree Removal">Tree Removal</MenuItem>
                <MenuItem value="Tree Trimming">Tree Trimming</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Estimated Value"
              type="number"
              value={formData.estimatedValue}
              onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
              fullWidth
              InputProps={{ startAdornment: "$" }}
            />
            <FormControl fullWidth>
              <InputLabel>Lead Status</InputLabel>
              <Select
                value={formData.leadStatus}
                label="Lead Status"
                onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value as LeadStatus })}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="Qualified">Qualified</MenuItem>
                <MenuItem value="Site Visit Scheduled">Site Visit Scheduled</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Lead Source"
              value={formData.leadSource}
              onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              fullWidth
              placeholder="e.g., Website, Referral, Google Ads"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditLead} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
