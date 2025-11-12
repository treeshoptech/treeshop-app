"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box, Card, CardContent, Typography, Button, IconButton, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Fab,
  Tabs, Tab, Divider, List, ListItem, ListItemText, Avatar, Paper,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, Alert, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ContentCopy as CopyIcon,
  Search as SearchIcon, Close as CloseIcon, People as PeopleIcon, Construction as EquipmentIcon,
  AttachMoney as MoneyIcon, TrendingUp as ProductionIcon, Security as SafetyIcon,
  Schedule as ScheduleIcon, CheckCircle as CheckIcon, Warning as WarningIcon,
  PlayArrow as ActiveIcon, Pause as InactiveIcon,
} from '@mui/icons-material';

const SERVICE_TYPES = [
  'Tree Removal', 'Tree Trimming', 'Stump Grinding', 'Forestry Mulching',
  'Land Clearing', 'Emergency Response', 'Consulting/Assessment',
];

export default function LoadoutsPage() {
  return (
    <ConvexAuthGuard>
      <LoadoutsPageContent />
    </ConvexAuthGuard>
  );
}

function LoadoutsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoadout, setEditingLoadout] = useState<any>(null);
  const [formTab, setFormTab] = useState(0);

  // Hardcoded loadouts for demo (will connect to Convex later)
  const loadouts = [
    {
      _id: '1',
      name: '2-Man Climbing Crew',
      serviceType: 'Tree Removal',
      status: 'Active',
      equipmentCount: 4,
      employeeCount: 2,
      totalCostPerHour: 243,
      targetMargin: 35,
      billingRate: 373.85,
      profitPerHour: 130.85,
      productionRate: 5, // trees per day
    },
    {
      _id: '2',
      name: 'Forestry Mulching Unit',
      serviceType: 'Forestry Mulching',
      status: 'Active',
      equipmentCount: 3,
      employeeCount: 2,
      totalCostPerHour: 286,
      targetMargin: 50,
      billingRate: 572,
      profitPerHour: 286,
      productionRate: 1.5, // inch-acres per hour
    },
    {
      _id: '3',
      name: 'Stump Grinding Service',
      serviceType: 'Stump Grinding',
      status: 'Active',
      equipmentCount: 2,
      employeeCount: 1,
      totalCostPerHour: 125,
      targetMargin: 40,
      billingRate: 208.33,
      profitPerHour: 83.33,
      productionRate: 400, // stump score per hour
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'Tree Removal',
    status: 'Active',
    description: '',
    // Labor
    employees: [] as any[],
    // Equipment
    equipment: [] as any[],
    // Financial
    targetMargin: 35,
    minimumMargin: 30,
    // Production
    productionRate: 0,
    productionUnit: 'trees/day',
    // Safety
    minimumCrewSize: 2,
    requiredPPE: [] as string[],
    requiredSafetyEquipment: [] as string[],
    // Scheduling
    minimumBookingHours: 4,
    travelBufferMinutes: 30,
    setupTimeMinutes: 15,
    cleanupTimeMinutes: 15,
  });

  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [equipmentDialog, setEquipmentDialog] = useState(false);

  // Mock data for employees and equipment
  const availableEmployees = [
    { _id: 'e1', code: 'TRS4+L+E2+ISA', name: 'John Doe', baseRate: 65, tier: 4, trueCost: 110.50 },
    { _id: 'e2', code: 'TRS2+E1', name: 'Jane Smith', baseRate: 35, tier: 2, trueCost: 59.50 },
    { _id: 'e3', code: 'MUL4+E4', name: 'Mike Johnson', baseRate: 45, tier: 4, trueCost: 76.50 },
  ];

  const availableEquipment = [
    { _id: 'eq1', name: 'Ford F450 Chip Truck', type: 'Truck', costPerHour: 25 },
    { _id: 'eq2', name: '12" Bandit Chipper', type: 'Chipper', costPerHour: 35 },
    { _id: 'eq3', name: 'CAT 265 Mulcher', type: 'Mulcher', costPerHour: 114.73 },
    { _id: 'eq4', name: 'Vermeer SC60TX Stump Grinder', type: 'Stump Grinder', costPerHour: 45 },
  ];

  const handleOpenDialog = (loadout?: any) => {
    if (loadout) {
      setEditingLoadout(loadout);
      // Load loadout data into form
    } else {
      setEditingLoadout(null);
      setFormData({
        name: '',
        serviceType: 'Tree Removal',
        status: 'Active',
        description: '',
        employees: [],
        equipment: [],
        targetMargin: 35,
        minimumMargin: 30,
        productionRate: 0,
        productionUnit: 'trees/day',
        minimumCrewSize: 2,
        requiredPPE: [],
        requiredSafetyEquipment: [],
        minimumBookingHours: 4,
        travelBufferMinutes: 30,
        setupTimeMinutes: 15,
        cleanupTimeMinutes: 15,
      });
    }
    setDialogOpen(true);
    setFormTab(0);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLoadout(null);
  };

  const handleSave = () => {
    console.log('Saving loadout:', formData);
    // TODO: Save to Convex
    handleCloseDialog();
  };

  const addEmployee = (employee: any) => {
    setFormData({
      ...formData,
      employees: [...formData.employees, {
        employeeId: employee._id,
        name: employee.name,
        code: employee.code,
        trueCost: employee.trueCost,
        role: 'Crew Member',
      }]
    });
    setEmployeeDialog(false);
  };

  const removeEmployee = (index: number) => {
    setFormData({
      ...formData,
      employees: formData.employees.filter((_, i) => i !== index)
    });
  };

  const addEquipment = (equipment: any) => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, {
        equipmentId: equipment._id,
        name: equipment.name,
        type: equipment.type,
        costPerHour: equipment.costPerHour,
      }]
    });
    setEquipmentDialog(false);
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index)
    });
  };

  // Calculate totals
  const totalLaborCost = formData.employees.reduce((sum, emp) => sum + emp.trueCost, 0);
  const totalEquipmentCost = formData.equipment.reduce((sum, eq) => sum + eq.costPerHour, 0);
  const totalCostPerHour = totalLaborCost + totalEquipmentCost;
  const billingRate = totalCostPerHour / (1 - formData.targetMargin / 100);
  const profitPerHour = billingRate - totalCostPerHour;
  const actualMarginPercent = (profitPerHour / billingRate) * 100;

  const marginColor = actualMarginPercent >= 35 ? '#34C759' : actualMarginPercent >= 30 ? '#FF9500' : '#FF3B30';

  const filteredLoadouts = loadouts.filter(loadout => {
    const matchesSearch = loadout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = serviceFilter === 'All' || loadout.serviceType === serviceFilter;
    const matchesStatus = statusFilter === 'All' || loadout.status === statusFilter;
    return matchesSearch && matchesService && matchesStatus;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000000', color: '#ffffff', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#ffffff' }}>
            Loadouts
          </Typography>
          <Typography variant="body2" sx={{ color: '#8e8e93', mt: 0.5 }}>
            {filteredLoadouts.length} loadout{filteredLoadouts.length !== 1 ? 's' : ''} configured
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#007AFF',
            color: '#ffffff',
            textTransform: 'none',
            px: 3,
            '&:hover': { bgcolor: '#0051D5' },
          }}
        >
          New Loadout
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search loadouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#8e8e93' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  bgcolor: '#000000',
                  '& fieldset': { borderColor: '#2c2c2e' },
                  '&:hover fieldset': { borderColor: '#007AFF' },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Service Type"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              sx={textFieldStyle}
            >
              <MenuItem value="All">All Services</MenuItem>
              {SERVICE_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={textFieldStyle}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Loadout Cards */}
      <Grid container spacing={3}>
        {filteredLoadouts.map((loadout) => (
          <Grid item xs={12} md={6} lg={4} key={loadout._id}>
            <Card sx={{ bgcolor: '#1c1c1e', border: '1px solid #2c2c2e', height: '100%' }}>
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                      {loadout.name}
                    </Typography>
                    <Chip
                      label={loadout.serviceType}
                      size="small"
                      sx={{
                        bgcolor: '#2c2c2e',
                        color: '#007AFF',
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(loadout)}
                      sx={{ color: '#007AFF' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ color: '#8e8e93' }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />

                {/* Composition */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ color: '#007AFF', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#8e8e93', fontSize: '0.75rem' }}>
                          Crew
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {loadout.employeeCount} members
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EquipmentIcon sx={{ color: '#007AFF', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#8e8e93', fontSize: '0.75rem' }}>
                          Equipment
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {loadout.equipmentCount} items
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />

                {/* Financial Summary */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8e8e93' }}>
                      Hourly Cost
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      ${loadout.totalCostPerHour.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8e8e93' }}>
                      Target Margin
                    </Typography>
                    <Chip
                      label={`${loadout.targetMargin}%`}
                      size="small"
                      sx={{
                        bgcolor: loadout.targetMargin >= 35 ? '#34C759' : loadout.targetMargin >= 30 ? '#FF9500' : '#FF3B30',
                        color: '#ffffff',
                        fontWeight: 600,
                        height: 20,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8e8e93' }}>
                      Billing Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#007AFF', fontWeight: 600 }}>
                      ${loadout.billingRate.toFixed(2)}/hr
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#8e8e93' }}>
                      Profit/Hour
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#34C759', fontWeight: 600 }}>
                      +${loadout.profitPerHour.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />

                {/* Production Rate */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProductionIcon sx={{ color: '#007AFF', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#8e8e93' }}>
                    Production:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {loadout.productionRate} {loadout.serviceType === 'Forestry Mulching' ? 'IA/hr' : loadout.serviceType === 'Stump Grinding' ? 'pts/hr' : 'trees/day'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Loadout Builder Dialog - Continued in next message due to length */}
    </Box>
  );
}

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    bgcolor: '#000000',
    '& fieldset': { borderColor: '#2c2c2e' },
    '&:hover fieldset': { borderColor: '#007AFF' },
    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
  },
  '& .MuiInputLabel-root': { color: '#8e8e93' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
  '& .MuiFormHelperText-root': { color: '#8e8e93' },
};
