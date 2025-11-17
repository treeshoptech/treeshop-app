import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOrganization } from "./lib/permissions";

/**
 * TIME TRACKING API - Task Switching System
 *
 * Mobile-first time tracking with single-tap task switching:
 * - Stop current active task
 * - Start new task
 * - Capture GPS location
 * - Calculate duration
 * - Track billable vs non-billable
 * - Track Production vs Support for PPH calculations
 */

/**
 * Get active time entry for an employee (currently clocked in)
 */
export const getActiveEntry = query({
  args: {
    employeeId: v.id("employees"),
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const activeEntry = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("employeeId"), args.employeeId),
          q.eq(q.field("status"), "ACTIVE")
        )
      )
      .first();

    return activeEntry;
  },
});

/**
 * Start a new task (clock in or switch tasks)
 *
 * This is an ATOMIC operation:
 * 1. If employee has active entry, stop it
 * 2. Create new entry for the selected task
 * 3. Capture GPS location
 */
export const startTask = mutation({
  args: {
    employeeId: v.id("employees"),
    workOrderId: v.id("workOrders"),
    taskDefinitionId: v.id("taskDefinitions"),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
        accuracy: v.optional(v.number()),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);
    const now = Date.now();

    // Get employee info for denormalization
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.organizationId !== orgId) {
      throw new Error("Employee not found");
    }

    // Get task definition
    const taskDef = await ctx.db.get(args.taskDefinitionId);
    if (!taskDef || taskDef.organizationId !== orgId) {
      throw new Error("Task definition not found");
    }

    // Get work order info
    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder || workOrder.organizationId !== orgId) {
      throw new Error("Work order not found");
    }

    // STEP 1: Stop any active entry for this employee on this work order
    const activeEntry = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("employeeId"), args.employeeId),
          q.eq(q.field("status"), "ACTIVE")
        )
      )
      .first();

    if (activeEntry) {
      const duration = now - activeEntry.startTime;
      const durationMinutes = Math.round(duration / 1000 / 60);
      const durationHours = durationMinutes / 60;

      await ctx.db.patch(activeEntry._id, {
        endTime: now,
        durationMinutes,
        durationHours,
        status: "COMPLETED",
        locationEnd: args.location,
        updatedAt: now,
      });
    }

    // STEP 2: Create new time entry for the selected task
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const employeeCode = `${employee.primaryTrack}${employee.tier}`;

    // Determine activity category based on task category
    let activityCategory: "PRODUCTION" | "TRANSPORT" | "SUPPORT";
    if (taskDef.category === "Production") {
      activityCategory = "PRODUCTION";
    } else if (taskDef.category === "Site Support") {
      activityCategory = "SUPPORT";
    } else {
      activityCategory = "SUPPORT"; // General Support
    }

    const newEntryId = await ctx.db.insert("timeEntries", {
      organizationId: orgId,
      workOrderId: args.workOrderId,
      projectId: workOrder.projectId,
      serviceType: workOrder.serviceType,

      // Employee
      employeeId: args.employeeId,
      employeeCode,
      employeeName,
      loadoutId: workOrder.primaryLoadoutId,

      // Task-based tracking
      taskDefinitionId: args.taskDefinitionId,
      taskName: taskDef.taskName,
      taskCategory: taskDef.category,

      // Activity classification
      activityCategory,
      billable: taskDef.isBillable,
      isProduction: taskDef.category === "Production",
      countsForPPH: taskDef.countsForPPH,

      // Time data
      startTime: now,
      status: "ACTIVE",

      // GPS location
      locationStart: args.location,

      // Cost tracking (snapshot from employee)
      employeeHourlyRate: employee.baseHourlyRate,
      employeeBurdenMultiplier: 1.7, // Standard burden

      // Documentation
      notes: args.notes,

      // Tracking metadata
      recordedBy: "Employee",
      recordedMethod: "Mobile App",
      timestampRecorded: now,

      createdAt: now,
    });

    return {
      success: true,
      stoppedEntryId: activeEntry?._id,
      newEntryId,
      taskName: taskDef.taskName,
      taskCategory: taskDef.category,
      isBillable: taskDef.isBillable,
      countsForPPH: taskDef.countsForPPH,
    };
  },
});

/**
 * Stop current task (clock out)
 */
export const stopTask = mutation({
  args: {
    employeeId: v.id("employees"),
    workOrderId: v.id("workOrders"),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
        accuracy: v.optional(v.number()),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);
    const now = Date.now();

    // Find active entry
    const activeEntry = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("employeeId"), args.employeeId),
          q.eq(q.field("status"), "ACTIVE")
        )
      )
      .first();

    if (!activeEntry) {
      throw new Error("No active time entry found");
    }

    // Calculate duration
    const duration = now - activeEntry.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60);
    const durationHours = durationMinutes / 60;

    // Calculate costs
    const laborCost =
      durationHours *
      (activeEntry.employeeHourlyRate || 0) *
      (activeEntry.employeeBurdenMultiplier || 1.7);

    // Update the entry
    await ctx.db.patch(activeEntry._id, {
      endTime: now,
      durationMinutes,
      durationHours,
      status: "COMPLETED",
      locationEnd: args.location,
      laborCost,
      totalCost: laborCost, // Equipment cost added later if needed
      notes: args.notes
        ? `${activeEntry.notes || ""}\n${args.notes}`.trim()
        : activeEntry.notes,
      updatedAt: now,
    });

    return {
      success: true,
      entryId: activeEntry._id,
      taskName: activeEntry.taskName,
      durationHours,
      laborCost,
    };
  },
});

/**
 * Get all time entries for a work order
 */
export const getWorkOrderEntries = query({
  args: {
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .collect();

    // Sort by start time
    return entries.sort((a, b) => a.startTime - b.startTime);
  },
});

/**
 * Get time entries for an employee on a work order
 */
export const getEmployeeEntries = query({
  args: {
    employeeId: v.id("employees"),
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => q.eq(q.field("employeeId"), args.employeeId))
      .collect();

    // Sort by start time
    return entries.sort((a, b) => a.startTime - b.startTime);
  },
});

/**
 * Get summary of time entries grouped by task
 */
export const getTaskSummary = query({
  args: {
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => q.eq(q.field("status"), "COMPLETED"))
      .collect();

    // Group by task
    const taskSummary: Record<
      string,
      {
        taskName: string;
        category: string;
        totalHours: number;
        totalCost: number;
        entryCount: number;
        isBillable: boolean;
        countsForPPH: boolean;
      }
    > = {};

    for (const entry of entries) {
      const taskName = entry.taskName || "Unknown";

      if (!taskSummary[taskName]) {
        taskSummary[taskName] = {
          taskName,
          category: entry.taskCategory || "Unknown",
          totalHours: 0,
          totalCost: 0,
          entryCount: 0,
          isBillable: entry.billable,
          countsForPPH: entry.countsForPPH || false,
        };
      }

      taskSummary[taskName].totalHours += entry.durationHours || 0;
      taskSummary[taskName].totalCost += entry.totalCost || 0;
      taskSummary[taskName].entryCount += 1;
    }

    return Object.values(taskSummary);
  },
});

/**
 * Get total production hours for PPH calculation
 */
export const getProductionHours = query({
  args: {
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const productionEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("countsForPPH"), true),
          q.eq(q.field("status"), "COMPLETED")
        )
      )
      .collect();

    const totalProductionHours = productionEntries.reduce(
      (sum, entry) => sum + (entry.durationHours || 0),
      0
    );

    return {
      totalProductionHours,
      entryCount: productionEntries.length,
    };
  },
});
