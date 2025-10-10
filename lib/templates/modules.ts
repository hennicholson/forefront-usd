// Module Templates for Visual Module Creator

export interface ModuleTemplate {
  id: string
  name: string
  description: string
  icon: string
  slideCount: number
  estimatedDuration: string
  slides: TemplateSlide[]
}

export interface TemplateSlide {
  title: string
  description: string
  suggestedBlocks?: Array<{
    type: 'text' | 'code' | 'codePreview' | 'image' | 'video' | 'note' | 'chart'
    placeholder: string
  }>
}

export const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    id: 'quick-tutorial',
    name: 'Quick Tutorial',
    description: 'Perfect for short, focused lessons (15-30 min). Teach one concept thoroughly.',
    icon: '⚡',
    slideCount: 5,
    estimatedDuration: '15-30 min',
    slides: [
      {
        title: 'Introduction',
        description: 'Hook your learners and set expectations',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Explain what they will learn and why it matters' },
          { type: 'video', placeholder: 'Optional intro video or demo' }
        ]
      },
      {
        title: 'Concept Overview',
        description: 'Explain the main concept',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Break down the core concept in simple terms' },
          { type: 'image', placeholder: 'Visual diagram or illustration' }
        ]
      },
      {
        title: 'How It Works',
        description: 'Show the mechanics with examples',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Step-by-step explanation' },
          { type: 'code', placeholder: 'Code example demonstrating the concept' }
        ]
      },
      {
        title: 'Practice Exercise',
        description: 'Let learners apply the concept',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Exercise instructions' },
          { type: 'codePreview', placeholder: 'Interactive coding challenge' }
        ]
      },
      {
        title: 'Summary & Next Steps',
        description: 'Recap and point to additional resources',
        suggestedBlocks: [
          { type: 'note', placeholder: 'Key takeaways from this tutorial' },
          { type: 'text', placeholder: 'What to learn next or practice suggestions' }
        ]
      }
    ]
  },

  {
    id: 'deep-dive',
    name: 'Deep Dive Course',
    description: 'Comprehensive course covering a topic in depth (1-2 hours). Multiple concepts and examples.',
    icon: '🏊',
    slideCount: 15,
    estimatedDuration: '1-2 hours',
    slides: [
      {
        title: 'Course Introduction',
        description: 'Welcome and course overview',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Course description and learning objectives' },
          { type: 'video', placeholder: 'Welcome video from instructor' }
        ]
      },
      {
        title: 'Prerequisites',
        description: 'What learners need to know first',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Required knowledge and skills' },
          { type: 'note', placeholder: 'Links to prerequisite courses' }
        ]
      },
      {
        title: 'Foundation Concepts',
        description: 'Build the fundamentals',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Core terminology and principles' }
        ]
      },
      {
        title: 'Concept 1: Theory',
        description: 'First major concept - theoretical explanation',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Detailed explanation of concept 1' },
          { type: 'image', placeholder: 'Diagram or visualization' }
        ]
      },
      {
        title: 'Concept 1: Practice',
        description: 'Apply concept 1 with examples',
        suggestedBlocks: [
          { type: 'code', placeholder: 'Code examples' },
          { type: 'codePreview', placeholder: 'Interactive demo' }
        ]
      },
      {
        title: 'Concept 2: Theory',
        description: 'Second major concept - theoretical explanation',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Detailed explanation of concept 2' }
        ]
      },
      {
        title: 'Concept 2: Practice',
        description: 'Apply concept 2 with examples',
        suggestedBlocks: [
          { type: 'code', placeholder: 'Code examples' }
        ]
      },
      {
        title: 'Concept 3: Theory',
        description: 'Third major concept',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Detailed explanation of concept 3' }
        ]
      },
      {
        title: 'Concept 3: Practice',
        description: 'Apply concept 3',
        suggestedBlocks: [
          { type: 'code', placeholder: 'Code examples' }
        ]
      },
      {
        title: 'Real-World Application',
        description: 'How professionals use these concepts',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Industry use cases and best practices' },
          { type: 'video', placeholder: 'Case study or demo video' }
        ]
      },
      {
        title: 'Common Pitfalls',
        description: 'Mistakes to avoid',
        suggestedBlocks: [
          { type: 'note', placeholder: 'Common errors and how to fix them' }
        ]
      },
      {
        title: 'Advanced Techniques',
        description: 'Pro tips and optimization',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Advanced patterns and techniques' },
          { type: 'code', placeholder: 'Advanced code examples' }
        ]
      },
      {
        title: 'Final Project',
        description: 'Capstone exercise combining all concepts',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Project requirements and instructions' },
          { type: 'codePreview', placeholder: 'Starter code or sandbox' }
        ]
      },
      {
        title: 'Resources & Further Learning',
        description: 'Additional materials',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Links to documentation, articles, videos' }
        ]
      },
      {
        title: 'Course Summary',
        description: 'Recap and congratulations',
        suggestedBlocks: [
          { type: 'note', placeholder: 'Key takeaways from entire course' },
          { type: 'text', placeholder: 'Next steps in learning journey' }
        ]
      }
    ]
  },

  {
    id: 'workshop',
    name: 'Workshop Format',
    description: 'Hands-on workshop with multiple exercises (45-60 min). Learning by doing.',
    icon: '🔨',
    slideCount: 10,
    estimatedDuration: '45-60 min',
    slides: [
      {
        title: 'Workshop Overview',
        description: 'What we will build today',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Workshop goals and what participants will create' },
          { type: 'image', placeholder: 'Preview of final project' }
        ]
      },
      {
        title: 'Setup Instructions',
        description: 'Getting your environment ready',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Required tools and setup steps' },
          { type: 'code', placeholder: 'Installation commands' }
        ]
      },
      {
        title: 'Exercise 1: Foundation',
        description: 'First hands-on exercise',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Exercise instructions' },
          { type: 'codePreview', placeholder: 'Interactive coding area' },
          { type: 'note', placeholder: 'Hints and tips' }
        ]
      },
      {
        title: 'Exercise 1: Solution',
        description: 'Review and explanation',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Step-by-step solution walkthrough' },
          { type: 'code', placeholder: 'Complete solution code' }
        ]
      },
      {
        title: 'Exercise 2: Building On',
        description: 'Second exercise - adding features',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Exercise instructions' },
          { type: 'codePreview', placeholder: 'Interactive coding area' }
        ]
      },
      {
        title: 'Exercise 2: Solution',
        description: 'Review and explanation',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Solution walkthrough' },
          { type: 'code', placeholder: 'Complete solution code' }
        ]
      },
      {
        title: 'Exercise 3: Advanced Challenge',
        description: 'Final exercise - putting it all together',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Challenge instructions' },
          { type: 'codePreview', placeholder: 'Interactive coding area' }
        ]
      },
      {
        title: 'Exercise 3: Solution',
        description: 'Complete solution and best practices',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Detailed solution explanation' },
          { type: 'code', placeholder: 'Optimized solution code' }
        ]
      },
      {
        title: 'Bonus Challenges',
        description: 'Extra exercises to try',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Additional exercise ideas for practice' }
        ]
      },
      {
        title: 'Workshop Recap',
        description: 'What we built and learned',
        suggestedBlocks: [
          { type: 'note', placeholder: 'Key skills developed in this workshop' },
          { type: 'text', placeholder: 'Next steps and practice suggestions' }
        ]
      }
    ]
  },

  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Real-world problem analysis and solution (30-45 min). Problem → Solution → Results.',
    icon: '📊',
    slideCount: 8,
    estimatedDuration: '30-45 min',
    slides: [
      {
        title: 'Case Study Introduction',
        description: 'Setting the scene',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Introduce the company/project and context' },
          { type: 'image', placeholder: 'Company logo or project screenshot' }
        ]
      },
      {
        title: 'The Problem',
        description: 'What challenge needed solving',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Detailed problem description and business impact' },
          { type: 'chart', placeholder: 'Data showing the problem (metrics, costs, etc.)' }
        ]
      },
      {
        title: 'Requirements & Constraints',
        description: 'What the solution needed to achieve',
        suggestedBlocks: [
          { type: 'text', placeholder: 'List of requirements and limitations' },
          { type: 'note', placeholder: 'Key success criteria' }
        ]
      },
      {
        title: 'Exploring Solutions',
        description: 'Different approaches considered',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Analysis of different solution options' },
          { type: 'chart', placeholder: 'Comparison of approaches' }
        ]
      },
      {
        title: 'The Solution',
        description: 'What was built and how',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Detailed solution explanation' },
          { type: 'image', placeholder: 'Architecture diagram or screenshots' },
          { type: 'code', placeholder: 'Key code samples' }
        ]
      },
      {
        title: 'Implementation Process',
        description: 'How the solution was deployed',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Timeline and implementation steps' },
          { type: 'note', placeholder: 'Challenges faced during implementation' }
        ]
      },
      {
        title: 'Results & Impact',
        description: 'Measuring success',
        suggestedBlocks: [
          { type: 'text', placeholder: 'Business outcomes and metrics improved' },
          { type: 'chart', placeholder: 'Before/after comparison data' }
        ]
      },
      {
        title: 'Lessons Learned',
        description: 'Key takeaways from this case study',
        suggestedBlocks: [
          { type: 'note', placeholder: 'What worked well and what could be improved' },
          { type: 'text', placeholder: 'How to apply these learnings to your own work' }
        ]
      }
    ]
  },

  {
    id: 'blank',
    name: 'Blank Module',
    description: 'Start from scratch with an empty module. Full creative control.',
    icon: '📄',
    slideCount: 1,
    estimatedDuration: 'Custom',
    slides: [
      {
        title: 'Slide 1',
        description: 'Your first slide',
        suggestedBlocks: []
      }
    ]
  }
]

// Helper function to get a template by ID
export function getTemplateById(id: string): ModuleTemplate | undefined {
  return MODULE_TEMPLATES.find(template => template.id === id)
}

// Helper function to generate slides from template
export function generateSlidesFromTemplate(templateId: string): any[] {
  const template = getTemplateById(templateId)
  if (!template) return []

  return template.slides.map((slide, index) => ({
    id: Date.now() + index,
    title: slide.title,
    description: slide.description,
    blocks: (slide.suggestedBlocks || []).map((block, blockIndex) => ({
      id: `block-${Date.now()}-${index}-${blockIndex}`,
      type: block.type,
      data: getDefaultBlockData(block.type, block.placeholder)
    }))
  }))
}

// Helper function to get default data for a block type
function getDefaultBlockData(type: string, placeholder: string): any {
  switch (type) {
    case 'text':
    case 'note':
      return { text: placeholder }
    case 'code':
      return { code: placeholder, language: 'javascript' }
    case 'codePreview':
      return { html: '', css: '', js: '// ' + placeholder }
    case 'image':
      return { src: '', alt: placeholder }
    case 'video':
      return { url: '', title: placeholder }
    case 'chart':
      return { chartData: '{"labels": [], "data": []}' }
    default:
      return {}
  }
}
