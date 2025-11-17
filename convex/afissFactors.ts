import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getOrganization } from "./lib/auth";

/**
 * AFISS Factors - Database-driven complexity factors
 * Replaced hard-coded system with dynamic database approach
 */

/**
 * Get all active AFISS factors (system-wide + organization-specific)
 */
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Get system factors (organizationId = null) and org-specific factors
    const factors = await ctx.db
      .query("afissFactors")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter for system factors and this org's custom factors
    return factors.filter(
      (f) => f.organizationId === undefined || f.organizationId === org._id
    );
  },
});

/**
 * Get AFISS factors for a specific service type
 */
export const getByServiceType = query({
  args: {
    serviceType: v.string(),
  },
  handler: async (ctx, args) => {
    const allFactors = await list(ctx, {});
    return allFactors.filter((f) =>
      f.applicableServiceTypes.includes(args.serviceType)
    );
  },
});

/**
 * Get factors grouped by category
 */
export const getGroupedByCategory = query({
  args: {
    serviceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const factors = args.serviceType
      ? await getByServiceType(ctx, { serviceType: args.serviceType })
      : await list(ctx, {});

    // Group by category
    const grouped: Record<string, typeof factors> = {};
    for (const factor of factors) {
      if (!grouped[factor.category]) {
        grouped[factor.category] = [];
      }
      grouped[factor.category].push(factor);
    }

    // Sort within each category by sortOrder
    for (const category in grouped) {
      grouped[category].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return grouped;
  },
});

/**
 * Calculate AFISS multiplier from selected factor IDs
 */
export const calculateMultiplier = query({
  args: {
    factorIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.factorIds || args.factorIds.length === 0) {
      return {
        multiplier: 1.0,
        totalImpact: 0,
        factorsApplied: [],
      };
    }

    const allFactors = await list(ctx, {});
    let totalImpact = 0;
    const factorsApplied = [];

    for (const factorId of args.factorIds) {
      const factor = allFactors.find((f) => f.factorId === factorId);
      if (factor) {
        totalImpact += factor.impactPercentage;
        factorsApplied.push({
          id: factor.factorId,
          name: factor.name,
          impact: factor.impactPercentage,
          category: factor.category,
        });
      }
    }

    return {
      multiplier: Math.round((1.0 + totalImpact) * 100) / 100,
      totalImpact: Math.round(totalImpact * 100) / 100,
      totalImpactPercent: Math.round(totalImpact * 100),
      factorsApplied,
    };
  },
});

/**
 * Get AFISS factor by factorId
 */
export const getByFactorId = query({
  args: {
    factorId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("afissFactors")
      .withIndex("by_factor_id", (q) => q.eq("factorId", args.factorId))
      .first();
  },
});

/**
 * Create a custom AFISS factor for an organization
 */
export const create = mutation({
  args: {
    factorId: v.string(),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    impactPercentage: v.number(),
    isPositive: v.boolean(),
    applicableServiceTypes: v.array(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Check if factor ID already exists
    const existing = await ctx.db
      .query("afissFactors")
      .withIndex("by_factor_id", (q) => q.eq("factorId", args.factorId))
      .first();

    if (existing) {
      throw new Error(
        `AFISS factor with ID "${args.factorId}" already exists`
      );
    }

    const now = Date.now();

    const id = await ctx.db.insert("afissFactors", {
      organizationId: org._id,
      factorId: args.factorId,
      name: args.name,
      category: args.category,
      description: args.description,
      impactPercentage: args.impactPercentage,
      isPositive: args.isPositive,
      applicableServiceTypes: args.applicableServiceTypes,
      icon: args.icon,
      sortOrder: 1000, // Custom factors go at the end
      isActive: true,
      isSystemFactor: false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  },
});

/**
 * Update a custom AFISS factor
 */
export const update = mutation({
  args: {
    factorId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    impactPercentage: v.optional(v.number()),
    applicableServiceTypes: v.optional(v.array(v.string())),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const factor = await ctx.db
      .query("afissFactors")
      .withIndex("by_factor_id", (q) => q.eq("factorId", args.factorId))
      .first();

    if (!factor) {
      throw new Error(`AFISS factor "${args.factorId}" not found`);
    }

    // Only allow updating custom factors (not system factors)
    if (factor.isSystemFactor) {
      throw new Error("Cannot modify system AFISS factors");
    }

    // Only allow updating own organization's factors
    if (factor.organizationId !== org._id) {
      throw new Error("Cannot modify another organization's AFISS factors");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.impactPercentage !== undefined)
      updates.impactPercentage = args.impactPercentage;
    if (args.applicableServiceTypes !== undefined)
      updates.applicableServiceTypes = args.applicableServiceTypes;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(factor._id, updates);

    return { success: true };
  },
});

/**
 * Delete a custom AFISS factor
 */
export const remove = mutation({
  args: {
    factorId: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const factor = await ctx.db
      .query("afissFactors")
      .withIndex("by_factor_id", (q) => q.eq("factorId", args.factorId))
      .first();

    if (!factor) {
      throw new Error(`AFISS factor "${args.factorId}" not found`);
    }

    // Cannot delete system factors
    if (factor.isSystemFactor) {
      throw new Error(
        "Cannot delete system AFISS factors. They can be deactivated instead."
      );
    }

    // Only allow deleting own organization's factors
    if (factor.organizationId !== org._id) {
      throw new Error("Cannot delete another organization's AFISS factors");
    }

    await ctx.db.delete(factor._id);

    return { success: true };
  },
});

/**
 * Increment usage count for AFISS factors
 */
export const incrementUsage = mutation({
  args: {
    factorIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    for (const factorId of args.factorIds) {
      const factor = await ctx.db
        .query("afissFactors")
        .withIndex("by_factor_id", (q) => q.eq("factorId", factorId))
        .first();

      if (factor) {
        await ctx.db.patch(factor._id, {
          usageCount: (factor.usageCount || 0) + 1,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// ============================================
// LEGACY COMPATIBILITY (Deprecated - use new database queries)
// ============================================

/**
 * @deprecated Use getGroupedByCategory instead
 */
export const listFactors = query({
  handler: async (ctx) => {
    const grouped = await getGroupedByCategory(ctx, {});
    return {
      access: grouped["Access"] || [],
      facilities: grouped["Facilities"] || [],
      irregularities: grouped["Irregularities"] || [],
      siteConditions: grouped["Site"] || [],
      safety: grouped["Safety"] || [],
    };
  },
});

/**
 * @deprecated Use calculateMultiplier instead
 */
export const calculateComplexity = query({
  args: {
    selectedFactorIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await calculateMultiplier(ctx, { factorIds: args.selectedFactorIds });
    return {
      multiplier: Math.max(result.multiplier, 0.5), // Min 0.5x
      totalImpact: result.totalImpact,
      selectedFactors: args.selectedFactorIds.length,
    };
  },
});

/**
 * @deprecated Use getByFactorId or list instead
 */
export const getFactorDetails = query({
  args: {
    factorIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const allFactors = await list(ctx, {});
    return args.factorIds
      .map((id) => allFactors.find((f) => f.factorId === id))
      .filter((f) => f !== undefined);
  },
});
