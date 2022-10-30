import React from 'react'

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'
import dynamic from 'next/dynamic'
import { useState } from 'react'
// import styles from '../../styles/sandpackAce.css'
import { languages, themes } from './AceEdit'

const code = `export default function App() {
  return <h1>Hello Sandpack</h1>
}`

const md = `# Hello Sandpack`

const AceEdit = dynamic(() => import('./AceEdit'), { ssr: false })

export default function Page() {
  const [lang, setLang] = useState('javascript')
  const [theme, setTheme] = useState('github')
  const [readOnly, setReadOnly] = useState(false)

  return (
    <main
    //  className={styles.main}
    >
      <p
      //    className={styles.control}
      >
        <span
        //  className={styles.select}
        >
          <select
            name="mode"
            onChange={(e) => setLang(e.target.value)}
            value={lang}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </span>
        <span
        // className={styles.select}
        >
          <select
            name="theme"
            onChange={(e) => setTheme(e.target.value)}
            value={theme}
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </span>
        <label
        //  className={styles.checkbox}
        >
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
          readOnly
        </label>
      </p>
      <SandpackProvider
        template="react"
        theme={atomDark}
        files={{
          // '/App.js': code,
          '/markdown.md': md,
        }}
      >
        <SandpackLayout>
          {/* <AceEdit
            mode={'javascript'}
            theme={'twilight'}
            defaultValue={code}
            readOnly={false}
            height="400px"
            width="400px"
          /> */}
          <AceEdit
            mode={lang}
            theme={theme}
            defaultValue={code}
            readOnly={readOnly}
            height="400px"
            width="400px"
          />
          {/* <SandpackPreview /> */}
        </SandpackLayout>
      </SandpackProvider>
    </main>
  )
}
