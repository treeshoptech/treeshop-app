"use client";

import { useState, useEffect } from "react";
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
  Alert,
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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MulchingCalculatorProps {
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

  // TWO-TIER SYSTEM: Fetch service template for Forestry Mulching
  const serviceTemplate = useQuery(api.serviceTemplates.getByServiceType, {
    serviceType: "Forestry Mulching"
  });

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

  // TWO-TIER SYSTEM: Calculate base score (property measurement - NOT affected by AFISS)
  const baseScore = acres * dbhPackage;

  // TWO-TIER SYSTEM: Apply AFISS complexity multiplier
  const adjustedScore = baseScore * productionMultiplier * timeMultiplier;

  // TWO-TIER SYSTEM: Calculate estimated hours using SERVICE TEMPLATE
  const estimatedHours = serviceTemplate && serviceTemplate.standardPPH > 0
    ? adjustedScore / serviceTemplate.standardPPH
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

    // Get selected factor details for documentation
    const selectedFactorDetails = AFISS_CATEGORIES.flatMap((cat) =>
      cat.factors.filter((f) => selectedAfissFactors.includes(f.id))
    );

    const complexityMultiplier = productionMultiplier * timeMultiplier;

    const lineItemData = {
      // TWO-TIER SYSTEM: Service identification
      serviceType: "Forestry Mulching",
      formulaUsed: "MulchingScore",
      description: `${acres.toFixed(2)} acres, ${dbhPackage}" DBH package${selectedFactorDetails.length > 0 ? ` (${selectedFactorDetails.length} AFISS factors)` : ""}`,

      // TWO-TIER SYSTEM: Work volume and scoring
      workVolumeInputs: { acres, dbhPackage },
      baseScore,
      complexityMultiplier,
      adjustedScore,

      // TWO-TIER SYSTEM: AFISS factors
      afissFactors: selectedFactorDetails.map((f) => ({
        id: f.id,
        label: f.label,
        impactType: f.impactType,
        impactPercent: f.impactPercent,
      })),

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
      termsAndConditions: MULCHING_TERMS,
    };

    onLineItemCreate?.(lineItemData);
  };

  return (
    <Stack spacing={3}>
      {/* TWO-TIER SYSTEM: Service Template Status */}
      {!serviceTemplate && (
        <Alert severity="warning">
          No service template found for Forestry Mulching. Please set up a service template first.
        </Alert>
      )}

      {serviceTemplate && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using company standard: {serviceTemplate.standardPPH} PPH @ {formatCurrency(serviceTemplate.standardBillingRate)}/hr
          <br />
          <Typography variant="caption">
            Price is based on company-wide averages and will be locked when proposal is created.
          </Typography>
        </Alert>
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

      {/* TWO-TIER SYSTEM: Results Summary */}
      {!serviceTemplate ? (
        <Paper sx={{ p: 2, bgcolor: 'error.dark' }}>
          <Typography variant="body2" color="error.light">
            ⚠️ No service template configured. Please set up Forestry Mulching template first.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work Score Calculation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Base Score: <strong>{baseScore.toFixed(1)} MS</strong> ({acres.toFixed(2)} acres × {dbhPackage}" DBH)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AFISS Multiplier: <strong>{(productionMultiplier * timeMultiplier).toFixed(2)}x</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjusted Score: <strong>{adjustedScore.toFixed(1)} MS</strong>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Pricing (Company Standard)
            </Typography>
            {estimatedHours && (
              <Typography variant="body2" color="text.secondary">
                Estimated Hours: <strong>{formatHours(estimatedHours)}</strong>
                <Typography variant="caption" display="block">
                  ({adjustedScore.toFixed(1)} ÷ {serviceTemplate.standardPPH} PPH)
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
            size="large"
            disabled={!clientPrice}
          >
            Add to Proposal
          </Button>
        </>
      )}
    </Stack>
  );
}
