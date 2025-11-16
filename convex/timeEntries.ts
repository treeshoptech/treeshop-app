import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// List all time entries for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .order("desc")
      .collect();
  },
});

// List time entries by work order
export const listByWorkOrder = query({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// List time entries by line item
export const listByLineItem = query({
  args: { lineItemId: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_line_item", (q) => q.eq("lineItemId", args.lineItemId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// List time entries by employee
export const listByEmployee = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_org_employee", (q) =>
        q.eq("organizationId", org._id).eq("employeeId", args.employeeId)
      )
      .collect();
  },
});

// List billable time entries
export const listBillable = query({
  args: { billable: v.boolean() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_billable", (q) =>
        q.eq("organizationId", org._id).eq("billable", args.billable)
      )
      .collect();
  },
});

// Get single time entry
export const get = query({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const timeEntry = await ctx.db.get(args.id);

    if (!timeEntry) {
      throw new Error("Time entry not found");
    }

    // Verify belongs to current organization
    if (timeEntry.organizationId !== org._id) {
      throw new Error("Time entry not found");
    }

    return timeEntry;
  },
});

// Start time entry (clock in)
export const start = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    lineItemId: v.id("lineItems"),
    employeeId: v.id("employees"),
    employeeCode: v.string(),
    loadoutId: v.optional(v.id("loadouts")),
    activityCategory: v.string(),
    activityType: v.string(),
    activityDetail: v.optional(v.string()),
    billable: v.boolean(),
    locationStart: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    recordedMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get employee info for denormalization
    const employee = await ctx.db.get(args.employeeId);
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : "Unknown";

    // Get line item info for denormalization
    const lineItem = args.lineItemId ? await ctx.db.get(args.lineItemId) : null;
    const serviceType = lineItem?.serviceType;

    // Get project ID from work order
    const workOrder = await ctx.db.get(args.workOrderId);
    const projectId = workOrder?.projectId;

    // Get loadout info if provided
    const loadout = args.loadoutId ? await ctx.db.get(args.loadoutId) : null;
    const loadoutName = loadout?.name;

    const timeEntryId = await ctx.db.insert("timeEntries", {
      organizationId: org._id,
      ...args,
      employeeName,
      projectId,
      serviceType,
      loadoutName,
      startTime: Date.now(),
      recordedBy: "Employee",
      timestampRecorded: Date.now(),
      approved: false,
      createdAt: Date.now(),
    });

    return timeEntryId;
  },
});

// Stop time entry (clock out)
export const stop = mutation({
  args: {
    id: v.id("timeEntries"),
    locationEnd: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const timeEntry = await ctx.db.get(id);

    if (!timeEntry) {
      throw new Error("Time entry not found");
    }

    if (timeEntry.organizationId !== org._id) {
      throw new Error("Time entry not found");
    }

    if (timeEntry.endTime) {
      throw new Error("Time entry already stopped");
    }

    const endTime = Date.now();
    const durationMs = endTime - timeEntry.startTime;
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    // Calculate labor cost
    const employee = await ctx.db.get(timeEntry.employeeId);
    let laborCost = 0;
    let employeeHourlyRate = 0;
    let employeeBurdenMultiplier = 1.7; // Default burden

    if (employee) {
      employeeHourlyRate = employee.baseHourlyRate;
      const trueCostPerHour = employeeHourlyRate * employeeBurdenMultiplier;
      laborCost = durationHours * trueCostPerHour;
    }

    // Calculate equipment cost (if equipment assigned) and denormalize data
    let equipmentCost = 0;
    const equipmentNames: string[] = [];
    const equipmentHourlyRates: number[] = [];

    if (timeEntry.equipmentIds && timeEntry.equipmentIds.length > 0) {
      for (const equipmentId of timeEntry.equipmentIds) {
        const equipment = await ctx.db.get(equipmentId);
        if (equipment) {
          // Calculate equipment hourly cost
          const ownershipCost = equipment.purchasePrice / (equipment.usefulLifeYears * equipment.annualHours);
          const financeCost = ((equipment.financeRate || 0) * equipment.purchasePrice / 100) / equipment.annualHours;
          const insuranceCost = (equipment.insuranceCost || 0) / equipment.annualHours;
          const registrationCost = (equipment.registrationCost || 0) / equipment.annualHours;

          const ownershipPerHour = ownershipCost + financeCost + insuranceCost + registrationCost;

          const fuelCost = (equipment.fuelConsumptionGPH || 0) * (equipment.fuelPricePerGallon || 0);
          const maintenanceCost = (equipment.maintenanceCostAnnual || 0) / equipment.annualHours;
          const repairCost = (equipment.repairCostAnnual || 0) / equipment.annualHours;

          const operatingPerHour = fuelCost + maintenanceCost + repairCost;

          const totalEquipmentPerHour = ownershipPerHour + operatingPerHour;
          equipmentCost += durationHours * totalEquipmentPerHour;

          // Denormalize for reporting
          equipmentNames.push(equipment.nickname || `${equipment.make} ${equipment.model}`);
          equipmentHourlyRates.push(totalEquipmentPerHour);
        }
      }
    }

    const totalCost = laborCost + equipmentCost;

    await ctx.db.patch(id, {
      ...updates,
      endTime,
      durationMinutes,
      durationHours,
      employeeHourlyRate,
      employeeBurdenMultiplier,
      laborCost,
      equipmentCost,
      equipmentNames: equipmentNames.length > 0 ? equipmentNames : undefined,
      equipmentHourlyRates: equipmentHourlyRates.length > 0 ? equipmentHourlyRates : undefined,
      totalCost,
    });

    return id;
  },
});

