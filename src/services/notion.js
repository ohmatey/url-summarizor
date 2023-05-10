import { Client } from '@notionhq/client'

export const notion = new Client({ auth: process.env.NOTION_API_KEY })

export const getDatabase = async (databaseId, filter = {}) => {
  if (!databaseId) {
    throw new Error('No databaseId was provided')
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter
  })

  return response
}

export const getPage = async pageId => {
  const response = await notion.pages.retrieve({ page_id: pageId })

  return response
}

export const createNotionPage = async ({
  parent,
  properties,
  children = []
}) => {
  const response = await notion.pages.create({
    parent,
    properties,
    children
  })

  return response
}

export const updatePage = async ({ pageId, properties }) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties
  })

  return response
}