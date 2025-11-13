import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Seed default activity types for an organization
export const seedActivityTypes = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Check if activity types already exist for this organization
    const existing = await ctx.db
      .query("activityTypes")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (existing) {
      throw new Error("Activity types already seeded for this organization");
    }

    const now = Date.now();

    // PRODUCTION ACTIVITIES (Billable revenue work)
    const productionActivities = [
      {
        name: "Forestry Mulching",
        code: "FM",
        category: "PRODUCTION",
        subcategory: "Land Clearing",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: true,
        requiresCertification: "FM1",
        icon: "🌲",
        color: "#10B981",
        description: "Primary mulching operations clearing vegetation",
        sortOrder: 10,
      },
      {
        name: "Land Clearing - Heavy Equipment",
        code: "LC_HEAVY",
        category: "PRODUCTION",
        subcategory: "Land Clearing",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: true,
        requiresCertification: "LC1",
        icon: "🚜",
        color: "#10B981",
        description: "Heavy equipment land clearing operations",
        sortOrder: 20,
      },
      {
        name: "Stump Grinding",
        code: "STG",
        category: "PRODUCTION",
        subcategory: "Stump Removal",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: true,
        requiresCertification: "STG3",
        icon: "🪓",
        color: "#10B981",
        description: "Stump grinding and root removal",
        sortOrder: 30,
      },
      {
        name: "Tree Removal",
        code: "TR",
        category: "PRODUCTION",
        subcategory: "Tree Service",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: false,
        icon: "🪚",
        color: "#10B981",
        description: "Tree removal and cutting",
        sortOrder: 40,
      },
      {
        name: "Tree Trimming",
        code: "TT",
        category: "PRODUCTION",
        subcategory: "Tree Service",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: false,
        icon: "✂️",
        color: "#10B981",
        description: "Pruning and trimming trees",
        sortOrder: 50,
      },
      {
        name: "Brush Clearing",
        code: "BC",
        category: "PRODUCTION",
        subcategory: "Land Clearing",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: true,
        icon: "🌿",
        color: "#10B981",
        description: "Manual or mechanical brush clearing",
        sortOrder: 60,
      },
      {
        name: "Excavation",
        code: "EX",
        category: "PRODUCTION",
        subcategory: "Land Clearing",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: true,
        requiresCertification: "EX1",
        icon: "⛏️",
        color: "#10B981",
        description: "Excavation and grading work",
        sortOrder: 70,
      },
      {
        name: "Debris Removal",
        code: "DR",
        category: "PRODUCTION",
        subcategory: "Cleanup",
        isBillableDefault: true,
        isProductionDefault: true,
        requiresEquipment: false,
        icon: "🗑️",
        color: "#10B981",
        description: "Hauling and removing debris from site",
        sortOrder: 80,
      },
    ];

    // TRANSPORT ACTIVITIES (Moving equipment/materials)
    const transportActivities = [
      {
        name: "Transport with Equipment",
        code: "TRANS_EQ",
        category: "TRANSPORT",
        subcategory: "Equipment Transport",
        isBillableDefault: true, // Usually billed at 50% rate
        isProductionDefault: false,
        requiresEquipment: true,
        icon: "🚛",
        color: "#F59E0B",
        description: "Transporting equipment to/from job site",
        sortOrder: 100,
      },
      {
        name: "Transport without Equipment",
        code: "TRANS_NO_EQ",
        category: "TRANSPORT",
        subcategory: "Personal Transport",
        isBillableDefault: false, // Drive time usually not billable
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "🚗",
        color: "#F59E0B",
        description: "Driving to/from site without equipment",
        sortOrder: 110,
      },
      {
        name: "Material Pickup",
        code: "MAT_PICKUP",
        category: "TRANSPORT",
        subcategory: "Material Transport",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "📦",
        color: "#F59E0B",
        description: "Picking up materials or supplies",
        sortOrder: 120,
      },
    ];

    // SUPPORT ACTIVITIES (Unbillable operations)
    const supportActivities = [
      {
        name: "Shop Maintenance",
        code: "SHOP_MAINT",
        category: "SUPPORT",
        subcategory: "Facility Operations",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "🔧",
        color: "#6B7280",
        description: "Maintaining shop and facilities",
        sortOrder: 200,
      },
      {
        name: "Equipment Maintenance",
        code: "EQ_MAINT",
        category: "SUPPORT",
        subcategory: "Equipment Operations",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: true,
        icon: "⚙️",
        color: "#6B7280",
        description: "Servicing and repairing equipment",
        sortOrder: 210,
      },
      {
        name: "Equipment Cleaning",
        code: "EQ_CLEAN",
        category: "SUPPORT",
        subcategory: "Equipment Operations",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: true,
        icon: "🧹",
        color: "#6B7280",
        description: "Washing and cleaning equipment",
        sortOrder: 220,
      },
      {
        name: "Fueling",
        code: "FUEL",
        category: "SUPPORT",
        subcategory: "Equipment Operations",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: true,
        icon: "⛽",
        color: "#6B7280",
        description: "Refueling equipment",
        sortOrder: 230,
      },
      {
        name: "Training - Safety",
        code: "TRAIN_SAFETY",
        category: "SUPPORT",
        subcategory: "Training",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "🦺",
        color: "#6B7280",
        description: "Safety training and briefings",
        sortOrder: 240,
      },
      {
        name: "Training - Equipment",
        code: "TRAIN_EQ",
        category: "SUPPORT",
        subcategory: "Training",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: true,
        icon: "📚",
        color: "#6B7280",
        description: "Equipment operation training",
        sortOrder: 250,
      },
      {
        name: "Meetings - Crew",
        code: "MEET_CREW",
        category: "SUPPORT",
        subcategory: "Administrative",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "👥",
        color: "#6B7280",
        description: "Team meetings and coordination",
        sortOrder: 260,
      },
      {
        name: "Meetings - Client",
        code: "MEET_CLIENT",
        category: "SUPPORT",
        subcategory: "Administrative",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "🤝",
        color: "#6B7280",
        description: "Client consultations and walkthroughs",
        sortOrder: 270,
      },
      {
        name: "Site Assessment",
        code: "SITE_ASSESS",
        category: "SUPPORT",
        subcategory: "Administrative",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "🔍",
        color: "#6B7280",
        description: "Pre-job site assessment and planning",
        sortOrder: 280,
      },
      {
        name: "Estimating - On Site",
        code: "EST_ONSITE",
        category: "SUPPORT",
        subcategory: "Administrative",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "📊",
        color: "#6B7280",
        description: "On-site estimating and measurements",
        sortOrder: 290,
      },
      {
        name: "Administrative Work",
        code: "ADMIN",
        category: "SUPPORT",
        subcategory: "Administrative",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "📋",
        color: "#6B7280",
        description: "Office work, paperwork, invoicing",
        sortOrder: 300,
      },
      {
        name: "Breaks",
        code: "BREAK",
        category: "SUPPORT",
        subcategory: "Personal Time",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "☕",
        color: "#6B7280",
        description: "Rest breaks and lunch",
        sortOrder: 310,
      },
      {
        name: "Waiting - Weather",
        code: "WAIT_WEATHER",
        category: "SUPPORT",
        subcategory: "Delays",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "🌧️",
        color: "#6B7280",
        description: "Downtime due to weather",
        sortOrder: 320,
      },
      {
        name: "Waiting - Equipment",
        code: "WAIT_EQ",
        category: "SUPPORT",
        subcategory: "Delays",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "⏳",
        color: "#6B7280",
        description: "Downtime waiting for equipment",
        sortOrder: 330,
      },
      {
        name: "Other - Unbillable",
        code: "OTHER_UNBILL",
        category: "SUPPORT",
        subcategory: "Miscellaneous",
        isBillableDefault: false,
        isProductionDefault: false,
        requiresEquipment: false,
        icon: "❓",
        color: "#6B7280",
        description: "Other unbillable activities",
        sortOrder: 340,
      },
    ];

    const allActivities = [
      ...productionActivities,
      ...transportActivities,
      ...supportActivities,
    ];

    // Insert all activity types
    const insertedIds = [];
    for (const activity of allActivities) {
      const id = await ctx.db.insert("activityTypes", {
        organizationId: args.organizationId,
        ...activity,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }

    return {
      count: insertedIds.length,
      activityTypeIds: insertedIds,
    };
  },
});

// Get all activity types for an organization
export const listActivityTypes = query({
  args: {
    organizationId: v.id("organizations"),
    category: v.optional(v.string()), // Filter by category
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("activityTypes")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId));

    if (args.category) {
      query = ctx.db
        .query("activityTypes")
        .withIndex("by_category", (q) =>
          q.eq("organizationId", args.organizationId).eq("category", args.category)
        );
    }

    const activityTypes = await query.collect();

    // Sort by sortOrder
    return activityTypes.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Get active activity types only
export const listActiveActivityTypes = query({
  args: {
    organizationId: v.id("organizations"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("activityTypes")
      .withIndex("by_active", (q) =>
        q.eq("organizationId", args.organizationId).eq("isActive", true)
      );

    const activityTypes = await query.collect();

    // Filter by category if provided
    const filtered = args.category
      ? activityTypes.filter((at) => at.category === args.category)
      : activityTypes;

    // Sort by sortOrder
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Get single activity type by code
export const getActivityTypeByCode = query({
  args: {
    organizationId: v.id("organizations"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityTypes")
      .withIndex("by_code", (q) =>
        q.eq("organizationId", args.organizationId).eq("code", args.code)
      )
      .first();
  },
});
