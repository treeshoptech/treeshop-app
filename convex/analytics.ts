import { v } from "convex/values";
import { query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// 📊 EMPLOYEE PERFORMANCE ANALYTICS

// Get employee production rate by service type
export const getEmployeeProductionRate = query({
  args: {
    employeeId: v.id("employees"),
    serviceType: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get all production time entries for this employee
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_org_employee", (q) =>
        q.eq("organizationId", org._id).eq("employeeId", args.employeeId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceType"), args.serviceType),
          q.eq(q.field("activityCategory"), "Production Time")
        )
      )
      .collect();

    // Filter by date range if provided
    const filteredEntries = entries.filter((entry) => {
      if (args.startDate && entry.startTime < args.startDate) return false;
      if (args.endDate && entry.startTime > args.endDate) return false;
      return true;
    });

    const totalProductionHours = filteredEntries.reduce(
      (sum, e) => sum + (e.durationHours || 0),
      0
    );

    // Calculate units completed (from line items)
    let unitsCompleted = 0;
    let unitType = "";

    if (args.serviceType.includes("Forestry Mulching")) {
      // Get acres from associated line items
      const lineItemIds = new Set(filteredEntries.map((e) => e.lineItemId).filter(Boolean));
      for (const lineItemId of lineItemIds) {
        const lineItem = await ctx.db.get(lineItemId!);
        if (lineItem?.acreage) {
          unitsCompleted += lineItem.acreage;
          unitType = "acres";
        }
      }
    } else if (args.serviceType.includes("Stump Grinding")) {
      const lineItemIds = new Set(filteredEntries.map((e) => e.lineItemId).filter(Boolean));
      for (const lineItemId of lineItemIds) {
        const lineItem = await ctx.db.get(lineItemId!);
        if (lineItem?.quantity) {
          unitsCompleted += lineItem.quantity;
          unitType = "stumps";
        }
      }
    }

    const productionRate =
      totalProductionHours > 0 ? unitsCompleted / totalProductionHours : 0;

    return {
      employeeId: args.employeeId,
      serviceType: args.serviceType,
      totalProductionHours,
      unitsCompleted,
      unitType,
      productionRate, // units per hour
      jobsCompleted: new Set(filteredEntries.map((e) => e.workOrderId)).size,
    };
  },
});

// Get employee cost efficiency (production time vs total time)
export const getEmployeeCostEfficiency = query({
  args: {
    employeeId: v.id("employees"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_org_employee", (q) =>
        q.eq("organizationId", org._id).eq("employeeId", args.employeeId)
      )
      .collect();

    // Filter by date range
    const filteredEntries = entries.filter((entry) => {
      if (args.startDate && entry.startTime < args.startDate) return false;
      if (args.endDate && entry.startTime > args.endDate) return false;
      return true;
    });

    const totalHours = filteredEntries.reduce((sum, e) => sum + (e.durationHours || 0), 0);
    const productionHours = filteredEntries
      .filter((e) => e.activityCategory === "Production Time")
      .reduce((sum, e) => sum + (e.durationHours || 0), 0);
    const totalLaborCost = filteredEntries.reduce((sum, e) => sum + (e.laborCost || 0), 0);

    const efficiencyRatio = totalHours > 0 ? (productionHours / totalHours) * 100 : 0;

    // Break down by task category
    const byCategory = filteredEntries.reduce((acc, entry) => {
      const category = entry.activityCategory || "Unknown";
      if (!acc[category]) {
        acc[category] = { hours: 0, cost: 0, entries: 0 };
      }
      acc[category].hours += entry.durationHours || 0;
      acc[category].cost += entry.laborCost || 0;
      acc[category].entries += 1;
      return acc;
    }, {} as Record<string, { hours: number; cost: number; entries: number }>);

    return {
      employeeId: args.employeeId,
      totalHours,
      productionHours,
      efficiencyRatio, // % of time spent on revenue work
      totalLaborCost,
      byCategory,
    };
  },
});

// 🚜 EQUIPMENT PERFORMANCE ANALYTICS

