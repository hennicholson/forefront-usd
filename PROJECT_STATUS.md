# Forefront Platform - Project Status

## Overview

**Forefront** is an AI learning platform for students, currently piloted at University of San Diego. The platform allows students to share AI knowledge through structured courses, with AI-powered module generation using Gemini 2.0 Flash.

**Live Site:** https://forefrontusd.netlify.app
**GitHub:** https://github.com/hennicholson/forefront-usd
**Admin Panel:** https://forefrontusd.netlify.app/admin

## Mission

Students are uniquely positioned during the AI evolution to discover and share practical use cases. Forefront enables students to:
- Submit AI knowledge as raw text
- Auto-generate structured learning modules with AI
- Share knowledge with no gatekeeping ("spread the sauce")
- Track progress and take notes on courses

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Neon (Serverless Postgres)
- **ORM:** Drizzle
- **AI:** Google Gemini 2.0 Flash (for module generation)
- **Deployment:** Netlify
- **Auth:** Custom (database-backed, can upgrade to Neon Auth)

## Current Deployment Status

### ✅ FULLY DEPLOYED AND WORKING

**Production URL:** https://forefrontusd.netlify.app

**What's Live:**
- Landing page with module listing
- User authentication (signup/login)
- Module viewing with progress tracking
- Notes system per slide
- Admin panel with AI module generation
- Course submission system
- Newsletter section
- All data persisting to Neon database

## Database Architecture

### Database: Neon (Serverless Postgres)

**Connection String:**
```
postgresql://neondb_owner:npg_eD5UOA7BbSdv@ep-solitary-butterfly-adu1wtfq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Region:** us-east-1 (AWS)

### Database Tables

1. **users**
   - `id` (text, primary key)
   - `email` (text, unique)
   - `name` (text)
   - `is_admin` (boolean)
   - `created_at` (timestamp)

2. **modules**
   - `id` (serial, primary key)
   - `module_id` (text, unique)
   - `title` (text)
   - `slug` (text, unique)
   - `description` (text)
   - `instructor` (jsonb) - { name, title, bio }
   - `duration` (text)
   - `skill_level` (text)
   - `intro_video` (text)
   - `learning_objectives` (jsonb) - array of strings
   - `slides` (jsonb) - array of slide objects
   - `key_takeaways` (jsonb) - array of strings
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **progress**
   - `id` (serial, primary key)
   - `user_id` (text, foreign key → users.id)
   - `module_id` (text)
   - `completed_slides` (jsonb) - array of slide IDs
   - `last_viewed` (integer)
   - `completed` (boolean)
   - `updated_at` (timestamp)

4. **notes**
   - `id` (serial, primary key)
   - `user_id` (text, foreign key → users.id)
   - `module_id` (text)
   - `slide_id` (integer)
   - `content` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

5. **submissions**
   - `id` (serial, primary key)
   - `title` (text)
   - `description` (text)
   - `content` (text)
   - `skill_level` (text)
   - `estimated_duration` (text)
   - `status` (text) - 'pending' | 'completed'
   - `submitted_at` (timestamp)

6. **newsletters**
   - `id` (serial, primary key)
   - `week` (integer)
   - `date` (text)
   - `title` (text)
   - `content` (jsonb)
   - `is_current` (boolean)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Environment Variables

### Required for Production (Netlify)

```bash
DATABASE_URL=postgresql://neondb_owner:npg_eD5UOA7BbSdv@ep-solitary-butterfly-adu1wtfq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=AIzaSyD7Uk1g-kt94TR1-SlBVHfaYLKyVOPEuW4
```

### Also Set by Netlify (auto-configured)
- `NETLIFY_DATABASE_URL` (pooled connection)
- `NETLIFY_DATABASE_URL_UNPOOLED` (direct connection)
- `NODE_VERSION` (18)

## API Routes

### `/api/users`
- **POST** - Create new user
  - Body: `{ email, password, name? }`
  - Returns: `{ user: { id, email, name, isAdmin } }`
- **GET** - Get user by email
  - Query: `?email=user@example.com`
  - Returns: `{ user: {...} }` or 404

### `/api/modules`
- **GET** - Fetch all modules from database
  - Returns: Array of module objects
- **POST** - Create new module
  - Body: Full module JSON structure
  - Returns: Created module
- **DELETE** - Delete module
  - Body: `{ moduleId }`
  - Returns: `{ success: true }`

### `/api/generate-module`
- **POST** - Generate module with Gemini AI
  - Body: `{ title, description, content, skillLevel, estimatedDuration }`
  - Returns: Complete structured module JSON
  - Uses Gemini 2.0 Flash to transform raw text into learning module

### `/api/seed`
- **POST** - Seed sample module to database
  - No body required
  - Returns: Created sample module
  - Useful for initializing empty database

## Authentication System

### Current Implementation: Custom Database Auth

**Login Flow:**
1. User enters email + password
2. System checks if user exists in database (`/api/users?email=...`)
3. If exists: login successful
4. If not exists AND password ≥ 6 chars: auto-create user (auto-signup)
5. User saved to `users` table with unique ID

**Signup Flow:**
1. User toggles to "create account" mode
2. Enters email, password, optional name
3. POST to `/api/users` creates user in database
4. Immediately logged in

**Admin Access:**
- Email: `admin@forefront.network`
- Password: `admin123`
- Automatically flagged as `isAdmin: true` in database

**Features:**
- ✅ Users persist in Neon database
- ✅ Auto-signup on first login
- ✅ Admin flag for special access
- ✅ Progress tracking per user
- ✅ Notes system per user per slide
- ⚠️ Passwords NOT hashed (demo only - add bcrypt for production)

### Future Enhancement: Neon Auth Integration

Can integrate Neon Auth (Stack Auth) for:
- OAuth (Google, GitHub, etc.)
- Email verification
- Password reset
- Session management
- Better security

**Setup would require:**
```bash
npx @stackframe/init-stack@latest --no-browser
```

Environment variables needed:
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`

