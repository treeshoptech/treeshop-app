'use client';

/**
 * Job Completion Form - Capture Actual vs Estimated Data
 *
 * This form collects comprehensive performance data when a work order completes:
 * - Actual time (production, transport, buffer)
 * - Actual costs (labor, equipment, overhead)
 * - Actual revenue and profitability
 * - Site conditions and weather
 * - Quality metrics and customer satisfaction
 * - Equipment utilization per piece
 * - Employee productivity per person
 *
 * This data feeds the ML training pipeline for continuous improvement.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlFormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormGroup,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  AttachMoney as MoneyIcon,
  Cloud as CloudIcon,
  Star as StarIcon,
  Build as BuildIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface PageProps {
  params: {
    id: string;
  };
}

export default function JobCompletionPage({ params }: PageProps) {
  const router = useRouter();
  const projectId = params.id as Id<'projects'>;

  // Fetch project data
  const project = useQuery(api.projects.getOne, { id: projectId });
  const createJobMetrics = useMutation(api.analytics.createJobPerformanceMetrics);
  const createEquipmentLog = useMutation(api.analytics.createEquipmentUtilizationLog);
  const createEmployeeLog = useMutation(api.analytics.createEmployeeProductivityLog);
  const createWeatherLog = useMutation(api.analytics.createWeatherDataLog);
  const updateProjectStatus = useMutation(api.projects.updateStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form state - Time Tracking
  const [actualProductionHours, setActualProductionHours] = useState(0);
  const [actualTransportHours, setActualTransportHours] = useState(0);
  const [actualBufferHours, setActualBufferHours] = useState(0);

  // Form state - Cost Tracking
  const [actualLaborCost, setActualLaborCost] = useState(0);
  const [actualEquipmentCost, setActualEquipmentCost] = useState(0);
  const [actualOverheadCost, setActualOverheadCost] = useState(0);

  // Form state - Revenue & Profitability
  const [actualRevenue, setActualRevenue] = useState(0);

  // Form state - Site Conditions
  const [weatherCondition, setWeatherCondition] = useState('Clear');
  const [temperature, setTemperature] = useState(75);
  const [windSpeed, setWindSpeed] = useState(5);
  const [precipitation, setPrecipitation] = useState(0);
  const [siteAccessDifficulty, setSiteAccessDifficulty] = useState(3); // 1-5 scale
  const [groundCondition, setGroundCondition] = useState('Normal');
  const [unexpectedObstacles, setUnexpectedObstacles] = useState('');
  const [customerAvailability, setCustomerAvailability] = useState('Available');

  // Form state - Quality Metrics
  const [reworkRequired, setReworkRequired] = useState(false);
  const [customerSatisfaction, setCustomerSatisfaction] = useState(5); // 1-5 scale
  const [safetyIncidents, setSafetyIncidents] = useState(0);

  // Form state - Equipment Details (per equipment)
  const [equipmentLogs, setEquipmentLogs] = useState<any[]>([]);

  // Form state - Employee Details (per employee)
  const [employeeLogs, setEmployeeLogs] = useState<any[]>([]);

  // Form state - Notes
  const [notes, setNotes] = useState('');

  // Auto-populate from project estimates
  useEffect(() => {
    if (project) {
      setActualProductionHours(project.estimatedHours || 0);
      setActualRevenue(project.estimatedValue || 0);

      // Initialize equipment logs
      if (project.loadout?.equipmentIds) {
        setEquipmentLogs(
          project.loadout.equipmentIds.map((eqId: string) => ({
            equipmentId: eqId,
            totalHours: project.estimatedHours || 0,
            productiveHours: (project.estimatedHours || 0) * 0.85,
            idleHours: (project.estimatedHours || 0) * 0.15,
            maintenanceHours: 0,
            transportHours: project.estimatedTransportHours || 0,
            fuelGallonsUsed: 0,
            downtimeMinutes: 0,
            mechanicalIssues: '',
          }))
        );
      }

      // Initialize employee logs
      if (project.loadout?.employeeIds) {
        setEmployeeLogs(
          project.loadout.employeeIds.map((empId: string) => ({
            employeeId: empId,
            totalHours: project.estimatedHours || 0,
            productiveHours: (project.estimatedHours || 0) * 0.85,
            breakHours: (project.estimatedHours || 0) * 0.10,
            travelHours: project.estimatedTransportHours || 0,
            workQualityScore: 5,
            safetyScore: 5,
            teamworkScore: 5,
            efficiencyScore: 5,
          }))
        );
      }
    }
  }, [project]);

  // Calculate variances and scores
  const calculateMetrics = () => {
    const actualTotalHours = actualProductionHours + actualTransportHours + actualBufferHours;
    const estimatedTotalHours = (project?.estimatedHours || 0) + (project?.estimatedTransportHours || 0) + (project?.estimatedBufferHours || 0);

    const productionVariancePercent = estimatedTotalHours > 0
      ? ((actualTotalHours - estimatedTotalHours) / estimatedTotalHours) * 100
      : 0;

    const actualTotalCost = actualLaborCost + actualEquipmentCost + actualOverheadCost;
    const estimatedTotalCost = (project?.estimatedCost || 0);

    const totalCostVariancePercent = estimatedTotalCost > 0
      ? ((actualTotalCost - estimatedTotalCost) / estimatedTotalCost) * 100
      : 0;

    const actualProfit = actualRevenue - actualTotalCost;
    const actualMargin = actualRevenue > 0 ? (actualProfit / actualRevenue) * 100 : 0;

    const targetProfit = (project?.estimatedValue || 0) - (project?.estimatedCost || 0);
    const targetMargin = (project?.targetMargin || 50);

    const profitVariancePercent = targetProfit > 0
      ? ((actualProfit - targetProfit) / targetProfit) * 100
      : 0;

    // Calculate ML scores
    const accuracyScore = Math.max(0, 100 - Math.abs(productionVariancePercent));
    const efficiencyScore = Math.max(0, 100 - Math.abs(totalCostVariancePercent));
    const profitabilityScore = actualMargin >= targetMargin ? 100 : (actualMargin / targetMargin) * 100;
    const overallPerformanceScore = (accuracyScore + efficiencyScore + profitabilityScore) / 3;

    return {
      actualTotalHours,
      estimatedTotalHours,
      productionVariancePercent,
      actualTotalCost,
      estimatedTotalCost,
      totalCostVariancePercent,
      actualProfit,
      actualMargin,
      targetProfit,
      targetMargin,
      profitVariancePercent,
      accuracyScore,
      efficiencyScore,
      profitabilityScore,
      overallPerformanceScore,
    };
  };

  const handleSubmit = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const metrics = calculateMetrics();

      // Create job performance metrics
      await createJobMetrics({
        projectId,
        loadoutId: project.loadoutId as Id<'loadouts'>,

        // Time variance
        estimatedProductionHours: project.estimatedHours || 0,
        actualProductionHours,
        estimatedTransportHours: project.estimatedTransportHours || 0,
        actualTransportHours,
        estimatedBufferHours: project.estimatedBufferHours || 0,
        actualBufferHours,
        estimatedTotalHours: metrics.estimatedTotalHours,
        actualTotalHours: metrics.actualTotalHours,
        productionVariancePercent: metrics.productionVariancePercent,

        // Cost variance
        estimatedLaborCost: project.estimatedLaborCost || 0,
        actualLaborCost,
        estimatedEquipmentCost: project.estimatedEquipmentCost || 0,
        actualEquipmentCost,
        estimatedOverheadCost: project.estimatedOverheadCost || 0,
        actualOverheadCost,
        estimatedTotalCost: metrics.estimatedTotalCost,
        actualTotalCost: metrics.actualTotalCost,
        totalCostVariancePercent: metrics.totalCostVariancePercent,

        // Profitability
        estimatedRevenue: project.estimatedValue || 0,
        actualRevenue,
        targetMargin: metrics.targetMargin,
        actualMargin: metrics.actualMargin,
        targetProfit: metrics.targetProfit,
        actualProfit: metrics.actualProfit,
        profitVariancePercent: metrics.profitVariancePercent,

        // TreeShop Score
        estimatedTreeShopScore: project.treeShopScore || 0,
        actualTreeShopScore: project.treeShopScore,

        // Site conditions
        weatherCondition,
        temperature,
        windSpeed,
        precipitation,
        siteAccessDifficulty,
        groundCondition,
        unexpectedObstacles,
        customerAvailability,

        // Quality metrics
        reworkRequired,
        customerSatisfaction,
        safetyIncidents,

        // ML scores
        accuracyScore: metrics.accuracyScore,
        efficiencyScore: metrics.efficiencyScore,
        profitabilityScore: metrics.profitabilityScore,
        overallPerformanceScore: metrics.overallPerformanceScore,

        // Training data
        includeInTraining: true,
        notes,
      });

      // Create equipment utilization logs
      for (const eqLog of equipmentLogs) {
        const utilizationRate = eqLog.totalHours > 0
          ? (eqLog.productiveHours / eqLog.totalHours) * 100
          : 0;

        await createEquipmentLog({
          projectId,
          loadoutId: project.loadoutId as Id<'loadouts'>,
          equipmentId: eqLog.equipmentId as Id<'equipment'>,
          startTime: Date.now() - (eqLog.totalHours * 3600000),
          endTime: Date.now(),
          totalHours: eqLog.totalHours,
          productiveHours: eqLog.productiveHours,
          idleHours: eqLog.idleHours,
          maintenanceHours: eqLog.maintenanceHours,
          transportHours: eqLog.transportHours,
          utilizationRate,
          fuelGallonsUsed: eqLog.fuelGallonsUsed,
          equipmentCostPerHour: 0, // Calculate from equipment data
          totalEquipmentCost: 0, // Calculate from equipment data
          revenueGenerated: actualRevenue / equipmentLogs.length,
          profitGenerated: metrics.actualProfit / equipmentLogs.length,
          roi: 0, // Calculate after costs
          weatherCondition,
          terrainType: groundCondition,
          mechanicalIssues: eqLog.mechanicalIssues,
          downtimeMinutes: eqLog.downtimeMinutes,
          maintenanceRequired: eqLog.downtimeMinutes > 0,
        });
      }

      // Create employee productivity logs
      for (const empLog of employeeLogs) {
        await createEmployeeLog({
          projectId,
          loadoutId: project.loadoutId as Id<'loadouts'>,
          employeeId: empLog.employeeId as Id<'employees'>,
          startTime: Date.now() - (empLog.totalHours * 3600000),
          endTime: Date.now(),
          totalHours: empLog.totalHours,
          productiveHours: empLog.productiveHours,
          breakHours: empLog.breakHours,
          travelHours: empLog.travelHours,
          role: 'Crew Member',
          workQualityScore: empLog.workQualityScore,
          safetyScore: empLog.safetyScore,
          teamworkScore: empLog.teamworkScore,
          efficiencyScore: empLog.efficiencyScore,
          hourlyRate: 0, // Get from employee data
          laborCost: actualLaborCost / employeeLogs.length,
          revenueGenerated: actualRevenue / employeeLogs.length,
          profitGenerated: metrics.actualProfit / employeeLogs.length,
          profitPerHour: empLog.totalHours > 0 ? (metrics.actualProfit / employeeLogs.length) / empLog.totalHours : 0,
        });
      }

      // Create weather log
      if (project.coordinates) {
        await createWeatherLog({
          projectId,
          timestamp: Date.now(),
          latitude: project.coordinates.lat,
          longitude: project.coordinates.lng,
          temperatureF: temperature,
          precipitationInches: precipitation,
          windSpeedMPH: windSpeed,
          humidity: 50, // Would come from API
          condition: weatherCondition,
          isExtremeHeat: temperature > 95,
          isExtremeCold: temperature < 32,
          isHighWind: windSpeed > 25,
          isHeavyRain: precipitation > 0.1,
          isSevereWeather: windSpeed > 35 || precipitation > 0.5,
          dataSource: 'Manual',
        });
      }

      // Update project status to Invoice
      await updateProjectStatus({
        id: projectId,
        status: 'Invoice',
      });

      // Redirect to project detail
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err) {
      console.error('Error completing job:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete job');
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const metrics = calculateMetrics();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Complete Work Order
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {project.customerName} - {project.serviceType}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Capture actual performance data for continuous learning
        </Typography>
      </Box>

      {/* Progress Indicator */}
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={(currentStep / totalSteps) * 100}
          sx={{ height: 8, borderRadius: 1 }}
        />
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Step {currentStep} of {totalSteps}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step 1: Time Tracking */}
      {currentStep === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TimerIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Step 1: Time Tracking</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actual Production Hours"
                  type="number"
                  value={actualProductionHours}
                  onChange={(e) => setActualProductionHours(parseFloat(e.target.value) || 0)}
                  helperText={`Estimated: ${project.estimatedHours || 0} hrs`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actual Transport Hours"
                  type="number"
                  value={actualTransportHours}
                  onChange={(e) => setActualTransportHours(parseFloat(e.target.value) || 0)}
                  helperText={`Estimated: ${project.estimatedTransportHours || 0} hrs`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actual Buffer/Setup Hours"
                  type="number"
                  value={actualBufferHours}
                  onChange={(e) => setActualBufferHours(parseFloat(e.target.value) || 0)}
                  helperText={`Estimated: ${project.estimatedBufferHours || 0} hrs`}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert
                  severity={Math.abs(metrics.productionVariancePercent) < 10 ? 'success' : 'warning'}
                  icon={<TrendingUpIcon />}
                >
                  <Typography variant="body2">
                    <strong>Total Hours:</strong> {metrics.actualTotalHours.toFixed(2)} hrs
                    {' '}({metrics.productionVariancePercent > 0 ? '+' : ''}
                    {metrics.productionVariancePercent.toFixed(1)}% vs estimate)
                  </Typography>
                  <Typography variant="caption">
                    Time Accuracy Score: {metrics.accuracyScore.toFixed(1)}/100
                  </Typography>
                </Alert>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={() => setCurrentStep(2)}>
                Next: Cost Tracking
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Cost Tracking */}
      {currentStep === 2 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Step 2: Cost Tracking</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actual Labor Cost"
                  type="number"
                  value={actualLaborCost}
                  onChange={(e) => setActualLaborCost(parseFloat(e.target.value) || 0)}
                  InputProps={{ startAdornment: '$' }}
                  helperText={`Estimated: $${project.estimatedLaborCost || 0}`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actual Equipment Cost"
                  type="number"
                  value={actualEquipmentCost}
                  onChange={(e) => setActualEquipmentCost(parseFloat(e.target.value) || 0)}
                  InputProps={{ startAdornment: '$' }}
                  helperText={`Estimated: $${project.estimatedEquipmentCost || 0}`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actual Overhead Cost"
                  type="number"
                  value={actualOverheadCost}
                  onChange={(e) => setActualOverheadCost(parseFloat(e.target.value) || 0)}
                  InputProps={{ startAdornment: '$' }}
                  helperText={`Estimated: $${project.estimatedOverheadCost || 0}`}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Actual Revenue (Final Invoice Amount)"
                  type="number"
                  value={actualRevenue}
                  onChange={(e) => setActualRevenue(parseFloat(e.target.value) || 0)}
                  InputProps={{ startAdornment: '$' }}
                  helperText={`Estimated: $${project.estimatedValue || 0}`}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert
                  severity={metrics.actualMargin >= metrics.targetMargin ? 'success' : 'warning'}
                  icon={<TrendingUpIcon />}
                >
                  <Typography variant="body2">
                    <strong>Total Cost:</strong> ${metrics.actualTotalCost.toFixed(2)}
                    {' '}({metrics.totalCostVariancePercent > 0 ? '+' : ''}
                    {metrics.totalCostVariancePercent.toFixed(1)}% vs estimate)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Profit:</strong> ${metrics.actualProfit.toFixed(2)}
                    {' '}({metrics.actualMargin.toFixed(1)}% margin)
                  </Typography>
                  <Typography variant="caption">
                    Profitability Score: {metrics.profitabilityScore.toFixed(1)}/100
                  </Typography>
                </Alert>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(1)}>Back</Button>
              <Button variant="contained" onClick={() => setCurrentStep(3)}>
                Next: Site Conditions
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Site Conditions & Weather */}
      {currentStep === 3 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Step 3: Site Conditions & Weather</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Weather Condition</InputLabel>
                  <Select
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                  >
                    <MenuItem value="Clear">Clear/Sunny</MenuItem>
                    <MenuItem value="Partly Cloudy">Partly Cloudy</MenuItem>
                    <MenuItem value="Cloudy">Cloudy</MenuItem>
                    <MenuItem value="Overcast">Overcast</MenuItem>
                    <MenuItem value="Light Rain">Light Rain</MenuItem>
                    <MenuItem value="Rain">Rain</MenuItem>
                    <MenuItem value="Heavy Rain">Heavy Rain</MenuItem>
                    <MenuItem value="Thunderstorm">Thunderstorm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Temperature (°F)"
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Wind Speed (mph)"
                  type="number"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(parseFloat(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Precipitation (inches)"
                  type="number"
                  value={precipitation}
                  onChange={(e) => setPrecipitation(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 0.1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>Site Access Difficulty (1 = Easy, 5 = Very Difficult)</FormLabel>
                  <Slider
                    value={siteAccessDifficulty}
                    onChange={(_, value) => setSiteAccessDifficulty(value as number)}
                    step={1}
                    marks
                    min={1}
                    max={5}
                    valueLabelDisplay="on"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ground Condition</InputLabel>
                  <Select
                    value={groundCondition}
                    onChange={(e) => setGroundCondition(e.target.value)}
                  >
                    <MenuItem value="Normal">Normal/Dry</MenuItem>
                    <MenuItem value="Soft">Soft/Muddy</MenuItem>
                    <MenuItem value="Rocky">Rocky/Hard</MenuItem>
                    <MenuItem value="Wet">Wet/Saturated</MenuItem>
                    <MenuItem value="Uneven">Uneven/Sloped</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer Availability</InputLabel>
                  <Select
                    value={customerAvailability}
                    onChange={(e) => setCustomerAvailability(e.target.value)}
                  >
                    <MenuItem value="Available">Available On-Site</MenuItem>
                    <MenuItem value="Partially Available">Partially Available</MenuItem>
                    <MenuItem value="Unavailable">Not Available</MenuItem>
                    <MenuItem value="Remote">Remote Communication Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Unexpected Obstacles or Issues"
                  value={unexpectedObstacles}
                  onChange={(e) => setUnexpectedObstacles(e.target.value)}
                  placeholder="Power lines, underground utilities, tree damage, etc."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(2)}>Back</Button>
              <Button variant="contained" onClick={() => setCurrentStep(4)}>
                Next: Quality Metrics
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Quality Metrics */}
      {currentStep === 4 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Step 4: Quality Metrics</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>Customer Satisfaction (1 = Poor, 5 = Excellent)</FormLabel>
                  <Slider
                    value={customerSatisfaction}
                    onChange={(_, value) => setCustomerSatisfaction(value as number)}
                    step={1}
                    marks
                    min={1}
                    max={5}
                    valueLabelDisplay="on"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Safety Incidents"
                  type="number"
                  value={safetyIncidents}
                  onChange={(e) => setSafetyIncidents(parseInt(e.target.value) || 0)}
                  helperText="Number of safety incidents or near-misses"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={reworkRequired}
                        onChange={(e) => setReworkRequired(e.target.checked)}
                      />
                    }
                    label="Rework Required"
                  />
                </FormGroup>
              </Grid>

              {safetyIncidents > 0 || reworkRequired && (
                <Grid item xs={12}>
                  <Alert severity="warning" icon={<WarningIcon />}>
                    Issues detected. This data will be used to improve future estimates and training.
                  </Alert>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(3)}>Back</Button>
              <Button variant="contained" onClick={() => setCurrentStep(5)}>
                Next: Equipment Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Equipment Details (simplified) */}
      {currentStep === 5 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Step 5: Equipment Details</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Equipment logs initialized with estimated values. Adjust if needed.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Equipment utilization tracking is enabled. Data will be used for ML training.
            </Alert>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(4)}>Back</Button>
              <Button variant="contained" onClick={() => setCurrentStep(6)}>
                Next: Employee Performance
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Employee Performance (simplified) */}
      {currentStep === 6 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Step 6: Employee Performance</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Employee logs initialized with estimated values. Adjust if needed.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Employee productivity tracking is enabled. Data will be used for ML training.
            </Alert>

            <Divider sx={{ my: 3 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations, lessons learned, or recommendations..."
            />

            {/* Performance Summary */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Accuracy Score
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics.accuracyScore.toFixed(0)}
                    </Typography>
                    <Typography variant="caption">/100</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Efficiency Score
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics.efficiencyScore.toFixed(0)}
                    </Typography>
                    <Typography variant="caption">/100</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Profitability Score
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics.profitabilityScore.toFixed(0)}
                    </Typography>
                    <Typography variant="caption">/100</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
                    <Typography variant="caption">
                      Overall Performance
                    </Typography>
                    <Typography variant="h4">
                      {metrics.overallPerformanceScore.toFixed(0)}
                    </Typography>
                    <Typography variant="caption">/100</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(5)}>Back</Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Completing...' : 'Complete Work Order'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
