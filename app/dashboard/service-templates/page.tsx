"use client";

import { useState } from "react";
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
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from "@mui/icons-material";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const SERVICE_TYPES = [
  "Forestry Mulching",
  "Land Clearing",
  "Stump Grinding",
  "Tree Removal",
  "Tree Trimming",
  "Brush Clearing",
];

const FORMULA_MAP: Record<string, string> = {
  "Forestry Mulching": "MulchingScore",
  "Land Clearing": "ClearingScore",
  "Stump Grinding": "StumpScore",
  "Tree Removal": "TreeScore",
  "Tree Trimming": "TrimScore",
  "Brush Clearing": "BrushScore",
};

export default function ServiceTemplatesPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [recalcDialogOpen, setRecalcDialogOpen] = useState(false);
  const [recalcTemplate, setRecalcTemplate] = useState<any>(null);
  const [minJobsRequired, setMinJobsRequired] = useState(5);

  // Queries
  const templates = useQuery(api.serviceTemplates.list);

  // Mutations
  const createTemplate = useMutation(api.serviceTemplates.create);
  const updateTemplate = useMutation(api.serviceTemplates.update);
  const recalculateTemplate = useMutation(api.serviceTemplates.recalculateFromHistory);
  const activateTemplate = useMutation(api.serviceTemplates.activate);
  const deactivateTemplate = useMutation(api.serviceTemplates.deactivate);
  const seedDefaults = useMutation(api.serviceTemplateSeeds.seedDefaultTemplates);

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setEditDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedTemplate) {
        // Update existing
        await updateTemplate({
          id: selectedTemplate._id,
          ...formData,
        });
      } else {
        // Create new
        await createTemplate(formData);
      }
      setEditDialogOpen(false);
    } catch (error: any) {
      alert(error.message || "Error saving template");
    }
  };

  const handleRecalculate = async () => {
    if (!recalcTemplate) return;

    try {
      const result = await recalculateTemplate({
        id: recalcTemplate._id,
        minJobsRequired,
      });

      alert(
        `Template recalculated successfully!\n\n` +
        `Jobs analyzed: ${result.jobsAnalyzed}\n` +
        `New PPH: ${result.newPPH.toFixed(2)}\n` +
        `New Cost/Hour: $${result.newCostPerHour.toFixed(2)}\n` +
        `New Billing Rate: $${result.newBillingRate.toFixed(2)}\n` +
        `Achieved Margin: ${result.achievedMargin.toFixed(1)}%\n` +
        `Confidence Score: ${result.confidenceScore.toFixed(0)}/100`
      );

      setRecalcDialogOpen(false);
    } catch (error: any) {
      alert(error.message || "Error recalculating template");
    }
  };

  const handleToggleActive = async (template: any) => {
    try {
      if (template.isActive) {
        await deactivateTemplate({ id: template._id });
      } else {
        await activateTemplate({ id: template._id });
      }
    } catch (error: any) {
      alert(error.message || "Error updating template status");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Seed default service templates? This will create templates for all standard services.")) {
      return;
    }

    try {
      const result = await seedDefaults({});
      alert(
        `Seeding complete!\n\n` +
        `Created: ${result.created.join(", ")}\n` +
        `Skipped: ${result.skipped.join(", ")}`
      );
    } catch (error: any) {
      alert(error.message || "Error seeding templates");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "info";
    if (score >= 40) return "warning";
    return "error";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Service Templates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Company-wide pricing standards (Tier 1) - used for consistent proposal pricing
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleSeedDefaults} startIcon={<AddIcon />}>
              Seed Defaults
            </Button>
            <Button variant="contained" onClick={handleCreate} startIcon={<AddIcon />}>
              Create Template
            </Button>
          </Stack>
        </Box>

        {/* Templates List */}
        {!templates ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">Loading templates...</Typography>
          </Box>
        ) : templates.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No Service Templates Yet
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Create your first service template or seed defaults to get started.
            </Typography>
            <Button variant="contained" onClick={handleSeedDefaults} sx={{ mt: 2 }}>
              Seed Default Templates
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template._id}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {template.serviceType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.formulaUsed}
                          </Typography>
                        </Box>
                        <Chip
                          icon={template.isActive ? <ActiveIcon /> : <InactiveIcon />}
                          label={template.isActive ? "Active" : "Inactive"}
                          color={template.isActive ? "success" : "default"}
                          size="small"
                        />
                      </Box>

                      <Divider />

                      {/* Production Rate */}
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Standard PPH
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {template.standardPPH.toFixed(2)}
                        </Typography>
                      </Box>

                      {/* Pricing */}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Cost/Hour
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {formatCurrency(template.standardCostPerHour)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Billing Rate
                          </Typography>
                          <Typography variant="body1" fontWeight={500} color="success.main">
                            {formatCurrency(template.standardBillingRate)}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Margin */}
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Target Margin
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {template.targetMargin.toFixed(0)}%
                        </Typography>
                      </Box>

                      <Divider />

                      {/* Performance Data */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Data Quality
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={template.confidenceScore || 0}
                            color={getConfidenceColor(template.confidenceScore || 0)}
                            sx={{ flex: 1, height: 8, borderRadius: 1 }}
                          />
                          <Typography variant="caption" fontWeight={500}>
                            {(template.confidenceScore || 0).toFixed(0)}%
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {template.totalJobsInAverage} jobs · Last updated {formatDate(template.lastRecalculated)}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(template)}
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={() => {
                            setRecalcTemplate(template);
                            setRecalcDialogOpen(true);
                          }}
                          fullWidth
                          disabled={!template.isActive}
                        >
                          Recalculate
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(template)}
                          color={template.isActive ? "default" : "success"}
                        >
                          {template.isActive ? <InactiveIcon /> : <ActiveIcon />}
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Edit/Create Dialog */}
        <ServiceTemplateDialog
          open={editDialogOpen}
          template={selectedTemplate}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSave}
        />

        {/* Recalculate Dialog */}
        <Dialog open={recalcDialogOpen} onClose={() => setRecalcDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Recalculate from Historical Data</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 2 }}>
              <Alert severity="info">
                This will analyze all completed jobs for <strong>{recalcTemplate?.serviceType}</strong> and update the template with actual averages.
              </Alert>
              <TextField
                label="Minimum Jobs Required"
                type="number"
                value={minJobsRequired}
                onChange={(e) => setMinJobsRequired(parseInt(e.target.value) || 5)}
                helperText="Minimum number of completed jobs needed for recalculation"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRecalcDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecalculate} variant="contained">
              Recalculate
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}

