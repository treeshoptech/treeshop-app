"use client";

import { useState, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Divider, Stack, Avatar, Alert,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Assessment, AttachMoney, Build,
  People, LocalShipping, Speed, CheckCircle, Warning,
  Schedule, CalendarToday, ShowChart, PieChart,
} from '@mui/icons-material';
import { calculateEquipmentCost } from '@/lib/equipment-cost';
import { calculateEmployeeCompensation } from '@/lib/employee-compensation';
import TimeCostAnalytics from '@/app/components/dashboard/TimeCostAnalytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ReportsPageContent() {
  const [activeTab, setActiveTab] = useState(0);

  // Fetch all data
  const equipment = useQuery(api.equipment.list) || [];
  const employees = useQuery(api.employees.list) || [];
  const loadouts = useQuery(api.loadouts.list) || [];
  const customers = useQuery(api.customers.list) || [];
  const projects = useQuery(api.projects.list) || [];

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    // Equipment Analytics
    const equipmentByStatus = equipment.reduce((acc: any, eq) => {
      acc[eq.status] = (acc[eq.status] || 0) + 1;
      return acc;
    }, {});

    const equipmentCosts = equipment.map(eq => {
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
      return {
        ...eq,
        hourlyRate: cost.totalPerHour,
        annualCost: cost.totalPerYear,
        ownershipCost: cost.ownershipPerHour,
        operatingCost: cost.operatingPerHour,
      };
    });

    const totalEquipmentValue = equipment.reduce((sum, eq) => sum + eq.purchasePrice, 0);
    const totalEquipmentCostPerHour = equipmentCosts.reduce((sum, eq) => sum + eq.hourlyRate, 0);
    const totalEquipmentCostPerYear = equipmentCosts.reduce((sum, eq) => sum + eq.annualCost, 0);

    // Employee Analytics
    const employeesByStatus = employees.reduce((acc: any, emp) => {
      acc[emp.employmentStatus] = (acc[emp.employmentStatus] || 0) + 1;
      return acc;
    }, {});

    const employeesByTier = employees.reduce((acc: any, emp) => {
      const tier = `Tier ${emp.tier}`;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    const employeeCosts = employees.map(emp => {
      const cost = calculateEmployeeCompensation({
        baseHourlyRate: emp.baseHourlyRate,
        tier: emp.tier || 1,
        leadership: emp.leadership,
        equipmentCerts: emp.equipmentCerts || [],
        driverLicenses: emp.driverLicenses || [],
        certifications: emp.certifications || [],
      });
      return {
        ...emp,
        trueCostPerHour: cost.trueCost,
        totalHourly: cost.totalHourly,
        baseTiered: cost.baseTiered,
      };
    });

    const totalLaborCostPerHour = employeeCosts.reduce((sum, emp) => sum + emp.trueCostPerHour, 0);
    const totalLaborCostPerYear = totalLaborCostPerHour * 2000; // Assuming 2000 hours/year
    const avgEmployeeRate = employees.length > 0 ? totalLaborCostPerHour / employees.length : 0;

    // Loadout Analytics
    const loadoutsByService = loadouts.reduce((acc: any, lo) => {
      acc[lo.serviceType] = (acc[lo.serviceType] || 0) + 1;
      return acc;
    }, {});

    const totalLoadouts = loadouts.length;
    const avgLoadoutCost = loadouts.length > 0
      ? loadouts.reduce((sum, lo) => sum + (lo.totalCostPerHour || 0), 0) / loadouts.length
      : 0;

    // Project Analytics
    const projectsByStatus = projects.reduce((acc: any, proj) => {
      acc[proj.status] = (acc[proj.status] || 0) + 1;
      return acc;
    }, {});

    const projectsByService = projects.reduce((acc: any, proj) => {
      acc[proj.serviceType] = (acc[proj.serviceType] || 0) + 1;
      return acc;
    }, {});

    // Customer Analytics
    const totalCustomers = customers.length;
    const avgCustomerRevenue = customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0) / customers.length
      : 0;

    return {
      equipment: {
        total: equipment.length,
        byStatus: equipmentByStatus,
        costs: equipmentCosts,
        totalValue: totalEquipmentValue,
        totalCostPerHour: totalEquipmentCostPerHour,
        totalCostPerYear: totalEquipmentCostPerYear,
        avgHourlyCost: equipment.length > 0 ? totalEquipmentCostPerHour / equipment.length : 0,
      },
      employees: {
        total: employees.length,
        byStatus: employeesByStatus,
        byTier: employeesByTier,
        costs: employeeCosts,
        totalCostPerHour: totalLaborCostPerHour,
        totalCostPerYear: totalLaborCostPerYear,
        avgRate: avgEmployeeRate,
      },
      loadouts: {
        total: totalLoadouts,
        byService: loadoutsByService,
        avgCost: avgLoadoutCost,
        data: loadouts,
      },
      projects: {
        total: projects.length,
        byStatus: projectsByStatus,
        byService: projectsByService,
      },
      customers: {
        total: totalCustomers,
        avgRevenue: avgCustomerRevenue,
      },
      financials: {
        totalAssetValue: totalEquipmentValue,
        totalAnnualOperatingCost: totalEquipmentCostPerYear + totalLaborCostPerYear,
        totalHourlyCost: totalEquipmentCostPerHour + totalLaborCostPerHour,
      },
    };
  }, [equipment, employees, loadouts, projects, customers]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Business Analytics & Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive insights into equipment utilization, labor costs, profitability, and operational efficiency
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<Build />} label="Equipment Utilization" iconPosition="start" />
        <Tab icon={<AttachMoney />} label="Loadout Profitability" iconPosition="start" />
        <Tab icon={<People />} label="Employee Performance" iconPosition="start" />
        <Tab icon={<Assessment />} label="Project Analytics" iconPosition="start" />
        <Tab icon={<ShowChart />} label="Financial Dashboard" iconPosition="start" />
        <Tab icon={<PieChart />} label="Pipeline Tracking" iconPosition="start" />
        <Tab icon={<Speed />} label="Time & Cost Analytics" iconPosition="start" />
        <Tab icon={<TrendingUp />} label="Lead Generation" iconPosition="start" />
        <Tab icon={<CheckCircle />} label="Proposal Performance" iconPosition="start" />
        <Tab icon={<LocalShipping />} label="Work Order Execution" iconPosition="start" />
        <Tab icon={<People />} label="Customer Intelligence" iconPosition="start" />
        <Tab icon={<Assessment />} label="Business Dashboard" iconPosition="start" />
      </Tabs>

      {/* REPORT 1: Equipment Utilization */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#007AFF' }}>
                    <Build />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Equipment</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{analytics.equipment.total}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#34C759' }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Asset Value</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${analytics.equipment.totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF9500' }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Cost per Hour</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${analytics.equipment.totalCostPerHour.toFixed(0)}/hr
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF3B30' }}>
                    <CalendarToday />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Annual Cost</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${(analytics.equipment.totalCostPerYear / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Equipment Status Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Equipment by Status</Typography>
                {Object.entries(analytics.equipment.byStatus).map(([status, count]: any) => (
                  <Box key={status} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {count} ({((count / analytics.equipment.total) * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / analytics.equipment.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Top 5 Most Expensive Equipment */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Most Expensive Equipment ($/hr)</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Equipment</TableCell>
                        <TableCell align="right">Hourly Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.equipment.costs
                        .sort((a, b) => b.hourlyRate - a.hourlyRate)
                        .slice(0, 5)
                        .map((eq) => (
                          <TableRow key={eq._id}>
                            <TableCell>
                              {eq.nickname || `${eq.year} ${eq.make} ${eq.model}`}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#FF9500' }}>
                              ${eq.hourlyRate.toFixed(2)}/hr
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Equipment Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>All Equipment - Cost Breakdown</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Equipment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Purchase Price</TableCell>
                        <TableCell align="right">Ownership Cost</TableCell>
                        <TableCell align="right">Operating Cost</TableCell>
                        <TableCell align="right">Total ($/hr)</TableCell>
                        <TableCell align="right">Annual Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.equipment.costs.map((eq) => (
                        <TableRow key={eq._id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {eq.nickname || `${eq.year} ${eq.make} ${eq.model}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {eq.equipmentSubcategory}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={eq.status} size="small" color={
                              eq.status === 'Available' ? 'success' :
                              eq.status === 'In Use' ? 'primary' :
                              eq.status === 'Maintenance' ? 'warning' : 'default'
                            } />
                          </TableCell>
                          <TableCell align="right">${eq.purchasePrice.toLocaleString()}</TableCell>
                          <TableCell align="right">${eq.ownershipCost.toFixed(2)}</TableCell>
                          <TableCell align="right">${eq.operatingCost.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#007AFF' }}>
                            ${eq.hourlyRate.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">${eq.annualCost.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* REPORT 2: Loadout Profitability */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#007AFF' }}>
                    <LocalShipping />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Loadouts</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{analytics.loadouts.total}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF9500' }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Avg Loadout Cost</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${analytics.loadouts.avgCost.toFixed(0)}/hr
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#34C759' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Avg Billing Rate (50%)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${(analytics.loadouts.avgCost * 2).toFixed(0)}/hr
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Loadouts by Service Type */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Loadouts by Service Type</Typography>
                {Object.entries(analytics.loadouts.byService).map(([service, count]: any) => (
                  <Box key={service} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{service}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / analytics.loadouts.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Profitability at Different Margins */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Profitability Scenarios (Avg Loadout)</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Target Margin</TableCell>
                        <TableCell align="right">Billing Rate</TableCell>
                        <TableCell align="right">Profit/Hour</TableCell>
                        <TableCell align="right">Daily Profit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[30, 40, 50, 60, 70].map((margin) => {
                        const billingRate = analytics.loadouts.avgCost / (1 - margin / 100);
                        const profit = billingRate - analytics.loadouts.avgCost;
                        return (
                          <TableRow key={margin}>
                            <TableCell>{margin}%</TableCell>
                            <TableCell align="right">${billingRate.toFixed(0)}/hr</TableCell>
                            <TableCell align="right" sx={{ color: '#34C759', fontWeight: 600 }}>
                              ${profit.toFixed(0)}
                            </TableCell>
                            <TableCell align="right">${(profit * 8).toFixed(0)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Loadout Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>All Loadouts - Profitability Analysis</Typography>
                {analytics.loadouts.data.length === 0 ? (
                  <Alert severity="info">No loadouts created yet. Create your first loadout to see profitability analysis.</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Loadout Name</TableCell>
                          <TableCell>Service Type</TableCell>
                          <TableCell align="right">Equipment Cost</TableCell>
                          <TableCell align="right">Labor Cost</TableCell>
                          <TableCell align="right">Total Cost</TableCell>
                          <TableCell align="right">Rate @ 50%</TableCell>
                          <TableCell align="right">Daily Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.loadouts.data.map((lo: any) => {
                          const billingRate = lo.billingRates?.margin50 || 0;
                          return (
                            <TableRow key={lo._id}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{lo.name}</Typography>
                              </TableCell>
                              <TableCell>{lo.serviceType}</TableCell>
                              <TableCell align="right">${(lo.totalEquipmentCost || 0).toFixed(0)}</TableCell>
                              <TableCell align="right">${(lo.totalLaborCost || 0).toFixed(0)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                ${(lo.totalCostPerHour || 0).toFixed(0)}/hr
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#34C759', fontWeight: 600 }}>
                                ${billingRate.toFixed(0)}/hr
                              </TableCell>
                              <TableCell align="right">${(billingRate * 8).toFixed(0)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* REPORT 3: Employee Performance */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#007AFF' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Employees</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{analytics.employees.total}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF9500' }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Labor Cost/Hour</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${analytics.employees.totalCostPerHour.toFixed(0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#34C759' }}>
                    <CalendarToday />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Annual Labor Cost</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${(analytics.employees.totalCostPerYear / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF3B30' }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Avg Rate/Employee</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${analytics.employees.avgRate.toFixed(0)}/hr
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Employees by Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Employees by Status</Typography>
                {Object.entries(analytics.employees.byStatus).map(([status, count]: any) => (
                  <Box key={status} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {count} ({((count / analytics.employees.total) * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / analytics.employees.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Employees by Tier */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Employees by Experience Tier</Typography>
                {Object.entries(analytics.employees.byTier).map(([tier, count]: any) => (
                  <Box key={tier} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{tier}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {count} ({((count / analytics.employees.total) * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / analytics.employees.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Employee Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>All Employees - Compensation Breakdown</Typography>
                {analytics.employees.costs.length === 0 ? (
                  <Alert severity="info">No employees added yet. Add your first employee to see compensation analysis.</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Tier</TableCell>
                          <TableCell align="right">Base Rate</TableCell>
                          <TableCell align="right">Tiered Rate</TableCell>
                          <TableCell align="right">Premiums</TableCell>
                          <TableCell align="right">Total Hourly</TableCell>
                          <TableCell align="right">True Cost (w/ Burden)</TableCell>
                          <TableCell align="right">Annual Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.employees.costs.map((emp) => {
                          const premiums = emp.totalHourly - emp.baseTiered;
                          return (
                            <TableRow key={emp._id}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {emp.firstName} {emp.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {emp.primaryTrack}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={`Tier ${emp.tier}`} size="small" />
                              </TableCell>
                              <TableCell align="right">${emp.baseHourlyRate.toFixed(2)}</TableCell>
                              <TableCell align="right">${emp.baseTiered.toFixed(2)}</TableCell>
                              <TableCell align="right">+${premiums.toFixed(2)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                ${emp.totalHourly.toFixed(2)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#FF9500' }}>
                                ${emp.trueCostPerHour.toFixed(2)}
                              </TableCell>
                              <TableCell align="right">${(emp.trueCostPerHour * 2000).toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* REPORT 4: Project Analytics */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#007AFF' }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Projects</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{analytics.projects.total}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#34C759' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Active Projects</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {(analytics.projects.byStatus['Work Order'] || 0) + (analytics.projects.byStatus['Proposal'] || 0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF9500' }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Leads</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {analytics.projects.byStatus['Lead'] || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF3B30' }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {analytics.projects.byStatus['Completed'] || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Projects by Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Projects by Status</Typography>
                {Object.entries(analytics.projects.byStatus).map(([status, count]: any) => (
                  <Box key={status} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {count} ({analytics.projects.total > 0 ? ((count / analytics.projects.total) * 100).toFixed(0) : 0}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analytics.projects.total > 0 ? (count / analytics.projects.total) * 100 : 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Projects by Service */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Projects by Service Type</Typography>
                {Object.entries(analytics.projects.byService).map(([service, count]: any) => (
                  <Box key={service} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{service}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {count} ({analytics.projects.total > 0 ? ((count / analytics.projects.total) * 100).toFixed(0) : 0}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analytics.projects.total > 0 ? (count / analytics.projects.total) * 100 : 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Project Status Alert */}
          <Grid item xs={12}>
            {analytics.projects.total === 0 ? (
              <Alert severity="info">
                No projects created yet. Create your first project to see detailed analytics.
              </Alert>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Project Insights</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                        <Typography variant="caption" color="text.secondary">Conversion Rate (Lead → Proposal)</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#34C759' }}>
                          {analytics.projects.byStatus['Lead'] > 0
                            ? ((((analytics.projects.byStatus['Proposal'] || 0) / analytics.projects.byStatus['Lead']) * 100).toFixed(0))
                            : '0'}%
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                        <Typography variant="caption" color="text.secondary">Win Rate (Proposal → Work Order)</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#007AFF' }}>
                          {(analytics.projects.byStatus['Proposal'] || 0) > 0
                            ? ((((analytics.projects.byStatus['Work Order'] || 0) / (analytics.projects.byStatus['Proposal'] || 1)) * 100).toFixed(0))
                            : '0'}%
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                        <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#FF9500' }}>
                          {analytics.projects.total > 0
                            ? ((((analytics.projects.byStatus['Completed'] || 0) / analytics.projects.total) * 100).toFixed(0))
                            : '0'}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* REPORT 5: Financial Dashboard */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#007AFF' }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Asset Value</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${(analytics.financials.totalAssetValue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FF9500' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Annual Operating Cost</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${(analytics.financials.totalAnnualOperatingCost / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#34C759' }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Hourly Cost</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ${analytics.financials.totalHourlyCost.toFixed(0)}/hr
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Cost Breakdown (Hourly)</Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Equipment Costs</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${analytics.equipment.totalCostPerHour.toFixed(0)} ({((analytics.equipment.totalCostPerHour / analytics.financials.totalHourlyCost) * 100).toFixed(0)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(analytics.equipment.totalCostPerHour / analytics.financials.totalHourlyCost) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#2C2C2E', '& .MuiLinearProgress-bar': { bgcolor: '#007AFF' } }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Labor Costs</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${analytics.employees.totalCostPerHour.toFixed(0)} ({((analytics.employees.totalCostPerHour / analytics.financials.totalHourlyCost) * 100).toFixed(0)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(analytics.employees.totalCostPerHour / analytics.financials.totalHourlyCost) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#2C2C2E', '& .MuiLinearProgress-bar': { bgcolor: '#FF9500' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Potential */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Revenue Potential (Full Utilization)</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Margin</TableCell>
                        <TableCell align="right">Daily</TableCell>
                        <TableCell align="right">Weekly</TableCell>
                        <TableCell align="right">Monthly</TableCell>
                        <TableCell align="right">Annual</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[50, 60, 70].map((margin) => {
                        const hourlyRate = analytics.financials.totalHourlyCost / (1 - margin / 100);
                        return (
                          <TableRow key={margin}>
                            <TableCell>{margin}%</TableCell>
                            <TableCell align="right">${(hourlyRate * 8).toFixed(0)}</TableCell>
                            <TableCell align="right">${(hourlyRate * 40).toFixed(0)}</TableCell>
                            <TableCell align="right">${((hourlyRate * 160) / 1000).toFixed(0)}K</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#34C759' }}>
                              ${((hourlyRate * 2000) / 1000).toFixed(0)}K
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Break-even Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Break-Even Analysis</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Daily Break-Even</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#FF9500', my: 1 }}>
                        ${(analytics.financials.totalHourlyCost * 8).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">8 hours @ cost</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Weekly Break-Even</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#FF9500', my: 1 }}>
                        ${(analytics.financials.totalHourlyCost * 40).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">40 hours @ cost</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Monthly Break-Even</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#FF9500', my: 1 }}>
                        ${((analytics.financials.totalHourlyCost * 160) / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="caption" color="text.secondary">160 hours @ cost</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Financial Summary</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Equipment</TableCell>
                        <TableCell align="right">Labor</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Hourly Cost</TableCell>
                        <TableCell align="right">${analytics.equipment.totalCostPerHour.toFixed(0)}</TableCell>
                        <TableCell align="right">${analytics.employees.totalCostPerHour.toFixed(0)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${analytics.financials.totalHourlyCost.toFixed(0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Daily Cost (8 hrs)</TableCell>
                        <TableCell align="right">${(analytics.equipment.totalCostPerHour * 8).toFixed(0)}</TableCell>
                        <TableCell align="right">${(analytics.employees.totalCostPerHour * 8).toFixed(0)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${(analytics.financials.totalHourlyCost * 8).toFixed(0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Weekly Cost (40 hrs)</TableCell>
                        <TableCell align="right">${(analytics.equipment.totalCostPerHour * 40).toFixed(0)}</TableCell>
                        <TableCell align="right">${(analytics.employees.totalCostPerHour * 40).toFixed(0)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${(analytics.financials.totalHourlyCost * 40).toFixed(0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Annual Cost (2000 hrs)</TableCell>
                        <TableCell align="right">${(analytics.equipment.totalCostPerYear / 1000).toFixed(0)}K</TableCell>
                        <TableCell align="right">${(analytics.employees.totalCostPerYear / 1000).toFixed(0)}K</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#FF3B30' }}>
                          ${(analytics.financials.totalAnnualOperatingCost / 1000).toFixed(0)}K
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* REPORT 6: Pipeline Tracking */}
      <TabPanel value={activeTab} index={5}>
        <Grid container spacing={3}>
          {/* Pipeline Stages */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Sales Pipeline Overview</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <Schedule sx={{ fontSize: 40, color: '#FF9500', mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {analytics.projects.byStatus['Lead'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Leads</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <Assessment sx={{ fontSize: 40, color: '#007AFF', mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {analytics.projects.byStatus['Proposal'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Proposals</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <Build sx={{ fontSize: 40, color: '#34C759', mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {analytics.projects.byStatus['Work Order'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Work Orders</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                      <AttachMoney sx={{ fontSize: 40, color: '#FF3B30', mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {analytics.projects.byStatus['Invoice'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Invoices</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Conversion Metrics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Conversion Metrics</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                      <Typography variant="caption" color="text.secondary">Lead → Proposal</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600, color: '#007AFF', my: 1 }}>
                        {(analytics.projects.byStatus['Lead'] || 0) > 0
                          ? ((((analytics.projects.byStatus['Proposal'] || 0) / (analytics.projects.byStatus['Lead'] || 1)) * 100).toFixed(0))
                          : '0'}%
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {analytics.projects.byStatus['Proposal'] || 0} of {analytics.projects.byStatus['Lead'] || 0} leads converted
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                      <Typography variant="caption" color="text.secondary">Proposal → Work Order (Win Rate)</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600, color: '#34C759', my: 1 }}>
                        {(analytics.projects.byStatus['Proposal'] || 0) > 0
                          ? ((((analytics.projects.byStatus['Work Order'] || 0) / (analytics.projects.byStatus['Proposal'] || 1)) * 100).toFixed(0))
                          : '0'}%
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {analytics.projects.byStatus['Work Order'] || 0} of {analytics.projects.byStatus['Proposal'] || 0} proposals won
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#2C2C2E' }}>
                      <Typography variant="caption" color="text.secondary">Work Order → Invoice</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600, color: '#FF9500', my: 1 }}>
                        {(analytics.projects.byStatus['Work Order'] || 0) > 0
                          ? ((((analytics.projects.byStatus['Invoice'] || 0) / (analytics.projects.byStatus['Work Order'] || 1)) * 100).toFixed(0))
                          : '0'}%
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {analytics.projects.byStatus['Invoice'] || 0} of {analytics.projects.byStatus['Work Order'] || 0} jobs invoiced
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Analytics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Customer Metrics</Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Total Customers</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{analytics.customers.total}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Avg Revenue per Customer</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#34C759' }}>
                      ${analytics.customers.avgRevenue.toFixed(0)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Projects per Customer</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {analytics.customers.total > 0 ? (analytics.projects.total / analytics.customers.total).toFixed(1) : '0'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Pipeline Health Indicators */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Pipeline Health</Typography>
                <Stack spacing={2}>
                  {((analytics.projects.byStatus['Lead'] || 0) > (analytics.projects.byStatus['Proposal'] || 0) * 2) ? (
                    <Alert severity="success" icon={<CheckCircle />}>
                      Healthy lead pipeline - {analytics.projects.byStatus['Lead'] || 0} leads for {analytics.projects.byStatus['Proposal'] || 0} proposals
                    </Alert>
                  ) : (
                    <Alert severity="warning" icon={<Warning />}>
                      Low lead volume - Need more leads to maintain pipeline
                    </Alert>
                  )}

                  {((analytics.projects.byStatus['Proposal'] || 0) > 0 &&
                    (analytics.projects.byStatus['Work Order'] || 0) / (analytics.projects.byStatus['Proposal'] || 1) > 0.5) ? (
                    <Alert severity="success" icon={<CheckCircle />}>
                      Strong win rate - {(((analytics.projects.byStatus['Work Order'] || 0) / (analytics.projects.byStatus['Proposal'] || 1)) * 100).toFixed(0)}% proposals converting
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      Review proposal strategy - Win rate could be improved
                    </Alert>
                  )}

                  {((analytics.projects.byStatus['Work Order'] || 0) > 0) ? (
                    <Alert severity="success" icon={<CheckCircle />}>
                      Active work orders - {analytics.projects.byStatus['Work Order'] || 0} jobs in progress
                    </Alert>
                  ) : (
                    <Alert severity="warning" icon={<Warning />}>
                      No active work orders - Pipeline needs attention
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* No Data State */}
          {analytics.projects.total === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                No project data available yet. Start creating leads and proposals to see your pipeline metrics!
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* REPORT 7: Time & Cost Analytics */}
      <TabPanel value={activeTab} index={6}>
        <TimeCostAnalytics />
      </TabPanel>

      {/* REPORT 8: Lead Generation Analytics */}
      <TabPanel value={activeTab} index={7}>
        <LeadGenerationReport />
      </TabPanel>

      {/* REPORT 9: Proposal Performance Analytics */}
      <TabPanel value={activeTab} index={8}>
        <ProposalPerformanceReport />
      </TabPanel>

      {/* REPORT 10: Work Order Execution Analytics */}
      <TabPanel value={activeTab} index={9}>
        <WorkOrderExecutionReport />
      </TabPanel>

      {/* REPORT 11: Customer Intelligence */}
      <TabPanel value={activeTab} index={10}>
        <CustomerIntelligenceReport />
      </TabPanel>

      {/* REPORT 12: Business Dashboard */}
      <TabPanel value={activeTab} index={11}>
        <BusinessDashboardReport />
      </TabPanel>
    </Box>
  );
}

// Report Components

function LeadGenerationReport() {
  const leadKPIs = useQuery(api.analytics.getLeadStageKPIs, {});

  if (!leadKPIs) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF9500' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Leads</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{leadKPIs.totalLeads}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#34C759' }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Value</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${leadKPIs.totalEstimatedValue.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#007AFF' }}>
                <Speed />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Response Time</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {leadKPIs.avgResponseTime.toFixed(1)}h
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF3B30' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {leadKPIs.conversionRate.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Leads by Source</Typography>
            {leadKPIs.bySource.map((source) => (
              <Box key={source.source} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{source.source}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {source.count} (${source.avgValue.toFixed(0)} avg)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(source.count / leadKPIs.totalLeads) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Leads by Service Type</Typography>
            {leadKPIs.byServiceType.map((service) => (
              <Box key={service.service} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{service.service}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {service.count} (${service.avgValue.toFixed(0)} avg)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(service.count / leadKPIs.totalLeads) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function ProposalPerformanceReport() {
  const proposalKPIs = useQuery(api.analytics.getProposalStageKPIs, {});

  if (!proposalKPIs) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#007AFF' }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Proposals</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{proposalKPIs.totalProposals}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#34C759' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {proposalKPIs.winRate.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF9500' }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Proposal Value</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${proposalKPIs.avgProposalValue.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF3B30' }}>
                <Schedule />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Time to Proposal</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {proposalKPIs.avgTimeToProposal.toFixed(1)} days
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Proposals by Service Type</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="right">Avg Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposalKPIs.byServiceType.map((service) => (
                    <TableRow key={service.service}>
                      <TableCell>{service.service}</TableCell>
                      <TableCell align="right">{service.count}</TableCell>
                      <TableCell align="right">${service.value.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#34C759' }}>
                        ${service.avgValue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function WorkOrderExecutionReport() {
  const workOrderKPIs = useQuery(api.analytics.getWorkOrderStageKPIs, {});

  if (!workOrderKPIs) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#007AFF' }}>
                <LocalShipping />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Work Orders</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{workOrderKPIs.totalWorkOrders}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#34C759' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {workOrderKPIs.completionRate.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF9500' }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${workOrderKPIs.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF3B30' }}>
                <Speed />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">On-Time Rate</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {workOrderKPIs.onTimeRate.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Work Orders by Service Type</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service Type</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Completed</TableCell>
                    <TableCell align="right">Completion Rate</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrderKPIs.byServiceType.map((service) => (
                    <TableRow key={service.service}>
                      <TableCell>{service.service}</TableCell>
                      <TableCell align="right">{service.count}</TableCell>
                      <TableCell align="right">{service.completed}</TableCell>
                      <TableCell align="right">{service.completionRate.toFixed(0)}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#34C759' }}>
                        ${service.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function CustomerIntelligenceReport() {
  const customerKPIs = useQuery(api.analytics.getCustomerIntelligence, {});

  if (!customerKPIs) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#007AFF' }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Customers</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{customerKPIs.totalCustomers}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#34C759' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Repeat Rate</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {customerKPIs.repeatRate.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF9500' }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Avg CLV</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${customerKPIs.avgCLV.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF3B30' }}>
                <Warning />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">At-Risk Customers</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{customerKPIs.atRiskCustomers}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Top 10 Customers by Revenue</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Projects</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerKPIs.topCustomers.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell>{customer.customerName}</TableCell>
                      <TableCell align="right">{customer.completedProjects}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#34C759' }}>
                        ${customer.totalRevenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Customers by Type</Typography>
            {customerKPIs.byType.map((type) => (
              <Box key={type.type} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{type.type}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {type.count} (${type.avgRevenue.toLocaleString()} avg)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(type.count / customerKPIs.totalCustomers) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function BusinessDashboardReport() {
  const businessKPIs = useQuery(api.analytics.getBusinessDashboard, {});

  if (!businessKPIs) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      {/* Financial Metrics */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Financial Overview</Typography>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#34C759' }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${businessKPIs.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#007AFF' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Pipeline Value</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${businessKPIs.pipelineValue.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF9500' }}>
                <Build />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Backlog Value</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${businessKPIs.backlogValue.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: businessKPIs.revenueGrowth >= 0 ? '#34C759' : '#FF3B30' }}>
                {businessKPIs.revenueGrowth >= 0 ? <TrendingUp /> : <TrendingDown />}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Revenue Growth</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: businessKPIs.revenueGrowth >= 0 ? '#34C759' : '#FF3B30' }}>
                  {businessKPIs.revenueGrowth.toFixed(1)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Operations Metrics */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>Operations Overview</Typography>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#007AFF' }}>
                <Build />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Equipment Utilization</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {businessKPIs.equipmentUtilization.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#34C759' }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Active Employees</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{businessKPIs.activeEmployees}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF9500' }}>
                <LocalShipping />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Active Work Orders</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{businessKPIs.activeWorkOrders}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#FF3B30' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Customers</Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{businessKPIs.totalCustomers}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Pipeline Overview */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Project Pipeline</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: '#FF9500', mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {businessKPIs.totalLeads}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Leads</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: '#007AFF', mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {businessKPIs.totalProposals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Proposals</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                  <Build sx={{ fontSize: 40, color: '#34C759', mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {businessKPIs.activeWorkOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active Work Orders</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, bgcolor: '#2C2C2E', textAlign: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, color: '#FF3B30', mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {businessKPIs.completedWorkOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default function ReportsPage() {
  return (
    <ConvexAuthGuard>
      <ReportsPageContent />
    </ConvexAuthGuard>
  );
}
