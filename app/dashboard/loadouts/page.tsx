"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box, Card, CardContent, Typography, Button, IconButton, Grid, Chip,
  Collapse, Menu, MenuItem, Divider, Avatar, Stack, useMediaQuery, useTheme,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText,
  Tabs, Tab, InputAdornment, Paper, List, ListItem,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon, MoreVert as MoreVertIcon, People as PeopleIcon,
  Construction as EquipmentIcon, AttachMoney as MoneyIcon, TrendingUp as ProductionIcon,
  Speed as SpeedIcon, CheckCircle as ActiveIcon, Pause as InactiveIcon,
  LocalShipping as TruckIcon, Timer as TimerIcon, Assessment as KpiIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { calculateEquipmentCost } from '@/lib/equipment-cost';
import { calculateEmployeeCompensation } from '@/lib/employee-compensation';

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

/**
 * COMPREHENSIVE KPI TRACKING FOR LOADOUTS
 *
 * When combining Equipment + Employees, we track:
 *
 * 1. COST METRICS:
 *    - Total Equipment Cost/Hour (sum of all equipment hourly costs)
 *    - Total Labor Cost/Hour (sum of all employee true costs with burden)
 *    - Overhead/Admin Cost (additional % or fixed amount)
 *    - Total Cost/Hour (Equipment + Labor + Overhead)
 *
 * 2. REVENUE METRICS:
 *    - Billing Rate at 30% margin
 *    - Billing Rate at 40% margin
 *    - Billing Rate at 50% margin
 *    - Billing Rate at 60% margin
 *    - Billing Rate at 70% margin
 *    - Target Margin (default for this loadout)
 *    - Target Billing Rate (at target margin)
 *
 * 3. PROFITABILITY METRICS:
 *    - Profit/Hour at Target Margin
 *    - Profit % (Target Margin)
 *    - Break-even Hours (fixed costs / profit per hour)
 *    - Revenue to Cover Daily Costs (8hrs × cost)
 *
 * 4. PRODUCTION METRICS:
 *    - Production Rate (PpH - Points per Hour)
 *    - Service-specific unit (e.g., trees/day, inch-acres/hr, stumps/hr)
 *    - Efficiency Rating (actual vs. expected production)
 *    - Average Job Duration (based on historical data)
 *
 * 5. UTILIZATION METRICS:
 *    - Total Jobs Completed (historical)
 *    - Total Hours Worked (historical)
 *    - Total Revenue Generated (historical)
 *    - Average Revenue per Job
 *    - Utilization Rate (billable hours / total hours)
 *
 * 6. TEAM COMPOSITION:
 *    - Number of Employees
 *    - Crew Roles (breakdown by position)
 *    - Average Crew Experience (years)
 *    - Certifications Count (ISA, CRA, etc.)
 *
 * 7. EQUIPMENT COMPOSITION:
 *    - Number of Equipment Pieces
 *    - Equipment Categories (trucks, carriers, attachments)
 *    - Total Equipment Value (purchase prices)
 *    - Newest Equipment Age (years)
 *    - Total Horsepower (if applicable)
 *
 * 8. SAFETY METRICS:
 *    - Days Since Last Incident
 *    - Total Incident Count (historical)
 *    - Safety Rating (0-100 score)
 *    - Required PPE List
 *
 * 9. CAPACITY METRICS:
 *    - Max Crew Size
 *    - Equipment Transport Requirements
 *    - Trailer/Truck Capacity Needed
 *    - Setup Time (minutes)
 *
 * 10. FINANCIAL TARGETS:
 *     - Daily Revenue Target (8 hrs × billing rate)
 *     - Weekly Revenue Target (40 hrs × billing rate)
 *     - Monthly Revenue Target (~160 hrs × billing rate)
 *     - Annual Revenue Potential (2000 hrs × billing rate)
 */

interface LoadoutKPIs {
  // Cost Metrics
  totalEquipmentCost: number;
  totalLaborCost: number;
  overheadCost: number;
  totalCostPerHour: number;

