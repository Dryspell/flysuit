import { HS_Record, postHubspot } from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  if (req.method === 'POST') {
    const entityPlural = (req.query.entity || req.body.entity) as string
    const postedEntities: HS_Record[] = (
      await postHubspot(entityPlural, req.body.records)
    ).records
    // console.log(postEntities)

    return res.status(200).json({
      message: `Success`,
      data: postedEntities,
    })
  }
}
