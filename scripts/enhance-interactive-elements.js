import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('✨ Enhancing interactive elements with better sizing and interactivity...\n')

// Get current module
const module = await sql`SELECT * FROM modules WHERE module_id = 'module-vibe-coding-2025'`.then(r => r[0])
const slides = JSON.parse(JSON.stringify(module.slides))

// Update Slide 1 - Enhanced Timeline with animations
const slide1VizIndex = slides[0].blocks.findIndex(b => b.id === 'window-1-viz')
if (slide1VizIndex !== -1) {
  slides[0].blocks[slide1VizIndex] = {
    id: 'window-1-viz',
    type: 'codePreview',
    data: {
      html: `<div class="timeline-container">
  <div class="progress-bar">
    <div class="progress-fill"></div>
  </div>
  <div class="milestones">
    <div class="milestone" data-year="2022">
      <div class="milestone-year">2022</div>
      <div class="milestone-title">ChatGPT Launches</div>
      <div class="milestone-desc">Public AI revolution begins</div>
    </div>
    <div class="milestone" data-year="2023">
      <div class="milestone-year">2023-24</div>
      <div class="milestone-title">AI Explosion</div>
      <div class="milestone-desc">Claude, Gemini, Midjourney, Stable Diffusion</div>
    </div>
    <div class="milestone active" data-year="2025">
      <div class="milestone-year">2025</div>
      <div class="milestone-title">⏰ The Window Is Open</div>
      <div class="milestone-desc">Students master tools before everyone else</div>
    </div>
    <div class="milestone future" data-year="2027">
      <div class="milestone-year">2026-27</div>
      <div class="milestone-title">Window Closes</div>
      <div class="milestone-desc">Everyone knows AI. Early advantage disappears.</div>
    </div>
  </div>
</div>

<style>
.timeline-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 40px 30px;
  background: var(--bg-subtle);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 40px;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: var(--text-color);
  animation: fillProgress 2.5s ease-out forwards;
  border-radius: 3px;
}

@keyframes fillProgress {
  to { width: 70%; }
}

.milestones {
  display: grid;
  gap: 16px;
}

.milestone {
  padding: 18px 20px;
  background: var(--bg-subtle-alt);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideIn 0.5s ease-out forwards;
}

.milestone:nth-child(1) { animation-delay: 0.3s; }
.milestone:nth-child(2) { animation-delay: 0.6s; }
.milestone:nth-child(3) { animation-delay: 0.9s; }
.milestone:nth-child(4) { animation-delay: 1.2s; }

@keyframes slideIn {
  to { opacity: 1; transform: translateX(0); }
}

.milestone:hover {
  background: var(--bg-subtle);
  border-color: var(--text-color);
  transform: translateX(4px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.milestone.active {
  border: 2px solid var(--text-color);
  background: var(--bg-subtle);
}

.milestone.future {
  opacity: 0.5;
}

.milestone.future:hover {
  opacity: 0.7;
}

.milestone-year {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 6px;
}

.milestone-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.milestone-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>`,
      css: ''
    }
  }
}

// Update Slide 2 - Interactive Pattern Recognition Demo
const slide2VizIndex = slides[1].blocks.findIndex(b => b.id === 'whatis-2-viz')
if (slide2VizIndex !== -1) {
  slides[1].blocks[slide2VizIndex] = {
    id: 'whatis-2-viz',
    type: 'codePreview',
    data: {
      html: `<div class="pattern-demo">
  <div class="demo-label">Pattern Recognition Demo</div>
  <div class="pattern-flow">
    <div class="pattern-box" onclick="this.classList.toggle('active')">
      <div class="pattern-emoji">🐱</div>
      <div class="pattern-text">cat</div>
    </div>
    <div class="arrow">→</div>
    <div class="pattern-box" onclick="this.classList.toggle('active')">
      <div class="pattern-emoji">🐕</div>
      <div class="pattern-text">dog</div>
    </div>
    <div class="arrow">→</div>
    <div class="pattern-box prediction" onclick="this.classList.toggle('revealed')">
      <div class="pattern-emoji">❓</div>
      <div class="pattern-text">?</div>
    </div>
  </div>
  <div class="prediction-result">
    <div class="result-label">AI predicts:</div>
    <div class="predictions">
      <span class="pred-tag">pet</span>
      <span class="pred-tag">animal</span>
      <span class="pred-tag">puppy</span>
    </div>
  </div>
  <div class="demo-hint">💡 Click the boxes to interact</div>
</div>

<style>
.pattern-demo {
  max-width: 550px;
  margin: 40px auto;
  padding: 35px;
  background: var(--bg-subtle);
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.demo-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 25px;
}

.pattern-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.pattern-box {
  padding: 20px 24px;
  background: var(--bg-subtle-alt);
  border-radius: 12px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.pattern-box:hover {
  border-color: var(--text-color);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.pattern-box.active {
  background: var(--bg-subtle);
  border-color: var(--text-color);
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.pattern-emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.pattern-text {
  font-weight: 700;
  font-size: 15px;
}

.prediction {
  border-style: dashed;
  animation: pulse 2s ease-in-out infinite;
}

.prediction.revealed {
  animation: none;
  background: var(--bg-subtle);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

.arrow {
  font-size: 24px;
  color: var(--text-secondary);
  user-select: none;
}

.prediction-result {
  padding: 20px;
  background: var(--bg-subtle-alt);
  border-radius: 10px;
  margin-bottom: 15px;
}

.result-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-weight: 600;
}

.predictions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.pred-tag {
  padding: 6px 12px;
  background: var(--bg-subtle);
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.pred-tag:hover {
  border-color: var(--text-color);
  transform: scale(1.1);
}

.demo-hint {
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 15px;
}
</style>`,
      css: ''
    }
  }
}

