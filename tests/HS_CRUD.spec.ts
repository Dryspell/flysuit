import { HS_Contact } from '@/lib/hubspot'
import { chromium, test, expect } from '@playwright/test'
import { browser } from 'process'

test('Spawn Contacts', async ({ request }) => {
  const response = await request.get(`/api/hubspot/contacts/spawn`)
  expect(response.status()).toBe(200)

  const body: { message: string; data: any } = await response.json()
  expect(body.message).toBe('Success') //@ts-ignore
  expect(body.data.length).toBe(10)
})

test('Contacts CRUD Flow', async ({ page }) => {
  // async () => {
  //   const browser = await chromium.launch({
  //     logger: {
  //       isEnabled: (name, severity) => name === 'browser',
  //       log: (name, severity, message, args) => console.log(`${name} ${message}`),
  //     },
  //   })
  //   const context = await browser.newContext()
  //   const page = await context.newPage()

  let search = await page.request.post(
    `/api/hubspot/contacts/search?limit=10`,
    {
      data: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'HAS_PROPERTY',
              },
            ],
          },
        ],
        properties: ['email', 'firstname', 'lastname'],
      },
    }
  )
  expect(search.status()).toBe(200)

  let body: { message: string; data: any } = await search.json()
  expect(body.message).toBe('Success')
  expect(body.data.total).toBeDefined()
  expect(body.data.total).not.toBe(0)

  const contacts: { id: number | string; properties: HS_Contact }[] =
    body.data.results
  const contact = contacts[0]
  expect(contact.properties.email).toBeDefined()
  expect(contact.properties.firstname).toBeDefined()
  expect(contact.properties.lastname).toBeDefined()

  let contact_search = await page.request.post(
    `/api/hubspot/contacts/search?limit=10`,
    {
      data: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'IN',
                values: [contact.properties.email],
              },
            ],
          },
        ],
        properties: ['email', 'firstname', 'lastname'],
      },
    }
  )

  expect(contact_search.status()).toBe(200)
  body = await contact_search.json()
  expect(body.message).toBe('Success')
  expect(body.data.results.length).toBe(1)

  expect(body.data.results[0].properties.email).toBe(contact.properties.email)

  let contactUpdate = await page.request.post(
    `/api/hubspot/contacts/batch/upsert?update=true`,
    {
      data: {
        inputs: [
          {
            id: contact.id,
            properties: {
              email: 'TEST@EMAIL.com',
              firstname: 'TEST FIRSTNAME',
              lastname: 'TEST LASTNAME',
            },
          },
        ],
      },
    }
  )
  expect(contactUpdate.status()).toBe(200)
  body = await contactUpdate.json()
  expect(body.message).toBe('Success')
  expect(body.data.results.length).toBe(1)

  let contactArchive = await page.request.post(
    `/api/hubspot/contacts/batch/archive`,
    {
      data: {
        inputs: [
          {
            id: contact.id,
          },
        ],
      },
    }
  )
  expect(contactArchive.status()).toBe(204)
  body = await contactArchive.json()
  expect(body.message).toBe('Success')
})

// test('Update Contacts', async ({ page }) => {
//   const response = await page.request.post(
//     `/api/hubspot/contacts/update?bearer_token=${process.env.HS_PRIVATE_APP_KEY}`,
//     {}
//   )
// })

// test('Delete Contacts', async ({ page }) => {
//   const response = await page.request.post(
//     `/api/hubspot/contacts/delete?bearer_token=${process.env.HS_PRIVATE_APP_KEY}`,
//     {}
//   )
// })
