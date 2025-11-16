# TreeShop Work Order System - Complete Specification

## Overview

**Work Order = Field Execution Phase**

The work order is where your crew interacts with the project and delivers the solutions the customer is paying for. It's the bridge between the proposal (what you sold) and the invoice (what you bill).

---

## Two Paths to Work Order

### Path 1: Proposal Accepted → Work Order (DEFAULT - 95% of jobs)

```typescript
// When customer signs proposal
await updateProposal({
  id: proposalId,
  status: "Signed",
  signedBy: customerName,
  signedAt: Date.now(),
});

// Automatically transition project to Work Order stage
await updateProject({
  id: projectId,
  status: "Work Order",           // Change from "Proposal"
  proposalStatus: "Accepted",     // Mark proposal accepted
  workOrderStatus: "Scheduled",   // Start work order lifecycle
  scheduledDate: scheduledTimestamp,
});

// All proposal data flows to work order:
// - Line items (with all pricing, scoring, hours)
// - Customer info
// - Property address
// - AFISS factors
// - Scope of work
// - What's included/excluded
```

**Key Point:** Line items are already created during proposal generation with all the estimates. The work order uses these same line items for time tracking.

### Path 2: Create Direct Work Order (BYPASS - 5% of jobs)

Used for:
- Insurance work (already approved)
- Government contracts (fixed price)
- Emergency jobs (price agreed verbally)
- Repeat customers (standard pricing)

```typescript
// Manual work order creation
await createDirectWorkOrder({
  customerId,
  projectName: "Emergency Storm Cleanup - Oak Street",
  propertyAddress,
  serviceType: "Land Clearing",
  contractAmount: 15000,  // Already agreed upon
  estimatedAcres: 2.5,
  loadoutId,
  poNumber: "INS-2024-1234",
  specialInstructions: "Insurance claim - document everything",
});
```

This creates a work order WITHOUT a proposal or project record (optional linking).

---

## Work Order Lifecycle

### Status Flow

```
Created/Scheduled → In Progress → Completed → Invoiced
```

**Status Definitions:**

1. **Created** (Direct WOs only) - Work order exists but not scheduled
2. **Scheduled** - Job is on the calendar, crew assigned
3. **In Progress** - Crew is actively working on site
4. **Completed** - Work done, customer signed off, ready to invoice
5. **Invoiced** - Invoice created, work order closed

---

## Work Order Core Components

### 1. Job Information (From Proposal)

```typescript
{
  // Source tracking
  proposalId: Id<"proposals">,        // Link back to proposal
  projectId: Id<"projects">,          // Link to project
  customerId: Id<"customers">,        // Who we're working for

  // What we're doing
  propertyAddress: string,
  serviceType: string,                // "Forestry Mulching", etc.
  scopeOfWork: string,                // From proposal

  // Scheduling
  scheduledDate: number,              // When crew shows up
  scheduledStartTime: "08:00",        // Start time
  estimatedDuration: 16,              // Hours (from line items)

  // Pricing (locked in from proposal)
  contractAmount: 8500,               // What customer is paying
  estimatedCost: 4250,                // Your expected cost
  targetMargin: 50,                   // Expected profit %
}
```

### 2. Crew & Equipment Assignment

```typescript
{
  // Primary loadout (main equipment setup)
  primaryLoadoutId: Id<"loadouts">,
  loadoutName: "Supertrak SK200TR + F450",

  // Assigned crew
  crewMemberIds: [
    employeeId1,  // Operator
    employeeId2,  // Ground crew
    employeeId3,  // Support
  ],

  // Assigned equipment
  equipmentIds: [
    sk200trId,
    f450Id,
    trailerId,
  ],
}
```

### 3. Line Item Time Tracking (The Core Feature)

Each line item from the proposal becomes a trackable work unit:

