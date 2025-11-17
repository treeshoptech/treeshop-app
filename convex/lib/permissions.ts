import { QueryCtx, MutationCtx } from "../_generated/server";
import { getOrganization } from "./auth";
import { Id } from "../_generated/dataModel";

/**
 * Get the organization ID and ensure user has access
 * Throws if user is not authenticated or organization not found
 */
export async function requireOrganization(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"organizations">> {
  const org = await getOrganization(ctx);
  return org._id;
}

/**
 * Re-export auth functions for convenience
 */
export { getOrganization, requireAdmin, requireOwner, requireManager, getUserIdentity } from "./auth";
