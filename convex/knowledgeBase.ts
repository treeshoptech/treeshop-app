import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a new knowledge document
export const addDocument = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    content: v.string(),
    contentType: v.string(),
    sourceUrl: v.optional(v.string()),
    sourceType: v.string(),
    tags: v.array(v.string()),
    relatedServiceTypes: v.optional(v.array(v.string())),
    searchKeywords: v.optional(v.array(v.string())),
    priority: v.number(),
    isSystemDoc: v.boolean(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const wordCount = args.content.split(/\s+/).length;
    const excerpt = args.content.substring(0, 200);

    const documentId = await ctx.db.insert("knowledgeDocuments", {
      ...args,
      excerpt,
      wordCount,
      isPublished: true,
      viewCount: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return documentId;
  },
});

// Get all documents (optionally filtered by category)
export const listDocuments = query({
  args: {
    category: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("knowledgeDocuments");

    if (args.organizationId !== undefined) {
      query = query.filter((q) => q.eq(q.field("organizationId"), args.organizationId));
    }

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.publishedOnly) {
      query = query.filter((q) => q.eq(q.field("isPublished"), true));
    }

    const documents = await query
      .order("desc")
      .collect();

    return documents;
  },
});

// Get single document by slug
export const getDocumentBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("knowledgeDocuments")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();

    if (document) {
      // Increment view count
      await ctx.db.patch(document._id, {
        viewCount: (document.viewCount || 0) + 1,
      });
    }

    return document;
  },
});

// Search documents by content
export const searchDocuments = query({
  args: {
    searchQuery: v.string(),
    category: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("knowledgeDocuments")
      .withSearchIndex("search_content", (q) => q.search("content", args.searchQuery))
      .collect();

    // Filter by category if provided
    if (args.category) {
      return results.filter((doc) => doc.category === args.category);
    }

    return results;
  },
});

// Mark document as helpful/unhelpful
export const markDocumentFeedback = mutation({
  args: {
    documentId: v.id("knowledgeDocuments"),
    helpful: v.boolean(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    if (args.helpful) {
      await ctx.db.patch(args.documentId, {
        helpfulCount: (document.helpfulCount || 0) + 1,
      });
    } else {
      await ctx.db.patch(args.documentId, {
        unhelpfulCount: (document.unhelpfulCount || 0) + 1,
      });
    }
  },
});

// Update document
export const updateDocument = mutation({
  args: {
    documentId: v.id("knowledgeDocuments"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;

    const updateData: any = { ...updates, updatedAt: Date.now() };

    // Recalculate word count and excerpt if content changed
    if (updates.content) {
      updateData.wordCount = updates.content.split(/\s+/).length;
      updateData.excerpt = updates.content.substring(0, 200);
    }

    await ctx.db.patch(documentId, updateData);
  },
});

// Delete document
export const deleteDocument = mutation({
  args: { documentId: v.id("knowledgeDocuments") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    // Don't allow deleting system documents
    if (document?.isSystemDoc) {
      throw new Error("Cannot delete system documents");
    }

    // Delete associated chunks
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    await ctx.db.delete(args.documentId);
  },
});

// Get categories with document counts
export const getCategories = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("knowledgeDocuments")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const categoryMap = new Map<string, number>();

    for (const doc of documents) {
      if (args.organizationId !== undefined && doc.organizationId !== args.organizationId) {
        continue;
      }
      categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
    }

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  },
});
