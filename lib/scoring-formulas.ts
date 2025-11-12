/**
 * TreeShop Scoring Formulas Library
 *
 * Complete implementation of all service scoring systems:
 * - Stump Grinding (StumpScore)
 * - Forestry Mulching (TreeShop Score / Inch-Acres)
 * - Land Clearing (ClearingScore)
 * - Tree Removal (TreeScore)
 * - Tree Trimming (TrimScore)
 *
 * All formulas return standardized score objects with time estimates.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ScoreResult {
  formulaUsed: string;
  baseScore: number;
  complexityMultiplier: number;
  adjustedScore: number;
  workVolumeInputs: any;
}

export interface TimeEstimate {
  productionHours: number;
  transportHours: number;
  bufferHours: number;
  totalEstimatedHours: number;
}

export interface PricingCalculation {
  pricingMethod: string;
  totalCost: number;
  totalPrice: number;
  profit: number;
  marginPercent: number;
}

export interface LineItemCalculation {
  score: ScoreResult;
  timeEstimate: TimeEstimate;
  pricing: PricingCalculation;
}

// ============================================================================
// STUMP GRINDING
// ============================================================================

export interface StumpInput {
  diameter: number; // inches
  heightAbove: number; // feet above grade
  depthBelow: number; // feet below grade (grind depth)
  // Modifiers
  hardwood?: boolean; // Oak, hickory, etc. (+15%)
  rootFlare?: boolean; // Large root flare/buttress (+20%)
  rotten?: boolean; // Deteriorated stump (-15%)
  rocks?: boolean; // Rocks in root zone (+10%)
  tightSpace?: boolean; // Tight landscaping or near foundation (+15%)
}

export function calculateStumpScore(stumps: StumpInput[]): ScoreResult {
  let totalScore = 0;
  const stumpDetails: any[] = [];

  for (const stump of stumps) {
    // Base formula: Diameter² × (Height Above + Depth Below)
    let stumpScore =
      Math.pow(stump.diameter, 2) * (stump.heightAbove + stump.depthBelow);

    // Apply modifiers
    let multiplier = 1.0;
    const modifiers: string[] = [];

    if (stump.hardwood) {
      multiplier *= 1.15;
      modifiers.push("Hardwood (+15%)");
    }
    if (stump.rootFlare) {
      multiplier *= 1.2;
      modifiers.push("Root Flare (+20%)");
    }
    if (stump.rotten) {
      multiplier *= 0.85;
      modifiers.push("Rotten (-15%)");
    }
    if (stump.rocks) {
      multiplier *= 1.1;
      modifiers.push("Rocks (+10%)");
    }
    if (stump.tightSpace) {
      multiplier *= 1.15;
      modifiers.push("Tight Space (+15%)");
    }

    const adjustedStumpScore = stumpScore * multiplier;

    stumpDetails.push({
      diameter: stump.diameter,
      heightAbove: stump.heightAbove,
      depthBelow: stump.depthBelow,
      baseScore: Math.round(stumpScore),
      multiplier: Math.round(multiplier * 100) / 100,
      adjustedScore: Math.round(adjustedStumpScore),
      modifiers,
    });

    totalScore += adjustedStumpScore;
  }

  return {
    formulaUsed: "StumpScore",
    baseScore: Math.round(
      stumpDetails.reduce((sum, s) => sum + s.baseScore, 0)
    ),
    complexityMultiplier:
      Math.round(
        (totalScore /
          stumpDetails.reduce((sum, s) => sum + s.baseScore, 0)) *
          100
      ) / 100,
    adjustedScore: Math.round(totalScore),
    workVolumeInputs: {
      stumps: stumpDetails,
      stumpCount: stumps.length,
    },
  };
}

// ============================================================================
// FORESTRY MULCHING
// ============================================================================

export interface MulchingInput {
  acres: number;
  dbhPackage: number; // 4, 6, 8, 10, or 15 inches
  afissMultiplier?: number; // Default 1.0
}

export function calculateMulchingScore(input: MulchingInput): ScoreResult {
  // Formula: Acres × DBH Package = Inch-Acres
  const baseScore = input.acres * input.dbhPackage;
  const afissMultiplier = input.afissMultiplier || 1.0;
  const adjustedScore = baseScore * afissMultiplier;

  return {
    formulaUsed: "TreeShopScore",
    baseScore: Math.round(baseScore * 100) / 100,
    complexityMultiplier: afissMultiplier,
    adjustedScore: Math.round(adjustedScore * 100) / 100,
    workVolumeInputs: {
      acres: input.acres,
      dbhPackage: input.dbhPackage,
      description: `${input.acres} acres, ${input.dbhPackage}" DBH package`,
    },
  };
}

// ============================================================================
// LAND CLEARING
// ============================================================================

export interface LandClearingInput {
  acres: number;
  density: "Light" | "Average" | "Heavy"; // 0.7, 1.0, 1.3
  afissMultiplier?: number; // Default 1.0
}

const DENSITY_MULTIPLIERS = {
  Light: 0.7,
  Average: 1.0,
  Heavy: 1.3,
};

export function calculateLandClearingScore(
  input: LandClearingInput
): ScoreResult {
  // Base score = Acres
  const baseScore = input.acres;

  // Apply density multiplier
  const densityMultiplier = DENSITY_MULTIPLIERS[input.density];

  // Apply AFISS multiplier
  const afissMultiplier = input.afissMultiplier || 1.0;

  // Combined multiplier
  const combinedMultiplier = densityMultiplier * afissMultiplier;

  // Adjusted score
  const adjustedScore = baseScore * combinedMultiplier;

  return {
    formulaUsed: "ClearingScore",
    baseScore: Math.round(baseScore * 100) / 100,
    complexityMultiplier: Math.round(combinedMultiplier * 100) / 100,
    adjustedScore: Math.round(adjustedScore * 100) / 100,
    workVolumeInputs: {
      acres: input.acres,
      density: input.density,
      densityMultiplier,
      afissMultiplier,
    },
  };
}

// ============================================================================
// TREE REMOVAL
// ============================================================================

export interface TreeInput {
  height: number; // feet
  dbh: number; // inches (diameter at breast height)
  canopyRadius: number; // feet
  afissMultiplier?: number; // Per-tree AFISS factors (power lines, structures, etc.)
}

export function calculateTreeScore(trees: TreeInput[]): ScoreResult {
  let totalBaseScore = 0;
  let totalAdjustedScore = 0;
  const treeDetails: any[] = [];

  for (const tree of trees) {
    // Formula: Height × (DBH ÷ 12)² × Canopy Radius²
    const dbhFeet = tree.dbh / 12;
    const baseScore =
      tree.height * Math.pow(dbhFeet, 2) * Math.pow(tree.canopyRadius, 2);

    const afissMultiplier = tree.afissMultiplier || 1.0;
    const adjustedScore = baseScore * afissMultiplier;

    treeDetails.push({
      height: tree.height,
      dbh: tree.dbh,
      canopyRadius: tree.canopyRadius,
      baseScore: Math.round(baseScore),
      afissMultiplier,
      adjustedScore: Math.round(adjustedScore),
    });

    totalBaseScore += baseScore;
    totalAdjustedScore += adjustedScore;
  }

  return {
    formulaUsed: "TreeScore",
    baseScore: Math.round(totalBaseScore),
    complexityMultiplier:
      Math.round((totalAdjustedScore / totalBaseScore) * 100) / 100,
    adjustedScore: Math.round(totalAdjustedScore),
    workVolumeInputs: {
      trees: treeDetails,
      treeCount: trees.length,
    },
  };
}

// ============================================================================
// TREE TRIMMING
// ============================================================================

export interface TrimmingInput {
  trees: TreeInput[]; // Uses same tree structure as removal
  trimPercentage: number; // 0.10 to 0.50 (10% to 50% of tree removed)
}

export function calculateTrimmingScore(input: TrimmingInput): ScoreResult {
  // First calculate full tree removal score
  const fullTreeScore = calculateTreeScore(input.trees);

  // Apply trim percentage factor
  const trimFactor = input.trimPercentage;
  const adjustedScore = fullTreeScore.adjustedScore * trimFactor;

  return {
    formulaUsed: "TrimScore",
    baseScore: fullTreeScore.baseScore,
    complexityMultiplier:
      Math.round(fullTreeScore.complexityMultiplier * trimFactor * 100) / 100,
    adjustedScore: Math.round(adjustedScore),
    workVolumeInputs: {
      ...fullTreeScore.workVolumeInputs,
      trimPercentage: input.trimPercentage,
      description: `${Math.round(input.trimPercentage * 100)}% trim of ${input.trees.length} tree(s)`,
    },
  };
}

// ============================================================================
// TIME ESTIMATION
// ============================================================================

export interface TimeEstimateInput {
  adjustedScore: number;
  productionRatePPH: number; // Points per hour
  driveTimeMinutes: number; // One-way drive time
  transportRate: number; // 0.3 for stump grinding, 0.5 for mulching/removal
  bufferPercent?: number; // Default 0.10 (10%)
  minimumHours?: number; // Enforce minimum (e.g., 2 hours for stump grinding)
}

export function calculateTimeEstimate(
  input: TimeEstimateInput
): TimeEstimate {
  // Production hours = Score ÷ PPH
  let productionHours = input.adjustedScore / input.productionRatePPH;

  // Transport hours = (One-way drive × 2) × transport rate
  const transportHours =
    (input.driveTimeMinutes / 60) * 2 * input.transportRate;

  // Buffer hours = (Production + Transport) × buffer percent
  const bufferPercent = input.bufferPercent || 0.1;
  const bufferHours = (productionHours + transportHours) * bufferPercent;

  // Total estimated hours
  let totalEstimatedHours = productionHours + transportHours + bufferHours;

  // Enforce minimum if specified
  if (input.minimumHours && totalEstimatedHours < input.minimumHours) {
    totalEstimatedHours = input.minimumHours;
    // Adjust production hours to meet minimum
    productionHours =
      input.minimumHours - transportHours - bufferHours;
  }

  return {
    productionHours: Math.round(productionHours * 100) / 100,
    transportHours: Math.round(transportHours * 100) / 100,
    bufferHours: Math.round(bufferHours * 100) / 100,
    totalEstimatedHours: Math.round(totalEstimatedHours * 100) / 100,
  };
}

// ============================================================================
// PRICING CALCULATION
// ============================================================================

export interface PricingInput {
  totalEstimatedHours: number;
  costPerHour: number; // Loadout cost per hour
  targetMargin: number; // 0.30 to 0.70 (30% to 70%)
  pricingMethod?: string; // "Hourly", "Fixed", "Time & Materials"
}

export function calculatePricing(input: PricingInput): PricingCalculation {
  const totalCost = input.totalEstimatedHours * input.costPerHour;

  // Billing rate formula: Cost ÷ (1 - Margin%)
  // This ensures margin is percentage of SELLING PRICE, not cost
  const billingRatePerHour = input.costPerHour / (1 - input.targetMargin);
  const totalPrice = input.totalEstimatedHours * billingRatePerHour;

  const profit = totalPrice - totalCost;
  const marginPercent = (profit / totalPrice) * 100;

  return {
    pricingMethod: input.pricingMethod || "Hourly",
    totalCost: Math.round(totalCost * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    marginPercent: Math.round(marginPercent * 100) / 100,
  };
}

// ============================================================================
// COMPLETE LINE ITEM CALCULATION
// ============================================================================

export interface CompleteLineItemInput {
  // Score inputs (use appropriate function based on service type)
  score: ScoreResult;

  // Loadout details
  loadoutId: string;
  loadoutName: string;
  productionRatePPH: number;
  costPerHour: number;
  targetMargin: number;

  // Job details
  driveTimeMinutes: number;
  transportRate: number; // Service-specific: 0.3 stump, 0.5 mulching/removal
  minimumHours?: number; // Optional minimum

  // Pricing
  pricingMethod?: string;
}

export function calculateCompleteLineItem(
  input: CompleteLineItemInput
): LineItemCalculation {
  // Calculate time estimate
  const timeEstimate = calculateTimeEstimate({
    adjustedScore: input.score.adjustedScore,
    productionRatePPH: input.productionRatePPH,
    driveTimeMinutes: input.driveTimeMinutes,
    transportRate: input.transportRate,
    minimumHours: input.minimumHours,
  });

  // Calculate pricing
  const pricing = calculatePricing({
    totalEstimatedHours: timeEstimate.totalEstimatedHours,
    costPerHour: input.costPerHour,
    targetMargin: input.targetMargin,
    pricingMethod: input.pricingMethod,
  });

  return {
    score: input.score,
    timeEstimate,
    pricing,
  };
}

// ============================================================================
// TRANSPORT RATES BY SERVICE TYPE
// ============================================================================

export const TRANSPORT_RATES = {
  "Stump Grinding": 0.3, // Smaller trailer, 30% rate
  "Forestry Mulching": 0.5, // Large equipment, 50% rate
  "Land Clearing": 0.5, // Large equipment, 50% rate
  "Tree Removal": 0.5, // Large equipment, 50% rate
  "Tree Trimming": 0.5, // Large equipment, 50% rate
} as const;

export const MINIMUM_HOURS = {
  "Stump Grinding": 2.0, // 2-hour minimum
  "Forestry Mulching": undefined,
  "Land Clearing": undefined,
  "Tree Removal": undefined,
  "Tree Trimming": undefined,
} as const;

// ============================================================================
// MARGIN CONVERSION UTILITIES
// ============================================================================

/**
 * Convert target margin percentage to multiplier
 * Example: 50% margin → 2.0x multiplier
 */
export function marginToMultiplier(marginPercent: number): number {
  return 1 / (1 - marginPercent / 100);
}

/**
 * Calculate billing rate from cost and margin
 */
export function costToPrice(cost: number, marginPercent: number): number {
  return cost / (1 - marginPercent / 100);
}

/**
 * Get margin multipliers for common targets
 */
export const MARGIN_MULTIPLIERS = {
  30: 1.43, // 30% margin
  35: 1.54, // 35% margin
  40: 1.67, // 40% margin
  50: 2.0, // 50% margin
  60: 2.5, // 60% margin
  70: 3.33, // 70% margin
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minutes`;
  }
  return `${hours.toFixed(1)} hours`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format margin percentage
 */
export function formatMargin(marginPercent: number): string {
  return `${marginPercent.toFixed(1)}%`;
}
