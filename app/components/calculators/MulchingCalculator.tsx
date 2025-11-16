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

// Service-specific Terms & Conditions
const MULCHING_TERMS = [
  "All vegetation up to specified DBH will be mulched in place",
  "Stumps will be cut flush with ground level but not removed",
  "Mulched material will remain on property as ground cover",
  "Property boundaries must be clearly marked before work begins",
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
  const [acres, setAcres] = useState(1.0);
  const [dbhPackage, setDbhPackage] = useState(8);
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
      termsAndConditions: MULCHING_TERMS,
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
    <Stack spacing={3}>
      {/* Project Acreage */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
          Project Acreage
        </Typography>
        <TextField
          fullWidth
          type="number"
          value={acres.toFixed(1)}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0.1 && val <= 50) {
              setAcres(val);
            }
          }}
          onFocus={(e) => e.target.select()}
          InputProps={{
            inputProps: {
              min: 0.1,
              max: 50,
              step: 0.1,
              style: { fontSize: '1.5rem', fontWeight: 600, textAlign: 'center' }
            },
            endAdornment: <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>acres</Typography>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default',
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Tap to type • Use whole or decimal numbers (e.g., 1.0, 5.5, 10.0)
        </Typography>
      </Box>

      {/* DBH Package Selection */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
          DBH Package (Maximum Tree Diameter)
        </Typography>
        <Stack spacing={1}>
          {DBH_PACKAGES.map((pkg) => (
            <Paper
              key={pkg.value}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: 2,
                borderColor: dbhPackage === pkg.value ? 'primary.main' : 'transparent',
                bgcolor: dbhPackage === pkg.value ? 'primary.dark' : 'background.default',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: dbhPackage === pkg.value ? 'primary.dark' : 'action.hover',
                },
              }}
              onClick={() => setDbhPackage(pkg.value)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, minWidth: 50 }}>
                  {pkg.value}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pkg.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>

      <AfissSelector
        categories={AFISS_CATEGORIES}
        selectedFactors={selectedAfissFactors}
        onFactorsChange={setSelectedAfissFactors}
      />

      {/* Results Summary */}
      <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Work Volume: <strong>{baseScore.toFixed(1)} inch-acres</strong>
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