  // Revenue Metrics
  billingRates: {
    margin30: number;
    margin40: number;
    margin50: number;
    margin60: number;
    margin70: number;
  };
  targetMargin: number;
  targetBillingRate: number;

  // Profitability
  profitPerHour: number;
  profitPercent: number;
  dailyRevenue: number; // 8 hours
  weeklyRevenue: number; // 40 hours
  monthlyRevenue: number; // 160 hours
  annualRevenuePotential: number; // 2000 hours

  // Production
  productionRate: number;
  productionUnit: string;

  // Team
  employeeCount: number;
  crewRoles: string[];
  avgExperience: number;
  certificationCount: number;

  // Equipment
  equipmentCount: number;
  equipmentCategories: string[];
  totalEquipmentValue: number;
  totalHorsepower: number;

  // Utilization (from historical data)
  totalJobsCompleted: number;
  totalHoursWorked: number;
  totalRevenueGenerated: number;
  avgRevenuePerJob: number;
  utilizationRate: number;

  // Safety
  daysSinceIncident: number;
  safetyRating: number;

  // Capacity
  setupTimeMinutes: number;
  transportRequirements: string;
}

function calculateLoadoutKPIs(loadout: any): LoadoutKPIs {
  const cost = loadout.totalCostPerHour || 0;
  const targetMargin = loadout.targetMargin || 50;
  const targetBillingRate = cost > 0 ? cost / (1 - targetMargin / 100) : 0;

  return {
    // Cost Metrics
    totalEquipmentCost: loadout.totalEquipmentCost || 0,
    totalLaborCost: loadout.totalLaborCost || 0,
    overheadCost: loadout.overheadCost || 0,
    totalCostPerHour: cost,

    // Revenue Metrics
    billingRates: {
      margin30: cost > 0 ? cost / 0.70 : 0,
      margin40: cost > 0 ? cost / 0.60 : 0,
      margin50: cost > 0 ? cost / 0.50 : 0,
      margin60: cost > 0 ? cost / 0.40 : 0,
      margin70: cost > 0 ? cost / 0.30 : 0,
    },
    targetMargin,
    targetBillingRate,

    // Profitability
    profitPerHour: targetBillingRate - cost,
    profitPercent: targetMargin,
    dailyRevenue: targetBillingRate * 8,
    weeklyRevenue: targetBillingRate * 40,
    monthlyRevenue: targetBillingRate * 160,
    annualRevenuePotential: targetBillingRate * 2000,

    // Production
    productionRate: loadout.productionRate || 0,
    productionUnit: getProductionUnit(loadout.serviceType),

    // Team
    employeeCount: loadout.employeeCount || 0,
    crewRoles: loadout.crewRoles || [],
    avgExperience: loadout.avgExperience || 0,
    certificationCount: loadout.certificationCount || 0,

    // Equipment
    equipmentCount: loadout.equipmentCount || 0,
    equipmentCategories: loadout.equipmentCategories || [],
    totalEquipmentValue: loadout.totalEquipmentValue || 0,
    totalHorsepower: loadout.totalHorsepower || 0,

    // Utilization
    totalJobsCompleted: loadout.totalJobsCompleted || 0,
    totalHoursWorked: loadout.totalHoursWorked || 0,
    totalRevenueGenerated: loadout.totalRevenueGenerated || 0,
    avgRevenuePerJob: loadout.totalJobsCompleted > 0
      ? loadout.totalRevenueGenerated / loadout.totalJobsCompleted
      : 0,
    utilizationRate: loadout.utilizationRate || 0,

    // Safety
    daysSinceIncident: loadout.daysSinceIncident || 0,
    safetyRating: loadout.safetyRating || 100,

    // Capacity
    setupTimeMinutes: loadout.setupTimeMinutes || 30,
    transportRequirements: loadout.transportRequirements || 'Standard truck + trailer',
  };
}

function getProductionUnit(serviceType: string): string {
  switch (serviceType) {
    case 'Tree Removal': return 'trees/day';
    case 'Tree Trimming': return 'trees/day';
    case 'Stump Grinding': return 'points/hr';
    case 'Forestry Mulching': return 'IA/hr';
    case 'Land Clearing': return 'days/acre';
    default: return 'units/hr';
  }
}

