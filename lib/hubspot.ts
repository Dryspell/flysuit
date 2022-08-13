import { faker } from '@faker-js/faker'
import { splitIntoChunks } from './set-utils'

export const HS_Headers = (BearerToken?: string) => {
  return {
    Authorization: `Bearer ${BearerToken || process.env.HS_PRIVATE_APP_KEY}`,
    'Content-Type': 'application/json',
  }
}
export const HS_base_url = `https://api.hubapi.com/`

export type HS_Record = {
  id: string
  properties: any
  createdAt?: Date
  updatedAt?: Date
  archived?: boolean
}

export type HS_Contact = {
  firstname: string
  lastname: string
  date_of_birth: Date
  salutation: string
  twitterhandle: string
  email: string
  mobilephone: string
  phone: string
  fax: string
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

export function createRandomContact(baseProps?: HS_Contact): HS_Contact {
  return {
    ...{
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      date_of_birth: faker.date.birthdate(),
      salutation: faker.name.prefix(),
      twitterhandle: faker.internet.userName(),
      email: faker.internet.email(),
      mobilephone: faker.phone.number(),
      phone: faker.phone.number(),
      fax: faker.phone.number(),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
      country: faker.address.country(),
      jobtitle: faker.name.jobTitle(),
      company: faker.company.companyName(),
      website: faker.internet.url(),
      industry: faker.name.jobArea(),
    },
    ...baseProps,
  }
}

export type HS_Company = {
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

export function createRandomCompany(baseProps?: HS_Company): HS_Company {
  let company: HS_Company = {
    ...{
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
    },
    ...baseProps,
  }

  return company
}

export type HS_Deal = {
  dealname: string
  closedate: Date
  description: string
}

export function createRandomDeal(baseProps?: HS_Deal): HS_Deal {
  const verb = faker.word.verb()

  return {
    ...{
      dealname: `${faker.company.companyName()} | ${verb}`,
      closedate: faker.date.past(),
      description: faker.fake(
        `{{word.adjective}} {{word.noun}} ${verb} {{word.adjective}} {{word.noun}}`
      ),
    },
    ...baseProps,
  }
}

export function createRandom(
  entityPlural: string,
  count: number,
  baseRecords?: any[]
) {
  const contacts: HS_Contact[] = []
  const companies: HS_Company[] = []
  const deals: HS_Deal[] = []

  switch (entityPlural) {
    case 'contacts':
      Array.from({ length: count }).forEach(() => {
        contacts.push(createRandomContact(baseRecords?.pop()))
      })
      break

    case 'deals':
      Array.from({ length: count }).forEach(() => {
        deals.push(createRandomDeal(baseRecords?.pop()))
      })
      break
    case 'companies':
      Array.from({ length: count }).forEach(() => {
        companies.push(createRandomCompany(baseRecords?.pop()))
      })
      break

    default:
      throw new Error(`Unknown entity: ${entityPlural}`)
      break
  }

  return {
    message: `Success`,
    data: [contacts, companies, deals].filter((ent) => ent.length)[0],
  }
}

export async function searchHubspot(
  ObjectTypeId: string,
  body: any,
  limit?: number | string,
  BearerToken?: string
) {
  typeof body === 'string' ? (body = JSON.parse(body)) : body
  !body.limit && (body.limit = parseInt(limit as string) || 100)
  return await fetch(`${HS_base_url}crm/v3/objects/${ObjectTypeId}/search`, {
    method: 'POST',
    headers: HS_Headers(BearerToken),
    body: JSON.stringify(body),
  }).then((res) => res.json())
}

export async function postHubspot(
  entityPlural: string,
  records: { id: number; properties: any }[] | any[],
  BearerToken?: string
) {
  const recordBatches: HS_Record[][] = splitIntoChunks(
    records,
    entityPlural === 'contacts' ? 10 : 100
  )

  //@ts-ignore
  const results: Awaited<
    {
      status: string
      value: HS_Record[]
    }[]
  > = await Promise.allSettled(
    recordBatches.map((batch) =>
      fetch(`${HS_base_url}crm/v3/objects/${entityPlural}/batch/create`, {
        headers: HS_Headers(BearerToken),
        method: 'POST',
        body: JSON.stringify({
          inputs: batch.map((record: HS_Record) => {
            return {
              properties: record.properties ? record.properties : record,
            }
          }),
        }),
      })
        .then((res: any) => res.json())
        .then((res) => {
          return res.results
        })
    )
  )
  return {
    records:
      results
        .filter((batch) => batch.status === 'fulfilled')
        .map((batch) => batch.value)
        .flat() || [],
    errors: results.filter((batch) => batch.status === 'rejected'),
  }
}

export type AssociationDefinition = {
  category: 'HUBSPOT_DEFINED' | 'USER_DEFINED'
  typeId: number | string
  label: string
}

export async function getAssociationDefintions(
  fromEntity: string,
  toEntity: string
) {
  return await fetch(
    `${HS_base_url}crm/v4/associations/${fromEntity}/${toEntity}/labels`,
    {
      headers: HS_Headers(),
      method: 'GET',
    }
  )
    .then((res: any) => res.json())
    .then((res) => {
      console.log(
        `Received ${res.results.length} Association definitions`,
        res.results
      )
      return res.results as AssociationDefinition[]
    })
}

export type AssociationInput = {
  from: { id: string }
  to: { id: string }
  types: {
    associationCategory: string
    associationTypeId: number | string
  }[]
}

import type { NextApiRequest, NextApiResponse } from 'next'

export async function makeAssociationInputsFromRecords(
  fromEntityPlural: string,
  toEntityPlural: string,
  fromRecords: HS_Record[],
  toRecords: HS_Record[],
  associationRelation: { from: string; to: string },
  associationTypeId?: number,
  associationDefinitions?: AssociationDefinition[]
) {
  associationDefinitions =
    associationDefinitions ||
    (await getAssociationDefintions(toEntityPlural, fromEntityPlural))

  const associationCategory = associationDefinitions[0].category
  associationTypeId = associationTypeId
    ? associationTypeId
    : (associationDefinitions[0].typeId as number)

  const associationInputs: AssociationInput[] = []
  fromRecords.forEach((fromRecord) => {
    toRecords
      .filter(
        (toRecord) =>
          fromRecord.properties[associationRelation.from] ===
          toRecord.properties[associationRelation.to]
      )
      .forEach((toRecord) => {
        associationInputs.push({
          from: { id: fromRecord.id },
          to: { id: toRecord.id }, //@ts-ignore
          types: [{ associationCategory, associationTypeId }],
        })
      })
  })

  console.log(
    `Made ${associationInputs.length} Associations of ${fromEntityPlural} to ${toEntityPlural} across ${getAssociationDefintions.length} Association definitions, sample:`,
    associationInputs[0]
  )

  return associationInputs
}

export async function postAssociations(
  fromEntity: string,
  toEntity: string,
  associationInputs: AssociationInput[],
  BearerToken?: string
) {
  return fetch(
    `${HS_base_url}crm/v4/associations/${fromEntity}/${toEntity}/batch/create`,
    {
      headers: HS_Headers(BearerToken),
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
}

export async function searchForEntitiesWithProperty(
  ObjectTypeId: string,
  property: string,
  propertyList?: string[]
) {
  const filterGroups = [
    {
      filters: {
        propertyName: property,
        operator: 'HAS_PROPERTY',
      },
    },
  ]
  propertyList?.length &&
    filterGroups.push({
      filters: {
        propertyName: property,
        operator: 'IN', //@ts-ignore
        values: propertyList,
      },
    })
  const body = {
    filterGroups,
    properties: getDefaultSearchProperties(ObjectTypeId),
    limit: 100,
  }
  return await searchHubspot(ObjectTypeId, body).then((json) => {
    const entities_with_properties: HS_Record[] = json.results
    return Array.from(new Set(entities_with_properties))
  })
}

export function getDefaultSearchProperties(ObjectTypeId: string) {
  switch (ObjectTypeId) {
    case 'contacts':
      return [
        'hs_object_id',
        'email',
        'company',
        'city',
        'state',
        'zip',
        'country',
        'industry',
      ]
    case 'companies':
      return [
        'name',
        'about_us',
        'founded_year',
        'is_public',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'website',
        'industry',
        'description',
      ]
    case 'deals':
      return ['dealname', 'closedate', 'description']
    default:
      return []
  }
}