```typescript
// Example: Proposal had 3 line items
lineItems: [
  {
    lineNumber: 1,
    serviceType: "Forestry Mulching",
    description: "Clear 3.5 acres - up to 6\" DBH",

    // ESTIMATES (from proposal)
    totalEstimatedHours: 16.06,
    productionHours: 13.85,
    transportHours: 0.75,
    bufferHours: 1.46,
    totalCost: 4592.49,
    totalPrice: 9184.98,
    targetMargin: 50%,

    // TIME TRACKING (filled during work order)
    timeTrackingEnabled: true,
    status: "In Progress",              // Pending → In Progress → Completed

    actualStartTime: 1705492800000,     // Crew started this line item
    actualEndTime: 1705553600000,       // Crew finished this line item
    totalActualHours: 16.9,             // Actual time spent
    varianceHours: 0.84,                // Over estimate by 0.84 hrs

    // CREW TIME ENTRIES (who worked on this line item)
    crewTimeEntries: [
      {
        employeeId: emp1,
        employeeName: "John Smith",
        clockIn: 1705492800000,
        clockOut: 1705553600000,
        hoursWorked: 16.9,
        laborCost: 1005.25,             // 16.9 hrs × $59.50/hr
      },
      {
        employeeId: emp2,
        employeeName: "Mike Johnson",
        clockIn: 1705492800000,
        clockOut: 1705553600000,
        hoursWorked: 16.9,
        laborCost: 1005.25,
      },
    ],

    // ACTUAL COSTS (calculated from time entries)
    actualLaborCost: 2010.50,           // Sum of crew labor costs
    actualEquipmentCost: 2789.64,       // 16.9 hrs × equipment hourly rates
    actualTotalCost: 4800.14,           // Labor + Equipment

    // PROFITABILITY
    actualProfit: 4384.84,              // $9185 - $4800
    actualMargin: 47.7%,                // Slightly under 50% target
  },
  // Line item 2...
  // Line item 3...
]
```

**Key Features:**
- Track time PER LINE ITEM (not just total job time)
- See which services ran over/under estimate
- Attribute costs to specific work activities
- Learn which crews are more efficient
- Validate your TreeShop Score accuracy

### 4. Field Documentation

```typescript
{
  // Photos
  photosBefore: [url1, url2, url3],     // Document site conditions
  photosDuring: [url4, url5, url6],     // Progress photos
  photosAfter: [url7, url8, url9],      // Completion photos

  // Notes & Communications
  crewNotes: [
    {
      timestamp: Date.now(),
      note: "Found underground utility not marked - paused work",
      createdBy: crewLeadId,
    },
  ],

  customerCommunications: [
    {
      timestamp: Date.now(),
      note: "Customer requested to leave chips for playground area",
      createdBy: employeeId,
    },
  ],

  // Issues & Changes
  issuesEncountered: "Underground utilities required hand-digging around",
  scopeChanges: 1,                      // Count of change orders
  scopeChangeImpactHours: 2.5,          // Extra hours from changes
}
```

### 5. Safety & Compliance

```typescript
{
  // Safety briefing
  safetyBriefingCompleted: true,
  safetyBriefingTime: timestamp,
  safetyAttendees: [emp1, emp2, emp3],
  ppeVerified: true,

  // Incidents
  incidentReports: [],                  // Links to incident report docs
  safetyIncidents: 0,
  nearMisses: 0,
}
```

### 6. Site Conditions (Captured During Work)

```typescript
{
  // Weather
  weather: "Clear, 75°F",
  weatherCondition: "Clear",
  temperature: 75,
  windSpeed: 10,

  // Access
  accessNotes: "Gate code: 1234, Park on street",
  parkingInstructions: "Use street parking - no driveway access",

  // Hazards
  hazards: [
    "Power lines overhead",
    "Pool 20ft from work area",
    "Underground sprinkler system",
  ],

  // Site assessment
  siteAccessDifficulty: 6,              // 1-10 scale
  siteTerrainType: "Sloped",
  soilCondition: "Muddy",
  vegetationDensity: "Heavy",
}
```

### 7. Completion Checklist

