"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import {
  calculateLandClearingScore,
  calculateTimeEstimate,
  calculatePricing,
  TRANSPORT_RATES,
  formatCurrency,
  formatHours,
} from "@/lib/scoring-formulas";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Service-specific Terms & Conditions
const LAND_CLEARING_TERMS = [
  "All vegetation and brush will be cleared to ground level",
  "Debris will be hauled off-site unless otherwise specified",
  "Final grading and cleanup included in scope",
  "Property boundaries and utilities must be clearly marked before work begins",
];

interface LandClearingCalculatorProps {
  loadout?: {
    _id: string;
    name: string;
    productionRate: number;
    totalCostPerHour: number;
    billingRates: {
      margin30: number;
      margin40: number;
      margin50: number;
      margin60: number;
      margin70: number;
    };
  };
  loadouts?: Array<{
    _id: string;
    name: string;
    productionRate: number;
    totalCostPerHour: number;
    billingRates: {
      margin30: number;
      margin40: number;
      margin50: number;
      margin60: number;
      margin70: number;
    };
  }>;
  driveTimeMinutes?: number;
  onLineItemCreate?: (lineItemData: any) => void;
}

type Density = "Light" | "Average" | "Heavy";

export default function LandClearingCalculator({
  loadout: defaultLoadout,
  loadouts,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: LandClearingCalculatorProps) {
  const [acres, setAcres] = useState(2);
  const [density, setDensity] = useState<Density>("Average");
  const [afissMultiplier, setAfissMultiplier] = useState(1.0);

  // TWO-TIER SYSTEM: Fetch service template for Land Clearing
  const serviceTemplate = useQuery(api.serviceTemplates.getByServiceType, {
    serviceType: "Land Clearing"
  });

  // TWO-TIER SYSTEM: Calculate work score
  const scoreResult = calculateLandClearingScore({
    acres,
    density,
    afissMultiplier,
  });

  const { baseScore, complexityMultiplier, adjustedScore } = scoreResult;

  // TWO-TIER SYSTEM: Calculate estimated hours using SERVICE TEMPLATE
  const estimatedHours = serviceTemplate && serviceTemplate.standardPPH > 0
    ? adjustedScore / serviceTemplate.standardPPH
    : null;

  // TWO-TIER SYSTEM: Calculate client price using SERVICE TEMPLATE (LOCKED at proposal)
  const clientPrice = estimatedHours && serviceTemplate
    ? estimatedHours * serviceTemplate.standardBillingRate
    : null;

  // TWO-TIER SYSTEM: Calculate estimated cost using SERVICE TEMPLATE
  const estimatedCost = estimatedHours && serviceTemplate
    ? estimatedHours * serviceTemplate.standardCostPerHour
    : null;

  // TWO-TIER SYSTEM: Calculate projected profit
  const projectedProfit = clientPrice && estimatedCost
    ? clientPrice - estimatedCost
    : null;

  const projectedMargin = projectedProfit && clientPrice
    ? (projectedProfit / clientPrice) * 100
    : null;

  const handleCreateLineItem = () => {
    if (!serviceTemplate || !estimatedHours || !clientPrice) return;

    const lineItemData = {
      // TWO-TIER SYSTEM: Service identification
      serviceType: "Land Clearing",
      formulaUsed: "ClearingScore",
      description: `${acres} acres, ${density} density - ${adjustedScore.toFixed(1)} clearing score`,

      // TWO-TIER SYSTEM: Work volume and scoring
      workVolumeInputs: scoreResult.workVolumeInputs,
      baseScore,
      complexityMultiplier,
      adjustedScore,

      // TWO-TIER SYSTEM: Service template (Tier 1 - LOCKED pricing)
      serviceTemplateId: serviceTemplate._id,
      standardPPH: serviceTemplate.standardPPH,
      standardCostPerHour: serviceTemplate.standardCostPerHour,
      standardBillingRate: serviceTemplate.standardBillingRate,
      estimatedHours,
      estimatedCost,
      clientPrice, // LOCKED - does not change with loadout assignment

      // TWO-TIER SYSTEM: Projected profitability
      projectedProfit,
      projectedMargin,

      // Terms & Conditions
      termsAndConditions: LAND_CLEARING_TERMS,
    };

    onLineItemCreate?.(lineItemData);
  };

  return (
    <Stack spacing={2}>
      {/* TWO-TIER SYSTEM: Service Template Status */}
      {!serviceTemplate && (
        <Alert severity="warning">
          No service template found for Land Clearing. Please set up a service template first.
        </Alert>
      )}

      {serviceTemplate && (
        <Alert severity="info">
          Using company standard: {serviceTemplate.standardPPH} PPH @ {formatCurrency(serviceTemplate.standardBillingRate)}/hr
          <br />
          <Typography variant="caption">
            Price is based on company-wide averages and will be locked when proposal is created.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Acreage"
            value={acres}
            onChange={(e) => setAcres(parseFloat(e.target.value) || 0.5)}
            InputProps={{ inputProps: { min: 0.5, max: 20, step: 0.5 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="AFISS Complexity Multiplier"
            value={afissMultiplier}
            onChange={(e) => setAfissMultiplier(parseFloat(e.target.value) || 1.0)}
            InputProps={{ inputProps: { min: 1.0, max: 2.0, step: 0.05 } }}
            helperText="Adjust based on utilities, structures, etc."
          />
        </Grid>
      </Grid>

      <FormControl>
        <Typography variant="subtitle2" gutterBottom>Vegetation Density</Typography>
        <RadioGroup
          value={density}
          onChange={(e) => setDensity(e.target.value as Density)}
          row
        >
          <FormControlLabel
            value="Light"
            control={<Radio />}
            label="Light"
          />
          <FormControlLabel
            value="Average"
            control={<Radio />}
            label="Average"
          />
          <FormControlLabel
            value="Heavy"
            control={<Radio />}
            label="Heavy"
          />
        </RadioGroup>
      </FormControl>

      {/* TWO-TIER SYSTEM: Results Summary */}
      {!serviceTemplate ? (
        <Paper sx={{ p: 2, bgcolor: 'error.dark' }}>
          <Typography variant="body2" color="error.light">
            ⚠️ No service template configured. Please set up Land Clearing template first.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work Score Calculation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Base Score: <strong>{baseScore.toFixed(1)} CS</strong> ({acres} acres, {density} density)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AFISS Multiplier: <strong>{complexityMultiplier.toFixed(2)}x</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjusted Score: <strong>{adjustedScore.toFixed(1)} CS</strong>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Pricing (Company Standard)
            </Typography>
            {estimatedHours && (
              <Typography variant="body2" color="text.secondary">
                Estimated Hours: <strong>{formatHours(estimatedHours)}</strong>
                <Typography variant="caption" display="block">
                  ({adjustedScore.toFixed(1)} ÷ {serviceTemplate.standardPPH} PPH)
                </Typography>
              </Typography>
            )}
            {estimatedCost && (
              <Typography variant="body2" color="text.secondary">
                Estimated Cost: <strong>{formatCurrency(estimatedCost)}</strong>
              </Typography>
            )}
            {clientPrice && (
              <>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  Client Price: <strong>{formatCurrency(clientPrice)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  🔒 Locked price - won't change with crew assignment
                </Typography>
              </>
            )}
            {projectedMargin && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Target Margin: <strong>{projectedMargin.toFixed(1)}%</strong>
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={handleCreateLineItem}
            fullWidth
            disabled={!clientPrice}
          >
            Add to Proposal
          </Button>
        </>
      )}
    </Stack>
  );
}
