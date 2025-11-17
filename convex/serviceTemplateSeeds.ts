import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireOrganization } from "./lib/permissions";

/**
 * TWO-TIER PRICING SYSTEM - SERVICE TEMPLATE SEEDS
 *
 * Create default service templates for a new organization with industry-standard values.
 * These templates provide starting points that will be refined through the feedback loop.
 */

interface ServiceTemplateSeed {
  serviceType: string;
  formulaUsed: string;
  description: string;
  standardPPH: number;
  standardCostPerHour: number;
  standardBillingRate: number;
  targetMargin: number;
  notes: string;
}

const DEFAULT_SERVICE_TEMPLATES: ServiceTemplateSeed[] = [
  {
    serviceType: "Forestry Mulching",
    formulaUsed: "MulchingScore",
    description: "Forestry mulching services using track mulcher",
    standardPPH: 1.3, // Industry average: 1.3 Mulching Score points per hour
    standardCostPerHour: 247.50, // Average fully-loaded cost
    standardBillingRate: 450.00, // Achieves ~45% margin
    targetMargin: 45,
    notes: "Starting values based on industry averages for CAT 265 equivalent equipment with 2-person crew. Will be refined through job performance feedback."
  },
  {
    serviceType: "Land Clearing",
    formulaUsed: "ClearingScore",
    description: "Heavy land clearing with excavator and support equipment",
    standardPPH: 0.8, // Industry average for clearing score
    standardCostPerHour: 385.00, // Higher cost due to larger equipment
    standardBillingRate: 700.00, // Achieves ~45% margin
    targetMargin: 45,
    notes: "Starting values for heavy clearing operations. Actual PPH varies significantly by vegetation density and site conditions."
  },
  {
    serviceType: "Stump Grinding",
    formulaUsed: "StumpScore",
    description: "Stump grinding services",
    standardPPH: 400, // 400 StumpScore points per hour
    standardCostPerHour: 165.00, // Lower cost, smaller crew
    standardBillingRate: 300.00, // Achieves ~45% margin
    targetMargin: 45,
    notes: "Starting values for standard stump grinding equipment with 1-2 person crew. PPH varies by stump size and access."
  },
  {
    serviceType: "Tree Removal",
    formulaUsed: "TreeScore",
    description: "Complete tree removal services",
    standardPPH: 250, // TreeScore points per hour
    standardCostPerHour: 285.00, // Climber + ground crew + equipment
    standardBillingRate: 520.00, // Achieves ~45% margin
    targetMargin: 45,
    notes: "Starting values for full-service tree removal with certified arborist. High variability based on tree access and complexity."
  },
  {
    serviceType: "Tree Trimming",
    formulaUsed: "TrimScore",
    description: "Tree trimming and pruning services",
    standardPPH: 180, // TrimScore points per hour
    standardCostPerHour: 235.00, // Climber + ground crew
    standardBillingRate: 425.00, // Achieves ~45% margin
    targetMargin: 45,
    notes: "Starting values for professional tree trimming. Actual rates depend on trim intensity and tree access."
  },
  {
    serviceType: "Brush Clearing",
    formulaUsed: "BrushScore",
    description: "Light brush and vegetation clearing",
    standardPPH: 2.5, // Higher PPH for lighter work
    standardCostPerHour: 145.00, // Smaller equipment, smaller crew
    standardBillingRate: 265.00, // Achieves ~45% margin
    targetMargin: 45,
    notes: "Starting values for light brush clearing with skid steer or similar. Much faster than heavy mulching."
  }
];

/**
 * Seed default service templates for an organization
 * This should be called once when an organization is created
 */
