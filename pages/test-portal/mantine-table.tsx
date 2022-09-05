import { TableSort } from '@/components/MantineComponents/mantine-table'

export async function getStaticProps() {
  //   console.log(process.env.NEXT_APP_URL)
  const data = await fetch(
    `${process.env.NEXT_APP_URL}/api/hubspot/contacts/spawn`
  )
    .then((res) => res.json())
    .then((data) => data.data)
  console.log(`Received ${data.length} contacts`)
  return { props: { data } }
}

export default function main({ data }: any) {
  data = data.map((item: any) => {
    return {
      name: `${item.firstname} ${item.lastname}`,
      email: item.email,
      company: item.company,
    }
  })

  return <TableSort data={data} />
}
