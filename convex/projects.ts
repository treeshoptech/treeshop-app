import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all projects for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .order("desc")
      .collect();
  },
});

// List projects by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", org._id).eq("status", args.status)
      )
      .collect();
  },
});

// Get single project
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const project = await ctx.db.get(args.id);

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify belongs to current organization
    if (project.organizationId !== org._id) {
      throw new Error("Project not found");
    }

    return project;
  },
});

// Create project
export const create = mutation({
  args: {
    name: v.string(),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    propertyAddress: v.string(),
    serviceType: v.string(),
    status: v.string(), // "Lead", "Proposal", "Work Order", "Invoice"
    leadStatus: v.optional(v.string()),
    leadSource: v.optional(v.string()),
    proposalStatus: v.optional(v.string()),
    workOrderStatus: v.optional(v.string()),
    invoiceStatus: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    estimatedValue: v.optional(v.number()),
    amountPaid: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const projectId = await ctx.db.insert("projects", {
      organizationId: org._id,
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Update project
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    status: v.optional(v.string()),
    leadStatus: v.optional(v.string()),
    leadSource: v.optional(v.string()),
    proposalStatus: v.optional(v.string()),
    workOrderStatus: v.optional(v.string()),
    invoiceStatus: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    estimatedValue: v.optional(v.number()),
    amountPaid: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const project = await ctx.db.get(id);

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify belongs to current organization
    if (project.organizationId !== org._id) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete project
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const project = await ctx.db.get(args.id);

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify belongs to current organization
    if (project.organizationId !== org._id) {
      throw new Error("Project not found");
    }

    await ctx.db.delete(args.id);
  },
});
