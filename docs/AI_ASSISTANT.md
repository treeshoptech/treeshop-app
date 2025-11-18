# TreeShop AI Assistant

## Overview

The TreeShop AI Assistant is an intelligent conversational interface that helps users navigate the platform, answer questions, and perform quick actions. It's built using the Vercel AI SDK and integrates seamlessly with TreeShop's workflow.

## Features

### 1. Conversational Interface
- Natural language chat with context awareness
- Streaming responses for real-time feedback
- Clean, dark-themed UI matching TreeShop design system

### 2. Workflow-Aware Context
- Knows current page and user location
- Understands TreeShop concepts (TreeShop Score, AFISS, Loadouts, etc.)
- Tracks recent actions for continuity

### 3. Quick Actions
- **Create New Lead**: Navigate directly to lead creation
- **Calculate Pricing**: Jump to pricing calculators
- **Explain AFISS**: Get detailed explanation of AFISS factors
- **View Dashboard**: Return to main dashboard
- Additional context-aware suggestions based on current page

### 4. Navigation Assistance
- Direct navigation to any page
- Guided workflows (Lead → Proposal → Work Order → Invoice)
- Smart suggestions based on user intent

## Architecture

### Components

```
app/
├── api/
│   └── chat/
│       └── route.ts              # API endpoint for AI chat (Vercel AI SDK)
├── components/
│   └── chat/
│       ├── AIAssistantSidebar.tsx  # Main chat UI component
│       └── AIContext.tsx           # Context provider for AI state
└── dashboard/
    └── layout.tsx                # Integration point with FAB button
```

### Key Technologies

- **Vercel AI SDK**: Streaming chat with OpenAI
- **OpenAI GPT-4o-mini**: Fast, cost-effective model for chat
- **React Context**: Global AI state management
- **Material-UI**: Consistent UI components

## Setup

### 1. Install Dependencies

Already installed via npm:
```bash
npm install ai @ai-sdk/openai
```

### 2. Configure Environment Variables

Add to your `.env.local`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Usage

The AI Assistant is automatically available in the dashboard:

1. Look for the **floating green sparkle button** (✨) in the bottom-right corner
2. Click to open the AI Assistant sidebar
3. Type your question or select a quick action
4. Get instant help!

## How It Works

### Context Awareness

The AI Assistant receives context about:
- **Current Page**: Which page the user is on
- **Current Project**: Active project details (if applicable)
- **Current Customer**: Selected customer info (if applicable)
- **Recent Actions**: Last 10 user actions for continuity

### System Prompt

The assistant is trained with TreeShop-specific knowledge:

```typescript
- TreeShop Score: Point-based system to quantify work complexity
- AFISS: Access, Facilities, Irregularities, Site, Safety - 80+ complexity factors
- Loadout: Equipment + Employee configuration for a service type
- DOC Workflow: Discovery → Offer → Complete → Collect
- Services: Forestry Mulching, Stump Grinding, Land Clearing, Tree Removal, Tree Trimming
```

### Quick Actions

Quick actions can either:
1. **Navigate**: Jump directly to a specific page
2. **Prompt**: Pre-fill the chat with a question

Example:
```typescript
{
  label: 'Create New Lead',
  action: 'How do I create a new lead?',
  route: '/dashboard/leads' // Optional navigation
}
```

## Customization

### Adding Context to Specific Pages

Use the `useAIContext` hook to update context:

```typescript
import { useAIContext } from '@/app/components/chat/AIContext';

function ProjectDetailPage({ project }) {
  const { updateContext } = useAIContext();

  useEffect(() => {
    updateContext({
      currentProject: project,
      quickActions: [
        { label: 'Create Proposal', action: 'Help me create a proposal', route: '/dashboard/proposals/new' },
        { label: 'Calculate Price', action: 'Calculate pricing for this project' },
      ]
    });
  }, [project]);
}
```

### Adding Recent Actions

Track user actions for context continuity:

```typescript
import { useAIContext } from '@/app/components/chat/AIContext';

function CreateLeadButton() {
  const { addRecentAction } = useAIContext();

  const handleCreateLead = () => {
    // ... create lead logic
    addRecentAction('Created new lead for [customer name]');
  };
}
```

## API Route Details

### Endpoint: `/api/chat`

**Method**: POST

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "How do I calculate pricing?" }
  ],
  "context": {
    "currentPage": "/dashboard/calculators",
    "recentActions": ["Viewed dashboard", "Opened calculators"]
  }
}
```

**Response**: Server-sent events (streaming)

**Configuration**:
- Model: `gpt-4o-mini` (fast, cost-effective)
- Max Duration: 30 seconds
- Streaming: Enabled

## Best Practices

### 1. Keep Context Relevant
Only update context when meaningful changes occur. Don't spam updates on every render.

### 2. Use Quick Actions Wisely
Provide 3-5 most relevant quick actions based on current context. Too many options create decision paralysis.

### 3. Track Important Actions
Use `addRecentAction` for significant user events:
- Creating/editing entities
- Navigation between major sections
- Completing workflows

### 4. Test Prompts
Test your quick action prompts to ensure the AI provides helpful responses:
- Keep prompts specific and actionable
- Include context when needed
- Avoid ambiguous language

## Cost Considerations

### Model Pricing (GPT-4o-mini)

- **Input**: $0.150 per 1M tokens
- **Output**: $0.600 per 1M tokens

### Typical Costs Per Chat
- Average message: ~500 tokens (input + output)
- Cost per message: ~$0.0004 (less than 1/20th of a cent)
- 1000 messages: ~$0.40

### Optimization Tips
1. **Use gpt-4o-mini** (not gpt-4) for chat - 10x cheaper
2. **Keep system prompts concise** - Less context = lower cost
3. **Stream responses** - Better UX without cost impact
4. **Monitor usage** - Set up OpenAI usage alerts

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic chat interface
- ✅ Quick actions
- ✅ Context awareness
- ✅ Navigation assistance

### Phase 2 (Planned)
- [ ] Function calling for actions (e.g., "Create a lead for John Smith")
- [ ] Voice input/output
- [ ] Multi-turn workflow guidance
- [ ] Personalized suggestions based on user history

### Phase 3 (Future)
- [ ] Integration with Convex for data queries
- [ ] Proposal generation assistance
- [ ] Price optimization suggestions
- [ ] Predictive analytics insights

## Troubleshooting

### AI Assistant Not Responding

1. **Check API Key**: Ensure `OPENAI_API_KEY` is set in `.env.local`
2. **Restart Dev Server**: Changes to `.env.local` require restart
3. **Check Console**: Look for API errors in browser console
4. **Verify Network**: Ensure `/api/chat` endpoint is reachable

### Slow Response Times

1. **Check Model**: Ensure using `gpt-4o-mini` (not `gpt-4`)
2. **Reduce Context**: Minimize unnecessary context data
3. **Check Network**: Slow connection affects streaming

### Context Not Updating

1. **Verify Provider**: Ensure `AIContextProvider` wraps app in `layout.tsx`
2. **Check Hook Usage**: Use `useAIContext` within provider tree
3. **Test Update**: Log context changes to verify updates

## Support

For issues or questions:
- File an issue on GitHub
- Check Vercel AI SDK docs: https://sdk.vercel.ai
- Review OpenAI API docs: https://platform.openai.com/docs

---

Built with ❤️ for TreeShop by TreeShop Tech Team
