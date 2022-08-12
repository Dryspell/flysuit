import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import {
  AssociationDefinition,
  AssociationInput,
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
  // const companyNamesChunks = splitIntoChunks(companyNames, 3)
  // console.log(`CompanyNamesChunks:`, companyNamesChunks)
  // const bodies = companyNamesChunks.map((chunk: string[]) =>
  //   JSON.stringify({
  //     filterGroups: chunk.map((companyName) => {
  //       return {
  //         filters: [
  //           {
  //             value: companyName,
  //             propertyName: 'name',
  //             operator: 'EQ',
  //           },
  //         ],
  //       }
  //     }),
  //     limit: 100,
  //   })
  // )
  // console.log(`SearchBodies:`, bodies)
  // return await Promise.allSettled(
  //   bodies.map((body) =>
  //     fetch(`${HS_base_url}crm/v3/objects/companies/search`, {
  //       method: 'POST',
  //       headers: HS_Headers(),
  //       body,
  //     })
  //       .then((res) => {
  //         console.log(`status: ${res.status}`) // @ts-ignore
  //         return res.json()
  //       })
  //       .then((json) => {
  //         const results = json.results.map(
  //           (result: HS_Record) => result.properties.name
  //         )
  //         return results
  //       })
  //   )
  // )
}

export async function getExistingRumoredEntities(
  entityPlural: string,
  rumorEntityPlural: string,
  rumorProperty: string
) {
  const getExistingRumoredEntities = await searchForEntitiesWithProperty(
    'contacts',
    'company'
  ).then(async (contacts_with_companies: any) => {
    const companyNames = contacts_with_companies.map(
      (contact: any) => contact.properties.company
    )
    console.log(
      `Found ${companyNames.length} contacts with companies:`,
      companyNames
    )
    const searchedCompanies = (
      await searchCompaniesByNames(companyNames)
    ).reduce((acc: any, curr: { status: string; value: string[] } | any) => {
      return acc.concat(curr.value)
    }, [])
    console.log(
      `Found ${searchedCompanies.length} searched companies:`,
      searchedCompanies
    )

    return Array.from(
      new Set(contacts_with_companies.map((cwc: any) => cwc.properties.company))
    )
      .map(
        (company) =>
          contacts_with_companies.filter(
            (cwc: any) => cwc.properties.company === company
          )[0]
      )
      .filter((cwc: any) => !searchedCompanies.includes(cwc.properties.company))
      .map((cwc: any) => {
        return {
          about_us: faker.company.bs(),
          founded_year: faker.date.past().getFullYear(),
          is_public: Math.random() < 0.5,
          name: cwc.properties.company,
          phone: faker.phone.number(),
          address: faker.address.streetAddress(),
          city: cwc.properties.city,
          state: cwc.properties.state,
          zip: cwc.properties.zip,
          country: cwc.properties.country,
          website: faker.internet.url(),
          industry: cwc.properties.industry,
          description: faker.lorem.paragraph(),
        } as HS_Company
      })
  })

  console.log(`Returned ${getExistingRumoredEntities.length} companies`)
  return getExistingRumoredEntities
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST', 'GET'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const uninstantiated_companies: HS_Company[] = []
  const random_companies: HS_Company[] = []

  const { createUninstantiatedChance } = req.query
  let unInstantiatedCompanies = createUninstantiatedChance
    ? await getExistingRumoredEntities('contacts', 'companies', 'company')
    : []

  Array.from({ length: 10 }).forEach(() => {
    if (
      createUninstantiatedChance &&
      Math.random() * 100 < Number(createUninstantiatedChance)
    ) {
      const uninstantiatedCompany = unInstantiatedCompanies.pop()
      uninstantiatedCompany
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
        getAssociationDefintion: getAssociationDefintions,
        associationInputs,
        postAssociations,
      },
    })
  }
}
