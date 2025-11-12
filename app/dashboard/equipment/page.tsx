"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box, Card, CardContent, CardActions, Typography, Button, IconButton, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Fab,
  InputAdornment, Tabs, Tab, Divider, List, ListItem, ListItemText, Avatar, Alert, Paper,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LocalShipping as TruckIcon,
  Build as BuildIcon, Search as SearchIcon, Close as CloseIcon, AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon, Speed as SpeedIcon, Settings as SettingsIcon,
  Description as DocsIcon, TrendingUp as AnalyticsIcon, Construction as ConstructionIcon,
} from '@mui/icons-material';
import { EQUIPMENT_TAXONOMY, getEquipmentCategories, getEquipmentSubcategories } from '@/lib/equipment-taxonomy';
const EQUIPMENT_STATUS = [
  { value: 'Available', color: '#34C759' },
  { value: 'In Use', color: '#007AFF' },
  { value: 'Maintenance', color: '#FF9500' },
  { value: 'Down', color: '#FF3B30' },
  { value: 'Retired', color: '#8E8E93' },
];
const FUEL_TYPES = ['Diesel', 'Gasoline', 'Electric', 'Propane', 'Dual Fuel'];
const DEPRECIATION_METHODS = ['Straight Line', 'Declining Balance', 'Units of Production'];

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return <div role="tabpanel" hidden={value !== index} {...other}>{value === index && <Box sx={{ py: 2 }}>{children}</Box>}</div>;
}

