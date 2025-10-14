const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    console.log('Fetching Module 1 from database...');
    const module = await sql`SELECT * FROM modules WHERE module_id = 'module-vibe-coding-2025'`.then(r => r[0]);

    if (!module) {
      throw new Error('Module not found');
    }

    console.log('Module found. Updating with embedded interactive elements...');

    // Get existing slides
    const slides = JSON.parse(JSON.stringify(module.slides));

    // Add embedded black/white interactive elements to specific slides

    // Slide 1: Add embedded timeline after text blocks
    slides[0].blocks.push({
      id: 'window-1-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="timeline">
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
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 40px 20px;
}
.timeline { position: relative; max-width: 600px; width: 100%; margin: 0 auto; }
.timeline-bar {
  height: 6px;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
}
.timeline-progress {
  height: 100%;
  background: rgba(0,0,0,0.8);
  width: 0%;
  animation: fillWindow 3s ease-out forwards;
  border-radius: 3px;
}
@keyframes fillWindow { to { width: 75%; } }
.milestone {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  opacity: 0;
  transform: translateX(-20px);
}
.milestone.active { animation: slideIn 0.5s ease-out forwards; }
@keyframes slideIn { to { opacity: 1; transform: translateX(0); } }
.milestone:nth-child(2) { animation-delay: 0.3s; }
.milestone:nth-child(3) { animation-delay: 0.6s; }
.milestone:nth-child(4) { animation-delay: 0.9s; }
.milestone:nth-child(5) { animation-delay: 1.2s; }
.year {
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.event {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: inherit;
}
.status {
  font-size: 13px;
  color: rgba(0,0,0,0.5);
}
.window-closing {
  text-align: center;
  margin-top: 30px;
  padding: 24px;
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 12px;
}
.window-text {
  font-size: 18px;
  font-weight: 700;
  color: inherit;
}`
      }
    });

    // Slide 2: Add pattern recognition demo after text blocks
    slides[1].blocks.push({
      id: 'whatis-2-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="demo-container">
  <div class="demo-box">
    <div class="demo-title">Pattern Recognition Demo</div>
    <div class="pattern-row">
      <div class="pattern-item">cat</div>
      <div class="arrow">→</div>
      <div class="pattern-item">dog</div>
      <div class="arrow">→</div>
      <div class="pattern-item prediction">?</div>
    </div>
    <div style="text-align: center; margin-top: 10px; font-size: 13px; color: rgba(0,0,0,0.5);">
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

  <div style="text-align: center; padding: 20px; background: rgba(0,0,0,0.05); border-radius: 12px; font-size: 14px;">
    <strong>That's it.</strong> AI doesn't "think" — it predicts patterns.
  </div>
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 40px 20px;
}
.demo-container { max-width: 600px; width: 100%; margin: 0 auto; }
.demo-box {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
}
.demo-title {
  font-size: 14px;
  color: rgba(0,0,0,0.6);
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
  background: rgba(0,0,0,0.05);
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.arrow {
  font-size: 24px;
  color: rgba(0,0,0,0.3);
}
.prediction {
  background: rgba(0,0,0,0.08);
  border: 2px solid rgba(0,0,0,0.2);
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
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
}
.example strong { color: inherit; font-weight: 700; }`
      }
    });

    // Slide 3: Add clickable landscape tools after text blocks
    slides[2].blocks.push({
      id: 'landscape-3-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="grid">
  <a href="https://chat.openai.com" target="_blank" class="card">
    <div class="category">Text AI</div>
    <div class="model-name">ChatGPT</div>
    <div class="model-desc">Best for general use, creative writing, brainstorming</div>
    <span class="model-tag">OpenAI</span>
    <span class="model-tag">1M tokens</span>
  </a>

  <a href="https://claude.ai" target="_blank" class="card">
    <div class="category">Text AI</div>
    <div class="model-name">Claude</div>
    <div class="model-desc">Best for coding, technical work, long documents</div>
    <span class="model-tag">Anthropic</span>
    <span class="model-tag">200K tokens</span>
  </a>

  <a href="https://gemini.google.com" target="_blank" class="card">
    <div class="category">Text AI</div>
    <div class="model-name">Gemini</div>
    <div class="model-desc">Massive context, great for research</div>
    <span class="model-tag">Google</span>
    <span class="model-tag">2M tokens</span>
  </a>

  <a href="https://flux.ai" target="_blank" class="card">
    <div class="category">Image AI</div>
    <div class="model-name">Flux</div>
    <div class="model-desc">Hyper-realistic product shots</div>
    <span class="model-tag hot">New</span>
    <span class="model-tag">Professional</span>
  </a>

  <a href="https://veo.google" target="_blank" class="card">
    <div class="category">Video AI</div>
    <div class="model-name">Veo 3</div>
    <div class="model-desc">Cinematic quality + native audio</div>
    <span class="model-tag hot">Hot</span>
    <span class="model-tag">Google</span>
  </a>

  <a href="https://klingai.com" target="_blank" class="card">
    <div class="category">Video AI</div>
    <div class="model-name">Kling 2.5</div>
    <div class="model-desc">Best motion quality</div>
    <span class="model-tag hot">Cutting Edge</span>
    <span class="model-tag">Action</span>
  </a>

  <a href="https://elevenlabs.io" target="_blank" class="card">
    <div class="category">Audio AI</div>
    <div class="model-name">ElevenLabs</div>
    <div class="model-desc">Voice cloning, text-to-speech</div>
    <span class="model-tag">Voice</span>
  </a>

  <a href="https://suno.ai" target="_blank" class="card">
    <div class="category">Music AI</div>
    <div class="model-name">Suno</div>
    <div class="model-desc">Generate full songs from text</div>
    <span class="model-tag hot">Game Changer</span>
  </a>
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
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
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
}
.card:hover {
  background: rgba(0,0,0,0.06);
  border-color: rgba(0,0,0,0.2);
  transform: translateY(-4px);
}
.category {
  font-size: 12px;
  color: rgba(0,0,0,0.5);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.model-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: inherit;
}
.model-desc {
  font-size: 13px;
  color: rgba(0,0,0,0.6);
  line-height: 1.6;
  margin-bottom: 16px;
}
.model-tag {
  display: inline-block;
  background: rgba(0,0,0,0.08);
  color: inherit;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
  margin-bottom: 6px;
}
.hot {
  background: rgba(0,0,0,0.15);
  font-weight: 700;
}`
      }
    });

    // Slide 4: Add student vs professional comparison after text blocks
    slides[3].blocks.push({
      id: 'advantage-4-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="comparison">
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
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
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
  color: rgba(0,0,0,0.2);
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
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.15);
  color: rgba(0,0,0,0.6);
}
.student {
  background: rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.2);
  color: inherit;
  font-weight: 700;
}
.category {
  font-size: 12px;
  color: rgba(0,0,0,0.4);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 1px;
}
.score {
  margin-top: 30px;
  text-align: center;
  padding: 24px;
  background: rgba(0,0,0,0.05);
  border-radius: 12px;
  border: 2px solid rgba(0,0,0,0.15);
}
.score-text {
  font-size: 20px;
  font-weight: 700;
  color: inherit;
}`
      }
    });

    // Slide 5: Add industry applications grid after text blocks
    slides[4].blocks.push({
      id: 'applies-5-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="industries">
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
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
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
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
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
  background: rgba(0,0,0,0.8);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.industry:hover::before {
  transform: translateX(0);
}
.industry:hover {
  background: rgba(0,0,0,0.06);
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
  color: rgba(0,0,0,0.6);
  line-height: 1.5;
}
.hot-badge {
  display: inline-block;
  background: rgba(0,0,0,0.1);
  color: inherit;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 8px;
}`
      }
    });

    // Slide 6: Add Forefront principles after text blocks
    slides[5].blocks.push({
      id: 'forefront-6-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="container">
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
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 40px 20px;
}
.container {
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}
.principle {
  background: rgba(0,0,0,0.03);
  border-left: 4px solid rgba(0,0,0,0.8);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}
.principle:hover {
  background: rgba(0,0,0,0.06);
  transform: translateX(8px);
}
.principle-title {
  font-size: 18px;
  font-weight: 700;
  color: inherit;
  margin-bottom: 8px;
}
.principle-desc {
  font-size: 14px;
  color: rgba(0,0,0,0.7);
  line-height: 1.6;
}
.manifesto {
  text-align: center;
  margin-top: 40px;
  padding: 32px;
  background: rgba(0,0,0,0.05);
  border: 2px solid rgba(0,0,0,0.15);
  border-radius: 16px;
}
.manifesto-text {
  font-size: 24px;
  font-weight: 900;
  color: inherit;
  letter-spacing: -0.5px;
}`
      }
    });

    // Slide 7: Add module roadmap cards after text blocks
    slides[6].blocks.push({
      id: 'modules-7-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="modules">
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
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 30px 20px;
}
.modules {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}
.module {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
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
  background: rgba(0,0,0,0.8);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.3s ease;
}
.module:hover::before {
  transform: scaleY(1);
  transform-origin: top;
}
.module:hover {
  background: rgba(0,0,0,0.06);
  border-color: rgba(0,0,0,0.2);
}
.module-number {
  font-size: 12px;
  color: rgba(0,0,0,0.5);
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
  color: rgba(0,0,0,0.6);
  line-height: 1.6;
}
.popular {
  display: inline-block;
  background: rgba(0,0,0,0.1);
  color: inherit;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 12px;
}`
      }
    });

    // Slide 8: Add interactive glossary after text blocks
    slides[7].blocks.push({
      id: 'terms-8-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="glossary">
  <div class="term">
    <div class="term-word">LLM</div>
    <div class="term-def">Large Language Model. The AI that powers ChatGPT, Claude, Gemini.</div>
  </div>

  <div class="term">
    <div class="term-word">Prompt</div>
    <div class="term-def">The instructions you give to AI. Better prompts = better outputs.</div>
  </div>

  <div class="term">
    <div class="term-word">Context Window</div>
    <div class="term-def">How much text AI can "remember" at once. Bigger = smarter conversations.</div>
  </div>

  <div class="term">
    <div class="term-word">Fine-Tuning</div>
    <div class="term-def">Training AI on specific data to specialize in your task.</div>
  </div>

  <div class="term">
    <div class="term-word">Inference</div>
    <div class="term-def">When AI generates an output. Each generation costs compute.</div>
  </div>

  <div class="term">
    <div class="term-word">Tokens</div>
    <div class="term-def">AI doesn't read words—it reads tokens. ~750 words = 1000 tokens.</div>
  </div>

  <div class="term">
    <div class="term-word">Temperature</div>
    <div class="term-def">How creative AI gets. Low = factual. High = wild & experimental.</div>
  </div>

  <div class="term">
    <div class="term-word">Latency</div>
    <div class="term-def">How fast AI responds. Matters for real-time apps.</div>
  </div>
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 30px 20px;
}
.glossary {
  max-width: 700px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}
.term {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.term:hover {
  background: rgba(0,0,0,0.06);
  border-color: rgba(0,0,0,0.2);
}
.term-word {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: inherit;
}
.term-def {
  font-size: 14px;
  color: rgba(0,0,0,0.7);
  line-height: 1.6;
}`
      }
    });

    // Slide 9: Add do/don't comparison after text blocks
    slides[8].blocks.push({
      id: 'slop-9-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="comparison-grid">
  <div class="column dont">
    <div class="column-header">❌ How to Make Slop</div>
    <div class="item">Generic prompts: "Write me a blog post"</div>
    <div class="item">Accept first output without iteration</div>
    <div class="item">No human editing or polish</div>
    <div class="item">Same tone for every brand</div>
    <div class="item">AI handles 100% of the work</div>
  </div>

  <div class="column do">
    <div class="column-header">✅ How to Use AI Right</div>
    <div class="item">Specific context: "Write a casual LinkedIn post about..."</div>
    <div class="item">Iterate 3-5 times, refining each time</div>
    <div class="item">Edit for voice, polish, authenticity</div>
    <div class="item">Train AI on your brand's style</div>
    <div class="item">AI handles 70%, you add the magic 30%</div>
  </div>
</div>

<div class="bottom-rule">
  <strong>Golden Rule:</strong> AI amplifies your ideas. It doesn't replace your judgment.
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 30px 20px;
}
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 900px;
  margin: 0 auto 30px;
}
.column {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  padding: 24px;
}
.dont {
  opacity: 0.6;
}
.do {
  border: 2px solid rgba(0,0,0,0.2);
}
.column-header {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0,0,0,0.1);
}
.item {
  font-size: 14px;
  line-height: 1.6;
  padding: 12px;
  background: rgba(0,0,0,0.02);
  border-radius: 8px;
  margin-bottom: 12px;
}
.bottom-rule {
  text-align: center;
  padding: 24px;
  background: rgba(0,0,0,0.05);
  border-radius: 12px;
  max-width: 700px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
}`
      }
    });

    // Slide 10: Add checklist with CTAs after text blocks
    slides[9].blocks.push({
      id: 'next-10-interactive',
      type: 'codePreview',
      data: {
        html: `<div class="checklist-container">
  <div class="checklist">
    <div class="check-item">
      <input type="checkbox" id="ch1">
      <label for="ch1">Create ChatGPT, Claude, and Gemini accounts</label>
    </div>

    <div class="check-item">
      <input type="checkbox" id="ch2">
      <label for="ch2">Test 3 different AI models with the same prompt</label>
    </div>

    <div class="check-item">
      <input type="checkbox" id="ch3">
      <label for="ch3">Experiment with prompt temperature settings</label>
    </div>

    <div class="check-item">
      <input type="checkbox" id="ch4">
      <label for="ch4">Choose your first module to dive into</label>
    </div>

    <div class="check-item">
      <input type="checkbox" id="ch5">
      <label for="ch5">Join the Forefront Discord community</label>
    </div>
  </div>

  <div class="cta-grid">
    <div class="cta">
      <div class="cta-title">Ready to Build?</div>
      <div class="cta-desc">Start with Vibe Code and ship your first AI-powered app</div>
      <div class="cta-arrow">→ Module 02</div>
    </div>

    <div class="cta">
      <div class="cta-title">Want to Create?</div>
      <div class="cta-desc">Learn video generation and start making content that converts</div>
      <div class="cta-arrow">→ Module 03</div>
    </div>
  </div>