Before a work order can be marked "Completed", the crew must verify:

```typescript
{
  allLineItemsComplete: true,           // ✓ Every line item status = "Completed"
  finalPhotosUploaded: true,            // ✓ After photos uploaded
  customerWalkthroughComplete: true,    // ✓ Customer inspected and approved
  customerSignature: base64Image,       // ✓ Customer signed completion form
  customerSignedAt: timestamp,
  debrisRemoved: true,                  // ✓ Site cleaned up
  siteRestored: true,                   // ✓ Grass seed, erosion control, etc.
  equipmentCleaned: true,               // ✓ Equipment cleaned and ready
  completionNotes: "Customer very satisfied, requested card for referrals",
}
```

---

## Mobile Field App - Crew Interface

### Daily Schedule View

```
┌─────────────────────────────────────┐
│  Today's Jobs - June 15, 2024       │
├─────────────────────────────────────┤
│ ☀️ Clear, 78°F                      │
│                                     │
│ ► 8:00 AM - Oak Street Mulching    │
│   123 Oak St, New Smyrna Beach      │
│   Customer: John Smith              │
│   Status: Scheduled                 │
│   [START WORK]                      │
│                                     │
│ ► 2:00 PM - Pine Ave Land Clearing │
│   456 Pine Ave, Edgewater           │
│   Customer: ABC Property Mgmt       │
│   Status: Scheduled                 │
│                                     │
└─────────────────────────────────────┘
```

### Work Order Detail View

```
┌─────────────────────────────────────┐
│  Oak Street Mulching                │
│  Status: In Progress (2.5 hrs)      │
├─────────────────────────────────────┤
│ Customer: John Smith                │
│ 📍 123 Oak St, New Smyrna Beach     │
│ 📞 (386) 555-1234                   │
│                                     │
│ Line Items:                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ ✓ 1. Mulch 3.5 acres (6" DBH)      │
│    Estimated: 16.1 hrs              │
│    Actual: 16.9 hrs (+0.8 hrs)      │
│    Status: Completed                │
│                                     │
│ ⏱ 2. Stump grinding (5 stumps)     │
│    Estimated: 3.2 hrs               │
│    Actual: 2.5 hrs (so far)         │
│    Status: In Progress              │
│    [PAUSE] [COMPLETE]               │
│                                     │
│ [ ] 3. Site cleanup                 │
│    Estimated: 1.0 hrs               │
│    Status: Pending                  │
│    [START]                          │
│                                     │
│ [📷 PHOTOS] [✍️ NOTES] [⚠️ REPORT]  │
└─────────────────────────────────────┘
```

### Time Clock Per Line Item

```
┌─────────────────────────────────────┐
│  Line Item #2                       │
│  Stump Grinding (5 stumps)          │
├─────────────────────────────────────┤
│ Estimated: 3.2 hours                │
│ Started: 10:15 AM                   │
│ Elapsed: 2 hrs 34 mins              │
│                                     │
│ Crew Members Clocked In:            │
│ • John Smith (Operator)             │
│ • Mike Johnson (Ground Crew)        │
│                                     │
│ Equipment Assigned:                 │
│ • Vermeer SC60TX (Stump Grinder)    │
│ • Ford F450 (Truck)                 │
│                                     │
│ [⏸ PAUSE WORK]                      │
│ [✓ COMPLETE LINE ITEM]              │
└─────────────────────────────────────┘
```

### Photo Documentation

```
┌─────────────────────────────────────┐
│  Photo Documentation                │
├─────────────────────────────────────┤
│ Before Photos (3)                   │
│ [📷] [📷] [📷]                      │
│                                     │
│ During Photos (5)                   │
│ [📷] [📷] [📷] [📷] [📷]            │
│                                     │
│ After Photos (4)                    │
│ [📷] [📷] [📷] [📷]                 │
│                                     │
│ [+ ADD PHOTO]                       │
│                                     │
│ Requirements:                       │
│ ✓ Before photos (min 3)             │
│ ✓ During photos (min 3)             │
│ ✗ After photos (min 3) - Need 1     │
└─────────────────────────────────────┘
```

