import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🔄 Filling Module 3: AI Content Creation...\n')

// Get the content creation module
const moduleRecord = await sql`
  SELECT * FROM modules WHERE module_id = 'module-content-creation-2025' LIMIT 1
`.then(r => r[0])

console.log(`Found module: ${moduleRecord.title} (ID: ${moduleRecord.id})`)

const newSlides = [
  // SLIDE 1: Building Your AI Stack
  {
    id: 1,
    title: 'Building Your AI Video Stack',
    blocks: [
      {
        id: 'stack-1-1',
        type: 'text',
        data: {
          html: '<h1>Professional AI Video Creation</h1>'
        }
      },
      {
        id: 'stack-1-2',
        type: 'text',
        data: {
          html: '<p>Here\'s the reality: professional AI video is <strong>never</strong> made with just one tool. You need a stack.</p>'
        }
      },
      {
        id: 'stack-1-3',
        type: 'text',
        data: {
          html: '<h2>Stop Making AI Slop</h2>'
        }
      },
      {
        id: 'stack-1-4',
        type: 'text',
        data: {
          html: '<p>Everyone can spot bad AI content now. Overly smooth skin. Perfect lighting. No texture. It screams "I used AI."</p><p>But pros? Their work looks real. Because they understand the stack.</p>'
        }
      },
      {
        id: 'stack-1-5',
        type: 'text',
        data: {
          html: '<h2>Your Essential Platforms</h2>'
        }
      },
      {
        id: 'stack-1-6',
        type: 'text',
        data: {
          html: '<p><strong>Replicate.com</strong> - Swiss army knife for experimental models (Kling, Wan, Seedance)</p><p><strong>Fal.ai</strong> - 4-10x faster inference (Flux Kontext, Kling 2.5 Turbo)</p><p><strong>Claude.ai</strong> - Your creative director and prompt engineer</p>'
        }
      },
      {
        id: 'stack-1-7',
        type: 'text',
        data: {
          html: '<h2>What You\'ll Learn</h2>'
        }
      },
      {
        id: 'stack-1-8',
        type: 'text',
        data: {
          html: '<p>→ Building your complete AI video stack<br/>→ Choosing the right model for each job<br/>→ Professional organization systems<br/>→ Pricing and cost tracking<br/>→ Character consistency workflows<br/>→ Real client workflows from start to finish</p>'
        }
      },
      {
        id: 'stack-1-9',
        type: 'note',
        data: {
          text: '💡 <strong>The truth</strong>: Prompt packs and "secrets" are like Premiere Pro shortcuts. The real value is understanding the entire workflow.'
        }
      }
    ]
  },

  // SLIDE 2: Image Models (The Foundation)
  {
    id: 2,
    title: 'Image Models: The Foundation',
    blocks: [
      {
        id: 'image-2-1',
        type: 'text',
        data: {
          html: '<h1>If The First Frame Is Slop, The Whole Video Is Slop</h1>'
        }
      },
      {
        id: 'image-2-2',
        type: 'text',
        data: {
          html: '<p>Your video is only as good as the image you start with. This is where most people fail.</p>'
        }
      },
      {
        id: 'image-2-3',
        type: 'text',
        data: {
          html: '<h2>Adding Authenticity</h2>'
        }
      },
      {
        id: 'image-2-4',
        type: 'text',
        data: {
          html: '<p>AI defaults to magazine perfection. That\'s the problem. Real life has:</p><p>→ <strong>Film grain</strong> - Breaks digital perfection<br/>→ <strong>Visible skin pores</strong> - Human faces need texture<br/>→ <strong>Dust particles</strong> - Floating in light, adds depth<br/>→ <strong>Light trails</strong> - Lens flares, subtle aberrations</p>'
        }
      },
      {
        id: 'image-2-5',
        type: 'text',
        data: {
          html: '<h2>Top Image Models (October 2025)</h2>'
        }
      },
      {
        id: 'image-2-6',
        type: 'text',
        data: {
          html: '<p><strong>Hyper-Realism & Product Shots</strong><br/>Flux Kontext Max, Ideogram v3, Seedream 4</p><p><strong>Character Consistency</strong><br/>Flux Kontext Pro, Seedream 4, Ideogram v3</p><p><strong>Image Editing</strong><br/>Qwen Image Edit, Nano Banana, SeedEdit 3.0</p>'
        }
      },
      {
        id: 'image-2-7',
        type: 'text',
        data: {
          html: '<h2>The 5-Point Image Check</h2>'
        }
      },
      {
        id: 'image-2-8',
        type: 'text',
        data: {
          html: '<p>Before you animate, verify:</p><p>1. <strong>Composition</strong> - Cinematography, framing<br/>2. <strong>Lighting</strong> - Mood, atmosphere<br/>3. <strong>Texture</strong> - Realism, film grain, imperfections<br/>4. <strong>Subject clarity</strong> - Is it clear what we\'re looking at?<br/>5. <strong>Emotion</strong> - Does it have the right vibe?</p>'
        }
      },
      {
        id: 'image-2-9',
        type: 'note',
        data: {
          text: '⚡ <strong>Pro tip</strong>: Add "visible skin pores, film grain, dust particles in light" to every prompt. Instant authenticity boost.'
        }
      }
    ]
  },

  // SLIDE 3: Video Models (October 2025)
  {
    id: 3,
    title: 'Video Models: The Current Landscape',
    blocks: [
      {
        id: 'video-3-1',
        type: 'text',
        data: {
          html: '<h1>October 2025: Video Model Landscape</h1>'
        }
      },
      {
        id: 'video-3-2',
        type: 'text',
        data: {
          html: '<p>Each model has a specialty. Pros know when to use which.</p>'
        }
      },
      {
        id: 'video-3-3',
        type: 'text',
        data: {
          html: '<h2>Veo 3 (Google DeepMind)</h2>'
        }
      },
      {
        id: 'video-3-4',
        type: 'text',
        data: {
          html: '<p><strong>Best for</strong>: Corporate work, polished brand content, native audio</p><p><strong>Strengths</strong>: Cinematic quality, native audio generation (dialogue/sfx/music), physics simulation, 1080p HD, vertical 9:16 support</p><p><strong>Limitations</strong>: Strict guardrails, expensive ($249.99/month Ultra or Vertex AI), 8-10 second max</p><p><strong>When to use</strong>: Safe corporate content, audio-driven stories, brand campaigns</p>'
        }
      },
      {
        id: 'video-3-5',
        type: 'text',
        data: {
          html: '<h2>Kling 2.5 Turbo Pro</h2>'
        }
      },
      {
        id: 'video-3-6',
        type: 'text',
        data: {
          html: '<p><strong>Best for</strong>: Complex motion, action sequences, sports</p><p><strong>Strengths</strong>: Industry-leading motion quality (285% win vs seedance mini), physics-accurate, advanced camera control, 30% cheaper than 2.1</p><p><strong>Limitations</strong>: No native audio, requires separate audio workflow</p><p><strong>When to use</strong>: Dynamic action, complex choreography, cinematic camera moves</p>'
        }
      },
      {
        id: 'video-3-7',
        type: 'text',
        data: {
          html: '<h2>Seedance 1.0 Pro (ByteDance)</h2>'
        }
      },
      {
        id: 'video-3-8',
        type: 'text',
        data: {
          html: '<p><strong>Best for</strong>: Multi-shot storytelling, narrative coherence</p><p><strong>Strengths</strong>: Native multi-shot transitions, maintains character/style consistency across scenes, tops leaderboards for T2V/I2V, 40s generation time</p><p><strong>Limitations</strong>: No native audio yet, newer model (June 2025 release)</p><p><strong>When to use</strong>: Complex narratives with scene transitions, storytelling sequences</p>'
        }
      },
      {
        id: 'video-3-9',
        type: 'text',
        data: {
          html: '<h2>Wan 2.5 (Alibaba)</h2>'
        }
      },
      {
        id: 'video-3-10',
        type: 'text',
        data: {
          html: '<p><strong>Best for</strong>: Audio reference, multilingual, budget-conscious</p><p><strong>Strengths</strong>: Native audio-video sync, upload custom audio reference, lip-sync, 4K resolution, multilingual support, cheaper than Veo 3, 10s max</p><p><strong>Limitations</strong>: Less consistent than Veo 3, occasional stitching artifacts</p><p><strong>When to use</strong>: Dialogue-driven content, non-English projects, tight budgets</p>'
        }
      },
      {
        id: 'video-3-11',
        type: 'note',
        data: {
          text: '🎯 <strong>Strategic switching</strong>: Amateurs stick to one model. Pros use Veo 3 for corporate, Kling for action, Seedance for narratives, Wan for budget audio sync.'
        }
      }
    ]
  },

  // SLIDE 4: Organization & Inspiration
  {
    id: 4,
    title: 'Organization Systems: Chaos Kills Creativity',
    blocks: [
      {
        id: 'org-4-1',
        type: 'text',
        data: {
          html: '<h1>You Can\'t Make Money If You Can\'t Find Your Assets</h1>'
        }
      },
      {
        id: 'org-4-2',
        type: 'text',
        data: {
          html: '<h2>Amateur vs Professional</h2>'
        }
      },
      {
        id: 'org-4-3',
        type: 'text',
        data: {
          html: '<p><strong>Amateur</strong>:<br/>→ Downloads folder chaos<br/>→ No idea what costs what<br/>→ Can\'t recreate yesterday\'s character<br/>→ Loses client\'s brand colors<br/>→ Starts from scratch every time</p><p><strong>Professional</strong>:<br/>→ Organized folder structure<br/>→ Tracks every generation cost<br/>→ Character consistency library<br/>→ Client context profiles saved<br/>→ Reusable prompt templates</p>'
        }
      },
      {
        id: 'org-4-4',
        type: 'text',
        data: {
          html: '<h2>The 4-Folder System</h2>'
        }
      },
      {
        id: 'org-4-5',
        type: 'text',
        data: {
          html: '<p>📁 <strong>Characters</strong> - Faces, people, brand mascots</p><p>📁 <strong>Worlds</strong> - Locations, environments, settings</p><p>📁 <strong>Styles</strong> - Visual aesthetics, brand looks</p><p>📁 <strong>Objects</strong> - Products, props, details</p><p><strong>Why this works</strong>: When a client says "use that character from the last video" — you know exactly where to find it.</p>'
        }
      },
      {
        id: 'org-4-6',
        type: 'text',
        data: {
          html: '<h2>Context Profiles</h2>'
        }
      },
      {
        id: 'org-4-7',
        type: 'text',
        data: {
          html: '<p>A structured text file that documents everything needed to recreate an asset.</p><p>Include:<br/>→ Use case & intention<br/>→ Visual details & full prompt<br/>→ Model & settings used<br/>→ What works & what to avoid<br/>→ Possible variations</p><p><strong>Pro tip</strong>: Use Claude to build these profiles. It structures them properly and catches details you\'d miss.</p>'
        }
      },
      {
        id: 'org-4-8',
        type: 'note',
        data: {
          text: '💡 <strong>The compound effect</strong>: Every project builds your library. After 10 projects, you have 10 proven frameworks. After 50, you\'re unstoppable.'
        }
      }
    ]
  },

  // SLIDE 5: Cost Tracking & Pricing
  {
    id: 5,
    title: 'Cost Tracking & Pricing Strategy',
    blocks: [
      {
        id: 'cost-5-1',
        type: 'text',
        data: {
          html: '<h1>Know Your Numbers Or Lose Money</h1>'
        }
      },
      {
        id: 'cost-5-2',
        type: 'text',
        data: {
          html: '<h2>Why Professionals Track Every Generation</h2>'
        }
      },
      {
        id: 'cost-5-3',
        type: 'text',
        data: {
          html: '<p><strong>Without tracking</strong>: "I spent... uh... maybe $50 this month? No idea which client cost what. Can\'t tell the client what overages cost. Just hoping I didn\'t lose money."</p><p><strong>With tracking</strong>: "Client A cost $47.80 across 23 generations. I can show them line-by-line costs. Extra revisions? That\'ll be $12 more. Transparent, professional, profitable."</p>'
        }
      },
      {
        id: 'cost-5-4',
        type: 'text',
        data: {
          html: '<h2>The Generation Tracking Spreadsheet</h2>'
        }
      },
      {
        id: 'cost-5-5',
        type: 'text',
        data: {
          html: '<p>Track every generation with:</p><p>→ Date<br/>→ Client name<br/>→ Type (image/video)<br/>→ Model used<br/>→ Platform (Replicate/Fal.ai)<br/>→ Cost<br/>→ Notes</p>'
        }
      },
      {
        id: 'cost-5-6',
        type: 'text',
        data: {
          html: '<h2>Pricing Strategy</h2>'
        }
      },
      {
        id: 'cost-5-7',
        type: 'text',
        data: {
          html: '<p>1. <strong>Track real costs</strong> - Know your average project costs $30-80 in generations</p><p>2. <strong>Add your time</strong> - 3-5 hours of creative work at your hourly rate</p><p>3. <strong>Markup for revisions</strong> - Build in 20-30% buffer for client changes</p><p>4. <strong>Transparent upcharges</strong> - Extra revisions? Show them the cost breakdown</p>'
        }
      },
      {
        id: 'cost-5-8',
        type: 'text',
        data: {
          html: '<h2>Example Pricing Breakdown</h2>'
        }
      },
      {
        id: 'cost-5-9',
        type: 'text',
        data: {
          html: '<p>AI Generation Costs: <strong>$45</strong><br/>Creative Direction (4 hours @ $50/hr): <strong>$200</strong><br/>Revisions Buffer (25%): <strong>$50</strong></p><p><strong>Project Total: $295</strong></p>'
        }
      },
      {
        id: 'cost-5-10',
        type: 'note',
        data: {
          text: '💼 <strong>Transparency = client trust</strong>: When you can show line-by-line costs, clients understand the value. When you say "it costs what it costs" — they think you\'re hiding something.'
        }
      }
    ]
  },

  // SLIDE 6: The Soft Spiral Method
  {
    id: 6,
    title: 'The Soft Spiral: Never Start With A Blank Canvas',
    blocks: [
      {
        id: 'spiral-6-1',
        type: 'text',
        data: {
          html: '<h1>Don\'t Copy, But Don\'t Reinvent The Wheel</h1>'
        }
      },
      {
        id: 'spiral-6-2',
        type: 'text',
        data: {
          html: '<h2>History + AI = Something New</h2>'
        }
      },
      {
        id: 'spiral-6-3',
        type: 'text',
        data: {
          html: '<p>Take what\'s worked in the past (your client work, successful references, proven aesthetics) and remix it with AI\'s capabilities.</p><p>You\'re not copying — you\'re evolving.</p>'
        }
      },
      {
        id: 'spiral-6-4',
        type: 'text',
        data: {
          html: '<h2>Visual Search Systems</h2>'
        }
      },
      {
        id: 'spiral-6-5',
        type: 'text',
        data: {
          html: '<p><strong>Pinterest boards</strong> - One for each style/mood</p><p><strong>Instagram saves</strong> - Tag by project type</p><p><strong>Behance collections</strong> - High-end references</p><p><strong>Your past work</strong> - What worked before</p>'
        }
      },
      {
        id: 'spiral-6-6',
        type: 'text',
        data: {
          html: '<h2>Reference Library Strategy</h2>'
        }
      },
      {
        id: 'spiral-6-7',
        type: 'text',
        data: {
          html: '<p>Save 3-5 references per project. Not to copy directly, but to understand the vibe.</p><p>Feed them to Claude: "Make this aesthetic but different"</p>'
        }
      },
      {
        id: 'spiral-6-8',
        type: 'text',
        data: {
          html: '<h2>Mining Your Previous Client Work</h2>'
        }
      },
      {
        id: 'spiral-6-9',
        type: 'text',
        data: {
          html: '<p>From every project, save:</p><p>→ Final deliverables the client loved<br/>→ The prompts/settings that created them<br/>→ Client feedback notes<br/>→ What they specifically called out as great<br/>→ Brand guidelines they provided</p><p><strong>How to reuse it</strong>: New client in same industry? Start with what worked before. Coffee brand loved warm morning tones? Use that as your baseline for the next coffee client.</p>'
        }
      },
      {
        id: 'spiral-6-10',
        type: 'note',
        data: {
          text: '🔄 <strong>The compound effect</strong>: After 10 projects, you have 10 proven frameworks. After 50, you\'re unstoppable. This is why consistency matters.'
        }
      }
    ]
  },

  // SLIDE 7: Storyboarding & Planning
  {
    id: 7,
    title: 'Storyboarding: Plan Before You Generate',
    blocks: [
      {
        id: 'storyboard-7-1',
        type: 'text',
        data: {
          html: '<h1>Amateurs Generate Randomly. Pros Plan The Sequence.</h1>'
        }
      },
      {
        id: 'storyboard-7-2',
        type: 'text',
        data: {
          html: '<h2>The Storyboarding Process</h2>'
        }
      },
      {
        id: 'storyboard-7-3',
        type: 'text',
        data: {
          html: '<p>1. <strong>Break the brief into shots</strong> - How many scenes? What\'s the narrative flow?</p><p>2. <strong>Find reference for each shot</strong> - Pull from your inspiration library</p><p>3. <strong>Document in order</strong> - Simple doc: Shot 1, Shot 2, Shot 3 with references</p><p>4. <strong>Generate shot by shot</strong> - Not random, but intentional sequence</p>'
        }
      },
      {
        id: 'storyboard-7-4',
        type: 'text',
        data: {
          html: '<h2>Why This Matters</h2>'
        }
      },
      {
        id: 'storyboard-7-5',
        type: 'text',
        data: {
          html: '<p>Amateurs generate randomly and hope for magic.</p><p>Pros plan the sequence, know what each shot needs to communicate, and generate with intention.</p><p><strong>The edit is pre-planned. The story is already there.</strong></p>'
        }
      },
      {
        id: 'storyboard-7-6',
        type: 'text',
        data: {
          html: '<h2>Real Example: 15-Second Product Video</h2>'
        }
      },
      {
        id: 'storyboard-7-7',
        type: 'text',
        data: {
          html: '<p><strong>Client brief</strong>: Luxury watch brand</p><p><strong>Storyboard</strong>: 3 shots</p><p>→ Shot 1: Close-up of watch face (hero product)<br/>→ Shot 2: Slow rotate (shows craftsmanship)<br/>→ Shot 3: Wrist shot on marble surface (lifestyle context)</p><p><strong>Execution</strong>:<br/>→ Generate images with Flux Kontext (hyper-real product shots)<br/>→ Animate with Kling 2.5 Turbo (precise camera control)<br/>→ Edit together in 10 minutes</p>'
        }
      },
      {
        id: 'storyboard-7-8',
        type: 'note',
        data: {
          text: '🎬 <strong>Pre-visualization wins</strong>: Know the story before you generate. Saves time, saves money, delivers better results.'
        }
      }
    ]
  },

  // SLIDE 8: Character Consistency
  {
    id: 8,
    title: 'Character Consistency: The #1 Skill Brands Pay For',
    blocks: [
      {
        id: 'char-8-1',
        type: 'text',
        data: {
          html: '<h1>Making The Same Person Appear In Multiple Videos</h1>'
        }
      },
      {
        id: 'char-8-2',
        type: 'text',
        data: {
          html: '<p>This is what separates hobbyists from pros. Brands need mascots, recurring characters, consistent brand ambassadors.</p>'
        }
      },
      {
        id: 'char-8-3',
        type: 'text',
        data: {
          html: '<h2>The Challenge</h2>'
        }
      },
      {
        id: 'char-8-4',
        type: 'text',
        data: {
          html: '<p>AI wants to generate something new every time. Your job: force consistency.</p>'
        }
      },
      {
        id: 'char-8-5',
        type: 'text',
        data: {
          html: '<h2>The Professional Workflow</h2>'
        }
      },
      {
        id: 'char-8-6',
        type: 'text',
        data: {
          html: '<p>1. <strong>Generate character reference shots</strong> - 3-5 angles (front, side, ¾ view)</p><p>2. <strong>Save to Characters folder</strong> - With full context profile</p><p>3. <strong>Use image reference in future generations</strong> - Upload reference + new prompt</p><p>4. <strong>Track what works</strong> - Which prompts maintain consistency? Document it.</p>'
        }
      },
      {
        id: 'char-8-7',
        type: 'text',
        data: {
          html: '<h2>Best Models For Character Consistency</h2>'
        }
      },
      {
        id: 'char-8-8',
        type: 'text',
        data: {
          html: '<p><strong>Flux Kontext Pro</strong> - Upload reference image, maintains facial features</p><p><strong>Seedream 4</strong> - Great for character turnarounds</p><p><strong>Ideogram v3</strong> - Strong style consistency</p>'
        }
      },
      {
        id: 'char-8-9',
        type: 'text',
        data: {
          html: '<h2>Context Profile Example</h2>'
        }
      },
      {
        id: 'char-8-10',
        type: 'text',
        data: {
          html: '<p><strong>ClientA_Athlete_Profile.txt</strong></p><p>USE CASE: Brand athlete for sports product campaigns<br/>CHARACTER: Male athlete, mid-30s, athletic build, diverse ethnicity<br/>VISUAL STYLE: Cinematic, film grain, visible skin pores<br/>PROMPT: "Professional athlete in sports gear, determined expression, cinematic lighting, 35mm kodak portra, film grain..."<br/>MODEL: flux kontext pro (fal.ai)<br/>SETTINGS: cfg_scale 7, steps 50<br/>WHAT WORKS: "determined" emotion keyword, subtle sweat, natural lighting<br/>AVOID: Too glossy/perfect, studio lighting</p>'
        }
      },
      {
        id: 'char-8-11',
        type: 'note',
        data: {
          text: '💰 <strong>This is where the money is</strong>: Brands pay premium for consistent characters. Build this skill and you\'ll never lack clients.'
        }
      }
    ]
  },

  // SLIDE 9: Real Pro Workflow
  {
    id: 9,
    title: 'Real Pro Workflow: Start To Finish',
    blocks: [
      {
        id: 'workflow-9-1',
        type: 'text',
        data: {
          html: '<h1>Putting It All Together</h1>'
        }
      },
      {
        id: 'workflow-9-2',
        type: 'text',
        data: {
          html: '<h2>Real Estate Property Video (Actual Workflow)</h2>'
        }
      },
      {
        id: 'workflow-9-3',
        type: 'text',
        data: {
          html: '<p>1. <strong>Download</strong>: Grab photos from real estate listing (not perfect, but real)</p><p>2. <strong>Upscale</strong>: Run through Enhancor to sharpen and clean up</p><p>3. <strong>Add detail</strong>: Use FLUX Kontext to add couch/staging elements if needed</p><p>4. <strong>Animate</strong>: Seedance Pro for camera moves (slow push-ins, zooms, 270° Dolly Pan)</p><p>5. <strong>Edit</strong>: Drag into editing software, cut final video</p><p><strong>Result</strong>: Professional property tour in 10 minutes. Used 3-4 different tools. That\'s the stack in action.</p>'
        }
      },
      {
        id: 'workflow-9-4',
        type: 'text',
        data: {
          html: '<h2>Luxury Product Video (15 seconds)</h2>'
        }
      },
      {
        id: 'workflow-9-5',
        type: 'text',
        data: {
          html: '<p>1. <strong>Check folders</strong>: Do I have a similar luxury product style saved? Yes → pull reference prompts</p><p>2. <strong>Storyboard</strong>: 3 shots — close-up of watch face, slow rotate, wrist shot on marble</p><p>3. <strong>Generate images</strong>: Flux Kontext for hyper-real product shots → $2.40 (3 images)</p><p>4. <strong>Animate</strong>: Kling 2.5 Turbo for precise camera control → $13.50 (3 × 5s videos)</p><p>5. <strong>Log costs</strong>: Total generation cost: $15.90 → add to tracking sheet</p><p>6. <strong>Save to library</strong>: Files go into Objects/LuxuryWatch_Client_2025-10-03/</p><p>7. <strong>Context profile</strong>: Create .txt with prompts and settings for next luxury product</p><p><strong>Result</strong>: Professional deliverable in 2-3 hours. Client gets transparent cost breakdown. You have reusable assets for the next luxury brand.</p>'
        }
      },
      {
        id: 'workflow-9-6',
        type: 'note',
        data: {
          text: '✓ <strong>That\'s the system working</strong>: Organized assets + cost tracking + reusable workflows = professional results every time.'
        }
      }
    ]
  },

  // SLIDE 10: Module Checklist & Next Steps
  {
    id: 10,
    title: 'Module Checklist & Your Next Steps',
    blocks: [
      {
        id: 'checklist-10-1',
        type: 'text',
        data: {
          html: '<h1>Verify Your System Before You Start Freelancing</h1>'
        }
      },
      {
        id: 'checklist-10-2',
        type: 'text',
        data: {
          html: '<h2>Your Content Creation System Checklist</h2>'
        }
      },
      {
        id: 'checklist-10-3',
        type: 'text',
        data: {
          html: '<p>✓ <strong>Accounts & Stack</strong><br/>→ Replicate account active with API token<br/>→ Fal.ai account with payment method added<br/>→ Claude account (Pro recommended for prompts)</p><p>✓ <strong>Organization System</strong><br/>→ Created 4-folder structure (Characters, Worlds, Styles, Objects)<br/>→ Set up naming convention for files<br/>→ Created first context profile .txt file</p><p>✓ <strong>Financial Systems</strong><br/>→ Downloaded cost tracking spreadsheet template<br/>→ Logged at least 3 test generations with costs<br/>→ Understand how to price based on cost data</p><p>✓ <strong>Inspiration Systems</strong><br/>→ Started Pinterest/Instagram inspiration boards<br/>→ Saved 3-5 visual references you love<br/>→ Created simple storyboard for one test project</p><p>✓ <strong>Practical Experience</strong><br/>→ Generated at least one test image with authenticity markers<br/>→ Animated at least one image into video<br/>→ Understand which model to use for which task</p>'
        }
      },
      {
        id: 'checklist-10-4',
        type: 'text',
        data: {
          html: '<h2>If You Skipped Setting This Up</h2>'
        }
      },
      {
        id: 'checklist-10-5',
        type: 'text',
        data: {
          html: '<p>You\'ll be back here in two weeks when you can\'t find that perfect character or explain to a client why their revision costs extra.</p><p><strong>Do it now. Your future self will thank you.</strong></p>'
        }
      },
      {
        id: 'checklist-10-6',
        type: 'text',
        data: {
          html: '<h2>Students Are Already Making Money With This</h2>'
        }
      },
      {
        id: 'checklist-10-7',
        type: 'text',
        data: {
          html: '<p>Real estate agents need property tours. Local businesses need social content. E-commerce brands need product videos.</p><p>You now have the complete workflow to deliver professional AI video.</p><p><strong>The window is open. Let\'s build.</strong></p>'
        }
      },
      {
        id: 'checklist-10-8',
        type: 'note',
        data: {
          text: '🚀 <strong>Remember</strong>: Spread the sauce. No gatekeeping. If you figure out a killer workflow, teach it. That\'s how we all stay ahead.'
        }
      }
    ]
  }
]

