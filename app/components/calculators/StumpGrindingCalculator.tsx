"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  calculateStumpScore,
  calculateTimeEstimate,
  calculatePricing,
  TRANSPORT_RATES,
  MINIMUM_HOURS,
  formatCurrency,
  formatHours,
  type StumpInput,
} from "@/lib/scoring-formulas";

interface StumpEntry extends StumpInput {
  id: string;
}

interface StumpGrindingCalculatorProps {
  loadout?: {
    _id: string;
    name: string;
    productionRatePPH: number;
    costPerHour: number;
    targetMargin: number;
  };
  driveTimeMinutes?: number;
  onLineItemCreate?: (lineItemData: any) => void;
}

export default function StumpGrindingCalculator({
  loadout,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: StumpGrindingCalculatorProps) {
  const [stumps, setStumps] = useState<StumpEntry[]>([
    {
      id: crypto.randomUUID(),
      diameter: 18,
      heightAbove: 1,
      depthBelow: 1,
      hardwood: false,
      rootFlare: false,
      rotten: false,
      rocks: false,
      tightSpace: false,
    },
  ]);

  const addStump = () => {
    setStumps([
      ...stumps,
      {
        id: crypto.randomUUID(),
        diameter: 12,
        heightAbove: 1,
        depthBelow: 1,
        hardwood: false,
        rootFlare: false,
        rotten: false,
        rocks: false,
        tightSpace: false,
      },
    ]);
  };

  const removeStump = (id: string) => {
    if (stumps.length > 1) {
      setStumps(stumps.filter((s) => s.id !== id));
    }
  };

  const updateStump = (id: string, updates: Partial<StumpEntry>) => {
    setStumps(stumps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Calculate score
  const scoreResult = calculateStumpScore(stumps);

  // Calculate time estimate if loadout provided
  const timeEstimate = loadout
    ? calculateTimeEstimate({
        adjustedScore: scoreResult.adjustedScore,
        productionRatePPH: loadout.productionRatePPH,
        driveTimeMinutes,
        transportRate: TRANSPORT_RATES["Stump Grinding"],
        minimumHours: MINIMUM_HOURS["Stump Grinding"],
      })
    : null;

  // Calculate pricing if loadout provided
  const pricing = loadout && timeEstimate
    ? calculatePricing({
        totalEstimatedHours: timeEstimate.totalEstimatedHours,
        costPerHour: loadout.costPerHour,
        targetMargin: loadout.targetMargin,
      })
    : null;

  const handleCreateLineItem = () => {
    if (!loadout || !timeEstimate || !pricing) return;

    const lineItemData = {
      serviceType: "Stump Grinding",
      description: `${stumps.length} stump${stumps.length > 1 ? "s" : ""} - ${scoreResult.adjustedScore} points`,
      formulaUsed: scoreResult.formulaUsed,
      workVolumeInputs: scoreResult.workVolumeInputs,
      baseScore: scoreResult.baseScore,
      complexityMultiplier: scoreResult.complexityMultiplier,
      adjustedScore: scoreResult.adjustedScore,
      loadoutId: loadout._id,
      loadoutName: loadout.name,
      productionRatePPH: loadout.productionRatePPH,
      costPerHour: loadout.costPerHour,
      billingRatePerHour: pricing.totalPrice / timeEstimate.totalEstimatedHours,
      targetMargin: loadout.targetMargin,
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
      {/* Stumps */}
      {stumps.map((stump, index) => (
        <Card key={stump.id} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" fontWeight={600}>Stump {index + 1}</Typography>
                {stumps.length > 1 && (
                  <IconButton onClick={() => removeStump(stump.id)} color="error" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Diameter (inches)"
                    value={stump.diameter}
                    onChange={(e) => updateStump(stump.id, { diameter: parseFloat(e.target.value) || 6 })}
                    InputProps={{ inputProps: { min: 6, max: 60, step: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Height Above (ft)"
                    value={stump.heightAbove}
                    onChange={(e) => updateStump(stump.id, { heightAbove: parseFloat(e.target.value) || 0 })}
                    InputProps={{ inputProps: { min: 0, max: 3, step: 0.5 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Depth Below (ft)"
                    value={stump.depthBelow}
                    onChange={(e) => updateStump(stump.id, { depthBelow: parseFloat(e.target.value) || 0.5 })}
                    InputProps={{ inputProps: { min: 0.5, max: 1.5, step: 0.25 } }}
                  />
                </Grid>
              </Grid>

              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stump.hardwood}
                      onChange={(e) => updateStump(stump.id, { hardwood: e.target.checked })}
                    />
                  }
                  label="Hardwood"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stump.rootFlare}
                      onChange={(e) => updateStump(stump.id, { rootFlare: e.target.checked })}
                    />
                  }
                  label="Root Flare"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stump.rotten}
                      onChange={(e) => updateStump(stump.id, { rotten: e.target.checked })}
                    />
                  }
                  label="Rotten"
                />
              </FormGroup>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addStump}
        size="small"
      >
        Add Another Stump
      </Button>

      {/* Results Summary */}
      <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Total StumpScore: <strong>{scoreResult.adjustedScore}</strong>
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
