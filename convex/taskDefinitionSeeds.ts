import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireOrganization } from "./lib/permissions";

/**
 * SIMPLIFIED TASK TRACKING SYSTEM - 20 PREDEFINED TASKS
 *
 * Three categories:
 * 1. Production (8 tasks) - Billable work that counts for PPH
 * 2. Site Support (4 tasks) - Billable work that does NOT count for PPH
 * 3. General Support (8 tasks) - Non-billable, non-field work
 */

interface TaskDefinitionSeed {
  taskName: string;
  category: "Production" | "Site Support" | "General Support";
  isFieldTask: boolean; // true for Production & Site Support
  isBillable: boolean;
  countsForPPH: boolean; // Only Production tasks
  icon?: string;
  color?: string;
  description?: string;
  sortOrder: number;
}

const DEFAULT_TASK_DEFINITIONS: TaskDefinitionSeed[] = [
  // ========================================
  // PRODUCTION TASKS (8) - Billable + Counts for PPH
  // ========================================
  {
    taskName: "Mulching",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "🌲",
    color: "#2e7d32", // Green
    description: "Forestry mulching operations",
    sortOrder: 1,
  },
  {
    taskName: "Land Clearing",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "🚜",
    color: "#f57c00", // Orange
    description: "Heavy land clearing with excavator",
    sortOrder: 2,
  },
  {
    taskName: "Tree Removal",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "🪓",
    color: "#c62828", // Red
    description: "Complete tree removal services",
    sortOrder: 3,
  },
  {
    taskName: "Tree Trimming",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "✂️",
    color: "#558b2f", // Light green
    description: "Tree trimming and pruning",
    sortOrder: 4,
  },
  {
    taskName: "Stump Grinding",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "⚙️",
    color: "#6d4c41", // Brown
    description: "Stump grinding services",
    sortOrder: 5,
  },
  {
    taskName: "Debris Processing",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "♻️",
    color: "#00796b", // Teal
    description: "Processing and removing debris",
    sortOrder: 6,
  },
  {
    taskName: "Site Cleanup",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "🧹",
    color: "#0277bd", // Blue
    description: "Final site cleanup and restoration",
    sortOrder: 7,
  },
  {
    taskName: "Chipping",
    category: "Production",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: true,
    icon: "🪚",
    color: "#5d4037", // Dark brown
    description: "Wood chipping operations",
    sortOrder: 8,
  },

  // ========================================
  // SITE SUPPORT TASKS (4) - Billable but NOT for PPH
  // ========================================
  {
    taskName: "Site Assessment",
    category: "Site Support",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: false,
    icon: "📋",
    color: "#455a64", // Blue grey
    description: "Initial site assessment and planning",
    sortOrder: 9,
  },
  {
    taskName: "Equipment Setup",
    category: "Site Support",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: false,
    icon: "🔧",
    color: "#546e7a", // Light blue grey
    description: "Setting up equipment at job site",
    sortOrder: 10,
  },
  {
    taskName: "Customer Consultation",
    category: "Site Support",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: false,
    icon: "💬",
    color: "#7b1fa2", // Purple
    description: "On-site customer communication",
    sortOrder: 11,
  },
  {
    taskName: "General Support",
    category: "Site Support",
    isFieldTask: true,
    isBillable: true,
    countsForPPH: false,
    icon: "🛠️",
    color: "#616161", // Grey
    description: "General site support activities",
    sortOrder: 12,
  },

  // ========================================
  // GENERAL SUPPORT TASKS (8) - Non-billable
  // ========================================
  {
    taskName: "Travel",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "🚗",
    color: "#37474f", // Dark grey
    description: "Travel to/from job site",
    sortOrder: 13,
  },
  {
    taskName: "Loading/Unloading",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "📦",
    color: "#424242", // Darker grey
    description: "Loading and unloading equipment",
    sortOrder: 14,
  },
  {
    taskName: "Fueling",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "⛽",
    color: "#bf360c", // Deep orange
    description: "Fueling equipment and vehicles",
    sortOrder: 15,
  },
  {
    taskName: "Maintenance",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "🔩",
    color: "#e65100", // Orange
    description: "Equipment maintenance and repairs",
    sortOrder: 16,
  },
  {
    taskName: "Shop Work",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "🏭",
    color: "#4e342e", // Brown grey
    description: "Shop organization and prep work",
    sortOrder: 17,
  },
  {
    taskName: "Office Work",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "💼",
    color: "#263238", // Dark blue grey
    description: "Office tasks and administration",
    sortOrder: 18,
  },
  {
    taskName: "Training",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "📚",
    color: "#1565c0", // Blue
    description: "Training and skill development",
    sortOrder: 19,
  },
  {
    taskName: "Break/Lunch",
    category: "General Support",
    isFieldTask: false,
    isBillable: false,
    countsForPPH: false,
    icon: "☕",
    color: "#795548", // Brown
    description: "Break time and lunch",
    sortOrder: 20,
  },
];

