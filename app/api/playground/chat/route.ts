import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { perplexityClient } from '@/lib/perplexity/client'
import { groqClient } from '@/lib/groq/client'
import { allModels, getModelById } from '@/lib/models/all-models'
import { ForefrontOrchestrator } from '@/lib/forefront/orchestrator'

export async function POST(request: NextRequest) {
  try {
    const { message, model, context, userId, highlightedText } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Handle Forefront Intelligence (multi-agent orchestration)
    if (model === 'forefront-intelligence') {
      try {
        const orchestrator = new ForefrontOrchestrator()

        const orchestratorResponse = await orchestrator.execute({
          message,
          context: {
            moduleTitle: context.moduleTitle,
            currentSlide: context.currentSlide,
            highlightedText,
            conversationHistory: context.conversationHistory || [],
            userId,
            moduleId: context.moduleId,
            slideId: context.slideId
          },
          userId
        })

        // Save to generation history
        if (userId || context?.userId) {
          try {
            const { db } = await import('@/lib/db')
            const { generationHistory } = await import('@/lib/db/schema')

            await db.insert(generationHistory).values({
              userId: userId || context?.userId,
              moduleId: context?.moduleId || null,
              slideId: context?.slideId || null,
              type: 'text',
              model: model,
              prompt: message,
              response: orchestratorResponse.content,
              metadata: {
                moduleTitle: context?.moduleTitle,
                slideTitle: context?.currentSlide?.title,
                highlightedText: highlightedText || null,
                intent: orchestratorResponse.intent,
                modelUsed: orchestratorResponse.metadata.modelUsed,
                executionTime: orchestratorResponse.metadata.executionTime,
                fallbackUsed: orchestratorResponse.metadata.fallbackUsed,
                citations: orchestratorResponse.metadata.citations || []
              }
            })
          } catch (err) {
            console.error('Failed to save to history:', err)
          }
        }

        return NextResponse.json({
          response: orchestratorResponse.content,
          model: model,
          type: 'text',
          metadata: orchestratorResponse.metadata
        })
      } catch (error: any) {
        console.error('Error with Forefront Intelligence:', error)
        return NextResponse.json(
          { error: 'Failed to get response from Forefront Intelligence', details: error.message },
          { status: 500 }
        )
      }
    }

    // Handle Perplexity Sonar models
    if (model === 'sonar' || model === 'sonar-pro') {
      try {
        // Build system prompt with context
        const systemPrompt = `You are an AI learning assistant with access to real-time web knowledge. You help students learn by providing up-to-date information, explanations, and examples.

CURRENT LEARNING CONTEXT:
- Module: ${context.moduleTitle}
- Current Slide: ${context.currentSlide.title}
${highlightedText ? `- Student highlighted: "${highlightedText}"` : ''}

YOUR ROLE:
1. Provide accurate, current information using web sources
2. Cite your sources clearly
3. Include relevant videos and images when helpful
4. Focus on the latest AI developments and best practices
5. Search Reddit, X.com, and AI forums for community insights

Stay focused on helping the student learn effectively.`

        // Use conversation history
        const conversationHistory = context.conversationHistory || []
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          { role: 'user' as const, content: message }
        ]

        const response = await perplexityClient.chat({
          messages,
          model: model as 'sonar' | 'sonar-pro',
          includeVideos: true,
          includeImages: true,
          searchRecency: 'week'
        })

        const responseText = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        // Save to generation history
        if (userId || context?.userId) {
          try {
            const { db } = await import('@/lib/db')
            const { generationHistory } = await import('@/lib/db/schema')

            await db.insert(generationHistory).values({
              userId: userId || context?.userId,
              moduleId: context?.moduleId || null,
              slideId: context?.slideId || null,
              type: 'text',
              model: model,
              prompt: message,
              response: responseText,
              metadata: {
                moduleTitle: context?.moduleTitle,
                slideTitle: context?.currentSlide?.title,
                highlightedText: highlightedText || null,
                citations: response.citations || [],
                hasVideos: (response.videos?.length || 0) > 0,
                hasImages: (response.images?.length || 0) > 0
              }
            })
          } catch (err) {
            console.error('Failed to save to history:', err)
          }
        }

        return NextResponse.json({
          response: responseText,
          model: model,
          type: 'text',
          metadata: {
            citations: response.citations || [],
            searchResults: response.search_results || [],
            videos: response.videos || [],
            images: response.images || [],
            highlightedText: highlightedText || null
          }
        })
      } catch (error: any) {
        console.error('Error with Perplexity:', error)
        return NextResponse.json(
          { error: 'Failed to get response from Perplexity', details: error.message },
          { status: 500 }
        )
      }
    }

    // Handle Groq models
    const modelData = getModelById(model)
    const isGroqModel = modelData?.provider === 'Groq'
    if (isGroqModel) {
      try {
        // Build system prompt with context
        const systemPrompt = `You are an AI learning assistant helping students learn about AI and technology. You provide clear explanations, practical examples, and engaging dialogue.

CURRENT LEARNING CONTEXT:
- Module: ${context.moduleTitle}
- Current Slide: ${context.currentSlide.title}
${highlightedText ? `- Student highlighted: "${highlightedText}"` : ''}

YOUR ROLE:
1. Provide accurate, helpful information tailored to the student's learning level
2. Use clear examples and analogies
3. Break down complex concepts into understandable parts
4. Encourage critical thinking and exploration
5. Stay focused on the learning objectives

Be concise, clear, and supportive in your responses.`

        // Use conversation history
        const conversationHistory = context.conversationHistory || []
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          { role: 'user' as const, content: message }
        ]

        const completion = await groqClient.chat({
          model,
          messages,
          temperature: 0.7,
          maxTokens: 4096,
          stream: true
        })

        // Create a readable stream for the response
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              let fullResponse = ''

              for await (const chunk of completion as any) {
                const content = chunk.choices[0]?.delta?.content || ''
                if (content) {
                  fullResponse += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              }

              // Save to generation history after stream completes
              if (userId || context?.userId) {
                try {
                  const { db } = await import('@/lib/db')
                  const { generationHistory } = await import('@/lib/db/schema')

                  await db.insert(generationHistory).values({
                    userId: userId || context?.userId,
                    moduleId: context?.moduleId || null,
                    slideId: context?.slideId || null,
                    type: 'text',
                    model: model,
                    prompt: message,
                    response: fullResponse,
                    metadata: {
                      moduleTitle: context?.moduleTitle,
                      slideTitle: context?.currentSlide?.title,
                      highlightedText: highlightedText || null
                    }
                  })
                } catch (err) {
                  console.error('Failed to save to history:', err)
                }
              }

              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch (error) {
              console.error('Stream error:', error)
              controller.error(error)
            }
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } catch (error: any) {
        console.error('Error with Groq:', error)
        return NextResponse.json(
          { error: 'Failed to get response from Groq', details: error.message },
          { status: 500 }
        )
      }
    }

    // Check if this is Seed Dream 4 model - handle image generation
    if (model === 'seedream-4') {
      // Call the image generation API directly using Replicate
      try {
        const Replicate = (await import('replicate')).default
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
        })

        // Run Seed Dream 4 model
        const output = await replicate.run(
          "bytedance/seedream-4",
          {
            input: {
              prompt: message,
              aspect_ratio: '4:3'
            }
          }
        ) as any

        const imageUrl = output && output[0] ? output[0].url() : null

        if (!imageUrl) {
          throw new Error('Failed to generate image')
        }

        // Save to generation history
        if (userId || context?.userId) {
          // Use direct database insert instead of fetch to avoid port issues
          try {
            const { db } = await import('@/lib/db')
            const { generationHistory } = await import('@/lib/db/schema')

            await db.insert(generationHistory).values({
              userId: userId || context?.userId,
              moduleId: context?.moduleId || null,
              slideId: context?.slideId || null,
              type: 'image',
              model: 'seedream-4',
              prompt: message,
              response: imageUrl,
              metadata: { aspectRatio: '4:3' }
            })
          } catch (err) {
            console.error('Failed to save to history:', err)
          }
        }

        return NextResponse.json({
          response: imageUrl,
          model: 'seedream-4',
          type: 'image',
          metadata: { aspectRatio: '4:3' }
        })
      } catch (error: any) {
        console.error('Error generating image:', error)
        return NextResponse.json(
          { error: 'Failed to generate image', details: error.message },
          { status: 500 }
        )
      }
    }

    // Check if this is an image generation model
    const imageModels = ['dall-e-3', 'midjourney']
    const isImageModel = imageModels.includes(model)

    if (isImageModel) {
      // Return the special image generation component response
      const componentResponse = `You are given a task to integrate an existing React component in the codebase.

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder.

Copy-paste this component to /components/ui folder:

\`\`\`tsx
ai-chat-image-generation-1.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface ImageGenerationProps {
  children: React.ReactNode;
}

export const ImageGeneration = (
  ({ children} : ImageGenerationProps) => {
    const [progress, setProgress] = React.useState(0);
    const [loadingState, setLoadingState] = React.useState<
      "starting" | "generating" | "completed"
    >("starting");
    const duration = 30000;

    React.useEffect(() => {
      const startingTimeout = setTimeout(() => {
        setLoadingState("generating");

        const startTime = Date.now();

        const interval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const progressPercentage = Math.min(
            100,
            (elapsedTime / duration) * 100
          );

          setProgress(progressPercentage);

          if (progressPercentage >= 100) {
            clearInterval(interval);
            setLoadingState("completed");
          }
        }, 16);

        return () => clearInterval(interval);
      }, 3000);

      return () => clearTimeout(startingTimeout);
    }, [duration]);

    return (
      <div className="flex flex-col gap-2">
        <motion.span
          className="bg-[linear-gradient(110deg,var(--color-muted-foreground),35%,var(--color-foreground),50%,var(--color-muted-foreground),75%,var(--color-muted-foreground))] bg-[length:200%_100%] bg-clip-text text-transparent text-base font-medium"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{
            backgroundPosition:
              loadingState === "completed" ? "0% 0" : "-200% 0",
          }}
          transition={{
            repeat: loadingState === "completed" ? 0 : Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          {loadingState === "starting" && "Getting started."}
          {loadingState === "generating" && "Creating image. May take a moment."}
          {loadingState === "completed" && "Image created."}
        </motion.span>
        <div className="relative rounded-xl border bg-card max-w-md overflow-hidden">
            {children}
          <motion.div
            className="absolute w-full h-[125%] -top-[25%] pointer-events-none backdrop-blur-3xl"
            initial={false}
            animate={{
              clipPath: \`polygon(0 \${progress}%, 100% \${progress}%, 100% 100%, 0 100%)\`,
              opacity: loadingState === "completed" ? 0 : 1,
            }}
            style={{
              clipPath: \`polygon(0 \${progress}%, 100% \${progress}%, 100% 100%, 0 100%)\`,
              maskImage:
                progress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : \`linear-gradient(to bottom, transparent \${progress - 5}%, transparent \${progress}%, black \${progress + 5}%)\`,
              WebkitMaskImage:
                progress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : \`linear-gradient(to bottom, transparent \${progress - 5}%, transparent \${progress}%, black \${progress + 5}%)\`,
            }}
          />
        </div>
      </div>
    );
  }
);

ImageGeneration.displayName = "ImageGeneration";
\`\`\`

Demo usage:
\`\`\`tsx
demo.tsx
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1";

const ImageGenerationDemo = () => {
  return (
    <div className="w-full min-h-dvh flex justify-center items-center">
      <ImageGeneration>
        <img
          className="aspect-video max-w-md object-cover"
          src="https://21st.dev/og-image.png"
          alt="21st og generation"
        />
      </ImageGeneration>
    </div>
  );
};

export default { ImageGenerationDemo };
\`\`\`

Install NPM dependencies:
\`\`\`bash
npm install motion
\`\`\`

This component provides a beautiful loading animation for image generation with a blur reveal effect. Replace the image src with your generated image URL.`

      return NextResponse.json({
        response: componentResponse,
        model: model
      })
    }

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    // Build enhanced context-aware system prompt for text models
    const systemPrompt = `You are an advanced AI learning assistant integrated into Forefront, a cutting-edge AI education platform. You help students master AI concepts through clear explanations, practical examples, and engaging dialogue.

CURRENT LEARNING CONTEXT:
- Module: ${context.moduleTitle}
- Current Slide: ${context.currentSlide.title}
- Slide Type: ${context.currentSlide.type || 'lesson'}
- Slide Content: ${context.currentSlide.content.substring(0, 800)}
${highlightedText ? `\n- Student Highlighted Text: "${highlightedText}"` : ''}

YOUR ENHANCED CAPABILITIES:
1. **Contextual Understanding**: Deep awareness of the student's current lesson and progress
2. **Adaptive Teaching**: Adjust explanations based on student's questions and comprehension
3. **Practical Examples**: Provide real-world applications and code examples
4. **Interactive Learning**: Encourage experimentation with AI models and tools
5. **Best Practices**: Share industry standards and modern AI development patterns

YOUR ROLE:
1. Answer questions about the current slide or module with depth and clarity
2. Provide explanations tailored to the learning context
3. Offer concrete examples, analogies, and visual descriptions
4. Suggest hands-on experiments students can try
5. Encourage critical thinking and deeper exploration
6. Connect concepts to real-world AI applications
7. When relevant, explain trade-offs between different AI models and approaches

RESPONSE GUIDELINES:
- Be concise yet comprehensive - quality over quantity
- Use technical terms appropriately with clear explanations
- Include code examples when helpful (use markdown formatting)
- Reference the highlighted text if provided
- Stay focused on educational value
- Be encouraging and supportive
- Help students understand the "why" behind concepts, not just the "what"

Remember: You're not just answering questions - you're fostering deep understanding and practical skills in AI development.`

    // Build conversation history with extended context window
    const conversationHistory = context.conversationHistory || []
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Add current message with highlighted context
    let currentMessage = message
    if (highlightedText) {
      currentMessage = `[Regarding highlighted text: "${highlightedText}"]\n\n${message}`
    }

    messages.push({
      role: 'user',
      content: currentMessage
    })

    // Combine system prompt with conversation
    const fullPrompt = `${systemPrompt}\n\nConversation:\n${messages.map((m: any) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n\n')}\n\nAssistant:`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: fullPrompt,
    })

    const responseText = response.text || 'I apologize, but I encountered an error generating a response. Could you please try rephrasing your question?'

    // Save to generation history
    if (userId || context?.userId) {
      // Use direct database insert instead of fetch to avoid port issues
      try {
        const { db } = await import('@/lib/db')
        const { generationHistory } = await import('@/lib/db/schema')

        await db.insert(generationHistory).values({
          userId: userId || context?.userId,
          moduleId: context?.moduleId || null,
          slideId: context?.slideId || null,
          type: 'text',
          model: model || 'gemini-2.0-flash',
          prompt: message,
          response: responseText,
          metadata: {
            moduleTitle: context?.moduleTitle,
            slideTitle: context?.currentSlide?.title
          }
        })
      } catch (err) {
        console.error('Failed to save to history:', err)
      }
    }

    return NextResponse.json({
      response: responseText,
      model: model || 'gemini-2.0-flash'
    })
  } catch (error: any) {
    console.error('Error in playground chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    )
  }
}
