# Vercel AI SDK Integration - Complete Guide

## Architecture Overview

TreeShop uses **100% Vercel-native AI SDK** for maximum stability and reliability:

✅ **`ai`** - Vercel AI SDK UI (v5.0.93)
✅ **`@ai-sdk/openai`** - Official OpenAI provider (v2.0.68)
✅ **NO experimental packages** - Production-ready only
✅ **Route Handlers** - Not Server Actions (Vercel recommendation)

---

## Why This Stack?

### ✅ What We're Using (Correct!)

**AI SDK UI** - Production-ready, stable, recommended by Vercel
- `useChat` hook for client-side state
- `streamText` for server-side streaming
- Route Handler pattern (`/api/chat`)
- Built-in tool calling support
- Automatic token counting
- Error handling

### ❌ What We're NOT Using (Good!)

**AI SDK RSC** - Experimental, paused development
- React Server Components for AI
- Server Actions for streaming
- Generative UI
- Still in beta, not production-ready

**From Vercel docs:**
> "We recommend using AI SDK UI for production applications. AI SDK RSC development is currently paused."

---

## Current Implementation

### 1. Chat API (`/app/api/chat/route.ts`)

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { chatTools } from './tools';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // RAG: Search documentation
  const relevantDocs = await searchKnowledgeBase(lastMessage);

  // Stream response with tools
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: buildSystemPrompt(context, relevantDocs),
    messages,
    tools: chatTools, // ✅ Function calling
    maxSteps: 5, // ✅ Multi-step tool execution
  });

  return result.toDataStreamResponse(); // ✅ Vercel AI SDK response
}
```

### 2. Client Hook (`useChat`)

```typescript
import { useChat } from 'ai/react';

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  body: { context },
  onToolCall: (toolCall) => {
    // Handle tool execution on client
    if (toolCall.toolName === 'navigateToPage') {
      router.push(toolCall.args.path);
    }
  },
});
```

### 3. Tools/Functions (`/app/api/chat/tools.ts`)

```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const chatTools = {
  navigateToPage: tool({
    description: 'Navigate user to a page',
    parameters: z.object({
      path: z.string(),
      reason: z.string(),
    }),
    execute: async ({ path }) => {
      return { action: 'navigate', path };
    },
  }),
  // ... more tools
};
```

---

## Vercel AI SDK Features We're Using

### ✅ 1. Streaming Responses

```typescript
const result = streamText({
  model: openai('gpt-4o-mini'),
  system: prompt,
  messages,
});

// Streams tokens as they're generated
return result.toDataStreamResponse();
```

**Benefits:**
- Instant feedback (no waiting for full response)
- Better UX (see AI "thinking")
- Lower perceived latency

### ✅ 2. Tool Calling (Function Calling)

```typescript
const result = streamText({
  tools: {
    calculateScore: tool({
      description: 'Calculate TreeShop Score',
      parameters: z.object({
        serviceType: z.enum(['forestry-mulching', ...]),
        acres: z.number(),
      }),
      execute: async ({ serviceType, acres }) => {
        return calculateTreeShopScore(serviceType, acres);
      },
    }),
  },
});
```

**Use Cases:**
- "Calculate price for 5 acres of forestry mulching"
- "Create a new lead for John Smith"
- "Navigate me to the proposals page"

### ✅ 3. Multi-Step Tool Execution

```typescript
const result = streamText({
  maxSteps: 5, // Allow up to 5 tool calls
});
```

**Example:**
```
User: "Create a proposal for forestry mulching"
AI:   1. searchCustomer("current") → finds customer
      2. calculateScore({ acres: 5, dbh: 6 }) → gets score
      3. selectLoadout("forestry-mulching") → finds crew
      4. createProposal({ customer, score, loadout }) → generates
      5. Returns: "Created proposal #123"
