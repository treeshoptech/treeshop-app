import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// List all loadouts for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single loadout
export const get = query({
  args: { id: v.id("loadouts") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const loadout = await ctx.db.get(args.id);

    if (!loadout) {
      throw new Error("Loadout not found");
    }

    if (loadout.organizationId !== org._id) {
      throw new Error("Loadout not found");
    }

    return loadout;
  },
});

// Create loadout
export const create = mutation({
  args: {
    name: v.string(),
    serviceType: v.string(),
    equipmentIds: v.array(v.id("equipment")),
    employeeIds: v.array(v.id("employees")),
    productionRatePPH: v.number(),
    overheadCostPerHour: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const loadoutId = await ctx.db.insert("loadouts", {
      organizationId: org._id,
      ...args,
      overheadCostPerHour: args.overheadCostPerHour || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return loadoutId;
  },
});

// Update loadout
export const update = mutation({
  args: {
    id: v.id("loadouts"),
    name: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    equipmentIds: v.optional(v.array(v.id("equipment"))),
    employeeIds: v.optional(v.array(v.id("employees"))),
    productionRatePPH: v.optional(v.number()),
    overheadCostPerHour: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const loadout = await ctx.db.get(id);

    if (!loadout) {
      throw new Error("Loadout not found");
    }

    if (loadout.organizationId !== org._id) {
      throw new Error("Loadout not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete loadout
export const remove = mutation({
  args: { id: v.id("loadouts") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const loadout = await ctx.db.get(args.id);

    if (!loadout) {
      throw new Error("Loadout not found");
    }

    if (loadout.organizationId !== org._id) {
      throw new Error("Loadout not found");
    }

    await ctx.db.delete(args.id);
  },
});
