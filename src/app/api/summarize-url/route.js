import { NextResponse } from 'next/server'

import * as cheerio from 'cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import {
  JSONLoader,
  JSONLinesLoader,
} from 'langchain/document_loaders/fs/json'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

const splitTextToDocs = async (text) => {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 5000 })
  const docs = await textSplitter.createDocuments([text])

  return docs
}

const convertHtmlToText = html => {
  if (!html) return ''

  const $ = cheerio.load(html)
  
  const textContent = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()

  return textContent
}

const createTempFolder = (tempFolder) => {
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder)
  }

  return tempFolder
}

const tempFolderName = './tmp'

const downloadFile = async (url, filePath) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error fetching data from ${url}: ${response.statusText}`)
  }

  // create temp location
  const fileLocation = `${createTempFolder(tempFolderName)}/${filePath}`
  
  const streamFileToLocation = fs.createWriteStream(fileLocation)
  
  await finished(Readable.fromWeb(body).pipe(streamFileToLocation))
  
  return fileLocation
}

const scrapeTextContent = async url => {
  const isCommonFileExtension = url => {
    const commonFileExtensions = ['.json', '.jsonl', '.txt', '.csv']

    return commonFileExtensions.some(ext => url.endsWith(ext))
  }

  const isCommonFile = isCommonFileExtension(url)

  if (isCommonFile) {
    const urlExtension = path.extname(url)

    await downloadFile(url, `content${urlExtension}`)

    const loader = new DirectoryLoader(
      tempFolderName,
      {
        '.json': (path) => new JSONLoader(path),
        '.jsonl': (path) => new JSONLinesLoader(path),
        '.txt': (path) => new TextLoader(path),
        '.csv': (path) => new CSVLoader(path),
      }
    )

    const docs = await loader.load()

    return docs
  }

  try {
    // if url is pdf use the PDF loader
    if (url.endsWith('.pdf')) {
      console.log('Is pdf')

      const pdfLocation = await downloadFile(url, '/tmp.pdf')
      
      const pdfLoader = new PDFLoader(pdfLocation)

      const pdfDocs = await pdfLoader.load()

      // remove the temp file
      fs.unlinkSync(pdfLocation)

      return pdfDocs
    }

    // is url
    if (url.startsWith('http') || url.startsWith('https')) {
      const html = await fetch(url).then((res) => {
        if (res.ok) {
          return res.text()
        }

        throw new Error(`Error fetching data from ${url}: ${res.statusText}`)
      })
      const $ = await cheerio.load(html)

      // Remove script, style, and other unwanted elements
      $('script, noscript, style, iframe, nav, footer, aside, header').remove()

      const cleanedHtml = $.html()

      const text = convertHtmlToText(cleanedHtml)

      const docs = await splitTextToDocs(text)

      return docs
    }

    // is text
    const docs = await splitTextToDocs(url)

    return docs
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error)
  }
}

export async function POST(request) {
  const {
    url
  } = await request.json()

  const docs = await scrapeTextContent(url)

  return NextResponse.json(docs)
}