import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireOrganization } from "./lib/permissions";

/**
 * TASK DEFINITIONS API
 * CRUD operations for managing the 20 predefined task definitions
 */

/**
 * Get all task definitions for the organization
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const tasks = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .collect();

    // Sort by sortOrder
    return tasks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get active task definitions only
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const tasks = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_active", (q) =>
        q.eq("organizationId", orgId).eq("isActive", true)
      )
      .collect();

    // Sort by sortOrder
    return tasks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get tasks grouped by category
 */
export const getByCategory = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const tasks = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_active", (q) =>
        q.eq("organizationId", orgId).eq("isActive", true)
      )
      .collect();

    // Sort by sortOrder
    tasks.sort((a, b) => a.sortOrder - b.sortOrder);

    // Group by category
    const production = tasks.filter((t) => t.category === "Production");
    const siteSupport = tasks.filter((t) => t.category === "Site Support");
    const generalSupport = tasks.filter((t) => t.category === "General Support");

    return {
      production,
      siteSupport,
      generalSupport,
      all: tasks,
    };
  },
});

/**
 * Get field tasks only (Production + Site Support)
 */
export const getFieldTasks = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const tasks = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_field_task", (q) =>
        q.eq("organizationId", orgId).eq("isFieldTask", true)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Sort by sortOrder
    return tasks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get production tasks only (for PPH calculation)
 */
export const getProductionTasks = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const tasks = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_category", (q) =>
        q.eq("organizationId", orgId).eq("category", "Production")
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Sort by sortOrder
    return tasks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get a single task definition by ID
 */
export const getById = query({
  args: { id: v.id("taskDefinitions") },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task definition not found");
    }

    if (task.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    return task;
  },
});

/**
 * Update a task definition
 */
export const update = mutation({
  args: {
    id: v.id("taskDefinitions"),
    taskName: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("Production"),
        v.literal("Site Support"),
        v.literal("General Support")
      )
    ),
    isFieldTask: v.optional(v.boolean()),
    isBillable: v.optional(v.boolean()),
    countsForPPH: v.optional(v.boolean()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task definition not found");
    }

    if (task.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      taskId: args.id,
    };
  },
});

/**
 * Toggle task active status
 */
export const toggleActive = mutation({
  args: {
    id: v.id("taskDefinitions"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task definition not found");
    }

    if (task.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      isActive: !task.isActive,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      isActive: !task.isActive,
    };
  },
});

/**
 * Reorder tasks (bulk update sortOrder)
 */
export const reorder = mutation({
  args: {
    taskIds: v.array(v.id("taskDefinitions")),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    // Verify all tasks belong to this org
    for (const taskId of args.taskIds) {
      const task = await ctx.db.get(taskId);
      if (!task || task.organizationId !== orgId) {
        throw new Error("Unauthorized or task not found");
      }
    }

    // Update sortOrder based on array position
    const now = Date.now();
    for (let i = 0; i < args.taskIds.length; i++) {
      await ctx.db.patch(args.taskIds[i], {
        sortOrder: i + 1,
        updatedAt: now,
      });
    }

    return {
      success: true,
      updatedCount: args.taskIds.length,
    };
  },
});
