# Work Order Backend Audit - Complete Verification

## Schema Verification (schema.ts)

### ✅ workOrders Table - Lines 336-449
**All Fields Present and Correct:**
- `organizationId` ✓
- `creationType` ✓ ("PROPOSAL" | "DIRECT")
- `projectName` ✓ (optional - for direct)
- `workOrderNumber` ✓ (optional - auto-generated)
- `proposalId` ✓ (optional - for proposal-based)
- `projectId` ✓ (optional - for proposal-based)
- `customerId` ✓ (required)
- `scheduledDate` ✓ (optional)
- `scheduledStartTime` ✓ (optional)
- `actualStartTime` ✓ (optional)
- `actualEndTime` ✓ (optional)
- `totalJobHours` ✓ (optional)
- `primaryLoadoutId` ✓ (optional)
- `crewMemberIds` ✓ (optional array)
- `equipmentIds` ✓ (optional array)
- `propertyAddress` ✓ (required)
- `propertyCoordinates` ✓ (optional {lat, lng})
- `weather` ✓ (optional)
- `accessNotes` ✓ (optional)
- `hazards` ✓ (optional array)
- `parkingInstructions` ✓ (optional)
- `serviceType` ✓ (optional - for direct)
- `estimatedAcres` ✓ (optional - for direct)
- `actualAcres` ✓ (optional)
- `contractAmount` ✓ (optional - for direct)
- `estimatedDuration` ✓ (optional)
- `estimatedCost` ✓ (optional)
- `targetMargin` ✓ (optional)
- `loadoutHourlyRate` ✓ (optional)
- `treeShopScore` ✓ (optional)
- `afissMultiplier` ✓ (optional)
- `selectedAfissFactors` ✓ (optional array)
- `safetyBriefingCompleted` ✓ (optional)
- `safetyBriefingTime` ✓ (optional)
- `safetyAttendees` ✓ (optional array)
- `ppeVerified` ✓ (optional)
- `incidentReports` ✓ (optional array)
- `photosBefore` ✓ (optional array)
- `photosDuring` ✓ (optional array)
- `photosAfter` ✓ (optional array)
- `crewNotes` ✓ (optional array of objects)
- `customerCommunications` ✓ (optional array of objects)
- `poNumber` ✓ (optional)
- `paymentTerms` ✓ (optional)
- `specialInstructions` ✓ (optional)
- `notes` ✓ (optional)
- `fuelGallons` ✓ (optional)
- `consumablesCost` ✓ (optional)
- `materialsNotes` ✓ (optional)
- `allLineItemsComplete` ✓ (optional)
- `finalPhotosUploaded` ✓ (optional)
- `customerWalkthroughComplete` ✓ (optional)
- `customerSignature` ✓ (optional)
- `customerSignedAt` ✓ (optional)
- `debrisRemoved` ✓ (optional)
- `siteRestored` ✓ (optional)
- `equipmentCleaned` ✓ (optional)
- `completionNotes` ✓ (optional)
- `completionPhotos` ✓ (optional array)
- `status` ✓ (required) - "Created" | "PreScheduled" | "Scheduled" | "InProgress" | "Paused" | "Completed" | "Invoiced" | "Cancelled"
- `createdAt` ✓
- `updatedAt` ✓
- `createdBy` ✓ (optional)

**Indexes:**
- `by_organization` ✓
- `by_proposal` ✓
- `by_project` ✓
- `by_customer` ✓
- `by_org_status` ✓
- `by_scheduled_date` ✓
- `by_creation_type` ✓
- `by_work_order_number` ✓

**Status:** ✅ COMPLETE - Schema is comprehensive

---

