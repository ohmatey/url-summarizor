import {
  Calculator,
} from 'langchain/tools/calculator'

export const defaultAgentTools = [
  new Calculator()
]