### Customer Sign-Off

```
┌─────────────────────────────────────┐
│  Completion Sign-Off                │
├─────────────────────────────────────┤
│ All line items completed: ✓         │
│ Photos uploaded: ✓                  │
│ Site cleaned: ✓                     │
│ Equipment cleaned: ✓                │
│                                     │
│ Customer Walkthrough:               │
│ "Work looks great! Exactly what we  │
│  wanted. Very professional crew."   │
│                                     │
│ Signature:                          │
│ ┌─────────────────────────────┐     │
│ │                             │     │
│ │  [Signature canvas]         │     │
│ │                             │     │
│ └─────────────────────────────┘     │
│                                     │
│ Printed Name: John Smith            │
│ Date: June 15, 2024                 │
│                                     │
│ [SUBMIT & COMPLETE WORK ORDER]      │
└─────────────────────────────────────┘
```

---

## Database Architecture

### Work Order Document

```typescript
{
  // Identity & Source
  _id: Id<"workOrders">,
  organizationId: Id<"organizations">,
  creationType: "PROPOSAL" | "DIRECT",

  // Proposal-based WOs have these
  proposalId?: Id<"proposals">,
  projectId?: Id<"projects">,

  // Direct WOs have these instead
  projectName?: string,
  workOrderNumber?: "WO-20240615-001",

  // Always present
  customerId: Id<"customers">,
  propertyAddress: string,
  serviceType: string,

  // Scheduling
  scheduledDate?: number,
  scheduledStartTime?: "08:00",
  actualStartTime?: number,
  actualEndTime?: number,
  totalJobHours?: number,

  // Crew & Equipment
  primaryLoadoutId?: Id<"loadouts">,
  crewMemberIds: Id<"employees">[],
  equipmentIds: Id<"equipment">[],

  // Financial (locked from proposal or entered for direct)
  contractAmount: number,
  estimatedDuration: number,
  estimatedCost: number,
  targetMargin: number,

  // Site info
  propertyCoordinates?: {lat, lng},
  weather?: string,
  accessNotes?: string,
  hazards?: string[],

  // Safety
  safetyBriefingCompleted: boolean,
  safetyBriefingTime?: number,
  ppeVerified: boolean,
  incidentReports?: string[],

  // Documentation
  photosBefore?: string[],
  photosDuring?: string[],
  photosAfter?: string[],
  crewNotes?: Array<{timestamp, note, createdBy}>,
  customerCommunications?: Array<{timestamp, note, createdBy}>,

  // Completion
  allLineItemsComplete: boolean,
  finalPhotosUploaded: boolean,
  customerWalkthroughComplete: boolean,
  customerSignature?: string,
  customerSignedAt?: number,
  debrisRemoved: boolean,
  siteRestored: boolean,
  equipmentCleaned: boolean,

  // Status
  status: "Created" | "Scheduled" | "In Progress" | "Completed" | "Invoiced",

  createdAt: number,
  updatedAt: number,
}
```

### Line Item with Time Tracking

