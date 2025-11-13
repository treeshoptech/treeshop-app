/**
 * Employee Compensation Calculation Utilities
 *
 * Complete formula implementation for employee true cost per hour
 * Used across employee management and loadout builder
 */

// Career track tier levels and multipliers
export const TIER_LEVELS = [
  { value: 1, label: 'Tier 1 - Entry Level', multiplier: 1.0, exp: '0-6 months' },
  { value: 2, label: 'Tier 2 - Developing', multiplier: 1.6, exp: '6-18 months' },
  { value: 3, label: 'Tier 3 - Competent', multiplier: 1.8, exp: '18 months-3 years' },
  { value: 4, label: 'Tier 4 - Advanced', multiplier: 2.0, exp: '3-5 years' },
  { value: 5, label: 'Tier 5 - Master', multiplier: 2.2, exp: '5+ years' },
];

// Leadership levels and hourly premiums
export const LEADERSHIP_LEVELS = [
  { code: 'L', label: 'Team Leader', premium: 2 },
  { code: 'S', label: 'Supervisor', premium: 3 },
  { code: 'M', label: 'Manager', premium: 5 },
  { code: 'D', label: 'Director', premium: 6 },
  { code: 'C', label: 'Chief/Executive', premium: 7 },
];

// Equipment certifications and hourly premiums
export const EQUIPMENT_LEVELS = [
  { code: 'E1', label: 'Basic Equipment', premium: 0.5, desc: 'Hand tools, chainsaws' },
  { code: 'E2', label: 'Intermediate Machinery', premium: 2, desc: 'Chippers, stump grinders' },
  { code: 'E3', label: 'Advanced Equipment', premium: 4, desc: 'Cranes, bucket trucks' },
  { code: 'E4', label: 'Specialized Equipment', premium: 7, desc: 'Forestry mulchers' },
];

// Driver licenses and hourly premiums
export const DRIVER_LICENSES = [
  { code: 'D1', label: 'Standard License', premium: 0.5 },
  { code: 'D2', label: 'CDL Class B', premium: 2 },
  { code: 'D3', label: 'CDL Class A', premium: 3 },
  { code: 'DH', label: 'Hazmat Endorsement', premium: 1 },
];

// Professional certifications and hourly premiums
export const CERTIFICATIONS = [
  { code: 'ISA', label: 'ISA Certified Arborist', premium: 4 },
  { code: 'CRA', label: 'Crane Certified', premium: 3 },
  { code: 'TRA', label: 'Trainer Certified', premium: 2 },
  { code: 'OSH', label: 'OSHA Safety', premium: 1 },
  { code: 'PES', label: 'Pesticide License', premium: 2 },
  { code: 'CPR', label: 'First Aid/CPR', premium: 0.5 },
];

// Standard burden multiplier (1.7x covers taxes, insurance, overhead, non-billable time)
export const BURDEN_MULTIPLIER = 1.7;

export interface EmployeeCompensationInputs {
  baseHourlyRate: number;
  tier: number; // 1-5
  leadership?: string; // Leadership code (L, S, M, D, C)
  equipmentCerts?: string[]; // Equipment certification codes
  driverLicenses?: string[]; // Driver license codes
  certifications?: string[]; // Professional certification codes
}

export interface EmployeeCompensationBreakdown {
  baseHourlyRate: number; // Original base rate
  tierMultiplier: number; // Tier multiplier (1.0 - 2.2)
  baseTiered: number; // Base rate × tier multiplier
  leadershipPremium: number; // Leadership bonus per hour
  equipmentPremium: number; // Total equipment cert premiums
  driverPremium: number; // Total driver license premiums
  certPremium: number; // Total professional cert premiums
  totalHourly: number; // Total before burden
  trueCost: number; // Final cost with burden multiplier (1.7x)
}

/**
 * Calculate complete employee compensation including all premiums and burden
 *
 * Formula:
 * 1. Base Tiered = Base Rate × Tier Multiplier
 * 2. Total Hourly = Base Tiered + Leadership Premium + Equipment Premium + Driver Premium + Cert Premium
 * 3. True Cost = Total Hourly × Burden Multiplier (1.7)
 *
 * Example:
 * - Base: $25/hr
 * - Tier 3 (1.8×): $25 × 1.8 = $45
 * - ISA cert: +$4 = $49
 * - Burden: $49 × 1.7 = $83.30/hr true cost
 */
export function calculateEmployeeCompensation(
  inputs: EmployeeCompensationInputs
): EmployeeCompensationBreakdown {
  const {
    baseHourlyRate,
    tier,
    leadership,
    equipmentCerts = [],
    driverLicenses = [],
    certifications = [],
  } = inputs;

  // Step 1: Apply tier multiplier to base rate
  const tierMultiplier = TIER_LEVELS.find(t => t.value === tier)?.multiplier || 1.0;
  const baseTiered = baseHourlyRate * tierMultiplier;

  // Step 2: Calculate all premiums
  const leadershipPremium = leadership
    ? LEADERSHIP_LEVELS.find(l => l.code === leadership)?.premium || 0
    : 0;

  const equipmentPremium = equipmentCerts.reduce(
    (sum, code) => sum + (EQUIPMENT_LEVELS.find(e => e.code === code)?.premium || 0),
    0
  );

  const driverPremium = driverLicenses.reduce(
    (sum, code) => sum + (DRIVER_LICENSES.find(d => d.code === code)?.premium || 0),
    0
  );

  const certPremium = certifications.reduce(
    (sum, code) => sum + (CERTIFICATIONS.find(c => c.code === code)?.premium || 0),
    0
  );

  // Step 3: Calculate total hourly (before burden)
  const totalHourly =
    baseTiered +
    leadershipPremium +
    equipmentPremium +
    driverPremium +
    certPremium;

  // Step 4: Apply burden multiplier for true cost
  const trueCost = totalHourly * BURDEN_MULTIPLIER;

  return {
    baseHourlyRate,
    tierMultiplier,
    baseTiered,
    leadershipPremium,
    equipmentPremium,
    driverPremium,
    certPremium,
    totalHourly,
    trueCost,
  };
}

/**
 * Simplified calculation for employees with no certifications/premiums
 * Uses simplified burden multiplier approach
 */
export function calculateSimpleEmployeeCost(
  baseHourlyRate: number,
  tier: number = 1
): number {
  const tierMultiplier = TIER_LEVELS.find(t => t.value === tier)?.multiplier || 1.0;
  const baseTiered = baseHourlyRate * tierMultiplier;
  return baseTiered * BURDEN_MULTIPLIER;
}

/**
 * Calculate total loadout labor cost from multiple employees
 */
export function calculateLoadoutLaborCost(
  employees: EmployeeCompensationInputs[]
): number {
  return employees.reduce((total, emp) => {
    const cost = calculateEmployeeCompensation(emp);
    return total + cost.trueCost;
  }, 0);
}

/**
 * Format hourly rate as currency string
 */
export function formatHourlyRate(amount: number): string {
  return `$${amount.toFixed(2)}/hr`;
}
