import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🔄 Rebuilding Module 1: AI Fundamentals (v2 - proper formatting)...\n')

const newSlides = [
  // SLIDE 1: Welcome
  {
    id: 1,
    title: 'Welcome to Forefront: AI at the Cutting Edge',
    blocks: [
      {
        id: 'intro-1-1',
        type: 'text',
        data: {
          html: '<h1>Welcome to Forefront</h1>'
        }
      },
      {
        id: 'intro-1-2',
        type: 'text',
        data: {
          html: '<p>You are at the <strong>forefront</strong> of the AI revolution - not watching from the sidelines.</p>'
        }
      },
      {
        id: 'intro-1-3',
        type: 'text',
        data: {
          html: '<h2>What Makes Forefront Different?</h2>'
        }
      },
      {
        id: 'intro-1-4',
        type: 'text',
        data: {
          html: '<h3><strong>Always Current</strong></h3><p>AI changes weekly. Our modules update in real-time as new tools and techniques emerge. What you learn today is what professionals use today.</p>'
        }
      },
      {
        id: 'intro-1-5',
        type: 'text',
        data: {
          html: '<h3><strong>Hands-On First</strong></h3><p>No theory without practice. Every module includes real tools, actual workflows, and projects you can build immediately.</p>'
        }
      },
      {
        id: 'intro-1-6',
        type: 'text',
        data: {
          html: '<h3><strong>Community Driven</strong></h3><p>You are learning alongside other builders. Share projects, get feedback, collaborate on ideas.</p>'
        }
      },
      {
        id: 'intro-1-7',
        type: 'text',
        data: {
          html: '<h3><strong>Foundation First</strong></h3><p>Before we dive into advanced tools, you need the vocabulary and concepts. That is what this module provides.</p>'
        }
      },
      {
        id: 'intro-1-8',
        type: 'text',
        data: {
          html: '<h2>Why This Module Exists</h2>'
        }
      },
      {
        id: 'intro-1-9',
        type: 'text',
        data: {
          html: '<p>AI has its own language. Terms like "tokens," "context windows," "temperature," and "prompts" are thrown around constantly. Without understanding these basics, even the best tutorials will confuse you. This module gives you the foundation to understand everything that comes next.</p>'
        }
      },
      {
        id: 'intro-1-10',
        type: 'note',
        data: {
          text: '💡 <strong>The Forefront Philosophy</strong>: Learn by doing, stay current with the field, build real things. No fluff, no outdated content, no boring lectures.'
        }
      }
    ]
  },

  // SLIDE 2: What is AI?
  {
    id: 2,
    title: 'What is AI? Understanding the Basics',
    blocks: [
      {
        id: 'basics-2-1',
        type: 'text',
        data: {
          html: '<h1>What is AI?</h1>'
        }
      },
      {
        id: 'basics-2-2',
        type: 'text',
        data: {
          html: '<p><strong>Artificial Intelligence (AI)</strong> is software that can understand, generate, and interact with human language and other forms of data in ways that feel natural.</p>'
        }
      },
      {
        id: 'basics-2-3',
        type: 'text',
        data: {
          html: '<h2>Large Language Models (LLMs)</h2>'
        }
      },
      {
        id: 'basics-2-4',
        type: 'text',
        data: {
          html: '<p>The AI tools you are using - ChatGPT, Claude, Gemini - are all <strong>Large Language Models (LLMs)</strong>.</p><p>Think of them as massive neural networks trained on billions of words of text. They learn patterns in language, then use those patterns to generate responses.</p>'
        }
      },
      {
        id: 'basics-2-5',
        type: 'text',
        data: {
          html: '<h3>Simple Explanation</h3>'
        }
      },
      {
        id: 'basics-2-6',
        type: 'text',
        data: {
          html: '<p>An AI that understands and generates human language. It does not "think" like humans - it predicts what word comes next based on patterns it has seen.</p>'
        }
      },
      {
        id: 'basics-2-7',
        type: 'text',
        data: {
          html: '<h2>How This Changes Everything</h2>'
        }
      },
      {
        id: 'basics-2-8',
        type: 'text',
        data: {
          html: '<p>Before LLMs, you needed to write exact commands for computers. Now? You can describe what you want in plain English. You can code faster, write better, create content, automate workflows - all with conversational AI.</p>'
        }
      },
      {
        id: 'basics-2-9',
        type: 'note',
        data: {
          text: '🎯 <strong>Bottom line</strong>: AI is not magic. It is pattern recognition at massive scale. Understanding this helps you use it better.'
        }
      }
    ]
  },

  // SLIDE 3: Essential Vocabulary Part 1
  {
    id: 3,
    title: 'Essential AI Vocabulary: Terms You Need to Know',
    blocks: [
      {
        id: 'vocab-3-1',
        type: 'text',
        data: {
          html: '<h1>Essential AI Vocabulary</h1>'
        }
      },
      {
        id: 'vocab-3-2',
        type: 'text',
        data: {
          html: '<h2>LLM (Large Language Model)</h2>'
        }
      },
      {
        id: 'vocab-3-3',
        type: 'text',
        data: {
          html: '<p>A massive neural network trained on billions of words of text. Examples: GPT-4, Claude 4, Gemini 2.5.</p><p><strong>Simple explanation</strong>: An AI that understands and generates human language.</p>'
        }
      },
      {
        id: 'vocab-3-4',
        type: 'text',
        data: {
          html: '<h2>Tokens</h2>'
        }
      },
      {
        id: 'vocab-3-5',
        type: 'text',
        data: {
          html: '<p>The basic unit of text that AI models process. One token ≈ 4 characters or ¾ of a word.</p>'
        }
      },
      {
        id: 'vocab-3-6',
        type: 'text',
        data: {
          html: '<p><strong>Examples</strong>:<br/>- "Hello world" = 2 tokens<br/>- "Artificial Intelligence" = 3 tokens<br/>- "ChatGPT" = 2 tokens (Chat + GPT)</p>'
        }
      },
      {
        id: 'vocab-3-7',
        type: 'text',
        data: {
          html: '<p><strong>Why it matters</strong>: AI models have token limits. Understanding tokens helps you fit more into each request.</p>'
        }
      },
      {
        id: 'vocab-3-8',
        type: 'text',
        data: {
          html: '<h2>Context Window</h2>'
        }
      },
      {
        id: 'vocab-3-9',
        type: 'text',
        data: {
          html: '<p>The maximum number of tokens an AI can "remember" at once. This is the AI\'s working memory.</p>'
        }
      },
      {
        id: 'vocab-3-10',
        type: 'text',
        data: {
          html: '<p><strong>Model comparisons</strong>:<br/>- GPT-4: 1 million tokens (~750,000 words)<br/>- Claude 4: 200,000 tokens (~150,000 words)<br/>- Gemini 2.5: 2 million tokens (~1.5 million words!)</p>'
        }
      },
      {
        id: 'vocab-3-11',
        type: 'text',
        data: {
          html: '<p><strong>Why it matters</strong>: Larger context = AI can process longer documents, remember longer conversations, and handle more complex tasks.</p>'
        }
      },
      {
        id: 'vocab-3-12',
        type: 'text',
        data: {
          html: '<h2>Prompt</h2>'
        }
      },
      {
        id: 'vocab-3-13',
        type: 'text',
        data: {
          html: '<p>The input you give to an AI. Could be a question, instruction, or description.</p>'
        }
      },
      {
        id: 'vocab-3-14',
        type: 'text',
        data: {
          html: '<p><strong>Example prompts</strong>:<br/>- "Explain quantum computing like I\'m 5"<br/>- "Write a Python function that sorts a list"<br/>- "Analyze this sales data and identify trends"</p>'
        }
      },
      {
        id: 'vocab-3-15',
        type: 'text',
        data: {
          html: '<p><strong>Why it matters</strong>: Good prompts = good outputs. Bad prompts = confusing responses.</p>'
        }
      },
      {
        id: 'vocab-3-16',
        type: 'note',
        data: {
          text: '🔑 <strong>Remember</strong>: Tokens are like LEGO bricks. The AI builds responses by stacking tokens together, one at a time, based on which token is most likely to come next.'
        }
      }
    ]
  },

  // SLIDE 4: Essential Vocabulary Part 2
  {
    id: 4,
    title: 'More AI Vocabulary: Advanced Terms',
    blocks: [
      {
        id: 'vocab2-4-1',
        type: 'text',
        data: {
          html: '<h1>More Essential Terms</h1>'
        }
      },
      {
        id: 'vocab2-4-2',
        type: 'text',
        data: {
          html: '<h2>Temperature</h2>'
        }
      },
      {
        id: 'vocab2-4-3',
        type: 'text',
        data: {
          html: '<p>Controls how creative or random the AI\'s responses are. Scale: 0.0 to 2.0</p>'
        }
      },
      {
        id: 'vocab2-4-4',
        type: 'text',
        data: {
          html: '<p><strong>Low temperature (0.1 - 0.5)</strong>: More predictable, factual, focused. Good for code, technical answers, data analysis.</p>'
        }
      },
      {
        id: 'vocab2-4-5',
        type: 'text',
        data: {
          html: '<p><strong>High temperature (0.7 - 1.5)</strong>: More creative, varied, experimental. Good for brainstorming, creative writing, marketing copy.</p>'
        }
      },
      {
        id: 'vocab2-4-6',
        type: 'text',
        data: {
          html: '<h2>Top-P (Nucleus Sampling)</h2>'
        }
      },
      {
        id: 'vocab2-4-7',
        type: 'text',
        data: {
          html: '<p>Another way to control randomness. It limits the pool of possible next tokens to the most likely ones.</p><p>Set to 0.9? AI only picks from the top 90% most probable tokens.</p>'
        }
      },
      {
        id: 'vocab2-4-8',
        type: 'text',
        data: {
          html: '<h2>System Prompt</h2>'
        }
      },
      {
        id: 'vocab2-4-9',
        type: 'text',
        data: {
          html: '<p>Hidden instructions that define how the AI should behave. You usually do not see this, but developers set it.</p>'
        }
      },
      {
        id: 'vocab2-4-10',
        type: 'text',
        data: {
          html: '<p><strong>Example</strong>: "You are a helpful coding assistant. Always provide code examples. Be concise."</p>'
        }
      },
      {
        id: 'vocab2-4-11',
        type: 'text',
        data: {
          html: '<h2>Fine-Tuning</h2>'
        }
      },
      {
        id: 'vocab2-4-12',
        type: 'text',
        data: {
          html: '<p>Training an existing AI model on specific data to make it better at particular tasks. Like giving an already-smart AI specialized training.</p>'
        }
      },
      {
        id: 'vocab2-4-13',
        type: 'text',
        data: {
          html: '<h2>Hallucination</h2>'
        }
      },
      {
        id: 'vocab2-4-14',
        type: 'text',
        data: {
          html: '<p>When AI confidently states something completely wrong. It "hallucinates" facts that do not exist.</p>'
        }
      },
      {
        id: 'vocab2-4-15',
        type: 'text',
        data: {
          html: '<p><strong>Why it happens</strong>: AI predicts what sounds right, not what is actually true. It does not "know" facts - it generates text based on patterns.</p>'
        }
      },
      {
        id: 'vocab2-4-16',
        type: 'note',
        data: {
          text: '⚡ <strong>Pro tip</strong>: Always verify important facts AI gives you. Treat it like a smart but sometimes-confused assistant.'
        }
      }
    ]
  },

  // SLIDE 5: The Big Three
  {
    id: 5,
    title: 'The Big Three: ChatGPT vs Claude vs Gemini',
    blocks: [
      {
        id: 'compare-5-1',
        type: 'text',
        data: {
          html: '<h1>The Big Three AI Models (2025)</h1>'
        }
      },
      {
        id: 'compare-5-2',
        type: 'text',
        data: {
          html: '<h2>ChatGPT (OpenAI)</h2>'
        }
      },
      {
        id: 'compare-5-3',
        type: 'text',
        data: {
          html: '<p><strong>Strengths</strong>: Best for general use, creative writing, brainstorming. Huge ecosystem of plugins and integrations.</p><p><strong>Context window</strong>: 1 million tokens (~750k words)</p><p><strong>Best for</strong>: Marketing copy, creative projects, general questions, quick tasks.</p>'
        }
      },
      {
        id: 'compare-5-4',
        type: 'text',
        data: {
          html: '<h2>Claude (Anthropic)</h2>'
        }
      },
      {
        id: 'compare-5-5',
        type: 'text',
        data: {
          html: '<p><strong>Strengths</strong>: Best for coding, technical writing, complex reasoning. More careful and accurate than ChatGPT.</p><p><strong>Context window</strong>: 200,000 tokens (~150k words)</p><p><strong>Best for</strong>: Programming, data analysis, technical documentation, nuanced conversations.</p>'
        }
      },
      {
        id: 'compare-5-6',
        type: 'text',
        data: {
          html: '<h2>Gemini (Google)</h2>'
        }
      },
      {
        id: 'compare-5-7',
        type: 'text',
        data: {
          html: '<p><strong>Strengths</strong>: Massive 2 million token context window. Best for processing huge documents, long research, deep analysis.</p><p><strong>Context window</strong>: 2 million tokens (~1.5 million words!)</p><p><strong>Best for</strong>: Research, long-form content, analyzing massive datasets, multi-step reasoning.</p>'
        }
      },
      {
        id: 'compare-5-8',
        type: 'text',
        data: {
          html: '<h2>Which Should You Use?</h2>'
        }
      },
      {
        id: 'compare-5-9',
        type: 'text',
        data: {
          html: '<p><strong>ChatGPT</strong>: For quick creative tasks, brainstorming, general use</p><p><strong>Claude</strong>: For coding, technical work, detailed analysis</p><p><strong>Gemini</strong>: For processing huge documents, deep research, long conversations</p>'
        }
      },
      {
        id: 'compare-5-10',
        type: 'note',
        data: {
          text: '🎯 <strong>Real talk</strong>: Most pros use all three. Each has strengths. Pick the right tool for the job.'
        }
      }
    ]
  },

  // SLIDE 6: How Transformers Work
  {
    id: 6,
    title: 'How Transformers Work (Simplified)',
    blocks: [
      {
        id: 'transformer-6-1',
        type: 'text',
        data: {
          html: '<h1>How Does AI Actually Work?</h1>'
        }
      },
      {
        id: 'transformer-6-2',
        type: 'text',
        data: {
          html: '<h2>The Transformer Architecture</h2>'
        }
      },
      {
        id: 'transformer-6-3',
        type: 'text',
        data: {
          html: '<p>All modern LLMs use <strong>transformers</strong> - a neural network architecture invented by Google in 2017.</p>'
        }
      },
      {
        id: 'transformer-6-4',
        type: 'text',
        data: {
          html: '<h3>The Simple Version</h3>'
        }
      },
      {
        id: 'transformer-6-5',
        type: 'text',
        data: {
          html: '<p>1. <strong>Break text into tokens</strong>: "Hello world" → ["Hello", " world"]</p><p>2. <strong>Convert to numbers</strong>: Each token becomes a vector (list of numbers)</p><p>3. <strong>Attention mechanism</strong>: The AI figures out which words are related to each other</p><p>4. <strong>Predict next token</strong>: Based on patterns, what word comes next?</p><p>5. <strong>Repeat</strong>: Generate one token at a time until done</p>'
        }
      },
      {
        id: 'transformer-6-6',
        type: 'text',
        data: {
          html: '<h2>The Attention Mechanism</h2>'
        }
      },
      {
        id: 'transformer-6-7',
        type: 'text',
        data: {
          html: '<p>This is the magic. <strong>Attention</strong> lets the AI understand context by figuring out which words relate to each other.</p>'
        }
      },
      {
        id: 'transformer-6-8',
        type: 'text',
        data: {
          html: '<p><strong>Example</strong>: In "The cat sat on the mat," attention helps the AI know "it" refers to "cat."</p>'
        }
      },
      {
        id: 'transformer-6-9',
        type: 'text',
        data: {
          html: '<h2>Why This Matters</h2>'
        }
      },
      {
        id: 'transformer-6-10',
        type: 'text',
        data: {
          html: '<p>Understanding that AI generates <strong>one token at a time</strong> helps you write better prompts. The AI is not "thinking" - it is pattern-matching and predicting what comes next.</p>'
        }
      },
      {
        id: 'transformer-6-11',
        type: 'note',
        data: {
          text: '🧠 <strong>Key insight</strong>: AI does not understand meaning like humans. It recognizes patterns. Feed it better patterns (prompts), get better outputs.'
        }
      }
    ]
  },

  // SLIDE 7: Training vs Inference
  {
    id: 7,
    title: 'Training vs Inference: Two Different Modes',
    blocks: [
      {
        id: 'train-7-1',
        type: 'text',
        data: {
          html: '<h1>Training vs Inference</h1>'
        }
      },
      {
        id: 'train-7-2',
        type: 'text',
        data: {
          html: '<h2>Training (What You Do Not Do)</h2>'
        }
      },
      {
        id: 'train-7-3',
        type: 'text',
        data: {
          html: '<p>Training is when companies like OpenAI, Anthropic, and Google teach AI by feeding it billions of words. This process:</p><p>- Costs millions of dollars in compute power</p><p>- Takes weeks or months</p><p>- Requires massive datasets</p><p>- Creates the base model</p>'
        }
      },
      {
        id: 'train-7-4',
        type: 'text',
        data: {
          html: '<p><strong>You do not train models</strong>. Companies do that. You use the trained models.</p>'
        }
      },
      {
        id: 'train-7-5',
        type: 'text',
        data: {
          html: '<h2>Inference (What You Do)</h2>'
        }
      },
      {
        id: 'train-7-6',
        type: 'text',
        data: {
          html: '<p>Inference is when you use a trained model. Every time you send a prompt to ChatGPT or Claude, that is inference.</p><p>- Happens in seconds</p><p>- Costs pennies (or free)</p><p>- Uses the patterns learned during training</p><p>- Generates new text based on your prompt</p>'
        }
      },
      {
        id: 'train-7-7',
        type: 'text',
        data: {
          html: '<h2>The Important Part</h2>'
        }
      },
      {
        id: 'train-7-8',
        type: 'text',
        data: {
          html: '<p>You are always doing <strong>inference</strong>. The AI already knows patterns from training. Your job is to write prompts that activate the right patterns.</p>'
        }
      },
      {
        id: 'train-7-9',
        type: 'note',
        data: {
          text: '💡 <strong>Analogy</strong>: Training is like teaching someone a language over years. Inference is having a conversation with that person. You do not re-teach - you communicate.'
        }
      }
    ]
  },

  // SLIDE 8: Prompt Engineering Basics
  {
    id: 8,
    title: 'Prompt Engineering: Writing Better Prompts',
    blocks: [
      {
        id: 'prompt-8-1',
        type: 'text',
        data: {
          html: '<h1>Prompt Engineering Basics</h1>'
        }
      },
      {
        id: 'prompt-8-2',
        type: 'text',
        data: {
          html: '<p><strong>Prompt engineering</strong> is the skill of writing prompts that get you the outputs you want. It is the most important AI skill you can learn.</p>'
        }
      },
      {
        id: 'prompt-8-3',
        type: 'text',
        data: {
          html: '<h2>Bad Prompt vs Good Prompt</h2>'
        }
      },
      {
        id: 'prompt-8-4',
        type: 'text',
        data: {
          html: '<p><strong>Bad</strong>: "Write code"</p><p><strong>Good</strong>: "Write a Python function that takes a list of numbers and returns the average. Include error handling for empty lists."</p>'
        }
      },
      {
        id: 'prompt-8-5',
        type: 'text',
        data: {
          html: '<h2>The Formula for Great Prompts</h2>'
        }
      },
      {
        id: 'prompt-8-6',
        type: 'text',
        data: {
          html: '<p>1. <strong>Context</strong>: What is the situation?</p><p>2. <strong>Task</strong>: What do you want done?</p><p>3. <strong>Format</strong>: How should the output look?</p><p>4. <strong>Constraints</strong>: Any limits or requirements?</p>'
        }
      },
      {
        id: 'prompt-8-7',
        type: 'text',
        data: {
          html: '<h3>Example: Marketing Email</h3>'
        }
      },
      {
        id: 'prompt-8-8',
        type: 'text',
        data: {
          html: '<p><strong>Context</strong>: "You are writing for a SaaS company targeting small business owners."</p><p><strong>Task</strong>: "Write a marketing email about our new automation feature."</p><p><strong>Format</strong>: "Keep it under 150 words, casual tone, include a clear CTA."</p><p><strong>Constraints</strong>: "Do not use jargon. Focus on time-saving benefits."</p>'
        }
      },
      {
        id: 'prompt-8-9',
        type: 'text',
        data: {
          html: '<h2>Advanced Techniques</h2>'
        }
      },
      {
        id: 'prompt-8-10',
        type: 'text',
        data: {
          html: '<p><strong>Few-shot prompting</strong>: Give examples of what you want</p><p><strong>Chain-of-thought</strong>: Ask AI to think step-by-step</p><p><strong>Role-playing</strong>: "You are an expert Python developer..."</p><p><strong>Iterative refinement</strong>: Start broad, narrow down with follow-ups</p>'
        }
      },
      {
        id: 'prompt-8-11',
        type: 'note',
        data: {
          text: '🎯 <strong>Pro tip</strong>: Treat AI like a very literal intern. Be specific. Give examples. Clarify edge cases. The more context you provide, the better the output.'
        }
      }
    ]
  },

  // SLIDE 9: AI Limitations
  {
    id: 9,
    title: 'AI Limitations & How to Work Around Them',
    blocks: [
      {
        id: 'limits-9-1',
        type: 'text',
        data: {
          html: '<h1>What AI Cannot Do (Yet)</h1>'
        }
      },
      {
        id: 'limits-9-2',
        type: 'text',
        data: {
          html: '<h2>Hallucinations</h2>'
        }
      },
      {
        id: 'limits-9-3',
        type: 'text',
        data: {
          html: '<p><strong>Problem</strong>: AI confidently makes up facts that sound true but are not.</p><p><strong>Workaround</strong>: Verify important facts. Ask for sources. Use AI for drafts, not final truth.</p>'
        }
      },
      {
        id: 'limits-9-4',
        type: 'text',
        data: {
          html: '<h2>No Real-Time Knowledge</h2>'
        }
      },
      {
        id: 'limits-9-5',
        type: 'text',
        data: {
          html: '<p><strong>Problem</strong>: AI training data has a cutoff date. It does not know what happened yesterday.</p><p><strong>Workaround</strong>: Provide recent info in your prompt. Use web-connected AI tools when you need current data.</p>'
        }
      },
      {
        id: 'limits-9-6',
        type: 'text',
        data: {
          html: '<h2>Cannot Actually Execute Code</h2>'
        }
      },
      {
        id: 'limits-9-7',
        type: 'text',
        data: {
          html: '<p><strong>Problem</strong>: AI writes code but cannot run it to test (in most cases).</p><p><strong>Workaround</strong>: Test code yourself. Use AI to draft, then debug iteratively.</p>'
        }
      },
      {
        id: 'limits-9-8',
        type: 'text',
        data: {
          html: '<h2>Context Limits</h2>'
        }
      },
      {
        id: 'limits-9-9',
        type: 'text',
        data: {
          html: '<p><strong>Problem</strong>: Even with huge context windows, AI cannot remember everything forever.</p><p><strong>Workaround</strong>: Summarize long conversations. Start fresh when needed. Use external memory tools.</p>'
        }
      },
      {
        id: 'limits-9-10',
        type: 'text',
        data: {
          html: '<h2>No True Understanding</h2>'
        }
      },
      {
        id: 'limits-9-11',
        type: 'text',
        data: {
          html: '<p><strong>Problem</strong>: AI does not "understand" like humans. It pattern-matches.</p><p><strong>Workaround</strong>: Be explicit. Over-explain edge cases. Assume AI is literal, not intuitive.</p>'
        }
      },
      {
        id: 'limits-9-12',
        type: 'note',
        data: {
          text: '⚠️ <strong>Reality check</strong>: AI is powerful but not perfect. Use it to augment your work, not replace your judgment.'
        }
      }
    ]
  },

  // SLIDE 10: Your Learning Path
  {
    id: 10,
    title: 'Your Learning Path: What Comes Next',
    blocks: [
      {
        id: 'path-10-1',
        type: 'text',
        data: {
          html: '<h1>Your Learning Path Forward</h1>'
        }
      },
      {
        id: 'path-10-2',
        type: 'text',
        data: {
          html: '<p>Now that you understand the fundamentals, here is how to keep moving forward on the forefront:</p>'
        }
      },
      {
        id: 'path-10-3',
        type: 'text',
        data: {
          html: '<h2>What You Just Learned</h2>'
        }
      },
      {
        id: 'path-10-4',
        type: 'text',
        data: {
          html: '<p>✅ What LLMs are and how they work<br/>✅ Essential vocabulary (tokens, context, prompts, temperature)<br/>✅ The big three AI models and their strengths<br/>✅ How transformers generate text<br/>✅ Prompt engineering basics<br/>✅ AI limitations and workarounds</p>'
        }
      },
      {
        id: 'path-10-5',
        type: 'text',
        data: {
          html: '<h2>Next Steps</h2>'
        }
      },
      {
        id: 'path-10-6',
        type: 'text',
        data: {
          html: '<p><strong>Module 2: AI-Powered Marketing</strong><br/>Learn how to create campaigns, write copy, and automate workflows 10x faster.</p><p><strong>Module 3: Content Creation with AI</strong><br/>Turn ideas into video scripts, social media posts, and long-form content in minutes.</p><p><strong>Module 4: AI Music Production</strong><br/>Explore creative possibilities in production, mixing, and sound design with AI tools.</p><p><strong>Module 5: AI Automation Workflows</strong><br/>Build systems that work for you 24/7. Automate repetitive tasks and scale your output.</p>'
        }
      },
      {
        id: 'path-10-7',
        type: 'text',
        data: {
          html: '<h2>How to Learn at Forefront</h2>'
        }
      },
      {
        id: 'path-10-8',
        type: 'text',
        data: {
          html: '<p>1. <strong>Complete modules</strong> - Hands-on, real tools, actual workflows</p><p>2. <strong>Build projects</strong> - Apply what you learn immediately</p><p>3. <strong>Share discoveries</strong> - Found something that works? Teach it</p><p>4. <strong>Stay current</strong> - New tools drop weekly. We update in real-time</p><p>5. <strong>Connect with others</strong> - Learn alongside builders, not in isolation</p>'
        }
      },
      {
        id: 'path-10-9',
        type: 'text',
        data: {
          html: '<h2>The Forefront Mindset</h2>'
        }
      },
      {
        id: 'path-10-10',
        type: 'text',
        data: {
          html: '<p>AI is not a threat. It is a tool. The students who master these tools now will define the next decade of work.</p><p>You are not watching from the sidelines. You are at the forefront.</p><p>Let us build.</p>'
        }
      },
      {
        id: 'path-10-11',
        type: 'note',
        data: {
          text: '🚀 <strong>Ready?</strong> Move to Module 2 to start building real AI-powered workflows. Or revisit any slide if you need to solidify these concepts first.'
        }
      }
    ]
  }
]

