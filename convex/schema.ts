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
    name: v.string(),
    position: v.string(), // "Entry Ground Crew", "Experienced Climber", "Crew Leader", "Certified Arborist", "Specialized Operator"
    baseHourlyRate: v.number(),
    burdenMultiplier: v.number(), // 1.6x, 1.7x, 1.8x, 1.9x, 2.0x
    trueCostPerHour: v.number(), // baseHourlyRate × burdenMultiplier
    hireDate: v.number(),
    status: v.string(), // "Active", "Inactive"
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_clerk_user", ["organizationId", "clerkUserId"])
    .index("by_org_status", ["organizationId", "status"]),

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
    loadoutId: v.id("loadouts"),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_project", ["projectId"])
    .index("by_org_status", ["organizationId", "status"]),
});
