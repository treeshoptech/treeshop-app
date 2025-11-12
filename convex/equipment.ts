import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all equipment for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("equipment")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// Get single equipment item
export const get = query({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const equipment = await ctx.db.get(args.id);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify belongs to current organization
    if (equipment.organizationId !== org._id) {
      throw new Error("Equipment not found");
    }

    return equipment;
  },
});

// Create new equipment
export const create = mutation({
  args: {
    // Identity
    nickname: v.optional(v.string()),
    year: v.number(),
    make: v.string(),
    model: v.string(),
    serialNumber: v.optional(v.string()),
    vin: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    equipmentCategory: v.string(),
    equipmentSubcategory: v.string(),
    // Acquisition
    purchasePrice: v.number(),
    purchaseDate: v.optional(v.number()),
    dealer: v.optional(v.string()),
    purchaseOrderNumber: v.optional(v.string()),
    loanTermMonths: v.optional(v.number()),
    financeRate: v.optional(v.number()),
    depreciationMethod: v.optional(v.string()),
    usefulLifeYears: v.number(),
    salvageValue: v.optional(v.number()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceCost: v.optional(v.number()),
    registrationCost: v.optional(v.number()),
    // Cost
    fuelType: v.optional(v.string()),
    fuelConsumptionGPH: v.optional(v.number()),
    fuelPricePerGallon: v.optional(v.number()),
    maintenanceCostAnnual: v.optional(v.number()),
    repairCostAnnual: v.optional(v.number()),
    annualHours: v.number(),
    // Operations
    engineHP: v.optional(v.number()),
    operatingWeight: v.optional(v.number()),
    cuttingWidth: v.optional(v.number()),
    maxCuttingDiameter: v.optional(v.number()),
    fuelTankCapacity: v.optional(v.number()),
    productivityRate: v.optional(v.number()),
    // Status
    currentMeterReading: v.optional(v.number()),
    status: v.string(),
    currentLocation: v.optional(v.string()),
    assignedOperator: v.optional(v.string()),
    // Maintenance
    serviceInterval: v.optional(v.number()),
    lastServiceDate: v.optional(v.number()),
    lastServiceHours: v.optional(v.number()),
    // Other
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only admins can create equipment
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    return await ctx.db.insert("equipment", {
      organizationId: org._id,
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update equipment
export const update = mutation({
  args: {
    id: v.id("equipment"),
    // Identity
    nickname: v.optional(v.string()),
    year: v.optional(v.number()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    vin: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    equipmentCategory: v.string(),
    equipmentSubcategory: v.string(),
    // Acquisition
    purchasePrice: v.optional(v.number()),
    purchaseDate: v.optional(v.number()),
    dealer: v.optional(v.string()),
    purchaseOrderNumber: v.optional(v.string()),
    loanTermMonths: v.optional(v.number()),
    financeRate: v.optional(v.number()),
    depreciationMethod: v.optional(v.string()),
    usefulLifeYears: v.optional(v.number()),
    salvageValue: v.optional(v.number()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceCost: v.optional(v.number()),
    registrationCost: v.optional(v.number()),
    // Cost
    fuelType: v.optional(v.string()),
    fuelConsumptionGPH: v.optional(v.number()),
    fuelPricePerGallon: v.optional(v.number()),
    maintenanceCostAnnual: v.optional(v.number()),
    repairCostAnnual: v.optional(v.number()),
    annualHours: v.optional(v.number()),
    // Operations
    engineHP: v.optional(v.number()),
    operatingWeight: v.optional(v.number()),
    cuttingWidth: v.optional(v.number()),
    maxCuttingDiameter: v.optional(v.number()),
    fuelTankCapacity: v.optional(v.number()),
    productivityRate: v.optional(v.number()),
    // Status
    currentMeterReading: v.optional(v.number()),
    status: v.optional(v.string()),
    currentLocation: v.optional(v.string()),
    assignedOperator: v.optional(v.string()),
    // Maintenance
    serviceInterval: v.optional(v.number()),
    lastServiceDate: v.optional(v.number()),
    lastServiceHours: v.optional(v.number()),
    // Other
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const equipment = await ctx.db.get(id);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify belongs to current organization
    if (equipment.organizationId !== org._id) {
      throw new Error("Equipment not found");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete equipment
export const remove = mutation({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const equipment = await ctx.db.get(args.id);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify belongs to current organization
    if (equipment.organizationId !== org._id) {
      throw new Error("Equipment not found");
    }

    await ctx.db.delete(args.id);
  },
});
