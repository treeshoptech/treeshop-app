/**
 * TreeShop Scoring Formulas
 * Core calculation engine for all service types
 */

// ============================================
// TREE REMOVAL - TreeScore Formula
// ============================================

export interface TreeRemovalInputs {
  height: number; // feet
  crownRadius: number; // feet
  dbh: number; // inches (Diameter at Breast Height)
  quantity?: number; // Number of trees (default 1)
}

/**
 * Calculate TreeScore for tree removal
 * Formula: Height × Crown Radius × 2 × DBH ÷ 12 × Quantity
 */
export function calculateTreeScore(inputs: TreeRemovalInputs): number {
  const { height, crownRadius, dbh, quantity = 1 } = inputs;
  const baseScore = (height * crownRadius * 2 * dbh) / 12;
  return baseScore * quantity;
}

// ============================================
// TREE TRIMMING - TrimScore Formula
// ============================================

export interface TreeTrimmingInputs extends TreeRemovalInputs {
  trimPercentage: number; // 10-50 (percentage of canopy being trimmed)
}

/**
 * Calculate TrimScore for tree trimming/pruning
 * Formula: TreeScore × Trim Factor
 * Trim Factors:
 * - Light (10-15%): 0.3
 * - Medium (20-30%): 0.5
 * - Heavy (40-50%): 0.8
 */
export function calculateTrimScore(inputs: TreeTrimmingInputs): number {
  const baseTreeScore = calculateTreeScore(inputs);
  const trimFactor = getTrimFactor(inputs.trimPercentage);
  return baseTreeScore * trimFactor;
}

function getTrimFactor(percentage: number): number {
  if (percentage <= 15) return 0.3; // Light trim
  if (percentage <= 30) return 0.5; // Medium trim
  return 0.8; // Heavy trim
}

// ============================================
// STUMP GRINDING - StumpScore Formula
// ============================================

export interface StumpGrindingInputs {
  diameter: number; // inches
  heightAboveGrade: number; // feet
  grindDepthBelow: number; // feet
  quantity?: number; // Number of stumps (default 1)
  // Modifiers
  isHardwood?: boolean; // +15%
  hasLargeRootFlare?: boolean; // +20%
  isRotten?: boolean; // -15%
  hasRockyGround?: boolean; // +10%
  inTightSpace?: boolean; // +15%
}

/**
 * Calculate StumpScore for stump grinding
 * Formula: Diameter² × (Height Above + Grind Depth) × Modifiers × Quantity
 */
export function calculateStumpScore(inputs: StumpGrindingInputs): number {
  const {
    diameter,
    heightAboveGrade,
    grindDepthBelow,
    quantity = 1,
    isHardwood = false,
    hasLargeRootFlare = false,
    isRotten = false,
    hasRockyGround = false,
    inTightSpace = false,
  } = inputs;

  // Base calculation
  const baseScore = diameter * diameter * (heightAboveGrade + grindDepthBelow);

  // Apply modifiers
  let modifier = 1.0;
  if (isHardwood) modifier *= 1.15; // +15%
  if (hasLargeRootFlare) modifier *= 1.2; // +20%
  if (isRotten) modifier *= 0.85; // -15%
  if (hasRockyGround) modifier *= 1.1; // +10%
  if (inTightSpace) modifier *= 1.15; // +15%

  return baseScore * modifier * quantity;
}

// ============================================
// FORESTRY MULCHING - MulchingScore Formula
// ============================================

export interface ForestryMulchingInputs {
  acreage: number;
  dbhPackage: number; // 4, 6, 8, 10, or 15 inches (max diameter being cleared)
}

/**
 * Calculate MulchingScore for forestry mulching
 * Formula: DBH Package × Acreage
 * (AFISS multiplier applied separately)
 */
export function calculateMulchingScore(inputs: ForestryMulchingInputs): number {
  const { acreage, dbhPackage } = inputs;
  return dbhPackage * acreage;
}

// ============================================
// LAND CLEARING - ClearingScore Formula
// ============================================

