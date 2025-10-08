import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modules } from '@/lib/db/schema'

export async function POST(request: Request) {
  try {
    // Sample module data to seed
    const sampleModule = {
      moduleId: `module-${Date.now()}`,
      title: 'Introduction to AI Tools',
      slug: 'intro-to-ai-tools',
      description: 'Learn how to leverage AI tools for productivity and creativity in your daily workflow.',
      instructor: {
        name: 'ForeFront Student',
        title: 'Student at USD',
        bio: 'Passionate about AI and its applications in education.'
      },
      duration: '30 minutes',
      skillLevel: 'beginner',
      introVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      learningObjectives: [
        'Understand the basics of AI tools',
        'Learn practical applications of AI',
        'Explore popular AI platforms'
      ],
      slides: [
        {
          id: 1,
          title: 'Welcome to AI Tools',
          content: {
            heading: 'Getting Started with AI',
            body: 'AI tools are revolutionizing how we work and learn. In this module, you\'ll discover the most practical AI applications for students.',
            bulletPoints: [
              'ChatGPT for writing and research',
              'Midjourney for creative design',
              'GitHub Copilot for coding'
            ],
            note: 'Focus on tools that save you time and enhance your learning.'
          }
        },
        {
          id: 2,
          title: 'Practical Applications',
          content: {
            heading: 'Real-World Use Cases',
            body: 'See how students are using AI to excel in their studies and build impressive projects.',
            bulletPoints: [
              'Essay writing and editing',
              'Project ideation and planning',
              'Code debugging and optimization'
            ]
          }
        },
        {
          id: 3,
          title: 'Getting Started',
          content: {
            heading: 'Your First Steps',
            body: 'Start experimenting with these tools today. The key is to practice and find what works for your workflow.',
            bulletPoints: [
              'Create accounts on key platforms',
              'Try one tool per week',
              'Share your discoveries with others'
            ],
            note: 'Remember: spread the sauce, no gatekeeping!'
          }
        }
      ],
      keyTakeaways: [
        'AI tools can dramatically boost productivity',
        'Start with simple, practical applications',
        'Share your knowledge with the community'
      ]
    }

    const [newModule] = await db.insert(modules).values(sampleModule).returning()

    return NextResponse.json({
      success: true,
      message: 'Sample module seeded successfully',
      module: newModule
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    )
  }
}
