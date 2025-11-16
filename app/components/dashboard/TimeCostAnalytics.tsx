"use client";

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Paper,
} from '@mui/material';
import {
  Speed,
  AttachMoney,
  Build,
  People,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Assessment,
} from '@mui/icons-material';

export default function TimeCostAnalytics() {
  // Date range state (default to last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<Id<"employees"> | "">("");
  const [selectedEquipment, setSelectedEquipment] = useState<Id<"equipment"> | "">("");
  const [selectedService, setSelectedService] = useState<string>("Forestry Mulching");

  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();

  // Fetch data
  const employees = useQuery(api.employees.list) || [];
  const equipment = useQuery(api.equipment.list) || [];

  // Analytics queries
  const employeeProductionRate = useQuery(
    selectedEmployee && selectedService
      ? api.analytics.getEmployeeProductionRate
      : "skip",
    selectedEmployee && selectedService
      ? {
          employeeId: selectedEmployee as Id<"employees">,
          serviceType: selectedService,
          startDate: startTimestamp,
          endDate: endTimestamp,
        }
      : "skip"
  );

  const employeeCostEfficiency = useQuery(
    selectedEmployee
      ? api.analytics.getEmployeeCostEfficiency
      : "skip",
    selectedEmployee
      ? {
          employeeId: selectedEmployee as Id<"employees">,
          startDate: startTimestamp,
          endDate: endTimestamp,
        }
      : "skip"
  );

  const equipmentPerformance = useQuery(
    selectedEquipment
      ? api.analytics.getEquipmentPerformance
      : "skip",
    selectedEquipment
      ? {
          equipmentId: selectedEquipment as Id<"equipment">,
          startDate: startTimestamp,
          endDate: endTimestamp,
        }
      : "skip"
  );

  const taskAverages = useQuery(
    selectedService
      ? api.analytics.getTaskAverages
      : "skip",
    selectedService
      ? {
          serviceType: selectedService,
          startDate: startTimestamp,
          endDate: endTimestamp,
        }
      : "skip"
  );

  const treeScoreAccuracy = useQuery(
    selectedService
      ? api.analytics.getTreeScoreAccuracy
      : "skip",
    selectedService
      ? {
          serviceType: selectedService,
          startDate: startTimestamp,
          endDate: endTimestamp,
        }
      : "skip"
  );

  const serviceProfitability = useQuery(
    api.analytics.getServiceTypeProfitability,
    {
      startDate: startTimestamp,
      endDate: endTimestamp,
    }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <Box>
      {/* Date Range Filter */}
      <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Report Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                label="Employee"
                onChange={(e) => setSelectedEmployee(e.target.value as Id<"employees"> | "")}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Equipment</InputLabel>
              <Select
                value={selectedEquipment}
                label="Equipment"
                onChange={(e) => setSelectedEquipment(e.target.value as Id<"equipment"> | "")}
              >
                <MenuItem value="">All Equipment</MenuItem>
                {equipment.map((eq) => (
                  <MenuItem key={eq._id} value={eq._id}>
                    {eq.nickname || `${eq.make} ${eq.model}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Service Type</InputLabel>
              <Select
                value={selectedService}
                label="Service Type"
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <MenuItem value="Forestry Mulching">Forestry Mulching</MenuItem>
                <MenuItem value="Stump Grinding">Stump Grinding</MenuItem>
                <MenuItem value="Land Clearing">Land Clearing</MenuItem>
                <MenuItem value="Tree Removal">Tree Removal</MenuItem>
                <MenuItem value="Tree Trimming">Tree Trimming</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* EMPLOYEE PERFORMANCE SECTION */}
        {selectedEmployee && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Employee Performance Analysis
              </Typography>
            </Grid>

            {/* Production Rate KPIs */}
            {employeeProductionRate && (
              <>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#007AFF' }}>
                          <Speed />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Production Rate</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {employeeProductionRate.productionRate.toFixed(2)} {employeeProductionRate.unitType}/hr
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
                          <CheckCircle />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Units Completed</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {employeeProductionRate.unitsCompleted.toFixed(0)} {employeeProductionRate.unitType}
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
                          <Typography variant="caption" color="text.secondary">Production Hours</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {formatHours(employeeProductionRate.totalProductionHours)}
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
                          <Assessment />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Jobs Completed</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {employeeProductionRate.jobsCompleted}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Cost Efficiency */}
            {employeeCostEfficiency && (
              <>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Cost Efficiency</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Efficiency Ratio</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: employeeCostEfficiency.efficiencyRatio >= 70 ? '#34C759' : '#FF9500' }}>
                            {employeeCostEfficiency.efficiencyRatio.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(employeeCostEfficiency.efficiencyRatio, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: employeeCostEfficiency.efficiencyRatio >= 70 ? '#34C759' : '#FF9500'
                            }
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatHours(employeeCostEfficiency.totalHours)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Production Hours</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>
                            {formatHours(employeeCostEfficiency.productionHours)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Total Labor Cost</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF9500' }}>
                            {formatCurrency(employeeCostEfficiency.totalLaborCost)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Time Breakdown by Category</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Hours</TableCell>
                              <TableCell align="right">Cost</TableCell>
                              <TableCell align="right">Entries</TableCell>
                              <TableCell align="right">% of Time</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(employeeCostEfficiency.byCategory).map(([category, data]: any) => (
                              <TableRow key={category}>
                                <TableCell>
                                  <Chip
                                    label={category}
                                    size="small"
                                    color={category === "Production Time" ? "success" : "default"}
                                  />
                                </TableCell>
                                <TableCell align="right">{formatHours(data.hours)}</TableCell>
                                <TableCell align="right">{formatCurrency(data.cost)}</TableCell>
                                <TableCell align="right">{data.entries}</TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {((data.hours / employeeCostEfficiency.totalHours) * 100).toFixed(1)}%
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </>
        )}

        {/* EQUIPMENT PERFORMANCE SECTION */}
        {selectedEquipment && equipmentPerformance && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                Equipment Performance Analysis
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#007AFF' }}>
                      <Speed />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Utilization Rate</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {equipmentPerformance.utilizationRate.toFixed(1)}%
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
                      <Typography variant="caption" color="text.secondary">Cost Per Unit</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {formatCurrency(equipmentPerformance.costPerUnit)}
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
                      <Build />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Production Rate</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {equipmentPerformance.productionRate.toFixed(2)}/hr
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
                      <Assessment />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Equipment Cost</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {formatCurrency(equipmentPerformance.totalEquipmentCost)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Equipment Performance Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{formatHours(equipmentPerformance.totalHours)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Production Hours</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#34C759' }}>{formatHours(equipmentPerformance.productionHours)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Avg Cost/Hour</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF9500' }}>{formatCurrency(equipmentPerformance.avgCostPerHour)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Jobs Completed</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{equipmentPerformance.jobsCompleted}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* TASK-LEVEL ANALYTICS */}
        {selectedService && taskAverages && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                Task-Level Analytics - {selectedService}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Average Time & Cost by Task Type ({taskAverages.totalEntries} entries)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Task Type</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Avg Hours</TableCell>
                          <TableCell align="right">Avg Labor</TableCell>
                          <TableCell align="right">Avg Equipment</TableCell>
                          <TableCell align="right">Avg Total</TableCell>
                          <TableCell align="right">% of Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {taskAverages.taskAverages
                          .sort((a: any, b: any) => b.avgTotalCost - a.avgTotalCost)
                          .map((task: any) => {
                            const costDist = taskAverages.costDistribution.find((d: any) => d.taskType === task.taskType);
                            return (
                              <TableRow key={task.taskType}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {task.taskType}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={task.category}
                                    size="small"
                                    color={task.category === "Production Time" ? "success" : "default"}
                                  />
                                </TableCell>
                                <TableCell align="right">{task.count}</TableCell>
                                <TableCell align="right">{formatHours(task.avgHours)}</TableCell>
                                <TableCell align="right">{formatCurrency(task.avgLaborCost)}</TableCell>
                                <TableCell align="right">{formatCurrency(task.avgEquipmentCost)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#FF9500' }}>
                                  {formatCurrency(task.avgTotalCost)}
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {costDist?.percentOfTime.toFixed(1)}%
                                  </Typography>
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
          </>
        )}

        {/* FORMULA VALIDATION */}
        {selectedService && treeScoreAccuracy && treeScoreAccuracy.totalJobs > 0 && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                TreeScore Accuracy - {selectedService}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Accuracy Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: treeScoreAccuracy.accuracyRate >= 70 ? '#34C759' : '#FF9500' }}>
                    {treeScoreAccuracy.accuracyRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {treeScoreAccuracy.accurate} of {treeScoreAccuracy.totalJobs} within 10%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Avg Variance</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: Math.abs(treeScoreAccuracy.avgVariancePercent) <= 10 ? '#34C759' : '#FF9500' }}>
                    {treeScoreAccuracy.avgVariancePercent > 0 ? '+' : ''}{treeScoreAccuracy.avgVariancePercent.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Estimated vs Actual
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Overestimated</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#007AFF' }}>
                      {treeScoreAccuracy.overestimated}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Underestimated</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#FF3B30' }}>
                      {treeScoreAccuracy.underestimated}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Total Jobs Analyzed</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {treeScoreAccuracy.totalJobs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed line items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* SERVICE TYPE PROFITABILITY */}
        {serviceProfitability && serviceProfitability.profitability.length > 0 && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
                Profitability by Service Type
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Service Performance Comparison ({serviceProfitability.totalJobs} completed jobs)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Service Type</TableCell>
                          <TableCell align="right">Jobs</TableCell>
                          <TableCell align="right">Total Revenue</TableCell>
                          <TableCell align="right">Actual Cost</TableCell>
                          <TableCell align="right">Actual Profit</TableCell>
                          <TableCell align="right">Margin %</TableCell>
                          <TableCell align="right">Avg Job Size</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {serviceProfitability.profitability
                          .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
                          .map((service: any) => (
                            <TableRow key={service.serviceType}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {service.serviceType}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{service.jobCount}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#007AFF' }}>
                                {formatCurrency(service.totalRevenue)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#FF9500' }}>
                                {formatCurrency(service.totalActualCost)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: service.actualMargin >= 50 ? '#34C759' : '#FF3B30' }}>
                                {formatCurrency(service.totalActualProfit)}
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${service.actualMargin.toFixed(1)}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: service.actualMargin >= 50 ? '#34C759' : service.actualMargin >= 30 ? '#FF9500' : '#FF3B30',
                                    color: 'white',
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">{formatCurrency(service.avgRevenue)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Empty States */}
        {!selectedEmployee && !selectedEquipment && (
          <Grid item xs={12}>
            <Alert severity="info">
              Select an employee or equipment to view detailed performance analytics.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