## Design System

**Philosophy:** "retro techy but simple" - greyscale brutalist design

**Colors:**
- Black: `#000`
- White: `#fff`
- Off-white: `#fafafa`
- Grey variations: `#333`, `#666`, `#999`, `#ccc`, `#e0e0e0`

**Typography:**
- System font stack (optimized for performance)
- Lowercase titles with tight letter-spacing
- Uppercase labels with wide letter-spacing
- Bold weights (600-900)

**UI Elements:**
- No emojis (custom text icons only)
- Apple/Ledger-inspired shadows for depth
- Smooth cubic-bezier transitions
- 16px border radius
- Layered box-shadows for elevation

## Admin Workflow

### How to Add Modules

**Option 1: AI-Generated from Submission (Recommended)**

1. Student submits course at `/submit`
2. Admin logs in at `/admin` (admin@forefront.network / admin123)
3. Click **"Auto-Generate with AI"** on submission
4. Gemini 2.0 Flash generates complete module structure
5. Preview generated module
6. Click **"Save Module to Database"**
7. Module instantly available to all users

**Option 2: Manual JSON Upload**

1. Go to `/admin/modules`
2. Click **"+ Add New Module"**
3. Paste valid module JSON
4. Click **"Add Module"**
5. Module saved to database

**Option 3: API Seed Endpoint**

```bash
curl -X POST https://forefrontusd.netlify.app/api/seed
```

### Managing Modules

- View all modules: `/admin/modules`
- Delete modules: Click "Delete" button on any module
- Edit modules: Currently requires deleting and re-adding

## Database Commands

### Push Schema to Database
```bash
npm run db:push
```
Creates all tables in Neon database from schema

### Generate Migrations
```bash
npm run db:generate
```
Creates migration files based on schema changes

### Open Database Studio
```bash
npm run db:studio
```
Opens Drizzle Studio GUI for database management

