import type { NextApiRequest, NextApiResponse } from 'next'
import { serverEnv } from '../../../../env/server'
import { searchForEntitiesWithProperty } from '../../../../lib/hubspot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST', 'GET'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const { entity } = req.query
  const random = await fetch(
    `${serverEnv.NEXT_APP_URL}/api/hubspot/${entity}/spawn-random`,
    { method: req.method }
  ).then((r) => r.json())

  return random.message === 'Success'
    ? res.status(200).json(random)
    : res.status(500).json(random)
}
