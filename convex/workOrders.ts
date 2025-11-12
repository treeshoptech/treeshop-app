import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all work orders for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("workOrders")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .order("desc")
      .collect();
  },
});

// List work orders by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("workOrders")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", org._id).eq("status", args.status)
      )
      .collect();
  },
});

// List work orders by scheduled date
export const listByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("workOrders")
      .withIndex("by_scheduled_date", (q) =>
        q.eq("organizationId", org._id).eq("scheduledDate", args.date)
      )
      .collect();
  },
});

// Get single work order
export const get = query({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    // Verify belongs to current organization
    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    return workOrder;
  },
});

// Get work orders by proposal
export const listByProposal = query({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("workOrders")
      .withIndex("by_proposal", (q) => q.eq("proposalId", args.proposalId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// Get work orders by customer
export const listByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("workOrders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// Create work order from accepted proposal
export const create = mutation({
  args: {
    proposalId: v.id("proposals"),
    projectId: v.id("projects"),
    customerId: v.id("customers"),
    propertyAddress: v.string(),
    scheduledDate: v.number(),
    scheduledStartTime: v.optional(v.string()),
    primaryLoadoutId: v.optional(v.id("loadouts")),
    crewMemberIds: v.array(v.id("employees")),
    equipmentIds: v.array(v.id("equipment")),
    // Site conditions
    weather: v.optional(v.string()),
    accessNotes: v.optional(v.string()),
    hazards: v.optional(v.array(v.string())),
    parkingInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const workOrderId = await ctx.db.insert("workOrders", {
      organizationId: org._id,
      ...args,
      // Safety defaults
      safetyBriefingCompleted: false,
      ppeVerified: false,
      // Completion checklist defaults
      allLineItemsComplete: false,
      finalPhotosUploaded: false,
      customerWalkthroughComplete: false,
      debrisRemoved: false,
      siteRestored: false,
      equipmentCleaned: false,
      status: "Scheduled",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return workOrderId;
  },
});

// Update work order
export const update = mutation({
  args: {
    id: v.id("workOrders"),
    scheduledDate: v.optional(v.number()),
    scheduledStartTime: v.optional(v.string()),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    totalJobHours: v.optional(v.number()),
    primaryLoadoutId: v.optional(v.id("loadouts")),
    crewMemberIds: v.optional(v.array(v.id("employees"))),
    equipmentIds: v.optional(v.array(v.id("equipment"))),
    weather: v.optional(v.string()),
    accessNotes: v.optional(v.string()),
    hazards: v.optional(v.array(v.string())),
    parkingInstructions: v.optional(v.string()),
    safetyBriefingCompleted: v.optional(v.boolean()),
    safetyBriefingTime: v.optional(v.number()),
    safetyAttendees: v.optional(v.array(v.id("employees"))),
    ppeVerified: v.optional(v.boolean()),
    incidentReports: v.optional(v.array(v.string())),
    photosBefore: v.optional(v.array(v.string())),
    photosDuring: v.optional(v.array(v.string())),
    photosAfter: v.optional(v.array(v.string())),
    fuelGallons: v.optional(v.number()),
    consumablesCost: v.optional(v.number()),
    materialsNotes: v.optional(v.string()),
    allLineItemsComplete: v.optional(v.boolean()),
    finalPhotosUploaded: v.optional(v.boolean()),
    customerWalkthroughComplete: v.optional(v.boolean()),
    customerSignature: v.optional(v.string()),
    customerSignedAt: v.optional(v.number()),
    debrisRemoved: v.optional(v.boolean()),
    siteRestored: v.optional(v.boolean()),
    equipmentCleaned: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const workOrder = await ctx.db.get(id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    // Verify belongs to current organization
    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Add crew note
export const addCrewNote = mutation({
  args: {
    id: v.id("workOrders"),
    note: v.string(),
    createdBy: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    const newNote = {
      timestamp: Date.now(),
      note: args.note,
      createdBy: args.createdBy,
    };

    const existingNotes = workOrder.crewNotes || [];

    await ctx.db.patch(args.id, {
      crewNotes: [...existingNotes, newNote],
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Add customer communication
export const addCustomerCommunication = mutation({
  args: {
    id: v.id("workOrders"),
    note: v.string(),
    createdBy: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    const newComm = {
      timestamp: Date.now(),
      note: args.note,
      createdBy: args.createdBy,
    };

    const existingComms = workOrder.customerCommunications || [];

    await ctx.db.patch(args.id, {
      customerCommunications: [...existingComms, newComm],
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Start work order
export const startWork = mutation({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    await ctx.db.patch(args.id, {
      status: "In Progress",
      actualStartTime: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Complete work order
export const complete = mutation({
  args: {
    id: v.id("workOrders"),
    customerSignature: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    const now = Date.now();
    const actualStartTime = workOrder.actualStartTime || now;
    const totalHours = (now - actualStartTime) / (1000 * 60 * 60); // Convert ms to hours

    await ctx.db.patch(args.id, {
      status: "Completed",
      actualEndTime: now,
      totalJobHours: totalHours,
      customerSignature: args.customerSignature,
      customerSignedAt: now,
      updatedAt: now,
    });

    return args.id;
  },
});

// Delete work order
export const remove = mutation({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    // Verify belongs to current organization
    if (workOrder.organizationId !== org._id) {
      throw new Error("Work order not found");
    }

    await ctx.db.delete(args.id);
  },
});
