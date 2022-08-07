import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'

export type HS_Contact = {}

export type Contact = {
  firstname: string
  lastname: string
  date_of_birth: Date
  salutation: string
  twitterhandle: string
  email: string
  mobilephone: string
  phone: string
  fax: string
  avatar: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  jobtitle: string
  company: string
  website: string
  industry: string
}

export function createRandomContact(): Contact {
  return {
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    date_of_birth: faker.date.birthdate(),
    salutation: faker.name.prefix(),
    twitterhandle: faker.internet.userName(),
    email: faker.internet.email(),
    mobilephone: faker.phone.number(),
    phone: faker.phone.number(),
    fax: faker.phone.number(),
    avatar: faker.image.avatar(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    zip: faker.address.zipCode(),
    country: faker.address.country(),
    jobtitle: faker.name.jobTitle(),
    company: faker.company.companyName(),
    website: faker.internet.url(),
    industry: faker.name.jobArea(),
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const CONTACTS: Contact[] = []
  Array.from({ length: 10 }).forEach(() => {
    CONTACTS.push(createRandomContact())
  })

  if (req.method === 'GET') {
    return res
      .status(200)
      .json({ message: `Success`, data: { CONTACTS: CONTACTS } })
  }

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
