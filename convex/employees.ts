import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin, getUserIdentity } from "./lib/auth";
import {
  autoLinkByEmail,
  linkEmployeeToClerkUser,
  unlinkEmployee,
  getEmployeeForCurrentUser,
} from "./lib/employeeHelpers";

// List all employees for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single employee
export const get = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const employee = await ctx.db.get(args.id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Verify belongs to current organization
    if (employee.organizationId !== org._id) {
      throw new Error("Employee not found");
    }

    return employee;
  },
});

// Create new employee
export const create = mutation({
  args: {
    // Personal Information
    firstName: v.string(),
    lastName: v.string(),
    preferredName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneSecondary: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    address: v.optional(v.string()),
    // Emergency Contact
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    // Employment Details
    hireDate: v.number(),
    employeeId: v.optional(v.string()),
    employmentType: v.string(),
    employmentStatus: v.string(),
    homeBranch: v.optional(v.string()),
    reportsTo: v.optional(v.string()),
    // Career Track System
    primaryTrack: v.string(),
    tier: v.number(),
    yearsExperience: v.optional(v.number()),
    // Add-ons
    leadership: v.optional(v.string()),
    equipmentCerts: v.array(v.string()),
    driverLicenses: v.array(v.string()),
    certifications: v.array(v.string()),
    // Compensation
    baseHourlyRate: v.number(),
    // Other
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only admins can create employees
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    // Auto-link to Clerk user if email matches
    let clerkUserId: string | undefined = undefined;
    if (args.email) {
      const autoLinkedUserId = await autoLinkByEmail(ctx, args.email, org._id);
      if (autoLinkedUserId) {
        clerkUserId = autoLinkedUserId;
      }
    }

    return await ctx.db.insert("employees", {
      organizationId: org._id,
      ...args,
      clerkUserId,
      createdAt: Date.now(),
    });
  },
});

// Update employee
export const update = mutation({
  args: {
    id: v.id("employees"),
    // Personal Information
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    preferredName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneSecondary: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    address: v.optional(v.string()),
    // Emergency Contact
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    // Employment Details
    hireDate: v.optional(v.number()),
    employeeId: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    employmentStatus: v.optional(v.string()),
    homeBranch: v.optional(v.string()),
    reportsTo: v.optional(v.string()),
    // Career Track System
    primaryTrack: v.optional(v.string()),
    tier: v.optional(v.number()),
    yearsExperience: v.optional(v.number()),
    // Add-ons
    leadership: v.optional(v.string()),
    equipmentCerts: v.optional(v.array(v.string())),
    driverLicenses: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    // Compensation
    baseHourlyRate: v.optional(v.number()),
    // Other
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const employee = await ctx.db.get(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Verify belongs to current organization
    if (employee.organizationId !== org._id) {
      throw new Error("Employee not found");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete employee
export const remove = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const employee = await ctx.db.get(args.id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Verify belongs to current organization
    if (employee.organizationId !== org._id) {
      throw new Error("Employee not found");
    }

    await ctx.db.delete(args.id);
  },
});

// ============================================
// USER-EMPLOYEE LINKING QUERIES & MUTATIONS
// ============================================

/**
 * Get employee by Clerk user ID
 * Used to find employee record for a specific authenticated user
 */
export const getByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("employees")
      .withIndex("by_org_clerk_user", (q) =>
        q.eq("organizationId", org._id).eq("clerkUserId", args.clerkUserId)
      )
      .first();
  },
});

/**
 * Get current user's employee record
 * Returns null if authenticated user is not linked to an employee
 */
export const getCurrentUserEmployee = query({
  handler: async (ctx) => {
    return await getEmployeeForCurrentUser(ctx);
  },
});

/**
 * Get all employees WITHOUT Clerk user links
 * Admin only - for managing employee account linking
 */
export const getUnlinkedEmployees = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const allEmployees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Filter to only employees without clerkUserId
    return allEmployees.filter((emp) => !emp.clerkUserId);
  },
});

/**
 * Manually link an employee to a Clerk user
 * Admin only - for manual user account assignment
 */
export const linkToClerkUser = mutation({
  args: {
    employeeId: v.id("employees"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    await linkEmployeeToClerkUser(
      ctx,
      args.employeeId,
      args.clerkUserId,
      org._id
    );

    return { success: true };
  },
});

/**
 * Unlink an employee from their Clerk user account
 * Admin only - removes the connection between employee and user account
 */
export const unlinkFromClerkUser = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    await unlinkEmployee(ctx, args.employeeId, org._id);

    return { success: true };
  },
});