function EquipmentPageContent() {
  const equipment = useQuery(api.equipment.list);
  const createEquipment = useMutation(api.equipment.create);
  const updateEquipment = useMutation(api.equipment.update);
  const deleteEquipment = useMutation(api.equipment.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"equipment"> | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"equipment"> | null>(null);
  const [formTab, setFormTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    // Identity
    nickname: '', make: '', model: '', serialNumber: '', vin: '', year: new Date().getFullYear(),
    equipmentCategory: 'Trucks & Vehicles', equipmentSubcategory: 'Heavy Duty Pickup',
    // Acquisition
    purchasePrice: 0, purchaseDate: Date.now(), dealer: '', purchaseOrderNumber: '',
    loanTermMonths: 60, financeRate: 0.05, depreciationMethod: 'Straight Line',
    usefulLifeYears: 5, salvageValue: 0, insurancePolicyNumber: '', insuranceCost: 0,
    // Cost Structure
    fuelType: 'Diesel', fuelConsumptionGPH: 0, fuelPricePerGallon: 3.75,
    maintenanceCostAnnual: 0, repairCostAnnual: 0, registrationCost: 0,
    // Operations
    engineHP: 0, operatingWeight: 0, cuttingWidth: 0, maxCuttingDiameter: 0,
    fuelTankCapacity: 0, productivityRate: 0, annualHours: 2000,
    // Status
    currentMeterReading: 0, status: 'Available', currentLocation: '', assignedOperator: '',
    // Maintenance
    serviceInterval: 250, lastServiceDate: Date.now(), lastServiceHours: 0,
    // Other
    licensePlate: '', notes: '',
  });

  const selectedEquipment = equipment?.find(e => e._id === selectedId);

  const calculateCosts = (eq: any) => {
    const ownershipPerYear = (eq.purchasePrice / eq.usefulLifeYears) +
      (eq.purchasePrice * (eq.financeRate || 0)) +
      (eq.insuranceCost || 0) + (eq.registrationCost || 0);
    const ownershipPerHour = ownershipPerYear / eq.annualHours;
    const operatingPerYear = ((eq.fuelConsumptionGPH || 0) * (eq.fuelPricePerGallon || 0) * eq.annualHours) +
      (eq.maintenanceCostAnnual || 0) + (eq.repairCostAnnual || 0);
    const operatingPerHour = operatingPerYear / eq.annualHours;
    return {
      ownershipPerHour, operatingPerHour, totalPerHour: ownershipPerHour + operatingPerHour,
      ownershipPerYear, operatingPerYear, totalPerYear: ownershipPerYear + operatingPerYear,
    };
  };

  const filteredEquipment = equipment?.filter(eq => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      (eq.nickname || '').toLowerCase().includes(search) ||
      `${eq.year} ${eq.make} ${eq.model}`.toLowerCase().includes(search) ||
      (eq.equipmentSubtype || '').toLowerCase().includes(search) ||
      (eq.licensePlate || '').toLowerCase().includes(search) ||
      (eq.vin || '').toLowerCase().includes(search)
    );
  }) || [];

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nickname: '', make: '', model: '', serialNumber: '', vin: '', year: new Date().getFullYear(),
      equipmentCategory: 'Trucks & Vehicles', equipmentSubcategory: 'Heavy Duty Pickup',
      purchasePrice: 0, purchaseDate: Date.now(), dealer: '', purchaseOrderNumber: '',
      loanTermMonths: 60, financeRate: 0.05, depreciationMethod: 'Straight Line',
      usefulLifeYears: 5, salvageValue: 0, insurancePolicyNumber: '', insuranceCost: 0,
      fuelType: 'Diesel', fuelConsumptionGPH: 0, fuelPricePerGallon: 3.75,
      maintenanceCostAnnual: 0, repairCostAnnual: 0, registrationCost: 0,
      engineHP: 0, operatingWeight: 0, cuttingWidth: 0, maxCuttingDiameter: 0,
      fuelTankCapacity: 0, productivityRate: 0, annualHours: 2000,
      currentMeterReading: 0, status: 'Available', currentLocation: '', assignedOperator: '',
      serviceInterval: 250, lastServiceDate: Date.now(), lastServiceHours: 0,
      licensePlate: '', notes: '',
    });
    setFormTab(0);
    setFormOpen(true);
  };

  const handleEdit = (id: Id<"equipment">) => {
    const eq = equipment?.find(e => e._id === id);
    if (eq) {
      setEditingId(id);
      setFormData({
        nickname: eq.nickname || '', make: eq.make, model: eq.model,
        serialNumber: eq.serialNumber || '', vin: eq.vin || '', year: eq.year,
        equipmentCategory: eq.equipmentCategory || 'Trucks & Vehicles', equipmentSubcategory: eq.equipmentSubcategory || 'Heavy Duty Pickup',
        purchasePrice: eq.purchasePrice, purchaseDate: eq.purchaseDate || Date.now(),
        dealer: eq.dealer || '', purchaseOrderNumber: eq.purchaseOrderNumber || '',
        loanTermMonths: eq.loanTermMonths || 60, financeRate: eq.financeRate || 0.05,
        depreciationMethod: eq.depreciationMethod || 'Straight Line',
        usefulLifeYears: eq.usefulLifeYears, salvageValue: eq.salvageValue || 0,
        insurancePolicyNumber: eq.insurancePolicyNumber || '', insuranceCost: eq.insuranceCost || 0,
        fuelType: eq.fuelType || 'Diesel', fuelConsumptionGPH: eq.fuelConsumptionGPH || 0,
        fuelPricePerGallon: eq.fuelPricePerGallon || 3.75,
        maintenanceCostAnnual: eq.maintenanceCostAnnual || 0,
        repairCostAnnual: eq.repairCostAnnual || 0, registrationCost: eq.registrationCost || 0,
        engineHP: eq.engineHP || 0, operatingWeight: eq.operatingWeight || 0,
        cuttingWidth: eq.cuttingWidth || 0, maxCuttingDiameter: eq.maxCuttingDiameter || 0,
        fuelTankCapacity: eq.fuelTankCapacity || 0, productivityRate: eq.productivityRate || 0,
        annualHours: eq.annualHours,
        currentMeterReading: eq.currentMeterReading || 0, status: eq.status,
        currentLocation: eq.currentLocation || '', assignedOperator: eq.assignedOperator || '',
        serviceInterval: eq.serviceInterval || 250, lastServiceDate: eq.lastServiceDate || Date.now(),
        lastServiceHours: eq.lastServiceHours || 0,
        licensePlate: eq.licensePlate || '', notes: eq.notes || '',
      });
      setFormTab(0);
      setFormOpen(true);
    }
  };

  const handleDelete = async (id: Id<"equipment">) => {
    if (confirm('Delete this equipment?')) {
      await deleteEquipment({ id });
      if (selectedId === id) { setDetailOpen(false); setSelectedId(null); }
    }
  };

  const handleSubmit = async () => {
    if (!formData.make || !formData.model) {
      alert('Please fill required fields (Make and Model)');
      return;
    }
    if (editingId) {
      await updateEquipment({ id: editingId, ...formData });
    } else {
      await createEquipment(formData);
    }
    setFormOpen(false);
  };

  const getStatusColor = (status: string) => EQUIPMENT_STATUS.find(s => s.value === status)?.color || '#8E8E93';

  const getCategoryIcon = (category: string, subcategory: string) => {
    const cat = category?.toLowerCase() || '';
    const sub = subcategory?.toLowerCase() || '';

    if (cat.includes('truck') || cat.includes('vehicle') || sub.includes('truck')) return <TruckIcon />;
    if (cat.includes('aerial') || sub.includes('lift') || sub.includes('bucket')) return <SettingsIcon />;
    if (cat.includes('chainsaw') || cat.includes('handheld')) return <BuildIcon />;
    if (cat.includes('attachment') || cat.includes('grapple') || cat.includes('bucket')) return <ConstructionIcon />;
    return <BuildIcon />;
  };

  return (
    <>
      <Box sx={{ mb: 3 }}><Typography variant="h4" sx={{ fontWeight: 600 }}>Equipment</Typography></Box>

      <TextField fullWidth placeholder="Search equipment by nickname, make, model, type, plate, or VIN..." value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          endAdornment: searchQuery && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><CloseIcon /></IconButton></InputAdornment>,
        }} />

      {equipment === undefined ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">Loading...</Typography></Box>
      ) : filteredEquipment.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BuildIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>{searchQuery ? 'No equipment found' : 'No equipment yet'}</Typography>
          {!searchQuery && <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Equipment</Button>}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredEquipment.map((eq) => {
            const costs = calculateCosts(eq);
            const displayName = eq.nickname || `${eq.year} ${eq.make} ${eq.model}`;
            return (
              <Grid item xs={12} sm={6} md={4} key={eq._id}>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
                  onClick={() => { setSelectedId(eq._id); setDetailOpen(true); setDetailTab(0); }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Avatar sx={{ bgcolor: getStatusColor(eq.status), mr: 2, width: 56, height: 56 }}>
                        {getCategoryIcon(eq.equipmentCategory, eq.equipmentSubcategory)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>{displayName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{eq.equipmentSubcategory}</Typography>
                        <Chip label={eq.status} size="small" sx={{ bgcolor: getStatusColor(eq.status), color: '#FFF', fontWeight: 500, height: 20, fontSize: '0.7rem' }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {eq.licensePlate && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Plate</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>{eq.licensePlate}</Typography></Box>}
                    {eq.currentMeterReading > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Hours</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>{eq.currentMeterReading.toLocaleString()}</Typography></Box>}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Hourly Cost</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: '#007AFF' }}>${costs.totalPerHour.toFixed(2)}/hr</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Annual Cost</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>${costs.totalPerYear.toLocaleString()}</Typography></Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(eq._id); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(eq._id); }}><DeleteIcon fontSize="small" /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={handleAdd}><AddIcon /></Fab>

      {/* FORM DIALOG */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E' } }}>
        <DialogTitle>{editingId ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
        
        <Tabs value={formTab} onChange={(_, v) => setFormTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab icon={<AssignmentIcon />} label="Identity" iconPosition="start" />
          <Tab icon={<MoneyIcon />} label="Financial" iconPosition="start" />
          <Tab icon={<SpeedIcon />} label="Operations" iconPosition="start" />
          <Tab icon={<ConstructionIcon />} label="Maintenance" iconPosition="start" />
        </Tabs>

        <DialogContent sx={{ minHeight: 500 }}>
          <TabPanel value={formTab} index={0}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><AssignmentIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Basic Information</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Equipment Nickname" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} placeholder="e.g. 'Big Red', 'Mulcher #1'" helperText="Optional: Give this equipment a memorable name" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>{EQUIPMENT_STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.value}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Equipment Category"
                    value={formData.equipmentCategory}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      const subcats = getEquipmentSubcategories(newCategory);
                      setFormData({
                        ...formData,
                        equipmentCategory: newCategory,
                        equipmentSubcategory: subcats[0] || ''
                      });
                    }}
                    helperText="Primary equipment type"
                  >
                    {getEquipmentCategories().map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Equipment Subcategory"
                    value={formData.equipmentSubcategory}
                    onChange={(e) => setFormData({ ...formData, equipmentSubcategory: e.target.value })}
                    helperText="Specific equipment type"
                  >
                    {getEquipmentSubcategories(formData.equipmentCategory).map(sub => <MenuItem key={sub} value={sub}>{sub}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><BuildIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Manufacturer Details</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}><TextField fullWidth type="number" label="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} required /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Make" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} required placeholder="e.g. CAT, John Deere, Ford" /></Grid>
                <Grid item xs={12} sm={5}><TextField fullWidth label="Model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required placeholder="e.g. 265, F450, 6120" /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Serial Number" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="VIN" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="License Plate" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={1}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><MoneyIcon sx={{ mr: 1, color: '#34C759' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Acquisition</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Purchase Price" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="date" label="Purchase Date" value={new Date(formData.purchaseDate).toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, purchaseDate: new Date(e.target.value).getTime() })} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Dealer/Vendor" value={formData.dealer} onChange={(e) => setFormData({ ...formData, dealer: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Purchase Order #" value={formData.purchaseOrderNumber} onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth select label="Depreciation Method" value={formData.depreciationMethod} onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value })}>{DEPRECIATION_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><MoneyIcon sx={{ mr: 1, color: '#FF9500' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Financing</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Finance Rate" value={(formData.financeRate * 100).toFixed(2)} onChange={(e) => setFormData({ ...formData, financeRate: parseFloat(e.target.value) / 100 })} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Loan Term" value={formData.loanTermMonths} onChange={(e) => setFormData({ ...formData, loanTermMonths: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">months</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Useful Life" value={formData.usefulLifeYears} onChange={(e) => setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Salvage Value Estimate" value={formData.salvageValue} onChange={(e) => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Expected Annual Hours" value={formData.annualHours} onChange={(e) => setFormData({ ...formData, annualHours: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">hrs/yr</InputAdornment> }} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><MoneyIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Annual Operating Costs</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth label="Insurance Policy #" value={formData.insurancePolicyNumber} onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Annual Insurance" value={formData.insuranceCost} onChange={(e) => setFormData({ ...formData, insuranceCost: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Annual Registration" value={formData.registrationCost} onChange={(e) => setFormData({ ...formData, registrationCost: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Annual Maintenance Budget" value={formData.maintenanceCostAnnual} onChange={(e) => setFormData({ ...formData, maintenanceCostAnnual: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Annual Repair Budget" value={formData.repairCostAnnual} onChange={(e) => setFormData({ ...formData, repairCostAnnual: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={2}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><SpeedIcon sx={{ mr: 1, color: '#FF3B30' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Fuel & Consumption</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth select label="Fuel Type" value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>{FUEL_TYPES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Fuel Consumption" value={formData.fuelConsumptionGPH} onChange={(e) => setFormData({ ...formData, fuelConsumptionGPH: parseFloat(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">gal/hr</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Current Fuel Price" value={formData.fuelPricePerGallon} onChange={(e) => setFormData({ ...formData, fuelPricePerGallon: parseFloat(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, endAdornment: <InputAdornment position="end">/gal</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Fuel Tank Capacity" value={formData.fuelTankCapacity} onChange={(e) => setFormData({ ...formData, fuelTankCapacity: parseFloat(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">gallons</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Engine Horsepower" value={formData.engineHP} onChange={(e) => setFormData({ ...formData, engineHP: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">HP</InputAdornment> }} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><SettingsIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Operational Specs</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Operating Weight" value={formData.operatingWeight} onChange={(e) => setFormData({ ...formData, operatingWeight: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">lbs</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Cutting Width" value={formData.cuttingWidth} onChange={(e) => setFormData({ ...formData, cuttingWidth: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Max Cutting Diameter" value={formData.maxCuttingDiameter} onChange={(e) => setFormData({ ...formData, maxCuttingDiameter: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Productivity Rate" value={formData.productivityRate} onChange={(e) => setFormData({ ...formData, productivityRate: parseFloat(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">PpH</InputAdornment> }} helperText="Points per Hour (inch-acres/hour)" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Current Meter Reading" value={formData.currentMeterReading} onChange={(e) => setFormData({ ...formData, currentMeterReading: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">hours</InputAdornment> }} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><AssignmentIcon sx={{ mr: 1, color: '#34C759' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Current Status</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Current Location/Yard" value={formData.currentLocation} onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Assigned Operator" value={formData.assignedOperator} onChange={(e) => setFormData({ ...formData, assignedOperator: e.target.value })} /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={3}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><ConstructionIcon sx={{ mr: 1, color: '#FF9500' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Service Schedule</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Service Interval" value={formData.serviceInterval} onChange={(e) => setFormData({ ...formData, serviceInterval: parseInt(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">hours</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="date" label="Last Service Date" value={new Date(formData.lastServiceDate).toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, lastServiceDate: new Date(e.target.value).getTime() })} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Hours at Last Service" value={formData.lastServiceHours} onChange={(e) => setFormData({ ...formData, lastServiceHours: parseInt(e.target.value) })} /></Grid>
              </Grid>
              {formData.currentMeterReading > 0 && formData.lastServiceHours > 0 && (
                <Alert severity={formData.currentMeterReading - formData.lastServiceHours >= formData.serviceInterval ? 'warning' : 'info'} sx={{ mt: 2 }}>
                  Hours since last service: {formData.currentMeterReading - formData.lastServiceHours} 
                  {formData.currentMeterReading - formData.lastServiceHours >= formData.serviceInterval ? ' - SERVICE DUE!' : ` - Next service in ${formData.serviceInterval - (formData.currentMeterReading - formData.lastServiceHours)} hours`}
                </Alert>
              )}
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><DocsIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Notes & Comments</Typography></Box>
              <TextField fullWidth multiline rows={6} label="Equipment Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Special operating procedures, known issues, operator notes, etc." />
            </Paper>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.make || !formData.model}>{editingId ? 'Save Changes' : 'Add Equipment'}</Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG - Coming next */}
    </>
  );
}

export default function EquipmentPage() {
  return (<ConvexAuthGuard><EquipmentPageContent /></ConvexAuthGuard>);
}