```typescript
{
  _id: Id<"lineItems">,
  organizationId: Id<"organizations">,
  parentDocId: string,                  // Work order ID
  parentDocType: "WorkOrder",
  lineNumber: number,

  // Service details
  serviceType: string,
  description: string,

  // Scoring (from proposal)
  formulaUsed: "StumpScore" | "TreeShopScore" | ...,
  workVolumeInputs: any,                // Service-specific inputs
  baseScore: number,
  complexityMultiplier: number,         // AFISS
  adjustedScore: number,

  // Loadout (from proposal)
  loadoutId: Id<"loadouts">,
  loadoutName: string,
  productionRatePPH: number,
  costPerHour: number,
  billingRatePerHour: number,
  targetMargin: number,

  // TIME ESTIMATES (from proposal)
  productionHours: number,
  transportHours: number,
  bufferHours: number,
  totalEstimatedHours: number,

  // PRICING (from proposal)
  pricingMethod: "Hourly" | "Fixed",
  totalCost: number,
  totalPrice: number,
  profit: number,
  marginPercent: number,

  // TIME TRACKING (filled during work order)
  timeTrackingEnabled: true,
  actualStartTime?: number,
  actualEndTime?: number,
  totalActualHours?: number,
  varianceHours?: number,

  // CREW TIME ENTRIES
  crewTimeEntries?: Array<{
    employeeId: Id<"employees">,
    employeeName: string,
    clockIn: number,
    clockOut?: number,
    hoursWorked?: number,
    laborCost?: number,                 // hours × employee true cost
  }>,

  // ACTUAL COSTS
  actualLaborCost?: number,
  actualEquipmentCost?: number,
  actualTotalCost?: number,
  actualProfit?: number,
  actualMargin?: number,

  // Status
  status: "Pending" | "In Progress" | "Completed",

  createdAt: number,
  updatedAt: number,
}
```

### Time Entry (Detailed Tracking)

```typescript
{
  _id: Id<"timeEntries">,
  organizationId: Id<"organizations">,
  workOrderId: Id<"workOrders">,
  lineItemId: Id<"lineItems">,          // Which line item

  // Who
  employeeId: Id<"employees">,
  employeeCode: "STG3+E2",              // Tier + certs

  // What activity
  activityCategory: "PRODUCTION" | "TRANSPORT" | "SUPPORT",
  activityType: "Grinding" | "Mulching" | "Setup" | "Travel",
  billable: true,

  // When
  startTime: number,
  endTime?: number,
  durationMinutes?: number,
  durationHours?: number,

  // Where
  locationStart?: {lat, lng, accuracy},
  locationEnd?: {lat, lng, accuracy},
  distanceTraveled?: number,

  // Equipment used
  equipmentIds: Id<"equipment">[],

  // Costs (cached for performance)
  employeeHourlyRate: 35,
  employeeBurdenMultiplier: 1.7,
  laborCost: 59.50,                     // 1 hr × $35 × 1.7
  equipmentCost: 114.73,                // Equipment hourly rates
  totalCost: 174.23,

  // Documentation
  notes?: string,
  photos?: string[],

  createdAt: number,
}
```

---

## Key Workflows

### Workflow 1: Proposal → Work Order (Auto)

```typescript
// Step 1: Customer accepts proposal (signs digitally)
await updateProposal({
  id: proposalId,
  status: "Signed",
  signatureData: base64Image,
  signedBy: "John Smith",
  signedAt: Date.now(),
});

// Step 2: Project automatically moves to Work Order stage
await updateProject({
  id: projectId,
  status: "Work Order",
  proposalStatus: "Accepted",
  workOrderStatus: "Scheduled",
  scheduledDate: chosenDate,
});

// Step 3: Line items already exist with all estimates
// They're linked to the proposal via parentDocId/parentDocType
// Now they're ready for time tracking when work starts

// Step 4: Create work order document
await createWorkOrder({
  proposalId,
  projectId,
  customerId,
  propertyAddress: proposal.propertyAddress,
  scheduledDate,
  crewMemberIds: [],                    // Assigned during scheduling
  equipmentIds: [],
  status: "Scheduled",
});
```

### Workflow 2: Start Work

```typescript
// Crew arrives on site, starts work order
await updateWorkOrder({
  id: workOrderId,
  status: "In Progress",
  actualStartTime: Date.now(),
  weather: "Clear, 75°F",
  safetyBriefingCompleted: true,
  safetyBriefingTime: Date.now(),
  ppeVerified: true,
});

// Upload before photos
await updateWorkOrder({
  id: workOrderId,
  photosBefore: [url1, url2, url3],
});
```

### Workflow 3: Track Time on Line Item

