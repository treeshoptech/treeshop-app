import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getOrganization } from "./lib/auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Analytics queries for the Strategic Command Dashboard
 * Real-time business intelligence and performance metrics
 */

// Helper to get start of current month
function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

// Helper to get start of last month
function getStartOfLastMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
}

// Helper to get date N months ago
function getMonthsAgo(months: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - months, 1).getTime();
}

/**
 * Get monthly revenue tracking
 */
export const getMonthlyRevenue = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);
    const startOfMonth = getStartOfMonth();

    // Get completed projects this month (using totalPrice as revenue)
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startOfMonth),
          q.or(
            q.eq(q.field("status"), "Invoice"),
            q.eq(q.field("invoiceStatus"), "Paid")
          )
        )
      )
      .collect();

    const current = projects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);

    // Get last month's revenue
    const lastMonthStart = getStartOfLastMonth();
    const lastMonthProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), lastMonthStart),
          q.lt(q.field("createdAt"), startOfMonth),
          q.or(
            q.eq(q.field("status"), "Invoice"),
            q.eq(q.field("invoiceStatus"), "Paid")
          )
        )
      )
      .collect();

    const lastMonth = lastMonthProjects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);

    // No target - show actual revenue only
    return { current, lastMonth };
  },
});

/**
 * Get pipeline value and metrics
 */
export const getPipeline = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Get all proposals
    const proposals = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) => q.eq(q.field("status"), "Proposal"))
      .collect();

    const totalValue = proposals.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
    const proposalCount = proposals.length;

    // Calculate actual win rate from historical data
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const wonProjects = allProjects.filter((p) =>
      p.status === "Work Order" || p.status === "Invoice" || p.workOrderStatus === "Completed"
    ).length;

    const totalProposals = allProjects.filter((p) => p.status === "Proposal").length + wonProjects;
    const winRate = totalProposals > 0 ? Math.round((wonProjects / totalProposals) * 100) : 0;

    // Expected value = total × win rate
    const expectedValue = totalValue * (winRate / 100);

    return {
      totalValue,
      proposalCount,
      winRate,
      expectedValue,
    };
  },
});

/**
 * Get crew utilization percentage
 */
export const getCrewUtilization = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Get all employees
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Calculate available hours (30 days × 8 hrs × employee count)
    const totalAvailableHours = employees.length * 30 * 8;

    // Get projects in progress this month
    const startOfMonth = getStartOfMonth();
    const activeProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startOfMonth),
          q.eq(q.field("status"), "Work Order")
        )
      )
      .collect();

    // Estimate hours used (would track actual hours in real system)
    // For now, assume each active project uses average 40 hours
    const estimatedHoursUsed = activeProjects.length * 40;

    const utilization = totalAvailableHours > 0
      ? Math.min((estimatedHoursUsed / totalAvailableHours) * 100, 100)
      : 0;

    return {
      utilization: Math.round(utilization),
      availableHours: totalAvailableHours,
      usedHours: estimatedHoursUsed,
    };
  },
});

/**
 * Get map data for territory intelligence
 */
export const getMapData = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Use organization coordinates or default to New Smyrna Beach, FL
    const center = org.coordinates || { lat: 29.0258, lng: -80.9270 };

    // Get completed projects with location data
    const completedProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "Invoice"),
          q.eq(q.field("workOrderStatus"), "Completed")
        )
      )
      .collect();

    // Filter projects with coordinates only (real data)
    const projectsWithCoords = completedProjects.filter((p) => p.coordinates);
    const revenueHeatmap = projectsWithCoords.map((p) => ({
      lat: p.coordinates!.lat,
      lng: p.coordinates!.lng,
      revenue: p.estimatedValue || 0,
    }));

    // Get active projects with coordinates
    const activeProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) => q.eq(q.field("status"), "Work Order"))
      .collect();

    const activeJobs = activeProjects
      .filter((p) => p.coordinates)
      .map((p) => ({
        id: p._id,
        lat: p.coordinates!.lat,
        lng: p.coordinates!.lng,
        customerName: p.customerName || "Unknown",
        revenue: p.estimatedValue || 0,
        status: p.workOrderStatus || "In Progress",
      }));

    // Create 100-mile radius service area from organization location
    // 100 miles ≈ 160,934 meters
    const serviceAreaRadius = 160934;

    // No mock data - show real service area or nothing
    const serviceAreas = [];

    // No mock opportunity zones - these would be calculated from actual data
    const opportunityZones: any[] = [];

    return {
      center,
      revenueHeatmap,
      activeJobs,
      serviceAreas,
      opportunityZones,
      serviceAreaRadius, // 100 miles in meters
      stats: {
        completedJobs: completedProjects.length,
        activeJobs: activeProjects.length,
        opportunityZones: 0,
      },
    };
  },
});

