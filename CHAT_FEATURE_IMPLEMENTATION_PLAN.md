# Standalone Chat Feature Implementation Plan

## 🎯 Overview

Create a standalone, full-page chat interface accessible from the dashboard that allows users to:
- Chat with **Forefront Intelligence** (orchestrator with all tools)
- Save and manage chat sessions
- Access chat history
- Use the same styling as PlaygroundChat but as a full-page experience

---

## 📋 Requirements

### User Story
"As a user, I want to access a general chat function from my dashboard where I can have conversations with Forefront Intelligence and save my chat history for future reference."

### Key Features
1. **Full-page chat interface** (not module-specific)
2. **Session management** (save, load, delete chat sessions)
3. **Chat history sidebar** (list of saved chats)
4. **Same styling as PlaygroundChat** (Core Sans A 65 Bold, matching colors)
5. **Integration with Forefront Intelligence orchestrator**
6. **Persistent storage** in database
7. **Navigation integration** (accessible from Header and Dashboard)

---

## 🗄️ Database Schema Design

### New Tables

#### 1. **chat_sessions** - Stores chat session metadata
```typescript
export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(), // Auto-generated or user-defined
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  messageCount: integer('message_count').default(0),
  isPinned: boolean('is_pinned').default(false),
  tags: jsonb('tags').default('[]'), // For future organization
})
```

#### 2. **chat_messages** - Stores individual chat messages
```typescript
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => chatSessions.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  model: text('model'), // Which model was used (forefront-intelligence, etc.)
  metadata: jsonb('metadata').default('{}'), // Citations, tool calls, images, etc.
  createdAt: timestamp('created_at').defaultNow(),
})
```

### Migration Steps
1. Add tables to `lib/db/schema.ts`
2. Run database migration (Drizzle push)
3. Test schema with sample data

---

## 🛣️ Route Structure

### New Routes

#### 1. **Page Route**: `/chat` or `/dashboard/chat`
**Location**: `app/(main)/chat/page.tsx`

**Purpose**: Main chat interface page

**Why `/chat`**:
- Shorter, cleaner URL
- Easier to share
- Consistent with other top-level routes (modules, network, etc.)

#### 2. **API Routes**

##### `/api/chat-sessions` - Session CRUD
```typescript
GET    /api/chat-sessions           // List all sessions for user
POST   /api/chat-sessions           // Create new session
PUT    /api/chat-sessions/:id       // Update session (title, pinned)
DELETE /api/chat-sessions/:id       // Delete session
```

##### `/api/chat-sessions/[id]/messages` - Message CRUD
```typescript
GET    /api/chat-sessions/:id/messages  // Get all messages for session
POST   /api/chat-sessions/:id/messages  // Add message to session (handled by main chat API)
```

##### `/api/forefront/chat` - Main chat endpoint (extends existing playground/chat)
```typescript
POST   /api/forefront/chat           // Send message to Forefront Intelligence
// Payload: { sessionId, message, conversationHistory }
// Response: { response, model, metadata }
```

**Note**: Can reuse existing `/api/playground/chat/route.ts` logic but adapt for session-based context

---

## 🎨 Component Architecture

### Main Components

#### 1. **ChatPage** - `app/(main)/chat/page.tsx`
```typescript
'use client'

export default function ChatPage() {
  // States:
  // - currentSessionId
  // - sessions (list of all sessions)
  // - selectedSession
  // - showSessionsSidebar (mobile toggle)

  return (
    <div className="flex h-screen">
      <ChatSessionsSidebar />  {/* Left sidebar */}
      <ChatInterface />         {/* Main chat area */}
    </div>
  )
}
```

#### 2. **ChatSessionsSidebar** - `components/chat/ChatSessionsSidebar.tsx`
```typescript
'use client'

interface ChatSessionsSidebarProps {
  sessions: ChatSession[]
  currentSessionId: number | null
  onSelectSession: (id: number) => void
  onCreateSession: () => void
  onDeleteSession: (id: number) => void
  onRenameSession: (id: number, newTitle: string) => void
}

export function ChatSessionsSidebar(props: ChatSessionsSidebarProps) {
  // Features:
  // - List all sessions (sorted by lastMessageAt)
  // - "New Chat" button
  // - Session cards (title, last message preview, timestamp)
  // - Delete session (trash icon)
  // - Rename session (inline edit)
  // - Pin session (star icon)
}
```

#### 3. **ChatInterface** - `components/chat/ChatInterface.tsx`
```typescript
'use client'

interface ChatInterfaceProps {
  sessionId: number | null
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  // Features:
  // - Message list (scrollable)
  // - Message input (textarea + send button)
  // - Typing indicator
  // - Same styling as PlaygroundChat
  // - Auto-scroll to bottom on new message
  // - Save messages to session
}
```

#### 4. **ChatMessage** - `components/chat/ChatMessage.tsx`
```typescript
interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
    metadata?: any
    createdAt: Date
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  // Features:
  // - User message styling (zinc-800/50 bg)
  // - Assistant message styling (blue-500/20 bg)
  // - Markdown rendering
  // - Code highlighting
  // - Citation support
  // - Image/video embedding
}
```

