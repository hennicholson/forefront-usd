import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🔄 Restoring clean Module 1 with simple embedded elements...\n')

const cleanSlides = [
  // SLIDE 1: The Window
  {
    id: 1,
    title: 'The Window Won\'t Stay Open Forever',
    blocks: [
      {
        id: 'window-1-1',
        type: 'text',
        data: {
          html: '<h1>Right Now, You Have An Unfair Advantage</h1>'
        }
      },
      {
        id: 'window-1-2',
        type: 'text',
        data: {
          html: '<p>We\'re living through a unique moment in history. AI tools are dropping every week. Use cases are being discovered in real-time. Traditional education can\'t move fast enough.</p>'
        }
      },
      {
        id: 'window-1-3',
        type: 'text',
        data: {
          html: '<h2>But this advantage is temporary</h2>'
        }
      },
      {
        id: 'window-1-4',
        type: 'text',
        data: {
          html: '<p>Students are young enough to adapt quickly, curious enough to experiment constantly, and positioned perfectly at the intersection of learning and building careers.</p><p>Experts? Still catching up.</p><p>Professors? Updating syllabuses for tools that will be outdated by next semester.</p><p><strong>You? Already in the trenches, figuring it out.</strong></p>'
        }
      },
      {
        id: 'window-1-5',
        type: 'text',
        data: {
          html: '<h2>This window closes fast</h2>'
        }
      },
      {
        id: 'window-1-6',
        type: 'text',
        data: {
          html: '<p>In 2-3 years, everyone will know AI. The early adopter advantage disappears. The students who master these tools <em>now</em> will define the next decade of work.</p><p>That\'s why we\'re here. To stay on the forefront, together.</p>'
        }
      },
      // Simple embedded timeline visualization
      {
        id: 'window-1-viz',
        type: 'codePreview',
        data: {
          html: `<div style="max-width: 500px; margin: 40px auto; padding: 30px; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px solid rgba(0,0,0,0.08);">
  <div style="height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; overflow: hidden; margin-bottom: 30px;">
    <div style="height: 100%; width: 70%; background: rgba(0,0,0,0.7); animation: grow 2s ease-out;"></div>
  </div>
  <div style="display: grid; gap: 12px; font-size: 13px;">
    <div style="padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
      <strong>2022:</strong> ChatGPT launches
    </div>
    <div style="padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
      <strong>2023-24:</strong> AI explosion
    </div>
    <div style="padding: 12px; background: rgba(0,0,0,0.06); border-radius: 8px; border: 2px solid rgba(0,0,0,0.15);">
      <strong>2025:</strong> ⏰ Window is open
    </div>
    <div style="padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px; opacity: 0.5;">
      <strong>2026-27:</strong> Window closes
    </div>
  </div>
</div>
<style>
@keyframes grow { from { width: 0%; } }
</style>`,
          css: 'body { background: transparent; }'
        }
      },
      {
        id: 'window-1-7',
        type: 'note',
        data: {
          text: '💡 <strong>The Forefront Philosophy</strong>: We move at the speed of AI innovation, not academic cycles. If it works, we teach it. If it doesn\'t, we kill it. No fluff.'
        }
      }
    ]
  },

  // SLIDE 2: What Even Is AI?
  {
    id: 2,
    title: 'What Even Is AI? (No Academic Jargon)',
    blocks: [
      {
        id: 'whatis-2-1',
        type: 'text',
        data: {
          html: '<h1>What Is AI Actually Doing?</h1>'
        }
      },
      {
        id: 'whatis-2-2',
        type: 'text',
        data: {
          html: '<p>Forget the textbook definitions. Here\'s what you actually need to know:</p><p><strong>AI is pattern recognition at massive scale.</strong></p>'
        }
      },
      {
        id: 'whatis-2-3',
        type: 'text',
        data: {
          html: '<h2>Think of it like this</h2>'
        }
      },
      {
        id: 'whatis-2-4',
        type: 'text',
        data: {
          html: '<p>You feed an AI billions of examples. It finds patterns. Then it uses those patterns to create new stuff.</p><p>→ Show it a million images of cats → It learns what makes a cat look like a cat → Now it can generate new cats</p><p>→ Show it billions of words → It learns how language works → Now it can write, code, reason</p>'
        }
      },
      // Simple pattern demo
      {
        id: 'whatis-2-viz',
        type: 'codePreview',
        data: {
          html: `<div style="max-width: 450px; margin: 30px auto; padding: 25px; background: rgba(0,0,0,0.02); border-radius: 12px; text-align: center;">
  <div style="font-size: 12px; color: rgba(0,0,0,0.5); margin-bottom: 15px; font-weight: 600;">PATTERN RECOGNITION</div>
  <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
    <div style="padding: 12px 20px; background: rgba(0,0,0,0.05); border-radius: 8px; font-weight: 600;">cat</div>
    <div style="font-size: 20px; color: rgba(0,0,0,0.3);">→</div>
    <div style="padding: 12px 20px; background: rgba(0,0,0,0.05); border-radius: 8px; font-weight: 600;">dog</div>
    <div style="font-size: 20px; color: rgba(0,0,0,0.3);">→</div>
    <div style="padding: 12px 20px; background: rgba(0,0,0,0.1); border: 2px solid rgba(0,0,0,0.2); border-radius: 8px; font-weight: 700;">?</div>
  </div>
  <div style="font-size: 12px; color: rgba(0,0,0,0.6);">AI predicts: <strong>pet, animal, puppy</strong></div>
</div>`,
          css: 'body { background: transparent; }'
        }
      },
      {
        id: 'whatis-2-5',
        type: 'text',
        data: {
          html: '<h2>The breakthrough: Large Language Models (LLMs)</h2>'
        }
      },
      {
        id: 'whatis-2-6',
        type: 'text',
        data: {
          html: '<p>ChatGPT, Claude, Gemini - these are all <strong>Large Language Models</strong>.</p><p>They don\'t "think" like humans. They predict what word comes next based on patterns they\'ve seen. But they\'re so good at it that it <em>feels</em> intelligent.</p>'
        }
      },
      {
        id: 'whatis-2-7',
        type: 'text',
        data: {
          html: '<h2>Why this changes everything</h2>'
        }
      },
      {
        id: 'whatis-2-8',
        type: 'text',
        data: {
          html: '<p>Before: You needed to write exact commands for computers</p><p>Now: You describe what you want in plain English</p><p><strong>Code faster. Write better. Create content. Automate workflows.</strong> All with conversational AI.</p>'
        }
      },
      {
        id: 'whatis-2-9',
        type: 'note',
        data: {
          text: '🎯 <strong>Bottom line</strong>: AI isn\'t magic. It\'s math. Really good math. Understanding this helps you use it better.'
        }
      }
    ]
  },

  // SLIDE 3: The AI Landscape (October 2025)
  {
    id: 3,
    title: 'The AI Landscape (October 2025)',
    blocks: [
      {
        id: 'landscape-3-1',
        type: 'text',
        data: {
          html: '<h1>Where We Are Right Now</h1>'
        }
      },
      {
        id: 'landscape-3-2',
        type: 'text',
        data: {
          html: '<p>October 2025. AI has exploded in the past 3 years. Here\'s the current state:</p>'
        }
      },
      {
        id: 'landscape-3-3',
        type: 'text',
        data: {
          html: '<h2>Text AI (Language Models)</h2>'
        }
      },
      {
        id: 'landscape-3-4',
        type: 'text',
        data: {
          html: '<p><strong>ChatGPT (OpenAI)</strong> - Best for general use, creative writing, brainstorming</p><p><strong>Claude (Anthropic)</strong> - Best for coding, technical work, long documents</p><p><strong>Gemini (Google)</strong> - Massive context windows, great for research</p><p>You\'ll use all three. They each have strengths.</p>'
        }
      },
      {
        id: 'landscape-3-5',
        type: 'text',
        data: {
          html: '<h2>Image AI</h2>'
        }
      },
      {
        id: 'landscape-3-6',
        type: 'text',
        data: {
          html: '<p><strong>Midjourney, DALL-E, Stable Diffusion</strong> - Generate any image from text</p><p><strong>Flux, Seedream</strong> - Hyper-realistic product shots, character consistency</p><p>Professional quality. Instant. No Photoshop skills needed.</p>'
        }
      },
      {
        id: 'landscape-3-7',
        type: 'text',
        data: {
          html: '<h2>Video AI (The New Frontier)</h2>'
        }
      },
      {
        id: 'landscape-3-8',
        type: 'text',
        data: {
          html: '<p><strong>Veo 3, Kling 2.5, Seedance, Wan</strong> - Text-to-video, image-to-video</p><p>This is where things get wild. Generate professional video clips from descriptions. Animate still images. Create entire scenes that never existed.</p><p><strong>This is the cutting edge right now.</strong> Most people don\'t even know this exists yet.</p>'
        }
      },
      // Simple clickable tool cards
      {
        id: 'landscape-3-viz',
        type: 'codePreview',
        data: {
          html: `<div style="max-width: 600px; margin: 30px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
  <a href="https://chat.openai.com" target="_blank" style="padding: 16px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 6px;">TEXT AI</div>
    <div style="font-weight: 700; font-size: 15px;">ChatGPT</div>
  </a>
  <a href="https://claude.ai" target="_blank" style="padding: 16px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 6px;">TEXT AI</div>
    <div style="font-weight: 700; font-size: 15px;">Claude</div>
  </a>
  <a href="https://gemini.google.com" target="_blank" style="padding: 16px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 6px;">TEXT AI</div>
    <div style="font-weight: 700; font-size: 15px;">Gemini</div>
  </a>
  <a href="https://flux.ai" target="_blank" style="padding: 16px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 6px;">IMAGE AI</div>
    <div style="font-weight: 700; font-size: 15px;">Flux</div>
  </a>
  <a href="https://veo.google" target="_blank" style="padding: 16px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 6px;">VIDEO AI</div>
    <div style="font-weight: 700; font-size: 15px;">Veo 3</div>
  </a>
  <a href="https://klingai.com" target="_blank" style="padding: 16px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 6px;">VIDEO AI</div>
    <div style="font-weight: 700; font-size: 15px;">Kling 2.5</div>
  </a>
</div>
<style>
a:hover { background: rgba(0,0,0,0.06) !important; transform: translateY(-2px); }
</style>`,
          css: 'body { background: transparent; }'
        }
      },
      {
        id: 'landscape-3-9',
        type: 'text',
        data: {
          html: '<h2>Audio & Music AI</h2>'
        }
      },
      {
        id: 'landscape-3-10',
        type: 'text',
        data: {
          html: '<p><strong>ElevenLabs</strong> - Clone voices, text-to-speech that sounds human</p><p><strong>Suno, Udio</strong> - Generate full songs from text prompts</p><p>The future of content creation isn\'t just visual. It\'s audio too.</p>'
        }
      },
      {
        id: 'landscape-3-11',
        type: 'note',
        data: {
          text: '⚡ <strong>The pace is insane</strong>: New models drop every week. What\'s state-of-the-art today is outdated in 3 months. That\'s why we update modules in real-time.'
        }
      }
    ]
  },

  // SLIDE 4: Why Students Have The Advantage
  {
    id: 4,
    title: 'Why Students Have The Advantage Right Now',
    blocks: [
      {
        id: 'advantage-4-1',
        type: 'text',
        data: {
          html: '<h1>Why You\'re Positioned Perfectly</h1>'
        }
      },
      {
        id: 'advantage-4-2',
        type: 'text',
        data: {
          html: '<h2>The Professional Struggle</h2>'
        }
      },
      {
        id: 'advantage-4-3',
        type: 'text',
        data: {
          html: '<p>Experienced professionals have <strong>years of ingrained workflows</strong>. They need to unlearn old habits before adopting new ones.</p><p>They\'re busy with full-time jobs. Limited time to experiment.</p><p>Many are skeptical. "This is just a fad." (Spoiler: It\'s not.)</p>'
        }
      },
      {
        id: 'advantage-4-4',
        type: 'text',
        data: {
          html: '<h2>The Student Advantage</h2>'
        }
      },
      {
        id: 'advantage-4-5',
        type: 'text',
        data: {
          html: '<p><strong>Clean slate</strong> - You\'re learning with AI from day one. No old habits to break.</p><p><strong>Time to experiment</strong> - You\'re literally here to learn. Break things. Figure it out.</p><p><strong>Digital natives</strong> - You grew up online. You get it faster.</p><p><strong>Career timing</strong> - You\'ll graduate into an AI-native workforce. Professionals are adapting. You\'re starting fluent.</p>'
        }
      },
      {
        id: 'advantage-4-6',
        type: 'text',
        data: {
          html: '<p>By the time you graduate, AI will be embedded in every industry. You won\'t be "adapting" to AI - you\'ll be fluent in it from day one.</p><p>That\'s a competitive advantage most professionals will never have.</p>'
        }
      },
      {
        id: 'advantage-4-7',
        type: 'note',
        data: {
          text: '🚀 <strong>Real talk</strong>: The students who master AI now will be the ones hiring managers in 5 years. Not exaggerating.'
        }
      }
    ]
  },

  // SLIDE 5: Where AI Actually Applies
  {
    id: 5,
    title: 'Where AI Actually Applies (Every Industry)',
    blocks: [
      {
        id: 'applies-5-1',
        type: 'text',
        data: {
          html: '<h1>It\'s Not Just For Tech</h1>'
        }
      },
      {
        id: 'applies-5-2',
        type: 'text',
        data: {
          html: '<p>AI isn\'t a "computer science thing." It applies to literally every field.</p>'
        }
      },
      {
        id: 'applies-5-3',
        type: 'text',
        data: {
          html: '<h2>Marketing & Advertising</h2><p>Generate ad copy, A/B test variations, analyze campaigns, create visual assets. What used to take weeks now takes hours.</p>'
        }
      },
      {
        id: 'applies-5-4',
        type: 'text',
        data: {
          html: '<h2>Content Creation</h2><p>Video scripts, thumbnails, editing, entire content calendars. Creators are using AI to 10x their output.</p>'
        }
      },
      {
        id: 'applies-5-5',
        type: 'text',
        data: {
          html: '<h2>Software Development</h2><p>Write code 10x faster. Debug in seconds. Ship features in hours instead of weeks.</p>'
        }
      },
      {
        id: 'applies-5-6',
        type: 'text',
        data: {
          html: '<h2>Music Production</h2><p>Generate tracks, mix, master, score videos. No music theory required.</p>'
        }
      },
      {
        id: 'applies-5-7',
        type: 'text',
        data: {
          html: '<h2>Design</h2><p>Logos, mockups, brand systems, UI/UX. AI handles the tedious stuff so you can focus on creative decisions.</p>'
        }
      },
      {
        id: 'applies-5-8',
        type: 'text',
        data: {
          html: '<h2>Business & Finance</h2><p>Analysis, reports, presentations, data visualization. Automate the boring parts.</p>'
        }
      },
      {
        id: 'applies-5-9',
        type: 'text',
        data: {
          html: '<h2>Writing & Communication</h2><p>Articles, social posts, emails, documentation. Not to replace writers - to make them faster.</p>'
        }
      },
      {
        id: 'applies-5-10',
        type: 'note',
        data: {
          text: '💼 <strong>The pattern</strong>: Every industry has tedious, repetitive tasks. AI crushes those. Freeing you up for creative, strategic work. That\'s where the value is.'
        }
      }
    ]
  },

  // SLIDE 6: What Forefront Actually Is
  {
    id: 6,
    title: 'What Forefront Actually Is',
    blocks: [
      {
        id: 'forefront-6-1',
        type: 'text',
        data: {
          html: '<h1>We\'re Not Another Online Course</h1>'
        }
      },
      {
        id: 'forefront-6-2',
        type: 'text',
        data: {
          html: '<h2>Forefront is a student-led AI learning network</h2>'
        }
      },
      {
        id: 'forefront-6-3',
        type: 'text',
        data: {
          html: '<p><strong>Student-Led</strong> - Every module created by students who figured it out last week. Not professors teaching theory from textbooks.</p><p><strong>Always Current</strong> - We update modules as new tools drop. Not once a semester. As it happens. What you learn today is what pros use today.</p><p><strong>Hands-On First</strong> - No theory without practice. Real tools, actual workflows, projects you build immediately. If you can\'t ship it, we don\'t teach it.</p><p><strong>No Gatekeeping</strong> - Found a killer workflow? Share it. Discovered a technique? Teach it. We all win when knowledge flows freely.</p>'
        }
      },
      {
        id: 'forefront-6-4',
        type: 'text',
        data: {
          html: '<h2>The Forefront Network</h2><p>Started at USD. Growing to universities nationwide. Every campus becomes a node in the network. Students teaching students. Knowledge spreading at the speed of AI innovation.</p>'
        }
      },
      {
        id: 'forefront-6-5',
        type: 'note',
        data: {
          text: '📌 <strong>Spread the sauce. No gatekeeping.</strong> - That\'s the whole philosophy. If you figure it out, you teach it. That\'s how we all stay ahead.'
        }
      }
    ]
  },

  // SLIDE 7: The Modules
  {
    id: 7,
    title: 'The Modules: Your Learning Path',
    blocks: [
      {
        id: 'modules-7-1',
        type: 'text',
        data: {
          html: '<h1>What You\'ll Learn at Forefront</h1>'
        }
      },
      {
        id: 'modules-7-2',
        type: 'text',
        data: {
          html: '<h2>Module 02: Vibe Code with AI</h2><p>Build apps 10x faster. Ship features in hours. Turn ideas into working prototypes without memorizing syntax.</p><p><em>Learn: Cursor, v0, Replit, Bolt, Claude for coding</em></p>'
        }
      },
      {
        id: 'modules-7-3',
        type: 'text',
        data: {
          html: '<h2>Module 03: Content Creation with AI</h2><p>Generate video, write scripts, create 30 days of content in 2 hours. Master AI video tools like the pros.</p><p><em>Learn: Veo, Kling, Runway, Luma, video workflows</em></p>'
        }
      },
      {
        id: 'modules-7-4',
        type: 'text',
        data: {
          html: '<h2>Module 04: Marketing with AI</h2><p>Launch campaigns in days. Write copy that converts. Analyze competitors automatically.</p><p><em>Learn: Ad copy, SEO, social media, landing pages</em></p>'
        }
      },
      {
        id: 'modules-7-5',
        type: 'text',
        data: {
          html: '<h2>Module 05: Music Production with AI</h2><p>Compose tracks. Design sound. Score videos. No music theory needed.</p><p><em>Learn: Suno, Udio, audio generation, production</em></p>'
        }
      },
      {
        id: 'modules-7-6',
        type: 'text',
        data: {
          html: '<h2>Module 06: AI Automation</h2><p>Build systems that run 24/7. Automate repetitive tasks. Create custom AI agents.</p><p><em>Learn: n8n, Zapier, Make, custom GPTs, workflow automation</em></p>'
        }
      },
      {
        id: 'modules-7-7',
        type: 'text',
        data: {
          html: '<p><strong>Start anywhere. Move fast.</strong> Modules are designed to be completed in any order. Pick what\'s most relevant to you right now.</p>'
        }
      }
    ]
  },

  // SLIDE 8: Quick Terms
  {
    id: 8,
    title: 'Quick Terms You Need To Know',
    blocks: [
      {
        id: 'terms-8-1',
        type: 'text',
        data: {
          html: '<h1>Essential AI Vocabulary (No Jargon)</h1>'
        }
      },
      {
        id: 'terms-8-2',
        type: 'text',
        data: {
          html: '<p><strong>LLM (Large Language Model)</strong> - The AI that powers ChatGPT, Claude, Gemini. It\'s trained on massive amounts of text.</p>'
        }
      },
      {
        id: 'terms-8-3',
        type: 'text',
        data: {
          html: '<p><strong>Prompt</strong> - The instructions you give to AI. Better prompts = better outputs. This is a skill you\'ll master.</p>'
        }
      },
      {
        id: 'terms-8-4',
        type: 'text',
        data: {
          html: '<p><strong>Context Window</strong> - How much text AI can "remember" at once. Bigger context = smarter conversations.</p>'
        }
      },
      {
        id: 'terms-8-5',
        type: 'text',
        data: {
          html: '<p><strong>Fine-Tuning</strong> - Training AI on your specific data to make it better at your task.</p>'
        }
      },
      {
        id: 'terms-8-6',
        type: 'text',
        data: {
          html: '<p><strong>Inference</strong> - When AI generates an output. Each generation costs compute (and sometimes money).</p>'
        }
      },
      {
        id: 'terms-8-7',
        type: 'text',
        data: {
          html: '<p><strong>Tokens</strong> - AI doesn\'t read words, it reads tokens. ~750 words = 1000 tokens. Matters for pricing and limits.</p>'
        }
      },
      {
        id: 'terms-8-8',
        type: 'text',
        data: {
          html: '<p><strong>Temperature</strong> - Controls AI creativity. Low = factual and consistent. High = wild and experimental.</p>'
        }
      },
      {
        id: 'terms-8-9',
        type: 'text',
        data: {
          html: '<p><strong>Latency</strong> - How fast AI responds. Matters for real-time apps and user experience.</p>'
        }
      },
      {
        id: 'terms-8-10',
        type: 'note',
        data: {
          text: '📖 <strong>Don\'t memorize these</strong> - You\'ll learn them naturally as you use AI tools. This is just a reference.'
        }
      }
    ]
  },

  // SLIDE 9: How to Use AI Without Making Slop
  {
    id: 9,
    title: 'How to Use AI Without Making Slop',
    blocks: [
      {
        id: 'slop-9-1',
        type: 'text',
        data: {
          html: '<h1>AI Can Make You 10x Faster... Or 10x Worse</h1>'
        }
      },
      {
        id: 'slop-9-2',
        type: 'text',
        data: {
          html: '<h2>What is "slop"?</h2><p>Generic, soulless AI-generated content. You can spot it instantly:</p><p>→ Overly formal tone<br/>→ Repetitive phrasing<br/>→ No personality<br/>→ Technically correct but totally boring</p><p><strong>Don\'t make slop.</strong></p>'
        }
      },
      {
        id: 'slop-9-3',
        type: 'text',
        data: {
          html: '<h2>How to avoid it</h2>'
        }
      },
      {
        id: 'slop-9-4',
        type: 'text',
        data: {
          html: '<p><strong>1. Give context</strong> - Don\'t just say "write a blog post." Say "write a casual LinkedIn post for designers about AI tools, keep it under 200 words, conversational tone."</p>'
        }
      },
      {
        id: 'slop-9-5',
        type: 'text',
        data: {
          html: '<p><strong>2. Iterate</strong> - First output is rarely the best. Refine it 3-5 times. "Make it shorter." "Add more examples." "Less formal."</p>'
        }
      },
      {
        id: 'slop-9-6',
        type: 'text',
        data: {
          html: '<p><strong>3. Add your voice</strong> - AI generates the draft. You edit for personality, authenticity, edge. That\'s where the magic is.</p>'
        }
      },
      {
        id: 'slop-9-7',
        type: 'text',
        data: {
          html: '<p><strong>4. Train it on your style</strong> - Feed AI examples of your best work. It learns your voice.</p>'
        }
      },
      {
        id: 'slop-9-8',
        type: 'text',
        data: {
          html: '<p><strong>5. Use AI for speed, not thought</strong> - AI handles the tedious 70%. You add the brilliant 30%. That\'s the ratio.</p>'
        }
      },
      {
        id: 'slop-9-9',
        type: 'note',
        data: {
          text: '⚡ <strong>Golden Rule</strong>: AI amplifies your ideas. It doesn\'t replace your judgment. If you wouldn\'t ship it with your name on it, don\'t use AI as an excuse.'
        }
      }
    ]
  },

  // SLIDE 10: What's Next
  {
    id: 10,
    title: 'What\'s Next: Your First Steps',
    blocks: [
      {
        id: 'next-10-1',
        type: 'text',
        data: {
          html: '<h1>Ready to Start?</h1>'
        }
      },
      {
        id: 'next-10-2',
        type: 'text',
        data: {
          html: '<h2>Action items for this week:</h2>'
        }
      },
      {
        id: 'next-10-3',
        type: 'text',
        data: {
          html: '<p>✅ Create accounts: ChatGPT, Claude, Gemini (free tiers work fine)</p><p>✅ Test the same prompt on all three models. Notice the differences.</p><p>✅ Experiment with prompt engineering. Try being more specific. Less specific. See what happens.</p><p>✅ Pick your first module to dive into next.</p><p>✅ Join the Forefront Discord. Ask questions. Share wins.</p>'
        }
      },
      {
        id: 'next-10-4',
        type: 'text',
        data: {
          html: '<h2>Where to go next</h2>'
        }
      },
      {
        id: 'next-10-5',
        type: 'text',
        data: {
          html: '<p><strong>Want to build?</strong> → Module 02: Vibe Code</p><p><strong>Want to create content?</strong> → Module 03: Content Creation</p><p><strong>Want to market?</strong> → Module 04: Marketing with AI</p><p><strong>Want to make music?</strong> → Module 05: Music Production</p><p><strong>Want to automate everything?</strong> → Module 06: AI Automation</p>'
        }
      },
      {
        id: 'next-10-6',
        type: 'text',
        data: {
          html: '<p><strong>The window is open. Let\'s get to work.</strong></p>'
        }
      },
      {
        id: 'next-10-7',
        type: 'note',
        data: {
          text: '🚀 <strong>Remember</strong>: You don\'t need to be an expert to start. You just need to start. Figure it out as you go. That\'s the Forefront way.'
        }
      }
    ]
  }
]

try {
  await sql`
    UPDATE modules
    SET
      slides = ${JSON.stringify(cleanSlides)},
      updated_at = NOW()
    WHERE module_id = 'module-vibe-coding-2025'
  `

  console.log('✅ Module 1 restored with clean copy and simple embedded elements!')
  console.log('📋 All original text preserved')
  console.log('🎨 3 simple interactive visualizations added')
  console.log('🔗 Clickable tool links embedded')
  console.log('📱 Minimal black/white styling, seamlessly integrated')

} catch (error) {
  console.error('❌ Error:', error)
  process.exit(1)
}
