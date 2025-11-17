import { mutation } from "./_generated/server";

/**
 * Seed default AFISS (Access, Facilities, Irregularities, Site, Safety) factors
 * These are system-wide complexity multipliers for TreeShop Score calculations
 */
export const seedDefaultAfissFactors = mutation({
  handler: async (ctx) => {
    // Check if system factors already exist
    const existing = await ctx.db
      .query("afissFactors")
      .withIndex("by_system", (q) => q.eq("isSystemFactor", true))
      .collect();

    if (existing.length >= 30) {
      return { success: true, message: "AFISS factors already seeded", count: existing.length };
    }

    const now = Date.now();
    let sortOrder = 0;

    // ============================================
    // ACCESS CATEGORY (8 factors)
    // ============================================
    const accessFactors = [
      {
        factorId: "access_narrow_gate",
        name: "Narrow Gate (<8 ft)",
        description: "Gate width less than 8 feet requires smaller equipment or hand-carry",
        impactPercentage: 0.12,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Stump Grinding"],
        icon: "🚧",
      },
      {
        factorId: "access_no_equipment",
        name: "No Equipment Access",
        description: "Hand-carry only, no vehicle or equipment access to work area",
        impactPercentage: 0.50,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming", "Stump Grinding"],
        icon: "🚶",
      },
      {
        factorId: "access_soft_ground",
        name: "Soft/Muddy Ground",
        description: "Wet soil conditions, risk of equipment getting stuck",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Stump Grinding"],
        icon: "🌧️",
      },
      {
        factorId: "access_steep_slope",
        name: "Steep Slope (>15°)",
        description: "Significant slope requiring specialized equipment or techniques",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Tree Removal"],
        icon: "⛰️",
      },
      {
        factorId: "access_long_drive",
        name: "Long Drive (>2 hrs)",
        description: "Drive time over 2 hours one-way increases mobilization cost",
        impactPercentage: 0.10,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Stump Grinding", "Tree Removal", "Tree Trimming"],
        icon: "🚛",
      },
      {
        factorId: "access_no_bucket",
        name: "No Bucket Truck Access",
        description: "Climbing required instead of bucket truck access",
        impactPercentage: 0.25,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "🪜",
      },
      {
        factorId: "access_backyard_only",
        name: "Backyard Access Only",
        description: "Limited access through backyard, restricted equipment size",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Tree Removal", "Stump Grinding", "Land Clearing"],
        icon: "🏡",
      },
      {
        factorId: "access_over_structure",
        name: "Over Structure/Garage",
        description: "Tree overhangs building requiring precision work",
        impactPercentage: 0.30,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "🏠",
      },
    ];

    // ============================================
    // FACILITIES CATEGORY (6 factors)
    // ============================================
    const facilitiesFactors = [
      {
        factorId: "facilities_power_lines_touching",
        name: "Power Lines Touching",
        description: "Tree or work area in direct contact with power lines",
        impactPercentage: 0.30,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "⚡",
      },
      {
        factorId: "facilities_power_lines_nearby",
        name: "Power Lines Nearby (<10 ft)",
        description: "Power lines within 10 feet of work area",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming", "Forestry Mulching", "Land Clearing"],
        icon: "🔌",
      },
      {
        factorId: "facilities_buildings_within_50ft",
        name: "Buildings Within 50 ft",
        description: "Structures or buildings within 50 feet of work area",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming", "Land Clearing", "Forestry Mulching"],
        icon: "🏢",
      },
      {
        factorId: "facilities_pool_high_value",
        name: "Pool/High Value Target",
        description: "Swimming pool, expensive landscaping, or high-value structures nearby",
        impactPercentage: 0.30,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming", "Land Clearing"],
        icon: "🏊",
      },
      {
        factorId: "facilities_utilities_in_zone",
        name: "Utilities in Work Zone",
        description: "Underground or overhead utilities present in immediate work area",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Land Clearing", "Stump Grinding", "Forestry Mulching"],
        icon: "⚠️",
      },
      {
        factorId: "facilities_tight_landscaping",
        name: "Tight Landscaping",
        description: "Mature landscaping, flower beds, or irrigation requiring protection",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Stump Grinding", "Tree Removal", "Tree Trimming"],
        icon: "🌺",
      },
    ];

    // ============================================
    // IRREGULARITIES CATEGORY (8 factors)
    // ============================================
    const irregularitiesFactors = [
      {
        factorId: "irregularities_dead_hazard",
        name: "Dead/Hazard Tree",
        description: "Dead, dying, or structurally unsound tree requiring extra safety precautions",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "💀",
      },
      {
        factorId: "irregularities_leaning_tree",
        name: "Leaning Tree",
        description: "Significant lean requiring directional felling techniques",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Tree Removal"],
        icon: "↗️",
      },
      {
        factorId: "irregularities_multi_trunk",
        name: "Multi-Trunk Tree",
        description: "Multiple trunks or co-dominant stems requiring additional cuts",
        impactPercentage: 0.10,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "🌳",
      },
      {
        factorId: "irregularities_hardwood",
        name: "Hardwood Species",
        description: "Oak, hickory, or other dense hardwood requiring extra time for cutting/grinding",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Tree Removal", "Stump Grinding", "Tree Trimming"],
        icon: "🪵",
      },
      {
        factorId: "irregularities_large_root_flare",
        name: "Large Root Flare",
        description: "Significant buttress roots or root flare requiring extended grinding",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Stump Grinding"],
        icon: "🌿",
      },
      {
        factorId: "irregularities_rotten_stump",
        name: "Rotten/Deteriorated Stump",
        description: "Decayed stump that grinds faster than solid wood (REDUCES time)",
        impactPercentage: -0.15,
        applicableServiceTypes: ["Stump Grinding"],
        icon: "♻️",
      },
      {
        factorId: "irregularities_pine_sap",
        name: "Heavy Sap/Resin",
        description: "Pine or other resinous tree requiring more frequent equipment cleaning",
        impactPercentage: 0.10,
        applicableServiceTypes: ["Tree Removal", "Stump Grinding", "Tree Trimming"],
        icon: "🌲",
      },
      {
        factorId: "irregularities_hollow_tree",
        name: "Hollow/Cavity Tree",
        description: "Hollow trunk or significant cavities requiring special rigging",
        impactPercentage: 0.25,
        applicableServiceTypes: ["Tree Removal"],
        icon: "🕳️",
      },
    ];

    // ============================================
    // SITE CONDITIONS CATEGORY (7 factors)
    // ============================================
    const siteFactors = [
      {
        factorId: "site_wetlands",
        name: "Wetlands in Work Area",
        description: "Protected wetlands requiring special permits or seasonal restrictions",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing"],
        icon: "🦆",
      },
      {
        factorId: "site_rocky_ground",
        name: "Rocky/Hard Ground",
        description: "Rock outcroppings or extremely hard soil slowing grinding/clearing",
        impactPercentage: 0.25,
        applicableServiceTypes: ["Stump Grinding", "Land Clearing", "Forestry Mulching"],
        icon: "🪨",
      },
      {
        factorId: "site_dense_undergrowth",
        name: "Dense Undergrowth",
        description: "Thick brush or vegetation requiring clearing before primary work",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Tree Removal"],
        icon: "🌿",
      },
      {
        factorId: "site_protected_habitat",
        name: "Protected Species Habitat",
        description: "Presence of protected wildlife requiring seasonal restrictions or surveys",
        impactPercentage: 0.30,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing"],
        icon: "🦅",
      },
      {
        factorId: "site_flood_zone",
        name: "Flood Zone/Standing Water",
        description: "Active flooding or standing water in work area",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Stump Grinding"],
        icon: "💧",
      },
      {
        factorId: "site_fire_damage",
        name: "Fire Damage",
        description: "Burn area requiring hazard assessment and specialized handling",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Tree Removal", "Land Clearing", "Forestry Mulching"],
        icon: "🔥",
      },
      {
        factorId: "site_storm_damage",
        name: "Storm Damage",
        description: "Wind-damaged or uprooted trees creating hazardous conditions",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Tree Removal", "Land Clearing"],
        icon: "🌪️",
      },
    ];

    // ============================================
    // SAFETY CATEGORY (6 factors)
    // ============================================
    const safetyFactors = [
      {
        factorId: "safety_high_voltage",
        name: "High Voltage Lines",
        description: "Transmission lines or high-voltage electrical requiring utility coordination",
        impactPercentage: 0.50,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "⚡",
      },
      {
        factorId: "safety_confined_space",
        name: "Confined Space Work",
        description: "Work in enclosed or restricted space requiring special safety protocols",
        impactPercentage: 0.25,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "📦",
      },
      {
        factorId: "safety_near_public_road",
        name: "Near Public Road/Traffic",
        description: "Work area adjacent to active road requiring traffic control",
        impactPercentage: 0.10,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming", "Stump Grinding"],
        icon: "🚦",
      },
      {
        factorId: "safety_wildlife_hazard",
        name: "Wildlife Hazard",
        description: "Bees, wasps, snakes, or other wildlife presenting safety risk",
        impactPercentage: 0.15,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming", "Stump Grinding", "Land Clearing"],
        icon: "🐝",
      },
      {
        factorId: "safety_contaminated_site",
        name: "Contaminated Site",
        description: "Known soil contamination or hazardous materials requiring PPE/protocols",
        impactPercentage: 0.30,
        applicableServiceTypes: ["Land Clearing", "Forestry Mulching", "Stump Grinding"],
        icon: "☣️",
      },
      {
        factorId: "safety_overhead_hazard",
        name: "Overhead Hazards",
        description: "Buildings, structures, or objects directly overhead creating drop zone risks",
        impactPercentage: 0.20,
        applicableServiceTypes: ["Tree Removal", "Tree Trimming"],
        icon: "⬇️",
      },
    ];

    // Combine all factors
    const allFactors = [
      ...accessFactors.map((f, i) => ({ ...f, category: "Access", sortOrder: i, isPositive: true })),
      ...facilitiesFactors.map((f, i) => ({ ...f, category: "Facilities", sortOrder: i + 100, isPositive: true })),
      ...irregularitiesFactors.map((f, i) => ({
        ...f,
        category: "Irregularities",
        sortOrder: i + 200,
        isPositive: f.impactPercentage > 0
      })),
      ...siteFactors.map((f, i) => ({ ...f, category: "Site", sortOrder: i + 300, isPositive: true })),
      ...safetyFactors.map((f, i) => ({ ...f, category: "Safety", sortOrder: i + 400, isPositive: true })),
    ];

    // Insert all factors
    for (const factor of allFactors) {
      await ctx.db.insert("afissFactors", {
        organizationId: undefined, // System-wide factor
        factorId: factor.factorId,
        name: factor.name,
        category: factor.category,
        description: factor.description,
        impactPercentage: factor.impactPercentage,
        isPositive: factor.isPositive,
        applicableServiceTypes: factor.applicableServiceTypes,
        icon: factor.icon,
        sortOrder: factor.sortOrder,
        isActive: true,
        isSystemFactor: true,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: `Seeded ${allFactors.length} AFISS factors successfully`,
      count: allFactors.length,
      breakdown: {
        access: accessFactors.length,
        facilities: facilitiesFactors.length,
        irregularities: irregularitiesFactors.length,
        site: siteFactors.length,
        safety: safetyFactors.length,
      },
    };
  },
});

/**
 * Get all active AFISS factors
 */
export const getAfissFactors = async (ctx: any) => {
  return await ctx.db
    .query("afissFactors")
    .withIndex("by_active", (q) => q.eq("isActive", true))
    .collect();
};

/**
 * Get AFISS factors for a specific service type
 */
export const getAfissFactorsForService = async (ctx: any, serviceType: string) => {
  const allFactors = await getAfissFactors(ctx);
  return allFactors.filter((f) => f.applicableServiceTypes.includes(serviceType));
};

/**
 * Calculate AFISS multiplier from selected factor IDs
 */
export const calculateAfissMultiplier = async (
  ctx: any,
  factorIds: string[]
): Promise<number> => {
  if (!factorIds || factorIds.length === 0) {
    return 1.0; // No complexity adjustment
  }

  const allFactors = await getAfissFactors(ctx);
  let totalImpact = 0;

  for (const factorId of factorIds) {
    const factor = allFactors.find((f) => f.factorId === factorId);
    if (factor) {
      totalImpact += factor.impactPercentage;
    }
  }

  // Return multiplier (1.0 = baseline, 1.2 = 20% increase, etc.)
  return 1.0 + totalImpact;
};
