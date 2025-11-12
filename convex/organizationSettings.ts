import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization } from "./lib/auth";

// Get organization settings
export const get = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .first();

    // Return settings or create default if doesn't exist
    if (!settings) {
      return {
        organizationId: org._id,
        proposalValidityDays: 30,
        invoicePrefix: "INV-",
        invoiceStartNumber: 1000,
        requireCustomerSignature: true,
        requirePhotoDocumentation: true,
        minimumPhotos: 3,
        showDetailedBreakdown: false,
        paymentTerms: "Net 30",
        lateFeePercentage: 1.5,
        lateFeeDaysAfterDue: 30,
      };
    }

    return settings;
  },
});

// Update or create organization settings
export const upsert = mutation({
  args: {
    // Terms & Conditions
    proposalTerms: v.optional(v.string()),
    workOrderTerms: v.optional(v.string()),
    invoiceTerms: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),

    // Proposal Settings
    proposalValidityDays: v.optional(v.number()),
    proposalFooter: v.optional(v.string()),
    proposalHeader: v.optional(v.string()),
    showDetailedBreakdown: v.optional(v.boolean()),

    // Invoice Settings
    invoicePrefix: v.optional(v.string()),
    invoiceStartNumber: v.optional(v.number()),
    invoiceFooter: v.optional(v.string()),
    lateFeePercentage: v.optional(v.number()),
    lateFeeDaysAfterDue: v.optional(v.number()),

    // Work Order Settings
    requireCustomerSignature: v.optional(v.boolean()),
    requirePhotoDocumentation: v.optional(v.boolean()),
    minimumPhotos: v.optional(v.number()),

    // Business Info
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
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const existingSettings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .first();

    if (existingSettings) {
      // Update existing
      await ctx.db.patch(existingSettings._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existingSettings._id;
    } else {
      // Create new
      const settingsId = await ctx.db.insert("organizationSettings", {
        organizationId: org._id,
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return settingsId;
    }
  },
});

// Update terms section
export const updateTerms = mutation({
  args: {
    proposalTerms: v.optional(v.string()),
    workOrderTerms: v.optional(v.string()),
    invoiceTerms: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return settings._id;
    } else {
      const settingsId = await ctx.db.insert("organizationSettings", {
        organizationId: org._id,
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return settingsId;
    }
  },
});

// Update business info
export const updateBusinessInfo = mutation({
  args: {
    companyLegalName: v.optional(v.string()),
    companyTagline: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    insuranceCertificate: v.optional(v.string()),
    taxId: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return settings._id;
    } else {
      const settingsId = await ctx.db.insert("organizationSettings", {
        organizationId: org._id,
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return settingsId;
    }
  },
});
