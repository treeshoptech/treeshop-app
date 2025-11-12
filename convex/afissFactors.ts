import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * AFISS Factor Definitions - TreeShop IP
 *
 * These percentage multipliers are proprietary to TreeShop.
 * Users identify which factors apply, backend calculates the complexity.
 */

export const AFISS_FACTORS = {
  // ACCESS FACTORS
  access: [
    { id: "narrow_gate", name: "Narrow gate (<8 ft)", impact: 0.12 },
    { id: "no_equipment_access", name: "No equipment access (hand-carry only)", impact: 0.50 },
    { id: "soft_ground", name: "Soft/muddy ground", impact: 0.15 },
    { id: "steep_slope", name: "Steep slope (>15°)", impact: 0.20 },
    { id: "long_drive", name: "Long drive (>2 hrs one-way)", impact: 0.10 },
    { id: "difficult_parking", name: "Difficult parking/staging area", impact: 0.08 },
    { id: "gated_community", name: "Gated community (access coordination)", impact: 0.05 },
    { id: "narrow_driveway", name: "Narrow driveway (<10 ft)", impact: 0.10 },
  ],

  // FACILITIES FACTORS
  facilities: [
    { id: "power_lines_touching", name: "Power lines touching work area", impact: 0.30 },
    { id: "power_lines_nearby", name: "Power lines nearby (<10 ft)", impact: 0.15 },
    { id: "building_close", name: "Building within 50 ft", impact: 0.20 },
    { id: "pool_target", name: "Pool or high-value target", impact: 0.30 },
    { id: "utilities_zone", name: "Utilities in work zone", impact: 0.15 },
    { id: "fence_removal", name: "Fence removal required", impact: 0.12 },
    { id: "deck_patio", name: "Deck or patio in drop zone", impact: 0.18 },
    { id: "overhead_wires", name: "Communication/cable wires overhead", impact: 0.08 },
  ],

  // IRREGULARITIES FACTORS
  irregularities: [
    { id: "dead_hazard", name: "Dead/hazard trees", impact: 0.15 },
    { id: "leaning_tree", name: "Leaning trees", impact: 0.20 },
    { id: "large_root_flare", name: "Large root flare (stumps)", impact: 0.20 },
    { id: "rotten_stump", name: "Rotten stump", impact: -0.15 },
    { id: "hardwood_species", name: "Hardwood species (oak, hickory, etc.)", impact: 0.15 },
    { id: "multi_trunk", name: "Multi-trunk trees", impact: 0.10 },
    { id: "vines_ivy", name: "Heavy vines or ivy", impact: 0.08 },
    { id: "split_trunk", name: "Split or damaged trunk", impact: 0.12 },
  ],

  // SITE CONDITIONS FACTORS
  siteConditions: [
    { id: "wetlands", name: "Wetlands in work area", impact: 0.20 },
    { id: "rocky_ground", name: "Rocky ground", impact: 0.15 },
    { id: "protected_habitat", name: "Protected species habitat", impact: 0.30 },
    { id: "steep_terrain", name: "Steep terrain", impact: 0.20 },
    { id: "dense_undergrowth", name: "Dense undergrowth", impact: 0.15 },
    { id: "poor_drainage", name: "Poor drainage/standing water", impact: 0.12 },
    { id: "erosion_concern", name: "Erosion concerns", impact: 0.10 },
    { id: "tree_density", name: "High tree density", impact: 0.08 },
  ],

  // SAFETY FACTORS
  safety: [
    { id: "high_voltage", name: "High voltage lines", impact: 0.50 },
    { id: "confined_space", name: "Confined space work", impact: 0.25 },
    { id: "emergency_hazard", name: "Emergency/hazard situation", impact: 0.30 },
    { id: "near_roads", name: "Near public roads", impact: 0.10 },
    { id: "traffic_control", name: "Traffic control required", impact: 0.15 },
    { id: "elevated_work", name: "Elevated work (>50 ft)", impact: 0.12 },
    { id: "crane_needed", name: "Crane assistance needed", impact: 0.25 },
    { id: "neighbor_proximity", name: "Close neighbor proximity", impact: 0.08 },
  ],
};

/**
 * Get all AFISS factors organized by category
 */
export const listFactors = query({
  handler: async () => {
    return {
      access: AFISS_FACTORS.access,
      facilities: AFISS_FACTORS.facilities,
      irregularities: AFISS_FACTORS.irregularities,
      siteConditions: AFISS_FACTORS.siteConditions,
      safety: AFISS_FACTORS.safety,
    };
  },
});

/**
 * Calculate complexity multiplier based on selected factors
 * This is the proprietary TreeShop calculation - IP protected
 */
export const calculateComplexity = query({
  args: {
    selectedFactorIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    let totalImpact = 0;

    // Flatten all factors
    const allFactors = [
      ...AFISS_FACTORS.access,
      ...AFISS_FACTORS.facilities,
      ...AFISS_FACTORS.irregularities,
      ...AFISS_FACTORS.siteConditions,
      ...AFISS_FACTORS.safety,
    ];

    // Calculate total impact from selected factors
    for (const factorId of args.selectedFactorIds) {
      const factor = allFactors.find((f) => f.id === factorId);
      if (factor) {
        totalImpact += factor.impact;
      }
    }

    // Complexity multiplier = 1.0 + total impact
    const multiplier = 1.0 + totalImpact;

    return {
      multiplier: Math.max(multiplier, 0.5), // Minimum 0.5x (for rotten stumps, etc.)
      totalImpact,
      selectedFactors: args.selectedFactorIds.length,
    };
  },
});

/**
 * Get details about specific factors (for display purposes)
 */
export const getFactorDetails = query({
  args: {
    factorIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const allFactors = [
      ...AFISS_FACTORS.access,
      ...AFISS_FACTORS.facilities,
      ...AFISS_FACTORS.irregularities,
      ...AFISS_FACTORS.siteConditions,
      ...AFISS_FACTORS.safety,
    ];

    return args.factorIds
      .map((id) => allFactors.find((f) => f.id === id))
      .filter((f) => f !== undefined);
  },
});
