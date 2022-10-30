import React from 'react'
import type { IAceEditorProps } from 'react-ace'
import dynamic from 'next/dynamic'

export const languages = [
  'javascript',
  'java',
  'python',
  'xml',
  'ruby',
  'sass',
  'markdown',
  'mysql',
  'json',
  'html',
  'handlebars',
  'golang',
  'csharp',
  'elixir',
  'typescript',
  'css',
]

export const themes = [
  'monokai',
  'github',
  'tomorrow',
  'kuroir',
  'twilight',
  'xcode',
  'textmate',
  'solarized_dark',
  'solarized_light',
  'terminal',
]

const AceEditor = dynamic(async () => {
  const ace = await import('react-ace')
  languages.forEach((lang) => {
    require(`ace-builds/src-noconflict/mode-${lang}`)
  })
  themes.forEach((theme) => {
    require(`ace-builds/src-noconflict/theme-${theme}`)
  })
  return ace
})

interface IProps extends Omit<IAceEditorProps, 'setOptions'> {}
export default function CodeEditor(props: IProps) {
  return (
    <AceEditor
      theme="github"
      fontSize="14"
      highlightActiveLine
      showGutter
      showPrintMargin
      setOptions={{
        tabSize: 2,
        showLineNumbers: true,
        useWorker: false,
      }}
      {...props}
    />
  )
}
