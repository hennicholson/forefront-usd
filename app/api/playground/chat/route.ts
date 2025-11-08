import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const { message, model, context, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
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

    // Build context-aware system prompt for text models
    const systemPrompt = `You are an AI learning assistant integrated into Forefront, an innovative AI education platform. You help students learn by answering questions, providing explanations, and guiding them through their learning journey.

CURRENT LEARNING CONTEXT:
- Module: ${context.moduleTitle}
- Current Slide: ${context.currentSlide.title}
- Slide Type: ${context.currentSlide.type || 'lesson'}
- Slide Content Summary: ${context.currentSlide.content.substring(0, 500)}

YOUR ROLE:
1. Answer student questions about the current slide or module content
2. Provide clear explanations tailored to the student's learning level
3. Offer examples and analogies to reinforce understanding
4. Suggest experiments they can try with AI models when relevant
5. Encourage active learning and critical thinking
6. If asked about different AI models (image, video, text generation), explain their strengths and use cases

IMPORTANT:
- Stay focused on the current learning content
- Be encouraging and supportive
- If the student seems confused, offer to break down concepts into simpler parts
- When discussing AI models, explain practical differences and trade-offs
- Don't just give answers - help students understand the "why" behind concepts

Keep responses concise but comprehensive. Use clear examples when explaining technical concepts.`

    // Build conversation history
    const conversationHistory = context.conversationHistory || []
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Add current message
    messages.push({
      role: 'user',
      content: message
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