function LoadoutsPageContent() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLoadout, setSelectedLoadout] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTab, setFormTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Query equipment and employees from Convex
  const equipment = useQuery(api.equipment.list);
  const employees = useQuery(api.employees.list);

  // Mutation for creating loadouts
  const createLoadout = useMutation(api.loadouts.create);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'Tree Removal',
    status: 'Active',
    description: '',
    selectedEquipment: [] as string[],
    selectedEmployees: [] as string[],
    productionRate: 0,
    targetMargin: 50,
    overheadCost: 0,
  });

  // Query loadouts from Convex (will be empty until user creates some)
  const loadouts = useQuery(api.loadouts.list) || [];

  const handleExpandClick = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, loadout: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedLoadout(loadout);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLoadout(null);
  };

  const handleEdit = () => {
    // TODO: Open edit dialog
    handleMenuClose();
  };

  const handleDuplicate = () => {
    // TODO: Duplicate loadout
    handleMenuClose();
  };

  const handleDelete = () => {
    // TODO: Delete loadout
    if (confirm(`Delete ${selectedLoadout?.name}?`)) {
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Loadouts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Loadout
        </Button>
      </Box>

      {/* Empty State */}
      {loadouts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <EquipmentIcon sx={{ fontSize: 64, color: '#8E8E93', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            No Loadouts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Create your first loadout by combining equipment and crew members.
            Loadouts help you track costs, calculate billing rates, and manage your operations efficiently.
          </Typography>
          <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Create Your First Loadout
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {loadouts.map((loadout) => {
          const kpis = calculateLoadoutKPIs(loadout);
          const isExpanded = expandedCard === loadout._id;

          return (
            <Card key={loadout._id} sx={{
              bgcolor: '#1C1C1E',
              border: '1px solid #2C2C2E',
              transition: 'all 0.3s',
              '&:hover': { borderColor: '#007AFF' },
            }}>
              {/* Horizontal Collapsed View - Always Visible */}
              <CardContent sx={{ pb: 1, cursor: 'pointer' }} onClick={() => handleExpandClick(loadout._id)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  {/* Icon/Avatar and Title */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 280, flex: { xs: '1 1 100%', md: '0 0 280px' } }}>
                    <Avatar sx={{
                      bgcolor: loadout.status === 'Active' ? '#34C759' : '#8E8E93',
                      width: 48,
                      height: 48,
                    }}>
                      {loadout.serviceType === 'Tree Removal' ? <PeopleIcon /> :
                       loadout.serviceType === 'Forestry Mulching' ? <EquipmentIcon /> :
                       loadout.serviceType === 'Stump Grinding' ? <EquipmentIcon /> : <EquipmentIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                        {loadout.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={loadout.serviceType}
                          size="small"
                          sx={{ bgcolor: '#007AFF', color: '#FFF', height: 20, fontSize: '0.7rem' }}
                        />
                        <Chip
                          icon={loadout.status === 'Active' ? <ActiveIcon sx={{ fontSize: 12 }} /> : <InactiveIcon sx={{ fontSize: 12 }} />}
                          label={loadout.status}
                          size="small"
                          sx={{
                            bgcolor: loadout.status === 'Active' ? '#34C75930' : '#8E8E9330',
                            color: loadout.status === 'Active' ? '#34C759' : '#8E8E93',
                            height: 20,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>

                  {/* Key Metrics - Horizontal */}
                  <Box sx={{
                    display: 'flex',
                    gap: 3,
                    flex: 1,
                    justifyContent: 'space-between',
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    minWidth: { xs: '100%', md: 0 },
                  }}>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                        Cost/Hour
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        ${(kpis?.totalCostPerHour || 0).toFixed(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                        Billing Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#34C759', fontSize: '1rem' }}>
                        ${(kpis?.targetBillingRate || 0).toFixed(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                        Profit/Hour
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF9500', fontSize: '1rem' }}>
                        ${(kpis?.profitPerHour || 0).toFixed(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 80 }}>
                      <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                        Margin
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {kpis.targetMargin}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Menu and Expand Indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, loadout)}
                      sx={{ color: '#8E8E93' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#8E8E93' }}>
                      <ExpandMoreIcon sx={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                      }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>

                {/* Expanded View - Collapsible */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Divider sx={{ borderColor: '#2C2C2E' }} />
                  <CardContent>
                    {/* Description */}
                    {loadout.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {loadout.description}
                      </Typography>
                    )}

                    {/* Team & Equipment Composition */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PeopleIcon sx={{ color: '#007AFF' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Team Composition</Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Crew Size</Typography>
                              <Typography variant="body2">{kpis.employeeCount} members</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Avg Experience</Typography>
                              <Typography variant="body2">{kpis.avgExperience} years</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Certifications</Typography>
                              <Typography variant="body2">{kpis.certificationCount} total</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Labor Cost</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${(kpis?.totalLaborCost || 0).toFixed(0)}/hr
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <EquipmentIcon sx={{ color: '#FF9500' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Equipment</Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Equipment Count</Typography>
                              <Typography variant="body2">{kpis.equipmentCount} pieces</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Total Value</Typography>
                              <Typography variant="body2">
                                ${((kpis?.totalEquipmentValue || 0) / 1000).toFixed(0)}k
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Total HP</Typography>
                              <Typography variant="body2">{kpis?.totalHorsepower || 0} HP</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Equipment Cost</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${(kpis?.totalEquipmentCost || 0).toFixed(0)}/hr
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Revenue Targets */}
                    <Paper sx={{ p: 2, bgcolor: '#34C75920', border: '1px solid #34C759', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <MoneyIcon sx={{ color: '#34C759' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#34C759' }}>
                          Revenue Targets
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Daily (8hrs)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${(kpis?.dailyRevenue || 0).toFixed(0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Weekly (40hrs)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${(kpis?.weeklyRevenue || 0).toFixed(0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Monthly (160hrs)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${((kpis?.monthlyRevenue || 0) / 1000).toFixed(1)}k
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Annual Potential</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${((kpis?.annualRevenuePotential || 0) / 1000).toFixed(0)}k
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Margin Breakdown */}
                    <Paper sx={{ p: 2, bgcolor: '#2C2C2E', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ProductionIcon sx={{ color: '#007AFF' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Billing Rates at Different Margins
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={2.4}>
                          <Typography variant="caption" color="text.secondary">30% Margin</Typography>
                          <Typography variant="body2">${(kpis?.billingRates?.margin30 || 0).toFixed(0)}/hr</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                          <Typography variant="caption" color="text.secondary">40% Margin</Typography>
                          <Typography variant="body2">${(kpis?.billingRates?.margin40 || 0).toFixed(0)}/hr</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                          <Typography variant="caption" sx={{ color: '#34C759' }}>50% Margin</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>
                            ${(kpis?.billingRates?.margin50 || 0).toFixed(0)}/hr
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                          <Typography variant="caption" color="text.secondary">60% Margin</Typography>
                          <Typography variant="body2">${(kpis?.billingRates?.margin60 || 0).toFixed(0)}/hr</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                          <Typography variant="caption" color="text.secondary">70% Margin</Typography>
                          <Typography variant="body2">${(kpis?.billingRates?.margin70 || 0).toFixed(0)}/hr</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Historical Performance */}
                    <Paper sx={{ p: 2, bgcolor: '#2C2C2E', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <KpiIcon sx={{ color: '#FF9500' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Historical Performance
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Jobs Completed</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kpis.totalJobsCompleted}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kpis.totalHoursWorked.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Revenue Generated</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>
                            ${((kpis?.totalRevenueGenerated || 0) / 1000).toFixed(0)}k
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">Avg Revenue/Job</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${(kpis?.avgRevenuePerJob || 0).toFixed(0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Production & Safety */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <SpeedIcon sx={{ color: '#007AFF' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Production</Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Production Rate</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {kpis.productionRate} {kpis.productionUnit}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Utilization Rate</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {((kpis?.utilizationRate || 0) * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Setup Time</Typography>
                              <Typography variant="body2">{kpis.setupTimeMinutes} min</Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: '#34C75920', border: '1px solid #34C759' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ActiveIcon sx={{ color: '#34C759' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#34C759' }}>
                              Safety Record
                            </Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Days Since Incident</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>
                                {kpis.daysSinceIncident}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Safety Rating</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>
                                {kpis.safetyRating}/100
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Transport Requirements */}
                    <Paper sx={{ p: 2, bgcolor: '#2C2C2E', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TruckIcon sx={{ color: '#8E8E93' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Transport Requirements</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {kpis.transportRequirements}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Collapse>
              </Card>
          );
        })}
      </Stack>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#1C1C1E',
            border: '1px solid #2C2C2E',
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Loadout
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <CopyIcon sx={{ mr: 1, fontSize: 20 }} />
          Duplicate
        </MenuItem>
        <Divider sx={{ borderColor: '#2C2C2E' }} />
        <MenuItem onClick={handleDelete} sx={{ color: '#FF3B30' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* FAB for mobile - Hidden since top button works */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'none', // Disabled - use top button instead
        }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* New Loadout Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1C1C1E',
            border: '1px solid #2C2C2E',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Create New Loadout</Typography>
            <IconButton size="small" onClick={() => setDialogOpen(false)} sx={{ color: '#8E8E93' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Tabs
          value={formTab}
          onChange={(_, v) => setFormTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: '#2C2C2E',
            px: 3,
            '& .MuiTab-root': {
              color: '#8E8E93',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.95rem',
            },
            '& .Mui-selected': {
              color: '#007AFF !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#007AFF',
            }
          }}
        >
          <Tab label="Basic Info" />
          <Tab label="Equipment" />
          <Tab label="Crew" />
          <Tab label="Financial" />
        </Tabs>

        <DialogContent sx={{ minHeight: 500, p: 4 }}>
          {/* Tab 0: Basic Info */}
          {formTab === 0 && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Set up the basic information for this loadout configuration.
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Loadout Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 2-Man Climbing Crew"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#0A0A0A',
                    }
                  }}
                />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Service Type</InputLabel>
                      <Select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        label="Service Type"
                        sx={{
                          bgcolor: '#0A0A0A',
                        }}
                      >
                        {SERVICE_TYPES.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        label="Status"
                        sx={{
                          bgcolor: '#0A0A0A',
                        }}
                      >
                        <MenuItem value="Active">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ActiveIcon sx={{ fontSize: 18, color: '#34C759' }} />
                            Active
                          </Box>
                        </MenuItem>
                        <MenuItem value="Inactive">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InactiveIcon sx={{ fontSize: 18, color: '#8E8E93' }} />
                            Inactive
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this loadout's purpose and capabilities..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#0A0A0A',
                    }
                  }}
                />
              </Stack>
            </Box>
          )}

          {/* Tab 1: Equipment */}
          {formTab === 1 && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Select equipment for this loadout. Costs will be calculated automatically.
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Equipment</InputLabel>
                <Select
                  multiple
                  value={formData.selectedEquipment}
                  onChange={(e) => setFormData({ ...formData, selectedEquipment: e.target.value as string[] })}
                  input={<OutlinedInput label="Select Equipment" />}
                  renderValue={(selected) => `${selected.length} piece(s) selected`}
                  sx={{ bgcolor: '#0A0A0A' }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#1C1C1E',
                        maxHeight: 400,
                      }
                    }
                  }}
                >
                  {equipment?.map((eq) => {
                    const costPerHour = ((eq.purchasePrice / eq.usefulLifeYears + (eq.fuelConsumptionGPH || 0) * (eq.fuelPricePerGallon || 0) * eq.annualHours + (eq.maintenanceCostAnnual || 0)) / eq.annualHours) || 0;
                    return (
                      <MenuItem key={eq._id} value={eq._id}>
                        <Checkbox checked={formData.selectedEquipment.indexOf(eq._id) > -1} />
                        <ListItemText
                          primary={eq.nickname || `${eq.year} ${eq.make} ${eq.model}`}
                          secondary={`${eq.equipmentSubcategory} • $${(costPerHour || 0).toFixed(0)}/hr`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ color: '#8E8E93' }}
                        />
                      </MenuItem>
                    );
                  }) || []}
                </Select>
              </FormControl>

              {formData.selectedEquipment.length > 0 && (
                <Paper sx={{ mt: 4, p: 3, bgcolor: '#0A0A0A', border: '1px solid #2C2C2E' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <EquipmentIcon sx={{ color: '#FF9500' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Selected Equipment ({formData.selectedEquipment.length})
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    {formData.selectedEquipment.map(eqId => {
                      const eq = equipment?.find(e => e._id === eqId);
                      if (!eq) return null;
                      const costPerHour = ((eq.purchasePrice / eq.usefulLifeYears + (eq.fuelConsumptionGPH || 0) * (eq.fuelPricePerGallon || 0) * eq.annualHours + (eq.maintenanceCostAnnual || 0)) / eq.annualHours) || 0;
                      return (
                        <Box key={eqId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#1C1C1E', borderRadius: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {eq.nickname || `${eq.year} ${eq.make} ${eq.model}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {eq.equipmentSubcategory}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF9500' }}>
                            ${(costPerHour || 0).toFixed(0)}/hr
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 2: Crew */}
          {formTab === 2 && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Select crew members for this loadout. Labor costs include burden multiplier (1.7x).
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Crew Members</InputLabel>
                <Select
                  multiple
                  value={formData.selectedEmployees}
                  onChange={(e) => setFormData({ ...formData, selectedEmployees: e.target.value as string[] })}
                  input={<OutlinedInput label="Select Crew Members" />}
                  renderValue={(selected) => `${selected.length} member(s) selected`}
                  sx={{ bgcolor: '#0A0A0A' }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#1C1C1E',
                        maxHeight: 400,
                      }
                    }
                  }}
                >
                  {employees?.map((emp) => {
                    const trueCost = emp.baseHourlyRate * 1.7;
                    return (
                      <MenuItem key={emp._id} value={emp._id}>
                        <Checkbox checked={formData.selectedEmployees.indexOf(emp._id) > -1} />
                        <ListItemText
                          primary={`${emp.firstName} ${emp.lastName}`}
                          secondary={`${emp.primaryTrack} Tier ${emp.tier} • $${trueCost.toFixed(0)}/hr`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ color: '#8E8E93' }}
                        />
                      </MenuItem>
                    );
                  }) || []}
                </Select>
              </FormControl>

              {formData.selectedEmployees.length > 0 && (
                <Paper sx={{ mt: 4, p: 3, bgcolor: '#0A0A0A', border: '1px solid #2C2C2E' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <PeopleIcon sx={{ color: '#007AFF' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Selected Crew ({formData.selectedEmployees.length})
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    {formData.selectedEmployees.map(empId => {
                      const emp = employees?.find(e => e._id === empId);
                      if (!emp) return null;
                      const trueCost = emp.baseHourlyRate * 1.7;
                      return (
                        <Box key={empId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#1C1C1E', borderRadius: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {emp.firstName} {emp.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp.primaryTrack} Tier {emp.tier}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#007AFF' }}>
                            ${trueCost.toFixed(0)}/hr
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )}
            </Box>
          )}

          {/* Tab 3: Financial */}
          {formTab === 3 && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Set production rates and financial targets for this loadout.
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Production Rate"
                      value={formData.productionRate}
                      onChange={(e) => setFormData({ ...formData, productionRate: parseFloat(e.target.value) })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{getProductionUnit(formData.serviceType)}</InputAdornment>
                      }}
                      helperText="Expected productivity for this loadout"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0A0A0A',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Target Margin"
                      value={formData.targetMargin}
                      onChange={(e) => setFormData({ ...formData, targetMargin: parseFloat(e.target.value) })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      helperText="Desired profit margin (typically 40-60%)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0A0A0A',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Overhead/Admin Cost (optional)"
                      value={formData.overheadCost}
                      onChange={(e) => setFormData({ ...formData, overheadCost: parseFloat(e.target.value) })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/hr</InputAdornment>
                      }}
                      helperText="Additional overhead beyond equipment + labor"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0A0A0A',
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>

              {/* Live Cost Preview */}
              {(formData.selectedEquipment.length > 0 || formData.selectedEmployees.length > 0) && (() => {
                // Calculate equipment cost once
                const equipmentCost = formData.selectedEquipment.reduce((sum, eqId) => {
                  const eq = equipment?.find(e => e._id === eqId);
                  if (!eq) return sum;
                  const cost = calculateEquipmentCost({
                    purchasePrice: eq.purchasePrice,
                    usefulLifeYears: eq.usefulLifeYears,
                    financeRate: eq.financeRate || 0,
                    insuranceCost: eq.insuranceCost || 0,
                    registrationCost: eq.registrationCost || 0,
                    fuelConsumptionGPH: eq.fuelConsumptionGPH || 0,
                    fuelPricePerGallon: eq.fuelPricePerGallon || 0,
                    maintenanceCostAnnual: eq.maintenanceCostAnnual || 0,
                    repairCostAnnual: eq.repairCostAnnual || 0,
                    annualHours: eq.annualHours,
                  });
                  return sum + cost.totalPerHour;
                }, 0);

                // Calculate labor cost once
                const laborCost = formData.selectedEmployees.reduce((sum, empId) => {
                  const emp = employees?.find(e => e._id === empId);
                  if (!emp) return sum;
                  const cost = calculateEmployeeCompensation({
                    baseHourlyRate: emp.baseHourlyRate,
                    tier: emp.tier || 1,
                    leadership: emp.leadership,
                    equipmentCerts: emp.equipmentCerts || [],
                    driverLicenses: emp.driverLicenses || [],
                    certifications: emp.certifications || [],
                  });
                  return sum + cost.trueCost;
                }, 0);

                const totalCost = equipmentCost + laborCost + formData.overheadCost;
                const billingRate = totalCost / (1 - formData.targetMargin / 100);

                return (
                  <Paper sx={{ mt: 3, p: 3, bgcolor: '#2C2C2E', border: '2px solid #007AFF' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#007AFF' }}>
                      Cost Preview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Equipment Cost</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ${equipmentCost.toFixed(0)}/hr
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Labor Cost</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ${laborCost.toFixed(0)}/hr
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Total Cost</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF9500' }}>
                          ${totalCost.toFixed(0)}/hr
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Billing Rate ({formData.targetMargin}%)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#34C759' }}>
                          ${billingRate.toFixed(0)}/hr
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })()}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #2C2C2E' }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              // Validate form data
              if (!formData.name.trim()) {
                alert('Please enter a loadout name');
                return;
              }
              if (formData.selectedEquipment.length === 0) {
                alert('Please select at least one piece of equipment');
                return;
              }
              if (formData.selectedEmployees.length === 0) {
                alert('Please select at least one crew member');
                return;
              }
              if (formData.productionRate <= 0) {
                alert('Please enter a production rate greater than 0');
                return;
              }

              try {
                console.log('Creating loadout with data:', formData);
                const loadoutId = await createLoadout({
                  name: formData.name,
                  serviceType: formData.serviceType,
                  equipmentIds: formData.selectedEquipment as Id<"equipment">[],
                  employeeIds: formData.selectedEmployees as Id<"employees">[],
                  productionRate: formData.productionRate,
                  status: formData.status,
                });

                console.log('Loadout created successfully with ID:', loadoutId);

                // Show success message
                alert(`Loadout "${formData.name}" created successfully!`);

                // Reset form and close dialog
                setFormData({
                  name: '',
                  serviceType: 'Tree Removal',
                  status: 'Active',
                  description: '',
                  selectedEquipment: [],
                  selectedEmployees: [],
                  productionRate: 0,
                  targetMargin: 50,
                  overheadCost: 0,
                });
                setFormTab(0);
                setDialogOpen(false);
              } catch (error: any) {
                console.error('Failed to create loadout:', error);
                alert(`Failed to create loadout: ${error?.message || 'Unknown error'}. Please try again.`);
              }
            }}
            disabled={!formData.name || formData.selectedEquipment.length === 0 || formData.selectedEmployees.length === 0 || formData.productionRate <= 0}
          >
            Create Loadout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
