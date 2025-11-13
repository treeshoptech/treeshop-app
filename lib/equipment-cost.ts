/**
 * Equipment Cost Calculation Utilities
 *
 * Complete formula implementation for equipment hourly costs
 * Used across equipment management and loadout builder
 */

export interface EquipmentCostInputs {
  // Acquisition
  purchasePrice: number;
  usefulLifeYears: number;

  // Finance
  financeRate: number; // Annual rate as decimal (0.05 = 5%)

  // Insurance & Registration
  insuranceCost: number; // Annual cost
  registrationCost: number; // Annual cost

  // Fuel
  fuelConsumptionGPH: number; // Gallons per hour
  fuelPricePerGallon: number;

  // Maintenance & Repairs
  maintenanceCostAnnual: number;
  repairCostAnnual: number;

  // Operations
  annualHours: number;
}

export interface EquipmentCostBreakdown {
  // Per Hour
  ownershipPerHour: number;
  operatingPerHour: number;
  totalPerHour: number;

  // Per Year
  ownershipPerYear: number;
  operatingPerYear: number;
  totalPerYear: number;

  // Detailed breakdown
  depreciation: number; // Per hour
  finance: number; // Per hour
  insurance: number; // Per hour
  registration: number; // Per hour
  fuel: number; // Per hour
  maintenance: number; // Per hour
  repairs: number; // Per hour
}

/**
 * Calculate complete equipment costs per hour and per year
 *
 * Formula:
 * Ownership/Hour = (depreciation + finance + insurance + registration) / annualHours
 * Operating/Hour = (fuel + maintenance + repairs) / annualHours
 * Total = Ownership + Operating
 */
export function calculateEquipmentCost(inputs: EquipmentCostInputs): EquipmentCostBreakdown {
  const {
    purchasePrice,
    usefulLifeYears,
    financeRate,
    insuranceCost,
    registrationCost,
    fuelConsumptionGPH,
    fuelPricePerGallon,
    maintenanceCostAnnual,
    repairCostAnnual,
    annualHours,
  } = inputs;

  // Ownership costs (per year)
  const depreciationPerYear = purchasePrice / usefulLifeYears;
  const financePerYear = purchasePrice * financeRate;
  const insurancePerYear = insuranceCost;
  const registrationPerYear = registrationCost;

  const ownershipPerYear =
    depreciationPerYear +
    financePerYear +
    insurancePerYear +
    registrationPerYear;

  // Operating costs (per year)
  const fuelPerYear = fuelConsumptionGPH * fuelPricePerGallon * annualHours;
  const maintenancePerYear = maintenanceCostAnnual;
  const repairsPerYear = repairCostAnnual;

  const operatingPerYear =
    fuelPerYear +
    maintenancePerYear +
    repairsPerYear;

  // Total per year
  const totalPerYear = ownershipPerYear + operatingPerYear;

  // Per hour calculations
  const ownershipPerHour = ownershipPerYear / annualHours;
  const operatingPerHour = operatingPerYear / annualHours;
  const totalPerHour = totalPerYear / annualHours;

  // Detailed breakdown (per hour)
  const depreciation = depreciationPerYear / annualHours;
  const finance = financePerYear / annualHours;
  const insurance = insurancePerYear / annualHours;
  const registration = registrationPerYear / annualHours;
  const fuel = fuelPerYear / annualHours;
  const maintenance = maintenancePerYear / annualHours;
  const repairs = repairsPerYear / annualHours;

  return {
    ownershipPerHour,
    operatingPerHour,
    totalPerHour,
    ownershipPerYear,
    operatingPerYear,
    totalPerYear,
    depreciation,
    finance,
    insurance,
    registration,
    fuel,
    maintenance,
    repairs,
  };
}

/**
 * Format cost as currency string
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `$${amount.toFixed(decimals)}`;
}

/**
 * Format hourly rate
 */
export function formatHourlyRate(amount: number): string {
  return `${formatCurrency(amount)}/hr`;
}

/**
 * Calculate total loadout equipment cost from multiple equipment items
 */
export function calculateLoadoutEquipmentCost(equipmentList: EquipmentCostInputs[]): number {
  return equipmentList.reduce((total, eq) => {
    const cost = calculateEquipmentCost(eq);
    return total + cost.totalPerHour;
  }, 0);
}
