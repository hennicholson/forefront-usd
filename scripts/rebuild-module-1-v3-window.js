import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🔄 Rebuilding Module 1: The Window of Opportunity...\n')

const newSlides = [
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
          html: '<p><strong>ElevenLabs</strong> - Voice cloning, text-to-speech</p><p><strong>Suno, Udio</strong> - Generate full songs from text prompts</p><p>Create soundtracks. Clone voices. Generate podcasts. All AI.</p>'
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
          html: '<h2>1. You Have Nothing To Unlearn</h2>'
        }
      },
      {
        id: 'advantage-4-3',
        type: 'text',
        data: {
          html: '<p>Professionals have 10-20 years of workflows baked into their brains. They have to <em>unlearn</em> old methods before adopting AI.</p><p>You? Clean slate. You can learn AI-native workflows from day one.</p>'
        }
      },
      {
        id: 'advantage-4-4',
        type: 'text',
        data: {
          html: '<h2>2. You Have Time To Experiment</h2>'
        }
      },
      {
        id: 'advantage-4-5',
        type: 'text',
        data: {
          html: '<p>Professionals are heads-down in their jobs. They can\'t afford to spend hours testing new tools.</p><p>You? You\'re literally here to learn. You <em>should</em> be breaking things and figuring out what works.</p>'
        }
      },
      {
        id: 'advantage-4-6',
        type: 'text',
        data: {
          html: '<h2>3. You Understand Internet Culture</h2>'
        }
      },
      {
        id: 'advantage-4-7',
        type: 'text',
        data: {
          html: '<p>AI tools are built by people who grew up online. The prompts, the memes, the references - you get it instinctively.</p><p>Older professionals? They\'re still figuring out why their prompts sound robotic.</p>'
        }
      },
      {
        id: 'advantage-4-8',
        type: 'text',
        data: {
          html: '<h2>4. You\'re Building Your Career Alongside AI</h2>'
        }
      },
      {
        id: 'advantage-4-9',
        type: 'text',
        data: {
          html: '<p>By the time you graduate, AI will be embedded in every industry. You won\'t be "adapting" to AI - you\'ll be fluent in it from day one.</p><p>That\'s a competitive advantage most professionals will never have.</p>'
        }
      },
      {
        id: 'advantage-4-10',
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
          html: '<p>AI isn\'t a "computer science thing." It applies to literally every field. Here\'s how:</p>'
        }
      },
      {
        id: 'applies-5-3',
        type: 'text',
        data: {
          html: '<h2>Marketing & Business</h2>'
        }
      },
      {
        id: 'applies-5-4',
        type: 'text',
        data: {
          html: '<p>→ Generate ad copy in seconds<br/>→ Create entire campaigns with AI-generated visuals<br/>→ Analyze competitor strategies automatically<br/>→ Build landing pages without coding<br/>→ A/B test 50 variations instantly</p><p><strong>Students are already doing this</strong>. Running side hustles. Freelancing for real clients.</p>'
        }
      },
      {
        id: 'applies-5-5',
        type: 'text',
        data: {
          html: '<h2>Content Creation & Media</h2>'
        }
      },
      {
        id: 'applies-5-6',
        type: 'text',
        data: {
          html: '<p>→ Write video scripts in minutes<br/>→ Generate B-roll footage with AI<br/>→ Edit videos with text commands<br/>→ Create thumbnails, captions, entire content calendars<br/>→ Turn one piece of content into 30 variations across platforms</p><p><strong>This is the module we focus on heavily</strong>. Content creators are eating right now.</p>'
        }
      },
      {
        id: 'applies-5-7',
        type: 'text',
        data: {
          html: '<h2>Development & Engineering</h2>'
        }
      },
      {
        id: 'applies-5-8',
        type: 'text',
        data: {
          html: '<p>→ Write code 10x faster with AI co-pilots<br/>→ Debug instantly<br/>→ Build entire apps from descriptions<br/>→ Automate testing and deployment<br/>→ Ship features in hours, not weeks</p><p><strong>Even non-developers are building apps now</strong>. The barrier to entry just collapsed.</p>'
        }
      },
      {
        id: 'applies-5-9',
        type: 'text',
        data: {
          html: '<h2>Music & Audio Production</h2>'
        }
      },
      {
        id: 'applies-5-10',
        type: 'text',
        data: {
          html: '<p>→ Generate full tracks from text prompts<br/>→ Create background music for videos<br/>→ Mix and master with AI assistance<br/>→ Clone voices for voiceovers<br/>→ Score entire projects without knowing music theory</p>'
        }
      },
      {
        id: 'applies-5-11',
        type: 'text',
        data: {
          html: '<h2>Design & Branding</h2>'
        }
      },
      {
        id: 'applies-5-12',
        type: 'text',
        data: {
          html: '<p>→ Create logos, brand identities, full design systems<br/>→ Generate UI mockups from sketches<br/>→ Design websites without knowing design<br/>→ Create professional graphics for any project<br/>→ Iterate on designs in real-time</p>'
        }
      },
      {
        id: 'applies-5-13',
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
          html: '<h2>Here\'s what makes us different</h2>'
        }
      },
      {
        id: 'forefront-6-3',
        type: 'text',
        data: {
          html: '<h3>Student-Led</h3><p>Every module is created by students who figured it out last week. Not professors teaching theory from textbooks. Peer-to-peer is more relatable and way more effective.</p>'
        }
      },
      {
        id: 'forefront-6-4',
        type: 'text',
        data: {
          html: '<h3>Always Current</h3><p>We update modules as new tools drop. Not once a semester. <em>As it happens.</em> What you learn today is what professionals use today.</p>'
        }
      },
      {
        id: 'forefront-6-5',
        type: 'text',
        data: {
          html: '<h3>Hands-On First</h3><p>No theory without practice. Every module has real tools, actual workflows, projects you build immediately. If you can\'t ship it, we don\'t teach it.</p>'
        }
      },
      {
        id: 'forefront-6-6',
        type: 'text',
        data: {
          html: '<h3>No Gatekeeping</h3><p>Found a killer workflow? <strong>Share it.</strong> Discovered a technique? <strong>Teach it.</strong> We all win when knowledge flows freely.</p>'
        }
      },
      {
        id: 'forefront-6-7',
        type: 'text',
        data: {
          html: '<h2>The Forefront Network</h2>'
        }
      },
      {
        id: 'forefront-6-8',
        type: 'text',
        data: {
          html: '<p>Started at USD. Growing to universities nationwide. Every campus becomes a node in the network. Students teaching students. Knowledge spreading at the speed of AI innovation.</p>'
        }
      },
      {
        id: 'forefront-6-9',
        type: 'note',
        data: {
          text: '📌 <strong>Spread the sauce. No gatekeeping.</strong> - That\'s the whole philosophy. If you figure it out, you teach it. That\'s how we all stay ahead.'
        }
      }
    ]
  },

  // SLIDE 7: The Modules (Your Learning Path)
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
          html: '<h2>Module 2: Vibe Code with AI</h2><p>Build apps 10x faster. Ship features in hours. Turn ideas into working prototypes without memorizing syntax.</p>'
        }
      },
      {
        id: 'modules-7-3',
        type: 'text',
        data: {
          html: '<h2>Module 3: Content Creation with AI</h2><p>Generate video, write scripts, create 30 days of content in 2 hours. Master AI video tools like Kling, Veo, Seedance. This is where students are making money <em>now</em>.</p>'
        }
      },
      {
        id: 'modules-7-4',
        type: 'text',
        data: {
          html: '<h2>Module 4: Marketing with AI</h2><p>Launch campaigns in days. Write copy that converts. Analyze competitors automatically. Build funnels that run on autopilot.</p>'
        }
      },
      {
        id: 'modules-7-5',
        type: 'text',
        data: {
          html: '<h2>Module 5: Music Production with AI</h2><p>Compose tracks. Design sound. Score videos. No music theory needed. AI handles the technical stuff while you stay creative.</p>'
        }
      },
      {
        id: 'modules-7-6',
        type: 'text',
        data: {
          html: '<h2>Module 6: AI Automation</h2><p>Build systems that run 24/7. Automate repetitive tasks. Create custom AI agents. Scale your productivity to levels that aren\'t humanly possible without AI.</p>'
        }
      },
      {
        id: 'modules-7-7',
        type: 'text',
        data: {
          html: '<h2>Start anywhere. Move fast.</h2>'
        }
      },
      {
        id: 'modules-7-8',
        type: 'text',
        data: {
          html: '<p>Modules are designed to be completed in any order. Pick what\'s most relevant to you right now. Come back for the rest later.</p>'
        }
      }
    ]
  },

  // SLIDE 8: Quick Terms You Need To Know
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
          html: '<h2>Prompt</h2><p>The input you give to an AI. Could be a question, instruction, or description.</p><p><strong>Example</strong>: "Write a Python function that sorts a list" ← That\'s a prompt</p>'
        }
      },
      {
        id: 'terms-8-3',
        type: 'text',
        data: {
          html: '<h2>Tokens</h2><p>The basic unit of text AI processes. One token ≈ 4 characters or ¾ of a word.</p><p><strong>Why it matters</strong>: AI models have token limits. More tokens = more you can fit in a conversation.</p>'
        }
      },
      {
        id: 'terms-8-4',
        type: 'text',
        data: {
          html: '<h2>Context Window</h2><p>How much an AI can "remember" at once. Think of it as working memory.</p><p>Claude: 200K tokens (~150K words)<br/>ChatGPT: 1M tokens (~750K words)<br/>Gemini: 2M tokens (~1.5M words)</p>'
        }
      },
      {
        id: 'terms-8-5',
        type: 'text',
        data: {
          html: '<h2>Temperature</h2><p>Controls how creative vs predictable the AI is. Scale: 0.0 to 2.0</p><p>Low temp (0.2): Factual, consistent, technical<br/>High temp (1.2): Creative, varied, experimental</p>'
        }
      },
      {
        id: 'terms-8-6',
        type: 'text',
        data: {
          html: '<h2>Hallucination</h2><p>When AI confidently makes up facts that aren\'t true.</p><p><strong>Why it happens</strong>: AI predicts what <em>sounds</em> right, not what <em>is</em> right. Always verify important facts.</p>'
        }
      },
      {
        id: 'terms-8-7',
        type: 'text',
        data: {
          html: '<h2>Fine-Tuning</h2><p>Training an AI on specific data to make it better at particular tasks. Like giving it specialized training for your use case.</p>'
        }
      },
      {
        id: 'terms-8-8',
        type: 'note',
        data: {
          text: '📚 <strong>You don\'t need to memorize this</strong>. But knowing these terms helps you sound less like a tourist when talking to other AI people.'
        }
      }
    ]
  },

  // SLIDE 9: How To Actually Use AI (Not Slop)
  {
    id: 9,
    title: 'How To Actually Use AI (Not Slop)',
    blocks: [
      {
        id: 'howto-9-1',
        type: 'text',
        data: {
          html: '<h1>Stop Making AI Slop</h1>'
        }
      },
      {
        id: 'howto-9-2',
        type: 'text',
        data: {
          html: '<p>Everyone can spot bad AI content now. Here\'s how to make stuff that doesn\'t suck:</p>'
        }
      },
      {
        id: 'howto-9-3',
        type: 'text',
        data: {
          html: '<h2>1. Be Specific In Your Prompts</h2>'
        }
      },
      {
        id: 'howto-9-4',
        type: 'text',
        data: {
          html: '<p><strong>Bad</strong>: "Write a blog post"</p><p><strong>Good</strong>: "Write a 500-word blog post about prompt engineering for beginners. Casual tone. Include 3 real examples. No fluff."</p>'
        }
      },
      {
        id: 'howto-9-5',
        type: 'text',
        data: {
          html: '<h2>2. Iterate. Don\'t Accept First Output</h2>'
        }
      },
      {
        id: 'howto-9-6',
        type: 'text',
        data: {
          html: '<p>First draft from AI? Usually generic. Keep refining. "Make this more concise." "Add more technical depth." "Less corporate, more casual."</p>'
        }
      },
      {
        id: 'howto-9-7',
        type: 'text',
        data: {
          html: '<h2>3. Add Your Voice</h2>'
        }
      },
      {
        id: 'howto-9-8',
        type: 'text',
        data: {
          html: '<p>AI is a tool, not a replacement. Use it for the first draft. Then edit to add your personality, your insights, your examples.</p><p><strong>AI + You > AI Alone</strong></p>'
        }
      },
      {
        id: 'howto-9-9',
        type: 'text',
        data: {
          html: '<h2>4. Use AI For What It\'s Good At</h2>'
        }
      },
      {
        id: 'howto-9-10',
        type: 'text',
        data: {
          html: '<p><strong>AI crushes at</strong>: Generating first drafts, brainstorming ideas, formatting, repetitive tasks, summarizing</p><p><strong>AI sucks at</strong>: Original insights, personal stories, understanding nuance, being funny</p><p>Play to its strengths. Fill in the gaps yourself.</p>'
        }
      },
      {
        id: 'howto-9-11',
        type: 'note',
        data: {
          text: '⚡ <strong>The formula</strong>: Use AI to move 10x faster. Use your brain to make it actually good. That\'s the secret.'
        }
      }
    ]
  },

  // SLIDE 10: Your Next Steps
  {
    id: 10,
    title: 'Your Next Steps: Let\'s Build',
    blocks: [
      {
        id: 'next-10-1',
        type: 'text',
        data: {
          html: '<h1>You\'re At The Forefront Now</h1>'
        }
      },
      {
        id: 'next-10-2',
        type: 'text',
        data: {
          html: '<h2>What you just learned:</h2>'
        }
      },
      {
        id: 'next-10-3',
        type: 'text',
        data: {
          html: '<p>✅ Why right now is a unique window of opportunity<br/>✅ What AI actually is (and isn\'t)<br/>✅ Where we are in the AI landscape (October 2025)<br/>✅ Why students have an unfair advantage<br/>✅ Where AI applies across every industry<br/>✅ What makes Forefront different<br/>✅ Essential vocabulary to sound less like a tourist<br/>✅ How to use AI without making slop</p>'
        }
      },
      {
        id: 'next-10-4',
        type: 'text',
        data: {
          html: '<h2>What\'s next:</h2>'
        }
      },
      {
        id: 'next-10-5',
        type: 'text',
        data: {
          html: '<p>Pick a module. Any module. They\'re all hands-on. You\'ll be building real things immediately.</p>'
        }
      },
      {
        id: 'next-10-6',
        type: 'text',
        data: {
          html: '<p><strong>Most popular right now</strong>: Module 3 (Content Creation with AI). Students are freelancing and making actual money from what they learn there.</p>'
        }
      },
      {
        id: 'next-10-7',
        type: 'text',
        data: {
          html: '<p><strong>Best for developers</strong>: Module 2 (Vibe Code with AI). Ship apps 10x faster.</p>'
        }
      },
      {
        id: 'next-10-8',
        type: 'text',
        data: {
          html: '<p><strong>Best for marketers</strong>: Module 4 (Marketing with AI). Launch campaigns in days.</p>'
        }
      },
      {
        id: 'next-10-9',
        type: 'text',
        data: {
          html: '<h2>Remember</h2>'
        }
      },
      {
        id: 'next-10-10',
        type: 'text',
        data: {
          html: '<p>This window won\'t stay open forever. The students who master these tools now will define the next decade.</p><p>You\'re not watching from the sidelines anymore.</p><p><strong>You\'re at the forefront. Let\'s build.</strong></p>'
        }
      },
      {
        id: 'next-10-11',
        type: 'note',
        data: {
          text: '🚀 <strong>Spread the sauce</strong>: Found something that works? Teach it. That\'s how we all stay ahead together.'
        }
      }
    ]
  }
]

