'use client'

import { QueryClient, QueryClientProvider } from 'react-query'

import './globals.css'
import styles from './appLayout.module.css'

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='description' content='Summarize website, article, blog post, or file from a url.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>SummarizeGPT</title>
      </head>

      <body>
        <QueryClientProvider client={queryClient}>
          <div className={styles.rootContainer}>
            {children}
          </div>
        </QueryClientProvider>
      </body>
    </html>
  )
}
