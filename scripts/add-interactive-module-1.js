import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🔄 Adding interactive elements to Module 1...\n')

const newSlides = [
  // SLIDE 1: The Window (with animated timeline)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.timeline { position: relative; max-width: 600px; width: 100%; }
.timeline-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
}
.timeline-progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  width: 0%;
  animation: fillWindow 3s ease-out forwards;
  border-radius: 3px;
}
@keyframes fillWindow { to { width: 75%; } }
.milestone {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  opacity: 0;
  transform: translateX(-20px);
}
.milestone.active { animation: slideIn 0.5s ease-out forwards; }
@keyframes slideIn { to { opacity: 1; transform: translateX(0); } }
.milestone:nth-child(1) { animation-delay: 0.3s; }
.milestone:nth-child(2) { animation-delay: 0.6s; }
.milestone:nth-child(3) { animation-delay: 0.9s; }
.milestone:nth-child(4) { animation-delay: 1.2s; }
.year {
  font-size: 14px;
  color: #8b5cf6;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.event {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.status {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}
.window-closing {
  text-align: center;
  margin-top: 30px;
  padding: 24px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
}
.window-text {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}
</style>
</head>
<body>
<div class="timeline">
  <div class="timeline-bar">
    <div class="timeline-progress"></div>
  </div>

  <div class="milestone active">
    <div class="year">2022</div>
    <div class="event">ChatGPT Launches</div>
    <div class="status">Public AI revolution begins</div>
  </div>

  <div class="milestone active">
    <div class="year">2023-2024</div>
    <div class="event">Model Explosion</div>
    <div class="status">Claude, Gemini, Midjourney, Stable Diffusion</div>
  </div>

  <div class="milestone active">
    <div class="year">2025 (Now)</div>
    <div class="event">🎯 The Window Is Open</div>
    <div class="status">Students master tools before everyone else</div>
  </div>

  <div class="milestone active">
    <div class="year">2026-2027</div>
    <div class="event">Window Closes</div>
    <div class="status">Everyone knows AI. Early advantage disappears.</div>
  </div>

  <div class="window-closing">
    <div class="window-text">⏰ The window closes in ~2 years</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'window-1-4',
        type: 'text',
        data: {
          html: '<h2>But this advantage is temporary</h2>'
        }
      },
      {
        id: 'window-1-5',
        type: 'text',
        data: {
          html: '<p>Students are young enough to adapt quickly, curious enough to experiment constantly, and positioned perfectly at the intersection of learning and building careers.</p><p>Experts? Still catching up.</p><p>Professors? Updating syllabuses for tools that will be outdated by next semester.</p><p><strong>You? Already in the trenches, figuring it out.</strong></p>'
        }
      },
      {
        id: 'window-1-6',
        type: 'note',
        data: {
          text: '💡 <strong>The Forefront Philosophy</strong>: We move at the speed of AI innovation, not academic cycles. If it works, we teach it. If it doesn\'t, we kill it. No fluff.'
        }
      }
    ]
  },

  // SLIDE 2: What Even Is AI? (with interactive pattern recognition demo)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.demo-container { max-width: 600px; width: 100%; }
