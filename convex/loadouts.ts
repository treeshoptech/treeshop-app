import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization } from "./lib/auth";
import { getEmployeeForCurrentUser } from "./lib/employeeHelpers";

// List all loadouts for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();
  },
});

// List loadouts that can perform a specific service type
export const listByServiceType = query({
  args: { serviceType: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const allLoadouts = await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Filter to only loadouts that can perform this service
    return allLoadouts.filter((loadout) => {
      // Check new serviceTypes array
      if (loadout.serviceTypes && loadout.serviceTypes.length > 0) {
        return loadout.serviceTypes.includes(args.serviceType);
      }
      // Fallback to legacy serviceType field
      if (loadout.serviceType) {
        return loadout.serviceType === args.serviceType;
      }
      return false;
    });
  },
});

// Get single loadout
export const get = query({
  args: { id: v.id("loadouts") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const loadout = await ctx.db.get(args.id);

    if (!loadout) {
      throw new Error("Loadout not found");
    }

    if (loadout.organizationId !== org._id) {
      throw new Error("Loadout not found");
    }

    return loadout;
  },
});

// Create loadout
export const create = mutation({
  args: {
    name: v.string(),
    // NEW: Multiple service types
    serviceTypes: v.optional(v.array(v.string())),
    // NEW: Service-specific production rates
    productionRates: v.optional(v.object({
      forestryMulching: v.optional(v.number()),
      landClearing: v.optional(v.number()),
      brushClearing: v.optional(v.number()),
      stumpGrinding: v.optional(v.number()),
      treeRemoval: v.optional(v.number()),
      treeTrimming: v.optional(v.number()),
    })),
    // DEPRECATED: Legacy fields (kept for backward compatibility)
    serviceType: v.optional(v.string()),
    productionRate: v.optional(v.number()),
    equipmentIds: v.array(v.id("equipment")),
    employeeIds: v.array(v.id("employees")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Convert legacy single service to array format if needed
    const serviceTypes = args.serviceTypes || (args.serviceType ? [args.serviceType] : []);

    // Fetch all equipment to calculate costs
    const equipmentList = await Promise.all(
      args.equipmentIds.map((id) => ctx.db.get(id))
    );

    // Calculate total equipment cost per hour using complete formula
    let totalEquipmentCost = 0;
    for (const eq of equipmentList) {
      if (eq) {
        const ownershipPerYear =
          eq.purchasePrice / eq.usefulLifeYears +
          eq.purchasePrice * (eq.financeRate || 0) +
          (eq.insuranceCost || 0) +
          (eq.registrationCost || 0);
        const ownershipPerHour = ownershipPerYear / eq.annualHours;

        const operatingPerYear =
          (eq.fuelConsumptionGPH || 0) * (eq.fuelPricePerGallon || 0) * eq.annualHours +
          (eq.maintenanceCostAnnual || 0) +
          (eq.repairCostAnnual || 0);
        const operatingPerHour = operatingPerYear / eq.annualHours;

        totalEquipmentCost += ownershipPerHour + operatingPerHour;
      }
    }

    // Fetch all employees to calculate labor costs
    const employeeList = await Promise.all(
      args.employeeIds.map((id) => ctx.db.get(id))
    );

    // Calculate total labor cost per hour using complete formula
    let totalLaborCost = 0;
    for (const emp of employeeList) {
      if (emp) {
        // Tier multipliers
        const tierMultipliers = [1.0, 1.6, 1.8, 2.0, 2.2];
        const tierMultiplier = tierMultipliers[emp.tier - 1] || 1.0;
        const baseTiered = emp.baseHourlyRate * tierMultiplier;

        // Leadership premium
        const leadershipPremiums: Record<string, number> = {
          L: 2,
          S: 3,
          M: 5,
          D: 6,
          C: 7,
        };
        const leadershipPremium = emp.leadership
          ? leadershipPremiums[emp.leadership] || 0
          : 0;

        // Equipment certifications premium
        const equipmentPremiums: Record<string, number> = {
          E1: 0.5,
          E2: 2,
          E3: 4,
          E4: 7,
        };
        const equipmentPremium = (emp.equipmentCerts || []).reduce(
          (sum: number, code: string) => sum + (equipmentPremiums[code] || 0),
          0
        );

        // Driver licenses premium
        const driverPremiums: Record<string, number> = {
          D1: 0.5,
          D2: 2,
          D3: 3,
          DH: 1,
        };
        const driverPremium = (emp.driverLicenses || []).reduce(
          (sum: number, code: string) => sum + (driverPremiums[code] || 0),
          0
        );

        // Professional certifications premium
        const certPremiums: Record<string, number> = {
          ISA: 4,
          CRA: 3,
          TRA: 2,
          OSH: 1,
          PES: 2,
          CPR: 0.5,
        };
        const certPremium = (emp.certifications || []).reduce(
          (sum: number, code: string) => sum + (certPremiums[code] || 0),
          0
        );

        // Total hourly with all premiums
        const totalHourly =
          baseTiered +
          leadershipPremium +
          equipmentPremium +
          driverPremium +
          certPremium;

        // Apply burden multiplier (1.7x)
        const trueCost = totalHourly * 1.7;

        totalLaborCost += trueCost;
      }
    }

    // Calculate total cost per hour
    const totalCostPerHour = totalEquipmentCost + totalLaborCost;

    // Calculate billing rates at different margins
    // Formula: Cost ÷ (1 - Margin%) = Billing Rate
    const billingRates = {
      margin30: totalCostPerHour / 0.7, // 30% margin
      margin40: totalCostPerHour / 0.6, // 40% margin
      margin50: totalCostPerHour / 0.5, // 50% margin
      margin60: totalCostPerHour / 0.4, // 60% margin
      margin70: totalCostPerHour / 0.3, // 70% margin
    };

    const loadoutId = await ctx.db.insert("loadouts", {
      organizationId: org._id,
      name: args.name,
      // NEW: Multi-service support
      serviceTypes,
      productionRates: args.productionRates,
      // DEPRECATED: Keep legacy fields for backward compatibility
      serviceType: args.serviceType,
      productionRate: args.productionRate,
      equipmentIds: args.equipmentIds,
      employeeIds: args.employeeIds,
      totalEquipmentCost,
      totalLaborCost,
      totalCostPerHour,
      billingRates,
      status: args.status || "Active",
      createdAt: Date.now(),
    });

    return loadoutId;
  },
});

// Update loadout
export const update = mutation({
  args: {
    id: v.id("loadouts"),
    name: v.optional(v.string()),
    // NEW: Multiple service types
    serviceTypes: v.optional(v.array(v.string())),
    // NEW: Service-specific production rates
    productionRates: v.optional(v.object({
      forestryMulching: v.optional(v.number()),
      landClearing: v.optional(v.number()),
      brushClearing: v.optional(v.number()),
      stumpGrinding: v.optional(v.number()),
      treeRemoval: v.optional(v.number()),
      treeTrimming: v.optional(v.number()),
    })),
    // DEPRECATED: Legacy fields
    serviceType: v.optional(v.string()),
    productionRate: v.optional(v.number()),
    equipmentIds: v.optional(v.array(v.id("equipment"))),
    employeeIds: v.optional(v.array(v.id("employees"))),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const loadout = await ctx.db.get(id);

    if (!loadout) {
      throw new Error("Loadout not found");
    }

    if (loadout.organizationId !== org._id) {
      throw new Error("Loadout not found");
    }

    // If equipment or employees changed, recalculate costs
    let calculatedFields = {};
    if (updates.equipmentIds || updates.employeeIds) {
      const equipmentIds = updates.equipmentIds || loadout.equipmentIds;
      const employeeIds = updates.employeeIds || loadout.employeeIds;

      // Fetch all equipment
      const equipmentList = await Promise.all(
        equipmentIds.map((eqId) => ctx.db.get(eqId))
      );

      // Calculate total equipment cost
      let totalEquipmentCost = 0;
      for (const eq of equipmentList) {
        if (eq) {
          const ownershipPerYear =
            eq.purchasePrice / eq.usefulLifeYears +
            eq.purchasePrice * (eq.financeRate || 0) +
            (eq.insuranceCost || 0) +
            (eq.registrationCost || 0);
          const ownershipPerHour = ownershipPerYear / eq.annualHours;

          const operatingPerYear =
            (eq.fuelConsumptionGPH || 0) *
              (eq.fuelPricePerGallon || 0) *
              eq.annualHours +
            (eq.maintenanceCostAnnual || 0) +
            (eq.repairCostAnnual || 0);
          const operatingPerHour = operatingPerYear / eq.annualHours;

          totalEquipmentCost += ownershipPerHour + operatingPerHour;
        }
      }

      // Fetch all employees
      const employeeList = await Promise.all(
        employeeIds.map((empId) => ctx.db.get(empId))
      );

      // Calculate total labor cost
      let totalLaborCost = 0;
      for (const emp of employeeList) {
        if (emp) {
          const tierMultipliers = [1.0, 1.6, 1.8, 2.0, 2.2];
          const tierMultiplier = tierMultipliers[emp.tier - 1] || 1.0;
          const baseTiered = emp.baseHourlyRate * tierMultiplier;

          const leadershipPremiums: Record<string, number> = {
            L: 2,
            S: 3,
            M: 5,
            D: 6,
            C: 7,
          };
          const leadershipPremium = emp.leadership
            ? leadershipPremiums[emp.leadership] || 0
            : 0;

          const equipmentPremiums: Record<string, number> = {
            E1: 0.5,
            E2: 2,
            E3: 4,
            E4: 7,
          };
          const equipmentPremium = (emp.equipmentCerts || []).reduce(
            (sum: number, code: string) => sum + (equipmentPremiums[code] || 0),
            0
          );

          const driverPremiums: Record<string, number> = {
            D1: 0.5,
            D2: 2,
            D3: 3,
            DH: 1,
          };
          const driverPremium = (emp.driverLicenses || []).reduce(
            (sum: number, code: string) => sum + (driverPremiums[code] || 0),
            0
          );

          const certPremiums: Record<string, number> = {
            ISA: 4,
            CRA: 3,
            TRA: 2,
            OSH: 1,
            PES: 2,
            CPR: 0.5,
          };
          const certPremium = (emp.certifications || []).reduce(
            (sum: number, code: string) => sum + (certPremiums[code] || 0),
            0
          );

          const totalHourly =
            baseTiered +
            leadershipPremium +
            equipmentPremium +
            driverPremium +
            certPremium;

          const trueCost = totalHourly * 1.7;
          totalLaborCost += trueCost;
        }
      }

      const totalCostPerHour = totalEquipmentCost + totalLaborCost;

      const billingRates = {
        margin30: totalCostPerHour / 0.7,
        margin40: totalCostPerHour / 0.6,
        margin50: totalCostPerHour / 0.5,
        margin60: totalCostPerHour / 0.4,
        margin70: totalCostPerHour / 0.3,
      };

      calculatedFields = {
        totalEquipmentCost,
        totalLaborCost,
        totalCostPerHour,
        billingRates,
      };
    }

    await ctx.db.patch(id, {
      ...updates,
      ...calculatedFields,
    });

    return id;
  },
});

// Delete loadout
export const remove = mutation({
  args: { id: v.id("loadouts") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const loadout = await ctx.db.get(args.id);

    if (!loadout) {
      throw new Error("Loadout not found");
    }

    if (loadout.organizationId !== org._id) {
      throw new Error("Loadout not found");
    }

    await ctx.db.delete(args.id);
  },
});

// ============================================
// EMPLOYEE PORTAL QUERIES
// ============================================

/**
 * Get loadouts assigned to the current user's employee record
 * Returns loadouts where user is in employeeIds
 */
export const getMyLoadouts = query({
  handler: async (ctx) => {
    // Get employee record for current user
    const employee = await getEmployeeForCurrentUser(ctx);

    if (!employee) {
      // User is not linked to an employee - return empty array
      return [];
    }

    // Get all loadouts for this organization
    const allLoadouts = await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", employee.organizationId))
      .collect();

    // Filter to only loadouts where this employee is in employeeIds
    return allLoadouts.filter((loadout) =>
      loadout.employeeIds.includes(employee._id)
    );
  },
});
