import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'
import { HS_base_url, HS_Headers } from '../../../lib/hubspot'

export type HS_Company = {}

export type Company = {
  about_us: string
  founded_year: number
  is_public: boolean
  name: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  website: string
  industry: string
  description: string
}

export type HS_SearchResult = {
  id: number
  properties: any
  createdAt: Date
  updatedAt: Date
  archived: boolean
}

export async function searchForContactsWithCompany(companyNames?: string[]) {
  const filterGroups = [
    {
      propertyName: 'company',
      operator: 'HAS_PROPERTY',
    },
  ]
  companyNames?.length &&
    filterGroups.push({
      propertyName: 'company',
      operator: 'IN', //@ts-ignore
      values: companyNames,
    })
  return await fetch(`${HS_base_url}crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: HS_Headers,
    body: JSON.stringify({
      filterGroups,
      properties: [
        'hs_object_id',
        'email',
        'company',
        'city',
        'state',
        'zip',
        'country',
        'industry',
      ],
    }),
  })
    .then((res) => res.json())
    .then((json) => {
      const contacts_with_companies: HS_SearchResult[] = json.results
      return contacts_with_companies
    })
}

export function splitIntoChunks(arr: any[], chunkSize: number) {
  let tempArray: any[] = []
  while (arr.length > 0) {
    tempArray.push(arr.splice(0, chunkSize))
  }
  return tempArray
}

export async function searchCompaniesByNames(companyNames: string[]) {
  companyNames = Array.from(new Set(companyNames))
  console.log(`Searching for CompanyNames:`, companyNames)
  const companyNamesChunks = splitIntoChunks(companyNames, 3)
  console.log(`CompanyNamesChunks:`, companyNamesChunks)
  const bodies = companyNamesChunks.map((chunk: string[]) =>
    JSON.stringify({
      filterGroups: chunk.map((companyName) => {
        return {
          filters: [
            {
              value: companyName,
              propertyName: 'name',
              operator: 'EQ',
            },
          ],
        }
      }),
      limit: 100,
    })
  )
  console.log(`SearchBodies:`, bodies)
  return await Promise.allSettled(
    bodies.map((body) =>
      fetch(`${HS_base_url}crm/v3/objects/companies/search`, {
        method: 'POST',
        headers: HS_Headers,
        body,
      })
        .then((res) => {
          console.log(`status: ${res.status}`) // @ts-ignore
          return res.json()
        })
        .then((json) => {
          const results = json.results.map(
            (result: HS_SearchResult) => result.properties.name
          )
          return results
        })
    )
  )
}

export async function getUnInstantiatedCompanies() {
  const getUnInstantiatedCompanies = await searchForContactsWithCompany().then(
    async (contacts_with_companies: any) => {
      const companyNames = contacts_with_companies.map(
        (contact: any) => contact.properties.company
      )
      console.log(
        `Found ${companyNames.length} contacts with companies:`,
        companyNames
      )
      const searchedCompanies = (await searchCompaniesByNames(companyNames))
        .filter((search) => search.status === 'fulfilled')
        .reduce((acc: any, curr: { status: string; value: string[] } | any) => {
          return acc.concat(curr.value)
        }, [])
      console.log(
        `Found ${searchedCompanies.length} searched companies:`,
        searchedCompanies
      )

      return Array.from(
        new Set(
          contacts_with_companies.map((cwc: any) => cwc.properties.company)
        )
      )
        .map(
          (company) =>
            contacts_with_companies.filter(
              (cwc: any) => cwc.properties.company === company
            )[0]
        )
        .filter(
          (cwc: any) => !searchedCompanies.includes(cwc.properties.company)
        )
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
          } as Company
        })
    }
  )

  console.log(`Returned ${getUnInstantiatedCompanies.length} companies`)
  return getUnInstantiatedCompanies
}

export function createRandomCompany(): Company {
  let company: Company = {
    about_us: faker.company.bs(),
    founded_year: faker.date.past(50).getFullYear(),
    is_public: Math.random() < 0.5,
    name: faker.company.companyName(),
    phone: faker.phone.number(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    zip: faker.address.zipCode(),
    country: faker.address.country(),
    website: faker.internet.url(),
    industry: faker.name.jobArea(),
    description: faker.lorem.paragraph(),
  }

  return company
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!['POST', 'GET'].includes(req.method as string))
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })

  const uninstantiated_companies: Company[] = []
  const random_companies: Company[] = []

  const { createUninstantiatedChance } = req.query
  let unInstantiatedCompanies = createUninstantiatedChance
    ? await getUnInstantiatedCompanies()
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
  const companies: Company[] = [
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
    const postedCompanies = await fetch(
      `${HS_base_url}crm/v3/objects/companies/batch/create`,
      {
        headers: HS_Headers,
        method: 'POST',
        body: JSON.stringify({
          inputs: companies.map((company) => {
            return { properties: company }
          }),
        }),
      }
    )
      .then((res: any) => res.json())
      .then((res) => {
        return res.results
      })

    const companiesToAssociate: HS_SearchResult[] = postedCompanies.filter(
      (company: HS_SearchResult) => {
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

    const targetsToAssociate = await searchForContactsWithCompany(
      companiesToAssociate.map((company) => company.properties.name)
    )
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

    type AssociationDefinition = {
      category: 'HUBSPOT_DEFINED' | 'USER_DEFINED'
      typeId: number | string
      label: string
    }

    const getAssociationDefintions: AssociationDefinition[] = await fetch(
      `${HS_base_url}crm/v4/associations/companies/contacts/labels`,
      {
        headers: HS_Headers,
        method: 'GET',
      }
    )
      .then((res: any) => res.json())
      .then((res) => {
        console.log(
          `Received ${res.results.length} Association definitions`,
          res.results
        )
        return res.results
      })

    const associationInputs = companiesToAssociate
      .map((company) =>
        targetsToAssociate
          .filter(
            (target) => target.properties.company === company.properties.name
          )
          .map((target) => {
            return getAssociationDefintions.map((assocDef) => {
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

    const postAssociations = await fetch(
      `${HS_base_url}crm/v4/associations/companies/contacts/batch/create`,
      {
        headers: HS_Headers,
        method: 'POST',
        body: JSON.stringify({
          inputs: associationInputs,
        }),
      }
    )
      .then((res: any) => res.json())
      .then((res) => {
        console.log(`Posted ${res.results.length} associations`)
        return res.results
      })

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
