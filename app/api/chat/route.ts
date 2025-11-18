import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { chatTools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Get the last user message for RAG search
  const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
  let ragContext = '';
  let retrievedDocs: any[] = [];

  if (lastUserMessage) {
    try {
      // Search for relevant knowledge base chunks
      const results = await convex.action(api.ragEmbeddings.searchSimilarChunks, {
        query: lastUserMessage.content,
        limit: 3,
      });

      if (results && results.length > 0) {
        // Build RAG context from retrieved chunks
        ragContext = '\n\n## Relevant Documentation:\n\n';
        for (const result of results) {
          ragContext += `### ${result.documentTitle}\n${result.chunkText}\n\n`;
          retrievedDocs.push({
            title: result.documentTitle,
            category: result.documentCategory,
            relevanceScore: result._score,
          });
        }
      }
    } catch (error) {
      console.error('RAG search error:', error);
      // Continue without RAG if there's an error
    }
  }

  // Build system prompt with TreeShop context AND RAG context
  const systemPrompt = `You are TreeShop Assistant, an intelligent AI helper for TreeShop - a professional tree service management platform.

Your role is to:
- Help users navigate the TreeShop platform efficiently
- Assist with pricing calculations and proposal creation
- Guide users through workflows (Lead → Proposal → Work Order → Invoice)
- Answer questions about equipment, employees, loadouts, and projects
- Provide quick actions and suggestions based on current context
- Explain TreeShop Score methodology and AFISS factors

TreeShop Context:
${context ? JSON.stringify(context, null, 2) : 'No specific context provided'}

Key TreeShop Concepts:
- TreeShop Score: Point-based system to quantify work complexity
- AFISS: Access, Facilities, Irregularities, Site, Safety - 80+ complexity factors
- Loadout: Equipment + Employee configuration for a service type
- DOC Workflow: Discovery (Lead) → Offer (Proposal) → Complete (Work Order) → Collect (Invoice)
- Services: Forestry Mulching, Stump Grinding, Land Clearing, Tree Removal, Tree Trimming

${ragContext}

When users ask for help:
1. Provide clear, actionable guidance
2. Use information from the documentation above when relevant
3. Offer to perform quick actions when appropriate
4. Suggest relevant navigation paths
5. Explain pricing formulas when needed
6. Keep responses concise and professional
7. If you use information from the documentation, cite the relevant section title

Remember: You're helping professional tree service companies run their business more efficiently.`;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
    tools: chatTools, // Enable function calling
    maxSteps: 5, // Allow multi-step tool usage
    onFinish: async (completion) => {
      // TODO: Log chat session and messages to Convex for analytics
      // This would track retrieved documents, response quality, etc.
      console.log('Retrieved docs:', retrievedDocs);
      console.log('Tool calls:', completion.toolCalls);
      console.log('Tool results:', completion.toolResults);
    },
  });

  return result.toDataStreamResponse();
}