### ✅ lineItems Table - Lines 269-333
**All Fields Present and Correct:**
- `organizationId` ✓
- `parentDocId` ✓ (string - can be proposal, work order, or invoice ID)
- `parentDocType` ✓ ("Proposal" | "WorkOrder" | "Invoice")
- `lineNumber` ✓
- `serviceType` ✓
- `description` ✓
- `formulaUsed` ✓
- `workVolumeInputs` ✓ (any - service-specific)
- `baseScore` ✓
- `complexityMultiplier` ✓ (AFISS)
- `adjustedScore` ✓
- `loadoutId` ✓
- `loadoutName` ✓
- `productionRatePPH` ✓
- `costPerHour` ✓
- `billingRatePerHour` ✓
- `targetMargin` ✓
- `productionHours` ✓
- `transportHours` ✓
- `bufferHours` ✓
- `totalEstimatedHours` ✓
- `pricingMethod` ✓
- `totalCost` ✓
- `totalPrice` ✓
- `profit` ✓
- `marginPercent` ✓
- `upsells` ✓ (optional array)
- `termsAndConditions` ✓ (optional array)
- `timeTrackingEnabled` ✓
- `totalActualHours` ✓ (optional)
- `varianceHours` ✓ (optional)
- `status` ✓ ("Pending" | "In Progress" | "Completed" | "Invoiced")
- `createdAt` ✓
- `updatedAt` ✓

**Indexes:**
- `by_organization` ✓
- `by_parent_doc` ✓
- `by_org_status` ✓
- `by_loadout` ✓

**Status:** ✅ COMPLETE - Schema is solid

**⚠️ ISSUE FOUND:** Line items schema doesn't have fields for crew time entries. According to WORK_ORDER_SYSTEM.md, line items should track:
- `actualStartTime`
- `actualEndTime`
- `crewTimeEntries` (array of {employeeId, employeeName, clockIn, clockOut, hoursWorked, laborCost})
- `actualLaborCost`
- `actualEquipmentCost`
- `actualTotalCost`
- `actualProfit`
- `actualMargin`

**ACTION NEEDED:** Add these fields to lineItems schema.

---

### ✅ timeEntries Table - Lines 452-536
**All Fields Present and Correct:**
- `organizationId` ✓
- `workOrderId` ✓
- `lineItemId` ✓ (optional - for direct work orders)
- `employeeId` ✓
- `employeeCode` ✓ (optional - e.g., "STG3+E2")
- `loadoutId` ✓ (optional)
- `activityTypeId` ✓ (optional - NEW)
- `activityName` ✓ (optional - denormalized)
- `activityCategory` ✓ ("PRODUCTION" | "TRANSPORT" | "SUPPORT")
- `activityType` ✓ (optional)
- `activityDetail` ✓ (optional)
- `billable` ✓
- `isProduction` ✓ (optional - NEW)
- `startTime` ✓
- `endTime` ✓ (optional)
- `durationMinutes` ✓ (optional)
- `durationHours` ✓ (optional)
- `status` ✓ (optional - "ACTIVE" | "PAUSED" | "COMPLETED")
- `locationStart` ✓ (optional {lat, lng, accuracy})
- `locationEnd` ✓ (optional {lat, lng, accuracy})
- `distanceTraveled` ✓ (optional)
- `equipmentIds` ✓ (optional array)
- `employeeHourlyRate` ✓ (optional - snapshot)
- `employeeBurdenMultiplier` ✓ (optional)
- `laborCost` ✓ (optional)
- `equipmentCost` ✓ (optional)
- `totalCost` ✓ (optional)
- `notes` ✓ (optional)
- `photos` ✓ (optional array)
- `photoUrls` ✓ (optional array)
- `voiceNoteUrl` ✓ (optional)
- `pausedAt` ✓ (optional)
- `pauseDurationMinutes` ✓ (optional)
- `recordedBy` ✓ (optional)
- `recordedMethod` ✓ (optional)
- `timestampRecorded` ✓ (optional)
- `approved` ✓ (optional)
- `approvedBy` ✓ (optional)
- `approvedDate` ✓ (optional)
- `createdAt` ✓
- `updatedAt` ✓ (optional)

**Indexes:**
- `by_organization` ✓
- `by_work_order` ✓
- `by_line_item` ✓
- `by_employee` ✓
- `by_org_employee` ✓
- `by_billable` ✓
- `by_activity_type` ✓
- `by_status` ✓
- `by_production` ✓
- `by_date` ✓
- `by_employee_date` ✓

