"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Role-based access control hook
 *
 * Determines user's role and permissions based on:
 * 1. Clerk organization role (org:owner, org:admin, org:member)
 * 2. Employee record linkage (whether user is linked to an employee)
 *
 * Usage:
 * const { isAdmin, isEmployee, employee, loading } = useUserRole();
 *
 * Returns:
 * - role: Clerk organization role
 * - isOwner: Boolean - user is organization owner
 * - isAdmin: Boolean - user is owner or admin
 * - isEmployee: Boolean - user is linked to an employee record
 * - employee: Employee record or null
 * - loading: Boolean - still fetching data
 */
export function useUserRole() {
  const { membership, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  // Get employee record for current user (only if user is loaded)
  const employee = useQuery(
    api.employees.getCurrentUserEmployee,
    userLoaded && user ? undefined : "skip"
  );

  // Get Clerk organization role
  const orgRole = membership?.role || "org:member";

  return {
    // Clerk role
    role: orgRole,

    // Admin permissions (owner or admin)
    isOwner: orgRole === "org:owner",
    isAdmin: orgRole === "org:admin" || orgRole === "org:owner",

    // Employee status (linked to employee record)
    isEmployee: employee !== null && employee !== undefined,

    // Employee record
    employee: employee || null,

    // Loading state
    loading: !orgLoaded || !userLoaded || employee === undefined,

    // User info
    userId: user?.id,
    userEmail: user?.primaryEmailAddress?.emailAddress,
  };
}
