"use client";

import { useState } from "react";
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
} from "@mui/material";
import {
  calculateLandClearingScore,
  calculateTimeEstimate,
  calculatePricing,
  TRANSPORT_RATES,
  formatCurrency,
  formatHours,
} from "@/lib/scoring-formulas";

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
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<string>(defaultLoadout?._id || loadouts?.[0]?._id || "");
  const [acres, setAcres] = useState(2);
  const [density, setDensity] = useState<Density>("Average");
  const [afissMultiplier, setAfissMultiplier] = useState(1.0);

  const loadout = loadouts?.find(l => l._id === selectedLoadoutId) || defaultLoadout;

  // Calculate score
  const scoreResult = calculateLandClearingScore({
    acres,
    density,
    afissMultiplier,
  });

  // Calculate time estimate if loadout provided
  const timeEstimate = loadout
    ? calculateTimeEstimate({
        adjustedScore: scoreResult.adjustedScore,
        productionRatePPH: loadout.productionRate,
        driveTimeMinutes,
        transportRate: TRANSPORT_RATES["Land Clearing"],
      })
    : null;

  // Calculate pricing if loadout provided
  const pricing = loadout && timeEstimate
    ? calculatePricing({
        totalEstimatedHours: timeEstimate.totalEstimatedHours,
        costPerHour: loadout.totalCostPerHour,
        targetMargin: 50,
      })
    : null;

  const handleCreateLineItem = () => {
    if (!loadout || !timeEstimate || !pricing) return;

    const lineItemData = {
      serviceType: "Land Clearing",
      description: `${acres} acres, ${density} density - ${scoreResult.adjustedScore} clearing score`,
      formulaUsed: scoreResult.formulaUsed,
      workVolumeInputs: scoreResult.workVolumeInputs,
      baseScore: scoreResult.baseScore,
      complexityMultiplier: scoreResult.complexityMultiplier,
      adjustedScore: scoreResult.adjustedScore,
      termsAndConditions: LAND_CLEARING_TERMS,
      loadoutId: loadout._id,
      loadoutName: loadout.name,
      productionRatePPH: loadout.productionRate,
      costPerHour: loadout.totalCostPerHour,
      billingRatePerHour: pricing.totalPrice / timeEstimate.totalEstimatedHours,
      targetMargin: 50,
      productionHours: timeEstimate.productionHours,
      transportHours: timeEstimate.transportHours,
      bufferHours: timeEstimate.bufferHours,
      totalEstimatedHours: timeEstimate.totalEstimatedHours,
      pricingMethod: pricing.pricingMethod,
      totalCost: pricing.totalCost,
      totalPrice: pricing.totalPrice,
      profit: pricing.profit,
      marginPercent: pricing.marginPercent,
    };

    onLineItemCreate?.(lineItemData);
  };

  return (
    <Stack spacing={2}>
      {/* Loadout Selection */}
      {loadouts && loadouts.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Select Equipment Loadout
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Loadout</InputLabel>
            <Select
              value={selectedLoadoutId}
              label="Loadout"
              onChange={(e) => setSelectedLoadoutId(e.target.value)}
            >
              {loadouts.map((l) => (
                <MenuItem key={l._id} value={l._id}>
                  {l.name} - {l.productionRate} PpH @ {formatCurrency(l.totalCostPerHour)}/hr
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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

      {/* Results Summary */}
      <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          ClearingScore: <strong>{scoreResult.adjustedScore}</strong>
        </Typography>
        {timeEstimate && (
          <Typography variant="body2" color="text.secondary">
            Estimated Time: <strong>{formatHours(timeEstimate.totalEstimatedHours)}</strong>
          </Typography>
        )}
        {pricing && (
          <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
            Price: <strong>{formatCurrency(pricing.totalPrice)}</strong>
          </Typography>
        )}
      </Box>

      {loadout && (
        <Button
          variant="contained"
          onClick={handleCreateLineItem}
          fullWidth
        >
          Add to Proposal
        </Button>
      )}
    </Stack>
  );
}
