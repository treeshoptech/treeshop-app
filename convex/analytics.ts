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

// 🎯 DOC WORKFLOW ANALYTICS

// Get Lead Stage KPIs
export const getLeadStageKPIs = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get all leads
    const allLeads = await ctx.db
      .query("projects")
      .withIndex("by_org_status", (q) => q.eq("organizationId", org._id).eq("status", "Lead"))
      .collect();

    const leads = allLeads.filter((lead) => {
      if (args.startDate && lead.createdAt < args.startDate) return false;
      if (args.endDate && lead.createdAt > args.endDate) return false;
      return true;
    });

    // Group by source
    const bySource = leads.reduce((acc, lead) => {
      const source = lead.leadSource || "Unknown";
      if (!acc[source]) {
        acc[source] = { count: 0, value: 0 };
      }
      acc[source].count += 1;
      acc[source].value += lead.estimatedValue || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Group by service type
    const byServiceType = leads.reduce((acc, lead) => {
      const service = lead.serviceType || "Unknown";
      if (!acc[service]) {
        acc[service] = { count: 0, value: 0 };
      }
      acc[service].count += 1;
      acc[service].value += lead.estimatedValue || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Calculate response times
    const responseTimes = leads
      .filter((l) => l.firstContactDate)
      .map((l) => ((l.firstContactDate || 0) - l.createdAt) / (1000 * 60 * 60)); // hours

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

    // Conversion rate (leads that became proposals)
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const converted = leads.filter((lead) =>
      allProjects.some(
        (p) => p.customerId === lead.customerId && p.status === "Proposal" && p.createdAt > lead.createdAt
      )
    ).length;

    const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0;

    return {
      totalLeads: leads.length,
      bySource: Object.entries(bySource).map(([source, data]) => ({
        source,
        count: data.count,
        value: data.value,
        avgValue: data.count > 0 ? data.value / data.count : 0,
      })),
      byServiceType: Object.entries(byServiceType).map(([service, data]) => ({
        service,
        count: data.count,
        value: data.value,
        avgValue: data.count > 0 ? data.value / data.count : 0,
      })),
      avgResponseTime,
      conversionRate,
      totalEstimatedValue: leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      avgLeadValue: leads.length > 0 ? leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / leads.length : 0,
    };
  },
});

// Get Proposal Stage KPIs
export const getProposalStageKPIs = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const allProposals = await ctx.db
      .query("projects")
      .withIndex("by_org_status", (q) => q.eq("organizationId", org._id).eq("status", "Proposal"))
      .collect();

    const proposals = allProposals.filter((p) => {
      if (args.startDate && p.createdAt < args.startDate) return false;
      if (args.endDate && p.createdAt > args.endDate) return false;
      return true;
    });

    // Time from lead to proposal
    const timeToProposal = proposals
      .filter((p) => p.leadDate)
      .map((p) => (p.createdAt - (p.leadDate || 0)) / (1000 * 60 * 60 * 24)); // days

    const avgTimeToProposal =
      timeToProposal.length > 0
        ? timeToProposal.reduce((sum, t) => sum + t, 0) / timeToProposal.length
        : 0;

    // Win rate (proposals that became work orders)
    const allWorkOrders = await ctx.db
      .query("projects")
      .withIndex("by_org_status", (q) => q.eq("organizationId", org._id).eq("status", "Work Order"))
      .collect();

    const won = proposals.filter((p) =>
      allWorkOrders.some((wo) => wo.customerId === p.customerId && wo.createdAt > p.createdAt)
    ).length;

    const winRate = proposals.length > 0 ? (won / proposals.length) * 100 : 0;

    // Group by service type
    const byServiceType = proposals.reduce((acc, p) => {
      const service = p.serviceType || "Unknown";
      if (!acc[service]) {
        acc[service] = { count: 0, value: 0, won: 0 };
      }
      acc[service].count += 1;
      acc[service].value += p.estimatedValue || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number; won: number }>);

    return {
      totalProposals: proposals.length,
      avgTimeToProposal,
      winRate,
      avgProposalValue:
        proposals.length > 0
          ? proposals.reduce((sum, p) => sum + (p.estimatedValue || 0), 0) / proposals.length
          : 0,
      totalProposalValue: proposals.reduce((sum, p) => sum + (p.estimatedValue || 0), 0),
      byServiceType: Object.entries(byServiceType).map(([service, data]) => ({
        service,
        count: data.count,
        value: data.value,
        avgValue: data.count > 0 ? data.value / data.count : 0,
      })),
    };
  },
});

