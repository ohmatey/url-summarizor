'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

const notionApiKey = process.env.NOTION_API_KEY || 'Notion API Key'
const notionDatabaseId = process.env.NOTION_DATABASE_ID || 'Notion Database ID'

// create a button to summarise the page's url
const SummarizeUrlButton = ({
  notionPageId,
  notionApiKey,
  url,
  children,
  ...props
}) => {
  const {
    mutate: summarizeUrl,
    isLoading,
    isError,
    isSuccess,
    error,
    data: summary,
  } = useMutation(
    async ({ url }) => {
      const queryParams = new URLSearchParams({
        url,
      }).toString()

      const response = await fetch(`/api/summarize-url?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      return data?.response
    },
    {
      onSuccess: data => {
        console.log('data', data)
      },
    }
  )

  return (
    <>
      <button
        onClick={() => summarizeUrl({ url })}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? 'smrzing' : children}
      </button>

      {isSuccess && (
        <>
          <p>{summary}</p>

          {summary && (
            <SummaryForm
              notionPageId={notionPageId}
              notionApiKey={notionApiKey}
              url={url}
              summary={summary}
              // tags={summary?.tags}
              // areas={summary?.areas}
            />
          )}
        </>
      )}
    </>
  )
}

// display form with url, summary, tags, area
const SummaryForm = ({
  notionPageId,
  notionApiKey,
  url = '',
  summary = '',
  tags = [],
  areas = [],
}) => {
  const {
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      url,
      summary,
      tags,
      areas,
    },
  })

  const {
    mutate: saveSummary,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useMutation(
    async ({ url, summary, tags, areas }) => {
      const response = await fetch('/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notionPageId,
          notionApiKey,
          url,
          summary,
          tags,
          areas,
        }),
      })

      const data = await response.json()

      return data?.response
    },
    {
      onSuccess: data => {
        console.log('data', data)
      },
    }
  )

  return (
    <form onSubmit={handleSubmit(saveSummary)}>
      <h3>Update notion doc</h3>

      <p>Peruse summary outputs before updating the notion doc.</p>

      <input
        type='text'
        {...register('url', {
          required: true,
        })}
      />

      <label>
        <span>Summary</span>
        <textarea
          {...register('summary', {
            required: true,
          })}
          rows={4}
          disabled={isLoading}
        />
      </label>

      <label>
        <span>Tags</span>
        <input
          {...register('tags', {
            required: true,
          })}
          disabled={isLoading}
        />
      </label>

      <label>
        <span>Areas</span>
        <input
          {...register('areas', {
            required: true,
          })}
          disabled={isLoading}
        />
      </label>

      <button
        type='submit'
        disabled={isLoading}
      >
        {isLoading ? 'Updating' : 'Update'}
      </button>
    </form>
  )
}

const PageItemCard = ({
  id,
  notionApiKey,
  icon,
  cover,
  url,
  properties = {},
}) => {
  const {
    summary,
    tags,
    area,
  } = properties

  const propertyUrl = properties?.URL?.url

  return (
    <div
      key={id}
      style={{
        marginBottom: '1rem',
      }}
    >
      <p>Url: {properties?.URL?.url}</p>
      <p>SMRZD: {properties?.SMRZD?.checkbox ? 'true' : 'false'}</p>

      <SummarizeUrlButton
        url={propertyUrl}
        notionPageId={id}
        notionApiKey={notionApiKey}
      >
        SMRZ
      </SummarizeUrlButton>
    </div>
  )
}

const fetchQueryNotionDatabase = async ({
  notionApiKey,
  notionDatabaseId,
}) => {
  const queryParams = new URLSearchParams({
    notionApiKey,
    notionDatabaseId,
  }).toString()

  const response = await fetch(`/api/notion/database/${notionDatabaseId}?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  return data
}

const AppPage = () => {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      notionApiKey,
      notionDatabaseId,
    },
  })

  const {
    mutate: fetchDatabase,
    isLoading,
    isError,
    isSuccess,
    error,
    data: notionDatabase
  } = useMutation(
    async ({ notionApiKey, notionDatabaseId }) => {
      const notionDatabase = await fetchQueryNotionDatabase({
        notionApiKey,
        notionDatabaseId,
      })

      return notionDatabase
    },
    {
      onSuccess: data => {
        console.log('data', data)
      },
    }
  )

  const notionApiKeyValue = watch('notionApiKey')

  const tagPropertyOptions = notionDatabase?.database?.properties?.Tags?.multi_select?.options
console.log('tagPropertyOptions', tagPropertyOptions)

  return (
    <div>
      <h1>App Page</h1>

      <form onSubmit={handleSubmit(fetchDatabase)}>
        <input
          type='text'
          {...register('notionApiKey', {
            required: true,
          })}
        />

        <input
          type='text'
          {...register('notionDatabaseId', {
            required: true,
          })}
        />

        <button
          type='submit'
          disabled={isLoading}
        >Submit</button>
      </form>

      {isLoading && (
        <p>Fetching notion database...</p>
      )}

      <div>
        <h3>Database: {notionDatabase?.database?.title?.[0]?.plain_text}</h3>

        <select>
          {tagPropertyOptions?.map(option => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
      </div>

      {/* list of pages to sift through */}
      {notionDatabase?.pages?.results && (
        <div>
          {notionDatabase?.pages?.results?.map(page => (
            <PageItemCard
              key={page.id}
              notionApiKey={notionApiKeyValue}
              {...page}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AppPage