import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOrganization } from "./lib/permissions";

/**
 * JOB COMPLETION PROCESSING
 *
 * When a work order is completed:
 * 1. Calculate total hours by category (Production, Site Support, General Support)
 * 2. Calculate actual PPH using ONLY Production hours
 * 3. Calculate actual costs from time entries
 * 4. Calculate actual profit and margin
 * 5. Create performance record for feedback loop
 * 6. Update project with actuals
 * 7. Update service template statistics
 */

/**
 * Process job completion and calculate all actuals
 */
export const processJobCompletion = mutation({
  args: {
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    // Get work order
    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder || workOrder.organizationId !== orgId) {
      throw new Error("Work order not found");
    }

    // Get project
    const project = workOrder.projectId
      ? await ctx.db.get(workOrder.projectId)
      : null;

    // Get all completed time entries for this work order
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => q.eq(q.field("status"), "COMPLETED"))
      .collect();

    if (timeEntries.length === 0) {
      throw new Error("No completed time entries found");
    }

    // STEP 1: Calculate hours by category
    let productionHours = 0;
    let siteSupportHours = 0;
    let generalSupportHours = 0;
    let billableHours = 0;
    let totalHours = 0;

    for (const entry of timeEntries) {
      const hours = entry.durationHours || 0;
      totalHours += hours;

      if (entry.billable) {
        billableHours += hours;
      }

      if (entry.countsForPPH) {
        productionHours += hours;
      } else if (entry.taskCategory === "Site Support") {
        siteSupportHours += hours;
      } else {
        generalSupportHours += hours;
      }
    }

    // STEP 2: Calculate actual PPH (ONLY from Production hours)
    let actualPPH: number | undefined;
    if (project && project.adjustedScore && productionHours > 0) {
      actualPPH = project.adjustedScore / productionHours;
    }

    // STEP 3: Calculate actual costs from time entries
    const actualLaborCost = timeEntries.reduce(
      (sum, entry) => sum + (entry.laborCost || 0),
      0
    );
    const actualEquipmentCost = timeEntries.reduce(
      (sum, entry) => sum + (entry.equipmentCost || 0),
      0
    );
    const actualTotalCost = actualLaborCost + actualEquipmentCost;

    // STEP 4: Calculate actual profit and margin
    const clientPrice = project?.clientPrice || workOrder.contractAmount || 0;
    const actualProfit = clientPrice - actualTotalCost;
    const actualMargin = clientPrice > 0 ? (actualProfit / clientPrice) * 100 : 0;

    // STEP 5: Calculate variances (if project exists with estimates)
    let hoursVariance: number | undefined;
    let pphVariance: number | undefined;
    let costVariance: number | undefined;
    let profitVariance: number | undefined;
    let marginVariance: number | undefined;

    if (project) {
      if (project.estimatedHours) {
        hoursVariance = totalHours - project.estimatedHours;
      }
      if (project.standardPPH && actualPPH) {
        pphVariance = actualPPH - project.standardPPH;
      }
      if (project.estimatedCost) {
        costVariance = actualTotalCost - project.estimatedCost;
      }
      if (project.projectedProfit) {
        profitVariance = actualProfit - project.projectedProfit;
      }
      if (project.projectedMargin) {
        marginVariance = actualMargin - project.projectedMargin;
      }
    }

    // STEP 6: Update work order with actuals
    await ctx.db.patch(args.workOrderId, {
      status: "Completed",
      actualEndTime: Date.now(),
      totalJobHours: totalHours,
      updatedAt: Date.now(),
    });

    // STEP 7: Update project with actuals (if exists)
    if (project) {
      await ctx.db.patch(project._id, {
        actualProductionHours: productionHours,
        actualTotalHours: totalHours,
        actualPPH,
        actualCost: actualTotalCost,
        actualProfit,
        actualMargin,
        hoursVariance,
        pphVariance,
        costVariance,
        profitVariance,
        marginVariance,
        status: "Completed",
        updatedAt: Date.now(),
      });

      // STEP 8: Create performance record for feedback loop (if we have all required data)
      if (
        project.serviceTemplateId &&
        project.assignedLoadoutId &&
        project.adjustedScore &&
        actualPPH
      ) {
        const loadout = await ctx.db.get(project.assignedLoadoutId);

        await ctx.db.insert("performanceRecords", {
          organizationId: orgId,
          projectId: project._id,
          workOrderId: args.workOrderId,
          proposalId: workOrder.proposalId,

          serviceType: project.serviceType,
          formulaUsed: project.serviceType, // Should map to formula

          loadoutId: project.assignedLoadoutId,
          loadoutName: loadout?.name || "Unknown",

          baseScore: project.baseScore || project.adjustedScore,
          complexityMultiplier: project.complexityMultiplier || 1.0,
          adjustedScore: project.adjustedScore,
          afissFactors: project.afissFactors || [],

          actualProductionHours: productionHours,
          actualTotalHours: totalHours,
          actualPPH,

          standardPPH: project.standardPPH || 0,
          loadoutPPH: project.loadoutPPH || 0,
          pphVariance: pphVariance || 0,
          pphVariancePercent:
            project.loadoutPPH && pphVariance
              ? (pphVariance / project.loadoutPPH) * 100
              : 0,

          actualCost: actualTotalCost,
          estimatedCost: project.estimatedCost || 0,
          costVariance: costVariance || 0,

          clientPrice,
          actualProfit,
          actualMargin,
          projectedProfit: project.projectedProfit || 0,
          projectedMargin: project.projectedMargin || 0,

          driveTimeMinutes: project.driveTimeMinutes,

          includeInTemplateRecalc: true, // Default to include unless flagged as outlier
          outlier: false,

          completedAt: Date.now(),
          createdAt: Date.now(),
        });
      }
    }

    // STEP 9: Return summary
    return {
      success: true,
      workOrderId: args.workOrderId,
      projectId: project?._id,

      // Hours breakdown
      totalHours,
      productionHours,
      siteSupportHours,
      generalSupportHours,
      billableHours,
      billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
      productionPercentage: totalHours > 0 ? (productionHours / totalHours) * 100 : 0,

      // PPH
      adjustedScore: project?.adjustedScore,
      actualPPH,
      standardPPH: project?.standardPPH,
      pphVariance,

      // Costs
      actualLaborCost,
      actualEquipmentCost,
      actualTotalCost,
      estimatedCost: project?.estimatedCost,
      costVariance,

      // Profit
      clientPrice,
      actualProfit,
      actualMargin,
      projectedProfit: project?.projectedProfit,
      projectedMargin: project?.projectedMargin,
      profitVariance,
      marginVariance,

      // Entry count
      timeEntryCount: timeEntries.length,
    };
  },
});

