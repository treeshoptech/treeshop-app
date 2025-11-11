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

  const orgId = identity.orgId;
  if (!orgId) {
    throw new Error("No organization context. User must belong to an organization.");
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

  const role = identity.orgRole;
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
