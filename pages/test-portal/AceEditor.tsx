import dynamic from 'next/dynamic'
import React from 'react'

const AceEditor = dynamic(() => import('../../components/AceEditor'), {
  ssr: false,
})

export default function Page() {
  return <AceEditor />
}