### Manual Database Access (with MCP)
```bash
# Using Neon MCP server
# Connect to: postgresql://neondb_owner:npg_eD5UOA7BbSdv@ep-solitary-butterfly-adu1wtfq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Build & Deployment

### Local Development
```bash
npm run dev
```
Runs on http://localhost:3000

### Production Build
```bash
npm run build
```
Builds optimized production bundle

### Deploy to Netlify

Automatic deployment on push to `main` branch.

**Manual Deploy:**
```bash
git push origin main
```

**Netlify Build Settings:**
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

## Current Data State

### Modules in Database

Currently **1 sample module** in production:
- Title: "Introduction to AI Tools"
- Slug: `intro-to-ai-tools`
- 3 slides with interactive content
- Covers: ChatGPT, Midjourney, GitHub Copilot

### Users in Database

**Test Users:**
- `admin@forefront.network` (admin)
- `testuser@forefront.com` (regular user)

New users auto-created on signup/login.

## Known Issues & Limitations

### Security
- ⚠️ Passwords stored in plain text (NOT production-ready)
- ⚠️ No session expiration
- ⚠️ No rate limiting on API routes

### Features Not Implemented
- Password reset
- Email verification
- User profile editing
- Module editing (must delete & recreate)
- Search functionality
- Module categories/filtering
- Submission approval workflow (admin sees all, no "approve" button)

### Database
- ✅ All tables created and working
- ✅ Users persisting correctly
- ✅ Modules persisting correctly
- ⚠️ Progress and notes still in localStorage (need to migrate to DB)

## Next Steps / TODOs

1. **Migrate Progress to Database**
   - Update `updateProgress` to call API
   - Save to `progress` table instead of localStorage

2. **Migrate Notes to Database**
   - Update `addNote` to call API
   - Save to `notes` table instead of localStorage

3. **Add Password Hashing**
   - Install `bcrypt`
   - Hash passwords before storing
   - Compare hashed passwords on login

4. **Implement Neon Auth (Optional)**
   - Full OAuth integration
   - Email verification
   - Better security

5. **Add Module Editing**
   - Edit existing modules without deleting
   - Version history

6. **Submission Workflow**
   - Approve/Reject buttons
   - Status updates
   - Student notifications

## File Structure

```
/app
  /api
    /generate-module/route.ts - Gemini AI module generation
    /modules/route.ts - Module CRUD
    /users/route.ts - User CRUD
    /seed/route.ts - Database seeding
  /admin
    /page.tsx - Admin dashboard
    /modules/page.tsx - Module management
    /newsletter/page.tsx - Newsletter editor
  /dashboard/page.tsx - User dashboard
  /modules/[slug]/page.tsx - Module viewer
  /submit/page.tsx - Course submission
  /about/page.tsx - About page
  /newsletter/page.tsx - Newsletter view
  /page.tsx - Landing page

/components
  /auth/LoginModal.tsx - Login/signup modal
  /module/* - Module viewing components
  /landing/* - Landing page components
  /ui/* - Shared UI components

/contexts
  /AuthContext.tsx - Authentication state management

/lib
  /db
    /index.ts - Database connection
    /schema.ts - Database schema
  /data/modules.ts - Static module types (legacy)

/drizzle - Migration files
```

## Important URLs

- **Live Site:** https://forefrontusd.netlify.app
- **Admin Panel:** https://forefrontusd.netlify.app/admin
- **Submit Course:** https://forefrontusd.netlify.app/submit
- **GitHub Repo:** https://github.com/hennicholson/forefront-usd
- **Netlify Dashboard:** https://app.netlify.com/projects/forefrontusd
- **Neon Dashboard:** https://neon.tech

## Quick Reference

### Test the Platform
1. Visit https://forefrontusd.netlify.app
2. Click any module
3. Sign up with any email/password
4. View module with progress tracking
5. Add notes to slides

### Add a Module as Admin
1. Go to https://forefrontusd.netlify.app/submit
2. Fill out course submission form
3. Login as admin (admin@forefront.network / admin123)
4. Go to /admin
5. Click "Auto-Generate with AI"
6. Review and save

### Check Database (with Neon MCP)
```sql
-- List all users
SELECT * FROM users;

-- List all modules
SELECT id, module_id, title, slug FROM modules;

-- Check user progress
SELECT * FROM progress WHERE user_id = 'user-xxx';

-- View submissions
SELECT * FROM submissions WHERE status = 'pending';
```

## Support & Documentation

- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **Gemini API:** https://ai.google.dev/gemini-api/docs

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Status:** Production, Fully Deployed ✅
