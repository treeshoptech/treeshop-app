# TreeShop AI RAG System Documentation

## Overview

The TreeShop AI Assistant uses **RAG (Retrieval-Augmented Generation)** to provide accurate, context-aware responses based on your actual documentation and website content.

### What is RAG?

RAG combines:
1. **Retrieval**: Find relevant documentation chunks using vector similarity search
2. **Augmentation**: Add retrieved content to the AI's context
3. **Generation**: AI generates responses using both its knowledge AND your documentation

**Benefits:**
- ✅ AI knows your actual pricing formulas, not generic information
- ✅ Answers cite specific documentation sources
- ✅ Easy to update knowledge without retraining AI
- ✅ Reduces AI hallucinations with factual grounding
- ✅ Customizable per organization

---

## Architecture

### Data Flow

```
User Question
    ↓
Generate Query Embedding (OpenAI)
    ↓
Vector Search in Convex (documentChunks)
    ↓
Retrieve Top 3 Relevant Chunks
    ↓
Inject into System Prompt
    ↓
GPT-4o-mini Generates Response
    ↓
User Receives Answer with Citations
```

### Database Schema

```typescript
// Knowledge Base Documents
knowledgeDocuments {
  title: string
  slug: string
  category: string
  content: string (full document)
  tags: string[]
  priority: number
  isSystemDoc: boolean
  // ... metadata
}

// Document Chunks (for embeddings)
documentChunks {
  documentId: Id<"knowledgeDocuments">
  chunkIndex: number
  chunkText: string (500-1000 chars)
  embedding: number[] (1536 dimensions)
  embeddingModel: "text-embedding-3-small"
  documentTitle: string
  documentCategory: string
  // ... context
}

// Chat Sessions (analytics)
aiChatSessions {
  sessionId: string
  userId: string
  messageCount: number
  currentPage: string
  wasHelpful: boolean
  // ... metrics
}

// Chat Messages (for improvement)
aiChatMessages {
  sessionId: string
  role: "user" | "assistant"
  content: string
  retrievedDocuments: Array<{
    documentId: Id
    chunkId: Id
    relevanceScore: number
  }>
  // ... performance metrics
}
```

---

## Setup Guide

### Step 1: Install Dependencies

Already installed:
```bash
npm install ai @ai-sdk/openai convex
```

### Step 2: Configure Environment Variables

Add to `.env.local`:
```bash
# Required for RAG
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Step 3: Seed the Knowledge Base

**Option A: Using Convex Dashboard**

1. Go to Convex Dashboard → Functions
2. Run `seedKnowledgeBase:seedCoreDocumentation`
3. This adds 10+ core TreeShop documents

**Option B: Using Admin Page** (Coming Soon)

1. Navigate to `/dashboard/admin/knowledge-base`
2. Click "Seed Core Docs"
3. View all documents in the knowledge base

### Step 4: Generate Embeddings

For each document, you need to generate vector embeddings:

```typescript
// Call the action
await convex.action(api.ragEmbeddings.generateDocumentEmbeddings, {
  documentId: "your-document-id"
});
```

This will:
1. Split document into chunks (500-1000 chars)
2. Generate OpenAI embeddings for each chunk
3. Store chunks with embeddings in `documentChunks` table
4. Enable vector similarity search

**Cost:** ~$0.0001 per 1000 tokens (very cheap!)

### Step 5: Test the AI Assistant

1. Open TreeShop dashboard
2. Click the sparkle button (✨) to open AI Assistant
3. Ask: "What is TreeShop Score?"
4. AI should respond with information from the documentation
5. Check browser console for "Retrieved docs" to verify RAG is working

---

## Adding Custom Documentation

### Method 1: Using Convex API

```typescript
const documentId = await convex.mutation(api.knowledgeBase.addDocument, {
  title: "Your Custom Guide",
  slug: "custom-guide",
  category: "Custom",
  content: "Your full documentation content here...",
  contentType: "text",
  sourceType: "Manual Entry",
  tags: ["custom", "guide"],
  priority: 5,
  isSystemDoc: false,
  // organizationId: "optional-for-org-specific-docs"
});

// Then generate embeddings
await convex.action(api.ragEmbeddings.generateDocumentEmbeddings, {
  documentId
});
```

### Method 2: Scrape Your Website (Future)

Create a script to scrape treeshop.app:

```typescript
// Example scraper (to be built)
const pages = [
  "https://treeshop.app/pricing",
  "https://treeshop.app/features",
  "https://treeshop.app/afiss",
];

