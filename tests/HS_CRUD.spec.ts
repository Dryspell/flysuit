import { test, expect } from '@playwright/test'

test('Spawn Contacts', async ({ page }) => {
  const response = await page.request.get(`/api/hubspot/contacts/spawn`)
  expect(response.status()).toBe(200)

  const body: { message: string; data: any } = await response.json()
  expect(body.message).toBe('Success') //@ts-ignore
  expect(body.data.length).toBe(10)
})

test('Contacts CRUD Flow', async ({ page }) => {
  let search = await page.request.post(
    `/api/hubspot/contacts/search?bearer_token=${process.env.HS_PRIVATE_APP_KEY}&limit=10`,
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
  expect(body.data.length).not.toBe(0)

  const contact = body.data[0]
  expect(contact.properties.email).toBeDefined()
  expect(contact.properties.firstname).toBeDefined()
  expect(contact.properties.lastname).toBeDefined()

  let contact_search = await page.request.post(
    `/api/hubspot/contacts/search?bearer_token=${process.env.HS_PRIVATE_APP_KEY}&limit=10`,
    {
      data: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'IN',
                values: [contact.email],
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
  expect(body.data.length).toBe(1)

  expect(body.data[0].properties.email).toBe(contact.email)

  let contactUpdate = await page.request.post(
    `/api/hubspot/contacts/update?bearer_token=${process.env.HS_PRIVATE_APP_KEY}`,
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
  expect(body.data.length).toBe(1)

  let contactArchive = await page.request.post(
    `/api/hubspot/contacts/archive?bearer_token=${process.env.HS_PRIVATE_APP_KEY}`,
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