/**
 * Get revenue forecast data
 */
export const getRevenueForecast = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Get last 12 months of revenue
    const twelveMonthsAgo = getMonthsAgo(12);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), twelveMonthsAgo),
          q.or(
            q.eq(q.field("status"), "Invoice"),
            q.eq(q.field("invoiceStatus"), "Paid")
          )
        )
      )
      .collect();

    // Group by month
    const monthlyData = new Map<string, number>();
    projects.forEach((p) => {
      const date = new Date(p.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, (monthlyData.get(key) || 0) + (p.estimatedValue || 0));
    });

    // Build chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const chartData = [];

    // Last 6 months (actual)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      chartData.push({
        month: months[date.getMonth()],
        actual: monthlyData.get(key) || 0,
        forecast: null,
        forecastHigh: null,
        forecastLow: null,
      });
    }

    // Next 6 months (forecast)
    const avgRevenue = Array.from(monthlyData.values()).reduce((a, b) => a + b, 0) / monthlyData.size;
    const growthRate = 0.05; // 5% growth assumption

    for (let i = 1; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const forecastValue = avgRevenue * Math.pow(1 + growthRate, i);
      chartData.push({
        month: months[date.getMonth()],
        actual: null,
        forecast: forecastValue,
        forecastHigh: forecastValue * 1.15,
        forecastLow: forecastValue * 0.85,
      });
    }

    return {
      chartData,
      confidence: 87,
      nextMonth: chartData[6]?.forecast || 0,
      sixMonth: chartData.slice(6).reduce((sum, d) => sum + (d.forecast || 0), 0),
      trend: 'growing',
    };
  },
});

/**
 * Get loadout performance metrics
 */
export const getLoadoutPerformance = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    const loadouts = await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Get projects completed in last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), thirtyDaysAgo),
          q.or(
            q.eq(q.field("status"), "Invoice"),
            q.eq(q.field("workOrderStatus"), "Completed")
          )
        )
      )
      .collect();

    return loadouts.map((loadout) => {
      // Calculate actual performance from real project data
      const loadoutProjects = recentProjects.filter((p) => p.loadoutId === loadout._id);
      const jobCount = loadoutProjects.length;
      const revenueGenerated = loadoutProjects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);

      // Calculate utilization (would need time tracking data)
      const estimatedHoursUsed = loadoutProjects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
      const availableHours = 30 * 8; // 30 days × 8 hours
      const utilization = availableHours > 0 ? Math.min((estimatedHoursUsed / availableHours) * 100, 100) : 0;

      // Calculate average margin (would come from actual cost tracking)
      const avgMargin = loadoutProjects.length > 0
        ? loadoutProjects.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / loadoutProjects.length
        : 0;

      const actualPPH = loadout.productionRatePPH; // Would calculate from actual time tracking

      return {
        id: loadout._id,
        name: loadout.name,
        serviceTypes: [loadout.serviceType],
        utilization: Math.round(utilization),
        utilizationTrend: 0, // Would calculate from historical data
        revenueGenerated,
        avgMargin,
        actualPPH,
        estimatedPPH: loadout.productionRatePPH,
        pphPerformance: 0, // Would calculate from actual vs estimated
        roi: 0, // Would calculate from revenue vs costs
        jobsCompleted: jobCount,
        recommendation: {
          label: jobCount === 0 ? 'No Data' : utilization >= 85 ? '🚀 Scale Up' : utilization < 60 ? '⚠️ Underutilized' : '✅ Performing',
          type: jobCount === 0 ? 'default' : utilization >= 85 ? 'success' : utilization < 60 ? 'warning' : 'info',
        },
      };
    });
  },
});

