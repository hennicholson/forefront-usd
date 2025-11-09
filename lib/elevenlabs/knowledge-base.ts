/**
 * ElevenLabs Knowledge Base utilities
 * Handles chunking module content and uploading to ElevenLabs KB
 */

interface ContentBlock {
  id: string
  type: string
  data: any
}

interface Slide {
  id: string | number
  title: string
  description?: string
  type?: string
  blocks: ContentBlock[]
}

interface Module {
  id: string | number
  moduleId?: string
  title: string
  description: string
  slug: string
  slides: Slide[]
}

interface Chunk {
  text: string
  metadata: {
    moduleId: string
    moduleTitle: string
    slideId: string
    slideTitle: string
    slideType?: string
    blockType?: string
    slug: string
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  if (!html) return ''

  return html
    // Replace <br>, <br/>, <br /> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace closing p, div, h1-h6 tags with double newlines
    .replace(/<\/(p|div|h[1-6])>/gi, '\n\n')
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extract text content from a content block
 */
function extractBlockText(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
    case 'markdown':
      // Text blocks store content in the 'html' field
      const html = block.data?.html || block.data?.text || block.data?.content || ''
      return stripHtml(html)

    case 'code':
      const code = block.data?.code || block.data?.content || ''
      const language = block.data?.language || 'code'
      const description = block.data?.description || ''
      return `${description ? description + '\n' : ''}\`\`\`${language}\n${code}\n\`\`\``

    case 'codePreview':
      // CodePreview blocks have separate js, css, and html fields
      const parts: string[] = []

      if (block.data?.html) {
        parts.push('```html\n' + block.data.html + '\n```')
      }
      if (block.data?.css) {
        parts.push('```css\n' + block.data.css + '\n```')
      }
      if (block.data?.js) {
        parts.push('```javascript\n' + block.data.js + '\n```')
      }

      return parts.length > 0
        ? 'Interactive Code Example:\n\n' + parts.join('\n\n')
        : ''

    case 'note':
      // Note blocks use 'text' field which may contain HTML
      const noteText = block.data?.text || block.data?.content || ''
      return `📝 Note: ${stripHtml(noteText)}`

    case 'quiz':
    case 'knowledgeCheck':
      const question = block.data?.question || ''
      const options = block.data?.options?.map((opt: any, i: number) =>
        `${String.fromCharCode(65 + i)}. ${opt.text || opt}`
      ).join('\n') || ''
      return `Question: ${question}\n${options}`

    default:
      return JSON.stringify(block.data || '')
  }
}

/**
 * Extract all text content from a slide
 */
function extractSlideText(slide: Slide): string {
  const parts: string[] = []

  // Add slide title and description
  parts.push(`# ${slide.title}`)
  if (slide.description) {
    parts.push(slide.description)
  }

  // Add all block content
  for (const block of slide.blocks) {
    const text = extractBlockText(block)
    if (text.trim()) {
      parts.push(text)
    }
  }

  return parts.join('\n\n')
}

/**
 * Chunk text into smaller pieces with overlap
 * Targets 800-1200 tokens (~3200-4800 characters)
 */
function chunkText(text: string, maxChars: number = 4000, overlap: number = 600): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = start + maxChars

    // If this isn't the last chunk, try to break at a sentence or paragraph
    if (end < text.length) {
      const breakPoints = ['\n\n', '\n', '. ', '! ', '? ']
      let bestBreak = end

      for (const breakPoint of breakPoints) {
        const breakIndex = text.lastIndexOf(breakPoint, end)
        if (breakIndex > start + maxChars / 2) {
          bestBreak = breakIndex + breakPoint.length
          break
        }
      }

      end = bestBreak
    }

    chunks.push(text.substring(start, end).trim())
    start = end - overlap
  }

  return chunks.filter(chunk => chunk.length > 50) // Filter out tiny chunks
}

/**
 * Process a module into chunks suitable for Knowledge Base
 */
export function chunkModule(module: Module): Chunk[] {
  const chunks: Chunk[] = []

  // Add module overview as first chunk
  const overview = `# ${module.title}\n\n${module.description}\n\nThis module contains ${module.slides.length} sections covering various aspects of ${module.title.toLowerCase()}.`
  chunks.push({
    text: overview,
    metadata: {
      moduleId: String(module.id),
      moduleTitle: module.title,
      slideId: 'overview',
      slideTitle: 'Module Overview',
      slug: module.slug,
    }
  })

  // Process each slide
  for (const slide of module.slides) {
    const slideText = extractSlideText(slide)
    const slideChunks = chunkText(slideText)

    // If slide is small enough, keep as single chunk
    if (slideChunks.length === 1) {
      chunks.push({
        text: slideChunks[0],
        metadata: {
          moduleId: String(module.id),
          moduleTitle: module.title,
          slideId: String(slide.id),
          slideTitle: slide.title,
          slideType: slide.type,
          slug: module.slug,
        }
      })
    } else {
      // Split large slides into multiple chunks
      slideChunks.forEach((chunk, index) => {
        chunks.push({
          text: chunk,
          metadata: {
            moduleId: String(module.id),
            moduleTitle: module.title,
            slideId: `${slide.id}-${index + 1}`,
            slideTitle: `${slide.title} (Part ${index + 1})`,
            slideType: slide.type,
            slug: module.slug,
          }
        })
      })
    }
  }

  return chunks
}

/**
 * Generate agent system prompt for a module
 */
export function generateAgentPrompt(module: Module): string {
  return `You are a friendly and knowledgeable AI mentor for the "${module.title}" module on ForeFront.

Your role is to:
- Help students understand the module content by answering their questions
- Provide explanations using ONLY the information from the module knowledge base
- Guide students through challenging concepts with patience and encouragement
- Reference specific sections when relevant
- Admit when you don't know something if it's not covered in the module

Module Overview:
${module.description}

This module has ${module.slides.length} sections covering:
${module.slides.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

Communication Style:
- Be concise but thorough
- Use examples from the module when helpful
- Encourage questions and curiosity
- If a student is stuck, break down concepts into simpler parts
- Always stay positive and supportive

Remember: Only use information from the module knowledge base. If something isn't covered, let the student know and suggest exploring related topics that ARE in the module.`
}
