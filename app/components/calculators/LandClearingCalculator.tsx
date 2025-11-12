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
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
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

interface LandClearingCalculatorProps {
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

type Density = "Light" | "Average" | "Heavy";

export default function LandClearingCalculator({
  loadout,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: LandClearingCalculatorProps) {
  const [acres, setAcres] = useState(2);
  const [density, setDensity] = useState<Density>("Average");
  const [afissMultiplier, setAfissMultiplier] = useState(1.0);

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
        productionRatePPH: loadout.productionRatePPH,
        driveTimeMinutes,
        transportRate: TRANSPORT_RATES["Land Clearing"],
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
      serviceType: "Land Clearing",
      description: `${acres} acres, ${density} density - ${scoreResult.adjustedScore} clearing score`,
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
        Land Clearing Calculator
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography gutterBottom>Acreage: {acres} acres</Typography>
                <Slider
                  value={acres}
                  onChange={(_, val) => setAcres(val as number)}
                  min={0.5}
                  max={20}
                  step={0.5}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControl>
                <Typography gutterBottom>Vegetation Density</Typography>
                <RadioGroup
                  value={density}
                  onChange={(e) => setDensity(e.target.value as Density)}
                >
                  <FormControlLabel
                    value="Light"
                    control={<Radio />}
                    label="Light (0.7x) - Sparse vegetation, basic cleanup"
                  />
                  <FormControlLabel
                    value="Average"
                    control={<Radio />}
                    label="Average (1.0x) - Typical residential density"
                  />
                  <FormControlLabel
                    value="Heavy"
                    control={<Radio />}
                    label="Heavy (1.3x) - Dense vegetation, extensive work"
                  />
                </RadioGroup>
              </FormControl>

              <Box>
                <Typography gutterBottom>
                  AFISS Complexity Multiplier: {afissMultiplier.toFixed(2)}x
                </Typography>
                <Slider
                  value={afissMultiplier}
                  onChange={(_, val) => setAfissMultiplier(val as number)}
                  min={1.0}
                  max={2.0}
                  step={0.05}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Adjust based on utilities, structures, access restrictions, etc.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Results */}
        <Paper sx={{ p: 3, bgcolor: "background.default" }}>
          <Typography variant="h5" gutterBottom>
            Calculation Results
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Base Acres
              </Typography>
              <Typography variant="h6">{scoreResult.baseScore}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Density Multiplier
              </Typography>
              <Typography variant="h6">
                {density} (
                {density === "Light" ? "0.7x" : density === "Average" ? "1.0x" : "1.3x"})
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Adjusted ClearingScore (with AFISS)
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