.demo-box {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
}
.demo-title {
  font-size: 14px;
  color: #8b5cf6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}
.pattern-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.pattern-item {
  flex: 1;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.arrow {
  font-size: 24px;
  color: rgba(255,255,255,0.4);
}
.prediction {
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.5);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}
.examples {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}
.example {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
}
.example strong { color: #3b82f6; }
</style>
</head>
<body>
<div class="demo-container">
  <div class="demo-box">
    <div class="demo-title">Pattern Recognition Demo</div>
    <div class="pattern-row">
      <div class="pattern-item">cat</div>
      <div class="arrow">→</div>
      <div class="pattern-item">dog</div>
      <div class="arrow">→</div>
      <div class="pattern-item prediction">?</div>
    </div>
    <div style="text-align: center; margin-top: 10px; font-size: 13px; color: rgba(255,255,255,0.6);">
      AI predicts: "pet", "animal", "puppy"
    </div>
  </div>

  <div class="demo-box">
    <div class="demo-title">How AI Learns</div>
    <div class="examples">
      <div class="example">
        <strong>1. Training:</strong> Feed it billions of examples<br/>
        "The cat sat on the mat"<br/>
        "The dog played in the park"<br/>
        "The bird flew to the tree"
      </div>
      <div class="example">
        <strong>2. Pattern Recognition:</strong> AI finds relationships<br/>
        Animals → verbs → locations<br/>
        Nouns → actions → context
      </div>
      <div class="example">
        <strong>3. Generation:</strong> Predicts what comes next<br/>
        "The fish" → AI predicts: "swam", "jumped", "lives"
      </div>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; font-size: 14px;">
    <strong style="color: #3b82f6;">That's it.</strong> AI doesn't "think" — it predicts patterns.
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'whatis-2-4',
        type: 'text',
        data: {
          html: '<h2>Why this changes everything</h2>'
        }
      },
      {
        id: 'whatis-2-5',
        type: 'text',
        data: {
          html: '<p>Before: You needed to write exact commands for computers</p><p>Now: You describe what you want in plain English</p><p><strong>Code faster. Write better. Create content. Automate workflows.</strong> All with conversational AI.</p>'
        }
      },
      {
        id: 'whatis-2-6',
        type: 'note',
        data: {
          text: '🎯 <strong>Bottom line</strong>: AI isn\'t magic. It\'s math. Really good math. Understanding this helps you use it better.'
        }
      }
    ]
  },

  // SLIDE 3: The AI Landscape (with interactive model cards)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 30px 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}
