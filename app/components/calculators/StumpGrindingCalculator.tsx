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
  IconButton,
  Paper,
  Slider,
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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stump Grinding Calculator
      </Typography>

      <Stack spacing={3}>
        {/* Stumps */}
        {stumps.map((stump, index) => (
          <Card key={stump.id}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="h6">Stump {index + 1}</Typography>
                  {stumps.length > 1 && (
                    <IconButton onClick={() => removeStump(stump.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Box>
                  <Typography gutterBottom>Diameter: {stump.diameter}"</Typography>
                  <Slider
                    value={stump.diameter}
                    onChange={(_, val) => updateStump(stump.id, { diameter: val as number })}
                    min={6}
                    max={60}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>Height Above Grade: {stump.heightAbove} ft</Typography>
                  <Slider
                    value={stump.heightAbove}
                    onChange={(_, val) => updateStump(stump.id, { heightAbove: val as number })}
                    min={0}
                    max={3}
                    step={0.5}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>Grind Depth Below: {stump.depthBelow} ft</Typography>
                  <Slider
                    value={stump.depthBelow}
                    onChange={(_, val) => updateStump(stump.id, { depthBelow: val as number })}
                    min={0.5}
                    max={1.5}
                    step={0.25}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Divider />

                <Typography variant="subtitle2">Modifiers</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stump.hardwood}
                        onChange={(e) => updateStump(stump.id, { hardwood: e.target.checked })}
                      />
                    }
                    label="Hardwood species (oak, hickory) +15%"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stump.rootFlare}
                        onChange={(e) => updateStump(stump.id, { rootFlare: e.target.checked })}
                      />
                    }
                    label="Large root flare/buttress +20%"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stump.rotten}
                        onChange={(e) => updateStump(stump.id, { rotten: e.target.checked })}
                      />
                    }
                    label="Rotten/deteriorated stump -15%"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stump.rocks}
                        onChange={(e) => updateStump(stump.id, { rocks: e.target.checked })}
                      />
                    }
                    label="Rocks in root zone +10%"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stump.tightSpace}
                        onChange={(e) => updateStump(stump.id, { tightSpace: e.target.checked })}
                      />
                    }
                    label="Tight landscaping or near foundation +15%"
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
          fullWidth
        >
          Add Another Stump
        </Button>

        {/* Results */}
        <Paper sx={{ p: 3, bgcolor: "background.default" }}>
          <Typography variant="h5" gutterBottom>
            Calculation Results
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total StumpScore Points
              </Typography>
              <Typography variant="h4">{scoreResult.adjustedScore}</Typography>
            </Box>

            {timeEstimate && (
              <>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Time Breakdown
                  </Typography>
                  <Typography>Production: {formatHours(timeEstimate.productionHours)}</Typography>
                  <Typography>Transport: {formatHours(timeEstimate.transportHours)}</Typography>
                  <Typography>Buffer (10%): {formatHours(timeEstimate.bufferHours)}</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Total: {formatHours(timeEstimate.totalEstimatedHours)}
                  </Typography>
                </Box>
              </>
            )}

            {pricing && (
              <>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pricing
                  </Typography>
                  <Typography>Cost: {formatCurrency(pricing.totalCost)}</Typography>
                  <Typography>Price: {formatCurrency(pricing.totalPrice)}</Typography>
                  <Typography>Profit: {formatCurrency(pricing.profit)}</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Margin: {pricing.marginPercent.toFixed(1)}%
                  </Typography>
                </Box>
              </>
            )}

            {loadout && (
              <Button
                variant="contained"
                onClick={handleCreateLineItem}
                fullWidth
                size="large"
              >
                Create Line Item
              </Button>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
