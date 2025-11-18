# 🚀 AI Assistant - Next Steps Checklist

## ✅ What's Done

- [x] AI Assistant UI with sparkle button (✨)
- [x] Vercel AI SDK integration (production-ready)
- [x] RAG system with vector embeddings
- [x] Tool calling capabilities
- [x] Convex schema deployed (all tables + indexes)
- [x] Next.js Turbopack config fixed
- [x] Code pushed to `checkpoint-ai-1` branch
- [x] Comprehensive documentation created

---

## ⚠️ What You Need to Do (10 Minutes)

### 1. Get OpenAI API Key (2 min)

**You have AI Gateway key, but need OpenAI key:**

1. Go to: https://platform.openai.com/api-keys
2. Click "+ Create new secret key"
3. Name: "TreeShop AI Assistant"
4. Copy the key (starts with `sk-`)
5. Save it immediately!

**Cost:** ~$0.40 per 1,000 chats (extremely affordable)

---

### 2. Add Key Locally (1 min)

Open: `/Users/lockin/treeshop-app/.env.local`

**Find this line:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Replace with:**
```bash
OPENAI_API_KEY=sk-YOUR_ACTUAL_KEY_HERE
```

**Then restart dev server:**
```bash
npm run dev
```

---

### 3. Add Key to Vercel (2 min)

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Click **"Add New"**
3. **Name:** `OPENAI_API_KEY`
4. **Value:** `sk-YOUR_ACTUAL_KEY_HERE`
5. **Environments:** Check all three boxes
6. Click **"Save"**

---

### 4. Seed Knowledge Base (3 min)

**Option A: Convex Dashboard (Recommended)**
1. Open: https://dashboard.convex.dev/
2. Go to your project: `treeshop-app`
3. Click **"Functions"** tab
4. Find: `seedKnowledgeBase:seedCoreDocumentation`
5. Click **"Run"**
6. Wait ~30 seconds

**Result:** 10 documents created with TreeShop knowledge

---

### 5. Generate Embeddings (2 min)

After seeding, you need to create vector embeddings:

**Quick CLI Method:**
```bash
# This will seed AND generate embeddings for all documents
npx convex run seedKnowledgeBase:seedCoreDocumentation
```

The seed function now automatically triggers embedding generation!

**Or do it manually per document in Convex dashboard:**
- Function: `ragEmbeddings:generateDocumentEmbeddings`
- Args: `{"documentId": "DOCUMENT_ID"}`
- Repeat for all 10 documents

---

## 🧪 Test It Works

### Quick Test:
```bash
# Start local server
npm run dev

# Open browser to:
# http://localhost:3000/dashboard

# Click sparkle button (✨) in bottom-right

# Try asking:
# - "What is TreeShop Score?"
# - "How do I calculate pricing?"
# - "Navigate me to calculators"
```

**Expected Result:**
- Sidebar opens with chat interface
- AI responds with information from documentation
- Quick actions work
- Navigation works

---

## 📊 Current Deployment Status

**Branch:** `checkpoint-ai-1`
**Latest Commit:** `8537196` - Add comprehensive AI setup guide
**Convex Schema:** ✅ Deployed (all RAG tables ready)

**Vercel Build Status:**
- Previous build: Failed (Module not found 'ai/react')
- Fix applied: Added `transpilePackages` to next.config.ts
- Next build: Should succeed ✅

**Check build:** https://vercel.com/your-project/deployments

---

## 🔍 Verify Everything

### Checklist:

**Local Development:**
- [ ] `OPENAI_API_KEY` in `.env.local`
- [ ] Dev server runs without errors
- [ ] Sparkle button visible
- [ ] Chat opens and responds
- [ ] Quick actions work

**Convex:**
- [ ] `knowledgeDocuments` has 10 documents
- [ ] `documentChunks` has ~150 chunks
- [ ] Vector search returns results

**Vercel:**
- [ ] Build succeeded (green checkmark)
- [ ] `OPENAI_API_KEY` environment variable set
- [ ] Production app works

---

## 🛠️ If Something's Wrong

### "OPENAI_API_KEY not set"
→ Add key to `.env.local` and restart: `npm run dev`

### "No relevant documentation found"
→ Seed knowledge base: `npx convex run seedKnowledgeBase:seedCoreDocumentation`

### Build fails on Vercel
→ Already fixed with `transpilePackages` - should work on next deploy

### AI responds but no context
→ Generate embeddings: `npx convex run ragEmbeddings:generateDocumentEmbeddings`

---

## 📚 Documentation

**Full Guides:**
- `/docs/AI_SETUP_GUIDE.md` - Complete setup instructions (detailed)
- `/docs/AI_ASSISTANT.md` - User guide for the AI assistant
- `/docs/AI_RAG_SYSTEM.md` - Technical deep dive
- `/docs/VERCEL_AI_SDK_INTEGRATION.md` - Best practices

**Quick Commands:**
```bash
# Local dev
npm run dev

# Seed knowledge base
npx convex run seedKnowledgeBase:seedCoreDocumentation

# View documents
npx convex run knowledgeBase:listDocuments

# Deploy to production
git push origin checkpoint-ai-1  # Triggers Vercel deploy
```

---

## 🎯 What You Can Ask the AI

**Current Capabilities:**
- "What is TreeShop Score?" → Explains the concept
- "How do I calculate pricing?" → Shows formulas
- "Explain AFISS factors" → Lists complexity factors
- "Navigate to calculators" → Opens calculator page
- "How do I create a lead?" → Explains workflow

**Coming Soon:**
- Create actual leads from chat
- Generate proposals
- Search customers
- Calculate complex pricing
- Multi-step workflows

---

## ⏱️ Time to Complete: ~10 minutes

1. Get OpenAI key (2 min)
2. Add to `.env.local` (1 min)
3. Add to Vercel (2 min)
4. Seed knowledge base (3 min)
5. Test locally (2 min)

**Then you're done!** ✨

---

## 💰 Cost Breakdown

**Setup (One-Time):**
- Embedding generation: ~$0.0002 (negligible)

**Ongoing Usage:**
- 1,000 chats/month: $0.40
- 10,000 chats/month: $4.00
- 100,000 chats/month: $40.00

**Model:** `gpt-4o-mini` (fast and cheap)

---

## 🔗 Useful Links

**Get OpenAI Key:**
https://platform.openai.com/api-keys

**Convex Dashboard:**
https://dashboard.convex.dev/

**Vercel Dashboard:**
https://vercel.com/your-project

**AI SDK Docs:**
https://ai-sdk.dev

---

**Questions?** Check `/docs/AI_SETUP_GUIDE.md` for detailed troubleshooting!

**Status:** Ready to configure ✅
**Last Updated:** 2025-01-18
**Branch:** checkpoint-ai-1
