# TreeShop Two-Tier Pricing System - Implementation Complete

## Overview

The Two-Tier Pricing System has been successfully implemented in TreeShop, separating **pricing consistency** (Tier 1) from **operational execution** (Tier 2). This creates a simpler, more productive workflow while maintaining accurate cost tracking and profit margins.

---

## What Changed

### **Before (Old System)**
- Proposals required selecting a loadout (crew + equipment)
- Price was tied to the specific crew assigned
- Changing crew assignment meant changing client price
- Loadouts were used for both pricing AND operations
- Complex to manage and prone to pricing inconsistencies

### **After (Two-Tier System)**
- **Tier 1 (Service Templates)**: Company-wide pricing standards for proposals
- **Tier 2 (Loadouts)**: Actual crew configurations for work execution
- Client price is **LOCKED** when proposal is created
- Crew assignment happens at work order phase without changing price
- Simple, consistent, and operationally flexible

---

## Architecture

### **Tier 1: Service Templates (Pricing Engine)**

Service templates provide stable, company-wide pricing standards.

**Schema: `serviceTemplates`**
```typescript
{
  serviceType: "Forestry Mulching",
  formulaUsed: "MulchingScore",
  standardPPH: 1.3,               // Company average PPH
  standardCostPerHour: 247.50,     // Company average cost
  standardBillingRate: 450.00,     // What customers pay
  targetMargin: 45,                // For reporting only
  lastRecalculated: timestamp,     // When template was last updated
  totalJobsInAverage: 25,          // How many jobs in the average
  confidenceScore: 87,             // Data reliability (0-100)
}
```

**Key Functions:**
- `serviceTemplates.list()` - Get all templates
- `serviceTemplates.getByServiceType()` - Get template for a service
- `serviceTemplates.create()` - Create new template
- `serviceTemplates.update()` - Update template manually
- `serviceTemplates.recalculateFromHistory()` - Feedback loop update

### **Tier 2: Loadouts (Operational Engine)**

Loadouts track actual crew configurations and performance.

**Enhanced `loadouts` Schema:**
```typescript
{
  name: "Crew Alpha - Primary Mulching",
  assignedEmployees: [
    { employeeId, name, role, tier, hourlyRate, trueCostPerHour }
  ],
  assignedEquipment: [
    { equipmentId, name, type, costPerHour }
  ],
  baseCostPerHour: 265.00,         // Actual crew cost
  productionRates: {
    "Forestry Mulching": 1.4,      // Crew-specific PPH
    "Land Clearing": 1.2,
  },
  status: "Available" | "On Job" | "Maintenance",
  currentProjectId: optional,
  avgActualPPH: 1.38,              // Historical average
  avgProfitMargin: 47.2,           // Historical margin
}
```

### **Enhanced `projects` Schema**

Projects now track both pricing (Tier 1) and operational (Tier 2) data.

**New Fields:**
```typescript
{
  // Work Score
  baseScore: 40.0,                 // Property measurement (acres × DBH)
  complexityMultiplier: 1.27,      // AFISS multiplier
  adjustedScore: 50.8,             // Final work score

  // Tier 1: Service Template (LOCKED at proposal)
  serviceTemplateId: Id<"serviceTemplates">,
  standardPPH: 1.3,                // Snapshot from template
  standardCostPerHour: 247.50,
  standardBillingRate: 450.00,
  estimatedHours: 39.1,            // adjustedScore ÷ standardPPH
  estimatedCost: 9,677.25,
  clientPrice: 17,595.00,          // 🔒 LOCKED

  // Tier 2: Loadout Assignment (at work order)
  assignedLoadoutId: Id<"loadouts">,
  loadoutPPH: 1.4,                 // Crew-specific PPH
  loadoutCostPerHour: 265.00,
  projectedHours: 36.3,            // adjustedScore ÷ loadoutPPH
  projectedCost: 9,619.50,
  projectedProfit: 7,975.50,
  projectedMargin: 45.3,           // Better than standard!

  // Actuals (from job completion)
  actualProductionHours: 38.5,
  actualPPH: 1.32,                 // Close to standard
  actualCost: 10,202.50,
  actualProfit: 7,392.50,
  actualMargin: 42.0,              // Slightly under target
}
```

### **Performance Records**

Historical data for the feedback loop.