// Get Work Order Stage KPIs
export const getWorkOrderStageKPIs = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const allWorkOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const workOrders = allWorkOrders.filter((wo) => {
      if (args.startDate && wo.createdAt < args.startDate) return false;
      if (args.endDate && wo.createdAt > args.endDate) return false;
      return true;
    });

    // Calculate completion rate
    const completed = workOrders.filter((wo) => wo.status === "Completed").length;
    const completionRate = workOrders.length > 0 ? (completed / workOrders.length) * 100 : 0;

    // Calculate on-time completion
    const onTime = workOrders.filter(
      (wo) => wo.status === "Completed" && wo.completedDate && wo.scheduledDate && wo.completedDate <= wo.scheduledDate
    ).length;
    const onTimeRate = completed > 0 ? (onTime / completed) * 100 : 0;

    // Average duration
    const durations = workOrders
      .filter((wo) => wo.status === "Completed" && wo.completedDate && wo.startedDate)
      .map((wo) => ((wo.completedDate || 0) - (wo.startedDate || 0)) / (1000 * 60 * 60 * 24)); // days

    const avgDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

    // Revenue tracking
    const totalRevenue = workOrders
      .filter((wo) => wo.status === "Completed")
      .reduce((sum, wo) => sum + (wo.contractAmount || 0), 0);

    // By service type
    const byServiceType = workOrders.reduce((acc, wo) => {
      const service = wo.serviceType || "Unknown";
      if (!acc[service]) {
        acc[service] = { count: 0, completed: 0, revenue: 0 };
      }
      acc[service].count += 1;
      if (wo.status === "Completed") {
        acc[service].completed += 1;
        acc[service].revenue += wo.contractAmount || 0;
      }
      return acc;
    }, {} as Record<string, { count: number; completed: number; revenue: number }>);

    return {
      totalWorkOrders: workOrders.length,
      active: workOrders.filter((wo) => wo.status === "In Progress").length,
      completed,
      completionRate,
      onTimeRate,
      avgDuration,
      totalRevenue,
      avgRevenue: completed > 0 ? totalRevenue / completed : 0,
      byServiceType: Object.entries(byServiceType).map(([service, data]) => ({
        service,
        count: data.count,
        completed: data.completed,
        revenue: data.revenue,
        completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
      })),
    };
  },
});

// 👥 CUSTOMER INTELLIGENCE ANALYTICS

// Get comprehensive customer metrics
export const getCustomerIntelligence = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Filter projects by date range
    const filteredProjects = projects.filter((p) => {
      if (args.startDate && p.createdAt < args.startDate) return false;
      if (args.endDate && p.createdAt > args.endDate) return false;
      return true;
    });

    // Calculate CLV and other metrics per customer
    const customerMetrics = customers.map((customer) => {
      const customerProjects = filteredProjects.filter((p) => p.customerId === customer._id);
      const completedProjects = customerProjects.filter((p) => p.status === "Completed");

      const totalRevenue = completedProjects.reduce((sum, p) => sum + (p.clientPrice || p.estimatedValue || 0), 0);
      const avgProjectValue = completedProjects.length > 0 ? totalRevenue / completedProjects.length : 0;

      // Calculate time since last service
      const lastProjectDate = Math.max(...customerProjects.map((p) => p.createdAt));
      const daysSinceLastService = (Date.now() - lastProjectDate) / (1000 * 60 * 60 * 24);

      // Service frequency (projects per year)
      const customerAge = (Date.now() - customer.createdAt) / (1000 * 60 * 60 * 24 * 365);
      const serviceFrequency = customerAge > 0 ? completedProjects.length / customerAge : 0;

      return {
        customerId: customer._id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        totalProjects: customerProjects.length,
        completedProjects: completedProjects.length,
        totalRevenue,
        avgProjectValue,
        daysSinceLastService,
        serviceFrequency,
        isRepeat: customerProjects.length > 1,
        customerType: customer.customerType,
      };
    });

    // Aggregate metrics
    const totalCustomers = customers.length;
    const repeatCustomers = customerMetrics.filter((c) => c.isRepeat).length;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    const totalRevenue = customerMetrics.reduce((sum, c) => sum + c.totalRevenue, 0);
    const avgCLV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    const atRiskCustomers = customerMetrics.filter((c) => c.daysSinceLastService > 365 && c.isRepeat).length;

    // Top customers by revenue
    const topCustomers = customerMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

    // By customer type
    const byType = customerMetrics.reduce((acc, c) => {
      const type = c.customerType || "Unknown";
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0, projects: 0 };
      }
      acc[type].count += 1;
      acc[type].revenue += c.totalRevenue;
      acc[type].projects += c.completedProjects;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; projects: number }>);

    return {
      totalCustomers,
      repeatCustomers,
      repeatRate,
      avgCLV,
      atRiskCustomers,
      topCustomers,
      byType: Object.entries(byType).map(([type, data]) => ({
        type,
        count: data.count,
        revenue: data.revenue,
        projects: data.projects,
        avgRevenue: data.count > 0 ? data.revenue / data.count : 0,
      })),
    };
  },
});

