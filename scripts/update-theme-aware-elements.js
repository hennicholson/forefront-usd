import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🎨 Updating interactive elements to use theme-aware colors...\n')

// Get current module
const module = await sql`SELECT * FROM modules WHERE module_id = 'module-vibe-coding-2025'`.then(r => r[0])
const slides = JSON.parse(JSON.stringify(module.slides))

// Update Slide 1 - Timeline visualization
const slide1VizIndex = slides[0].blocks.findIndex(b => b.id === 'window-1-viz')
if (slide1VizIndex !== -1) {
  slides[0].blocks[slide1VizIndex] = {
    id: 'window-1-viz',
    type: 'codePreview',
    data: {
      html: `<div style="max-width: 500px; margin: 40px auto; padding: 30px; background: var(--bg-subtle); border-radius: 12px; border: 1px solid var(--border-color);">
  <div style="height: 4px; background: var(--border-color); border-radius: 2px; overflow: hidden; margin-bottom: 30px;">
    <div style="height: 100%; width: 70%; background: var(--text-color); animation: grow 2s ease-out;"></div>
  </div>
  <div style="display: grid; gap: 12px; font-size: 13px;">
    <div style="padding: 12px; background: var(--bg-subtle-alt); border-radius: 8px;">
      <strong>2022:</strong> ChatGPT launches
    </div>
    <div style="padding: 12px; background: var(--bg-subtle-alt); border-radius: 8px;">
      <strong>2023-24:</strong> AI explosion
    </div>
    <div style="padding: 12px; background: var(--bg-subtle-alt); border-radius: 8px; border: 2px solid var(--text-color);">
      <strong>2025:</strong> ⏰ Window is open
    </div>
    <div style="padding: 12px; background: var(--bg-subtle-alt); border-radius: 8px; opacity: 0.5;">
      <strong>2026-27:</strong> Window closes
    </div>
  </div>
</div>
<style>
@keyframes grow { from { width: 0%; } }
</style>`,
      css: ''
    }
  }
}

// Update Slide 2 - Pattern recognition demo
const slide2VizIndex = slides[1].blocks.findIndex(b => b.id === 'whatis-2-viz')
if (slide2VizIndex !== -1) {
  slides[1].blocks[slide2VizIndex] = {
    id: 'whatis-2-viz',
    type: 'codePreview',
    data: {
      html: `<div style="max-width: 450px; margin: 30px auto; padding: 25px; background: var(--bg-subtle); border-radius: 12px; text-align: center;">
  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Pattern Recognition</div>
  <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
    <div style="padding: 12px 20px; background: var(--bg-subtle-alt); border-radius: 8px; font-weight: 600;">cat</div>
    <div style="font-size: 20px; color: var(--text-secondary);">→</div>
    <div style="padding: 12px 20px; background: var(--bg-subtle-alt); border-radius: 8px; font-weight: 600;">dog</div>
    <div style="font-size: 20px; color: var(--text-secondary);">→</div>
    <div style="padding: 12px 20px; background: var(--bg-subtle-alt); border: 2px solid var(--text-color); border-radius: 8px; font-weight: 700;">?</div>
  </div>
  <div style="font-size: 12px; color: var(--text-secondary);">AI predicts: <strong>pet, animal, puppy</strong></div>
</div>`,
      css: ''
    }
  }
}

// Update Slide 3 - Clickable landscape tools
const slide3VizIndex = slides[2].blocks.findIndex(b => b.id === 'landscape-3-viz')
if (slide3VizIndex !== -1) {
  slides[2].blocks[slide3VizIndex] = {
    id: 'landscape-3-viz',
    type: 'codePreview',
    data: {
      html: `<div style="max-width: 600px; margin: 30px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
  <a href="https://chat.openai.com" target="_blank" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px;">TEXT AI</div>
    <div style="font-weight: 700; font-size: 15px;">ChatGPT</div>
  </a>
  <a href="https://claude.ai" target="_blank" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px;">TEXT AI</div>
    <div style="font-weight: 700; font-size: 15px;">Claude</div>
  </a>
  <a href="https://gemini.google.com" target="_blank" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px;">TEXT AI</div>
    <div style="font-weight: 700; font-size: 15px;">Gemini</div>
  </a>
  <a href="https://flux.ai" target="_blank" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px;">IMAGE AI</div>
    <div style="font-weight: 700; font-size: 15px;">Flux</div>
  </a>
  <a href="https://veo.google" target="_blank" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px;">VIDEO AI</div>
    <div style="font-weight: 700; font-size: 15px;">Veo 3</div>
  </a>
  <a href="https://klingai.com" target="_blank" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px;">VIDEO AI</div>
    <div style="font-weight: 700; font-size: 15px;">Kling 2.5</div>
  </a>
</div>
<style>
a:hover {
  background: var(--bg-subtle-alt) !important;
  transform: translateY(-2px);
  border-color: var(--text-color) !important;
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

console.log('✅ Interactive elements updated with theme-aware colors!')
console.log('🎨 Now using CSS variables that adapt to light/dark theme')
console.log('🔤 Using site fonts: -apple-system, BlinkMacSystemFont, etc.')
console.log('📱 Colors will automatically match the theme')
