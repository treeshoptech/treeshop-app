import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganization, requireAdmin } from "./lib/auth";

// List all invoices for current organization
export const list = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("invoices")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .order("desc")
      .collect();
  },
});

// List invoices by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("invoices")
      .withIndex("by_org_status", (q) =>
        q.eq("organizationId", org._id).eq("status", args.status)
      )
      .collect();
  },
});

// List overdue invoices
export const listOverdue = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);
    const now = Date.now();

    const allInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .collect();

    return allInvoices.filter(
      (invoice) =>
        invoice.dueDate < now &&
        invoice.balanceRemaining > 0 &&
        invoice.status !== "Paid" &&
        invoice.status !== "Void"
    );
  },
});

// Get single invoice
export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);
    const invoice = await ctx.db.get(args.id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify belongs to current organization
    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    return invoice;
  },
});

// Get invoices by work order
export const getByWorkOrder = query({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();

    return invoices[0] || null; // Return first invoice or null
  },
});

// Get invoices by customer
export const listByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    return await ctx.db
      .query("invoices")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("organizationId"), org._id))
      .collect();
  },
});

// Create invoice from completed work order
export const create = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    projectId: v.id("projects"),
    customerId: v.id("customers"),
    invoiceNumber: v.optional(v.string()),
    invoiceDate: v.number(),
    dueDate: v.number(),
    paymentTerms: v.string(),
    // Billing address
    billingName: v.string(),
    billingAddress: v.string(),
    billingCity: v.optional(v.string()),
    billingState: v.optional(v.string()),
    billingZip: v.optional(v.string()),
    // Financial totals
    subtotal: v.number(),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    additionalCharges: v.optional(v.number()),
    additionalChargesDescription: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    discountDescription: v.optional(v.string()),
    totalAmount: v.number(),
    // Notes
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    // Generate invoice number if not provided
    const invoiceNumber = args.invoiceNumber || `INV-${Date.now()}`;

    const invoiceId = await ctx.db.insert("invoices", {
      organizationId: org._id,
      ...args,
      invoiceNumber,
      amountPaid: 0,
      balanceRemaining: args.totalAmount,
      status: "Draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return invoiceId;
  },
});

// Update invoice
export const update = mutation({
  args: {
    id: v.id("invoices"),
    invoiceNumber: v.optional(v.string()),
    invoiceDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    paymentTerms: v.optional(v.string()),
    billingName: v.optional(v.string()),
    billingAddress: v.optional(v.string()),
    billingCity: v.optional(v.string()),
    billingState: v.optional(v.string()),
    billingZip: v.optional(v.string()),
    subtotal: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    additionalCharges: v.optional(v.number()),
    additionalChargesDescription: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    discountDescription: v.optional(v.string()),
    totalAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const { id, ...updates } = args;
    const invoice = await ctx.db.get(id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify belongs to current organization
    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    // Recalculate balance if total amount changed
    let balanceRemaining = invoice.balanceRemaining;
    if (updates.totalAmount !== undefined) {
      balanceRemaining = updates.totalAmount - invoice.amountPaid;
    }

    await ctx.db.patch(id, {
      ...updates,
      balanceRemaining,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Record payment
export const recordPayment = mutation({
  args: {
    id: v.id("invoices"),
    paymentDate: v.number(),
    paymentMethod: v.string(),
    transactionId: v.optional(v.string()),
    amount: v.number(),
    recordedBy: v.optional(v.id("employees")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const invoice = await ctx.db.get(args.id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    const payment = {
      paymentId: `PAY-${Date.now()}`,
      paymentDate: args.paymentDate,
      paymentMethod: args.paymentMethod,
      transactionId: args.transactionId,
      amount: args.amount,
      recordedBy: args.recordedBy,
    };

    const existingPayments = invoice.payments || [];
    const newPayments = [...existingPayments, payment];

    const newAmountPaid = invoice.amountPaid + args.amount;
    const newBalance = invoice.totalAmount - newAmountPaid;

    // Determine new status
    let newStatus = invoice.status;
    if (newBalance <= 0) {
      newStatus = "Paid";
    } else if (newAmountPaid > 0) {
      newStatus = "Partial";
    }

    await ctx.db.patch(args.id, {
      payments: newPayments,
      amountPaid: newAmountPaid,
      balanceRemaining: newBalance,
      status: newStatus,
      paidInFullAt: newBalance <= 0 ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Send invoice to customer
export const send = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const invoice = await ctx.db.get(args.id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(args.id, {
      status: "Sent",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Mark invoice as viewed (customer opened it)
export const markViewed = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const invoice = await ctx.db.get(args.id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    // Only update if not already viewed
    if (!invoice.viewedAt) {
      await ctx.db.patch(args.id, {
        status: "Viewed",
        viewedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return args.id;
  },
});

// Void invoice
export const voidInvoice = mutation({
  args: {
    id: v.id("invoices"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const invoice = await ctx.db.get(args.id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(args.id, {
      status: "Void",
      internalNotes: `${invoice.internalNotes || ""}\n\nVoided: ${args.reason}`,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Delete invoice
export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await getOrganization(ctx);

    const invoice = await ctx.db.get(args.id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify belongs to current organization
    if (invoice.organizationId !== org._id) {
      throw new Error("Invoice not found");
    }

    // Don't allow deleting paid invoices
    if (invoice.status === "Paid") {
      throw new Error("Cannot delete paid invoices. Void them instead.");
    }

    await ctx.db.delete(args.id);
  },
});
