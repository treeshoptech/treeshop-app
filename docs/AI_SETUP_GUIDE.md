# AI Assistant Setup Guide - Quick Start

## Current Status ✅

**Completed:**
- ✅ AI Assistant UI (right sidebar with sparkle button)
- ✅ Vercel AI SDK integration (`ai` + `@ai-sdk/openai`)
- ✅ RAG system with vector embeddings
- ✅ Tool calling (function execution)
- ✅ Convex schema deployed (RAG tables + indexes)
- ✅ Next.js Turbopack configuration
- ✅ Code pushed to branch: `checkpoint-ai-1`

**Pending:**
- ⚠️ OpenAI API key configuration
- ⚠️ Knowledge base seeding
- ⚠️ Vercel environment variables

---

## Step 1: Get Your OpenAI API Key

### What You Need:

**Two Different Keys** (you have one, need the other):

1. **AI Gateway API Key** ✅ (You already have this)
   - `AI_GATEWAY_API_KEY=vck_4qHFPOMdNtpj5HkrBrX7D6bGQrkoFWnd7gNScRaASwImPOla2D3nKGwT`
   - Purpose: Vercel AI Gateway (optional - for analytics and caching)
   - Already in your `.env.local`

2. **OpenAI API Key** ⚠️ (You need to add this)
   - Format: `sk-proj-...` or `sk-...`
   - Purpose: Required for AI chat and embeddings
   - Get it from: https://platform.openai.com/api-keys

### How to Get OpenAI API Key:

1. Go to https://platform.openai.com/api-keys
2. Sign in (or create account)
3. Click "+ Create new secret key"
4. Name it "TreeShop AI Assistant"
5. Copy the key (starts with `sk-`)
6. **Important:** Save it immediately - you can't see it again!

---

## Step 2: Add OpenAI API Key Locally

Open `/Users/lockin/treeshop-app/.env.local` and replace the placeholder:

**Change this:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**To this:**
```bash
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

**Test it works:**
```bash
# Restart your dev server
npm run dev

# Try the AI assistant by clicking the sparkle button (✨)
```

---

## Step 3: Add OpenAI API Key to Vercel

You added the AI Gateway key to Vercel, but you also need the OpenAI key:

1. Go to https://vercel.com/your-project/settings/environment-variables
2. Click **"Add New"**
3. **Name:** `OPENAI_API_KEY`
4. **Value:** `sk-proj-YOUR_ACTUAL_KEY_HERE`
5. **Environments:** Check all three (Production, Preview, Development)
6. Click **"Save"**

**Why Both Places?**
- `.env.local` - For local development on your machine
- Vercel Dashboard - For deployed app (production/preview)

---

## Step 4: Seed the Knowledge Base

The AI needs documentation to answer questions about TreeShop. Run this once:

### Option A: Using Convex Dashboard (Easiest)

1. Open https://dashboard.convex.dev/
2. Navigate to your project: `treeshop-app`
3. Go to **"Functions"** tab
4. Find: `seedKnowledgeBase:seedCoreDocumentation`
5. Click **"Run"**
6. Wait ~30 seconds for completion

**Result:** 10 core documents created (~5,000 words of TreeShop knowledge)

### Option B: Using CLI

```bash
npx convex run seedKnowledgeBase:seedCoreDocumentation
```

**What gets seeded:**
1. Platform Overview
2. TreeShop Score System
3. AFISS Factors Guide
4. Loadout Configuration
5. Equipment Cost Formula
6. Employee Burden Multiplier
7. Pricing Formula
8. Lead Management Workflow
9. Proposal Generation Workflow
10. Common Questions (FAQs)

---

## Step 5: Generate Embeddings

After seeding documents, you need to generate vector embeddings for semantic search:

### For Each Document:

**Using Convex Dashboard:**
1. Go to **Functions** → `ragEmbeddings:generateDocumentEmbeddings`
2. Click **"Run"**
3. Enter document ID (you'll see IDs after seeding)
4. Click **"Execute"**
5. Repeat for all 10 documents

**Using CLI (Faster):**
```bash
# Get document IDs first
npx convex run knowledgeBase:listDocuments '{"organizationId": "YOUR_ORG_ID"}'

