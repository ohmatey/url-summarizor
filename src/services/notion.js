import { Client } from '@notionhq/client'

export const makeNotionClient = apiKey => {
  const notion = new Client({
    auth: apiKey
  })

  return notion
}

export const queryDatabase = async (databaseId, {
  notionClient: notion = makeNotionClient(),
  filter = {}
} = {}) => {
  if (!databaseId) {
    throw new Error('No databaseId was provided')
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter
  })

  return response
}

export const getDatabase = async (databaseId, {
  notionClient: notion = makeNotionClient(),
} = {}) => {
  if (!databaseId) {
    throw new Error('No databaseId was provided')
  }

  const notionDatabase = await notion.databases.retrieve({
    database_id: databaseId
  })

  return notionDatabase
}

export const getPage = async (pageId, {
  notionClient: notion = makeNotionClient()
}) => {
  const response = await notion.pages.retrieve({ page_id: pageId })

  return response
}

export const createNotionPage = async ({
  parent,
  properties,
  children = []
}, {
  notionClient: notion = makeNotionClient()
}) => {
  const response = await notion.pages.create({
    parent,
    properties,
    children
  })

  return response
}

export const updatePage = async ({
  pageId,
  properties
}, {
  notionClient: notion = makeNotionClient()
}) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties
  })

  return response
}