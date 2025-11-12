import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all leads (projects with status "Lead") for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    const leads = await ctx.db
      .query("projects")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", org._id).eq("status", "Lead")
      )
      .collect();

    // Fetch customer data for each lead
    const leadsWithCustomers = await Promise.all(
      leads.map(async (lead) => {
        const customer = await ctx.db.get(lead.customerId);
        return {
          ...lead,
          customer,
        };
      })
    );

    return leadsWithCustomers;
  },
});

// Get single lead
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lead = await ctx.db.get(args.id);

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify belongs to current organization
    if (lead.organizationId !== org._id) {
      throw new Error("Lead not found");
    }

    // Verify is a lead
    if (lead.status !== "Lead") {
      throw new Error("Project is not a lead");
    }

    const customer = await ctx.db.get(lead.customerId);

    return {
      ...lead,
      customer,
    };
  },
});

// Create new lead
export const create = mutation({
  args: {
    customerId: v.id("customers"),
    serviceType: v.string(),
    propertyAddress: v.string(),
    driveTimeMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Verify customer belongs to organization
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.organizationId !== org._id) {
      throw new Error("Customer not found");
    }

    const now = Date.now();

    return await ctx.db.insert("projects", {
      organizationId: org._id,
      customerId: args.customerId,
      serviceType: args.serviceType,
      status: "Lead",
      propertyAddress: args.propertyAddress,
      driveTimeMinutes: args.driveTimeMinutes,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update lead
export const update = mutation({
  args: {
    id: v.id("projects"),
    serviceType: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    driveTimeMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const lead = await ctx.db.get(id);

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify belongs to current organization
    if (lead.organizationId !== org._id) {
      throw new Error("Lead not found");
    }

    // Verify is still a lead
    if (lead.status !== "Lead") {
      throw new Error("Project is no longer a lead");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete lead
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lead = await ctx.db.get(args.id);

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify belongs to current organization
    if (lead.organizationId !== org._id) {
      throw new Error("Lead not found");
    }

    // Verify is a lead
    if (lead.status !== "Lead") {
      throw new Error("Can only delete projects in Lead status");
    }

    await ctx.db.delete(args.id);
  },
});

// Convert lead to proposal
export const convertToProposal = mutation({
  args: {
    id: v.id("projects"),
    treeShopScore: v.optional(v.number()),
    afissMultiplier: v.optional(v.number()),
    afissFactors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lead = await ctx.db.get(args.id);

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify belongs to current organization
    if (lead.organizationId !== org._id) {
      throw new Error("Lead not found");
    }

    // Verify is a lead
    if (lead.status !== "Lead") {
      throw new Error("Project is not a lead");
    }

    // Update to Proposal status
    await ctx.db.patch(args.id, {
      status: "Proposal",
      treeShopScore: args.treeShopScore,
      afissMultiplier: args.afissMultiplier,
      afissFactors: args.afissFactors,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
