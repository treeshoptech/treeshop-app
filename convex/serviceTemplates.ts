import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOrganization } from "./lib/permissions";

/**
 * TWO-TIER PRICING SYSTEM - SERVICE TEMPLATES (Tier 1)
 *
 * Service Templates are company-wide pricing standards that provide:
 * - Stable, consistent pricing for proposals
 * - Average PPH across all crews/jobs
 * - Standard billing rates with profit margins
 * - Automatic recalculation from historical performance
 */

// ============================================
// QUERIES
// ============================================

/**
 * Get all service templates for an organization
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const templates = await ctx.db
      .query("serviceTemplates")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .collect();

    return templates;
  },
});

/**
 * Get active service templates only
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const templates = await ctx.db
      .query("serviceTemplates")
      .withIndex("by_active", (q) => q.eq("organizationId", orgId).eq("isActive", true))
      .collect();

    return templates;
  },
});

/**
 * Get a specific service template by ID
 */
export const get = query({
  args: { id: v.id("serviceTemplates") },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== orgId) {
      throw new Error("Service template not found");
    }

    return template;
  },
});

/**
 * Get service template by service type
 */
export const getByServiceType = query({
  args: { serviceType: v.string() },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const template = await ctx.db
      .query("serviceTemplates")
      .withIndex("by_service_type", (q) =>
        q.eq("organizationId", orgId).eq("serviceType", args.serviceType)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return template;
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new service template
 */
export const create = mutation({
  args: {
    serviceType: v.string(),
    formulaUsed: v.string(),
    description: v.optional(v.string()),
    standardPPH: v.number(),
    standardCostPerHour: v.number(),
    standardLaborCost: v.optional(v.number()),
    standardEquipmentCost: v.optional(v.number()),
    standardOverhead: v.optional(v.number()),
    standardBillingRate: v.number(),
    targetMargin: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    // Check if template already exists for this service type
    const existing = await ctx.db
      .query("serviceTemplates")
      .withIndex("by_service_type", (q) =>
        q.eq("organizationId", orgId).eq("serviceType", args.serviceType)
      )
      .first();

    if (existing) {
      throw new Error(`Service template for ${args.serviceType} already exists. Use update instead.`);
    }

    const now = Date.now();

    const templateId = await ctx.db.insert("serviceTemplates", {
      organizationId: orgId,
      serviceType: args.serviceType,
      formulaUsed: args.formulaUsed,
      description: args.description,
      standardPPH: args.standardPPH,
      standardCostPerHour: args.standardCostPerHour,
      standardLaborCost: args.standardLaborCost,
      standardEquipmentCost: args.standardEquipmentCost,
      standardOverhead: args.standardOverhead,
      standardBillingRate: args.standardBillingRate,
      targetMargin: args.targetMargin,
      lastRecalculated: now,
      totalJobsInAverage: 0,
      confidenceScore: 0,
      isActive: true,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

/**
 * Update an existing service template
 */
export const update = mutation({
  args: {
    id: v.id("serviceTemplates"),
    serviceType: v.optional(v.string()),
    formulaUsed: v.optional(v.string()),
    description: v.optional(v.string()),
    standardPPH: v.optional(v.number()),
    standardCostPerHour: v.optional(v.number()),
    standardLaborCost: v.optional(v.number()),
    standardEquipmentCost: v.optional(v.number()),
    standardOverhead: v.optional(v.number()),
    standardBillingRate: v.optional(v.number()),
    targetMargin: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== orgId) {
      throw new Error("Service template not found");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Recalculate service template from historical performance records
 * This is the FEEDBACK LOOP that updates company-wide standards
 */
export const recalculateFromHistory = mutation({
  args: {
    id: v.id("serviceTemplates"),
    minJobsRequired: v.optional(v.number()), // Minimum jobs needed for recalc (default 5)
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);
    const minJobs = args.minJobsRequired ?? 5;

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== orgId) {
      throw new Error("Service template not found");
    }

    // Get all performance records for this service type that should be included
    const perfRecords = await ctx.db
      .query("performanceRecords")
      .withIndex("by_service_type", (q) =>
        q.eq("organizationId", orgId).eq("serviceType", template.serviceType)
      )
      .filter((q) => q.eq(q.field("includeInTemplateRecalc"), true))
      .collect();

    if (perfRecords.length < minJobs) {
      throw new Error(
        `Not enough historical data to recalculate. Need at least ${minJobs} jobs, have ${perfRecords.length}.`
      );
    }

    // Calculate averages
    const totalPPH = perfRecords.reduce((sum, r) => sum + r.actualPPH, 0);
    const avgPPH = totalPPH / perfRecords.length;

    const totalCost = perfRecords.reduce((sum, r) => sum + r.actualCost, 0);
    const totalHours = perfRecords.reduce((sum, r) => sum + r.actualTotalHours, 0);
    const avgCostPerHour = totalCost / totalHours;

    const totalProfit = perfRecords.reduce((sum, r) => sum + r.actualProfit, 0);
    const totalRevenue = perfRecords.reduce((sum, r) => sum + r.clientPrice, 0);
    const avgMargin = (totalProfit / totalRevenue) * 100;

    // Calculate billing rate to achieve target margin
    const targetMargin = template.targetMargin;
    const newBillingRate = avgCostPerHour / (1 - targetMargin / 100);

    // Calculate confidence score based on data volume and consistency
    const pphVariances = perfRecords.map(r => Math.abs(r.pphVariance));
    const avgVariance = pphVariances.reduce((sum, v) => sum + v, 0) / perfRecords.length;
    const consistencyScore = Math.max(0, 100 - (avgVariance / avgPPH) * 100);
    const volumeScore = Math.min(100, (perfRecords.length / 20) * 100); // Full confidence at 20+ jobs
    const confidenceScore = (consistencyScore + volumeScore) / 2;

    const now = Date.now();

    await ctx.db.patch(args.id, {
      standardPPH: avgPPH,
      standardCostPerHour: avgCostPerHour,
      standardBillingRate: newBillingRate,
      lastRecalculated: now,
      totalJobsInAverage: perfRecords.length,
      confidenceScore,
      updatedAt: now,
    });

    return {
      success: true,
      jobsAnalyzed: perfRecords.length,
      newPPH: avgPPH,
      newCostPerHour: avgCostPerHour,
      newBillingRate,
      achievedMargin: avgMargin,
      confidenceScore,
    };
  },
});

/**
 * Deactivate a service template
 */
export const deactivate = mutation({
  args: { id: v.id("serviceTemplates") },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== orgId) {
      throw new Error("Service template not found");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Activate a service template
 */
export const activate = mutation({
  args: { id: v.id("serviceTemplates") },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== orgId) {
      throw new Error("Service template not found");
    }

    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Delete a service template (soft delete by deactivating)
 */
export const remove = mutation({
  args: { id: v.id("serviceTemplates") },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== orgId) {
      throw new Error("Service template not found");
    }

    // Check if any projects are using this template
    const projectsUsingTemplate = await ctx.db
      .query("projects")
      .withIndex("by_service_template", (q) => q.eq("serviceTemplateId", args.id))
      .first();

    if (projectsUsingTemplate) {
      throw new Error(
        "Cannot delete service template that is being used by projects. Deactivate it instead."
      );
    }

    // Hard delete if no projects use it
    await ctx.db.delete(args.id);

    return args.id;
  },
});
