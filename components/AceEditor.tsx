import React from 'react'
import * as ace from 'ace-builds'
import AceEditor from 'react-ace'
import type { IAceEditorProps } from 'react-ace'

ace.config.set('basePath', 'https://ace.c9.io/build/src-noconflict/')
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-dracula'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

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

function onChange(newValue: string) {
  console.log('change', newValue)
}

interface IProps extends Omit<IAceEditorProps, 'setOptions'> {}
export default function Editor(props: IProps) {
  return (
    <AceEditor
      mode="javascript"
      theme="monokai"
      fontSize="14"
      highlightActiveLine
      showGutter
      showPrintMargin
      enableBasicAutocompletion
      enableLiveAutocompletion
      onChange={onChange}
      setOptions={{
        tabSize: 2,
        showLineNumbers: true,
        useWorker: false,
      }}
      {...props}
    />
  )
}
