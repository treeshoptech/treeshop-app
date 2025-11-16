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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");

  // Fetch projects (leads are projects with status "Lead")
  const allProjects = useQuery(api.projects.list);
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
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    propertyAddress: "",
    serviceType: "Stump Grinding" as any,
    estimatedValue: "",
    leadSource: "",
    notes: "",
    leadStatus: "New" as LeadStatus,
  });

  const handleAddLead = async () => {
    try {
      await createProject({
        name: `${formData.customerName} - ${formData.serviceType}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
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
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        propertyAddress: "",
        serviceType: "Stump Grinding",
        estimatedValue: "",
        leadSource: "",
        notes: "",
        leadStatus: "New",
      });
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
    // Navigate to new proposal page with pre-filled customer data
    const params = new URLSearchParams({
      customerName: lead.customerName || "",
      customerEmail: lead.customerEmail || "",
      customerPhone: lead.customerPhone || "",
      propertyAddress: lead.propertyAddress || "",
      leadId: lead._id,
    });
    window.location.href = `/proposals/new?${params.toString()}`;
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

        {/* Leads Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Property Address</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Est. Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Source</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No leads found. Click "New Lead" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {lead.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">{lead.propertyAddress}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{lead.serviceType}</TableCell>
                    <TableCell>
                      {lead.estimatedValue
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(lead.estimatedValue)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.leadStatus || "New"}
                        color={STATUS_COLORS[lead.leadStatus as LeadStatus] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{lead.leadSource || "-"}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(lead)}
                          title="Edit Lead"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleConvertToProposal(lead)}
                          title="Convert to Proposal"
                        >
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteLead(lead._id)}
                          title="Delete Lead"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* Add Lead Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
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
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddLead} variant="contained">
            Add Lead
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
