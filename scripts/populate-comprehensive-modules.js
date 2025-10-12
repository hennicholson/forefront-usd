const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function populateModules() {
  console.log('🔄 Populating database with comprehensive modules...\n')

  try {
    // First, delete old placeholder modules
    await sql`DELETE FROM modules WHERE module_id IN ('module-1', 'module-2', 'module-3', 'module-4', 'module-5')`
    console.log('✅ Cleared old placeholder modules\n')

    // Module 1: Vibe Coding with AI - with comprehensive slides
    const module1Slides = [
      {
        id: 1,
        title: 'Welcome to AI-Powered Development',
        blocks: [
          {
            id: 'vc-1-1',
            type: 'text',
            data: {
              text: '**The Future of Coding is Here**\n\nAI coding tools have revolutionized software development in 2025. What used to take weeks now takes hours. In this module, you will master:\n\n- **Cursor**: Full IDE with Claude integration for complex refactoring\n- **Bolt**: Instant full-stack deployments from a single prompt\n- **v0 by Vercel**: Component generation with live preview\n- **Replit**: Collaborative coding with AI pair programming\n\nBy the end of this course, you will be building production-ready applications 10x faster than traditional methods.'
            }
          },
          {
            id: 'vc-1-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/K1vgRXdNY8I',
              title: 'Cursor IDE Tutorial - Building with AI'
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
              text: '**Cursor = VS Code + Claude Sonnet 4**\n\nCursor is a fork of VS Code with native AI integration.\n\n**Key Features:**\n- **Cmd+K**: Inline code generation\n- **Cmd+L**: Chat with codebase\n- **Composer**: Multi-file edits\n- **Context**: Auto-includes relevant files'
            }
          },
          {
            id: 'vc-2-2',
            type: 'codePreview',
            data: {
              language: 'typescript',
              code: `// Building a Next.js API route with Cursor\nimport { NextResponse } from 'next/server'\n\nexport async function POST(req: Request) {\n  const { email } = await req.json()\n  // AI can generate the rest...\n  return NextResponse.json({ success: true })\n}`,
              title: 'Next.js API Route Example'
            }
          }
        ]
      }
    ]

    await sql`
      INSERT INTO modules (
        module_id, slug, title, description, instructor, duration,
        skill_level, intro_video, learning_objectives, slides,
        key_takeaways, display_order
      ) VALUES (
        'module-vibe-coding-2025',
        'vibe-coding-ai',
        'Vibe Coding with AI - Build Apps 10x Faster',
        'Master Cursor, Bolt, v0, Replit, and Windsurf to build production apps at lightning speed in 2025',
        ${JSON.stringify({ name: 'Alex Rivera', photo: 'https://i.pravatar.cc/150?img=33', year: 'Senior', major: 'Computer Science' })},
        '3 hours',
        'Beginner',
        'https://www.youtube.com/embed/K1vgRXdNY8I',
        ${JSON.stringify(['Choose the right AI coding tool', 'Build full-stack apps with Cursor', 'Rapid prototype with Bolt and v0', 'Deploy production-ready applications'])},
        ${JSON.stringify(module1Slides)},
        ${JSON.stringify(['Cursor is best for professional development', 'Bolt excels at rapid prototyping', 'v0 generates perfect UI components'])},
        1
      )
    `
    console.log('✅ Added Module 1: Vibe Coding with AI\n')

    // Module 2: Marketing with AI
    const module2Slides = [
      {
        id: 1,
        title: 'AI Marketing Revolution',
        blocks: [
          {
            id: 'ma-1-1',
            type: 'text',
            data: {
              text: '**Marketing in 2025: AI-First Strategies**\n\nAI has fundamentally changed marketing. Tasks that required agencies now take hours.\n\n**What You Will Master:**\n- ChatGPT for copywriting\n- Automated email sequences\n- Social media content at scale\n- Competitor analysis with AI\n- Complete marketing funnels'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Copywriting with ChatGPT',
        blocks: [
          {
            id: 'ma-2-1',
            type: 'text',
            data: {
              text: '**AI Copywriting Frameworks**\n\n**AIDA Framework:**\n- Attention: Hook the reader\n- Interest: Build engagement\n- Desire: Create want\n- Action: Clear CTA\n\n**PAS Framework:**\n- Problem: Identify pain\n- Agitate: Make it worse\n- Solve: Present solution'
            }
          }
        ]
      }
    ]

    await sql`
      INSERT INTO modules (
        module_id, slug, title, description, instructor, duration,
        skill_level, intro_video, learning_objectives, slides,
        key_takeaways, display_order
      ) VALUES (
        'module-marketing-ai-2025',
        'marketing-with-ai',
        'Marketing with AI - Strategies That Convert',
        'Master ChatGPT, Claude, and automated marketing strategies that drive real results in 2025',
        ${JSON.stringify({ name: 'Sarah Chen', photo: 'https://i.pravatar.cc/150?img=45', year: 'Junior', major: 'Marketing' })},
        '2.5 hours',
        'Beginner',
        'https://www.youtube.com/embed/JTxsNm9IdYU',
        ${JSON.stringify(['Create converting copy with AI', 'Build automated email sequences', 'Design high-converting landing pages', 'Automate social media'])},
        ${JSON.stringify(module2Slides)},
        ${JSON.stringify(['AI copywriting using AIDA and PAS frameworks', 'Automated email sequences save 10+ hours/week', 'Complete funnels built in days'])},
        2
      )
    `
    console.log('✅ Added Module 2: Marketing with AI\n')

    // Module 3: Content Creation
    await sql`
      INSERT INTO modules (
        module_id, slug, title, description, instructor, duration,
        skill_level, intro_video, learning_objectives, slides,
        key_takeaways, display_order
      ) VALUES (
        'module-content-creation-2025',
        'content-creation-ai',
        'Content Creation with AI - Create in Minutes',
        'Master Google Veo 3, Midjourney, HeyGen, and Descript to create professional content at scale',
        ${JSON.stringify({ name: 'Marcus Wu', photo: 'https://i.pravatar.cc/150?img=58', year: 'Senior', major: 'Film & Media' })},
        '2 hours',
        'Beginner',
        'https://www.youtube.com/embed/example3',
        ${JSON.stringify(['Generate video content with AI', 'Create stunning visuals', 'Edit videos automatically', 'Scale content production'])},
        ${JSON.stringify([{ id: 1, title: 'AI Content Tools Overview', blocks: [{ id: 'cc-1-1', type: 'text', data: { text: 'Master the latest AI content creation tools for 2025' }}]}])},
        ${JSON.stringify(['AI video generation is production-ready', 'Midjourney for professional visuals', 'Automate video editing workflows'])},
        3
      )
    `
    console.log('✅ Added Module 3: Content Creation with AI\n')

    // Module 4: Music Production
    await sql`
      INSERT INTO modules (
        module_id, slug, title, description, instructor, duration,
        skill_level, intro_video, learning_objectives, slides,
        key_takeaways, display_order
      ) VALUES (
        'module-music-production-2025',
        'music-production-ai',
        'Music Production with AI - Compose with AI Tools',
        'Master Suno Studio, Udio, AIVA, and LANDR to create professional music productions',
        ${JSON.stringify({ name: 'DJ Nova', photo: 'https://i.pravatar.cc/150?img=68', year: 'Graduate', major: 'Music Production' })},
        '2.5 hours',
        'Beginner',
        'https://www.youtube.com/embed/example4',
        ${JSON.stringify(['Create professional tracks with AI', 'Generate music from text prompts', 'Master audio stems and mixing', 'Deploy music to streaming'])},
        ${JSON.stringify([{ id: 1, title: 'AI Music Generation', blocks: [{ id: 'mp-1-1', type: 'text', data: { text: 'Learn to create professional music with AI tools like Suno and Udio' }}]}])},
        ${JSON.stringify(['Suno creates broadcast-quality music', 'Udio offers professional stem export', 'AI music is indistinguishable from human'])},
        4
      )
    `
    console.log('✅ Added Module 4: Music Production with AI\n')

    // Module 5: AI Automation
    await sql`
      INSERT INTO modules (
        module_id, slug, title, description, instructor, duration,
        skill_level, intro_video, learning_objectives, slides,
        key_takeaways, display_order
      ) VALUES (
        'module-ai-automation-2025',
        'ai-automation',
        'AI Automation - Automate Anything',
        'Master n8n, Zapier AI, Make, and LangChain to automate complex workflows and build AI agents',
        ${JSON.stringify({ name: 'Taylor Swift', photo: 'https://i.pravatar.cc/150?img=70', year: 'Senior', major: 'Computer Engineering' })},
        '3 hours',
        'Intermediate',
        'https://www.youtube.com/embed/example5',
        ${JSON.stringify(['Build no-code automation workflows', 'Create custom AI agents', 'Integrate multiple APIs', 'Deploy production automations'])},
        ${JSON.stringify([{ id: 1, title: 'Introduction to AI Automation', blocks: [{ id: 'aa-1-1', type: 'text', data: { text: 'Automate your entire workflow with AI-powered tools' }}]}])},
        ${JSON.stringify(['n8n is best for complex workflows', 'Zapier AI adds intelligence to automations', 'Build custom AI agents with LangChain'])},
        5
      )
    `
    console.log('✅ Added Module 5: AI Automation\n')

    console.log('🎉 All comprehensive modules added successfully!')
    console.log('📍 Modules are now live at:')
    console.log('   - /modules/vibe-coding-ai')
    console.log('   - /modules/marketing-with-ai')
    console.log('   - /modules/content-creation-ai')
    console.log('   - /modules/music-production-ai')
    console.log('   - /modules/ai-automation')

  } catch (error) {
    console.error('❌ Error populating modules:', error)
    throw error
  }
}

populateModules()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
