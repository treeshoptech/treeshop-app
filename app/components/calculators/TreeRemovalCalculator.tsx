"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  calculateTreeScore,
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

interface TreeRemovalCalculatorProps {
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

export default function TreeRemovalCalculator({
  loadout,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: TreeRemovalCalculatorProps) {
  const [trees, setTrees] = useState<TreeEntry[]>([
    {
      id: crypto.randomUUID(),
      height: 40,
      dbh: 18,
      canopyRadius: 15,
      afissMultiplier: 1.0,
    },
  ]);

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
  const scoreResult = calculateTreeScore(trees);

  // Calculate time estimate if loadout provided
  const timeEstimate = loadout
    ? calculateTimeEstimate({
        adjustedScore: scoreResult.adjustedScore,
        productionRatePPH: loadout.productionRatePPH,
        driveTimeMinutes,
        transportRate: TRANSPORT_RATES["Tree Removal"],
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
      serviceType: "Tree Removal",
      description: `${trees.length} tree${trees.length > 1 ? "s" : ""} - ${scoreResult.adjustedScore} points`,
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
        Tree Removal Calculator
      </Typography>

      <Stack spacing={3}>
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

                <Box>
                  <Typography gutterBottom>Height: {tree.height} feet</Typography>
                  <Slider
                    value={tree.height}
                    onChange={(_, val) => updateTree(tree.id, { height: val as number })}
                    min={10}
                    max={120}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>DBH (Diameter at Breast Height): {tree.dbh} inches</Typography>
                  <Slider
                    value={tree.dbh}
                    onChange={(_, val) => updateTree(tree.id, { dbh: val as number })}
                    min={6}
                    max={60}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>Canopy Radius: {tree.canopyRadius} feet</Typography>
                  <Slider
                    value={tree.canopyRadius}
                    onChange={(_, val) => updateTree(tree.id, { canopyRadius: val as number })}
                    min={5}
                    max={40}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>
                    AFISS Complexity: {tree.afissMultiplier?.toFixed(2)}x
                  </Typography>
                  <Slider
                    value={tree.afissMultiplier || 1.0}
                    onChange={(_, val) => updateTree(tree.id, { afissMultiplier: val as number })}
                    min={1.0}
                    max={3.0}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Adjust for power lines, structures, climbing difficulty, etc.
                  </Typography>
                </Box>
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
                Base TreeScore
              </Typography>
              <Typography variant="h6">{scoreResult.baseScore}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Adjusted TreeScore (with AFISS)
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