// 📈 STRATEGIC BUSINESS INTELLIGENCE

// Get comprehensive business dashboard
export const getBusinessDashboard = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Get all data
    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const employees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const loadouts = await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Filter by date range
    const filteredProjects = projects.filter((p) => {
      if (args.startDate && p.createdAt < args.startDate) return false;
      if (args.endDate && p.createdAt > args.endDate) return false;
      return true;
    });

    const filteredWorkOrders = workOrders.filter((wo) => {
      if (args.startDate && wo.createdAt < args.startDate) return false;
      if (args.endDate && wo.createdAt > args.endDate) return false;
      return true;
    });

    // Calculate key metrics
    const totalRevenue = filteredWorkOrders
      .filter((wo) => wo.status === "Completed")
      .reduce((sum, wo) => sum + (wo.contractAmount || 0), 0);

    const pipelineValue = filteredProjects
      .filter((p) => p.status === "Proposal")
      .reduce((sum, p) => sum + (p.estimatedValue || 0), 0);

    const backlogValue = filteredWorkOrders
      .filter((wo) => wo.status !== "Completed")
      .reduce((sum, wo) => sum + (wo.contractAmount || 0), 0);

    // Capacity utilization
    const availableEquipment = equipment.filter((eq) => eq.status === "Available").length;
    const totalEquipment = equipment.length;
    const equipmentUtilization =
      totalEquipment > 0 ? ((totalEquipment - availableEquipment) / totalEquipment) * 100 : 0;

    const activeEmployees = employees.filter((e) => e.employmentStatus === "Active").length;

    // Growth metrics (comparing to previous period)
    const periodLength = (args.endDate || Date.now()) - (args.startDate || 0);
    const previousPeriodStart = (args.startDate || 0) - periodLength;
    const previousPeriodEnd = args.startDate || 0;

    const previousProjects = projects.filter(
      (p) => p.createdAt >= previousPeriodStart && p.createdAt < previousPeriodEnd
    );

    const previousRevenue = workOrders
      .filter(
        (wo) =>
          wo.status === "Completed" &&
          wo.createdAt >= previousPeriodStart &&
          wo.createdAt < previousPeriodEnd
      )
      .reduce((sum, wo) => sum + (wo.contractAmount || 0), 0);

    const revenueGrowth =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      // Financial
      totalRevenue,
      pipelineValue,
      backlogValue,
      revenueGrowth,

      // Operations
      totalEquipment,
      availableEquipment,
      equipmentUtilization,
      activeEmployees,
      activeLoadouts: loadouts.filter((l) => l.isActive).length,

      // Projects
      totalLeads: filteredProjects.filter((p) => p.status === "Lead").length,
      totalProposals: filteredProjects.filter((p) => p.status === "Proposal").length,
      activeWorkOrders: filteredWorkOrders.filter((wo) => wo.status === "In Progress").length,
      completedWorkOrders: filteredWorkOrders.filter((wo) => wo.status === "Completed").length,

      // Customers
      totalCustomers: customers.length,
      newCustomers: customers.filter((c) => {
        if (args.startDate && c.createdAt < args.startDate) return false;
        if (args.endDate && c.createdAt > args.endDate) return false;
        return true;
      }).length,

      // Period info
      periodStart: args.startDate || 0,
      periodEnd: args.endDate || Date.now(),
    };
  },
});
