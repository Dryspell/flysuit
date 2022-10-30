import React from 'react'
// import { render } from 'react-dom'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-textmate'
import { useActiveCode } from '@codesandbox/sandpack-react'

const Editor = () => {
  const { code, updateCode } = useActiveCode()

  return (
    <AceEditor
      mode="javascript"
      defaultValue={code}
      onChange={updateCode}
      fontSize={14}
      height="300px"
      width="100%"
    />
  )
}
export default Editor