.card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-4px);
}
.category {
  font-size: 12px;
  color: #8b5cf6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.model-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.model-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin-bottom: 16px;
}
.model-tag {
  display: inline-block;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
  margin-bottom: 6px;
}
.hot {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
</style>
</head>
<body>
<div class="grid">
  <div class="card">
    <div class="category">Text AI</div>
    <div class="model-name">ChatGPT</div>
    <div class="model-desc">Best for general use, creative writing, brainstorming</div>
    <span class="model-tag">OpenAI</span>
    <span class="model-tag">1M tokens</span>
  </div>

  <div class="card">
    <div class="category">Text AI</div>
    <div class="model-name">Claude</div>
    <div class="model-desc">Best for coding, technical work, long documents</div>
    <span class="model-tag">Anthropic</span>
    <span class="model-tag">200K tokens</span>
  </div>

  <div class="card">
    <div class="category">Text AI</div>
    <div class="model-name">Gemini</div>
    <div class="model-desc">Massive context, great for research</div>
    <span class="model-tag">Google</span>
    <span class="model-tag">2M tokens</span>
  </div>

  <div class="card">
    <div class="category">Image AI</div>
    <div class="model-name">Flux</div>
    <div class="model-desc">Hyper-realistic product shots</div>
    <span class="model-tag hot">New</span>
    <span class="model-tag">Professional</span>
  </div>

  <div class="card">
    <div class="category">Video AI</div>
    <div class="model-name">Veo 3</div>
    <div class="model-desc">Cinematic quality + native audio</div>
    <span class="model-tag hot">Hot</span>
    <span class="model-tag">Google</span>
  </div>

  <div class="card">
    <div class="category">Video AI</div>
    <div class="model-name">Kling 2.5</div>
    <div class="model-desc">Best motion quality</div>
    <span class="model-tag hot">Cutting Edge</span>
    <span class="model-tag">Action</span>
  </div>

  <div class="card">
    <div class="category">Audio AI</div>
    <div class="model-name">ElevenLabs</div>
    <div class="model-desc">Voice cloning, text-to-speech</div>
    <span class="model-tag">Voice</span>
  </div>

  <div class="card">
    <div class="category">Music AI</div>
    <div class="model-name">Suno</div>
    <div class="model-desc">Generate full songs from text</div>
    <span class="model-tag hot">Game Changer</span>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'landscape-3-3',
        type: 'text',
        data: {
          html: '<p>October 2025. AI has exploded in the past 3 years. Each model has specialized strengths - you\'ll use multiple tools depending on the task.</p>'
        }
      },
      {
        id: 'landscape-3-4',
        type: 'note',
        data: {
          text: '⚡ <strong>The pace is insane</strong>: New models drop every week. What\'s state-of-the-art today is outdated in 3 months. That\'s why we update modules in real-time.'
        }
      }
    ]
  },

  // SLIDE 4: Why Students Have The Advantage (with comparison chart)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 40px 20px;
}
.comparison {
  max-width: 700px;
  margin: 0 auto;
}
.vs-header {
  text-align: center;
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 40px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 8px;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}
.box {
  padding: 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
}
.professional {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.student {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}
.category {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 1px;
}
.score {
  margin-top: 30px;
  text-align: center;
  padding: 24px;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  border: 2px solid rgba(16, 185, 129, 0.4);
}
.score-text {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}
</style>
</head>
<body>
<div class="comparison">
  <div class="vs-header">VS</div>

  <div class="row">
    <div class="box professional">Must unlearn 10-20 years of workflows</div>
    <div class="category">Learning</div>
    <div class="box student">Clean slate, AI-native from day 1</div>
  </div>

  <div class="row">
    <div class="box professional">Heads-down in jobs, no time to experiment</div>
    <div class="category">Time</div>
    <div class="box student">Literally here to learn and break things</div>
  </div>

  <div class="row">
    <div class="box professional">Struggle with internet culture references</div>
    <div class="category">Context</div>
    <div class="box student">Grew up online, gets the vibe</div>
  </div>

  <div class="row">
    <div class="box professional">Adapting AI into existing career</div>
    <div class="category">Career</div>
    <div class="box student">Building career alongside AI</div>
  </div>

  <div class="score">
    <div class="score-text">🎯 You're in the perfect position to dominate</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'advantage-4-3',
        type: 'text',
        data: {
          html: '<p>By the time you graduate, AI will be embedded in every industry. You won\'t be "adapting" to AI - you\'ll be fluent in it from day one.</p><p>That\'s a competitive advantage most professionals will never have.</p>'
        }
      },
      {
        id: 'advantage-4-4',
        type: 'note',
        data: {
          text: '🚀 <strong>Real talk</strong>: The students who master AI now will be the ones hiring managers in 5 years. Not exaggerating.'
        }
      }
    ]
  },

  // SLIDE 5: Where AI Actually Applies (with interactive industry grid)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 30px 20px;
}
.industries {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}
.industry {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.industry::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.industry:hover::before {
  transform: translateX(0);
}
.industry:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  transform: translateY(-4px);
}
.industry-icon {
  font-size: 32px;
  margin-bottom: 12px;
}
.industry-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.industry-use {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
}
.hot-badge {
  display: inline-block;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 8px;
}
</style>
</head>
<body>
<div class="industries">
  <div class="industry">
    <div class="industry-icon">📱</div>
    <div class="industry-name">Marketing</div>
    <div class="industry-use">Generate ad copy, campaigns, A/B tests in minutes</div>
    <span class="hot-badge">High Demand</span>
  </div>

  <div class="industry">
    <div class="industry-icon">🎬</div>
    <div class="industry-name">Content Creation</div>
    <div class="industry-use">Video, scripts, thumbnails, entire calendars</div>
    <span class="hot-badge">Making Money Now</span>
  </div>

  <div class="industry">
    <div class="industry-icon">💻</div>
    <div class="industry-name">Development</div>
    <div class="industry-use">Write code 10x faster, ship features in hours</div>
  </div>

  <div class="industry">
    <div class="industry-icon">🎵</div>
    <div class="industry-name">Music Production</div>
    <div class="industry-use">Generate tracks, mix, master, score videos</div>
  </div>

  <div class="industry">
    <div class="industry-icon">🎨</div>
    <div class="industry-name">Design</div>
    <div class="industry-use">Logos, mockups, brand systems, UI design</div>
  </div>

  <div class="industry">
    <div class="industry-icon">📊</div>
    <div class="industry-name">Business</div>
    <div class="industry-use">Analysis, reports, presentations, automation</div>
  </div>

  <div class="industry">
    <div class="industry-icon">📝</div>
    <div class="industry-name">Writing</div>
    <div class="industry-use">Articles, social posts, emails, documentation</div>
  </div>

  <div class="industry">
    <div class="industry-icon">🏠</div>
    <div class="industry-name">Real Estate</div>
    <div class="industry-use">Property tours, listings, marketing materials</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'applies-5-3',
        type: 'text',
        data: {
          html: '<p>AI isn\'t a "computer science thing." It applies to literally every field. Every industry has tedious, repetitive tasks. AI crushes those, freeing you up for creative, strategic work.</p>'
        }
      },
      {
        id: 'applies-5-4',
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.container {
  max-width: 700px;
  width: 100%;
}
.principle {
  background: rgba(255,255,255,0.05);
  border-left: 4px solid #8b5cf6;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}
.principle:hover {
  background: rgba(255,255,255,0.08);
  transform: translateX(8px);
}
.principle-title {
  font-size: 18px;
  font-weight: 700;
  color: #8b5cf6;
  margin-bottom: 8px;
}
.principle-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
}
.manifesto {
  text-align: center;
  margin-top: 40px;
  padding: 32px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
}
.manifesto-text {
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}
</style>
</head>
<body>
<div class="container">
  <div class="principle">
    <div class="principle-title">Student-Led</div>
    <div class="principle-desc">Every module created by students who figured it out last week. Not professors teaching theory from textbooks.</div>
  </div>

  <div class="principle">
    <div class="principle-title">Always Current</div>
    <div class="principle-desc">We update modules as new tools drop. Not once a semester. As it happens. What you learn today is what pros use today.</div>
  </div>

  <div class="principle">
    <div class="principle-title">Hands-On First</div>
    <div class="principle-desc">No theory without practice. Real tools, actual workflows, projects you build immediately. If you can't ship it, we don't teach it.</div>
  </div>

  <div class="principle">
    <div class="principle-title">No Gatekeeping</div>
    <div class="principle-desc">Found a killer workflow? Share it. Discovered a technique? Teach it. We all win when knowledge flows freely.</div>
  </div>

  <div class="manifesto">
    <div class="manifesto-text">Spread the sauce. No gatekeeping.</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'forefront-6-3',
        type: 'text',
        data: {
          html: '<h2>The Forefront Network</h2><p>Started at USD. Growing to universities nationwide. Every campus becomes a node in the network. Students teaching students. Knowledge spreading at the speed of AI innovation.</p>'
        }
      },
      {
        id: 'forefront-6-4',
        type: 'note',
        data: {
          text: '📌 <strong>Spread the sauce. No gatekeeping.</strong> - That\'s the whole philosophy. If you figure it out, you teach it. That\'s how we all stay ahead.'
        }
      }
    ]
  },

  // SLIDE 7: The Modules (with module cards)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 30px 20px;
}
.modules {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}
.module {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.module::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.3s ease;
}
.module:hover::before {
  transform: scaleY(1);
  transform-origin: top;
}
.module:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(59, 130, 246, 0.4);
}
.module-number {
  font-size: 12px;
  color: #8b5cf6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.module-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.module-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}
.popular {
  display: inline-block;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 12px;
}
</style>
</head>
<body>
<div class="modules">
  <div class="module">
    <div class="module-number">Module 02</div>
    <div class="module-title">Vibe Code with AI</div>
    <div class="module-desc">Build apps 10x faster. Ship features in hours. Turn ideas into working prototypes without memorizing syntax.</div>
  </div>

  <div class="module">
    <div class="module-number">Module 03</div>
    <div class="module-title">Content Creation with AI</div>
    <div class="module-desc">Generate video, write scripts, create 30 days of content in 2 hours. Master AI video tools.</div>
    <span class="popular">💰 Making Money Now</span>
  </div>

  <div class="module">
    <div class="module-number">Module 04</div>
    <div class="module-title">Marketing with AI</div>
    <div class="module-desc">Launch campaigns in days. Write copy that converts. Analyze competitors automatically.</div>
  </div>

  <div class="module">
    <div class="module-number">Module 05</div>
    <div class="module-title">Music Production with AI</div>
    <div class="module-desc">Compose tracks. Design sound. Score videos. No music theory needed.</div>
  </div>

  <div class="module">
    <div class="module-number">Module 06</div>
    <div class="module-title">AI Automation</div>
    <div class="module-desc">Build systems that run 24/7. Automate repetitive tasks. Create custom AI agents.</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'modules-7-3',
        type: 'text',
        data: {
          html: '<p>Start anywhere. Move fast. Modules are designed to be completed in any order. Pick what\'s most relevant to you right now.</p>'
        }
      }
    ]
  },

  // SLIDE 8: Quick Terms (with interactive glossary)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 30px 20px;
}
.glossary {
  max-width: 700px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}