**Schema: `performanceRecords`**
```typescript
{
  projectId: Id<"projects">,
  serviceType: "Forestry Mulching",
  loadoutId: Id<"loadouts">,
  adjustedScore: 50.8,
  actualProductionHours: 38.5,
  actualPPH: 1.32,
  standardPPH: 1.3,
  loadoutPPH: 1.4,
  pphVariance: -0.08,              // actualPPH - loadoutPPH
  actualCost: 10,202.50,
  clientPrice: 17,595.00,
  actualMargin: 42.0,
  includeInTemplateRecalc: true,   // Use for feedback loop
}
```

---

## Workflows

### **Phase 1: Proposal Creation**

**User Experience:**
1. Customer selects service (e.g., Forestry Mulching)
2. Enters job details (acres, DBH package, AFISS factors)
3. System calculates work score and pricing **automatically** using service template
4. Client price is displayed and **locked**
5. No crew selection needed - pricing is consistent

**Calculator Changes:**
- **OLD**: Required loadout selection → price varied by crew
- **NEW**: Uses service template → price is consistent company-wide
- Shows locked pricing with: "🔒 Price won't change with crew assignment"

**Example (Mulching):**
```
Input: 5 acres × 8" DBH package × 1.15 AFISS = 46 MS

Calculation (using service template):
- standardPPH: 1.3
- Estimated Hours: 46 ÷ 1.3 = 35.4 hours
- Client Price: 35.4 × $450/hr = $15,930 🔒 LOCKED

NO loadout selection required!
```

### **Phase 2: Work Order Assignment**

**When:** Proposal is accepted → create work order

**User Experience:**
1. Manager creates work order from accepted proposal
2. **NOW** selects which loadout (crew) will do the job
3. System calculates projected margins based on crew selection
4. Manager sees if this crew will hit/beat/miss target margin
5. Can add flex resources (extra equipment or labor)
6. Schedule the job

**Projected Margin Calculation:**
```
Client Price: $15,930 (locked from proposal)
Assigned Loadout: "Crew Alpha" (1.4 PPH, $265/hr)

Projected Hours: 46 MS ÷ 1.4 PPH = 32.9 hours
Projected Cost: 32.9 × $265 = $8,718.50
Projected Profit: $15,930 - $8,718.50 = $7,211.50
Projected Margin: 45.3%  ✅ Beats target!
```

### **Phase 3: Job Execution**

**During the job:**
1. Crew clocks in/out with time tracking
2. System tracks production hours separately from support hours
3. Only **production time** counts for PPH calculation
4. Transport, setup, breaks are tracked but don't affect PPH

