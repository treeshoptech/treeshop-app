"use client";

import { useState } from "react";
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

const AFISS_CATEGORIES = [
  "Access",
  "Facilities",
  "Irregularities",
  "Site Conditions",
  "Safety",
];

export default function LineItemsLibraryPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"lineItemTemplates"> | null>(null);
  const [afissTab, setAfissTab] = useState(0);

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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Tree Removal",
    serviceType: "",
    defaultUnit: "Each",
    defaultUnitPrice: 0,
    defaultQuantity: 1,
    costPerUnit: 0,
    defaultMargin: 0.5,
    tags: [] as string[],
    notes: "",
  });

  // Fetch AFISS factors from server
  const afissFactors = useQuery(api.afissFactors.listFactors);

  // Selected AFISS factor IDs for this template
  const [selectedAfissFactors, setSelectedAfissFactors] = useState<string[]>([]);

  const handleOpenForm = (template?: any) => {
    if (template) {
      setEditingId(template._id);
      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        serviceType: template.serviceType || "",
        defaultUnit: template.defaultUnit,
        defaultUnitPrice: template.defaultUnitPrice,
        defaultQuantity: template.defaultQuantity || 1,
        costPerUnit: template.costPerUnit || 0,
        defaultMargin: template.defaultMargin || 0.5,
        tags: template.tags || [],
        notes: template.notes || "",
      });
      setSelectedAfissFactors(template.afissFactorIds || []);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        category: "Tree Removal",
        serviceType: "",
        defaultUnit: "Each",
        defaultUnitPrice: 0,
        defaultQuantity: 1,
        costPerUnit: 0,
        defaultMargin: 0.5,
        tags: [],
        notes: "",
      });
      setSelectedAfissFactors([]);
    }
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateTemplate({
          id: editingId,
          ...formData,
          afissFactorIds: selectedAfissFactors.length > 0 ? selectedAfissFactors : undefined,
        });
      } else {
        await createTemplate({
          ...formData,
          afissFactorIds: selectedAfissFactors.length > 0 ? selectedAfissFactors : undefined,
        });
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDelete = async (id: Id<"lineItemTemplates">) => {
    if (confirm("Delete this line item template?")) {
      try {
        await deleteTemplate({ id });
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const handleToggleAfissFactor = (factorId: string) => {
    if (selectedAfissFactors.includes(factorId)) {
      setSelectedAfissFactors(selectedAfissFactors.filter(id => id !== factorId));
    } else {
      setSelectedAfissFactors([...selectedAfissFactors, factorId]);
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
              Reusable line items with pricing and AFISS complexity presets
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
                <TableCell>Price</TableCell>
                <TableCell>Margin</TableCell>
                <TableCell>AFISS</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
                          onClick={() => handleDelete(template._id)}
                          title="Delete"
                          color="error"
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
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Edit Template" : "New Template"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
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
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Service Type (Optional)"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Pricing */}
            <Typography variant="h6">Pricing</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={formData.defaultUnit}
                    label="Unit"
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
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price"
                  value={formData.defaultUnitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultUnitPrice: parseFloat(e.target.value) })
                  }
                  InputProps={{ startAdornment: "$" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Default Quantity"
                  value={formData.defaultQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultQuantity: parseFloat(e.target.value) })
                  }
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cost Per Unit (Optional)"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })
                  }
                  InputProps={{ startAdornment: "$" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Default Margin"
                  value={formData.defaultMargin}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultMargin: parseFloat(e.target.value) })
                  }
                  InputProps={{ endAdornment: "%" }}
                  helperText="Enter as decimal (0.5 = 50%)"
                />
              </Grid>
            </Grid>

            {/* AFISS Complexity Factors */}
            <Typography variant="h6">AFISS Complexity Factors</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select factors that commonly apply to this service type
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "background.default" }}>
              {afissFactors && (
                <Stack spacing={3}>
                  {/* Access Factors */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ACCESS
                    </Typography>
                    <Stack spacing={1}>
                      {afissFactors.access.map((factor) => (
                        <FormControlLabel
                          key={factor.id}
                          control={
                            <Checkbox
                              checked={selectedAfissFactors.includes(factor.id)}
                              onChange={() => handleToggleAfissFactor(factor.id)}
                            />
                          }
                          label={factor.name}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Facilities Factors */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      FACILITIES
                    </Typography>
                    <Stack spacing={1}>
                      {afissFactors.facilities.map((factor) => (
                        <FormControlLabel
                          key={factor.id}
                          control={
                            <Checkbox
                              checked={selectedAfissFactors.includes(factor.id)}
                              onChange={() => handleToggleAfissFactor(factor.id)}
                            />
                          }
                          label={factor.name}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Irregularities Factors */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      IRREGULARITIES
                    </Typography>
                    <Stack spacing={1}>
                      {afissFactors.irregularities.map((factor) => (
                        <FormControlLabel
                          key={factor.id}
                          control={
                            <Checkbox
                              checked={selectedAfissFactors.includes(factor.id)}
                              onChange={() => handleToggleAfissFactor(factor.id)}
                            />
                          }
                          label={factor.name}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Site Conditions Factors */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      SITE CONDITIONS
                    </Typography>
                    <Stack spacing={1}>
                      {afissFactors.siteConditions.map((factor) => (
                        <FormControlLabel
                          key={factor.id}
                          control={
                            <Checkbox
                              checked={selectedAfissFactors.includes(factor.id)}
                              onChange={() => handleToggleAfissFactor(factor.id)}
                            />
                          }
                          label={factor.name}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Safety Factors */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      SAFETY
                    </Typography>
                    <Stack spacing={1}>
                      {afissFactors.safety.map((factor) => (
                        <FormControlLabel
                          key={factor.id}
                          control={
                            <Checkbox
                              checked={selectedAfissFactors.includes(factor.id)}
                              onChange={() => handleToggleAfissFactor(factor.id)}
                            />
                          }
                          label={factor.name}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Paper>

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
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