// Get equipment operating cost and production rate
export const getEquipmentPerformance = query({
  args: {
    equipmentId: v.id("equipment"),
    serviceType: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get all time entries using this equipment
    const allEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const entries = allEntries.filter((entry) => {
      // Check if this equipment was used
      if (!entry.equipmentIds?.includes(args.equipmentId)) return false;

      // Filter by service type if provided
      if (args.serviceType && entry.serviceType !== args.serviceType) return false;

      // Filter by date range
      if (args.startDate && entry.startTime < args.startDate) return false;
      if (args.endDate && entry.startTime > args.endDate) return false;

      return true;
    });

    const totalHours = entries.reduce((sum, e) => sum + (e.durationHours || 0), 0);
    const totalEquipmentCost = entries.reduce((sum, e) => sum + (e.equipmentCost || 0), 0);
    const productionHours = entries
      .filter((e) => e.activityCategory === "Production Time")
      .reduce((sum, e) => sum + (e.durationHours || 0), 0);

    // Calculate units completed
    let unitsCompleted = 0;
    const lineItemIds = new Set(entries.map((e) => e.lineItemId).filter(Boolean));
    for (const lineItemId of lineItemIds) {
      const lineItem = await ctx.db.get(lineItemId!);
      if (lineItem?.acreage) {
        unitsCompleted += lineItem.acreage;
      } else if (lineItem?.quantity) {
        unitsCompleted += lineItem.quantity;
      }
    }

    const productionRate = productionHours > 0 ? unitsCompleted / productionHours : 0;
    const costPerUnit = unitsCompleted > 0 ? totalEquipmentCost / unitsCompleted : 0;
    const avgCostPerHour = totalHours > 0 ? totalEquipmentCost / totalHours : 0;

    return {
      equipmentId: args.equipmentId,
      serviceType: args.serviceType,
      totalHours,
      productionHours,
      totalEquipmentCost,
      unitsCompleted,
      productionRate, // units per hour
      costPerUnit,
      avgCostPerHour,
      jobsCompleted: new Set(entries.map((e) => e.workOrderId)).size,
      utilizationRate: totalHours > 0 ? (productionHours / totalHours) * 100 : 0,
    };
  },
});

// ⏱️ TASK-LEVEL ANALYTICS

// Get average time and cost by task type for a service
export const getTaskAverages = query({
  args: {
    serviceType: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) => q.eq(q.field("serviceType"), args.serviceType))
      .collect();

    // Filter by date range
    const filteredEntries = entries.filter((entry) => {
      if (args.startDate && entry.startTime < args.startDate) return false;
      if (args.endDate && entry.startTime > args.endDate) return false;
      return true;
    });

    // Group by task type
    const byTaskType = filteredEntries.reduce((acc, entry) => {
      const taskType = entry.activityType || "Unknown";
      if (!acc[taskType]) {
        acc[taskType] = {
          taskType,
          category: entry.activityCategory,
          count: 0,
          totalHours: 0,
          totalLaborCost: 0,
          totalEquipmentCost: 0,
          totalCost: 0,
          minHours: Infinity,
          maxHours: 0,
        };
      }

      acc[taskType].count += 1;
      acc[taskType].totalHours += entry.durationHours || 0;
      acc[taskType].totalLaborCost += entry.laborCost || 0;
      acc[taskType].totalEquipmentCost += entry.equipmentCost || 0;
      acc[taskType].totalCost += entry.totalCost || 0;
      acc[taskType].minHours = Math.min(acc[taskType].minHours, entry.durationHours || 0);
      acc[taskType].maxHours = Math.max(acc[taskType].maxHours, entry.durationHours || 0);

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    const taskAverages = Object.values(byTaskType).map((task: any) => ({
      ...task,
      avgHours: task.count > 0 ? task.totalHours / task.count : 0,
      avgLaborCost: task.count > 0 ? task.totalLaborCost / task.count : 0,
      avgEquipmentCost: task.count > 0 ? task.totalEquipmentCost / task.count : 0,
      avgTotalCost: task.count > 0 ? task.totalCost / task.count : 0,
    }));

    // Calculate cost distribution
    const totalCost = filteredEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
    const totalHours = filteredEntries.reduce((sum, e) => sum + (e.durationHours || 0), 0);

    const costDistribution = taskAverages.map((task) => ({
      taskType: task.taskType,
      category: task.category,
      percentOfTime: totalHours > 0 ? (task.totalHours / totalHours) * 100 : 0,
      percentOfCost: totalCost > 0 ? (task.totalCost / totalCost) * 100 : 0,
    }));

    return {
      serviceType: args.serviceType,
      taskAverages,
      costDistribution,
      totalEntries: filteredEntries.length,
    };
  },
});

