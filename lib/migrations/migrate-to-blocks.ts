/**
 * Migration utility to convert all legacy module content to blocks-only structure
 * Run this once to standardize all existing modules
 */

interface LegacySlide {
  id: number
  title: string
  description?: string
  content?: {
    heading?: string
    body?: string
    bulletPoints?: string[]
    code?: {
      language: string
      snippet: string
    }
    note?: string
    image?: string
    video?: string
  }
  blocks?: any[]
}

interface ContentBlock {
  id: string
  type: string
  data: any
}

export function migrateLegacySlideToBlocks(slide: LegacySlide): any {
  // If slide already has blocks and no legacy content, return as-is
  if (slide.blocks && slide.blocks.length > 0 && !slide.content) {
    return slide
  }

  const blocks: ContentBlock[] = slide.blocks ? [...slide.blocks] : []
  let blockIdCounter = Date.now()

  // Migrate legacy content fields to blocks
  if (slide.content) {
    // 1. Heading → Text block
    if (slide.content.heading) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'text',
        data: {
          html: `<h2>${slide.content.heading}</h2>`,
          text: slide.content.heading
        }
      })
    }

    // 2. Body → Text block
    if (slide.content.body) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'text',
        data: {
          html: `<p>${slide.content.body.replace(/\n/g, '<br>')}</p>`,
          text: slide.content.body
        }
      })
    }

    // 3. Bullet points → Text block with list
    if (slide.content.bulletPoints && slide.content.bulletPoints.length > 0) {
      const listHtml = `<ul>${slide.content.bulletPoints.map(point => `<li>${point}</li>`).join('')}</ul>`
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'text',
        data: {
          html: listHtml,
          text: slide.content.bulletPoints.join('\n')
        }
      })
    }

    // 4. Code → Code block
    if (slide.content.code) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'code',
        data: {
          language: slide.content.code.language || 'javascript',
          code: slide.content.code.snippet
        }
      })
    }

    // 5. Note → Note block
    if (slide.content.note) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'note',
        data: {
          text: slide.content.note
        }
      })
    }

    // 6. Image → Image block
    if (slide.content.image) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'image',
        data: {
          src: slide.content.image,
          alt: slide.title || 'Image'
        }
      })
    }

    // 7. Video → Video block
    if (slide.content.video) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        type: 'video',
        data: {
          url: slide.content.video
        }
      })
    }
  }

  // Return new slide structure (blocks-only, no content field)
  return {
    id: slide.id,
    title: slide.title,
    description: slide.description || '',
    blocks
  }
}

export function migrateModuleToBlocksOnly(module: any): any {
  if (!module.slides) {
    return module
  }

  const migratedSlides = module.slides.map((slide: LegacySlide) =>
    migrateLegacySlideToBlocks(slide)
  )

  return {
    ...module,
    slides: migratedSlides
  }
}
