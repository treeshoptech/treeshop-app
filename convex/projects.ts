import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// List all projects for current organization
export const listAll = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
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