for (const url of pages) {
  const content = await fetchAndParse(url);
  await addDocument({
    title: extractTitle(content),
    content: extractText(content),
    sourceUrl: url,
    sourceType: "Website",
    // ...
  });
}
```

### Method 3: Import from Files

```typescript
// Read markdown files from /docs
const files = fs.readdirSync('./docs');

for (const file of files) {
  const content = fs.readFileSync(`./docs/${file}`, 'utf-8');
  const title = extractTitleFromMarkdown(content);

  await addDocument({
    title,
    content,
    sourceType: "Documentation",
    // ...
  });
}
```

---

## Document Categories

### Recommended Categories

1. **Getting Started** - Onboarding, basics, platform overview
2. **Pricing** - TreeShop Score, AFISS, formulas
3. **Equipment** - Equipment management, loadouts, costs
4. **Workflows** - DOC process, proposals, work orders
5. **Formulas** - All calculation formulas
6. **FAQs** - Common questions and answers
7. **Features** - Feature-specific guides
8. **Integrations** - Third-party integrations
9. **Best Practices** - Tips and recommendations
10. **Company-Specific** - Your organization's docs (set organizationId)

---

## Vector Search Configuration

### Embedding Model

Currently using: **text-embedding-3-small**
- 1536 dimensions
- $0.02 per 1M tokens
- Fast and accurate

Alternative: **text-embedding-3-large**
- 3072 dimensions
- $0.13 per 1M tokens
- Slightly better accuracy

### Chunking Strategy

- **Chunk Size**: 800 words (default)
- **Overlap**: 100 words (to preserve context across chunks)
- **Why?** Optimal balance between context and precision

### Search Parameters

```typescript
await convex.action(api.ragEmbeddings.searchSimilarChunks, {
  query: "user question here",
  limit: 3, // Top 3 most relevant chunks
  category: "Pricing", // Optional filter
  organizationId: "...", // Optional org-specific search
});
```

**Returns:**
```typescript
[
  {
    _id: "chunk-id",
    _score: 0.87, // Similarity score (0-1)
    chunkText: "relevant content...",
    documentTitle: "TreeShop Score Methodology",
    documentCategory: "Pricing",
    // ...
  }
]
```

---

## Performance & Optimization

### Caching Strategy

**Current:** No caching (every query searches embeddings)

**Future Optimization:**
1. Cache common queries in Redis
2. Pre-compute embeddings for frequently asked questions
3. Use Convex's built-in caching for document retrieval

### Cost Analysis

**Per User Query:**
- Embedding generation: ~$0.00001 (100 tokens)
- Vector search: Free (Convex handles this)
- GPT-4o-mini response: ~$0.0004 (500 tokens)
- **Total: ~$0.00041 per query**

**1000 queries/month = $0.41 cost**

Very affordable!

### Scalability

**Convex Vector Index:**
- Handles millions of chunks
- Sub-second search times
- Automatic scaling
- No infrastructure management

**Limits:**
- Max 1536 dimensions per vector (OpenAI embedding size)
- Recommended: <100K chunks per table (for best performance)
- TreeShop with 1000 documents = ~5000 chunks (well within limits)

---

## Monitoring & Analytics

### Track Chat Quality

```typescript
// Log sessions
await convex.mutation(api.chatSessions.create, {
  sessionId: generateId(),
  userId: currentUser.id,
  organizationId: currentOrg.id,
  currentPage: window.location.pathname,
});

