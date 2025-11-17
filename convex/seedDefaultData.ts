import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Seed all default data for a new organization
 * Called automatically when organization is created
 */
export const seedForOrganization = internalMutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const { organizationId } = args;
    const now = Date.now();

    // 1. Seed Service Templates (6 services with industry-standard values)
    const serviceTemplates = [
      {
        serviceType: "Forestry Mulching",
        formulaUsed: "MulchingScore",
        description: "Forestry mulching services using track mulcher",
        standardPPH: 1.3,
        standardCostPerHour: 247.50,
        standardBillingRate: 450.00,
        targetMargin: 45,
        notes: "Industry averages for CAT 265 equivalent with 2-person crew",
      },
      {
        serviceType: "Land Clearing",
        formulaUsed: "ClearingScore",
        description: "Heavy land clearing with excavator and support equipment",
        standardPPH: 0.8,
        standardCostPerHour: 385.00,
        standardBillingRate: 700.00,
        targetMargin: 45,
        notes: "Heavy clearing operations, varies by vegetation density",
      },
      {
        serviceType: "Stump Grinding",
        formulaUsed: "StumpScore",
        description: "Stump grinding services",
        standardPPH: 400,
        standardCostPerHour: 165.00,
        standardBillingRate: 300.00,
        targetMargin: 45,
        notes: "Standard stump grinding equipment with 1-2 person crew",
      },
      {
        serviceType: "Tree Removal",
        formulaUsed: "TreeScore",
        description: "Complete tree removal services",
        standardPPH: 250,
        standardCostPerHour: 285.00,
        standardBillingRate: 520.00,
        targetMargin: 45,
        notes: "Full-service tree removal with certified arborist",
      },
      {
        serviceType: "Tree Trimming",
        formulaUsed: "TrimScore",
        description: "Tree trimming and pruning services",
        standardPPH: 180,
        standardCostPerHour: 235.00,
        standardBillingRate: 425.00,
        targetMargin: 45,
        notes: "Professional tree trimming, varies by intensity",
      },
      {
        serviceType: "Brush Clearing",
        formulaUsed: "BrushScore",
        description: "Light brush and vegetation clearing",
        standardPPH: 2.5,
        standardCostPerHour: 145.00,
        standardBillingRate: 265.00,
        targetMargin: 45,
        notes: "Light brush clearing with skid steer or similar",
      },
    ];

    for (const template of serviceTemplates) {
      await ctx.db.insert("serviceTemplates", {
        organizationId,
        serviceType: template.serviceType,
        formulaUsed: template.formulaUsed,
        description: template.description,
        standardPPH: template.standardPPH,
        standardCostPerHour: template.standardCostPerHour,
        standardLaborCost: template.standardCostPerHour * 0.55,
        standardEquipmentCost: template.standardCostPerHour * 0.35,
        standardOverhead: template.standardCostPerHour * 0.10,
        standardBillingRate: template.standardBillingRate,
        targetMargin: template.targetMargin,
        lastRecalculated: now,
        totalJobsInAverage: 0,
        confidenceScore: 50,
        isActive: true,
        notes: template.notes,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 2. Seed AFISS Factors (system-wide, no organizationId needed)
    // Only seed if no factors exist yet
    const existingFactors = await ctx.db.query("afissFactors").first();

    if (!existingFactors) {
      const afissFactors = [
        // ACCESS (8 factors)
        { factorId: "access_narrow_gate", category: "Access", name: "Narrow gate/driveway (<8 ft)", impact: 0.12, sortOrder: 1 },
        { factorId: "access_no_equipment", category: "Access", name: "No equipment access (hand-carry)", impact: 0.50, sortOrder: 2 },
        { factorId: "access_soft_ground", category: "Access", name: "Soft/muddy ground conditions", impact: 0.15, sortOrder: 3 },
        { factorId: "access_steep_slope", category: "Access", name: "Steep slope (>15°)", impact: 0.20, sortOrder: 4 },
        { factorId: "access_long_drive", category: "Access", name: "Long drive (>2 hrs one-way)", impact: 0.10, sortOrder: 5 },
        { factorId: "access_gated_community", category: "Access", name: "Gated community/restricted access", impact: 0.05, sortOrder: 6 },
        { factorId: "access_ferry_required", category: "Access", name: "Ferry/boat access required", impact: 0.25, sortOrder: 7 },
        { factorId: "access_rough_terrain", category: "Access", name: "Rough terrain (rocks, ditches)", impact: 0.18, sortOrder: 8 },

        // FACILITIES (6 factors)
        { factorId: "facilities_power_lines_touching", category: "Facilities", name: "Power lines touching work area", impact: 0.30, sortOrder: 1 },
        { factorId: "facilities_power_lines_nearby", category: "Facilities", name: "Power lines nearby (<10 ft)", impact: 0.15, sortOrder: 2 },
        { factorId: "facilities_building_close", category: "Facilities", name: "Building within 50 ft", impact: 0.20, sortOrder: 3 },
        { factorId: "facilities_pool_nearby", category: "Facilities", name: "Pool or high-value structure", impact: 0.30, sortOrder: 4 },
        { factorId: "facilities_utilities_in_zone", category: "Facilities", name: "Underground utilities in work zone", impact: 0.15, sortOrder: 5 },
        { factorId: "facilities_fence_removal", category: "Facilities", name: "Fence removal/reinstallation required", impact: 0.12, sortOrder: 6 },

        // IRREGULARITIES (8 factors)
        { factorId: "irreg_dead_tree", category: "Irregularities", name: "Dead/hazard trees", impact: 0.15, sortOrder: 1 },
        { factorId: "irreg_leaning_tree", category: "Irregularities", name: "Leaning trees", impact: 0.20, sortOrder: 2 },
        { factorId: "irreg_root_flare", category: "Irregularities", name: "Large root flare/buttress", impact: 0.20, sortOrder: 3 },
        { factorId: "irreg_rotten_wood", category: "Irregularities", name: "Rotten/deteriorated wood", impact: -0.15, sortOrder: 4 },
        { factorId: "irreg_hardwood", category: "Irregularities", name: "Hardwood species (oak, hickory)", impact: 0.15, sortOrder: 5 },
        { factorId: "irreg_multi_trunk", category: "Irregularities", name: "Multi-trunk trees", impact: 0.10, sortOrder: 6 },
        { factorId: "irreg_vines_ivy", category: "Irregularities", name: "Heavy vines or ivy coverage", impact: 0.12, sortOrder: 7 },
        { factorId: "irreg_root_damage", category: "Irregularities", name: "Exposed/damaged root systems", impact: 0.18, sortOrder: 8 },

        // SITE (7 factors)
        { factorId: "site_wetlands", category: "Site", name: "Wetlands in work area", impact: 0.20, sortOrder: 1 },
        { factorId: "site_rocky_ground", category: "Site", name: "Rocky/hard ground conditions", impact: 0.15, sortOrder: 2 },
        { factorId: "site_protected_species", category: "Site", name: "Protected species habitat", impact: 0.30, sortOrder: 3 },
        { factorId: "site_dense_undergrowth", category: "Site", name: "Dense undergrowth/brush", impact: 0.15, sortOrder: 4 },
        { factorId: "site_landscaping_present", category: "Site", name: "High-value landscaping to protect", impact: 0.25, sortOrder: 5 },
        { factorId: "site_drainage_issues", category: "Site", name: "Poor drainage/standing water", impact: 0.12, sortOrder: 6 },
        { factorId: "site_boundary_unclear", category: "Site", name: "Property boundary unclear/disputed", impact: 0.20, sortOrder: 7 },

        // SAFETY (6 factors)
        { factorId: "safety_high_voltage", category: "Safety", name: "High voltage lines (>500V)", impact: 0.50, sortOrder: 1 },
        { factorId: "safety_confined_space", category: "Safety", name: "Confined space work", impact: 0.25, sortOrder: 2 },
        { factorId: "safety_emergency_hazard", category: "Safety", name: "Emergency/hazard situation", impact: 0.30, sortOrder: 3 },
        { factorId: "safety_near_road", category: "Safety", name: "Near public roads (traffic control)", impact: 0.10, sortOrder: 4 },
        { factorId: "safety_elevated_work", category: "Safety", name: "Elevated work (>30 ft)", impact: 0.18, sortOrder: 5 },
        { factorId: "safety_weather_restrictions", category: "Safety", name: "Weather-restricted work window", impact: 0.15, sortOrder: 6 },
      ];

      for (const factor of afissFactors) {
        await ctx.db.insert("afissFactors", {
          factorId: factor.factorId,
          name: factor.name,
          category: factor.category,
          description: factor.name,
          impactPercentage: factor.impact,
          isPositive: factor.impact > 0,
          applicableServiceTypes: ["Forestry Mulching", "Land Clearing", "Stump Grinding", "Tree Removal", "Tree Trimming", "Brush Clearing"],
          sortOrder: factor.sortOrder,
          isActive: true,
          isSystemFactor: true,
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return {
      success: true,
      organizationId,
      serviceTemplatesCreated: 6,
      afissFactorsCreated: existingFactors ? 0 : 35,
    };
  },
});
