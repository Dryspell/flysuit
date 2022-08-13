import type { NextApiRequest, NextApiResponse } from 'next'
import { serverEnv } from '../../../../env/server'
import {
  createRandom,
  HS_Company,
  HS_Record,
  postHubspot,
  searchForEntitiesWithProperty,
} from '../../../../lib/hubspot'

export async function searchCompaniesByNames(companyNames: string[]) {
  companyNames = Array.from(new Set(companyNames))
  console.log(`Searching for CompanyNames:`, companyNames)

  return await searchForEntitiesWithProperty('companies', 'name', companyNames)
}

export async function getExistingRumoredEntities(
  entityPlural: string,
  rumorProperty: string,
  rumorEntityPlural: string,
  count: number
) {
  const entitiesWithProperty = await searchForEntitiesWithProperty(
    entityPlural,
    rumorProperty
  )

  const entityPropValues: string[] = entitiesWithProperty.map(
    (entity: { id: string; properties: any[] }) => {
      //@ts-ignore
      return entity.properties[rumorProperty]
    }
  )

  console.log(
    `Found ${entityPropValues.length} ${entityPlural} with ${rumorProperty}:`
  )

  const searchedEntityPropValues = (
    await searchForEntitiesWithProperty(
      rumorEntityPlural,
      rumorProperty,
      entityPropValues
    )
  ).reduce((acc: any, curr: any) => {
    return acc.concat(curr.value)
  }, [])

  console.log(
    `Found ${searchedEntityPropValues.length} searched ${entityPlural}:`,
    searchedEntityPropValues
  )

  const rumoredEntities = entityPropValues
    .map(
      (entityPropValue) =>
        entitiesWithProperty.filter(
          (ewp: any) => ewp.properties[rumorProperty] === entityPropValue
        )[0]
    )
    .filter(
      (ewp: any) =>
        !searchedEntityPropValues.includes(ewp.properties[rumorProperty])
    )
    .map((ewp: any) => {
      const { name, company, city, state, zip, country, industry } =
        ewp.properties
      const baseRecord =
        entityPlural === 'companies'
          ? [
              {
                name: company,
                city,
                state,
                zip,
                country,
                industry,
              },
            ]
          : undefined
      return createRandom(entityPlural, 1, baseRecord)
    })
    .filter(
      (response: { message: string; data: any }) =>
        response.message === 'Success'
    )
    .reduce((acc: any, curr: any) => {
      return acc.concat(curr.data)
    }, [])

  console.log(`Returned ${rumoredEntities.length} companies`)
  return rumoredEntities
}

async function postRumoredEntities(
  req: NextApiRequest,
  res: NextApiResponse,
  entityPlural: string,
  rumorProperty: string,
  rumorEntityPlural: string,
  count?: number
) {
  let rumoredCompanies: HS_Company[] = await getExistingRumoredEntities(
    entityPlural,
    rumorProperty,
    rumorEntityPlural,
    count || 10
  )

  if (req.method === 'GET') {
    return res.status(200).json({
      message: `Success`,
      data: {
        companies: rumoredCompanies,
      },
    })
  }

  if (req.method === 'POST') {
    const postedCompanies: HS_Record[] = (
      await postHubspot('companies', rumoredCompanies)
    ).records

    const companiesToAssociate: HS_Record[] = postedCompanies.filter(
      (company: HS_Record) => {
        return rumoredCompanies
          .map((record) => record.name)
          .includes(company.properties.name)
      }
    )
    console.log(
      `Companies to associate:`,
      companiesToAssociate.map((company) => {
        return { id: company.id, name: company.properties.name }
      })
    )

    const targetsToAssociate = companiesToAssociate.length
      ? await searchForEntitiesWithProperty(
          'contacts',
          'company',
          companiesToAssociate.map((company) => company.properties.name)
        )
      : []
    console.log(
      `Found ${targetsToAssociate.length} contacts to associate`,
      targetsToAssociate.map((target) => {
        return {
          id: target.id,
          company: target.properties.company,
          email: target.properties.email,
        }
      })
    )

    const postedAssociations = await fetch(
      `${serverEnv.NEXT_APP_URL}/api/batch/associate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_entity: 'companies',
          from_entity: 'contacts',
          from_records: companiesToAssociate,
          to_records: targetsToAssociate,
          relations: {
            from: 'name',
            to: 'company',
          },
          token: req.query.token,
        }),
      }
    )

    return res.status(200).json({
      message: `Success`,
      data: {
        postedCompanies,
        companiesToAssociate,
        targetsToAssociate,
        postedAssociations,
      },
    })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST', 'GET'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const { createUninstantiatedChance, entity } = req.query
  if (!createUninstantiatedChance || entity !== 'companies') {
    const random = await fetch(
      `${serverEnv.NEXT_APP_URL}/api/hubspot/${entity}/spawn-random`,
      { method: req.method }
    ).then((r) => r.json())
    return random.message === 'Success'
      ? res.status(200).json(random)
      : res.status(500).json(random)
  }

  return await postRumoredEntities(req, res, 'contacts', 'company', 'companies')
}
