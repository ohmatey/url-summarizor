import {
  loadSummarizationChain,
  loadQAStuffChain
} from 'langchain/chains'

export const summarizeContentChain = ({
  model
}) => {
  const chain = loadSummarizationChain(model, { type: 'map_reduce' })

  return chain
}

export const qaChain = ({
  model
}) => {
  const qaStuffChain = loadQAStuffChain(model)

  return qaStuffChain
}