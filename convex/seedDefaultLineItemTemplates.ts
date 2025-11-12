import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrganization } from "./lib/auth";

/**
 * Seed default TreeShop enhanced line item templates for an organization
 * These are the five core service types with TreeShop Score-based pricing
 */
export const seedDefaults = mutation({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Check if templates already exist
    const existing = await ctx.db
      .query("lineItemTemplates")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    if (existing.length > 0) {
      throw new Error("Default templates already exist for this organization");
    }

    const now = Date.now();

    // 1. FORESTRY MULCHING
    await ctx.db.insert("lineItemTemplates", {
      organizationId: org._id,
      name: "Forestry Mulching - Base Service",
      description: "Complete vegetation mulching using tracked mulcher. Pricing based on DBH package and acreage with AFISS complexity adjustments.",
      category: "Forestry Mulching",
      serviceType: "Forestry Mulching",
      defaultUnit: "Acre",
      defaultUnitPrice: 0, // Calculated per job using TreeShop Score
      defaultQuantity: 1,
      costPerUnit: 0,
      defaultMargin: 0.50, // 50% default margin
      afissFactorIds: [
        "access_narrow_gate",
        "access_soft_ground",
        "access_steep_slope",
        "facilities_power_lines_nearby",
        "facilities_buildings_within_50ft",
        "site_wetlands",
        "site_rocky_ground",
        "site_dense_undergrowth"
      ],
      tags: ["mulching", "land-clearing", "vegetation-management"],
      notes: "Uses TreeShop Score formula: DBH Package (inches) × Acreage × AFISS Multiplier. Production rate varies by equipment (1.3-5.0 PpH typical).",
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 2. STUMP GRINDING
    await ctx.db.insert("lineItemTemplates", {
      organizationId: org._id,
      name: "Stump Grinding - Base Service",
      description: "Professional stump grinding with StumpScore-based pricing. Includes grinding to specified depth, chip cleanup, and backfill options.",
      category: "Stump Grinding",
      serviceType: "Stump Grinding",
      defaultUnit: "Each",
      defaultUnitPrice: 0, // Calculated per stump using StumpScore
      defaultQuantity: 1,
      costPerUnit: 0,
      defaultMargin: 0.50,
      afissFactorIds: [
        "irregularities_hardwood_species",
        "irregularities_large_root_flare",
        "irregularities_rotten_stump",
        "site_rocky_ground",
        "facilities_tight_landscaping",
        "facilities_near_foundation",
        "access_narrow_gate",
        "access_soft_ground"
      ],
      tags: ["stump-grinding", "stump-removal", "grinding"],
      notes: "Uses StumpScore formula: Diameter² × (Height Above + Grind Depth Below). Modifiers: Hardwood +15%, Large root flare +20%, Rotten -15%. Production rate: 400 StumpScore points per hour (default).",
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 3. TREE REMOVAL
    await ctx.db.insert("lineItemTemplates", {
      organizationId: org._id,
      name: "Tree Removal - Base Service",
      description: "Complete tree removal including felling, sectioning, rigging, chipping, and hauling. Pricing based on tree size and complexity.",
      category: "Tree Removal",
      serviceType: "Tree Removal",
      defaultUnit: "Tree",
      defaultUnitPrice: 0, // Calculated per tree using TreeShop Score
      defaultQuantity: 1,
      costPerUnit: 0,
      defaultMargin: 0.50,
      afissFactorIds: [
        "irregularities_dead_hazard_tree",
        "irregularities_leaning_tree",
        "irregularities_multi_trunk",
        "facilities_power_lines_touching",
        "facilities_power_lines_nearby",
        "facilities_buildings_within_50ft",
        "facilities_pool_high_value_target",
        "access_no_bucket_access",
        "safety_high_voltage_lines",
        "safety_confined_space",
        "safety_near_public_roads"
      ],
      tags: ["tree-removal", "felling", "hazard-tree"],
      notes: "Uses TreeShop Score formula: Height × Crown Radius × 2 × DBH ÷ 12. AFISS multipliers applied per tree based on access method, proximity to structures, and tree condition. Production rate: ~250 PpH (varies by crew/equipment).",
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 4. TREE TRIMMING
    await ctx.db.insert("lineItemTemplates", {
      organizationId: org._id,
      name: "Tree Trimming - Base Service",
      description: "Professional tree pruning and crown management. Pricing based on tree size, trim percentage, and access complexity.",
      category: "Tree Trimming",
      serviceType: "Tree Trimming",
      defaultUnit: "Tree",
      defaultUnitPrice: 0, // Calculated per tree using TreeShop Score
      defaultQuantity: 1,
      costPerUnit: 0,
      defaultMargin: 0.50,
      afissFactorIds: [
        "facilities_power_lines_touching",
        "facilities_power_lines_nearby",
        "facilities_buildings_within_50ft",
        "facilities_pool_high_value_target",
        "access_no_bucket_access",
        "irregularities_dead_hazard_tree",
        "safety_high_voltage_lines",
        "safety_confined_space"
      ],
      tags: ["tree-trimming", "pruning", "crown-reduction"],
      notes: "Uses same TreeShop Score base as Tree Removal, but applies trim percentage factor: Light (10-15%) ×0.3, Medium (20-30%) ×0.5, Heavy (40-50%) ×0.8. Production rate: ~300 PpH (varies by trim type).",
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 5. LAND CLEARING
    await ctx.db.insert("lineItemTemplates", {
      organizationId: org._id,
      name: "Land Clearing - Base Service",
      description: "Heavy land clearing using excavators, mulchers, and support equipment. Day-based estimation with intensity adjustments.",
      category: "Land Clearing",
      serviceType: "Land Clearing",
      defaultUnit: "Day",
      defaultUnitPrice: 0, // Calculated based on loadout daily rate
      defaultQuantity: 1,
      costPerUnit: 0,
      defaultMargin: 0.50,
      afissFactorIds: [
        "access_soft_ground",
        "access_steep_slope",
        "facilities_utilities_in_work_zone",
        "facilities_buildings_within_50ft",
        "facilities_power_lines_nearby",
        "site_wetlands",
        "site_rocky_ground",
        "site_dense_undergrowth",
        "site_protected_species_habitat",
        "irregularities_dead_hazard_tree"
      ],
      tags: ["land-clearing", "site-prep", "excavation"],
      notes: "Day-based pricing: Standard Lot (1 day), Large Lot (2 days), Multi-Lot (3+ days). Intensity levels: Light, Standard, Heavy. AFISS factors add 0.5-1 day. Daily rate = 8 hours × Loadout Hourly Rate.",
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, message: "Default TreeShop line item templates created successfully" };
  },
});

/**
 * Reset and re-seed default templates (USE WITH CAUTION)
 */
export const resetDefaults = mutation({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Delete all existing templates for this organization
    const existing = await ctx.db
      .query("lineItemTemplates")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    for (const template of existing) {
      await ctx.db.delete(template._id);
    }

    // Re-seed defaults by calling seedDefaults
    // We need to inline the logic since we can't call mutations from mutations
    const now = Date.now();

    const templates = [
      {
        name: "Forestry Mulching - Base Service",
        description: "Complete vegetation mulching using tracked mulcher. Pricing based on DBH package and acreage with AFISS complexity adjustments.",
        category: "Forestry Mulching",
        serviceType: "Forestry Mulching",
        defaultUnit: "Acre",
        afissFactorIds: ["access_narrow_gate", "access_soft_ground", "access_steep_slope", "facilities_power_lines_nearby", "facilities_buildings_within_50ft", "site_wetlands", "site_rocky_ground", "site_dense_undergrowth"],
        tags: ["mulching", "land-clearing", "vegetation-management"],
        notes: "Uses TreeShop Score formula: DBH Package (inches) × Acreage × AFISS Multiplier. Production rate varies by equipment (1.3-5.0 PpH typical).",
      },
      {
        name: "Stump Grinding - Base Service",
        description: "Professional stump grinding with StumpScore-based pricing. Includes grinding to specified depth, chip cleanup, and backfill options.",
        category: "Stump Grinding",
        serviceType: "Stump Grinding",
        defaultUnit: "Each",
        afissFactorIds: ["irregularities_hardwood_species", "irregularities_large_root_flare", "irregularities_rotten_stump", "site_rocky_ground", "facilities_tight_landscaping", "facilities_near_foundation", "access_narrow_gate", "access_soft_ground"],
        tags: ["stump-grinding", "stump-removal", "grinding"],
        notes: "Uses StumpScore formula: Diameter² × (Height Above + Grind Depth Below). Modifiers: Hardwood +15%, Large root flare +20%, Rotten -15%. Production rate: 400 StumpScore points per hour (default).",
      },
      {
        name: "Tree Removal - Base Service",
        description: "Complete tree removal including felling, sectioning, rigging, chipping, and hauling. Pricing based on tree size and complexity.",
        category: "Tree Removal",
        serviceType: "Tree Removal",
        defaultUnit: "Tree",
        afissFactorIds: ["irregularities_dead_hazard_tree", "irregularities_leaning_tree", "irregularities_multi_trunk", "facilities_power_lines_touching", "facilities_power_lines_nearby", "facilities_buildings_within_50ft", "facilities_pool_high_value_target", "access_no_bucket_access", "safety_high_voltage_lines", "safety_confined_space", "safety_near_public_roads"],
        tags: ["tree-removal", "felling", "hazard-tree"],
        notes: "Uses TreeShop Score formula: Height × Crown Radius × 2 × DBH ÷ 12. AFISS multipliers applied per tree based on access method, proximity to structures, and tree condition. Production rate: ~250 PpH (varies by crew/equipment).",
      },
      {
        name: "Tree Trimming - Base Service",
        description: "Professional tree pruning and crown management. Pricing based on tree size, trim percentage, and access complexity.",
        category: "Tree Trimming",
        serviceType: "Tree Trimming",
        defaultUnit: "Tree",
        afissFactorIds: ["facilities_power_lines_touching", "facilities_power_lines_nearby", "facilities_buildings_within_50ft", "facilities_pool_high_value_target", "access_no_bucket_access", "irregularities_dead_hazard_tree", "safety_high_voltage_lines", "safety_confined_space"],
        tags: ["tree-trimming", "pruning", "crown-reduction"],
        notes: "Uses same TreeShop Score base as Tree Removal, but applies trim percentage factor: Light (10-15%) ×0.3, Medium (20-30%) ×0.5, Heavy (40-50%) ×0.8. Production rate: ~300 PpH (varies by trim type).",
      },
      {
        name: "Land Clearing - Base Service",
        description: "Heavy land clearing using excavators, mulchers, and support equipment. Day-based estimation with intensity adjustments.",
        category: "Land Clearing",
        serviceType: "Land Clearing",
        defaultUnit: "Day",
        afissFactorIds: ["access_soft_ground", "access_steep_slope", "facilities_utilities_in_work_zone", "facilities_buildings_within_50ft", "facilities_power_lines_nearby", "site_wetlands", "site_rocky_ground", "site_dense_undergrowth", "site_protected_species_habitat", "irregularities_dead_hazard_tree"],
        tags: ["land-clearing", "site-prep", "excavation"],
        notes: "Day-based pricing: Standard Lot (1 day), Large Lot (2 days), Multi-Lot (3+ days). Intensity levels: Light, Standard, Heavy. AFISS factors add 0.5-1 day. Daily rate = 8 hours × Loadout Hourly Rate.",
      },
    ];

    for (const template of templates) {
      await ctx.db.insert("lineItemTemplates", {
        organizationId: org._id,
        ...template,
        defaultUnitPrice: 0,
        defaultQuantity: 1,
        costPerUnit: 0,
        defaultMargin: 0.50,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, message: "Default templates reset successfully" };
  },
});