**Time Entry Categories:**
- **Production**: Counts toward PPH (actual work on job)
- **Transport**: Drive time (doesn't count for PPH)
- **Setup/Teardown**: Site prep (doesn't count)
- **Break**: Lunch, rest (doesn't count)
- **Maintenance**: Equipment issues (doesn't count)

### **Phase 4: Job Completion & Feedback**

**When job completes:**
1. System calculates actual PPH: `actualPPH = adjustedScore ÷ productionHours`
2. Calculates actual costs from time entries
3. Creates performance record
4. Compares actuals vs projections
5. Flags for feedback loop if within normal range

**Example Completion:**
```
Actual Production Hours: 34.2 hours
Actual Total Hours: 38.5 hours (includes 3.5 transport + 0.8 breaks)
Actual PPH: 46 MS ÷ 34.2 = 1.35 PPH

Actual Cost: 38.5 × $265 = $10,202.50
Actual Profit: $15,930 - $10,202.50 = $5,727.50
Actual Margin: 36.0%

Variance: 6% under target (acceptable range)
Include in Feedback Loop: ✅ Yes
```

### **Phase 5: Feedback Loop (Automated)**

**Runs weekly via cron job:**
1. Gather all performance records since last run
2. Filter: only include jobs with `includeInTemplateRecalc: true`
3. For each service type:
   - Calculate average actual PPH
   - Calculate average cost per hour
   - Calculate billing rate to achieve target margin
   - Update service template

**Example Recalculation:**
```
Service: Forestry Mulching
Jobs analyzed: 15 jobs completed this month

Average actual PPH: 1.32 (was 1.3)
Average cost/hour: $253.00 (was $247.50)
Target margin: 45%

New billing rate: $253 ÷ (1 - 0.45) = $460/hr (was $450)

Template updated! Future proposals use new rates.
```

---

## Implementation Files

### **Backend (Convex)**

1. **[convex/schema.ts](convex/schema.ts)**
   - New `serviceTemplates` table
   - Enhanced `loadouts` table with crew configuration
   - Enhanced `projects` table with Two-Tier tracking
   - New `performanceRecords` table

2. **[convex/serviceTemplates.ts](convex/serviceTemplates.ts)** ✅ NEW
   - CRUD operations for service templates
   - `recalculateFromHistory()` - feedback loop function
   - Template activation/deactivation
   - Safety checks (prevent deletion if in use)

3. **[convex/serviceTemplateSeeds.ts](convex/serviceTemplateSeeds.ts)** ✅ NEW
   - Default templates for 6 common services
   - Industry-standard starting values
   - `seedDefaultTemplates()` - create all defaults
   - `seedCustomTemplate()` - create custom template
   - `calculateBillingRate()` - helper for margin calculations

### **Frontend (Next.js)**

1. **[app/components/calculators/MulchingCalculator.tsx](app/components/calculators/MulchingCalculator.tsx)** ✅ UPDATED
   - Fetches service template instead of requiring loadout
   - Uses standardPPH for pricing
   - Shows locked price messaging
   - Simplified UI (no loadout dropdown)

2. **[app/components/calculators/LandClearingCalculator.tsx](app/components/calculators/LandClearingCalculator.tsx)** ✅ UPDATED
   - Same Two-Tier approach as Mulching
   - Service template-based pricing
   - Clear indication of locked pricing

3. **[app/components/calculators/StumpGrindingCalculator.tsx](app/components/calculators/StumpGrindingCalculator.tsx)** ⏳ TODO
   - Needs same updates as above

---

## Next Steps

### **Immediate (Required for MVP)**

1. **Update Remaining Calculators** ⏳
   - Stump Grinding Calculator → use service templates
   - Any other service calculators

2. **Create Service Template Management UI** ⏳
   - List all templates
   - Create/edit templates
   - View recalculation history
   - Manual recalculation trigger
   - Confidence score display

3. **Update Work Order Creation** ⏳
   - Add loadout selection step
   - Show projected margins for each loadout option
   - Flex resources (temporary additions)
   - Display: "This crew will achieve X% margin"

4. **Enhance Time Tracking** ⏳
   - Ensure production vs support time is tracked
   - Add activity type dropdown (Production, Transport, Setup, etc.)
   - Show running PPH during job

5. **Job Completion Logic** ⏳
   - Calculate actual PPH (production hours only)
   - Create performance record
   - Auto-flag for feedback loop
   - Show variance dashboard

6. **Seed Templates on Org Creation** ⏳
   - Call `seedDefaultTemplates()` when organization is created
   - Provide UI to customize starting values
   - Option to reset to defaults

### **Phase 2 (Post-MVP)**

1. **Automated Feedback Loop Cron Job**
   - Weekly recalculation of templates
   - Email notifications of significant changes
   - Approval workflow for template updates
   - Historical tracking of template changes

2. **Advanced Analytics**
   - Loadout performance comparison
   - PPH trends over time
   - Margin achievement tracking
   - Crew efficiency leaderboards

3. **ML Integration**
   - Predict actual PPH based on site conditions
   - Recommend loadout for maximum margin
   - Identify outlier jobs
   - Weather correlation analysis

---

## Benefits

### **For Sales/Estimators**
✅ Faster proposal creation (no loadout selection needed)
✅ Consistent pricing across all proposals
✅ Confidence in locked pricing
✅ No re-pricing when crew changes

### **For Operations Managers**
✅ Flexibility to assign best available crew
✅ See projected margins before assignment
✅ Track which crews are most profitable
✅ Identify training opportunities (low PPH crews)

### **For Company Owners**
✅ Stable, data-driven pricing
✅ Automatic improvement through feedback loop
✅ Clear separation of pricing vs operations
✅ Better margin control

### **For the System**
✅ Self-improving through historical data
✅ Simpler data model (no circular dependencies)
✅ Easier to maintain and extend
✅ Scalable for future ML integration

---

## Formula Reference

### **Work Score Calculation**
```typescript
// Forestry Mulching
baseScore = acres × medianDBH
adjustedScore = baseScore × afissMultiplier

// Land Clearing
baseScore = acres × densityFactor
adjustedScore = baseScore × afissMultiplier

// Stump Grinding
stumpScore = diameter² × (heightAbove + depthBelow)
totalScore = sum(all stumps with modifiers)
```

### **Pricing Formulas (Tier 1)**
```typescript
// Using Service Template
estimatedHours = adjustedScore ÷ template.standardPPH
estimatedCost = estimatedHours × template.standardCostPerHour
clientPrice = estimatedHours × template.standardBillingRate  // 🔒 LOCKED
```

### **Projection Formulas (Tier 2)**
```typescript
// Using Assigned Loadout
projectedHours = adjustedScore ÷ loadout.productionRates[serviceType]
projectedCost = projectedHours × loadout.baseCostPerHour
projectedProfit = clientPrice - projectedCost
projectedMargin = (projectedProfit / clientPrice) × 100
```

### **Actuals Formulas (Completion)**
```typescript
// From Time Entries
productionHours = sum(timeEntries where isProduction === true)
totalHours = sum(all timeEntries)
actualPPH = adjustedScore ÷ productionHours  // NOT total hours!

actualCost = totalHours × loadoutCostPerHour + flexCosts
actualProfit = clientPrice - actualCost
actualMargin = (actualProfit / clientPrice) × 100
```

### **Feedback Loop Formula**
```typescript
// Recalculate Service Template
records = performanceRecords.filter(r => r.includeInTemplateRecalc)

newStandardPPH = average(records.map(r => r.actualPPH))
newStandardCost = average(records.map(r => r.actualCost / r.actualTotalHours))
newBillingRate = newStandardCost ÷ (1 - targetMargin/100)

confidenceScore = f(consistencyScore, volumeScore)
```

---

## Migration Notes

### **Existing Data**

Old proposals and projects will continue to work. New fields are optional.

### **Gradual Rollout**

1. Seed default templates for all orgs
2. Update calculators to use templates (done for Mulching & Land Clearing)
3. Legacy loadout-based pricing still works
4. Migrate work orders to use new loadout assignment

---

## Testing Checklist

### **Proposal Creation**
- [ ] Mulching calculator uses service template
- [ ] Land Clearing calculator uses service template
- [ ] Pricing is consistent for same inputs
- [ ] Locked price message displays
- [ ] Proposal saves with serviceTemplateId

### **Work Order Assignment**
- [ ] Can select loadout after proposal accepted
- [ ] Projected margins calculate correctly
- [ ] Flex resources can be added
- [ ] Client price remains locked

### **Time Tracking**
- [ ] Production hours tracked separately
- [ ] PPH calculates using production hours only
- [ ] Total hours include all activities
- [ ] Activity types selectable

### **Job Completion**
- [ ] Performance record created
- [ ] Actual PPH calculated correctly
- [ ] Variances calculated
- [ ] Flags for feedback loop

### **Service Templates**
- [ ] Can create new template
- [ ] Can update existing template
- [ ] Recalculate from history works
- [ ] Seed function creates defaults

---

## API Reference

### **Service Template Queries**

```typescript
// Get all templates
const templates = await query(api.serviceTemplates.list, {});

// Get active templates only
const activeTemplates = await query(api.serviceTemplates.listActive, {});

// Get specific service template
const template = await query(api.serviceTemplates.getByServiceType, {
  serviceType: "Forestry Mulching"
});
```

### **Service Template Mutations**

```typescript
// Create new template
const id = await mutation(api.serviceTemplates.create, {
  serviceType: "Custom Service",
  formulaUsed: "CustomScore",
  standardPPH: 2.0,
  standardCostPerHour: 300.00,
  standardBillingRate: 545.00,
  targetMargin: 45,
});

// Update template
await mutation(api.serviceTemplates.update, {
  id: templateId,
  standardPPH: 2.1,  // Adjust PPH
});

// Recalculate from history (feedback loop)
const result = await mutation(api.serviceTemplates.recalculateFromHistory, {
  id: templateId,
  minJobsRequired: 5,  // Need at least 5 jobs
});
```

### **Seed Functions**

```typescript
// Seed all default templates
const result = await mutation(api.serviceTemplateSeeds.seedDefaultTemplates, {
  overwriteExisting: false,
});

// Seed custom template
const id = await mutation(api.serviceTemplateSeeds.seedCustomTemplate, {
  serviceType: "Tree Health Assessment",
  formulaUsed: "AssessmentScore",
  standardPPH: 5.0,
  standardCostPerHour: 125.00,
  standardBillingRate: 225.00,
  targetMargin: 44,
});

// Helper: Calculate billing rate
const rates = await mutation(api.serviceTemplateSeeds.calculateBillingRate, {
  costPerHour: 250.00,
  targetMarginPercent: 45,
});
// Returns: { billingRate: 454.55, profit: 204.55, actualMargin: 45.0 }
```

---

## Support & Questions

For questions about the Two-Tier System implementation:

1. Review this document
2. Check `/convex/serviceTemplates.ts` for API reference
3. See calculator implementations for examples
4. Review development document: `TreeShop Two-Tier Pricing System`

---

**Status**: Phase 1 Complete ✅
**Next**: Service Template Management UI + Work Order Assignment
**Version**: 1.0
**Last Updated**: 2025-01-17
