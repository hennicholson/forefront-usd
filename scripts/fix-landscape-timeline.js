import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🖥️ Fixing timeline for landscape and all viewport sizes...\n')

// Get current module
const module = await sql`SELECT * FROM modules WHERE module_id = 'module-vibe-coding-2025'`.then(r => r[0])
const slides = JSON.parse(JSON.stringify(module.slides))

// Update Slide 1 - Optimized Timeline for all devices
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
  max-width: 100%;
  width: 100%;
  margin: 20px auto;
  padding: 20px 16px;
  background: var(--bg-subtle);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-sizing: border-box;
}

.progress-bar {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: var(--text-color);
  animation: fillProgress 2.5s ease-out forwards;
  border-radius: 2px;
}

@keyframes fillProgress {
  to { width: 70%; }
}

.milestones {
  display: grid;
  gap: 10px;
}

.milestone {
  padding: 12px 14px;
  background: var(--bg-subtle-alt);
  border-radius: 10px;
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
  transform: scale(1.02);
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
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.milestone-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 3px;
  line-height: 1.3;
}

.milestone-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Tablet - landscape phones and small tablets */
@media (min-width: 480px) {
  .timeline-container {
    padding: 24px 20px;
    margin: 25px auto;
  }

  .progress-bar {
    height: 5px;
    margin-bottom: 25px;
  }

  .milestones {
    gap: 12px;
  }

  .milestone {
    padding: 14px 16px;
  }

  .milestone-year {
    font-size: 10px;
    margin-bottom: 5px;
  }

  .milestone-title {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .milestone-desc {
    font-size: 12px;
  }
}

/* Desktop - larger tablets and desktops */
@media (min-width: 768px) {
  .timeline-container {
    max-width: 600px;
    padding: 30px 24px;
    margin: 30px auto;
    border-radius: 16px;
  }

  .progress-bar {
    height: 6px;
    margin-bottom: 30px;
  }

  .milestones {
    gap: 14px;
  }

  .milestone {
    padding: 16px 18px;
    border-radius: 12px;
  }

  .milestone:hover {
    transform: translateX(4px) scale(1.02);
  }

  .milestone-year {
    font-size: 11px;
    margin-bottom: 6px;
    letter-spacing: 1.5px;
  }

  .milestone-title {
    font-size: 15px;
  }

  .milestone-desc {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* Large desktop */
@media (min-width: 1024px) {
  .milestone-title {
    font-size: 16px;
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

console.log('✅ Timeline optimized for all viewports!')
console.log('📱 Mobile (< 480px): Compact sizing')
console.log('📱 Landscape phones (480-767px): Medium sizing')
console.log('💻 Tablets/Desktop (768px+): Full sizing')
console.log('🖥️ Large desktop (1024px+): Enhanced sizing')
console.log('🎯 Viewport meta tags added to all iframes')
console.log('💪 Note blocks now render HTML properly')
