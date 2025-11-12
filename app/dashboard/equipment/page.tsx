"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CRUDDirectory, CRUDItem } from "@/app/components/CRUDDirectory";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';

interface Equipment extends CRUDItem {
  _id: Id<"equipment">;
  category: string;
  purchasePrice: number;
  status: string;
}

const EQUIPMENT_CATEGORIES = [
  'Truck',
  'Mulcher',
  'Stump Grinder',
  'Excavator',
  'Trailer',
  'Support Equipment',
];

const EQUIPMENT_STATUS = [
  'Active',
  'Maintenance',
  'Retired',
];

function EquipmentPageContent() {
  const equipment = useQuery(api.equipment.list);
  const createEquipment = useMutation(api.equipment.create);
  const updateEquipment = useMutation(api.equipment.update);
  const deleteEquipment = useMutation(api.equipment.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"equipment"> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Truck',
    purchasePrice: 0,
    usefulLifeYears: 5,
    annualHours: 2000,
    financeRate: 0.05,
    insuranceCost: 0,
    registrationCost: 0,
    fuelConsumptionGPH: 0,
    fuelPricePerGallon: 3.75,
    maintenanceCostAnnual: 0,
    repairCostAnnual: 0,
    status: 'Active',
  });

  // Transform equipment for CRUDDirectory
  const equipmentItems: Equipment[] = (equipment || []).map(item => ({
    id: item._id,
    _id: item._id,
    title: item.name,
    subtitle: item.category,
    status: item.status,
    category: item.category,
    purchasePrice: item.purchasePrice,
  }));

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Truck',
      purchasePrice: 0,
      usefulLifeYears: 5,
      annualHours: 2000,
      financeRate: 0.05,
      insuranceCost: 0,
      registrationCost: 0,
      fuelConsumptionGPH: 0,
      fuelPricePerGallon: 3.75,
      maintenanceCostAnnual: 0,
      repairCostAnnual: 0,
      status: 'Active',
    });
    setFormOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    const fullItem = equipment?.find(e => e._id === item._id);
    if (fullItem) {
      setEditingId(item._id);
      setFormData({
        name: fullItem.name,
        category: fullItem.category,
        purchasePrice: fullItem.purchasePrice,
        usefulLifeYears: fullItem.usefulLifeYears,
        annualHours: fullItem.annualHours,
        financeRate: fullItem.financeRate || 0.05,
        insuranceCost: fullItem.insuranceCost || 0,
        registrationCost: fullItem.registrationCost || 0,
        fuelConsumptionGPH: fullItem.fuelConsumptionGPH || 0,
        fuelPricePerGallon: fullItem.fuelPricePerGallon || 3.75,
        maintenanceCostAnnual: fullItem.maintenanceCostAnnual || 0,
        repairCostAnnual: fullItem.repairCostAnnual || 0,
        status: fullItem.status,
      });
      setFormOpen(true);
    }
  };

  const handleDelete = async (item: Equipment) => {
    await deleteEquipment({ id: item._id });
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateEquipment({ id: editingId, ...formData });
    } else {
      await createEquipment(formData);
    }
    setFormOpen(false);
  };

  return (
    <>
      <CRUDDirectory
        title="Equipment"
        items={equipmentItems}
        loading={equipment === undefined}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search equipment..."
        emptyMessage="No equipment added yet"
        statusColors={{
          active: '#34C759',
          maintenance: '#FF9500',
          retired: '#8E8E93',
        }}
      />

      {/* Add/Edit Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1C1C1E',
            border: '1px solid #2C2C2E',
          },
        }}
      >
        <DialogTitle>
          {editingId ? 'Edit Equipment' : 'Add Equipment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Equipment Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {EQUIPMENT_STATUS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Purchase Price"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Useful Life (years)"
                  value={formData.usefulLifeYears}
                  onChange={(e) => setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Annual Hours"
                  value={formData.annualHours}
                  onChange={(e) => setFormData({ ...formData, annualHours: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Finance Rate (%)"
                  value={(formData.financeRate * 100).toFixed(1)}
                  onChange={(e) => setFormData({ ...formData, financeRate: parseFloat(e.target.value) / 100 })}
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Annual Insurance"
                  value={formData.insuranceCost}
                  onChange={(e) => setFormData({ ...formData, insuranceCost: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Annual Registration"
                  value={formData.registrationCost}
                  onChange={(e) => setFormData({ ...formData, registrationCost: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fuel Consumption (gal/hr)"
                  value={formData.fuelConsumptionGPH}
                  onChange={(e) => setFormData({ ...formData, fuelConsumptionGPH: parseFloat(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fuel Price ($/gal)"
                  value={formData.fuelPricePerGallon}
                  onChange={(e) => setFormData({ ...formData, fuelPricePerGallon: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Annual Maintenance"
                  value={formData.maintenanceCostAnnual}
                  onChange={(e) => setFormData({ ...formData, maintenanceCostAnnual: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Annual Repairs"
                  value={formData.repairCostAnnual}
                  onChange={(e) => setFormData({ ...formData, repairCostAnnual: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name}
          >
            {editingId ? 'Save Changes' : 'Add Equipment'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function EquipmentPage() {
  return (
    <ConvexAuthGuard>
      <EquipmentPageContent />
    </ConvexAuthGuard>
  );
}
