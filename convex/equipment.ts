import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all equipment for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("equipment")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single equipment item
export const get = query({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const equipment = await ctx.db.get(args.id);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify belongs to current organization
    if (equipment.organizationId !== org._id) {
      throw new Error("Equipment not found");
    }

    return equipment;
  },
});

// Create new equipment
export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    purchasePrice: v.number(),
    usefulLifeYears: v.number(),
    annualHours: v.number(),
    financeRate: v.optional(v.number()),
    insuranceCost: v.optional(v.number()),
    registrationCost: v.optional(v.number()),
    fuelConsumptionGPH: v.optional(v.number()),
    fuelPricePerGallon: v.optional(v.number()),
    maintenanceCostAnnual: v.optional(v.number()),
    repairCostAnnual: v.optional(v.number()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Only admins can create equipment
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    return await ctx.db.insert("equipment", {
      organizationId: org._id,
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update equipment
export const update = mutation({
  args: {
    id: v.id("equipment"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    usefulLifeYears: v.optional(v.number()),
    annualHours: v.optional(v.number()),
    financeRate: v.optional(v.number()),
    insuranceCost: v.optional(v.number()),
    registrationCost: v.optional(v.number()),
    fuelConsumptionGPH: v.optional(v.number()),
    fuelPricePerGallon: v.optional(v.number()),
    maintenanceCostAnnual: v.optional(v.number()),
    repairCostAnnual: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const equipment = await ctx.db.get(id);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify belongs to current organization
    if (equipment.organizationId !== org._id) {
      throw new Error("Equipment not found");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete equipment
export const remove = mutation({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const equipment = await ctx.db.get(args.id);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify belongs to current organization
    if (equipment.organizationId !== org._id) {
      throw new Error("Equipment not found");
    }

    await ctx.db.delete(args.id);
  },
});