// Update Slide 3 - Enhanced Clickable Tool Grid
const slide3VizIndex = slides[2].blocks.findIndex(b => b.id === 'landscape-3-viz')
if (slide3VizIndex !== -1) {
  slides[2].blocks[slide3VizIndex] = {
    id: 'landscape-3-viz',
    type: 'codePreview',
    data: {
      html: `<div class="tools-grid">
  <a href="https://chat.openai.com" target="_blank" class="tool-card">
    <div class="tool-icon">💬</div>
    <div class="tool-category">Text AI</div>
    <div class="tool-name">ChatGPT</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://claude.ai" target="_blank" class="tool-card">
    <div class="tool-icon">🧠</div>
    <div class="tool-category">Text AI</div>
    <div class="tool-name">Claude</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://gemini.google.com" target="_blank" class="tool-card">
    <div class="tool-icon">✨</div>
    <div class="tool-category">Text AI</div>
    <div class="tool-name">Gemini</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://flux.ai" target="_blank" class="tool-card">
    <div class="tool-icon">🎨</div>
    <div class="tool-category">Image AI</div>
    <div class="tool-name">Flux</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://veo.google" target="_blank" class="tool-card hot">
    <div class="tool-badge">🔥 Hot</div>
    <div class="tool-icon">🎬</div>
    <div class="tool-category">Video AI</div>
    <div class="tool-name">Veo 3</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://klingai.com" target="_blank" class="tool-card hot">
    <div class="tool-badge">🔥 Hot</div>
    <div class="tool-icon">🎥</div>
    <div class="tool-category">Video AI</div>
    <div class="tool-name">Kling 2.5</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://elevenlabs.io" target="_blank" class="tool-card">
    <div class="tool-icon">🎙️</div>
    <div class="tool-category">Audio AI</div>
    <div class="tool-name">ElevenLabs</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
  <a href="https://suno.ai" target="_blank" class="tool-card">
    <div class="tool-icon">🎵</div>
    <div class="tool-category">Music AI</div>
    <div class="tool-name">Suno</div>
    <div class="tool-hover">→ Try it now</div>
  </a>
</div>

<style>
.tools-grid {
  max-width: 700px;
  margin: 40px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}

.tool-card {
  position: relative;
  padding: 22px 18px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-align: center;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--text-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tool-card:hover::before {
  transform: scaleX(1);
}

.tool-card:hover {
  background: var(--bg-subtle-alt);
  border-color: var(--text-color);
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tool-card.hot {
  border: 2px solid var(--text-color);
}

.tool-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  padding: 3px 8px;
  background: var(--bg-subtle-alt);
  border-radius: 6px;
  font-weight: 700;
}

.tool-icon {
  font-size: 32px;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.tool-card:hover .tool-icon {
  transform: scale(1.2) rotate(5deg);
}

.tool-category {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.tool-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
}

.tool-hover {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity 0.3s ease;
  font-weight: 600;
}

.tool-card:hover .tool-hover {
  opacity: 1;
}

@media (max-width: 600px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 12px;
  }

  .tool-card {
    padding: 18px 14px;
  }
}
</style>`,
      css: ''
    }
  }
}

// Update the module in the database
await sql`
  UPDATE modules
  SET
    slides = ${JSON.stringify(slides)},
    updated_at = NOW()
  WHERE module_id = 'module-vibe-coding-2025'
`

console.log('✅ Interactive elements enhanced!')
console.log('📏 Better sizing and spacing')
console.log('✨ Added hover effects and animations')
console.log('🎯 Click interactions on pattern demo')
console.log('🔥 Hot badges for trending tools')
console.log('📱 Responsive grid layouts')
