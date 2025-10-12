export interface Module {
  id: string | number
  moduleId?: string
  slug: string
  title: string
  category: 'coding' | 'marketing' | 'content' | 'music' | 'automation'
  categoryColor: string
  description: string
  thumbnail: string
  introVideo: string
  instructor: {
    name: string
    photo: string
    year: string
    major: string
  }
  duration: string
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  learningObjectives: string[]
  keyTakeaways: string[]
  resources: Array<{
    title: string
    url: string
  }>
  slides: Slide[]
  relatedModules?: string[]
}

export interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'video' | 'note' | 'codePreview' | 'chart' | 'quiz'
  data: any
}

export interface Slide {
  id: string | number
  title: string
  description?: string
  blocks: ContentBlock[]
}

// Temporary placeholder - modules will be loaded from database via API
export const modules: Module[] = []
