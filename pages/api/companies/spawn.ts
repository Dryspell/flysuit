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

export async function getUnInstantiatedCompanies() {
  const getUnInstantiatedCompanies = await fetch(
    `${HS_base_url}crm/v3/objects/contacts/search`,
    {
      method: 'POST',
      headers: HS_Headers,
      body: JSON.stringify({
        filterGroups: [
          {
            propertyName: 'company',
            operator: 'HAS_PROPERTY',
          },
        ],
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
    }
  )
    .then((res) => res.json())
    .then((json) => {
      const contacts_with_companies = json.results.map(
        (result: HS_SearchResult) => result.properties
      )
      // console.log(contacts_with_companies)
      return contacts_with_companies
    })
    .then(async (contacts_with_companies) => {
      const companyNames = contacts_with_companies.map(
        (contact: any) => contact.company
      )
      console.log(
        `Found ${companyNames.length} contacts with companies:`,
        companyNames
      )
      const searchedCompanies = await fetch(
        `${HS_base_url}crm/v3/objects/companies/search`,
        {
          method: 'POST',
          headers: HS_Headers,
          body: JSON.stringify({
            filterGroups: [
              {
                propertyName: 'name',
                operator: 'IN',
                values: companyNames,
              },
            ],
          }),
        }
      )
        .then((res) => res.json())
        .then((json) => {
          const results = json.results.map(
            (result: HS_SearchResult) => result.properties.name
          )
          console.log(`Search Results:`, results)
          return results
        })

      return Array.from(
        new Set(contacts_with_companies.map((cwc: any) => cwc.company))
      )
        .map(
          (company) =>
            contacts_with_companies.filter(
              (cwc: any) => cwc.company === company
            )[0]
        )
        .filter((cwc: any) => !searchedCompanies.includes(cwc.company))
        .map((cwc: any) => {
          return {
            about_us: faker.company.bs(),
            founded_year: faker.date.past().getFullYear(),
            is_public: Math.random() < 0.5,
            name: cwc.company,
            phone: faker.phone.number(),
            address: faker.address.streetAddress(),
            city: cwc.city,
            state: cwc.state,
            zip: cwc.zip,
            country: cwc.country,
            website: faker.internet.url(),
            industry: cwc.industry,
            description: faker.lorem.paragraph(),
          } as Company
        })
    })

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
      Math.random() < Number(createUninstantiatedChance)
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
    `Creating ${uninstantiated_companies.length} pre-referenced companies and ${random_companies.length} RANDOM companies`
  )
  const companies: Company[] = [
    ...uninstantiated_companies,
    ...random_companies,
  ]

  if (req.method === 'GET') {
    return res.status(200).json({
      message: `Success`,
      data: {
        companies: {
          uninstantiated_companies: uninstantiated_companies,
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

    return res.status(200).json({ message: `Success`, data: postedCompanies })
  }
}
