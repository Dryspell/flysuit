import { useEffect } from 'react'
import { DataFrame } from 'danfojs'

export async function getStaticProps() {
  const data = await fetch('http://localhost:3000/api/hubspot/contacts/spawn')
    .then((res) => res.json())
    .then((data) => data.data)
  console.log(`Received ${data.length} contacts`)
  return { props: { data } }
}

function Main({ data }: any) {
  useEffect(() => {
    const df = new DataFrame(data)
    df.plot('plot_div').table()
  }, [data])

  return (
    <div className="App">
      <header className="App-header">
        <div id="plot_div" className="h-screen"></div>
      </header>
    </div>
  )
}

export default Main
