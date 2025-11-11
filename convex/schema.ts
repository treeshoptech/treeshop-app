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
    name: v.string(),
    category: v.string(), // "Truck", "Mulcher", "Stump Grinder", "Excavator", "Trailer", "Support"
    purchasePrice: v.number(),
    usefulLifeYears: v.number(),
    annualHours: v.number(),
    financeRate: v.optional(v.number()),
    insuranceCostPerYear: v.optional(v.number()),
    registrationCostPerYear: v.optional(v.number()),
    fuelGallonsPerHour: v.number(),
    fuelPricePerGallon: v.number(),
    maintenanceCostPerYear: v.number(),
    repairCostPerYear: v.number(),
    // Calculated fields
    ownershipCostPerHour: v.number(),
    operatingCostPerHour: v.number(),
    totalCostPerHour: v.number(),
    status: v.string(), // "Active", "Maintenance", "Retired"
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
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.string(),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .searchIndex("search_customers", {
      searchField: "name",
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