// Create manual time entry
export const createManual = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    lineItemId: v.id("lineItems"),
    employeeId: v.id("employees"),
    employeeCode: v.string(),
    loadoutId: v.optional(v.id("loadouts")),
    activityCategory: v.string(),
    activityType: v.string(),
    activityDetail: v.optional(v.string()),
    billable: v.boolean(),
    startTime: v.number(),
    endTime: v.number(),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    locationStart: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    locationEnd: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const durationMs = args.endTime - args.startTime;
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    const timeEntryId = await ctx.db.insert("timeEntries", {
      organizationId: org._id,
      ...args,
      durationMinutes,
      durationHours,
      recordedBy: "Manager",
      recordedMethod: "Manual Entry",
      timestampRecorded: Date.now(),
      approved: false,
      createdAt: Date.now(),
    });

    return timeEntryId;
  },
});

// Update time entry
export const update = mutation({
  args: {
    id: v.id("timeEntries"),
    activityCategory: v.optional(v.string()),
    activityType: v.optional(v.string()),
    activityDetail: v.optional(v.string()),
    billable: v.optional(v.boolean()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const timeEntry = await ctx.db.get(id);

    if (!timeEntry) {
      throw new Error("Time entry not found");
    }

    if (timeEntry.organizationId !== org._id) {
      throw new Error("Time entry not found");
    }

    // Recalculate duration if times changed
    let durationUpdates = {};
    if (updates.startTime !== undefined || updates.endTime !== undefined) {
      const newStart = updates.startTime ?? timeEntry.startTime;
      const newEnd = updates.endTime ?? timeEntry.endTime;

      if (newEnd) {
        const durationMs = newEnd - newStart;
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        const durationHours = durationMinutes / 60;

        durationUpdates = {
          durationMinutes,
          durationHours,
        };
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      ...durationUpdates,
    });

    return id;
  },
});

// Approve time entry
export const approve = mutation({
  args: {
    id: v.id("timeEntries"),
    approvedBy: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const timeEntry = await ctx.db.get(args.id);

    if (!timeEntry) {
      throw new Error("Time entry not found");
    }

    if (timeEntry.organizationId !== org._id) {
      throw new Error("Time entry not found");
    }

    await ctx.db.patch(args.id, {
      approved: true,
      approvedBy: args.approvedBy,
      approvedDate: Date.now(),
    });

    return args.id;
  },
});

// Bulk approve time entries
export const bulkApprove = mutation({
  args: {
    ids: v.array(v.id("timeEntries")),
    approvedBy: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const approvalDate = Date.now();

    for (const id of args.ids) {
      const timeEntry = await ctx.db.get(id);

      if (!timeEntry) {
        continue; // Skip if not found
      }

      if (timeEntry.organizationId !== org._id) {
        continue; // Skip if wrong org
      }

      await ctx.db.patch(id, {
        approved: true,
        approvedBy: args.approvedBy,
        approvedDate: approvalDate,
      });
    }

    return args.ids;
  },
});

// Delete time entry
export const remove = mutation({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const timeEntry = await ctx.db.get(args.id);

    if (!timeEntry) {
      throw new Error("Time entry not found");
    }

    // Verify belongs to current organization
    if (timeEntry.organizationId !== org._id) {
      throw new Error("Time entry not found");
    }

    // Only allow deleting unapproved entries
    if (timeEntry.approved) {
      throw new Error("Cannot delete approved time entries");
    }

    await ctx.db.delete(args.id);
  },
});

// Get time summary for line item
export const getSummaryByLineItem = query({
  args: { lineItemId: v.id("lineItems") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_line_item", (q) => q.eq("lineItemId", args.lineItemId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();

    let totalHours = 0;
    let billableHours = 0;
    let unbillableHours = 0;
    let productionHours = 0;
    let supportHours = 0;

    for (const entry of entries) {
      const hours = entry.durationHours || 0;
      totalHours += hours;

      if (entry.billable) {
        billableHours += hours;
      } else {
        unbillableHours += hours;
      }

      if (entry.activityCategory === "Production") {
        productionHours += hours;
      } else if (entry.activityCategory === "Support") {
        supportHours += hours;
      }
    }

    return {
      totalEntries: entries.length,
      totalHours,
      billableHours,
      unbillableHours,
      productionHours,
      supportHours,
    };
  },
});
