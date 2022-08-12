import { faker } from '@faker-js/faker'

export const HS_Headers = (BearerToken?: string) => {
  return {
    Authorization: `Bearer ${BearerToken || process.env.HS_PRIVATE_APP_KEY}`,
    'Content-Type': 'application/json',
  }
}
export const HS_base_url = `https://api.hubapi.com/`

export type HS_SearchResult = {
  id: number
  properties: any
  createdAt: Date
  updatedAt: Date
  archived: boolean
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

export function createRandomContact(): HS_Contact {
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

export function createRandomCompany(): HS_Company {
  let company: HS_Company = {
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

export type HS_Deal = {
  dealname: string
  closedate: Date
  description: string
}

export function createRandomDeal(): HS_Deal {
  const verb = faker.word.verb()

  return {
    dealname: `${faker.company.companyName()} | ${verb}`,
    closedate: faker.date.past(),
    description: faker.fake(
      `{{word.adjective}} {{word.noun}} ${verb} {{word.adjective}} {{word.noun}}`
    ),
  }
}

export async function searchHubspot(
  ObjectTypeId: string,
  body: any,
  limit?: number | string
) {
  !body.limit && (body.limit = parseInt(limit as string) || 100)
  return await fetch(`${HS_base_url}crm/v3/objects/${ObjectTypeId}/search`, {
    method: 'POST',
    headers: HS_Headers(),
    body: JSON.stringify(body),
  }).then((res) => res.json())
}

export async function postHubspot(entityPlural: string, records: any[]) {
  return await fetch(
    `${HS_base_url}crm/v3/objects/${entityPlural}/batch/create`,
    {
      headers: HS_Headers(),
      method: 'POST',
      body: JSON.stringify({
        inputs: records.map((record) => {
          return { properties: record }
        }),
      }),
    }
  )
    .then((res: any) => res.json())
    .then((res) => {
      return res.results
    })
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
export async function postAssociations(
  fromEntity: string,
  toEntity: string,
  associationInputs: AssociationInput[]
) {
  return fetch(
    `${HS_base_url}crm/v4/associations/${fromEntity}/${toEntity}/batch/create`,
    {
      headers: HS_Headers(),
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
        values: companyNames,
      },
    })
  const body = {
    filterGroups,
    properties: getDefaultSearchProperties(ObjectTypeId),
    limit: 100,
  }
  return await searchHubspot(ObjectTypeId, body).then((json) => {
    const entities_with_properties: HS_SearchResult[] = json.results
    return entities_with_properties
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