export interface LandClearingInputs {
  projectType: "Standard Lot" | "Large Lot" | "Multi-Lot" | "Custom";
  clearingIntensity: "Light" | "Standard" | "Heavy";
  customAcreage?: number; // For custom projects
}

/**
 * Calculate estimated days for land clearing
 * Returns day estimate which will be multiplied by (8 hours × loadout rate)
 */
export function calculateLandClearingDays(inputs: LandClearingInputs): number {
  const { projectType, clearingIntensity } = inputs;

  // Base days by project type
  let baseDays = 0;
  switch (projectType) {
    case "Standard Lot":
      baseDays = 1;
      break;
    case "Large Lot":
      baseDays = 2;
      break;
    case "Multi-Lot":
      baseDays = 3;
      break;
    case "Custom":
      // For custom, estimate based on acreage
      // Rough estimate: 1 day per acre for standard clearing
      baseDays = inputs.customAcreage || 1;
      break;
  }

  // Intensity multiplier
  let intensityMultiplier = 1.0;
  switch (clearingIntensity) {
    case "Light":
      intensityMultiplier = 0.7;
      break;
    case "Standard":
      intensityMultiplier = 1.0;
      break;
    case "Heavy":
      intensityMultiplier = 1.3;
      break;
  }

  return baseDays * intensityMultiplier;
}

// ============================================
// TIME CALCULATIONS (Common to all services)
// ============================================

export interface TimeCalculationInputs {
  workScore: number; // TreeScore, StumpScore, MulchingScore, etc.
  productionRatePPH: number; // Points Per Hour (from loadout)
  driveTimeMinutes: number; // One-way drive time
  transportRateMultiplier?: number; // Default 0.50 for mulchers, 0.30 for stumpers
  includeBuffer?: boolean; // Default true (10% buffer)
}

export interface TimeCalculationResult {
  productionHours: number;
  transportHours: number;
  bufferHours: number;
  totalHours: number;
}

/**
 * Calculate total time breakdown for a job
 */
