import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all line items for a specific parent document
export const listByParent = query({
  args: {
    parentDocId: v.string(),
    parentDocType: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_parent_doc", (q) =>
        q.eq("parentDocId", args.parentDocId).eq("parentDocType", args.parentDocType)
      )
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// List all line items for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single line item
export const get = query({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    return lineItem;
  },
});

// Create new line item
export const create = mutation({
  args: {
    parentDocId: v.string(),
    parentDocType: v.string(),
    lineNumber: v.number(),
    // Service Details
    serviceType: v.string(),
    description: v.string(),
    // Scoring System
    formulaUsed: v.string(),
    workVolumeInputs: v.any(),
    baseScore: v.number(),
    complexityMultiplier: v.number(),
    adjustedScore: v.number(),
    // Loadout Assignment
    loadoutId: v.id("loadouts"),
    loadoutName: v.string(),
    productionRatePPH: v.number(),
    costPerHour: v.number(),
    billingRatePerHour: v.number(),
    targetMargin: v.number(),
    // Time Estimates
    productionHours: v.number(),
    transportHours: v.number(),
    bufferHours: v.number(),
    totalEstimatedHours: v.number(),
    // Pricing
    pricingMethod: v.string(),
    totalCost: v.number(),
    totalPrice: v.number(),
    profit: v.number(),
    marginPercent: v.number(),
    // Optional fields
    upsells: v.optional(v.array(v.object({
      upsellId: v.string(),
      description: v.string(),
      scoreAddition: v.number(),
      price: v.number(),
      selected: v.boolean(),
    }))),
    termsAndConditions: v.optional(v.array(v.string())),
    timeTrackingEnabled: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lineItemId = await ctx.db.insert("lineItems", {
      organizationId: org._id,
      ...args,
      timeTrackingEnabled: args.timeTrackingEnabled ?? false,
      status: args.status ?? "Pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return lineItemId;
  },
});

// Update line item
export const update = mutation({
  args: {
    id: v.id("lineItems"),
    // All fields optional for updates
    lineNumber: v.optional(v.number()),
    serviceType: v.optional(v.string()),
    description: v.optional(v.string()),
    formulaUsed: v.optional(v.string()),
    workVolumeInputs: v.optional(v.any()),
    baseScore: v.optional(v.number()),
    complexityMultiplier: v.optional(v.number()),
    adjustedScore: v.optional(v.number()),
    loadoutId: v.optional(v.id("loadouts")),
    loadoutName: v.optional(v.string()),
    productionRatePPH: v.optional(v.number()),
    costPerHour: v.optional(v.number()),
    billingRatePerHour: v.optional(v.number()),
    targetMargin: v.optional(v.number()),
    productionHours: v.optional(v.number()),
    transportHours: v.optional(v.number()),
    bufferHours: v.optional(v.number()),
    totalEstimatedHours: v.optional(v.number()),
    pricingMethod: v.optional(v.string()),
    totalCost: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    profit: v.optional(v.number()),
    marginPercent: v.optional(v.number()),
    upsells: v.optional(v.array(v.object({
      upsellId: v.string(),
      description: v.string(),
      scoreAddition: v.number(),
      price: v.number(),
      selected: v.boolean(),
    }))),
    timeTrackingEnabled: v.optional(v.boolean()),
    totalActualHours: v.optional(v.number()),
    varianceHours: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const lineItem = await ctx.db.get(id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete line item
export const remove = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Update time tracking data (called from work order)
export const updateTimeTracking = mutation({
  args: {
    id: v.id("lineItems"),
    totalActualHours: v.number(),
    varianceHours: v.number(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const lineItem = await ctx.db.get(id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Mark line item complete
export const markComplete = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    // Verify belongs to current organization
    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(args.id, {
      status: "Completed",
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Get line items by loadout (for performance analysis)
export const listByLoadout = query({
  args: { loadoutId: v.id("loadouts") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_loadout", (q) => q.eq("loadoutId", args.loadoutId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// Get line items by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("lineItems")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", org._id).eq("status", args.status)
      )
      .collect();
  },
});

// Start working on a line item (begin time tracking)
export const startLineItem = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    if (lineItem.status === "Completed") {
      throw new Error("Cannot start a completed line item");
    }

    await ctx.db.patch(args.id, {
      status: "In Progress",
      actualStartTime: Date.now(),
      timeTrackingEnabled: true,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Complete a line item and calculate actual costs
export const completeLineItem = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    if (lineItem.status === "Completed") {
      throw new Error("Line item already completed");
    }

    const now = Date.now();
    const startTime = lineItem.actualStartTime || now;
    const actualHours = (now - startTime) / (1000 * 60 * 60);
    const variance = actualHours - lineItem.totalEstimatedHours;

    // Calculate actual costs from crew time entries and time entries table
    let actualLaborCost = 0;
    let actualEquipmentCost = 0;

    // Sum up crew time entries (if tracked at line item level)
    if (lineItem.crewTimeEntries && lineItem.crewTimeEntries.length > 0) {
      for (const entry of lineItem.crewTimeEntries) {
        actualLaborCost += entry.laborCost || 0;
      }
    }

    // Get all time entries for this line item
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_line_item", (q) => q.eq("lineItemId", args.id))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();

    // Sum time entry costs
    for (const entry of timeEntries) {
      actualLaborCost += entry.laborCost || 0;
      actualEquipmentCost += entry.equipmentCost || 0;
    }

    const actualTotalCost = actualLaborCost + actualEquipmentCost;
    const actualProfit = lineItem.totalPrice - actualTotalCost;
    const actualMargin = lineItem.totalPrice > 0 ? (actualProfit / lineItem.totalPrice) * 100 : 0;

    await ctx.db.patch(args.id, {
      status: "Completed",
      actualEndTime: now,
      totalActualHours: actualHours,
      varianceHours: variance,
      actualLaborCost,
      actualEquipmentCost,
      actualTotalCost,
      actualProfit,
      actualMargin,
      updatedAt: now,
    });

    return args.id;
  },
});

// Recalculate actual costs from time entries (can be called anytime)
export const recalculateActualCosts = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    let actualLaborCost = 0;
    let actualEquipmentCost = 0;

    // Sum up crew time entries
    if (lineItem.crewTimeEntries && lineItem.crewTimeEntries.length > 0) {
      for (const entry of lineItem.crewTimeEntries) {
        actualLaborCost += entry.laborCost || 0;
      }
    }

    // Get all time entries for this line item
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_line_item", (q) => q.eq("lineItemId", args.id))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();

    // Sum time entry costs
    for (const entry of timeEntries) {
      actualLaborCost += entry.laborCost || 0;
      actualEquipmentCost += entry.equipmentCost || 0;
    }

    const actualTotalCost = actualLaborCost + actualEquipmentCost;
    const actualProfit = lineItem.totalPrice - actualTotalCost;
    const actualMargin = lineItem.totalPrice > 0 ? (actualProfit / lineItem.totalPrice) * 100 : 0;

    await ctx.db.patch(args.id, {
      actualLaborCost,
      actualEquipmentCost,
      actualTotalCost,
      actualProfit,
      actualMargin,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Add crew member to line item
export const addCrewMember = mutation({
  args: {
    id: v.id("lineItems"),
    employeeId: v.id("employees"),
    employeeName: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    const existingEntries = lineItem.crewTimeEntries || [];

    // Check if employee already clocked in
    const alreadyExists = existingEntries.some(
      (entry) => entry.employeeId === args.employeeId && !entry.clockOut
    );

    if (alreadyExists) {
      throw new Error("Employee already clocked in on this line item");
    }

    const newEntry = {
      employeeId: args.employeeId,
      employeeName: args.employeeName,
      clockIn: Date.now(),
    };

    await ctx.db.patch(args.id, {
      crewTimeEntries: [...existingEntries, newEntry],
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Clock out crew member from line item
export const clockOutCrewMember = mutation({
  args: {
    id: v.id("lineItems"),
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const lineItem = await ctx.db.get(args.id);

    if (!lineItem) {
      throw new Error("Line item not found");
    }

    if (lineItem.organizationId !== org._id) {
      throw new Error("Line item not found");
    }

    const existingEntries = lineItem.crewTimeEntries || [];

    // Find the active entry for this employee
    const entryIndex = existingEntries.findIndex(
      (entry) => entry.employeeId === args.employeeId && !entry.clockOut
    );

    if (entryIndex === -1) {
      throw new Error("No active clock-in found for this employee");
    }

    // Get employee to calculate labor cost
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const now = Date.now();
    const clockIn = existingEntries[entryIndex].clockIn;
    const hoursWorked = (now - clockIn) / (1000 * 60 * 60);

    // Calculate labor cost (base rate × burden multiplier)
    const burdenMultiplier = 1.7; // Default burden multiplier
    const trueCostPerHour = employee.baseHourlyRate * burdenMultiplier;
    const laborCost = hoursWorked * trueCostPerHour;

    // Update the entry
    existingEntries[entryIndex] = {
      ...existingEntries[entryIndex],
      clockOut: now,
      hoursWorked,
      laborCost,
    };

    await ctx.db.patch(args.id, {
      crewTimeEntries: existingEntries,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
