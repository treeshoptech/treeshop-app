'use client';

/**
 * ML Analytics Dashboard
 *
 * Comprehensive machine learning analytics and insights:
 * - Job performance trends (actual vs estimated accuracy)
 * - Equipment utilization and efficiency analytics
 * - Employee productivity insights
 * - Weather impact correlation
 * - Customer behavior patterns
 * - ML model performance tracking
 * - Prediction accuracy monitoring
 * - Data quality metrics
 */

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  DataUsage as DataUsageIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  People as PeopleIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { useState } from 'react';

export default function MLAnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Fetch all ML data
  const jobMetrics = useQuery(api.analytics.getAllJobPerformanceMetrics, {});
  const mlModels = useQuery(api.analytics.getAllMLModelPerformance, {});
  const mlTrainingData = useQuery(api.analytics.getMLTrainingData, {
    includeInTraining: true,
  });

  // Calculate aggregate analytics
  const analytics = useMemo(() => {
    if (!jobMetrics || jobMetrics.length === 0) {
      return {
        totalJobs: 0,
        avgAccuracy: 0,
        avgEfficiency: 0,
        avgProfitability: 0,
        avgOverallPerformance: 0,
        timeVariance: { avg: 0, trend: 'neutral' },
        costVariance: { avg: 0, trend: 'neutral' },
        profitVariance: { avg: 0, trend: 'neutral' },
        weatherImpact: [],
        topPerformers: [],
        improvementOpportunities: [],
        dataQuality: { high: 0, medium: 0, low: 0 },
        mlReadiness: 0,
      };
    }

    const totalJobs = jobMetrics.length;

    // Average scores
    const avgAccuracy = jobMetrics.reduce((sum, m) => sum + m.accuracyScore, 0) / totalJobs;
    const avgEfficiency = jobMetrics.reduce((sum, m) => sum + m.efficiencyScore, 0) / totalJobs;
    const avgProfitability = jobMetrics.reduce((sum, m) => sum + m.profitabilityScore, 0) / totalJobs;
    const avgOverallPerformance = jobMetrics.reduce((sum, m) => sum + m.overallPerformanceScore, 0) / totalJobs;

    // Variance analysis
    const avgTimeVariance = jobMetrics.reduce((sum, m) => sum + m.productionVariancePercent, 0) / totalJobs;
    const avgCostVariance = jobMetrics.reduce((sum, m) => sum + m.totalCostVariancePercent, 0) / totalJobs;
    const avgProfitVariance = jobMetrics.reduce((sum, m) => sum + m.profitVariancePercent, 0) / totalJobs;

    // Trends (compare first half vs second half)
    const midpoint = Math.floor(totalJobs / 2);
    const recentJobs = jobMetrics.slice(midpoint);
    const olderJobs = jobMetrics.slice(0, midpoint);

    const recentAvgAccuracy = recentJobs.reduce((sum, m) => sum + m.accuracyScore, 0) / recentJobs.length;
    const olderAvgAccuracy = olderJobs.length > 0
      ? olderJobs.reduce((sum, m) => sum + m.accuracyScore, 0) / olderJobs.length
      : recentAvgAccuracy;

    const accuracyTrend = recentAvgAccuracy > olderAvgAccuracy ? 'improving' : recentAvgAccuracy < olderAvgAccuracy ? 'declining' : 'stable';

    // Weather impact correlation
    const weatherGroups = jobMetrics.reduce((groups, m) => {
      const condition = m.weatherCondition || 'Unknown';
      if (!groups[condition]) groups[condition] = [];
      groups[condition].push(m);
      return groups;
    }, {} as Record<string, typeof jobMetrics>);

    const weatherImpact = Object.entries(weatherGroups).map(([condition, jobs]) => ({
      condition,
      jobCount: jobs.length,
      avgAccuracy: jobs.reduce((sum, m) => sum + m.accuracyScore, 0) / jobs.length,
      avgEfficiency: jobs.reduce((sum, m) => sum + m.efficiencyScore, 0) / jobs.length,
      avgTimeVariance: jobs.reduce((sum, m) => sum + Math.abs(m.productionVariancePercent), 0) / jobs.length,
    })).sort((a, b) => b.jobCount - a.jobCount);

    // Top performers
    const topPerformers = [...jobMetrics]
      .sort((a, b) => b.overallPerformanceScore - a.overallPerformanceScore)
      .slice(0, 5);

    // Improvement opportunities
    const lowPerformers = jobMetrics.filter(m => m.overallPerformanceScore < 70);
    const improvementOpportunities = lowPerformers
      .map(m => ({
        project: m.projectId,
        score: m.overallPerformanceScore,
        primaryIssue:
          m.accuracyScore < 70 ? 'Time Estimation' :
          m.efficiencyScore < 70 ? 'Cost Control' :
          'Profitability',
        recommendation:
          m.accuracyScore < 70 ? 'Review production rate assumptions' :
          m.efficiencyScore < 70 ? 'Analyze cost overruns and waste' :
          'Adjust pricing or target margin',
      }));

    // Data quality assessment
    const dataQuality = {
      high: mlTrainingData?.filter(d => d.dataQuality === 'High').length || 0,
      medium: mlTrainingData?.filter(d => d.dataQuality === 'Medium').length || 0,
      low: mlTrainingData?.filter(d => d.dataQuality === 'Low').length || 0,
    };

    const mlReadiness = mlTrainingData && mlTrainingData.length > 0
      ? (mlTrainingData.filter(d => d.includeInTraining).length / mlTrainingData.length) * 100
      : 0;

    return {
      totalJobs,
      avgAccuracy,
      avgEfficiency,
      avgProfitability,
      avgOverallPerformance,
      timeVariance: { avg: avgTimeVariance, trend: accuracyTrend },
      costVariance: { avg: avgCostVariance, trend: accuracyTrend },
      profitVariance: { avg: avgProfitVariance, trend: accuracyTrend },
      weatherImpact,
      topPerformers,
      improvementOpportunities,
      dataQuality,
      mlReadiness,
    };
  }, [jobMetrics, mlTrainingData]);

  if (!jobMetrics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PsychologyIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">
            ML Analytics Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Machine learning insights and continuous improvement metrics
        </Typography>
      </Box>

      {/* No data state */}
      {analytics.totalJobs === 0 && (
        <Alert severity="info" icon={<InsightsIcon />} sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            <strong>ML Analytics Ready to Launch</strong>
          </Typography>
          <Typography variant="body2">
            Complete your first work order using the job completion form to start collecting ML training data.
            The system will automatically track actual vs estimated performance and generate insights.
          </Typography>
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Overall Performance */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Overall Performance
                  </Typography>
                  <Typography variant="h3">
                    {analytics.avgOverallPerformance.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">/100</Typography>
                </Box>
                <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={analytics.avgOverallPerformance}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              <Chip
                label={analytics.timeVariance.trend === 'improving' ? 'Improving' : analytics.timeVariance.trend === 'declining' ? 'Declining' : 'Stable'}
                size="small"
                color={analytics.timeVariance.trend === 'improving' ? 'success' : analytics.timeVariance.trend === 'declining' ? 'error' : 'default'}
                icon={analytics.timeVariance.trend === 'improving' ? <TrendingUpIcon /> : analytics.timeVariance.trend === 'declining' ? <TrendingDownIcon /> : undefined}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Accuracy Score */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Time Accuracy
                  </Typography>
                  <Typography variant="h3">
                    {analytics.avgAccuracy.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">/100</Typography>
                </Box>
                <TimelineIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Avg variance: {analytics.timeVariance.avg > 0 ? '+' : ''}{analytics.timeVariance.avg.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Efficiency Score */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Cost Efficiency
                  </Typography>
                  <Typography variant="h3">
                    {analytics.avgEfficiency.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">/100</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Avg variance: {analytics.costVariance.avg > 0 ? '+' : ''}{analytics.costVariance.avg.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profitability Score */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Profitability
                  </Typography>
                  <Typography variant="h3">
                    {analytics.avgProfitability.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">/100</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Avg variance: {analytics.profitVariance.avg > 0 ? '+' : ''}{analytics.profitVariance.avg.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ML Data Quality */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataUsageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">ML Training Data Quality</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="h4">{analytics.dataQuality.high}</Typography>
                    <Typography variant="caption">High Quality</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                    <Typography variant="h4">{analytics.dataQuality.medium}</Typography>
                    <Typography variant="caption">Medium Quality</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                    <Typography variant="h4">{analytics.dataQuality.low}</Typography>
                    <Typography variant="caption">Low Quality</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ML Readiness: {analytics.mlReadiness.toFixed(0)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={analytics.mlReadiness}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {mlTrainingData?.filter(d => d.includeInTraining).length || 0} of {mlTrainingData?.length || 0} records ready for training
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">ML Model Status</Typography>
              </Box>

              {mlModels && mlModels.length > 0 ? (
                <Stack spacing={2}>
                  {mlModels.slice(0, 3).map((model) => (
                    <Paper key={model._id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1">{model.modelType}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            v{model.modelVersion} • {model.status}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${model.accuracy.toFixed(1)}% accurate`}
                          size="small"
                          color={model.accuracy >= 90 ? 'success' : model.accuracy >= 75 ? 'warning' : 'default'}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={model.accuracy}
                        sx={{ mt: 1, height: 4, borderRadius: 1 }}
                      />
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    No ML models trained yet. Collect at least 20 high-quality job records to begin training.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for detailed analytics */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Weather Impact" />
          <Tab label="Top Performers" />
          <Tab label="Improvement Opportunities" />
          <Tab label="Job History" />
        </Tabs>
      </Paper>

      {/* Tab 1: Weather Impact */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Weather Impact Analysis</Typography>
            </Box>

            {analytics.weatherImpact.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Weather Condition</TableCell>
                      <TableCell align="right">Jobs</TableCell>
                      <TableCell align="right">Avg Accuracy</TableCell>
                      <TableCell align="right">Avg Efficiency</TableCell>
                      <TableCell align="right">Avg Time Variance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.weatherImpact.map((weather) => (
                      <TableRow key={weather.condition}>
                        <TableCell>{weather.condition}</TableCell>
                        <TableCell align="right">{weather.jobCount}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${weather.avgAccuracy.toFixed(0)}/100`}
                            size="small"
                            color={weather.avgAccuracy >= 85 ? 'success' : weather.avgAccuracy >= 70 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${weather.avgEfficiency.toFixed(0)}/100`}
                            size="small"
                            color={weather.avgEfficiency >= 85 ? 'success' : weather.avgEfficiency >= 70 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {weather.avgTimeVariance.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No weather data collected yet. Weather conditions will be tracked automatically when work orders are completed.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Top Performers */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Top Performing Jobs</Typography>
            </Box>

            {analytics.topPerformers.length > 0 ? (
              <Stack spacing={2}>
                {analytics.topPerformers.map((job, index) => (
                  <Paper key={job._id} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1">
                          #{index + 1} • Project {job.projectId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Accuracy: {job.accuracyScore.toFixed(0)} • Efficiency: {job.efficiencyScore.toFixed(0)} • Profitability: {job.profitabilityScore.toFixed(0)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${job.overallPerformanceScore.toFixed(0)}/100`}
                        color="success"
                        icon={<CheckCircleIcon />}
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">
                Complete jobs to see top performers
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Improvement Opportunities */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Improvement Opportunities</Typography>
            </Box>

            {analytics.improvementOpportunities.length > 0 ? (
              <Stack spacing={2}>
                {analytics.improvementOpportunities.map((opp) => (
                  <Alert key={opp.project} severity="warning">
                    <Typography variant="body2">
                      <strong>Project {opp.project}</strong> • Score: {opp.score.toFixed(0)}/100
                    </Typography>
                    <Typography variant="body2">
                      Primary Issue: {opp.primaryIssue}
                    </Typography>
                    <Typography variant="caption">
                      Recommendation: {opp.recommendation}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            ) : (
              <Alert severity="success">
                All jobs are performing above threshold! Keep up the great work.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Job History */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Job Performance
            </Typography>

            {jobMetrics && jobMetrics.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project ID</TableCell>
                      <TableCell align="right">Overall Score</TableCell>
                      <TableCell align="right">Time Variance</TableCell>
                      <TableCell align="right">Cost Variance</TableCell>
                      <TableCell align="right">Profit Variance</TableCell>
                      <TableCell>Weather</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobMetrics.slice(-10).reverse().map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>{job.projectId}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={job.overallPerformanceScore.toFixed(0)}
                            size="small"
                            color={job.overallPerformanceScore >= 85 ? 'success' : job.overallPerformanceScore >= 70 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {job.productionVariancePercent > 0 ? '+' : ''}{job.productionVariancePercent.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          {job.totalCostVariancePercent > 0 ? '+' : ''}{job.totalCostVariancePercent.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          {job.profitVariancePercent > 0 ? '+' : ''}{job.profitVariancePercent.toFixed(1)}%
                        </TableCell>
                        <TableCell>{job.weatherCondition || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No job history yet
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