### Component File Structure
```
components/
  chat/
    ChatSessionsSidebar.tsx
    ChatInterface.tsx
    ChatMessage.tsx
    ChatInput.tsx
    NewSessionButton.tsx
    SessionCard.tsx
```

---

## 🎨 Styling Specifications

### Match PlaygroundChat.tsx Styling

**Font**: Core Sans A 65 Bold (already available)

**Colors**:
```css
/* User Messages */
background: rgba(39, 39, 42, 0.5)  /* zinc-800/50 */
border: rgba(63, 63, 70, 0.5)      /* zinc-700/50 */

/* Assistant Messages */
background: rgba(59, 130, 246, 0.2)  /* blue-500/20 */
border: rgba(59, 130, 246, 0.3)      /* blue-500/30 */

/* Input Area */
background: rgba(39, 39, 42, 0.5)   /* zinc-800/50 */
border: 1px solid rgb(63, 63, 70)   /* zinc-700 */

/* Send Button */
background: white
text: uppercase [SEND]

/* Labels */
text-transform: uppercase
font-weight: 600
```

**Layout**:
- Full page (no header padding - chat handles its own layout)
- Sidebar: 320px wide (fixed)
- Main chat: flex-1 (remaining space)
- Message padding: 16px
- Gap between messages: 12px

---

## 🔗 API Integration

### Flow Diagram

```
User Types Message
       ↓
ChatInterface.tsx (Frontend)
       ↓
POST /api/forefront/chat
  - sessionId
  - message
  - conversationHistory (from session messages)
       ↓
ForefrontOrchestrator.execute()
  - Uses advanced context manager
  - Calls appropriate tools/models
  - Returns structured response
       ↓
Save to chat_messages table
       ↓
Update session.lastMessageAt, session.messageCount
       ↓
Return response to frontend
       ↓
Display in ChatInterface
```

### API Request/Response Examples

#### Create Session
```typescript
// POST /api/chat-sessions
{
  title: "New Chat" // Auto-generated or user-provided
}

// Response
{
  id: 1,
  userId: "user123",
  title: "New Chat",
  createdAt: "2025-01-12T10:00:00Z",
  messageCount: 0
}
```

#### Send Message
```typescript
// POST /api/forefront/chat
{
  sessionId: 1,
  message: "Use seed dream 4 to generate a cyberpunk city",
  conversationHistory: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ]
}

// Response (matches playground/chat format)
{
  response: "Generated image URL or text response",
  model: "forefront-intelligence",
  type: "image" | "text",
  metadata: {
    toolUsed: "generate_image",
    modelUsed: "seed-dream-4",
    citations: [...],
    executionTime: 3000
  }
}
```

#### Load Session Messages
```typescript
// GET /api/chat-sessions/1/messages
{
  messages: [
    {
      id: 1,
      role: "user",
      content: "Hello",
      createdAt: "2025-01-12T10:01:00Z"
    },
    {
      id: 2,
      role: "assistant",
      content: "Hi! How can I help?",
      model: "forefront-intelligence",
      metadata: {},
      createdAt: "2025-01-12T10:01:02Z"
    }
  ]
}
```

---

## 🧩 Navigation Integration

### Header.tsx Updates

Add "Chat" link to desktop navigation (after "Modules"):

```typescript
<Link
  href="/chat"
  style={{
    fontSize: '0.95rem',
    color: '#e0e0e0',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.3s ease',
    position: 'relative'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = '#fff'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = '#e0e0e0'
  }}
>
  Chat
</Link>
```

Also add to mobile menu and user dropdown.

### Dashboard Integration

Add "Open Chat" card to Bento dashboard grid:

```typescript
<Link
  href="/chat"
  className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-blue-500/50 transition-all"
>
  <div className="flex items-center gap-3 mb-3">
    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
      💬
    </div>
    <h3 className="text-lg font-semibold uppercase tracking-wide">
      Chat
    </h3>
  </div>
  <p className="text-sm text-zinc-400">
    Chat with Forefront Intelligence
  </p>
</Link>
```

---

## 🚀 Implementation Steps

### Phase 1: Database Setup
1. ✅ Review existing schema
2. Add `chatSessions` table to schema.ts
3. Add `chatMessages` table to schema.ts
4. Run `npx drizzle-kit push` (or equivalent migration command)
5. Verify tables created in Neon dashboard

### Phase 2: API Routes
1. Create `/api/chat-sessions/route.ts` (GET, POST)
2. Create `/api/chat-sessions/[id]/route.ts` (PUT, DELETE)
3. Create `/api/chat-sessions/[id]/messages/route.ts` (GET)
4. Create `/api/forefront/chat/route.ts` (reuse playground/chat logic)
5. Test all endpoints with Postman/Thunder Client

