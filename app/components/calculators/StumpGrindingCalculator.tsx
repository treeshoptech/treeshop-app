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
  Alert,
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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Service-specific Terms & Conditions
const STUMP_GRINDING_TERMS = [
  "Stumps will be ground to specified depth below grade",
  "Wood chips and grindings will remain on property unless removal is requested",
  "Minor turf damage may occur from equipment access",
  "Underground utilities must be marked by property owner before work begins",
];

interface StumpEntry extends StumpInput {
  id: string;
}

interface StumpGrindingCalculatorProps {
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

export default function StumpGrindingCalculator({
  loadout: defaultLoadout,
  loadouts,
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

  // TWO-TIER SYSTEM: Fetch service template for Stump Grinding
  const serviceTemplate = useQuery(api.serviceTemplates.getByServiceType, {
    serviceType: "Stump Grinding"
  });

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

  // TWO-TIER SYSTEM: Calculate work score
  const scoreResult = calculateStumpScore(stumps);
  const { baseScore, complexityMultiplier, adjustedScore } = scoreResult;

  // TWO-TIER SYSTEM: Calculate estimated hours using SERVICE TEMPLATE
  const estimatedHours = serviceTemplate && serviceTemplate.standardPPH > 0
    ? Math.max(adjustedScore / serviceTemplate.standardPPH, MINIMUM_HOURS["Stump Grinding"] || 2)
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
      serviceType: "Stump Grinding",
      formulaUsed: "StumpScore",
      description: `${stumps.length} stump${stumps.length > 1 ? "s" : ""} - ${adjustedScore.toFixed(0)} StumpScore points`,

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
      termsAndConditions: STUMP_GRINDING_TERMS,
    };

    onLineItemCreate?.(lineItemData);
  };

  return (
    <Stack spacing={2}>
      {/* TWO-TIER SYSTEM: Service Template Status */}
      {!serviceTemplate && (
        <Alert severity="error">
          <Typography variant="subtitle2" gutterBottom>
            No service template found for Stump Grinding
          </Typography>
          <Typography variant="body2">
            Please go to <strong>Service Templates</strong> page and <strong>"Create Template"</strong> based on your loadout costs to establish company-wide pricing standards.
          </Typography>
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

      {/* TWO-TIER SYSTEM: Results Summary */}
      {!serviceTemplate ? (
        <Paper sx={{ p: 2, bgcolor: 'error.dark' }}>
          <Typography variant="body2" color="error.light">
            ⚠️ No service template configured. Please set up Stump Grinding template first.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work Score Calculation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Base Score: <strong>{baseScore.toFixed(0)} SS</strong> ({stumps.length} stump{stumps.length > 1 ? 's' : ''})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complexity Multiplier: <strong>{complexityMultiplier.toFixed(2)}x</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjusted Score: <strong>{adjustedScore.toFixed(0)} SS</strong>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Pricing (Company Standard)
            </Typography>
            {estimatedHours && (
              <Typography variant="body2" color="text.secondary">
                Estimated Hours: <strong>{formatHours(estimatedHours)}</strong>
                <Typography variant="caption" display="block">
                  ({adjustedScore.toFixed(0)} ÷ {serviceTemplate.standardPPH} PPH, min {MINIMUM_HOURS["Stump Grinding"] || 2}hrs)
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
