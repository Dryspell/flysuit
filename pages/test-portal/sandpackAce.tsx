import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'

import dynamic from 'next/dynamic'

const code = `export default function App() {
  return <h1>Hello Sandpack</h1>
}`

const md = `# Hello Sandpack`

const Ace = dynamic(() => import('./ace'), { ssr: false })

export default function Page() {
  return (
    <SandpackProvider
      template="react"
      theme={atomDark}
      files={{
        // '/App.js': code,
        '/markdown.md': md,
      }}
    >
      <SandpackLayout>
        <Ace />
        <SandpackPreview />
      </SandpackLayout>
    </SandpackProvider>
  )
}