// Track messages with retrieved docs
await convex.mutation(api.chatMessages.log, {
  sessionId,
  role: "assistant",
  content: response,
  retrievedDocuments: [
    {
      documentId,
      chunkId,
      relevanceScore,
      wasUsed: true,
    }
  ],
  responseTimeMs: 1234,
  tokensUsed: 456,
});
```

### Analytics Queries

**Most helpful documents:**
```typescript
const topDocs = await convex.query(api.analytics.topRetrievedDocuments, {
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  limit: 10,
});
```

**Questions without good answers:**
```typescript
const lowConfidence = await convex.query(api.analytics.lowConfidenceQueries, {
  scoreThreshold: 0.5,
});
// Identify gaps in documentation
```

**User satisfaction:**
```typescript
const satisfaction = await convex.query(api.analytics.chatSatisfaction, {
  startDate,
  endDate,
});
// wasHelpful: true/false tracking
```

---

## Best Practices

### 1. Document Quality

✅ **Good Documentation:**
- Clear, concise explanations
- Specific examples with numbers
- Step-by-step instructions
- Use consistent terminology

❌ **Poor Documentation:**
- Vague descriptions ("it's easy")
- No examples or context
- Inconsistent naming
- Marketing fluff

### 2. Chunking Strategy

✅ **Good Chunks:**
- Complete thoughts (don't split mid-sentence)
- Include relevant context
- 500-1000 words
- Overlap adjacent chunks

❌ **Poor Chunks:**
- Random text fragments
- No context
- Too short (<200 words)
- No overlap

### 3. Metadata Tagging

✅ **Good Tags:**
```typescript
tags: ["pricing", "treeshop-score", "formulas", "forestry-mulching"]
```

❌ **Poor Tags:**
```typescript
tags: ["important", "good", "useful"]
```

### 4. Update Frequency

- **System Docs**: Update when formulas/features change
- **FAQs**: Add as common questions emerge
- **Company Docs**: Update monthly or as processes evolve
- **Re-generate embeddings** after content updates

---

## Troubleshooting

### Issue: AI not using documentation

**Check:**
1. Are embeddings generated? Query `documentChunks` table
2. Is OpenAI API key set correctly?
3. Check browser console for "Retrieved docs" log
4. Verify documents are published (`isPublished: true`)

**Fix:**
```bash
# Verify API key
echo $OPENAI_API_KEY

# Regenerate embeddings
await convex.action(api.ragEmbeddings.generateDocumentEmbeddings, {
  documentId: "..."
});
```

### Issue: Irrelevant search results

**Causes:**
- Query too vague
- Missing relevant documentation
- Poor chunking
- Low similarity threshold

**Fix:**
- Add more specific documentation
- Adjust chunk size (try 600 words instead of 800)
- Increase search limit (try 5 chunks instead of 3)
- Add better tags and keywords

### Issue: Slow response times

**Causes:**
- Large documents (>10K words)
- Too many chunks returned
- Network latency

**Fix:**
- Limit chunk size
- Reduce search limit to top 2-3 results
- Cache common queries
- Use Convex edge functions

---

## Roadmap

### Phase 1: MVP (Current)
- ✅ Basic RAG with core documentation
- ✅ Vector search
- ✅ Manual document management

### Phase 2: Enhanced (Next 30 days)
- [ ] Auto-scrape treeshop.app website
- [ ] Admin UI for document management
- [ ] Bulk import from markdown files
- [ ] Chat session analytics dashboard

### Phase 3: Advanced (60-90 days)
- [ ] Organization-specific knowledge bases
- [ ] Multi-modal support (images, PDFs)
- [ ] Automatic doc generation from user interactions
- [ ] A/B testing different prompts
- [ ] Fine-tuning on conversation data

### Phase 4: Enterprise (Future)
- [ ] Multi-language support
- [ ] Voice interface
- [ ] Slack/Teams integration
- [ ] Custom AI models per organization
- [ ] Predictive question suggestions

---

## API Reference

### Knowledge Base Functions

```typescript
// Add document
api.knowledgeBase.addDocument({
  title, slug, category, content, tags, priority, isSystemDoc
})

// List documents
api.knowledgeBase.listDocuments({
  category?, organizationId?, publishedOnly?
})

// Search documents
api.knowledgeBase.searchDocuments({
  searchQuery, category?, organizationId?
})

// Update document
api.knowledgeBase.updateDocument({
  documentId, title?, content?, tags?, priority?
})

// Delete document
api.knowledgeBase.deleteDocument({ documentId })
```

### Embedding Functions

```typescript
// Generate embeddings for a document
api.ragEmbeddings.generateDocumentEmbeddings({ documentId })

// Search similar chunks
api.ragEmbeddings.searchSimilarChunks({
  query, limit?, category?, organizationId?
})
```

---

## Support

**Need help?**
- Check Convex docs: https://docs.convex.dev
- OpenAI embeddings: https://platform.openai.com/docs/guides/embeddings
- File an issue on GitHub
- Contact TreeShop support

---

Built with ❤️ for TreeShop by TreeShop Tech Team
