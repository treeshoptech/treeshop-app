"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { AfissSelector, AfissCategory } from "./AfissSelector";

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

// AFISS Factor Database for Forestry Mulching
const AFISS_CATEGORIES: AfissCategory[] = [
  {
    id: "access",
    name: "ACCESS",
    factors: [
      { id: "narrow-gate", label: "Narrow gate (<8 ft)", impactType: "time", impactPercent: -12 },
      { id: "no-equipment-access", label: "No equipment access (hand-carry)", impactType: "production", impactPercent: -50 },
      { id: "soft-ground", label: "Soft/muddy ground", impactType: "production", impactPercent: -15 },
      { id: "steep-slope", label: "Steep slope (>15°)", impactType: "production", impactPercent: -20 },
      { id: "long-drive", label: "Long drive (>2 hrs one-way)", impactType: "time", impactPercent: -10 },
    ],
  },
  {
    id: "facilities",
    name: "FACILITIES",
    factors: [
      { id: "power-lines-touching", label: "Power lines in work area", impactType: "time", impactPercent: -30 },
      { id: "power-lines-nearby", label: "Power lines nearby (<10 ft)", impactType: "time", impactPercent: -15 },
      { id: "building-nearby", label: "Building within 50 ft", impactType: "time", impactPercent: -20 },
      { id: "pool-nearby", label: "Pool or high-value target", impactType: "time", impactPercent: -30 },
      { id: "utilities-in-zone", label: "Utilities in work zone", impactType: "time", impactPercent: -15 },
    ],
  },
  {
    id: "site",
    name: "SITE CONDITIONS",
    factors: [
      { id: "wetlands", label: "Wetlands in work area", impactType: "production", impactPercent: -20 },
      { id: "rocky-ground", label: "Rocky ground", impactType: "production", impactPercent: -15 },
      { id: "protected-habitat", label: "Protected species habitat", impactType: "time", impactPercent: -30 },
      { id: "steep-terrain", label: "Steep terrain", impactType: "production", impactPercent: -20 },
      { id: "dense-undergrowth", label: "Dense undergrowth", impactType: "production", impactPercent: -15 },
    ],
  },
  {
    id: "safety",
    name: "SAFETY",
    factors: [
      { id: "high-voltage", label: "High voltage lines", impactType: "time", impactPercent: -50 },
      { id: "confined-space", label: "Confined space work", impactType: "time", impactPercent: -25 },
      { id: "emergency-hazard", label: "Emergency/hazard situation", impactType: "time", impactPercent: -30 },
      { id: "near-public-road", label: "Near public roads", impactType: "time", impactPercent: -10 },
    ],
  },
];

export default function MulchingCalculator({
  loadout,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: MulchingCalculatorProps) {
  const [acres, setAcres] = useState(3.5);
  const [dbhPackage, setDbhPackage] = useState(6);
  const [selectedAfissFactors, setSelectedAfissFactors] = useState<string[]>([]);

  // Calculate AFISS impacts - TWO SEPARATE TYPES
  const calculateAfissImpacts = () => {
    let productionMultiplier = 1.0; // Affects production rate (machine speed)
    let timeMultiplier = 1.0; // Affects total time (overhead/safety)

    AFISS_CATEGORIES.forEach((category) => {
      category.factors.forEach((factor) => {
        if (selectedAfissFactors.includes(factor.id)) {
          if (factor.impactType === "production") {
            // Production impacts compound (multiple terrain issues multiply)
            productionMultiplier *= 1 + factor.impactPercent / 100;
          } else if (factor.impactType === "time") {
            // Time impacts compound (multiple safety concerns multiply)
            timeMultiplier *= 1 + factor.impactPercent / 100;
          }
        }
      });
    });

    return { productionMultiplier, timeMultiplier };
  };

  const { productionMultiplier, timeMultiplier } = calculateAfissImpacts();

  // Base score (NOT affected by AFISS - property doesn't change)
  const baseScore = acres * dbhPackage;

  // Calculate time estimate with AFISS impacts
  const timeEstimate = loadout
    ? (() => {
        // Step 1: Apply production impact to production rate
        const adjustedProductionRate = loadout.productionRatePPH * productionMultiplier;

        // Step 2: Calculate base production hours with adjusted rate
        const productionHours = baseScore / adjustedProductionRate;

        // Step 3: Calculate transport
        const transportHours = (driveTimeMinutes / 60) * TRANSPORT_RATES["Forestry Mulching"];

        // Step 4: Apply time overhead multiplier to (production + transport)
        const baseWorkTime = productionHours + transportHours;
        const timeOverheadHours = baseWorkTime * (1 - timeMultiplier); // Negative becomes positive

        // Step 5: Add buffer (10% of adjusted time)
        const bufferHours = (baseWorkTime + timeOverheadHours) * 0.10;

        const totalEstimatedHours = baseWorkTime + timeOverheadHours + bufferHours;

        return {
          productionHours,
          transportHours,
          timeOverheadHours, // New: AFISS time overhead
          bufferHours,
          totalEstimatedHours,
          adjustedProductionRate, // Store for reference
        };
      })()
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

    // Get selected factor details for documentation
    const selectedFactorDetails = AFISS_CATEGORIES.flatMap((cat) =>
      cat.factors.filter((f) => selectedAfissFactors.includes(f.id))
    );

    const lineItemData = {
      serviceType: "Forestry Mulching",
      description: `${acres} acres, ${dbhPackage}" DBH package - ${baseScore.toFixed(1)} inch-acres${selectedFactorDetails.length > 0 ? ` (${selectedFactorDetails.length} AFISS factors)` : ""}`,
      formulaUsed: `Acres × DBH Package = ${acres} × ${dbhPackage}`,
      workVolumeInputs: { acres, dbhPackage },
      baseScore: baseScore,
      afissFactors: selectedFactorDetails.map((f) => ({
        id: f.id,
        label: f.label,
        impactType: f.impactType,
        impactPercent: f.impactPercent,
      })),
      loadoutId: loadout._id,
      loadoutName: loadout.name,
      productionRatePPH: loadout.productionRatePPH,
      adjustedProductionRate: timeEstimate.adjustedProductionRate,
      costPerHour: loadout.costPerHour,
      billingRatePerHour: pricing.totalPrice / timeEstimate.totalEstimatedHours,
      targetMargin: loadout.targetMargin,
      productionHours: timeEstimate.productionHours,
      transportHours: timeEstimate.transportHours,
      timeOverheadHours: timeEstimate.timeOverheadHours,
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
        {/* Project Inputs */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Acreage"
                    value={acres}
                    onChange={(e) => setAcres(parseFloat(e.target.value) || 0.5)}
                    InputProps={{ inputProps: { min: 0.5, max: 50, step: 0.5 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* AFISS Assessment */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ px: 2 }}>
            Site Assessment (AFISS)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ px: 2, mb: 2 }}>
            Identify all factors present on this property. These affect production rate and timeline.
          </Typography>
          <AfissSelector
            categories={AFISS_CATEGORIES}
            selectedFactors={selectedAfissFactors}
            onFactorsChange={setSelectedAfissFactors}
          />
        </Box>

        {/* Results */}
        <Paper sx={{ p: 3, bgcolor: "background.default" }}>
          <Typography variant="h5" gutterBottom>
            Calculation Results
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Work Volume
              </Typography>
              <Typography variant="h6">{baseScore.toFixed(1)} inch-acres</Typography>
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
                  {timeEstimate.timeOverheadHours > 0 && (
                    <Typography>Site Complexity: {formatHours(timeEstimate.timeOverheadHours)}</Typography>
                  )}
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
