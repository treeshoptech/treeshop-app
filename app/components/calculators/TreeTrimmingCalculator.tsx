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
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  calculateTrimmingScore,
  calculateTimeEstimate,
  calculatePricing,
  TRANSPORT_RATES,
  formatCurrency,
  formatHours,
  type TreeInput,
} from "@/lib/scoring-formulas";

interface TreeEntry extends TreeInput {
  id: string;
}

interface TreeTrimmingCalculatorProps {
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

const TRIM_PERCENTAGES = [
  { value: 0.15, label: "Light Trim (10-15%)", display: "15%" },
  { value: 0.25, label: "Medium Trim (20-30%)", display: "25%" },
  { value: 0.45, label: "Heavy Trim (40-50%)", display: "45%" },
];

export default function TreeTrimmingCalculator({
  loadout,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: TreeTrimmingCalculatorProps) {
  const [trees, setTrees] = useState<TreeEntry[]>([
    {
      id: crypto.randomUUID(),
      height: 40,
      dbh: 18,
      canopyRadius: 15,
      afissMultiplier: 1.0,
    },
  ]);
  const [trimPercentage, setTrimPercentage] = useState(0.25);

  const addTree = () => {
    setTrees([
      ...trees,
      {
        id: crypto.randomUUID(),
        height: 30,
        dbh: 12,
        canopyRadius: 10,
        afissMultiplier: 1.0,
      },
    ]);
  };

  const removeTree = (id: string) => {
    if (trees.length > 1) {
      setTrees(trees.filter((t) => t.id !== id));
    }
  };

  const updateTree = (id: string, updates: Partial<TreeEntry>) => {
    setTrees(trees.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Calculate score
  const scoreResult = calculateTrimmingScore({
    trees,
    trimPercentage,
  });

  // Calculate time estimate if loadout provided
  const timeEstimate = loadout
    ? calculateTimeEstimate({
        adjustedScore: scoreResult.adjustedScore,
        productionRatePPH: loadout.productionRatePPH,
        driveTimeMinutes,
        transportRate: TRANSPORT_RATES["Tree Trimming"],
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
      serviceType: "Tree Trimming",
      description: `${trees.length} tree${trees.length > 1 ? "s" : ""} - ${Math.round(trimPercentage * 100)}% trim - ${scoreResult.adjustedScore} points`,
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
        Tree Trimming Calculator
      </Typography>

      <Stack spacing={3}>
        {/* Trim Intensity Selection */}
        <Card>
          <CardContent>
            <FormControl>
              <Typography variant="h6" gutterBottom>
                Trim Intensity
              </Typography>
              <RadioGroup
                value={trimPercentage}
                onChange={(e) => setTrimPercentage(parseFloat(e.target.value))}
              >
                {TRIM_PERCENTAGES.map((trim) => (
                  <FormControlLabel
                    key={trim.value}
                    value={trim.value}
                    control={<Radio />}
                    label={trim.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Trees */}
        {trees.map((tree, index) => (
          <Card key={tree.id}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="h6">Tree {index + 1}</Typography>
                  {trees.length > 1 && (
                    <IconButton onClick={() => removeTree(tree.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Height (feet)"
                      value={tree.height}
                      onChange={(e) => updateTree(tree.id, { height: parseFloat(e.target.value) || 10 })}
                      InputProps={{ inputProps: { min: 10, max: 120, step: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="DBH (inches)"
                      value={tree.dbh}
                      onChange={(e) => updateTree(tree.id, { dbh: parseFloat(e.target.value) || 6 })}
                      InputProps={{ inputProps: { min: 6, max: 60, step: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Canopy Radius (feet)"
                      value={tree.canopyRadius}
                      onChange={(e) => updateTree(tree.id, { canopyRadius: parseFloat(e.target.value) || 5 })}
                      InputProps={{ inputProps: { min: 5, max: 40, step: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="AFISS Complexity"
                      value={tree.afissMultiplier || 1.0}
                      onChange={(e) => updateTree(tree.id, { afissMultiplier: parseFloat(e.target.value) || 1.0 })}
                      InputProps={{ inputProps: { min: 1.0, max: 3.0, step: 0.1 } }}
                      helperText="Adjust for power lines, structures, climbing difficulty"
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addTree}
          fullWidth
        >
          Add Another Tree
        </Button>

        {/* Results */}
        <Paper sx={{ p: 3, bgcolor: "background.default" }}>
          <Typography variant="h5" gutterBottom>
            Calculation Results
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Trim Percentage
              </Typography>
              <Typography variant="h6">{Math.round(trimPercentage * 100)}%</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Base TreeScore (Full Removal)
              </Typography>
              <Typography variant="h6">{scoreResult.baseScore}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Adjusted TrimScore
              </Typography>
              <Typography variant="h4">{scoreResult.adjustedScore}</Typography>
              <Typography variant="caption" color="text.secondary">
                = Base Score × Trim% × AFISS
              </Typography>
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
