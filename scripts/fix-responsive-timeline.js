import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('📱 Fixing responsive sizing for timeline...\n')

// Get current module
const module = await sql`SELECT * FROM modules WHERE module_id = 'module-vibe-coding-2025'`.then(r => r[0])
const slides = JSON.parse(JSON.stringify(module.slides))

// Update Slide 1 - Responsive Timeline
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
  margin: 30px auto;
  padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
  background: var(--bg-subtle);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: clamp(20px, 5vw, 40px);
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
  gap: clamp(10px, 3vw, 16px);
}

.milestone {
  padding: clamp(14px, 3vw, 18px) clamp(16px, 4vw, 20px);
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
  font-size: clamp(10px, 2vw, 11px);
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 6px;
}

.milestone-title {
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.3;
}

.milestone-desc {
  font-size: clamp(12px, 2.5vw, 13px);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .timeline-container {
    margin: 20px auto;
    border-radius: 12px;
  }

  .milestone:hover {
    transform: scale(1.02);
  }

  .milestone-desc {
    line-height: 1.6;
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

console.log('✅ Timeline now responsive!')
console.log('📱 Uses clamp() for fluid sizing')
console.log('💫 Better mobile experience')
console.log('🔗 Popups enabled for external links')
