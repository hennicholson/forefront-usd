import Groq from 'groq-sdk'

export class GroqClient {
  private client: Groq

  constructor(apiKey?: string) {
    this.client = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    })
  }

  async chat(options: {
    model: string
    messages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string; name?: string; tool_calls?: any[] }>
    temperature?: number
    maxTokens?: number
    topP?: number
    stream?: boolean
    tools?: any[]  // OpenAI-compatible tool definitions
    tool_choice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } }
  }) {
    const {
      model,
      messages,
      temperature = 0.7,
      maxTokens = 4096,
      topP = 1,
      stream = true,
      tools,
      tool_choice,
    } = options

    const completion = await this.client.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_completion_tokens: maxTokens,
      top_p: topP,
      stream,
      stop: null,
      ...(tools && { tools }),
      ...(tool_choice && { tool_choice }),
    })

    return completion
  }

  async transcribe(options: {
    model: string
    file: File
    language?: string
    prompt?: string
    responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
    temperature?: number
  }) {
    const {
      model,
      file,
      language,
      prompt,
      responseFormat = 'json',
      temperature = 0,
    } = options

    const transcription = await this.client.audio.transcriptions.create({
      model,
      file,
      language,
      prompt,
      response_format: responseFormat as any,
      temperature,
    })

    return transcription
  }
}

// Default client instance
export const groqClient = new GroqClient()
