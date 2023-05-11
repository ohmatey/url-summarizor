import { NextResponse } from 'next/server'
import {
  makeNotionClient,
  getDatabase,
  queryDatabase,
} from '@/services/notion'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notionApiKey = searchParams.get('notionApiKey')
    const notionDatabaseId = searchParams.get('notionDatabaseId')

    if (!notionApiKey) {
      return NextResponse.error(new Error('No notionApiKey was provided'))
    }

    if (!notionDatabaseId) {
      return NextResponse.error(new Error('No notionDatabaseId was provided'))
    }

    const notionClient = makeNotionClient(notionApiKey)

    const fetchDatabase = getDatabase(notionDatabaseId, {
      notionClient,
    })

    const fetchPages = queryDatabase(notionDatabaseId, {
      notionClient,
      filter: {
        property: 'SMRZD',
        checkbox: {
          equals: false,
        }
      }
    })

    const [
      database,
      pages,
    ] = await Promise.all([fetchDatabase, fetchPages])

    return NextResponse.json({
      database,
      pages,
    })
  } catch (error) {
    return NextResponse.error(error)
  }
}