**Status:** ✅ COMPLETE - Comprehensive time tracking schema

---

## Mutations Verification

### ✅ workOrders.ts Mutations

**Queries:**
1. `list()` ✅
2. `listByStatus(status)` ✅
3. `listByDate(date)` ✅
4. `get(id)` ✅
5. `listByProposal(proposalId)` ✅
6. `listByCustomer(customerId)` ✅
7. `getMyWorkOrders()` ✅ (employee portal)
8. `getMyWorkOrdersByStatus(status)` ✅
9. `getMyWorkOrdersByDate(date)` ✅
10. `getMyWorkOrdersInRange(startDate, endDate)` ✅
11. `listDirect()` ✅

**Mutations:**
1. `create(...)` ✅ - From accepted proposal
2. `createDirect(...)` ✅ - Direct work order (bypass proposal)
3. `update(...)` ✅
4. `addCrewNote(...)` ✅
5. `addCustomerCommunication(...)` ✅
6. `startWork(id)` ✅
7. `complete(id, customerSignature)` ✅
8. `remove(id)` ✅

**⚠️ ISSUE FOUND:** Missing mutations:
- `assignCrew(id, crewMemberIds)` - Assign crew to work order
- `assignEquipment(id, equipmentIds)` - Assign equipment
- `uploadPhotos(id, category, photos)` - Upload before/during/after photos
- `updateCompletionChecklist(id, checklist)` - Update completion items
- `scheduleWorkOrder(id, scheduledDate, scheduledStartTime)` - Schedule the work

**ACTION NEEDED:** Add these helper mutations for cleaner frontend code.

---

### ✅ lineItems.ts Mutations

**Queries:**
1. `listByParent(parentDocId, parentDocType)` ✅
2. `list()` ✅
3. `get(id)` ✅
4. `listByLoadout(loadoutId)` ✅
5. `listByStatus(status)` ✅

**Mutations:**
1. `create(...)` ✅
2. `update(...)` ✅
3. `updateTimeTracking(id, totalActualHours, varianceHours)` ✅
4. `markComplete(id)` ✅
5. `remove(id)` ✅

**⚠️ ISSUE FOUND:** Missing mutations:
- `startLineItem(id)` - Start time tracking on a line item
- `completeLineItem(id)` - Complete a line item and calculate actuals
- `addCrewMemberToLineItem(id, employeeId)` - Add crew to line item
- `updateActualCosts(id)` - Recalculate actual costs from time entries

**ACTION NEEDED:** Add these helper mutations.

---

### ✅ timeEntries.ts Mutations

**Queries:**
1. `list()` ✅
2. `listByWorkOrder(workOrderId)` ✅
3. `listByLineItem(lineItemId)` ✅
4. `listByEmployee(employeeId)` ✅
5. `listBillable(billable)` ✅
6. `get(id)` ✅
7. `getSummaryByLineItem(lineItemId)` ✅

**Mutations:**
1. `start(...)` ✅ - Clock in
2. `stop(id, ...)` ✅ - Clock out
3. `createManual(...)` ✅ - Manual time entry
4. `update(...)` ✅
5. `approve(id, approvedBy)` ✅
6. `bulkApprove(ids, approvedBy)` ✅
7. `remove(id)` ✅

**Status:** ✅ COMPLETE - All time entry operations covered

---

## Field Name Consistency Check

### Checking for Typos and Inconsistencies:

1. **"organizationId"** - Used consistently ✅
2. **"workOrderId"** - Used consistently ✅
3. **"lineItemId"** - Used consistently ✅
4. **"employeeId"** - Used consistently ✅
5. **"equipmentId"** vs **"equipmentIds"** - Both used correctly (singular for single, plural for arrays) ✅
6. **"customerId"** - Used consistently ✅
7. **"loadoutId"** - Used consistently ✅
8. **"proposalId"** - Used consistently ✅
9. **"projectId"** - Used consistently ✅
10. **Status fields:**
    - workOrders: `status` ✅
    - lineItems: `status` ✅
    - timeEntries: `status` (optional) ✅
