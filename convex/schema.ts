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
    equipmentType: v.optional(v.string()), // Carrier, Attachment, Support Equipment, Tool
    equipmentSubtype: v.optional(v.string()), // Forestry Mulcher, Skid Steer, etc
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
    serviceType: v.string(), // "Forestry Mulching", "Land Clearing", "Stump Grinding", "Tree Removal", "Tree Trimming"
    equipmentIds: v.array(v.id("equipment")),
    employeeIds: v.array(v.id("employees")),
    productionRate: v.number(), // PpH (Points per Hour)
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
    customerId: v.id("customers"),
    serviceType: v.string(),
    status: v.string(), // "Lead", "Proposal", "Work Order", "Invoice", "Completed"
    propertyAddress: v.string(),
    driveTimeMinutes: v.optional(v.number()),
    treeShopScore: v.optional(v.number()),
    afissMultiplier: v.optional(v.number()),
    afissFactors: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
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

    // Time Tracking (activated when Work Order created)
    timeTrackingEnabled: v.boolean(),
    totalActualHours: v.optional(v.number()),
    varianceHours: v.optional(v.number()),

    // Status
    status: v.string(), // "Pending", "In Progress", "Completed", "Invoiced"

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_parent_doc", ["parentDocId", "parentDocType"])
    .index("by_org_status", ["organizationId", "status"])
    .index("by_loadout", ["loadoutId"]),

  // Work Orders (execution phase with time tracking)
  workOrders: defineTable({
    organizationId: v.id("organizations"),
    proposalId: v.id("proposals"),
    projectId: v.id("projects"),
    customerId: v.id("customers"),

    // Scheduling
    scheduledDate: v.number(),
    scheduledStartTime: v.optional(v.string()), // "08:00"
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    totalJobHours: v.optional(v.number()),

    // Assigned Resources
    primaryLoadoutId: v.optional(v.id("loadouts")),
    crewMemberIds: v.array(v.id("employees")),
    equipmentIds: v.array(v.id("equipment")),

    // Site Conditions
    propertyAddress: v.string(),
    weather: v.optional(v.string()),
    accessNotes: v.optional(v.string()),
    hazards: v.optional(v.array(v.string())),
    parkingInstructions: v.optional(v.string()),

    // Safety
    safetyBriefingCompleted: v.boolean(),
    safetyBriefingTime: v.optional(v.number()),
    safetyAttendees: v.optional(v.array(v.id("employees"))),
    ppeVerified: v.boolean(),
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

    // Materials Used
    fuelGallons: v.optional(v.number()),
    consumablesCost: v.optional(v.number()),
    materialsNotes: v.optional(v.string()),

    // Completion Checklist
    allLineItemsComplete: v.boolean(),
    finalPhotosUploaded: v.boolean(),
    customerWalkthroughComplete: v.boolean(),
    customerSignature: v.optional(v.string()),
    customerSignedAt: v.optional(v.number()),
    debrisRemoved: v.boolean(),
    siteRestored: v.boolean(),
    equipmentCleaned: v.boolean(),

    // Status
    status: v.string(), // "Scheduled", "In Progress", "Paused", "Completed", "Invoiced", "Cancelled"

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_proposal", ["proposalId"])
    .index("by_project", ["projectId"])
    .index("by_customer", ["customerId"])
    .index("by_org_status", ["organizationId", "status"])
    .index("by_scheduled_date", ["organizationId", "scheduledDate"]),

  // Time Entries (activity tracking per line item)
  timeEntries: defineTable({
    organizationId: v.id("organizations"),
    workOrderId: v.id("workOrders"),
    lineItemId: v.id("lineItems"),

    // Employee & Loadout
    employeeId: v.id("employees"),
    employeeCode: v.string(), // e.g., "STG3+E2"
    loadoutId: v.optional(v.id("loadouts")),

    // Activity Classification
    activityCategory: v.string(), // "Production", "Support"
    activityType: v.string(), // "Grinding", "Transport", "Setup", etc.
    activityDetail: v.optional(v.string()),
    billable: v.boolean(),

    // Time Data
    startTime: v.number(),
    endTime: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    durationHours: v.optional(v.number()),

    // Location Tracking
    locationStart: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    locationEnd: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),

    // Documentation
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),

    // Tracking Metadata
    recordedBy: v.string(), // "Employee", "Manager", "Auto"
    recordedMethod: v.string(), // "Mobile App", "Manual Entry", "GPS Auto"
    timestampRecorded: v.number(),

    // Approval
    approved: v.boolean(),
    approvedBy: v.optional(v.id("employees")),
    approvedDate: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_work_order", ["workOrderId"])
    .index("by_line_item", ["lineItemId"])
    .index("by_employee", ["employeeId"])
    .index("by_org_employee", ["organizationId", "employeeId"])
    .index("by_billable", ["organizationId", "billable"]),

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

    // Default Pricing
    defaultUnit: v.string(), // "Each", "Hour", "Day", "Acre", "Linear Foot", "Square Foot", "Cubic Yard", "Ton", "Tree", "Stump"
    defaultUnitPrice: v.number(),
    defaultQuantity: v.optional(v.number()),

    // Costing
    costPerUnit: v.optional(v.number()),
    defaultMargin: v.optional(v.number()),

    // AFISS Presets (saved complexity factors for this type of work)
    afissPresets: v.optional(v.array(v.object({
      name: v.string(),
      category: v.string(),
      factor: v.string(),
      impact: v.number(), // percentage multiplier
    }))),

    // Metadata
    usageCount: v.optional(v.number()),
    lastUsed: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_category", ["organizationId", "category"])
    .index("by_org_service", ["organizationId", "serviceType"]),

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
});