// Update database
console.log('Updating database...')

await sql`
  UPDATE modules
  SET
    title = 'AI Fundamentals - Understanding the Basics',
    description = 'Master essential AI vocabulary, understand how LLMs work, and learn the foundation concepts you need before diving into advanced AI tools. No fluff, just the straight sauce.',
    slides = ${JSON.stringify(newSlides)},
    learning_objectives = ${JSON.stringify([
      'Understand what LLMs are and how they generate text',
      'Master essential AI vocabulary (tokens, context windows, prompts, temperature)',
      'Compare ChatGPT, Claude, and Gemini to pick the right tool for each job',
      'Learn how transformers work under the hood (simplified)',
      'Write better prompts using prompt engineering fundamentals',
      'Recognize AI limitations and know how to work around them'
    ])},
    key_takeaways = ${JSON.stringify([
      'AI predicts text patterns - it does not truly "understand" like humans',
      'Tokens are the basic unit of AI text processing (~4 chars each)',
      'Context windows define how much AI can remember at once',
      'Good prompts = good outputs. Be specific, give context, show examples.',
      'Each AI model has strengths: ChatGPT (creative), Claude (technical), Gemini (massive context)',
      'Always verify important facts - AI can hallucinate confidently wrong information'
    ])},
    updated_at = NOW()
  WHERE module_id = 'module-vibe-coding-2025'
`

console.log('✅ Module 1 completely rebuilt!\n')
console.log('📍 New structure: Proper HTML heading tags (h1, h2, h3) for each heading')
console.log('   - Separate text blocks for each heading and paragraph')
console.log('   - "No bullshit, straight sauce" tone matching Forefront brand')
console.log('   - Foundation-first approach: vocabulary, concepts, then applications\n')
console.log('🎯 10 comprehensive slides with proper formatting\n')
console.log('✨ View at: http://localhost:3000/modules/vibe-coding-ai\n')
