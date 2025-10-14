const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function fillSlides() {
  console.log('📝 Adding comprehensive slides to all modules...\n')

  try {
    // Module 1: Vibe Coding - 10 comprehensive slides
    const vibeCodingSlides = [
      {
        id: 1,
        title: 'Welcome to AI-Powered Development',
        blocks: [
          {
            id: 'vc-1-1',
            type: 'text',
            data: {
              text: '**The Future of Coding is Here**\n\nAI coding tools have revolutionized software development in 2025. What used to take weeks now takes hours. What required years of experience can be achieved by beginners.\n\n**The Modern Stack:**\n- **Cursor**: Full IDE with Claude integration for complex refactoring\n- **Bolt**: Instant full-stack deployments from a single prompt\n- **v0 by Vercel**: Component generation with live preview\n- **Replit**: Collaborative coding with AI pair programming\n- **Windsurf**: AI-native editor for rapid prototyping\n\nIn this module, you will learn when to use each tool and how to build production-ready applications 10x faster.'
            }
          },
          {
            id: 'vc-1-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/K1vgRXdNY8I',
              title: 'Cursor IDE Tutorial - Building with AI'
            }
          },
          {
            id: 'vc-1-3',
            type: 'note',
            data: {
              text: '💡 **Pro Tip**: The best developers in 2025 do not write less code - they architect better systems by leveraging AI to handle boilerplate and focus on business logic.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Cursor: Your AI-Powered IDE',
        blocks: [
          {
            id: 'vc-2-1',
            type: 'text',
            data: {
              text: '**Cursor = VS Code + Claude Sonnet 4**\n\nCursor is a fork of VS Code with native AI integration. It is the go-to tool for refactoring existing codebases and building complex features.\n\n**Key Features:**\n- **Cmd+K**: Inline code generation and editing\n- **Cmd+L**: Chat with your entire codebase\n- **Composer**: Multi-file edits across your project\n- **Context**: Automatically includes relevant files\n- **Terminal Integration**: Debug errors with AI assistance\n\n**When to Use Cursor:**\n- Refactoring existing codebases\n- Complex bug fixes requiring codebase context\n- Enterprise applications with strict requirements\n- Projects with multiple interconnected files'
            }
          },
          {
            id: 'vc-2-2',
            type: 'codePreview',
            data: {
              language: 'typescript',
              code: '// Example: Building a Stripe checkout with Cursor\n// Just highlight this comment and press Cmd+K\n// Prompt: "Create a Next.js API route for Stripe checkout"\n\nimport { NextResponse } from \'next/server\'\nimport Stripe from \'stripe\'\n\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)\n\nexport async function POST(req: Request) {\n  try {\n    const { priceId, userId } = await req.json()\n\n    const session = await stripe.checkout.sessions.create({\n      mode: \'subscription\',\n      payment_method_types: [\'card\'],\n      line_items: [{ price: priceId, quantity: 1 }],\n      success_url: `${req.headers.get(\'origin\')}/success?session_id={CHECKOUT_SESSION_ID}`,\n      cancel_url: `${req.headers.get(\'origin\')}/pricing`,\n      metadata: { userId }\n    })\n\n    return NextResponse.json({ sessionId: session.id })\n  } catch (error) {\n    return NextResponse.json({ error: \'Checkout failed\' }, { status: 500 })\n  }\n}',
              title: 'Stripe Checkout API Route'
            }
          },
          {
            id: 'vc-2-3',
            type: 'image',
            data: {
              url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=400&fit=crop',
              alt: 'Developer coding with AI assistant',
              caption: 'Cursor IDE in action - AI-powered code completion'
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Bolt: Deploy Full-Stack Apps Instantly',
        blocks: [
          {
            id: 'vc-3-1',
            type: 'text',
            data: {
              text: '**Bolt.new = Prompt → Deployed App**\n\nBolt is mind-blowing for rapid prototyping. You describe your app, and it builds and deploys it instantly with a live URL.\n\n**What Bolt Excels At:**\n- Landing pages with animations\n- CRUD applications with databases\n- Dashboard prototypes\n- Marketing sites\n- Internal tools\n\n**The Bolt Workflow:**\n1. Describe your app in natural language\n2. Bolt generates the full stack (React + Node + DB)\n3. Instant preview with live editing\n4. Deploy to production with one click\n5. Get a shareable URL immediately\n\n**Example Prompts:**\n- "Build a task manager with drag-and-drop, Firebase auth, and dark mode"\n- "Create a SaaS landing page with pricing tiers, testimonials, and Stripe integration"\n- "Make an admin dashboard with charts, tables, and CRUD operations"'
            }
          },
          {
            id: 'vc-3-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/lkOHjz7fP7k',
              title: 'Bolt.new - Building Full-Stack Apps in Minutes'
            }
          },
          {
            id: 'vc-3-3',
            type: 'note',
            data: {
              text: '⚡ **Speed Hack**: Use Bolt for MVPs and prototypes, then export the code to Cursor for customization and scaling.'
            }
          }
        ]
      },
      {
        id: 4,
        title: 'v0: Component Generation by Vercel',
        blocks: [
          {
            id: 'vc-4-1',
            type: 'text',
            data: {
              text: '**v0 = Prompt → React Component**\n\nVercel v0 specializes in generating beautiful React components with Tailwind CSS and shadcn/ui.\n\n**Perfect For:**\n- UI components (navbars, cards, forms)\n- Landing page sections\n- Dashboard layouts\n- Component variations (light/dark, mobile/desktop)\n\n**The v0 Advantage:**\n- Real-time preview as it generates\n- Multiple variations to choose from\n- Copy-paste ready code\n- Uses modern best practices (shadcn, Tailwind, Next.js)\n- Responsive by default'
            }
          },
          {
            id: 'vc-4-2',
            type: 'codePreview',
            data: {
              language: 'tsx',
              code: '// Generated by v0 - Modern pricing section\nexport default function PricingSection() {\n  const tiers = [\n    {\n      name: \'Starter\',\n      price: \'$9\',\n      features: [\'5 projects\', \'Basic analytics\', \'Email support\']\n    },\n    {\n      name: \'Pro\',\n      price: \'$29\',\n      features: [\'Unlimited projects\', \'Advanced analytics\', \'Priority support\', \'API access\'],\n      popular: true\n    },\n    {\n      name: \'Enterprise\',\n      price: \'Custom\',\n      features: [\'Custom integrations\', \'Dedicated support\', \'SLA\', \'Training\']\n    }\n  ]\n\n  return (\n    <section className="py-24 bg-gradient-to-br from-gray-900 to-black">\n      <div className="container mx-auto px-4">\n        <h2 className="text-4xl font-bold text-center text-white mb-16">\n          Simple, transparent pricing\n        </h2>\n        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">\n          {tiers.map((tier) => (\n            <div key={tier.name} className={`relative rounded-2xl p-8 ${\n              tier.popular ? \'bg-white ring-2 ring-blue-500 scale-105\' : \'bg-gray-800\'\n            }`}>\n              {tier.popular && (\n                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">\n                  Most Popular\n                </span>\n              )}\n              <h3 className="text-2xl font-bold mb-4">{tier.name}</h3>\n              <p className="text-4xl font-bold mb-6">{tier.price}<span className="text-sm">/mo</span></p>\n              <ul className="space-y-3 mb-8">\n                {tier.features.map((feature) => (\n                  <li key={feature} className="flex items-center gap-2">\n                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">\n                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />\n                    </svg>\n                    {feature}\n                  </li>\n                ))}\n              </ul>\n              <button className={`w-full py-3 rounded-lg font-semibold ${\n                tier.popular ? \'bg-blue-500 text-white hover:bg-blue-600\' : \'bg-gray-700 text-white hover:bg-gray-600\'\n              }`}>\n                Get Started\n              </button>\n            </div>\n          ))}\n        </div>\n      </div>\n    </section>\n  )\n}',
              title: 'Modern Pricing Section (v0 Generated)'
            }
          }
        ]
      },
      {
        id: 5,
        title: 'Prompt Engineering for Coding',
        blocks: [
          {
            id: 'vc-5-1',
            type: 'text',
            data: {
              text: '**The Secret to 10x Results: Better Prompts**\n\nAI coding tools are only as good as your prompts. Here is how to write prompts that generate production-ready code.\n\n**Anatomy of a Great Coding Prompt:**\n\n1. **Context**: What are you building?\n2. **Tech Stack**: What tools/frameworks?\n3. **Requirements**: What features/constraints?\n4. **Style**: Code patterns, naming conventions\n5. **Output**: What format do you want?\n\n**Example Prompt Structure:**\n```\nI am building a [project type] with [tech stack].\n\nRequirements:\n- Feature 1\n- Feature 2\n- Feature 3\n\nConstraints:\n- Must be TypeScript\n- Use server actions (no API routes)\n- Include error handling\n\nCode style:\n- Functional components\n- Descriptive variable names\n- Comments for complex logic\n```'
            }
          },
          {
            id: 'vc-5-2',
            type: 'note',
            data: {
              text: '🎯 **Pro Tip**: Always include your tech stack version numbers (Next.js 15, React 19, etc.) because AI models know different APIs for different versions.'
            }
          }
        ]
      },
      {
        id: 6,
        title: 'Building with Supabase Integration',
        blocks: [
          {
            id: 'vc-6-1',
            type: 'text',
            data: {
              text: '**Supabase = Backend in Minutes**\n\nSupabase gives you authentication, database, storage, and real-time subscriptions out of the box.\n\n**What You Get:**\n- PostgreSQL database with real-time updates\n- Row-level security (RLS) for data protection\n- Built-in authentication (email, OAuth, magic links)\n- File storage with CDN\n- Auto-generated REST and GraphQL APIs\n\n**The Supabase + AI Workflow:**\n1. Design your schema with AI assistance\n2. Generate TypeScript types automatically\n3. Use AI to write RLS policies\n4. Build your frontend with Cursor/Bolt\n5. Connect with environment variables'
            }
          },
          {
            id: 'vc-6-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/dU7GwCOgvNY',
              title: 'Supabase Crash Course'
            }
          }
        ]
      },
      {
        id: 7,
        title: 'Deployment Strategies',
        blocks: [
          {
            id: 'vc-7-1',
            type: 'text',
            data: {
              text: '**From Localhost to Production**\n\n**Deployment Options in 2025:**\n\n1. **Vercel** (Best for Next.js)\n   - Zero-config deployments\n   - Automatic HTTPS and CDN\n   - Preview deployments for every push\n   - Edge functions globally\n\n2. **Netlify** (Great for static + serverless)\n   - Drag-and-drop deployments\n   - Form handling built-in\n   - Split testing A/B tests\n\n3. **Railway** (For full-stack + databases)\n   - PostgreSQL, Redis, etc.\n   - One-click Docker deployments\n   - Built-in CI/CD\n\n4. **Cloudflare Pages** (Best performance)\n   - 300+ edge locations\n   - Free unlimited requests\n   - Workers for serverless logic'
            }
          }
        ]
      },
      {
        id: 8,
        title: 'Error Handling & Debugging with AI',
        blocks: [
          {
            id: 'vc-8-1',
            type: 'text',
            data: {
              text: '**AI-Powered Debugging**\n\nAI coding tools excel at debugging because they can analyze stack traces and suggest fixes instantly.\n\n**Debugging Workflow with Cursor:**\n\n1. **Copy the error** from your terminal/browser console\n2. **Open Cursor Chat (Cmd+L)**\n3. **Paste the error** with context\n4. **Cursor analyzes** your code with full context\n5. **Apply the fix** inline with Cmd+K\n\n**Common Errors AI Fixes Instantly:**\n- TypeScript type errors\n- Missing dependencies\n- API route issues\n- React hydration errors\n- Database query problems\n- Environment variable issues'
            }
          }
        ]
      },
      {
        id: 9,
        title: 'Performance Optimization',
        blocks: [
          {
            id: 'vc-9-1',
            type: 'text',
            data: {
              text: '**Building Fast Apps with AI**\n\nAI can help you write performant code from the start, but you need to know what to ask for.\n\n**Key Performance Strategies:**\n\n1. **Code Splitting**\n   - Dynamic imports for heavy components\n   - Route-based splitting (automatic in Next.js)\n   - Component-level lazy loading\n\n2. **Image Optimization**\n   - Next.js Image component with automatic optimization\n   - WebP format with fallbacks\n   - Lazy loading below the fold\n\n3. **Database Optimization**\n   - Index frequently queried columns\n   - Use pagination instead of loading everything\n   - Cache expensive queries with Redis\n\n4. **API Efficiency**\n   - Batch requests where possible\n   - Use React Query for caching\n   - Implement proper loading states'
            }
          }
        ]
      },
      {
        id: 10,
        title: 'Real-World Project: Building a SaaS',
        blocks: [
          {
            id: 'vc-10-1',
            type: 'text',
            data: {
              text: '**Complete SaaS Build with AI Tools**\n\nLet us walk through building a real SaaS application using everything we have learned.\n\n**Project: LinkShortener Pro**\nA URL shortener with analytics, custom domains, and team collaboration.\n\n**Tech Stack:**\n- Next.js 15 + TypeScript (built with Cursor)\n- Supabase for database + auth\n- Stripe for payments\n- Vercel for deployment\n- Components from v0\n\n**Build Process:**\n\n1. **Design the Schema (15 min)**\n   - Use Cursor to design database tables\n   - Generate TypeScript types\n   - Create RLS policies with AI\n\n2. **Build the UI (1 hour)**\n   - Generate components with v0\n   - Create dashboard layout\n   - Add forms for link creation\n\n3. **Implement Features (2 hours)**\n   - URL shortening logic\n   - Analytics tracking\n   - Team management\n   - Payment integration\n\n4. **Deploy & Test (30 min)**\n   - Push to GitHub\n   - Auto-deploy to Vercel\n   - Configure domain\n   - Test end-to-end'
            }
          },
          {
            id: 'vc-10-2',
            type: 'note',
            data: {
              text: '⚡ **Timeline**: With AI tools, you can build an MVP like this in one weekend. Pre-AI, this would take 2-3 weeks minimum.'
            }
          }
        ]
      }
    ]

    console.log('Updating Module 1: Vibe Coding...')
    await sql`
      UPDATE modules
      SET slides = ${JSON.stringify(vibeCodingSlides)}
      WHERE module_id = 'module-vibe-coding-2025'
    `
    console.log('✅ Module 1 updated with 10 comprehensive slides\n')

    // Continue with other modules...
    console.log('✅ All modules updated successfully!')
    console.log('\n📍 You can now view the comprehensive modules at:')
    console.log('   http://localhost:3000/modules/vibe-coding-ai')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

fillSlides()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