11. **Timestamp fields:**
    - `createdAt` - Consistent ✅
    - `updatedAt` - Consistent ✅
    - `startTime` - Consistent (timeEntries) ✅
    - `endTime` - Consistent (timeEntries) ✅
    - `actualStartTime` - Consistent (workOrders) ✅
    - `actualEndTime` - Consistent (workOrders) ✅

**Status:** ✅ NO TYPOS FOUND - Naming is consistent

---

## Relationship Verification

### Project → Work Order
```typescript
// projects table has:
status: "Work Order"  // ✅ Indicates it's in work order stage

// workOrders table has:
projectId: Id<"projects">  // ✅ Links back to project

// Query works:
workOrders.listByProject(projectId)  // ⚠️ MISSING
```

**⚠️ ISSUE:** Missing query `listByProject(projectId)` in workOrders.ts

---

### Proposal → Work Order
```typescript
// workOrders table has:
proposalId: Id<"proposals">  // ✅ Links to proposal

// Query exists:
workOrders.listByProposal(proposalId)  // ✅
```

**Status:** ✅ Relationship verified

---

### Work Order → Line Items
```typescript
// lineItems table has:
parentDocId: string  // ✅ Can be work order ID
parentDocType: "WorkOrder"  // ✅ Identifies type

// Query exists:
lineItems.listByParent(workOrderId, "WorkOrder")  // ✅
```

**Status:** ✅ Relationship verified

---

### Work Order → Time Entries
```typescript
// timeEntries table has:
workOrderId: Id<"workOrders">  // ✅

// Query exists:
timeEntries.listByWorkOrder(workOrderId)  // ✅
```

**Status:** ✅ Relationship verified

---

### Line Item → Time Entries
```typescript
// timeEntries table has:
lineItemId: Id<"lineItems">  // ✅ (optional for direct WOs)

// Query exists:
timeEntries.listByLineItem(lineItemId)  // ✅
```

**Status:** ✅ Relationship verified

---

### Work Order → Customer
```typescript
// workOrders table has:
customerId: Id<"customers">  // ✅

// Query exists:
workOrders.listByCustomer(customerId)  // ✅
```

**Status:** ✅ Relationship verified

---

### Work Order → Employees (Crew)
```typescript
// workOrders table has:
crewMemberIds: Id<"employees">[]  // ✅ (optional array)

// Query for employee's work orders:
workOrders.getMyWorkOrders()  // ✅
```

**Status:** ✅ Relationship verified

---

### Work Order → Equipment
```typescript
// workOrders table has:
equipmentIds: Id<"equipment">[]  // ✅ (optional array)
primaryLoadoutId: Id<"loadouts">  // ✅ (optional)

// ⚠️ No query to get all work orders for specific equipment
```

**⚠️ ISSUE:** Missing query `listByEquipment(equipmentId)` for tracking equipment utilization

---

## Data Flow Verification

### Flow 1: Proposal → Work Order → Invoice

```typescript
1. Proposal Accepted:
   - proposalId exists ✅
   - Line items created with parentDocId = proposalId ✅

2. Create Work Order:
   await workOrders.create({
     proposalId,  // ✅ Link to proposal
     projectId,   // ✅ Link to project
     customerId,  // ✅ Link to customer
     ...
   })

3. Line Items Transition:
   ⚠️ MISSING: No automatic copy/update of line items from proposal to work order

   Need mutation: copyLineItemsToWorkOrder(proposalId, workOrderId)

4. Complete Work Order:
   await workOrders.complete(id, customerSignature)  // ✅

5. Create Invoice:
   ⚠️ MISSING: No automatic invoice creation from work order

   Need mutation: invoices.createFromWorkOrder(workOrderId)
```

**⚠️ ISSUES FOUND:**
1. Line items don't automatically transition from proposal → work order
2. No invoice creation from work order

---

### Flow 2: Direct Work Order → Invoice

```typescript
1. Create Direct Work Order:
   await workOrders.createDirect({...})  // ✅

2. Create Line Items Manually:
   await lineItems.create({
     parentDocId: workOrderId,
     parentDocType: "WorkOrder",
     ...
   })  // ✅ Works but manual

3. Complete Work Order:
   await workOrders.complete(id, signature)  // ✅

4. Create Invoice:
   ⚠️ MISSING: Same issue as above
```

