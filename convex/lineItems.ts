import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all line items for a specific parent document
export const listByParent = query({
  args: {
    parentDocId: v.string(),
    parentDocType: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_parent_doc", (q) =>
        q.eq("parentDocId", args.parentDocId).eq("parentDocType", args.parentDocType)
      )
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// List all line items for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single line item
export const get = query({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    return lineItem;
  },
});

// Create new line item
export const create = mutation({
  args: {
    parentDocId: v.string(),
    parentDocType: v.string(),
    lineNumber: v.number(),
    // Service Details
    serviceType: v.string(),
    description: v.string(),
    // Scoring System
    formulaUsed: v.string(),
    workVolumeInputs: v.any(),
    baseScore: v.number(),
    complexityMultiplier: v.number(),
    adjustedScore: v.number(),
    // Loadout Assignment
    loadoutId: v.id("loadouts"),
    loadoutName: v.string(),
    productionRatePPH: v.number(),
    costPerHour: v.number(),
    billingRatePerHour: v.number(),
    targetMargin: v.number(),
    // Time Estimates
    productionHours: v.number(),
    transportHours: v.number(),
    bufferHours: v.number(),
    totalEstimatedHours: v.number(),
    // Pricing
    pricingMethod: v.string(),
    totalCost: v.number(),
    totalPrice: v.number(),
    profit: v.number(),
    marginPercent: v.number(),
    // Optional fields
    upsells: v.optional(v.array(v.object({
      upsellId: v.string(),
      description: v.string(),
      scoreAddition: v.number(),
      price: v.number(),
      selected: v.boolean(),
    }))),
    termsAndConditions: v.optional(v.array(v.string())),
    timeTrackingEnabled: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lineItemId = await ctx.db.insert("lineItems", {
      organizationId: org._id,
      ...args,
      timeTrackingEnabled: args.timeTrackingEnabled ?? false,
      status: args.status ?? "Pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return lineItemId;
  },
});

// Update line item
export const update = mutation({
  args: {
    id: v.id("lineItems"),
    // All fields optional for updates
    lineNumber: v.optional(v.number()),
    serviceType: v.optional(v.string()),
    description: v.optional(v.string()),
    formulaUsed: v.optional(v.string()),
    workVolumeInputs: v.optional(v.any()),
    baseScore: v.optional(v.number()),
    complexityMultiplier: v.optional(v.number()),
    adjustedScore: v.optional(v.number()),
    loadoutId: v.optional(v.id("loadouts")),
    loadoutName: v.optional(v.string()),
    productionRatePPH: v.optional(v.number()),
    costPerHour: v.optional(v.number()),
    billingRatePerHour: v.optional(v.number()),
    targetMargin: v.optional(v.number()),
    productionHours: v.optional(v.number()),
    transportHours: v.optional(v.number()),
    bufferHours: v.optional(v.number()),
    totalEstimatedHours: v.optional(v.number()),
    pricingMethod: v.optional(v.string()),
    totalCost: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    profit: v.optional(v.number()),
    marginPercent: v.optional(v.number()),
    upsells: v.optional(v.array(v.object({
      upsellId: v.string(),
      description: v.string(),
      scoreAddition: v.number(),
      price: v.number(),
      selected: v.boolean(),
    }))),
    timeTrackingEnabled: v.optional(v.boolean()),
    totalActualHours: v.optional(v.number()),
    varianceHours: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const lineItem = await ctx.db.get(id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete line item
export const remove = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Update time tracking data (called from work order)
export const updateTimeTracking = mutation({
  args: {
    id: v.id("lineItems"),
    totalActualHours: v.number(),
    varianceHours: v.number(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const lineItem = await ctx.db.get(id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Mark line item complete
export const markComplete = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(args.id, {
      status: "Completed",
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Get line items by loadout (for performance analysis)
export const listByLoadout = query({
  args: { loadoutId: v.id("loadouts") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_loadout", (q) => q.eq("loadoutId", args.loadoutId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// Get line items by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", org._id).eq("status", args.status)
      )
      .collect();
  },
});