/**
 * Get growth opportunities (AI-powered recommendations)
 */
export const getGrowthOpportunities = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Real data-driven opportunities (would be ML-powered in production)
    const opportunities: any[] = [];

    // Get all projects to analyze patterns
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    // Analyze service type demand
    const serviceTypeCounts: Record<string, number> = {};
    allProjects.forEach((p) => {
      if (p.serviceType) {
        serviceTypeCounts[p.serviceType] = (serviceTypeCounts[p.serviceType] || 0) + 1;
      }
    });

    // Get loadouts to see what services are covered
    const loadouts = await ctx.db
      .query("loadouts")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    const coveredServices = new Set(loadouts.map((l) => l.serviceType));

    // Check for high-demand services without dedicated loadout
    Object.entries(serviceTypeCounts).forEach(([serviceType, count]) => {
      if (count >= 5 && !coveredServices.has(serviceType)) {
        opportunities.push({
          title: `Add Dedicated ${serviceType} Loadout`,
          description: `${count} ${serviceType} projects in your history, but no dedicated loadout configured. Adding specialized equipment could increase efficiency.`,
          impact: "Medium",
          projectedRevenue: count * 500, // Conservative estimate
          category: "Service Expansion",
          confidence: 75,
        });
      }
    });

    return opportunities;
  },
});

// ============================================================================
// JOB PERFORMANCE METRICS - Track Actual vs Estimated
// ============================================================================

/**
 * Create job performance metrics entry when work order completes
 * Captures actual vs estimated for time, cost, and profitability
 */
export const createJobPerformanceMetrics = mutation({
  args: {
    projectId: v.id("projects"),
    loadoutId: v.id("loadouts"),

    // Time variance
    estimatedProductionHours: v.number(),
    actualProductionHours: v.number(),
    estimatedTransportHours: v.number(),
    actualTransportHours: v.number(),
    estimatedBufferHours: v.number(),
    actualBufferHours: v.number(),
    estimatedTotalHours: v.number(),
    actualTotalHours: v.number(),
    productionVariancePercent: v.number(),

    // Cost variance
    estimatedLaborCost: v.number(),
    actualLaborCost: v.number(),
    estimatedEquipmentCost: v.number(),
    actualEquipmentCost: v.number(),
    estimatedOverheadCost: v.number(),
    actualOverheadCost: v.number(),
    estimatedTotalCost: v.number(),
    actualTotalCost: v.number(),
    totalCostVariancePercent: v.number(),

    // Profitability
    estimatedRevenue: v.number(),
    actualRevenue: v.number(),
    targetMargin: v.number(),
    actualMargin: v.number(),
    targetProfit: v.number(),
    actualProfit: v.number(),
    profitVariancePercent: v.number(),

    // TreeShop Score accuracy
    estimatedTreeShopScore: v.number(),
    actualTreeShopScore: v.optional(v.number()),

    // Site conditions
    weatherCondition: v.optional(v.string()),
    temperature: v.optional(v.number()),
    windSpeed: v.optional(v.number()),
    precipitation: v.optional(v.number()),
    siteAccessDifficulty: v.optional(v.number()), // 1-5 scale
    groundCondition: v.optional(v.string()),
    unexpectedObstacles: v.optional(v.string()),
    customerAvailability: v.optional(v.string()),

    // Quality metrics
    reworkRequired: v.optional(v.boolean()),
    customerSatisfaction: v.optional(v.number()), // 1-5 scale
    safetyIncidents: v.optional(v.number()),

    // ML scores (auto-calculated)
    accuracyScore: v.number(), // 0-100
    efficiencyScore: v.number(), // 0-100
    profitabilityScore: v.number(), // 0-100
    overallPerformanceScore: v.number(), // 0-100

    // Training data quality
    includeInTraining: v.boolean(),
    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const metricsId = await ctx.db.insert("jobPerformanceMetrics", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Trigger ML training data generation (async)
    ctx.scheduler.runAfter(0, "analytics:generateMLTrainingData" as any, {
      jobMetricsId: metricsId,
    });

    return metricsId;
  },
});

/**
 * Get job performance metrics for a project
 */
export const getJobPerformanceMetrics = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobPerformanceMetrics")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

/**
 * Get all job performance metrics for analytics dashboard
 */
export const getAllJobPerformanceMetrics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    minAccuracyScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("jobPerformanceMetrics").collect();

    if (args.startDate) {
      results = results.filter(m => m.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      results = results.filter(m => m.createdAt <= args.endDate!);
    }

    if (args.minAccuracyScore !== undefined) {
      results = results.filter(m => m.accuracyScore >= args.minAccuracyScore!);
    }

    return results;
  },
});

