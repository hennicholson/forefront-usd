const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function rebuildModule1() {
  console.log('🔄 Rebuilding Module 1: AI Fundamentals & Vocabulary...\n')

  try {
    const newSlides = [
      {
        id: 1,
        title: 'Welcome to Forefront: AI at the Cutting Edge',
        blocks: [
          {
            id: 'intro-1-1',
            type: 'text',
            data: {
              text: '# Welcome to Forefront\n\nYou are at the **forefront** of the AI revolution - not watching from the sidelines.\n\n## What Makes Forefront Different?\n\nForefront is not another generic online course. We are building something fundamentally different:\n\n### **Always Current**\nAI changes weekly. Our modules update in real-time as new tools and techniques emerge. What you learn today is what professionals use today.\n\n### **Hands-On First**\nNo theory without practice. Every module includes real tools, actual workflows, and projects you can build immediately.\n\n### **Community Driven**\nYou are learning alongside other builders. Share projects, get feedback, collaborate on ideas.\n\n### **Foundation First**\nBefore we dive into advanced tools, you need the vocabulary and concepts. That is what this module provides.\n\n## Why This Module Exists\n\nAI has its own language. Terms like "tokens," "context windows," "temperature," and "prompts" are thrown around constantly. Without understanding these basics, even the best tutorials will confuse you.\n\nThis module gives you the foundation to understand everything that comes next.'
            }
          },
          {
            id: 'intro-1-2',
            type: 'note',
            data: {
              text: '💡 **The Forefront Philosophy**: Learn by doing, stay current with the field, build real things. No fluff, no outdated content, no boring lectures.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'What is AI? Understanding the Basics',
        blocks: [
          {
            id: 'basics-2-1',
            type: 'text',
            data: {
              text: '# What is AI?\n\n## The Simple Answer\n\nArtificial Intelligence (AI) is software that can perform tasks that typically require human intelligence. In 2025, when people say "AI," they usually mean **Large Language Models (LLMs)** - systems that understand and generate human language.\n\n## The Slightly Technical Answer\n\nModern AI (ChatGPT, Claude, Gemini) uses a technology called **Transformers**. Think of a transformer as a pattern-matching engine that has read millions of books, websites, and documents. It learned patterns in how humans communicate, and now it can continue those patterns.\n\n### Key Insight: Prediction, Not Magic\n\nAI does not "think" like humans. It predicts the next word based on patterns it learned during training. When you type "The capital of France is..." the AI predicts "Paris" because it has seen that pattern thousands of times.\n\n## Why This Matters Now\n\nAI crossed a critical threshold in 2022-2023. It became:\n- **Good enough** to replace many human tasks\n- **Cheap enough** for anyone to use\n- **Easy enough** that no coding is required\n\nYou are learning AI at the perfect moment - early enough to get ahead, late enough that the tools actually work.'
            }
          },
          {
            id: 'basics-2-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/LPZh9BOjkQs',
              title: '3Blue1Brown - But what is a GPT? Visual intro to transformers'
            }
          }
        ]
      },
      {
        id: 3,
        title: 'Essential AI Vocabulary: Terms You Need to Know',
        blocks: [
          {
            id: 'vocab-3-1',
            type: 'text',
            data: {
              text: '# Essential AI Vocabulary\n\n## LLM (Large Language Model)\n\nA massive neural network trained on billions of words of text. Examples: GPT-4, Claude 4, Gemini 2.5.\n\n**Simple explanation**: An AI that understands and generates human language.\n\n## Tokens\n\nThe basic unit of text that AI models process. One token ≈ 4 characters or ¾ of a word.\n\n**Examples**:\n- "Hello world" = 2 tokens\n- "Artificial Intelligence" = 3 tokens\n- "ChatGPT" = 2 tokens (Chat + GPT)\n\n**Why it matters**: AI models have token limits. Understanding tokens helps you fit more into each request.\n\n## Context Window\n\nThe maximum number of tokens an AI can "remember" at once. This is the AI\'s working memory.\n\n**Model comparisons**:\n- GPT-4.1: 1 million tokens (~750,000 words)\n- Claude 4: 200,000 tokens (~150,000 words)\n- Gemini 2.5: 2 million tokens (~1.5 million words!)\n\n**Why it matters**: Larger context = AI can process longer documents, remember longer conversations, and handle more complex tasks.\n\n## Prompt\n\nThe input you give to an AI. Could be a question, instruction, or description.\n\n**Example prompts**:\n- "Explain quantum computing like I\'m 5"\n- "Write a Python function that sorts a list"\n- "Analyze this sales data and identify trends"\n\n**Why it matters**: Good prompts = good outputs. Bad prompts = confusing responses.'
            }
          },
          {
            id: 'vocab-3-2',
            type: 'note',
            data: {
              text: '🎯 **Remember**: Tokens are like LEGO bricks. The AI builds responses by stacking tokens together, one at a time, based on which token is most likely to come next.'
            }
          }
        ]
      },
      {
        id: 4,
        title: 'More AI Vocabulary: Parameters That Control AI',
        blocks: [
          {
            id: 'vocab2-4-1',
            type: 'text',
            data: {
              text: '# Controlling AI Behavior\n\n## Temperature\n\nControls how creative or random the AI\'s responses are.\n\n**Scale**: 0.0 to 1.0 (sometimes higher)\n\n### Temperature = 0.0 (Deterministic)\n- AI picks the most likely word every time\n- Same input = same output\n- Best for: Code, factual answers, consistency\n\n### Temperature = 0.5 (Balanced)\n- Mix of likely and creative words\n- Best for: General conversation, explanations\n\n### Temperature = 1.0 (Creative)\n- AI explores less likely options\n- More variety, more randomness\n- Best for: Creative writing, brainstorming, unique ideas\n\n## Top-p (Nucleus Sampling)\n\nAnother way to control randomness. Top-p = 0.9 means "only consider the most likely words that add up to 90% probability."\n\n**Simple rule**: Lower top-p = more focused, higher top-p = more variety\n\n## Max Tokens\n\nThe maximum length of the AI\'s response.\n\n**Example**: Max tokens = 100 → AI stops after about 75 words\n\n**Why set this**: Prevent rambling, control costs, force concise answers\n\n## System Prompt\n\nInstructions that tell the AI how to behave throughout the entire conversation.\n\n**Example**: "You are a helpful coding assistant. Always provide working code examples and explain your reasoning."\n\n**Why it matters**: System prompts set the AI\'s personality and behavior for the whole chat.'
            }
          },
          {
            id: 'vocab2-4-2',
            type: 'image',
            data: {
              url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
              alt: 'AI parameters visualization',
              caption: 'Temperature and other parameters control how creative or focused AI responses are'
            }
          }
        ]
      },
      {
        id: 5,
        title: 'The Big Three: ChatGPT vs Claude vs Gemini',
        blocks: [
          {
            id: 'models-5-1',
            type: 'text',
            data: {
              text: '# The Big Three AI Models (2025)\n\nThree companies dominate AI in 2025. Here is what each does best:\n\n## ChatGPT (OpenAI)\n\n**Best for**: Creative tasks, general assistance, multimodal work\n\n### Key Features\n- **Memory**: Remembers your preferences across conversations\n- **DALL-E Integration**: Generate images inline\n- **GPT Store**: Access thousands of custom AI apps\n- **Sora**: Video generation (Premium)\n\n### When to Use\n- Creative writing and brainstorming\n- Image generation\n- Building custom GPTs for specific tasks\n- General productivity\n\n**Pricing**: $20/month (Plus), $200/month (Pro)\n\n## Claude (Anthropic)\n\n**Best for**: Coding, long documents, careful analysis\n\n### Key Features\n- **Best Coding Model**: 72.5% on SWE-bench (industry leading)\n- **Writing Style**: Captures your voice better than others\n- **Safety Focused**: More cautious, fewer hallucinations\n- **Artifacts**: Visual outputs for code, documents, diagrams\n\n### When to Use\n- Writing code (any language)\n- Analyzing long documents (up to 200k tokens)\n- Tasks requiring accuracy and reliability\n- Professional writing\n\n**Pricing**: $20/month (Pro), $30/user/month (Team)\n\n## Gemini (Google)\n\n**Best for**: Factual queries, Google integration, multimodal tasks\n\n### Key Features\n- **Largest Context**: 2 million tokens (can analyze hour-long videos)\n- **Google Integration**: Search, Maps, Gmail, Drive\n- **Multimodal Native**: Images, video, audio, text all in one\n- **Fast & Factual**: Most consistent for factual questions\n\n### When to Use\n- Research and fact-checking\n- Video/image analysis\n- Tasks needing current information\n- Google Workspace integration\n\n**Pricing**: $20/month (AI Pro), $35/month (Ultra), Free with Workspace Business'
            }
          },
          {
            id: 'models-5-2',
            type: 'quiz',
            data: {
              question: 'You need to write a Python script to automate a complex task. Which AI should you choose?',
              options: [
                'ChatGPT - it has the best creative writing',
                'Claude - it leads on coding benchmarks',
                'Gemini - it has the largest context window',
                'Any of them work equally well for coding'
              ],
              correctAnswer: 1,
              explanation: 'Claude 4 is the current leader for coding tasks, scoring 72.5% on SWE-bench. While all three can code, Claude consistently produces higher quality, more accurate code with better explanations.'
            }
          }
        ]
      },
      {
        id: 6,
        title: 'How Transformers Work (Simplified)',
        blocks: [
          {
            id: 'trans-6-1',
            type: 'text',
            data: {
              text: '# How Transformers Work (No Math Required)\n\n## The Core Innovation: Attention\n\nThe breakthrough that made modern AI possible is called the **Attention Mechanism**. It allows AI to understand which words in a sentence relate to each other.\n\n### Example: Understanding Context\n\n**Sentence**: "The animal didn\'t cross the street because **it** was too tired."\n\n**Question**: What does "it" refer to?\n\n**Human answer**: The animal (not the street)\n\nThe attention mechanism lets AI figure this out by:\n1. Looking at all words in the sentence\n2. Calculating relationships between words\n3. Understanding "it" connects strongly to "animal" (not "street")\n\n## The Three Steps of AI Text Generation\n\n### Step 1: Tokenization\nBreak input text into tokens (word pieces)\n\n"Hello world" → [Hello] [world]\n\n### Step 2: Embedding\nConvert each token into a vector (list of numbers)\n\n[Hello] → [0.23, -0.45, 0.78, ... 768 numbers]\n\nThis vector captures the "meaning" of the word in mathematical form.\n\n### Step 3: Attention & Prediction\nThe transformer:\n- Analyzes relationships between all tokens\n- Predicts the next most likely token\n- Converts that token back into text\n- Repeats until the response is complete\n\n## Why This is Powerful\n\nPrevious AI could only remember nearby words. Transformers can connect words across entire documents, understanding long-range relationships and context.\n\nThis is why modern AI can:\n- Write coherent long-form content\n- Remember context from earlier in the conversation\n- Understand complex instructions\n- Generate accurate code'
            }
          },
          {
            id: 'trans-6-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/wjZofJX0v4M',
              title: 'Attention in transformers, visually explained'
            }
          }
        ]
      },
      {
        id: 7,
        title: 'Training vs Inference: How AI Learns',
        blocks: [
          {
            id: 'train-7-1',
            type: 'text',
            data: {
              text: '# How AI Models Learn\n\n## Phase 1: Pre-Training (The Expensive Part)\n\nThis is when the AI learns general knowledge.\n\n### What Happens\n1. Feed the model billions of words from books, websites, articles\n2. Train it to predict the next word\n3. Repeat trillions of times\n4. Result: AI that understands language patterns\n\n### The Cost\n- **GPT-4 training**: Estimated $100+ million\n- **Claude 4 training**: Estimated $50-100 million\n- **Time**: Several months on thousands of GPUs\n- **Data**: Trillions of tokens\n\n**You cannot do this at home.** Pre-training requires massive infrastructure.\n\n## Phase 2: Fine-Tuning (Making it Useful)\n\nAfter pre-training, the AI knows language but is not helpful yet. Fine-tuning makes it:\n- Follow instructions\n- Refuse harmful requests\n- Provide helpful, accurate responses\n\n### RLHF (Reinforcement Learning from Human Feedback)\nHumans rate AI responses:\n- Good response → AI learns to do more of that\n- Bad response → AI learns to avoid that\n\nThis is why ChatGPT is helpful instead of just predicting random internet text.\n\n## Phase 3: Inference (When You Use It)\n\n"Inference" means running the trained model to generate responses.\n\n**Key difference**: Training is expensive and rare. Inference is cheap and constant.\n\nWhen you chat with ChatGPT, you are doing inference. The model is already trained - it is just generating responses based on what it learned.\n\n## Important Distinction\n\nAI models **do not learn from your conversations** (unless explicitly stated). Each chat starts fresh. The model does not update or improve from talking to you.'
            }
          },
          {
            id: 'train-7-2',
            type: 'note',
            data: {
              text: '⚠️ **Common Misconception**: "I\'m training the AI by chatting with it." Nope! You are using a pre-trained model. It does not learn from you unless you are explicitly part of a fine-tuning process.'
            }
          }
        ]
      },
      {
        id: 8,
        title: 'Prompt Engineering: Getting Good Outputs',
        blocks: [
          {
            id: 'prompt-8-1',
            type: 'text',
            data: {
              text: '# Prompt Engineering Basics\n\nPrompt engineering is the skill of writing inputs that get the best AI outputs.\n\n## The Basic Structure\n\n### Bad Prompt\n"Write about AI"\n\n**Problem**: Too vague. AI does not know:\n- What aspect of AI?\n- How long should it be?\n- What tone to use?\n- Who is the audience?\n\n### Good Prompt\n"Write a 500-word explanation of how large language models work, targeted at college students with no AI background. Use simple language and include at least two concrete examples."\n\n**Why it works**:\n- ✅ Specific length\n- ✅ Clear audience\n- ✅ Defined tone\n- ✅ Concrete requirements\n\n## The Four-Part Framework\n\nEvery good prompt includes:\n\n### 1. Role/Context\n"You are an expert Python developer..."\n\n### 2. Task\n"Write a function that sorts a list..."\n\n### 3. Requirements\n"Use type hints, include docstrings, handle edge cases..."\n\n### 4. Output Format\n"Provide the code with inline comments explaining each step."\n\n## Advanced Techniques\n\n### Chain of Thought (CoT)\nAsk the AI to "think step by step" before answering.\n\n**Example**:\n"Solve this math problem. Think step by step, showing your work for each calculation."\n\n**Result**: More accurate answers, especially for reasoning tasks.\n\n### Few-Shot Learning\nProvide examples of what you want.\n\n**Example**:\n"Convert informal text to formal:\n\nInformal: hey whats up\nFormal: Hello, how are you?\n\nInformal: gotta run, ttyl\nFormal: I must go now, talk to you later.\n\nInformal: nvm, figured it out\nFormal:"\n\n**Result**: AI matches your pattern.\n\n### Iterative Refinement\nDo not expect perfection on the first try. Follow up:\n- "Make it more concise"\n- "Add more technical detail"\n- "Explain the third paragraph differently"'
            }
          },
          {
            id: 'prompt-8-2',
            type: 'codePreview',
            data: {
              language: 'text',
              code: '❌ BAD PROMPT:\n"Code a website"\n\n✅ GOOD PROMPT:\n"Create a modern landing page for a SaaS product with the following:\n\nStructure:\n- Hero section with headline and CTA button\n- Features section (3 columns)\n- Pricing table (3 tiers)\n- Footer with links\n\nTech Stack:\n- HTML5\n- Tailwind CSS\n- Vanilla JavaScript (no frameworks)\n\nStyle:\n- Dark theme (#0a0a0a background)\n- Gradient accent colors (blue to purple)\n- Mobile responsive\n- Smooth scroll animations\n\nProvide complete, working code with comments."',
              title: 'Prompt Engineering: Bad vs Good'
            }
          }
        ]
      },
      {
        id: 9,
        title: 'Common AI Limitations & How to Work Around Them',
        blocks: [
          {
            id: 'limits-9-1',
            type: 'text',
            data: {
              text: '# AI Limitations in 2025\n\nAI is powerful but not perfect. Understanding limitations helps you use AI effectively.\n\n## Limitation 1: Hallucinations\n\n**What it is**: AI confidently stating false information.\n\n**Example**:\nYou: "Who won the Nobel Prize in Physics in 2023?"\nAI: "Dr. Jane Smith won for her work on quantum teleportation."\n*(Completely made up)*\n\n**Why it happens**: AI predicts plausible-sounding text, not truth.\n\n**How to handle**:\n- Verify important facts\n- Ask AI to cite sources\n- Use models with web search (Gemini, ChatGPT with browsing)\n\n## Limitation 2: Knowledge Cutoff\n\nMost models are trained on data up to a certain date.\n\n**Example**:\n- GPT-4: Trained on data through April 2023\n- Claude 4: Trained on data through August 2023\n- Gemini 2.5: Live web search (no cutoff)\n\n**How to handle**:\n- Use models with web search for current events\n- Provide recent information in your prompt\n\n## Limitation 3: Cannot Do Math (Well)\n\nAI is trained on text patterns, not mathematical reasoning.\n\n**Example**:\n"What is 4,567 × 8,932?" → Often wrong\n\n**Why**: AI predicts what the answer looks like, not calculates it.\n\n**How to handle**:\n- Ask AI to use code to calculate\n- Use specialized math tools (Wolfram Alpha)\n- Verify any numerical answers\n\n## Limitation 4: Context Window Limits\n\nEven with large context windows, AI "forgets" information.\n\n**Problem**: Put 100 documents in context, ask about document #1 → often poor recall\n\n**How to handle**:\n- Put most important info near the start or end of prompt\n- Break large tasks into smaller chunks\n- Use retrieval systems (RAG) for large knowledge bases\n\n## Limitation 5: Cannot Browse the Internet (Usually)\n\nMost AI models cannot access real-time information.\n\n**Exception**: ChatGPT with browsing, Gemini (has web search)\n\n**How to handle**:\n- Copy-paste relevant web content into your prompt\n- Use AI with web access for current info\n- Understand you are working with training data, not live data'
            }
          },
          {
            id: 'limits-9-2',
            type: 'quiz',
            data: {
              question: 'You need AI to analyze financial data and calculate ROI. What should you do?',
              options: [
                'Trust the AI calculations directly',
                'Ask the AI to write code to perform the calculations',
                'Use a different tool - AI cannot handle numbers',
                'Ask the AI to explain the concept, then calculate yourself'
              ],
              correctAnswer: 1,
              explanation: 'AI is bad at math directly but excellent at writing code. Ask it to write Python/JavaScript that performs the calculations. Then you can verify the code logic and run it for accurate results.'
            }
          }
        ]
      },
      {
        id: 10,
        title: 'Your AI Learning Path: What Comes Next',
        blocks: [
          {
            id: 'path-10-1',
            type: 'text',
            data: {
              text: '# Your Forefront Journey\n\nNow that you understand AI fundamentals, here is what comes next in your Forefront learning path:\n\n## Module 2: Marketing with AI\n\nLearn to use AI for:\n- Copywriting that converts\n- Content generation at scale\n- Market research and analysis\n- Automated workflows\n\n**Vocabulary you will use**: Prompt engineering, temperature control, few-shot learning\n\n## Module 3: Content Creation with AI\n\nMaster AI tools for:\n- Video generation (Google Veo, Sora)\n- Image creation (Midjourney, DALL-E)\n- Voice synthesis (ElevenLabs)\n- Video editing automation (Descript)\n\n**Vocabulary you will use**: Multimodal AI, tokens, generation parameters\n\n## Module 4: Music Production with AI\n\nCreate professional music with:\n- AI composition (Suno, Udio)\n- Stem separation (LANDR)\n- Audio mastering (iZotope)\n- Voice synthesis for vocals\n\n**Vocabulary you will use**: Model fine-tuning, training data, inference\n\n## Module 5: AI Automation\n\nBuild intelligent workflows:\n- No-code automation (Zapier, Make)\n- AI agents (LangChain, AutoGPT)\n- Custom AI tools (API integration)\n- Workflow optimization\n\n**Vocabulary you will use**: Context windows, system prompts, chain of thought\n\n## The Forefront Advantage\n\nYou are not just learning tools. You are building a foundation:\n\n### Understanding > Memorization\nTools change. Concepts stay. You now understand how AI works, so learning new tools is easy.\n\n### Vocabulary Fluency\nYou can read AI documentation, follow tutorials, and join discussions because you speak the language.\n\n### Problem-Solving Mindset\nYou know AI limitations and strengths. You can choose the right tool for each task.\n\n## Stay at the Forefront\n\n- **Update Your Knowledge**: AI changes fast. Check back monthly for updated modules.\n- **Build Projects**: Apply what you learn. Build real things.\n- **Join the Community**: Share your work, get feedback, collaborate.\n- **Keep Learning**: AI is a skill that compounds. Each tool you master makes the next one easier.\n\nWelcome to Forefront. Let us build the future together.'
            }
          },
          {
            id: 'path-10-2',
            type: 'note',
            data: {
              text: '🚀 **Next Steps**: Head to Module 2 to start building practical AI skills. You now have the vocabulary and concepts to understand everything we will cover. Time to get hands-on!'
            }
          }
        ]
      }
    ]

    console.log('Updating database...')
    await sql`
      UPDATE modules
      SET
        title = 'AI Fundamentals - Understanding the Basics',
        description = 'Master essential AI vocabulary, understand how LLMs work, and learn what makes Forefront different. The foundation for everything that comes next.',
        slides = ${JSON.stringify(newSlides)},
        duration = '2 hours',
        learning_objectives = ${JSON.stringify([
          'Understand what Forefront is and why it is different from other learning platforms',
          'Master essential AI vocabulary: tokens, context windows, temperature, prompts',
          'Learn how transformers and attention mechanisms work (no math required)',
          'Compare ChatGPT, Claude, and Gemini - know which to use when',
          'Write effective prompts that get high-quality AI outputs',
          'Understand AI limitations and how to work around them'
        ])},
        key_takeaways = ${JSON.stringify([
          'Forefront keeps you current with AI as it evolves - always hands-on, never outdated',
          'Tokens are the basic unit of AI text (4 chars ≈ 1 token)',
          'Context window is AI memory - Gemini has 2M tokens (largest in 2025)',
          'Temperature controls creativity: 0.0 = deterministic, 1.0 = creative',
          'Claude leads at coding (72.5% SWE-bench), ChatGPT best for creativity, Gemini best for facts',
          'AI predicts next words based on patterns - it does not truly "understand" or "think"'
        ])},
        updated_at = NOW()
      WHERE module_id = 'module-vibe-coding-2025'
    `

    console.log('✅ Module 1 completely rebuilt!\n')
    console.log('📍 New focus: AI Fundamentals & Vocabulary')
    console.log('   - What is Forefront and why it is different')
    console.log('   - Essential AI vocabulary everyone needs')
    console.log('   - How transformers and LLMs actually work')
    console.log('   - Comparing the big three: ChatGPT, Claude, Gemini')
    console.log('   - Prompt engineering basics')
    console.log('   - AI limitations and workarounds')
    console.log('   - Your learning path forward')
    console.log('\n🎯 10 comprehensive slides with proper heading formatting')
    console.log('\n✨ View at: http://localhost:3000/modules/vibe-coding-ai')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

rebuildModule1()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
