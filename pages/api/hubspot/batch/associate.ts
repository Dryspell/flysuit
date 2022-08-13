import {
  getAssociationDefintions,
  HS_Record,
  postAssociations,
  postHubspot,
} from '@/lib/hubspot'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AssociationDefinition } from '../../../../lib/hubspot'

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
    const BearerToken = (req.query.bearer_token || req.query.token) as string
    const associationInputs = req.body.inputs
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

    const associationDefinitions = await getAssociationDefintions(
      toEntityPlural,
      fromEntityPlural
    )

    const associationCategory = associationDefinitions[0].category

    const associationTypeId = (req.query.association_type_id ||
      req.body.association_type_id) as string
    const fromRecords = req.body.from_records as HS_Record[]
    const toRecords = req.body.to_records as HS_Record[]
    const associationRelations: { from: string; to: string } = req.body
      .relations || { from: '', to: '' }

    const makeAssociationInputs = () => {
      return [
        {
          from: { id: 'fromID' },
          to: { id: 'toID' },
          types: [{ associationCategory, associationTypeId }],
        },
      ]
    }

    return res.status(200).json({
      message: `Success`,
      data: postAssociations(
        toEntityPlural,
        fromEntityPlural,
        makeAssociationInputs(),
        BearerToken
      ),
    })
  }
}
