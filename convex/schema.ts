import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Organizations (synced from Clerk)
  organizations: defineTable({
    clerkOrgId: v.string(), // Clerk organization ID
    name: v.string(),
    slug: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    settings: v.optional(
      v.object({
        defaultMargin: v.number(),
        timezone: v.string(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_clerk_org_id", ["clerkOrgId"])
    .index("by_slug", ["slug"]),

  // Equipment
  equipment: defineTable({
    organizationId: v.id("organizations"),
    // Identity
    nickname: v.optional(v.string()),
    year: v.number(),
    make: v.string(),
    model: v.string(),
    serialNumber: v.optional(v.string()),
    vin: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    equipmentCategory: v.optional(v.string()), // Major category from EQUIPMENT_TAXONOMY (e.g., "Trucks & Vehicles", "Carriers", "Attachments - Mulching & Cutting")
    equipmentSubcategory: v.optional(v.string()), // Specific subcategory (e.g., "Heavy Duty Pickup", "Skid Steer", "Skid Steer Forestry Mulcher")
    // Legacy fields (deprecated but kept for backward compatibility)
    equipmentType: v.optional(v.string()),
    equipmentSubtype: v.optional(v.string()),
    // Acquisition & Financial
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
    // Cost Structure
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
    productivityRate: v.optional(v.number()), // Points per Hour (PpH)
    // Status & Tracking
    currentMeterReading: v.optional(v.number()),
    status: v.string(), // Available, In Use, Maintenance, Down, Retired
    currentLocation: v.optional(v.string()),
    assignedOperator: v.optional(v.string()),
    // Maintenance
    serviceInterval: v.optional(v.number()),
    lastServiceDate: v.optional(v.number()),
    lastServiceHours: v.optional(v.number()),
    // Other
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_status", ["organizationId", "status"]),

  // Employees
  employees: defineTable({
    organizationId: v.id("organizations"),
    clerkUserId: v.optional(v.string()), // Link to Clerk user if they have account
    // Personal Information
    firstName: v.string(),
    lastName: v.string(),
    preferredName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneSecondary: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    address: v.optional(v.string()),
    // Emergency Contact
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    // Employment Details
    hireDate: v.number(),
    employeeId: v.optional(v.string()),
    employmentType: v.string(), // "Full-Time", "Part-Time", "Seasonal", "Contract"
    employmentStatus: v.string(), // "Active", "Inactive", "On Leave", "Terminated"
    homeBranch: v.optional(v.string()),
    reportsTo: v.optional(v.string()),
    // Career Track System
    primaryTrack: v.string(), // ATC, TRS, FOR, LCL, MUL, STG, ESR, LSC, EQO, MNT, SAL, PMC, ADM, FIN, SAF, TEC
    tier: v.number(), // 1-5
    yearsExperience: v.optional(v.number()),
    // Add-ons (stackable premiums)
    leadership: v.optional(v.string()), // L, S, M, D, C
    equipmentCerts: v.array(v.string()), // E1, E2, E3, E4
    driverLicenses: v.array(v.string()), // D1, D2, D3, DH
    certifications: v.array(v.string()), // ISA, CRA, TRA, OSH, PES, CPR
    // Compensation
    baseHourlyRate: v.number(),
    // Other
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_clerk_user", ["organizationId", "clerkUserId"])
    .index("by_org_status", ["organizationId", "employmentStatus"])
    .index("by_org_track", ["organizationId", "primaryTrack"]),

  // Loadouts
  loadouts: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),

    // NEW: Multiple service types this loadout can perform
    serviceTypes: v.array(v.string()), // ["Forestry Mulching", "Land Clearing", "Brush Clearing"]

    // DEPRECATED: Legacy single service type (kept for backward compatibility)
    serviceType: v.optional(v.string()),

    equipmentIds: v.array(v.id("equipment")),
    employeeIds: v.array(v.id("employees")),

    // NEW: Service-specific production rates
    productionRates: v.optional(v.object({
      "Forestry Mulching": v.optional(v.number()),
      "Land Clearing": v.optional(v.number()),
      "Brush Clearing": v.optional(v.number()),
      "Stump Grinding": v.optional(v.number()),
      "Tree Removal": v.optional(v.number()),
      "Tree Trimming": v.optional(v.number()),
    })),

    // DEPRECATED: Legacy single production rate (kept for backward compatibility)
    productionRate: v.optional(v.number()), // PpH (Points per Hour)

    totalEquipmentCost: v.number(),
    totalLaborCost: v.number(),
    totalCostPerHour: v.number(),
    // Pre-calculated billing rates at different margins
    billingRates: v.object({
      margin30: v.number(),
      margin40: v.number(),
      margin50: v.number(),
      margin60: v.number(),
      margin70: v.number(),
    }),
    status: v.string(), // "Active", "Inactive"
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_service", ["organizationId", "serviceType"]),

  // Customers
  customers: defineTable({
    organizationId: v.id("organizations"),
    // Contact Information
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),
    company: v.optional(v.string()),
    // Property Address (Primary)
    propertyAddress: v.string(),
    propertyCity: v.optional(v.string()),
    propertyState: v.optional(v.string()),
    propertyZip: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    // Billing Address (if different)
    billingAddress: v.optional(v.string()),
    billingCity: v.optional(v.string()),
    billingState: v.optional(v.string()),
    billingZip: v.optional(v.string()),
    // Additional Details
    source: v.optional(v.string()), // "Referral", "Website", "Google", "Repeat", "Other"
    referredBy: v.optional(v.string()),
    customerType: v.optional(v.string()), // "Residential", "Commercial", "Municipal", "HOA"
    preferredContactMethod: v.optional(v.string()), // "Phone", "Email", "Text"
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    // Stats
    totalProjects: v.optional(v.number()),
    totalRevenue: v.optional(v.number()),
    lastProjectDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .searchIndex("search_customers", {
      searchField: "lastName",
      filterFields: ["organizationId"],
    }),

  // Projects
  projects: defineTable({
    organizationId: v.id("organizations"),
    customerId: v.optional(v.id("customers")), // Optional - leads may not have customer record yet

    // Lead-specific fields (when no customer record exists)
    customerName: v.optional(v.string()), // DEPRECATED - keeping for backward compatibility
    customerFirstName: v.optional(v.string()),
    customerLastName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    leadStatus: v.optional(v.string()), // "New", "Contacted", "Qualified", "Unqualified"
    leadSource: v.optional(v.string()),

    // Project details
    name: v.optional(v.string()),
    serviceType: v.string(),
    status: v.string(), // "Lead", "Proposal", "Work Order", "Invoice", "Completed"
    proposalStatus: v.optional(v.string()),
    workOrderStatus: v.optional(v.string()),
    invoiceStatus: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    amountPaid: v.optional(v.number()),
    propertyAddress: v.string(),
    driveTimeMinutes: v.optional(v.number()),
    treeShopScore: v.optional(v.number()),
    afissMultiplier: v.optional(v.number()),
    afissFactors: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    // Locking (prevent edits after work order created)
    isLocked: v.optional(v.boolean()),
    lockedAt: v.optional(v.number()),
    lockedReason: v.optional(v.string()), // "Work order created", "Invoiced", etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_status", ["organizationId", "status"])
    .index("by_org_customer", ["organizationId", "customerId"])
    .index("by_customer", ["customerId"]),

  // Proposals
  proposals: defineTable({
    organizationId: v.id("organizations"),
    projectId: v.id("projects"),
    customerId: v.id("customers"),
    loadoutId: v.optional(v.id("loadouts")), // Optional: may have multiple loadouts via line items
    scopeOfWork: v.string(),
    whatsIncluded: v.array(v.string()),
    whatsNotIncluded: v.array(v.string()),
    priceRangeLow: v.number(),
    priceRangeHigh: v.number(),
    estimatedHours: v.number(),
    productionHours: v.number(),
    transportHours: v.number(),
    bufferHours: v.number(),
    afissFactors: v.array(v.string()),
    terms: v.optional(v.string()),
    status: v.string(), // "Draft", "Sent", "Viewed", "Signed", "Expired", "Declined"
    signatureData: v.optional(v.string()),
    signedBy: v.optional(v.string()),
    signedAt: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    driveTimeMinutes: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_project", ["projectId"])
    .index("by_org_status", ["organizationId", "status"]),

  // Line Items (atomic units of work with scoring)
  lineItems: defineTable({
    organizationId: v.id("organizations"),
    parentDocId: v.string(), // ID of parent document (proposal, work order, or invoice)
    parentDocType: v.string(), // "Proposal", "WorkOrder", "Invoice"
    lineNumber: v.number(),

    // Service Details
    serviceType: v.string(), // "Stump Grinding", "Mulching", "Tree Removal", etc.
    description: v.string(),

    // Scoring System
    formulaUsed: v.string(), // "StumpScore", "TreeShopScore", "ClearingScore", "TreeScore", "TrimScore"
    workVolumeInputs: v.any(), // Service-specific inputs (JSON object)
    baseScore: v.number(),
    complexityMultiplier: v.number(), // AFISS multiplier
    adjustedScore: v.number(),

    // Loadout Assignment
    loadoutId: v.id("loadouts"),
    loadoutName: v.string(),
    productionRatePPH: v.number(), // Points per hour for this service type
    costPerHour: v.number(),
    billingRatePerHour: v.number(),
    targetMargin: v.number(),

    // Time Estimates
    productionHours: v.number(), // Score ÷ PPH
    transportHours: v.number(), // (Drive × 2) × transport_rate
    bufferHours: v.number(), // (Prod + Transport) × 0.10
    totalEstimatedHours: v.number(),

    // Pricing
    pricingMethod: v.string(), // "Hourly", "Fixed", "Time & Materials"
    totalCost: v.number(),
    totalPrice: v.number(),
    profit: v.number(),
    marginPercent: v.number(),

    // Optional Upsells
    upsells: v.optional(v.array(v.object({
      upsellId: v.string(),
      description: v.string(),
      scoreAddition: v.number(),
      price: v.number(),
      selected: v.boolean(),
    }))),

    // Terms & Conditions specific to this service
    termsAndConditions: v.optional(v.array(v.string())),

    // Time Tracking (activated when Work Order created)
    timeTrackingEnabled: v.boolean(),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    totalActualHours: v.optional(v.number()),
    varianceHours: v.optional(v.number()),

    // Crew Time Entries (who worked on this line item)
    crewTimeEntries: v.optional(v.array(v.object({
      employeeId: v.id("employees"),
      employeeName: v.string(),
      clockIn: v.number(),
      clockOut: v.optional(v.number()),
      hoursWorked: v.optional(v.number()),
      laborCost: v.optional(v.number()), // hours × employee true cost/hr
    }))),

    // Actual Costs (calculated from time entries)
    actualLaborCost: v.optional(v.number()),
    actualEquipmentCost: v.optional(v.number()),
    actualTotalCost: v.optional(v.number()),
    actualProfit: v.optional(v.number()), // totalPrice - actualTotalCost
    actualMargin: v.optional(v.number()), // (actualProfit / totalPrice) × 100

    // Status
    status: v.string(), // "Pending", "In Progress", "Completed", "Invoiced"

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_parent_doc", ["parentDocId", "parentDocType"])
    .index("by_org_status", ["organizationId", "status"])
    .index("by_loadout", ["loadoutId"]),

  // Work Orders (execution phase with time tracking - supports both proposal-based and direct entry)
  workOrders: defineTable({
    organizationId: v.id("organizations"),

    // Source & Identity (NEW - for direct work orders)
    creationType: v.optional(v.string()), // "PROPOSAL" or "DIRECT"
    projectName: v.optional(v.string()), // For direct work orders
    workOrderNumber: v.optional(v.string()), // Auto-generated: WO-YYYYMMDD-XXX

    proposalId: v.optional(v.id("proposals")), // Optional for direct work orders
    projectId: v.optional(v.id("projects")), // Optional for direct work orders
    customerId: v.id("customers"),

    // Scheduling
    scheduledDate: v.optional(v.number()), // Made optional for direct work orders
    scheduledStartTime: v.optional(v.string()), // "08:00"
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    totalJobHours: v.optional(v.number()),

    // Assigned Resources
    primaryLoadoutId: v.optional(v.id("loadouts")),
    crewMemberIds: v.optional(v.array(v.id("employees"))), // Made optional
    equipmentIds: v.optional(v.array(v.id("equipment"))), // Made optional

    // Site Conditions
    propertyAddress: v.string(),
    propertyCoordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    weather: v.optional(v.string()),
    accessNotes: v.optional(v.string()),
    hazards: v.optional(v.array(v.string())),
    parkingInstructions: v.optional(v.string()),

    // Service Details (NEW - for direct work orders)
    serviceType: v.optional(v.string()), // "Forestry Mulching", "Land Clearing", etc.
    estimatedAcres: v.optional(v.number()),
    actualAcres: v.optional(v.number()),

    // Financial (NEW - for direct work orders)
    contractAmount: v.optional(v.number()), // What customer is paying
    estimatedDuration: v.optional(v.number()), // Hours
    estimatedCost: v.optional(v.number()), // Your cost estimate
    targetMargin: v.optional(v.number()), // Target profit %
    loadoutHourlyRate: v.optional(v.number()), // Snapshot at creation

    // TreeShop Score (NEW - for direct work orders)
    treeShopScore: v.optional(v.number()),
    afissMultiplier: v.optional(v.number()),
    selectedAfissFactors: v.optional(v.array(v.string())),

    // Safety
    safetyBriefingCompleted: v.optional(v.boolean()), // Made optional
    safetyBriefingTime: v.optional(v.number()),
    safetyAttendees: v.optional(v.array(v.id("employees"))),
    ppeVerified: v.optional(v.boolean()), // Made optional
    incidentReports: v.optional(v.array(v.string())),

    // Documentation
    photosBefore: v.optional(v.array(v.string())),
    photosDuring: v.optional(v.array(v.string())),
    photosAfter: v.optional(v.array(v.string())),
    crewNotes: v.optional(v.array(v.object({
      timestamp: v.number(),
      note: v.string(),
      createdBy: v.id("employees"),
    }))),
    customerCommunications: v.optional(v.array(v.object({
      timestamp: v.number(),
      note: v.string(),
      createdBy: v.id("employees"),
    }))),

    // Additional Documentation (NEW)
    poNumber: v.optional(v.string()), // Customer PO
    paymentTerms: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    notes: v.optional(v.string()),

    // Materials Used
    fuelGallons: v.optional(v.number()),
    consumablesCost: v.optional(v.number()),
    materialsNotes: v.optional(v.string()),

    // Completion Checklist
    allLineItemsComplete: v.optional(v.boolean()), // Made optional
    finalPhotosUploaded: v.optional(v.boolean()), // Made optional
    customerWalkthroughComplete: v.optional(v.boolean()), // Made optional
    customerSignature: v.optional(v.string()),
    customerSignedAt: v.optional(v.number()),
    debrisRemoved: v.optional(v.boolean()), // Made optional
    siteRestored: v.optional(v.boolean()), // Made optional
    equipmentCleaned: v.optional(v.boolean()), // Made optional
    completionNotes: v.optional(v.string()),
    completionPhotos: v.optional(v.array(v.string())),

    // Status
    status: v.union(
      v.literal("Created"),
      v.literal("PreScheduled"),
      v.literal("Scheduled"),
      v.literal("In Progress"),
      v.literal("Paused"),
      v.literal("Completed"),
      v.literal("Invoiced"),
      v.literal("Cancelled")
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // User ID who created
  })
    .index("by_organization", ["organizationId"])
    .index("by_proposal", ["proposalId"])
    .index("by_project", ["projectId"])
    .index("by_customer", ["customerId"])
    .index("by_org_status", ["organizationId", "status"])
    .index("by_scheduled_date", ["organizationId", "scheduledDate"])
    .index("by_creation_type", ["organizationId", "creationType"])
    .index("by_work_order_number", ["organizationId", "workOrderNumber"]),

  // Time Entries (activity tracking - supports both line item and direct work order tracking)
  timeEntries: defineTable({
    organizationId: v.id("organizations"),
    workOrderId: v.id("workOrders"),
    lineItemId: v.optional(v.id("lineItems")), // Optional for direct work orders
    projectId: v.optional(v.id("projects")), // Denormalized for rollup reporting
    serviceType: v.optional(v.string()), // Denormalized from lineItem for easier querying

    // Employee & Loadout
    employeeId: v.id("employees"),
    employeeCode: v.optional(v.string()), // e.g., "STG3+E2" - Made optional
    employeeName: v.optional(v.string()), // Denormalized for reporting speed
    loadoutId: v.optional(v.id("loadouts")),
    loadoutName: v.optional(v.string()), // Denormalized for reporting

    // NEW: Activity Type System (for direct work orders)
    activityTypeId: v.optional(v.id("activityTypes")),
    activityName: v.optional(v.string()), // Denormalized for reporting speed

    // Activity Classification
    activityCategory: v.string(), // "PRODUCTION", "TRANSPORT", "SUPPORT"
    activityType: v.optional(v.string()), // "Grinding", "Transport", "Setup", etc.
    activityDetail: v.optional(v.string()),
    billable: v.boolean(),
    isProduction: v.optional(v.boolean()), // NEW - track production vs support

    // Time Data
    startTime: v.number(),
    endTime: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    durationHours: v.optional(v.number()),
    status: v.optional(v.string()), // NEW - "ACTIVE", "PAUSED", "COMPLETED"

    // GPS Location Tracking (Enhanced)
    locationStart: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.optional(v.number()), // NEW - GPS accuracy in meters
    })),
    locationEnd: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.optional(v.number()),
    })),
    distanceTraveled: v.optional(v.number()), // NEW - miles or km

    // Equipment (Enhanced)
    equipmentIds: v.optional(v.array(v.id("equipment"))), // NEW - multiple equipment support
    equipmentNames: v.optional(v.array(v.string())), // Denormalized for reporting
    equipmentHourlyRates: v.optional(v.array(v.number())), // Snapshot of each equipment's rate

    // NEW: Cost Tracking (calculated and cached)
    employeeHourlyRate: v.optional(v.number()), // Snapshot at time of entry
    employeeBurdenMultiplier: v.optional(v.number()), // Usually 1.7
    laborCost: v.optional(v.number()), // hours × rate × multiplier
    equipmentCost: v.optional(v.number()), // Sum of equipment costs
    totalCost: v.optional(v.number()), // labor + equipment

    // Documentation
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    photoUrls: v.optional(v.array(v.string())), // NEW - for cloud storage URLs
    voiceNoteUrl: v.optional(v.string()), // NEW

    // NEW: Pause/Resume
    pausedAt: v.optional(v.number()),
    pauseDurationMinutes: v.optional(v.number()),

    // Tracking Metadata
    recordedBy: v.optional(v.string()), // "Employee", "Manager", "Auto" - Made optional
    recordedMethod: v.optional(v.string()), // "Mobile App", "Manual Entry", "GPS Auto" - Made optional
    timestampRecorded: v.optional(v.number()), // Made optional

    // Approval
    approved: v.optional(v.boolean()), // Made optional
    approvedBy: v.optional(v.id("employees")),
    approvedDate: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()), // NEW
  })
    .index("by_organization", ["organizationId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_line_item", ["lineItemId"])
    .index("by_employee", ["employeeId"])
    .index("by_org_employee", ["organizationId", "employeeId"])
    .index("by_billable", ["organizationId", "billable"])
    .index("by_activity_type", ["activityTypeId"]) // NEW
    .index("by_status", ["organizationId", "status"]) // NEW
    .index("by_production", ["organizationId", "isProduction"]) // NEW
    .index("by_date", ["organizationId", "startTime"]) // NEW
    .index("by_employee_date", ["employeeId", "startTime"]), // NEW

  // Invoices (final billing)
  invoices: defineTable({
    organizationId: v.id("organizations"),
    workOrderId: v.id("workOrders"),
    projectId: v.id("projects"),
    customerId: v.id("customers"),

    // Invoice Details
    invoiceNumber: v.optional(v.string()), // Custom invoice number (auto-generated if not provided)
    invoiceDate: v.number(),
    dueDate: v.number(),
    paymentTerms: v.string(), // "Net 15", "Net 30", "Due on Receipt"

    // Billing Address
    billingName: v.string(),
    billingAddress: v.string(),
    billingCity: v.optional(v.string()),
    billingState: v.optional(v.string()),
    billingZip: v.optional(v.string()),

    // Financial Totals
    subtotal: v.number(),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    additionalCharges: v.optional(v.number()),
    additionalChargesDescription: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    discountDescription: v.optional(v.string()),
    totalAmount: v.number(),

    // Payment Tracking
    amountPaid: v.number(),
    balanceRemaining: v.number(),
    payments: v.optional(v.array(v.object({
      paymentId: v.string(),
      paymentDate: v.number(),
      paymentMethod: v.string(), // "Cash", "Check", "Card", "ACH", "Wire"
      transactionId: v.optional(v.string()),
      amount: v.number(),
      recordedBy: v.optional(v.id("employees")),
    }))),

    // Status
    status: v.string(), // "Draft", "Sent", "Viewed", "Paid", "Partial", "Overdue", "Void"
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    paidInFullAt: v.optional(v.number()),

    // Notes
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_project", ["projectId"])
    .index("by_customer", ["customerId"])
    .index("by_org_status", ["organizationId", "status"])
    .index("by_invoice_number", ["organizationId", "invoiceNumber"])
    .index("by_due_date", ["organizationId", "dueDate"]),

  // Line Item Templates - Organization's reusable line items library
  lineItemTemplates: defineTable({
    organizationId: v.id("organizations"),

    // Template Info
    name: v.string(),
    description: v.string(),
    category: v.string(), // "Tree Removal", "Stump Grinding", "Mulching", "Land Clearing", "Equipment Rental", "Labor", "Materials", "Other"
    serviceType: v.optional(v.string()),

    // Loadout Assignment (NEW - for automatic cost/pricing calculation)
    loadoutId: v.optional(v.id("loadouts")), // Which loadout performs this service
    loadoutName: v.optional(v.string()), // Cached for quick display

    // Pricing Method (NEW - determines how user assigns hours/quantity)
    pricingMethod: v.optional(v.string()), // "Hourly" (assign hours, auto-price), "Unit" (existing), "Fixed"

    // Default Pricing
    defaultUnit: v.string(), // "Each", "Hour", "Day", "Acre", "Linear Foot", "Square Foot", "Cubic Yard", "Ton", "Tree", "Stump"
    defaultUnitPrice: v.number(),
    defaultQuantity: v.optional(v.number()),

    // Costing
    costPerUnit: v.optional(v.number()),
    defaultMargin: v.optional(v.number()),

    // Time Calculation Options (NEW - for hourly templates)
    estimatedHours: v.optional(v.number()), // Default hours estimate
    includeTransportTime: v.optional(v.boolean()), // Add transport time calculation
    transportRate: v.optional(v.number()), // Transport billing rate multiplier (e.g., 0.50)
    includeBuffer: v.optional(v.boolean()), // Add 10% buffer to total time
    timeTrackingEnabled: v.optional(v.boolean()), // Enable time tracking on work orders

    // Default Inclusions/Exclusions (NEW)
    defaultInclusions: v.optional(v.array(v.string())),
    defaultExclusions: v.optional(v.array(v.string())),

    // AFISS Factor IDs (selected complexity factors - percentages calculated server-side)
    afissFactorIds: v.optional(v.array(v.string())),

    // Status & Organization (NEW)
    isActive: v.optional(v.boolean()), // Active templates show in lists
    sortOrder: v.optional(v.number()), // For custom ordering

    // Metadata
    usageCount: v.optional(v.number()),
    lastUsed: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_category", ["organizationId", "category"])
    .index("by_org_service", ["organizationId", "serviceType"])
    .index("by_loadout", ["loadoutId"])
    .index("by_org_active", ["organizationId", "isActive"]),

  // Organization Settings - Terms, conditions, and document templates
  organizationSettings: defineTable({
    organizationId: v.id("organizations"),

    // Terms & Conditions
    proposalTerms: v.optional(v.string()), // Default terms for proposals
    workOrderTerms: v.optional(v.string()), // Default terms for work orders
    invoiceTerms: v.optional(v.string()), // Default terms for invoices
    paymentTerms: v.optional(v.string()), // Payment terms (Net 30, Due on Receipt, etc)

    // Proposal Settings
    proposalValidityDays: v.optional(v.number()), // How long proposal is valid
    proposalFooter: v.optional(v.string()),
    proposalHeader: v.optional(v.string()),
    showDetailedBreakdown: v.optional(v.boolean()), // Show line item costs in proposal

    // Invoice Settings
    invoicePrefix: v.optional(v.string()), // Invoice number prefix (INV-)
    invoiceStartNumber: v.optional(v.number()),
    invoiceFooter: v.optional(v.string()),
    lateFeePercentage: v.optional(v.number()),
    lateFeeDaysAfterDue: v.optional(v.number()),

    // Work Order Settings
    requireCustomerSignature: v.optional(v.boolean()),
    requirePhotoDocumentation: v.optional(v.boolean()),
    minimumPhotos: v.optional(v.number()),

    // Business Info (for documents)
    companyLegalName: v.optional(v.string()),
    companyTagline: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    insuranceCertificate: v.optional(v.string()),
    taxId: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),

    // Liability & Insurance
    liabilityDisclaimer: v.optional(v.string()),
    insuranceInfo: v.optional(v.string()),
    warrantyInfo: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"]),

  // Saved Drawings - Map drawings for proposals and measurements
  savedDrawings: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    drawingData: v.object({
      type: v.string(), // 'polygon', 'circle', 'polyline', 'marker'
      coordinates: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
      center: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      radius: v.optional(v.number()),
      position: v.optional(v.object({ lat: v.number(), lng: v.number() }))
    }),
    measurements: v.optional(v.object({
      area: v.optional(v.string()),
      areaSqFt: v.optional(v.number()),
      perimeter: v.optional(v.number()),
      perimeterMiles: v.optional(v.string()),
      distance: v.optional(v.number()),
      distanceMiles: v.optional(v.string()),
      radius: v.optional(v.number()),
      circumference: v.optional(v.number())
    })),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"]),

  // ============================================
  // ADVANCED DATA COLLECTION & ML TABLES
  // ============================================

  // Job Performance Metrics - Actual vs Estimated tracking for ML
  jobPerformanceMetrics: defineTable({
    organizationId: v.id("organizations"),
    workOrderId: v.id("workOrders"),
    projectId: v.id("projects"),
    proposalId: v.id("proposals"),
    customerId: v.id("customers"),
    loadoutId: v.id("loadouts"),

    // Service Details
    serviceType: v.string(),
    treeShopScore: v.number(), // Original score
    afissMultiplier: v.number(), // Complexity multiplier
    productionRatePPH: v.number(), // Expected PpH

    // Time Estimates vs Actuals
    estimatedProductionHours: v.number(),
    actualProductionHours: v.number(),
    productionVarianceHours: v.number(), // Actual - Estimated
    productionVariancePercent: v.number(), // (Actual - Est) / Est * 100

    estimatedTransportHours: v.number(),
    actualTransportHours: v.number(),
    transportVarianceHours: v.number(),

    estimatedTotalHours: v.number(),
    actualTotalHours: v.number(),
    totalVarianceHours: v.number(),
    totalVariancePercent: v.number(),

    // Cost Estimates vs Actuals
    estimatedEquipmentCost: v.number(),
    actualEquipmentCost: v.number(),
    equipmentCostVariance: v.number(),

    estimatedLaborCost: v.number(),
    actualLaborCost: v.number(),
    laborCostVariance: v.number(),

    estimatedTotalCost: v.number(),
    actualTotalCost: v.number(),
    totalCostVariance: v.number(),
    totalCostVariancePercent: v.number(),

    // Revenue & Profitability
    quotedPrice: v.number(),
    finalPrice: v.number(), // May include change orders
    priceVariance: v.number(),

    targetMargin: v.number(),
    actualMargin: v.number(),
    marginVariance: v.number(),

    targetProfit: v.number(),
    actualProfit: v.number(),
    profitVariance: v.number(),
    profitVariancePercent: v.number(),

    // Crew Performance
    crewMemberIds: v.array(v.id("employees")),
    crewSize: v.number(),
    avgCrewTier: v.number(), // Average tier level
    crewCertificationCount: v.number(), // Total certs across crew
    crewExperienceYears: v.number(), // Total years of experience

    // Equipment Performance
    equipmentIds: v.array(v.id("equipment")),
    equipmentCount: v.number(),
    equipmentTotalValue: v.number(),
    equipmentAvgAge: v.number(), // Years

    // Site Conditions (captured at execution)
    weatherCondition: v.optional(v.string()), // "Clear", "Rain", "Snow", "Wind", "Extreme Heat"
    temperature: v.optional(v.number()), // Fahrenheit
    precipitation: v.optional(v.number()), // Inches
    windSpeed: v.optional(v.number()), // MPH
    humidity: v.optional(v.number()), // Percentage

    siteAccessDifficulty: v.optional(v.number()), // 1-10 scale
    siteTerrainType: v.optional(v.string()), // "Flat", "Sloped", "Steep", "Mixed"
    soilCondition: v.optional(v.string()), // "Dry", "Wet", "Muddy", "Rocky"
    vegetationDensity: v.optional(v.string()), // "Light", "Medium", "Heavy", "Very Heavy"

    // Obstacles & Hazards (captured)
    powerLinesPresent: v.boolean(),
    buildingsNearby: v.boolean(),
    undergroundUtilities: v.boolean(),
    publicRoadAccess: v.boolean(),
    gateWidth: v.optional(v.number()), // Inches
    drivewayLength: v.optional(v.number()), // Feet

    // Customer Factors
    customerCommunicationQuality: v.optional(v.number()), // 1-10 scale
    customerOnSite: v.boolean(),
    scopeChanges: v.number(), // Count of change orders
    scopeChangeImpactHours: v.number(),

    // Quality Metrics
    customerSatisfactionScore: v.optional(v.number()), // 1-10
    customerReviewRating: v.optional(v.number()), // 1-5 stars
    reworkRequired: v.boolean(),
    reworkHours: v.optional(v.number()),
    complaintsFiled: v.number(),

    // Safety Metrics
    safetyIncidents: v.number(),
    nearMisses: v.number(),
    safetyScore: v.number(), // 1-10, calculated

    // Learning Factors (for ML)
    accuracyScore: v.number(), // How close estimate was to actual (100 = perfect)
    efficiencyScore: v.number(), // Actual vs expected production rate
    profitabilityScore: v.number(), // Actual profit vs target
    overallPerformanceScore: v.number(), // Composite score

    // ML Feature Flags
    includeInTraining: v.boolean(), // Use for ML training
    outlier: v.boolean(), // Flag unusual jobs
    outlierReason: v.optional(v.string()),

    completedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_service_type", ["organizationId", "serviceType"])
    .index("by_loadout", ["organizationId", "loadoutId"])
    .index("by_completed_date", ["organizationId", "completedAt"])
    .index("by_include_training", ["organizationId", "includeInTraining"])
    .index("by_performance_score", ["organizationId", "overallPerformanceScore"]),

  // Equipment Utilization Tracking - Detailed equipment usage per job
  equipmentUtilizationLogs: defineTable({
    organizationId: v.id("organizations"),
    equipmentId: v.id("equipment"),
    workOrderId: v.id("workOrders"),
    projectId: v.id("projects"),

    // Equipment Details (snapshot at time of use)
    equipmentNickname: v.string(),
    equipmentCategory: v.string(),
    equipmentSubcategory: v.string(),
    equipmentAge: v.number(), // Years old at time of use
    equipmentMeterReading: v.number(), // Hours on equipment

    // Usage Details
    startTime: v.number(),
    endTime: v.number(),
    totalHours: v.number(),
    productiveHours: v.number(), // Actually working vs idle
    idleHours: v.number(),
    utilizationRate: v.number(), // Productive / Total

    // Operator
    operatorId: v.id("employees"),
    operatorExperience: v.number(), // Years
    operatorCertifications: v.array(v.string()),

    // Costs
    hourlyOwnershipCost: v.number(),
    hourlyOperatingCost: v.number(),
    totalHourlyCost: v.number(),
    totalCostThisJob: v.number(),

    // Fuel Consumption
    fuelGallonsUsed: v.optional(v.number()),
    fuelCost: v.optional(v.number()),
    fuelEfficiency: v.optional(v.number()), // Gallons per hour

    // Performance
    workVolume: v.optional(v.number()), // Inch-acres, stumps, acres, etc.
    actualProductionRate: v.optional(v.number()), // Actual PpH achieved
    expectedProductionRate: v.optional(v.number()),
    efficiencyRatio: v.optional(v.number()), // Actual / Expected

    // Maintenance Impact
    breakdownOccurred: v.boolean(),
    breakdownDurationMinutes: v.optional(v.number()),
    maintenanceRequired: v.boolean(),
    maintenanceType: v.optional(v.string()),

    // Revenue Attribution
    revenueGenerated: v.number(), // Portion of job revenue attributed to this equipment
    profitGenerated: v.number(),
    roi: v.number(), // Profit / Cost for this job

    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_equipment", ["equipmentId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_org_equipment", ["organizationId", "equipmentId"])
    .index("by_org_date", ["organizationId", "startTime"]),

  // Employee Productivity Tracking - Individual performance metrics
  employeeProductivityLogs: defineTable({
    organizationId: v.id("organizations"),
    employeeId: v.id("employees"),
    workOrderId: v.id("workOrders"),
    projectId: v.id("projects"),

    // Employee Details (snapshot)
    employeeName: v.string(),
    employeeTier: v.number(),
    employeeTrack: v.string(),
    baseHourlyRate: v.number(),
    trueCostPerHour: v.number(),

    // Time Tracking
    clockInTime: v.number(),
    clockOutTime: v.number(),
    totalHours: v.number(),
    productiveHours: v.number(),
    breakHours: v.number(),
    travelHours: v.number(),

    // Role on This Job
    role: v.string(), // "Operator", "Ground Crew", "Climber", "Leader", "Support"
    wasCrewLead: v.boolean(),
    equipmentOperated: v.optional(v.array(v.id("equipment"))),

    // Performance Metrics
    tasksCompleted: v.number(),
    workQualityScore: v.optional(v.number()), // 1-10, manager/customer rating
    safetyScore: v.optional(v.number()), // 1-10
    teamworkScore: v.optional(v.number()), // 1-10, peer rating

    // Output Metrics (service-specific)
    treesRemoved: v.optional(v.number()),
    stumpsGround: v.optional(v.number()),
    acresCleared: v.optional(v.number()),
    workVolumePoints: v.optional(v.number()),

    // Learning & Development
    skillsUsed: v.array(v.string()), // Tags for skills demonstrated
    newSkillsLearned: v.optional(v.array(v.string())),
    trainingProvided: v.optional(v.array(v.string())), // Training given to others
    certificationProgress: v.optional(v.array(v.string())),

    // Cost & Revenue Attribution
    laborCost: v.number(), // True cost × hours
    revenueGenerated: v.number(), // Attributed revenue
    profitGenerated: v.number(),
    profitPerHour: v.number(),

    // Incidents & Issues
    safetyIncidents: v.number(),
    equipmentDamage: v.boolean(),
    customerComplaints: v.number(),
    positiveCustomerFeedback: v.number(),

    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_employee", ["employeeId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_org_employee", ["organizationId", "employeeId"])
    .index("by_org_date", ["organizationId", "clockInTime"]),

  // Weather Data Log - Historical weather for ML correlation
  weatherDataLogs: defineTable({
    organizationId: v.id("organizations"),
    workOrderId: v.optional(v.id("workOrders")),
    projectId: v.optional(v.id("projects")),

    // Location
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),

    // Date & Time
    date: v.number(), // Date in YYYYMMDD format
    timestamp: v.number(),
    hour: v.number(), // 0-23

    // Weather Conditions
    condition: v.string(), // "Clear", "Cloudy", "Rain", "Snow", "Thunderstorm", "Fog"
    conditionCode: v.optional(v.string()), // API-specific code
    description: v.string(),

    // Temperature
    temperatureF: v.number(),
    feelsLikeF: v.number(),
    dewPointF: v.optional(v.number()),

    // Precipitation
    precipitationInches: v.number(),
    precipitationProbability: v.number(), // 0-100%
    precipitationType: v.optional(v.string()), // "rain", "snow", "sleet"

    // Wind
    windSpeedMPH: v.number(),
    windGustMPH: v.optional(v.number()),
    windDirection: v.optional(v.string()), // "N", "NE", "E", etc.
    windDirectionDegrees: v.optional(v.number()),

    // Atmospheric
    humidity: v.number(), // 0-100%
    pressure: v.optional(v.number()), // inHg
    visibility: v.optional(v.number()), // Miles
    cloudCover: v.optional(v.number()), // 0-100%
    uvIndex: v.optional(v.number()),

    // Extremes
    isExtremeHeat: v.boolean(), // > 95°F
    isExtremeCold: v.boolean(), // < 25°F
    isHighWind: v.boolean(), // > 20 MPH
    isHeavyRain: v.boolean(), // > 0.5" per hour
    isSevereWeather: v.boolean(), // Thunderstorm, tornado, etc.

    // Data Source
    dataSource: v.string(), // "OpenWeather", "WeatherAPI", "NOAA", "Manual"
    dataQuality: v.string(), // "Actual", "Forecast", "Historical"

    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_org_date", ["organizationId", "date"])
    .index("by_location", ["latitude", "longitude", "date"]),

  // Customer Behavior Analytics - Track customer patterns
  customerBehaviorLogs: defineTable({
    organizationId: v.id("organizations"),
    customerId: v.id("customers"),

    // Event Type
    eventType: v.string(), // "Lead Created", "Proposal Viewed", "Proposal Signed", "Payment Made", "Review Left", "Referral Made", "Service Requested"
    eventCategory: v.string(), // "Acquisition", "Engagement", "Transaction", "Retention", "Advocacy"

    // Event Details
    eventTimestamp: v.number(),
    eventData: v.optional(v.any()), // JSON object with event-specific data

    // Related Records
    projectId: v.optional(v.id("projects")),
    proposalId: v.optional(v.id("proposals")),
    workOrderId: v.optional(v.id("workOrders")),
    invoiceId: v.optional(v.id("invoices")),

    // Context
    serviceType: v.optional(v.string()),
    transactionAmount: v.optional(v.number()),
    communicationChannel: v.optional(v.string()), // "Phone", "Email", "Text", "In-Person", "Website"

    // Customer State at Event
    totalProjectsToDate: v.number(),
    totalRevenueToDate: v.number(),
    daysSinceLastProject: v.optional(v.number()),
    customerLifetimeDays: v.number(), // Days since first contact

    // Behavioral Metrics
    responseTimeHours: v.optional(v.number()), // How quickly customer responded
    decisionTimeHours: v.optional(v.number()), // Time from proposal to decision
    engagementScore: v.optional(v.number()), // 1-10
    satisfactionScore: v.optional(v.number()), // 1-10

    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_customer", ["customerId"])
    .index("by_org_customer", ["organizationId", "customerId"])
    .index("by_event_type", ["organizationId", "eventType"])
    .index("by_event_date", ["organizationId", "eventTimestamp"]),

  // ML Training Data - Preprocessed data for machine learning
  mlTrainingData: defineTable({
    organizationId: v.id("organizations"),

    // Record ID
    recordType: v.string(), // "JobEstimate", "EquipmentUtilization", "EmployeeProductivity", "CustomerLTV"
    sourceRecordId: v.string(), // ID of source record (workOrder, jobPerformanceMetrics, etc.)

    // Features (input variables)
    features: v.object({
      // Service features
      serviceType: v.optional(v.string()),
      treeShopScore: v.optional(v.number()),
      afissMultiplier: v.optional(v.number()),
      acreage: v.optional(v.number()),
      treeCount: v.optional(v.number()),
      avgTreeDBH: v.optional(v.number()),

      // Site features
      driveTimeMinutes: v.optional(v.number()),
      siteAccessDifficulty: v.optional(v.number()),
      powerLinesPresent: v.optional(v.number()), // 0/1
      buildingsNearby: v.optional(v.number()),
      terrainSlope: v.optional(v.number()),
      vegetationDensity: v.optional(v.number()),

      // Weather features
      temperature: v.optional(v.number()),
      precipitation: v.optional(v.number()),
      windSpeed: v.optional(v.number()),
      humidity: v.optional(v.number()),

      // Crew features
      crewSize: v.optional(v.number()),
      avgCrewTier: v.optional(v.number()),
      totalCrewExperience: v.optional(v.number()),
      crewCertCount: v.optional(v.number()),

      // Equipment features
      equipmentCount: v.optional(v.number()),
      equipmentTotalValue: v.optional(v.number()),
      equipmentAvgAge: v.optional(v.number()),
      primaryEquipmentPPH: v.optional(v.number()),

      // Customer features
      customerLifetimeDays: v.optional(v.number()),
      customerTotalProjects: v.optional(v.number()),
      customerTotalRevenue: v.optional(v.number()),
      customerAvgSatisfaction: v.optional(v.number()),

      // Temporal features
      dayOfWeek: v.optional(v.number()), // 0-6
      monthOfYear: v.optional(v.number()), // 1-12
      seasonCode: v.optional(v.number()), // 1-4
    }),

    // Labels (output variables / targets)
    labels: v.object({
      actualHours: v.optional(v.number()),
      actualCost: v.optional(v.number()),
      actualProfit: v.optional(v.number()),
      actualMargin: v.optional(v.number()),
      estimateAccuracy: v.optional(v.number()),
      customerSatisfaction: v.optional(v.number()),
      profitability: v.optional(v.number()),
      efficiency: v.optional(v.number()),
    }),

    // Metadata
    dataQuality: v.string(), // "High", "Medium", "Low"
    completeness: v.number(), // 0-100% of features populated
    validated: v.boolean(),
    datasetSplit: v.optional(v.string()), // "train", "validation", "test"

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_record_type", ["organizationId", "recordType"])
    .index("by_quality", ["organizationId", "dataQuality"])
    .index("by_validated", ["organizationId", "validated"]),

  // ML Model Predictions - Store predictions for comparison
  mlPredictions: defineTable({
    organizationId: v.id("organizations"),

    // What we're predicting
    predictionType: v.string(), // "JobHours", "JobCost", "JobProfit", "CustomerLTV", "EquipmentUtilization"
    targetRecordType: v.string(), // "Project", "Proposal", "Customer", "Equipment"
    targetRecordId: v.string(),

    // Model Info
    modelVersion: v.string(),
    modelAlgorithm: v.optional(v.string()), // "Linear Regression", "Random Forest", "Neural Network"
    trainingDataCount: v.optional(v.number()),
    modelAccuracy: v.optional(v.number()), // R² or accuracy metric

    // Input Features Used
    inputFeatures: v.any(), // JSON snapshot of features

    // Predictions
    predictedValue: v.number(),
    confidenceScore: v.number(), // 0-100%
    predictionRange: v.optional(v.object({
      low: v.number(),
      high: v.number(),
    })),

    // Comparison (filled in after actual results)
    actualValue: v.optional(v.number()),
    predictionError: v.optional(v.number()), // Actual - Predicted
    predictionErrorPercent: v.optional(v.number()),
    predictionAccurate: v.optional(v.boolean()), // Within acceptable range

    // Contributing Factors
    topFeatures: v.optional(v.array(v.object({
      feature: v.string(),
      importance: v.number(),
      value: v.number(),
    }))),

    predictionMadeAt: v.number(),
    actualRecordedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_prediction_type", ["organizationId", "predictionType"])
    .index("by_target_record", ["targetRecordType", "targetRecordId"])
    .index("by_org_date", ["organizationId", "predictionMadeAt"]),

  // Model Performance Tracking - Track model accuracy over time
  mlModelPerformance: defineTable({
    organizationId: v.id("organizations"),

    // Model Info
    modelVersion: v.string(),
    modelType: v.string(), // "JobEstimation", "CustomerLTV", "ResourceOptimization"
    algorithm: v.string(),

    // Training Info
    trainingDatasetSize: v.number(),
    trainingStartDate: v.number(),
    trainingEndDate: v.number(),
    trainingDurationMinutes: v.number(),

    // Performance Metrics
    accuracy: v.number(), // R² for regression, accuracy for classification
    maeError: v.optional(v.number()), // Mean Absolute Error
    rmseError: v.optional(v.number()), // Root Mean Squared Error
    mapeError: v.optional(v.number()), // Mean Absolute Percentage Error

    // Validation Results
    validationAccuracy: v.number(),
    testAccuracy: v.optional(v.number()),
    crossValidationScores: v.optional(v.array(v.number())),

    // Feature Importance
    topFeatures: v.array(v.object({
      feature: v.string(),
      importance: v.number(),
    })),

    // Real-World Performance (after deployment)
    predictionCount: v.number(), // How many predictions made
    actualResultsCount: v.number(), // How many actuals recorded
    realWorldAccuracy: v.optional(v.number()), // Accuracy on actual vs predicted
    avgPredictionError: v.optional(v.number()),

    // Status
    status: v.string(), // "Training", "Deployed", "Deprecated"
    deployedAt: v.optional(v.number()),
    deprecatedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_model_type", ["organizationId", "modelType"])
    .index("by_status", ["organizationId", "status"]),

  // ============================================
  // DIRECT WORK ORDER & TIME TRACKING SYSTEM
  // ============================================

  // Activity Types - Master list of all trackable activities
  activityTypes: defineTable({
    organizationId: v.id("organizations"),

    // Identity
    name: v.string(), // "Forestry Mulching", "Shop Maintenance", etc.
    code: v.string(), // "FM", "SHOP_MAINT", etc. (for quick reference)
    category: v.string(), // "PRODUCTION", "TRANSPORT", "SUPPORT"
    subcategory: v.optional(v.string()), // "Billable Work", "Shop Operations", etc.

    // Classification
    isBillableDefault: v.boolean(), // Auto-set billable flag
    isProductionDefault: v.boolean(), // Auto-set production flag
    requiresEquipment: v.boolean(), // Must select equipment when clocking in
    requiresCertification: v.optional(v.string()), // Qualification code required

    // Display
    icon: v.optional(v.string()), // Icon name or emoji
    color: v.optional(v.string()), // Hex color for UI
    description: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_category", ["organizationId", "category"])
    .index("by_code", ["organizationId", "code"])
    .index("by_active", ["organizationId", "isActive"]),

  // Equipment Time Entries - Track equipment usage and hour meters
  equipmentTimeEntries: defineTable({
    organizationId: v.id("organizations"),

    // Links
    timeEntryId: v.id("timeEntries"),
    equipmentId: v.id("equipment"),
    workOrderId: v.id("workOrders"),

    // Hour Meter Tracking
    startHourMeter: v.optional(v.number()),
    endHourMeter: v.optional(v.number()),
    hoursUsed: v.optional(v.number()), // end - start

    // Cost (snapshot from equipment table)
    equipmentHourlyRate: v.optional(v.number()),
    equipmentCost: v.optional(v.number()), // hoursUsed × hourlyRate

    // Validation
    meterPhotoStart: v.optional(v.string()), // URL to photo of start meter
    meterPhotoEnd: v.optional(v.string()), // URL to photo of end meter
    varianceWarning: v.optional(v.boolean()), // If meter time differs >10% from clock time

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_time_entry", ["timeEntryId"])
    .index("by_equipment", ["equipmentId"])
    .index("by_work_order", ["workOrderId"]),

  // Work Order Summaries - Cached calculations for fast dashboard loading
  workOrderSummaries: defineTable({
    organizationId: v.id("organizations"),
    workOrderId: v.id("workOrders"),

    // Time Totals
    totalHours: v.number(),
    billableHours: v.number(),
    unbillableHours: v.number(),
    productionHours: v.number(),
    supportHours: v.number(),

    // Cost Breakdown
    totalLaborCost: v.number(),
    totalEquipmentCost: v.number(),
    totalProjectCost: v.number(),

    // Revenue & Profit
    contractAmount: v.number(),
    projectedProfit: v.number(), // contractAmount - totalProjectCost
    projectedMargin: v.number(), // (profit / contractAmount) × 100

    // Efficiency Metrics
    acresPerHour: v.optional(v.number()),
    inchAcresPerHour: v.optional(v.number()),
    costPerAcre: v.optional(v.number()),
    revenuePerHour: v.optional(v.number()),
    billablePercentage: v.number(), // (billable / total) × 100
    productionPercentage: v.number(), // (production / total) × 100

    // Activity Breakdown (JSON for flexibility)
    activityBreakdown: v.optional(v.string()), // JSON: {activityName: hours}
    employeeBreakdown: v.optional(v.string()), // JSON: {employeeName: {hours, cost}}
    equipmentBreakdown: v.optional(v.string()), // JSON: {equipmentName: {hours, cost}}

    // Status
    isComplete: v.boolean(),
    lastUpdated: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_updated", ["organizationId", "lastUpdated"]),
});