.term {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.term:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(59, 130, 246, 0.4);
}
.term-name {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}
.term-def {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
  margin-bottom: 8px;
}
.term-example {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  font-style: italic;
  background: rgba(255,255,255,0.03);
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}
</style>
</head>
<body>
<div class="glossary">
  <div class="term">
    <div class="term-name">Prompt</div>
    <div class="term-def">The input you give to an AI. Could be a question, instruction, or description.</div>
    <div class="term-example">Example: "Write a Python function that sorts a list"</div>
  </div>

  <div class="term">
    <div class="term-name">Tokens</div>
    <div class="term-def">The basic unit of text AI processes. One token ≈ 4 characters or ¾ of a word.</div>
    <div class="term-example">More tokens = more you can fit in a conversation</div>
  </div>

  <div class="term">
    <div class="term-name">Context Window</div>
    <div class="term-def">How much an AI can "remember" at once. Think of it as working memory.</div>
    <div class="term-example">Claude: 200K tokens | ChatGPT: 1M tokens | Gemini: 2M tokens</div>
  </div>

  <div class="term">
    <div class="term-name">Temperature</div>
    <div class="term-def">Controls how creative vs predictable the AI is. Scale: 0.0 to 2.0</div>
    <div class="term-example">Low (0.2): Factual | High (1.2): Creative</div>
  </div>

  <div class="term">
    <div class="term-name">Hallucination</div>
    <div class="term-def">When AI confidently makes up facts that aren't true.</div>
    <div class="term-example">AI predicts what sounds right, not what is right. Always verify.</div>
  </div>

  <div class="term">
    <div class="term-name">Fine-Tuning</div>
    <div class="term-def">Training an AI on specific data to make it better at particular tasks.</div>
    <div class="term-example">Like giving already-smart AI specialized training</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'terms-8-3',
        type: 'note',
        data: {
          text: '📚 <strong>You don\'t need to memorize this</strong>. But knowing these terms helps you sound less like a tourist when talking to other AI people.'
        }
      }
    ]
  },

  // SLIDE 9: How To Use AI (with dos and don'ts)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 40px 20px;
}
.container {
  max-width: 800px;
  margin: 0 auto;
}
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
.do, .dont {
  padding: 24px;
  border-radius: 12px;
  border: 2px solid;
}
.do {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}
.dont {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}
.label {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 16px;
}
.do .label { color: #10b981; }
.dont .label { color: #ef4444; }
.example {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255,255,255,0.9);
  background: rgba(0,0,0,0.3);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-family: monospace;
}
.tip {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-top: 8px;
  line-height: 1.5;
}
.formula {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  margin-top: 30px;
}
.formula-text {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.4;
}
.formula-emoji { font-size: 32px; margin: 0 8px; }
</style>
</head>
<body>
<div class="container">
  <div class="comparison-grid">
    <div class="dont">
      <div class="label">❌ Bad Prompt</div>
      <div class="example">"Write a blog post"</div>
      <div class="tip">Too vague. No direction. Generic output guaranteed.</div>
    </div>

    <div class="do">
      <div class="label">✅ Good Prompt</div>
      <div class="example">"Write a 500-word blog post about prompt engineering for beginners. Casual tone. Include 3 real examples. No fluff."</div>
      <div class="tip">Specific, clear constraints, defines tone and length.</div>
    </div>
  </div>

  <div class="comparison-grid">
    <div class="dont">
      <div class="label">❌ First Draft Only</div>
      <div class="example">Accept whatever AI gives you first</div>
      <div class="tip">First outputs are usually generic and boring.</div>
    </div>

    <div class="do">
      <div class="label">✅ Iterate</div>
      <div class="example">"Make this more concise."<br/>"Add technical depth."<br/>"Less corporate, more casual."</div>
      <div class="tip">Keep refining until it's actually good.</div>
    </div>
  </div>

  <div class="comparison-grid">
    <div class="dont">
      <div class="label">❌ AI Replaces You</div>
      <div class="example">Copy-paste AI output directly</div>
      <div class="tip">Everyone can tell. It's obvious.</div>
    </div>

    <div class="do">
      <div class="label">✅ AI + Your Voice</div>
      <div class="example">Use AI for first draft, then edit to add your personality, insights, examples</div>
      <div class="tip">AI as tool, not replacement.</div>
    </div>
  </div>

  <div class="formula">
    <div class="formula-text">
      AI <span class="formula-emoji">⚡</span> 10x Speed<br/>
      + Your Brain <span class="formula-emoji">🧠</span> Quality<br/>
      = <span style="color: #3b82f6;">Unstoppable</span>
    </div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'howto-9-3',
        type: 'note',
        data: {
          text: '⚡ <strong>The formula</strong>: Use AI to move 10x faster. Use your brain to make it actually good. That\'s the secret.'
        }
      }
    ]
  },

  // SLIDE 10: Your Next Steps (with CTA)
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
        type: 'codePreview',
        data: {
          html: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.container {
  max-width: 700px;
  width: 100%;
}
.checklist {
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 30px;
}
.checklist-title {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
}
.check-icon {
  font-size: 20px;
  color: #10b981;
}
.next-module {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 20px;
}
.next-module:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25));
  transform: translateY(-4px);
}
.module-label {
  font-size: 14px;
  color: #8b5cf6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.module-name {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.module-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}
.cta {
  text-align: center;
  padding: 32px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
}
.cta-text {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}
.cta-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
}
</style>
</head>
<body>
<div class="container">
  <div class="checklist">
    <div class="checklist-title">✓ What You Just Learned</div>
    <div class="check-item"><span class="check-icon">✓</span> Why right now is a unique window of opportunity</div>
    <div class="check-item"><span class="check-icon">✓</span> What AI actually is (pattern recognition at scale)</div>
    <div class="check-item"><span class="check-icon">✓</span> The AI landscape (October 2025)</div>
    <div class="check-item"><span class="check-icon">✓</span> Why students have an unfair advantage</div>
    <div class="check-item"><span class="check-icon">✓</span> Where AI applies across every industry</div>
    <div class="check-item"><span class="check-icon">✓</span> What makes Forefront different</div>
    <div class="check-item"><span class="check-icon">✓</span> How to use AI without making slop</div>
  </div>

  <div class="next-module">
    <div class="module-label">Most Popular 🔥</div>
    <div class="module-name">Content Creation with AI</div>
    <div class="module-desc">Students are freelancing and making actual money from this module. Learn the complete AI video workflow.</div>
  </div>

  <div class="cta">
    <div class="cta-text">The window won't stay open forever</div>
    <div class="cta-sub">You're at the forefront. Let's build.</div>
  </div>
</div>
</body>
</html>`
        }
      },
      {
        id: 'next-10-3',
        type: 'note',
        data: {
          text: '🚀 <strong>Spread the sauce</strong>: Found something that works? Teach it. That\'s how we all stay ahead together.'
        }
      }
    ]
  }
]

// Update database
console.log('Updating Module 1 with interactive elements...')

await sql`
  UPDATE modules
  SET
    slides = ${JSON.stringify(newSlides)},
    updated_at = NOW()
  WHERE module_id = 'module-vibe-coding-2025'
`

console.log('✅ Module 1 updated with interactive elements!\n')
console.log('📍 Added interactive demos:')
console.log('   - Animated timeline showing the window closing')
console.log('   - Interactive pattern recognition demo')
console.log('   - Hoverable AI model cards')
console.log('   - Student vs Professional comparison')
console.log('   - Industry application grid')
console.log('   - Forefront principles with hover effects')
console.log('   - Module roadmap cards')
console.log('   - Interactive glossary')
console.log('   - Do/Don\'t comparison grid')
console.log('   - Next steps checklist with CTAs\n')
console.log('✨ View at: http://localhost:3000/modules/vibe-coding-ai\n')
