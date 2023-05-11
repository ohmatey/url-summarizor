import { NextResponse } from 'next/server'
import { ChatOpenAI } from 'langchain/chat_models/openai'

import runAgent from '@/services/agents/runAgent'
import summarizeTool from '@/services/agents/tools/summarizeTool'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const openAiApiKey = searchParams.get('openAiApiKey')
    const temperature = searchParams.get('temperature') || 0.5
    const maxTokens = searchParams.get('maxTokens') || 500

    // if (!openAiApiKey) {
    //   return NextResponse.error(new Error('No openAiApiKey provided'))
    // }

    // if (!url) {
    //   return NextResponse.error(new Error('No url provided'))
    // }

    const model = new ChatOpenAI({
      openAIApiKey: openAiApiKey,
      model: 'gpt-3.5-turbo',
      temperature: parseInt(temperature),
      maxTokens,
      maxConcurrency: 5,
    })

    // run agent with docs
    const response = await runAgent({
      prompt: `Summarize the content of ${url}`,
      tools: [
        summarizeTool({
          model,
        }),
      ],
      model,
    })

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.error(error)
  }
}