# Generate embeddings for each document ID
npx convex run ragEmbeddings:generateDocumentEmbeddings '{"documentId": "DOCUMENT_ID_HERE"}'
```

**This process:**
- Chunks each document into 800-word sections
- Generates 1536-dimension vectors via OpenAI
- Stores in Convex for semantic search
- Takes ~5-10 seconds per document

---

## Step 6: Test the AI Assistant

### Local Testing:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open app:**
   - Navigate to http://localhost:3000/dashboard

3. **Click sparkle button (✨)** in bottom-right corner

4. **Try these test questions:**
   - "What is TreeShop Score?"
   - "How do I calculate pricing for forestry mulching?"
   - "Explain AFISS factors"
   - "Navigate me to the calculators page"
   - "How do I create a new lead?"

**What Should Happen:**
- Sidebar opens with chat interface
- AI responds with relevant information from docs
- Quick action buttons work
- Navigation works (e.g., "Take me to calculators")
- Tool calls execute (e.g., score calculations)

### Production Testing:

After Vercel deployment succeeds:
1. Visit your production URL
2. Same tests as above
3. Verify RAG retrieval works (cites documentation)

---

## Step 7: Verify Everything Works

### Checklist:

**Local Environment:**
- [ ] `.env.local` has `OPENAI_API_KEY`
- [ ] Dev server starts without errors
- [ ] Sparkle button visible in dashboard
- [ ] Chat sidebar opens on click
- [ ] AI responds to messages
- [ ] Quick actions work

**Convex:**
- [ ] Schema deployed (all RAG tables exist)
- [ ] 10 documents seeded in `knowledgeDocuments` table
- [ ] Embeddings generated for all documents
- [ ] Vector search returns results

**Vercel:**
- [ ] Build succeeded (transpilePackages fix applied)
- [ ] `OPENAI_API_KEY` environment variable set
- [ ] Production app loads
- [ ] AI assistant works in production

---

## Troubleshooting

### Problem: "OPENAI_API_KEY not set" error

**Solution:**
1. Verify key is in `.env.local` (local) or Vercel dashboard (production)
2. Restart dev server: `npm run dev`
3. Check key format: should start with `sk-` or `sk-proj-`

### Problem: AI responds but doesn't cite documentation

**Solution:**
1. Check if embeddings were generated: Go to Convex dashboard → `documentChunks` table
2. Should see ~15-20 chunks per document
3. Re-run `ragEmbeddings:generateDocumentEmbeddings` if missing

### Problem: Vector search returns no results

**Solution:**
1. Verify `documentChunks.by_embedding` index exists
2. Check embedding dimensions (should be 1536)
3. Ensure documents are marked `isPublished: true`

### Problem: Build fails on Vercel

**Solution:**
Already fixed! The `transpilePackages` configuration in `next.config.ts` should resolve this.

If still failing, check Vercel build logs for specific error.

---

## What the AI Can Do

### Current Capabilities:

**Knowledge Q&A:**
- Explain TreeShop concepts (Score, AFISS, Loadouts)
- Answer pricing formula questions
- Describe workflows (Lead → Proposal → Work Order)
- Provide equipment/employee cost guidance

**Navigation:**
- "Take me to the calculators page"
- "Show me customers"
- "Open the proposals section"

**Quick Actions:**
- Calculate TreeShop Score
- Search AFISS factors
- Navigate to specific pages
- Explain formulas

**Contextual Help:**
- Understands current page context
- Tracks recent actions
- Suggests next steps

### Future Enhancements (Not Yet Implemented):

- Create leads from chat
- Generate proposals
- Search customers
- Schedule work orders
- Calculate complex pricing scenarios
- Multi-step workflows

---

## Cost Estimates

### OpenAI API Costs:

**Embeddings (One-Time):**
- 10 documents × ~1,000 tokens each = 10,000 tokens
- Cost: ~$0.0002 (negligible)

**Chat Usage (Ongoing):**
- Model: `gpt-4o-mini` (cheapest, fast)
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Average chat: ~500 tokens = $0.0004 per conversation

**Monthly Estimates:**
- 1,000 chats/month = $0.40
- 10,000 chats/month = $4.00
- 100,000 chats/month = $40.00

**Extremely affordable!**

---

## Architecture Summary

### How It Works:

```
User Question → Chat Sidebar
                    ↓
        POST /api/chat (Route Handler)
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
    ↓                               ↓