### Phase 3: Components
1. Create `components/chat/ChatSessionsSidebar.tsx`
2. Create `components/chat/ChatInterface.tsx`
3. Create `components/chat/ChatMessage.tsx`
4. Create `components/chat/ChatInput.tsx`
5. Create `components/chat/SessionCard.tsx`
6. Test components in isolation (Storybook optional)

### Phase 4: Page Integration
1. Create `app/(main)/chat/page.tsx`
2. Integrate sidebar + chat interface
3. Add session management logic
4. Add real-time message updates
5. Test full workflow (create session → send message → view history)

### Phase 5: Navigation
1. Update `components/ui/Header.tsx` (add Chat link)
2. Update `app/(main)/dashboard/page.tsx` (add Chat card)
3. Test navigation from all entry points

### Phase 6: Polish & Testing
1. Add loading states
2. Add error handling
3. Add empty states ("No sessions yet")
4. Test mobile responsiveness
5. Test edge cases (network errors, long messages, etc.)
6. Performance testing (large chat histories)

---

## 📊 Features Breakdown

### MVP (Phase 1)
- ✅ Create new chat session
- ✅ Send messages to Forefront Intelligence
- ✅ View conversation history
- ✅ List saved sessions
- ✅ Select session to load

### Future Enhancements (Phase 2)
- 🔮 Export chat as PDF
- 🔮 Share chat session (public link)
- 🔮 Search within chat history
- 🔮 Filter sessions by date/tag
- 🔮 Voice input/output (ElevenLabs integration)
- 🔮 Code execution in chat (like Jupyter notebook)
- 🔮 Collaborative chat (multiple users in one session)

---

## 🎯 Success Criteria

✅ User can access chat from dashboard/header
✅ User can create multiple chat sessions
✅ User can send messages and get responses from Forefront Intelligence
✅ User can switch between saved sessions
✅ User can delete sessions
✅ User can rename sessions
✅ Chat interface matches PlaygroundChat styling
✅ All messages persist in database
✅ Page is fully responsive (mobile, tablet, desktop)
✅ No TypeScript errors
✅ No console errors in browser

---

## 📁 File Checklist

### New Files to Create

**Database Schema**:
- ✅ Update `lib/db/schema.ts` (add chatSessions, chatMessages)

**API Routes**:
- [ ] `app/api/chat-sessions/route.ts`
- [ ] `app/api/chat-sessions/[id]/route.ts`
- [ ] `app/api/chat-sessions/[id]/messages/route.ts`
- [ ] `app/api/forefront/chat/route.ts`

**Components**:
- [ ] `components/chat/ChatSessionsSidebar.tsx`
- [ ] `components/chat/ChatInterface.tsx`
- [ ] `components/chat/ChatMessage.tsx`
- [ ] `components/chat/ChatInput.tsx`
- [ ] `components/chat/SessionCard.tsx`
- [ ] `components/chat/NewSessionButton.tsx`

**Pages**:
- [ ] `app/(main)/chat/page.tsx`

**Modified Files**:
- [ ] `components/ui/Header.tsx` (add Chat link)
- [ ] `app/(main)/dashboard/page.tsx` (add Chat card)

---

## 🔧 Technical Notes

### Context Management
- Reuse **AdvancedContextManager** from orchestrator
- Load full conversation history from `chat_messages` table
- Convert to Message[] format for context compression
- Pass to Forefront Intelligence orchestrator

### Auto-Save Behavior
- Save user message immediately on send
- Save assistant response when received
- Update session metadata (lastMessageAt, messageCount) on each message
- No manual "Save" button needed (auto-persist)

### Session Title Generation
- Default: "New Chat" on creation
- Auto-generate from first message (e.g., first 50 chars)
- Allow user to rename inline (click to edit)

### Performance Considerations
- Paginate messages if session > 100 messages
- Lazy load session list (virtual scrolling if > 50 sessions)
- Debounce search/filter inputs
- Use React.memo for ChatMessage components

### Error Handling
- Network errors: Show retry button
- API errors: Display error message in chat
- Session not found: Redirect to chat home with error toast
- Rate limiting: Show cooldown timer

---

## 🎓 References

### Existing Code to Reference
- `components/module/PlaygroundChat.tsx` - Chat UI styling
- `lib/forefront/orchestrator.ts` - Forefront Intelligence integration
- `app/api/playground/chat/route.ts` - Chat API structure
- `lib/db/schema.ts` - Database patterns
- `lib/forefront/context/advanced-context-manager.ts` - Context compression

### Design Inspiration
- ChatGPT sidebar (session list)
- Claude.ai chat interface (clean message layout)
- Linear app (minimalist, functional UI)

---

## ✅ Next Steps

1. Get approval on this plan
2. Start with Phase 1 (Database Setup)
3. Implement incrementally, testing each phase
4. Deploy to preview environment for user testing
5. Iterate based on feedback

**Estimated Timeline**: 2-3 days (full-time development)

---

**Status**: 📝 Plan Complete - Ready for Implementation

Let me know if you'd like me to proceed with Phase 1!
