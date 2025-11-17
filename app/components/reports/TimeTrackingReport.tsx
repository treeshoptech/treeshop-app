"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CompleteIcon,
  AttachMoney as MoneyIcon,
  Speed as PPHIcon,
  TrendingUp as TrendIcon,
} from "@mui/icons-material";

interface TimeTrackingReportProps {
  workOrderId: Id<"workOrders">;
}

export default function TimeTrackingReport({
  workOrderId,
}: TimeTrackingReportProps) {
  const summary = useQuery(api.jobCompletion.getJobSummary, {
    workOrderId,
  });

  if (!summary) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)} hrs`;
  };

  const getVarianceColor = (variance: number | undefined) => {
    if (!variance) return "text.secondary";
    if (variance > 0) return "error.main";
    if (variance < 0) return "success.main";
    return "text.secondary";
  };

  const getVarianceIcon = (variance: number | undefined) => {
    if (!variance) return "";
    if (variance > 0) return "↑";
    if (variance < 0) return "↓";
    return "";
  };

  return (
    <Stack spacing={3}>
      {/* Key Metrics */}
      <Grid container spacing={2}>
        {/* Total Hours */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total Hours
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatHours(summary.totalHours)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.timeEntryCount} entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Production Hours */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "success.dark" }}>
            <CardContent>
              <Typography variant="caption" color="success.contrastText">
                Production Hours
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.contrastText">
                {formatHours(summary.productionHours)}
              </Typography>
              <Typography variant="caption" color="success.contrastText">
                {summary.productionPercentage.toFixed(0)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Actual PPH */}
        {summary.actualPPH && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "primary.dark" }}>
              <CardContent>
                <Typography variant="caption" color="primary.contrastText">
                  Actual PPH
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.contrastText">
                  {summary.actualPPH.toFixed(2)}
                </Typography>
                {summary.pphVariance && (
                  <Typography
                    variant="caption"
                    color={
                      summary.pphVariance > 0
                        ? "success.light"
                        : "error.light"
                    }
                  >
                    {getVarianceIcon(summary.pphVariance)}{" "}
                    {Math.abs(summary.pphVariance).toFixed(2)} vs standard
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Actual Profit */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: summary.actualProfit > 0 ? "success.dark" : "error.dark" }}>
            <CardContent>
              <Typography variant="caption" color={summary.actualProfit > 0 ? "success.contrastText" : "error.contrastText"}>
                Actual Profit
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={summary.actualProfit > 0 ? "success.contrastText" : "error.contrastText"}>
                {formatCurrency(summary.actualProfit)}
              </Typography>
              <Typography variant="caption" color={summary.actualProfit > 0 ? "success.contrastText" : "error.contrastText"}>
                {summary.actualMargin.toFixed(1)}% margin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hours Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hours Distribution
          </Typography>
          <Stack spacing={2}>
            {/* Production */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">
                  Production (Billable + PPH)
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatHours(summary.productionHours)} (
                  {summary.productionPercentage.toFixed(0)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={summary.productionPercentage}
                color="success"
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            {/* Site Support */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">
                  Site Support (Billable, No PPH)
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatHours(summary.siteSupportHours)} (
                  {((summary.siteSupportHours / summary.totalHours) * 100).toFixed(
                    0
                  )}
                  %)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(summary.siteSupportHours / summary.totalHours) * 100}
                color="primary"
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            {/* General Support */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">
                  General Support (Non-Billable)
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatHours(summary.generalSupportHours)} (
                  {((summary.generalSupportHours / summary.totalHours) * 100).toFixed(
                    0
                  )}
                  %)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(summary.generalSupportHours / summary.totalHours) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Task Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Task Breakdown
          </Typography>
          <Stack spacing={1}>
            {summary.taskBreakdown.map((task) => (
              <Paper key={task.taskName} variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {task.taskName}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                      {task.isBillable && (
                        <Chip label="Billable" size="small" color="success" />
                      )}
                      {task.countsForPPH && (
                        <Chip label="PPH" size="small" color="warning" />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatHours(task.hours)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(task.cost)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Financial Summary
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Client Price
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(summary.clientPrice)}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Labor Cost
              </Typography>
              <Typography variant="body1">
                {formatCurrency(summary.actualLaborCost)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Equipment Cost
              </Typography>
              <Typography variant="body1">
                {formatCurrency(summary.actualEquipmentCost)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" fontWeight="bold">
                Total Cost
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(summary.actualTotalCost)}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" fontWeight="bold" color="primary">
                Actual Profit
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {formatCurrency(summary.actualProfit)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Actual Margin
              </Typography>
              <Typography variant="body1">
                {summary.actualMargin.toFixed(1)}%
              </Typography>
            </Box>

            {summary.projectedMargin && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  vs Projected Margin
                </Typography>
                <Typography
                  variant="caption"
                  color={getVarianceColor(summary.marginVariance)}
                >
                  {getVarianceIcon(summary.marginVariance)}{" "}
                  {summary.marginVariance
                    ? `${Math.abs(summary.marginVariance).toFixed(1)}%`
                    : "—"}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Variances (if estimated data exists) */}
      {summary.estimatedCost && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance vs Estimate
            </Typography>
            <Stack spacing={2}>
              {summary.pphVariance !== undefined && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">PPH Variance</Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={getVarianceColor(summary.pphVariance)}
                  >
                    {getVarianceIcon(summary.pphVariance)}{" "}
                    {Math.abs(summary.pphVariance).toFixed(2)}
                  </Typography>
                </Box>
              )}

              {summary.costVariance !== undefined && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Cost Variance</Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={getVarianceColor(summary.costVariance)}
                  >
                    {getVarianceIcon(summary.costVariance)}{" "}
                    {formatCurrency(Math.abs(summary.costVariance))}
                  </Typography>
                </Box>
              )}

              {summary.profitVariance !== undefined && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Profit Variance</Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={getVarianceColor(-summary.profitVariance)} // Negative variance is good for profit
                  >
                    {getVarianceIcon(-summary.profitVariance)}{" "}
                    {formatCurrency(Math.abs(summary.profitVariance))}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
