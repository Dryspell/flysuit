import { Sandpack } from '@codesandbox/sandpack-react'
const code = `export default function App() {
  return <h1>Hello Sandpack</h1>
}`

export default function Page() {
  return (
    <Sandpack
      template="react"
      files={{
        '/App.js': code,
      }}
    />
  )
}
