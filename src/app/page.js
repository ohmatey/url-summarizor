'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import styles from './page.module.css'

import runAgent from '@/services/agents/runAgent'
import {
  defaultAgentTools
} from '@/services/agents/tools'
import summarizeTool from '@/services/agents/tools/summarizeTool'

const getRandomArticleUrl = () => {
  const urls = [
    'https://www.wired.com/story/rethinking-relationship-artificial-intelligence/',
    'https://venturebeat.com/ai/escalating-concerns-for-ai-in-2023-and-what-can-be-done/'
  ]

  const randomIndex = Math.floor(Math.random() * urls.length)

  return urls[randomIndex]
}

export default function Home() {
  const [tokenUsage, setTokenUsage] = useState([])
  const [replies, setReplies] = useState([])
  const [agentActions, setAgentActions] = useState([])

  const randomArticleUrl = getRandomArticleUrl()

  const {
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      openAiApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.5,
      maxTokens: 500,
      prompt: `You are a PHD level researcher. What is the main idea of the article? ${randomArticleUrl}`,
    },
  })

  const {
    mutateAsync: runPrompt,
    isLoading,
    isError,
    error,
    data: agentResponse,
  } = useMutation(
    async ({
      prompt,
      openAiApiKey,
      temperature = 0,
      maxTokens = 500,
    }) => {
      setAgentActions([])
      setReplies([])
      
      const gptChatModel = new ChatOpenAI({
        openAIApiKey: openAiApiKey,
        model: 'gpt-3.5-turbo',
        temperature: parseInt(temperature),
        maxTokens,
        maxConcurrency: 5,
      })

      const res = await runAgent({
        prompt,
        tools: [
          ...defaultAgentTools,
          summarizeTool({
            model: gptChatModel,
          }),
        ],
        model: gptChatModel,
        onNewAction: ({ type, message }) => {
          const replyTypes = ['chain_end', 'agent_action', 'llm_end']

          if (replyTypes.includes(type)) {
            setReplies((prevReplies) => {
              return [
                ...prevReplies,
                message,
              ]
            })
          }

          setAgentActions((prevActions) => {
            return [
              ...prevActions,
              {
                type,
                message,
              },
            ]
          })
        }
      })

      if (res?.tokenUsage) {
        setTokenUsage((prevTokenUsage) => {
          return [
            ...prevTokenUsage,
            ...res?.tokenUsage,
          ]
        })
      }

      return res?.response
    }
  )

  return (
    <main
      className={styles.main}
    >
      <div>
        <form onSubmit={handleSubmit(runPrompt)}>
          <div className={styles.stack}>
            <h1 className={styles.displayText}>
              SMZR
            </h1>

            <h1>
              Ask questions about any website, article, blog post, or file.
            </h1>

            <p>An example using a combination of <a href='https://openai.com/'>Open Ai APIs</a> with <a href='https://github.com/hwchase17/langchainjs'>Langchain js</a></p>

            <label>
              <span className={styles.labelText}>OpenAi Api key 🔑</span>
              <input
                {...register('openAiApiKey', {
                  required: true,
                })}
                disabled={isLoading}
                type='password'
                className={styles.input}
              />
              <p><small>Learn how to create an API key <a href='https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key'>here</a></small></p>
            </label>

            <label>
              <span className={styles.labelText}>Temperature 🔥</span>
              <input
                {...register('temperature', {
                  required: true,
                  min: 0,
                  max: 1,
                  step: 0.01,
                })}
                disabled={isLoading}
                type='number'
                className={styles.input}
              />
              <p><small>Throttles response randomness</small></p>
            </label>

            <label>
              <span className={styles.labelText}>Max tokens ✨</span>
              <input
                {...register('maxTokens', {
                  required: true,
                  min: 100,
                  max: 3000,
                  step: 100,
                })}
                disabled={isLoading}
                type='number'
                className={styles.input}
              />
              <p></p>
            </label>

            <label>
              <h3 className={styles.labelText}>Prompt</h3>
              <textarea
                {...register('prompt', {
                  required: true,
                })}
                rows={4}
                aria-multiline
                className={styles.input}
              />
            </label>

            <button
              className={styles.button}
              type='submit'
              disabled={isLoading}
            >Summarize</button>
          </div>
        </form>

        <div className={styles.stack}>
          {isLoading && <p>Running...</p>}

          {isError && (
            <section className={styles.section}>
              <p>Something went wrong...</p>
            </section>
          )}

          <section className={styles.section}>
            <h2>Answer</h2>

            <pre>
              {agentResponse}
            </pre>
          </section>

          <section className={styles.section}>
            <h2>Replies</h2>

            <pre>
              {replies?.map((reply, i) => {
                return (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    {reply}
                  </div>
                )
              })}
            </pre>
          </section>

          {agentActions && (
            <section>
              <h2>Actions</h2>

              <ol>
                {agentActions?.map((action, i) => {
                  return (
                    <li
                      key={i}
                      style={{
                        marginBottom: 8,
                      }}
                    >
                      <h3>{action.type}</h3>

                      <p>{action.message}</p>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          {tokenUsage && (
            <section>
              <h2>Token Usage</h2>

              <p>Total token usage: {tokenUsage.reduce((prev, curr) => {
                return prev + curr?.totalTokens
              }, 0)}</p>

              <ol>
                {tokenUsage?.map((tokenUsage, i) => {
                  return (
                    <li
                      key={i}
                      style={{
                        marginBottom: 8,
                      }}
                    >
                      <h5>{tokenUsage?.prompt}</h5>

                      <p>Completion: #{tokenUsage?.completionTokens}</p>
                      <p>Prompt: #{tokenUsage?.promptTokens}</p>
                      <p>Total: #{tokenUsage?.totalTokens}</p>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
