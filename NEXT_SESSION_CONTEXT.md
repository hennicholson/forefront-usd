# Next Session: AI Chat Interface Enhancements

## 🎯 Immediate Task
Enhance the AI chat interface UI with better visual hierarchy, citations, model metadata, and loading states.

## ✅ What's Already Done
1. **Forefront Intelligence Built** - Multi-agent AI orchestration system
   - Router: `lib/forefront/router.ts` - Classifies query intent in <200ms
   - Orchestrator: `lib/forefront/orchestrator.ts` - Routes to optimal models
   - API integrated: `/app/api/playground/chat/route.ts` handles `forefront-intelligence` model
   - Model added to selector: Purple-pink-orange gradient, listed first
   - Set as default model in AIPlayground

2. **Committed State**: Commit `a801a8d`
   - Clean checkpoint before UI changes
   - Text highlight feature fixed (300ms debounce, content area validation)

## 🔄 Revert Instructions (If User Dislikes Changes)
```bash
git reset --hard a801a8d
```

## 📋 Changes to Implement

### File: `app/(main)/modules/[slug]/components/AIPlayground.tsx`

#### 1. Message Styling (Lines ~600-700)
```typescript
// Current: Plain message bubbles
// Add: Visual distinction, left border for AI, better spacing

// AI Message (add to className):
"border-l-4 border-purple-500/50 bg-zinc-800/30"

// User Message (keep as is):
"bg-white/10"
```

#### 2. Model Metadata Badge (After message content ~line 650)
```typescript
{message.role === 'assistant' && message.metadata && (
  <div className="flex gap-2 mt-2 text-xs text-zinc-500">
    <Badge>Routed to: {message.metadata.modelUsed}</Badge>
    <Badge>{message.metadata.executionTime}ms</Badge>
    {message.metadata.citations && <Badge>🔍 Web Search</Badge>}
  </div>
)}
```

#### 3. Loading States (Lines ~175-250 in handleSubmit)
```typescript
// Add state: const [loadingPhase, setLoadingPhase] = useState('')

// In handleSubmit before fetch:
setLoadingPhase('Analyzing query...')
setTimeout(() => setLoadingPhase('Selecting model...'), 500)
setTimeout(() => setLoadingPhase('Fetching response...'), 1000)

// Show loading indicator:
{isLoading && loadingPhase && (
  <div className="text-sm text-zinc-400 italic">{loadingPhase}</div>
)}
```

#### 4. Context Indicator (In header ~line 520)
```typescript
<Badge variant="outline" className="text-xs">
  📚 {moduleTitle}
</Badge>
{highlightedText && (
  <Badge variant="outline" className="text-xs">
    ✏️ Highlighted text
  </Badge>
)}
```

#### 5. Message Actions (Hover on AI messages ~line 660)
```typescript
<div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 flex gap-1">
  <button onClick={() => navigator.clipboard.writeText(message.content)}>
    <Copy size={14} />
  </button>
  <button onClick={() => handleSaveNote(message)}>
    <Bookmark size={14} />
  </button>
</div>

// Wrap message in: <div className="relative group">
```

### File: `components/ui/markdown-message.tsx`

#### 6. Better Markdown Styling (Lines ~30-60)
```typescript
// Current: Basic markdown rendering
// Enhance:
'& h2': { fontWeight: 'bold', fontSize: '1.25rem', marginTop: '1.5rem' }
'& ul': { paddingLeft: '1.5rem', listStyleType: 'disc' }
'& li': { marginBottom: '0.5rem' }
'& strong': { fontWeight: '700', color: 'white' }
```

### File: `components/ui/citation-display.tsx`

#### 7. Inline Citations (Lines ~20-40)
```typescript
// Current: Citations at bottom
// Add: Inline [1], [2] with hover preview
// Replace citation text with: [1] [2] etc
// Add tooltip on hover showing source preview
```

## 🧪 Testing Checklist
- [ ] Ask factual question → Check Sonar Pro routing + citations
- [ ] Ask reasoning question → Check Qwen routing + execution time
- [ ] Ask simple question → Check fast model routing
- [ ] Hover message → Check copy/save buttons appear
- [ ] Watch loading → Check phase transitions
- [ ] Check context badges → Module + highlighted text shown

## 🔑 Key Context for AI
- Project: Forefront - AI education platform
- Router uses Llama 3.1 8B (fast classification)
- Routes: Web search→Sonar Pro, Reasoning→Qwen, Coding→Llama 3.3, Simple→Llama 8B
- Metadata available: modelUsed, executionTime, citations, fallbackUsed
- User wants easy revert if they don't like the new UI

## 📂 Important Files
- AIPlayground: `/app/(main)/modules/[slug]/components/AIPlayground.tsx`
- Router: `/lib/forefront/router.ts`
- Orchestrator: `/lib/forefront/orchestrator.ts`
- Models: `/lib/models/all-models.ts`
- API: `/app/api/playground/chat/route.ts`

## 🚀 Start Command
```bash
cd /Users/hennicholson/forefront-usd
PORT=3003 npm run dev
```

Good luck next session! 🎨
