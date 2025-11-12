import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// List all line item templates for organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItemTemplates")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// List by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItemTemplates")
      .withIndex("by_org_category", (q) =>
        q.eq("organizationId", org._id).eq("category", args.category)
      )
      .collect();
  },
});

// List by service type
export const listByService = query({
  args: { serviceType: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItemTemplates")
      .withIndex("by_org_service", (q) =>
        q.eq("organizationId", org._id).eq("serviceType", args.serviceType)
      )
      .collect();
  },
});

// Get single template
export const get = query({
  args: { id: v.id("lineItemTemplates") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const template = await ctx.db.get(args.id);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.organizationId !== org._id) {
      throw new Error("Template not found");
    }

    return template;
  },
});

// Create template
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    serviceType: v.optional(v.string()),
    defaultUnit: v.string(),
    defaultUnitPrice: v.number(),
    defaultQuantity: v.optional(v.number()),
    costPerUnit: v.optional(v.number()),
    defaultMargin: v.optional(v.number()),
    afissFactorIds: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const templateId = await ctx.db.insert("lineItemTemplates", {
      organizationId: org._id,
      ...args,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

// Update template
export const update = mutation({
  args: {
    id: v.id("lineItemTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    defaultUnit: v.optional(v.string()),
    defaultUnitPrice: v.optional(v.number()),
    defaultQuantity: v.optional(v.number()),
    costPerUnit: v.optional(v.number()),
    defaultMargin: v.optional(v.number()),
    afissFactorIds: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const template = await ctx.db.get(id);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.organizationId !== org._id) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Increment usage count
export const incrementUsage = mutation({
  args: { id: v.id("lineItemTemplates") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const template = await ctx.db.get(args.id);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.organizationId !== org._id) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.id, {
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: Date.now(),
    });
  },
});

// Delete template
export const remove = mutation({
  args: { id: v.id("lineItemTemplates") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const template = await ctx.db.get(args.id);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.organizationId !== org._id) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.id);
  },
});
