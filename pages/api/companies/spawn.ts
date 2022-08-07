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

export function createRandomCompany(): Company {
  return {
    about_us: faker.company.bs(),
    founded_year: faker.date.past().getFullYear(),
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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const COMPANIES: Company[] = []
  Array.from({ length: 10 }).forEach(() => {
    COMPANIES.push(createRandomCompany())
  })

  if (req.method === 'GET') {
    return res
      .status(200)
      .json({ message: `Success`, data: { COMPANIES: COMPANIES } })
  }

  if (req.method === 'POST') {
    const postedCompanies = await fetch(
      `${HS_base_url}crm/v3/objects/companies/batch/create`,
      {
        headers: HS_Headers,
        method: 'POST',
        body: JSON.stringify({
          inputs: COMPANIES.map((company) => {
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

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
