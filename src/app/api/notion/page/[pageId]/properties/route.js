import { NextResponse } from 'next/server'

import {
  updatePage
} from '@/services/notion'

export async function PUT (request) {
  const {
    searchParams
  } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  const {
    pageTitle,
    summary,
    tags,
    area
  } = await request.json()
  
  try {
    const updatedPage = await updatePage({
      pageId,
      properties: {
        summary: {
          title: [
            {
              text: {
                content: summary
              }
            }
          ]
        },
        SMRZD: {
          checkbox: true
        }
      }
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    return NextResponse.error(error)
  }
}