```typescript
// Crew starts working on line item #1
await updateLineItem({
  id: lineItemId,
  status: "In Progress",
  actualStartTime: Date.now(),
  timeTrackingEnabled: true,
});

// Create time entry for employee 1
await createTimeEntry({
  workOrderId,
  lineItemId,
  employeeId: emp1,
  activityCategory: "PRODUCTION",
  activityType: "Mulching",
  billable: true,
  startTime: Date.now(),
  equipmentIds: [sk200trId, f450Id],
});

// Create time entry for employee 2
await createTimeEntry({
  workOrderId,
  lineItemId,
  employeeId: emp2,
  activityCategory: "PRODUCTION",
  activityType: "Ground Support",
  billable: true,
  startTime: Date.now(),
});

// When line item completed
const endTime = Date.now();
const startTime = lineItem.actualStartTime;
const actualHours = (endTime - startTime) / (1000 * 60 * 60);
const variance = actualHours - lineItem.totalEstimatedHours;

await updateLineItem({
  id: lineItemId,
  status: "Completed",
  actualEndTime: endTime,
  totalActualHours: actualHours,
  varianceHours: variance,

  // Calculate costs from time entries
  actualLaborCost: sumCrewLaborCosts(timeEntries),
  actualEquipmentCost: calculateEquipmentCost(timeEntries, equipmentRates),
  actualTotalCost: actualLabor + actualEquipment,
  actualProfit: lineItem.totalPrice - actualTotalCost,
  actualMargin: (actualProfit / lineItem.totalPrice) * 100,
});
```

### Workflow 4: Complete Work Order

```typescript
// Check completion requirements
const allLineItemsComplete = lineItems.every(li => li.status === "Completed");
const hasAfterPhotos = workOrder.photosAfter?.length >= 3;

// Upload after photos
await updateWorkOrder({
  id: workOrderId,
  photosAfter: [url1, url2, url3, url4],
});

// Customer walkthrough and sign-off
await updateWorkOrder({
  id: workOrderId,
  allLineItemsComplete: true,
  finalPhotosUploaded: true,
  customerWalkthroughComplete: true,
  debrisRemoved: true,
  siteRestored: true,
  equipmentCleaned: true,
  customerSignature: base64SignatureImage,
  customerSignedAt: Date.now(),
  status: "Completed",
  actualEndTime: Date.now(),
});

// Calculate total job hours
const totalJobHours = (workOrder.actualEndTime - workOrder.actualStartTime) / (1000 * 60 * 60);

await updateWorkOrder({
  id: workOrderId,
  totalJobHours,
});
```

### Workflow 5: Convert to Invoice

```typescript
// Work order complete, create invoice
await updateProject({
  id: projectId,
  status: "Invoice",
  workOrderStatus: "Invoiced",
});

// Create invoice using actual costs from work order
await createInvoice({
  workOrderId,
  projectId,
  customerId,

  // Use contract amount (not actuals) for price
  subtotal: workOrder.contractAmount,
  totalAmount: workOrder.contractAmount,

  // Line items show actuals for your records
  lineItems: lineItemsWithActuals,

  // Payment terms
  invoiceDate: Date.now(),
  dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // Net 30
  paymentTerms: "Net 30",

  status: "Draft",
});
```

---

## Real-Time Cost Tracking

As crews work, you see profitability in real-time:

```typescript
// Dashboard view during active work order
{
  workOrderId: "wo123",
  status: "In Progress",

  // Contract
  contractAmount: 9184.98,
  estimatedCost: 4592.49,
  estimatedProfit: 4592.49,
  targetMargin: 50%,

  // Actuals (so far - 10 hours in)
  actualHoursSoFar: 10.0,
  actualCostSoFar: 2861.60,           // Running total
  projectedFinalCost: 4592.49,        // Based on estimates

  // If you're tracking ahead of estimate
  onTrackMargin: 50%,                 // Still on target

  // If you're running over
  actualCostProjected: 5200.00,       // Trending over
  projectedMargin: 43.4%,             // ⚠️ Below target
  alertThreshold: true,               // Notify manager
}
```

