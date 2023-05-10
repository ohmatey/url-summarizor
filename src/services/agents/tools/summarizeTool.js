import { OpenAI } from 'langchain/llms/openai'

import {
  DynamicTool,
} from 'langchain/tools'

import {
  summarizeContentChain,
  qaChain
} from '@/services/chains'

const fetchScrapeUrlDocs = async url => {
  const response = await fetch('/api/summarize-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  })

  if (!response.ok) {
    throw new Error(`Error fetching data from ${url}: ${response.statusText}`)
  }

  const docs = await response.json()

  return docs || []
}

const summarizeByUrl = async (url, {
  model
}) => {
  // scrape the content from the url
  const docs = await fetchScrapeUrlDocs(url)
  
  if (!docs || !docs.length) {
    console.log('docs', docs)
    
    throw new Error('No content found to summarize')
  }

  // summarize the content
  const callSummary = summarizeContentChain({
    model
  }).call({
    input_documents: docs
  })

  const callHighSchoolTeacher = qaChain({
    model
  }).call({
    input_documents: docs,
    question: 'You are a High School teacher teaching students. Explain in depth to the students the key points:'
  })

  const callYoungen = qaChain({
    model
  }).call({
    input_documents: docs,
    question: 'Explain the content to a 12 year old:'
  })

  const [
    { text: youngen },
    { text: highSchoolTeacher },
    { text: summary }
  ] = await Promise.all([
    callYoungen,
    callHighSchoolTeacher,
    callSummary
  ])

  const callMainIdea = qaChain({
    model
  }).call({
    input_documents: docs,
    question: 'You are a PHD level researcher exploring ideas for combat sport fans. What is the main idea of the article?'
  })

  const callInsights = qaChain({
    model
  }).call({
    input_documents: docs,
    question: 'You are a PHD level researcher exploring ideas for combat sport fans. What are the key insights of the article? Eg: 1. The modern aspiration economy is a new way of thinking about the relationship between brands and consumers. 2. The modern aspiration economy is a new way of thinking about the relationship between brands and consumers. 3. The modern aspiration economy is a new way of thinking about the relationship between brands and consumers.. If you don\'nt know reply with n/a'
  })

  // authors
  const callAuthors = qaChain({
    model
  }).call({
    input_documents: docs,
    question: 'You are a PHD level researcher exploring ideas for combat sport fans. Who are the authors of the article? Eg: John Brown, Ema Watts, n/a'
  })

  // tags
  const { text: tags } = await qaChain({
    model
  }).call({
    input_documents: docs,
    question: 'You are a PHD level researcher exploring ideas for combat sport fans. Using smart notes system, what are the tags for the article? Return a list eg: branding, marketing, luxury, business, design, product management, sports tourism, etc. If you don\'nt know reply with n/a'
  })

  const [
    { text: mainIdea },
    { text: keyInsights },
    { text: authors }
  ] = await Promise.all([
    callMainIdea,
    callInsights,
    callAuthors
  ])

  const contentSummary = {
    authors,
    mainIdea,
    tags,
    keyInsights,
    summary,
    youngen,
    highSchoolTeacher,
  }

  console.info(contentSummary)

  return contentSummary
}

const summarizeTool = ({
  model
}) => {
  return new DynamicTool({
    name: 'SummarizeGpt aka SummarizeBot: When you have a url for a file or website, use this tool summarize the content',
    description: 'A tool to summarize long form content such as PDFs, and text files. Input: a url for a file. Output: a summary of the file',
    func: async url => {
      const {
        summary,
        keyInsights,
      } = await summarizeByUrl(url, {
        model
      })

      return `
        ${summary}
        ${keyInsights}
      `
    }
  })
}

export default summarizeTool