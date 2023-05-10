import { NextResponse } from 'next/server'
import { ChatOpenAI } from 'langchain/chat_models/openai'

import runAgent from '@/services/agents/runAgent'

export async function POST(request) {
  const {
    prompt,
    openAiApiKey,
  } = await request.json()

  if (!prompt) {
    return NextResponse.json({
      error: 'Prompt is required'
    })
  }

  if (!openAiApiKey) {
    return NextResponse.json({
      error: 'OpenAI API Key is required'
    })
  }

  const gptChatModel = new ChatOpenAI({
    openAIApiKey: openAiApiKey,
    model: 'gpt4',
    temperature: 1,
    maxTokens: 2000,
    maxConcurrency: 5,
  })

  try {
    const conversationTools = [
      summarizeTool
    ]

    const tools = [
      new Calculator(),
      ...conversationTools
    ]

    const summary = await runAgent({
      prompt,
      tools,
      model: gptChatModel,
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error(error)

    return NextResponse.json({
      error: error.message
    })
  }
}