```

### ✅ 4. Automatic Token Management

```typescript
const result = streamText({
  // ... config
  onFinish: (completion) => {
    console.log('Tokens used:', completion.usage);
    // { promptTokens: 234, completionTokens: 456 }
  },
});
```

### ✅ 5. Error Handling

```typescript
const { messages, error } = useChat({
  api: '/api/chat',
  onError: (error) => {
    console.error('Chat error:', error);
    // Show user-friendly message
  },
});
```

---

## Vercel AI SDK Best Practices

### 1. Use Route Handlers (Not Server Actions)

✅ **Do This:**
```typescript
// /app/api/chat/route.ts
export async function POST(req: Request) {
  const result = streamText({ ... });
  return result.toDataStreamResponse();
}
```

❌ **Don't Do This:**
```typescript
// Server Action (experimental, not recommended)
'use server'
export async function chat(messages) { ... }
```

### 2. Separate Concerns

✅ **Do This:**
- Route Handler: `streamText` + RAG + tools
- Client: `useChat` + UI + navigation
- Tools: Separate file with clear schemas

❌ **Don't Do This:**
- Mixing server logic in client components
- Business logic in tools (keep them lightweight)

### 3. Type Safety with Zod

✅ **Do This:**
```typescript
import { z } from 'zod';

const parameters = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive(),
});
```

❌ **Don't Do This:**
```typescript
// No validation, runtime errors
const parameters = { customerId: 'string', amount: 'number' };
```

### 4. Optimize Token Usage

✅ **Do This:**
```typescript
// Limit RAG context
const topChunks = await search(query, { limit: 3 });

// Use shorter model
model: openai('gpt-4o-mini'), // Not 'gpt-4'

// Clear system prompt
system: "You are TreeShop Assistant. Keep responses concise."
```

### 5. Handle Tool Results in UI

✅ **Do This:**
```typescript
const { messages } = useChat({
  onToolCall: async (toolCall) => {
    if (toolCall.toolName === 'navigateToPage') {
      router.push(toolCall.args.path);
      return 'Navigated successfully';
    }
  },
});
```

---

## Advanced Features Available

### 1. Multi-Modal Support

```typescript
const result = streamText({
  model: openai('gpt-4o'),
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image', image: imageUrl },
    ],
  }],
});
```

**Use Case:** Analyze photos from work orders

### 2. Structured Output

```typescript
import { generateObject } from 'ai';

const result = await generateObject({
  model: openai('gpt-4o-mini'),
  schema: z.object({
    treeShopScore: z.number(),
    afissMultiplier: z.number(),
    estimatedHours: z.number(),
  }),
  prompt: 'Analyze this project and extract pricing data',
});
```

**Use Case:** Parse unstructured project descriptions into structured data

### 3. Prompt Caching (Coming Soon)

```typescript
const result = streamText({
  system: largeSystemPrompt,
  experimental_cache: {
    system: true, // Cache system prompt across requests
  },
});
```

**Savings:** 90% cost reduction for repeated system prompts

### 4. Reasoning Models (o1-preview, o1-mini)

```typescript
const result = streamText({
  model: openai('o1-mini'),
  prompt: 'Calculate optimal crew assignment for 5 concurrent jobs',
});
```

**Use Case:** Complex optimization problems

---

## Performance Optimization

### 1. Edge Runtime

```typescript
// /app/api/chat/route.ts
export const runtime = 'edge'; // Deploy to Vercel Edge
export const maxDuration = 30;
```

**Benefits:**
- Lower latency (closer to users)
- Cheaper ($2.00 per 1M requests vs $5.00)
- Auto-scaling

### 2. Response Streaming

```typescript
// Already enabled with streamText
const result = streamText({ ... });
return result.toDataStreamResponse();
```

**Benefits:**
- Instant first token
- Progressive rendering
- Better perceived performance

### 3. Parallel Tool Calls

```typescript
// Vercel AI SDK handles this automatically
const result = streamText({
  tools: {
    searchCustomer: tool({ ... }),
    getLoadouts: tool({ ... }),
  },
});

// AI can call both tools simultaneously
```

### 4. Request Deduplication

```typescript
import { unstable_cache } from 'next/cache';

const getCachedEmbedding = unstable_cache(
  async (text: string) => generateEmbedding(text),
  ['embeddings'],
  { revalidate: 3600 } // Cache for 1 hour
);
```

---

## Cost Optimization

### Model Selection

| Model | Cost (per 1M tokens) | Use Case |
|-------|----------------------|----------|
| gpt-4o-mini | $0.15 input, $0.60 output | ✅ Chat, RAG (current) |
| gpt-4o | $5.00 input, $15.00 output | Complex reasoning |
| gpt-3.5-turbo | $0.50 input, $1.50 output | Deprecated, use mini |

**Recommendation:** Stick with `gpt-4o-mini` for 99% of use cases

### RAG Optimization

```typescript
// Limit retrieved chunks
const topChunks = await search(query, { limit: 3 }); // Not 10+

