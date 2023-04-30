import {
	SandpackProvider,
	SandpackLayout,
	SandpackCodeEditor,
	SandpackPreview,
} from "@codesandbox/sandpack-react"
import { atomDark } from "@codesandbox/sandpack-themes"
// import { markdown, markdownLanguage } from '@codemirror/lang-markdown'

const code = `export default function App() {
  return <h1>Hello Sandpack</h1>
}`

const md = `# Hello Sandpack`

export default function Page() {
	return (
		<SandpackProvider
			template="react"
			theme={atomDark}
			files={{
				"/App.js": code,
				"/markdown.md": md,
			}}
		>
			<SandpackLayout>
				<SandpackCodeEditor
					showLineNumbers={true}
					showTabs
					showInlineErrors
					wrapContent
					// additionalLanguages={[
					//   {
					//     name: 'markdown',
					//     extensions: ['md'],
					//     language: markdown(),
					//   },
					// ]}
				/>
				<SandpackPreview />
			</SandpackLayout>
		</SandpackProvider>
	)
}