/**
 * Seed the 20 default task definitions for an organization
 * This should be called once when an organization is created
 */
export const seedDefaultTasks = mutation({
  args: {
    overwriteExisting: v.optional(v.boolean()), // If true, will update existing tasks
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);
    const overwrite = args.overwriteExisting ?? false;

    const results = {
      created: [] as string[],
      updated: [] as string[],
      skipped: [] as string[],
    };

    for (const seed of DEFAULT_TASK_DEFINITIONS) {
      // Check if task already exists
      const existing = await ctx.db
        .query("taskDefinitions")
        .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
        .filter((q) => q.eq(q.field("taskName"), seed.taskName))
        .first();

      if (existing && !overwrite) {
        results.skipped.push(seed.taskName);
        continue;
      }

      const now = Date.now();
      const taskData = {
        organizationId: orgId,
        taskName: seed.taskName,
        category: seed.category,
        isFieldTask: seed.isFieldTask,
        isBillable: seed.isBillable,
        countsForPPH: seed.countsForPPH,
        icon: seed.icon,
        color: seed.color,
        description: seed.description,
        sortOrder: seed.sortOrder,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      if (existing) {
        // Update existing task
        await ctx.db.patch(existing._id, {
          ...taskData,
          createdAt: existing.createdAt, // Preserve original creation date
        });
        results.updated.push(seed.taskName);
      } else {
        // Create new task
        await ctx.db.insert("taskDefinitions", taskData);
        results.created.push(seed.taskName);
      }
    }

    return {
      success: true,
      message: `Created ${results.created.length}, updated ${results.updated.length}, skipped ${results.skipped.length} task definitions`,
      ...results,
    };
  },
});

/**
 * Seed a single custom task definition
 */
export const seedCustomTask = mutation({
  args: {
    taskName: v.string(),
    category: v.union(
      v.literal("Production"),
      v.literal("Site Support"),
      v.literal("General Support")
    ),
    isFieldTask: v.boolean(),
    isBillable: v.boolean(),
    countsForPPH: v.boolean(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    // Check if task already exists
    const existing = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .filter((q) => q.eq(q.field("taskName"), args.taskName))
      .first();

    if (existing) {
      throw new Error(
        `Task definition for ${args.taskName} already exists. Use update instead.`
      );
    }

    const now = Date.now();

    // Auto-determine sortOrder if not provided
    let sortOrder = args.sortOrder;
    if (!sortOrder) {
      const allTasks = await ctx.db
        .query("taskDefinitions")
        .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
        .collect();
      sortOrder = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.sortOrder)) + 1 : 100;
    }

    const taskId = await ctx.db.insert("taskDefinitions", {
      organizationId: orgId,
      taskName: args.taskName,
      category: args.category,
      isFieldTask: args.isFieldTask,
      isBillable: args.isBillable,
      countsForPPH: args.countsForPPH,
      icon: args.icon,
      color: args.color,
      description: args.description,
      sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      taskId,
      taskName: args.taskName,
    };
  },
});

/**
 * Get all active task definitions, grouped by category
 */
export const getTasksByCategory = mutation({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganization(ctx);

    const tasks = await ctx.db
      .query("taskDefinitions")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
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
