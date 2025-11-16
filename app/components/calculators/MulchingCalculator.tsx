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
  loadouts?: Array<{
    _id: string;
    name: string;
    productionRatePPH: number;
    costPerHour: number;
    targetMargin: number;
  }>;
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
  loadout: defaultLoadout,
  loadouts,
  driveTimeMinutes = 30,
  onLineItemCreate,
}: MulchingCalculatorProps) {
  const [acres, setAcres] = useState(1.00);
  const [acresInput, setAcresInput] = useState("1.00");
  const [dbhPackage, setDbhPackage] = useState(8);
  const [selectedAfissFactors, setSelectedAfissFactors] = useState<string[]>([]);
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<string>(defaultLoadout?._id || loadouts?.[0]?._id || "");

  // Get active loadout based on selection
  const loadout = loadouts?.find(l => l._id === selectedLoadoutId) || defaultLoadout;

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

  // Calculate work hours ONLY (no transport/buffer per line item)
  const timeEstimate = loadout
    ? (() => {
        // Step 1: Apply production impact to production rate
        const adjustedProductionRate = loadout.productionRatePPH * productionMultiplier;

        // Step 2: Calculate work hours with adjusted rate
        const workHours = baseScore / adjustedProductionRate;

        // Step 3: Apply AFISS time overhead multiplier
        const timeOverheadHours = workHours * (1 - timeMultiplier); // Negative becomes positive

        const totalWorkHours = workHours + timeOverheadHours;

        return {
          workHours,
          timeOverheadHours,
          totalWorkHours,
          adjustedProductionRate,
        };
      })()
    : null;

  // Calculate line item cost ONLY (no transport/buffer)
  const pricing = loadout && timeEstimate
    ? calculatePricing({
        totalEstimatedHours: timeEstimate.totalWorkHours,
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

    const adjustedScore = baseScore * productionMultiplier * timeMultiplier;

    const lineItemData = {
      serviceType: "Forestry Mulching",
      description: `${acres.toFixed(2)} acres, ${dbhPackage}" DBH package${selectedFactorDetails.length > 0 ? ` (${selectedFactorDetails.length} AFISS factors)` : ""}`,
      formulaUsed: `TreeShop Score = ${acres.toFixed(2)} acres × ${dbhPackage}" DBH${productionMultiplier !== 1 || timeMultiplier !== 1 ? ` × ${(productionMultiplier * timeMultiplier).toFixed(2)} AFISS` : ""}`,
      workVolumeInputs: { acres, dbhPackage },
      baseScore: baseScore,
      complexityMultiplier: productionMultiplier * timeMultiplier,
      adjustedScore: adjustedScore,
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
      billingRatePerHour: pricing.totalPrice / timeEstimate.totalWorkHours,
      targetMargin: loadout.targetMargin,
      workHours: timeEstimate.workHours,
      timeOverheadHours: timeEstimate.timeOverheadHours,
      totalWorkHours: timeEstimate.totalWorkHours,
      pricingMethod: pricing.pricingMethod,
      lineItemCost: pricing.totalCost,
      lineItemPrice: pricing.totalPrice,
      profit: pricing.profit,
      marginPercent: pricing.marginPercent,
    };

    onLineItemCreate?.(lineItemData);
  };

  return (
    <Stack spacing={3}>
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
                  {l.name} - {l.productionRatePPH} PpH @ {formatCurrency(l.costPerHour)}/hr
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Project Acreage */}
      <Box sx={{ maxWidth: 300 }}>
        <Typography variant="subtitle2" gutterBottom>
          Project Acreage
        </Typography>
        <TextField
          type="text"
          value={acresInput}
          onChange={(e) => {
            const input = e.target.value;
            setAcresInput(input);

            // Parse and validate
            const val = parseFloat(input);
            if (!isNaN(val) && val >= 0.01 && val <= 1000) {
              setAcres(val);
            }
          }}
          onFocus={(e) => {
            e.target.select();
          }}
          onBlur={() => {
            // Format to 2 decimals on blur
            const formatted = acres.toFixed(2);
            setAcresInput(formatted);
          }}
          InputProps={{
            inputProps: {
              inputMode: 'decimal',
              style: { fontSize: '2rem', fontWeight: 700, textAlign: 'center', padding: '16px' }
            },
            endAdornment: <Typography variant="h6" color="text.secondary" sx={{ pr: 1 }}>acres</Typography>,
          }}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
              }
            },
            '& input': {
              cursor: 'pointer',
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Examples: 1.00, 5.50, 10.25, 75.25
        </Typography>
      </Box>

      {/* DBH Package Selection */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
          DBH Package
        </Typography>
        <Grid container spacing={1.5}>
          {DBH_PACKAGES.map((pkg) => (
            <Grid item xs={12} key={pkg.value}>
              <Paper
                elevation={dbhPackage === pkg.value ? 8 : 1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: dbhPackage === pkg.value ? 'primary.main' : 'divider',
                  bgcolor: dbhPackage === pkg.value ? 'primary.dark' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => setDbhPackage(pkg.value)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    minWidth: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: dbhPackage === pkg.value ? 'primary.main' : 'background.default',
                    borderRadius: 1,
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {pkg.value}"
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {pkg.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <AfissSelector
        categories={AFISS_CATEGORIES}
        selectedFactors={selectedAfissFactors}
        onFactorsChange={setSelectedAfissFactors}
      />

      {/* Results Summary */}
      {!loadout ? (
        <Paper sx={{ p: 2, bgcolor: 'error.dark' }}>
          <Typography variant="body2" color="error.light">
            ⚠️ Please select a loadout to see pricing and time estimates.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Mulching Score: <strong>{baseScore.toFixed(1)} points</strong>
            </Typography>
            {timeEstimate && (
              <Typography variant="body2" color="text.secondary">
                Work Hours: <strong>{formatHours(timeEstimate.totalWorkHours)}</strong>
              </Typography>
            )}
            {pricing && (
              <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                Line Item: <strong>{formatCurrency(pricing.totalPrice)}</strong>
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Transport & buffer calculated at proposal level
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleCreateLineItem}
            fullWidth
            size="large"
          >
            Add to Proposal
          </Button>
        </>
      )}
    </Stack>
  );
}
