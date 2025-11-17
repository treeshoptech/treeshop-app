"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";

const CATEGORIES = [
  "Tree Removal",
  "Stump Grinding",
  "Mulching",
  "Land Clearing",
  "Equipment Rental",
  "Labor",
  "Materials",
  "Other",
];

const UNITS = [
  "Each",
  "Hour",
  "Day",
  "Acre",
  "Linear Foot",
  "Square Foot",
  "Cubic Yard",
  "Ton",
  "Tree",
  "Stump",
];

export default function LineItemsLibraryPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"lineItemTemplates"> | null>(null);

  // Fetch templates
  const allTemplates = useQuery(api.lineItemTemplates.list);
  const filteredTemplates =
    categoryFilter === "All"
      ? allTemplates
      : allTemplates?.filter((t) => t.category === categoryFilter);

  // Mutations
  const createTemplate = useMutation(api.lineItemTemplates.create);
  const updateTemplate = useMutation(api.lineItemTemplates.update);
  const deleteTemplate = useMutation(api.lineItemTemplates.remove);
  const seedDefaults = useMutation(api.seedDefaultLineItemTemplates.seedDefaults);

  // Auto-seed default templates on page load (runs once, idempotent)
  useEffect(() => {
    if (allTemplates !== undefined) {
      seedDefaults().catch(() => {
        // Silently fail if already seeded - idempotent operation
      });
    }
  }, [allTemplates, seedDefaults]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Tree Removal",
    serviceType: "",
    defaultUnit: "Each",
    billingRate: 0, // What customer pays per unit
    defaultQuantity: 1,
    costPerUnit: 0, // Our cost per unit
    targetMargin: 50, // Percentage (0-100)
    tags: [] as string[],
    notes: "",
  });


  const handleOpenForm = (template?: any) => {
    if (template) {
      setEditingId(template._id);
      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        serviceType: template.serviceType || "",
        defaultUnit: template.defaultUnit,
        billingRate: template.defaultUnitPrice || 0,
        defaultQuantity: template.defaultQuantity || 1,
        costPerUnit: template.costPerUnit || 0,
        targetMargin: (template.defaultMargin || 0.5) * 100, // Convert decimal to percentage
        tags: template.tags || [],
        notes: template.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        category: "Tree Removal",
        serviceType: "",
        defaultUnit: "Each",
        billingRate: 0,
        defaultQuantity: 1,
        costPerUnit: 0,
        targetMargin: 50,
        tags: [],
        notes: "",
      });
    }
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        serviceType: formData.serviceType,
        defaultUnit: formData.defaultUnit,
        defaultUnitPrice: formData.billingRate,
        defaultQuantity: formData.defaultQuantity,
        costPerUnit: formData.costPerUnit,
        defaultMargin: formData.targetMargin / 100, // Convert percentage to decimal
        tags: formData.tags,
        notes: formData.notes,
      };

      if (editingId) {
        await updateTemplate({
          id: editingId,
          ...saveData,
        });
      } else {
        await createTemplate(saveData);
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDelete = async (id: Id<"lineItemTemplates">, template: any) => {
    if (template.isSystemTemplate) {
      alert("Cannot delete core TreeShop templates. These are system templates required for proper operation.");
      return;
    }

    if (confirm("Delete this line item template?")) {
      try {
        await deleteTemplate({ id });
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const stats = {
    total: allTemplates?.length || 0,
    byCategory: CATEGORIES.map((cat) => ({
      name: cat,
      count: allTemplates?.filter((t) => t.category === cat).length || 0,
    })),
  };

  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              Line Items Library
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Reusable service line item templates with default pricing and margins
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            size="large"
          >
            New Template
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Templates
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          {stats.byCategory.slice(0, 3).map((cat) => (
            <Grid item xs={12} sm={6} md={3} key={cat.name}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {cat.name}
                  </Typography>
                  <Typography variant="h4">{cat.count}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filter */}
        <Paper sx={{ p: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Filter by Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="All">All Categories</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Templates Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Billing Rate</TableCell>
                <TableCell>Margin</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No templates found. Create your first reusable line item.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates?.map((template) => (
                  <TableRow key={template._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
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
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(template.defaultUnitPrice)}
                    </TableCell>
                    <TableCell>
                      {((template.defaultMargin || 0) * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {template.usageCount || 0} times
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenForm(template)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(template._id, template)}
                          title={template.isSystemTemplate ? "System template (cannot delete)" : "Delete"}
                          color="error"
                          disabled={template.isSystemTemplate}
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

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          {editingId ? "Edit Template" : "New Template"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
            {/* Basic Info */}
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Service Type (Optional)"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Pricing Section */}
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                Pricing & Margins
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unit Type</InputLabel>
                    <Select
                      value={formData.defaultUnit}
                      label="Unit Type"
                      onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
                    >
                      {UNITS.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Default Quantity"
                    value={formData.defaultQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultQuantity: parseFloat(e.target.value) })
                    }
                    helperText="How many units typically in one job"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Billing Rate (Customer Pays)"
                    value={formData.billingRate}
                    onChange={(e) =>
                      setFormData({ ...formData, billingRate: parseFloat(e.target.value) || 0 })
                    }
                    InputProps={{ startAdornment: "$" }}
                    helperText="Price charged to customer per unit"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cost Per Unit (Your Cost)"
                    value={formData.costPerUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })
                    }
                    InputProps={{ startAdornment: "$" }}
                    helperText="Your cost to deliver (optional)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Target Profit Margin"
                    value={formData.targetMargin}
                    onChange={(e) =>
                      setFormData({ ...formData, targetMargin: parseFloat(e.target.value) || 0 })
                    }
                    InputProps={{ endAdornment: "%" }}
                    helperText="Enter 47 for 47% margin"
                    inputProps={{ min: 0, max: 100, step: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button onClick={() => setFormOpen(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" size="large">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
