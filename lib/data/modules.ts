export interface Module {
  id: string
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
  relatedModules: string[]
}

export interface Slide {
  id: string
  title: string
  type: 'intro' | 'content' | 'code' | 'demo' | 'summary'
  content: {
    heading?: string
    body?: string
    bulletPoints?: string[]
    code?: {
      language: string
      snippet: string
    }
    image?: string
    note?: string
  }
}

export const modules: Module[] = [
  {
    id: '1',
    slug: 'vibe-coding-ai',
    title: 'Vibe Code with AI',
    category: 'coding',
    categoryColor: '#00E5FF',
    description: 'Build apps fast with AI-assisted coding tools like Claude Code and Cursor',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
    introVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: {
      name: 'Alex Chen',
      photo: 'https://i.pravatar.cc/150?img=12',
      year: 'Junior',
      major: 'Computer Science'
    },
    duration: '2 hours',
    skillLevel: 'Beginner',
    learningObjectives: [
      'Set up AI coding assistants in your workflow',
      'Write code 10x faster with AI suggestions',
      'Debug code using AI explanations',
      'Build a full app using AI assistance'
    ],
    keyTakeaways: [
      'AI can accelerate your coding workflow by 10x',
      'Start with prompts, let AI fill in the details',
      'Always review and understand AI-generated code'
    ],
    resources: [
      { title: 'Claude Code Docs', url: 'https://docs.claude.com' },
      { title: 'Cursor IDE', url: 'https://cursor.sh' }
    ],
    slides: [
      {
        id: '1',
        title: 'Welcome to Vibe Coding',
        type: 'intro',
        content: {
          heading: 'Welcome to Vibe Coding with AI',
          body: 'Learn how to code faster and smarter using AI assistants.',
          bulletPoints: [
            'No prior experience required',
            'Hands-on examples',
            'Real-world projects'
          ]
        }
      },
      {
        id: '2',
        title: 'What is AI-Assisted Coding?',
        type: 'content',
        content: {
          heading: 'AI-Assisted Coding Explained',
          body: 'AI coding assistants are tools that help you write code by providing suggestions, completing code blocks, and explaining complex concepts.',
          bulletPoints: [
            'Code completion and suggestions',
            'Bug detection and fixes',
            'Code explanations',
            'Refactoring assistance'
          ]
        }
      },
      {
        id: '3',
        title: 'Your First AI Prompt',
        type: 'code',
        content: {
          heading: 'Let\'s Write Your First Prompt',
          body: 'Start by asking AI to create a simple function. Here\'s an example:',
          code: {
            language: 'typescript',
            snippet: `// Prompt: "Create a function that reverses a string"

function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

console.log(reverseString('Hello')); // "olleH"`
          },
          note: 'Notice how clear and simple the prompt is. AI works best with specific, direct requests.'
        }
      },
      {
        id: '4',
        title: 'Key Concepts',
        type: 'content',
        content: {
          heading: 'Best Practices for AI Coding',
          bulletPoints: [
            'Be specific in your prompts',
            'Break complex tasks into smaller steps',
            'Always test AI-generated code',
            'Use AI for explanations when stuck',
            'Iterate and refine your prompts'
          ]
        }
      },
      {
        id: '5',
        title: 'Course Complete!',
        type: 'summary',
        content: {
          heading: 'You\'re Ready to Vibe Code!',
          body: 'You\'ve learned the fundamentals of AI-assisted coding. Now it\'s time to practice!',
          bulletPoints: [
            'Start with simple projects',
            'Experiment with different AI tools',
            'Join the ForeFront USD community',
            'Share your creations'
          ]
        }
      }
    ],
    relatedModules: ['5', '3']
  },
  {
    id: '2',
    slug: 'marketing-with-ai',
    title: 'Marketing with AI',
    category: 'marketing',
    categoryColor: '#8B5CF6',
    description: 'AI-powered marketing strategies that actually convert',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    introVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: {
      name: 'Sarah Martinez',
      photo: 'https://i.pravatar.cc/150?img=5',
      year: 'Senior',
      major: 'Business Marketing'
    },
    duration: '1.5 hours',
    skillLevel: 'Beginner',
    learningObjectives: [
      'Use AI for market research and audience analysis',
      'Generate compelling ad copy with AI',
      'Create personalized marketing campaigns',
      'Analyze campaign performance with AI'
    ],
    keyTakeaways: [
      'AI can analyze markets faster than humans',
      'Personalization at scale is now possible',
      'Data-driven decisions beat gut feelings'
    ],
    resources: [
      { title: 'ChatGPT for Marketing', url: 'https://openai.com' },
      { title: 'HubSpot AI Tools', url: 'https://hubspot.com' }
    ],
    slides: [
      {
        id: '1',
        title: 'Welcome',
        type: 'intro',
        content: {
          heading: 'Marketing in the AI Era',
          body: 'Discover how AI is revolutionizing marketing and how you can leverage it.',
          bulletPoints: [
            'No marketing degree required',
            'Practical AI marketing tools',
            'Real campaign examples'
          ]
        }
      },
      {
        id: '2',
        title: 'AI Market Research',
        type: 'content',
        content: {
          heading: 'Understanding Your Audience with AI',
          body: 'AI can analyze thousands of data points to help you understand your target audience better than ever before.',
          bulletPoints: [
            'Demographic analysis',
            'Sentiment tracking',
            'Competitor research',
            'Trend prediction'
          ]
        }
      },
      {
        id: '3',
        title: 'Crafting AI-Powered Copy',
        type: 'code',
        content: {
          heading: 'Writing Better Ad Copy',
          body: 'Here\'s how to prompt AI to create compelling marketing copy:',
          code: {
            language: 'text',
            snippet: `Prompt: "Write 3 Facebook ad variations for a sustainable water bottle targeting college students who care about the environment"

Result:
1. "💧 Stay hydrated, save the planet. Our eco-friendly bottles keep drinks cold for 24 hours. Join 10k+ students making a difference!"

2. "Tired of single-use plastic? Switch to our sustainable bottle & reduce 156 plastic bottles/year. Student discount: 20% off!"

3. "Your hydration, our mission. Premium insulated bottles made from recycled materials. Because Earth is the only home we've got 🌍"`
          },
          note: 'Always A/B test AI-generated copy to see what resonates with your audience.'
        }
      },
      {
        id: '4',
        title: 'Summary',
        type: 'summary',
        content: {
          heading: 'You\'re a Marketing Pro Now!',
          body: 'You\'ve learned how to leverage AI to supercharge your marketing efforts.',
          bulletPoints: [
            'Use AI for research and insights',
            'Generate and test multiple variations',
            'Always measure and optimize',
            'Keep the human touch in your messaging'
          ]
        }
      }
    ],
    relatedModules: ['3', '1']
  },
  {
    id: '3',
    slug: 'content-creation-ai',
    title: 'Content Creation with AI',
    category: 'content',
    categoryColor: '#10B981',
    description: 'Create engaging content in minutes with AI tools',
    thumbnail: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=450&fit=crop',
    introVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: {
      name: 'Jordan Lee',
      photo: 'https://i.pravatar.cc/150?img=8',
      year: 'Sophomore',
      major: 'Communications'
    },
    duration: '2 hours',
    skillLevel: 'Beginner',
    learningObjectives: [
      'Generate blog posts and articles with AI',
      'Create social media content at scale',
      'Design graphics using AI tools',
      'Optimize content for SEO with AI'
    ],
    keyTakeaways: [
      'AI handles the heavy lifting, you add the human touch',
      'Consistency is key to content success',
      'Quality over quantity always wins'
    ],
    resources: [
      { title: 'Midjourney Guide', url: 'https://midjourney.com' },
      { title: 'Copy.ai', url: 'https://copy.ai' }
    ],
    slides: [
      {
        id: '1',
        title: 'Welcome',
        type: 'intro',
        content: {
          heading: 'AI-Powered Content Creation',
          body: 'Learn to create amazing content faster than ever before.',
          bulletPoints: [
            'Write better, faster',
            'Create stunning visuals',
            'Optimize for maximum reach'
          ]
        }
      },
      {
        id: '2',
        title: 'The Content Creation Process',
        type: 'content',
        content: {
          heading: 'From Idea to Published Content',
          body: 'AI can assist at every stage of content creation, from brainstorming to final edits.',
          bulletPoints: [
            'Ideation and brainstorming',
            'Drafting and writing',
            'Editing and refinement',
            'SEO optimization',
            'Visual creation'
          ]
        }
      },
      {
        id: '3',
        title: 'Creating Blog Content',
        type: 'code',
        content: {
          heading: 'AI Blog Writing Example',
          body: 'Here\'s how to structure a prompt for blog content:',
          code: {
            language: 'text',
            snippet: `Prompt: "Write an engaging introduction for a blog post about productivity tips for college students. Target length: 150 words. Tone: Friendly and relatable."

Result:
Let's be real—college is a juggling act. Between classes, assignments, part-time jobs, and trying to maintain some semblance of a social life, it's easy to feel overwhelmed. You're not alone if you've ever wondered how some students seem to have it all figured out while you're drowning in to-do lists.

The good news? Productivity isn't some magical skill you're born with. It's a set of habits and strategies that anyone can learn. And no, we're not talking about pulling all-nighters or chugging endless energy drinks (please don't do that).

In this post, we're breaking down practical, science-backed productivity tips that actually work for college students. These aren't complicated systems—just simple tweaks that can help you get more done in less time, so you can finally have time for the things you actually enjoy.`
          },
          note: 'Always edit and personalize AI content with your unique voice and experiences.'
        }
      },
      {
        id: '4',
        title: 'Visual Content with AI',
        type: 'content',
        content: {
          heading: 'Creating Images with AI',
          body: 'AI image generators can create stunning visuals for your content in seconds.',
          bulletPoints: [
            'Midjourney for artistic images',
            'DALL-E for specific concepts',
            'Stable Diffusion for customization',
            'Canva AI for social graphics'
          ],
          note: 'Always check usage rights and add proper attribution for AI-generated images.'
        }
      },
      {
        id: '5',
        title: 'Course Complete',
        type: 'summary',
        content: {
          heading: 'You\'re a Content Creator!',
          body: 'You now have the tools to create engaging content consistently.',
          bulletPoints: [
            'Use AI to speed up your workflow',
            'Always add your personal touch',
            'Test different formats and styles',
            'Engage with your audience'
          ]
        }
      }
    ],
    relatedModules: ['2', '4']
  },
  {
    id: '4',
    slug: 'music-with-ai',
    title: 'Music Production with AI',
    category: 'music',
    categoryColor: '#F59E0B',
    description: 'Compose and produce music with AI-powered tools',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop',
    introVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: {
      name: 'Maya Johnson',
      photo: 'https://i.pravatar.cc/150?img=9',
      year: 'Junior',
      major: 'Music Production'
    },
    duration: '3 hours',
    skillLevel: 'Intermediate',
    learningObjectives: [
      'Generate melodies and chord progressions with AI',
      'Use AI for mixing and mastering',
      'Create unique sounds with AI synthesis',
      'Collaborate with AI in your workflow'
    ],
    keyTakeaways: [
      'AI is a collaborator, not a replacement',
      'Experimentation leads to unique sounds',
      'Human creativity + AI = Magic'
    ],
    resources: [
      { title: 'Suno AI', url: 'https://suno.ai' },
      { title: 'AIVA', url: 'https://aiva.ai' }
    ],
    slides: [
      {
        id: '1',
        title: 'Welcome',
        type: 'intro',
        content: {
          heading: 'AI in Music Production',
          body: 'Discover how AI can enhance your music creation process.',
          bulletPoints: [
            'No music theory degree required',
            'Create professional-sounding tracks',
            'Experiment with new genres'
          ]
        }
      },
      {
        id: '2',
        title: 'AI Music Tools Overview',
        type: 'content',
        content: {
          heading: 'The AI Music Production Toolkit',
          body: 'Modern AI tools can assist with every aspect of music production.',
          bulletPoints: [
            'Melody and harmony generation',
            'Drum pattern creation',
            'Mixing and mastering',
            'Sound design and synthesis',
            'Lyric writing'
          ]
        }
      },
      {
        id: '3',
        title: 'Creating Your First AI Track',
        type: 'content',
        content: {
          heading: 'Let\'s Make Music!',
          body: 'Start by defining your vision, then let AI help bring it to life.',
          bulletPoints: [
            'Choose your genre and mood',
            'Generate a chord progression',
            'Add melody and rhythm',
            'Layer sounds and textures',
            'Mix and master'
          ],
          note: 'Remember: AI gives you the building blocks. Your creativity makes it unique.'
        }
      },
      {
        id: '4',
        title: 'Course Complete',
        type: 'summary',
        content: {
          heading: 'You\'re a Music Producer!',
          body: 'You\'ve learned how to leverage AI in your music production workflow.',
          bulletPoints: [
            'Experiment with different AI tools',
            'Develop your unique sound',
            'Share your music with the world',
            'Keep learning and evolving'
          ]
        }
      }
    ],
    relatedModules: ['3', '5']
  },
  {
    id: '5',
    slug: 'ai-automation',
    title: 'AI Automation',
    category: 'automation',
    categoryColor: '#0066FF',
    description: 'Automate anything with AI-powered workflows',
    thumbnail: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=450&fit=crop',
    introVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: {
      name: 'Chris Park',
      photo: 'https://i.pravatar.cc/150?img=13',
      year: 'Senior',
      major: 'Information Systems'
    },
    duration: '2.5 hours',
    skillLevel: 'Intermediate',
    learningObjectives: [
      'Build AI-powered automation workflows',
      'Integrate AI with existing tools',
      'Create smart bots and assistants',
      'Optimize business processes with AI'
    ],
    keyTakeaways: [
      'Automate repetitive tasks to save time',
      'Start small, then scale your automations',
      'AI + automation = superpower'
    ],
    resources: [
      { title: 'Make.com', url: 'https://make.com' },
      { title: 'Zapier AI', url: 'https://zapier.com/ai' }
    ],
    slides: [
      {
        id: '1',
        title: 'Welcome',
        type: 'intro',
        content: {
          heading: 'Automate Everything with AI',
          body: 'Learn to build powerful automations that work for you 24/7.',
          bulletPoints: [
            'Save hours every week',
            'Reduce human error',
            'Scale your productivity'
          ]
        }
      },
      {
        id: '2',
        title: 'What Can You Automate?',
        type: 'content',
        content: {
          heading: 'Endless Automation Possibilities',
          body: 'If you do it more than twice, you can probably automate it.',
          bulletPoints: [
            'Email responses and sorting',
            'Social media posting',
            'Data entry and processing',
            'Report generation',
            'Customer support',
            'Content scheduling'
          ]
        }
      },
      {
        id: '3',
        title: 'Building Your First Automation',
        type: 'content',
        content: {
          heading: 'Automation Workflow Basics',
          body: 'Every automation follows the same pattern: Trigger → Action → Result',
          bulletPoints: [
            'Identify the trigger event',
            'Define the actions to take',
            'Add AI processing if needed',
            'Set up the output/result',
            'Test and refine'
          ],
          note: 'Start with simple automations and gradually add complexity as you learn.'
        }
      },
      {
        id: '4',
        title: 'Real-World Example',
        type: 'code',
        content: {
          heading: 'Email to Task Automation',
          body: 'Here\'s a practical automation workflow:',
          code: {
            language: 'text',
            snippet: `Automation Flow:

1. Trigger: Email arrives with subject containing "Task:"
2. AI Action: Extract task details (what, when, priority)
3. Action: Create task in Notion/Todoist
4. Action: Send confirmation email
5. Action: Add to calendar if deadline exists

Example Email:
Subject: Task: Review Q4 budget proposal
Body: Need this done by Friday, high priority

AI Extracts:
- Task: Review Q4 budget proposal
- Deadline: Friday
- Priority: High

Result: Task created, calendar event added, confirmation sent ✅`
          }
        }
      },
      {
        id: '5',
        title: 'Course Complete',
        type: 'summary',
        content: {
          heading: 'You\'re an Automation Expert!',
          body: 'You now have the knowledge to automate your life and work.',
          bulletPoints: [
            'Start with your most repetitive tasks',
            'Document your automations',
            'Share your workflows with others',
            'Keep optimizing and improving'
          ]
        }
      }
    ],
    relatedModules: ['1', '2']
  }
]
