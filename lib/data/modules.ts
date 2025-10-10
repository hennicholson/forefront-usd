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
  relatedModules: string[]
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
        id: 1,
        title: 'Welcome to Vibe Coding',
        description: 'Your journey into AI-assisted development starts here',
        blocks: [
          {
            id: 'block-1-1',
            type: 'text',
            data: {
              html: '<h2>What You\'ll Learn</h2><p>This course will teach you how to <strong>code faster and smarter</strong> using AI assistants. No prior experience required!</p><ul><li>AI-powered code completion</li><li>Debugging with AI explanations</li><li>Building real projects</li></ul>'
            }
          },
          {
            id: 'block-1-2',
            type: 'note',
            data: {
              text: '💡 Pro Tip: Keep an open mind. AI coding tools are powerful, but they work best when paired with your creativity and problem-solving skills.'
            }
          },
          {
            id: 'block-1-3',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Traditional Coding", "AI-Assisted Coding"], "data": [10, 100]}'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'What is AI-Assisted Coding?',
        description: 'Understanding how AI can supercharge your development workflow',
        blocks: [
          {
            id: 'block-2-1',
            type: 'text',
            data: {
              html: '<p>AI coding assistants are <em>intelligent tools</em> that help you write code by:</p><ul><li><strong>Suggesting completions</strong> as you type</li><li><strong>Detecting bugs</strong> before they cause problems</li><li><strong>Explaining</strong> complex code concepts</li><li><strong>Refactoring</strong> messy code automatically</li></ul>'
            }
          },
          {
            id: 'block-2-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
          },
          {
            id: 'block-2-3',
            type: 'quiz',
            data: {
              question: 'What is the main benefit of AI-assisted coding?',
              options: 'It writes all your code for you\nIt makes you code faster and smarter\nIt replaces the need for learning\nIt only works with JavaScript',
              correctAnswer: 1
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Your First AI Prompt',
        description: 'Let\'s write some code together',
        blocks: [
          {
            id: 'block-3-1',
            type: 'text',
            data: {
              html: '<h3>The Power of Simple Prompts</h3><p>Start by asking AI to create a simple function. <strong>Be specific</strong> and <strong>clear</strong> in your requests.</p>'
            }
          },
          {
            id: 'block-3-2',
            type: 'code',
            data: {
              language: 'typescript',
              code: `// Prompt: "Create a function that reverses a string"

function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

console.log(reverseString('Hello')); // "olleH"
console.log(reverseString('AI Rocks!')); // "!skcoR IA"`
            }
          },
          {
            id: 'block-3-3',
            type: 'note',
            data: {
              text: 'Notice how clear and simple the prompt is. AI works best with specific, direct requests. Avoid being vague or overly complex.'
            }
          },
          {
            id: 'block-3-4',
            type: 'codePreview',
            data: {
              html: '<div id="output"></div>',
              css: `#output {
  font-family: monospace;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 24px;
  text-align: center;
}`,
              js: `function reverseString(str) {
  return str.split('').reverse().join('');
}

document.getElementById('output').textContent = reverseString('Hello AI!');`
            }
          }
        ]
      },
      {
        id: 4,
        title: 'Best Practices',
        description: 'Tips for working effectively with AI coding tools',
        blocks: [
          {
            id: 'block-4-1',
            type: 'text',
            data: {
              html: '<h3>Golden Rules for AI Coding</h3><ol><li><strong>Be specific</strong> in your prompts</li><li><strong>Break complex tasks</strong> into smaller steps</li><li><strong>Always test</strong> AI-generated code</li><li><strong>Use AI for explanations</strong> when stuck</li><li><strong>Iterate and refine</strong> your prompts</li></ol>'
            }
          },
          {
            id: 'block-4-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Prompt Quality", "Code Quality", "Time Saved", "Learning Speed"], "data": [95, 88, 75, 92]}'
            }
          }
        ]
      },
      {
        id: 5,
        title: 'You\'re Ready!',
        description: 'Time to start building',
        blocks: [
          {
            id: 'block-5-1',
            type: 'text',
            data: {
              html: '<h2>🎉 Course Complete!</h2><p>You\'ve learned the fundamentals of AI-assisted coding. Now it\'s time to <strong>practice</strong> and <strong>build</strong>!</p><h3>Next Steps:</h3><ul><li>Start with simple projects</li><li>Experiment with different AI tools</li><li>Join the ForeFront USD community</li><li>Share your creations</li></ul>'
            }
          },
          {
            id: 'block-5-2',
            type: 'quiz',
            data: {
              question: 'What should you do after completing this course?',
              options: 'Stop learning and relax\nStart practicing with real projects\nOnly use AI to write code\nAvoid testing your code',
              correctAnswer: 1
            }
          }
        ]
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
        id: 1,
        title: 'Marketing in the AI Era',
        description: 'Revolutionize your marketing with artificial intelligence',
        blocks: [
          {
            id: 'block-1-1',
            type: 'text',
            data: {
              html: '<h2>Welcome to AI Marketing</h2><p>Discover how AI is <strong>transforming marketing</strong> and how you can leverage it to reach your audience more effectively.</p>'
            }
          },
          {
            id: 'block-1-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Manual Research", "AI-Powered Research", "Traditional Copy", "AI-Generated Copy"], "data": [20, 85, 35, 90]}'
            }
          },
          {
            id: 'block-1-3',
            type: 'note',
            data: {
              text: '📊 Marketing with AI isn\'t about replacing human creativity—it\'s about amplifying it. Use AI to handle data and repetitive tasks, while you focus on strategy and creativity.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'AI Market Research',
        description: 'Understand your audience like never before',
        blocks: [
          {
            id: 'block-2-1',
            type: 'text',
            data: {
              html: '<h3>The Power of AI Analysis</h3><p>AI can analyze <em>thousands of data points</em> to help you understand your target audience better than ever before.</p><h4>Key Capabilities:</h4><ul><li><strong>Demographic analysis</strong> - Who are your customers?</li><li><strong>Sentiment tracking</strong> - What do they think?</li><li><strong>Competitor research</strong> - What are others doing?</li><li><strong>Trend prediction</strong> - What\'s coming next?</li></ul>'
            }
          },
          {
            id: 'block-2-2',
            type: 'quiz',
            data: {
              question: 'What is the primary advantage of AI in market research?',
              options: 'It\'s cheaper than traditional methods\nIt can analyze massive amounts of data quickly\nIt completely replaces human marketers\nIt only works for tech companies',
              correctAnswer: 1
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Crafting AI-Powered Copy',
        description: 'Write compelling marketing messages at scale',
        blocks: [
          {
            id: 'block-3-1',
            type: 'text',
            data: {
              html: '<h3>The Art of AI Copywriting</h3><p>Here\'s how to prompt AI to create <strong>compelling marketing copy</strong> that resonates with your audience.</p>'
            }
          },
          {
            id: 'block-3-2',
            type: 'code',
            data: {
              language: 'text',
              code: `Prompt: "Write 3 Facebook ad variations for a sustainable water bottle targeting college students who care about the environment"

Result:

1. 💧 Stay hydrated, save the planet
   Our eco-friendly bottles keep drinks cold for 24 hours
   Join 10k+ students making a difference!

2. Tired of single-use plastic?
   Switch to our sustainable bottle & reduce 156 plastic bottles/year
   Student discount: 20% off! 🌱

3. Your hydration, our mission
   Premium insulated bottles made from recycled materials
   Because Earth is the only home we've got 🌍`
            }
          },
          {
            id: 'block-3-3',
            type: 'note',
            data: {
              text: '⚡ Always A/B test AI-generated copy to see what resonates with your specific audience. What works for one demographic might not work for another.'
            }
          },
          {
            id: 'block-3-4',
            type: 'codePreview',
            data: {
              html: `<div class="ad-preview">
  <h3>💧 Stay Hydrated, Save the Planet</h3>
  <p>Our eco-friendly bottles keep drinks cold for 24 hours</p>
  <button>Shop Now - 20% Off</button>
</div>`,
              css: `.ad-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.ad-preview h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.ad-preview p {
  margin-bottom: 20px;
  opacity: 0.9;
}

.ad-preview button {
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}`,
              js: `document.querySelector('.ad-preview button').addEventListener('click', () => {
  alert('This is a live preview of your ad!');
});`
            }
          }
        ]
      },
      {
        id: 4,
        title: 'You\'re a Marketing Pro!',
        description: 'Apply what you\'ve learned',
        blocks: [
          {
            id: 'block-4-1',
            type: 'text',
            data: {
              html: '<h2>🎯 Ready to Market Like a Pro</h2><p>You\'ve learned how to leverage AI to <strong>supercharge your marketing efforts</strong>.</p><h3>Your Action Plan:</h3><ol><li>Use AI for <strong>research and insights</strong></li><li>Generate and <strong>test multiple variations</strong></li><li>Always <strong>measure and optimize</strong></li><li>Keep the <strong>human touch</strong> in your messaging</li></ol>'
            }
          },
          {
            id: 'block-4-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Research", "Copy Creation", "A/B Testing", "Analytics"], "data": [90, 85, 80, 95]}'
            }
          }
        ]
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
        id: 1,
        title: 'AI-Powered Content Creation',
        description: 'Learn to create amazing content faster than ever',
        blocks: [
          {
            id: 'block-1-1',
            type: 'text',
            data: {
              html: '<h2>Welcome Content Creator!</h2><p>Learn to create <strong>amazing content faster</strong> than ever before using AI-powered tools.</p><ul><li>Write better, faster</li><li>Create stunning visuals</li><li>Optimize for maximum reach</li></ul>'
            }
          },
          {
            id: 'block-1-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
          },
          {
            id: 'block-1-3',
            type: 'note',
            data: {
              text: '✍️ The secret to great AI content? Use AI to create the first draft, then add your unique voice, experiences, and personality to make it shine.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'The Content Creation Process',
        description: 'From idea to published masterpiece',
        blocks: [
          {
            id: 'block-2-1',
            type: 'text',
            data: {
              html: '<h3>AI-Enhanced Workflow</h3><p>AI can assist at <em>every stage</em> of content creation:</p><ol><li><strong>Ideation</strong> - Brainstorm topics and angles</li><li><strong>Research</strong> - Gather information quickly</li><li><strong>Drafting</strong> - Generate initial content</li><li><strong>Editing</strong> - Refine and polish</li><li><strong>SEO</strong> - Optimize for search engines</li><li><strong>Visuals</strong> - Create compelling graphics</li></ol>'
            }
          },
          {
            id: 'block-2-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Ideation", "Research", "Writing", "Editing", "Publishing"], "data": [30, 45, 60, 80, 100]}'
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Creating Blog Content',
        description: 'Write engaging blog posts with AI assistance',
        blocks: [
          {
            id: 'block-3-1',
            type: 'text',
            data: {
              html: '<h3>AI Blog Writing Example</h3><p>Here\'s how to structure a prompt for <strong>high-quality blog content</strong>:</p>'
            }
          },
          {
            id: 'block-3-2',
            type: 'code',
            data: {
              language: 'text',
              code: `Prompt: "Write an engaging introduction for a blog post about productivity tips for college students. Target length: 150 words. Tone: Friendly and relatable."

Result:

Let's be real—college is a juggling act. Between classes, assignments, part-time jobs, and trying to maintain some semblance of a social life, it's easy to feel overwhelmed. You're not alone if you've ever wondered how some students seem to have it all figured out while you're drowning in to-do lists.

The good news? Productivity isn't some magical skill you're born with. It's a set of habits and strategies that anyone can learn. And no, we're not talking about pulling all-nighters or chugging endless energy drinks (please don't do that).

In this post, we're breaking down practical, science-backed productivity tips that actually work for college students. These aren't complicated systems—just simple tweaks that can help you get more done in less time, so you can finally have time for the things you actually enjoy.`
            }
          },
          {
            id: 'block-3-3',
            type: 'note',
            data: {
              text: '🎯 Always edit and personalize AI content with your unique voice and experiences. Your readers want to hear from YOU, not a robot.'
            }
          },
          {
            id: 'block-3-4',
            type: 'quiz',
            data: {
              question: 'What should you always do with AI-generated content?',
              options: 'Publish it immediately without reading\nAdd your personal voice and edit it\nUse it only for social media\nNever use it at all',
              correctAnswer: 1
            }
          }
        ]
      },
      {
        id: 4,
        title: 'Visual Content with AI',
        description: 'Create stunning images and graphics',
        blocks: [
          {
            id: 'block-4-1',
            type: 'text',
            data: {
              html: '<h3>AI Image Generation</h3><p>AI image generators can create <strong>stunning visuals</strong> for your content in seconds.</p><h4>Popular Tools:</h4><ul><li><strong>Midjourney</strong> - For artistic, creative images</li><li><strong>DALL-E</strong> - For specific concepts and ideas</li><li><strong>Stable Diffusion</strong> - For customization and control</li><li><strong>Canva AI</strong> - For social media graphics</li></ul>'
            }
          },
          {
            id: 'block-4-2',
            type: 'codePreview',
            data: {
              html: `<div class="image-card">
  <div class="image-placeholder">🎨</div>
  <h4>AI-Generated Artwork</h4>
  <p>Create stunning visuals in seconds</p>
</div>`,
              css: `.image-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.image-placeholder {
  font-size: 80px;
  margin-bottom: 20px;
}

.image-card h4 {
  font-size: 24px;
  margin-bottom: 10px;
}

.image-card p {
  opacity: 0.9;
}`,
              js: ''
            }
          },
          {
            id: 'block-4-3',
            type: 'note',
            data: {
              text: '⚠️ Always check usage rights and add proper attribution for AI-generated images. Some platforms have specific licensing requirements.'
            }
          }
        ]
      },
      {
        id: 5,
        title: 'You\'re a Content Creator!',
        description: 'Start creating amazing content',
        blocks: [
          {
            id: 'block-5-1',
            type: 'text',
            data: {
              html: '<h2>🚀 You\'re Ready to Create!</h2><p>You now have the tools to create <strong>engaging content consistently</strong>.</p><h3>Your Content Strategy:</h3><ol><li>Use AI to <strong>speed up your workflow</strong></li><li>Always add your <strong>personal touch</strong></li><li>Test different <strong>formats and styles</strong></li><li><strong>Engage</strong> with your audience</li></ol>'
            }
          },
          {
            id: 'block-5-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Blog Posts", "Social Media", "Email", "Video Scripts"], "data": [85, 92, 78, 88]}'
            }
          }
        ]
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
        id: 1,
        title: 'AI in Music Production',
        description: 'Enhance your music creation with artificial intelligence',
        blocks: [
          {
            id: 'block-1-1',
            type: 'text',
            data: {
              html: '<h2>🎵 Welcome to AI Music Production</h2><p>Discover how AI can <strong>enhance your music creation process</strong> without replacing your creativity.</p><ul><li>No music theory degree required</li><li>Create professional-sounding tracks</li><li>Experiment with new genres</li></ul>'
            }
          },
          {
            id: 'block-1-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
          },
          {
            id: 'block-1-3',
            type: 'note',
            data: {
              text: '🎹 Remember: AI is your creative partner, not a replacement. Use it to explore new ideas and break through creative blocks, but always add your unique artistic vision.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'AI Music Tools Overview',
        description: 'Your complete toolkit for AI-assisted production',
        blocks: [
          {
            id: 'block-2-1',
            type: 'text',
            data: {
              html: '<h3>The AI Music Toolkit</h3><p>Modern AI tools can assist with <em>every aspect</em> of music production:</p><ul><li><strong>Melody & Harmony</strong> - Generate chord progressions</li><li><strong>Rhythm</strong> - Create drum patterns</li><li><strong>Mixing</strong> - Balance and enhance your tracks</li><li><strong>Mastering</strong> - Polish your final product</li><li><strong>Sound Design</strong> - Create unique sounds</li><li><strong>Lyrics</strong> - Write compelling words</li></ul>'
            }
          },
          {
            id: 'block-2-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Melody", "Harmony", "Rhythm", "Mixing", "Mastering"], "data": [88, 85, 92, 78, 82]}'
            }
          },
          {
            id: 'block-2-3',
            type: 'quiz',
            data: {
              question: 'What role should AI play in music production?',
              options: 'Complete replacement for musicians\nA creative collaborator and tool\nOnly for beginners\nLimited to electronic music only',
              correctAnswer: 1
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Creating Your First AI Track',
        description: 'Step-by-step guide to AI-assisted music production',
        blocks: [
          {
            id: 'block-3-1',
            type: 'text',
            data: {
              html: '<h3>Let\'s Make Music!</h3><p>Start by <strong>defining your vision</strong>, then let AI help bring it to life.</p><h4>The Production Process:</h4><ol><li>Choose your <strong>genre and mood</strong></li><li>Generate a <strong>chord progression</strong></li><li>Add <strong>melody and rhythm</strong></li><li>Layer <strong>sounds and textures</strong></li><li><strong>Mix and master</strong> your track</li></ol>'
            }
          },
          {
            id: 'block-3-2',
            type: 'code',
            data: {
              language: 'text',
              code: `AI Music Prompt Example:

"Create a chill lo-fi hip-hop beat with:
- Tempo: 85 BPM
- Key: C minor
- Mood: Relaxing, study-friendly
- Elements: Jazz chords, vinyl crackle, soft drums
- Duration: 2 minutes"

AI Output:
✅ Chord progression: Cm7 → Fm7 → Gm7 → Ab∆7
✅ Drum pattern: Soft kick, snare, hi-hat shuffle
✅ Bass: Walking bass line in C minor
✅ Texture: Vinyl crackle, ambient pad
✅ Melody: Simple piano melody with jazz voicing`
            }
          },
          {
            id: 'block-3-3',
            type: 'note',
            data: {
              text: '💡 AI gives you the building blocks, but your creativity makes it unique. Don\'t be afraid to modify, combine, and experiment with what AI generates.'
            }
          },
          {
            id: 'block-3-4',
            type: 'codePreview',
            data: {
              html: `<div class="music-visualizer">
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <p>AI Music Visualizer</p>
</div>`,
              css: `.music-visualizer {
  background: #1a1a1a;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
}

.music-visualizer p {
  color: #F59E0B;
  margin-top: 20px;
  font-weight: bold;
}

.bar {
  display: inline-block;
  width: 30px;
  background: linear-gradient(180deg, #F59E0B, #EF4444);
  margin: 0 5px;
  border-radius: 4px;
  animation: bounce 0.6s infinite alternate;
}

.bar:nth-child(1) { height: 40px; animation-delay: 0s; }
.bar:nth-child(2) { height: 60px; animation-delay: 0.1s; }
.bar:nth-child(3) { height: 80px; animation-delay: 0.2s; }
.bar:nth-child(4) { height: 60px; animation-delay: 0.3s; }
.bar:nth-child(5) { height: 40px; animation-delay: 0.4s; }

@keyframes bounce {
  to { transform: scaleY(0.5); }
}`,
              js: ''
            }
          }
        ]
      },
      {
        id: 4,
        title: 'You\'re a Music Producer!',
        description: 'Start creating your own tracks',
        blocks: [
          {
            id: 'block-4-1',
            type: 'text',
            data: {
              html: '<h2>🎧 Ready to Produce!</h2><p>You\'ve learned how to leverage AI in your <strong>music production workflow</strong>.</p><h3>Your Next Steps:</h3><ol><li><strong>Experiment</strong> with different AI tools</li><li>Develop your <strong>unique sound</strong></li><li><strong>Share</strong> your music with the world</li><li>Keep <strong>learning and evolving</strong></li></ol>'
            }
          },
          {
            id: 'block-4-2',
            type: 'quiz',
            data: {
              question: 'What makes AI-assisted music production powerful?',
              options: 'It creates music without human input\nIt combines AI tools with human creativity\nIt only works for electronic genres\nIt replaces traditional instruments',
              correctAnswer: 1
            }
          },
          {
            id: 'block-4-3',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Creativity", "Speed", "Quality", "Experimentation"], "data": [95, 88, 85, 98]}'
            }
          }
        ]
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
        id: 1,
        title: 'Automate Everything with AI',
        description: 'Build powerful automations that work 24/7',
        blocks: [
          {
            id: 'block-1-1',
            type: 'text',
            data: {
              html: '<h2>⚡ Welcome to AI Automation</h2><p>Learn to build <strong>powerful automations</strong> that work for you 24/7, saving you countless hours.</p><ul><li>Save hours every week</li><li>Reduce human error</li><li>Scale your productivity</li></ul>'
            }
          },
          {
            id: 'block-1-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Manual Work", "Basic Automation", "AI Automation"], "data": [20, 60, 95]}'
            }
          },
          {
            id: 'block-1-3',
            type: 'note',
            data: {
              text: '🤖 The best automation is one you set up once and forget about. Focus on tasks you do repeatedly—if you do something more than twice, it\'s worth automating.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'What Can You Automate?',
        description: 'Endless possibilities for automation',
        blocks: [
          {
            id: 'block-2-1',
            type: 'text',
            data: {
              html: '<h3>Automation Opportunities Everywhere</h3><p>If you do it more than twice, you can probably <strong>automate it</strong>.</p><h4>Common Automations:</h4><ul><li><strong>Email</strong> - Responses, sorting, filtering</li><li><strong>Social Media</strong> - Posting, engagement tracking</li><li><strong>Data Entry</strong> - Form processing, database updates</li><li><strong>Reports</strong> - Automatic generation and sending</li><li><strong>Support</strong> - Customer inquiries, ticket routing</li><li><strong>Scheduling</strong> - Content calendars, appointments</li></ul>'
            }
          },
          {
            id: 'block-2-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
          },
          {
            id: 'block-2-3',
            type: 'quiz',
            data: {
              question: 'When should you consider automating a task?',
              options: 'Only if it takes hours to complete\nIf you do it more than once or twice\nOnly for technical tasks\nNever, manual work is better',
              correctAnswer: 1
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Building Your First Automation',
        description: 'Learn the fundamentals of automation workflows',
        blocks: [
          {
            id: 'block-3-1',
            type: 'text',
            data: {
              html: '<h3>Automation Workflow Basics</h3><p>Every automation follows the same pattern:</p><h2>Trigger → Action → Result</h2><ol><li>Identify the <strong>trigger event</strong></li><li>Define the <strong>actions to take</strong></li><li>Add <strong>AI processing</strong> if needed</li><li>Set up the <strong>output/result</strong></li><li><strong>Test and refine</strong></li></ol>'
            }
          },
          {
            id: 'block-3-2',
            type: 'note',
            data: {
              text: '💡 Start with simple automations and gradually add complexity as you learn. A working simple automation is better than a complex one that doesn\'t work.'
            }
          },
          {
            id: 'block-3-3',
            type: 'codePreview',
            data: {
              html: `<div class="workflow">
  <div class="step trigger">1. Trigger</div>
  <div class="arrow">→</div>
  <div class="step action">2. AI Process</div>
  <div class="arrow">→</div>
  <div class="step result">3. Result</div>
</div>`,
              css: `.workflow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #1a1a1a;
  border-radius: 16px;
}

.step {
  background: linear-gradient(135deg, #0066FF, #00CCFF);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  font-weight: bold;
  text-align: center;
  min-width: 120px;
}

.arrow {
  color: #00CCFF;
  font-size: 32px;
  margin: 0 20px;
  font-weight: bold;
}`,
              js: ''
            }
          }
        ]
      },
      {
        id: 4,
        title: 'Real-World Example',
        description: 'Email to task automation workflow',
        blocks: [
          {
            id: 'block-4-1',
            type: 'text',
            data: {
              html: '<h3>Practical Automation Example</h3><p>Here\'s a <strong>real automation workflow</strong> you can build today:</p>'
            }
          },
          {
            id: 'block-4-2',
            type: 'code',
            data: {
              language: 'text',
              code: `Email to Task Automation Flow:

1. Trigger: Email arrives with subject containing "Task:"

2. AI Action: Extract task details
   - What needs to be done?
   - When is it due?
   - What's the priority?

3. Action: Create task in Notion/Todoist
   - Title: Extracted task name
   - Due date: Parsed deadline
   - Priority: High/Medium/Low

4. Action: Send confirmation email
   - "Task created: [Task Name]"
   - "Due: [Date]"

5. Action: Add to calendar if deadline exists
   - Create calendar event
   - Set reminder 1 day before

Example Email:
Subject: Task: Review Q4 budget proposal
Body: Need this done by Friday, high priority

AI Extracts:
✅ Task: Review Q4 budget proposal
✅ Deadline: Friday
✅ Priority: High

Result:
✅ Task created in Todoist
✅ Calendar event added
✅ Confirmation email sent`
            }
          },
          {
            id: 'block-4-3',
            type: 'note',
            data: {
              text: '⚡ This automation saves 5-10 minutes per task. If you get 20 tasks per week, that\'s 100-200 minutes saved—almost 3.5 hours!'
            }
          }
        ]
      },
      {
        id: 5,
        title: 'You\'re an Automation Expert!',
        description: 'Start automating your life',
        blocks: [
          {
            id: 'block-5-1',
            type: 'text',
            data: {
              html: '<h2>🚀 Ready to Automate!</h2><p>You now have the knowledge to <strong>automate your life and work</strong>.</p><h3>Your Automation Journey:</h3><ol><li>Start with your <strong>most repetitive tasks</strong></li><li><strong>Document</strong> your automations</li><li><strong>Share</strong> your workflows with others</li><li>Keep <strong>optimizing and improving</strong></li></ol>'
            }
          },
          {
            id: 'block-5-2',
            type: 'chart',
            data: {
              chartData: '{"labels": ["Email Auto", "Social Auto", "Data Entry", "Reporting"], "data": [95, 88, 92, 85]}'
            }
          },
          {
            id: 'block-5-3',
            type: 'quiz',
            data: {
              question: 'What is the key benefit of AI-powered automation?',
              options: 'It eliminates all jobs\nIt saves time on repetitive tasks\nIt only works for tech companies\nIt requires advanced programming',
              correctAnswer: 1
            }
          }
        ]
      }
    ],
    relatedModules: ['1', '2']
  }
]