RAG Search                   Load Context
(Convex Vector)              (Current page, user)
    │                               │
    └───────────────┬───────────────┘
                    ↓
            Build System Prompt
         (Context + Retrieved Docs)
                    ↓
        streamText (Vercel AI SDK)
         (OpenAI gpt-4o-mini)
                    ↓
        Tool Calls (if needed)
                    ↓
       Stream Response to Client
                    ↓
      Display in Chat Sidebar
```

### Key Technologies:

- **Vercel AI SDK UI** (`ai@5.0.93`) - Chat hooks and streaming
- **@ai-sdk/openai** (`2.0.68`) - Official OpenAI provider
- **Convex Vector Search** - 1536-dimension embeddings
- **OpenAI Embeddings** - `text-embedding-3-small` model
- **Zod** - Type-safe tool parameters
- **Next.js 16** - Route handlers with Turbopack

### Files to Know:

- `/app/api/chat/route.ts` - Main AI endpoint
- `/app/api/chat/tools.ts` - Function calling definitions
- `/app/components/chat/AIAssistantSidebar.tsx` - Chat UI
- `/app/components/chat/AIContext.tsx` - Global state
- `/convex/ragEmbeddings.ts` - Vector embeddings
- `/convex/knowledgeBase.ts` - Document management
- `/convex/seedKnowledgeBase.ts` - Initial data

---

## Next Steps After Setup

### Immediate (Now):
1. Get OpenAI API key
2. Add to `.env.local` and Vercel
3. Seed knowledge base
4. Generate embeddings
5. Test locally
6. Deploy to Vercel

### Short-Term (This Week):
- Add more knowledge documents
- Implement customer search tool
- Add lead creation tool
- Integrate with existing workflows

### Medium-Term (Next Month):
- Multi-modal support (image analysis)
- Voice input/output
- Advanced tool calling (Convex mutations)
- Analytics dashboard
- User feedback collection

---

## Support Resources

**Documentation:**
- Vercel AI SDK: https://ai-sdk.dev
- OpenAI API: https://platform.openai.com/docs
- Convex Vectors: https://docs.convex.dev/vector-search

**Your Docs:**
- `/docs/AI_ASSISTANT.md` - User guide
- `/docs/AI_RAG_SYSTEM.md` - Technical deep dive
- `/docs/VERCEL_AI_SDK_INTEGRATION.md` - Best practices
- `/docs/VERCEL_STACK_SUMMARY.md` - Stack verification

**Need Help?**
- Check Convex logs: https://dashboard.convex.dev/
- Check Vercel logs: https://vercel.com/your-project/logs
- OpenAI status: https://status.openai.com/

---

## Quick Command Reference

```bash
# Local Development
npm run dev                                # Start dev server

# Convex Commands
npx convex dev                             # Deploy schema changes
npx convex run seedKnowledgeBase:seedCoreDocumentation    # Seed docs
npx convex run ragEmbeddings:generateDocumentEmbeddings   # Generate embeddings
npx convex run knowledgeBase:listDocuments                # View all docs

# Git Commands
git status                                 # Check current branch
git push origin checkpoint-ai-1            # Push changes

# Vercel Commands
vercel --prod                              # Deploy to production
vercel logs                                # View production logs
```

---

**Setup Time:** ~10 minutes
**Last Updated:** 2025-01-18
**Branch:** checkpoint-ai-1
**Status:** Ready for testing ✨

---

**Questions or Issues?**

Check the logs first:
1. Browser console (F12) for client errors
2. Terminal for dev server errors
3. Convex dashboard for backend errors
4. Vercel dashboard for deployment errors

Most common issue: Missing `OPENAI_API_KEY` - just add it and restart! 🚀
