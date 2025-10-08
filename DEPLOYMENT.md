# Forefront Platform - Deployment Guide

## Setup Instructions

### 1. Create Neon Database

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname`)
4. Update `.env.local` with your `DATABASE_URL`

### 2. Run Database Migrations

```bash
npm run db:push
```

This creates all tables in your Neon database.

### 3. Seed Initial Data (Optional)

The platform will work empty. To add initial modules:
1. Log in as admin (email: `admin@forefront.network`, password: `admin123`)
2. Go to `/admin`
3. Use the module creator to add modules

### 4. Deploy to Netlify

#### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to new site
netlify init

# Set environment variables
netlify env:set GEMINI_API_KEY "your-gemini-api-key"
netlify env:set DATABASE_URL "your-neon-connection-string"

# Deploy
netlify deploy --prod
```

#### Option B: Deploy via Netlify Dashboard

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to your GitHub repo
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `DATABASE_URL`: Your Neon connection string
7. Click "Deploy"

### 5. Update Admin Credentials

For security, you should update the admin login credentials:
1. Edit `contexts/AuthContext.tsx`
2. Change the admin email/password check in the `login` function
3. Redeploy

## Database Schema

The platform uses these tables:
- `users` - User accounts
- `modules` - Course modules
- `progress` - User learning progress
- `notes` - User notes per slide
- `submissions` - Student course submissions
- `newsletters` - Weekly newsletters

## API Routes

- `POST /api/generate-module` - Generate module from submission using Gemini
- `GET /api/modules` - Fetch all modules
- `POST /api/modules` - Create new module
- `DELETE /api/modules` - Delete module

## Admin Workflow

1. Students submit courses via `/submit`
2. Admin sees submissions in `/admin`
3. Admin clicks "Auto-Generate with AI"
4. Gemini 2.0 Flash generates structured module
5. Admin reviews and saves
6. Module instantly available to all users

## Environment Variables

```bash
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql://...
```

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Neon (Serverless Postgres)
- **ORM**: Drizzle
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Netlify
- **Auth**: Custom (localStorage-based, can be upgraded)

## Notes

- The platform uses Gemini 2.0 Flash for AI module generation
- All data is persisted in Neon database
- Instant updates across all users
- Admin panel accessible only to admin users
- Students can submit courses, which admins can auto-convert to modules