export function calculateJobTime(inputs: TimeCalculationInputs): TimeCalculationResult {
  const {
    workScore,
    productionRatePPH,
    driveTimeMinutes,
    transportRateMultiplier = 0.50,
    includeBuffer = true,
  } = inputs;

  // Production time
  const productionHours = workScore / productionRatePPH;

  // Transport time (round trip × transport rate)
  const roundTripHours = (driveTimeMinutes * 2) / 60;
  const transportHours = roundTripHours * transportRateMultiplier;

  // Buffer (10% of production + transport)
  const bufferHours = includeBuffer ? (productionHours + transportHours) * 0.10 : 0;

  // Total
  const totalHours = productionHours + transportHours + bufferHours;

  return {
    productionHours: Math.round(productionHours * 100) / 100,
    transportHours: Math.round(transportHours * 100) / 100,
    bufferHours: Math.round(bufferHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
  };
}

// ============================================
// PRICING CALCULATIONS
// ============================================

export interface PricingInputs {
  totalHours: number;
  loadoutCostPerHour: number;
  targetMarginPercent: number; // 30, 40, 50, etc.
}

export interface PricingResult {
  totalCost: number;
  billingRate: number;
  totalPrice: number;
  profit: number;
  actualMarginPercent: number;
}

/**
 * Calculate pricing with proper margin formula
 * Formula: Price = Cost ÷ (1 - Margin%)
 * NOT: Cost × (1 + Markup%)
 */
export function calculatePricing(inputs: PricingInputs): PricingResult {
  const { totalHours, loadoutCostPerHour, targetMarginPercent } = inputs;

  // Total cost
  const totalCost = totalHours * loadoutCostPerHour;

  // Billing rate per hour (ensures target margin)
  const marginDecimal = targetMarginPercent / 100;
  const billingRate = loadoutCostPerHour / (1 - marginDecimal);

  // Total price
  const totalPrice = totalHours * billingRate;

  // Profit and actual margin
  const profit = totalPrice - totalCost;
  const actualMarginPercent = (profit / totalPrice) * 100;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    billingRate: Math.round(billingRate * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    actualMarginPercent: Math.round(actualMarginPercent * 100) / 100,
  };
}

// ============================================
// COMPLETE PROJECT CALCULATION
// ============================================

export interface ProjectCalculationInputs {
  // Service details
  serviceType: string;
  formulaInputs: any; // Service-specific inputs (TreeRemovalInputs, StumpGrindingInputs, etc.)

  // AFISS complexity
  afissMultiplier: number; // From selected AFISS factors

  // Loadout details
  productionRatePPH: number;
  loadoutCostPerHour: number;

  // Site details
  driveTimeMinutes: number;
  transportRateMultiplier?: number;

  // Pricing
  targetMarginPercent: number;
}

export interface ProjectCalculationResult {
  baseScore: number;
  complexityMultiplier: number;
  adjustedScore: number;
  timeBreakdown: TimeCalculationResult;
  pricing: PricingResult;
}

/**
 * Complete project calculation from inputs to final pricing
 */
export function calculateCompleteProject(
  inputs: ProjectCalculationInputs
): ProjectCalculationResult {
  // Step 1: Calculate base score using appropriate formula
  let baseScore = 0;
  switch (inputs.serviceType) {
    case "Tree Removal":
      baseScore = calculateTreeScore(inputs.formulaInputs as TreeRemovalInputs);
      break;
    case "Tree Trimming":
      baseScore = calculateTrimScore(inputs.formulaInputs as TreeTrimmingInputs);
      break;
    case "Stump Grinding":
      baseScore = calculateStumpScore(inputs.formulaInputs as StumpGrindingInputs);
      break;
    case "Forestry Mulching":
      baseScore = calculateMulchingScore(inputs.formulaInputs as ForestryMulchingInputs);
      break;
    case "Land Clearing":
      // Land clearing uses days, not score-based
      baseScore = calculateLandClearingDays(inputs.formulaInputs as LandClearingInputs) * 8; // Convert days to hours
      break;
  }

  // Step 2: Apply AFISS complexity multiplier
  const adjustedScore = baseScore * inputs.afissMultiplier;

  // Step 3: Calculate time breakdown
  const timeBreakdown = calculateJobTime({
    workScore: adjustedScore,
    productionRatePPH: inputs.productionRatePPH,
    driveTimeMinutes: inputs.driveTimeMinutes,
    transportRateMultiplier: inputs.transportRateMultiplier,
  });

  // Step 4: Calculate pricing
  const pricing = calculatePricing({
    totalHours: timeBreakdown.totalHours,
    loadoutCostPerHour: inputs.loadoutCostPerHour,
    targetMarginPercent: inputs.targetMarginPercent,
  });

  return {
    baseScore: Math.round(baseScore * 100) / 100,
    complexityMultiplier: Math.round(inputs.afissMultiplier * 100) / 100,
    adjustedScore: Math.round(adjustedScore * 100) / 100,
    timeBreakdown,
    pricing,
  };
}

// ============================================
// MARGIN CONVERSION UTILITIES
// ============================================

/**
 * Convert target margin percentage to cost multiplier
 * Examples:
 * - 30% margin → 1.43x
 * - 50% margin → 2.0x
 * - 70% margin → 3.33x
 */
export function marginToMultiplier(marginPercent: number): number {
  return 1 / (1 - marginPercent / 100);
}

/**
 * Calculate what margin percentage is achieved with a given multiplier
 */
export function multiplierToMargin(multiplier: number): number {
  return ((multiplier - 1) / multiplier) * 100;
}

/**
 * Get standard margin multipliers
 */
export const STANDARD_MARGINS = {
  margin30: { percent: 30, multiplier: 1.43 },
  margin40: { percent: 40, multiplier: 1.67 },
  margin50: { percent: 50, multiplier: 2.0 },
  margin60: { percent: 60, multiplier: 2.5 },
  margin70: { percent: 70, multiplier: 3.33 },
};
