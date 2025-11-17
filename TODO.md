# TreeShop Proposal-to-Productivity System - Implementation TODO

## CRITICAL LOGIC FIXES (Must Address First)
- [ ] Fix Billing Rate vs Margin contradiction in pricing calculations
- [ ] Reclassify Setup/Tear Down as "Support (Billable Overhead)" instead of "Production"
- [ ] Add quantity field usage to all scoring formula calculations

## PHASE 1: Schema & Data Model Updates

### Line Item Templates Schema
- [ ] Update lineItemTemplates table with new fields:
  - [ ] Add `formulaUsed` (TreeScore, StumpScore, MulchingScore, etc.)
  - [ ] Add `afissFactorIds` array for default applicable factors
  - [ ] Add `productionTaskType` (Production/Support/Both)
  - [ ] Add `isSystemTemplate` boolean flag
  - [ ] Add `usageCount` tracking field

### Service Templates (NEW TABLE)
- [ ] Create `serviceTemplates` table with:
  - [ ] organizationId, serviceType, formulaUsed
  - [ ] standardPPH, standardCostPerHour, standardBillingRate
  - [ ] targetMargin, confidenceScore
  - [ ] lastRecalculated timestamp
  - [ ] totalJobsInAverage counter

### AFISS Factors Schema
- [ ] Create `afissFactors` table with:
  - [ ] id, category, name, description
  - [ ] impactPercentage, applicableServiceTypes
  - [ ] isActive flag

### Production Task Tracking
- [ ] Update timeEntries schema to include:
  - [ ] taskType (Setup, Production, Tear Down, Support)
  - [ ] isBillable boolean
  - [ ] lineItemId reference (for Production tasks)
  - [ ] actualProductionRate calculation

### Work Order Enhancements
- [ ] Add `estimatedHours` to workOrders
- [ ] Add `actualHours` calculation
- [ ] Add `varianceHours` and `variancePercent`
- [ ] Add `productivityScore` field

## PHASE 2: Core Formula Engine

### Tree Removal Formula
- [ ] Implement TreeScore calculation: `Height × CrownRadius × 2 × DBH ÷ 12`
- [ ] Add AFISS multiplier application
- [ ] Add trim percentage factor for pruning
- [ ] Build calculator UI component

### Stump Grinding Formula
- [ ] Implement StumpScore: `Diameter² × (HeightAbove + GrindDepth)`
- [ ] Add hardwood modifier (+15%)
- [ ] Add root flare modifier (+20%)
- [ ] Add rotten modifier (-15%)
- [ ] Build calculator UI with per-stump entry

### Forestry Mulching Formula
- [ ] Implement MulchingScore: `DBH_Package × Acreage × AFISS`
- [ ] Add production rate calculations (PpH)
- [ ] Update existing calculator with new formula

### Land Clearing Updates
- [ ] Refine day-based estimation logic
- [ ] Add intensity multipliers (Light/Standard/Heavy)
- [ ] Update AFISS factor application

## PHASE 3: AFISS System Implementation

### AFISS Factor Database
- [ ] Seed 30-50 default AFISS factors across categories:
  - [ ] Access (5-8 factors)
  - [ ] Facilities (4-6 factors)
  - [ ] Irregularities (6-8 factors)
  - [ ] Site Conditions (5-7 factors)
  - [ ] Safety (4-6 factors)

### AFISS UI Components
- [ ] Create AFISSFactorSelector component
- [ ] Add grouped checkboxes by category
- [ ] Display real-time multiplier calculation
- [ ] Add help icons with factor descriptions
- [ ] Show selected factors in proposal display

### AFISS Integration
- [ ] Integrate into all calculator views
- [ ] Save selected factors with proposals
- [ ] Display in proposal PDF generation
- [ ] Track factor usage analytics

## PHASE 4: Proposal Generation Updates

### Proposal Schema Updates
- [ ] Add `afissFactorsUsed` array
- [ ] Add `treeShopScore` calculation
- [ ] Add `estimatedProductionHours`
- [ ] Add `serviceTemplateId` reference

### Line Item Structure
- [ ] Update proposal line items with:
  - [ ] quantity field (for multi-item entries)
  - [ ] formulaInputs (store calculation parameters)
  - [ ] estimatedHours per line item
  - [ ] production task breakdown

### Proposal UI Enhancements
- [ ] Show TreeShop Score prominently
- [ ] Display AFISS factors with transparency
- [ ] Show hour breakdown (Setup/Production/Tear Down)
- [ ] Add production rate assumptions

