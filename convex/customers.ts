import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// List all customers for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("customers")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single customer
export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const customer = await ctx.db.get(args.id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Verify belongs to current organization
    if (customer.organizationId !== org._id) {
      throw new Error("Customer not found");
    }

    return customer;
  },
});

// Create new customer
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.string(),
    propertyCity: v.optional(v.string()),
    propertyState: v.optional(v.string()),
    propertyZip: v.optional(v.string()),
    billingAddress: v.optional(v.string()),
    billingCity: v.optional(v.string()),
    billingState: v.optional(v.string()),
    billingZip: v.optional(v.string()),
    source: v.optional(v.string()),
    referredBy: v.optional(v.string()),
    customerType: v.optional(v.string()),
    preferredContactMethod: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db.insert("customers", {
      organizationId: org._id,
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update customer
export const update = mutation({
  args: {
    id: v.id("customers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    propertyCity: v.optional(v.string()),
    propertyState: v.optional(v.string()),
    propertyZip: v.optional(v.string()),
    billingAddress: v.optional(v.string()),
    billingCity: v.optional(v.string()),
    billingState: v.optional(v.string()),
    billingZip: v.optional(v.string()),
    source: v.optional(v.string()),
    referredBy: v.optional(v.string()),
    customerType: v.optional(v.string()),
    preferredContactMethod: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const customer = await ctx.db.get(id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Verify belongs to current organization
    if (customer.organizationId !== org._id) {
      throw new Error("Customer not found");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete customer
export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const customer = await ctx.db.get(args.id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Verify belongs to current organization
    if (customer.organizationId !== org._id) {
      throw new Error("Customer not found");
    }

    // Check if customer has any projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_org_customer", (q) =>
        q.eq("organizationId", org._id).eq("customerId", args.id)
      )
      .first();

    if (projects) {
      throw new Error("Cannot delete customer with existing projects");
    }

    await ctx.db.delete(args.id);
  },
});
