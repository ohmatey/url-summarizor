import { NextResponse } from 'next/server'

import {
  makeNotionClient,
  updatePage
} from '@/services/notion'

export async function POST (request) {
  const {
    notionPageId,
    notionApiKey,
    title,
    url,
    summary,
    tags = [],
    areas = [],
  } = await request.json()

  const notionClient = makeNotionClient(notionApiKey)
  
  try {
    const updatedPage = await updatePage({
      pageId: notionPageId,
      properties: {
        summary: {
          rich_text: [
            {
              text: {
                content: summary
              }
            }
          ]
        },
        SMRZD: {
          checkbox: true
        },
        'SMRZED at': {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    }, {
      notionClient
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error('error', error)
    
    return NextResponse.error(error)
  }
}