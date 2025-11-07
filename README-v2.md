# ForeFront USD v2.0 - Waitlist System

## 🚀 Version 2.0 Features

This version contains the complete waitlist system with AI avatar generation and admin dashboard.

### Major Components:
- **Waitlist Landing Page** (`/waitlist`) - 7-step onboarding flow
- **Admin Dashboard** (`/waitlist/admin`) - Password: `admin12345`
- **PDF Generator** - Student Stack Guide with personalized content
- **AI Avatar Generation** - Using Replicate's nano-banana model
- **Network Visualization** - Floating nodes showing waitlist members

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Replicate API key

### 1. Clone the Repository

```bash
# Clone the specific v2.0 version
git clone https://github.com/hennicholson/forefront-usd.git
cd forefront-usd
git checkout v2.0
```

Or checkout the latest from playground-prototype branch:
```bash
git checkout playground-prototype
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="your-neon-database-url"

# Replicate API for avatar generation
REPLICATE_API_TOKEN="your-replicate-api-key"

# Optional: OpenAI for other features
OPENAI_API_KEY="your-openai-api-key"
```

### 4. Database Setup

Run database migrations:

```bash
npm run db:push
```

The database schema includes:
- Waitlist table with fields for firstName, lastName, email, phone, university, year, aiProficiency, avatarUrl

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/waitlist](http://localhost:3000/waitlist)

## 📁 Project Structure

```
app/
  ├── waitlist/
  │   ├── page.tsx           # Main waitlist landing page
  │   ├── admin/
  │   │   └── page.tsx        # Admin dashboard
  │   └── test/
  │       └── page.tsx        # PDF generator test page
  ├── api/
  │   ├── waitlist/
  │   │   ├── route.ts        # Waitlist API endpoints
  │   │   └── stats/
  │   │       └── route.ts    # Statistics API
  │   ├── generate-avatar/
  │   │   └── route.ts        # AI avatar generation
  │   └── generate-pdf/
  │       └── route.ts        # PDF generation endpoint
  └── (main)/
      └── page.tsx            # Root redirect to /waitlist

components/
  ├── ui/
  │   ├── network-mindmap.tsx     # Network visualization
  │   ├── download-button.tsx     # Animated download button
  │   └── [other UI components]
  └── [other components]

lib/
  ├── db/
  │   └── schema.ts          # Database schema
  └── pdf-generator.ts       # PDF generation service
```

## 🎨 Key Features

### Waitlist Flow
1. Name collection with personalization
2. VSL video integration
3. Contact information
4. University selection (500+ schools database)
5. Year selection
6. AI proficiency slider
7. Headshot upload → AI avatar generation
8. Network visualization
9. PDF download (Student Stack Guide)

### Admin Dashboard Features
- Total signups with growth rate
- Today's signups
- Average AI proficiency
- University distribution
- Year distribution
- Signup trend charts
- User table with search/sort
- Avatar gallery with bulk download
- CSV export

### PDF Generator
- Personalized 5-page guide
- Student discounts information:
  - Google Gemini Advanced (free for students)
  - Perplexity Pro (12 months free with Comet browser)
  - Microsoft 365 Copilot (free with student email)

## 🚀 Deployment

### Netlify Deployment
The project is configured for Netlify deployment:

```bash
# Build command
npm run build

# Deploy to Netlify
netlify deploy --prod
```

Site is live at: https://beforefront.com

## 📝 Important Notes

### Database Fields
Make sure your database has these fields:
- `university` (text, nullable)
- `year` (text, nullable)
- `avatar_url` (text, nullable)

### API Keys Required
- **Replicate API**: For AI avatar generation
- **Neon Database**: For PostgreSQL database
- **OpenAI** (optional): For additional AI features

### Admin Access
- URL: `/waitlist/admin`
- Password: `admin12345`

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Database migrations
npm run db:push
npm run db:studio

# Deploy to Netlify
netlify deploy --prod
```

## 📱 Responsive Design
- Mobile-optimized with smaller network visualization
- Responsive forms and layouts
- Touch-friendly interactions

## 🎯 Version History

### v2.0 (Current)
- Complete waitlist system
- AI avatar generation
- Admin dashboard
- PDF generation
- Network visualization
- 500+ university database
- Deployed to beforefront.com

### v1.0
- Initial ForeFront USD platform
- Course modules
- Basic networking features

## 🤝 Support

For issues or questions about v2.0, check:
- GitHub Issues: https://github.com/hennicholson/forefront-usd/issues
- Current deployment: https://beforefront.com

## 📄 License

Proprietary - ForeFront USD

---

Built with Next.js 15, TypeScript, Tailwind CSS, and Neon PostgreSQL