**Manager Alert:**
```
⚠️ Work Order Alert - Oak Street Mulching

Projected to exceed estimate by 13%
- Estimated: 16.1 hrs
- Actual so far: 10 hrs (62% complete)
- Projected final: 18.2 hrs (+2.1 hrs over)

Target margin: 50%
Projected margin: 43.4% (-6.6 points)

Reason: Dense undergrowth (AFISS missed)
```

---

## Learning System (ML Feedback Loop)

Every completed work order feeds back to improve estimates:

```typescript
// After work order complete
await createJobPerformanceMetrics({
  workOrderId,
  proposalId,

  // What we estimated
  treeShopScore: 26.67,
  afissMultiplier: 1.27,
  estimatedProductionHours: 13.85,
  estimatedTransportHours: 0.75,
  estimatedTotalHours: 16.06,
  estimatedCost: 4592.49,
  targetMargin: 50%,

  // What actually happened
  actualProductionHours: 14.5,
  actualTransportHours: 0.75,
  actualTotalHours: 16.9,
  actualCost: 4800.14,
  actualMargin: 47.7%,

  // Variance analysis
  productionVarianceHours: 0.65,       // 4.7% over
  totalVariancePercent: 5.2%,          // Within acceptable range

  // Why?
  siteAccessDifficulty: 6,             // Medium
  vegetationDensity: "Heavy",          // Denser than expected
  weatherCondition: "Clear",           // Good conditions
  crewAvgTier: 3.5,                    // Experienced crew

  // Learning
  accuracyScore: 94.8,                 // Very close estimate
  includeInTraining: true,             // Use for ML
});
```

Over time, your TreeShop Score formulas get smarter:
- Identify which AFISS factors have biggest impact
- Adjust production rates per equipment/crew
- Seasonal variations
- Customer behavior patterns

---

## Key Differences from Proposal Stage

| Aspect | Proposal | Work Order |
|--------|----------|------------|
| **Purpose** | Sell the job | Execute the job |
| **User** | Estimator/Manager | Field Crew |
| **Focus** | Pricing accuracy | Time tracking & documentation |
| **Editing** | Prices can change | Prices locked (contract) |
| **Time Data** | Estimates only | Actual time tracked |
| **Photos** | Optional (site visit) | Required (before/during/after) |
| **Signature** | Customer accepts quote | Customer approves completion |
| **Next Stage** | Work Order | Invoice |

---

## UI Component Hierarchy

### Manager Dashboard
```
Work Orders List
├── Status Filter (Scheduled, In Progress, Completed)
├── Date Range Filter
├── Work Order Cards
│   ├── Customer Info
│   ├── Service Type
│   ├── Scheduled Date/Time
│   ├── Assigned Crew
│   ├── Status Badge
│   └── Quick Actions (Start, View, Complete)
└── New Work Order Button (Direct creation)
```

### Work Order Detail (Manager View)
```
Work Order Header
├── Customer & Property Info
├── Service Details
├── Financial Summary (Est vs Actual)
└── Status & Actions

Line Items Section
├── Line Item Cards
│   ├── Service Description
│   ├── Estimated Hours
│   ├── Actual Hours (if tracking)
│   ├── Variance Display
│   ├── Status Badge
│   └── Crew Assigned
└── Add Line Item (for change orders)

Time Tracking Section
├── Active Time Entries
├── Crew Performance
└── Equipment Utilization

Documentation Section
├── Photo Gallery (Before/During/After)
├── Crew Notes
├── Customer Communications
└── Safety Reports

Completion Checklist
├── Checkboxes (Photos, Cleanup, etc.)
├── Customer Signature Canvas
└── Complete Work Order Button
```

