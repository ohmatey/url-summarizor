import React from 'react'

const AppPage = () => {
  return (
    <div>
      <h1>App Page</h1>

      <form>
        <input type="text" placeholder="Notion API Key" />

        <input type="text" placeholder="Notion Database ID" />
      </form>

      {/* list of pages to sift through */}
      <ul>

      </ul>
    </div>
  )
}

export default AppPage