/**
 * Get job completion summary without processing (preview)
 */
export const getJobSummary = query({
  args: {
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganization(ctx);

    // Get work order
    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder || workOrder.organizationId !== orgId) {
      throw new Error("Work order not found");
    }

    // Get project
    const project = workOrder.projectId
      ? await ctx.db.get(workOrder.projectId)
      : null;

    // Get all completed time entries
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => q.eq(q.field("status"), "COMPLETED"))
      .collect();

    // Calculate hours by category
    let productionHours = 0;
    let siteSupportHours = 0;
    let generalSupportHours = 0;
    let billableHours = 0;
    let totalHours = 0;

    const taskBreakdown: Record<
      string,
      { hours: number; cost: number; isBillable: boolean; countsForPPH: boolean }
    > = {};

    for (const entry of timeEntries) {
      const hours = entry.durationHours || 0;
      totalHours += hours;

      if (entry.billable) {
        billableHours += hours;
      }

      if (entry.countsForPPH) {
        productionHours += hours;
      } else if (entry.taskCategory === "Site Support") {
        siteSupportHours += hours;
      } else {
        generalSupportHours += hours;
      }

      // Task breakdown
      const taskName = entry.taskName || "Unknown";
      if (!taskBreakdown[taskName]) {
        taskBreakdown[taskName] = {
          hours: 0,
          cost: 0,
          isBillable: entry.billable,
          countsForPPH: entry.countsForPPH || false,
        };
      }
      taskBreakdown[taskName].hours += hours;
      taskBreakdown[taskName].cost += entry.totalCost || 0;
    }

    // Calculate actual PPH
    let actualPPH: number | undefined;
    if (project && project.adjustedScore && productionHours > 0) {
      actualPPH = project.adjustedScore / productionHours;
    }

    // Calculate costs
    const actualLaborCost = timeEntries.reduce(
      (sum, entry) => sum + (entry.laborCost || 0),
      0
    );
    const actualEquipmentCost = timeEntries.reduce(
      (sum, entry) => sum + (entry.equipmentCost || 0),
      0
    );
    const actualTotalCost = actualLaborCost + actualEquipmentCost;

    // Calculate profit
    const clientPrice = project?.clientPrice || workOrder.contractAmount || 0;
    const actualProfit = clientPrice - actualTotalCost;
    const actualMargin = clientPrice > 0 ? (actualProfit / clientPrice) * 100 : 0;

    return {
      workOrderId: args.workOrderId,
      projectId: project?._id,

      // Hours breakdown
      totalHours,
      productionHours,
      siteSupportHours,
      generalSupportHours,
      billableHours,
      billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
      productionPercentage: totalHours > 0 ? (productionHours / totalHours) * 100 : 0,

      // Task breakdown
      taskBreakdown: Object.entries(taskBreakdown).map(([taskName, data]) => ({
        taskName,
        ...data,
      })),

      // PPH
      adjustedScore: project?.adjustedScore,
      actualPPH,
      standardPPH: project?.standardPPH,
      pphVariance:
        actualPPH && project?.standardPPH ? actualPPH - project.standardPPH : undefined,

      // Costs
      actualLaborCost,
      actualEquipmentCost,
      actualTotalCost,
      estimatedCost: project?.estimatedCost,
      costVariance:
        project?.estimatedCost ? actualTotalCost - project.estimatedCost : undefined,

      // Profit
      clientPrice,
      actualProfit,
      actualMargin,
      projectedProfit: project?.projectedProfit,
      projectedMargin: project?.projectedMargin,
      profitVariance:
        project?.projectedProfit ? actualProfit - project.projectedProfit : undefined,
      marginVariance:
        project?.projectedMargin ? actualMargin - project.projectedMargin : undefined,

      // Entry count
      timeEntryCount: timeEntries.length,

      // Status
      canComplete: timeEntries.length > 0 && workOrder.status !== "Completed",
    };
  },
});