// Update database
console.log('Updating module with new slides...')

await sql`
  UPDATE modules
  SET
    title = 'AI Video & Content Creation',
    description = 'Master professional AI video creation. Learn the tools, workflows, and organization systems that creators use to make money. From image generation to final video, build your complete content creation stack.',
    slides = ${JSON.stringify(newSlides)},
    learning_objectives = ${JSON.stringify([
      'Build your complete AI video stack (Replicate, Fal.ai, Claude)',
      'Choose the right image and video models for each job',
      'Implement professional organization systems (4-folder method, context profiles)',
      'Track costs and price projects transparently',
      'Master character consistency workflows',
      'Apply the Soft Spiral method to never start with a blank canvas',
      'Execute real pro workflows from storyboard to final delivery'
    ])},
    key_takeaways = ${JSON.stringify([
      'Professional AI video is never made with just one tool - you need a stack',
      'If the first frame is slop, the whole video is slop - start with quality images',
      'Organization systems separate amateurs from professionals',
      'Cost tracking = transparent pricing = client trust = more money',
      'Character consistency is the #1 skill brands pay premium for',
      'The Soft Spiral: Use what worked before + AI = something new',
      'Plan the sequence before you generate - storyboard saves time and money'
    ])},
    updated_at = NOW()
  WHERE id = ${moduleRecord.id}
`

console.log('✅ Module 3 (Content Creation) filled successfully!\n')
console.log('📍 Based on AI Video Labs proven structure')
console.log('   - Building Your AI Stack')
console.log('   - Image Models & Authenticity')
console.log('   - Video Models Landscape')
console.log('   - Organization Systems')
console.log('   - Cost Tracking & Pricing')
console.log('   - The Soft Spiral Method')
console.log('   - Storyboarding')
console.log('   - Character Consistency')
console.log('   - Real Pro Workflows')
console.log('   - Module Checklist\n')
console.log('🎯 10 comprehensive slides with Forefront brand voice\n')
console.log(`✨ View at: http://localhost:3000/modules/${moduleRecord.slug || 'content-creation'}\n`)