</div>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  color: inherit;
  padding: 30px 20px;
}
.checklist-container {
  max-width: 700px;
  margin: 0 auto;
}
.checklist {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
}
.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0,0,0,0.02);
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.check-item:hover {
  background: rgba(0,0,0,0.05);
}
input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
label {
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.cta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.cta {
  background: rgba(0,0,0,0.05);
  border: 2px solid rgba(0,0,0,0.15);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.cta:hover {
  background: rgba(0,0,0,0.08);
  transform: translateY(-4px);
}
.cta-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}
.cta-desc {
  font-size: 13px;
  color: rgba(0,0,0,0.6);
  line-height: 1.6;
  margin-bottom: 16px;
}
.cta-arrow {
  font-size: 14px;
  font-weight: 700;
  color: inherit;
}`
      }
    });

    // Update the module in the database
    await sql`
      UPDATE modules
      SET
        slides = ${JSON.stringify(slides)},
        updated_at = NOW()
      WHERE module_id = 'module-vibe-coding-2025'
    `;

    console.log('✅ Module 1 updated successfully with embedded black/white interactive elements!');
    console.log('📋 All original text blocks preserved');
    console.log('🎨 Interactive elements added with black/white styling');
    console.log('🔗 Landscape tool cards are now clickable links');
    console.log('📱 Transparent backgrounds for seamless embedding');

  } catch (error) {
    console.error('❌ Error updating module:', error);
    process.exit(1);
  }
})();