// Edit/Create Dialog Component
function ServiceTemplateDialog({
  open,
  template,
  onClose,
  onSave,
}: {
  open: boolean;
  template: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    serviceType: "",
    formulaUsed: "",
    description: "",
    standardPPH: 0,
    standardCostPerHour: 0,
    standardBillingRate: 0,
    targetMargin: 45,
    notes: "",
  });

  // Initialize form when template changes
  useState(() => {
    if (template) {
      setFormData({
        serviceType: template.serviceType || "",
        formulaUsed: template.formulaUsed || "",
        description: template.description || "",
        standardPPH: template.standardPPH || 0,
        standardCostPerHour: template.standardCostPerHour || 0,
        standardBillingRate: template.standardBillingRate || 0,
        targetMargin: template.targetMargin || 45,
        notes: template.notes || "",
      });
    } else {
      setFormData({
        serviceType: "",
        formulaUsed: "",
        description: "",
        standardPPH: 0,
        standardCostPerHour: 0,
        standardBillingRate: 0,
        targetMargin: 45,
        notes: "",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.serviceType || !formData.formulaUsed || formData.standardPPH <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    onSave(formData);
  };

  const calculateBillingRate = () => {
    if (formData.standardCostPerHour > 0 && formData.targetMargin > 0 && formData.targetMargin < 100) {
      const marginDecimal = formData.targetMargin / 100;
      const billingRate = formData.standardCostPerHour / (1 - marginDecimal);
      setFormData({ ...formData, standardBillingRate: Math.round(billingRate * 100) / 100 });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{template ? "Edit Service Template" : "Create Service Template"}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Service Type"
                value={formData.serviceType}
                onChange={(e) => {
                  const serviceType = e.target.value;
                  setFormData({
                    ...formData,
                    serviceType,
                    formulaUsed: FORMULA_MAP[serviceType] || "",
                  });
                }}
                fullWidth
                SelectProps={{ native: true }}
                disabled={!!template}
              >
                <option value="">Select service type...</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Formula Used"
                value={formData.formulaUsed}
                onChange={(e) => setFormData({ ...formData, formulaUsed: e.target.value })}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Standard PPH"
                type="number"
                value={formData.standardPPH}
                onChange={(e) => setFormData({ ...formData, standardPPH: parseFloat(e.target.value) || 0 })}
                fullWidth
                helperText="Points per hour"
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Cost Per Hour"
                type="number"
                value={formData.standardCostPerHour}
                onChange={(e) => setFormData({ ...formData, standardCostPerHour: parseFloat(e.target.value) || 0 })}
                fullWidth
                helperText="Your average cost"
                inputProps={{ step: 1, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Target Margin %"
                type="number"
                value={formData.targetMargin}
                onChange={(e) => setFormData({ ...formData, targetMargin: parseFloat(e.target.value) || 0 })}
                fullWidth
                helperText="e.g., 45 for 45%"
                inputProps={{ step: 1, min: 0, max: 99 }}
              />
            </Grid>
          </Grid>

          <Box>
            <TextField
              label="Billing Rate"
              type="number"
              value={formData.standardBillingRate}
              onChange={(e) => setFormData({ ...formData, standardBillingRate: parseFloat(e.target.value) || 0 })}
              fullWidth
              helperText="What customers pay per hour"
              inputProps={{ step: 1, min: 0 }}
            />
            <Button size="small" onClick={calculateBillingRate} sx={{ mt: 1 }}>
              Calculate from Margin
            </Button>
          </Box>

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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {template ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
