import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getOrganization, getUserIdentity, requireAdmin } from "./lib/auth";

/**
 * Get the current user's organization
 */
export const getCurrent = query({
  handler: async (ctx) => {
    return await getOrganization(ctx);
  },
});

/**
 * Update organization settings (Admin+ only)
 */
export const update = mutation({
  args: {
    businessAddress: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    defaultMargin: v.optional(v.number()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    await ctx.db.patch(org._id, {
      businessAddress: args.businessAddress ?? org.businessAddress,
      coordinates: args.coordinates ?? org.coordinates,
      settings: {
        defaultMargin: args.defaultMargin ?? org.settings?.defaultMargin ?? 50,
        timezone: args.timezone ?? org.settings?.timezone ?? "America/New_York",
      },
    });

    return org._id;
  },
});

/**
 * Development-only mutation to ensure default org exists
 * This bypasses auth checks for local development setup
 */
export const ensureDevOrg = mutation({
  handler: async (ctx) => {
    const devOrgId = "dev_default_org";

    // Check if development organization already exists
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", devOrgId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create development organization
    return await ctx.db.insert("organizations", {
      clerkOrgId: devOrgId,
      name: "Development Organization",
      businessAddress: "123 Dev Street, New Smyrna Beach, FL 32168",
      coordinates: {
        lat: 29.0258,
        lng: -80.9270,
      },
      createdAt: Date.now(),
    });
  },
});

/**
 * Public mutation to sync organization from client
 * Use this to ensure your organization exists in Convex
 */
export const sync = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if organization already exists
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (existing) {
      // Update existing organization
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
      });
      return existing._id;
    }

    // Create new organization
    return await ctx.db.insert("organizations", {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
      createdAt: Date.now(),
    });
  },
});

/**
 * Internal mutation to sync organization from Clerk webhook
 * This is called when a new organization is created in Clerk
 */
export const syncFromClerk = internalMutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if organization already exists
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (existing) {
      // Update existing organization
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
      });
      return existing._id;
    }

    // Create new organization
    return await ctx.db.insert("organizations", {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
      createdAt: Date.now(),
    });
  },
});