// 🎯 FORMULA VALIDATION

// Compare estimated vs actual for TreeScore validation
export const getTreeScoreAccuracy = query({
  args: {
    serviceType: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get all completed line items for this service type
    const allLineItems = await ctx.db
      .query("lineItems")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceType"), args.serviceType),
          q.eq(q.field("status"), "Completed")
        )
      )
      .collect();

    // Filter by date range
    const lineItems = allLineItems.filter((li) => {
      if (args.startDate && li.createdAt < args.startDate) return false;
      if (args.endDate && li.createdAt > args.endDate) return false;
      return true;
    });

    const comparisons = lineItems.map((lineItem) => {
      const estimatedHours = lineItem.totalEstimatedHours || 0;
      const actualHours = lineItem.totalActualHours || 0;
      const variance = actualHours - estimatedHours;
      const variancePercent = estimatedHours > 0 ? (variance / estimatedHours) * 100 : 0;

      return {
        lineItemId: lineItem._id,
        description: lineItem.description,
        treeShopScore: lineItem.treeShopScore,
        estimatedHours,
        actualHours,
        variance,
        variancePercent,
        estimatedCost: lineItem.totalCost,
        actualCost: lineItem.actualTotalCost || 0,
        price: lineItem.totalPrice,
        estimatedMargin: lineItem.marginPercent,
        actualMargin: lineItem.actualMargin || 0,
      };
    });

    const avgVariancePercent =
      comparisons.reduce((sum, c) => sum + c.variancePercent, 0) / comparisons.length || 0;

    const overestimated = comparisons.filter((c) => c.variance < 0).length;
    const underestimated = comparisons.filter((c) => c.variance > 0).length;
    const accurate = comparisons.filter((c) => Math.abs(c.variancePercent) < 10).length;

    return {
      serviceType: args.serviceType,
      totalJobs: comparisons.length,
      avgVariancePercent,
      overestimated,
      underestimated,
      accurate,
      accuracyRate: comparisons.length > 0 ? (accurate / comparisons.length) * 100 : 0,
      comparisons,
    };
  },
});

// 💰 PROFITABILITY ANALYTICS

// Get profitability by service type
export const getServiceTypeProfitability = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get all completed line items
    const lineItems = await ctx.db
      .query("lineItems")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) => q.eq(q.field("status"), "Completed"))
      .collect();

    // Filter by date range
    const filteredLineItems = lineItems.filter((li) => {
      if (args.startDate && li.createdAt < args.startDate) return false;
      if (args.endDate && li.createdAt > args.endDate) return false;
      return true;
    });

    // Group by service type
    const byServiceType = filteredLineItems.reduce((acc, lineItem) => {
      const serviceType = lineItem.serviceType || "Unknown";
      if (!acc[serviceType]) {
        acc[serviceType] = {
          serviceType,
          jobCount: 0,
          totalRevenue: 0,
          totalEstimatedCost: 0,
          totalActualCost: 0,
          totalEstimatedProfit: 0,
          totalActualProfit: 0,
        };
      }

      acc[serviceType].jobCount += 1;
      acc[serviceType].totalRevenue += lineItem.totalPrice || 0;
      acc[serviceType].totalEstimatedCost += lineItem.totalCost || 0;
      acc[serviceType].totalActualCost += lineItem.actualTotalCost || 0;
      acc[serviceType].totalEstimatedProfit += (lineItem.totalPrice || 0) - (lineItem.totalCost || 0);
      acc[serviceType].totalActualProfit += lineItem.actualProfit || 0;

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and margins
    const profitability = Object.values(byServiceType).map((service: any) => ({
      ...service,
      avgRevenue: service.jobCount > 0 ? service.totalRevenue / service.jobCount : 0,
      avgEstimatedCost: service.jobCount > 0 ? service.totalEstimatedCost / service.jobCount : 0,
      avgActualCost: service.jobCount > 0 ? service.totalActualCost / service.jobCount : 0,
      estimatedMargin:
        service.totalRevenue > 0
          ? (service.totalEstimatedProfit / service.totalRevenue) * 100
          : 0,
      actualMargin:
        service.totalRevenue > 0 ? (service.totalActualProfit / service.totalRevenue) * 100 : 0,
    }));

    return {
      profitability,
      totalJobs: filteredLineItems.length,
    };
  },
});
