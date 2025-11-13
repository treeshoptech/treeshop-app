import { Auth } from "convex/server";
import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Get the current user's identity from Clerk
 */
export async function getUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

/**
 * Get the current organization ID from the user's Clerk token
 */
export async function getOrganizationId(ctx: QueryCtx | MutationCtx) {
  const identity = await getUserIdentity(ctx);

  // Debug: Log all available claims
  console.log("Available identity claims:", Object.keys(identity));
  console.log("Full identity:", identity);

  // Try multiple possible claim names
  const orgId = (identity as any).org_id ||
                (identity as any).orgId ||
                (identity as any).organizationId ||
                (identity as any).organization_id;

  if (!orgId) {
    console.error("No org_id found in token. Available claims:", Object.keys(identity));
    // For development: Return a default org ID if none found in JWT
    // This allows local development without Clerk organization setup
    return "dev_default_org";
  }

  return orgId;
}

/**
 * Get the organization record from Convex by Clerk organization ID
 */
export async function getOrganization(ctx: QueryCtx | MutationCtx) {
  const clerkOrgId = await getOrganizationId(ctx);

  const org = await ctx.db
    .query("organizations")
    .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", clerkOrgId))
    .first();

  if (!org) {
    if (clerkOrgId === "dev_default_org") {
      throw new Error("Development organization not yet initialized. The app will automatically create it on first render.");
    }
    throw new Error("Organization not found in database. Please contact support.");
  }

  return org;
}

/**
 * Check if the user has one of the allowed roles
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: string[]
) {
  const identity = await getUserIdentity(ctx);

  // Clerk JWT tokens use 'org_role' in token claims
  const role = (identity as any).org_role;
  if (!role || !allowedRoles.includes(role)) {
    throw new Error(`Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`);
  }

  return { identity, role };
}

/**
 * Check if user is an owner
 */
export async function requireOwner(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, ["org:owner"]);
}

/**
 * Check if user is an owner or admin
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, ["org:owner", "org:admin"]);
}

/**
 * Check if user is owner, admin, or manager
 * NOTE: Simplified to just owner and admin (manager role merged into admin)
 */
export async function requireManager(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, ["org:owner", "org:admin"]);
}

/**
 * Get both the organization and user identity
 */
export async function getOrgAndIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await getUserIdentity(ctx);
  const organization = await getOrganization(ctx);

  return { identity, organization };
}