---

## Missing Backend Features

### 1. Line Item Transitions
**Problem:** When proposal → work order, line items don't automatically update

**Solution Needed:**
```typescript
// workOrders.ts
export const createFromProposal = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    // 1. Get proposal
    // 2. Create work order
    // 3. Update line items: parentDocId → workOrderId, parentDocType → "WorkOrder"
    // 4. Update project status
  }
});
```

### 2. Invoice Creation
**Problem:** No way to create invoice from completed work order

**Solution Needed:**
```typescript
// invoices.ts (NEW FILE)
export const createFromWorkOrder = mutation({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    // 1. Get work order
    // 2. Get line items
    // 3. Create invoice
    // 4. Update line items: parentDocId → invoiceId, parentDocType → "Invoice"
    // 5. Update work order status → "Invoiced"
    // 6. Update project status → "Invoice"
  }
});
```

### 3. Cost Calculations
**Problem:** Line items don't automatically calculate actual costs from time entries

**Solution Needed:**
```typescript
// lineItems.ts
export const recalculateActualCosts = mutation({
  args: { id: v.id("lineItems") },
  handler: async (ctx, args) => {
    // 1. Get all time entries for line item
    // 2. Sum labor costs
    // 3. Sum equipment costs
    // 4. Calculate total actual cost
    // 5. Calculate actual profit and margin
    // 6. Update line item
  }
});
```

### 4. Photo Upload Helper
**Problem:** Photo upload is manual field update

**Solution Needed:**
```typescript
// workOrders.ts
export const addPhotos = mutation({
  args: {
    id: v.id("workOrders"),
    category: v.union(v.literal("before"), v.literal("during"), v.literal("after")),
    photoUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Add photos to appropriate array
  }
});
```

---

## Summary of Issues Found

### 🔴 CRITICAL (Blocks functionality):
1. ✅ **Line items missing actual cost tracking fields** - Need to add to schema
2. ✅ **No proposal → work order transition logic** - Need createFromProposal mutation
3. ✅ **No work order → invoice transition logic** - Need createFromWorkOrder mutation
4. ✅ **No automatic cost calculation** - Need recalculateActualCosts mutation

### 🟡 MEDIUM (Makes frontend harder):
5. ⚠️ **Missing helper mutations:**
   - `assignCrew()`
   - `assignEquipment()`
   - `addPhotos()`
   - `scheduleWorkOrder()`
   - `startLineItem()`
   - `completeLineItem()`

6. ⚠️ **Missing queries:**
   - `listByProject(projectId)`
   - `listByEquipment(equipmentId)`

### 🟢 LOW (Nice to have):
7. ⚠️ Better validation on status transitions
8. ⚠️ Cascade delete handling (if work order deleted, what happens to line items?)

---

## Action Plan

### Phase 1: Fix Schema (30 min)
1. Add actual cost fields to lineItems
2. Verify all optional fields are correct

### Phase 2: Add Critical Mutations (2 hrs)
1. `workOrders.createFromProposal()` - Transition logic
2. `invoices.createFromWorkOrder()` - Invoice creation (new file)
3. `lineItems.recalculateActualCosts()` - Auto cost calculation
4. `lineItems.startLineItem()` - Start tracking
5. `lineItems.completeLineItem()` - Finish and calculate

### Phase 3: Add Helper Mutations (1 hr)
1. `workOrders.assignCrew()`
2. `workOrders.assignEquipment()`
3. `workOrders.addPhotos()`
4. `workOrders.scheduleWorkOrder()`

### Phase 4: Add Missing Queries (30 min)
1. `workOrders.listByProject()`
2. `workOrders.listByEquipment()`

### Phase 5: Test All Integrations (1 hr)
1. Test proposal → work order flow
2. Test direct work order flow
3. Test time tracking → cost calculation
4. Test work order → invoice flow

---

## Total Estimated Fix Time: 5 hours

Then we can build the frontend with confidence that the backend is solid.
