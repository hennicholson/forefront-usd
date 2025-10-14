const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function updateModule1() {
  console.log('🔄 Updating Module 1: CLI AI Coding Tools & MCP...\n')

  try {
    const newSlides = [
      {
        id: 1,
        title: 'The Terminal-First AI Revolution',
        blocks: [
          {
            id: 'cli-1-1',
            type: 'text',
            data: {
              text: '**Welcome to Terminal-Native AI Development**\n\n2025 marks the shift from GUI-based AI coding to **terminal-native AI agents**. The most powerful developers now code entirely from the command line with AI assistants that understand entire codebases.\n\n**Why CLI AI Tools Dominate:**\n- **Speed**: No context switching between editor and AI\n- **Control**: Approve every change before execution\n- **Automation**: Scriptable workflows for repetitive tasks\n- **Integration**: Native git, GitHub, and MCP support\n- **Privacy**: Local execution, no remote code indexing\n\n**The Tools You Will Master:**\n- **Claude Code**: Anthropic AI agent in your terminal\n- **GitHub Copilot CLI**: GitHub-native terminal assistant\n- **Gemini CLI**: Google open-source AI agent\n- **Aider**: Open-source pair programming tool\n- **Model Context Protocol (MCP)**: The standard connecting AI to everything'
            }
          },
          {
            id: 'cli-1-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/oFfVt3S51T4',
              title: 'Claude Code: Deep coding at terminal velocity'
            }
          },
          {
            id: 'cli-1-3',
            type: 'note',
            data: {
              text: '💡 **Key Insight**: By end of 2025, 80% of professional developers use terminal-based AI tools daily. The command line is no longer for power users - it is the standard.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Claude Code: The Most Powerful CLI AI',
        blocks: [
          {
            id: 'cli-2-1',
            type: 'text',
            data: {
              text: '**Claude Code by Anthropic (2025)**\n\nClaude Code is the world leading coding agent, scoring **72.5% on SWE-bench** and **43.2% on Terminal-bench**.\n\n**What Makes Claude Code Special:**\n- **Agentic Search**: Maps entire codebases in seconds without manual context selection\n- **Multi-File Edits**: Makes powerful edits across multiple interconnected files\n- **Integrated Workflows**: Reads GitHub issues, writes code, runs tests, submits PRs\n- **Unix Philosophy**: Composable and scriptable (e.g., `tail -f app.log | claude -p "Alert me on errors"`)\n- **MCP Native**: Functions as both MCP server and client\n\n**Supported Models:**\n- Claude Opus 4.1 (best for complex tasks)\n- Claude Sonnet 4.5 (balanced speed/quality)\n- Claude Haiku 3.5 (fast responses)\n\n**Security & Privacy:**\nRuns locally, talks directly to model APIs, no backend server, no remote code indexing. Asks permission before making changes or running commands.'
            }
          },
          {
            id: 'cli-2-2',
            type: 'codePreview',
            data: {
              language: 'bash',
              code: '# Install Claude Code\nnpm install -g @anthropic-ai/claude-code\n\n# Initialize in your project\ncd your-project\nclaude init\n\n# Basic usage - ask Claude to implement a feature\nclaude "Add a user authentication system with email/password"\n\n# Chat mode for back-and-forth\nclaude chat\n\n# Use custom commands (stored in .claude/commands/)\nclaude /test-fix "Fix failing tests in user service"\n\n# Pipe logs to Claude for monitoring\ntail -f logs/app.log | claude -p "Slack me if errors spike"\n\n# Multi-file refactor\nclaude "Refactor authentication to use JWT instead of sessions"\n\n# Connect to MCP servers\nclaude mcp connect github jira google-drive',
              title: 'Claude Code CLI Examples'
            }
          },
          {
            id: 'cli-2-3',
            type: 'note',
            data: {
              text: '🔒 **Requires**: Paid Claude.ai subscription (Pro, Team, or Enterprise). Free plan does not include terminal access.'
            }
          }
        ]
      },
      {
        id: 3,
        title: 'GitHub Copilot CLI: Native GitHub Integration',
        blocks: [
          {
            id: 'cli-3-1',
            type: 'text',
            data: {
              text: '**GitHub Copilot CLI (Public Preview - Sept 2025)**\n\nGitHub Copilot CLI brings the Copilot coding agent directly to your terminal with native GitHub integration.\n\n**Key Features:**\n- **Model Selection**: Defaults to Claude Sonnet 4.5, but supports GPT-5, Claude Sonnet 4, and more via `/model` command\n- **GitHub Native**: Access repos, issues, and PRs using natural language with existing GitHub auth\n- **MCP-Powered**: Ships with GitHub MCP server by default, supports custom MCP servers\n- **Image Support**: Mention images with `@` to provide visual context to the model\n- **User Control**: Preview every action before execution, explicit approval required\n\n**Recent Performance Improvements (Oct 2025):**\n- 15% reduction in steps to task completion\n- 25% faster average completion time\n- 45% faster median completion time\n\n**Availability:**\nIncluded with Copilot Pro, Pro+, Business, and Enterprise plans. Supports macOS, Linux, and Windows (via WSL).'
            }
          },
          {
            id: 'cli-3-2',
            type: 'codePreview',
            data: {
              language: 'bash',
              code: '# Install GitHub Copilot CLI\ngh extension install github/gh-copilot\n\n# Start the agent\ngh copilot\n\n# Ask about GitHub issues\n"Show me high-priority bugs assigned to me"\n\n# Generate code from issue\n"Implement the feature described in issue #42"\n\n# Switch models\n/model\n# Select: Claude Sonnet 4, GPT-5, Claude Opus 4, etc.\n\n# Use images for context\n"Fix this UI bug" @screenshot.png\n\n# Pull request workflow\n"Create a PR for the authentication refactor with proper description"\n\n# Connect custom MCP server\n/mcp add https://example.com/my-custom-mcp',
              title: 'GitHub Copilot CLI Usage'
            }
          },
          {
            id: 'cli-3-3',
            type: 'image',
            data: {
              url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400&fit=crop',
              alt: 'Terminal with GitHub Copilot CLI',
              caption: 'GitHub Copilot CLI in action with native GitHub integration'
            }
          }
        ]
      },
      {
        id: 4,
        title: 'Gemini CLI: Free & Open Source',
        blocks: [
          {
            id: 'cli-4-1',
            type: 'text',
            data: {
              text: '**Gemini CLI by Google (Open Source - Oct 2025)**\n\nGemini CLI is the first **free, open-source AI agent** with enterprise-grade capabilities.\n\n**Why Gemini CLI is Special:**\n- **100% Free**: 60 requests/min, 1,000 requests/day with personal Google account\n- **Massive Context**: 1 million token context window (Gemini 2.5 Pro)\n- **Built-in Tools**: Google Search grounding, file operations, shell commands, web fetching\n- **MCP Extensible**: Connect custom MCP servers for any integration\n- **ReAct Loop**: Uses reason-and-act pattern for complex multi-step tasks\n\n**Perfect For:**\n- Students and learners (no subscription required)\n- Open source projects\n- Side projects and MVPs\n- Developers wanting to try CLI AI tools risk-free\n\n**Integrated with Gemini Code Assist:**\nShared quotas between CLI and VS Code agent mode, seamless experience across environments.'
            }
          },
          {
            id: 'cli-4-2',
            type: 'codePreview',
            data: {
              language: 'bash',
              code: '# Install Gemini CLI (open source)\nnpm install -g @google/gemini-cli\n# or\npip install gemini-cli\n\n# Login with free Google account\ngemini auth login\n\n# Start coding with 1M token context\ngemini "Build a REST API for a task manager with FastAPI"\n\n# Use Google Search grounding\ngemini "Find the latest best practices for Next.js 15 and implement them"\n\n# Web scraping + coding\ngemini "Fetch data from example.com/api and create a dashboard"\n\n# Complex multi-step tasks\ngemini "Fix all bugs in the test suite, improve coverage to 90%, and generate a report"\n\n# Connect MCP servers\ngemini mcp add filesystem\ngemini mcp add github\ngemini mcp add custom-tool https://your-mcp-server.com',
              title: 'Gemini CLI Free Usage'
            }
          },
          {
            id: 'cli-4-3',
            type: 'note',
            data: {
              text: '🎉 **Game Changer**: Gemini CLI is the first enterprise-quality AI coding tool that is completely free for individuals. No credit card, no trial period - just login with Google.'
            }
          }
        ]
      },
      {
        id: 5,
        title: 'Aider: Open Source Pair Programming',
        blocks: [
          {
            id: 'cli-5-1',
            type: 'text',
            data: {
              text: '**Aider: AI Pair Programming in Your Terminal**\n\nAider is one of the first open-source AI coding assistants and remains the most popular for developers who want full control.\n\n**Why Developers Love Aider:**\n- **Model Flexibility**: Works with Claude 3.7 Sonnet, DeepSeek R1, OpenAI o1/o3, GPT-4o, and local models\n- **Codebase Mapping**: Creates a semantic map of your entire project for better context\n- **Git Integration**: Auto-commits changes with sensible messages, easy to diff/undo\n- **Multi-Language**: Python, JavaScript, Rust, Ruby, Go, C++, PHP, HTML, CSS, and more\n- **Voice Support**: Speak your requests and let Aider implement them\n- **Visual Context**: Add images and web pages to chat for screenshots, diagrams, reference docs\n- **Budget Friendly**: Processes files for just $0.007 each\n\n**Best Use Cases:**\n- Legacy code refactoring (Aider best in class for complex refactors)\n- Multi-file coordination\n- Projects requiring specific model choices\n- Teams wanting git-native workflows'
            }
          },
          {
            id: 'cli-5-2',
            type: 'codePreview',
            data: {
              language: 'bash',
              code: '# Install Aider\npython -m pip install aider-install\naider-install\n\n# Start Aider in your project\naider\n\n# Add files to context\n/add src/auth.py src/models.py\n\n# Ask for features\n"Add two-factor authentication using TOTP"\n\n# Voice mode\naider --voice\n# Speak: "Refactor the database layer to use async/await"\n\n# Use specific model\naider --model claude-3.7-sonnet\naider --model deepseek-r1\naider --model gpt-4o\n\n# Add visual context\n/add screenshot.png\n"Make the UI match this design"\n\n# Web page context\n/web https://docs.fastapi.tiangolo.com/\n"Implement this FastAPI pattern in our code"\n\n# Review changes\ngit diff\n\n# Undo if needed\ngit reset --hard HEAD~1',
              title: 'Aider AI Pair Programming'
            }
          },
          {
            id: 'cli-5-3',
            type: 'chart',
            data: {
              type: 'bar',
              data: {
                labels: ['Claude Code', 'Copilot CLI', 'Gemini CLI', 'Aider'],
                datasets: [{
                  label: 'SWE-bench Score (%)',
                  data: [72.5, 65, 62, 58],
                  backgroundColor: ['#6366f1', '#24292e', '#4285f4', '#10b981']
                }]
              },
              title: 'AI CLI Tools Performance Comparison (2025)'
            }
          }
        ]
      },
      {
        id: 6,
        title: 'MCP: The Protocol Connecting AI to Everything',
        blocks: [
          {
            id: 'cli-6-1',
            type: 'text',
            data: {
              text: '**Model Context Protocol (MCP) - The Game Changer**\n\nMCP is an **open standard** introduced by Anthropic for connecting AI systems to data sources. Think of it as USB for AI - one protocol to connect to everything.\n\n**The Problem MCP Solves:**\nBefore MCP, every AI tool needed custom integrations for GitHub, Jira, Google Drive, databases, etc. Now, one MCP server works with **all MCP-compatible AI tools**.\n\n**Major Adoption (2025):**\n- **March 2025**: OpenAI officially adopted MCP\n- **April 2025**: Google DeepMind confirmed MCP support in Gemini\n- **IDEs**: Cursor, VS Code, Windsurf, Zed, Neovim, Cline all support MCP\n- **Platforms**: Replit, Codeium, Sourcegraph integrate MCP\n- **Chrome DevTools**: Public preview of MCP server for browser automation\n\n**What MCP Enables:**\n- AI reads your design docs in Google Drive\n- AI updates tickets in Jira/Linear\n- AI accesses your company Notion wiki\n- AI queries your production database (safely)\n- AI uses your custom internal tools'
            }
          },
          {
            id: 'cli-6-2',
            type: 'video',
            data: {
              url: 'https://www.youtube.com/embed/iu2JGJNTEVk',
              title: 'Introduction to Model Context Protocol (MCP)'
            }
          },
          {
            id: 'cli-6-3',
            type: 'note',
            data: {
              text: '⚠️ **Security Note**: April 2025 research found security issues with MCP including prompt injection and tool permission problems. Use caution with sensitive data and always review AI actions.'
            }
          }
        ]
      },
      {
        id: 7,
        title: 'Building Custom MCP Servers',
        blocks: [
          {
            id: 'cli-7-1',
            type: 'text',
            data: {
              text: '**Creating Your Own MCP Integrations**\n\nMCP servers are surprisingly simple to build. Any tool or data source can become AI-accessible.\n\n**MCP Server Structure:**\n1. **Tools**: Functions the AI can call (e.g., "create_jira_ticket")\n2. **Resources**: Data the AI can read (e.g., "company_wiki")\n3. **Prompts**: Pre-built workflows (e.g., "debug_production_error")\n\n**Popular MCP Servers:**\n- **GitHub**: Repos, issues, PRs, code search\n- **Google Drive**: Read/write docs, sheets, slides\n- **Jira/Linear**: Create/update tickets\n- **Slack**: Send messages, read channels\n- **PostgreSQL**: Query databases (read-only recommended)\n- **Filesystem**: Local file operations\n- **Chrome DevTools**: Browser automation\n- **Playwright**: End-to-end testing\n\n**Build Once, Use Everywhere:**\nOne MCP server works with Claude Code, GitHub Copilot CLI, Gemini CLI, Cursor, VS Code, and any other MCP-compatible tool.'
            }
          },
          {
            id: 'cli-7-2',
            type: 'codePreview',
            data: {
              language: 'typescript',
              code: '// Example: Simple MCP server for Notion\nimport { MCPServer } from \'@modelcontextprotocol/sdk\';\nimport { Client } from \'@notionhq/client\';\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\nconst server = new MCPServer({\n  name: \'notion-mcp\',\n  version: \'1.0.0\',\n  \n  // Define tools the AI can use\n  tools: [\n    {\n      name: \'search_notion\',\n      description: \'Search Notion workspace for pages and databases\',\n      parameters: {\n        query: { type: \'string\', description: \'Search query\' }\n      },\n      handler: async ({ query }) => {\n        const results = await notion.search({ query });\n        return { results };\n      }\n    },\n    {\n      name: \'create_page\',\n      description: \'Create a new Notion page\',\n      parameters: {\n        title: { type: \'string\' },\n        content: { type: \'string\' },\n        parent_page_id: { type: \'string\' }\n      },\n      handler: async ({ title, content, parent_page_id }) => {\n        const page = await notion.pages.create({\n          parent: { page_id: parent_page_id },\n          properties: {\n            title: { title: [{ text: { content: title } }] }\n          },\n          children: [\n            {\n              object: \'block\',\n              type: \'paragraph\',\n              paragraph: { rich_text: [{ text: { content } }] }\n            }\n          ]\n        });\n        return { page_id: page.id };\n      }\n    }\n  ]\n});\n\nserver.listen(3000);',
              title: 'Custom MCP Server Example (Notion Integration)'
            }
          }
        ]
      },
      {
        id: 8,
        title: 'CLI Tools Comparison: Which One to Choose?',
        blocks: [
          {
            id: 'cli-8-1',
            type: 'text',
            data: {
              text: '**Choosing Your CLI AI Tool**\n\n**Claude Code** - Best for:\n- ✅ Maximum code quality (72.5% SWE-bench)\n- ✅ Complex multi-file refactoring\n- ✅ Enterprise security requirements\n- ✅ Unix philosophy and scripting\n- ❌ Requires paid subscription\n\n**GitHub Copilot CLI** - Best for:\n- ✅ Heavy GitHub usage\n- ✅ Teams already on Copilot\n- ✅ Multi-model flexibility (GPT-5, Claude, etc.)\n- ✅ Image context support\n- ❌ Requires Copilot subscription\n\n**Gemini CLI** - Best for:\n- ✅ Free tier (no credit card needed!)\n- ✅ Students and side projects\n- ✅ 1M token context window\n- ✅ Google Search grounding\n- ✅ Open source (self-hostable)\n- ❌ Slightly lower code quality vs Claude\n\n**Aider** - Best for:\n- ✅ Model flexibility (use any LLM)\n- ✅ Legacy code refactoring\n- ✅ Git-native workflow\n- ✅ Voice input support\n- ✅ Open source\n- ❌ Requires API keys/subscriptions for models'
            }
          },
          {
            id: 'cli-8-2',
            type: 'quiz',
            data: {
              question: 'You are a student building a side project and want to try AI coding without paying. Which tool should you choose?',
              options: [
                'Claude Code (requires paid subscription)',
                'GitHub Copilot CLI (requires Copilot subscription)',
                'Gemini CLI (free with Google account)',
                'Aider (requires API keys for models)'
              ],
              correctAnswer: 2,
              explanation: 'Gemini CLI is the only tool offering enterprise-quality AI coding completely free with just a Google account. You get 60 requests/min, 1,000 requests/day, and access to Gemini 2.5 Pro with 1M token context window - all without a credit card.'
            }
          }
        ]
      },
      {
        id: 9,
        title: 'Real-World Workflow: Building with CLI AI',
        blocks: [
          {
            id: 'cli-9-1',
            type: 'text',
            data: {
              text: '**Complete Development Workflow with CLI AI**\n\nLet us build a real feature end-to-end using Claude Code and MCP.\n\n**Scenario**: Add user authentication to existing Next.js app\n\n**Step 1: Research (5 min)**\n```bash\nclaude "Research Next.js 15 authentication best practices using MCP Google Search"\n```\n\n**Step 2: Plan (2 min)**\n```bash\nclaude "Create implementation plan for email/password auth with Supabase"\n```\n\n**Step 3: Implement (20 min)**\n```bash\n# Claude makes multi-file edits\nclaude "Implement the authentication plan"\n# Creates: auth.ts, login page, signup page, middleware, etc.\n```\n\n**Step 4: Test (5 min)**\n```bash\nclaude "Write tests for the auth system and run them"\n```\n\n**Step 5: Update Documentation (2 min)**\n```bash\nclaude mcp notion "Update our docs with new auth setup instructions"\n```\n\n**Step 6: Create PR (1 min)**\n```bash\nclaude mcp github "Create PR for auth implementation with proper description"\n```\n\n**Total Time**: 35 minutes for complete authentication system with tests and docs!'
            }
          },
          {
            id: 'cli-9-2',
            type: 'note',
            data: {
              text: '⚡ **Reality Check**: This same task would take 4-6 hours manually (research, implementation, testing, docs, PR). CLI AI tools provide genuine 10x speedup on well-defined tasks.'
            }
          }
        ]
      },
      {
        id: 10,
        title: 'Advanced Techniques & Best Practices',
        blocks: [
          {
            id: 'cli-10-1',
            type: 'text',
            data: {
              text: '**Mastering CLI AI Development**\n\n**1. Effective Prompting:**\n- Be specific about requirements and constraints\n- Include tech stack and version numbers\n- Specify code style preferences\n- Request tests and documentation together\n\n**2. Context Management:**\n- Use `/add` to explicitly include relevant files\n- Keep context focused (do not dump entire codebase)\n- Use MCP to access external context on-demand\n\n**3. Workflow Automation:**\n```bash\n# Create custom commands in .claude/commands/\n# Example: .claude/commands/feature.md\n# Then run: claude /feature "user profiles"\n```\n\n**4. Safety Practices:**\n- Always review AI changes before applying\n- Use git to track and revert if needed\n- Test AI-generated code thoroughly\n- Do not expose sensitive data to AI\n\n**5. MCP Security:**\n- Use read-only database connections\n- Implement tool permission boundaries\n- Review MCP server code before installing\n- Monitor AI tool usage for anomalies\n\n**6. Model Selection:**\n- Use Opus/GPT-5/o3 for complex architecture\n- Use Sonnet/GPT-4o for balanced tasks\n- Use Haiku/3.5-turbo for quick iterations'
            }
          },
          {
            id: 'cli-10-2',
            type: 'codePreview',
            data: {
              language: 'markdown',
              code: '# Custom Command Template\n# Save as: .claude/commands/api-endpoint.md\n\n---\ntitle: Create API Endpoint\ndescription: Generate a complete REST API endpoint with tests\n---\n\n# API Endpoint Generator\n\nCreate a {{method}} endpoint at `/api/{{path}}` that:\n\n## Requirements\n- Implements {{method}} method\n- Validates input using Zod\n- Uses Prisma for database operations\n- Includes proper error handling\n- Returns typed responses\n- Has 90%+ test coverage\n\n## Tech Stack\n- Next.js 15 App Router\n- TypeScript strict mode\n- Prisma ORM\n- Vitest for testing\n\n## Code Style\n- Use server actions when possible\n- Async/await for all async operations\n- Descriptive variable names\n- JSDoc comments for functions\n\n## Deliverables\n1. API route file\n2. Zod validation schemas\n3. Integration tests\n4. API documentation comment',
              title: 'Custom Command Template'
            }
          },
          {
            id: 'cli-10-3',
            type: 'note',
            data: {
              text: '🎯 **Next Steps**: Install one CLI AI tool today and try building a small feature. Start with Gemini CLI (free) or Claude Code (best quality). Practice makes perfect - the more you use these tools, the better your prompts become.'
            }
          }
        ]
      }
    ]

    console.log('Updating database...')
    await sql`
      UPDATE modules
      SET
        title = 'CLI AI Coding Tools & MCP - Terminal-Native Development',
        description = 'Master Claude Code, GitHub Copilot CLI, Gemini CLI, Aider, and Model Context Protocol (MCP) to code at terminal velocity in 2025',
        slides = ${JSON.stringify(newSlides)},
        duration = '3 hours',
        learning_objectives = ${JSON.stringify([
          'Master terminal-native AI coding with Claude Code, Copilot CLI, Gemini CLI',
          'Build and integrate custom MCP servers for any tool or data source',
          'Choose the right CLI AI tool for your specific use case',
          'Implement secure, production-ready workflows with AI agents',
          'Automate complex development tasks with scriptable AI commands'
        ])},
        key_takeaways = ${JSON.stringify([
          'Claude Code leads with 72.5% SWE-bench score, best for complex tasks',
          'Gemini CLI is completely free with Google account - no credit card needed',
          'MCP (Model Context Protocol) is the USB for AI - one protocol for all tools',
          'CLI AI tools provide genuine 10x speedup on well-defined development tasks',
          'Security matters: review AI actions, use read-only connections, monitor usage'
        ])},
        updated_at = NOW()
      WHERE module_id = 'module-vibe-coding-2025'
    `

    console.log('✅ Module 1 completely rebuilt!\n')
    console.log('📍 New focus:')
    console.log('   - Claude Code (Anthropic)')
    console.log('   - GitHub Copilot CLI')
    console.log('   - Gemini CLI (Google, free)')
    console.log('   - Aider (open source)')
    console.log('   - Model Context Protocol (MCP)')
    console.log('\n🎯 10 comprehensive slides covering:')
    console.log('   - Terminal-first AI revolution')
    console.log('   - Each major CLI tool in depth')
    console.log('   - MCP architecture and integration')
    console.log('   - Building custom MCP servers')
    console.log('   - Tool comparison and selection guide')
    console.log('   - Real-world workflows')
    console.log('   - Advanced techniques and best practices')
    console.log('\n✨ View at: http://localhost:3000/modules/vibe-coding-ai')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

updateModule1()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
