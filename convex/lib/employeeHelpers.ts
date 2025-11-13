/**
 * Employee-User Linking Helper Functions
 *
 * Provides utilities for linking Convex Employee records to Clerk user accounts
 * Auto-linking by email, manual linking, and unlinking operations
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Find Clerk user by email within the current organization
 *
 * Note: This is a placeholder - actual implementation would use Clerk's
 * Organizations API to fetch members. For now, we'll match via the token.
 */
export async function findClerkUserByEmail(
  ctx: QueryCtx | MutationCtx,
  email: string,
  organizationId: Id<"organizations">
): Promise<string | null> {
  // TODO: In production, call Clerk API:
  // const clerkOrgId = org.clerkOrgId;
  // const members = await fetch(`https://api.clerk.dev/v1/organizations/${clerkOrgId}/memberships`);
  // Find member by email and return their user ID

  // For now, check if there's already an employee with this Clerk user ID
  // This prevents duplicate links
  const existingLink = await ctx.db
    .query("employees")
    .withIndex("by_org_clerk_user", (q) =>
      q.eq("organizationId", organizationId)
    )
    .filter((q) => q.neq(q.field("clerkUserId"), undefined))
    .collect();

  // Return null for now (will be enhanced with actual Clerk API call)
  return null;
}

/**
 * Validate and link an employee to a Clerk user
 *
 * Ensures:
 * - Employee exists and belongs to current org
 * - Clerk user is not already linked to another employee in this org
 * - One-to-one mapping is maintained
 */
export async function linkEmployeeToClerkUser(
  ctx: MutationCtx,
  employeeId: Id<"employees">,
  clerkUserId: string,
  organizationId: Id<"organizations">
): Promise<void> {
  // Verify employee exists and belongs to org
  const employee = await ctx.db.get(employeeId);
  if (!employee || employee.organizationId !== organizationId) {
    throw new Error("Employee not found");
  }

  // Check if this Clerk user is already linked to another employee in this org
  const existingLink = await ctx.db
    .query("employees")
    .withIndex("by_org_clerk_user", (q) =>
      q.eq("organizationId", organizationId).eq("clerkUserId", clerkUserId)
    )
    .first();

  if (existingLink && existingLink._id !== employeeId) {
    throw new Error(`This user account is already linked to another employee: ${existingLink.firstName} ${existingLink.lastName}`);
  }

  // Link the employee to the Clerk user
  await ctx.db.patch(employeeId, {
    clerkUserId,
  });
}

/**
 * Unlink an employee from their Clerk user account
 * Admin-only operation
 */
export async function unlinkEmployee(
  ctx: MutationCtx,
  employeeId: Id<"employees">,
  organizationId: Id<"organizations">
): Promise<void> {
  // Verify employee exists and belongs to org
  const employee = await ctx.db.get(employeeId);
  if (!employee || employee.organizationId !== organizationId) {
    throw new Error("Employee not found");
  }

  if (!employee.clerkUserId) {
    throw new Error("Employee is not linked to a user account");
  }

  // Remove the link
  await ctx.db.patch(employeeId, {
    clerkUserId: undefined,
  });
}

/**
 * Auto-link employee by email when creating or updating
 *
 * Checks if email matches a Clerk org member and auto-populates clerkUserId
 * Returns the Clerk user ID if found, null otherwise
 */
export async function autoLinkByEmail(
  ctx: QueryCtx | MutationCtx,
  email: string | undefined,
  organizationId: Id<"organizations">
): Promise<string | null> {
  if (!email) {
    return null;
  }

  // Find Clerk user by email
  const clerkUserId = await findClerkUserByEmail(ctx, email, organizationId);

  if (clerkUserId) {
    // Verify this Clerk user isn't already linked to another employee
    const existingLink = await ctx.db
      .query("employees")
      .withIndex("by_org_clerk_user", (q) =>
        q.eq("organizationId", organizationId).eq("clerkUserId", clerkUserId)
      )
      .first();

    if (existingLink) {
      // Already linked to someone else - don't auto-link
      return null;
    }

    return clerkUserId;
  }

  return null;
}

/**
 * Get employee record for the current authenticated user
 * Returns null if user is not linked to an employee
 */
export async function getEmployeeForCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<any | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Get Clerk user ID from token
  const clerkUserId = identity.subject;

  // Get org ID from token
  const clerkOrgId = (identity as any).org_id;
  if (!clerkOrgId) {
    return null;
  }

  // Find organization
  const org = await ctx.db
    .query("organizations")
    .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", clerkOrgId))
    .first();

  if (!org) {
    return null;
  }

  // Find employee by Clerk user ID
  const employee = await ctx.db
    .query("employees")
    .withIndex("by_org_clerk_user", (q) =>
      q.eq("organizationId", org._id).eq("clerkUserId", clerkUserId)
    )
    .first();

  return employee;
}