## PHASE 5: Work Order Transition

### Proposal → Work Order Conversion
- [ ] Create automatic work order generation from accepted proposal
- [ ] Copy all line items to work order
- [ ] Generate production task templates:
  - [ ] Setup tasks (job-level)
  - [ ] Production tasks (per line item)
  - [ ] Tear Down tasks (job-level)
- [ ] Set initial estimates from proposal

### Production Task Templates
- [ ] Create default task templates by service type
- [ ] Auto-generate tasks on work order creation
- [ ] Link production tasks to line items
- [ ] Set estimated hours from proposal

## PHASE 6: Time Tracking & Productivity

### Time Entry Enhancements
- [ ] Update time entry UI to capture:
  - [ ] Task type selection
  - [ ] Line item association (for Production)
  - [ ] Work accomplished (score points completed)
  - [ ] Notes and issues

### Production Rate Calculations
- [ ] Calculate actualProductionRate per line item
- [ ] Compare to service template standardPPH
- [ ] Calculate variance percentage
- [ ] Update service template confidence scores

### Productivity Reporting
- [ ] Create work order completion report showing:
  - [ ] Estimated vs Actual hours
  - [ ] Variance analysis
  - [ ] Production rate performance
  - [ ] Equipment utilization
  - [ ] Crew efficiency metrics

## PHASE 7: Feedback Loop System

### Service Template Learning
- [ ] Create mutation to update service templates from completed work orders
- [ ] Implement weighted average calculation
- [ ] Add confidence score updates
- [ ] Track totalJobsInAverage counter

### Analytics Integration
- [ ] Add productivity analytics queries
- [ ] Track variance trends over time
- [ ] Identify high-variance services/crews
- [ ] Generate improvement recommendations

## PHASE 8: UI/UX Polish

### Calculator Views
- [ ] Real-time calculation updates
- [ ] Visual formula breakdown display
- [ ] Confidence indicators based on template data
- [ ] Comparison to similar completed jobs

### Work Order Views
- [ ] Production task list with status tracking
- [ ] Real-time hours vs estimate display
- [ ] Productivity gauge/progress bars
- [ ] Issue flagging for over/under estimates

### Reporting Dashboards
- [ ] Add Productivity Analytics tab to reports page
- [ ] Service template performance views
- [ ] Crew efficiency comparisons
- [ ] Equipment utilization tracking

## FILES TO CREATE/MODIFY

### New Files
- [ ] `convex/serviceTemplates.ts` - Service template queries/mutations
- [ ] `convex/afissFactors.ts` - AFISS factor management
- [ ] `convex/productionTracking.ts` - Production rate calculations
- [ ] `convex/seedDefaultLineItemTemplates.ts` - System template seeding
- [ ] `app/components/AFISSFactorSelector.tsx` - AFISS selection UI
- [ ] `app/components/TreeShopScoreDisplay.tsx` - Score visualization
- [ ] `app/components/ProductionTaskList.tsx` - Work order task management

### Files to Update
- [ ] `convex/schema.ts` - Add new tables and fields
- [ ] `convex/lineItems.ts` - Update with new formula logic
- [ ] `convex/proposals.ts` - Enhanced proposal generation
- [ ] `convex/workOrders.ts` - Production tracking integration
- [ ] `convex/timeEntries.ts` - Task type tracking
- [ ] `app/dashboard/proposals/new/page.tsx` - Enhanced calculator
- [ ] `app/dashboard/work-orders/[id]/page.tsx` - Production tracking UI
- [ ] `app/dashboard/reports/page.tsx` - Add productivity analytics

## PRIORITY ORDER FOR DEVELOPMENT

1. **Schema Updates** (Foundation - must be first)
2. **Core Formulas** (TreeScore, StumpScore, MulchingScore)
3. **AFISS System** (Competitive differentiator)
4. **Proposal Generation** (Revenue-critical)
5. **Work Order Conversion** (Workflow automation)
6. **Time Tracking** (Data collection)
7. **Productivity Analytics** (Intelligence layer)
8. **Feedback Loop** (Learning system)

## ESTIMATED TIMELINE
- Phase 1-2: 2-3 hours (Schema + Formulas)
- Phase 3-4: 2-3 hours (AFISS + Proposals)
- Phase 5-6: 3-4 hours (Work Orders + Tracking)
- Phase 7-8: 2-3 hours (Analytics + Polish)
- **Total: 9-13 hours of focused development**

---
**Status**: Ready to begin implementation
**Last Updated**: 2025-01-17