export const seedDefaultTemplates = mutation({
  args: {
    overwriteExisting: v.optional(v.boolean()), // If true, will update existing templates
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);
    const overwrite = args.overwriteExisting ?? false;

    const results = {
      created: [] as string[],
      updated: [] as string[],
      skipped: [] as string[],
    };

    for (const seed of DEFAULT_SERVICE_TEMPLATES) {
      // Check if template already exists
      const existing = await ctx.db
        .query("serviceTemplates")
        .withIndex("by_service_type", (q) =>
          q.eq("organizationId", orgId).eq("serviceType", seed.serviceType)
        )
        .first();

      if (existing && !overwrite) {
        results.skipped.push(seed.serviceType);
        continue;
      }

      const now = Date.now();
      const templateData = {
        organizationId: orgId,
        serviceType: seed.serviceType,
        formulaUsed: seed.formulaUsed,
        description: seed.description,
        standardPPH: seed.standardPPH,
        standardCostPerHour: seed.standardCostPerHour,
        standardLaborCost: seed.standardCostPerHour * 0.55, // Approximate split
        standardEquipmentCost: seed.standardCostPerHour * 0.35,
        standardOverhead: seed.standardCostPerHour * 0.10,
        standardBillingRate: seed.standardBillingRate,
        targetMargin: seed.targetMargin,
        lastRecalculated: now,
        totalJobsInAverage: 0,
        confidenceScore: 50, // Medium confidence for seed data
        isActive: true,
        notes: seed.notes,
        createdAt: now,
        updatedAt: now,
      };

      if (existing) {
        // Update existing template
        await ctx.db.patch(existing._id, {
          ...templateData,
          createdAt: existing.createdAt, // Preserve original creation date
        });
        results.updated.push(seed.serviceType);
      } else {
        // Create new template
        await ctx.db.insert("serviceTemplates", templateData);
        results.created.push(seed.serviceType);
      }
    }

    return {
      success: true,
      message: `Created ${results.created.length}, updated ${results.updated.length}, skipped ${results.skipped.length} service templates`,
      ...results,
    };
  },
});

/**
 * Seed a single custom service template
 */
export const seedCustomTemplate = mutation({
  args: {
    serviceType: v.string(),
    formulaUsed: v.string(),
    description: v.string(),
    standardPPH: v.number(),
    standardCostPerHour: v.number(),
    standardBillingRate: v.number(),
    targetMargin: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    // Check if template already exists
    const existing = await ctx.db
      .query("serviceTemplates")
      .withIndex("by_service_type", (q) =>
        q.eq("organizationId", orgId).eq("serviceType", args.serviceType)
      )
      .first();

    if (existing) {
      throw new Error(
        `Service template for ${args.serviceType} already exists. Use update instead.`
      );
    }

    const now = Date.now();

    const templateId = await ctx.db.insert("serviceTemplates", {
      organizationId: orgId,
      serviceType: args.serviceType,
      formulaUsed: args.formulaUsed,
      description: args.description,
      standardPPH: args.standardPPH,
      standardCostPerHour: args.standardCostPerHour,
      standardLaborCost: args.standardCostPerHour * 0.55,
      standardEquipmentCost: args.standardCostPerHour * 0.35,
      standardOverhead: args.standardCostPerHour * 0.10,
      standardBillingRate: args.standardBillingRate,
      targetMargin: args.targetMargin,
      lastRecalculated: now,
      totalJobsInAverage: 0,
      confidenceScore: 50,
      isActive: true,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      templateId,
      serviceType: args.serviceType,
    };
  },
});

/**
 * Calculate what billing rate is needed to achieve a target margin
 * Helper function for setting up templates
 */
export const calculateBillingRate = mutation({
  args: {
    costPerHour: v.number(),
    targetMarginPercent: v.number(), // e.g., 45 for 45%
  },
  handler: async (ctx, args) => {
    // Formula: BillingRate = Cost ÷ (1 - Margin%)
    const marginDecimal = args.targetMarginPercent / 100;
    const billingRate = args.costPerHour / (1 - marginDecimal);

    return {
      costPerHour: args.costPerHour,
      targetMargin: args.targetMarginPercent,
      billingRate: Math.round(billingRate * 100) / 100, // Round to 2 decimals
      profit: billingRate - args.costPerHour,
      actualMargin: ((billingRate - args.costPerHour) / billingRate) * 100,
    };
  },
});
