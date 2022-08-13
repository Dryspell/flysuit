import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import { serverEnv } from '../../../../env/server'
import {
  AssociationDefinition,
  AssociationInput,
  createRandom,
  createRandomCompany,
  getAssociationDefintions,
  HS_base_url,
  HS_Company,
  HS_Headers,
  HS_Record,
  postAssociations,
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
  rumorEntityPlural: string
) {
  const getExistingRumoredEntities = await searchForEntitiesWithProperty(
    entityPlural,
    rumorProperty
  ).then(async (entities_with_property: any) => {
    const entityPropValues: string[] = entities_with_property.map(
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
    )
      .reduce((acc: any, curr: { status: string; value: string[] } | any) => {
        return acc.concat(curr.value)
      }, [])
      .map()
    console.log(
      `Found ${searchedEntityPropValues.length} searched ${entityPlural}:`,
      searchedEntityPropValues
    )

    const rumoredEntities = entityPropValues
      .map(
        (entityPropValue) =>
          entities_with_property.filter(
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

    return rumoredEntities
  })

  console.log(`Returned ${getExistingRumoredEntities.length} companies`)
  return getExistingRumoredEntities
}

async function postRumoredEntities(
  req: NextApiRequest,
  res: NextApiResponse,
  {
    entityPlural,
    rumorProperty,
    rumorEntityPlural,
  }: {
    entityPlural: string
    rumorProperty: string
    rumorEntityPlural: string
  }
) {
  const uninstantiated_companies: HS_Company[] = []
  const random_companies: HS_Company[] = []

  let unInstantiatedCompanies = await getExistingRumoredEntities(
    entityPlural,
    rumorProperty,
    rumorEntityPlural
  )

  Array.from({ length: 10 }).forEach(() => {
    if (
      req.query.createUninstantiatedChance &&
      Math.random() * 100 < Number(req.query.createUninstantiatedChance)
    ) {
      const uninstantiatedCompany = unInstantiatedCompanies.pop()
      uninstantiatedCompany //@ts-ignore
        ? uninstantiated_companies.push(uninstantiatedCompany)
        : null
    } else {
      random_companies.push(createRandomCompany())
    }
  })
  console.log(
    `Creating ${uninstantiated_companies.length} pre-referenced companies and ${random_companies.length} RANDOM companies`,
    uninstantiated_companies.map((c) => {
      return { name: c.name }
    })
  )
  const companies: HS_Company[] = [
    ...uninstantiated_companies,
    ...random_companies,
  ]

  if (req.method === 'GET') {
    return res.status(200).json({
      message: `Success`,
      data: {
        companies: !req.query.createUninstantiatedChance
          ? companies
          : {
              uninstantiated_companies,
              random_companies,
            },
      },
    })
  }

  if (req.method === 'POST') {
    const postedCompanies: HS_Record[] = (
      await postHubspot('companies', companies)
    ).records

    const companiesToAssociate: HS_Record[] = postedCompanies.filter(
      (company: HS_Record) => {
        return uninstantiated_companies
          .map((uic) => uic.name)
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

    const associationDefintions = await getAssociationDefintions(
      'companies',
      'contacts'
    )

    //@ts-ignore
    const associationInputs: AssociationInput[] = companiesToAssociate
      .map((company) =>
        targetsToAssociate
          .filter(
            (target) => target.properties.company === company.properties.name
          )
          .map((target) => {
            return associationDefintions.map((assocDef) => {
              return {
                from: { id: company.id },
                to: { id: target.id },
                types: [
                  {
                    associationCategory: assocDef.category,
                    associationTypeId: assocDef.typeId,
                  },
                ],
              }
            })
          })
      )
      .reduce((acc, curr) => [...acc, ...curr], [])
      .reduce((acc, curr) => [...acc, ...curr], [])

    console.log(
      `Making ${associationInputs.length} Associations of companies to contacts across ${getAssociationDefintions.length} Association definitions, sample:`,
      associationInputs[0]
    )

    const postedAssociations = await postAssociations(
      'companies',
      'contacts',
      associationInputs
    )

    return res.status(200).json({
      message: `Success`,
      data: {
        postedCompanies,
        companiesToAssociate,
        targetsToAssociate,
        associationDefintions,
        associationInputs,
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

  return await postRumoredEntities(req, res, {
    entityPlural: 'contacts',
    rumorProperty: 'company',
    rumorEntityPlural: 'companies',
  })
}