### Mobile Crew App
```
Daily Schedule
├── Today's Jobs List
├── Weather Info
└── Job Cards (Tap to view)

Job Detail
├── Customer Info & Map
├── Service Overview
├── Line Items List
│   ├── Start/Pause/Complete buttons
│   └── Time tracking display
├── Quick Actions
│   ├── Take Photo
│   ├── Add Note
│   ├── Report Issue
│   └── Contact Customer
└── Complete Job Button

Time Clock Screen
├── Current Line Item
├── Elapsed Time
├── Crew Members Clocked In
├── Equipment Assigned
└── Pause/Complete buttons

Photo Screen
├── Camera interface
├── Photo gallery
├── Category tags (Before/During/After)
└── Upload status

Completion Screen
├── Checklist
├── Customer Signature Canvas
├── Final Notes
└── Submit button
```

---

## API Endpoints Summary

### Queries
```typescript
// Get work orders
workOrders.list()                      // All for org
workOrders.listByStatus(status)        // Filter by status
workOrders.listByProposal(proposalId)  // From specific proposal
workOrders.listByCustomer(customerId)  // For specific customer
workOrders.listDirect()                // Only direct WOs
workOrders.get(id)                     // Single WO detail

// Employee portal queries
workOrders.getMyWorkOrders()           // Current user's assigned WOs
workOrders.getMyWorkOrdersByStatus(status)
workOrders.getMyWorkOrdersByDate(date)
workOrders.getMyWorkOrdersInRange(start, end)
```

### Mutations
```typescript
// Create
workOrders.create({...})               // From proposal
workOrders.createDirect({...})         // Direct creation

// Update
workOrders.update(id, {...})           // General updates
workOrders.startWork(id)               // Status → In Progress
workOrders.complete(id, signature)     // Status → Completed

// Documentation
workOrders.addCrewNote(id, note)
workOrders.addCustomerCommunication(id, note)

// Time tracking (via line items)
lineItems.update(id, {...})
lineItems.markComplete(id)
lineItems.updateTimeTracking(id, actual, variance)

// Time entries
timeEntries.create({...})
timeEntries.clockOut(id)
```

---

## Implementation Priority

### Phase 1: Basic Work Order (Week 1)
- ✅ Schema already exists
- ✅ Basic create/update mutations exist
- ✅ Direct work order creation exists
- Build work order detail view
- Add crew/equipment assignment UI
- Basic status transitions

### Phase 2: Line Item Time Tracking (Week 2)
- Enable time tracking on line items
- Create time entry system
- Build mobile time clock UI
- Real-time variance calculations
- Cost tracking integration

### Phase 3: Documentation (Week 3)
- Photo upload system (before/during/after)
- Crew notes interface
- Customer communication log
- Safety checklist

### Phase 4: Completion & Sign-Off (Week 4)
- Completion checklist UI
- Digital signature canvas
- Customer walkthrough form
- Auto-transition to invoice

### Phase 5: Analytics & Learning (Week 5)
- Performance metrics dashboard
- Estimate vs actual reports
- Crew efficiency tracking
- ML training data collection

---

## Success Metrics

Track these to validate the work order system:

1. **Estimate Accuracy**
   - Target: 90%+ of jobs within 10% of estimate
   - Measure: Actual hours vs estimated hours

2. **Crew Efficiency**
   - Target: Consistent or improving production rates
   - Measure: Points per hour (PPH) by service type

3. **Profitability**
   - Target: 50% average margin (your standard)
   - Measure: Actual margin vs target margin

4. **Customer Satisfaction**
   - Target: 95%+ completion sign-offs
   - Measure: Signature capture rate + feedback

5. **Documentation Compliance**
   - Target: 100% jobs with before/after photos
   - Measure: Photo upload completion rate

---

## Next Steps

1. Review this spec with you to confirm understanding
2. Build work order detail view (manager interface)
3. Build mobile crew app (field interface)
4. Implement time tracking per line item
5. Add photo documentation system
6. Build completion & sign-off flow
7. Create analytics dashboard
8. Test with real work orders

This is the core competitive advantage: **Real-time profitability tracking at the line item level.** No other tree service software does this.
