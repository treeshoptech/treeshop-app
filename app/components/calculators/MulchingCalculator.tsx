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
  TextField,
  Typography,
} from "@mui/material";
import {
  calculateMulchingScore,
  calculateTimeEstimate,
  calculatePricing,
  TRANSPORT_RATES,
  formatCurrency,
  formatHours,
} from "@/lib/scoring-formulas";

interface MulchingCalculatorProps {
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

const DBH_PACKAGES = [
  { value: 4, label: '4" - Light brush, saplings, understory' },
  { value: 6, label: '6" - Small trees, dense brush areas' },
  { value: 8, label: '8" - Mature understory, medium trees' },
  { value: 10, label: '10" - Large trees, heavy vegetation' },
  { value: 15, label: '15" - Very large trees (specialized equipment)' },
];

export default function MulchingCalculator({
  loadout,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: MulchingCalculatorProps) {
  const [acres, setAcres] = useState(3.5);
  const [dbhPackage, setDbhPackage] = useState(6);
  const [afissMultiplier, setAfissMultiplier] = useState(1.0);

  // Calculate score
  const scoreResult = calculateMulchingScore({
    acres,
    dbhPackage,
    afissMultiplier,
  });

  // Calculate time estimate if loadout provided
  const timeEstimate = loadout
    ? calculateTimeEstimate({
        adjustedScore: scoreResult.adjustedScore,
        productionRatePPH: loadout.productionRatePPH,
        driveTimeMinutes,
        transportRate: TRANSPORT_RATES["Forestry Mulching"],
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
      serviceType: "Forestry Mulching",
      description: `${acres} acres, ${dbhPackage}" DBH package - ${scoreResult.adjustedScore} inch-acres`,
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
        Forestry Mulching Calculator
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
                  max={50}
                  step={0.5}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>DBH Package</InputLabel>
                <Select
                  value={dbhPackage}
                  label="DBH Package"
                  onChange={(e) => setDbhPackage(e.target.value as number)}
                >
                  {DBH_PACKAGES.map((pkg) => (
                    <MenuItem key={pkg.value} value={pkg.value}>
                      {pkg.label}
                    </MenuItem>
                  ))}
                </Select>
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
                  Adjust based on site conditions, access, obstacles, etc.
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
                Base Inch-Acres
              </Typography>
              <Typography variant="h6">{scoreResult.baseScore}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Adjusted Inch-Acres (with AFISS)
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