// Update database
console.log('Updating database...')

await sql`
  UPDATE modules
  SET
    title = 'What is AI? The Window of Opportunity',
    description = 'Understand why right now is a unique moment in history for students. Learn what AI actually is, where it applies, and why you have an unfair advantage. No academic jargon. Just the straight sauce.',
    slides = ${JSON.stringify(newSlides)},
    learning_objectives = ${JSON.stringify([
      'Understand why students have a unique advantage with AI right now',
      'Learn what AI actually is and how it works (no jargon)',
      'See where AI applies across every industry',
      'Grasp the current AI landscape (October 2025)',
      'Understand what makes Forefront different from traditional education',
      'Learn how to use AI effectively without making slop'
    ])},
    key_takeaways = ${JSON.stringify([
      'This window of opportunity is temporary - master AI now or fall behind',
      'AI is pattern recognition at massive scale, not magic',
      'Students are perfectly positioned to learn AI-native workflows',
      'AI applies to literally every industry, not just tech',
      'Forefront moves at the speed of AI innovation, not academic cycles',
      'AI + Your Brain > AI Alone - use it as a tool, not a replacement'
    ])},
    updated_at = NOW()
  WHERE module_id = 'module-vibe-coding-2025'
`

console.log('✅ Module 1 completely rebuilt!\n')
console.log('📍 New focus: What is AI & The Window of Opportunity')
console.log('   - Why right now is a unique moment for students')
console.log('   - What AI actually is (no jargon)')
console.log('   - Where AI applies across all industries')
console.log('   - Why students have the advantage')
console.log('   - What makes Forefront different')
console.log('   - How to use AI without making slop\n')
console.log('🎯 10 slides with Forefront brand voice (no gatekeeping, spread the sauce)\n')
console.log('✨ View at: http://localhost:3000/modules/vibe-coding-ai\n')
