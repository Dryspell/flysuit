import {
  HS_Record,
  makeAssociationInputsFromRecords,
  postAssociations,
} from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  if (req.method === 'POST') {
    const toEntityPlural = (req.query.to_entity || req.body.to_entity) as string
    const fromEntityPlural = (req.query.from_entity ||
      req.body.from_entity) as string
    const BearerToken = (req.query.bearer_token ||
      req.query.token ||
      req.body.bearer_token ||
      req.body.token) as string

    const associationTypeId = parseInt(
      (req.query.association_type_id || req.body.association_type_id) as string
    )

    const fromRecords = req.body.from_records as HS_Record[]
    const toRecords = req.body.to_records as HS_Record[]
    const associationRelation: { from: string; to: string } = req.body.relations

    const associationInputs =
      req.body.inputs ||
      (await makeAssociationInputsFromRecords(
        fromEntityPlural,
        toEntityPlural,
        fromRecords,
        toRecords,
        associationRelation,
        associationTypeId
      ))

    if (associationInputs) {
      return res.status(200).json({
        message: `Success`,
        data: await postAssociations(
          toEntityPlural,
          fromEntityPlural,
          associationInputs,
          BearerToken
        ),
      })
    }
  }
}
