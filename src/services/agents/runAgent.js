
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { BaseCallbackHandler } from 'langchain/callbacks'

import {
  defaultAgentTools
} from '@/services/agents/tools'

const runAgent = async ({
  prompt,
  tools = [],
  model,
  onNewAction = () => {},
}) => {
  if (!model) throw new Error('model is required')
  if (!prompt) throw new Error('prompt is required')

  const agentTools = [
    ...defaultAgentTools,
    ...tools,
  ]

  const executor = await initializeAgentExecutorWithOptions(agentTools, model, {
    agentType: 'chat-conversational-react-description',
    // verbose: true,
  })

  const actions = []

  const newAction = ({ type, message }) => {
    actions.push({
      type,
      message,
    })

    return onNewAction({
      type,
      message,
    })
  }

  const tokenUsage = []

  const callbackHandler = BaseCallbackHandler.fromMethods({
    handleLLMStart({
      name
    }) {
      newAction({
        type: 'llm_start',
        message: `Running ${name} llm`,
      })
    },
    handleLLMEnd({
      name = '',
      llmOutput = {},
    }) {
      if (llmOutput?.tokenUsage) {
        tokenUsage.push({
          prompt,
          ...llmOutput?.tokenUsage,
        })
      }

      newAction({
        type: 'llm_end',
        message: `Finished running ${name} llm`,
      })
    },
    handleChainStart({
      name = '',
    }) {
      newAction({
        type: 'chain_start',
        message: `Running ${name} chain`,
      })
    },
    handleChainEnd({
      text = ''
    }) {
      newAction({
        type: 'chain_end',
        message: `Chain finished with output ${text}`,
      })
    },
    handleAgentAction({
      tool,
      toolInput,
    }) {
      newAction({
        type: 'agent_action',
        message: `Running ${tool} with input ${toolInput}`,
      })
    },
    handleToolStart(tool, args) {
      const toolArgs = Array.isArray(args) ? args?.map(arg => arg.toString()).join(', ') : args?.toString()

      newAction({
        type: 'tool_start',
        message: `Running ${tool.name} with ${toolArgs}`,
      })
    },
    handleToolEnd({
      name = ''
    }) {
      newAction({
        type: 'tool_end',
        message: `${name} tool finished running`,
      })
    }
  })

  const { output: response } = await executor.call(
    {
      input: prompt,
    },
    [callbackHandler]
  )

  return {
    response,
    actions,
    tokenUsage
  }
}

export default runAgent