# ForeFront USD - Claude Code Context

## Project Overview
ForeFront USD is a Next.js 15 learning platform with AI-powered features including voice mentors, interactive modules, and real-time collaboration.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Neon Postgres with Drizzle ORM
- **Styling**: Tailwind CSS
- **AI Integration**:
  - ElevenLabs Voice AI (conversational voice mentors)
  - Google Gemini (content generation)
- **Real-time**: Ably (chat, presence)
- **Deployment**: Netlify (production at https://beforefront.com)

## Environment Variables Required

Create `.env.local` with:

```env
# Database
DATABASE_URL=postgresql://...
NETLIFY_DATABASE_URL=postgresql://...
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://...

# AI Services
ELEVENLABS_API_KEY=sk_...
GEMINI_API_KEY=...

# Real-time
ABLY_API_KEY=...

# Other
REPLICATE_API_TOKEN=...
```

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Drizzle Studio to view/edit data
npm run db:studio
```

### 3. Run Development Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 4. Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate DB migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run migrate:modules` - Migrate module data

## Project Structure

```
/app
  /(main)           # Main app routes (dashboard, modules, etc.)
  /api              # API routes
    /elevenlabs     # Voice agent endpoints
    /modules        # Module CRUD
    /waitlist       # Waitlist management
/components
  /ui               # Reusable UI components
  /landing          # Landing page components
  /module           # Module-specific components
/lib
  /db               # Database schema and client
  /elevenlabs       # Voice AI utilities
```

## Recent Features & Changes

### Voice AI Mentor (Latest - Nov 2024)
**Location**: `/app/(main)/modules/[slug]/components/AIPlayground.tsx`

- Integrated ElevenLabs Conversational AI
- Voice mode allows students to talk with AI mentor about module content
- Knowledge base automatically syncs module slides/content to voice agent
- Includes HTML stripping and content chunking for better AI comprehension

**Key Files**:
- `/app/api/elevenlabs/sync-module/route.ts` - Syncs module to ElevenLabs KB
- `/app/api/elevenlabs/voice-agent/route.ts` - Creates voice session
- `/lib/elevenlabs/knowledge-base.ts` - Content chunking utilities

**Important Notes**:
- Knowledge base requires proper HTML → text conversion (implemented)
- Agent creation uses `agentId` query param, not request body
- Serverless deployment requires direct DB queries (no localhost fetch)
- JSONB fields from Drizzle need type casting (`as any`)

### Deployment Fixes Applied

**Case Sensitivity Issues**:
- Fixed button imports: All imports now use `@/components/ui/Button` (uppercase)
- macOS is case-insensitive, but Linux (Netlify) is case-sensitive
- Files fixed: Hero.tsx, Navigation.tsx, CourseObjectives.tsx, SlideNavigation.tsx, chat-input.tsx, download-button.tsx

**Build Configuration**:
- `next.config.js`: Set `eslint.ignoreDuringBuilds: true` to allow warnings
- ESLint warnings don't fail production builds

**Serverless Compatibility**:
- Changed sync-module route from `fetch(localhost:3000)` to direct DB query
- Uses same pattern as other API routes

## Database Schema

**Key Tables**:
- `users` - User profiles with onboarding, skills, experience
- `modules` - Learning modules with slides (JSONB), objectives, etc.
- `progress` - User progress tracking per module
- `notes` - User notes on specific slides
- `submissions` - User-submitted module ideas
- `waitlist` - Waitlist entries with avatars

**JSONB Fields** (typed as `unknown` by Drizzle):
- `modules.slides` - Array of slide objects
- `modules.learningObjectives` - Array of learning objectives
- `modules.instructor` - Instructor info object
- Cast these with `as any` when needed for type compatibility

## Common Issues & Solutions

### Issue: "fetch failed" in API routes
**Solution**: Don't use `fetch('http://localhost:3000/api/...')` in serverless. Import and call functions directly or query DB.

### Issue: TypeScript errors with JSONB
**Solution**: Cast JSONB fields with `as any` when passing to functions expecting specific types.

### Issue: Build fails with case-sensitive imports
**Solution**: Check git-tracked files (`git ls-files`) vs local files. Use exact casing.

### Issue: ElevenLabs agent creation fails
**Solution**:
- Pass `agentId` as query parameter in requestOptions, not in body
- Use proper parameter names (`name` not `platform.name`)

## Testing Voice AI Locally

1. Ensure `ELEVENLABS_API_KEY` is set in `.env.local`
2. Navigate to any module page (e.g., `/modules/vibe-coding-ai`)
3. Click "AI Assistant" tab
4. Click "Start Voice Mode"
5. If sync needed, click "Sync Module" first

## Production Deployment (Netlify)

### Automatic Deployment
Push to `main` branch triggers automatic Netlify deployment.

### Environment Variables on Netlify
All env vars must be set in Netlify dashboard:
- Settings → Environment variables
- Add same variables as `.env.local`

### Monitor Deployment
- Dashboard: https://app.netlify.com/sites/beforefront/deploys
- Live site: https://beforefront.com

## Git Workflow

Current branch: `main`
- All production code on `main`
- Netlify auto-deploys from `main`
- No feature branches currently in use

## Development Tips

1. **Database changes**: Always run `db:generate` then `db:push` after schema changes
2. **Type safety**: Drizzle JSONB fields need casting - this is expected
3. **Case sensitivity**: Always match file casing in imports exactly
4. **API routes**: Use direct DB queries, not internal fetches
5. **Voice AI**: Test locally before deploying - sync takes time

## Next Steps / TODO

- [ ] Improve voice AI knowledge base chunking for better context retention
- [ ] Add voice session persistence (currently creates new agent each time)
- [ ] Optimize module loading performance
- [ ] Add proper TypeScript types for module/slide interfaces (currently using `as any`)
- [ ] Consider adding voice conversation history display

## Contact & Support

- Production: https://beforefront.com
- GitHub: https://github.com/hennicholson/forefront-usd
- Netlify: Site ID `beforefront`

---

**Last Updated**: November 2024
**Last Major Feature**: ElevenLabs Voice AI Integration
**Last Deployment Fix**: JSONB type casting for sync-module route