// Use smaller embeddings
model: "text-embedding-3-small", // 1536 dims, $0.02/1M tokens
// vs "text-embedding-3-large" - 3072 dims, $0.13/1M tokens
```

### Caching Strategy

```typescript
// Cache common queries
const cachedResponses = new Map();

if (cachedResponses.has(query)) {
  return cachedResponses.get(query);
}

const result = await streamText({ ... });
cachedResponses.set(query, result);
```

---

## Monitoring & Analytics

### 1. Token Usage Tracking

```typescript
const result = streamText({
  onFinish: async (completion) => {
    await logToConvex({
      tokensUsed: completion.usage.totalTokens,
      cost: calculateCost(completion.usage),
      duration: completion.duration,
    });
  },
});
```

### 2. Tool Call Analytics

```typescript
const result = streamText({
  tools: chatTools,
  onFinish: async (completion) => {
    for (const toolCall of completion.toolCalls) {
      await logToolUsage({
        toolName: toolCall.toolName,
        success: !toolCall.error,
        duration: toolCall.duration,
      });
    }
  },
});
```

### 3. Error Tracking

```typescript
const { error } = useChat({
  onError: async (error) => {
    await logError({
      message: error.message,
      stack: error.stack,
      context: currentContext,
    });

    // Show user-friendly message
    toast.error('AI assistant is temporarily unavailable');
  },
});
```

---

## Testing Strategy

### 1. Unit Tests (Tools)

```typescript
import { chatTools } from './tools';

test('calculateScore returns correct value', async () => {
  const result = await chatTools.calculateScore.execute({
    serviceType: 'forestry-mulching',
    workVolume: { acres: 5, dbh: 6 },
  });

  expect(result.baseScore).toBe(30);
});
```

### 2. Integration Tests (API)

```typescript
import { POST } from './route';

test('chat API returns streamed response', async () => {
  const request = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello' }],
    }),
  });

  const response = await POST(request);
  expect(response.headers.get('content-type')).toContain('text/plain');
});
```

### 3. E2E Tests (Playwright)

```typescript
test('user can chat with AI assistant', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[aria-label="AI Assistant"]');
  await page.fill('input[placeholder="Ask me anything..."]', 'What is TreeShop Score?');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=TreeShop Score is')).toBeVisible();
});
```

---

## Deployment Checklist

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-your-key
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Vercel Dashboard
# Add OPENAI_API_KEY to production environment
```

### Build Configuration

```json
// vercel.json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Edge Deployment

```typescript
// /app/api/chat/route.ts
export const runtime = 'edge';
export const maxDuration = 30;
```

---

## Future Enhancements

### Phase 1: Enhanced Tools (Current)
- ✅ Navigation
- ✅ Score calculation
- ✅ AFISS factors
- [ ] Customer search (integrate with Convex)
- [ ] Lead creation
- [ ] Proposal generation

### Phase 2: Multi-Modal
- [ ] Analyze work order photos
- [ ] Extract data from PDF invoices
- [ ] Voice input/output

### Phase 3: Advanced Features
- [ ] Streaming UI (generate React components)
- [ ] Multi-agent workflows
- [ ] Fine-tuned models
- [ ] Prompt caching

---

## Resources

**Official Docs:**
- Vercel AI SDK: https://ai-sdk.dev
- OpenAI Provider: https://ai-sdk.dev/providers/openai
- Tool Calling: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling

**Examples:**
- Vercel AI Chatbot: https://github.com/vercel/ai-chatbot
- Next.js AI Template: https://vercel.com/templates/ai

**Support:**
- Vercel Discord: https://discord.gg/vercel
- GitHub Issues: https://github.com/vercel/ai

---

## Summary

✅ **We're using Vercel AI SDK correctly:**
- Production-ready AI SDK UI (not experimental RSC)
- Route Handler pattern (recommended)
- Tool calling enabled
- RAG integration
- Proper error handling
- Edge runtime compatible

✅ **Everything is Vercel-native:**
- No third-party AI libraries
- Official OpenAI provider
- Built on Vercel best practices
- Fully supported and documented

✅ **Ready for scale:**
- Edge deployment
- Streaming responses
- Token optimization
- Comprehensive monitoring

**You're building on the most stable, reliable AI infrastructure available!** 🚀

---

Built with ❤️ using Vercel AI SDK
Last Updated: January 2025