// ============================================================================
// EQUIPMENT UTILIZATION LOGS - Track Equipment Usage Per Job
// ============================================================================

/**
 * Create equipment utilization log for each piece of equipment on a job
 */
export const createEquipmentUtilizationLog = mutation({
  args: {
    projectId: v.id("projects"),
    loadoutId: v.id("loadouts"),
    equipmentId: v.id("equipment"),

    // Time tracking
    startTime: v.number(),
    endTime: v.number(),
    totalHours: v.number(),
    productiveHours: v.number(),
    idleHours: v.number(),
    maintenanceHours: v.number(),
    transportHours: v.number(),
    utilizationRate: v.number(), // productive / total

    // Production metrics
    actualProductionRate: v.optional(v.number()),
    expectedProductionRate: v.optional(v.number()),
    efficiencyRatio: v.optional(v.number()),

    // Fuel tracking
    fuelGallonsUsed: v.optional(v.number()),
    fuelCost: v.optional(v.number()),
    fuelEfficiencyGPH: v.optional(v.number()),

    // Financial performance
    equipmentCostPerHour: v.number(),
    totalEquipmentCost: v.number(),
    revenueGenerated: v.number(),
    profitGenerated: v.number(),
    roi: v.number(),

    // Conditions
    operatorId: v.optional(v.id("employees")),
    weatherCondition: v.optional(v.string()),
    terrainType: v.optional(v.string()),

    // Issues
    mechanicalIssues: v.optional(v.string()),
    downtimeMinutes: v.optional(v.number()),
    maintenanceRequired: v.optional(v.boolean()),

    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("equipmentUtilizationLogs", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get equipment utilization logs for a project
 */
export const getEquipmentUtilizationLogs = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("equipmentUtilizationLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich with equipment details
    return await Promise.all(logs.map(async (log) => {
      const equipment = await ctx.db.get(log.equipmentId);
      return { ...log, equipment };
    }));
  },
});

/**
 * Get equipment utilization analytics by equipment ID
 */
export const getEquipmentUtilizationAnalytics = query({
  args: {
    equipmentId: v.id("equipment"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("equipmentUtilizationLogs")
      .withIndex("by_equipment", (q) => q.eq("equipmentId", args.equipmentId))
      .collect();

    if (args.startDate) {
      logs = logs.filter(l => l.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      logs = logs.filter(l => l.createdAt <= args.endDate!);
    }

    const totalHours = logs.reduce((sum, l) => sum + l.totalHours, 0);
    const productiveHours = logs.reduce((sum, l) => sum + l.productiveHours, 0);
    const idleHours = logs.reduce((sum, l) => sum + l.idleHours, 0);
    const totalCost = logs.reduce((sum, l) => sum + l.totalEquipmentCost, 0);
    const totalRevenue = logs.reduce((sum, l) => sum + l.revenueGenerated, 0);
    const totalProfit = logs.reduce((sum, l) => sum + l.profitGenerated, 0);
    const avgUtilization = logs.length > 0
      ? logs.reduce((sum, l) => sum + l.utilizationRate, 0) / logs.length
      : 0;

    return {
      equipmentId: args.equipmentId,
      jobCount: logs.length,
      totalHours,
      productiveHours,
      idleHours,
      avgUtilization,
      totalCost,
      totalRevenue,
      totalProfit,
      roi: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
      logs,
    };
  },
});

// ============================================================================
// EMPLOYEE PRODUCTIVITY LOGS - Track Individual Performance
// ============================================================================

/**
 * Create employee productivity log for each employee on a job
 */
export const createEmployeeProductivityLog = mutation({
  args: {
    projectId: v.id("projects"),
    loadoutId: v.id("loadouts"),
    employeeId: v.id("employees"),

    // Time tracking
    startTime: v.number(),
    endTime: v.number(),
    totalHours: v.number(),
    productiveHours: v.number(),
    breakHours: v.number(),
    travelHours: v.number(),
    trainingHours: v.optional(v.number()),

    // Role and responsibilities
    role: v.string(), // "Operator", "Ground Crew", "Climber", etc.
    primaryTask: v.optional(v.string()),
    equipmentOperated: v.optional(v.array(v.id("equipment"))),

    // Performance metrics
    workQualityScore: v.optional(v.number()), // 1-5 scale
    safetyScore: v.optional(v.number()), // 1-5 scale
    teamworkScore: v.optional(v.number()), // 1-5 scale
    efficiencyScore: v.optional(v.number()), // 1-5 scale

    // Production metrics (service-specific)
    treesRemoved: v.optional(v.number()),
    stumpsGround: v.optional(v.number()),
    acresMulched: v.optional(v.number()),

    // Financial performance
    hourlyRate: v.number(),
    laborCost: v.number(),
    revenueGenerated: v.number(),
    profitGenerated: v.number(),
    profitPerHour: v.number(),

    // Issues and notes
    safetyIncidents: v.optional(v.number()),
    performanceIssues: v.optional(v.string()),
    positiveNotes: v.optional(v.string()),
    trainingNeeds: v.optional(v.string()),

    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("employeeProductivityLogs", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get employee productivity logs for a project
 */
export const getEmployeeProductivityLogs = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("employeeProductivityLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich with employee details
    return await Promise.all(logs.map(async (log) => {
      const employee = await ctx.db.get(log.employeeId);
      return { ...log, employee };
    }));
  },
});

/**
 * Get employee productivity analytics by employee ID
 */
export const getEmployeeProductivityAnalytics = query({
  args: {
    employeeId: v.id("employees"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("employeeProductivityLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    if (args.startDate) {
      logs = logs.filter(l => l.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      logs = logs.filter(l => l.createdAt <= args.endDate!);
    }

    const totalHours = logs.reduce((sum, l) => sum + l.totalHours, 0);
    const productiveHours = logs.reduce((sum, l) => sum + l.productiveHours, 0);
    const totalCost = logs.reduce((sum, l) => sum + l.laborCost, 0);
    const totalRevenue = logs.reduce((sum, l) => sum + l.revenueGenerated, 0);
    const totalProfit = logs.reduce((sum, l) => sum + l.profitGenerated, 0);

    const avgQuality = logs.filter(l => l.workQualityScore).length > 0
      ? logs.filter(l => l.workQualityScore).reduce((sum, l) => sum + l.workQualityScore!, 0) / logs.filter(l => l.workQualityScore).length
      : 0;

    const avgSafety = logs.filter(l => l.safetyScore).length > 0
      ? logs.filter(l => l.safetyScore).reduce((sum, l) => sum + l.safetyScore!, 0) / logs.filter(l => l.safetyScore).length
      : 0;

    return {
      employeeId: args.employeeId,
      jobCount: logs.length,
      totalHours,
      productiveHours,
      utilizationRate: totalHours > 0 ? (productiveHours / totalHours) * 100 : 0,
      totalCost,
      totalRevenue,
      totalProfit,
      profitPerHour: totalHours > 0 ? totalProfit / totalHours : 0,
      avgQualityScore: avgQuality,
      avgSafetyScore: avgSafety,
      logs,
    };
  },
});

// ============================================================================
// WEATHER DATA LOGS - Historical Weather for ML Correlation
// ============================================================================

/**
 * Create weather data log for a project (typically at job start)
 */
export const createWeatherDataLog = mutation({
  args: {
    projectId: v.id("projects"),
    timestamp: v.number(),
    latitude: v.number(),
    longitude: v.number(),

    // Core weather metrics
    temperatureF: v.number(),
    feelsLikeF: v.optional(v.number()),
    precipitationInches: v.number(),
    precipitationType: v.optional(v.string()), // "rain", "snow", "sleet"
    windSpeedMPH: v.number(),
    windGustMPH: v.optional(v.number()),
    windDirection: v.optional(v.string()),
    humidity: v.number(), // 0-100%
    cloudCover: v.optional(v.number()), // 0-100%
    visibility: v.optional(v.number()), // miles
    uvIndex: v.optional(v.number()),

    // Conditions
    condition: v.string(), // "Clear", "Cloudy", "Rain", etc.
    isExtremeHeat: v.boolean(), // >95°F
    isExtremeCold: v.boolean(), // <32°F
    isHighWind: v.boolean(), // >25mph
    isHeavyRain: v.boolean(), // >0.1in/hr
    isSevereWeather: v.boolean(), // storms, extreme conditions

    // Air quality
    airQualityIndex: v.optional(v.number()),

    // Source
    dataSource: v.optional(v.string()), // "OpenWeatherMap", "NOAA", "Manual"

    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("weatherDataLogs", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get weather data for a project
 */
export const getWeatherDataLogs = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weatherDataLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// ============================================================================
// CUSTOMER BEHAVIOR LOGS - Track Customer Interaction Patterns
// ============================================================================

/**
 * Create customer behavior log (called on various customer events)
 */
export const createCustomerBehaviorLog = mutation({
  args: {
    customerId: v.id("customers"),
    projectId: v.optional(v.id("projects")),

    eventType: v.string(), // "Lead Created", "Proposal Viewed", "Quote Accepted", etc.
    eventTimestamp: v.number(),

    // Response metrics
    responseTimeHours: v.optional(v.number()), // Time to respond to outreach
    decisionTimeHours: v.optional(v.number()), // Time from proposal to decision

    // Engagement
    proposalViewCount: v.optional(v.number()),
    proposalViewDuration: v.optional(v.number()), // seconds
    questionsAsked: v.optional(v.number()),
    priceNegotiation: v.optional(v.boolean()),

    // Channel
    communicationChannel: v.optional(v.string()), // "Phone", "Email", "Text", "In-Person"

    // Engagement score (auto-calculated)
    engagementScore: v.optional(v.number()), // 0-100

    // Customer lifetime metrics (at time of event)
    totalProjectsToDate: v.number(),
    totalRevenueToDate: v.number(),
    avgProjectValue: v.optional(v.number()),
    customerLifetimeDays: v.number(),

    // Referral tracking
    referralSource: v.optional(v.string()),
    referredOthers: v.optional(v.number()),

    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("customerBehaviorLogs", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get customer behavior logs for a customer
 */
export const getCustomerBehaviorLogs = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerBehaviorLogs")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

/**
 * Get customer behavior analytics
 */
export const getCustomerBehaviorAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("customerBehaviorLogs").collect();

    if (args.startDate) {
      logs = logs.filter(l => l.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      logs = logs.filter(l => l.createdAt <= args.endDate!);
    }

    const avgResponseTime = logs.filter(l => l.responseTimeHours).length > 0
      ? logs.filter(l => l.responseTimeHours).reduce((sum, l) => sum + l.responseTimeHours!, 0) / logs.filter(l => l.responseTimeHours).length
      : 0;

    const avgDecisionTime = logs.filter(l => l.decisionTimeHours).length > 0
      ? logs.filter(l => l.decisionTimeHours).reduce((sum, l) => sum + l.decisionTimeHours!, 0) / logs.filter(l => l.decisionTimeHours).length
      : 0;

    return {
      totalEvents: logs.length,
      avgResponseTime,
      avgDecisionTime,
      eventsByType: logs.reduce((acc, log) => {
        acc[log.eventType] = (acc[log.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      logs,
    };
  },
});

// ============================================================================
// ML PREDICTIONS - Store and Track Predictions
// ============================================================================

/**
 * Create ML prediction (called when model makes a prediction)
 */
export const createMLPrediction = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    modelVersion: v.string(),
    predictionType: v.string(), // "JobHours", "JobCost", "CustomerLTV", etc.

    predictedValue: v.number(),
    confidenceScore: v.number(), // 0-100

    // Input features used
    inputFeatures: v.any(),

    // Top contributing features (for explainability)
    topFeatures: v.optional(v.array(v.object({
      featureName: v.string(),
      importance: v.number(),
      value: v.any(),
    }))),

    // Actual value (filled in later for accuracy tracking)
    actualValue: v.optional(v.number()),
    predictionError: v.optional(v.number()),
    absoluteError: v.optional(v.number()),

    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("mlPredictions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update ML prediction with actual value (after job completes)
 */
export const updateMLPrediction = mutation({
  args: {
    predictionId: v.id("mlPredictions"),
    actualValue: v.number(),
  },

  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.predictionId);
    if (!prediction) throw new Error("Prediction not found");

    const predictionError = args.actualValue - prediction.predictedValue;
    const absoluteError = Math.abs(predictionError);

    await ctx.db.patch(args.predictionId, {
      actualValue: args.actualValue,
      predictionError,
      absoluteError,
      updatedAt: Date.now(),
    });

    return { predictionError, absoluteError };
  },
});

/**
 * Get ML predictions for a project
 */
export const getMLPredictions = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mlPredictions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// ============================================================================
// ML MODEL PERFORMANCE - Track Model Accuracy Over Time
// ============================================================================

/**
 * Create or update ML model performance metrics
 */
export const updateMLModelPerformance = mutation({
  args: {
    modelVersion: v.string(),
    modelType: v.string(), // "JobHours", "JobCost", etc.

    // Training metrics
    accuracy: v.number(),
    precision: v.optional(v.number()),
    recall: v.optional(v.number()),
    f1Score: v.optional(v.number()),

    // Error metrics
    maeError: v.number(), // Mean Absolute Error
    rmseError: v.number(), // Root Mean Squared Error
    mapeError: v.number(), // Mean Absolute Percentage Error

    // Real-world performance (from actual predictions)
    realWorldAccuracy: v.optional(v.number()),
    predictionCount: v.number(),

    // Training details
    trainingDataCount: v.number(),
    featureCount: v.number(),
    hyperparameters: v.optional(v.any()),

    status: v.string(), // "Training", "Testing", "Deployed", "Deprecated"

    notes: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // Check if model version already exists
    const existing = await ctx.db
      .query("mlModelPerformance")
      .withIndex("by_model_version", (q) =>
        q.eq("modelVersion", args.modelVersion).eq("modelType", args.modelType)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("mlModelPerformance", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Get all ML model performance metrics
 */
export const getAllMLModelPerformance = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let models = await ctx.db.query("mlModelPerformance").collect();

    if (args.status) {
      models = models.filter(m => m.status === args.status);
    }

    return models;
  },
});

/**
 * Get latest ML model performance by type
 */
export const getLatestMLModelPerformance = query({
  args: { modelType: v.string() },
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("mlModelPerformance")
      .withIndex("by_model_type", (q) => q.eq("modelType", args.modelType))
      .collect();

    // Return the most recently updated model
    return models.sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;
  },
});
