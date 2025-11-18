import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api } from "./_generated/api";

// Chunk a document into smaller pieces for embedding
function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

// Generate embeddings using OpenAI (called from actions)
export const generateDocumentEmbeddings = action({
  args: {
    documentId: v.id("knowledgeDocuments"),
  },
  handler: async (ctx, args) => {
    // Get document
    const document = await ctx.runQuery(api.ragEmbeddings.getDocument, {
      documentId: args.documentId,
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Delete existing chunks
    await ctx.runMutation(api.ragEmbeddings.deleteDocumentChunks, {
      documentId: args.documentId,
    });

    // Chunk the content
    const chunks = chunkText(document.content);

    // Generate embeddings for each chunk
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];

      // Call OpenAI embeddings API
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: chunkText,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;

      // Store chunk with embedding
      await ctx.runMutation(api.ragEmbeddings.storeChunk, {
        documentId: args.documentId,
        chunkIndex: i,
        chunkText,
        embedding,
        documentTitle: document.title,
        documentCategory: document.category,
        tags: document.tags,
        organizationId: document.organizationId,
        previousChunkText: i > 0 ? chunks[i - 1].substring(Math.max(0, chunks[i - 1].length - 100)) : undefined,
        nextChunkText: i < chunks.length - 1 ? chunks[i + 1].substring(0, 100) : undefined,
      });
    }

    return { chunksCreated: chunks.length };
  },
});

// Query to get a document (internal use)
export const getDocument = internalQuery({
  args: { documentId: v.id("knowledgeDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Mutation to delete document chunks (internal use)
export const deleteDocumentChunks = internalMutation({
  args: { documentId: v.id("knowledgeDocuments") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
  },
});

// Mutation to store a chunk (internal use)
export const storeChunk = internalMutation({
  args: {
    documentId: v.id("knowledgeDocuments"),
    chunkIndex: v.number(),
    chunkText: v.string(),
    embedding: v.array(v.number()),
    documentTitle: v.string(),
    documentCategory: v.string(),
    tags: v.array(v.string()),
    organizationId: v.optional(v.id("organizations")),
    previousChunkText: v.optional(v.string()),
    nextChunkText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const wordCount = args.chunkText.split(/\s+/).length;

    await ctx.db.insert("documentChunks", {
      documentId: args.documentId,
      chunkIndex: args.chunkIndex,
      chunkText: args.chunkText,
      wordCount,
      documentTitle: args.documentTitle,
      documentCategory: args.documentCategory,
      previousChunkText: args.previousChunkText,
      nextChunkText: args.nextChunkText,
      embedding: args.embedding,
      embeddingModel: "text-embedding-3-small",
      tags: args.tags,
      organizationId: args.organizationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Search for relevant document chunks using vector similarity
export const searchSimilarChunks = action({
  args: {
    query: v.string(),
    organizationId: v.optional(v.id("organizations")),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    // Generate embedding for the query
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: args.query,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const queryEmbedding = data.data[0].embedding;

    // Search for similar chunks using vector index
    const results = await ctx.vectorSearch("documentChunks", "by_embedding", {
      vector: queryEmbedding,
      limit,
      filter: (q) => {
        let filter = q;
        if (args.organizationId !== undefined) {
          filter = filter.eq("organizationId", args.organizationId);
        }
        if (args.category) {
          filter = filter.eq("documentCategory", args.category);
        }
        return filter;
      },
    });

    return results;
  },
});
